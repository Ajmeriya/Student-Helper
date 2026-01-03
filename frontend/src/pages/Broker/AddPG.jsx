import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import MapComponent from '../../components/Common/MapComponent'
import toast from 'react-hot-toast'

const AddPG = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [coordinates, setCoordinates] = useState(null)

  const watchAC = watch('ac')
  const watchFurnished = watch('furnished')
  const watchOwnerOnFirstFloor = watch('ownerOnFirstFloor')

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

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const pgData = {
        ...data,
        city: user.city,
        images: images.length > 0 ? images.map(img => URL.createObjectURL(img)) : [],
        videos: videos.length > 0 ? videos.map(vid => URL.createObjectURL(vid)) : [],
        coordinates,
        brokerId: user.id,
        // Convert instructions to rules array if needed
        rules: data.instructions ? data.instructions.split('\n').filter(r => r.trim()) : [],
        instructions: data.instructions
      }
      
      console.log('PG Data:', pgData)
      
      // Navigate to My PGs page and show the newly added PG
      navigate('/broker/my-pgs', { 
        state: { 
          newPG: pgData,
          showSuccess: true 
        } 
      })
    } catch (error) {
      toast.error('Failed to add PG')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New PG</h1>

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
                  placeholder="Enter college name"
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
                  <option value="single">Single Occupancy</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                  <option value="quad">4+ Sharing</option>
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
                  <option value="">Any</option>
                  <option value="student">Student Only</option>
                  <option value="working">Working Professional Only</option>
                  <option value="both">Both</option>
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
                  <option value="">Select</option>
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
              Instructions / Rules
            </label>
            <textarea
              {...register('instructions')}
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter any special instructions, rules, or guidelines for tenants (e.g., No smoking, No pets allowed, Kitchen access from 6 AM to 10 PM, etc.)"
            />
            <p className="mt-1 text-xs text-gray-500">
              You can list multiple rules separated by new lines or commas
            </p>
          </div>

          {/* Map Location */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Location on Map *</h2>
            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <MapComponent
                center={[22.6944, 72.8606]}
                markers={coordinates ? [{ lat: coordinates.lat, lng: coordinates.lng }] : []}
                onMapClick={handleMapClick}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Click on the map to set your PG location
            </p>
            {coordinates && (
              <p className="mt-1 text-sm text-primary-600">
                Location selected: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            )}
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {images.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">{images.length} image(s) selected</p>
            )}
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Videos
            </label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {videos.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">{videos.length} video(s) selected</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding PG...' : 'Add PG'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/broker/dashboard')}
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

export default AddPG

