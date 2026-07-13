import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff, X, LogIn } from 'lucide-react'
import { supabase } from '../../services/supabase'

export function SignIn({ isOpen, onClose, onSwitchToSignUp, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    onClose()
    if (onForgotPassword) {
      onForgotPassword()
    }
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
        onClick={onClose}
      />
      
      <div className="fixed bottom-0 left-0 right-0 z-[301] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="px-6 pb-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-600/20">
              <LogIn size={24} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Welcome Back</h1>
            <p className="text-xs text-gray-500 mt-0.5">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-xl text-xs mb-3 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-2.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-10 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-purple-600 font-medium hover:text-purple-700 transition"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white transition ${
                loading 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Don't have an account?{' '}
            <button
              onClick={() => {
                onClose()
                onSwitchToSignUp()
              }}
              className="text-purple-600 font-medium hover:text-purple-700 transition"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
