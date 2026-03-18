// Maps exercise IDs to their local image filenames in /public/exercises/
// Image files should be placed in the public/exercises/ folder
export const exerciseImageMap = {
  // Chest
  'bench-press': 'Barbell Bench Press.jpg',
  'incline-db-press': 'Incline Dumbbell Press.jpg',
  'push-ups': 'Push-Ups.jpg',
  'cable-flyes': 'Cable Flyes.jpg',
  'chest-dips': 'Chest Dips.jpg',
  'db-flyes': 'Dumbbell Flyes.jpg',
  'decline-bench': 'Decline Bench Press.jpg',
  'svend-press': 'Svend Press.jpg',

  // Back
  'deadlift': 'Deadlift.jpg',
  'barbell-row': 'Barbell Row.jpg',
  'lat-pulldown': 'Lat Pulldown.jpg',
  'seated-cable-row': 'Seated Cable Row.jpg',
  'db-row': 'Single-Arm Dumbbell Row.jpg',
  't-bar-row': 'T-Bar Row.jpg',
  'chin-ups': 'Chin-Ups.jpg',

  // Shoulders
  'overhead-press': 'Overhead Press.jpg',
  'lateral-raises': 'Lateral Raises.jpg',
  'face-pulls': 'Face Pulls.jpg',
  'arnold-press': 'Arnold Press.jpg',
  'db-shoulder-press': 'Dumbbell Shoulder Press.jpg',
  'rear-delt-fly': 'Rear Delt Fly.jpg',
}

// Returns the local exercise image path, or falls back to null (caller uses muscle group image)
export function getExerciseImage(exerciseId) {
  const filename = exerciseImageMap[exerciseId]
  if (filename) {
    return `/exercises/${encodeURIComponent(filename)}?v=2`
  }
  return null
}
