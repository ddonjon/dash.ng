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
    <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
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
                    px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${activeArea === area 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] rounded-full text-sm font-medium text-[#0F172A] hover:bg-[#E2E8F0] transition"
          >
            <SlidersHorizontal size={14} />
            Filters
            {(filters.minPrice || filters.maxPrice || filters.bedrooms) && (
              <span className="w-2 h-2 bg-[#2563EB] rounded-full" />
            )}
          </button>

          {/* Quick filter pills */}
          {filters.minPrice && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-sm border border-[#BFDBFE]">
              ₦{filters.minPrice?.toLocaleString()} - ₦{filters.maxPrice?.toLocaleString()}
              <button onClick={() => clearFilter('minPrice')} className="hover:text-[#1D4ED8]">
                <X size={14} />
              </button>
            </div>
          )}

          {filters.bedrooms && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-sm border border-[#BFDBFE]">
              {filters.bedrooms} bed{filters.bedrooms > 1 ? 's' : ''}
              <button onClick={() => clearFilter('bedrooms')} className="hover:text-[#1D4ED8]">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex-1" />
          
          {/* Search button */}
          <button className="p-2 text-[#64748B] hover:text-[#0F172A] transition">
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