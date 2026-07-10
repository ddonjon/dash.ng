import { Link } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'

export function HeaderUI({ onSignIn, onSignUp, onDrawerToggle }) {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-lg font-bold text-gray-800">Dash</span>
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell size={18} className="text-gray-500" />
          </button>
          <button
            onClick={() => onDrawerToggle(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  )
}
