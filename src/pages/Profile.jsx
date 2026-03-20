import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventContext'
import './Profile.css'

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const { members, registrations, events, clubs } = useEvents()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState({
    name: user?.name || '',
    dept: user?.dept || '',
    regNo: user?.regNo || ''
  })

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      setEditValues({
        name: user.name,
        dept: user.dept,
        regNo: user.regNo
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateUser(user.id, editValues)
    setIsEditing(false)
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (!user) return <div className="page-container empty-state">Please login to view your profile.</div>

  return (
    <div className="page-container animate-fade-in">
      <div className="profile-header">
        <div className="profile-banner"></div>
        <div className="profile-info-row">
          <div className="avatar avatar-xl profile-avatar">{getInitials(user.name)}</div>
          <div className="profile-user-details">
            {isEditing ? (
              <div className="profile-edit-form">
                <input 
                  type="text" 
                  name="name" 
                  value={editValues.name} 
                  onChange={handleInputChange} 
                  className="edit-input name-input"
                  placeholder="Full Name"
                />
                <div className="flex gap-8 mt-8">
                  <input 
                    type="text" 
                    name="dept" 
                    value={editValues.dept} 
                    onChange={handleInputChange} 
                    className="edit-input badge-input"
                    placeholder="Department"
                  />
                  <input 
                    type="text" 
                    name="regNo" 
                    value={editValues.regNo} 
                    onChange={handleInputChange} 
                    className="edit-input badge-input"
                    placeholder="Registration No"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="profile-name">{user.name}</h1>
                <p className="profile-email">📧 {user.email}</p>
                <div className="flex gap-8 mt-8">
                  <span className={`badge ${user.role === 'admin' ? 'role-admin' : user.role === 'clubhead' ? 'role-clubhead' : 'role-student'}`}>{user.role}</span>
                  <span className="badge badge-info">🏛️ {user.dept}</span>
                  <span className="badge badge-primary">🆔 {user.regNo}</span>
                </div>
              </>
            )}
          </div>
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn btn-success btn-sm" onClick={handleSave}>Save</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleEditToggle}>Edit Profile</button>
            )}
            <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="profile-content-layout">
        <aside className="profile-sidebar">
          <div className="card mb-24">
            <h3 className="card-title mb-16">Profile Completion</h3>
            <div className="progress-bar mb-8">
              <div className="progress-fill" style={{ width: '85%' }}></div>
            </div>
            <p className="text-sm text-muted">85% complete — almost there!</p>
          </div>

          <div className="card">
            <h3 className="card-title mb-16">Quick Info</h3>
            <div className="info-list">
              <div className="info-item"><span>📞</span><strong>+91 9876543210</strong></div>
              <div className="info-item"><span>🏠</span><strong>Boys Hostel, Block C</strong></div>
              <div className="info-item"><span>🍰</span><strong>Birthday: 12 July</strong></div>
            </div>
          </div>
        </aside>

        <section className="profile-main">
          <div className="tabs mb-24">
            <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>About</button>
            <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
            <button className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>Achievements</button>
          </div>

          <div className="profile-tab-content">
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <div className="card p-24 mb-24">
                  <h4 className="section-title mb-16">Biography</h4>
                  <p className="text-secondary line-height-1.6">
                    A passionate {user.dept} student at VIT Chennai with a keen interest in extracurricular activities.
                    Currently exploring various clubs to build new skills and network with peers.
                    Looking forward to contributing actively to the campus community!
                  </p>
                </div>

                <div className="grid-2">
                  <div className="card p-24">
                    <h4 className="section-title mb-16">Interests</h4>
                    <div className="chips-scroll">
                      <span className="chip">Technology</span>
                      <span className="chip">Design</span>
                      <span className="chip">Sports</span>
                      <span className="chip">Photography</span>
                      <span className="chip">Innovation</span>
                      <span className="chip">Art</span>
                      <span className="chip">Music</span>
                    </div>
                  </div>
                  <div className="card p-24">
                    <h4 className="section-title mb-16">Skills</h4>
                    <div className="chips-scroll">
                      <span className="chip active">ReactJS</span>
                      <span className="chip active">Leadership</span>
                      <span className="chip active">Communication</span>
                      <span className="chip active">Problem Solving</span>
                      <span className="chip active">UI/UX</span>
                      <span className="chip active">Node.js</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="animate-fade-in card p-24">
                <h4 className="section-title mb-16">Club Activities</h4>
                <div className="activity-timeline">
                  {members.filter(m => m.regNo === user?.regNo).map(m => (
                    <div key={`club-${m.id}`} className="timeline-item">
                      <div className="timeline-dot timeline-success">🏛️</div>
                      <div className="timeline-content">
                        <p className="timeline-text">
                          {m.status === 'active' ? 'Joined' : 'Applied for'} {clubs.find(c => c.id === m.clubId)?.name || 'a Club'}
                        </p>
                        <span className="timeline-time">{m.joinedDate}</span>
                      </div>
                    </div>
                  ))}
                  {registrations.filter(r => r.regNo === user?.regNo).map(r => (
                    <div key={`reg-${r.id}`} className="timeline-item">
                      <div className="timeline-dot timeline-info">🎟️</div>
                      <div className="timeline-content">
                        <p className="timeline-text">
                          Registered for {events.find(e => e.id === r.eventId)?.title || 'an Event'}
                        </p>
                        <span className="timeline-time">{r.registeredOn}</span>
                      </div>
                    </div>
                  ))}
                  {members.filter(m => m.regNo === user?.regNo).length === 0 && registrations.filter(r => r.regNo === user?.regNo).length === 0 && (
                    <p className="text-sm text-muted">No recent activity found.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="animate-fade-in grid-2">
                <div className="card p-24 text-center">
                  <span style={{ fontSize: '3rem' }}>🏅</span>
                  <h4 className="font-bold mt-12">Active Member</h4>
                  <p className="text-sm text-muted">Awarded for 90% attendance</p>
                </div>
                <div className="card p-24 text-center">
                  <span style={{ fontSize: '3rem' }}>📜</span>
                  <h4 className="font-bold mt-12">HackVIT Participant</h4>
                  <p className="text-sm text-muted">Participated in 24h Hackathon</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
