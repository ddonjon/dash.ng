import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, X, Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'

export function ResetPassword({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // 'request' | 'form' | 'success' | 'complete'
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Check if we have a recovery hash
      const hash = window.location.hash
      if (hash && hash.includes('type=recovery')) {
        console.log('🔑 Recovery hash detected, showing form')
        setStep('form')
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        setStep('request')
      }
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Reset state when closed
      setTimeout(() => {
        setStep('request')
        setEmail('')
        setNewPassword('')
        setConfirmPassword('')
        setError(null)
        setLoading(false)
      }, 300)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Listen for auth events when modal is open
  useEffect(() => {
    if (!isOpen) return

    console.log('🔍 ResetPassword modal mounted')
    console.log('📍 Current URL:', window.location.href)
    console.log('📍 Hash:', window.location.hash)

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🛡️ Auth Event Detected:', event)
        
        if (event === 'PASSWORD_RECOVERY') {
          console.log('✅ Recovery session established!')
          window.history.replaceState({}, document.title, window.location.pathname)
          setStep('form')
          setError(null)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [isOpen])

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const redirectUrl = `${window.location.origin}/reset-password`
      
      console.log('📧 Sending reset email to:', email)
      console.log('🔄 With Redirect URL:', redirectUrl)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) throw error

      setStep('success')
    } catch (err) {
      console.error('Reset error:', err)
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      console.log('🔄 Updating password...')
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      console.log('✅ Password updated successfully')
      setStep('complete')
      
      setTimeout(() => {
        onClose()
        navigate('/')
      }, 2500)
    } catch (err) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  // Complete state (password updated)
  if (step === 'complete') {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
          onClick={handleClose}
        />
        
        <div className="fixed bottom-0 left-0 right-0 z-[301] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
          
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="px-6 pb-6">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <CheckCircle size={28} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Password Updated!</h2>
              <p className="text-sm text-gray-500 mt-2">Your password has been successfully reset</p>
              <p className="text-xs text-gray-400 mt-1">Redirecting to home...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Success state (email sent)
  if (step === 'success') {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
          onClick={handleClose}
        />
        
        <div className="fixed bottom-0 left-0 right-0 z-[301] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
          
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="px-6 pb-6">
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <CheckCircle size={28} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Check Your Email</h2>
              <p className="text-sm text-gray-500 mt-2">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click the link in the email to reset your password
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Request form
  if (step === 'request') {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
          onClick={handleClose}
        />
        
        <div className="fixed bottom-0 left-0 right-0 z-[301] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
          
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="px-6 pb-6">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-600/20">
                <Mail size={24} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-800">Reset Password</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter your email to receive a password reset link
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-2 rounded-xl text-xs mb-3 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ fontSize: '16px' }}
                  className="w-full px-4 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  We'll send a password reset link to this email
                </p>
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
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }

  // Password update form (step === 'form')
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
        onClick={handleClose}
      />
      
      <div className="fixed bottom-0 left-0 right-0 z-[301] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slideUp">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
        
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="px-6 pb-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-600/20">
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Set New Password</h1>
            <p className="text-xs text-gray-500 mt-0.5">Enter your new password below</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            {error && (
              <div className="bg-red-50 text-red-600 p-2 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (min 6)"
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-10 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
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
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
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
