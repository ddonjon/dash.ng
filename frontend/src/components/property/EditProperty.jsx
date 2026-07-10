import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, Upload, X, Loader2, AlertCircle, Search, ChevronDown, Trash2
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { getAreas } from '../../services/properties'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_FILES = 5
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
  features: z.array(z.string()).min(1, 'Please select at least one feature'),
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

export function EditProperty() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletingImages, setDeletingImages] = useState([])
  
  // Search dropdown states
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false)
  const [areaSearchTerm, setAreaSearchTerm] = useState('')
  const [filteredAreas, setFilteredAreas] = useState(ALL_ABUJA_AREAS)
  const dropdownRef = useRef(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
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
    checkUser()
    loadProperty()
    loadAreas()
  }, [id])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/')
        return
      }
      setUser(user)
    } catch (err) {
      console.error('Error checking user:', err)
      navigate('/')
    }
  }

  const loadProperty = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) {
        navigate('/my-listings')
        return
      }

      // Check if user owns this property
      if (data.agent_id !== user?.id) {
        navigate('/my-listings')
        return
      }

      // Populate form
      reset({
        title: data.title,
        description: data.description,
        area: data.area,
        price: data.price.toString(),
        pricePeriod: data.price_period || 'annum',
        bedrooms: data.bedrooms.toString(),
        features: data.features || [],
      })

      setSelectedFeatures(data.features || [])
      setExistingImages(data.media_urls || [])
    } catch (err) {
      console.error('Error loading property:', err)
      setError('Failed to load property details')
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

  const validateFiles = (files) => {
    const errors = []
    if (existingImages.length + newImages.length + files.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} images allowed. You can add ${MAX_FILES - existingImages.length - newImages.length} more.`)
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const validationErrors = validateFiles(files)
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' | '))
      e.target.value = ''
      return
    }

    const remaining = MAX_FILES - existingImages.length - newImages.length
    const toUpload = files.slice(0, remaining)

    const previews = toUpload.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    }))
    setNewImages(prev => [...prev, ...previews])
    setError(null)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const validationErrors = validateFiles(files)
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' | '))
      return
    }

    const remaining = MAX_FILES - existingImages.length - newImages.length
    const toUpload = files.slice(0, remaining)

    const previews = toUpload.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    }))
    setNewImages(prev => [...prev, ...previews])
    setError(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => {
    setNewImages(prev => {
      const newImages = [...prev]
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview)
      }
      newImages.splice(index, 1)
      return newImages
    })
  }

  const uploadNewImages = async () => {
    const imageUrls = []
    const imagesToUpload = newImages.filter(img => img.uploading)

    for (let i = 0; i < imagesToUpload.length; i++) {
      const image = imagesToUpload[i]
      const file = image.file
      const fileName = `${Date.now()}_${i}_${file.name.replace(/\s/g, '_')}`
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

      imageUrls.push(publicUrl)
      setUploadProgress(Math.round(((i + 1) / imagesToUpload.length) * 100))
    }

    return imageUrls
  }

  const deleteImageFromStorage = async (url) => {
    const path = url.split('/properties/')[1]
    if (path) {
      await supabase.storage
        .from('property-images')
        .remove([`properties/${path}`])
    }
  }

  const onSubmit = async (data) => {
    if (!user) {
      setError('Please sign in to edit this property')
      return
    }

    setSubmitting(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Handle image deletions
      const originalImages = existingImages
      const imagesToKeep = originalImages.filter(img => !deletingImages.includes(img))
      
      // Delete removed images from storage
      for (const url of deletingImages) {
        await deleteImageFromStorage(url)
      }

      // Upload new images
      let uploadedImageUrls = []
      if (newImages.some(img => img.uploading)) {
        uploadedImageUrls = await uploadNewImages()
      }

      // Combine kept existing images + new uploaded images
      const newImageUrls = [...imagesToKeep, ...uploadedImageUrls]

      const propertyData = {
        title: data.title,
        description: data.description,
        area: data.area,
        price: parseFloat(data.price),
        price_period: data.pricePeriod,
        bedrooms: parseInt(data.bedrooms),
        features: selectedFeatures,
        media_urls: newImageUrls,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id)

      if (updateError) throw updateError

      navigate(`/property/${id}`)
    } catch (err) {
      console.error('Error updating property:', err)
      setError(err.message || 'Failed to update property listing')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectArea = (area) => {
    setValue('area', area)
    setAreaSearchTerm('')
    setIsAreaDropdownOpen(false)
  }

  const handleDeleteImage = (url, index) => {
    setDeletingImages(prev => [...prev, url])
    removeExistingImage(index)
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

  const totalImages = existingImages.length + newImages.length

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Edit Property</h1>
            <p className="text-[10px] text-gray-500 font-medium">Update your listing details</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                type="number"
                placeholder="Enter price"
                style={{ fontSize: '16px' }}
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

          {/* Features */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Features <span className="text-red-500">*</span>
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
            {errors.features && (
              <p className="text-xs text-red-500 mt-2">{errors.features.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {selectedFeatures.length} features selected
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Images ({totalImages} / {MAX_FILES})
            </label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(url, index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {newImages.map((image, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition"
                    >
                      <X size={14} />
                    </button>
                    {image.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <Loader2 size={24} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Area */}
            {totalImages < MAX_FILES && (
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                  isDragging 
                    ? 'border-purple-600 bg-[#F7F4FF]' 
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
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload size={28} className={`${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-500">
                    {isDragging
                      ? 'Drop images here...'
                      : 'Tap to upload or drag & drop'
                    }
                  </p>
                  <p className="text-xs text-gray-400">
                    {MAX_FILES - totalImages} more image{MAX_FILES - totalImages > 1 ? 's' : ''} allowed
                  </p>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-listings')}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`
                flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition
                ${submitting 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25 hover:shadow-xl'
                }
              `}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Updating...'}
                </span>
              ) : (
                'Update Property'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
