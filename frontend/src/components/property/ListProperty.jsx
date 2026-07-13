import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, Upload, X, Loader2, AlertCircle, Search, ChevronDown, CheckCircle, Save
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { getAreas } from '../../services/properties'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_FILES = 5
const MIN_FILES = 3
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/heic', 'image/heif'
]

// Popular areas (6)
const POPULAR_AREAS = [
  'Maitama',
  'Asokoro',
  'Wuse II',
  'Garki II',
  'Gwarinpa',
  'Jabi'
]

// Other areas - SORTED ALPHABETICALLY
const OTHER_AREAS = [
  'Abuja City Centre (CBD)',
  'Apo',
  'Apo-Dutse',
  'Bwari',
  'Dakibiyu',
  'Dawaki',
  'Duboyi',
  'Durumi',
  'Dutse',
  'Gaduwa',
  'Garki I',
  'Garki Village',
  'Gishiri',
  'Guzape',
  'Gwagwa',
  'Gwagwalada',
  'Jiwa',
  'Kado',
  'Karmo',
  'Karu',
  'Katampe',
  'Kaura',
  'Kubwa',
  'Kuchigoro',
  'Kuje',
  'Kurudu',
  'Kwali',
  'Life Camp',
  'Lokogoma',
  'Lugbe',
  'Mabuchi',
  'Mpape',
  'Nyanya',
  'Orozo',
  'Pyakasa',
  'Sabo',
  'Sunrise',
  'Utako',
  'Wuse I',
  'Wuye',
  'Zuba'
]

// Combined list with grouping
const ALL_ABUJA_AREAS = [...POPULAR_AREAS, ...OTHER_AREAS]

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500, 'Description too long'),
  area: z.string().min(1, 'Please select an area'),
  price: z.string().min(1, 'Please enter a price'),
  pricePeriod: z.string().min(1, 'Please select pricing period'),
  bedrooms: z.string().min(1, 'Please select number of bedrooms'),
  features: z.array(z.string()).optional(),
})

const AVAILABLE_FEATURES = [
  'Borehole',
  'Chandelier',
  'Dishwasher',
  'Estate Security',
  'Fence',
  'Generator',
  'Gym',
  'Kitchen Cabinets',
  'Parking',
  'Playground',
  'POP Ceiling',
  'Prepaid Meter',
  'Swimming Pool',
  'Tarred Road',
  'Tiled Floor',
  'Water Supply'
]

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6]

export function ListProperty() {
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [images, setImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Search dropdown states
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false)
  const [areaSearchTerm, setAreaSearchTerm] = useState('')
  const [filteredAreas, setFilteredAreas] = useState(ALL_ABUJA_AREAS)
  const dropdownRef = useRef(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      area: '',
      price: '',
      pricePeriod: 'annum',
      bedrooms: '',
      features: [],
    }
  })

  const selectedArea = watch('area')

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Filter areas based on search term
  useEffect(() => {
    if (areaSearchTerm.trim() === '') {
      setFilteredAreas(ALL_ABUJA_AREAS)
    } else {
      const filtered = ALL_ABUJA_AREAS.filter(area =>
        area.toLowerCase().includes(areaSearchTerm.toLowerCase())
      )
      setFilteredAreas(filtered)
    }
  }, [areaSearchTerm])

  // Reset search term when dropdown opens
  useEffect(() => {
    if (isAreaDropdownOpen) {
      setAreaSearchTerm('')
    }
  }, [isAreaDropdownOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAreaDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    checkUserAndProfile()
    loadAreas()
  }, [])

  const checkUserAndProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/')
        return
      }
      setUser(user)
      console.log('👤 Auth User ID:', user.id)

      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        // Create user profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            whatsapp_number: user.phone || '',
            location: ''
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
          setError('Failed to create user profile. Please try again.')
          return
        }
        setUserProfile(newProfile)
        console.log('✅ Created profile ID:', newProfile.id)
      } else {
        setUserProfile(profile)
        console.log('✅ Found profile ID:', profile.id)
      }
    } catch (err) {
      console.error('Error checking user:', err)
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const loadAreas = async () => {
    try {
      const data = await getAreas()
      setAreas(data)
    } catch (err) {
      console.error('Error loading areas:', err)
    }
  }

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => {
      const newFeatures = prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
      setValue('features', newFeatures)
      return newFeatures
    })
  }

  // Format price with commas
  const formatPriceWithCommas = (value) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handlePriceChange = (e) => {
    const formatted = formatPriceWithCommas(e.target.value)
    setValue('price', formatted)
  }

  const validateFiles = (files) => {
    const errors = []
    const totalAfterAdd = images.length + files.length
    if (totalAfterAdd > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} images allowed. You can add ${MAX_FILES - images.length} more.`)
    }
    const oversized = files.filter(file => file.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      const names = oversized.map(f => f.name).join(', ')
      errors.push(`File(s) exceed 5MB limit: ${names}`)
    }
    const invalidTypes = files.filter(file => !ALLOWED_MIME_TYPES.includes(file.type))
    if (invalidTypes.length > 0) {
      const names = invalidTypes.map(f => f.name).join(', ')
      errors.push(`Invalid file type(s): ${names}. Allowed: JPEG, PNG, WebP, GIF, SVG, HEIC, HEIF`)
    }
    return errors
  }

  const uploadSingleImage = async (file, index) => {
    const fileName = `${Date.now()}_${index}_${file.name.replace(/\s/g, '_')}`
    const filePath = `properties/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      if (uploadError.message.includes('too large')) {
        throw new Error(`Image "${file.name}" exceeds Supabase's global file size limit (50MB)`)
      }
      throw new Error(`Failed to upload image "${file.name}": ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const validationErrors = validateFiles(files)
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' | '))
      e.target.value = ''
      return
    }

    const remaining = MAX_FILES - images.length
    const toUpload = files.slice(0, remaining)

    const previews = toUpload.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      url: null
    }))
    setImages(prev => [...prev, ...previews])
    setError(null)
    e.target.value = ''

    setUploadingImages(true)
    
    for (let i = 0; i < previews.length; i++) {
      const previewIndex = images.length + i
      try {
        const url = await uploadSingleImage(toUpload[i], i)
        setImages(prev => {
          const updated = [...prev]
          if (updated[previewIndex]) {
            updated[previewIndex] = {
              ...updated[previewIndex],
              uploading: false,
              url: url
            }
          }
          return updated
        })
      } catch (err) {
        console.error('Upload failed:', err)
        setError(`Failed to upload ${toUpload[i].name}: ${err.message}`)
        setImages(prev => prev.filter((_, idx) => idx !== previewIndex))
      }
    }
    setUploadingImages(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const validationErrors = validateFiles(files)
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' | '))
      return
    }

    const remaining = MAX_FILES - images.length
    const toUpload = files.slice(0, remaining)

    const previews = toUpload.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      url: null
    }))
    setImages(prev => [...prev, ...previews])
    setError(null)

    setUploadingImages(true)
    for (let i = 0; i < previews.length; i++) {
      const previewIndex = images.length + i
      try {
        const url = await uploadSingleImage(toUpload[i], i)
        setImages(prev => {
          const updated = [...prev]
          if (updated[previewIndex]) {
            updated[previewIndex] = {
              ...updated[previewIndex],
              uploading: false,
              url: url
            }
          }
          return updated
        })
      } catch (err) {
        console.error('Upload failed:', err)
        setError(`Failed to upload ${toUpload[i].name}: ${err.message}`)
        setImages(prev => prev.filter((_, idx) => idx !== previewIndex))
      }
    }
    setUploadingImages(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev]
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview)
      }
      newImages.splice(index, 1)
      return newImages
    })
  }

  const onSubmit = async (data, status = 'published') => {
    if (!user || !userProfile) {
      setError('Please sign in to list a property')
      return
    }

    // For publishing, check minimum images
    if (status === 'published') {
      const uploadedCount = images.filter(img => img.url).length
      if (uploadedCount < MIN_FILES) {
        setError(`Please upload at least ${MIN_FILES} images (${uploadedCount}/${MIN_FILES} uploaded)`)
        return
      }
    }

    // Check if all images are uploaded
    const hasUploading = images.some(img => img.uploading)
    if (hasUploading) {
      setError('Please wait for all images to finish uploading')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const imageUrls = images
        .filter(img => img.url)
        .map(img => img.url)

      // Remove commas from price before saving
      const cleanPrice = data.price.replace(/,/g, '')

      const propertyData = {
        title: data.title,
        description: data.description,
        area: data.area,
        price: parseFloat(cleanPrice),
        price_period: data.pricePeriod,
        bedrooms: parseInt(data.bedrooms),
        features: selectedFeatures,
        media_urls: imageUrls,
        agent_id: userProfile.id, // Use the profile ID from users table
        status: status,
      }

      console.log('📝 Creating property with agent_id:', userProfile.id)

      const { data: newProperty, error: insertError } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        if (insertError.code === '23503') {
          throw new Error('User profile not found. Please try signing out and signing in again.')
        }
        throw insertError
      }

      const message = status === 'published' ? 'Published' : 'Draft saved'
      setSuccess(message)
      
      setTimeout(() => {
        navigate('/my-listings')
      }, 1500)

    } catch (err) {
      console.error('Error creating property:', err)
      setError(err.message || 'Failed to create property listing')
      setSubmitting(false)
    }
  }

  const handleSelectArea = (area) => {
    setValue('area', area)
    setAreaSearchTerm('')
    setIsAreaDropdownOpen(false)
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  const uploadedCount = images.filter(img => img.url).length

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">List Property</h1>
            <p className="text-[10px] text-gray-500 font-medium">Add a new property listing</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Success Toast - Centered with Light Purple */}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
            <div className="bg-[#EFE9FF] border border-[#DDD4FF] text-purple-700 px-8 py-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle size={24} className="text-purple-600" />
              <span className="text-base font-semibold">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit((data) => onSubmit(data, 'published'))} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="e.g., Luxury 3-Bedroom in Wuse II"
              style={{ fontSize: '16px' }}
              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows="4"
              placeholder="Describe the property in detail..."
              style={{ fontSize: '16px' }}
              className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {watch('description')?.length || 0} / 500 characters
            </p>
          </div>

          {/* Area & Bedrooms */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Area <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white cursor-pointer flex items-center justify-between ${
                    errors.area ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                  }`}
                >
                  <span className={selectedArea ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedArea || 'Select area'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAreaDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isAreaDropdownOpen && (
                  <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900">Select Area</h3>
                      <button
                        type="button"
                        onClick={() => setIsAreaDropdownOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                      >
                        <X size={22} className="text-gray-500" />
                      </button>
                    </div>
                    
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={areaSearchTerm}
                          onChange={(e) => setAreaSearchTerm(e.target.value)}
                          placeholder="Search area..."
                          style={{ fontSize: '16px' }}
                          className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                      {filteredAreas.length > 0 ? (
                        <>
                          {filteredAreas.some(area => POPULAR_AREAS.includes(area)) && (
                            <div>
                              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Popular Areas
                              </div>
                              {filteredAreas
                                .filter(area => POPULAR_AREAS.includes(area))
                                .map((area) => (
                                  <button
                                    key={area}
                                    type="button"
                                    onClick={() => handleSelectArea(area)}
                                    className={`w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-purple-50 transition ${
                                      selectedArea === area ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                                    }`}
                                  >
                                    {area}
                                  </button>
                                ))}
                            </div>
                          )}
                          
                          {filteredAreas.some(area => OTHER_AREAS.includes(area)) && (
                            <div>
                              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-2 pt-3">
                                Other Areas
                              </div>
                              {filteredAreas
                                .filter(area => OTHER_AREAS.includes(area))
                                .map((area) => (
                                  <button
                                    key={area}
                                    type="button"
                                    onClick={() => handleSelectArea(area)}
                                    className={`w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-purple-50 transition ${
                                      selectedArea === area ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                                    }`}
                                  >
                                    {area}
                                  </button>
                                ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                          <div className="text-4xl mb-3">🔍</div>
                          <p className="text-sm text-gray-500">No areas found</p>
                          <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.area && (
                <p className="text-xs text-red-500 mt-1">{errors.area.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <select
                {...register('bedrooms')}
                className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white appearance-none ${
                  errors.bedrooms ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select</option>
                {BEDROOM_OPTIONS.map((num) => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Bed' : 'Beds'}</option>
                ))}
              </select>
              {errors.bedrooms && (
                <p className="text-xs text-red-500 mt-1">{errors.bedrooms.message}</p>
              )}
            </div>
          </div>

          {/* Price with Period Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Price (₦) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
              <input
                {...register('price')}
                type="text"
                placeholder="Enter price"
                style={{ fontSize: '16px' }}
                onChange={handlePriceChange}
                className={`w-full pl-8 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white ${
                  errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
            )}
            
            <div className="mt-2 flex gap-1 bg-gray-100 rounded-lg p-1 max-w-xs">
              <button
                type="button"
                onClick={() => setValue('pricePeriod', 'annum')}
                className={`flex-1 px-4 py-1.5 rounded-md text-xs font-medium transition ${
                  watch('pricePeriod') === 'annum'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Per Annum
              </button>
              <button
                type="button"
                onClick={() => setValue('pricePeriod', 'monthly')}
                className={`flex-1 px-4 py-1.5 rounded-md text-xs font-medium transition ${
                  watch('pricePeriod') === 'monthly'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Monthly
              </button>
            </div>
            {errors.pricePeriod && (
              <p className="text-xs text-red-500 mt-1">{errors.pricePeriod.message}</p>
            )}
          </div>

          {/* Features - No asterisk */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Features
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FEATURES.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-medium transition
                    ${selectedFeatures.includes(feature)
                      ? 'bg-[#EFE9FF] text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}
                  `}
                >
                  {feature}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {selectedFeatures.length} features selected
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Images ({images.length} / {MAX_FILES}) <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-gray-400 ml-1">
                (Minimum {MIN_FILES} images required for publishing)
              </span>
            </label>
            
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                isDragging 
                  ? 'border-purple-600 bg-[#F7F4FF]' 
                  : images.length >= MAX_FILES 
                    ? 'border-gray-300 opacity-50' 
                    : 'border-gray-200 hover:border-purple-600'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept={ALLOWED_MIME_TYPES.join(',')}
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={images.length >= MAX_FILES || uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${
                  images.length >= MAX_FILES || uploadingImages ? 'cursor-not-allowed' : ''
                }`}
              >
                <Upload size={28} className={`${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-500">
                  {images.length >= MAX_FILES 
                    ? `Maximum ${MAX_FILES} images uploaded`
                    : uploadingImages
                      ? 'Uploading images...'
                      : isDragging
                        ? 'Drop images here...'
                        : 'Tap to upload or drag & drop'
                  }
                </p>
                <p className="text-xs text-gray-400">
                  {MAX_FILES} images max • 5MB each • JPEG, PNG, WebP, GIF, SVG, HEIC
                </p>
                {images.length < MAX_FILES && !uploadingImages && (
                  <p className="text-xs text-purple-600">
                    {MAX_FILES - images.length} more image{MAX_FILES - images.length > 1 ? 's' : ''} allowed
                  </p>
                )}
                {uploadingImages && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 size={16} className="text-purple-600 animate-spin" />
                    <span className="text-xs text-purple-600">Uploading...</span>
                  </div>
                )}
              </label>
            </div>

            {/* Image count indicator */}
            {images.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs font-medium ${uploadedCount >= MIN_FILES ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {uploadedCount} / {MIN_FILES} minimum uploaded
                </span>
                {uploadedCount >= MIN_FILES && (
                  <span className="text-emerald-500 text-xs">✓</span>
                )}
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={image.preview || image.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                      )}
                      {!image.uploading && image.url && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5">
                          <CheckCircle size={12} />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => !image.uploading && removeImage(index)}
                      className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition ${
                        image.uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={image.uploading}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
              disabled={submitting || uploadingImages}
              className={`
                flex-1 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2
                ${submitting || uploadingImages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }
              `}
            >
              <Save size={16} />
              Save Draft
            </button>
            
            <button
              type="submit"
              disabled={submitting || uploadingImages || images.some(img => img.uploading)}
              className={`
                flex-[2] py-3 rounded-xl font-semibold text-sm text-white transition flex items-center justify-center gap-2
                ${submitting || uploadingImages || images.some(img => img.uploading)
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25 hover:shadow-xl'
                }
              `}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Publishing...
                </span>
              ) : uploadingImages || images.some(img => img.uploading) ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Uploading images...
                </span>
              ) : (
                'Publish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
