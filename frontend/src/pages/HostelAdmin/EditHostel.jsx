import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import MapComponent from '../../components/Common/MapComponent'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const EditHostel = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [coordinates, setCoordinates] = useState(null)
  const [facilities, setFacilities] = useState({
    mess: false,
    wifi: false,
    laundry: false,
    gym: false,
    library: false,
    parking: false,
    security: false,
    powerBackup: false,
    waterSupply: false
  })

  useEffect(() => {
    if (id) {
      fetchHostel()
    }
  }, [id])

  const fetchHostel = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/hostel/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success && result.hostel) {
        const hostel = result.hostel
        
        // Set form values
        setValue('name', hostel.name)
        setValue('location', hostel.location)
        setValue('address', hostel.address || '')
        setValue('gender', hostel.gender)
        setValue('totalRooms', hostel.totalRooms)
        setValue('roomsAvailable', hostel.availableRooms)
        setValue('price', hostel.fees)
        setValue('feesPeriod', hostel.feesPeriod || 'monthly')
        setValue('description', hostel.description || '')
        setValue('rules', hostel.rules || '')
        setValue('contactNumber', hostel.contactNumber || '')
        setValue('contactEmail', hostel.contactEmail || '')
        
        // Set coordinates
        if (hostel.coordinates) {
          setCoordinates({
            lat: hostel.coordinates.lat,
            lng: hostel.coordinates.lng
          })
        }
        
        // Set facilities
        if (hostel.facilities) {
          setFacilities({
            mess: hostel.facilities.mess || false,
            wifi: hostel.facilities.wifi || false,
            laundry: hostel.facilities.laundry || false,
            gym: hostel.facilities.gym || false,
            library: hostel.facilities.library || false,
            parking: hostel.facilities.parking || false,
            security: hostel.facilities.security || false,
            powerBackup: hostel.facilities.powerBackup || false,
            waterSupply: hostel.facilities.waterSupply || false
          })
        }
      } else {
        toast.error(result.message || 'Failed to fetch hostel')
        navigate('/hostel-admin/my-hostels')
      }
    } catch (error) {
      console.error('Error fetching hostel:', error)
      toast.error('Failed to fetch hostel: ' + (error.message || 'Unknown error'))
      navigate('/hostel-admin/my-hostels')
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

  const handleFacilityChange = (facility) => {
    setFacilities(prev => ({
      ...prev,
      [facility]: !prev[facility]
    }))
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
      
      // Basic information
      formData.append('name', data.name)
      formData.append('location', data.location)
      formData.append('city', user.city || data.city)
      if (data.address) formData.append('address', data.address)
      formData.append('gender', data.gender)
      formData.append('totalRooms', data.totalRooms)
      formData.append('availableRooms', data.roomsAvailable || data.availableRooms)
      formData.append('fees', data.price || data.fees)
      formData.append('feesPeriod', data.feesPeriod || 'monthly')
      
      // Coordinates
      formData.append('coordinates', JSON.stringify({
        lat: coordinates.lat,
        lng: coordinates.lng
      }))
      
      // Facilities (send as individual fields)
      Object.keys(facilities).forEach(facility => {
        formData.append(`facilities[${facility}]`, facilities[facility] ? 'true' : 'false')
      })
      
      // Optional fields
      if (data.description) formData.append('description', data.description)
      if (data.rules) formData.append('rules', data.rules)
      if (data.contactNumber) formData.append('contactNumber', data.contactNumber)
      if (data.contactEmail) formData.append('contactEmail', data.contactEmail)
      
      // Add new images (if any)
      images.forEach((image) => {
        formData.append('images', image)
      })
      
      // Add new videos (if any)
      videos.forEach((video) => {
        formData.append('videos', video)
      })
      
      console.log('📤 Updating hostel...', {
        name: data.name,
        city: user.city,
        imagesCount: images.length,
        videosCount: videos.length
      })
      
      const response = await fetch(`${API_BASE_URL}/hostel/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData
      })

      const result = await response.json()
      console.log('📦 API Response:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update hostel')
      }

      if (result.success) {
        toast.success('Hostel updated successfully!')
        navigate('/hostel-admin/my-hostels')
      } else {
        throw new Error(result.message || 'Failed to update hostel')
      }
    } catch (error) {
      console.error('Error updating hostel:', error)
      toast.error(error.message || 'Failed to update hostel')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Hostel</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hostel Name *
                </label>
                <input
                  {...register('name', { required: 'Hostel name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter hostel name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                  Address (Optional)
                </label>
                <input
                  {...register('address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Additional address details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="both">Both</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Fees (₹) *
                </label>
                <input
                  type="number"
                  {...register('price', { required: 'Fees is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="8000"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fees Period *
                </label>
                <select
                  {...register('feesPeriod', { required: 'Fees period is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="semester">Semester</option>
                </select>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Room Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Rooms *
                </label>
                <input
                  type="number"
                  {...register('totalRooms', { required: 'Total rooms is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="20"
                />
                {errors.totalRooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalRooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rooms Available *
                </label>
                <input
                  type="number"
                  {...register('roomsAvailable', { required: 'Rooms available is required', min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="5"
                />
                {errors.roomsAvailable && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomsAvailable.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Facilities Included in Fees</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.mess}
                  onChange={() => handleFacilityChange('mess')}
                  className="mr-2"
                />
                <span className="text-sm">Mess Facility</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.wifi}
                  onChange={() => handleFacilityChange('wifi')}
                  className="mr-2"
                />
                <span className="text-sm">WiFi</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.laundry}
                  onChange={() => handleFacilityChange('laundry')}
                  className="mr-2"
                />
                <span className="text-sm">Laundry</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.gym}
                  onChange={() => handleFacilityChange('gym')}
                  className="mr-2"
                />
                <span className="text-sm">Gym</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.library}
                  onChange={() => handleFacilityChange('library')}
                  className="mr-2"
                />
                <span className="text-sm">Library</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.parking}
                  onChange={() => handleFacilityChange('parking')}
                  className="mr-2"
                />
                <span className="text-sm">Parking</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.security}
                  onChange={() => handleFacilityChange('security')}
                  className="mr-2"
                />
                <span className="text-sm">24/7 Security</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.powerBackup}
                  onChange={() => handleFacilityChange('powerBackup')}
                  className="mr-2"
                />
                <span className="text-sm">Power Backup</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.waterSupply}
                  onChange={() => handleFacilityChange('waterSupply')}
                  className="mr-2"
                />
                <span className="text-sm">Water Supply</span>
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe your hostel..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rules
                </label>
                <textarea
                  {...register('rules')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Hostel rules and regulations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  {...register('contactNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  {...register('contactEmail')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional"
                />
              </div>
            </div>
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
              Click on the map to update your hostel location
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
              {submitting ? 'Updating Hostel...' : 'Update Hostel'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/hostel-admin/my-hostels')}
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

export default EditHostel
