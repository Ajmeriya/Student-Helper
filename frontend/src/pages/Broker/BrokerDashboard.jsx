import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaHome, FaPlus, FaEdit, FaComments } from 'react-icons/fa'
import { motion } from 'framer-motion'

const BrokerDashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-8">
            Manage your PG properties in {user?.city}
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total PGs</p>
              <p className="text-3xl font-bold text-primary-600">0</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Listings</p>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Inquiries</p>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BrokerDashboard

