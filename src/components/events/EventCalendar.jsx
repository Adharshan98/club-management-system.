import { useState } from 'react'
import './EventCalendar.css'

export default function EventCalendar({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const totalDays = daysInMonth(year, month)
  const startDay = firstDayOfMonth(year, month)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const calendarDays = []
  // Previous month padding
  for (let i = 0; i < startDay; i++) {
    calendarDays.push({ day: '', currentMonth: false })
  }
  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push({ day: i, currentMonth: true })
  }

  const getEventsForDay = (day) => {
    if (!day) return []
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year &&
             event.status === 'approved'
    })
  }

  return (
    <div className="calendar-container animate-fade-in">
      <div className="calendar-header">
        <h3 className="calendar-month-year">{monthNames[month]} {year}</h3>
        <div className="calendar-nav">
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>◀</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>▶</button>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        
        {calendarDays.map((item, index) => {
          const dayEvents = getEventsForDay(item.day)
          const isToday = item.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

          return (
            <div key={index} className={`calendar-day ${!item.currentMonth ? 'inactive' : ''} ${isToday ? 'today' : ''}`}>
              <span className="day-number">{item.day}</span>
              <div className="day-events">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id} 
                    className="calendar-event-pill"
                    onClick={() => onEventClick(event)}
                    title={event.title}
                    style={{ borderLeftColor: getCategoryColor(event.category) }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="more-events">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getCategoryColor(category) {
  const colors = {
    'Technical': '#06b6d4',
    'Non-Technical': '#10b981',
    'Cultural': '#f59e0b',
    'Arts': '#ec4899',
    'Sports': '#3b82f6',
    'Other': '#64748b'
  }
  return colors[category] || '#6366f1'
}
