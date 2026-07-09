import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { HeaderUI } from './components/layout/HeaderUI'
import { DrawerMenu } from './components/layout/DrawerMenu'
import { FilterBar } from './components/filters/FilterBar'
import { FilterDrawer } from './components/filters/FilterDrawer'
import { PropertyFeed } from './components/property/PropertyFeed'
import { PropertyDetail } from './components/property/PropertyDetail'
import { ListProperty } from './components/property/ListProperty'
import { Profile } from './components/profile/Profile'
import { SignIn } from './components/auth/SignIn'
import { SignUp } from './components/auth/SignUp'
import './App.css'

function HomePage({ isDrawerOpen }) {
  const [activeArea, setActiveArea] = useState('All')
  const [filters, setFilters] = useState({})
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  return (
    <>
      <Helmet>
        <title>Dash - Real Estate</title>
      </Helmet>
      <div className={`transition-all duration-300 ${isDrawerOpen ? 'blur-sm' : ''}`}>
        <FilterBar 
          activeArea={activeArea}
          setActiveArea={setActiveArea}
          filters={filters}
          setFilters={setFilters}
          onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PropertyFeed 
            activeArea={activeArea}
            filters={filters}
          />
        </div>
      </div>
      <FilterDrawer 
        isOpen={isFilterDrawerOpen} 
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  )
}

function AppContent() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/list-property' && !user) {
      setShowSignIn(true)
      navigate('/')
    }
  }, [user, navigate])

  const openSignIn = () => {
    setShowSignUp(false)
    setShowSignIn(true)
  }

  const openSignUp = () => {
    setShowSignIn(false)
    setShowSignUp(true)
  }

  const closeAll = () => {
    setShowSignIn(false)
    setShowSignUp(false)
  }

  const handleDrawerToggle = (open) => {
    setIsDrawerOpen(open)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Blurrable content - Header UI + everything else */}
      <div className={`transition-all duration-300 ${isDrawerOpen ? 'blur-sm' : ''}`}>
        <HeaderUI 
          onSignIn={openSignIn}
          onSignUp={openSignUp}
          onDrawerToggle={handleDrawerToggle}
        />
        <div className="bg-white">
          <Routes>
            <Route path="/" element={<HomePage isDrawerOpen={isDrawerOpen} />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/list-property" element={
              <ProtectedRoute>
                <ListProperty />
              </ProtectedRoute>
            } />
            <Route path="/sign-in" element={<Navigate to="/" replace />} />
            <Route path="/sign-up" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      
      {/* DrawerMenu - OUTSIDE the blur */}
      <DrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={() => handleDrawerToggle(false)}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />
      
      <SignIn 
        isOpen={showSignIn} 
        onClose={closeAll}
        onSwitchToSignUp={openSignUp}
      />
      <SignUp 
        isOpen={showSignUp} 
        onClose={closeAll}
        onSwitchToSignIn={openSignIn}
      />
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </HelmetProvider>
  )
}

export default App
