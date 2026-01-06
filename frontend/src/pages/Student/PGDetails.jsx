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
  FaComments,
  FaCalendarAlt
} from 'react-icons/fa'
import ImageGallery from 'react-image-gallery'
import ReactPlayer from 'react-player'
import MapComponent from '../../components/Common/MapComponent'
import PricePrediction from '../../components/PG/PricePrediction'
import PaymentModal from '../../components/Payment/PaymentModal'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const PGDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [customAddress, setCustomAddress] = useState('')
  const [calculatingDistance, setCalculatingDistance] = useState(false)
  const [customDistance, setCustomDistance] = useState(null)
  const [markedLocation, setMarkedLocation] = useState(null) // Store marked location coordinates
  const [showLocationMap, setShowLocationMap] = useState(false) // Toggle map for marking location
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    const fetchPG = async () => {
      try {
        setLoading(true)
        
        // Get user's college location for distance calculation
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        const collegeLocation = userData.collegeLocation?.coordinates
        
        // Build URL with college location if available
        let url = `${API_BASE_URL}/pg/${id}`
        if (collegeLocation && collegeLocation.lat && collegeLocation.lng) {
          // Properly encode the JSON string to avoid invalid URL characters
          const encodedLocation = encodeURIComponent(JSON.stringify(collegeLocation))
          url += `?collegeLocation=${encodedLocation}`
        }
        
        console.log('🔍 Fetching PG:', id)
        console.log('🔗 URL:', url)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          console.error('❌ HTTP Error:', response.status, response.statusText)
          const errorData = await response.json().catch(() => ({ message: 'Network error' }))
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('📦 API Response:', result)

        if (result.success && result.pg) {
          console.log('✅ PG data received:', result.pg)
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
            coordinates: result.pg.coordinates && result.pg.coordinates.lat && result.pg.coordinates.lng
              ? {
                  lat: parseFloat(result.pg.coordinates.lat),
                  lng: parseFloat(result.pg.coordinates.lng)
                }
              : null,
            status: result.pg.status || 'available',
            soldDate: result.pg.soldDate,
            rentalPeriod: result.pg.rentalPeriod,
            rentalStartDate: result.pg.rentalStartDate,
            rentalEndDate: result.pg.rentalEndDate,
            estimatedTravelTime: result.pg.estimatedTravelTime,
            distanceMethod: result.pg.distanceMethod,
            broker: result.pg.broker ? {
              name: result.pg.broker.name,
              email: result.pg.broker.email,
              phoneNumber: result.pg.broker.phoneNumber,
              id: result.pg.broker._id || result.pg.broker.id
            } : null
          }
          
          console.log('💾 Setting PG data:', pgData)
          setPg(pgData)
        } else {
          console.error('❌ API returned success: false', result)
          toast.error(result.message || 'PG not found')
          setPg(null)
        }
      } catch (error) {
        console.error('Error fetching PG:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          id: id,
          url: `${API_BASE_URL}/pg/${id}`
        })
        toast.error('Failed to fetch PG details: ' + (error.message || 'Unknown error'))
        setPg(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPG()
    } else {
      setLoading(false)
      toast.error('Invalid PG ID')
      navigate('/student/pgs')
    }
  }, [id, navigate])

  const handleContact = () => {
    if (pg && pg.broker) {
      const brokerId = pg.broker._id || pg.broker.id
      if (brokerId) {
        navigate(`/chat?user=${brokerId}&property=${id}&type=pg`)
      } else {
        toast.error('Broker information not available')
      }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">PG not found or failed to load</p>
          <button
            onClick={() => navigate('/student/pgs')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Back to PG List
          </button>
        </div>
      </div>
    )
  }

  // Prepare gallery images - only if pg is loaded and has images
  const galleryImages = pg && pg.images && Array.isArray(pg.images) && pg.images.length > 0 
    ? pg.images.map(img => ({ 
        original: img, 
        thumbnail: img,
        loading: 'lazy'
      }))
    : []

  // Debug log
  console.log('🎨 Rendering PGDetails:', { 
    loading, 
    hasPG: !!pg, 
    pgId: pg?.id,
    pgTitle: pg?.title,
    imagesCount: pg?.images?.length || 0,
    id: id,
    componentMounted: true
  })
  
  // Test render - this should always show
  console.log('✅ Component is rendering, loading:', loading, 'hasPG:', !!pg)

  // Safety check - if pg is null after loading, show error
  if (!loading && !pg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">PG not found or failed to load</p>
          <button
            onClick={() => navigate('/student/pgs')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Back to PG List
          </button>
        </div>
      </div>
    )
  }

  // Safety check - ensure pg has required fields before rendering
  if (pg && !pg.title) {
    console.error('⚠️ PG data missing title:', pg)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Invalid PG data - missing required fields</p>
          <button
            onClick={() => navigate('/student/pgs')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Back to PG List
          </button>
        </div>
      </div>
    )
  }

  // Final safety check before rendering
  if (!pg || !pg.title) {
    console.error('❌ Cannot render - PG data invalid:', pg)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Unable to load PG details</p>
          <button
            onClick={() => navigate('/student/pgs')}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pg.title || 'PG Details'}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <FaMapMarkerAlt className="mr-2" />
              <span>{pg.location || pg.address || 'Location not available'}</span>
              {pg.city && <span className="ml-2 text-gray-400">, {pg.city}</span>}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-primary-600 font-bold text-2xl">
                  <FaRupeeSign />
                  <span>{pg.price || 0}</span>
                  <span className="text-lg text-gray-600 font-normal ml-1">/month</span>
                </div>
                {pg.availabilityDate && (
                  <div className="flex items-center text-gray-600 text-sm bg-gray-50 px-3 py-1.5 rounded-md">
                    <FaCalendarAlt className="mr-2 text-green-500" />
                    <span>Available from {new Date(pg.availabilityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleContact}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
                >
                  <FaComments />
                  <span>Contact Owner</span>
                </button>
              </div>
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
                {pg.distanceToCollege > 0 && (
                  <div>
                    <p className="text-gray-600 text-sm">Distance to College</p>
                    <p className="text-lg font-semibold flex items-center">
                      <FaRoute className="mr-2" />
                      {pg.distanceToCollege.toFixed(2)} km
                      {pg.estimatedTravelTime && (
                        <span className="ml-2 text-sm text-gray-500">
                          (~{pg.estimatedTravelTime} min)
                        </span>
                      )}
                    </p>
                    {pg.distanceMethod === 'road' && (
                      <p className="text-xs text-green-600 mt-1">✓ Road distance calculated</p>
                    )}
                  </div>
                )}
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
            {pg.coordinates && 
             pg.coordinates.lat != null && 
             pg.coordinates.lng != null && 
             !isNaN(pg.coordinates.lat) && 
             !isNaN(pg.coordinates.lng) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Location & Distance</h2>
                
                {/* Distance Display */}
                {(pg.distanceToCollege > 0 || customDistance) && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Distance:</span>{' '}
                      <span className="text-primary-600 font-bold text-lg">
                        {(customDistance?.distance || pg.distanceToCollege || 0).toFixed(2)} km
                      </span>
                      {(customDistance?.duration || pg.estimatedTravelTime) && (
                        <span className="text-gray-600 ml-2">
                          (approximately {customDistance?.duration || pg.estimatedTravelTime} minutes by road)
                        </span>
                      )}
                    </p>
                    {customDistance && (
                      <p className="text-xs text-gray-600">
                        From: {customAddress || 'Your address'}
                      </p>
                    )}
                    {pg.distanceMethod === 'road' && (
                      <p className="text-xs text-green-600 mt-1">✓ Road distance calculated</p>
                    )}
                  </div>
                )}
                
                {/* Single Interactive Map for Marking Location and Viewing */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mark your college or workplace location to calculate distance
                  </label>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Click anywhere on the map below to mark your college or workplace location. The map shows the PG location (blue marker).
                    </p>
                    
                    {/* Single Interactive Map */}
                    <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                      <MapComponent
                        center={(() => {
                          // Determine center: marked location > user college > PG location > default
                          if (markedLocation && markedLocation.lat != null && markedLocation.lng != null && 
                              !isNaN(markedLocation.lat) && !isNaN(markedLocation.lng)) {
                            return [parseFloat(markedLocation.lat), parseFloat(markedLocation.lng)]
                          }
                          if (user?.collegeLocation?.coordinates?.lat != null && 
                              user?.collegeLocation?.coordinates?.lng != null &&
                              !isNaN(user.collegeLocation.coordinates.lat) && 
                              !isNaN(user.collegeLocation.coordinates.lng)) {
                            return [
                              parseFloat(user.collegeLocation.coordinates.lat),
                              parseFloat(user.collegeLocation.coordinates.lng)
                            ]
                          }
                          if (pg?.coordinates?.lat != null && 
                              pg?.coordinates?.lng != null &&
                              !isNaN(pg.coordinates.lat) && 
                              !isNaN(pg.coordinates.lng)) {
                            return [
                              parseFloat(pg.coordinates.lat),
                              parseFloat(pg.coordinates.lng)
                            ]
                          }
                          // Default to Nadiad, Gujarat
                          console.warn('⚠️ No valid coordinates found, using default center')
                          return [22.6944, 72.8606]
                        })()}
                        zoom={markedLocation || pg.distanceToCollege > 0 ? 13 : 15}
                        onMapClick={async (e) => {
                          const { lat, lng } = e.latlng
                          
                          // Validate coordinates are reasonable (not in extreme locations)
                          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                            toast.error('Invalid location coordinates')
                            return
                          }
                          
                          // Basic validation: Check if coordinates are in a reasonable range for India
                          // India roughly: lat 6.5 to 37.1, lng 68.1 to 97.4
                          // But allow some flexibility for nearby countries
                          if (lat < 5 || lat > 40 || lng < 65 || lng > 100) {
                            const confirm = window.confirm(
                              'This location seems to be outside India. Are you sure you want to mark this location?'
                            )
                            if (!confirm) return
                          }
                          
                          // Validate the location by reverse geocoding to check if it's valid (not in water)
                          try {
                            const response = await fetch(`${API_BASE_URL}/distance/validate-location`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ lat, lng })
                            })
                            
                            if (response.ok) {
                              const result = await response.json()
                              if (result.success && !result.valid) {
                                toast.error(result.message || 'This location appears to be invalid (e.g., in water). Please select a location on land.')
                                return
                              }
                            }
                          } catch (error) {
                            // If validation fails, warn user but allow them to proceed
                            console.warn('Location validation failed:', error)
                            const confirm = window.confirm(
                              'Unable to validate this location. It might be in water or an invalid area. Do you want to proceed anyway?'
                            )
                            if (!confirm) return
                          }
                          
                          setMarkedLocation({ lat, lng })
                          toast.success(`Location marked at ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                        }}
                        markers={[
                          ...(pg?.coordinates?.lat && pg?.coordinates?.lng ? [{
                            lat: parseFloat(pg.coordinates.lat), 
                            lng: parseFloat(pg.coordinates.lng), 
                            title: pg.title || 'PG Location',
                            color: 'blue'
                          }] : []),
                          ...(markedLocation && markedLocation.lat && markedLocation.lng ? [{
                            lat: parseFloat(markedLocation.lat),
                            lng: parseFloat(markedLocation.lng),
                            title: 'Your Location',
                            color: 'red'
                          }] : []),
                          ...(user?.collegeLocation?.coordinates && 
                              !markedLocation &&
                              user.collegeLocation.coordinates.lat != null && 
                              user.collegeLocation.coordinates.lng != null &&
                              !isNaN(user.collegeLocation.coordinates.lat) &&
                              !isNaN(user.collegeLocation.coordinates.lng) ? [{
                            lat: parseFloat(user.collegeLocation.coordinates.lat),
                            lng: parseFloat(user.collegeLocation.coordinates.lng),
                            title: user.collegeName || 'Your College',
                            color: 'red'
                          }] : [])
                        ]}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      💡 Click anywhere on the map to mark your location | 📍 Blue marker: PG location | 🎓 Red marker: {markedLocation ? 'Your marked location' : 'Your college (from profile)'}
                    </p>
                    
                    {/* Location Status and Actions */}
                    {markedLocation && (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 font-semibold mb-1">
                            ✓ Location marked successfully!
                          </p>
                          <p className="text-xs text-green-700">
                            Coordinates: {markedLocation.lat.toFixed(6)}, {markedLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!markedLocation) {
                                toast.error('Please mark your location on the map first')
                                return
                              }
                              if (!pg.coordinates || !pg.coordinates.lat || !pg.coordinates.lng) {
                                toast.error('PG location not available')
                                return
                              }
                              setCalculatingDistance(true)
                              try {
                                const url = `${API_BASE_URL}/distance/calculate`
                                console.log('🔗 Calculating distance:', url)
                                
                                const response = await fetch(url, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                  },
                                  body: JSON.stringify({
                                    originCoordinates: {
                                      lat: markedLocation.lat,
                                      lng: markedLocation.lng
                                    },
                                    destinationCoordinates: {
                                      lat: parseFloat(pg.coordinates.lat),
                                      lng: parseFloat(pg.coordinates.lng)
                                    }
                                  })
                                })
                                
                                console.log('📡 Response status:', response.status, response.statusText)
                                
                                if (!response.ok) {
                                  const errorText = await response.text()
                                  console.error('❌ API Error:', errorText)
                                  throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                                }
                                
                                const result = await response.json()
                                console.log('✅ Distance result:', result)
                                
                                if (result.success) {
                                  setCustomDistance({
                                    distance: result.data.distance,
                                    duration: result.data.duration,
                                    method: result.data.method
                                  })
                                  toast.success(`Distance calculated: ${result.data.distance.toFixed(2)} km`)
                                } else {
                                  toast.error(result.message || 'Failed to calculate distance')
                                }
                              } catch (error) {
                                console.error('❌ Error calculating distance:', error)
                                toast.error('Failed to calculate distance: ' + (error.message || 'Unknown error'))
                              } finally {
                                setCalculatingDistance(false)
                              }
                            }}
                            disabled={calculatingDistance || !markedLocation}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {calculatingDistance ? 'Calculating...' : 'Calculate Distance'}
                          </button>
                          <button
                            onClick={() => {
                              setMarkedLocation(null)
                              setCustomDistance(null)
                              toast('Location cleared. Click on map to mark a new location.', { icon: 'ℹ️' })
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Clear
                          </button>
                        </div>
                        
                        {customDistance && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-lg font-semibold text-blue-800 flex items-center">
                              <FaRoute className="mr-2" />
                              Distance: {customDistance.distance.toFixed(2)} km
                              {customDistance.duration && (
                                <span className="ml-2 text-base text-blue-600">
                                  (~{customDistance.duration} min)
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                              Calculation method: {customDistance.method === 'road' ? 'Road network' : 'Direct line'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Price</h3>
                <p className="text-3xl font-bold text-primary-600 flex items-center">
                  <FaRupeeSign className="mr-1" />
                  {pg?.price?.toLocaleString('en-IN')}
                  <span className="text-lg text-gray-600 ml-2">/month</span>
                </p>
                {pg?.securityDeposit > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Security Deposit: ₹{pg.securityDeposit.toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              {user?.role === 'student' && pg?.status === 'available' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 font-semibold"
                >
                  <FaRupeeSign />
                  <span>Book Now</span>
                </button>
              )}

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Contact Owner</h3>
                <p className="text-sm text-gray-600 mb-4">
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
            </div>

            {/* Price Prediction */}
            <PricePrediction pgData={pg} />
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {pg && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentType="PG_BOOKING"
          entityId={pg.id}
          amount={pg.price}
          entityName={pg.title}
          onSuccess={(payment) => {
            toast.success('Booking confirmed!')
            // Refresh PG data
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default PGDetails

