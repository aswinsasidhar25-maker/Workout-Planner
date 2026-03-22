import { describe, it, expect, vi } from 'vitest'

// Mock localStorage
const localStorageMock = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() }
vi.stubGlobal('localStorage', localStorageMock)

vi.mock('../context/GoogleAuthContext', () => ({
  useGoogleAuth: () => ({ accessToken: null, isSignedIn: false, setSyncStatus: vi.fn() }),
}))

import { _generateWorkoutPlan as generateWorkoutPlan } from '../context/AppContext'
import { exercises, weekDays, durationOptions } from '../data/exercises'

const makeProfile = (overrides = {}) => ({
  name: 'Test',
  gender: 'male',
  goals: ['build_muscle'],
  fitnessLevel: 'intermediate',
  duration: 60,
  workoutDays: ['Monday', 'Wednesday', 'Friday'],
  height: 175,
  weight: 70,
  units: { height: 'cm', weight: 'kg' },
  ...overrides,
})

describe('Workout Plan Generation', () => {
  it('returns empty object if no goals', () => {
    const plan = generateWorkoutPlan(makeProfile({ goals: [] }))
    expect(plan).toEqual({})
  })

  it('generates a plan with all 7 weekdays', () => {
    const plan = generateWorkoutPlan(makeProfile())
    expect(Object.keys(plan).sort()).toEqual([...weekDays].sort())
  })

  it('3-day schedule has 3 workout days and 4 rest days', () => {
    const plan = generateWorkoutPlan(makeProfile({
      workoutDays: ['Monday', 'Wednesday', 'Friday'],
    }))
    const restDays = Object.values(plan).filter(d => d.isRest)
    const workDays = Object.values(plan).filter(d => !d.isRest)
    expect(restDays.length).toBe(4)
    expect(workDays.length).toBe(3)
  })

  it('5-day schedule has 5 workout days and 2 rest days', () => {
    const plan = generateWorkoutPlan(makeProfile({
      workoutDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    }))
    const restDays = Object.values(plan).filter(d => d.isRest)
    const workDays = Object.values(plan).filter(d => !d.isRest)
    expect(restDays.length).toBe(2)
    expect(workDays.length).toBe(5)
  })

  it('rest days have isRest: true and empty exercises', () => {
    const plan = generateWorkoutPlan(makeProfile({
      workoutDays: ['Monday', 'Wednesday', 'Friday'],
    }))
    expect(plan['Tuesday'].isRest).toBe(true)
    expect(plan['Tuesday'].exercises).toEqual([])
    expect(plan['Tuesday'].name).toBe('Rest Day')
  })

  it('workout days have a name and exercises array', () => {
    const plan = generateWorkoutPlan(makeProfile())
    expect(plan['Monday'].name).toBeTruthy()
    expect(plan['Monday'].name).not.toBe('Rest Day')
    expect(Array.isArray(plan['Monday'].exercises)).toBe(true)
    expect(plan['Monday'].exercises.length).toBeGreaterThan(0)
  })

  it('no duplicate exercises within a single day', () => {
    const plan = generateWorkoutPlan(makeProfile())
    Object.entries(plan).forEach(([day, dayPlan]) => {
      if (dayPlan.isRest) return
      const ids = dayPlan.exercises.map(e => e.exerciseId)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  it('beginner never gets advanced exercises', () => {
    const plan = generateWorkoutPlan(makeProfile({ fitnessLevel: 'beginner' }))
    const advancedIds = exercises.filter(e => e.difficulty === 'advanced').map(e => e.id)
    Object.values(plan).forEach(dayPlan => {
      dayPlan.exercises.forEach(ex => {
        expect(advancedIds).not.toContain(ex.exerciseId)
      })
    })
  })

  it('exercise count respects duration config', () => {
    for (const opt of durationOptions) {
      const plan = generateWorkoutPlan(makeProfile({ duration: opt.id }))
      Object.values(plan).forEach(dayPlan => {
        if (dayPlan.isRest) return
        expect(dayPlan.exercises.length).toBeLessThanOrEqual(opt.exercisesPerSession)
      })
    }
  })

  it('each exercise has required properties', () => {
    const plan = generateWorkoutPlan(makeProfile())
    Object.values(plan).forEach(dayPlan => {
      dayPlan.exercises.forEach(ex => {
        expect(ex).toHaveProperty('exerciseId')
        expect(ex).toHaveProperty('sets')
        expect(ex).toHaveProperty('reps')
        expect(ex).toHaveProperty('weight')
        expect(ex).toHaveProperty('weights')
        expect(ex).toHaveProperty('rest')
        expect(ex).toHaveProperty('completed')
        expect(ex.sets).toBeGreaterThanOrEqual(2)
        expect(ex.reps).toBeGreaterThanOrEqual(1)
        expect(Array.isArray(ex.completed)).toBe(true)
        expect(ex.completed.length).toBe(ex.sets)
        expect(ex.completed.every(c => c === false)).toBe(true)
        expect(Array.isArray(ex.weights)).toBe(true)
        expect(ex.weights.length).toBe(ex.sets)
        expect(ex.weights.every(w => w === 0)).toBe(true)
      })
    })
  })

  it('beginner gets fewer sets than intermediate', () => {
    const beginnerPlan = generateWorkoutPlan(makeProfile({ fitnessLevel: 'beginner' }))
    const intermediatePlan = generateWorkoutPlan(makeProfile({ fitnessLevel: 'intermediate' }))

    const beginnerSets = beginnerPlan['Monday'].exercises[0]?.sets || 0
    const intermediateSets = intermediatePlan['Monday'].exercises[0]?.sets || 0

    expect(beginnerSets).toBeLessThanOrEqual(intermediateSets)
  })

  it('cardio goal injects cardio exercises on some days', () => {
    const plan = generateWorkoutPlan(makeProfile({ goals: ['lose_weight'] }))
    const cardioExIds = exercises.filter(e => e.muscle === 'cardio').map(e => e.id)
    const hasCardio = Object.values(plan).some(d =>
      d.exercises.some(e => cardioExIds.includes(e.exerciseId))
    )
    expect(hasCardio).toBe(true)
  })

  it('all exercise IDs reference real exercises', () => {
    const plan = generateWorkoutPlan(makeProfile())
    const allIds = exercises.map(e => e.id)
    Object.values(plan).forEach(dayPlan => {
      dayPlan.exercises.forEach(ex => {
        expect(allIds).toContain(ex.exerciseId)
      })
    })
  })
})
