import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, X, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { generateVerificationCode, sendVerificationCode, storeVerificationCode, verifyCode, resendVerificationCode } from '../../services/emailVerification'

export function SignUp({ isOpen, onClose, onSwitchToSignIn }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState('form')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp_number: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      whatsapp_number: ''
    })
    setVerificationCode('')
    setError(null)
    setStep('form')
    setLoading(false)
    setVerifying(false)
    setResending(false)
    setUserEmail('')
    setUserName('')
    setResendTimer(0)
    setIsSuccess(false)
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      resetForm()
    } else {
      document.body.style.overflow = 'unset'
      resetForm()
    }
    return () => {
      document.body.style.overflow = 'unset'
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (user && isSuccess) {
      setTimeout(() => {
        onClose()
        navigate('/')
        setTimeout(resetForm, 500)
      }, 1500)
    }
  }, [user, isSuccess, onClose, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('whatsapp_number')
        .eq('whatsapp_number', formData.whatsapp_number)
        .maybeSingle()

      if (existingUser) {
        throw new Error('This WhatsApp number is already registered.')
      }

      setUserEmail(formData.email)
      setUserName(formData.name)

      const code = generateVerificationCode()
      await storeVerificationCode(formData.email, code)
      
      const sendResult = await sendVerificationCode(formData.email, code, formData.name)
      
      if (!sendResult.success) {
        console.error('Failed to send verification email:', sendResult.error)
        showToast('Failed to send verification code. Please try again.', 'error', 5000)
        setLoading(false)
        return
      }

      showToast('Verification code sent to your email! 📧', 'success', 3000)
      
      setStep('verify')
      setLoading(false)
      
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimerInterval(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setTimerInterval(interval)

    } catch (err) {
      console.error('Signup error:', err)
      
      if (err.message.includes('whatsapp') || err.message.includes('already registered')) {
        setError('This WhatsApp number is already registered.')
      } else if (err.message.includes('User already registered')) {
        setError('An account with this email already exists.')
      } else if (err.message.includes('password')) {
        setError('Password must be at least 6 characters.')
      } else {
        setError(err.message || 'Failed to send verification code. Please try again.')
      }
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setVerifying(true)
    setError(null)

    try {
      const result = await verifyCode(userEmail, verificationCode)
      
      if (!result.success) {
        setError(result.error)
        setVerifying(false)
        return
      }

      console.log('✅ Code verified, creating account for:', userEmail)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            whatsapp_number: formData.whatsapp_number
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(authError.message || 'Failed to create account. Please try again.')
      }

      if (!authData.user) {
        throw new Error('Failed to create account. Please try again.')
      }

      // Step 2: Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          name: formData.name,
          whatsapp_number: formData.whatsapp_number,
          is_verified_agent: false,
          location: ''
        }])

      // If profile creation fails, log it but continue - the auth user exists
      if (profileError) {
        console.error('⚠️ Profile creation error (continuing anyway):', profileError)
        // Don't throw error - just log it
        // The user can still login, we'll try to create the profile later if needed
        showToast('Account created! Profile may take a moment to load.', 'info', 3000)
      }

      // Step 3: Try to auto-login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        console.error('Auto-login error:', signInError)
        showToast('Account created! Please sign in manually.', 'info', 3000)
        setVerifying(false)
        setTimeout(() => {
          onClose()
          navigate('/')
          setTimeout(resetForm, 500)
        }, 2000)
        return
      }

      setIsSuccess(true)
      showToast(`Welcome to Dash, ${formData.name}! 🎉`, 'success', 4000)

    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message || 'Invalid verification code.')
      setVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    
    setResending(true)
    setError(null)

    try {
      const result = await resendVerificationCode(userEmail, userName)
      
      if (!result.success) {
        showToast('Failed to resend code. Please try again.', 'error', 4000)
        setResending(false)
        return
      }

      showToast('New verification code sent! 📧', 'success', 3000)
      
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimerInterval(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setTimerInterval(interval)

    } catch (err) {
      setError('Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleSwitchToSignIn = () => {
    onClose()
    onSwitchToSignIn()
  }

  if (!isOpen) return null

  if (step === 'verify') {
    return (
      <div className="fixed inset-0 z-[301] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>

          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-600/20">
              <KeyRound size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Verify Your Email</h1>
            <p className="text-sm text-gray-500 mt-1">
              We've sent a verification code to <br />
              <span className="font-semibold text-gray-700">{userEmail}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Enter the 6-digit code to complete your registration
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2.5 rounded-xl text-sm mb-3 flex items-start gap-2 border border-red-200">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Verification Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                style={{ fontSize: '16px' }}
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50 text-center text-2xl font-bold tracking-widest"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Code expires in 10 minutes
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || resending}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
                  resendTimer > 0 || resending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-purple-600 hover:bg-purple-50'
                }`}
              >
                {resending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
              
              <button
                type="submit"
                disabled={verifying || verificationCode.length < 6}
                className={`flex-[2] py-2.5 rounded-xl font-semibold text-sm text-white transition ${
                  verifying || verificationCode.length < 6
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25'
                }`}
              >
                {verifying ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('form')
                setError(null)
              }}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition"
            >
              ← Go back and edit details
            </button>
          </form>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn {
            animation: scaleIn 0.25s ease-out;
          }
        `}</style>
      </div>
    )
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
              <UserPlus size={24} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Create Account</h1>
            <p className="text-xs text-gray-500 mt-0.5">Join Dash and start listing</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2.5 rounded-xl text-sm mb-3 flex items-start gap-2 border border-red-200">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                  style={{ fontSize: '16px' }}
                  className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be unique. Cannot be used for multiple accounts.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white transition ${
                loading 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Code...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{' '}
            <button
              onClick={handleSwitchToSignIn}
              className="text-purple-600 font-medium hover:text-purple-700 transition"
            >
              Sign In
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
