import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaHome, FaUniversity, FaShoppingBag, FaMapMarkerAlt, FaUserEdit } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../../utils/constants'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState([
    { label: 'PGs Available', value: '0', icon: FaHome, color: 'bg-blue-500', link: '/student/pg' },
    { label: 'Hostels Available', value: '0', icon: FaUniversity, color: 'bg-green-500', link: '/student/hostel' },
    { label: 'Marketplace Items', value: '0', icon: FaShoppingBag, color: 'bg-purple-500', link: '/student/marketplace' },
    { label: 'Your City', value: user?.city || 'N/A', icon: FaMapMarkerAlt, color: 'bg-orange-500', link: '#' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const pgResponse = await fetch(`${API_BASE_URL}/pg`)
      const pgData = await pgResponse.json()
      const pgCount = pgData.success ? pgData.count : 0

      const hostelResponse = await fetch(`${API_BASE_URL}/hostel`)
      const hostelData = await hostelResponse.json()
      const hostelCount = hostelData.success ? hostelData.count : 0

      const itemResponse = await fetch(`${API_BASE_URL}/item`)
      const itemData = await itemResponse.json()
      const itemCount = itemData.success ? itemData.count : 0

      setStats([
        { label: 'PGs Available', value: pgCount.toString(), icon: FaHome, color: 'bg-blue-500', link: '/student/pg' },
        { label: 'Hostels Available', value: hostelCount.toString(), icon: FaUniversity, color: 'bg-green-500', link: '/student/hostel' },
        { label: 'Marketplace Items', value: itemCount.toString(), icon: FaShoppingBag, color: 'bg-purple-500', link: '/student/marketplace' },
        { label: 'Your City', value: user?.city || 'N/A', icon: FaMapMarkerAlt, color: 'bg-orange-500', link: '#' }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">
                Find your perfect accommodation in {user?.city}
              </p>
            </div>
            <Link
              to="/profile/edit"
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <FaUserEdit />
              <span>Edit Profile</span>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-4 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={stat.link}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Find PG</h2>
            <p className="text-gray-600 mb-4">
              Discover paying guest accommodations near your college with all the amenities you need.
            </p>
            <Link
              to="/student/pg"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Browse PGs
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Find Hostel</h2>
            <p className="text-gray-600 mb-4">
              Explore hostels with mess facilities, wifi, laundry, and more included in the fees.
            </p>
            <Link
              to="/student/hostel"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Browse Hostels
            </Link>
          </motion.div>
        </div>

        {/* Marketplace Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Marketplace</h2>
            <Link
              to="/student/marketplace"
              className="text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <p className="text-gray-600 mb-4">
            Buy and sell books, electronics, and other items with fellow students.
          </p>
          <div className="flex space-x-3">
            <Link
              to="/student/marketplace"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Visit Marketplace
            </Link>
            <Link
              to="/student/add-item"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Add Item
            </Link>
            <Link
              to="/student/my-items"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              My Items
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDashboard
