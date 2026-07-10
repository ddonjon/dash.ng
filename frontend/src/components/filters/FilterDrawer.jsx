import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function FilterDrawer({ isOpen, onClose, filters, setFilters }) {
  const [localFilters, setLocalFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  })

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        bedrooms: filters.bedrooms || ''
      })
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, filters])

  const handleApply = () => {
    const appliedFilters = {}
    if (localFilters.minPrice) appliedFilters.minPrice = localFilters.minPrice
    if (localFilters.maxPrice) appliedFilters.maxPrice = localFilters.maxPrice
    if (localFilters.bedrooms) appliedFilters.bedrooms = localFilters.bedrooms
    setFilters(appliedFilters)
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: ''
    })
    setFilters({})
    onClose()
  }

  const priceOptions = [
    { label: 'Any Price', min: null, max: null },
    { label: 'Under ₦50M', min: 0, max: 50000000 },
    { label: '₦50M - ₦100M', min: 50000000, max: 100000000 },
    { label: '₦100M - ₦200M', min: 100000000, max: 200000000 },
    { label: 'Over ₦200M', min: 200000000, max: null },
  ]

  const bedroomOptions = [
    { label: 'Any', value: '' },
    { label: '1 Bed', value: '1' },
    { label: '2 Beds', value: '2' },
    { label: '3 Beds', value: '3' },
    { label: '4 Beds', value: '4' },
    { label: '5+ Beds', value: '5' },
  ]

  const isPriceActive = (range) => {
    return localFilters.minPrice == range.min && localFilters.maxPrice == range.max
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-[301] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Price Range */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Price Range</label>
              <div className="flex flex-wrap gap-1.5">
                {priceOptions.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setLocalFilters({ 
                      ...localFilters, 
                      minPrice: range.min, 
                      maxPrice: range.max 
                    })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      isPriceActive(range)
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Bedrooms</label>
              <div className="flex flex-wrap gap-1.5">
                {bedroomOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setLocalFilters({ 
                      ...localFilters, 
                      bedrooms: option.value 
                    })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      localFilters.bedrooms == option.value
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-white hover:border-gray-400 transition"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/25"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
