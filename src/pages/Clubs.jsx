import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventContext'
import { CATEGORIES } from '../data/mockData'
import './Clubs.css'

export default function Clubs() {
  const { user, showToast } = useAuth()
  const { clubs, members, joinClub, events, registrations } = useEvents()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedClub, setSelectedClub] = useState(null)

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Technical': return '#6c63ff'
      case 'Non-Technical': return '#2ed573' // Light Green
      case 'Cultural': return '#ffa502'
      case 'Arts': return '#ff4757'
      case 'Sports': return '#0984e3' // Vibrant Blue
      case 'Professional': return '#5f27cd'
      case 'Social': return '#00d2d3' // Cyan/Teal
      default: return '#57606f'
    }
  }

  const getCategoryGradient = (cat) => {
    switch (cat) {
      case 'Technical': return 'linear-gradient(135deg, #6c63ff 0%, #3f37c9 100%)'
      case 'Non-Technical': return 'linear-gradient(135deg, #2ed573 0%, #1abc9c 100%)'
      case 'Cultural': return 'linear-gradient(135deg, #ffa502 0%, #ff7f50 100%)'
      case 'Arts': return 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)'
      case 'Sports': return 'linear-gradient(135deg, #0984e3 0%, #4834d4 100%)' // Blue gradient
      case 'Professional': return 'linear-gradient(135deg, #5f27cd 0%, #341f97 100%)'
      case 'Social': return 'linear-gradient(135deg, #00d2d3 0%, #10ac84 100%)' // Teal gradient
      default: return 'linear-gradient(135deg, #57606f 0%, #2f3542 100%)'
    }
  }
  const isMyClubsRoute = location.pathname === '/my-clubs'
  const isManageClubsRoute = location.pathname === '/manage-clubs' && user?.role === 'admin'

  const filtered = clubs.filter(c => {
    // If clubhead is assigned, only show their club
    if (user?.role === 'clubhead' && user.clubId && c.id !== user.clubId) return false;

    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || c.category === category
    
    const isMember = members.some(m => m.clubId === c.id && m.regNo === user?.regNo && m.status === 'active')
    
    if (isMyClubsRoute && !isMember) return false
    return matchSearch && matchCat
  })

  const handleApply = (clubId) => {
    if (!user) { showToast('Please login to apply for club membership.', 'warning'); return }
    
    const alreadyApplied = members.some(m => m.clubId === clubId && m.regNo === user.regNo)
    if (alreadyApplied) { 
      showToast('You already have an active application or membership for this club!', 'info')
      return 
    }

    joinClub({
      name: user.name,
      regNo: user.regNo,
      dept: user.dept,
      clubId: clubId
    })

    showToast('Application submitted! Club head will review your request.', 'success')
    setSelectedClub(null)
  }

  const isApplied = (clubId) => members.some(m => m.clubId === clubId && m.regNo === user?.regNo && m.status === 'pending')
  const isMember = (clubId) => members.some(m => m.clubId === clubId && m.regNo === user?.regNo && m.status === 'active')


  return (
    <div className="page-container animate-fade-in">
      <div className="page-title">{isManageClubsRoute ? '⚙️ Manage Clubs' : '🏛️ Student Clubs'}</div>
      <p className="page-subtitle">
        {isManageClubsRoute 
          ? `Admin Panel: Oversee and manage all ${clubs.length} registered clubs.` 
          : `Discover clubs that match your passions — ${clubs.length} clubs registered at VIT Chennai`}
      </p>

      {/* Search & Filter */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="clubs-search-input"
            className="search-input"
            placeholder="Search clubs by name or interest..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select id="clubs-category-filter" className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Category Chips and Admin Controls */}
      <div className="flex items-center justify-between mb-24 flex-wrap gap-16">
        <div className="clubs-chips">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`chip ${category === cat ? 'active' : ''}`} 
              onClick={() => setCategory(cat)} 
              id={`chip-${cat.toLowerCase()}`}
              style={category === cat 
                ? { backgroundColor: getCategoryColor(cat), borderColor: getCategoryColor(cat), color: 'white' }
                : { borderColor: getCategoryColor(cat) + '40', color: getCategoryColor(cat) }
              }
            >
              {cat}
            </button>
          ))}
        </div>
        
        {isManageClubsRoute && (
          <button className="btn btn-primary" onClick={() => showToast('Create New Club form opened (Mock Action)', 'info')}>
            ➕ Create New Club
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No clubs found</div>
          <div className="empty-state-text">Try adjusting your search or filter.</div>
        </div>
      ) : (
        <div className="clubs-page-grid">
          {filtered.map((club, i) => (
            <div key={club.id} className="club-card card animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
              {/* Cover */}
              <div className="club-cover" style={{ background: getCategoryGradient(club.category) }}>
                <div className="club-cover-tag">
                  {club.tag || (club.name ? club.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CL')}
                </div>
                <div className="club-cover-meta">
                  <span className="club-cover-active">Active</span>
                  <span className="club-cover-cat" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.4)', color: 'white' }}>
                    {club.category}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="club-body">
                <div className="club-head-line">
                  <h3 className="club-name">{club.name}</h3>
                  <span className="club-founded">Est. {club.founded}</span>
                </div>
                <p className="club-desc">{club.description}</p>

                <div className="club-member-bar">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(members.filter(m => m.clubId === club.id).length / (club.maxMembers || 200)) * 100}%` }}></div>
                  </div>
                  <span className="text-sm text-muted" style={{ fontWeight: 700 }}>{members.filter(m => m.clubId === club.id).length}/{(club.maxMembers || 200)} members</span>
                </div>

                <div className="club-stats-row">
                  <div className="club-stat">
                    <span className="icon">📅</span>
                    <span className="value">{events.filter(e => e.clubId === club.id).length || 0}</span>
                    <span className="label">Events</span>
                  </div>
                  <div className="club-stat">
                    <span className="icon">👥</span>
                    <span className="value">{members.filter(m => m.clubId === club.id).length}</span>
                    <span className="label">Members</span>
                  </div>
                  <div className="club-stat">
                    <span className="icon">🏆</span>
                    <span className="value">{club.achievements?.length || 0}</span>
                    <span className="label">Awards</span>
                  </div>
                </div>

                <div className="club-tags-row">
                  {club.tags?.map(t => <span key={t} className="chip">{t}</span>)}
                </div>

                <div className="club-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedClub(club)} id={`club-detail-${club.id}-btn`}>
                    View Details
                  </button>
                  {isManageClubsRoute && (
                    <div className="flex gap-8">
                       <button className="btn btn-ghost btn-sm" onClick={() => showToast(`Edit ${club.name} (Mock)`, 'info')}>✏️ Edit</button>
                       <button className="btn btn-danger btn-sm" onClick={() => showToast(`${club.name} deleted (Mock)`, 'success')}>🗑️ Delete</button>
                    </div>
                  )}
                  {user?.role !== 'admin' && user?.role !== 'clubhead' && (
                    <button
                      className={`btn btn-sm ${isApplied(club.id) || isMember(club.id) ? 'btn-ghost' : 'btn-primary'}`}
                      style={!isApplied(club.id) && !isMember(club.id) ? { backgroundColor: getCategoryColor(club.category), borderColor: getCategoryColor(club.category) } : {}}
                      onClick={() => handleApply(club.id)}
                      id={`club-apply-${club.id}-btn`}
                      disabled={isApplied(club.id) || isMember(club.id)}
                    >
                      {isMember(club.id) ? '✓ Member' : isApplied(club.id) ? '⌛ Pending' : '➕ Join Club'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Club Detail Modal */}
      {selectedClub && (
        <div className="modal-overlay" onClick={() => setSelectedClub(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            {/* Modal Cover */}
            <div className="modal-cover" style={{ background: selectedClub.coverGradient }}>
              <button className="modal-close-btn" onClick={() => setSelectedClub(null)} aria-label="Close modal">✕</button>
              <div className="modal-cover-tag">
                {String(selectedClub.tag || (selectedClub.name ? selectedClub.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CL')).trim() || 'CL'}
              </div>
              <h2 className="modal-cover-title">{selectedClub.name}</h2>
              <p className="modal-cover-sub">{selectedClub.category} • Est. {selectedClub.founded || new Date().getFullYear()}</p>
            </div>

            <div className="modal-body">
              <p className="modal-desc">{selectedClub.description}</p>

              <div className="modal-stats-grid">
                <div className="modal-stat"><span>👥</span><strong>{members.filter(m => m.clubId === selectedClub.id).length}</strong><span>Members</span></div>
                <div className="modal-stat"><span>📅</span><strong>{events.filter(e => e.clubId === selectedClub.id && e.status === 'approved').length}</strong><span>Events</span></div>
                <div className="modal-stat"><span>🏆</span><strong>{selectedClub.achievements?.length || 0}</strong><span>Awards</span></div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Club Head</h4>
                <div className="flex items-center gap-12">
                  <div className="avatar avatar-md">{selectedClub.head?.split(' ').map(n => n[0]).join('').slice(0,2) || 'CL'}</div>
                  <div>
                    <p className="font-bold">{selectedClub.head || 'Not Assigned'}</p>
                    <p className="text-sm text-muted">{selectedClub.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Achievements</h4>
                {selectedClub.achievements?.map((a, i) => (
                  <div key={i} className="flex items-center gap-8 mb-8">
                    <span>🏆</span>
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
                {(!selectedClub.achievements || selectedClub.achievements.length === 0) && <p className="text-sm text-muted">No achievements listed yet.</p>}
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Focus Areas</h4>
                <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                  {selectedClub.tags?.map(t => <span key={t} className="chip active">{t}</span>)}
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Membership Capacity</h4>
                <div className="progress-bar" style={{ marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: `${(members.filter(m => m.clubId === selectedClub.id).length / (selectedClub.maxMembers || 200)) * 100}%` }}></div>
                </div>
                <p className="text-sm text-muted">{members.filter(m => m.clubId === selectedClub.id).length} of {selectedClub.maxMembers || 200} spots filled ({Math.round((members.filter(m => m.clubId === selectedClub.id).length / (selectedClub.maxMembers || 200)) * 100)}%)</p>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Registered Members</h4>
                <div className="flex flex-col gap-8" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {members.filter(m => m.clubId === selectedClub.id && m.status === 'active').length === 0 ? (
                    <p className="text-sm text-muted italic">No active members yet. Be the first to join!</p>
                  ) : (
                    members.filter(m => m.clubId === selectedClub.id && m.status === 'active').map(m => (
                      <div key={m.id} className="flex items-center justify-between p-10 bg-hover rounded-md border border-divider">
                        <div className="flex items-center gap-12">
                          <div className="avatar avatar-xs" style={{ fontSize: '0.7rem' }}>{m.name[0]}</div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>{m.name}</p>
                            <p className="text-xs text-muted">{m.dept}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted font-mono bg-dark-soft px-6 py-2 rounded">{m.regNo}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-12" style={{ marginTop: 24 }}>
                <button className="btn btn-ghost flex-1" onClick={() => setSelectedClub(null)} id="modal-close-btn">Close</button>
                {isManageClubsRoute && (
                  <button className="btn btn-danger flex-1" onClick={() => { showToast('Club deleted successfully', 'success'); setSelectedClub(null) }}>
                    🗑️ Delete Club
                  </button>
                )}
                  {user?.role !== 'admin' && user?.role !== 'clubhead' && (
                    <button
                      className={`btn flex-1 ${isApplied(selectedClub.id) || isMember(selectedClub.id) ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => handleApply(selectedClub.id)}
                      id={`modal-apply-${selectedClub.id}-btn`}
                      disabled={isApplied(selectedClub.id) || isMember(selectedClub.id)}
                    >
                      {isMember(selectedClub.id) ? '✓ Already Member' : isApplied(selectedClub.id) ? '✓ Application Sent' : '➕ Join This Club'}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
