import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Toast from './components/ui/Toast'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clubs from './pages/Clubs'
import Events from './pages/Events'
import Announcements from './pages/Announcements'
import Profile from './pages/Profile'
import CreateEvent from './pages/CreateEvent'
import ManageClub from './pages/ManageClub'
import EventApprovals from './pages/EventApprovals'
import AdminPanel from './pages/AdminPanel'
import Leaderboard from './pages/Leaderboard'

function App() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isHomePage = location.pathname === '/'

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen(!mobileSidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  return (
    <div className={`app-layout ${theme}`}>
      <Toast />

      {!isAuthPage && (
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
      )}

      {!isAuthPage && !isHomePage && (
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
        />
      )}

      <main className={`main-content ${isAuthPage || isHomePage ? 'full-width' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/profile" element={<Profile />} />

          {/* Role Based Placeholder Routes (for demo purpose) */}
          <Route path="/my-clubs" element={<Clubs />} />
          <Route path="/my-events" element={<Events />} />
          <Route path="/manage-club" element={<ManageClub />} />
          <Route path="/manage-members" element={<ManageClub />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/leaderboard" element={user?.role === 'admin' || user?.role === 'clubhead' ? <Leaderboard /> : <Navigate to="/dashboard" />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/event-approvals" element={<EventApprovals />} />
          <Route path="/manage-clubs" element={<AdminPanel />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <style jsx>{`
        .full-width { margin-left: 0 !important; padding-top: 70px !important; }
        @media (max-width: 768px) { .full-width { padding-top: 70px !important; } }
      `}</style>
    </div>
  )
}

export default App
