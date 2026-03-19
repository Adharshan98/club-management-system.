import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-orb orb-1"></div>
        <div className="hero-orb orb-2"></div>
        <div className="hero-orb orb-3"></div>

        <div className="hero-content animate-slide-up">
          <div className="hero-badge">
            <span>🎓</span> VIT Chennai's Official Club Platform
          </div>
          <h1 className="hero-title">
            Your Gateway to<br />
            <span className="gradient-text">Campus Life</span>
          </h1>
          <p className="hero-subtitle">
            Discover clubs, attend events, track your campus journey — all in one beautifully designed platform built for VIT Chennai students.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-dashboard-btn">
                  📊 Go to Dashboard
                </Link>
                <Link to="/clubs" className="btn btn-secondary btn-lg" id="hero-clubs-btn">
                  🏛️ Explore Clubs
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
                  🚀 Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">
                  🔑 Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Floating Cards */}
        <div className="hero-visual">
          <div className="floating-card card-1 animate-float">
            <div className="floating-card-icon">🚀</div>
            <div className="floating-card-text">Launch Club<br /><span>Join the platform</span></div>
          </div>
          <div className="floating-card card-2 animate-float" style={{ animationDelay: '1s' }}>
            <div className="floating-card-icon">🏆</div>
            <div className="floating-card-text">Best Club Award<br /><span>Tech Wizards</span></div>
          </div>
          <div className="floating-card card-3 animate-float" style={{ animationDelay: '2s' }}>
            <div className="floating-card-icon">👥</div>
            <div className="floating-card-text">1,420+ Members<br /><span>Across 12 clubs</span></div>
          </div>
        </div>
      </section>
    </div>
  )
}
