import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#6C4DFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // If not logged in, redirect to home
  if (!user) {
    return <Navigate to="/" replace />
  }

  // If logged in, show the protected content
  return children
}
