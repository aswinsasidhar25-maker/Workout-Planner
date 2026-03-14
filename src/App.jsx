import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import WorkoutPlan from './pages/WorkoutPlan'
import ExerciseLibrary from './pages/ExerciseLibrary'
import Progress from './pages/Progress'
import Profile from './pages/Profile'

function App() {
  const { state } = useApp()
  const hasProfile = !!state.profile

  if (!hasProfile) {
    return <Onboarding />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plan" element={<WorkoutPlan />} />
        <Route path="/exercises" element={<ExerciseLibrary />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
