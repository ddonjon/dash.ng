import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'

export function ResetPasswordDebug() {
  const navigate = useNavigate()
  const [urlInfo, setUrlInfo] = useState({})
  const [sessionInfo, setSessionInfo] = useState(null)

  useEffect(() => {
    const getUrlInfo = async () => {
      // Get all URL info
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1))
      
      const info = {
        fullUrl: window.location.href,
        pathname: window.location.pathname,
        hash: hash,
        accessToken: params.get('access_token'),
        refreshToken: params.get('refresh_token'),
        type: params.get('type'),
        expiresAt: params.get('expires_at'),
        expiresIn: params.get('expires_in'),
        tokenType: params.get('token_type'),
      }
      
      setUrlInfo(info)
      console.log('🔍 URL Debug Info:', info)

      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('❌ Session error:', error)
      } else {
        console.log('✅ Current session:', session)
        setSessionInfo({
          hasSession: !!session,
          user: session?.user?.email || 'No user',
          expiresAt: session?.expires_at || 'N/A'
        })
      }

      // If we have tokens, try to set the session
      if (params.get('access_token') && params.get('refresh_token')) {
        console.log('🔄 Attempting to set session with tokens...')
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: params.get('access_token'),
            refresh_token: params.get('refresh_token')
          })
          if (error) {
            console.error('❌ Failed to set session:', error)
          } else {
            console.log('✅ Session set successfully!')
            setSessionInfo(prev => ({
              ...prev,
              setSessionSuccess: true
            }))
          }
        } catch (err) {
          console.error('❌ Error setting session:', err)
        }
      }
    }

    getUrlInfo()
  }, [])

  const handleTestReset = () => {
    navigate('/reset-password')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🔍 Reset Password Debug</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-600 font-medium">📋 Instructions</p>
          <p className="text-xs text-blue-600 mt-1">
            1. Click the reset link from your email<br />
            2. If it doesn't work, paste the URL here manually<br />
            3. This page will show you what's in the URL
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-600 font-medium">Current URL</p>
            <p className="text-sm font-mono break-all mt-1">{urlInfo.fullUrl || 'Loading...'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Pathname</p>
            <p className="text-sm font-mono">{urlInfo.pathname}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Hash</p>
            <p className="text-sm font-mono break-all">{urlInfo.hash || '(No hash)'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm font-mono">{urlInfo.type || '(Not set)'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Access Token</p>
            <p className="text-sm font-mono break-all">{urlInfo.accessToken ? `${urlInfo.accessToken.substring(0, 30)}...` : '(Not found)'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Refresh Token</p>
            <p className="text-sm font-mono">{urlInfo.refreshToken || '(Not found)'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Session Status</p>
            <p className="text-sm font-mono">
              {sessionInfo ? (
                <>
                  <span className={sessionInfo.hasSession ? 'text-emerald-600' : 'text-red-600'}>
                    {sessionInfo.hasSession ? '✅ Active' : '❌ No session'}
                  </span>
                  {sessionInfo.user && (
                    <span className="block text-xs text-gray-500 mt-1">
                      User: {sessionInfo.user}
                    </span>
                  )}
                  {sessionInfo.setSessionSuccess && (
                    <span className="block text-xs text-emerald-600 mt-1">
                      ✅ Session set successfully!
                    </span>
                  )}
                </>
              ) : 'Checking...'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleTestReset}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
          >
            Go to Reset Password
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
          >
            Go Home
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 font-medium mb-1">💡 Troubleshooting Tips:</p>
          <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
            <li>Make sure Supabase redirect URL is set to: <code className="bg-gray-200 px-1 rounded">http://localhost:3000/**</code></li>
            <li>The URL should contain <code className="bg-gray-200 px-1 rounded">#access_token=...</code> in the hash</li>
            <li>Type should be <code className="bg-gray-200 px-1 rounded">recovery</code> for password reset</li>
            <li>If the page loads with the hash, the component should automatically extract the tokens</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
