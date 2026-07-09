import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { DrawerMenu } from './DrawerMenu'

export function Header({ onSignIn, onSignUp, onDrawerToggle }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true)
    if (onDrawerToggle) onDrawerToggle(true)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    if (onDrawerToggle) onDrawerToggle(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            {/* D logo icon */}
            <div className="w-8 h-8 rounded-lg bg-[#6C4DFF] border-2 border-[#6C4DFF] flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-gray-800 font-bold text-lg">Dash</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={18} className="text-gray-500" />
            </button>
            <button
              onClick={handleDrawerOpen}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={24} className="text-[#6C4DFF]" />
            </button>
          </div>
        </div>
      </header>

      {/* DrawerMenu is rendered here but at the root level in the DOM */}
      <DrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={handleDrawerClose}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
      />
    </>
  )
}
