import { useState, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventContext'
import EventCalendar from '../components/events/EventCalendar'
import './Events.css'

export default function Events() {
  const { user } = useAuth()
  const { events, registerForEvent, registrations, updateRegistrationStatus, feedback, addFeedback } = useEvents()
  const location = useLocation()
  const isMyEventsRoute = location.pathname === '/my-events'
  
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeRegId, setActiveRegId] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const fileInputRef = useRef(null)

  const EVENT_CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Competition', 'Tournament', 'Pitch', 'Contest', 'Seminar']

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

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'All' || e.category === category
      
      const isRegistered = registrations.some(r => r.eventId === e.id && r.regNo === user?.regNo)
      
      // Visibility logic:
      // 1. My Events Route: Only show registered events
      // 2. Events Directory: Show approved events (everyone) or pending events (Admin/ClubHead)
      if (isMyEventsRoute) return isRegistered && matchSearch && matchCat

      const isApproved = e.status === 'approved'
      const canViewPending = (user?.role === 'clubhead' && e.clubId === user.clubId) || user?.role === 'admin'
      
      return matchSearch && matchCat && (isApproved || canViewPending)
    })
  }, [events, search, category, user, registrations, isMyEventsRoute])

  const handleRegister = (eventId) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: 'Please login to register for events!', type: 'warning' } 
      }))
      return
    }
    const isRegistered = registrations.some(r => r.eventId === eventId && r.regNo === user?.regNo)
    if (isRegistered) return
    
    // Call global registration
    registerForEvent({
      eventId: eventId,
      name: user.name,
      regNo: user.regNo,
      email: user.email
    })

    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Registration successful! 🎉', type: 'success' } 
    }))
    setSelectedEvent(null)
  }

  const isUserRegistered = (eventId) => registrations.some(r => r.eventId === eventId && r.regNo === user?.regNo)

  const isFull = (event) => event.registeredCount >= event.maxParticipants
  const isDeadlinePassed = (event) => {
    if (!event.registrationDeadline) return false
    return new Date() > new Date(event.registrationDeadline)
  }

  const handleCertUpload = (event) => {
    const file = event.target.files[0]
    if (file && activeRegId) {
      updateRegistrationStatus(activeRegId, { certificate: file.name })
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: `Certificate "${file.name}" uploaded! 📄✨`, type: 'success' } 
      }))
      setActiveRegId(null)
      // Reset input value so same file can be uploaded again if needed
      event.target.value = ''
    }
  }

  const triggerUpload = (regId) => {
    setActiveRegId(regId)
    fileInputRef.current.click()
  }

  const handleDownloadCert = (fileName) => {
    // Mock download by creating a dummy blob
    const blob = new Blob(['Cert Content Mock'], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'certificate.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: `Downloading "${fileName}"... 📄📥`, type: 'success' } 
    }))
  }

  const exportAttendees = (eventId, eventTitle) => {
    const eventRegs = registrations.filter(r => r.eventId === eventId)
    const headers = ['Name', 'RegNo', 'Email', 'Status', 'Certificate']
    
    const csvRows = []
    csvRows.push(headers.join(','))
    
    eventRegs.forEach(reg => {
      const values = [
        `"${reg.name}"`,
        `"${reg.regNo}"`,
        `"${reg.email}"`,
        `"${reg.status}"`,
        `"${reg.certificate ? 'Issued' : 'Pending'}"`
      ]
      csvRows.push(values.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Attendees_${eventTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Exporting attendees list... 📊📥', type: 'success' } 
    }))
  }

  const handleFeedbackSubmit = () => {
    if (!rating) return
    addFeedback({
      eventId: selectedEvent.id,
      regNo: user.regNo,
      rating,
      comment
    })
    setSubmittingFeedback(false)
    setRating(0)
    setComment('')
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Thank you for your feedback! 🌟', type: 'success' } 
    }))
  }

  const getEventFeedback = (eventId) => feedback.filter(f => f.eventId === eventId)
  const hasUserFeedback = (eventId) => feedback.some(f => f.eventId === eventId && f.regNo === user?.regNo)

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header mb-24 flex justify-between items-end">
        <div>
          <div className="page-title">{isMyEventsRoute ? '🎟️ My Registrations' : '📅 Campus Events'}</div>
          <p className="page-subtitle">
            {isMyEventsRoute 
              ? `Manage your registered events and download certificates — ${filtered.length} events joined`
              : 'Discover and register for upcoming activities across campus'}
          </p>
        </div>
        
        {!isMyEventsRoute && (
          <div className="view-toggle tabs">
            <button 
              className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
            <button 
              className={`tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Calendar
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search events by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Category Chips */}
      <div className="events-chips mb-24">
        {EVENT_CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={`chip ${category === cat ? 'active' : ''}`} 
            onClick={() => setCategory(cat)}
            style={category === cat 
              ? { backgroundColor: getCategoryColor(cat), borderColor: getCategoryColor(cat), color: 'white' }
              : { borderColor: getCategoryColor(cat) + '40', color: getCategoryColor(cat) }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {viewMode === 'calendar' && !isMyEventsRoute ? (
        <EventCalendar 
          events={filtered} 
          onEventClick={(event) => setSelectedEvent(event)} 
        />
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No events found</div>
              <div className="empty-state-text">Try adjusting your search or filter.</div>
            </div>
          ) : (
            <div className="events-grid">
              {filtered.map((event, i) => (
                <div key={event.id} className="event-card card animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  {/* Event Cover */}
                  <div 
                    className="event-cover" 
                    style={{ 
                      background: `linear-gradient(135deg, ${getCategoryColor(event.category)} 0%, ${getCategoryColor(event.category)}cc 100%)` 
                    }}
                  >
                    <div className="event-date-pod">
                      <div className="event-cover-date">
                        <span className="day">{event.date.split('-')[2]}</span>
                        <span className="month">{new Date(event.date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</span>
                      </div>
                      <div className="event-cover-category">
                        {event.category.toUpperCase()}
                      </div>
                    </div>
                    {event.status === 'pending' && <div className="event-cover-status">🕒 Pending Approval</div>}
                    {isDeadlinePassed(event) && event.status === 'approved' && !isUserRegistered(event.id) && (
                      <div className="event-cover-status" style={{ background: 'var(--danger)' }}>⌛ Registration Closed</div>
                    )}
                    {isMyEventsRoute && registrations.find(r => r.eventId === event.id && r.regNo === user?.regNo)?.certificate && (
                      <div className="event-cover-status" style={{ background: 'var(--success)' }}>🎓 Certificate Ready</div>
                    )}
                  </div>

                  <div className="event-body">
                    <div className="event-club-name mb-8">🏛️ {event.clubName}</div>
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-desc">{event.description.slice(0, 100)}...</p>

                    <div className="event-meta-grid">
                      <div className="event-meta-item"><span>📍</span> {event.venue}</div>
                      <div className="event-meta-item"><span>🕒</span> {event.time}</div>
                      <div className="event-meta-item"><span>👥</span> {event.registeredCount}/{event.maxParticipants}</div>
                      <div className="event-meta-item"><span>💰</span> {event.fee}</div>
                    </div>

                    <div className="event-footer">
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedEvent(event)}>Details</button>
                      {user?.role !== 'admin' && (
                          isMyEventsRoute ? (
                            registrations.find(r => r.eventId === event.id && r.regNo === user?.regNo)?.certificate ? (
                              <button 
                                className="btn btn-sm btn-primary" 
                                style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                                onClick={() => handleDownloadCert(registrations.find(r => r.eventId === event.id && r.regNo === user?.regNo).certificate)}
                              >
                                📥 Download Cert
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-ghost" disabled>⏳ Processing Cert</button>
                            )
                          ) : (
                            <button
                              className={`btn btn-sm ${isUserRegistered(event.id) ? 'btn-ghost' : 'btn-primary'}`}
                              style={!isUserRegistered(event.id) && event.status !== 'pending' && !isFull(event) && !isDeadlinePassed(event) ? { backgroundColor: getCategoryColor(event.category), borderColor: getCategoryColor(event.category) } : {}}
                              disabled={isFull(event) || isDeadlinePassed(event) || isUserRegistered(event.id) || event.status === 'pending'}
                              onClick={() => handleRegister(event.id)}
                            >
                              {isUserRegistered(event.id) ? '✓ Registered' : event.status === 'pending' ? '🕒 Pending' : isFull(event) ? '🚫 Full' : isDeadlinePassed(event) ? '⌛ Closed' : '🎟️ Register'}
                            </button>
                          )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleCertUpload}
            />
          <div className="modal-content-header" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-16">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-8 mb-4">
                  <span className="badge badge-primary-subtle">{selectedEvent.category}</span>
                  {selectedEvent.status === 'pending' && <span className="badge badge-warning-subtle">Pending Approval</span>}
                </div>
                <h2 className="modal-title" style={{ fontSize: '1.8rem', margin: 0 }}>{selectedEvent.title}</h2>
                <p className="text-muted text-sm font-medium">🏛️ {selectedEvent.clubName}</p>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={() => setSelectedEvent(null)} style={{ fontSize: '1.2rem', padding: '4px 8px' }}>✕</button>
            </div>
          </div>

            <div className="modal-body">
              <div className="event-detail-grid">
                <div className="event-detail-main">
                  <h4 className="modal-section-title">About Event</h4>
                  <p className="modal-desc">{selectedEvent.description}</p>

                  {selectedEvent.requirements && (
                    <>
                      <h4 className="modal-section-title">Requirements</h4>
                      <p className="text-sm text-secondary mb-24">🔹 {selectedEvent.requirements}</p>
                    </>
                  )}

                  <div className="event-info-cards">
                    <div className="info-card">
                      <span className="info-icon">📅</span>
                      <div>
                        <p className="info-label">Date & Time</p>
                        <p className="info-value">{new Date(selectedEvent.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <p className="info-sub">{selectedEvent.time} onwards</p>
                      </div>
                    </div>
                    <div className="info-card">
                      <span className="info-icon">💰</span>
                      <div>
                        <p className="info-label">Registration Fee</p>
                        <p className="info-value">{selectedEvent.fee}</p>
                        {selectedEvent.prize && <p className="info-sub">Prizes worth {selectedEvent.prize}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="event-detail-sidebar">
                  <div className="event-registration-card">
                    <h4 className="modal-section-title">Registration Status</h4>
                    <div className="reg-status-box">
                      <div className="progress-bar mb-8">
                        <div className="progress-fill" style={{ width: `${(selectedEvent.registeredCount / selectedEvent.maxParticipants) * 100}%` }}></div>
                      </div>
                      <p className="text-sm font-bold mb-4">{selectedEvent.registeredCount} / {selectedEvent.maxParticipants} spots filled</p>
                      <p className="text-xs text-muted mb-16">Deadline: {new Date(selectedEvent.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>

                      {user?.role !== 'admin' && (
                        <button
                          className={`btn w-full ${isUserRegistered(selectedEvent.id) ? 'btn-ghost' : 'btn-primary'}`}
                          disabled={isFull(selectedEvent) || isDeadlinePassed(selectedEvent) || isUserRegistered(selectedEvent.id) || selectedEvent.status === 'pending'}
                          onClick={() => handleRegister(selectedEvent.id)}
                        >
                          {isUserRegistered(selectedEvent.id) ? 'Already Registered' : selectedEvent.status === 'pending' ? 'Pending Approval' : isFull(selectedEvent) ? 'Registrations Full' : isDeadlinePassed(selectedEvent) ? 'Registration Closed' : 'Register Now'}
                        </button>
                      )}

                      {/* Feedback Section */}
                      {isUserRegistered(selectedEvent.id) && registrations.find(r => r.eventId === selectedEvent.id && r.regNo === user?.regNo)?.attended && !hasUserFeedback(selectedEvent.id) && (
                        <div className="feedback-section mt-24 pt-16 border-t border-divider">
                          <h4 className="text-sm font-bold mb-8">Share your experience</h4>
                          {!submittingFeedback ? (
                            <button className="btn btn-sm btn-ghost w-full" onClick={() => setSubmittingFeedback(true)}>✨ Leave Feedback</button>
                          ) : (
                            <div className="space-y-12">
                              <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span 
                                    key={star} 
                                    className={`cursor-pointer text-xl ${rating >= star ? 'text-warning' : 'text-muted'}`}
                                    onClick={() => setRating(star)}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <textarea 
                                className="form-control text-xs" 
                                placeholder="Any comments?..." 
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                              ></textarea>
                              <div className="flex gap-4">
                                <button className="btn btn-sm btn-ghost flex-1" onClick={() => setSubmittingFeedback(false)}>Cancel</button>
                                <button className="btn btn-sm btn-primary flex-1" disabled={!rating} onClick={handleFeedbackSubmit}>Submit</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {hasUserFeedback(selectedEvent.id) && (
                         <div className="feedback-section mt-24 pt-16 border-t border-divider">
                            <p className="text-xs text-success font-bold flex items-center gap-4">
                              <span>✅</span> You've already submitted feedback.
                            </p>
                         </div>
                      )}
                    </div>
                  </div>

                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div className="event-tags-box mt-24">
                      <h4 className="modal-section-title">Tags</h4>
                      <div className="flex gap-8 flex-wrap">
                        {selectedEvent.tags.map(t => <span key={t} className="chip">{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Management for Admins and Club Heads */}
            {(user?.role === 'admin' || (user?.role === 'clubhead' && selectedEvent.clubId === user.clubId)) && (
              <div className="event-registrations-admin mt-32">
                <div className="flex justify-between items-center mb-16">
                  <h4 className="modal-section-title mb-0">Registrations & Certificates</h4>
                  <div className="flex items-center gap-12">
                    <button className="btn btn-ghost btn-sm" onClick={() => exportAttendees(selectedEvent.id, selectedEvent.title)}>📥 Export Attendees</button>
                    <span className="badge badge-primary-subtle">{registrations.filter(r => r.eventId === selectedEvent.id).length} Students registered</span>
                  </div>
                </div>
                
                <div className="reg-table-container">
                  <table className="reg-table">
                    <thead>
                      <tr>
                        <th>Student Details</th>
                        <th>Reg No</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.filter(r => r.eventId === selectedEvent.id).length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-20 text-muted">No students registered yet.</td></tr>
                      ) : (
                        registrations.filter(r => r.eventId === selectedEvent.id).map(reg => (
                          <tr key={reg.id}>
                            <td>
                              <div className="flex items-center gap-8">
                                <div className="avatar avatar-xs">{reg.name[0]}</div>
                                <div>
                                  <p className="font-bold text-sm">{reg.name}</p>
                                  <p className="text-xs text-muted">{reg.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-sm font-medium">{reg.regNo}</td>
                            <td>
                              <div className="flex flex-col gap-4">
                                <span className={`badge ${reg.attended ? 'badge-success' : 'badge-warning'}`}>
                                  {reg.attended ? '✅ Attended' : '🕒 Not Marked'}
                                </span>
                                {reg.certificate && <span className="badge badge-primary-subtle">📄 Cert Issued</span>}
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-8">
                                {!reg.attended ? (
                                  <button className="btn btn-sm btn-ghost" onClick={() => updateRegistrationStatus(reg.id, { attended: true })}>Mark Attended</button>
                                ) : (
                                  !reg.certificate ? (
                                    <button className="btn btn-sm btn-primary" onClick={() => triggerUpload(reg.id)}>Upload Cert</button>
                                  ) : (
                                    <span className="text-xs text-primary font-bold">📄 {reg.certificate}</span>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
