import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'

export function ProfileDebug() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  console.log('🔵 ProfileDebug component is rendering!')

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Profile Debug</h1>
            <p className="text-xs text-gray-500">Testing if components render</p>
          </div>
        </div>
        
        {/* EDIT BUTTON - Very obvious */}
        <button
          onClick={() => {
            console.log('🔵 Edit button clicked!')
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#6C4DFF] hover:bg-[#5A3EF5] text-white font-bold rounded-xl transition shadow-lg text-base"
        >
          <Pencil size={20} />
          EDIT PROFILE
        </button>
      </div>

      {/* Test Content */}
      <div className="bg-white rounded-xl border-2 border-purple-300 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Debug Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          If you can see this page and the EDIT PROFILE button, then React is working correctly.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800 font-medium">
            🔍 If you see this page but the main Profile page has no edit button, 
            the issue is with the Profile component itself, not the routing.
          </p>
        </div>

        <button
          onClick={() => {
            console.log('🔵 TEST button clicked!')
            alert('✅ Test button works!')
          }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition"
        >
          🧪 TEST BUTTON
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎉 Modal Works!</h2>
            <p className="text-gray-600 mb-6">
              The Edit button opened this modal successfully. 
              This means the button click handler is working correctly.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#6C4DFF] text-white rounded-xl font-semibold hover:bg-[#5A3EF5] transition"
            >
              Close Modal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
