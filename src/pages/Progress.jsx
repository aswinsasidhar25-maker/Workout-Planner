import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine } from 'recharts'
import { TrendingUp, Flame, Dumbbell, Calendar, Award, Target, Scale, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { exercises, muscleGroups } from '../data/exercises'
import { calculateCalories, kgToLbs, lbsToKg, formatWeight } from '../utils/calories'

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#84cc16', '#14b8a6']

export default function Progress() {
  const { state, dispatch } = useApp()
  const { workoutLog, weightLog, weightGoal, profile } = state
  const showWeightTracker = state.weightTrackerEnabled || (profile?.goals || []).includes('lose_weight')

  const [calorieView, setCalorieView] = useState('daily')
  const [weightInput, setWeightInput] = useState('')
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0])
  const [goalWeight, setGoalWeight] = useState('')
  const [goalType, setGoalType] = useState('lose')
  const [showGoalForm, setShowGoalForm] = useState(false)

  const weightUnit = profile?.units?.weight || 'kg'

  const analytics = useMemo(() => {
    const entries = Object.entries(workoutLog)
    const allLogs = entries.flatMap(([date, logs]) => logs.map(l => ({ ...l, date })))

    // Weekly workout counts (last 8 weeks)
    const weeklyData = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const count = allLogs.filter(l => {
        const d = new Date(l.date)
        return d >= weekStart && d < weekEnd
      }).length

      weeklyData.push({
        week: `W${8 - i}`,
        workouts: count,
      })
    }

    // Muscle distribution
    const muscleCount = {}
    allLogs.forEach(log => {
      log.exercises?.forEach(ex => {
        const exercise = exercises.find(e => e.id === ex.exerciseId)
        if (exercise) {
          const name = muscleGroups.find(m => m.id === exercise.muscle)?.name || exercise.muscle
          muscleCount[name] = (muscleCount[name] || 0) + (ex.completedSets || 0)
        }
      })
    })
    const muscleDistribution = Object.entries(muscleCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Total stats
    const totalWorkouts = allLogs.length
    let totalSets = 0
    let totalReps = 0
    let totalCalories = 0
    let totalWeight = 0

    allLogs.forEach(log => {
      log.exercises?.forEach(ex => {
        const exercise = exercises.find(e => e.id === ex.exerciseId)
        const sets = ex.completedSets || 0
        totalSets += sets
        totalReps += sets * (ex.reps || 0)
        totalWeight += (ex.weight || 0) * sets * (ex.reps || 0)
        if (exercise) {
          if (profile?.weight) {
            totalCalories += calculateCalories(exercise.id, exercise.type, profile.weight, sets, ex.reps || 0)
          } else {
            totalCalories += exercise.calories * sets * (ex.reps || 0)
          }
        }
      })
    })

    // Volume over time
    const volumeByDate = {}
    allLogs.forEach(log => {
      const date = log.date
      if (!volumeByDate[date]) volumeByDate[date] = 0
      log.exercises?.forEach(ex => {
        volumeByDate[date] += (ex.weight || 0) * (ex.completedSets || 0) * (ex.reps || 0)
      })
    })
    const volumeData = Object.entries(volumeByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, volume]) => ({ date: date.slice(5), volume: Math.round(volume) }))

    // Daily calorie data (last 14 days)
    const dailyCalories = {}
    allLogs.forEach(log => {
      const date = log.date
      if (!dailyCalories[date]) dailyCalories[date] = 0
      log.exercises?.forEach(ex => {
        const exercise = exercises.find(e => e.id === ex.exerciseId)
        if (exercise) {
          if (profile?.weight) {
            dailyCalories[date] += calculateCalories(exercise.id, exercise.type, profile.weight, ex.completedSets || 0, ex.reps || 0)
          } else {
            dailyCalories[date] += exercise.calories * (ex.completedSets || 0) * (ex.reps || 0)
          }
        }
      })
    })
    const dailyCalorieData = Object.entries(dailyCalories)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, cals]) => ({ date: date.slice(5), calories: Math.round(cals) }))

    // Weekly calorie data (last 8 weeks)
    const weeklyCalorieData = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      let weekCals = 0
      Object.entries(dailyCalories).forEach(([date, cals]) => {
        const d = new Date(date)
        if (d >= weekStart && d < weekEnd) weekCals += cals
      })

      weeklyCalorieData.push({
        week: `W${8 - i}`,
        calories: Math.round(weekCals),
      })
    }

    // Streak
    let streak = 0
    const sortedDates = [...new Set(allLogs.map(l => l.date))].sort().reverse()
    if (sortedDates.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      let checkDate = today
      for (const date of sortedDates) {
        if (date === checkDate || date === getPreviousDate(checkDate)) {
          streak++
          checkDate = date
        } else {
          break
        }
      }
    }

    return { weeklyData, muscleDistribution, totalWorkouts, totalSets, totalReps, totalCalories, totalWeight, volumeData, streak, dailyCalorieData, weeklyCalorieData }
  }, [workoutLog, profile?.weight])

  const weightData = useMemo(() => {
    return Object.entries(weightLog || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entry]) => ({
        date: date.slice(5),
        fullDate: date,
        weight: weightUnit === 'lbs' ? kgToLbs(entry.weight) : entry.weight,
      }))
  }, [weightLog, weightUnit])

  const hasData = analytics.totalWorkouts > 0

  const handleAddWeight = () => {
    if (!weightInput) return
    let wKg = Number(weightInput)
    if (weightUnit === 'lbs') wKg = lbsToKg(wKg)
    dispatch({ type: 'ADD_WEIGHT_ENTRY', payload: { date: weightDate, weight: wKg } })
    setWeightInput('')
  }

  const handleSetGoal = () => {
    if (!goalWeight) return
    let targetKg = Number(goalWeight)
    if (weightUnit === 'lbs') targetKg = lbsToKg(targetKg)
    dispatch({ type: 'SET_WEIGHT_GOAL', payload: { targetWeight: targetKg, type: goalType } })
    setShowGoalForm(false)
    setGoalWeight('')
  }

  const targetWeightDisplay = weightGoal
    ? (weightUnit === 'lbs' ? kgToLbs(weightGoal.targetWeight) : weightGoal.targetWeight)
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Progress</h1>
        <p className="text-sm text-text-secondary">Track your fitness journey</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: Dumbbell, label: 'Workouts', value: analytics.totalWorkouts, color: 'text-primary-light', bg: 'bg-primary/10' },
          { icon: Target, label: 'Total Sets', value: analytics.totalSets, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Flame, label: 'Calories', value: `${Math.round(analytics.totalCalories).toLocaleString()}`, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: TrendingUp, label: 'Volume (kg)', value: `${Math.round(analytics.totalWeight).toLocaleString()}`, color: 'text-sky-400', bg: 'bg-sky-500/10' },
          { icon: Calendar, label: 'Total Reps', value: analytics.totalReps.toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Award, label: 'Streak', value: `${analytics.streak} days`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface rounded-2xl p-4 border border-surface-lighter"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {hasData ? (
        <>
          {/* Weekly workouts chart */}
          <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
            <h3 className="text-lg font-bold text-text-primary mb-4">Weekly Workouts</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.weeklyData}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#2a2a3e', border: '1px solid #363650', borderRadius: '12px', color: '#f1f5f9' }}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                />
                <Bar dataKey="workouts" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Calorie Burn chart with daily/weekly toggle */}
          <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">Calorie Burn</h3>
              <div className="flex bg-surface-lighter rounded-xl p-1">
                <button
                  onClick={() => setCalorieView('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    calorieView === 'daily' ? 'bg-primary text-white shadow' : 'text-text-muted'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setCalorieView('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    calorieView === 'weekly' ? 'bg-primary text-white shadow' : 'text-text-muted'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={calorieView === 'daily' ? analytics.dailyCalorieData : analytics.weeklyCalorieData}>
                <XAxis dataKey={calorieView === 'daily' ? 'date' : 'week'} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#2a2a3e', border: '1px solid #363650', borderRadius: '12px', color: '#f1f5f9' }}
                  cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                />
                <Bar dataKey="calories" fill="url(#calorieGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Volume trend */}
          {analytics.volumeData.length > 1 && (
            <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
              <h3 className="text-lg font-bold text-text-primary mb-4">Volume Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.volumeData}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#2a2a3e', border: '1px solid #363650', borderRadius: '12px', color: '#f1f5f9' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#f59e0b" fill="url(#volumeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Muscle distribution */}
          {analytics.muscleDistribution.length > 0 && (
            <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
              <h3 className="text-lg font-bold text-text-primary mb-4">Muscle Distribution</h3>
              <div className="flex items-center gap-6">
                <div className="w-40 h-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.muscleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analytics.muscleDistribution.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {analytics.muscleDistribution.slice(0, 6).map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-text-secondary flex-1">{entry.name}</span>
                      <span className="text-sm font-medium text-text-primary">{entry.value} sets</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-surface rounded-2xl border border-surface-lighter p-8 text-center">
          <p className="text-5xl mb-4">📊</p>
          <h3 className="text-xl font-bold text-text-primary">No data yet</h3>
          <p className="text-text-secondary mt-2">Complete workouts and log them to see your progress here.</p>
        </div>
      )}

      {/* Weight Tracker */}
      {showWeightTracker && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-bold text-text-primary">Weight Tracker</h3>
          </div>

          {/* Weight Goal */}
          {weightGoal ? (
            <div className="bg-surface rounded-2xl border border-surface-lighter p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-primary">
                  Goal: {goalType === 'lose' ? 'Lose' : goalType === 'gain' ? 'Gain' : 'Maintain'} weight
                </p>
                <button onClick={() => dispatch({ type: 'SET_WEIGHT_GOAL', payload: null })} className="text-xs text-text-muted hover:text-danger">
                  Clear
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary">{targetWeightDisplay}</span>
                <span className="text-sm text-text-muted">{weightUnit}</span>
              </div>
              {weightData.length > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>Current: {weightData[weightData.length - 1].weight} {weightUnit}</span>
                    <span>Target: {targetWeightDisplay} {weightUnit}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-lighter rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(5, weightData.length > 0
                          ? Math.abs(1 - (weightData[weightData.length - 1].weight - targetWeightDisplay) / (weightData[0].weight - targetWeightDisplay || 1)) * 100
                          : 0))}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-surface-lighter p-4">
              {!showGoalForm ? (
                <button onClick={() => setShowGoalForm(true)} className="w-full text-sm text-primary-light hover:text-primary font-medium">
                  + Set a weight goal
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['lose', 'gain', 'maintain'].map(t => (
                      <button
                        key={t}
                        onClick={() => setGoalType(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                          goalType === t ? 'bg-primary text-white' : 'bg-surface-lighter text-text-muted'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={`Target (${weightUnit})`}
                      value={goalWeight}
                      onChange={e => setGoalWeight(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-surface-light border border-surface-lighter text-text-primary text-sm focus:outline-none focus:border-primary"
                    />
                    <button onClick={handleSetGoal} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium">
                      Set
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weight Entry Form */}
          <div className="bg-surface rounded-2xl border border-surface-lighter p-4">
            <p className="text-sm font-medium text-text-primary mb-3">Log Weight</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={weightDate}
                onChange={e => setWeightDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-light border border-surface-lighter text-text-primary text-sm focus:outline-none focus:border-primary"
              />
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number"
                  placeholder={weightUnit === 'kg' ? '70' : '154'}
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light border border-surface-lighter text-text-primary text-sm focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted shrink-0">{weightUnit}</span>
              </div>
              <button
                onClick={handleAddWeight}
                disabled={!weightInput}
                className="px-3 py-2 rounded-xl bg-primary text-white disabled:opacity-40 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weight Chart */}
          {weightData.length > 1 && (
            <div className="bg-surface rounded-2xl border border-surface-lighter p-5">
              <h3 className="text-lg font-bold text-text-primary mb-4">Weight Journey</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#2a2a3e', border: '1px solid #363650', borderRadius: '12px', color: '#f1f5f9' }}
                    formatter={(value) => [`${value} ${weightUnit}`, 'Weight']}
                  />
                  {targetWeightDisplay && (
                    <ReferenceLine y={targetWeightDisplay} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#f59e0b', fontSize: 11 }} />
                  )}
                  <Area type="monotone" dataKey="weight" stroke="#f43f5e" fill="url(#weightGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weight log entries */}
          {weightData.length > 0 && (
            <div className="bg-surface rounded-2xl border border-surface-lighter p-4">
              <p className="text-sm font-medium text-text-primary mb-3">Recent Entries</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...weightData].reverse().slice(0, 10).map(entry => (
                  <div key={entry.fullDate} className="flex items-center justify-between py-1.5 border-b border-surface-lighter last:border-0">
                    <span className="text-sm text-text-secondary">{entry.fullDate}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary">{entry.weight} {weightUnit}</span>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_WEIGHT_ENTRY', payload: { date: entry.fullDate } })}
                        className="text-text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getPreviousDate(dateStr) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
