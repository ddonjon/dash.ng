import { useEffect, useState } from 'react'
import { getProperties } from '../../services/properties'
import { PropertyCard } from './PropertyCard'

export function PropertyFeed({ activeArea, filters }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProperties()
  }, [activeArea, filters])

  const loadProperties = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const filtersObj = { ...filters }
      
      if (activeArea && activeArea !== 'All') {
        filtersObj.area = activeArea
      }
      
      console.log('Fetching properties with filters:', filtersObj)
      const data = await getProperties(filtersObj)
      console.log('Data received:', data)
      setProperties(data)
    } catch (err) {
      console.error('Error loading properties:', err)
      setError(`Failed to load properties: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyClick = (property) => {
    console.log('Property clicked:', property.id)
  }

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
              <div className="h-48 sm:h-full sm:min-h-[200px] bg-gray-200" />
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={loadProperties}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-800">No properties found</h3>
        <p className="text-gray-500 mt-1 text-sm">
          Try adjusting your filters or search in a different area
        </p>
      </div>
    )
  }

  return (
    <div className="py-4 space-y-4">
      <div className="text-sm text-gray-500 mb-2">
        {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
      </div>
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property}
          onClick={() => handlePropertyClick(property)}
        />
      ))}
    </div>
  )
}
