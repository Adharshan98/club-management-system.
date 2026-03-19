import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', regNo: '', dept: '', password: '', confirm: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const DEPTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'BME', 'CHEM', 'MBA']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match!'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    register(form)
    navigate('/login')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-orb-1"></div>
        <div className="auth-orb-2"></div>
        <div className="auth-visual-content">
          <div className="auth-logo">CH</div>
          <h2 className="auth-visual-title">Join<br /><span>ClubHub</span></h2>
          <p className="auth-visual-sub">Become part of VIT Chennai's vibrant student community today!</p>
          <div className="auth-features">
            {['Access 12+ student clubs', 'Register for 80+ events/year', 'Build your campus portfolio', 'Connect with 1,400+ students'].map(f => (
              <div key={f} className="auth-feature-item">
                <span className="auth-feature-check">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container animate-slide-up">
          <div className="auth-form-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join the VIT Chennai club community</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input id="reg-name" type="text" className="form-control" placeholder="Your full name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-regno">Register Number</label>
                <input id="reg-regno" type="text" className="form-control" placeholder="22BCE1234"
                  value={form.regNo} onChange={e => setForm({ ...form, regNo: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">VIT Email Address</label>
              <input id="reg-email" type="email" className="form-control" placeholder="yourname@vitchennai.ac.in"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-dept">Department</label>
                <select id="reg-dept" className="form-control" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} required>
                  <option value="">Select dept.</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">Role</label>
                <select id="reg-role" className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="clubhead">Club Head</option>
                  <option value="admin">Admin (Faculty/Main)</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input id="reg-password" type="password" className="form-control" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <input id="reg-confirm" type="password" className="form-control" placeholder="Re-enter password"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
              </div>
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button type="submit" className="btn btn-primary btn-lg w-full" id="register-submit-btn" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : '🚀 Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
