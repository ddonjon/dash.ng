import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Bed, X, CheckCircle, MessageCircle } from 'lucide-react'
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
    const message = `Hello ${property?.users?.name || 'Agent'}, I'm interested in your property: ${property?.title} in ${property?.area} for ${formatPrice(property?.price)}. Is it still available?`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const openImageViewer = (index) => {
    setCurrentImageIndex(index)
    setIsImageViewerOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
            className="mt-4 px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
          >
            Back to listings
          </button>
        </div>
      </div>
    )
  }

  const images = property.media_urls?.length > 0 ? property.media_urls : ['https://placehold.co/600x400/e2e8f0/64748b?text=No+Image']

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Back Button - Clean, no text */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition"
      >
        <ArrowLeft size={22} className="text-gray-700" />
      </button>

      {/* Image Slider */}
      <div 
        className="relative h-80 sm:h-96 bg-gray-200 cursor-pointer"
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
        
        {/* Image Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-5 max-w-3xl mx-auto space-y-6">
        {/* Price & Verified */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-emerald-600">
            {formatPrice(property.price)}
          </span>
          {property.users?.is_verified_agent && (
            <span className="flex items-center gap-1 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle size={14} />
              Verified Agent
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-800">
          {property.title}
        </h1>

        {/* Location & Details */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={16} className="text-emerald-500" />
            {property.area}
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="flex items-center gap-1">
            <Bed size={16} className="text-gray-400" />
            {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
          </span>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">📝 Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Features Section */}
        {property.features?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">✨ Features</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <span
                  key={index}
                  className="text-xs font-medium bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Agent Section */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 Agent</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
              {property.users?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800">
                {property.users?.name || 'Agent'}
              </p>
              {property.users?.is_verified_agent && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Verified Agent
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                📞 {property.users?.whatsapp_number || 'No phone number'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom WhatsApp Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-emerald-600 transition shadow-lg hover:shadow-xl"
          >
            <MessageCircle size={20} />
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
            
            {/* Image Navigation Dots in Fullscreen */}
            {images.length > 1 && (
              <div 
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition ${
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
