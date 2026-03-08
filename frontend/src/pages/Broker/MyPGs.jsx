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
  const [rentModal, setRentModal] = useState({
    isOpen: false,
    pgId: null,
    months: '',
    error: ''
  })

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

      const normalizedRole = (user?.role || '').toString().toLowerCase()
      if (!user || normalizedRole !== 'broker') {
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

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        console.error('HTTP Error:', response.status, errorData)
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('API Response:', result) // Debug log

      if (result.success) {
        // Backend list responses are returned in result.data.
        const pgsList = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.pgs)
            ? result.pgs
            : Array.isArray(result.data?.content)
              ? result.data.content
              : []
        setPgs(pgsList)
        
        if (location.state?.showSuccess) {
          toast.success('PG created successfully!')
          // Clear state after showing message
          navigate(location.pathname, { replace: true, state: {} })
        }
        
        if (pgsList.length === 0) {
          console.log('No PGs found for this broker')
        }
      } else {
        console.error('API returned success: false', result)
        // Don't show error toast if it's just an empty list
        if (result.message && !result.message.includes('No PGs')) {
          toast.error(result.message || 'Failed to fetch PGs')
        }
        setPgs([])
      }
    } catch (error) {
      console.error('Error fetching PGs:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      // Only show error if it's not a network error that might be temporary
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
          fetchMyPGs() // Refresh list
        } else {
          toast.error(result.message || 'Failed to delete PG')
        }
      } catch (error) {
        console.error('Error deleting PG:', error)
        toast.error('Failed to delete PG')
      }
    }
  }

  const handleStatusUpdate = async (pgId, status, rentalPeriod = null) => {
    try {
      const token = localStorage.getItem('token')
      const body = { status }
      
      if (status === 'onRent' && rentalPeriod) {
        body.rentalPeriod = rentalPeriod
        body.rentalStartDate = new Date().toISOString()
      } else if (status === 'sold') {
        body.soldDate = new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/pg/${pgId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`PG marked as ${status === 'onRent' ? 'on rent' : status}`)
        fetchMyPGs() // Refresh list
      } else {
        toast.error(result.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const openRentModal = (pgId) => {
    setRentModal({
      isOpen: true,
      pgId,
      months: '',
      error: ''
    })
  }

  const closeRentModal = () => {
    setRentModal({
      isOpen: false,
      pgId: null,
      months: '',
      error: ''
    })
  }

  const submitRentPeriod = () => {
    const months = parseInt(rentModal.months, 10)
    if (!months || months <= 0) {
      setRentModal((prev) => ({
        ...prev,
        error: 'Please enter a valid rental period in months.'
      }))
      return
    }

    handleStatusUpdate(rentModal.pgId, 'onRent', months)
    closeRentModal()
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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My PGs</h1>
          <Link
            to="/broker/add-pg"
            className="w-full rounded-lg bg-primary-600 px-6 py-2.5 text-center text-white transition hover:bg-primary-700 sm:w-auto sm:py-2"
          >
            Add New PG
          </Link>
        </div>

        {pgs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {pgs.map((pg) => (
              <div key={pg._id || pg.id} className="overflow-hidden rounded-xl bg-white shadow-md">
                <div className="relative h-44 bg-gray-200 sm:h-48">
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
                <div className="p-3 sm:p-4">
                  <h3 className="mb-1 text-lg font-semibold sm:mb-2 sm:text-xl">{pg.title}</h3>
                  <p className="mb-2 line-clamp-2 text-sm text-gray-600 sm:text-base">{pg.location}</p>
                  <p className="mb-2 text-base font-bold text-primary-600 sm:text-lg">₹{pg.price}/month</p>
                  
                  {/* Dates */}
                  <div className="mb-3 space-y-1 text-xs text-gray-500 sm:text-sm">
                    <p>Posted: {formatDate(pg.createdAt)}</p>
                    {pg.soldDate && <p>Sold: {formatDate(pg.soldDate)}</p>}
                    {pg.status === 'onRent' && pg.rentalPeriod && (
                      <p>Rent Period: {pg.rentalPeriod} months</p>
                    )}
                    {pg.rentalStartDate && (
                      <p>Rent Start: {formatDate(pg.rentalStartDate)}</p>
                    )}
                    {pg.rentalEndDate && (
                      <p>Rent End: {formatDate(pg.rentalEndDate)}</p>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {pg.status !== 'sold' && (
                      <button
                        onClick={() => openRentModal(pg._id || pg.id)}
                        className="w-full rounded bg-blue-100 px-2 py-1.5 text-xs text-blue-800 hover:bg-blue-200 sm:w-auto"
                      >
                        Mark On Rent
                      </button>
                    )}
                    {pg.status !== 'sold' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Mark this PG as sold?')) {
                            handleStatusUpdate(pg._id || pg.id, 'sold')
                          }
                        }}
                        className="w-full rounded bg-red-100 px-2 py-1.5 text-xs text-red-800 hover:bg-red-200 sm:w-auto"
                      >
                        Mark Sold
                      </button>
                    )}
                    {pg.status !== 'available' && (
                      <button
                        onClick={() => handleStatusUpdate(pg._id || pg.id, 'available')}
                        className="col-span-2 w-full rounded bg-green-100 px-2 py-1.5 text-xs text-green-800 hover:bg-green-200 sm:col-auto sm:w-auto"
                      >
                        Mark Available
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/broker/edit-pg/${pg._id || pg.id}`}
                      className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 text-white transition hover:bg-primary-700"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(pg._id || pg.id)}
                      className="flex items-center justify-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                    >
                      <FaTrash />
                      <span className="hidden sm:inline">Delete</span>
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

      {rentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 px-0 sm:items-center sm:px-4">
          <div className="w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-4 sm:px-6 sm:py-5">
              <h3 className="text-lg font-semibold text-white">Set Rental Period</h3>
              <p className="mt-1 text-sm text-sky-100">Enter rental period in months to mark this PG on rent.</p>
            </div>

            <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <label htmlFor="rental-months" className="mb-2 block text-sm font-medium text-slate-700">
                  Rental Period (months)
                </label>
                <input
                  id="rental-months"
                  type="number"
                  min="1"
                  value={rentModal.months}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setRentModal((prev) => ({ ...prev, months: value, error: '' }))
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      submitRentPeriod()
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  placeholder="e.g., 11"
                />
                {rentModal.error && <p className="mt-2 text-sm text-rose-600">{rentModal.error}</p>}
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeRentModal}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRentPeriod}
                  className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 sm:w-auto"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPGs

