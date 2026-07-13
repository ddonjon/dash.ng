import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Edit2, Briefcase, Eye, Heart, Mail, 
  Phone, MapPin, Check, ChevronRight, Rocket, 
  Home, LogOut, X, Save, List, MessageCircle,
  Pencil
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { EditProfileModal } from './EditProfileModal'

export function Profile() {
  const navigate = useNavigate()
  const { user, profile, loading, signOut } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    location: ''
  })
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    savedItems: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        whatsapp_number: profile.whatsapp_number || '',
        location: profile.location || ''
      })
      loadStats()
    }
  }, [profile, user])

  const loadStats = async () => {
    if (!user) {
      setStatsLoading(false)
      return
    }
    
    setStatsLoading(true)
    try {
      const { data: listings, error } = await supabase
        .from('properties')
        .select('id, views, inquiries, status')
        .eq('agent_id', user.id)

      if (error) {
        console.error('Error loading listings:', error)
        if (error.code === '42703') {
          const { data: basicListings, error: basicError } = await supabase
            .from('properties')
            .select('id, status')
            .eq('agent_id', user.id)
          
          if (basicError) {
            console.error('Error loading basic listings:', basicError)
            setStatsLoading(false)
            return
          }
          
          const totalListings = basicListings?.length || 0
          setStats({
            totalListings,
            totalViews: 0,
            totalInquiries: 0,
            savedItems: 0
          })
          setStatsLoading(false)
          return
        }
        
        setStatsLoading(false)
        return
      }

      const totalListings = listings?.length || 0
      const totalViews = listings?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
      const totalInquiries = listings?.reduce((sum, p) => sum + (p.inquiries || 0), 0) || 0

      const { count: savedCount, error: savedError } = await supabase
        .from('saved_properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (savedError) {
        console.error('Error loading saved count:', savedError)
      }

      setStats({
        totalListings,
        totalViews,
        totalInquiries,
        savedItems: savedCount || 0
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSave = async (data) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          whatsapp_number: data.whatsapp_number,
          location: data.location
        })
        .eq('id', user.id)

      if (error) throw error

      setFormData(data)
      await loadStats()
      setShowEditModal(false)
      // Refresh the page to update the auth context
      window.location.reload()
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to view your profile</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white pb-24 font-sans overflow-x-hidden">
        
        {/* Profile Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm flex-shrink-0"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Profile</h1>
              <p className="text-[10px] text-gray-500 font-medium">Manage your account and listings</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 space-y-4 mt-4">
          
          {/* Main User Card */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="p-4 relative z-10">
              {/* Avatar & Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shadow-sm border border-emerald-600/20">
                    {formData.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-gray-300 rounded-full text-gray-500 hover:text-purple-600 shadow-sm transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {formData.name || 'User Name'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => navigate('/my-listings')}
                  className="bg-gray-50/80 border border-gray-200 rounded-2xl p-2.5 flex items-center gap-2 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100/60 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200/60 transition">
                    <Briefcase size={15} className="text-purple-600" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">{stats.totalListings}</span>
                    <span className="text-[9px] text-gray-500 leading-tight">Listings</span>
                    <span className="text-[9px] text-purple-600 font-medium leading-tight">Active</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/my-listings')}
                  className="bg-gray-50/80 border border-gray-200 rounded-2xl p-2.5 flex items-center gap-2 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition">
                    <Eye size={15} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">{stats.totalViews}</span>
                    <span className="text-[9px] text-gray-500 leading-tight">Total Views</span>
                    <span className="text-[9px] text-blue-500 font-medium leading-tight">All time</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/saved')}
                  className="bg-gray-50/80 border border-gray-200 rounded-2xl p-2.5 flex items-center gap-2 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition">
                    <Heart size={15} className="text-red-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-gray-900 leading-none mb-0.5">{stats.savedItems}</span>
                    <span className="text-[9px] text-gray-500 leading-tight">Saved</span>
                    <span className="text-[9px] text-red-500 font-medium leading-tight">Items</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-[20px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">Contact Information</h3>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs text-purple-600 font-semibold flex items-center gap-1 hover:text-purple-800"
              >
                <Edit2 size={12} />
                Edit
              </button>
            </div>
            
            <div className="p-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <Mail size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-xs text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>
                <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-1 rounded-md font-semibold flex items-center gap-1 border border-purple-100">
                  Verified <Check size={12} strokeWidth={3} />
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 border border-gray-200">
                    <Phone size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Phone Number</p>
                    <p className="text-xs text-gray-900 font-medium">{formData.whatsapp_number || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 border border-gray-200">
                    <MapPin size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-xs text-gray-900 font-medium">{formData.location || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          {stats.totalListings === 0 && (
            <div className="bg-white rounded-[16px] p-4 border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Rocket size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-800">Ready to get started?</h3>
                  <p className="text-xs text-purple-600/80 mt-0.5">Create your first listing.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/list-property')}
                className="flex items-center flex-shrink-0 px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-sm"
              >
                + Add Listing
              </button>
            </div>
          )}

          {/* Navigation List */}
          <div className="space-y-2">
            <button
              onClick={() => navigate('/my-listings')}
              className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                  <List size={15} />
                </div>
                <span className="text-xs font-bold text-gray-900">My Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400">{stats.totalListings} properties</span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => navigate('/saved')}
              className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
                  <Heart size={15} />
                </div>
                <span className="text-xs font-bold text-gray-900">Saved Items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400">{stats.savedItems} items</span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => navigate('/my-listings')}
              className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center">
                  <Eye size={15} />
                </div>
                <span className="text-xs font-bold text-gray-900">Recent Views</span>
              </div>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>

          {/* Sign Out */}
          <div className="pt-2 pb-6">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-gray-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        user={user}
        onSave={handleSave}
      />
    </>
  )
}
