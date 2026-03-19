import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useEvents } from '../../context/EventContext'
import './Navbar.css'

export default function Navbar({ sidebarCollapsed, onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const { notifications, markNotificationAsRead, clearNotifications } = useEvents()
  const unreadCount = notifications.filter(n => !n.read).length

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  const getRoleColor = () => {
    if (!user) return ''
    return user.role === 'admin' ? 'role-admin' : user.role === 'clubhead' ? 'role-clubhead' : 'role-student'
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button id="sidebar-toggle-btn" className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <span></span><span></span><span></span>
        </button>
        <div className="navbar-brand">
          <div className="brand-logo">CH</div>
          <div className="brand-text">
            <span className="brand-name">ClubHub</span>
            <span className="brand-sub">VIT Chennai</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* Theme Toggle */}
        <button id="theme-toggle-btn" className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle dark/light mode">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        {user && (
          <div className="notif-wrapper">
            <button id="notif-btn" className="nav-icon-btn" onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }} aria-label="Notifications">
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className="dropdown notif-dropdown animate-slide-up">
                <div className="dropdown-header flex justify-between items-center">
                  <span className="dropdown-title">Notifications</span>
                  <div className="flex gap-8">
                    {unreadCount > 0 && <span className="badge badge-primary">{unreadCount} new</span>}
                    <button className="text-xs text-secondary hover:underline" onClick={clearNotifications}>Clear all</button>
                  </div>
                </div>
                <div className="notif-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div className="p-24 text-center text-muted">
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
                      <p>No new notifications</p>
                    </div>
                  ) : notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      <span className="notif-icon">
                        {n.type === 'event' ? '📅' : n.type === 'announcement' ? '📢' : '🔔'}
                      </span>
                      <div className="notif-content">
                        <p className="notif-title" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>{n.title}</p>
                        <p className="notif-message">{n.message}</p>
                        <span className="notif-time">{n.time}</span>
                      </div>
                      {!n.read && <div className="unread-dot"></div>}
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button className="btn btn-ghost btn-sm w-full" onClick={() => setNotifOpen(false)}>Close</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        {user ? (
          <div className="profile-wrapper">
            <button id="profile-btn" className="profile-btn" onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }} aria-label="User menu">
              <div className="avatar avatar-sm">{getInitials(user.name)}</div>
              <div className="profile-info">
                <span className="profile-name">{user.name.split(' ')[0]}</span>
                <span className={`badge badge-sm ${getRoleColor()}`}>{user.role}</span>
              </div>
              <span className="chevron">{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            {dropdownOpen && (
              <div className="dropdown profile-dropdown animate-slide-up">
                <div className="dropdown-user-header">
                  <div className="avatar avatar-md">{getInitials(user.name)}</div>
                  <div>
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                    <span className={`badge ${getRoleColor()}`}>{user.role}</span>
                  </div>
                </div>
                <div className="divider" style={{ margin: '8px 0' }}></div>
                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span>👤</span> My Profile
                </Link>
                <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span>📊</span> Dashboard
                </Link>
                <div className="divider" style={{ margin: '8px 0' }}></div>
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-8">
            <Link to="/login" className="btn btn-ghost btn-sm" id="login-nav-btn">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" id="register-nav-btn">Register</Link>
          </div>
        )}
      </div>

      {/* Close dropdowns when clicking outside */}
      {(dropdownOpen || notifOpen) && (
        <div className="dropdown-backdrop" onClick={() => { setDropdownOpen(false); setNotifOpen(false) }} />
      )}
    </nav>
  )
}
