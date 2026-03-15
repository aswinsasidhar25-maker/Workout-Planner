import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, ChevronRight, ChevronLeft, Sparkles, Check, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { goals, fitnessLevels, durationOptions } from '../data/exercises'

const steps = ['welcome', 'gender', 'goal', 'level', 'duration', 'ready']

export default function Onboarding() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ name: '', gender: '', goals: [], fitnessLevel: '', duration: 60 })

  const currentStep = steps[step]
  const canProceed = () => {
    switch (currentStep) {
      case 'welcome': return profile.name.trim().length > 0
      case 'gender': return profile.gender !== ''
      case 'goal': return profile.goals.length > 0
      case 'level': return profile.fitnessLevel !== ''
      case 'duration': return profile.duration > 0
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

  const handleFinish = () => {
    dispatch({ type: 'SET_PROFILE', payload: profile })
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
                    Welcome to ZenFit
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
                    { id: 'male', label: 'Male', emoji: '🙋‍♂️', desc: 'Optimized for male physiology', gradient: 'from-blue-500 to-indigo-600' },
                    { id: 'female', label: 'Female', emoji: '🙋‍♀️', desc: 'Optimized for female physiology', gradient: 'from-pink-500 to-rose-600' },
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
                      <div className="text-5xl mb-3">{g.emoji}</div>
                      <p className="font-bold text-lg text-text-primary">{g.label}</p>
                      <p className="text-xs text-text-secondary mt-1">{g.desc}</p>
                    </button>
                  ))}
                </div>
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
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {g.icon}
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
                  <div className="flex justify-between text-sm items-start">
                    <span className="text-text-muted">Goals</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {profile.goals.map(gId => {
                        const g = goals.find(gl => gl.id === gId)
                        return (
                          <span key={gId} className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary-light">
                            {g?.icon} {g?.name}
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
