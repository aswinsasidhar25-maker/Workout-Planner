import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Plus, Save, CheckCircle2, Star, Dumbbell, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { weekDays, exercises as allExercises, muscleGroups } from '../data/exercises'
import ExerciseCard from '../components/ExerciseCard'

export default function WorkoutPlan() {
  const { state, dispatch } = useApp()
  const { workoutPlan, profile } = state
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const [selectedDay, setSelectedDay] = useState(weekDays[todayIndex])
  const [showAddModal, setShowAddModal] = useState(false)
  const [addFilter, setAddFilter] = useState('')
  const [saved, setSaved] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const dayPlan = workoutPlan[selectedDay]

  const handleLogWorkout = () => {
    const dateStr = new Date().toISOString().split('T')[0]
    dispatch({
      type: 'LOG_WORKOUT',
      payload: {
        date: dateStr,
        day: selectedDay,
        exercises: dayPlan.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          weights: ex.weights || Array(ex.sets).fill(ex.weight || 0),
          completedSets: ex.completed.filter(Boolean).length,
        })),
      },
    })
    setSaved(true)
    setShowCelebration(true)
    setTimeout(() => setSaved(false), 2000)
    setTimeout(() => setShowCelebration(false), 4000)
  }

  const availableExercises = useMemo(() => {
    const currentIds = dayPlan?.exercises.map(e => e.exerciseId) || []
    return allExercises.filter(ex => {
      if (currentIds.includes(ex.id)) return false
      if (addFilter && ex.muscle !== addFilter) return false
      return true
    })
  }, [dayPlan, addFilter])

  const totalSets = dayPlan?.exercises.reduce((s, e) => s + e.sets, 0) || 0
  const completedSets = dayPlan?.exercises.reduce((s, e) => s + e.completed.filter(Boolean).length, 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Workout Plan</h1>
          <p className="text-sm text-text-secondary">Tap exercises to track your sets</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'REGENERATE_PLAN' })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-surface-lighter text-text-secondary hover:text-primary-light hover:border-primary/30 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Regenerate
        </button>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {weekDays.map((day, i) => {
          const plan = workoutPlan[day]
          const isToday = i === todayIndex
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 px-4 py-3 rounded-xl text-center transition-all border ${
                selectedDay === day
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : isToday
                  ? 'bg-surface border-primary/40 text-primary-light'
                  : 'bg-surface border-surface-lighter text-text-secondary hover:border-primary/30'
              }`}
            >
              <p className="text-xs font-medium">{day.slice(0, 3)}</p>
              <div className="mt-1">
                {plan?.isRest
                  ? <Calendar className={`w-5 h-5 mx-auto ${selectedDay === day ? 'text-white/70' : 'text-text-muted'}`} />
                  : <Dumbbell className={`w-5 h-5 mx-auto ${selectedDay === day ? 'text-white' : 'text-primary-light'}`} />
                }
              </div>
            </button>
          )
        })}
      </div>

      {/* Day header */}
      {dayPlan && (
        <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">{dayPlan.name}</h2>
              <p className="text-sm text-text-secondary mt-1">
                {dayPlan.isRest ? 'Rest and recover' : `${dayPlan.exercises.length} exercises · ${totalSets} total sets`}
              </p>
            </div>
            {!dayPlan.isRest && totalSets > 0 && (
              <div className="text-right">
                <p className="text-2xl font-black text-primary-light">{Math.round((completedSets / totalSets) * 100)}%</p>
                <p className="text-xs text-text-muted">{completedSets}/{totalSets} sets</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercises */}
      {dayPlan && !dayPlan.isRest ? (
        <div className="space-y-3">
          {dayPlan.exercises.map((planEx, i) => (
            <ExerciseCard
              key={`${planEx.exerciseId}-${i}`}
              planExercise={planEx}
              day={selectedDay}
              exerciseIndex={i}
            />
          ))}

          {/* Add exercise button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-surface-lighter text-text-muted hover:border-primary/30 hover:text-primary-light transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Exercise
          </button>

          {/* Log workout */}
          {completedSets > 0 && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={handleLogWorkout}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                saved
                  ? 'bg-success text-white'
                  : 'bg-gradient-to-r from-primary to-accent text-white shadow-xl shadow-primary/30 hover:shadow-2xl'
              }`}
            >
              {saved ? (
                <><CheckCircle2 className="w-5 h-5" /> Workout Saved!</>
              ) : (
                <><Save className="w-5 h-5" /> Log Workout</>
              )}
            </motion.button>
          )}
        </div>
      ) : dayPlan?.isRest ? (
        <div className="bg-surface rounded-2xl border border-surface-lighter p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-primary-light" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Rest Day</h3>
          <p className="text-text-secondary mt-2">Your muscles grow during rest. Stay hydrated, stretch, and prepare for tomorrow's session.</p>
        </div>
      ) : null}

      {/* Celebration modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCelebration(false)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="bg-surface rounded-3xl border border-accent/30 p-8 text-center max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-accent/20 flex items-center justify-center mb-4"
              >
                <Dumbbell className="w-8 h-8 text-accent" />
              </motion.div>
              <h2 className="text-2xl font-black text-text-primary mb-2">Workout Complete!</h2>
              <p className="text-text-secondary mb-6">Great job crushing it today. Keep the momentum going!</p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-primary/10 rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-bold text-primary-light">{completedSets}</p>
                  <p className="text-[10px] text-text-muted">Sets Done</p>
                </div>
                <div className="bg-accent/10 rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-bold text-accent">{dayPlan?.exercises.length || 0}</p>
                  <p className="text-[10px] text-text-muted">Exercises</p>
                </div>
              </div>
              <div className="flex gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Star className="w-6 h-6 text-accent fill-accent" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add exercise modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-surface rounded-2xl border border-surface-lighter w-full max-w-lg max-h-[70vh] overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-surface-lighter flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Add Exercise</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary text-2xl">&times;</button>
            </div>

            {/* Filter */}
            <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setAddFilter('')}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  addFilter === '' ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted'
                }`}
              >
                All
              </button>
              {muscleGroups.map(mg => (
                <button
                  key={mg.id}
                  onClick={() => setAddFilter(mg.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    addFilter === mg.id ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted'
                  }`}
                >
                  <img src={mg.image} alt="" className="w-4 h-4 rounded object-cover" />
                  {mg.name}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {availableExercises.map(ex => {
                const mg = muscleGroups.find(m => m.id === ex.muscle)
                return (
                  <button
                    key={ex.id}
                    onClick={() => {
                      dispatch({ type: 'ADD_EXERCISE_TO_DAY', payload: { day: selectedDay, exerciseId: ex.id } })
                      setShowAddModal(false)
                    }}
                    className="w-full p-3 rounded-xl bg-surface-light border border-surface-lighter text-left hover:border-primary/30 transition-all flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <img src={mg?.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{ex.name}</p>
                      <p className="text-xs text-text-muted">{ex.muscle} · {ex.difficulty} · {ex.equipment}</p>
                    </div>
                    <Plus className="w-4 h-4 text-text-muted ml-auto" />
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
