import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  X, Home, PlusCircle, User, Heart, LogIn, LogOut, 
  ChevronRight, FileText, LayoutDashboard, Settings,
  BarChart3, Star, Bell, HelpCircle, ShieldCheck
} from 'lucide-react'
import { supabase } from '../../services/supabase'

export function DrawerMenu({ isOpen, onClose, onSignIn, onSignUp }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (isOpen) {
      checkUser()
    }
  }, [isOpen])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    onClose()
    navigate('/')
  }

  const handleNavigation = (path) => {
    onClose()
    navigate(path)
  }

  const handleSignIn = () => {
    onClose()
    onSignIn()
  }

  const handleSignUp = () => {
    onClose()
    onSignUp()
  }

  // Main navigation items
  const mainItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: PlusCircle, label: 'List Property', path: '/list-property' },
  ]

  // Account section items (when logged in)
  const accountItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: FileText, label: 'My Listings', path: '/my-listings' },
    { icon: Heart, label: 'Saved Properties', path: '/saved' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ]

  // Settings section items
  const settingsItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & FAQ', path: '/faq' },
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[200]"
          onClick={onClose}
        />
      )}

      <div 
        className={`
          fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-white shadow-2xl z-[201]
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6C4DFF] flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-lg font-bold text-gray-800">Dash</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        {user && profile && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#6C4DFF] text-white flex items-center justify-center font-semibold text-lg shadow-lg shadow-[#6C4DFF]/20">
                {profile.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {profile.name || user.email}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
                {profile.is_verified_agent && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-[#6C4DFF] bg-[#EFE9FF] px-2 py-0.5 rounded-full mt-0.5">
                    <ShieldCheck size={10} />
                    Verified Agent
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Menu Sections */}
        <div className="p-3 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Main Section */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
              Main
            </p>
            <div className="space-y-0.5">
              {mainItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition group"
                >
                  <item.icon size={18} className="text-gray-400 group-hover:text-[#6C4DFF] transition" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Account Section - Only when logged in */}
          {user && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
                Account
              </p>
              <div className="space-y-0.5">
                {accountItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition group"
                  >
                    <item.icon size={18} className="text-gray-400 group-hover:text-[#6C4DFF] transition" />
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings Section */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
              Settings
            </p>
            <div className="space-y-0.5">
              {settingsItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition group"
                >
                  <item.icon size={18} className="text-gray-400 group-hover:text-[#6C4DFF] transition" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Sign In/Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition group"
            >
              <LogOut size={18} className="text-red-400 group-hover:text-red-500 transition" />
              <span className="flex-1 text-left font-medium">Sign Out</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSignIn}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#6C4DFF] text-white rounded-lg hover:bg-[#5A3EF5] transition shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
