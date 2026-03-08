import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import MapComponent from '../../components/Common/MapComponent'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const EditPG = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [coordinates, setCoordinates] = useState(null)

  useEffect(() => {
    if (id) {
      fetchPG()
    }
  }, [id])

  const fetchPG = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/pg/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      const pgData = result?.data || result?.pg

      if (result.success && pgData) {
        const pg = pgData
        
        // Set form values
        setValue('title', pg.title)
        setValue('location', pg.location)
        setValue('collegeName', pg.collegeName || '')
        setValue('sharingType', pg.sharingType)
        setValue('bedrooms', pg.bedrooms)
        setValue('bathrooms', pg.bathrooms)
        setValue('floorNumber', pg.floorNumber || 0)
        setValue('preferredTenant', pg.preferredTenant || 'both')
        setValue('price', pg.price)
        setValue('securityDeposit', pg.securityDeposit || '')
        setValue('maintenance', pg.maintenance || '')
        setValue('ac', pg.ac || false)
        setValue('furnished', pg.furnished || false)
        setValue('ownerOnFirstFloor', pg.ownerOnFirstFloor || false)
        setValue('foodAvailable', pg.foodAvailable || false)
        setValue('powerBackup', pg.powerBackup || false)
        setValue('parking', pg.parking || false)
        setValue('waterSupply', pg.waterSupply || '24x7')
        setValue('availabilityDate', pg.availabilityDate ? pg.availabilityDate.split('T')[0] : '')
        setValue('nearbyLandmarks', pg.nearbyLandmarks || '')
        setValue('instructions', pg.instructions || '')
        
        // Set coordinates
        if (pg.coordinates) {
          setCoordinates({
            lat: pg.coordinates.lat,
            lng: pg.coordinates.lng
          })
        }
      } else {
        toast.error(result.message || 'Failed to fetch PG')
        navigate('/broker/my-pgs')
      }
    } catch (error) {
      console.error('Error fetching PG:', error)
      toast.error('Failed to fetch PG: ' + (error.message || 'Unknown error'))
      navigate('/broker/my-pgs')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
  }

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files)
    setVideos(prev => [...prev, ...files])
  }

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng
    setCoordinates({ lat, lng })
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  const onSubmit = async (data) => {
    if (!coordinates) {
      toast.error('Please select location on map')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      // Create FormData for file uploads
      const formData = new FormData()
      
      // Add text fields
      formData.append('title', data.title)
      formData.append('location', data.location)
      const resolvedCity = user?.city || data.city || ''
      if (resolvedCity) {
        formData.append('city', resolvedCity)
      }
      formData.append('collegeName', data.collegeName)
      formData.append('sharingType', data.sharingType)
      formData.append('bedrooms', parseInt(data.bedrooms))
      formData.append('bathrooms', parseInt(data.bathrooms))
      if (data.floorNumber) formData.append('floorNumber', parseInt(data.floorNumber))
      formData.append('preferredTenant', (data.preferredTenant || 'both').toLowerCase())
      formData.append('price', parseFloat(data.price))
      if (data.securityDeposit) formData.append('securityDeposit', parseFloat(data.securityDeposit))
      if (data.maintenance) formData.append('maintenance', parseFloat(data.maintenance))
      formData.append('ac', data.ac || false)
      formData.append('furnished', data.furnished || false)
      formData.append('ownerOnFirstFloor', data.ownerOnFirstFloor || false)
      formData.append('foodAvailable', data.foodAvailable || false)
      formData.append('powerBackup', data.powerBackup || false)
      formData.append('parking', data.parking || false)
      formData.append('waterSupply', data.waterSupply || '24x7')
      if (data.availabilityDate) formData.append('availabilityDate', data.availabilityDate)
      if (data.nearbyLandmarks) formData.append('nearbyLandmarks', data.nearbyLandmarks)
      if (data.instructions) formData.append('instructions', data.instructions)
      
      // Coordinates
      formData.append('coordinates[lat]', coordinates.lat)
      formData.append('coordinates[lng]', coordinates.lng)
      
      // Add new images (if any)
      images.forEach((image) => {
        formData.append('images', image)
      })
      
      // Add new videos (if any)
      videos.forEach((video) => {
        formData.append('videos', video)
      })
      
      console.log('📤 Updating PG...', {
        title: data.title,
        city: user.city,
        imagesCount: images.length,
        videosCount: videos.length
      })
      
      const response = await fetch(`${API_BASE_URL}/pg/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData
      })

      const result = await response.json()
      console.log('📦 API Response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update PG')
      }

      if (result.success) {
        toast.success('PG updated successfully!')
        navigate('/broker/my-pgs')
      } else {
        throw new Error(result.message || 'Failed to update PG')
      }
    } catch (error) {
      console.error('Error updating PG:', error)
      toast.error(error.message || 'Failed to update PG')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit PG</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Comfortable PG near College"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Address *
                </label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter complete address"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name *
                </label>
                <input
                  {...register('collegeName', { required: 'College name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter nearby college name"
                />
                {errors.collegeName && (
                  <p className="mt-1 text-sm text-red-600">{errors.collegeName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sharing Type *
                </label>
                <select
                  {...register('sharingType', { required: 'Sharing type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="quad">Quad</option>
                </select>
                {errors.sharingType && (
                  <p className="mt-1 text-sm text-red-600">{errors.sharingType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  {...register('bedrooms', { required: 'Bedrooms is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="2"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  {...register('bathrooms', { required: 'Bathrooms is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="1"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Number
                </label>
                <input
                  type="number"
                  {...register('floorNumber', { min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 2 (0 for ground floor)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Tenant Type
                </label>
                <select
                  {...register('preferredTenant')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="both">Both</option>
                  <option value="student">Student Only</option>
                  <option value="working">Working Professional Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pricing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="5000"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  {...register('securityDeposit', { min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance (₹/month)
                </label>
                <input
                  type="number"
                  {...register('maintenance', { min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Facilities & Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('ac')}
                  className="mr-2"
                />
                <span className="text-sm">AC Available</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('furnished')}
                  className="mr-2"
                />
                <span className="text-sm">Furnished</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('ownerOnFirstFloor')}
                  className="mr-2"
                />
                <span className="text-sm">Owner on First Floor</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('foodAvailable')}
                  className="mr-2"
                />
                <span className="text-sm">Food Available</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('powerBackup')}
                  className="mr-2"
                />
                <span className="text-sm">Power Backup</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('parking')}
                  className="mr-2"
                />
                <span className="text-sm">Parking Available</span>
              </label>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Supply
                </label>
                <select
                  {...register('waterSupply')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="24x7">24x7 Available</option>
                  <option value="timing">Timing Based</option>
                  <option value="limited">Limited</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Date
                </label>
                <input
                  type="date"
                  {...register('availabilityDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Nearby Landmarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nearby Landmarks (comma separated)
            </label>
            <input
              {...register('nearbyLandmarks')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Metro Station, Shopping Mall, Hospital"
            />
            <p className="mt-1 text-xs text-gray-500">Help students find your PG easily</p>
          </div>

          {/* Instructions/Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions / Rules *
            </label>
            <textarea
              {...register('instructions', { required: 'Instructions/Rules are required' })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter special instructions, rules, or any important information (e.g., No smoking, No loud music after 10 PM, etc.)"
            />
            {errors.instructions && (
              <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Update Location on Map *</h2>
            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <MapComponent
                center={coordinates ? [coordinates.lat, coordinates.lng] : [22.6944, 72.8606]}
                markers={coordinates ? [{ lat: coordinates.lat, lng: coordinates.lng }] : []}
                onMapClick={handleMapClick}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Click on the map to update your PG location
            </p>
            {coordinates && (
              <p className="mt-1 text-sm text-primary-600">
                Location: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            )}
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Additional Photos (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {images.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">{images.length} new image(s) selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Additional Videos (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {videos.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">{videos.length} new video(s) selected</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {submitting ? 'Updating PG...' : 'Update PG'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/broker/my-pgs')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPG
