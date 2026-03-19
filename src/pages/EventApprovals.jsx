import { useEvents } from '../context/EventContext'
import './Dashboard.css' // Reuse dashboard/table styles for consistency

export default function EventApprovals() {
  const { events, approveEvent, rejectEvent } = useEvents()
  const pendingEvents = events.filter(e => e.status === 'pending')

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

  const handleApproveEvent = (id) => {
    approveEvent(id)
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: 'Event approved! 📅✅', type: 'success' } 
    }))
  }

  const handleRejectEvent = (id) => {
    if (window.confirm('Are you sure you want to reject this event?')) {
      rejectEvent(id)
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: 'Event rejected. ❌', type: 'info' } 
      }))
    }
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header mb-32">
        <h1 className="page-title">✅ Event Approvals</h1>
        <p className="page-subtitle">Review and manage pending event requests from campus clubs</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⏳ Pending Requests</h3>
          <span className="badge badge-warning">{pendingEvents.length} items</span>
        </div>
        
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          {pendingEvents.length === 0 ? (
            <div className="empty-state py-48">
              <div className="empty-state-icon">✨</div>
              <div className="empty-state-title">All clear!</div>
              <div className="empty-state-text">No pending event requests at the moment.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Club</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEvents.map(ev => (
                  <tr key={ev.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.8rem', color: getCategoryColor(ev.category), fontWeight: 600 }}>{ev.category}</div>
                      </div>
                    </td>
                    <td><span className="badge badge-primary-subtle">{ev.clubName}</span></td>
                    <td>{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-8 justify-end">
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleApproveEvent(ev.id)}
                          title="Approve Event"
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleRejectEvent(ev.id)}
                          title="Reject Event"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="card mt-24 p-20" style={{ background: 'rgba(67, 230, 181, 0.05)', border: '1px solid rgba(67, 230, 181, 0.2)' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--accent)' }}>💡 Admin Tip</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Approving an event makes it immediately visible to all students on the <strong>Campus Events</strong> page 
          and adds a notification for the respective club members.
        </p>
      </div>
    </div>
  )
}
