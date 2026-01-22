import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import PGCard from '../../components/PG/PGCard'
import FilterPanel from '../../components/Common/FilterPanel'
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../../utils/constants'
import toast from 'react-hot-toast'

const PGList = () => {
  const { user } = useAuth()
  const [pgs, setPgs] = useState([])
  const [filteredPGs, setFilteredPGs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sharingType: '',
    ac: false,
    furnished: false,
    ownerOnFirstFloor: false,
    foodAvailable: false,
    parking: false,
    minDistance: '',
    maxDistance: ''
  })

  useEffect(() => {
    const fetchPGs = async () => {
      if (!user?.city) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Get user's college location for distance calculation
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        const collegeLocation = userData.collegeLocation?.coordinates
        
        // Build query parameters
        const params = new URLSearchParams({
          city: user.city
        })
        
        // Add college location if available for distance calculation
        if (collegeLocation && collegeLocation.lat && collegeLocation.lng) {
          params.append('collegeLocation', JSON.stringify(collegeLocation))
        }

        // Add filters to query if they exist
        if (filters.minPrice) params.append('minPrice', filters.minPrice)
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
        if (filters.sharingType) params.append('sharingType', filters.sharingType)
        if (filters.ac) params.append('ac', 'true')
        if (filters.furnished) params.append('furnished', 'true')
        if (filters.ownerOnFirstFloor) params.append('ownerOnFirstFloor', 'true')
        if (filters.foodAvailable) params.append('foodAvailable', 'true')
        if (filters.parking) params.append('parking', 'true')
        if (filters.minDistance) params.append('minDistance', filters.minDistance)
        if (filters.maxDistance) params.append('maxDistance', filters.maxDistance)
        if (searchTerm) params.append('search', searchTerm)

        // Call API to fetch PGs by city
        const response = await fetch(`${API_BASE_URL}/pg/city/${encodeURIComponent(user.city)}?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PGs: ${response.status}`)
        }
        
        const result = await response.json()

        // Handle response - could be array or object with data property
        const pgData = Array.isArray(result) ? result : (result.data || result.pgs || [])
        setPgs(pgData)
        setFilteredPGs(pgData)
      } catch (error) {
        console.error('Error fetching PGs:', error)
        toast.error('Failed to fetch PGs')
        setPgs([])
        setFilteredPGs([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search term to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchPGs()
    }, searchTerm ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [user?.city, searchTerm, filters])

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
      sharingType: '',
      ac: false,
      furnished: false,
      ownerOnFirstFloor: false,
      foodAvailable: false,
      parking: false,
      minDistance: '',
      maxDistance: ''
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find PG in {user?.city}</h1>
          <p className="text-gray-600">Discover the perfect paying guest accommodation</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or name..."
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

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
                type="pg"
              />
            </motion.div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredPGs.length} {filteredPGs.length === 1 ? 'PG found' : 'PGs found'}
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

        {/* PG Grid */}
        {filteredPGs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPGs.map((pg) => (
              <PGCard key={pg.id || pg._id} pg={pg} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No PGs found matching your criteria</p>
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

export default PGList
