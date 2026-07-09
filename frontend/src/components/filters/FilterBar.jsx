import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const AREAS = ['All', 'Gwarinpa', 'Wuse II', 'Maitama', 'Jabi', 'Lugbe', 'Asokoro', 'Garki']

export function FilterBar({ activeArea, setActiveArea, filters, setFilters, onOpenFilterDrawer }) {
  const [searchQuery, setSearchQuery] = useState('')

  const clearFilter = (key) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.bedrooms) count++
    return count
  }

  const filterCount = getActiveFilterCount()

  // Filter areas based on search query
  const filteredAreas = AREAS.filter(area =>
    area.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="sticky top-[56px] z-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="py-2.5 flex justify-center">
          <div className="relative w-64 sm:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area..."
              style={{ fontSize: '16px' }}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-normal bg-gray-50/80 border border-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-[#6C4DFF]/30 focus:border-[#6C4DFF]/30 placeholder:text-gray-400 placeholder:text-xs"
            />
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="pb-2.5 flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => {
              console.log('🔵 Opening filter drawer from FilterBar')
              onOpenFilterDrawer()
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-[11px] font-semibold hover:bg-[#F7F4FF] hover:border-[#DDD4FF] transition"
          >
            <SlidersHorizontal size={13} />
            Filters
            {filterCount > 0 && (
              <span className="w-1.5 h-1.5 bg-[#6C4DFF] rounded-full" />
            )}
          </button>

          {/* Quick filter pills */}
          {filters.minPrice && (
            <div className="flex items-center gap-0.5 px-2.5 py-1 bg-[#EFE9FF] text-[#6C4DFF] border border-[#DDD4FF] rounded-full text-[10px] font-bold">
              ₦{filters.minPrice?.toLocaleString()} - ₦{filters.maxPrice?.toLocaleString()}
              <button onClick={() => clearFilter('minPrice')} className="text-[#6C4DFF] hover:text-[#5A3EF5] transition ml-0.5">
                <X size={12} />
              </button>
            </div>
          )}

          {filters.bedrooms && (
            <div className="flex items-center gap-0.5 px-2.5 py-1 bg-[#EFE9FF] text-[#6C4DFF] border border-[#DDD4FF] rounded-full text-[10px] font-bold">
              {filters.bedrooms} bed{filters.bedrooms > 1 ? 's' : ''}
              <button onClick={() => clearFilter('bedrooms')} className="text-[#6C4DFF] hover:text-[#5A3EF5] transition ml-0.5">
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Primary Areas */}
        <div className="pb-2.5">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 min-w-max">
              {filteredAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setActiveArea(area)}
                  className={`
                    px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-200
                    ${activeArea === area 
                      ? 'bg-[#EFE9FF] text-[#6C4DFF] border border-[#DDD4FF]' 
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-[#F7F4FF]'}
                  `}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
