import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventContext'
import './Dashboard.css' // Reusing dashboard styles for consistency

export default function ManageClub() {
  const { user } = useAuth()
  const { 
    members, clubSettings,
    approveMember, rejectMember, removeMember,
    updateClubSettings, updateMemberAttendance,
    updateMemberRole
  } = useEvents()

  const handleApproveMemberAction = (memberId) => {
    approveMember(memberId)
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Member Approved! ✅', type: 'success' } 
    }))
  }

  const handleRejectMemberAction = (memberId) => {
    rejectMember(memberId)
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Application Rejected ✗', type: 'warning' } 
    }))
  }

  const handleRemoveMemberAction = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMember(memberId)
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: 'Member Removed', type: 'danger' } 
      }))
    }
  }

  if (user?.role !== 'clubhead') {
    return (
      <div className="page-container">
        <div className="card">
          <div className="card-body">Access Denied. This page is for Club Heads only.</div>
        </div>
      </div>
    )
  }

  if (!user?.clubId) {
    return (
      <div className="page-container animate-fade-in">
        <div className="page-title">⚙️ Manage Club</div>
        <div className="card mt-24">
          <div className="empty-state">
            <div className="empty-state-icon">🛡️</div>
            <div className="empty-state-title">No Club Assigned</div>
            <div className="empty-state-text">You haven't been assigned to manage a club yet. Please contact the Administrator to complete your setup.</div>
          </div>
        </div>
      </div>
    )
  }

  const clubMembers = members.filter(m => m.clubId === user.clubId)
  const activeMembersCount = clubMembers.filter(m => m.status === 'active').length

  const CLUB_ROLES = [
    { label: 'Member', hint: 'Regular club member' },
    { label: 'President / Head', hint: 'Boss of the club (Major decisions)' },
    { label: 'Secretary', hint: 'Organizer (Meetings, Records, Docs)' },
    { label: 'Treasurer', hint: 'Finance manager (Money, Budget, Expenses)' },
    { label: 'Technical Lead', hint: 'Tech expert (Coding, Projects, Skills)' },
    { label: 'Marketing / PR Lead', hint: 'Promotion head (Social media, Posters)' },
    { label: 'Event Coordinator', hint: 'Event manager (Planning, Logistics)' }
  ]

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title">⚙️ Manage Club</div>
      <p className="page-subtitle">Track member attendance and manage applications for your club.</p>

      <div className="card mt-24">
        <div className="card-header justify-between">
          <div className="flex items-center gap-12">
            <h3 className="card-title">👥 Members</h3>
            <span className="badge badge-primary">{activeMembersCount} members</span>
          </div>
          <div className="flex items-center gap-12">
            <label htmlFor="total-events-select" className="text-sm font-bold text-muted">Total Events:</label>
            <select 
              id="total-events-select"
              className="form-control" 
              style={{ width: '80px', padding: '4px 8px' }}
              value={clubSettings[user.clubId]?.totalEvents || 10}
              onChange={(e) => updateClubSettings(user.clubId, { totalEvents: parseInt(e.target.value) })}
            >
              {[...Array(500)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Reg No</th><th>Role</th><th>Status</th><th>Attended</th><th>Attendance %</th><th style={{ textAlign: 'center' }}>Actions</th></tr>
            </thead>
            <tbody>
              {clubMembers.map(m => (
                <tr key={m.id}>
                  <td><div className="flex items-center gap-8"><div className="avatar avatar-sm" style={{ fontSize: '0.65rem' }}>{m.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>{m.name}</div></td>
                  <td><code style={{ fontSize: '0.82rem' }}>{m.regNo}</code></td>
                  <td>
                    {m.status === 'active' ? (
                      <select 
                        className="form-control" 
                        style={{ width: '160px', padding: '4px 8px', fontSize: '0.85rem' }} 
                        value={m.role || 'Member'}
                        onChange={(e) => updateMemberRole(m.id, e.target.value)}
                      >
                        {CLUB_ROLES.map(role => (
                          <option key={role.label} value={role.label} title={role.hint}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                  <td><span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{m.status}</span></td>
                  <td>
                    <div className="flex items-center gap-8">
                      <input 
                        type="number" 
                        className="form-control" 
                        style={{ width: '60px', padding: '4px 8px' }}
                        value={m.attendedEvents || 0}
                        onChange={(e) => updateMemberAttendance(m.id, parseInt(e.target.value))}
                        min="0"
                        max={clubSettings[user.clubId]?.totalEvents || 10}
                      />
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>/ {clubSettings[user.clubId]?.totalEvents || 10}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${m.attendance}%`, background: m.attendance > 80 ? 'var(--success)' : m.attendance > 60 ? 'var(--warning)' : 'var(--danger)' }}></div>
                      </div>
                      <span className="text-sm">{m.attendance}%</span>
                    </div>
                  </td>
                  <td>
                    {m.status === 'pending' ? (
                      <div className="flex gap-8 justify-center">
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleApproveMemberAction(m.id)}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleRejectMemberAction(m.id)}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <button 
                          className="btn btn-sm" 
                          style={{ color: 'var(--danger)', border: '1px solid var(--danger)', padding: '4px 12px' }}
                          onClick={() => handleRemoveMemberAction(m.id)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {clubMembers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No members yet. Encourage students to join your club!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
