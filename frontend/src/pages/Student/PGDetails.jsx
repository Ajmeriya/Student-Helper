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
import { API_BASE_URL } from '../../utils/constants'

const PGDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchPG = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_BASE_URL}/pg/${id}`)
        const result = await response.json()

        if (result.success && result.pg) {
          // Map backend data to frontend format
          const pgData = {
            id: result.pg._id || result.pg.id,
            title: result.pg.title,
            location: result.pg.location,
            address: result.pg.location, // Use location as address
            price: result.pg.price,
            bedrooms: result.pg.bedrooms,
            bathrooms: result.pg.bathrooms,
            sharingType: result.pg.sharingType,
            floorNumber: result.pg.floorNumber,
            ac: result.pg.ac,
            furnished: result.pg.furnished,
            ownerOnFirstFloor: result.pg.ownerOnFirstFloor,
            foodAvailable: result.pg.foodAvailable,
            powerBackup: result.pg.powerBackup,
            parking: result.pg.parking,
            waterSupply: result.pg.waterSupply,
            distanceToCollege: result.pg.distanceToCollege || 0,
            collegeName: result.pg.collegeName,
            instructions: result.pg.instructions,
            nearbyLandmarks: result.pg.nearbyLandmarks,
            preferredTenant: result.pg.preferredTenant,
            availabilityDate: result.pg.availabilityDate,
            securityDeposit: result.pg.securityDeposit,
            maintenance: result.pg.maintenance,
            images: result.pg.images || [],
            videos: result.pg.videos || [],
            coordinates: result.pg.coordinates,
            broker: result.pg.broker ? {
              name: result.pg.broker.name,
              email: result.pg.broker.email,
              phoneNumber: result.pg.broker.phoneNumber,
              id: result.pg.broker._id || result.pg.broker.id
            } : null,
            ...result.pg // Include all other fields
          }
          
          setPg(pgData)
        } else {
          toast.error(result.message || 'PG not found')
          navigate('/student/pgs')
        }
      } catch (error) {
        console.error('Error fetching PG:', error)
        toast.error('Failed to fetch PG details')
        navigate('/student/pgs')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPG()
    }
  }, [id, navigate])

  const handleContact = () => {
    if (pg && pg.broker && pg.broker.id) {
      navigate(`/chat?user=${pg.broker.id}&property=${id}&type=pg`)
    } else {
      toast.error('Broker information not available')
    }
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

  const galleryImages = pg.images && pg.images.length > 0 
    ? pg.images.map(img => ({ 
        original: img, 
        thumbnail: img,
        loading: 'lazy'
      }))
    : [{ 
        original: 'https://via.placeholder.com/800x600?text=No+Image+Available', 
        thumbnail: 'https://via.placeholder.com/150x100?text=No+Image' 
      }]

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
            {/* Images/Video Gallery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === 'overview' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaImages className="inline mr-2" />
                  Photos {pg.images && pg.images.length > 0 && `(${pg.images.length})`}
                </button>
                {pg.videos && pg.videos.length > 0 && (
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`px-4 py-2 rounded-lg transition ${
                      activeTab === 'video' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <FaVideo className="inline mr-2" />
                    Videos ({pg.videos.length})
                  </button>
                )}
              </div>
              
              {activeTab === 'overview' && (
                <div className="w-full">
                  {galleryImages && galleryImages.length > 0 ? (
                    <div className="image-gallery-container">
                      <style>{`
                        .image-gallery-container {
                          width: 100%;
                          overflow: hidden;
                        }
                        .image-gallery-container .image-gallery {
                          width: 100%;
                          line-height: 0;
                        }
                        .image-gallery-container .image-gallery-content {
                          width: 100%;
                          position: relative;
                        }
                        .image-gallery-container .image-gallery-slide-wrapper {
                          width: 100%;
                          position: relative;
                        }
                        .image-gallery-container .image-gallery-slide {
                          width: 100%;
                          height: auto;
                          min-height: 400px;
                          max-height: 600px;
                        }
                        .image-gallery-container .image-gallery-slide img {
                          width: 100%;
                          height: 100%;
                          min-height: 400px;
                          max-height: 600px;
                          object-fit: contain;
                          object-position: center;
                          background-color: #f3f4f6;
                        }
                        .image-gallery-container .image-gallery-thumbnail {
                          width: 100px;
                          height: 75px;
                          margin: 0 4px;
                          border-radius: 4px;
                          overflow: hidden;
                        }
                        .image-gallery-container .image-gallery-thumbnail img {
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                          object-position: center;
                        }
                        .image-gallery-container .image-gallery-thumbnails {
                          padding: 15px 0;
                          text-align: center;
                          background-color: #f9fafb;
                          border-top: 1px solid #e5e7eb;
                        }
                        .image-gallery-container .image-gallery-thumbnail.active,
                        .image-gallery-container .image-gallery-thumbnail:hover {
                          border: 3px solid #3b82f6;
                          opacity: 1;
                        }
                        .image-gallery-container .image-gallery-thumbnail:not(.active) {
                          opacity: 0.7;
                        }
                        .image-gallery-container .image-gallery-icon {
                          color: #3b82f6;
                        }
                        @media (max-width: 768px) {
                          .image-gallery-container .image-gallery-slide img {
                            min-height: 300px;
                            max-height: 400px;
                          }
                          .image-gallery-container .image-gallery-thumbnail {
                            width: 80px;
                            height: 60px;
                          }
                        }
                      `}</style>
                      <ImageGallery 
                        items={galleryImages} 
                        showThumbnails={galleryImages.length > 1}
                        showFullscreenButton={true}
                        showPlayButton={false}
                        showBullets={false}
                        autoPlay={false}
                        slideInterval={3000}
                        thumbnailPosition="bottom"
                        showNav={galleryImages.length > 1}
                        lazyLoad={true}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FaImages className="text-4xl mx-auto mb-2" />
                        <p>No images available</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'video' && pg.videos && pg.videos.length > 0 && (
                <div className="w-full">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0">
                      <ReactPlayer
                        url={pg.videos[0]}
                        width="100%"
                        height="100%"
                        controls
                        style={{ position: 'absolute', top: 0, left: 0 }}
                      />
                    </div>
                  </div>
                  {pg.videos.length > 1 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">More Videos:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {pg.videos.slice(1).map((video, index) => (
                          <div key={index} className="relative" style={{ paddingBottom: '56.25%' }}>
                            <div className="absolute inset-0">
                              <ReactPlayer
                                url={video}
                                width="100%"
                                height="100%"
                                controls
                                style={{ position: 'absolute', top: 0, left: 0 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

