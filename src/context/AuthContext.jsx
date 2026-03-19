import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const MOCK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@vitchennai.ac.in', password: 'admin123', role: 'admin', regNo: 'ADMIN001', dept: 'Administration', avatar: null },
  { id: 2, name: 'Arjun Kumar', email: 'clubhead@vitchennai.ac.in', password: 'head123', role: 'clubhead', regNo: '22BCE1234', dept: 'CSE', clubId: 1, clubName: 'Tech Wizards Club', avatar: null },
  { id: 3, name: 'Priya Sharma', email: 'student@vitchennai.ac.in', password: 'student123', role: 'student', regNo: '22BCE5678', dept: 'CSE', avatar: null },
  { id: 4, name: 'Rahul Nair', email: 'rahul@vitchennai.ac.in', password: 'rahul123', role: 'student', regNo: '22ECE1122', dept: 'ECE', avatar: null },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('clubhub-user')
    return saved ? JSON.parse(saved) : null
  })

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('clubhub-users')
    return saved ? JSON.parse(saved) : MOCK_USERS
  })

  // Persistence for users list
  useEffect(() => {
    localStorage.setItem('clubhub-users', JSON.stringify(users))
  }, [users])

  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }

  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      const { password: _, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem('clubhub-user', JSON.stringify(safeUser))
      showToast(`Welcome back, ${safeUser.name}! 👋`, 'success')
      return { success: true, role: safeUser.role }
    }
    return { success: false, message: 'Invalid email or password.' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('clubhub-user')
    showToast('Logged out successfully.', 'info')
  }

  const register = (data) => {
    const newUser = {
      ...data,
      id: Date.now(),
      role: data.role || 'student', 
      avatar: null
    }
    setUsers(prev => [...prev, newUser])
    showToast('Registration successful! Please login.', 'success')
    return { success: true }
  }

  const updateUser = (userId, data) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u))
    if (user?.id === userId) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('clubhub-user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, users, login, logout, register, updateUser, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
