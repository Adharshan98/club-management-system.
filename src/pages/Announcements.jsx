import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventContext'
import './Announcements.css'

export default function Announcements() {
  const { user } = useAuth()
  const { announcements, addAnnouncement, deleteAnnouncement } = useEvents()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, current_club, pinned
  const [category, setCategory] = useState('all') // all, important, workshop, hackathon, opportunity
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [annFormData, setAnnFormData] = useState({
    title: '',
    content: '',
    type: 'general'
  })

  const handleCreateAnnouncement = (e) => {
    e.preventDefault()
    addAnnouncement({
      ...annFormData,
      clubId: user.clubId,
      clubName: user.clubName,
      author: user.name,
      color: annFormData.type === 'event' ? '#6c63ff' : annFormData.type === 'opportunity' ? '#43e6b5' : '#1e90ff'
    })
    setShowCreateModal(false)
    setAnnFormData({ title: '', content: '', type: 'general' })
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Announcement posted! 📢', type: 'success' } 
    }))
  }

  const filtered = announcements.filter(ann => {
    const matchSearch = ann.title.toLowerCase().includes(search.toLowerCase()) || ann.content.toLowerCase().includes(search.toLowerCase())
    
    let matchFilter = filter === 'all' || (filter === 'pinned' && ann.pinned) || (filter === 'current_club' && user && user.clubId === ann.clubId)
    
    let matchCategory = true
    if (category === 'important') matchCategory = ann.pinned
    if (category === 'workshop') matchCategory = ann.content.toLowerCase().includes('workshop')
    if (category === 'hackathon') matchCategory = ann.content.toLowerCase().includes('hackathon')
    if (category === 'opportunity') matchCategory = ann.type === 'opportunity'

    return matchSearch && matchFilter && matchCategory
  })

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id)
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: 'Announcement deleted 🗑️', type: 'info' } 
      }))
    }
  }

  // Separate pinned announcements
  const pinnedAnnouncements = filtered.filter(a => a.pinned)
  const otherAnnouncements = filtered.filter(a => !a.pinned)

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title">📢 Announcements</div>
      <p className="page-subtitle">Stay updated with the latest news and updates from all campus clubs</p>

      {/* Search & Filter */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="announcements-search-input"
            className="search-input"
            placeholder="Search announcements by title or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'pinned' ? 'active' : ''}`} onClick={() => setFilter('pinned')}>Pinned</button>
          {user && user.role === 'clubhead' && (
            <button className={`filter-btn ${filter === 'current_club' ? 'active' : ''}`} onClick={() => setFilter('current_club')}>My Club</button>
          )}
        </div>
      </div>

      <div className="announcements-layout">
        <div className="announcements-main">
          {pinnedAnnouncements.length > 0 && (
            <section className="ann-section mb-32">
              <h4 className="ann-section-title">📌 Pinned Announcements</h4>
              <div className="ann-list">
                {pinnedAnnouncements.map((ann, i) => (
                  <div key={ann.id} className="ann-card pinned animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="ann-card-header" style={{ borderLeftColor: ann.color }}>
                      <div>
                        <span className={`badge ${ann.type === 'event' ? 'badge-primary' : ann.type === 'opportunity' ? 'badge-accent' : 'badge-info'}`}>{ann.type}</span>
                        <h3 className="ann-card-title">{ann.title}</h3>
                      </div>
                      <div className="flex gap-8 items-center">
                        <span className="ann-pinned-icon">📌</span>
                        {user && (user.role === 'admin' || (user.role === 'clubhead' && user.clubId === ann.clubId)) && (
                          <button className="btn btn-icon btn-ghost danger-hover" onClick={() => handleDelete(ann.id)} title="Delete Notification">🗑️</button>
                        )}
                      </div>
                    </div>
                    <div className="ann-card-body">
                      <p className="ann-card-content">{ann.content}</p>
                    </div>
                    <div className="ann-card-footer">
                      <div className="ann-author">
                        <div className="avatar avatar-sm">{ann.author.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <span><strong>{ann.author}</strong> • {ann.clubName}</span>
                      </div>
                      <span className="ann-date">📅 {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="ann-section">
            <h4 className="ann-section-title">{filter === 'all' ? '🕒 Recent Updates' : filter === 'pinned' ? 'Pinned Updates' : 'Our Club Updates'}</h4>
            <div className="ann-list">
              {otherAnnouncements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📢</div>
                  <div className="empty-state-title">No announcements found</div>
                  <div className="empty-state-text">Check back later for more updates.</div>
                </div>
              ) : (
                otherAnnouncements.map((ann, i) => (
                  <div key={ann.id} className="ann-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="ann-card-header" style={{ borderLeftColor: ann.color }}>
                      <div>
                        <span className={`badge ${ann.type === 'event' ? 'badge-primary' : ann.type === 'opportunity' ? 'badge-accent' : 'badge-info'}`}>{ann.type}</span>
                        <h3 className="ann-card-title">{ann.title}</h3>
                      </div>
                      {user && (user.role === 'admin' || (user.role === 'clubhead' && user.clubId === ann.clubId)) && (
                        <button className="btn btn-icon btn-ghost danger-hover" onClick={() => handleDelete(ann.id)} title="Delete Notification">🗑️</button>
                      )}
                    </div>
                    <div className="ann-card-body">
                      <p className="ann-card-content">{ann.content}</p>
                    </div>
                    <div className="ann-card-footer">
                      <div className="ann-author">
                        <div className="avatar avatar-sm">{ann.author.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                        <span><strong>{ann.author}</strong> • {ann.clubName}</span>
                      </div>
                      <span className="ann-date">📅 {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="announcements-sidebar">
          <div className="card ann-stats-card animate-slide-up">
            <h4 className="card-title">Participation</h4>
            <div className="flex items-center justify-between mb-12">
              <span className="text-secondary">Active Announcements</span>
              <span className="badge badge-primary">{announcements.length}</span>
            </div>
            <div className="flex items-center justify-between mb-12">
              <span className="text-secondary">Pinned Notifications</span>
              <span className="badge badge-accent">{announcements.filter(a => a.pinned).length}</span>
            </div>
            <div className="divider"></div>
            <p className="text-xs text-muted mb-20 text-center">
              Announcements are visible to all students of VIT Chennai.
            </p>
            {user && (user.role === 'clubhead' || user.role === 'admin') && (
              <button 
                className="btn btn-primary w-full py-12" 
                id="create-ann-btn"
                onClick={() => setShowCreateModal(true)}
              >
                ➕ Create Announcement
              </button>
            )}
          </div>

          <div className="card mt-24 p-24 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h4 className="card-title">Quick Filters</h4>
            <div className="flex flex-col gap-12 mt-16">
              <button 
                className={`chip ${category === 'important' ? 'active' : ''}`} 
                onClick={() => setCategory(category === 'important' ? 'all' : 'important')}
              >
                Important
              </button>
              <button 
                className={`chip ${category === 'workshop' ? 'active' : ''}`} 
                onClick={() => setCategory(category === 'workshop' ? 'all' : 'workshop')}
              >
                Workshops
              </button>
              <button 
                className={`chip ${category === 'hackathon' ? 'active' : ''}`} 
                onClick={() => setCategory(category === 'hackathon' ? 'all' : 'hackathon')}
              >
                Hackathons
              </button>
              <button 
                className={`chip ${category === 'opportunity' ? 'active' : ''}`} 
                onClick={() => setCategory(category === 'opportunity' ? 'all' : 'opportunity')}
              >
                Opportunities
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <h3 className="card-title">✨ Create Announcement</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-16">
                <div className="form-group">
                  <label>Announcement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workshop registrations are now open!"
                    value={annFormData.title}
                    onChange={e => setAnnFormData({ ...annFormData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={annFormData.type}
                    onChange={e => setAnnFormData({ ...annFormData, type: e.target.value })}
                  >
                    <option value="general">General Update</option>
                    <option value="event">Event Alert</option>
                    <option value="opportunity">Opportunity</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Provide more details about this announcement..."
                    value={annFormData.content}
                    onChange={e => setAnnFormData({ ...annFormData, content: e.target.value })}
                  ></textarea>
                </div>
                <div className="flex gap-8 mt-8">
                  <button type="button" className="btn btn-outline flex-1" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">🚀 Post Announcement</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
