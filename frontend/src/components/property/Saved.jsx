import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Heart, MapPin, Bed, Eye, MessageCircle,
  Home, Calendar, Loader2, AlertCircle, XCircle,
  Trash2, ChevronRight, BookmarkCheck
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

export function Saved() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [savedProperties, setSavedProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    if (user) {
      loadSavedProperties()
    }
  }, [user])

  const loadSavedProperties = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          created_at,
          properties (
            id,
            title,
            description,
            area,
            price,
            price_period,
            bedrooms,
            features,
            media_urls,
            views,
            inquiries,
            status,
            users (
              name,
              whatsapp_number,
              is_verified_agent
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const validSaved = data?.filter(item => item.properties) || []
      setSavedProperties(validSaved)
    } catch (err) {
      console.error('Error loading saved properties:', err)
      setError('Failed to load saved properties')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSaved = async (savedId, propertyId, e) => {
    e.stopPropagation()
    
    setRemoving(savedId)
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('id', savedId)

      if (error) throw error

      setSavedProperties(prev => prev.filter(item => item.id !== savedId))
    } catch (err) {
      console.error('Error removing saved property:', err)
      setError('Failed to remove saved property')
    } finally {
      setRemoving(null)
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

  const getPricePeriodLabel = (period) => {
    if (period === 'monthly') return 'monthly'
    return 'annum'
  }

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-purple-600 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-2">Loading saved properties...</p>
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
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Saved</h1>
            <p className="text-[10px] text-gray-500 font-medium">Your favorite properties</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* Saved Properties List */}
        {savedProperties.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-200">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="text-base font-semibold text-gray-700">No saved properties yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Start saving your favorite properties by tapping the bookmark icon on any listing
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition shadow-sm inline-flex items-center gap-2"
            >
              <Home size={16} />
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedProperties.map((saved) => {
              const property = saved.properties
              if (!property) return null
              
              return (
                <div
                  key={saved.id}
                  onClick={() => handlePropertyClick(property.id)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                >
                  <div className="flex items-start p-3.5 gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 md:w-28 md:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      {property.media_urls?.[0] ? (
                        <img
                          src={property.media_urls[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/200x200/e2e8f0/64748b?text=No+Image'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-2xl">🏠</span>
                        </div>
                      )}
                      {/* Bookmark badge on image */}
                      <div className="absolute top-1.5 left-1.5">
                        <span className="bg-gray-800/80 text-white text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                          <BookmarkCheck size={10} fill="currentColor" />
                          Saved
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {property.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {property.area}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Bed size={13} />
                              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Remove button */}
                        <button
                          onClick={(e) => handleRemoveSaved(saved.id, property.id, e)}
                          disabled={removing === saved.id}
                          className="p-1.5 hover:bg-red-50 rounded-full transition flex-shrink-0 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        >
                          {removing === saved.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="text-purple-600 font-semibold text-sm">
                          {formatPrice(property.price)}
                        </span>
                        <span className="text-gray-400">/ {getPricePeriodLabel(property.price_period)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          Saved on {formatDate(saved.created_at)}
                        </span>
                        {property.users?.is_verified_agent && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Verified
                          </span>
                        )}
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
