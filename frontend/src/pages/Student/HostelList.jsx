import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import HostelCard from '../../components/Hostel/HostelCard'
import FilterPanel from '../../components/Common/FilterPanel'
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockHostels = [
      {
        id: '1',
        name: 'Comfort Hostel',
        location: 'Nadiad',
        gender: 'boys',
        price: 8000,
        roomsAvailable: 5,
        mess: true,
        wifi: true,
        laundry: true,
        gym: false,
        images: []
      },
      {
        id: '2',
        name: 'Premium Girls Hostel',
        location: 'Nadiad',
        gender: 'girls',
        price: 10000,
        roomsAvailable: 3,
        mess: true,
        wifi: true,
        laundry: true,
        gym: true,
        images: []
      }
    ]
    setHostels(mockHostels)
    setFilteredHostels(mockHostels)
    setLoading(false)
  }, [user?.city])

  useEffect(() => {
    let filtered = [...hostels]

    if (searchTerm) {
      filtered = filtered.filter(hostel =>
        hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filters.minPrice) {
      filtered = filtered.filter(hostel => hostel.price >= parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(hostel => hostel.price <= parseInt(filters.maxPrice))
    }

    if (filters.gender) {
      filtered = filtered.filter(hostel => hostel.gender === filters.gender)
    }

    if (filters.mess) {
      filtered = filtered.filter(hostel => hostel.mess)
    }
    if (filters.wifi) {
      filtered = filtered.filter(hostel => hostel.wifi)
    }
    if (filters.laundry) {
      filtered = filtered.filter(hostel => hostel.laundry)
    }
    if (filters.gym) {
      filtered = filtered.filter(hostel => hostel.gym)
    }
    if (filters.studyRoom) {
      filtered = filtered.filter(hostel => hostel.studyRoom)
    }
    if (filters.security) {
      filtered = filtered.filter(hostel => hostel.security)
    }

    setFilteredHostels(filtered)
  }, [hostels, searchTerm, filters])

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

