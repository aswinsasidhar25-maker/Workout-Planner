import { createContext, useContext, useReducer, useEffect } from 'react'
import { exercises, goals, defaultSplits } from '../data/exercises'

const AppContext = createContext()

const getInitialState = () => {
  const saved = localStorage.getItem('fitforge-state')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // fall through
    }
  }
  return {
    profile: null,
    workoutPlan: {},
    workoutLog: {},
    customExercises: [],
  }
}

function generateWorkoutPlan(profile) {
  const { goal, fitnessLevel, gender } = profile
  const split = defaultSplits[goal]
  if (!split) return {}

  const goalConfig = goals.find(g => g.id === goal)
  const plan = {}

  Object.entries(split.days).forEach(([day, dayInfo]) => {
    if (dayInfo.muscles.length === 0) {
      plan[day] = { name: dayInfo.name, exercises: [], isRest: true }
      return
    }

    const dayExercises = []
    dayInfo.muscles.forEach(muscleId => {
      const available = exercises.filter(ex => {
        if (ex.muscle !== muscleId) return false
        if (ex.gender !== 'both' && ex.gender !== gender) return false
        if (fitnessLevel === 'beginner' && ex.difficulty === 'advanced') return false
        return true
      })

      const count = muscleId === 'cardio' ? 1 : fitnessLevel === 'beginner' ? 2 : 3
      const selected = available.sort(() => Math.random() - 0.5).slice(0, count)

      selected.forEach(ex => {
        const sets = goalConfig.setsRange[fitnessLevel === 'beginner' ? 0 : 1]
        const reps = goalConfig.repsRange[0] + Math.floor(Math.random() * (goalConfig.repsRange[1] - goalConfig.repsRange[0]))
        dayExercises.push({
          exerciseId: ex.id,
          sets,
          reps,
          weight: 0,
          rest: goalConfig.restSeconds,
          completed: Array(sets).fill(false),
        })
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
      const goalConfig = goals.find(g => g.id === state.profile.goal)
      const dayPlanCopy = { ...state.workoutPlan[day] }
      const exListCopy = [...dayPlanCopy.exercises]
      const sets = goalConfig.setsRange[state.profile.fitnessLevel === 'beginner' ? 0 : 1]
      const reps = goalConfig.repsRange[0] + Math.floor(Math.random() * (goalConfig.repsRange[1] - goalConfig.repsRange[0]))
      exListCopy[exerciseIndex] = {
        exerciseId: newExerciseId,
        sets,
        reps,
        weight: 0,
        rest: goalConfig.restSeconds,
        completed: Array(sets).fill(false),
      }
      dayPlanCopy.exercises = exListCopy
      return { ...state, workoutPlan: { ...state.workoutPlan, [day]: dayPlanCopy } }
    }
    case 'ADD_EXERCISE_TO_DAY': {
      const { day, exerciseId } = action.payload
      const goalCfg = goals.find(g => g.id === state.profile.goal)
      const dayPlanAdd = { ...state.workoutPlan[day] }
      const sets = goalCfg.setsRange[0]
      const reps = goalCfg.repsRange[0]
      dayPlanAdd.exercises = [...dayPlanAdd.exercises, {
        exerciseId,
        sets,
        reps,
        weight: 0,
        rest: goalCfg.restSeconds,
        completed: Array(sets).fill(false),
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
