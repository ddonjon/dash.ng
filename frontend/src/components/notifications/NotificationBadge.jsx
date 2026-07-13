import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getUnreadCount, subscribeToNotifications } from '../../services/notifications'

export function NotificationBadge() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (!user) {
      setHasUnread(false)
      return
    }

    const loadUnreadStatus = async () => {
      const count = await getUnreadCount(user.id)
      setHasUnread(count > 0)
    }

    loadUnreadStatus()

    // Subscribe to new notifications for real-time updates
    const channel = subscribeToNotifications(user.id, () => {
      // When a new notification arrives, update the status
      loadUnreadStatus()
    })

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const handleClick = () => {
    if (!user) {
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
      {user && hasUnread && (
        <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      )}
    </button>
  )
}
