import { useState } from 'react'
import { useEvents } from '../context/EventContext'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css' // Reuse styles

export default function AdminPanel() {
  const { user: currentUser, users, updateUser } = useAuth()
  const { clubs, addClub, updateClub, deleteClub, members, events } = useEvents()
  const [activeTab, setActiveTab] = useState('clubs') // 'clubs' or 'clubheads'
  const [showModal, setShowModal] = useState(false)
  const [viewingMembers, setViewingMembers] = useState(null)
  const [editingClub, setEditingClub] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Technical',
    tags: '',
    coverGradient: 'linear-gradient(135deg, #6c63ff 0%, #3f37c9 100%)'
  })

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Technical': return '#6c63ff'
      case 'Non-Technical': return '#2ed573' // Light Green
      case 'Cultural': return '#ffa502'
      case 'Arts': return '#ff4757'
      case 'Sports': return '#00d2d3'
      case 'Professional': return '#5f27cd'
      case 'Social': return '#0abde3'
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

  const openCreate = () => {
    setEditingClub(null)
    setFormData({
      name: '',
      description: '',
      category: 'Technical',
      tags: '',
      coverGradient: 'linear-gradient(135deg, #6c63ff 0%, #3f37c9 100%)'
    })
    setShowModal(true)
  }

  const openEdit = (club) => {
    setEditingClub(club)
    setFormData({
      name: club.name,
      description: club.description,
      category: club.category,
      tags: club.tags.join(', '),
      coverGradient: club.coverGradient
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingClub) {
      updateClub(editingClub.id, formData)
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Club updated! 🏛️✨', type: 'success' } }))
    } else {
      addClub(formData)
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'New club created! 🏛️🆕', type: 'success' } }))
    }
    setShowModal(false)
  }

  const handleAssignClub = (userId, clubId) => {
    const club = clubs.find(c => c.id === parseInt(clubId))
    updateUser(userId, { 
      clubId: club ? club.id : null,
      clubName: club ? club.name : 'Unassigned'
    })
    
    // Also update the club head name in the club object if we find one
    if (club) {
      const headUser = users.find(u => u.id === userId)
      updateClub(club.id, { head: headUser?.name || 'Administrator' })
    }
  }

  const clubHeads = users.filter(u => u.role === 'clubhead')

  const downloadCSV = (data, filename, headers) => {
    const csvRows = []
    csvRows.push(headers.join(','))
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header.toLowerCase().replace(' ', '')] || row[header.toLowerCase()] || ''
        return `"${value}"`
      })
      csvRows.push(values.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: `Exporting ${filename}... 📊📥`, type: 'success' } 
    }))
  }

  const exportClubs = () => {
    const headers = ['Name', 'Category', 'Head', 'Members', 'Events']
    downloadCSV(clubs, 'Club_Directory', headers)
  }

  const exportHeads = () => {
    const headers = ['Name', 'Email', 'ClubName', 'Dept']
    downloadCSV(clubHeads, 'Club_Heads_List', headers)
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header mb-32 flex justify-between items-center">
        <div>
          <h1 className="page-title">🛡️ Admin Panel</h1>
          <p className="page-subtitle">Centralized control for campus clubs and organizations</p>
        </div>
        {activeTab === 'clubs' && (
          <div className="flex gap-12">
            <button className="btn btn-ghost" onClick={exportClubs}>
              <span>📥</span> Export Clubs
            </button>
            <button className="btn btn-primary" onClick={openCreate}>
              <span>➕</span> Create New Club
            </button>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="clubs-chips mb-24">
        <button className={`chip ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>🏛️ Manage Clubs</button>
        <button className={`chip ${activeTab === 'clubheads' ? 'active' : ''}`} onClick={() => setActiveTab('clubheads')}>🛡️ Manage Club Heads</button>
      </div>

      {activeTab === 'clubs' ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏛️ Active Clubs</h3>
            <span className="badge badge-primary">{clubs.length} Total</span>
          </div>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Club Name</th>
                <th>Category</th>
                <th>Stats</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map(club => (
                <tr key={club.id}>
                  <td>
                    <div className="flex items-center gap-12">
                      <div className="avatar avatar-sm" style={{ background: getCategoryGradient(club.category), color: 'white' }}>
                        {club.name ? club.name[0] : 'C'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{club.name || 'Unnamed Club'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{club.tags?.slice(0, 2).join(' • ') || 'No tags'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge text-xs" style={{ backgroundColor: `${getCategoryColor(club.category)}20`, color: getCategoryColor(club.category), border: `1px solid ${getCategoryColor(club.category)}40` }}>
                      {club.category}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col gap-2" style={{ fontSize: '0.85rem' }}>
                      <div className="flex items-center gap-4 text-muted">
                        <span>👥</span>
                        <span className="font-bold" style={{ color: 'var(--primary)' }}>
                          {members.filter(m => m.clubId === club.id && m.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted">
                        <span>📅</span>
                        <span className="font-bold" style={{ color: 'var(--secondary)' }}>
                          {events.filter(e => e.clubId === club.id && e.status === 'approved').length}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex gap-8 justify-end">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewingMembers(club)}>📊 Members</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(club)}>✏️ Edit</button>
                      <button className="btn btn-ghost btn-sm text-danger danger-hover" onClick={() => deleteClub(club.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🛡️ Club Head Assignments</h3>
            <div className="flex items-center gap-12">
              <button className="btn btn-ghost btn-sm" onClick={exportHeads}>📥 Export Heads</button>
              <span className="badge badge-primary">{clubHeads.length} Total</span>
            </div>
          </div>
          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Club Head</th>
                  <th>Current Club</th>
                  <th style={{ textAlign: 'right' }}>Assign Club</th>
                </tr>
              </thead>
              <tbody>
                {clubHeads.map(head => (
                  <tr key={head.id}>
                    <td>
                      <div className="flex items-center gap-12">
                        <div className="avatar avatar-sm">{head.name ? head.name[0] : 'U'}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{head.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{head.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge text-xs" style={{ backgroundColor: head.clubId ? 'var(--primary-light)' : '#f1f2f6', color: head.clubId ? 'var(--primary)' : '#747d8c' }}>
                        {head.clubName || 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select 
                        className="filter-select" 
                        value={head.clubId || ''} 
                        onChange={(e) => handleAssignClub(head.id, e.target.value)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <option value="">Unassigned</option>
                        {clubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {/* Member List Modal */}
      {viewingMembers && (
        <div className="modal-overlay" onClick={() => setViewingMembers(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">👥 {viewingMembers.name} Members</h2>
                <p className="text-sm text-muted">Directory of all registered students</p>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={() => setViewingMembers(null)}>✕</button>
            </div>
            <div className="modal-body p-0" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table className="reg-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Reg No</th>
                      <th>Dept</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.filter(m => m.clubId === viewingMembers.id).length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-40 text-muted">No members found for this club.</td></tr>
                    ) : (
                      members.filter(m => m.clubId === viewingMembers.id).map(m => (
                        <tr key={m.id}>
                          <td>
                            <div className="flex items-center gap-12">
                              <div className="avatar avatar-xs">{m.name[0]}</div>
                              <span className="font-bold text-sm">{m.name}</span>
                            </div>
                          </td>
                          <td className="text-sm font-medium">{m.regNo}</td>
                          <td className="text-sm">{m.dept}</td>
                          <td>
                            <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                              {m.status === 'active' ? '✅ Active' : '⌛ Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer p-16">
              <button className="btn btn-primary" onClick={() => setViewingMembers(null)}>Close Directory</button>
            </div>
          </div>
        </div>
      )}
      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingClub ? 'Edit Club' : 'Create New Club'}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-24">
                <div className="form-group">
                  <label className="form-label">Club Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Technical</option>
                    <option>Non-Technical</option>
                    <option>Cultural</option>
                    <option>Arts</option>
                    <option>Sports</option>
                    <option>Professional</option>
                    <option>Social</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Coding, Innovation, AI"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Gradient (CSS)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.coverGradient}
                    onChange={e => setFormData({...formData, coverGradient: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer p-24">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingClub ? 'Save Changes' : 'Create Club'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
