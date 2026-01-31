import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaHome, FaPlus, FaEdit, FaComments, FaUserEdit } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../../utils/constants'

const BrokerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPGs: 0,
    activeListings: 0,
    totalInquiries: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch broker's PGs
      const response = await fetch(`${API_BASE_URL}/pg/my-pgs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const pgs = data.pgs || []
          const activePGs = pgs.filter(pg => pg.status === 'active' || pg.status === 'ACTIVE')
          
          setStats({
            totalPGs: pgs.length,
            activeListings: activePGs.length,
            totalInquiries: 0
          })
        }
      }
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
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600">
                Manage your PG properties in {user?.city}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/broker/add-pg">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="bg-primary-600 p-3 rounded-lg w-fit mb-4">
                  <FaPlus className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Add New PG</h3>
                <p className="text-gray-600">
                  Register a new paying guest property
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/broker/my-pgs">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="bg-green-600 p-3 rounded-lg w-fit mb-4">
                  <FaHome className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">My PGs</h3>
                <p className="text-gray-600">
                  View and manage your properties
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/chat">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="bg-purple-600 p-3 rounded-lg w-fit mb-4">
                  <FaComments className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Messages</h3>
                <p className="text-gray-600">
                  Chat with interested students
                </p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total PGs</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalPGs}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Listings</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeListings}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Inquiries</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalInquiries}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default BrokerDashboard
