import { useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { NotificationBadge } from '../notifications/NotificationBadge'

export function HeaderUI({ onSignIn, onSignUp, onDrawerToggle }) {
  const navigate = useNavigate()

  const handleDrawerOpen = () => {
    if (onDrawerToggle) onDrawerToggle(true)
  }

  const handleLogoClick = (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-gray-800 font-bold text-lg">Dash</span>
        </button>
        
        {/* Right side - Notification Bell + Menu */}
        <div className="flex items-center gap-1">
          <NotificationBadge />
          <button
            onClick={handleDrawerOpen}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-purple-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
