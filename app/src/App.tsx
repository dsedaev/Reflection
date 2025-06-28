import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import EntriesPage from './pages/EntriesPage'
import EntryEditor from './pages/EntryEditor'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { MoodsProvider } from './context/MoodsContext'

function AppRoutes() {
  const { token } = useAuth()

  if (!token) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/entries" element={<EntriesPage />} />
        <Route path="/entries/new" element={<EntryEditor />} />
        <Route path="/entries/:id" element={<EntryEditor />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <MoodsProvider>
        <AuthProvider>
          <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
            <AppRoutes />
          </div>
        </AuthProvider>
      </MoodsProvider>
    </ThemeProvider>
  )
}

export default App 