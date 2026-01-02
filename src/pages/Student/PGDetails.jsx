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
  FaImages,
  FaVideo,
  FaComments
} from 'react-icons/fa'
import ImageGallery from 'react-image-gallery'
import ReactPlayer from 'react-player'
import MapComponent from '../../components/Common/MapComponent'
import PricePrediction from '../../components/PG/PricePrediction'
import toast from 'react-hot-toast'

const PGDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockPG = {
      id: id,
      title: 'Comfortable PG near College',
      location: 'Nadiad',
      address: '123 Main Street, Nadiad',
      price: 5000,
      bedrooms: 2,
      bathrooms: 1,
      ac: true,
      furnished: true,
      ownerOnFirstFloor: true,
      distanceToCollege: 2.5,
      collegeName: 'Example College',
      specialInstructions: 'No smoking, No pets allowed',
      rules: ['No loud music after 10 PM', 'Kitchen access from 6 AM to 10 PM'],
      images: [],
      videos: [],
      coordinates: { lat: 22.6944, lng: 72.8606 },
      broker: {
        name: 'John Broker',
        id: 'broker1'
      }
    }
    setPg(mockPG)
    setLoading(false)
  }, [id])

  const handleContact = () => {
    navigate(`/chat?user=${pg.broker.id}&property=${id}&type=pg`)
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">PG not found</p>
      </div>
    )
  }

  const galleryImages = pg.images.length > 0 
    ? pg.images.map(img => ({ original: img, thumbnail: img }))
    : [{ original: '/placeholder.jpg', thumbnail: '/placeholder.jpg' }]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pg.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <FaMapMarkerAlt className="mr-2" />
            <span>{pg.address}</span>
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
            {/* Images/Video Gallery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'overview' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <FaImages className="inline mr-2" />
                  Photos
                </button>
                {pg.videos && pg.videos.length > 0 && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === 'video' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaVideo className="inline mr-2" />
                    Videos
                  </button>
                )}
              </div>
              
              {activeTab === 'overview' && (
                <div className="h-96">
                  <ImageGallery items={galleryImages} showThumbnails={true} />
                </div>
              )}
              
              {activeTab === 'video' && pg.videos && pg.videos.length > 0 && (
                <div className="h-96">
                  <ReactPlayer
                    url={pg.videos[0]}
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              )}
            </div>

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
                <div>
                  <p className="text-gray-600 text-sm">Bedrooms</p>
                  <p className="text-lg font-semibold flex items-center">
                    <FaBed className="mr-2" />
                    {pg.bedrooms}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Bathrooms</p>
                  <p className="text-lg font-semibold flex items-center">
                    <FaBath className="mr-2" />
                    {pg.bathrooms}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Distance to College</p>
                  <p className="text-lg font-semibold flex items-center">
                    <FaRoute className="mr-2" />
                    {pg.distanceToCollege} km
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">College</p>
                  <p className="text-lg font-semibold">{pg.collegeName}</p>
                </div>
                {pg.floorNumber !== undefined && (
                  <div>
                    <p className="text-gray-600 text-sm">Floor</p>
                    <p className="text-lg font-semibold">
                      {pg.floorNumber === 0 ? 'Ground' : `Floor ${pg.floorNumber}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              {(pg.securityDeposit || pg.maintenance) && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-semibold mb-2">Pricing Breakdown</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-semibold">₹{pg.price}</span>
                    </div>
                    {pg.securityDeposit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security Deposit:</span>
                        <span className="font-semibold">₹{pg.securityDeposit}</span>
                      </div>
                    )}
                    {pg.maintenance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maintenance:</span>
                        <span className="font-semibold">₹{pg.maintenance}/month</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Facilities */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Facilities</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    {pg.ac ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <FaTimes className="text-red-500 mr-2" />
                    )}
                    <span className="text-sm">AC Available</span>
                  </div>
                  <div className="flex items-center">
                    {pg.furnished ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <FaTimes className="text-red-500 mr-2" />
                    )}
                    <span className="text-sm">Furnished</span>
                  </div>
                  <div className="flex items-center">
                    {pg.ownerOnFirstFloor ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <FaTimes className="text-red-500 mr-2" />
                    )}
                    <span className="text-sm">Owner on First Floor</span>
                  </div>
                  {pg.foodAvailable !== undefined && (
                    <div className="flex items-center">
                      {pg.foodAvailable ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span className="text-sm">Food Available</span>
                    </div>
                  )}
                  {pg.powerBackup !== undefined && (
                    <div className="flex items-center">
                      {pg.powerBackup ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span className="text-sm">Power Backup</span>
                    </div>
                  )}
                  {pg.parking !== undefined && (
                    <div className="flex items-center">
                      {pg.parking ? (
                        <FaCheck className="text-green-500 mr-2" />
                      ) : (
                        <FaTimes className="text-red-500 mr-2" />
                      )}
                      <span className="text-sm">Parking</span>
                    </div>
                  )}
                  {pg.waterSupply && (
                    <div className="flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      <span className="text-sm">Water: {pg.waterSupply}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Additional Information</h2>
              {pg.preferredTenant && (
                <div className="mb-3">
                  <p className="text-gray-600 text-sm">Preferred Tenant Type</p>
                  <p className="font-semibold capitalize">{pg.preferredTenant}</p>
                </div>
              )}
              {pg.availabilityDate && (
                <div className="mb-3">
                  <p className="text-gray-600 text-sm">Available From</p>
                  <p className="font-semibold">
                    {new Date(pg.availabilityDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {pg.nearbyLandmarks && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Nearby Landmarks</p>
                  <p className="text-gray-700">{pg.nearbyLandmarks}</p>
                </div>
              )}
            </div>

            {/* Instructions/Rules */}
            {(pg.instructions || pg.specialInstructions || (pg.rules && pg.rules.length > 0)) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Instructions / Rules</h2>
                {pg.instructions ? (
                  <p className="text-gray-700 whitespace-pre-line">{pg.instructions}</p>
                ) : pg.specialInstructions ? (
                  <p className="text-gray-700">{pg.specialInstructions}</p>
                ) : (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {pg.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Map */}
            {pg.coordinates && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapComponent
                    center={[pg.coordinates.lat, pg.coordinates.lng]}
                    markers={[{ lat: pg.coordinates.lat, lng: pg.coordinates.lng, title: pg.title }]}
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

