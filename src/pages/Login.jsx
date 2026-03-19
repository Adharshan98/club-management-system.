import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@vitchennai.ac.in', password: 'admin123', color: '#ff4757', icon: '🛡️' },
    { label: 'Club Head', email: 'clubhead@vitchennai.ac.in', password: 'head123', color: '#6c63ff', icon: '⚙️' },
    { label: 'Student', email: 'student@vitchennai.ac.in', password: 'student123', color: '#2ed573', icon: '🎓' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = login(form.email, form.password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  const fillDemo = (acc) => {
    setForm({ email: acc.email, password: acc.password })
    setError('')
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-orb-1"></div>
        <div className="auth-orb-2"></div>
        <div className="auth-visual-content">
          <div className="auth-logo">CH</div>
          <h2 className="auth-visual-title">Welcome to<br /><span>ClubHub</span></h2>
          <p className="auth-visual-sub">VIT Chennai's centralized platform for student clubs and events.</p>
          <div className="auth-features">
            {['Discover & join clubs', 'Register for events', 'Track your journey', 'Get announcements'].map(f => (
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
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Access your ClubHub account</p>
          </div>

          {/* Demo Accounts */}
          <div className="demo-accounts">
            <p className="demo-label">Quick Demo Access:</p>
            <div className="demo-btns">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.label}
                  className="demo-btn"
                  style={{ borderColor: acc.color, color: acc.color }}
                  onClick={() => fillDemo(acc)}
                  type="button"
                  id={`demo-${acc.label.toLowerCase().replace(' ', '-')}-btn`}
                >
                  {acc.icon} {acc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="auth-divider"><span>or sign in manually</span></div>

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="yourname@vitchennai.ac.in"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button type="submit" className="btn btn-primary btn-lg w-full" id="login-submit-btn" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : '🔑 Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
