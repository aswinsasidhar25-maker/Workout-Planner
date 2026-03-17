import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, LogOut, RefreshCw, CheckCircle2, Check, Clock, Calendar, Dumbbell, Camera } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { goals, fitnessLevels, durationOptions, weekDays } from '../data/exercises'
import { useNavigate } from 'react-router-dom'

const ACCEPTED_IMAGE_TYPES = 'image/webp,image/avif,image/jpeg,image/png'

export default function Profile() {
  const { state, dispatch } = useApp()
  const { profile, profileImage } = state
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [imageError, setImageError] = useState('')
  const [showGoalChange, setShowGoalChange] = useState(false)
  const [showLevelChange, setShowLevelChange] = useState(false)
  const [showDurationChange, setShowDurationChange] = useState(false)
  const [showDaysChange, setShowDaysChange] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const goalConfigs = goals.filter(g => (profile.goals || []).includes(g.id))
  const durationConfig = durationOptions.find(d => d.id === profile.duration)

  const handleGoalToggle = (goalId) => {
    const currentGoals = profile.goals || []
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(id => id !== goalId)
      : [...currentGoals, goalId]
    if (newGoals.length === 0) return
    dispatch({ type: 'SET_PROFILE', payload: { ...profile, goals: newGoals } })
  }

  const handleLevelChange = (levelId) => {
    dispatch({ type: 'SET_PROFILE', payload: { ...profile, fitnessLevel: levelId } })
    setShowLevelChange(false)
  }

  const handleDurationChange = (durationId) => {
    dispatch({ type: 'SET_PROFILE', payload: { ...profile, duration: durationId } })
    setShowDurationChange(false)
  }

  const handleDayToggle = (day) => {
    const currentDays = profile.workoutDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    if (newDays.length < 3) return
    const sorted = weekDays.filter(d => newDays.includes(d))
    dispatch({ type: 'SET_PROFILE', payload: { ...profile, workoutDays: sorted } })
  }

  const handleReset = () => {
    dispatch({ type: 'RESET_PROFILE' })
    localStorage.removeItem('zenfit-state')
    navigate('/')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/webp', 'image/avif', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      setImageError('Only WebP, AVIF, JPEG, and PNG images are supported.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be under 5 MB.')
      return
    }
    setImageError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      dispatch({ type: 'SET_PROFILE_IMAGE', payload: ev.target.result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary">Manage your settings and preferences</p>
      </div>

      {/* Avatar & Name */}
      <div className="bg-surface rounded-2xl border border-surface-lighter p-6 flex items-center gap-4">
        <div className="relative shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
              profile.gender === 'male' ? 'from-blue-500 to-indigo-600' : 'from-pink-500 to-rose-600'
            } flex items-center justify-center shadow-lg`}>
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
            title="Upload photo"
          >
            <Camera className="w-3 h-3 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
          <p className="text-sm text-text-secondary capitalize">{profile.gender} - {profile.fitnessLevel} - {durationConfig?.label}</p>
          {imageError && <p className="text-xs text-danger mt-1">{imageError}</p>}
        </div>
      </div>

      {/* Current goals */}
      <div className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {goalConfigs.slice(0, 3).map(gc => (
                <div key={gc.id} className="w-10 h-10 rounded-xl overflow-hidden border-2 border-surface">
                  <img src={gc.image} alt={gc.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-text-muted">Goals ({goalConfigs.length})</p>
              <p className="font-bold text-text-primary text-sm">{goalConfigs.map(g => g.name).join(', ')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowGoalChange(!showGoalChange)}
            className="text-sm text-primary-light hover:text-primary transition-colors"
          >
            Edit
          </button>
        </div>

        {showGoalChange && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="overflow-hidden border-t border-surface-lighter"
          >
            <div className="p-4 space-y-2">
              {goals.map(g => {
                const selected = (profile.goals || []).includes(g.id)
                return (
                  <button
                    key={g.id}
                    onClick={() => handleGoalToggle(g.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                      selected ? 'bg-primary/10 border border-primary' : 'bg-surface-light border border-transparent hover:border-primary/30'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{g.name}</p>
                      <p className="text-xs text-text-muted">{g.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selected ? 'bg-primary border-primary' : 'border-surface-lighter'
                    }`}>
                      {selected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                )
              })}
              <p className="text-xs text-text-muted text-center mt-2">Changing goals will regenerate your workout plan</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Training Days */}
      <div className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Training Days</p>
              <p className="font-bold text-text-primary">{(profile.workoutDays || []).length} days/week</p>
            </div>
          </div>
          <button
            onClick={() => setShowDaysChange(!showDaysChange)}
            className="text-sm text-primary-light hover:text-primary transition-colors"
          >
            Change
          </button>
        </div>

        {showDaysChange && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="overflow-hidden border-t border-surface-lighter"
          >
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {weekDays.map(day => {
                  const selected = (profile.workoutDays || []).includes(day)
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                        selected ? 'bg-primary/10 border border-primary' : 'bg-surface-light border border-transparent hover:border-primary/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selected ? 'bg-primary border-primary' : 'border-surface-lighter'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{day}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-text-muted text-center mt-3">Minimum 3 days required. Changes regenerate your plan.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Workout Duration */}
      <div className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Session Duration</p>
              <p className="font-bold text-text-primary">{durationConfig?.label} ({durationConfig?.exercisesPerSession} exercises)</p>
            </div>
          </div>
          <button
            onClick={() => setShowDurationChange(!showDurationChange)}
            className="text-sm text-primary-light hover:text-primary transition-colors"
          >
            Change
          </button>
        </div>

        {showDurationChange && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="overflow-hidden border-t border-surface-lighter"
          >
            <div className="p-4 grid grid-cols-2 gap-2">
              {durationOptions.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleDurationChange(d.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    profile.duration === d.id ? 'bg-primary/10 border-2 border-primary' : 'bg-surface-light border-2 border-transparent hover:border-primary/30'
                  }`}
                >
                  <p className="font-bold text-text-primary">{d.label}</p>
                  <p className="text-xs text-text-muted">{d.exercisesPerSession} exercises</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fitness level */}
      <div className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Fitness Level</p>
              <p className="font-bold text-text-primary capitalize">{profile.fitnessLevel}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLevelChange(!showLevelChange)}
            className="text-sm text-primary-light hover:text-primary transition-colors"
          >
            Change
          </button>
        </div>

        {showLevelChange && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="overflow-hidden border-t border-surface-lighter"
          >
            <div className="p-4 space-y-2">
              {fitnessLevels.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleLevelChange(l.id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                    profile.fitnessLevel === l.id ? 'bg-primary/10 border border-primary' : 'bg-surface-light border border-transparent hover:border-primary/30'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{l.name}</p>
                    <p className="text-xs text-text-muted">{l.description}</p>
                  </div>
                  {profile.fitnessLevel === l.id && <CheckCircle2 className="w-5 h-5 text-primary-light ml-auto" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Regenerate plan */}
      <button
        onClick={() => dispatch({ type: 'REGENERATE_PLAN' })}
        className="w-full bg-surface rounded-2xl border border-surface-lighter p-5 flex items-center gap-3 hover:border-primary/30 transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-primary-light" />
        </div>
        <div className="text-left">
          <p className="font-bold text-text-primary">Regenerate Workout Plan</p>
          <p className="text-xs text-text-muted">Get a fresh set of exercises based on your current settings</p>
        </div>
      </button>

      {/* Reset */}
      <div className="bg-surface rounded-2xl border border-danger/20 p-5">
        <div className="flex items-center gap-3 mb-3">
          <LogOut className="w-5 h-5 text-danger" />
          <p className="font-bold text-text-primary">Reset Everything</p>
        </div>
        <p className="text-sm text-text-secondary mb-4">This will delete all your data and take you back to the setup screen.</p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-6 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors"
          >
            Reset
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded-xl bg-danger text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-6 py-2 rounded-xl bg-surface-lighter text-text-secondary text-sm font-medium hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
