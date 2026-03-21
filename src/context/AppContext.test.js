import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage before importing AppContext
const localStorageMock = { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() }
vi.stubGlobal('localStorage', localStorageMock)

// Mock GoogleAuthContext
vi.mock('./GoogleAuthContext', () => ({
  useGoogleAuth: () => ({ accessToken: null, isSignedIn: false, setSyncStatus: vi.fn() }),
}))

import { _reducer as reducer, _generateWorkoutPlan as generateWorkoutPlan } from './AppContext'

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

const makeState = (overrides = {}) => ({
  profile: makeProfile(),
  workoutPlan: {},
  workoutLog: {},
  customExercises: [],
  streak: { current: 0, longest: 0 },
  unlockedBadges: [],
  newBadge: null,
  weightLog: {},
  weightGoal: null,
  weightTrackerEnabled: false,
  ...overrides,
})

// ───────────────────────────────────────────────────────────────────
// Sanity tests for existing features
// ───────────────────────────────────────────────────────────────────

describe('Reducer — Existing Feature Sanity', () => {
  let state

  beforeEach(() => {
    state = makeState()
    // Generate a plan so tests that manipulate plan have data
    const plan = generateWorkoutPlan(state.profile)
    state.workoutPlan = plan
  })

  it('SET_PROFILE creates a workout plan', () => {
    const emptyState = makeState({ profile: null, workoutPlan: {} })
    const profile = makeProfile()
    const result = reducer(emptyState, { type: 'SET_PROFILE', payload: profile })
    expect(result.profile).toEqual(profile)
    expect(Object.keys(result.workoutPlan).length).toBe(7) // 7 days of the week
  })

  it('REGENERATE_PLAN produces a new plan', () => {
    const result = reducer(state, { type: 'REGENERATE_PLAN' })
    expect(Object.keys(result.workoutPlan).length).toBe(7)
    // Non-rest days should have exercises
    const workoutDays = ['Monday', 'Wednesday', 'Friday']
    workoutDays.forEach(day => {
      expect(result.workoutPlan[day].isRest).toBe(false)
      expect(result.workoutPlan[day].exercises.length).toBeGreaterThan(0)
    })
  })

  it('REGENERATE_PLAN returns same state if no profile', () => {
    const noProfile = makeState({ profile: null })
    const result = reducer(noProfile, { type: 'REGENERATE_PLAN' })
    expect(result).toBe(noProfile)
  })

  it('UPDATE_EXERCISE_IN_PLAN updates exercise properties', () => {
    const day = 'Monday'
    const result = reducer(state, {
      type: 'UPDATE_EXERCISE_IN_PLAN',
      payload: { day, exerciseIndex: 0, updates: { weight: 100 } },
    })
    expect(result.workoutPlan[day].exercises[0].weight).toBe(100)
  })

  it('TOGGLE_SET_COMPLETE flips the completed boolean', () => {
    const day = 'Monday'
    expect(state.workoutPlan[day].exercises[0].completed[0]).toBe(false)
    const result = reducer(state, {
      type: 'TOGGLE_SET_COMPLETE',
      payload: { day, exerciseIndex: 0, setIndex: 0 },
    })
    expect(result.workoutPlan[day].exercises[0].completed[0]).toBe(true)
    // Toggle back
    const result2 = reducer(result, {
      type: 'TOGGLE_SET_COMPLETE',
      payload: { day, exerciseIndex: 0, setIndex: 0 },
    })
    expect(result2.workoutPlan[day].exercises[0].completed[0]).toBe(false)
  })

  it('LOG_WORKOUT adds entry and updates streak', () => {
    const today = new Date().toISOString().split('T')[0]
    const result = reducer(state, {
      type: 'LOG_WORKOUT',
      payload: { date: today, day: 'Monday', exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 10 }] },
    })
    expect(result.workoutLog[today]).toHaveLength(1)
    expect(result.streak.current).toBeGreaterThanOrEqual(1)
  })

  it('LOG_WORKOUT unlocks first_workout badge', () => {
    const today = new Date().toISOString().split('T')[0]
    const result = reducer(state, {
      type: 'LOG_WORKOUT',
      payload: { date: today, day: 'Monday', exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 10 }] },
    })
    expect(result.unlockedBadges).toContain('first_workout')
  })

  it('DISMISS_BADGE clears newBadge', () => {
    const withBadge = { ...state, newBadge: 'first_workout' }
    const result = reducer(withBadge, { type: 'DISMISS_BADGE' })
    expect(result.newBadge).toBeNull()
  })

  it('REPLACE_EXERCISE swaps exercise at index', () => {
    const day = 'Monday'
    const originalId = state.workoutPlan[day].exercises[0].exerciseId
    // Pick a replacement that's different from the original
    const replacementId = originalId === 'push-ups' ? 'cable-flyes' : 'push-ups'
    const result = reducer(state, {
      type: 'REPLACE_EXERCISE',
      payload: { day, exerciseIndex: 0, newExerciseId: replacementId },
    })
    expect(result.workoutPlan[day].exercises[0].exerciseId).toBe(replacementId)
    expect(result.workoutPlan[day].exercises[0].exerciseId).not.toBe(originalId)
  })

  it('ADD_EXERCISE_TO_DAY appends exercise and marks day non-rest', () => {
    const day = 'Tuesday' // rest day
    expect(state.workoutPlan[day].isRest).toBe(true)
    const result = reducer(state, {
      type: 'ADD_EXERCISE_TO_DAY',
      payload: { day, exerciseId: 'bench-press' },
    })
    expect(result.workoutPlan[day].isRest).toBe(false)
    expect(result.workoutPlan[day].exercises.length).toBe(1)
    expect(result.workoutPlan[day].exercises[0].exerciseId).toBe('bench-press')
  })

  it('REMOVE_EXERCISE_FROM_DAY removes exercise at index', () => {
    const day = 'Monday'
    const originalCount = state.workoutPlan[day].exercises.length
    const result = reducer(state, {
      type: 'REMOVE_EXERCISE_FROM_DAY',
      payload: { day, exerciseIndex: 0 },
    })
    expect(result.workoutPlan[day].exercises.length).toBe(originalCount - 1)
  })

  it('DELETE_WEIGHT_ENTRY removes the entry', () => {
    const withWeight = makeState({ weightLog: { '2026-01-01': { weight: 70 }, '2026-01-02': { weight: 71 } } })
    const result = reducer(withWeight, { type: 'DELETE_WEIGHT_ENTRY', payload: { date: '2026-01-01' } })
    expect(result.weightLog['2026-01-01']).toBeUndefined()
    expect(result.weightLog['2026-01-02']).toEqual({ weight: 71 })
  })

  it('SET_WEIGHT_GOAL sets the goal', () => {
    const result = reducer(state, {
      type: 'SET_WEIGHT_GOAL',
      payload: { targetWeight: 65, type: 'lose' },
    })
    expect(result.weightGoal).toEqual({ targetWeight: 65, type: 'lose' })
  })

  it('TOGGLE_WEIGHT_TRACKER flips the boolean', () => {
    expect(state.weightTrackerEnabled).toBe(false)
    const result = reducer(state, { type: 'TOGGLE_WEIGHT_TRACKER' })
    expect(result.weightTrackerEnabled).toBe(true)
    const result2 = reducer(result, { type: 'TOGGLE_WEIGHT_TRACKER' })
    expect(result2.weightTrackerEnabled).toBe(false)
  })

  it('RESET_PROFILE clears profile and plan', () => {
    const result = reducer(state, { type: 'RESET_PROFILE' })
    expect(result.profile).toBeNull()
    expect(result.workoutPlan).toEqual({})
  })
})

// ───────────────────────────────────────────────────────────────────
// Rigorous tests for bidirectional weight sync (new feature)
// ───────────────────────────────────────────────────────────────────

describe('Reducer — Bidirectional Weight Sync', () => {
  it('ADD_WEIGHT_ENTRY updates both weightLog and profile.weight', () => {
    const state = makeState()
    const result = reducer(state, {
      type: 'ADD_WEIGHT_ENTRY',
      payload: { date: '2026-03-20', weight: 72 },
    })
    expect(result.weightLog['2026-03-20']).toEqual({ weight: 72 })
    expect(result.profile.weight).toBe(72)
  })

  it('ADD_WEIGHT_ENTRY preserves profile if null', () => {
    const state = makeState({ profile: null })
    const result = reducer(state, {
      type: 'ADD_WEIGHT_ENTRY',
      payload: { date: '2026-03-20', weight: 72 },
    })
    expect(result.profile).toBeNull()
    expect(result.weightLog['2026-03-20']).toEqual({ weight: 72 })
  })

  it('SET_PROFILE with weight change creates weight log entry for today', () => {
    const state = makeState()
    const today = new Date().toISOString().split('T')[0]
    const newProfile = makeProfile({ weight: 75 })
    const result = reducer(state, { type: 'SET_PROFILE', payload: newProfile })
    expect(result.weightLog[today]).toEqual({ weight: 75 })
    expect(result.profile.weight).toBe(75)
  })

  it('SET_PROFILE without weight change does NOT add log entry', () => {
    const state = makeState()
    const sameProfile = makeProfile({ weight: 70 }) // same weight
    const result = reducer(state, { type: 'SET_PROFILE', payload: sameProfile })
    // weightLog should not have a new entry for today (weight hasn't changed)
    expect(Object.keys(result.weightLog).length).toBe(0)
  })

  it('SET_PROFILE with null weight does NOT add log entry', () => {
    const state = makeState()
    const noWeightProfile = makeProfile({ weight: null })
    const result = reducer(state, { type: 'SET_PROFILE', payload: noWeightProfile })
    expect(Object.keys(result.weightLog).length).toBe(0)
  })

  it('round-trip: ADD_WEIGHT_ENTRY → SET_PROFILE propagates correctly', () => {
    let state = makeState()

    // Add weight entry → should sync to profile
    state = reducer(state, {
      type: 'ADD_WEIGHT_ENTRY',
      payload: { date: '2026-03-19', weight: 72 },
    })
    expect(state.profile.weight).toBe(72)

    // Update profile with different weight → should create log entry
    const today = new Date().toISOString().split('T')[0]
    state = reducer(state, {
      type: 'SET_PROFILE',
      payload: makeProfile({ weight: 68 }),
    })
    expect(state.weightLog[today]).toEqual({ weight: 68 })
    expect(state.profile.weight).toBe(68)
    // Previous entry still exists
    expect(state.weightLog['2026-03-19']).toEqual({ weight: 72 })
  })
})
