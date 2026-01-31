import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaEdit, FaTrash, FaCheckCircle, FaTag } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const MyPGs = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyPGs()
    }
  }, [user])

  const fetchMyPGs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      if (!user || user.role !== 'broker') {
        toast.error('Access denied. Only brokers can view their PGs.')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/pg/my-pgs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        console.error('HTTP Error:', response.status, errorData)
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('API Response:', result)

      if (result.success) {
        const pgsList = Array.isArray(result.pgs) ? result.pgs : []
        setPgs(pgsList)
        
        if (location.state?.showSuccess) {
          toast.success('PG created successfully!')
          navigate(location.pathname, { replace: true, state: {} })
        }
        
        if (pgsList.length === 0) {
          console.log('No PGs found for this broker')
        }
      } else {
        console.error('API returned success: false', result)
        if (result.message && !result.message.includes('No PGs')) {
          toast.error(result.message || 'Failed to fetch PGs')
        }
        setPgs([])
      }
    } catch (error) {
      console.error('Error fetching PGs:', error)
      if (error.message && !error.message.includes('Failed to fetch')) {
        toast.error('Error fetching PGs: ' + error.message)
      } else {
        toast.error('Failed to fetch PGs. Please check your connection and try again.')
      }
      setPgs([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PG?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/pg/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const result = await response.json()

        if (result.success) {
          toast.success('PG deleted successfully')
          fetchMyPGs()
        } else {
          toast.error(result.message || 'Failed to delete PG')
        }
      } catch (error) {
        console.error('Error deleting PG:', error)
        toast.error('Failed to delete PG')
      }
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      sold: 'bg-red-100 text-red-800',
      onRent: 'bg-blue-100 text-blue-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My PGs</h1>
          <Link
            to="/broker/add-pg"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Add New PG
          </Link>
        </div>

        {pgs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pgs.map((pg) => (
              <div key={pg._id || pg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {pg.images && pg.images.length > 0 ? (
                    <img
                      src={pg.images[0]}
                      alt={pg.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(pg.status || 'available')}`}>
                      {pg.status === 'onRent' ? 'On Rent' : pg.status === 'sold' ? 'Sold' : 'Available'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{pg.title}</h3>
                  <p className="text-gray-600 mb-2">{pg.location}</p>
                  <p className="text-lg font-bold text-primary-600 mb-2">₹{pg.price}/month</p>
                  
                  <div className="text-sm text-gray-500 mb-3 space-y-1">
                    <p>Posted: {formatDate(pg.createdAt)}</p>
                    {pg.soldDate && <p>Sold: {formatDate(pg.soldDate)}</p>}
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/broker/edit-pg/${pg._id || pg.id}`}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(pg._id || pg.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't added any PGs yet</p>
            <Link
              to="/broker/add-pg"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Add Your First PG
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPGs
