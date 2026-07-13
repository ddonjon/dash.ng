import { useState, useEffect } from 'react'
import { MapPin, Bed, ChevronRight, CheckCircle, Bookmark, BookmarkCheck } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'

export function PropertyCard({ property, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user && property?.id) {
      checkIfSaved()
    }
  }, [user, property?.id])

  const checkIfSaved = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', property.id)
        .maybeSingle()

      if (error) {
        console.error('Error checking saved status:', error)
        return
      }
      setIsSaved(!!data)
    } catch (err) {
      console.error('Error in checkIfSaved:', err)
    }
  }

  const toggleSave = async (e) => {
    e.stopPropagation()
    
    if (!user) {
      alert('Please sign in to save listings')
      return
    }

    if (saving) return

    setSaving(true)
    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id)

        if (error) {
          console.error('Delete error:', error)
          throw error
        }
        setIsSaved(false)
      } else {
        const { error } = await supabase
          .from('saved_properties')
          .insert({
            user_id: user.id,
            property_id: property.id
          })

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Error toggling save:', err)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
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

  const getPricePeriodLabel = (period) => {
    if (period === 'monthly') return '/ month'
    return '/ annum'
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.98] lg:hover:scale-[1.01] border border-gray-200 hover:border-gray-300 relative"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        {/* Image */}
        <div className="relative h-48 sm:h-full sm:min-h-[200px] bg-gray-100">
          {property.media_urls?.[0] ? (
            <img
              src={property.media_urls[0]}
              alt={property.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-white text-4xl">🏠</span>
            </div>
          )}
          
          {property.users?.is_verified_agent && (
            <div className="absolute top-3 left-3 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm border border-gray-200">
              <CheckCircle size={12} />
              Verified Agent
            </div>
          )}
          
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
            <Bed size={14} />
            {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-normal text-gray-800 text-sm sm:text-base line-clamp-1">
                {property.title}
              </h3>
              <div className="text-right flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm sm:text-base">
                  {formatPrice(property.price)}
                </span>
                <span className="text-xs text-gray-400 ml-1 font-medium">
                  {getPricePeriodLabel(property.price_period)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin size={14} className="text-gray-400" />
              <span>{property.area}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.features?.slice(0, 4).map((feature, i) => (
                <span 
                  key={i} 
                  className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200"
                >
                  {feature}
                </span>
              ))}
              {property.features?.length > 4 && (
                <span className="text-xs font-medium bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full border border-gray-200">
                  +{property.features.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* View Button on Right, Save Icon on Left */}
          <div className="flex items-center justify-between pt-3">
            <button
              onClick={toggleSave}
              disabled={saving}
              className={`p-1.5 rounded-lg transition-all duration-200 ml-1 ${
                isSaved 
                  ? 'text-gray-600 hover:text-gray-700' 
                  : 'text-gray-400 hover:text-gray-600'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaved ? (
                <BookmarkCheck size={18} fill="currentColor" />
              ) : (
                <Bookmark size={18} />
              )}
            </button>

            <div className="flex items-center gap-1 text-gray-500 hover:text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-200">
              View
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
