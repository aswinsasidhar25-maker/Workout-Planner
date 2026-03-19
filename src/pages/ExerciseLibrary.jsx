import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, Filter } from 'lucide-react'
import { exercises, muscleGroups } from '../data/exercises'
import { getExerciseImage } from '../data/exerciseImages'
import { useApp } from '../context/AppContext'
import { calculateCalories } from '../utils/calories'

export default function ExerciseLibrary() {
  const { state } = useApp()
  const profile = state.profile
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const equipmentTypes = useMemo(() => [...new Set(exercises.map(e => e.equipment))], [])

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false
      if (muscleFilter && ex.muscle !== muscleFilter) return false
      if (difficultyFilter && ex.difficulty !== difficultyFilter) return false
      if (equipmentFilter && ex.equipment !== equipmentFilter) return false
      return true
    })
  }, [search, muscleFilter, difficultyFilter, equipmentFilter])

  const difficultyColors = {
    beginner: 'text-success bg-success/10 border-success/20',
    intermediate: 'text-warning bg-warning/10 border-warning/20',
    advanced: 'text-danger bg-danger/10 border-danger/20',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Exercise Library</h1>
        <p className="text-sm text-text-secondary">Browse {exercises.length} exercises</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface border border-surface-lighter text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-text-muted"
        />
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary-light transition-colors"
      >
        <Filter className="w-4 h-4" /> Filters
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        {(muscleFilter || difficultyFilter || equipmentFilter) && (
          <span className="w-2 h-2 rounded-full bg-primary" />
        )}
      </button>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div>
              <p className="text-xs font-semibold text-text-muted mb-2">Muscle Group</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setMuscleFilter('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${muscleFilter === '' ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted hover:text-text-secondary'}`}>All</button>
                {muscleGroups.map(mg => (
                  <button key={mg.id} onClick={() => setMuscleFilter(mg.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${muscleFilter === mg.id ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted hover:text-text-secondary'}`}>
                    <img src={mg.image} alt="" className="w-4 h-4 rounded object-cover" />
                    {mg.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted mb-2">Difficulty</p>
              <div className="flex gap-2">
                {['', 'beginner', 'intermediate', 'advanced'].map(d => (
                  <button key={d} onClick={() => setDifficultyFilter(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${difficultyFilter === d ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted hover:text-text-secondary'}`}>
                    {d || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted mb-2">Equipment</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setEquipmentFilter('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${equipmentFilter === '' ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted'}`}>All</button>
                {equipmentTypes.map(eq => (
                  <button key={eq} onClick={() => setEquipmentFilter(eq)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${equipmentFilter === eq ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted'}`}>
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm text-text-muted">{filtered.length} exercises found</p>

      {/* Exercise grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((ex, i) => {
          const muscle = muscleGroups.find(m => m.id === ex.muscle)
          const exImage = getExerciseImage(ex.id) || muscle?.image
          return (
            <motion.button
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              onClick={() => setSelectedExercise(ex)}
              className="bg-surface rounded-2xl border border-surface-lighter p-4 text-left hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                  <img src={exImage} alt={ex.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{ex.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${difficultyColors[ex.difficulty]}`}>
                      {ex.difficulty}
                    </span>
                    <span className="text-xs text-text-muted">{muscle?.name}</span>
                    <span className="text-xs text-text-muted capitalize">- {ex.equipment}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 line-clamp-2">{ex.description}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Exercise detail modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-surface rounded-2xl border border-surface-lighter w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              {/* Exercise image header */}
              <div className="relative h-40 overflow-hidden rounded-t-2xl">
                <img
                  src={getExerciseImage(selectedExercise.id) || muscleGroups.find(m => m.id === selectedExercise.muscle)?.image}
                  alt={selectedExercise.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 -mt-6 relative">
                <h2 className="text-xl font-bold text-text-primary mb-3">{selectedExercise.name}</h2>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${difficultyColors[selectedExercise.difficulty]}`}>
                    {selectedExercise.difficulty}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-surface-lighter text-text-secondary capitalize">
                    {selectedExercise.equipment}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-surface-lighter text-text-secondary capitalize">
                    {selectedExercise.type}
                  </span>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-4">{selectedExercise.description}</p>

                {selectedExercise.secondary.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-text-muted mb-1">Also works</p>
                    <div className="flex gap-2">
                      {selectedExercise.secondary.map(s => (
                        <span key={s} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary-light capitalize">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-surface-light rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-accent mb-2">Pro Tips</p>
                  <ul className="space-y-1.5">
                    {selectedExercise.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-primary-light">·</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-surface-light rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    {profile?.weight ? 'Est. calories per set (10 reps)' : 'Est. calories per rep'}
                  </span>
                  <span className="text-sm font-bold text-accent">
                    {profile?.weight
                      ? `~${calculateCalories(selectedExercise.id, selectedExercise.type, profile.weight, 1, 10)} cal`
                      : `${selectedExercise.calories} cal`}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
