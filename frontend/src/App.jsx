import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { Header } from './components/layout/Header'
import { FilterBar } from './components/filters/FilterBar'
import { PropertyFeed } from './components/property/PropertyFeed'
import { PropertyDetail } from './components/property/PropertyDetail'
import './App.css'

function HomePage() {
  const [activeArea, setActiveArea] = useState('All')
  const [filters, setFilters] = useState({})

  return (
    <>
      <Helmet>
        <title>Dash - Real Estate</title>
      </Helmet>
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
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-[#F8FAFC]">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/property/:id" element={
              <>
                <Helmet>
                  <title>Dash - Property Details</title>
                </Helmet>
                <PropertyDetail />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  )
}

export default App
