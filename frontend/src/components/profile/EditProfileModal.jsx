import { useState, useEffect } from 'react'
import { X, User, Phone, MapPin, Mail, Save, Loader2 } from 'lucide-react'

export function EditProfileModal({ isOpen, onClose, profile, user, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    location: '',
    email: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: profile?.name || '',
        whatsapp_number: profile?.whatsapp_number || '',
        location: profile?.location || '',
        email: user?.email || ''
      })
      setError(null)
    }
  }, [profile, user, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      await onSave(formData)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getInitials = () => {
    const name = formData.name || user?.email || 'User'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header - Smaller */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form - Tighter spacing */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto max-h-[calc(85vh-60px)]">
          {error && (
            <div className="bg-red-50 text-red-700 p-2.5 rounded-lg text-xs border border-red-200">
              {error}
            </div>
          )}

          {/* Avatar - Smaller */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
              {getInitials()}
            </div>
            <h3 className="mt-2 font-semibold text-sm text-gray-900">
              {formData.name || 'Your Profile'}
            </h3>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{ fontSize: '16px' }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Email - Read-only */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-700 mb-1">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                style={{ fontSize: '16px' }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-700 mb-1">Location</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Abuja, Nigeria"
                style={{ fontSize: '16px' }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Buttons - Smaller */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
