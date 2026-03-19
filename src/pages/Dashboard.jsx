import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, users } = useAuth()
  const { 
    events, announcements, clubs, members, registrations, getLeaderboardData
  } = useEvents()
  
  const leaderboard = getLeaderboardData ? getLeaderboardData() : { topMembers: [], topClubs: [] }
  const { topMembers, topClubs } = leaderboard

  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const upcomingEvents = events.filter(e => e.status === 'approved').slice(0, 4)
  const recentAnnouncements = announcements.slice(0, 3)
  const pendingCount = events.filter(e => e.status === 'pending').length

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getCategoryColor = (cat) => {
    if (!cat) return 'var(--primary)'
    const c = cat.toLowerCase().trim()
    const colors = {
      'hackathon': '#ff4757',
      'workshop': '#54a0ff',
      'competition': '#ff9f43',
      'tournament': '#2ecc71',
      'pitch': '#a55eea',
      'contest': '#ee5253',
      'seminar': '#4b7bec',
      'other': '#778ca3'
    }
    return colors[c] || 'var(--primary)'
  }

  const clubHeadData = clubs.find(c => c.id === user?.clubId) || clubs[0]


  const stats = user?.role === 'admin' ? [
    { label: 'Total Clubs', value: clubs.length, icon: '🏛️', color: 'cyan', change: '+2 new this week', positive: true },
    { label: 'Active Students', value: users?.filter(u => u.role === 'student').length || 0, icon: '👨‍🎓', color: 'blue', change: '+5%', positive: true },
    { label: 'Total Events', value: events.length, icon: '📅', color: 'teal', change: '+8 this month', positive: true },
    { label: 'Pending Approvals', value: pendingCount, icon: '⏳', color: 'orange', change: 'Needs attention' },
  ] : user?.role === 'clubhead' ? [
    { label: 'Club Members', value: members.filter(m => m.status === 'active' && m.clubId === user.clubId).length, icon: '👥', color: 'cyan', change: '+8 this month', positive: true },
    { label: 'Events Hosted', value: events.filter(e => e.clubId === user.clubId && e.status === 'approved').length, icon: '📅', color: 'blue', change: 'This semester' },
    { label: 'Pending Members', value: members.filter(m => m.status === 'pending' && m.clubId === user.clubId).length, icon: '⏳', color: 'teal', change: 'Awaiting review' },
    { label: 'Event Registrations', value: registrations.filter(r => events.find(e => e.id === r.eventId)?.clubId === user.clubId).length, icon: '🎟️', color: 'orange', change: 'Total registrations' },
  ] : (() => {
    const userMemberships = members.filter(m => m.regNo === user?.regNo && m.status === 'active')
    const avgAttendance = userMemberships.length > 0 
      ? Math.round(userMemberships.reduce((acc, m) => acc + (m.attendance || 0), 0) / userMemberships.length)
      : 0
    const totalCertificates = userMemberships.reduce((acc, m) => acc + (m.attendedEvents || 0), 0)

    return [
      { label: 'My Clubs', value: userMemberships.length, icon: '🏛️', color: 'cyan', change: 'Joined' },
      { label: 'Events Registered', value: registrations.filter(r => r.regNo === user?.regNo).length, icon: '🎟️', color: 'blue', change: 'This semester' },
      { label: 'Attendance Rate', value: `${avgAttendance}%`, icon: '✅', color: 'teal', change: '+5% this month', positive: true },
      { label: 'Certificates', value: totalCertificates, icon: '🏆', color: 'orange', change: 'Earned' },
    ]
  })()

  return (
    <div className="page-container animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-orb-1"></div>
        <div className="welcome-orb-2"></div>
        <div className="welcome-content">
          <div className="welcome-text">
            <p className="welcome-greeting">{getGreeting()}, {user?.name?.split(' ')[0] || 'Guest'}! 👋</p>
            <h1 className="welcome-title">Your Dashboard</h1>
            <p className="welcome-sub">
              {user?.role === 'admin' && 'Manage clubs, approve events & oversee student activity.'}
              {user?.role === 'clubhead' && `Managing ${user.clubName} — keep up the great work!`}
              {user?.role === 'student' && 'Track your club activities, events, and achievements.'}
              {!user && 'Login to access your personalized dashboard.'}
            </p>
          </div>
            <div className="welcome-badges">
              <div className="welcome-badge-item" style={{ background: 'var(--primary-glow)', borderColor: 'var(--primary-glow)' }}>
                <span className="welcome-badge-icon">🕒</span>
                <span className="welcome-badge-text font-bold" style={{ color: 'var(--primary)' }}>
                  {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            <div className="welcome-badge-item">
              <span className="welcome-badge-icon">🎓</span>
              <span className="welcome-badge-text">{user?.regNo || 'VIT Chennai'}</span>
            </div>
            <div className="welcome-badge-item">
              <span className="welcome-badge-icon">🏛️</span>
              <span className="welcome-badge-text">{user?.dept || 'Campus'}</span>
            </div>
            {user?.role && (
              <div className={`badge ${user.role === 'admin' ? 'role-admin' : user.role === 'clubhead' ? 'role-clubhead' : 'role-student'}`}>
                {user.role.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-32">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.color} animate-slide-up`} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-change ${s.positive ? 'positive' : ''}`}>{s.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid animate-fade-in">
        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Upcoming Events</h3>
            {user?.role === 'admin' && pendingCount > 0 && (
              <span className="badge badge-warning">{pendingCount} pending</span>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {upcomingEvents.map(event => (
              <div key={event.id} className="dashboard-event-item">
                <div className="event-item-bar" style={{ background: getCategoryColor(event.category) }}></div>
                <div className="event-item-content">
                  <div className="flex items-center justify-between">
                    <p className="event-item-title">{event.title}</p>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      {event.status}
                    </span>
                  </div>
                  <div className="event-item-meta">
                    <span>📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    <span>📍 {event.venue}</span>
                    <span>👥 {event.registeredCount}/{event.maxParticipants}</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${(event.registeredCount / event.maxParticipants) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="p-24 text-center text-muted">No upcoming events.</div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📢 Latest Announcements</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentAnnouncements.map(ann => (
              <div key={ann.id} className="dashboard-ann-item">
                <div className="ann-dot" style={{ background: ann.color }}></div>
                <div className="ann-content">
                  <p className="ann-title">{ann.title}</p>
                  <p className="ann-text">{ann.content.slice(0, 80)}...</p>
                  <div className="flex items-center gap-8 mt-8">
                    <span className="text-sm text-muted">🏛️ {ann.clubName}</span>
                    <span className="text-sm text-muted">📅 {ann.date}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentAnnouncements.length === 0 && (
              <div className="p-24 text-center text-muted">No recent announcements.</div>
            )}
          </div>
        </div>

        {/* Leaderboard Highlights */}
        {(user?.role === 'admin' || user?.role === 'clubhead') && (
          <div className="card md:col-span-2 lg:col-span-1">
            <div className="card-header">
              <h3 className="card-title">🏆 Top Rankings</h3>
            </div>
            <div className="card-body">
              <div className="space-y-16">
                <div className="p-16 bg-primary-subtle rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-12">
                    <div className="text-2xl">🥇</div>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase">Top Student</p>
                      <p className="font-bold text-sm">{topMembers[0]?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">{topMembers[0]?.points || 0} <span className="text-[10px]">pts</span></p>
                  </div>
                </div>

                <div className="p-16 bg-secondary-subtle rounded-xl flex items-center justify-between" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                  <div className="flex items-center gap-12">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase">Top Club</p>
                      <p className="font-bold text-sm">{topClubs[0]?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black" style={{ color: 'var(--secondary)' }}>{topClubs[0]?.score || 0} <span className="text-[10px]">pts</span></p>
                  </div>
                </div>

                <div className="mt-16">
                  <a href="/leaderboard" className="btn btn-sm btn-ghost w-full">View Full Leaderboard ➔</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin: Pending Approvals */}
    </div>
  )
}
