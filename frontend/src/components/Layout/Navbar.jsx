import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FaHome, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaComments
} from 'react-icons/fa'
import { useState } from 'react'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'student':
        return '/student/dashboard'
      case 'broker':
        return '/broker/dashboard'
      case 'hostelAdmin':
        return '/hostel-admin/dashboard'
      default:
        return '/'
    }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <FaHome className="text-xl" />
            </div>
            <span className="text-xl font-bold text-gray-800">Student Helper</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <>
                    <Link
                      to="/student/pg"
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      PGs
                    </Link>
                    <Link
                      to="/student/hostel"
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      Hostels
                    </Link>
                    <Link
                      to="/student/marketplace"
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      Marketplace
                    </Link>
                  </>
                )}
                <Link
                  to="/chat"
                  className="text-gray-700 hover:text-primary-600 transition flex items-center space-x-1"
                >
                  <FaComments />
                  <span>Chat</span>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-primary-600" />
                    <span className="text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block text-gray-700 hover:text-primary-600 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <>
                    <Link
                      to="/student/pg"
                      className="block text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      PGs
                    </Link>
                    <Link
                      to="/student/hostel"
                      className="block text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Hostels
                    </Link>
                    <Link
                      to="/student/marketplace"
                      className="block text-gray-700 hover:text-primary-600 transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Marketplace
                    </Link>
                  </>
                )}
                <Link
                  to="/chat"
                  className="block text-gray-700 hover:text-primary-600 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chat
                </Link>
                <div className="pt-3 border-t">
                  <div className="text-gray-700 mb-2">{user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-primary-600 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
