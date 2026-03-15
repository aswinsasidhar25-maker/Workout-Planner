import { createContext, useContext, useReducer, useEffect } from 'react'
import { exercises, goals, splitTemplates, durationOptions, badgeDefinitions, weekDays } from '../data/exercises'

const AppContext = createContext()

function calculateStreak(workoutLog) {
  if (!workoutLog || Object.keys(workoutLog).length === 0) {
    return { current: 0, longest: 0 }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dates = Object.keys(workoutLog).sort().reverse()
  if (dates.length === 0) return { current: 0, longest: 0 }

  const mostRecent = new Date(dates[0] + 'T00:00:00')
  const diffDays = Math.floor((today - mostRecent) / (86400000))

  if (diffDays > 1) return { current: 0, longest: 0 }

  let current = 0
  const checkDate = new Date(today)
  if (diffDays === 1) checkDate.setDate(checkDate.getDate() - 1)

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (workoutLog[dateStr]) {
      current++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return { current, longest: current }
}

function checkBadges(state) {
  const unlocked = state.unlockedBadges || []
  const newlyUnlocked = []

  for (const badge of badgeDefinitions) {
    if (!unlocked.includes(badge.id) && badge.check(state)) {
      newlyUnlocked.push(badge.id)
    }
  }

  return newlyUnlocked
}

const getInitialState = () => {
  let saved = localStorage.getItem('zenfit-state')
  if (!saved) {
    saved = localStorage.getItem('fitforge-state')
    if (saved) {
      localStorage.setItem('zenfit-state', saved)
      localStorage.removeItem('fitforge-state')
    }
  }
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Migrate old profile formats
      if (parsed.profile) {
        if (parsed.profile.goal && !parsed.profile.goals) {
          parsed.profile.goals = [parsed.profile.goal]
          delete parsed.profile.goal
        }
        if (!Array.isArray(parsed.profile.goals)) {
          parsed.profile.goals = []
        }
        if (!parsed.profile.duration) {
          parsed.profile.duration = 60
        }
        if (!Array.isArray(parsed.profile.workoutDays)) {
          parsed.profile.workoutDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      }
      parsed.streak = calculateStreak(parsed.workoutLog || {})
      if (!parsed.unlockedBadges) parsed.unlockedBadges = []
      if (!parsed.newBadge) parsed.newBadge = null
      const newBadges = checkBadges(parsed)
      parsed.unlockedBadges = [...parsed.unlockedBadges, ...newBadges]
      return parsed
    } catch {
      // fall through
    }
  }
  return {
    profile: null,
    workoutPlan: {},
    workoutLog: {},
    customExercises: [],
    streak: { current: 0, longest: 0 },
    unlockedBadges: [],
    newBadge: null,
  }
}

function generateWorkoutPlan(profile) {
  const { goals: selectedGoals, fitnessLevel, gender, duration, workoutDays: userDays } = profile
  if (!selectedGoals || selectedGoals.length === 0) return {}

  const workoutDays = Array.isArray(userDays) && userDays.length >= 2
    ? userDays
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const durationConfig = durationOptions.find(d => d.id === duration) || durationOptions[2]
  const maxExercises = durationConfig.exercisesPerSession

  // Get goal configs for blending training parameters
  const goalConfigs = goals.filter(g => selectedGoals.includes(g.id))
  const avgSets = Math.round(goalConfigs.reduce((s, g) => s + (g.setsRange[0] + g.setsRange[1]) / 2, 0) / goalConfigs.length)
  const avgRepsLow = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[0], 0) / goalConfigs.length)
  const avgRepsHigh = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[1], 0) / goalConfigs.length)
  const avgRest = Math.round(goalConfigs.reduce((s, g) => s + g.restSeconds, 0) / goalConfigs.length)

  // Select the right split template based on number of workout days
  const numDays = workoutDays.length
  const templateKey = numDays <= 3 ? 3 : numDays <= 4 ? 4 : numDays <= 5 ? 5 : 6
  const template = splitTemplates[templateKey]

  // If user has cardio/endurance goals, inject cardio into some days
  const hasCardioGoal = selectedGoals.includes('lose_weight') || selectedGoals.includes('endurance')

  const plan = {}

  weekDays.forEach(day => {
    const dayIndex = workoutDays.indexOf(day)

    if (dayIndex === -1) {
      // Rest day — user didn't select this day
      plan[day] = { name: 'Rest Day', exercises: [], isRest: true }
      return
    }

    // Map to the split template slot (cycle if more workout days than slots)
    const slotIndex = dayIndex % template.slots.length
    const slot = template.slots[slotIndex]
    let muscles = [...slot.muscles]

    // Inject cardio for weight loss / endurance goals on some days
    if (hasCardioGoal && dayIndex % 2 === 0 && !muscles.includes('cardio')) {
      muscles.push('cardio')
    }

    const dayExercises = []
    const usedIds = new Set()

    const exercisesPerMuscle = Math.max(1, Math.floor(maxExercises / muscles.length))
    let remaining = maxExercises

    muscles.forEach(muscleId => {
      if (remaining <= 0) return
      const count = Math.min(exercisesPerMuscle, remaining)

      const available = exercises.filter(ex => {
        if (ex.muscle !== muscleId) return false
        if (usedIds.has(ex.id)) return false
        if (ex.gender !== 'both' && ex.gender !== gender) return false
        if (fitnessLevel === 'beginner' && ex.difficulty === 'advanced') return false
        return true
      })

      // Sort: compound first (more secondary muscles = more compound), then by goal match
      available.sort((a, b) => {
        const aCompound = a.secondary.length >= 2 ? 1 : 0
        const bCompound = b.secondary.length >= 2 ? 1 : 0
        if (bCompound !== aCompound) return bCompound - aCompound
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

    plan[day] = { name: slot.name, exercises: dayExercises, isRest: false }
  })

  return plan
}

function getGoalParams(state) {
  const goalConfigs = goals.filter(g => (state.profile.goals || []).includes(g.id))
  if (goalConfigs.length === 0) return { sets: 3, repsLow: 8, repsHigh: 12, rest: 60 }
  const avgSets = Math.round(goalConfigs.reduce((s, g) => s + (g.setsRange[0] + g.setsRange[1]) / 2, 0) / goalConfigs.length)
  const avgRepsLow = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[0], 0) / goalConfigs.length)
  const avgRepsHigh = Math.round(goalConfigs.reduce((s, g) => s + g.repsRange[1], 0) / goalConfigs.length)
  const avgRest = Math.round(goalConfigs.reduce((s, g) => s + g.restSeconds, 0) / goalConfigs.length)
  return { sets: avgSets, repsLow: avgRepsLow, repsHigh: avgRepsHigh, rest: avgRest }
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
      const streak = calculateStreak(log)
      const oldLongest = state.streak?.longest || 0
      streak.longest = Math.max(streak.current, oldLongest)
      const newState = { ...state, workoutLog: log, streak }
      const newBadges = checkBadges(newState)
      if (newBadges.length > 0) {
        newState.unlockedBadges = [...(state.unlockedBadges || []), ...newBadges]
        newState.newBadge = newBadges[0]
      }
      return newState
    }
    case 'DISMISS_BADGE': {
      return { ...state, newBadge: null }
    }
    case 'REPLACE_EXERCISE': {
      const { day, exerciseIndex, newExerciseId } = action.payload
      const dayPlanCopy = { ...state.workoutPlan[day] }
      const exListCopy = [...dayPlanCopy.exercises]
      const p = getGoalParams(state)
      const sets = state.profile.fitnessLevel === 'beginner' ? Math.max(2, p.sets - 1) : p.sets
      const reps = p.repsLow + Math.floor(Math.random() * (p.repsHigh - p.repsLow + 1))
      exListCopy[exerciseIndex] = {
        exerciseId: newExerciseId,
        sets,
        reps,
        weight: 0,
        rest: p.rest,
        completed: Array(sets).fill(false),
      }
      dayPlanCopy.exercises = exListCopy
      return { ...state, workoutPlan: { ...state.workoutPlan, [day]: dayPlanCopy } }
    }
    case 'ADD_EXERCISE_TO_DAY': {
      const { day, exerciseId } = action.payload
      const p = getGoalParams(state)
      const sets = state.profile.fitnessLevel === 'beginner' ? Math.max(2, p.sets - 1) : p.sets
      const dayPlanAdd = { ...state.workoutPlan[day] }
      dayPlanAdd.exercises = [...dayPlanAdd.exercises, {
        exerciseId,
        sets,
        reps: p.repsLow,
        weight: 0,
        rest: p.rest,
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
    localStorage.setItem('zenfit-state', JSON.stringify(state))
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
