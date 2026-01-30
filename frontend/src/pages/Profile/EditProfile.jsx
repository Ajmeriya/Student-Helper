import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL, CITIES } from '../../utils/constants'
import toast from 'react-hot-toast'
import { FaUser, FaPhone, FaMapMarkerAlt, FaUniversity, FaSave, FaArrowLeft } from 'react-icons/fa'

const EditProfile = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    city: '',
    collegeName: '',
    collegeLocation: null
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || '',
        collegeName: user.collegeName || '',
        collegeLocation: user.collegeLocation || null
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
        if (formData.collegeLocation) {
          updateData.collegeLocation = formData.collegeLocation
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
