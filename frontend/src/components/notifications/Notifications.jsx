import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, MessageCircle, Heart, 
  UserPlus, CheckCircle, AlertCircle, 
  Loader2, Eye, Trash2, TrendingUp,
  Bell, Clock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAsRead, markAllAsRead, clearAllNotifications, subscribeToNotifications } from '../../services/notifications'

// Map notification types to icons
const iconMap = {
  inquiry: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  save: { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  view: { icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  system: { icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-50' }
}

export function Notifications() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const [error, setError] = useState(null)

  // Load notifications
  const loadNotifications = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const data = await getNotifications(user.id)
      setNotifications(data || [])
      
      // Count unread
      const unread = data?.filter(n => !n.read).length || 0
      setUnreadCount(unread)
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    loadNotifications()

    // Subscribe to new notifications
    const channel = subscribeToNotifications(user.id, (newNotification) => {
      console.log('🔔 New notification received:', newNotification)
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [user])

  const handleMarkAsRead = async (id) => {
    const success = await markAsRead(id)
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    const success = await markAllAsRead(user.id)
    if (success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    }
  }

  const handleClearAll = async () => {
    if (!user) return
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      const success = await clearAllNotifications(user.id)
      if (success) {
        setNotifications([])
        setUnreadCount(0)
      }
    }
  }

  const getFilteredNotifications = () => {
    if (activeFilter === 'all') return notifications
    if (activeFilter === 'unread') return notifications.filter(n => !n.read)
    return notifications.filter(n => n.type === activeFilter)
  }

  const filteredNotifications = getFilteredNotifications()

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-purple-600 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Notifications</h1>
            <p className="text-[10px] text-gray-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Filter Tabs */}
        {notifications.length > 0 && (
          <div className="flex gap-1.5 pb-4 overflow-x-auto mb-4 border-b border-gray-100">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition whitespace-nowrap ${
                activeFilter === 'unread'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('inquiry')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition whitespace-nowrap ${
                activeFilter === 'inquiry'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inquiries
            </button>
            <button
              onClick={() => setActiveFilter('save')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition whitespace-nowrap ${
                activeFilter === 'save'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Saved
            </button>
            <button
              onClick={() => setActiveFilter('view')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition whitespace-nowrap ${
                activeFilter === 'view'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Views
            </button>
            <button
              onClick={() => setActiveFilter('system')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition whitespace-nowrap ${
                activeFilter === 'system'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              System
            </button>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-200">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-base font-semibold text-gray-700">
              {notifications.length === 0 ? 'No notifications yet' : `No ${activeFilter} notifications`}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {notifications.length === 0 
                ? 'We\'ll notify you when something happens' 
                : `You don't have any ${activeFilter} notifications at the moment`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const iconInfo = iconMap[notification.type] || iconMap.system
              const IconComponent = iconInfo.icon
              
              return (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id)
                    }
                    if (notification.link) {
                      navigate(notification.link)
                    }
                  }}
                  className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
                    notification.read 
                      ? 'border-gray-200 opacity-75' 
                      : 'border-purple-200 bg-purple-50/30'
                  }`}
                >
                  <div className="flex items-start p-3.5 gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconInfo.bg}`}>
                      <IconComponent size={18} className={iconInfo.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold truncate ${
                            notification.read ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-xs mt-0.5 ${
                            notification.read ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
