import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { FilterDrawer } from './FilterDrawer'

const AREAS = ['All', 'Gwarinpa', 'Wuse II', 'Maitama', 'Jabi', 'Lugbe', 'Asokoro', 'Garki']

export function FilterBar({ activeArea, setActiveArea, filters, setFilters }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const clearFilter = (key) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
  }

  return (
    <div className="sticky top-[56px] z-40 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primary Areas - Light green active */}
        <div className="py-3">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setActiveArea(area)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${activeArea === area 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                  `}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="pb-3 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            <SlidersHorizontal size={14} />
            Filters
            {(filters.minPrice || filters.maxPrice || filters.bedrooms) && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Quick filter pills */}
          {filters.minPrice && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
              ₦{filters.minPrice?.toLocaleString()} - ₦{filters.maxPrice?.toLocaleString()}
              <button onClick={() => clearFilter('minPrice')} className="text-emerald-400 hover:text-emerald-600">
                <X size={14} />
              </button>
            </div>
          )}

          {filters.bedrooms && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
              {filters.bedrooms} bed{filters.bedrooms > 1 ? 's' : ''}
              <button onClick={() => clearFilter('bedrooms')} className="text-emerald-400 hover:text-emerald-600">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex-1" />
          
          <button className="p-2 text-gray-400 hover:text-gray-600 transition">
            <Search size={20} />
          </button>
        </div>

        <FilterDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)}
          filters={filters}
          setFilters={setFilters}
        />
      </div>
    </div>
  )
}