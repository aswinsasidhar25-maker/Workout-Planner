import { NavLink } from 'react-router-dom'
import { Dumbbell, Calendar, TrendingUp, User, Home } from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/plan', icon: Calendar, label: 'My Plan' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Layout({ children }) {
  const { state } = useApp()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-lighter">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                ZenFit
              </h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">Balance & Strength</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      {state.profile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-surface-lighter">
          <div className="max-w-6xl mx-auto flex justify-around py-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-primary-light'
                      : 'text-text-muted hover:text-text-secondary'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
