import { useNavigate } from 'react-router-dom'
import { 
  X, Home, PlusCircle, User, Heart, LogIn, LogOut, 
  ChevronRight, FileText, LayoutDashboard, Settings,
  BarChart3, Star, Bell, HelpCircle, ShieldCheck, Mail, Phone
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'

export function DrawerMenu({ isOpen, onClose, onSignIn, onSignUp }) {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
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

  const mainItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: PlusCircle, label: 'List Property', path: '/list-property' },
  ]

  const accountItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: FileText, label: 'My Listings', path: '/my-listings' },
    { icon: Heart, label: 'Saved', path: '/saved' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ]

  const settingsItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help & FAQ', path: '/faq' },
  ]

  return (
    <>
      {/* Backdrop with fade-in */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[200] transition-opacity duration-300"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
          onClick={onClose}
        />
      )}

      {/* Drawer with improved slide animation */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-[320px] max-w-[85vw] bg-white shadow-2xl z-[201]
          transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease'
        }}
      >
        {/* Header with User Info and Close Button */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {user && profile ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-lg shadow-purple-600/20 flex-shrink-0">
                    {profile.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {profile.name || user.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Mail size={12} className="flex-shrink-0" />
                      {user.email}
                    </p>
                    {profile.whatsapp_number && (
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        <Phone size={12} className="flex-shrink-0" />
                        {profile.whatsapp_number}
                      </p>
                    )}
                    {profile.is_verified_agent && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mt-0.5 border border-purple-200">
                        <ShieldCheck size={10} />
                        Verified Agent
                      </span>
                    )}
                  </div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg shadow-lg shadow-purple-600/20 flex-shrink-0">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Mail size={12} className="flex-shrink-0" />
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                    ?
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">Guest</p>
                    <p className="text-xs text-gray-400">Not signed in</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0 ml-2">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

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
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition group"
                >
                  <item.icon size={18} className="text-gray-400 group-hover:text-purple-600 transition" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 transition" />
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition group"
                  >
                    <item.icon size={18} className="text-gray-400 group-hover:text-purple-600 transition" />
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 transition" />
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 rounded-lg transition group"
                >
                  <item.icon size={18} className="text-gray-400 group-hover:text-purple-600 transition" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-400 transition" />
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS animation for fade-in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
