import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL, CITIES } from '../../utils/constants'
import toast from 'react-hot-toast'
import { FaUser, FaPhone, FaMapMarkerAlt, FaUniversity, FaSave, FaArrowLeft } from 'react-icons/fa'
import MapComponent from '../../components/Common/MapComponent'

const EditProfile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    city: '',
    collegeName: '',
    collegeLocation: {
      address: '',
      coordinates: null
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || '',
        collegeName: user.collegeName || '',
        collegeLocation: {
          address: user.collegeLocation?.address || '',
          coordinates:
            user.collegeLocation?.coordinates?.lat != null && user.collegeLocation?.coordinates?.lng != null
              ? {
                  lat: parseFloat(user.collegeLocation.coordinates.lat),
                  lng: parseFloat(user.collegeLocation.coordinates.lng)
                }
              : null
        }
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCollegeAddressChange = (e) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      collegeLocation: {
        ...(prev.collegeLocation || {}),
        address: value,
        coordinates: prev.collegeLocation?.coordinates || null
      }
    }))
  }

  const handleCollegeMapClick = (e) => {
    const { lat, lng } = e.latlng
    setFormData((prev) => ({
      ...prev,
      collegeLocation: {
        ...(prev.collegeLocation || {}),
        address: prev.collegeLocation?.address || '',
        coordinates: { lat, lng }
      }
    }))
    toast.success(`College location updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  }

  const clearCollegeLocation = () => {
    setFormData((prev) => ({
      ...prev,
      collegeLocation: {
        ...(prev.collegeLocation || {}),
        coordinates: null
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        city: formData.city
      }

      // Add college-specific fields for students
      if (user?.role === 'student') {
        if (formData.collegeName) {
          updateData.collegeName = formData.collegeName
        }

        const hasCollegeCoords =
          formData.collegeLocation?.coordinates?.lat != null &&
          formData.collegeLocation?.coordinates?.lng != null
        const hasCollegeAddress = !!formData.collegeLocation?.address?.trim()

        if (hasCollegeCoords || hasCollegeAddress) {
          updateData.collegeLocation = {
            ...(hasCollegeAddress ? { address: formData.collegeLocation.address.trim() } : {}),
            ...(hasCollegeCoords
              ? {
                  coordinates: {
                    lat: parseFloat(formData.collegeLocation.coordinates.lat),
                    lng: parseFloat(formData.collegeLocation.coordinates.lng)
                  }
                }
              : {})
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/user/profile/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        // Update user in context
        const updatedUser = {
          ...user,
          ...result.user
        }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        toast.success('Profile updated successfully!')
        
        // Navigate back to dashboard based on role
        if (user?.role === 'student') {
          navigate('/student/dashboard')
        } else if (user?.role === 'broker') {
          navigate('/broker/dashboard')
        } else if (user?.role === 'hostelAdmin') {
          navigate('/hostel-admin/dashboard')
        } else {
          navigate('/')
        }
      } else {
        toast.error(result.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const getDashboardPath = () => {
    if (user?.role === 'student') return '/student/dashboard'
    if (user?.role === 'broker') return '/broker/dashboard'
    if (user?.role === 'hostelAdmin') return '/hostel-admin/dashboard'
    return '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <button
              onClick={() => navigate(getDashboardPath())}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPhone className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter 10-digit phone number"
              />
              <p className="mt-1 text-xs text-gray-500">Enter 10 digits without spaces or special characters</p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2" />
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a city</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* College Name (for students only) */}
            {user?.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUniversity className="inline mr-2" />
                    College Name
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your college name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    College Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.collegeLocation?.address || ''}
                    onChange={handleCollegeAddressChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter full college address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    College Location on Map
                  </label>
                  <div className="h-80 rounded-lg overflow-hidden border border-gray-300">
                    <MapComponent
                      center={formData.collegeLocation?.coordinates
                        ? [
                            parseFloat(formData.collegeLocation.coordinates.lat),
                            parseFloat(formData.collegeLocation.coordinates.lng)
                          ]
                        : [22.6944, 72.8606]}
                      zoom={formData.collegeLocation?.coordinates ? 14 : 11}
                      onMapClick={handleCollegeMapClick}
                      markers={[
                        ...(formData.collegeLocation?.coordinates
                          ? [
                              {
                                lat: parseFloat(formData.collegeLocation.coordinates.lat),
                                lng: parseFloat(formData.collegeLocation.coordinates.lng),
                                title: formData.collegeName || 'Your College'
                              }
                            ]
                          : [])
                      ]}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Click on map to update your college location.
                  </p>
                  {formData.collegeLocation?.coordinates && (
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600 bg-gray-50 border rounded-md px-3 py-2">
                      <span>
                        Lat: {Number(formData.collegeLocation.coordinates.lat).toFixed(6)} | Lng: {Number(formData.collegeLocation.coordinates.lng).toFixed(6)}
                      </span>
                      <button
                        type="button"
                        onClick={clearCollegeLocation}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(getDashboardPath())}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProfile

