import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Eye, Edit2, Trash2, XCircle,
  Home, AlertCircle, Loader2, CheckCircle, FileText,
  Clock, LayoutGrid, Search, Filter, SortAsc,
  MessageCircle, TrendingUp, Calendar, MapPin, Bed,
  ChevronDown, ChevronRight, MoreVertical, Pencil,
  Lock, FileEdit, Image
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'

export function MyListings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showMenuFor, setShowMenuFor] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    propertyId: null, 
    propertyTitle: '' 
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    drafts: 0,
    views: 0,
    inquiries: 0
  })

  useEffect(() => {
    loadListings()
  }, [user])

  const loadListings = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setListings(data || [])
      
      const total = data?.length || 0
      const active = data?.filter(p => p.status === 'published')?.length || 0
      const drafts = data?.filter(p => p.status === 'draft' || !p.status)?.length || 0
      const pending = data?.filter(p => p.status === 'pending')?.length || 0
      const views = data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
      const inquiries = data?.reduce((sum, p) => sum + (p.inquiries || 0), 0) || 0
      
      setStats({
        total,
        active,
        pending,
        drafts,
        views,
        inquiries
      })
    } catch (err) {
      console.error('Error loading listings:', err)
      setError('Failed to load your listings')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const { propertyId } = deleteModal
    if (!propertyId) return

    setIsDeleting(true)
    setError(null)

    try {
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('media_urls')
        .eq('id', propertyId)
        .single()

      if (fetchError) throw fetchError

      if (property?.media_urls?.length > 0) {
        for (const url of property.media_urls) {
          const path = url.split('/properties/')[1]
          if (path) {
            await supabase.storage
              .from('property-images')
              .remove([`properties/${path}`])
          }
        }
      }

      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (deleteError) throw deleteError

      setDeleteModal({ isOpen: false, propertyId: null, propertyTitle: '' })
      setShowMenuFor(null)
      await loadListings()
    } catch (err) {
      console.error('Error deleting property:', err)
      setError('Failed to delete property')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NG', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'draft': return 'text-gray-500 bg-gray-100 border-gray-300'
      default: return 'text-gray-500 bg-gray-100 border-gray-300'
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'published': return 'Active'
      case 'pending': return 'Pending'
      case 'draft': return 'Draft'
      default: return 'Draft'
    }
  }

  const getFilteredListings = () => {
    let filtered = [...listings]

    if (activeTab === 'active') {
      filtered = filtered.filter(p => p.status === 'published')
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(p => p.status === 'pending')
    } else if (activeTab === 'drafts') {
      filtered = filtered.filter(p => p.status === 'draft' || !p.status)
    }

    switch(sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      default:
        break
    }

    return filtered
  }

  const filteredListings = getFilteredListings()

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'active', label: 'Active', count: stats.active },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'drafts', label: 'Drafts', count: stats.drafts },
  ]

  const handleCardClick = (listing) => {
    if (showMenuFor) {
      return
    }
    if (listing.status === 'published') {
      navigate(`/property/${listing.id}`)
    }
  }

  const handleEditClick = (listingId, e) => {
    e.stopPropagation()
    navigate(`/edit-property/${listingId}`)
    setShowMenuFor(null)
  }

  const handleMenuToggle = (listingId, e) => {
    e.stopPropagation()
    setShowMenuFor(showMenuFor === listingId ? null : listingId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-purple-600 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Loading your listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">My Listings</h1>
            <p className="text-xs text-gray-500 font-medium">Manage all your property listings</p>
          </div>
          <button
            onClick={() => navigate('/list-property')}
            className="flex items-center justify-center w-7 h-7 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-sm flex-shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mt-4 mb-4 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 pt-4 pb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-[11px] font-medium transition whitespace-nowrap rounded-full border ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center mb-1">
              <LayoutGrid size={20} className="text-purple-600" />
            </div>
            <span className="text-lg font-bold text-gray-900 block">{stats.total}</span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Total Listings</span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center mb-1">
              <Eye size={20} className="text-emerald-600" />
            </div>
            <span className="text-lg font-bold text-gray-900 block">{stats.views}</span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Total Views</span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm text-center">
            <div className="flex justify-center mb-1">
              <MessageCircle size={20} className="text-blue-600" />
            </div>
            <span className="text-lg font-bold text-gray-900 block">{stats.inquiries}</span>
            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Total Inquiries</span>
          </div>
        </div>

        {/* Sort */}
        <div className="flex justify-end mb-6">
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <SortAsc size={14} />
              Sort
              <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                {[
                  { id: 'newest', label: 'Newest First' },
                  { id: 'oldest', label: 'Oldest First' },
                  { id: 'price-high', label: 'Price: High to Low' },
                  { id: 'price-low', label: 'Price: Low to High' },
                  { id: 'views', label: 'Most Views' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id)
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition ${
                      sortBy === option.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-base font-semibold text-gray-700">
              {activeTab === 'all' ? 'No listings yet' : 
               `No ${activeTab} listings found`}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              {activeTab === 'all' 
                ? 'Start by adding your first property listing' 
                : `You don't have any ${activeTab} listings at the moment`}
            </p>
            <button
              onClick={() => navigate('/list-property')}
              className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition shadow-sm inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create New Listing
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredListings.map((listing) => {
              const isDraft = listing.status === 'draft' || !listing.status
              
              return (
                <div
                  key={listing.id}
                  onClick={() => handleCardClick(listing)}
                  className={`bg-white rounded-xl border shadow-sm transition-all duration-200 ${
                    isDraft 
                      ? 'border-gray-200 cursor-not-allowed' 
                      : 'border-gray-200 hover:shadow-md hover:border-purple-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start p-3.5 gap-4">
                    {/* Image - Left side */}
                    <div className="w-24 h-24 md:w-28 md:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      {listing.media_urls?.[0] ? (
                        <img
                          src={listing.media_urls[0]}
                          alt={listing.title}
                          className={`w-full h-full object-cover ${isDraft ? 'grayscale opacity-60' : ''}`}
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/200x200/e2e8f0/64748b?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          isDraft ? 'bg-gray-200' : 'bg-gradient-to-br from-purple-400 to-purple-600'
                        }`}>
                          {isDraft ? (
                            <Image size={24} className="text-gray-400" />
                          ) : (
                            <span className="text-white text-2xl">🏠</span>
                          )}
                        </div>
                      )}
                      {/* Status Badge - Top of image */}
                      <div className="absolute top-1.5 left-1.5">
                        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(listing.status)}`}>
                          {getStatusLabel(listing.status)}
                        </span>
                      </div>
                    </div>

                    {/* Details - Middle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-semibold truncate ${
                            isDraft ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {listing.title}
                          </h3>
                          <div className={`flex items-center gap-2 mt-1 text-xs flex-wrap ${
                            isDraft ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {listing.area}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Bed size={13} />
                              {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                            </span>
                          </div>
                        </div>
                        
                        {/* 3-dot menu - Right side */}
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={(e) => handleMenuToggle(listing.id, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition relative z-10"
                          >
                            <MoreVertical size={18} className="text-gray-500" />
                          </button>
                          
                          {showMenuFor === listing.id && (
                            <>
                              {/* Invisible full-screen shield */}
                              <div 
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  setShowMenuFor(null)
                                }}
                              />
                              
                              {/* The Dropdown Menu - Lower z-index so it doesn't overlap header */}
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                {listing.status === 'published' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/property/${listing.id}`)
                                      setShowMenuFor(null)
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                                  >
                                    <Eye size={14} />
                                    View
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditClick(listing.id, e)
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                                >
                                  <Edit2 size={14} />
                                  {isDraft ? 'Continue Editing' : 'Edit'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteModal({
                                      isOpen: true,
                                      propertyId: listing.id,
                                      propertyTitle: listing.title
                                    })
                                    setShowMenuFor(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 transition flex items-center gap-2"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 mt-1.5 text-xs ${
                        isDraft ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <span className={`font-semibold text-sm ${
                          isDraft ? 'text-purple-500' : 'text-purple-600'
                        }`}>
                          {formatPrice(listing.price)}
                        </span>
                        <span className="text-gray-400">/ {listing.price_period === 'monthly' ? 'monthly' : 'annum'}</span>
                        <span className="flex items-center gap-1">
                          <Eye size={13} />
                          {listing.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={13} />
                          {listing.inquiries || 0}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Listed on {formatDate(listing.created_at)}
                      </div>

                      {isDraft && (
                        <div className="mt-1.5 text-[10px] text-gray-400 flex items-center gap-1">
                          <FileEdit size={11} />
                          <span>Draft - Click the menu to continue editing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, propertyId: null, propertyTitle: '' })}
        onConfirm={handleDelete}
        propertyTitle={deleteModal.propertyTitle}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default MyListings
