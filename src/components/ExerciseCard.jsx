import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Trash2, Info, Check, Minus, Plus, Weight } from 'lucide-react'
import { exercises, muscleGroups } from '../data/exercises'
import { getExerciseImage } from '../data/exerciseImages'
import { useApp } from '../context/AppContext'

export default function ExerciseCard({ planExercise, day, exerciseIndex, readonly = false }) {
  const { dispatch } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [editingSetWeight, setEditingSetWeight] = useState(null)
  const [weightInput, setWeightInput] = useState('')

  const exercise = exercises.find(e => e.id === planExercise.exerciseId)
  if (!exercise) return null

  const muscle = muscleGroups.find(m => m.id === exercise.muscle)
  const exerciseImage = getExerciseImage(exercise.id) || muscle?.image
  const completedSets = planExercise.completed.filter(Boolean).length
  const totalSets = planExercise.sets
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  // Get per-set weights, falling back to legacy single weight
  const weights = planExercise.weights || Array(totalSets).fill(planExercise.weight || 0)

  const handleSetToggle = (setIndex) => {
    if (readonly) return
    dispatch({ type: 'TOGGLE_SET_COMPLETE', payload: { day, exerciseIndex, setIndex } })
  }

  const handleSetWeightClick = (setIndex, e) => {
    e.stopPropagation()
    if (readonly) return
    setEditingSetWeight(setIndex)
    setWeightInput(String(weights[setIndex] || 0))
  }

  const handleWeightInputSave = () => {
    if (editingSetWeight === null) return
    const w = parseFloat(weightInput) || 0
    dispatch({
      type: 'SET_WEIGHT_FOR_SET',
      payload: { day, exerciseIndex, setIndex: editingSetWeight, weight: Math.max(0, w) },
    })
    setEditingSetWeight(null)
    setWeightInput('')
  }

  const handleWeightInputKeyDown = (e) => {
    if (e.key === 'Enter') handleWeightInputSave()
    if (e.key === 'Escape') { setEditingSetWeight(null); setWeightInput('') }
  }

  const handleAddSet = (e) => {
    e.stopPropagation()
    dispatch({ type: 'ADD_SET', payload: { day, exerciseIndex } })
  }

  const handleRemoveSet = (e) => {
    e.stopPropagation()
    if (totalSets <= 1) return
    dispatch({ type: 'REMOVE_SET', payload: { day, exerciseIndex } })
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

              {/* Sets count control */}
              {!readonly && (
                <div className="flex items-center justify-between bg-surface-light rounded-xl p-3">
                  <span className="text-sm text-text-secondary">Number of Sets</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRemoveSet}
                      disabled={totalSets <= 1}
                      className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold text-text-primary w-8 text-center">{totalSets}</span>
                    <button
                      onClick={handleAddSet}
                      className="w-8 h-8 rounded-lg bg-surface-lighter flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sets tracking with per-set weights */}
              {!readonly && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary mb-2">
                    Sets x {planExercise.reps} reps | Rest: {planExercise.rest}s
                  </p>
                  <div className="space-y-2">
                    {planExercise.completed.map((done, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {/* Set complete toggle */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSetToggle(i) }}
                          className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all duration-200 ${
                            done
                              ? 'bg-gradient-to-br from-success to-emerald-600 text-white shadow-lg shadow-success/20'
                              : 'bg-surface-lighter text-text-muted hover:bg-surface-lighter/80'
                          }`}
                        >
                          {done ? <Check className="w-4 h-4" /> : null}
                          <span>Set {i + 1}</span>
                          {weights[i] > 0 && (
                            <span className={`text-xs font-normal ${done ? 'text-white/80' : 'text-text-muted'}`}>
                              ({weights[i]} kg)
                            </span>
                          )}
                        </button>
                        {/* Per-set weight button */}
                        <button
                          onClick={(e) => handleSetWeightClick(i, e)}
                          className="h-12 px-3 rounded-xl bg-surface-lighter text-text-muted hover:text-primary-light hover:bg-primary/10 transition-all flex items-center gap-1.5 shrink-0 text-xs font-medium"
                        >
                          <Weight className="w-3.5 h-3.5" />
                          {weights[i] > 0 ? `${weights[i]}kg` : 'Set wt'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight input modal for a specific set */}
              {editingSetWeight !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                >
                  <p className="text-sm font-semibold text-text-primary mb-3">
                    Set {editingSetWeight + 1} — Enter Weight (kg)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      onKeyDown={handleWeightInputKeyDown}
                      autoFocus
                      min="0"
                      step="0.5"
                      className="flex-1 h-10 px-3 rounded-lg bg-surface border border-surface-lighter text-text-primary text-center text-lg font-bold focus:outline-none focus:border-primary"
                      placeholder="0"
                    />
                    <button
                      onClick={handleWeightInputSave}
                      className="h-10 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingSetWeight(null); setWeightInput('') }}
                      className="h-10 px-3 rounded-lg bg-surface-lighter text-text-muted text-sm hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Weight summary */}
              {!readonly && weights.some(w => w > 0) && editingSetWeight === null && (
                <div className="bg-surface-light rounded-xl p-3">
                  <p className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Weight Summary
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {weights.map((w, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          planExercise.completed[i]
                            ? 'bg-success/10 text-success'
                            : 'bg-surface-lighter text-text-secondary'
                        }`}
                      >
                        Set {i + 1}: {w > 0 ? `${w} kg` : '—'}
                      </div>
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
