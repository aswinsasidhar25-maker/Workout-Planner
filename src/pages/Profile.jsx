import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, LogOut, RefreshCw, CheckCircle2, Check, Clock, Calendar, Dumbbell, Cloud, CloudUpload, CloudOff, Ruler, Scale } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useGoogleAuth } from '../context/GoogleAuthContext'
import { goals, fitnessLevels, durationOptions, weekDays } from '../data/exercises'
import { useNavigate } from 'react-router-dom'
import { lbsToKg, kgToLbs, ftInToCm, cmToFtIn, formatHeight, formatWeight } from '../utils/calories'

export default function Profile() {
  const { state, dispatch, syncNow } = useApp()
  const { profile } = state
  const { user, isSignedIn, syncStatus, signIn, signOut, gisReady } = useGoogleAuth()
  const navigate = useNavigate()
  const [showGoalChange, setShowGoalChange] = useState(false)
  const [showLevelChange, setShowLevelChange] = useState(false)
  const [showDurationChange, setShowDurationChange] = useState(false)
  const [showDaysChange, setShowDaysChange] = useState(false)
  const [showBodyEdit, setShowBodyEdit] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [bodyUnits, setBodyUnits] = useState(profile.units || { height: 'cm', weight: 'kg' })
  const [bodyHeight, setBodyHeight] = useState(
    profile.height && profile.units?.height === 'cm' ? String(profile.height) : ''
  )
  const [bodyHeightFt, setBodyHeightFt] = useState(
    profile.height && profile.units?.height === 'ft' ? String(cmToFtIn(profile.height).ft) : ''
  )
  const [bodyHeightIn, setBodyHeightIn] = useState(
    profile.height && profile.units?.height === 'ft' ? String(cmToFtIn(profile.height).in) : ''
  )
  const [bodyWeight, setBodyWeight] = useState(
    profile.weight ? (profile.units?.weight === 'lbs' ? String(kgToLbs(profile.weight)) : String(profile.weight)) : ''
  )

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
    localStorage.removeItem('onefit-state')
    navigate('/')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary">Manage your settings and preferences</p>
      </div>

      {/* Avatar & Name */}
      <div className="bg-surface rounded-2xl border border-surface-lighter p-6 flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
          profile.gender === 'male' ? 'from-blue-500 to-indigo-600' : 'from-pink-500 to-rose-600'
        } flex items-center justify-center shadow-lg`}>
          <Dumbbell className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
          <p className="text-sm text-text-secondary capitalize">{profile.gender} - {profile.fitnessLevel} - {durationConfig?.label}</p>
        </div>
      </div>

      {/* Cloud Sync */}
      {gisReady && (
        <div className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden">
          <div className="p-5">
            {isSignedIn ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-12 h-12 rounded-xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Cloud className="w-6 h-6 text-primary-light" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary truncate">{user?.name || 'Google Account'}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {syncStatus === 'syncing' && <CloudUpload className="w-4 h-4 text-primary-light animate-pulse" />}
                    {syncStatus === 'synced' && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {syncStatus === 'error' && <CloudOff className="w-4 h-4 text-danger" />}
                    {syncStatus === 'idle' && <Cloud className="w-4 h-4 text-text-muted" />}
                    <span className="text-[10px] text-text-muted capitalize">{syncStatus}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={syncNow}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary/10 text-primary-light text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Sync Now
                  </button>
                  <button
                    onClick={signOut}
                    className="px-4 py-2.5 rounded-xl bg-surface-lighter text-text-secondary text-sm font-medium hover:text-text-primary transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Cloud className="w-7 h-7 text-primary-light" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Cloud Sync</p>
                  <p className="text-xs text-text-secondary mt-1">Sign in with Google to back up your workouts to Google Drive. Your data stays in your own Drive.</p>
                </div>
                <button
                  onClick={signIn}
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 border border-gray-200"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body Measurements */}
      <div className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Ruler className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Body Measurements</p>
              <p className="font-bold text-text-primary">
                {profile.height && profile.weight
                  ? `${formatHeight(profile.height, profile.units?.height || 'cm')} · ${formatWeight(profile.weight, profile.units?.weight || 'kg')}`
                  : profile.height
                    ? formatHeight(profile.height, profile.units?.height || 'cm')
                    : profile.weight
                      ? formatWeight(profile.weight, profile.units?.weight || 'kg')
                      : 'Not set'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBodyEdit(!showBodyEdit)}
            className="text-sm text-primary-light hover:text-primary transition-colors"
          >
            {showBodyEdit ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {showBodyEdit && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="overflow-hidden border-t border-surface-lighter"
          >
            <div className="p-4 space-y-4">
              {/* Height */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Height</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="170" value={bodyHeight}
                    onChange={e => setBodyHeight(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-light border border-surface-lighter text-text-primary font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-text-muted"
                  />
                  <span className="text-sm text-text-muted w-8">cm</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Weight</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="70" value={bodyWeight}
                    onChange={e => setBodyWeight(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-light border border-surface-lighter text-text-primary font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-text-muted"
                  />
                  <span className="text-sm text-text-muted w-8">kg</span>
                </div>
              </div>

              <button
                onClick={() => {
                  let heightCm = bodyUnits.height === 'cm'
                    ? (bodyHeight ? Number(bodyHeight) : null)
                    : (bodyHeightFt || bodyHeightIn ? ftInToCm(Number(bodyHeightFt) || 0, Number(bodyHeightIn) || 0) : null)
                  let weightKg = bodyWeight ? Number(bodyWeight) : null
                  if (bodyUnits.weight === 'lbs' && weightKg) weightKg = lbsToKg(weightKg)
                  dispatch({ type: 'SET_PROFILE', payload: { ...profile, height: heightCm, weight: weightKg, units: bodyUnits } })
                  setShowBodyEdit(false)
                }}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Weight Tracker toggle */}
      {!(profile.goals || []).includes('lose_weight') && (
        <div className="bg-surface rounded-2xl border border-surface-lighter p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-text-primary">Weight Tracker</p>
              <p className="text-xs text-text-muted">Track your weight over time</p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_WEIGHT_TRACKER' })}
            className={`w-12 h-7 rounded-full transition-all relative ${
              state.weightTrackerEnabled ? 'bg-primary' : 'bg-surface-lighter'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              state.weightTrackerEnabled ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>
      )}

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
