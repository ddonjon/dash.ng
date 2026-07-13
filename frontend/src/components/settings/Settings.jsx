import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, User, Bell, Lock, Globe, 
  LogOut, ChevronRight, MessageCircle,
  Mail, Phone, CircleHelp, FileText, 
  Trash2, AlertTriangle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { EditProfileModal } from '../profile/EditProfileModal'
import { ChangePasswordModal } from './ChangePasswordModal'
import { supabase } from '../../services/supabase'

export function Settings() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    marketingEmails: false
  })

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    
    try {
      const { error: propertiesError } = await supabase
        .from('properties')
        .delete()
        .eq('agent_id', user.id)
      
      if (propertiesError) throw propertiesError
      
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      if (profileError) throw profileError
      
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      
      if (authError) throw authError
      
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Failed to delete account. Please contact support.')
    }
  }

  const sections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { 
          label: 'Edit Profile', 
          icon: User, 
          onClick: () => setShowEditModal(true),
          description: 'Update your personal information'
        },
        { 
          label: 'Change Password', 
          icon: Lock, 
          onClick: () => setShowPasswordModal(true),
          description: 'Update your password'
        },
        { 
          label: 'Language', 
          icon: Globe, 
          value: 'English',
          onClick: () => alert('Language settings coming soon'),
          description: 'Choose your preferred language'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          icon: Bell,
          toggle: true,
          key: 'notifications',
          description: 'Receive push notifications'
        },
        {
          label: 'Email Updates',
          icon: Mail,
          toggle: true,
          key: 'emailUpdates',
          description: 'Receive email updates about your listings'
        },
        {
          label: 'Marketing Emails',
          icon: MessageCircle,
          toggle: true,
          key: 'marketingEmails',
          description: 'Receive promotional emails and offers'
        }
      ]
    },
    {
      title: 'Support',
      icon: CircleHelp,
      items: [
        {
          label: 'Help Center',
          icon: CircleHelp,
          onClick: () => alert('Help Center coming soon'),
          description: 'Get help and support'
        },
        {
          label: 'FAQ',
          icon: FileText,
          onClick: () => alert('FAQ coming soon'),
          description: 'Frequently asked questions'
        },
        {
          label: 'Contact Support',
          icon: MessageCircle,
          onClick: () => alert('Support contact coming soon'),
          description: 'Get in touch with our team'
        }
      ]
    }
  ]

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick()
    }
  }

  return (
    <>
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
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Settings</h1>
              <p className="text-[10px] text-gray-500 font-medium">Manage your preferences</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
          {/* Quick Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">
                  {profile?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs text-purple-600 font-medium hover:text-purple-700 transition flex items-center gap-1"
              >
                Edit <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Settings Sections */}
          {sections.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                <section.icon size={16} className="text-gray-400" />
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    onClick={() => {
                      if (!item.toggle && item.onClick) {
                        item.onClick()
                      }
                    }}
                    className={`flex items-center justify-between p-3 ${
                      itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                    } ${!item.toggle && item.onClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                        <item.icon size={16} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {item.toggle ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggle(item.key)
                        }}
                        className={`flex items-center w-12 h-6 rounded-full p-1 transition-colors duration-300 flex-shrink-0 ${
                          settings[item.key] ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <div 
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                            settings[item.key] ? 'translate-x-6' : 'translate-x-0'
                          }`} 
                        />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                        {item.value && <span className="text-gray-600">{item.value}</span>}
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Delete Account - Normal color */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trash2 size={16} className="text-gray-400" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Delete Account
              </h2>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={16} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">
                      Delete Account
                    </p>
                    <p className="text-xs text-gray-400">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            </div>
          </div>

          {/* Sign Out Button - Red */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        user={user}
        onSave={async (data) => {
          console.log('Saving profile:', data)
          setShowEditModal(false)
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Delete Account Confirmation Modal - Smaller */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              
              <h3 className="text-base font-bold text-gray-900">Delete Account</h3>
              <p className="text-xs text-gray-500 mt-1.5">
                Are you sure you want to delete your account? This action is <span className="font-bold text-red-600">permanent</span>.
              </p>
              <ul className="text-xs text-gray-500 mt-2 text-left space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  Delete all your property listings
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  Remove all saved properties
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  Permanently delete your profile data
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  This cannot be undone
                </li>
              </ul>

              <div className="flex gap-2 w-full mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
