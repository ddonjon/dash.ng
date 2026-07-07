import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProperties } from '../../services/properties'
import { PropertyCard } from './PropertyCard'

export function PropertyFeed({ activeArea, filters }) {
  const navigate = useNavigate()
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
      
      const data = await getProperties(filtersObj)
      setProperties(data || [])
    } catch (err) {
      console.error('Error loading properties:', err)
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyClick = (property) => {
    navigate(`/property/${property.id}`)
  }

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 rounded-2xl shadow-sm overflow-hidden animate-pulse border-2 border-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
              <div className="h-48 sm:h-full sm:min-h-[200px] bg-gray-200" />
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-5 space-y-3">
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
      <div className="py-12 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-700">Something went wrong</h3>
        <p className="text-gray-400 mt-1 text-sm">{error}</p>
        <button 
          onClick={loadProperties}
          className="mt-4 px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-700">No properties found</h3>
        <p className="text-gray-400 mt-1 text-sm">
          Try adjusting your filters or search in a different area
        </p>
      </div>
    )
  }

  return (
    <div className="py-4 space-y-4">
      <div className="text-sm text-gray-400 mb-3">
        <span className="font-medium text-gray-600">{properties.length}</span> properties found
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
