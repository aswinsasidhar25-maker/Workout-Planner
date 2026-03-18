// Maps exercise IDs to their local image filenames in /public/exercises/
// To add images: place them in the public/exercises/ folder with matching filenames below
// Supported formats: .jpg, .png, .webp
export const exerciseImageMap = {
  // Chest
  'bench-press': 'bench-press.jpg',
  'incline-db-press': 'incline-db-press.jpg',
  'push-ups': 'push-ups.jpg',
  'cable-flyes': 'cable-flyes.jpg',
  'chest-dips': 'chest-dips.jpg',
  'db-flyes': 'db-flyes.jpg',
  'decline-bench': 'decline-bench.jpg',

  // Back
  'deadlift': 'deadlift.jpg',
  'pull-ups': 'pull-ups.jpg',
  'barbell-row': 'barbell-row.jpg',
  'lat-pulldown': 'lat-pulldown.jpg',

  // Shoulders
  'overhead-press': 'overhead-press.jpg',
  'lateral-raises': 'lateral-raises.jpg',

  // Biceps
  'barbell-curl': 'barbell-curl.jpg',
  'hammer-curl': 'hammer-curl.jpg',

  // Legs
  'barbell-squat': 'barbell-squat.jpg',
  'lunges': 'lunges.jpg',

  // Glutes
  'hip-thrust': 'hip-thrust.jpg',

  // Core
  'plank': 'plank.jpg',

  // Cardio
  'treadmill-run': 'treadmill-run.jpg',
  'jump-rope': 'jump-rope.jpg',
}

// Returns the local exercise image path, or falls back to muscle group image
export function getExerciseImage(exerciseId) {
  const filename = exerciseImageMap[exerciseId]
  if (filename) {
    return `/exercises/${filename}`
  }
  return null
}
