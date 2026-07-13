import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function NotificationBadge() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Only fetch notifications if user is logged in
    if (user) {
      // For demo, we'll use the dummy data count
      const count = 3
      setUnreadCount(count)
    } else {
      setUnreadCount(0)
    }
  }, [user])

  const handleClick = () => {
    if (!user) {
      // If not logged in, we need to trigger the sign in modal
      // We'll do this by navigating to home and using a state
      // For now, let's use a simple approach: show a toast or alert
      // In a real app, you'd use a global state or context
      const event = new CustomEvent('showSignIn')
      window.dispatchEvent(event)
      return
    }
    navigate('/notifications')
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition"
    >
      <Bell size={18} className="text-gray-500" />
      {user && unreadCount > 0 && (
        <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  )
}
