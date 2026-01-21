import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaMapMarkerAlt,
  FaUniversity
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import MapComponent from '../../components/Common/MapComponent'

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    city: '',
    role: '',
    collegeName: '',
    collegeAddress: '',
    workingAddress: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [collegeLocation, setCollegeLocation] = useState(null)
  const [geocodingAddress, setGeocodingAddress] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const cities = [
    'Nadiad', 'Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 
    'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand'
  ]

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'broker', label: 'Broker' },
    { value: 'hostelAdmin', label: 'Hostel Admin' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validatePassword = (password) => {
    // Strong password: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return strongRegex.test(password)
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits'
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required'
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required'
    }
    
    // Only validate college name and location for students
    if (formData.role === 'student') {
      if (!formData.collegeName.trim()) {
        newErrors.collegeName = 'College name is required for students'
      }
      // Require either address or map location
      if (!formData.collegeAddress && !collegeLocation) {
        newErrors.collegeAddress = 'Please provide college address or mark location on map'
        newErrors.collegeLocation = 'Please provide college address or mark location on map'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    
    // Ensure role is correctly formatted
    let roleValue = formData.role
    if (roleValue === 'hostelAdmin' || roleValue === 'Hostel Admin' || roleValue?.toLowerCase() === 'hosteladmin') {
      roleValue = 'hostelAdmin' // Ensure camelCase
    } else if (roleValue) {
      roleValue = roleValue.toLowerCase() // student, broker
    }
    
    console.log('📝 Frontend sending role:', { original: formData.role, normalized: roleValue })
    
    const userData = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      city: formData.city,
      role: roleValue,
      ...(formData.role === 'student' && { 
        collegeName: formData.collegeName,
        collegeLocation: collegeLocation ? {
          coordinates: {
            lat: collegeLocation.lat,
            lng: collegeLocation.lng
          }
        } : undefined
      })
    }

    const result = await signup(userData)
    setLoading(false)

    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        switch (user.role) {
          case 'student':
            navigate('/student/dashboard')
            break
          case 'broker':
            navigate('/broker/dashboard')
            break
          case 'hostelAdmin':
            navigate('/hostel-admin/dashboard')
            break
          default:
            navigate('/')
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg"
      >
        <div className="mb-6">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Strong password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="Confirm password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength="10"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="10 digit number"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* College Name and Location (only for students) */}
            {formData.role === 'student' && (
              <>
                <div className="md:col-span-2">
                  <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700">
                    College Name <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUniversity className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="collegeName"
                      name="collegeName"
                      type="text"
                      required
                      value={formData.collegeName}
                      onChange={handleChange}
                      className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                        errors.collegeName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="Enter your college name"
                    />
                  </div>
                  {errors.collegeName && (
                    <p className="mt-1 text-sm text-red-600">{errors.collegeName}</p>
                  )}
                </div>
                
                {/* College Address (Preferred - will be geocoded) */}
                <div className="md:col-span-2">
                  <label htmlFor="collegeAddress" className="block text-sm font-medium text-gray-700">
                    College Address <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Recommended - for accurate distance calculation)</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="collegeAddress"
                      name="collegeAddress"
                      type="text"
                      required
                      value={formData.collegeAddress}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.collegeAddress ? 'border-red-300' : 'border-gray-300'
                      } rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="e.g., Dharmsinh Desai University, College Road, Nadiad, Gujarat"
                    />
                  </div>
                  {errors.collegeAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.collegeAddress}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter full address for accurate road distance calculation. Or use map below.
                  </p>
                </div>
                
                {/* College Location Map (Alternative) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Mark Your College Location on Map
                    <span className="text-xs text-gray-500 ml-2">(Alternative to address)</span>
                  </label>
                  <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                    <MapComponent
                      center={formData.city === 'Nadiad' ? [22.6944, 72.8606] : 
                              formData.city === 'Ahmedabad' ? [23.0225, 72.5714] :
                              formData.city === 'Vadodara' ? [22.3072, 73.1812] :
                              [22.6944, 72.8606]}
                      markers={collegeLocation ? [{ lat: collegeLocation.lat, lng: collegeLocation.lng, title: formData.collegeName || 'College' }] : []}
                      onMapClick={(e) => {
                        const { lat, lng } = e.latlng
                        setCollegeLocation({ lat, lng })
                        if (errors.collegeLocation) {
                          setErrors({ ...errors, collegeLocation: '' })
                        }
                      }}
                    />
                  </div>
                  {collegeLocation && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Location selected: {collegeLocation.lat.toFixed(4)}, {collegeLocation.lng.toFixed(4)}
                    </p>
                  )}
                  {errors.collegeLocation && (
                    <p className="mt-1 text-sm text-red-600">{errors.collegeLocation}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Click on the map to mark location if you don't have the full address.
                  </p>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || geocodingAddress}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {geocodingAddress ? 'Geocoding address...' : loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Signup
