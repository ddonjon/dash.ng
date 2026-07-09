import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, Upload, X, Loader2, AlertCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { getAreas } from '../../services/properties'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_FILES = 5
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/heic', 'image/heif'
]

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500, 'Description too long'),
  area: z.string().min(1, 'Please select an area'),
  price: z.string().min(1, 'Please enter a price'),
  bedrooms: z.string().min(1, 'Please select number of bedrooms'),
  features: z.array(z.string()).min(1, 'Please select at least one feature'),
})

const AVAILABLE_FEATURES = [
  'Borehole', 'Prepaid Meter', 'Estate Security', 'Tarred Road',
  'Water Supply', 'Parking', 'Generator', 'Fence',
  'POP Ceiling', 'Tiled Floor', 'Kitchen Cabinets', 'Chandelier',
  'Dishwasher', 'Swimming Pool', 'Gym', 'Playground'
]

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6]

export function ListProperty() {
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [images, setImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  console.log('ListProperty component mounted!') // Debug log

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      area: '',
      price: '',
      bedrooms: '',
      features: [],
    }
  })

  useEffect(() => {
    console.log('ListProperty useEffect running!') // Debug log
    loadAreas()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user) // Debug log
    if (!user) {
      navigate('/')
      return
    }
    setUser(user)
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
    if (images.length + files.length > MAX_FILES) {
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
      uploading: true
    }))
    setImages(prev => [...prev, ...previews])
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

    const remaining = MAX_FILES - images.length
    const toUpload = files.slice(0, remaining)

    const previews = toUpload.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    }))
    setImages(prev => [...prev, ...previews])
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

  const uploadImages = async () => {
    const imageUrls = []
    const imagesToUpload = images.filter(img => img.uploading)

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

  const onSubmit = async (data) => {
    console.log('Form submitted!', data) // Debug log
    
    if (!user) {
      setError('Please sign in to list a property')
      return
    }

    setSubmitting(true)
    setError(null)
    setUploadProgress(0)

    try {
      let imageUrls = []
      const hasImages = images.some(img => img.uploading)
      if (hasImages) {
        imageUrls = await uploadImages()
      }

      const propertyData = {
        title: data.title,
        description: data.description,
        area: data.area,
        price: parseFloat(data.price),
        bedrooms: parseInt(data.bedrooms),
        features: selectedFeatures,
        media_urls: imageUrls,
        agent_id: user.id,
      }

      console.log('Property data:', propertyData) // Debug log

      const { data: newProperty, error: insertError } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single()

      if (insertError) throw insertError

      console.log('New property created:', newProperty) // Debug log
      navigate(`/property/${newProperty.id}`)
    } catch (err) {
      console.error('Error creating property:', err)
      setError(err.message || 'Failed to create property listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 ml-2">
            List Property
          </h1>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="e.g., Luxury 3-Bedroom in Wuse II"
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows="4"
              placeholder="Describe the property in detail..."
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Area <span className="text-red-500">*</span>
              </label>
              <select
                {...register('area')}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none ${
                  errors.area ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select area</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              {errors.area && (
                <p className="text-xs text-red-500 mt-1">{errors.area.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <select
                {...register('bedrooms')}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none ${
                  errors.bedrooms ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
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

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price (₦) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
              <input
                {...register('price')}
                type="number"
                placeholder="Enter price per annum"
                className={`w-full pl-8 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                  errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Price is per annum (yearly rent)</p>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FEATURES.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition
                    ${selectedFeatures.includes(feature)
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : images.length >= MAX_FILES 
                    ? 'border-gray-300 opacity-50' 
                    : 'border-gray-300 hover:border-emerald-400'
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
                disabled={images.length >= MAX_FILES}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center gap-2 ${
                  images.length >= MAX_FILES ? 'cursor-not-allowed' : ''
                }`}
              >
                <Upload size={32} className={`${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-500">
                  {images.length >= MAX_FILES 
                    ? `Maximum ${MAX_FILES} images uploaded`
                    : isDragging
                      ? 'Drop images here...'
                      : 'Tap to upload or drag & drop'
                  }
                </p>
                <p className="text-xs text-gray-400">
                  {MAX_FILES} images max • 5MB each • JPEG, PNG, WebP, GIF, SVG, HEIC
                </p>
                {images.length < MAX_FILES && (
                  <p className="text-xs text-emerald-600">
                    {MAX_FILES - images.length} more image{MAX_FILES - images.length > 1 ? 's' : ''} allowed
                  </p>
                )}
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
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
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`
              w-full py-3.5 rounded-xl font-semibold text-white transition
              ${submitting 
                ? 'bg-emerald-400 cursor-not-allowed' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                {uploadProgress > 0 ? `Uploading images ${uploadProgress}%` : 'Creating listing...'}
              </span>
            ) : (
              'List Property'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
