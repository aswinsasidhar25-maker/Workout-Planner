import { createContext, useContext, useReducer, useEffect } from 'react'
import { exercises, goals, defaultSplits, durationOptions } from '../data/exercises'

const AppContext = createContext()

const getInitialState = () => {
  const saved = localStorage.getItem('fitforge-state')
  if (saved) {
    try {
      const state = JSON.parse(saved)
      // Migrate old single-goal format to multi-goal
      if (state.profile && state.profile.goal && !state.profile.goals) {
        state.profile.goals = [state.profile.goal]
        delete state.profile.goal
      }
      if (state.profile && !state.profile.duration) {
        state.profile.duration = 60
      }
      return state
    } catch {
      // fall through
    }
  }
  return {
    profile: null,
    workoutPlan: {},
    workoutLog: {},
  }
}

function generateWorkoutPlan(profile) {
  const { goals: selectedGoals, fitnessLevel, gender, duration } = profile
  if (!selectedGoals || selectedGoals.length === 0) return {}

  const durationConfig = durationOptions.find(d => d.id === duration) || durationOptions[2]
  const maxExercises = durationConfig.exercisesPerSession

  // Get goal configs for selected goals
  const goalConfigs = goals.filter(g => selectedGoals.includes(g.id))

  // Blend training parameters by averaging across selected goals
  const avgSets = Math.round(goalConfigs.reduce((s, g) => s + (g.setsRange[0] + g.setsRange[1]) / 2, 0) / goalConfigs.length)
  const avgRepsLow = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[0], 0) / goalConfigs.length)
  const avgRepsHigh = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[1], 0) / goalConfigs.length)
  const avgRest = Math.round(goalConfigs.reduce((s, g) => s + g.restSeconds, 0) / goalConfigs.length)

  // Merge muscle groups from all selected goals' splits
  const mergedDays = {}
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  dayNames.forEach(day => {
    const allMuscles = new Set()
    const dayLabels = []

    selectedGoals.forEach(goalId => {
      const split = defaultSplits[goalId]
      if (!split) return
      const dayInfo = split.days[day]
      if (dayInfo.muscles.length > 0) {
        dayInfo.muscles.forEach(m => allMuscles.add(m))
        dayLabels.push(dayInfo.name)
      }
    })

    if (allMuscles.size === 0) {
      mergedDays[day] = { name: 'Rest Day', muscles: [] }
    } else {
      // Create a combined name from unique labels
      const uniqueLabels = [...new Set(dayLabels)]
      const name = uniqueLabels.length === 1 ? uniqueLabels[0] : uniqueLabels.slice(0, 2).join(' + ')
      mergedDays[day] = { name, muscles: [...allMuscles] }
    }
  })

  const plan = {}

  Object.entries(mergedDays).forEach(([day, dayInfo]) => {
    if (dayInfo.muscles.length === 0) {
      plan[day] = { name: dayInfo.name, exercises: [], isRest: true }
      return
    }

    const dayExercises = []
    const usedIds = new Set()

    // Distribute exercises across muscle groups, capped by duration
    const muscleList = dayInfo.muscles
    const exercisesPerMuscle = Math.max(1, Math.floor(maxExercises / muscleList.length))
    let remaining = maxExercises

    muscleList.forEach(muscleId => {
      if (remaining <= 0) return
      const count = Math.min(exercisesPerMuscle, remaining)

      const available = exercises.filter(ex => {
        if (ex.muscle !== muscleId) return false
        if (usedIds.has(ex.id)) return false
        if (ex.gender !== 'both' && ex.gender !== gender) return false
        if (fitnessLevel === 'beginner' && ex.difficulty === 'advanced') return false
        return true
      })

      // Prioritize exercises that match more of the user's goals
      available.sort((a, b) => {
        const aMatch = a.goals.filter(g => selectedGoals.includes(g)).length
        const bMatch = b.goals.filter(g => selectedGoals.includes(g)).length
        if (bMatch !== aMatch) return bMatch - aMatch
        return Math.random() - 0.5
      })

      const selected = available.slice(0, count)
      selected.forEach(ex => {
        usedIds.add(ex.id)
        const sets = fitnessLevel === 'beginner' ? Math.max(2, avgSets - 1) : avgSets
        const reps = avgRepsLow + Math.floor(Math.random() * (avgRepsHigh - avgRepsLow + 1))
        dayExercises.push({
          exerciseId: ex.id,
          sets,
          reps,
          weight: 0,
          rest: avgRest,
          completed: Array(sets).fill(false),
        })
        remaining--
      })
    })

    plan[day] = { name: dayInfo.name, exercises: dayExercises, isRest: false }
  })

  return plan
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE': {
      const profile = action.payload
      const workoutPlan = generateWorkoutPlan(profile)
      return { ...state, profile, workoutPlan }
    }
    case 'REGENERATE_PLAN': {
      if (!state.profile) return state
      const workoutPlan = generateWorkoutPlan(state.profile)
      return { ...state, workoutPlan }
    }
    case 'UPDATE_EXERCISE_IN_PLAN': {
      const { day, exerciseIndex, updates } = action.payload
      const dayPlan = { ...state.workoutPlan[day] }
      const exercisesList = [...dayPlan.exercises]
      exercisesList[exerciseIndex] = { ...exercisesList[exerciseIndex], ...updates }
      dayPlan.exercises = exercisesList
      return { ...state, workoutPlan: { ...state.workoutPlan, [day]: dayPlan } }
    }
    case 'TOGGLE_SET_COMPLETE': {
      const { day, exerciseIndex, setIndex } = action.payload
      const dp = { ...state.workoutPlan[day] }
      const exList = [...dp.exercises]
      const ex = { ...exList[exerciseIndex] }
      const completed = [...ex.completed]
      completed[setIndex] = !completed[setIndex]
      ex.completed = completed
      exList[exerciseIndex] = ex
      dp.exercises = exList
      return { ...state, workoutPlan: { ...state.workoutPlan, [day]: dp } }
    }
    case 'LOG_WORKOUT': {
      const { date, day, exercises: logExercises } = action.payload
      const log = { ...state.workoutLog }
      if (!log[date]) log[date] = []
      log[date].push({
        day,
        exercises: logExercises,
        timestamp: Date.now(),
      })
      return { ...state, workoutLog: log }
    }
    case 'REPLACE_EXERCISE': {
      const { day, exerciseIndex, newExerciseId } = action.payload
      const dayPlanCopy = { ...state.workoutPlan[day] }
      const exListCopy = [...dayPlanCopy.exercises]
      const goalConfigs = goals.filter(g => state.profile.goals.includes(g.id))
      const avgSets = Math.round(goalConfigs.reduce((s, g) => s + (g.setsRange[0] + g.setsRange[1]) / 2, 0) / goalConfigs.length)
      const avgRepsLow = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[0], 0) / goalConfigs.length)
      const avgRepsHigh = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[1], 0) / goalConfigs.length)
      const avgRest = Math.round(goalConfigs.reduce((s, g) => s + g.restSeconds, 0) / goalConfigs.length)
      const sets = state.profile.fitnessLevel === 'beginner' ? Math.max(2, avgSets - 1) : avgSets
      const reps = avgRepsLow + Math.floor(Math.random() * (avgRepsHigh - avgRepsLow + 1))
      exListCopy[exerciseIndex] = {
        exerciseId: newExerciseId,
        sets,
        reps,
        weight: 0,
        rest: avgRest,
        completed: Array(sets).fill(false),
      }
      dayPlanCopy.exercises = exListCopy
      return { ...state, workoutPlan: { ...state.workoutPlan, [day]: dayPlanCopy } }
    }
    case 'ADD_EXERCISE_TO_DAY': {
      const { day, exerciseId } = action.payload
      const goalConfigs = goals.filter(g => state.profile.goals.includes(g.id))
      const avgSets = Math.round(goalConfigs.reduce((s, g) => s + (g.setsRange[0] + g.setsRange[1]) / 2, 0) / goalConfigs.length)
      const avgRepsLow = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[0], 0) / goalConfigs.length)
      const avgRest = Math.round(goalConfigs.reduce((s, g) => s + g.restSeconds, 0) / goalConfigs.length)
      const dayPlanAdd = { ...state.workoutPlan[day] }
      dayPlanAdd.exercises = [...dayPlanAdd.exercises, {
        exerciseId,
        sets: state.profile.fitnessLevel === 'beginner' ? Math.max(2, avgSets - 1) : avgSets,
        reps: avgRepsLow,
        weight: 0,
        rest: avgRest,
        completed: Array(state.profile.fitnessLevel === 'beginner' ? Math.max(2, avgSets - 1) : avgSets).fill(false),
      }]
      dayPlanAdd.isRest = false
      return { ...state, workoutPlan: { ...state.workoutPlan, [day]: dayPlanAdd } }
    }
    case 'REMOVE_EXERCISE_FROM_DAY': {
      const { day, exerciseIndex: removeIdx } = action.payload
      const dayPlanRm = { ...state.workoutPlan[day] }
      dayPlanRm.exercises = dayPlanRm.exercises.filter((_, i) => i !== removeIdx)
      return { ...state, workoutPlan: { ...state.workoutPlan, [day]: dayPlanRm } }
    }
    case 'RESET_PROFILE':
      return { ...state, profile: null, workoutPlan: {} }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState)

  useEffect(() => {
    localStorage.setItem('fitforge-state', JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
