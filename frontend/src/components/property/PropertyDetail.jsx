import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, MapPin, Bed, X, CheckCircle, MessageCircle, 
  Phone, Home, Building, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'
import { getPropertyById, getProperties, incrementInquiries } from '../../services/properties'
import { supabase } from '../../services/supabase'

export function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [similarProperties, setSimilarProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  useEffect(() => {
    loadProperty()
  }, [id])

  const loadProperty = async () => {
    setLoading(true)
    try {
      const data = await getPropertyById(id)
      setProperty(data)
      
      if (data) {
        await loadSimilarProperties(data)
      }
    } catch (err) {
      setError('Failed to load property details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSimilarProperties = async (currentProperty) => {
    try {
      const filters = {}
      
      if (currentProperty.area) {
        filters.area = currentProperty.area
      }
      
      const results = await getProperties(filters)
      
      const filtered = results
        .filter(p => p.id !== currentProperty.id)
        .slice(0, 4)
      
      if (filtered.length < 2) {
        const priceRange = 0.3
        const minPrice = currentProperty.price * (1 - priceRange)
        const maxPrice = currentProperty.price * (1 + priceRange)
        
        const priceResults = await getProperties({
          minPrice: minPrice,
          maxPrice: maxPrice
        })
        
        const priceFiltered = priceResults
          .filter(p => p.id !== currentProperty.id)
          .slice(0, 4)
        
        const merged = [...filtered, ...priceFiltered]
        const unique = merged.filter((p, index, self) => 
          index === self.findIndex((t) => t.id === p.id)
        )
        setSimilarProperties(unique.slice(0, 4))
      } else {
        setSimilarProperties(filtered)
      }
    } catch (err) {
      console.error('Error loading similar properties:', err)
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

  const handleWhatsApp = async () => {
    const phone = property?.users?.whatsapp_number?.replace('+', '') || ''
    const priceDisplay = `${formatPrice(property?.price)} ${getPricePeriodLabel(property?.price_period)}`
    const message = `Hello ${property?.users?.name || 'Agent'}, I'm interested in your property: ${property?.title} in ${property?.area} for ${priceDisplay}. Is it still available?`
    
    // Increment inquiries count
    if (property?.id) {
      try {
        await incrementInquiries(property.id)
        // Update local property state to reflect the new inquiry count
        setProperty(prev => ({
          ...prev,
          inquiries: (prev?.inquiries || 0) + 1
        }))
      } catch (err) {
        console.error('Error tracking inquiry:', err)
      }
    }
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleCall = () => {
    const phone = property?.users?.whatsapp_number?.replace(/\s/g, '') || ''
    window.location.href = `tel:${phone}`
  }

  const openImageViewer = (index) => {
    setCurrentImageIndex(index)
    setIsImageViewerOpen(true)
  }

  const handleSimilarClick = (property) => {
    navigate(`/property/${property.id}`)
  }

  const nextImage = (e) => {
    e.stopPropagation()
    const images = property?.media_urls?.length > 0 ? property.media_urls : ['https://placehold.co/600x400/e2e8f0/64748b?text=No+Image']
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e) => {
    e.stopPropagation()
    const images = property?.media_urls?.length > 0 ? property.media_urls : ['https://placehold.co/600x400/e2e8f0/64748b?text=No+Image']
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-700">Property not found</h3>
          <p className="text-gray-400 mt-1 text-sm">{error || 'The property you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Back to listings
          </button>
        </div>
      </div>
    )
  }

  const images = property.media_urls?.length > 0 ? property.media_urls : ['https://placehold.co/600x400/e2e8f0/64748b?text=No+Image']

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Custom Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-800 truncate ml-3">
            {property.title}
          </h1>
        </div>
      </div>

      {/* Image Slider */}
      <div 
        className="relative h-80 sm:h-[420px] bg-gray-100 cursor-pointer"
        onClick={() => openImageViewer(currentImageIndex)}
      >
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'
          }}
        />
        
        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition backdrop-blur-sm"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
          {currentImageIndex + 1} / {images.length}
        </div>
        
        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-5 max-w-3xl mx-auto">
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-bold text-purple-600">
              {formatPrice(property.price)}
            </span>
            <span className="text-xs text-gray-400 ml-1.5 font-medium">
              {getPricePeriodLabel(property.price_period)}
            </span>
          </div>
          {property.users?.is_verified_agent && (
            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
              <CheckCircle size={12} />
              Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          {property.title}
        </h1>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs text-gray-400">Location</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin size={14} className="text-gray-400" />
              {property.area}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs text-gray-400">Bedrooms</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Bed size={14} className="text-gray-400" />
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs text-gray-400">Property Type</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Building size={14} className="text-gray-400" />
              Apartment
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs text-gray-400">Status</p>
            <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Clock size={14} className="text-gray-400" />
              Available
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Features */}
        {property.features?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Features & Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <span
                  key={index}
                  className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Agent Section */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Agent</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {property.users?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {property.users?.name || 'Agent'}
              </p>
              {property.users?.is_verified_agent && (
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Verified Agent
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                {property.users?.whatsapp_number || 'No phone number'}
              </p>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Similar Properties
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {similarProperties.slice(0, 4).map((similar) => (
                <div 
                  key={similar.id}
                  onClick={() => handleSimilarClick(similar)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <div className="aspect-square bg-gray-200 relative overflow-hidden">
                    {similar.media_urls?.[0] ? (
                      <img
                        src={similar.media_urls[0]}
                        alt={similar.title}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/300x300/e2e8f0/64748b?text=No+Image'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-4xl">🏠</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium">
                      {formatPrice(similar.price)}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                      <Bed size={12} />
                      {similar.bedrooms}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-medium text-gray-800 truncate">
                      {similar.title}
                    </h4>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-gray-400" />
                      {similar.area}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition"
          >
            <Phone size={18} />
            Call
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-[2] flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#20BD5A] transition shadow-lg shadow-[#25D366]/25"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </button>
        </div>
      </div>

      {/* Full-Screen Image Viewer with Navigation */}
      {isImageViewerOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsImageViewerOpen(false)}
        >
          <button
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute top-4 right-4 z-[101] p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition"
          >
            <X size={28} className="text-white" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center px-4">
            <img
              src={images[currentImageIndex]}
              alt={property.title}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image'
              }}
            />
            
            {/* Navigation arrows in fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition backdrop-blur-sm"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition backdrop-blur-sm"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
            
            {images.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
            
            {images.length > 1 && (
              <div 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
