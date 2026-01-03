import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import PGCard from '../../components/PG/PGCard'

const MyPGs = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPG, setNewPG] = useState(null)

  useEffect(() => {
    // Check if we have a newly added PG from navigation state
    if (location.state?.newPG) {
      const addedPG = {
        ...location.state.newPG,
        id: Date.now().toString() // Generate temporary ID
      }
      setNewPG(addedPG)
      if (location.state.showSuccess) {
        toast.success('PG added successfully!')
      }
    }
    
    // TODO: Replace with actual API call
    const mockPGs = []
    setPgs(mockPGs)
    setLoading(false)
  }, [location])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PG?')) {
      // TODO: Replace with actual API call
      setPgs(pgs.filter(pg => pg.id !== id))
      toast.success('PG deleted successfully')
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
          <h1 className="text-3xl font-bold text-gray-900">My PGs</h1>
          <Link
            to="/broker/add-pg"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Add New PG
          </Link>
        </div>

        {/* Show newly added PG with success message */}
        {newPG && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FaCheckCircle className="text-green-600" />
              <h3 className="font-semibold text-green-800">PG Added Successfully!</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PGCard pg={newPG} />
            </div>
          </div>
        )}

        {pgs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pgs.map((pg) => (
              <div key={pg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
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
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{pg.title}</h3>
                  <p className="text-gray-600 mb-4">{pg.location}</p>
                  <div className="flex space-x-2">
                    <Link
                      to={`/broker/edit-pg/${pg.id}`}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(pg.id)}
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
        ) : !newPG && (
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

