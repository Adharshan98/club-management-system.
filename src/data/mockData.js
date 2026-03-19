// ============================================================
// DATA CONSTANTS — VIT Chennai Club Management System
// ============================================================

export const MOCK_USERS = [
  { id: 1, name: 'Priya Sharma', regNo: '22BCE5678', dept: 'CSE', role: 'student' },
  { id: 2, name: 'Aditya Raj', regNo: '22BEC1001', dept: 'ECE', role: 'clubhead', clubId: 101 },
  { id: 3, name: 'Dr. Saravanan', regNo: 'EMP9001', dept: 'Admin', role: 'admin' }
]

export const CLUBS = [
  { 
    id: 101, name: 'AI Innovators Club', category: 'Technical', founded: '2021', members: 0, maxMembers: 200, events: 0, head: 'Aditya Raj', email: 'ai@vit.ac.in',
    description: 'A community focused on Artificial Intelligence, Machine Learning and real-world tech projects.',
    coverGradient: 'linear-gradient(135deg, #6c63ff 0%, #3f37c9 100%)', tag: 'AI', tags: ['AI', 'Machine Learning', 'Coding', 'Innovation'], achievements: []
  },
  { 
    id: 102, name: 'Entrepreneurship Hub', category: 'Non-Technical', founded: '2022', members: 0, maxMembers: 200, events: 0, head: 'Meera Nair', email: 'eh@vit.ac.in',
    description: 'A platform for students interested in startups, business strategies and leadership development.',
    coverGradient: 'linear-gradient(135deg, #2ed573 0%, #1abc9c 100%)', tag: 'EH', tags: ['Startup', 'Business', 'Leadership', 'Networking'], achievements: []
  },
  { 
    id: 103, name: 'Creative Arts Society', category: 'Arts', founded: '2020', members: 0, maxMembers: 200, events: 0, head: 'Sana Khan', email: 'ca@vit.ac.in',
    description: 'A club for artists to explore painting, music, dance and digital art while showcasing talent.',
    coverGradient: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)', tag: 'CA', tags: ['Art', 'Music', 'Dance', 'Creativity'], achievements: []
  }
]

export const EVENTS = []
export const ANNOUNCEMENTS = []
export const MEMBERS = []
export const REGISTRATIONS = []
export const FEEDBACK = []

export const CATEGORIES = ['All', 'Technical', 'Non-Technical', 'Cultural', 'Arts', 'Sports', 'Professional', 'Social']
export const EVENT_CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Competition', 'Tournament', 'Pitch', 'Contest', 'Seminar']

export const DASHBOARD_STATS = {
  membershipTrend: [],
  clubDistribution: [],
}
