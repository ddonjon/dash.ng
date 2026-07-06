import { useState } from 'react'
import { Header } from './components/layout/Header'
import { FilterBar } from './components/filters/FilterBar'
import { PropertyFeed } from './components/property/PropertyFeed'
import './App.css'

function App() {
  const [activeArea, setActiveArea] = useState('All')
  const [filters, setFilters] = useState({})

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FilterBar 
        activeArea={activeArea}
        setActiveArea={setActiveArea}
        filters={filters}
        setFilters={setFilters}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PropertyFeed 
          activeArea={activeArea}
          filters={filters}
        />
      </div>
    </div>
  )
}

export default App
