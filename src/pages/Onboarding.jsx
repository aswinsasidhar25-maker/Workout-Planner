import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, ChevronRight, ChevronLeft, Sparkles, Check, Clock, Calendar, Cloud, Ruler, Scale } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useGoogleAuth } from '../context/GoogleAuthContext'
import { goals, fitnessLevels, durationOptions, weekDays } from '../data/exercises'
import { lbsToKg, kgToLbs, ftInToCm, cmToFtIn, formatHeight, formatWeight } from '../utils/calories'

const steps = ['welcome', 'gender', 'body', 'goal', 'level', 'duration', 'days', 'ready']

export default function Onboarding() {
  const { dispatch } = useApp()
  const { signIn, isSignedIn, user, gisReady } = useGoogleAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ name: '', gender: '', goals: [], fitnessLevel: '', duration: 60, workoutDays: [], height: '', weight: '', units: { height: 'cm', weight: 'kg' } })
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')

  // Auto-fill name from Google account when user signs in
  useEffect(() => {
    if (isSignedIn && user?.name && !profile.name.trim()) {
      setProfile(p => ({ ...p, name: user.name }))
    }
  }, [isSignedIn, user])

  const currentStep = steps[step]
  const canProceed = () => {
    switch (currentStep) {
      case 'welcome': return profile.name.trim().length > 0
      case 'gender': return profile.gender !== ''
      case 'body': return true
      case 'goal': return profile.goals.length > 0
      case 'level': return profile.fitnessLevel !== ''
      case 'duration': return profile.duration > 0
      case 'days': return profile.workoutDays.length >= 3
      default: return true
    }
  }

  const toggleGoal = (goalId) => {
    setProfile(p => ({
      ...p,
      goals: p.goals.includes(goalId)
        ? p.goals.filter(id => id !== goalId)
        : [...p.goals, goalId],
    }))
  }

  const toggleDay = (day) => {
    setProfile(p => ({
      ...p,
      workoutDays: p.workoutDays.includes(day)
        ? p.workoutDays.filter(d => d !== day)
        : [...p.workoutDays, day],
    }))
  }

  const handleFinish = () => {
    // Sort workout days to match weekDays order
    const sortedDays = weekDays.filter(d => profile.workoutDays.includes(d))
    // Convert body measurements to metric for storage
    let heightCm = profile.height ? Number(profile.height) : null
    let weightKg = profile.weight ? Number(profile.weight) : null
    if (profile.units.height === 'ft' && (heightFt || heightIn)) {
      heightCm = ftInToCm(Number(heightFt) || 0, Number(heightIn) || 0)
    }
    if (profile.units.weight === 'lbs' && weightKg) {
      weightKg = lbsToKg(weightKg)
    }
    dispatch({ type: 'SET_PROFILE', payload: { ...profile, workoutDays: sortedDays, height: heightCm || null, weight: weightKg || null } })
    navigate('/')
  }

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? 'w-8 bg-primary-light' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-surface-lighter'
          }`} />
        ))}
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* WELCOME */}
            {currentStep === 'welcome' && (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center shadow-2xl shadow-primary/30"
                >
                  <Dumbbell className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-primary-light via-white to-accent bg-clip-text text-transparent">
                    Welcome to FitOne
                  </h1>
                  <p className="text-text-secondary mt-3 text-lg">Your personal workout companion.<br />Let's build your perfect training plan.</p>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="What's your name?"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-6 py-4 rounded-2xl bg-surface border border-surface-lighter text-text-primary text-center text-lg font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-text-muted transition-all"
                    autoFocus
                  />
                </div>
                {gisReady && (
                  <div className="pt-2">
                    {isSignedIn ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/20">
                        <Cloud className="w-4 h-4 text-success" />
                        <span className="text-sm text-success font-medium">Signed in as {user?.name || user?.email}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-px bg-surface-lighter" />
                          <span className="text-xs text-text-muted">or continue with</span>
                          <div className="flex-1 h-px bg-surface-lighter" />
                        </div>
                        <button
                          onClick={signIn}
                          type="button"
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
                        <p className="text-[10px] text-text-muted text-center mt-2">Sync your workouts across devices via Google Drive</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* GENDER */}
            {currentStep === 'gender' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-text-primary">Choose your profile</h2>
                  <p className="text-text-secondary mt-2">This helps us customize exercises for you</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'male', label: 'Male', desc: 'Optimized for male physiology', gradient: 'from-blue-500 to-indigo-600',
                      icon: (
                        <svg viewBox="0 0 64 64" className="w-10 h-10" fill="white">
                          <circle cx="32" cy="14" r="8" />
                          <path d="M22 28h20a4 4 0 014 4v14a2 2 0 01-2 2h-2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2V48h-2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2V48h-2a2 2 0 01-2-2V32a4 4 0 014-4z" />
                        </svg>
                      )
                    },
                    { id: 'female', label: 'Female', desc: 'Optimized for female physiology', gradient: 'from-pink-500 to-rose-600',
                      icon: (
                        <svg viewBox="0 0 64 64" className="w-10 h-10" fill="white">
                          <circle cx="32" cy="12" r="8" />
                          <path d="M26 26h12a3 3 0 013 3v4l2 14H21l2-14v-4a3 3 0 013-3z" />
                          <rect x="26" y="48" width="5" height="12" rx="2" />
                          <rect x="33" y="48" width="5" height="12" rx="2" />
                        </svg>
                      )
                    },
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setProfile(p => ({ ...p, gender: g.id }))}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-center ${
                        profile.gender === g.id
                          ? `border-primary bg-gradient-to-br ${g.gradient} shadow-xl shadow-primary/20 scale-105`
                          : 'border-surface-lighter bg-surface hover:border-primary/30'
                      }`}
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${g.gradient} flex items-center justify-center`}>
                        {g.icon}
                      </div>
                      <p className="font-bold text-lg text-text-primary">{g.label}</p>
                      <p className="text-xs text-text-secondary mt-1">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BODY MEASUREMENTS */}
            {currentStep === 'body' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-text-primary">Body Measurements</h2>
                  <p className="text-text-secondary mt-2">Helps us calculate accurate calorie burn</p>
                </div>

                {/* Height input */}
                <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-primary-light" />
                    </div>
                    <span className="font-bold text-text-primary">Height</span>
                    <span className="text-xs text-text-muted ml-auto">Optional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="170"
                      value={profile.height}
                      onChange={e => setProfile(p => ({ ...p, height: e.target.value }))}
                      className="flex-1 px-4 py-3 rounded-xl bg-surface-light border border-surface-lighter text-text-primary text-center font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-text-muted"
                    />
                    <span className="text-sm text-text-muted w-8">cm</span>
                  </div>
                </div>

                {/* Weight input */}
                <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-bold text-text-primary">Weight</span>
                    <span className="text-xs text-text-muted ml-auto">Optional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="70"
                      value={profile.weight}
                      onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))}
                      className="flex-1 px-4 py-3 rounded-xl bg-surface-light border border-surface-lighter text-text-primary text-center font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder-text-muted"
                    />
                    <span className="text-sm text-text-muted w-8">kg</span>
                  </div>
                </div>

                <p className="text-center text-xs text-text-muted">You can skip this and set it later in your profile</p>
              </div>
            )}

            {/* GOAL - MULTI SELECT */}
            {currentStep === 'goal' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-text-primary">What are your goals?</h2>
                  <p className="text-text-secondary mt-2">Select one or more — we'll blend your plan</p>
                </div>
                <div className="space-y-3">
                  {goals.map(g => {
                    const selected = profile.goals.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 text-left ${
                          selected
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                            : 'border-surface-lighter bg-surface hover:border-primary/30'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-lg">
                          <img src={g.image} alt={g.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-text-primary">{g.name}</p>
                          <p className="text-sm text-text-secondary">{g.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected ? 'bg-primary border-primary' : 'border-surface-lighter'
                        }`}>
                          {selected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {profile.goals.length > 0 && (
                  <p className="text-center text-sm text-primary-light">
                    {profile.goals.length} goal{profile.goals.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            {/* LEVEL */}
            {currentStep === 'level' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-text-primary">Fitness Level</h2>
                  <p className="text-text-secondary mt-2">Be honest — we'll scale everything for you</p>
                </div>
                <div className="space-y-3">
                  {fitnessLevels.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setProfile(p => ({ ...p, fitnessLevel: l.id }))}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                        profile.fitnessLevel === l.id
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                          : 'border-surface-lighter bg-surface hover:border-primary/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-lg text-text-primary">{l.name}</p>
                        <span className="text-xs px-3 py-1 rounded-full bg-surface-lighter text-text-muted">{l.months}</span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{l.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DURATION */}
            {currentStep === 'duration' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-text-primary">Workout Duration</h2>
                  <p className="text-text-secondary mt-2">How long do you want each session to be?</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {durationOptions.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setProfile(p => ({ ...p, duration: d.id }))}
                      className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
                        profile.duration === d.id
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-105'
                          : 'border-surface-lighter bg-surface hover:border-primary/30'
                      }`}
                    >
                      <Clock className={`w-6 h-6 mx-auto mb-2 ${profile.duration === d.id ? 'text-primary-light' : 'text-text-muted'}`} />
                      <p className="text-2xl font-black text-text-primary">{d.label}</p>
                      <p className="text-xs text-text-secondary mt-1">{d.description}</p>
                      <p className="text-xs text-text-muted mt-2">{d.exercisesPerSession} exercises/day</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WORKOUT DAYS */}
            {currentStep === 'days' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-text-primary">Training Days</h2>
                  <p className="text-text-secondary mt-2">Which days do you want to work out? (min 3)</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {weekDays.map(day => {
                    const selected = profile.workoutDays.includes(day)
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                          selected
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                            : 'border-surface-lighter bg-surface hover:border-primary/30'
                        }`}
                      >
                        <Calendar className={`w-5 h-5 mx-auto mb-2 ${selected ? 'text-primary-light' : 'text-text-muted'}`} />
                        <p className="font-bold text-text-primary">{day}</p>
                        <p className="text-xs text-text-muted mt-1">{selected ? 'Training' : 'Rest'}</p>
                      </button>
                    )
                  })}
                </div>
                <p className="text-center text-sm text-primary-light">
                  {profile.workoutDays.length} day{profile.workoutDays.length !== 1 ? 's' : ''} selected
                  {profile.workoutDays.length > 0 && ` · ${7 - profile.workoutDays.length} rest day${7 - profile.workoutDays.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}

            {/* READY */}
            {currentStep === 'ready' && (
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center shadow-2xl shadow-primary/40"
                >
                  <Sparkles className="w-14 h-14 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-4xl font-black text-text-primary">You're all set, {profile.name}!</h2>
                  <p className="text-text-secondary mt-3 text-lg">Your personalized workout plan is ready.</p>
                </div>
                <div className="bg-surface rounded-2xl p-6 space-y-3 border border-surface-lighter">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Profile</span>
                    <span className="text-text-primary font-medium capitalize">{profile.gender}</span>
                  </div>
                  {(profile.height || (heightFt || heightIn)) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Height</span>
                      <span className="text-text-primary font-medium">
                        {profile.units.height === 'ft'
                          ? `${heightFt || 0}'${heightIn || 0}"`
                          : `${profile.height} cm`}
                      </span>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Weight</span>
                      <span className="text-text-primary font-medium">{profile.weight} {profile.units.weight}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-start">
                    <span className="text-text-muted">Goals</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {profile.goals.map(gId => {
                        const g = goals.find(gl => gl.id === gId)
                        return (
                          <span key={gId} className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-light">
                            {g?.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Level</span>
                    <span className="text-text-primary font-medium capitalize">{profile.fitnessLevel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Duration</span>
                    <span className="text-text-primary font-medium">{profile.duration} min/session</span>
                  </div>
                  <div className="flex justify-between text-sm items-start">
                    <span className="text-text-muted">Training</span>
                    <span className="text-text-primary font-medium text-right">
                      {profile.workoutDays.length} days/week
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFinish}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-xl shadow-primary/30 pulse-glow"
                >
                  Let's Go!
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {currentStep !== 'ready' && (
        <div className="flex gap-4 mt-8 w-full max-w-lg">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-surface-lighter text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 ${
              canProceed()
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/20 hover:shadow-xl'
                : 'bg-surface-lighter text-text-muted cursor-not-allowed'
            }`}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
