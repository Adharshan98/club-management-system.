import { useAuth } from '../../context/AuthContext'
import './Toast.css'

export default function Toast() {
  const { toast } = useAuth()
  if (!toast) return null

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type}`}>
        <span className="toast-icon">{icons[toast.type] || '📢'}</span>
        <span className="toast-message">{toast.message}</span>
      </div>
    </div>
  )
}
