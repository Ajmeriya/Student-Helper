import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaHome, FaUniversity, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'

const StudentDashboard = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'PGs Available', value: '24', icon: FaHome, color: 'bg-blue-500', link: '/student/pg' },
    { label: 'Hostels Available', value: '12', icon: FaUniversity, color: 'bg-green-500', link: '/student/hostel' },
    { label: 'Marketplace Items', value: '48', icon: FaShoppingBag, color: 'bg-purple-500', link: '/student/marketplace' },
    { label: 'Your City', value: user?.city || 'N/A', icon: FaMapMarkerAlt, color: 'bg-orange-500', link: '#' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-8">
            Find your perfect accommodation in {user?.city}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
          ))}
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
          <Link
            to="/student/marketplace"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Visit Marketplace
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDashboard

