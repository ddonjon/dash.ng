import { useState } from 'react'
import { X, Search, Check } from 'lucide-react'

const PRICE_RANGES = [
  { label: 'Under ₦50M', min: 0, max: 50000000 },
  { label: '₦50M - ₦100M', min: 50000000, max: 100000000 },
  { label: '₦100M - ₦200M', min: 100000000, max: 200000000 },
  { label: 'Over ₦200M', min: 200000000, max: null },
]

const BEDROOM_OPTIONS = [
  { label: 'Studio', value: 0 },
  { label: '1 Bed', value: 1 },
  { label: '2 Beds', value: 2 },
  { label: '3 Beds', value: 3 },
  { label: '4+ Beds', value: 4 },
]

export function FilterDrawer({ isOpen, onClose, filters, setFilters }) {
  const [customSearch, setCustomSearch] = useState('')

  if (!isOpen) return null

  const handlePriceSelect = (range) => {
    setFilters({ 
      ...filters, 
      minPrice: range.min, 
      maxPrice: range.max 
    })
  }

  const handleBedSelect = (beds) => {
    setFilters({ 
      ...filters, 
      bedrooms: beds 
    })
  }

  const clearFilters = () => {
    setFilters({})
    onClose()
  }

  const isPriceActive = (range) => {
    return filters.minPrice === range.min && filters.maxPrice === range.max
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
        
        <div className="flex justify-between items-center px-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h3>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handlePriceSelect(range)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isPriceActive(range)
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {range.label}
                  {isPriceActive(range) && <Check size={14} className="inline ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Bedrooms</h3>
            <div className="flex flex-wrap gap-2">
              {BEDROOM_OPTIONS.map((bed) => (
                <button
                  key={bed.label}
                  onClick={() => handleBedSelect(bed.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${filters.bedrooms === bed.value
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {bed.label}
                  {filters.bedrooms === bed.value && <Check size={14} className="inline ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Search */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Area</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Type area name..."
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>
            {customSearch && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                Searching for: <span className="font-medium text-gray-800">"{customSearch}"</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md hover:shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}