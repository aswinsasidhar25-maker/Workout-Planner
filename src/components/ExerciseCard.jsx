import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2, Info, Check, Minus, Plus } from 'lucide-react'
import { exercises, muscleGroups } from '../data/exercises'
import { getExerciseImage } from '../data/exerciseImages'
import { useApp } from '../context/AppContext'

export default function ExerciseCard({ planExercise, day, exerciseIndex, readonly = false }) {
  const { dispatch } = useApp()
  const [expanded, setExpanded] = useState(false)

  const exercise = exercises.find(e => e.id === planExercise.exerciseId)
  if (!exercise) return null

  const muscle = muscleGroups.find(m => m.id === exercise.muscle)
  const exerciseImage = getExerciseImage(exercise.id) || muscle?.image
  const completedSets = planExercise.completed.filter(Boolean).length
  const totalSets = planExercise.sets
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const handleSetToggle = (setIndex) => {
    if (readonly) return
    dispatch({ type: 'TOGGLE_SET_COMPLETE', payload: { day, exerciseIndex, setIndex } })
  }

  const handleWeightChange = (delta) => {
    if (readonly) return
    const newWeight = Math.max(0, (planExercise.weight || 0) + delta)
    dispatch({ type: 'UPDATE_EXERCISE_IN_PLAN', payload: { day, exerciseIndex, updates: { weight: newWeight } } })
  }

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_EXERCISE_FROM_DAY', payload: { day, exerciseIndex } })
  }

  const difficultyColors = {
    beginner: 'text-success bg-success/10',
    intermediate: 'text-warning bg-warning/10',
    advanced: 'text-danger bg-danger/10',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden"
    >
      {/* Progress bar */}
      <div className="h-1 bg-surface-lighter">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
          <img src={exerciseImage} alt={exercise.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[exercise.difficulty]}`}>
              {exercise.difficulty}
            </span>
            <span className="text-xs text-text-muted">{muscle?.name}</span>
            <span className="text-xs text-text-muted">·</span>
            <span className="text-xs text-text-muted">{exercise.equipment}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-primary-light">{completedSets}/{totalSets}</p>
          <p className="text-xs text-text-muted">sets</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed">{exercise.description}</p>

              {/* Tips */}
              <div className="bg-surface-light rounded-xl p-3">
                <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Pro Tips
                </p>
                <ul className="space-y-1">
                  {exercise.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-primary-light mt-0.5">·</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weight control */}
              {!readonly && (
                <div className="flex items-center justify-between bg-surface-light rounded-xl p-3">
                  <span className="text-sm text-text-secondary">Weight (kg)</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWeightChange(-2.5) }}
                      className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-text-primary w-16 text-center">{planExercise.weight || 0}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWeightChange(2.5) }}
                      className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sets tracking */}
              {!readonly && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">
                    Sets x {planExercise.reps} reps | Rest: {planExercise.rest}s
                  </p>
                  <div className="flex gap-2">
                    {planExercise.completed.map((done, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); handleSetToggle(i) }}
                        className={`flex-1 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                          done
                            ? 'bg-gradient-to-br from-success to-emerald-600 text-white shadow-lg shadow-success/20'
                            : 'bg-surface-lighter text-text-muted hover:bg-surface-lighter/80'
                        }`}
                      >
                        {done ? <Check className="w-5 h-5" /> : `Set ${i + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!readonly && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove() }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
