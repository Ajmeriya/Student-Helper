import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FaMapMarkerAlt, 
  FaRoute, 
  FaBed, 
  FaBath, 
  FaRupeeSign,
  FaCheck,
  FaTimes,
  FaComments
} from 'react-icons/fa'
import MapComponent from '../../components/Common/MapComponent'
import PricePrediction from '../../components/PG/PricePrediction'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const PGDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPG = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_BASE_URL}/pg/${id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PG: ${response.status}`)
        }
        
        const result = await response.json()

        if (result.success && result.pg) {
          setPg(result.pg)
        } else if (result.data) {
          setPg(result.data)
        } else if (result.id || result._id) {
          setPg(result)
        } else {
          toast.error('PG not found')
          setPg(null)
        }
      } catch (error) {
        console.error('Error fetching PG:', error)
        toast.error('Failed to fetch PG details')
        setPg(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPG()
    }
  }, [id])

  const handleContact = () => {
    toast.info('Chat feature coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!pg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">PG not found</p>
          <button
            onClick={() => navigate('/student/pg')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Back to PG List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pg.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <FaMapMarkerAlt className="mr-2" />
            <span>{pg.location || pg.address}</span>
            {pg.city && <span className="ml-2 text-gray-400">, {pg.city}</span>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-primary-600 font-bold text-2xl">
              <FaRupeeSign />
              <span>{pg.price}</span>
              <span className="text-lg text-gray-600 font-normal ml-1">/month</span>
            </div>
            <button
              onClick={handleContact}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
            >
              <FaComments />
              <span>Contact Owner</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {pg.images && pg.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pg.images.slice(0, 4).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${pg.title} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Sharing Type</p>
                  <p className="text-lg font-semibold capitalize">
                    {pg.sharingType || 'Not specified'}
                  </p>
                </div>
                {pg.bedrooms && (
                  <div>
                    <p className="text-gray-600 text-sm">Bedrooms</p>
                    <p className="text-lg font-semibold flex items-center">
                      <FaBed className="mr-2" />
                      {pg.bedrooms}
                    </p>
                  </div>
                )}
                {pg.bathrooms && (
                  <div>
                    <p className="text-gray-600 text-sm">Bathrooms</p>
                    <p className="text-lg font-semibold flex items-center">
                      <FaBath className="mr-2" />
                      {pg.bathrooms}
                    </p>
                  </div>
                )}
                {pg.distanceToCollege > 0 && (
                  <div>
                    <p className="text-gray-600 text-sm">Distance to College</p>
                    <p className="text-lg font-semibold flex items-center">
                      <FaRoute className="mr-2" />
                      {pg.distanceToCollege.toFixed(2)} km
                    </p>
                  </div>
                )}
              </div>

              {/* Facilities */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Facilities</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    {pg.ac ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span className="text-sm">AC Available</span>
                  </div>
                  <div className="flex items-center">
                    {pg.furnished ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span className="text-sm">Furnished</span>
                  </div>
                  <div className="flex items-center">
                    {pg.ownerOnFirstFloor ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span className="text-sm">Owner on First Floor</span>
                  </div>
                  {pg.foodAvailable !== undefined && (
                    <div className="flex items-center">
                      {pg.foodAvailable ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                      <span className="text-sm">Food Available</span>
                    </div>
                  )}
                  {pg.parking !== undefined && (
                    <div className="flex items-center">
                      {pg.parking ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                      <span className="text-sm">Parking</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map */}
            {pg.coordinates && pg.coordinates.lat && pg.coordinates.lng && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                  <MapComponent
                    center={[parseFloat(pg.coordinates.lat), parseFloat(pg.coordinates.lng)]}
                    markers={[{
                      lat: parseFloat(pg.coordinates.lat),
                      lng: parseFloat(pg.coordinates.lng),
                      title: pg.title
                    }]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-4">Contact Owner</h3>
              <p className="text-gray-600 mb-4">
                Get in touch with the property owner to schedule a visit or ask questions.
              </p>
              <button
                onClick={handleContact}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
              >
                <FaComments />
                <span>Start Chat</span>
              </button>
            </div>

            {/* Price Prediction */}
            <PricePrediction pgData={pg} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PGDetails
