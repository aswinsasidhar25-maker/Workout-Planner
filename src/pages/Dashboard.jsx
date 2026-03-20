import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Target, TrendingUp, Calendar, ChevronRight, Dumbbell, Clock, Zap, Award, X, Trophy, Star, Medal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { goals, weekDays, exercises, durationOptions, badgeDefinitions } from '../data/exercises'
import { calculateCalories } from '../utils/calories'

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const { profile, workoutPlan, workoutLog } = state

  const today = weekDays[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const todayPlan = workoutPlan[today]
  const goalConfigs = goals.filter(g => (profile.goals || []).includes(g.id))
  const durationConfig = durationOptions.find(d => d.id === profile.duration)

  const stats = useMemo(() => {
    const logEntries = Object.values(workoutLog).flat()
    const totalWorkouts = logEntries.length
    const thisWeek = logEntries.filter(e => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      return e.timestamp > weekAgo
    }).length

    let totalSetsCompleted = 0
    if (todayPlan && !todayPlan.isRest) {
      todayPlan.exercises.forEach(ex => {
        totalSetsCompleted += ex.completed.filter(Boolean).length
      })
    }

    const totalSets = todayPlan && !todayPlan.isRest
      ? todayPlan.exercises.reduce((sum, ex) => sum + ex.sets, 0)
      : 0

    const todayCalories = todayPlan && !todayPlan.isRest
      ? todayPlan.exercises.reduce((sum, planEx) => {
          const ex = exercises.find(e => e.id === planEx.exerciseId)
          if (!ex) return sum
          const completedCount = planEx.completed.filter(Boolean).length
          if (profile.weight) {
            return sum + calculateCalories(ex.id, ex.type, profile.weight, completedCount, planEx.reps)
          }
          return sum + (ex.calories * completedCount * planEx.reps)
        }, 0)
      : 0

    return { totalWorkouts, thisWeek, totalSetsCompleted, totalSets, todayCalories }
  }, [workoutLog, todayPlan])

  const todayProgress = stats.totalSets > 0 ? Math.round((stats.totalSetsCompleted / stats.totalSets) * 100) : 0

  const streak = state.streak || { current: 0, longest: 0 }
  const unlockedBadges = state.unlockedBadges || []
  const newBadge = state.newBadge
  const newBadgeDef = newBadge ? badgeDefinitions.find(b => b.id === newBadge) : null

  const badgeIcons = {
    first_workout: <Star className="w-6 h-6" />,
    three_workouts: <Flame className="w-6 h-6" />,
    ten_workouts: <Trophy className="w-6 h-6" />,
    twentyfive_workouts: <Award className="w-6 h-6" />,
    streak_3: <Zap className="w-6 h-6" />,
    streak_7: <Medal className="w-6 h-6" />,
    five_days: <Calendar className="w-6 h-6" />,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Badge unlock toast */}
      <AnimatePresence>
        {newBadgeDef && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-surface border border-accent/40 rounded-2xl p-5 shadow-2xl shadow-accent/20 flex items-center gap-4 max-w-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              {badgeIcons[newBadgeDef.id] || <Award className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className="text-xs text-accent font-semibold uppercase tracking-wider">Badge Unlocked!</p>
              <p className="text-lg font-bold text-text-primary">{newBadgeDef.name}</p>
              <p className="text-xs text-text-secondary">{newBadgeDef.description}</p>
            </div>
            <button onClick={() => dispatch({ type: 'DISMISS_BADGE' })} className="text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black text-text-primary">
          Hey, {profile.name}!
        </h1>
      </div>

      {/* Streak tracker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-5 py-4"
      >
        <Flame className={`w-7 h-7 ${streak.current > 0 ? 'text-orange-400' : 'text-text-muted'}`} />
        {streak.current > 0 ? (
          <>
            <span className="text-3xl font-black text-orange-400">{streak.current}</span>
            <span className="text-sm text-text-secondary">day streak</span>
            {streak.current >= streak.longest && streak.current > 1 && (
              <span className="ml-auto text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-medium">Personal best!</span>
            )}
          </>
        ) : (
          <span className="text-sm text-text-secondary">Start your streak today — log a workout!</span>
        )}
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: 'Calories', value: stats.todayCalories, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: Target, label: 'Sets Done', value: `${stats.totalSetsCompleted}/${stats.totalSets}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: TrendingUp, label: 'This Week', value: stats.thisWeek, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { icon: Zap, label: 'Total', value: stats.totalWorkouts, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface rounded-2xl p-4 border border-surface-lighter"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements/Badges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold text-text-primary">Achievements</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {badgeDefinitions.map(badge => {
            const isUnlocked = unlockedBadges.includes(badge.id)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-3 text-center border transition-all ${
                  isUnlocked
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-surface border-surface-lighter opacity-50'
                }`}
              >
                <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1 ${isUnlocked ? 'text-accent' : 'text-text-muted'}`}>
                  {badgeIcons[badge.id] || <Award className="w-5 h-5" />}
                </div>
                <p className={`text-xs font-semibold mt-1 ${isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>{badge.name}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{badge.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Today's workout */}
      <div className="bg-surface rounded-2xl border border-surface-lighter overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-light font-semibold uppercase tracking-wider">{today}</p>
            <h2 className="text-xl font-bold text-text-primary mt-1">{todayPlan?.name || 'No Plan'}</h2>
            {durationConfig && (
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {durationConfig.label} session
              </p>
            )}
          </div>
          {todayPlan && !todayPlan.isRest && (
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-lighter" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="url(#progress-gradient)" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - todayProgress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
                {todayProgress}%
              </span>
            </div>
          )}
        </div>

        {todayPlan && !todayPlan.isRest ? (
          <>
            <div className="px-5 pb-3 space-y-2">
              {todayPlan.exercises.slice(0, 4).map((planEx, i) => {
                const ex = exercises.find(e => e.id === planEx.exerciseId)
                if (!ex) return null
                const done = planEx.completed.filter(Boolean).length
                return (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className={`w-2 h-2 rounded-full ${done === planEx.sets ? 'bg-success' : done > 0 ? 'bg-warning' : 'bg-surface-lighter'}`} />
                    <span className="text-sm text-text-primary flex-1">{ex.name}</span>
                    <span className="text-xs text-text-muted">{planEx.sets}x{planEx.reps}</span>
                  </div>
                )
              })}
              {todayPlan.exercises.length > 4 && (
                <p className="text-xs text-text-muted">+{todayPlan.exercises.length - 4} more exercises</p>
              )}
            </div>
            <Link
              to="/plan"
              className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:from-primary-dark hover:to-primary transition-all"
            >
              <Dumbbell className="w-5 h-5" /> Start Workout <ChevronRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <div className="px-5 pb-5">
            <div className="bg-surface-light rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-primary-light" />
              </div>
              <p className="text-text-secondary">Rest day — recover and come back stronger!</p>
            </div>
          </div>
        )}
      </div>

      {/* Weekly overview */}
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-3">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const plan = workoutPlan[day]
            const isToday = day === today
            const isRest = plan?.isRest
            return (
              <Link
                key={day}
                to="/plan"
                className={`rounded-xl p-3 text-center transition-all border ${
                  isToday
                    ? 'bg-primary/20 border-primary'
                    : 'bg-surface border-surface-lighter hover:border-primary/30'
                }`}
              >
                <p className="text-xs font-medium text-text-muted">{day.slice(0, 3)}</p>
                <div className={`w-8 h-8 mx-auto mt-1 rounded-lg flex items-center justify-center ${isRest ? 'bg-surface-lighter' : 'bg-primary/10'}`}>
                  {isRest ? <Calendar className="w-4 h-4 text-text-muted" /> : <Dumbbell className="w-4 h-4 text-primary-light" />}
                </div>
                <p className="text-[10px] text-text-muted mt-1 truncate">{plan?.name || '-'}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Goals info */}
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-3">Your Goals</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {goalConfigs.map(gc => (
            <div key={gc.id} className={`rounded-2xl overflow-hidden shrink-0 ${goalConfigs.length === 1 ? 'w-full' : 'w-72'}`}>
              <div className="relative h-32">
                <img src={gc.image} alt={gc.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="font-bold text-lg text-white">{gc.name}</p>
                  <p className="text-sm text-white/70">{gc.description}</p>
                </div>
              </div>
              <div className={`bg-gradient-to-r ${gc.color} p-3 flex gap-3`}>
                <div className="bg-white/10 rounded-xl px-3 py-2 flex-1 text-center">
                  <p className="text-xs text-white/70">Sets</p>
                  <p className="font-bold text-white">{gc.setsRange.join('-')}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2 flex-1 text-center">
                  <p className="text-xs text-white/70">Reps</p>
                  <p className="font-bold text-white">{gc.repsRange.join('-')}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2 flex-1 text-center">
                  <p className="text-xs text-white/70">Rest</p>
                  <p className="font-bold text-white">{gc.restSeconds}s</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
