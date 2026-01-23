import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import HostelCard from '../../components/Hostel/HostelCard'
import FilterPanel from '../../components/Common/FilterPanel'
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../../utils/constants'
import toast from 'react-hot-toast'

const HostelList = () => {
  const { user } = useAuth()
  const [hostels, setHostels] = useState([])
  const [filteredHostels, setFilteredHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    gender: '',
    mess: false,
    wifi: false,
    laundry: false,
    gym: false,
    studyRoom: false,
    security: false
  })

  const fetchHostels = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('city', user.city)
      
      // Add filters to query
      if (filters.gender) params.append('gender', filters.gender)
      if (filters.minPrice) params.append('minFees', filters.minPrice)
      if (filters.maxPrice) params.append('maxFees', filters.maxPrice)
      
      // Add facility filters
      const facilityList = []
      if (filters.mess) facilityList.push('mess')
      if (filters.wifi) facilityList.push('wifi')
      if (filters.laundry) facilityList.push('laundry')
      if (filters.gym) facilityList.push('gym')
      if (filters.security) facilityList.push('security')
      if (facilityList.length > 0) {
        params.append('facilities', facilityList.join(','))
      }
      
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`${API_BASE_URL}/hostel?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        // Map backend data to frontend format
        const hostelsList = result.hostels.map(hostel => ({
          id: hostel._id || hostel.id,
          name: hostel.name,
          location: hostel.location,
          address: hostel.address,
          city: hostel.city,
          gender: hostel.gender,
          price: hostel.fees,
          feesPeriod: hostel.feesPeriod,
          totalRooms: hostel.totalRooms,
          roomsAvailable: hostel.availableRooms,
          facilities: hostel.facilities || {},
          images: hostel.images || [],
          videos: hostel.videos || [],
          description: hostel.description,
          rules: hostel.rules,
          coordinates: hostel.coordinates,
          status: hostel.status,
          admin: hostel.admin
        }))
        
        setHostels(hostelsList)
        setFilteredHostels(hostelsList)
      } else {
        toast.error(result.message || 'Failed to fetch hostels')
        setHostels([])
        setFilteredHostels([])
      }
    } catch (error) {
      console.error('Error fetching hostels:', error)
      toast.error('Failed to fetch hostels: ' + (error.message || 'Unknown error'))
      setHostels([])
      setFilteredHostels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.city) {
      fetchHostels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.city, filters, searchTerm])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      gender: '',
      mess: false,
      wifi: false,
      laundry: false,
      gym: false,
      studyRoom: false,
      security: false
    })
    setSearchTerm('')
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Hostel in {user?.city}</h1>
          <p className="text-gray-600">Explore hostels with all facilities</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
              </div>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
                type="hostel"
              />
            </motion.div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredHostels.length} {filteredHostels.length === 1 ? 'hostel found' : 'hostels found'}
          </p>
          {(Object.values(filters).some(v => v) || searchTerm) && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
            >
              <FaTimes />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {filteredHostels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No hostels found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HostelList

