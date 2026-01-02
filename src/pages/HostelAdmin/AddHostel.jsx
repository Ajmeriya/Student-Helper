import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import MapComponent from '../../components/Common/MapComponent'
import toast from 'react-hot-toast'

const AddHostel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [coordinates, setCoordinates] = useState(null)
  const [facilities, setFacilities] = useState({
    mess: false,
    wifi: false,
    laundry: false,
    gym: false,
    studyRoom: false,
    commonArea: false,
    security: false,
    medical: false
  })

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

    setLoading(true)
    try {
      const hostelData = {
        ...data,
        city: user.city,
        images,
        videos,
        coordinates,
        facilities,
        adminId: user.id
      }
      
      console.log('Hostel Data:', hostelData)
      toast.success('Hostel added successfully!')
      navigate('/hostel-admin/my-hostels')
    } catch (error) {
      toast.error('Failed to add hostel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Hostel</h1>

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
                  Gender *
                </label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
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
            </div>
          </div>

          {/* Room Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Room Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {...register('roomsAvailable', { required: 'Rooms available is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="5"
                />
                {errors.roomsAvailable && (
                  <p className="mt-1 text-sm text-red-600">{errors.roomsAvailable.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Types Available
                </label>
                <div className="space-y-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      {...register('roomTypes.single')}
                      className="mr-2"
                    />
                    <span>Single Occupancy</span>
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      {...register('roomTypes.double')}
                      className="mr-2"
                    />
                    <span>Double Sharing</span>
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      {...register('roomTypes.triple')}
                      className="mr-2"
                    />
                    <span>Triple Sharing</span>
                  </label>
                </div>
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
                  checked={facilities.studyRoom}
                  onChange={() => handleFacilityChange('studyRoom')}
                  className="mr-2"
                />
                <span className="text-sm">Study Room</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={facilities.commonArea}
                  onChange={() => handleFacilityChange('commonArea')}
                  className="mr-2"
                />
                <span className="text-sm">Common Area</span>
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
                  checked={facilities.medical}
                  onChange={() => handleFacilityChange('medical')}
                  className="mr-2"
                />
                <span className="text-sm">Medical Facility</span>
              </label>
            </div>
          </div>

          {/* Policies & Timings */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Policies & Timings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mess Timings
                </label>
                <input
                  {...register('messTimings')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 7:30 AM - 9:30 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curfew Timings
                </label>
                <input
                  {...register('curfewTimings')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 10:00 PM (if applicable)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visitor Policy
                </label>
                <select
                  {...register('visitorPolicy')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  <option value="allowed">Visitors Allowed</option>
                  <option value="restricted">Restricted Hours</option>
                  <option value="notAllowed">Not Allowed</option>
                </select>
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
            </div>
          </div>

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
              Click on the map to set your hostel location
            </p>
            {coordinates && (
              <p className="mt-1 text-sm text-primary-600">
                Location selected: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            )}
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Photos (Different room types)
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

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding Hostel...' : 'Add Hostel'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/hostel-admin/dashboard')}
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

export default AddHostel

