import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaEdit, FaTrash, FaCheckCircle, FaTag } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const MyItems = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMyItems()
    }
  }, [user])

  const fetchMyItems = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      if (!user || user.role !== 'student') {
        toast.error('Access denied. Only students can view their items.')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/item/my-items`, {
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
        const itemsList = Array.isArray(result.items) ? result.items : []
        setItems(itemsList)
        
        if (itemsList.length === 0) {
          console.log('No items found for this student')
        }
      } else {
        console.error('API returned success: false', result)
        if (result.message && !result.message.includes('No items')) {
          toast.error(result.message || 'Failed to fetch items')
        }
        setItems([])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to fetch items: ' + (error.message || 'Unknown error'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/item/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Item deleted successfully')
        fetchMyItems() // Refresh the list
      } else {
        toast.error(result.message || 'Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item: ' + (error.message || 'Unknown error'))
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/item/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Item marked as ${newStatus}`)
        fetchMyItems() // Refresh the list
      } else {
        toast.error(result.message || 'Failed to update item status')
      }
    } catch (error) {
      console.error('Error updating item status:', error)
      toast.error('Failed to update item status: ' + (error.message || 'Unknown error'))
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
          <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
          <Link
            to="/student/add-item"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Add New Item
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id || item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded capitalize">
                      {item.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === 'available' ? 'bg-green-100 text-green-800' :
                      item.status === 'sold' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'available' ? 'Available' :
                       item.status === 'sold' ? 'Sold' : 'Reserved'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-2 text-sm line-clamp-2">{item.description}</p>
                  <p className="text-primary-600 font-semibold mb-2">
                    ₹{item.price}
                    {item.negotiable && <span className="text-gray-500 text-sm ml-1">(Negotiable)</span>}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Posted: {new Date(item.createdAt).toLocaleDateString()}
                    {item.status === 'sold' && item.updatedAt && (
                      <span className="ml-2">
                        | Sold: {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      to={`/student/edit-item/${item._id || item.id}`}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Link>
                    {item.status === 'available' && (
                      <button
                        onClick={() => handleStatusChange(item._id || item.id, 'sold')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                      >
                        <FaCheckCircle />
                        <span>Mark Sold</span>
                      </button>
                    )}
                    {item.status === 'sold' && (
                      <button
                        onClick={() => handleStatusChange(item._id || item.id, 'available')}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                      >
                        <FaTag />
                        <span>Mark Available</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id || item.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't posted any items yet</p>
            <Link
              to="/student/add-item"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Post Your First Item
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyItems
