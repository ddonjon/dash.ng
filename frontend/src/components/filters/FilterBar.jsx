import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { FilterDrawer } from './FilterDrawer'

const AREAS = ['All', 'Gwarinpa', 'Wuse II', 'Maitama', 'Jabi', 'Lugbe', 'Asokoro', 'Garki']

export function FilterBar({ activeArea, setActiveArea, filters, setFilters }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primary Areas - Horizontal Scroll */}
        <div className="py-3">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setActiveArea(area)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
                    ${activeArea === area 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Filters - Price & Beds Pills */}
        <div className="pb-3 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            <SlidersHorizontal size={14} />
            Filters
            {(filters.minPrice || filters.maxPrice || filters.bedrooms) && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* Quick filter pills */}
          {filters.minPrice && (
            <button
              onClick={() => setFilters({ ...filters, minPrice: null, maxPrice: null })}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              ₦{filters.minPrice?.toLocaleString()} - ₦{filters.maxPrice?.toLocaleString()}
              <span className="text-blue-500">×</span>
            </button>
          )}

          {filters.bedrooms && (
            <button
              onClick={() => setFilters({ ...filters, bedrooms: null })}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {filters.bedrooms} bed{filters.bedrooms > 1 ? 's' : ''}
              <span className="text-blue-500">×</span>
            </button>
          )}

          <div className="flex-1" />
          
          {/* Search button */}
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Search size={20} />
          </button>
        </div>

        {/* Filter Drawer */}
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
