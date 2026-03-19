import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import './Sidebar.css'

const NAV_ITEMS = {
  common: [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/clubs', icon: '🏛️', label: 'Clubs' },
    { path: '/events', icon: '📅', label: 'Events' },
    { path: '/announcements', icon: '📢', label: 'Announcements' },
  ],
  student: [
    { path: '/my-clubs', icon: '⭐', label: 'My Clubs' },
    { path: '/my-events', icon: '🎟️', label: 'My Registrations' },
  ],
  clubhead: [
    { path: '/manage-club', icon: '⚙️', label: 'Manage Club' },
    { path: '/create-event', icon: '➕', label: 'Create Event' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  ],
  admin: [
    { path: '/admin', icon: '🛡️', label: 'Admin Panel' },
    { path: '/event-approvals', icon: '✅', label: 'Event Approvals' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  ],
}

export default function Sidebar({ collapsed }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const getRoleItems = () => {
    if (!user) return []
    if (user.role === 'admin') return NAV_ITEMS.admin
    if (user.role === 'clubhead') return NAV_ITEMS.clubhead
    return NAV_ITEMS.student
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="brand-logo-sidebar">CH</div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">ClubHub</span>
            <span className="sidebar-brand-sub">VIT Chennai</span>
          </div>
        )}
      </div>

      <div className="sidebar-divider"></div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <p className="nav-section-label">Main Menu</p>}
        {NAV_ITEMS.common.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}

        {user && (
          <>
            <div className="sidebar-divider"></div>
            {!collapsed && (
              <p className="nav-section-label">
                {user.role === 'admin' ? 'Administration' : user.role === 'clubhead' ? 'Club Management' : 'My Space'}
              </p>
            )}
            {getRoleItems().map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-divider"></div>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={collapsed ? 'Profile' : ''}
        >
          <span className="nav-icon">
            {user ? (
              <div className="avatar avatar-sm" style={{ fontSize: '0.65rem' }}>{getInitials(user?.name)}</div>
            ) : '👤'}
          </span>
          {!collapsed && (
            <span className="nav-label">
              {user ? user.name.split(' ')[0] : 'Profile'}
            </span>
          )}
        </NavLink>

        <div 
          className="nav-item theme-toggle" 
          onClick={toggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : ''}
          style={{ cursor: 'pointer' }}
        >
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </div>

        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={collapsed ? 'Home' : ''}
        >
          <span className="nav-icon">🏠</span>
          {!collapsed && <span className="nav-label">Home</span>}
        </NavLink>
      </div>
    </aside>
  )
}
