import { createContext, useContext, useState, useEffect } from 'react'
import { 
  EVENTS as initialEvents, 
  ANNOUNCEMENTS as initialAnnouncements,
  CLUBS as initialClubs,
  MEMBERS as initialMembers,
  REGISTRATIONS as initialRegistrations,
  FEEDBACK as initialFeedback
} from '../data/mockData'
import { useAuth } from './AuthContext'

const EventContext = createContext()

export function EventProvider({ children }) {
  const { user } = useAuth()
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('clubhub-events')
    return saved ? JSON.parse(saved) : initialEvents
  })

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('clubhub-announcements')
    return saved ? JSON.parse(saved) : initialAnnouncements
  })

  const [clubs, setClubs] = useState(() => {
    const saved = localStorage.getItem('clubhub-clubs')
    return saved ? JSON.parse(saved) : initialClubs
  })

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('clubhub-members')
    return saved ? JSON.parse(saved) : initialMembers
  })

  const [registrations, setRegistrations] = useState(() => {
    const saved = localStorage.getItem('clubhub-registrations')
    return saved ? JSON.parse(saved) : initialRegistrations
  })

  const [clubSettings, setClubSettings] = useState(() => {
    const saved = localStorage.getItem('clubhub-club-settings')
    return saved ? JSON.parse(saved) : {} // { clubId: { totalEvents: 10 } }
  })

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('clubhub-notifications')
    return saved ? JSON.parse(saved) : []
  })
  
  const [feedback, setFeedback] = useState(() => {
    const saved = localStorage.getItem('clubhub-feedback')
    return saved ? JSON.parse(saved) : initialFeedback
  })

  // Persistence
  useEffect(() => localStorage.setItem('clubhub-events', JSON.stringify(events)), [events])
  useEffect(() => localStorage.setItem('clubhub-announcements', JSON.stringify(announcements)), [announcements])
  useEffect(() => localStorage.setItem('clubhub-clubs', JSON.stringify(clubs)), [clubs])
  useEffect(() => localStorage.setItem('clubhub-members', JSON.stringify(members)), [members])
  useEffect(() => localStorage.setItem('clubhub-registrations', JSON.stringify(registrations)), [registrations])
  useEffect(() => localStorage.setItem('clubhub-club-settings', JSON.stringify(clubSettings)), [clubSettings])
  useEffect(() => localStorage.setItem('clubhub-notifications', JSON.stringify(notifications)), [notifications])
  useEffect(() => localStorage.setItem('clubhub-feedback', JSON.stringify(feedback)), [feedback])

  const addEvent = (newEvent) => {
    // Normalize registration deadline to end of day if only date is provided
    let normalizedDeadline = newEvent.registrationDeadline
    if (normalizedDeadline && !normalizedDeadline.includes('T') && !normalizedDeadline.includes(':')) {
      normalizedDeadline = `${normalizedDeadline}T23:59:59`
    }

    const eventWithId = {
      ...newEvent,
      registrationDeadline: normalizedDeadline,
      id: Date.now(), // Real-time unique ID
      status: 'pending',
      registeredCount: 0,
    }
    setEvents(prev => [eventWithId, ...prev])
  }

  const approveEvent = (eventId) => {
    setEvents(prev => {
      const updated = prev.map(e => {
        if (e.id === eventId) {
          // Trigger notification for newly approved event
          addNotification('event', 'New Event Approved! 📅', `${e.clubName} is hosting "${e.title}"!`)
          return { ...e, status: 'approved' }
        }
        return e
      })
      return updated
    })
  }

  const rejectEvent = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }

  const addAnnouncement = (newAnn) => {
    const annWithId = {
      ...newAnn,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      pinned: false
    }
    setAnnouncements(prev => [annWithId, ...prev])
    addNotification('announcement', 'New Announcement 📢', `${newAnn.clubName}: ${newAnn.title}`)
  }

  const deleteAnnouncement = (annId) => {
    setAnnouncements(prev => prev.filter(a => a.id !== annId))
  }

  const joinClub = (memberData) => {
    const newMember = {
      ...memberData,
      id: Date.now(),
      status: 'pending',
      joinedDate: new Date().toISOString().split('T')[0],
      attendance: 0
    }
    setMembers(prev => [...prev, newMember])
    
    // Increment member count in the club
    setClubs(prev => prev.map(c => 
      c.id === memberData.clubId ? { ...c, members: (c.members || 0) + 1 } : c
    ))
  }

  const approveMember = (memberId) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, status: 'active', role: 'Member' } : m
    ))
  }

  const rejectMember = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  const removeMember = (memberId) => {
    const memberToRemove = members.find(m => m.id === memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
    
    if (memberToRemove) {
      setClubs(prev => prev.map(c => 
        c.id === memberToRemove.clubId ? { ...c, members: Math.max(0, (c.members || 0) - 1) } : c
      ))
    }
  }

  const registerForEvent = (regData) => {
    const newReg = {
      ...regData,
      id: Date.now(),
      registeredOn: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      attended: false
    }
    setRegistrations(prev => [...prev, newReg])
    
    // Also increment registeredCount for the event
    setEvents(prev => prev.map(e => 
      e.id === regData.eventId ? { ...e, registeredCount: (e.registeredCount || 0) + 1 } : e
    ))
  }

  const updateClubSettings = (clubId, settings) => {
    setClubSettings(prev => {
      const newSettings = {
        ...prev,
        [clubId]: { ...(prev[clubId] || { totalEvents: 10 }), ...settings }
      }
      
      // If totalEvents changed, update all members of this club
      if (settings.totalEvents) {
        setMembers(prevMembers => prevMembers.map(m => {
          if (m.clubId === clubId) {
            const attended = m.attendedEvents || 0
            const attendance = Math.round((attended / settings.totalEvents) * 100)
            return { ...m, attendance }
          }
          return m
        }))
      }
      
      return newSettings
    })
  }

  const updateMemberAttendance = (memberId, attendedCount) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const total = clubSettings[m.clubId]?.totalEvents || 10
        const attendance = Math.round((attendedCount / total) * 100)
        return { ...m, attendedEvents: attendedCount, attendance }
      }
      return m
    }))
  }

  const updateMemberRole = (memberId, role) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role } : m
    ))
  }

  const addClub = (newClub) => {
    const clubWithId = {
      ...newClub,
      id: Date.now(),
      members: 0,
      events: 0,
      joinedBy: [],
      achievements: [],
      founded: new Date().getFullYear().toString(),
      head: user?.name || 'Administrator',
      email: user?.email || 'admin@vit.ac.in',
      tag: newClub.name ? newClub.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CL',
      tags: typeof newClub.tags === 'string' ? newClub.tags.split(',').map(t => t.trim()) : (newClub.tags || []),
    }
    setClubs(prev => [...prev, clubWithId])
  }

  const updateClub = (clubId, updatedData) => {
    setClubs(prev => prev.map(c => 
      c.id === clubId ? { 
        ...c, 
        ...updatedData, 
        tags: typeof updatedData.tags === 'string' ? updatedData.tags.split(',').map(t => t.trim()) : (updatedData.tags || c.tags || []) 
      } : c
    ))
  }

  const deleteClub = (clubId) => {
    if (window.confirm('Are you sure? This will delete the club and all its data.')) {
      setClubs(prev => prev.filter(c => c.id !== clubId))
      setMembers(prev => prev.filter(m => m.clubId !== clubId))
      setEvents(prev => prev.filter(e => e.clubId !== clubId))
    }
  }

  const addNotification = (type, title, message) => {
    const newNotif = {
      id: Date.now(),
      type, // 'event', 'announcement', 'system'
      title,
      message,
      time: 'Just now',
      read: false
    }
    setNotifications(prev => [newNotif, ...prev])
  }

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const updateRegistrationStatus = (regId, data) => {
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, ...data } : r
    ))
  }

  const addFeedback = (feedbackData) => {
    const newFeedback = {
      ...feedbackData,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    }
    setFeedback(prev => [...prev, newFeedback])
  }

  const getLeaderboardData = () => {
    // Student rankings based on 10 pts per attended event
    const studentPoints = {}
    registrations.filter(r => r.attended).forEach(r => {
      studentPoints[r.regNo] = (studentPoints[r.regNo] || 0) + 10
    })
    
    // Club rankings
    const clubPerformance = clubs.map(club => {
      const clubEvents = events.filter(e => e.clubId === club.id && e.status === 'approved')
      const eventPoints = clubEvents.length * 50
      
      const clubFeedback = feedback.filter(f => {
        const event = events.find(e => e.id === f.eventId)
        return event && event.clubId === club.id
      })
      
      const avgRating = clubFeedback.length > 0 
        ? clubFeedback.reduce((acc, curr) => acc + curr.rating, 0) / clubFeedback.length 
        : 0
      
      const feedbackPoints = Math.round(avgRating * 20)
      
      return {
        ...club,
        score: eventPoints + feedbackPoints,
        avgRating,
        feedbackCount: clubFeedback.length
      }
    }).sort((a, b) => b.score - a.score)

    return {
      topMembers: Object.keys(studentPoints).map(regNo => {
        const student = members.find(m => m.regNo === regNo) || { name: 'Unknown User', regNo }
        return { ...student, points: studentPoints[regNo] }
      }).sort((a, b) => b.points - a.points),
      topClubs: clubPerformance
    }
  }

  return (
    <EventContext.Provider value={{ 
      events, announcements, clubs, members, registrations, clubSettings,
      addEvent, approveEvent, rejectEvent,
      addAnnouncement, deleteAnnouncement,
      joinClub, approveMember, rejectMember, removeMember,
      registerForEvent, updateClubSettings, updateMemberAttendance,
      updateMemberRole, addClub, updateClub, deleteClub,
      updateRegistrationStatus,
      feedback, addFeedback, getLeaderboardData,
      notifications, addNotification, markNotificationAsRead, clearNotifications
    }}>
      {children}
    </EventContext.Provider>
  )
}

export const useEvents = () => useContext(EventContext)
