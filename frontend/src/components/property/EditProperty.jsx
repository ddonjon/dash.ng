import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, Upload, X, Loader2, AlertCircle, Search, ChevronDown, CheckCircle, Save
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { getAreas } from '../../services/properties'
import { useToast } from '../../context/ToastContext'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_FILES = 5
const MIN_FILES = 3
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic', 'image/heif']

const POPULAR_AREAS = ['Maitama', 'Asokoro', 'Wuse II', 'Garki II', 'Gwarinpa', 'Jabi']
const OTHER_AREAS = [
  'Abuja City Centre (CBD)', 'Apo', 'Apo-Dutse', 'Bwari', 'Dakibiyu', 'Dawaki',
  'Duboyi', 'Durumi', 'Dutse', 'Gaduwa', 'Garki I', 'Garki Village', 'Gishiri',
  'Guzape', 'Gwagwa', 'Gwagwalada', 'Jiwa', 'Kado', 'Karmo', 'Karu', 'Katampe',
  'Kaura', 'Kubwa', 'Kuchigoro', 'Kuje', 'Kurudu', 'Kwali', 'Life Camp', 'Lokogoma',
  'Lugbe', 'Mabuchi', 'Mpape', 'Nyanya', 'Orozo', 'Pyakasa', 'Sabo', 'Sunrise',
  'Utako', 'Wuse I', 'Wuye', 'Zuba'
]
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
  'Borehole', 'Chandelier', 'Dishwasher', 'Estate Security', 'Fence',
  'Generator', 'Gym', 'Kitchen Cabinets', 'Parking', 'Playground',
  'POP Ceiling', 'Prepaid Meter', 'Swimming Pool', 'Tarred Road',
  'Tiled Floor', 'Water Supply'
]
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5, 6]

export function EditProperty() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [property, setProperty] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [areas, setAreas] = useState([])
  const [imageError, setImageError] = useState(null)
  
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false)
  const [areaSearchTerm, setAreaSearchTerm] = useState('')
  const [filteredAreas, setFilteredAreas] = useState(ALL_ABUJA_AREAS)

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

  useEffect(() => {
    if (areaSearchTerm.trim() === '') {
      setFilteredAreas(ALL_ABUJA_AREAS)
    } else {
      setFilteredAreas(ALL_ABUJA_AREAS.filter(area =>
        area.toLowerCase().includes(areaSearchTerm.toLowerCase())
      ))
    }
  }, [areaSearchTerm])

  useEffect(() => {
    if (isAreaDropdownOpen) setAreaSearchTerm('')
  }, [isAreaDropdownOpen])

  // Load everything
  useEffect(() => {
    async function loadEverything() {
      try {
        console.log('🔍 Loading property ID:', id)
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          navigate('/')
          return
        }
        console.log('✅ User ID:', user.id)

        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('❌ Error:', error)
          setError('Property not found')
          setLoading(false)
          return
        }

        if (!data) {
          setError('Property not found')
          setLoading(false)
          return
        }

        if (data.agent_id !== user.id) {
          console.log('❌ User does not own this property')
          setError('You do not have permission to edit this property')
          setLoading(false)
          return
        }

        console.log('✅ Property loaded:', data.title)
        
        setProperty(data)
        setExistingImages(data.media_urls || [])
        setSelectedFeatures(data.features || [])
        
        reset({
          title: data.title || '',
          description: data.description || '',
          area: data.area || '',
          price: data.price ? data.price.toString() : '',
          pricePeriod: data.price_period || 'annum',
          bedrooms: data.bedrooms ? data.bedrooms.toString() : '',
          features: data.features || [],
        })
        
        const areasData = await getAreas()
        setAreas(areasData)
        
        setLoading(false)
        console.log('✅ Done loading')
        
      } catch (err) {
        console.error('❌ Unexpected error:', err)
        setError('Failed to load property: ' + err.message)
        setLoading(false)
      }
    }

    if (id) {
      loadEverything()
    } else {
      navigate('/my-listings')
    }
  }, [id])

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    setImageError(null)

    const totalAfter = existingImages.length + newImages.length + files.length
    if (totalAfter > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} images allowed.`)
      return
    }

    const oversized = files.filter(f => f.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      setImageError(`File(s) exceed 5MB limit.`)
      return
    }

    const invalidTypes = files.filter(f => !ALLOWED_MIME_TYPES.includes(f.type))
    if (invalidTypes.length > 0) {
      setImageError(`Invalid file type(s). Allowed: JPEG, PNG, WebP, GIF, SVG, HEIC, HEIF`)
      return
    }

    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      url: null
    }))
    setNewImages(prev => [...prev, ...previews])
    
    for (let i = 0; i < previews.length; i++) {
      const idx = newImages.length + i
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) continue
        
        const fileName = `${Date.now()}_${i}_${previews[i].file.name.replace(/\s/g, '_')}`
        const filePath = `properties/${user.id}/${fileName}`
        
        const { error } = await supabase.storage
          .from('property-images')
          .upload(filePath, previews[i].file)
        
        if (error) throw error
        
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)
        
        setNewImages(prev => {
          const updated = [...prev]
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], uploading: false, url: publicUrl }
          }
          return updated
        })
      } catch (err) {
        setImageError(`Failed to upload image.`)
        setNewImages(prev => prev.filter((_, idx2) => idx2 !== idx))
      }
    }
  }

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => {
      const newFeatures = prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
      setValue('features', newFeatures)
      return newFeatures
    })
  }

  const formatPriceWithCommas = (value) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handlePriceChange = (e) => {
    setValue('price', formatPriceWithCommas(e.target.value))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setImageError(null)

    const totalAfter = existingImages.length + newImages.length + files.length
    if (totalAfter > MAX_FILES) {
      setImageError(`Maximum ${MAX_FILES} images allowed.`)
      e.target.value = ''
      return
    }

    const oversized = files.filter(f => f.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      setImageError(`File(s) exceed 5MB limit.`)
      e.target.value = ''
      return
    }

    const invalidTypes = files.filter(f => !ALLOWED_MIME_TYPES.includes(f.type))
    if (invalidTypes.length > 0) {
      setImageError(`Invalid file type(s). Allowed: JPEG, PNG, WebP, GIF, SVG, HEIC, HEIF`)
      e.target.value = ''
      return
    }

    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      url: null
    }))
    setNewImages(prev => [...prev, ...previews])
    e.target.value = ''
    
    for (let i = 0; i < previews.length; i++) {
      const idx = newImages.length + i
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) continue
        
        const fileName = `${Date.now()}_${i}_${previews[i].file.name.replace(/\s/g, '_')}`
        const filePath = `properties/${user.id}/${fileName}`
        
        const { error } = await supabase.storage
          .from('property-images')
          .upload(filePath, previews[i].file)
        
        if (error) throw error
        
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)
        
        setNewImages(prev => {
          const updated = [...prev]
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], uploading: false, url: publicUrl }
          }
          return updated
        })
      } catch (err) {
        setImageError(`Failed to upload image.`)
        setNewImages(prev => prev.filter((_, idx2) => idx2 !== idx))
      }
    }
  }

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => {
    setNewImages(prev => {
      if (prev[index].preview) URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSave = async (data, status = 'published') => {
    if (!property) {
      setImageError('No property loaded')
      return
    }

    setImageError(null)

    if (status === 'published') {
      const totalImages = existingImages.length + newImages.filter(img => img.url).length
      if (totalImages < MIN_FILES) {
        setImageError(`Please upload at least ${MIN_FILES} images.`)
        return
      }
    }

    setSubmitting(true)
    setError(null)

    try {
      const allImages = [
        ...existingImages,
        ...newImages.filter(img => img.url).map(img => img.url)
      ]
      const cleanPrice = data.price.replace(/,/g, '')

      const updateData = {
        title: data.title,
        description: data.description,
        area: data.area,
        price: parseFloat(cleanPrice),
        price_period: data.pricePeriod,
        bedrooms: parseInt(data.bedrooms),
        features: selectedFeatures,
        media_urls: allImages,
        status: status,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      const message = status === 'published' ? '🎉 Published successfully!' : '📝 Draft updated!'
      showToast(message, 'success', 4000)
      setTimeout(() => navigate('/my-listings'), 1500)
    } catch (err) {
      setImageError(err.message || 'Failed to save property')
      setSubmitting(false)
    }
  }

  const handleSelectArea = (area) => {
    setValue('area', area)
    setAreaSearchTerm('')
    setIsAreaDropdownOpen(false)
  }

  const handleGoBack = () => {
    navigate(-1)
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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/my-listings')}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
          >
            Back to My Listings
          </button>
        </div>
      </div>
    )
  }

  if (!property) return null

  const totalImages = existingImages.length + newImages.length
  const uploadedCount = existingImages.length + newImages.filter(img => img.url).length

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={handleGoBack} className="p-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Edit Property</h1>
            <p className="text-[10px] text-gray-500 font-medium">Update your listing</p>
          </div>
          <span className={`ml-auto text-[10px] font-medium px-2.5 py-1 rounded-full ${
            property?.status === 'published' 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}>
            {property?.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <form className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input {...register('title')} type="text" placeholder="e.g., Luxury 3-Bedroom in Wuse II" style={{ fontSize: '16px' }} className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea {...register('description')} rows="4" placeholder="Describe the property..." style={{ fontSize: '16px' }} className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            <p className="text-xs text-gray-400 mt-1">{watch('description')?.length || 0} / 500 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Area <span className="text-red-500">*</span></label>
              <div className="relative">
                <div onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)} className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white cursor-pointer flex items-center justify-between ${errors.area ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}>
                  <span className={selectedArea ? 'text-gray-900' : 'text-gray-400'}>{selectedArea || 'Select area'}</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAreaDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isAreaDropdownOpen && (
                  <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900">Select Area</h3>
                      <button type="button" onClick={() => setIsAreaDropdownOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={22} className="text-gray-500" /></button>
                    </div>
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={areaSearchTerm} onChange={(e) => setAreaSearchTerm(e.target.value)} placeholder="Search area..." style={{ fontSize: '16px' }} className="w-full pl-9 pr-3 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" onClick={(e) => e.stopPropagation()} />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                      {filteredAreas.length > 0 ? (
                        <>
                          {filteredAreas.some(area => POPULAR_AREAS.includes(area)) && (
                            <div>
                              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Popular Areas</div>
                              {filteredAreas.filter(area => POPULAR_AREAS.includes(area)).map((area) => (
                                <button key={area} type="button" onClick={() => handleSelectArea(area)} className={`w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-purple-50 transition ${selectedArea === area ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'}`}>{area}</button>
                              ))}
                            </div>
                          )}
                          {filteredAreas.some(area => OTHER_AREAS.includes(area)) && (
                            <div>
                              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-2 pt-3">Other Areas</div>
                              {filteredAreas.filter(area => OTHER_AREAS.includes(area)).map((area) => (
                                <button key={area} type="button" onClick={() => handleSelectArea(area)} className={`w-full text-left px-3 py-3 text-sm rounded-lg hover:bg-purple-50 transition ${selectedArea === area ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'}`}>{area}</button>
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
              {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bedrooms <span className="text-red-500">*</span></label>
              <select {...register('bedrooms')} className={`w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white appearance-none ${errors.bedrooms ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`}>
                <option value="">Select</option>
                {BEDROOM_OPTIONS.map((num) => (<option key={num} value={num}>{num} {num === 1 ? 'Bed' : 'Beds'}</option>))}
              </select>
              {errors.bedrooms && <p className="text-xs text-red-500 mt-1">{errors.bedrooms.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₦) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₦</span>
              <input {...register('price')} type="text" placeholder="Enter price" style={{ fontSize: '16px' }} onChange={handlePriceChange} className={`w-full pl-8 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'}`} />
            </div>
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            
            <div className="mt-2 flex gap-1 bg-gray-100 rounded-lg p-1 max-w-xs">
              <button type="button" onClick={() => setValue('pricePeriod', 'annum')} className={`flex-1 px-4 py-1.5 rounded-md text-xs font-medium transition ${watch('pricePeriod') === 'annum' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'text-gray-600 hover:text-gray-800'}`}>Per Annum</button>
              <button type="button" onClick={() => setValue('pricePeriod', 'monthly')} className={`flex-1 px-4 py-1.5 rounded-md text-xs font-medium transition ${watch('pricePeriod') === 'monthly' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'text-gray-600 hover:text-gray-800'}`}>Monthly</button>
            </div>
            {errors.pricePeriod && <p className="text-xs text-red-500 mt-1">{errors.pricePeriod.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Features</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FEATURES.map((feature) => (
                <button key={feature} type="button" onClick={() => toggleFeature(feature)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${selectedFeatures.includes(feature) ? 'bg-[#EFE9FF] text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}>{feature}</button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{selectedFeatures.length} features selected</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Images ({totalImages} / {MAX_FILES}) <span className="text-red-500">*</span> 
              <span className="text-xs font-normal text-gray-400 ml-1">(Minimum {MIN_FILES} for publishing)</span>
            </label>

            {imageError && (
              <p className="text-xs text-red-500 mt-1">{imageError}</p>
            )}
            
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {newImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {newImages.map((image, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img src={image.preview || image.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      {image.uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"><Loader2 size={24} className="text-white animate-spin" /></div>}
                    </div>
                    <button type="button" onClick={() => !image.uploading && removeNewImage(index)} className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition ${image.uploading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={image.uploading}><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${isDragging ? 'border-purple-600 bg-[#F7F4FF]' : totalImages >= MAX_FILES ? 'border-gray-300 opacity-50' : 'border-gray-200 hover:border-purple-600'}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <input type="file" accept={ALLOWED_MIME_TYPES.join(',')} multiple onChange={handleImageUpload} className="hidden" id="image-upload-edit" disabled={totalImages >= MAX_FILES || uploadingImages} />
              <label htmlFor="image-upload-edit" className={`cursor-pointer flex flex-col items-center gap-2 ${totalImages >= MAX_FILES || uploadingImages ? 'cursor-not-allowed' : ''}`}>
                <Upload size={28} className={`${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-500">{totalImages >= MAX_FILES ? `Maximum ${MAX_FILES} images uploaded` : uploadingImages ? 'Uploading images...' : isDragging ? 'Drop images here...' : 'Tap to upload or drag & drop'}</p>
                <p className="text-xs text-gray-400">{MAX_FILES} images max • 5MB each • JPEG, PNG, WebP, GIF, SVG, HEIC</p>
                {totalImages < MAX_FILES && !uploadingImages && <p className="text-xs text-purple-600">{MAX_FILES - totalImages} more image{MAX_FILES - totalImages > 1 ? 's' : ''} allowed</p>}
                {uploadingImages && <div className="flex items-center gap-2 mt-2"><Loader2 size={16} className="text-purple-600 animate-spin" /><span className="text-xs text-purple-600">Uploading...</span></div>}
              </label>
            </div>

            {totalImages > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs font-medium ${uploadedCount >= MIN_FILES ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {uploadedCount} / {MIN_FILES} minimum uploaded
                </span>
                {uploadedCount >= MIN_FILES && <span className="text-emerald-500 text-xs">✓</span>}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={handleSubmit((data) => handleSave(data, 'draft'))} disabled={submitting || uploadingImages} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${submitting || uploadingImages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
              <Save size={16} /> Update Draft
            </button>
            
            <button type="button" onClick={handleSubmit((data) => handleSave(data, 'published'))} disabled={submitting || uploadingImages || newImages.some(img => img.uploading)} className={`flex-[2] py-3 rounded-xl font-semibold text-sm text-white transition flex items-center justify-center gap-2 ${submitting || uploadingImages || newImages.some(img => img.uploading) ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25 hover:shadow-xl'}`}>
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : <><CheckCircle size={16} /> Update & Publish</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
