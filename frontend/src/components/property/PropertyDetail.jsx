import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, MapPin, Bed, X, CheckCircle, MessageCircle, 
  Phone, Home, Building, Clock
} from 'lucide-react'
import { getPropertyById } from '../../services/properties'

export function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  useEffect(() => {
    loadProperty()
  }, [id])

  const loadProperty = async () => {
    try {
      const data = await getPropertyById(id)
      setProperty(data)
    } catch (err) {
      setError('Failed to load property details')
      console.error(err)
    } finally {
      setLoading(false)
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

  const handleWhatsApp = () => {
    const phone = property?.users?.whatsapp_number?.replace('+', '') || ''
    const message = `Hello ${property?.users?.name || 'Agent'}, I'm interested in your property: ${property?.title} in ${property?.area} for ${formatPrice(property?.price)} per annum. Is it still available?`
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6C4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading property...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-700">Property not found</h3>
          <p className="text-gray-400 mt-1 text-sm">{error || 'The property you\'re looking for doesn\'t exist.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2.5 bg-[#6C4DFF] text-white rounded-lg font-medium hover:bg-[#5A3EF5] transition"
          >
            Back to listings
          </button>
        </div>
      </div>
    )
  }

  const images = property.media_urls?.length > 0 ? property.media_urls : ['https://placehold.co/600x400/e2e8f0/64748b?text=No+Image']

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Custom Header with Back Button */}
      <div className="sticky top-0 z-50 bg-gray-100 shadow-sm border-b border-gray-300">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 hover:bg-gray-200 rounded-full transition"
          >
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-800 truncate ml-2">
            {property.title}
          </h1>
        </div>
      </div>

      {/* Image Slider */}
      <div 
        className="relative h-80 sm:h-[420px] bg-gray-200 cursor-pointer"
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
        
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
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
            <span className="text-lg font-bold text-[#6C4DFF]">
              {formatPrice(property.price)}
            </span>
            <span className="text-xs text-gray-400 ml-1.5 font-medium">/ annum</span>
          </div>
          {property.users?.is_verified_agent && (
            <span className="flex items-center gap-1 text-xs text-[#6C4DFF] bg-[#EFE9FF] px-2.5 py-0.5 rounded-full border border-[#DDD4FF]">
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
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Location</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin size={14} className="text-gray-400" />
              {property.area}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Bedrooms</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Bed size={14} className="text-gray-400" />
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Property Type</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Building size={14} className="text-gray-400" />
              Apartment
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400">Status</p>
            <p className="text-sm font-medium text-[#6C4DFF] flex items-center gap-1">
              <Clock size={14} className="text-[#6C4DFF]" />
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

        {/* Features - Grey badges */}
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
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Agent</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#6C4DFF] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {property.users?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {property.users?.name || 'Agent'}
              </p>
              {property.users?.is_verified_agent && (
                <p className="text-xs text-[#6C4DFF] flex items-center gap-1">
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

      {/* Full-Screen Image Viewer */}
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
