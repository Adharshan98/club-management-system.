import { useState, useMemo } from 'react'
import { useEvents } from '../context/EventContext'
import { useAuth } from '../context/AuthContext'
import './Leaderboard.css'

export default function Leaderboard() {
  const { getLeaderboardData } = useEvents()
  const { users } = useAuth()
  const [activeTab, setActiveTab] = useState('members') // 'members' or 'clubs'
  const { topMembers, topClubs } = useMemo(() => getLeaderboardData(users), [getLeaderboardData, users])

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header mb-32 flex justify-between items-end">
        <div>
          <div className="page-title">🏆 Campus Leaderboard</div>
          <p className="page-subtitle">Recognizing the most active students and high-performing clubs this semester.</p>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            👥 Top Members
          </button>
          <button 
            className={`tab-btn ${activeTab === 'clubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('clubs')}
          >
            🏛️ Top Clubs
          </button>
        </div>
      </div>

      <div className="leaderboard-content">
        {activeTab === 'members' ? (
          <div className="leaderboard-grid animate-slide-up">
            <div className="ranking-card main-card">
              <div className="card-header">
                <h3 className="card-title">Student Rankings</h3>
              </div>
              <div className="table-container">
                <table className="reg-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Reg No</th>
                      <th>Dept</th>
                      <th className="text-right">Activity Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMembers.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-32 text-muted">No point data available yet.</td></tr>
                    ) : (
                      topMembers.map((member, index) => (
                        <tr key={member.regNo} className={index < 3 ? `top-rank rank-${index + 1}` : ''}>
                          <td>
                            <div className="rank-badge">
                              {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-8">
                              <div className="avatar avatar-sm">{member.name[0]}</div>
                              <span className="font-bold">{member.name}</span>
                            </div>
                          </td>
                          <td>{member.regNo}</td>
                          <td>{member.dept}</td>
                          <td className="text-right font-black text-primary">{member.points} pts</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="info-sidebar">
              <div className="card p-24 bg-primary-subtle border-primary/20">
                <h4 className="font-bold mb-8">How are points calculated?</h4>
                <p className="text-xs text-secondary mb-16">Active participation earns you points and recognition across campus!</p>
                <ul className="text-xs space-y-8">
                  <li className="flex items-center gap-8"><span>✅</span> <strong>10 pts</strong> per event attendance</li>
                  <li className="flex items-center gap-8"><span>⭐</span> Top 3 get special profile badges</li>
                  <li className="flex items-center gap-8"><span>🏅</span> Points reset every semester</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="leaderboard-grid animate-slide-up">
            <div className="ranking-card main-card">
              <div className="card-header">
                <h3 className="card-title">Club Performance</h3>
              </div>
              <div className="rows-container p-24">
                {topClubs.map((club, index) => (
                  <div key={club.id} className={`club-performance-row ${index === 0 ? 'top-rank' : ''}`}>
                    <div className="rank-col">
                      <span className="rank-num">{index + 1}</span>
                    </div>
                    
                    <div className="badge-col">
                      <div className="club-badge-circle">
                        {club.tag || 'CL'}
                      </div>
                    </div>
                    
                    <div className="info-col">
                      <h4 className="club-name-text">{club.name}</h4>
                      <p className="club-meta-text">{club.category} • {club.head}</p>
                    </div>
                    
                    <div className="stats-group">
                      <div className="stat-item rating">
                        <span className="stat-label">RATING</span>
                        <span className="stat-value">⭐ {club.avgRating > 0 ? club.avgRating.toFixed(1) : 'N/A'}</span>
                      </div>
                      <div className="stat-item feedback">
                        <span className="stat-label">REVIEWS</span>
                        <span className="stat-value">{club.feedbackCount}</span>
                      </div>
                      <div className="stat-item score">
                        <span className="stat-label">TOTAL SCORE</span>
                        <span className="stat-value highlight">{club.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
