import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Target, TrendingUp, ChevronRight, Dumbbell, Zap, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { goals, weekDays, exercises, motivationalQuotes, durationOptions } from '../data/exercises'

export default function Dashboard() {
  const { state } = useApp()
  const { profile, workoutPlan, workoutLog } = state

  const today = weekDays[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const todayPlan = workoutPlan[today]
  const goalConfigs = goals.filter(g => profile.goals.includes(g.id))
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
          const completedCount = planEx.completed.filter(Boolean).length
          return sum + (ex ? ex.calories * completedCount * planEx.reps : 0)
        }, 0)
      : 0

    return { totalWorkouts, thisWeek, totalSetsCompleted, totalSets, todayCalories }
  }, [workoutLog, todayPlan])

  const quote = useMemo(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)], [])

  const todayProgress = stats.totalSets > 0 ? Math.round((stats.totalSetsCompleted / stats.totalSets) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-black text-text-primary">
          Hey, {profile.name}!
        </h1>
        <p className="text-text-secondary mt-1">Let's crush today's workout.</p>
      </div>

      {/* Motivational quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-surface to-accent/10 rounded-2xl p-5 border border-primary/20"
      >
        <p className="text-sm text-text-secondary italic">"{quote}"</p>
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
              <p className="text-4xl mb-3">🧘</p>
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
                <p className="text-lg mt-1">{isRest ? '😴' : '🏋️'}</p>
                <p className="text-[10px] text-text-muted mt-1 truncate">{plan?.name || '-'}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Goals info - scrollable cards for multiple goals */}
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-3">Your Goals</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {goalConfigs.map(gc => (
            <div key={gc.id} className={`bg-gradient-to-br ${gc.color} rounded-2xl p-5 text-white shrink-0 ${goalConfigs.length === 1 ? 'w-full' : 'w-72'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{gc.icon}</span>
                <div>
                  <p className="font-bold text-lg">{gc.name}</p>
                  <p className="text-sm opacity-80">{gc.description}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-xs opacity-70">Sets</p>
                  <p className="font-bold">{gc.setsRange.join('-')}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-xs opacity-70">Reps</p>
                  <p className="font-bold">{gc.repsRange.join('-')}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-xs opacity-70">Rest</p>
                  <p className="font-bold">{gc.restSeconds}s</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
