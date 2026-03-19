// MET (Metabolic Equivalent of Task) values for each exercise
// Based on the Compendium of Physical Activities
const metValues = {
  // Chest
  'bench-press': 5.0,
  'incline-db-press': 5.0,
  'push-ups': 3.8,
  'cable-flyes': 3.5,
  'chest-dips': 5.5,
  'db-flyes': 3.5,
  'decline-bench': 5.0,
  'svend-press': 3.0,

  // Back
  'deadlift': 6.0,
  'pull-ups': 5.5,
  'barbell-row': 5.0,
  'lat-pulldown': 4.5,
  'seated-cable-row': 4.0,
  'db-row': 4.5,
  't-bar-row': 5.0,
  'chin-ups': 5.5,

  // Shoulders
  'overhead-press': 5.0,
  'lateral-raises': 3.5,
  'face-pulls': 3.0,
  'arnold-press': 5.0,
  'db-shoulder-press': 4.5,
  'front-raises': 3.5,
  'rear-delt-fly': 3.0,
  'upright-row': 4.0,

  // Biceps
  'barbell-curl': 3.5,
  'hammer-curl': 3.5,
  'concentration-curl': 3.0,
  'preacher-curl': 3.0,
  'cable-curl': 3.0,
  'incline-db-curl': 3.0,

  // Triceps
  'tricep-pushdown': 3.5,
  'skull-crushers': 3.5,
  'overhead-tricep-ext': 3.5,
  'close-grip-bench': 5.0,
  'tricep-kickback': 3.0,
  'diamond-pushups': 4.0,

  // Legs
  'barbell-squat': 6.0,
  'leg-press': 5.0,
  'lunges': 5.0,
  'leg-curl': 3.5,
  'calf-raises': 3.0,
  'leg-extension': 3.5,
  'front-squat': 6.0,
  'goblet-squat': 5.0,
  'step-ups': 5.5,

  // Glutes
  'hip-thrust': 5.0,
  'glute-bridge': 4.0,
  'romanian-deadlift': 5.5,
  'bulgarian-split-squat': 5.5,
  'cable-kickback': 3.5,
  'sumo-deadlift': 5.5,
  'donkey-kicks': 3.5,

  // Core
  'plank': 3.0,
  'cable-crunch': 3.5,
  'hanging-leg-raise': 4.0,
  'russian-twist': 3.5,
  'mountain-climbers': 8.0,
  'bicycle-crunch': 3.5,
  'dead-bug': 3.0,
  'ab-wheel': 4.5,

  // Cardio
  'treadmill-run': 9.8,
  'jump-rope': 12.3,
  'burpees': 8.0,
  'cycling': 7.5,
  'rowing': 7.0,
  'stair-climber': 9.0,
  'box-jumps': 8.0,
  'battle-ropes': 10.3,
  'high-knees': 8.0,
  'jumping-jacks': 7.0,

  // Full Body
  'kettlebell-swing': 6.0,
  'clean-and-press': 7.0,
  'thrusters': 8.0,
  'man-makers': 8.0,
  'turkish-getup': 6.0,
  'farmers-walk': 6.0,
}

// Estimated seconds per rep by exercise type
const secondsPerRep = {
  strength: 4,
  cardio: 3,
}

/**
 * Calculate calories burned using MET-based formula.
 * Formula: MET × weightKg × durationHours
 * Duration estimated from sets × reps × secondsPerRep
 */
export function calculateCalories(exerciseId, exerciseType, weightKg, sets, reps) {
  const met = metValues[exerciseId] || 4.0
  const secsPerRep = secondsPerRep[exerciseType] || 4
  const totalSeconds = sets * reps * secsPerRep
  const durationHours = totalSeconds / 3600
  return Math.round(met * weightKg * durationHours)
}

/**
 * Fallback calorie calculation using static per-rep values
 */
export function calculateCaloriesFallback(caloriesPerRep, sets, reps) {
  return caloriesPerRep * sets * reps
}

// Unit conversion helpers
export const kgToLbs = (kg) => Math.round(kg * 2.205 * 10) / 10
export const lbsToKg = (lbs) => Math.round(lbs / 2.205 * 10) / 10
export const cmToFtIn = (cm) => {
  const totalInches = cm / 2.54
  return { ft: Math.floor(totalInches / 12), in: Math.round(totalInches % 12) }
}
export const ftInToCm = (ft, inches) => Math.round((ft * 12 + inches) * 2.54)

export function formatHeight(cm, unit) {
  if (unit === 'ft') {
    const { ft, in: inches } = cmToFtIn(cm)
    return `${ft}'${inches}"`
  }
  return `${cm} cm`
}

export function formatWeight(kg, unit) {
  if (unit === 'lbs') return `${kgToLbs(kg)} lbs`
  return `${kg} kg`
}
