import { useState } from 'react'
import { MapPin, Bed, ChevronRight } from 'lucide-react'

export function PropertyCard({ property, onClick }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getInitials = (name) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.98] lg:hover:scale-[1.02]"
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
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-4xl">🏠</span>
            </div>
          )}
          
          {/* Verified Badge Overlay */}
          {property.users?.is_verified_agent && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
              ✓ Verified Agent
            </div>
          )}
          
          {/* Bedroom Count */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
            <Bed size={14} />
            {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-1">
                {property.title}
              </h3>
              <span className="text-green-600 font-bold text-sm sm:text-base whitespace-nowrap">
                {formatPrice(property.price)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin size={14} />
              <span>{property.area}</span>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.features?.slice(0, 4).map((feature, i) => (
                <span 
                  key={i} 
                  className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
              {property.features?.length > 4 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  +{property.features.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Agent Info */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {getInitials(property.users?.name)}
              </div>
              <span className="text-sm text-gray-700 truncate">
                {property.users?.name || 'Agent'}
              </span>
              {property.users?.is_verified_agent && (
                <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
