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

  // Biceps
  'barbell-curl': 'Barbell Curl.jpg',
  'hammer-curl': 'Hammer Curls.jpg',
  'concentration-curl': 'Concentration Curl.jpg',
  'preacher-curl': 'Preacher Curl.jpg',
  'cable-curl': 'Cable Curl.jpg',
  'incline-db-curl': 'Incline Dumbbell Curl.jpg',

  // Triceps
  'tricep-pushdown': 'Tricep Pushdown.jpg',
  'skull-crushers': 'Skull Crushers.jpg',
  'close-grip-bench': 'Close-Grip Bench Press.jpg',
  'tricep-kickback': 'Tricep Kickback.jpg',

  // Legs
  'barbell-squat': 'Barbell Squat.jpg',
  'leg-press': 'Leg Press.jpg',
  'lunges': 'Walking Lunges.jpg',
  'leg-curl': 'Leg Curl.jpg',
  'calf-raises': 'Standing Calf Raises.jpg',
  'leg-extension': 'Leg Extension.jpg',
  'front-squat': 'Front Squat.jpg',
  'goblet-squat': 'Goblet Squat.jpg',
  'step-ups': 'Step-Ups.jpg',

  // Glutes
  'hip-thrust': 'Hip Thrust.jpg',
  'glute-bridge': 'Glute Bridge.jpg',
  'romanian-deadlift': 'Romanian Deadlift.jpg',
  'bulgarian-split-squat': 'Bulgarian Split Squat.jpg',
  'cable-kickback': 'Cable Glute Kickback.jpg',
  'sumo-deadlift': 'Sumo Deadlift.jpg',

  // Core
  'cable-crunch': 'Cable Crunch.jpg',
  'hanging-leg-raise': 'Hanging Leg Raise.jpg',
  'russian-twist': 'Russian Twist.jpg',
  'mountain-climbers': 'Mountain Climbers.jpg',
  'bicycle-crunch': 'Bicycle Crunch.jpg',
  'dead-bug': 'Dead Bug.jpg',
  'ab-wheel': 'Ab Wheel Rollout.jpg',

  // Cardio
  'jump-rope': 'Jump Rope.jpg',
  'burpees': 'Burpees.jpg',
  'cycling': 'Stationary Cycling.jpg',
  'stair-climber': 'Stair Climber.jpg',
  'box-jumps': 'Box Jumps.jpg',
  'battle-ropes': 'Battle Ropes.jpg',
  'jumping-jacks': 'Jumping Jacks.jpg',

  // Full Body
  'kettlebell-swing': 'Kettlebell Swing.jpg',
  'clean-and-press': 'Clean and Press.jpg',
  'thrusters': 'Thrusters.jpg',
}

// Returns the local exercise image path, or falls back to null (caller uses muscle group image)
export function getExerciseImage(exerciseId) {
  const filename = exerciseImageMap[exerciseId]
  if (filename) {
    return `/exercises/${encodeURIComponent(filename)}?v=3`
  }
  return null
}
