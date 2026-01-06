import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaEdit, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const MyHostels = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyHostels()
    }
  }, [user])

  const fetchMyHostels = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      if (!user || user.role !== 'hostelAdmin') {
        toast.error('Access denied. Only hostel admins can view their hostels.')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/hostel/my-hostels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('API Response:', result)

      if (result.success) {
        const hostelsList = Array.isArray(result.hostels) ? result.hostels : []
        setHostels(hostelsList)
        
        if (hostelsList.length === 0) {
          console.log('No hostels found for this admin')
        }
      } else {
        console.error('API returned success: false', result)
        if (result.message && !result.message.includes('No hostels')) {
          toast.error(result.message || 'Failed to fetch hostels')
        }
        setHostels([])
      }
    } catch (error) {
      console.error('Error fetching hostels:', error)
      toast.error('Failed to fetch hostels: ' + (error.message || 'Unknown error'))
      setHostels([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/hostel/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Hostel deleted successfully')
        fetchMyHostels() // Refresh the list
      } else {
        toast.error(result.message || 'Failed to delete hostel')
      }
    } catch (error) {
      console.error('Error deleting hostel:', error)
      toast.error('Failed to delete hostel: ' + (error.message || 'Unknown error'))
    }
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
          <h1 className="text-3xl font-bold text-gray-900">My Hostels</h1>
          <Link
            to="/hostel-admin/add-hostel"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Add New Hostel
          </Link>
        </div>

        {hostels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <div key={hostel._id || hostel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {hostel.images && hostel.images.length > 0 ? (
                    <img
                      src={hostel.images[0]}
                      alt={hostel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{hostel.name}</h3>
                  <p className="text-gray-600 mb-2">{hostel.location}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    {hostel.availableRooms} / {hostel.totalRooms} rooms available
                  </p>
                  <p className="text-primary-600 font-semibold mb-4">
                    ₹{hostel.fees}/{hostel.feesPeriod || 'month'}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      to={`/hostel-admin/edit-hostel/${hostel._id || hostel.id}`}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(hostel._id || hostel.id)}
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
            <p className="text-gray-600 text-lg mb-4">You haven't added any hostels yet</p>
            <Link
              to="/hostel-admin/add-hostel"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Add Your First Hostel
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyHostels

