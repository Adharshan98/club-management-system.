import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventContext'
import './CreateEvent.css'

export default function CreateEvent() {
  const { user } = useAuth()
  const { addEvent } = useEvents()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [poster, setPoster] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    description: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    venue: '',
    maxParticipants: '',
    registrationDeadline: '',
    fee: 'Free',
    prize: '',
    requirements: '',
    tags: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPoster(e.target.files[0].name)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Create new event object
    const newEvent = {
      ...formData,
      clubId: user?.clubId || 1,
      clubName: user?.clubName || 'My Club',
      color: '#6c63ff',
      coverGradient: 'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)',
    }

    // Simulate API call
    setTimeout(() => {
      addEvent(newEvent)
      setLoading(false)
      // Broadcast success (Toast is global)
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: 'Event submitted for approval! 🎉', type: 'success' } 
      }))
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="create-event-header">
        <h1 className="page-title">✨ Create New Event</h1>
        <p className="page-subtitle">Submit your club's next big event for faculty approval</p>
      </div>

      <div className="card create-event-card">
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-section">
            <h3 className="section-title">📍 Basic Information</h3>
            <div className="form-group">
              <label>Event Title</label>
              <input 
                type="text" 
                name="title" 
                placeholder="e.g. Code Sprint 2026" 
                required 
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option>Workshop</option>
                  <option>Hackathon</option>
                  <option>Competition</option>
                  <option>Tournament</option>
                  <option>Seminar</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Venue / Location</label>
                <input 
                  type="text" 
                  name="venue" 
                  placeholder="e.g. TT Hall, Block A" 
                  required 
                  value={formData.venue}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                rows="4" 
                placeholder="Describe your event, goals, and what participants can expect..." 
                required
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">⏰ Schedule & Capacity</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>Start Date & Time</label>
                <div className="flex gap-8">
                  <input type="date" name="date" required value={formData.date} onChange={handleChange} />
                  <input type="time" name="time" required value={formData.time} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <div className="flex gap-8">
                  <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} />
                  <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Max Participants</label>
                <input 
                  type="number" 
                  name="maxParticipants" 
                  placeholder="e.g. 100" 
                  required 
                  value={formData.maxParticipants}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Registration Deadline</label>
                <input 
                  type="date" 
                  name="registrationDeadline" 
                  required 
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">💰 Fee & Poster</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>Registration Fee</label>
                <input 
                  type="text" 
                  name="fee" 
                  placeholder="e.g. Free or ₹200" 
                  required 
                  value={formData.fee}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Prize (Optional)</label>
                <input 
                  type="text" 
                  name="prize" 
                  placeholder="e.g. ₹10,000 + Certificates" 
                  value={formData.prize}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Event Poster</label>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  id="poster-upload" 
                  className="hidden-file-input" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="poster-upload" className="file-upload-label">
                  <span className="upload-icon">📁</span>
                  <span className="upload-text">
                    {poster ? `Selected: ${poster}` : 'Click to upload event poster (PDF, PNG, JPG)'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions mt-32">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : '🚀 Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
