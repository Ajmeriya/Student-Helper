import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import PGCard from '../../components/PG/PGCard'
import FilterPanel from '../../components/Common/FilterPanel'
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'

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
    // TODO: Replace with actual API call
    // Fetch PGs based on user's city
    const mockPGs = [
      {
        id: '1',
        title: 'Comfortable PG near College',
        location: 'Nadiad',
        price: 5000,
        bedrooms: 2,
        bathrooms: 1,
        ac: true,
        furnished: true,
        ownerOnFirstFloor: true,
        distanceToCollege: 2.5,
        images: []
      },
      {
        id: '2',
        title: 'Spacious PG with AC',
        location: 'Nadiad',
        price: 6000,
        bedrooms: 3,
        bathrooms: 2,
        ac: true,
        furnished: false,
        ownerOnFirstFloor: false,
        distanceToCollege: 3.2,
        images: []
      }
    ]
    setPgs(mockPGs)
    setFilteredPGs(mockPGs)
    setLoading(false)
  }, [user?.city])

  useEffect(() => {
    let filtered = [...pgs]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pg =>
        pg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pg.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(pg => pg.price >= parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(pg => pg.price <= parseInt(filters.maxPrice))
    }

    // AC filter
    if (filters.ac) {
      filtered = filtered.filter(pg => pg.ac)
    }

    // Furnished filter
    if (filters.furnished) {
      filtered = filtered.filter(pg => pg.furnished)
    }

    // Owner on first floor filter
    if (filters.ownerOnFirstFloor) {
      filtered = filtered.filter(pg => pg.ownerOnFirstFloor)
    }

    // Sharing type filter
    if (filters.sharingType) {
      filtered = filtered.filter(pg => pg.sharingType === filters.sharingType)
    }

    // Food available filter
    if (filters.foodAvailable) {
      filtered = filtered.filter(pg => pg.foodAvailable)
    }

    // Parking filter
    if (filters.parking) {
      filtered = filtered.filter(pg => pg.parking)
    }

    // Distance filter
    if (filters.minDistance) {
      filtered = filtered.filter(pg => pg.distanceToCollege >= parseFloat(filters.minDistance))
    }
    if (filters.maxDistance) {
      filtered = filtered.filter(pg => pg.distanceToCollege <= parseFloat(filters.maxDistance))
    }

    setFilteredPGs(filtered)
  }, [pgs, searchTerm, filters])

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
              <PGCard key={pg.id} pg={pg} />
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

