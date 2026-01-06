import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FaMapMarkerAlt, 
  FaBed, 
  FaRupeeSign,
  FaCheck,
  FaTimes,
  FaImages,
  FaVideo,
  FaComments
} from 'react-icons/fa'
import ReactPlayer from 'react-player'
import MapComponent from '../../components/Common/MapComponent'
import PaymentModal from '../../components/Payment/PaymentModal'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const HostelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchHostel()
    }
  }, [id])

  const fetchHostel = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching Hostel:', id)
      
      const response = await fetch(`${API_BASE_URL}/hostel/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('📦 API Response:', result)

      if (result.success && result.hostel) {
        // Map backend data to frontend format
        const hostelData = {
          id: result.hostel._id || result.hostel.id,
          name: result.hostel.name,
          location: result.hostel.location,
          address: result.hostel.address || result.hostel.location,
          city: result.hostel.city,
          gender: result.hostel.gender,
          price: result.hostel.fees,
          feesPeriod: result.hostel.feesPeriod || 'monthly',
          roomsAvailable: result.hostel.availableRooms,
          totalRooms: result.hostel.totalRooms,
          facilities: result.hostel.facilities || {},
          description: result.hostel.description,
          rules: result.hostel.rules,
          images: result.hostel.images || [],
          videos: result.hostel.videos || [],
          roomTypeImages: result.hostel.roomTypeImages || {},
          coordinates: result.hostel.coordinates && result.hostel.coordinates.lat != null && result.hostel.coordinates.lng != null
            ? {
                lat: parseFloat(result.hostel.coordinates.lat),
                lng: parseFloat(result.hostel.coordinates.lng)
              }
            : null,
          status: result.hostel.status || 'active',
          contactNumber: result.hostel.contactNumber,
          contactEmail: result.hostel.contactEmail,
          admin: result.hostel.admin ? {
            name: result.hostel.admin.name,
            email: result.hostel.admin.email,
            phoneNumber: result.hostel.admin.phoneNumber,
            id: result.hostel.admin._id || result.hostel.admin.id
          } : null
        }
        
        setHostel(hostelData)
        console.log('✅ Hostel data received:', hostelData)
      } else {
        toast.error(result.message || 'Hostel not found')
        navigate('/student/hostels')
      }
    } catch (error) {
      console.error('Error fetching hostel:', error)
      toast.error('Failed to fetch hostel details: ' + (error.message || 'Unknown error'))
      setHostel(null)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (hostel && hostel.admin) {
      const adminId = hostel.admin._id || hostel.admin.id
      if (adminId) {
        navigate(`/chat?user=${adminId}&property=${id}&type=hostel`)
      } else {
        toast.error('Admin information not available')
      }
    } else {
      toast.error('Admin information not available')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!hostel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Hostel not found</p>
      </div>
    )
  }

  // Prepare gallery images
  const galleryImages = hostel && hostel.images && Array.isArray(hostel.images) && hostel.images.length > 0 
    ? hostel.images.map(img => ({ 
        original: img, 
        thumbnail: img,
        loading: 'lazy'
      }))
    : []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hostel.name}</h1>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
                <span>{hostel.address}</span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold ${
              hostel.gender === 'boys' ? 'bg-blue-500' : 'bg-pink-500'
            } text-white`}>
              {hostel.gender === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-primary-600 font-bold text-2xl">
              <FaRupeeSign />
              <span>{hostel.price}</span>
              <span className="text-lg text-gray-600 font-normal ml-1">/month</span>
            </div>
            <button
              onClick={handleContact}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
            >
              <FaComments />
              <span>Contact Admin</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                {hostel.videos && hostel.videos.length > 0 && (
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
                <div className="w-full">
                  {galleryImages && galleryImages.length > 0 ? (
                    <div className="w-full">
                      {/* Main large image display */}
                      <div className="w-full mb-4">
                        <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={galleryImages[selectedImageIndex]?.original || galleryImages[selectedImageIndex]}
                            alt={`Hostel image ${selectedImageIndex + 1}`}
                            className="w-full h-full object-contain bg-gray-100"
                          />
                        </div>
                      </div>
                      
                      {/* Horizontal scrolling thumbnail gallery */}
                      {galleryImages.length > 1 && (
                        <div className="w-full">
                          <div 
                            className="flex gap-2 overflow-x-auto pb-2" 
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#9ca3af #e5e7eb',
                              WebkitOverflowScrolling: 'touch'
                            }}
                          >
                            {galleryImages.map((img, index) => (
                              <div
                                key={index}
                                className={`flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                  selectedImageIndex === index 
                                    ? 'border-primary-600 ring-2 ring-primary-300' 
                                    : 'border-gray-300 hover:border-primary-400'
                                }`}
                                onClick={() => setSelectedImageIndex(index)}
                              >
                                <img
                                  src={img.original || img}
                                  alt={`Hostel image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
              
              {activeTab === 'video' && hostel.videos && hostel.videos.length > 0 && (
                <div className="h-96">
                  <ReactPlayer
                    url={hostel.videos[0]}
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Rooms Available</p>
                  <p className="text-lg font-semibold flex items-center">
                    <FaBed className="mr-2" />
                    {hostel.roomsAvailable} / {hostel.totalRooms}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Gender</p>
                  <p className="text-lg font-semibold capitalize">{hostel.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Fees Period</p>
                  <p className="text-lg font-semibold capitalize">{hostel.feesPeriod || 'monthly'}</p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Pricing Breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Fees:</span>
                    <span className="font-semibold">₹{hostel.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Facilities Included in Fees</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center">
                  {hostel.facilities?.mess ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">Mess Facility</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.wifi ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">WiFi</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.laundry ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">Laundry</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.gym ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">Gym</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.library ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">Library</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.parking ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">Parking</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.security ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">24/7 Security</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.powerBackup ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">Power Backup</span>
                </div>
                <div className="flex items-center">
                  {hostel.facilities?.waterSupply ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className="text-sm">Water Supply</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(hostel.description || hostel.rules) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Additional Information</h2>
                {hostel.description && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">Description</p>
                    <p className="text-gray-700 whitespace-pre-line">{hostel.description}</p>
                  </div>
                )}
                {hostel.rules && (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Rules & Regulations</p>
                    <p className="text-gray-700 whitespace-pre-line">{hostel.rules}</p>
                  </div>
                )}
              </div>
            )}

            {hostel.coordinates && 
             hostel.coordinates.lat != null && 
             hostel.coordinates.lng != null && 
             !isNaN(hostel.coordinates.lat) && 
             !isNaN(hostel.coordinates.lng) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                  <MapComponent
                    center={[parseFloat(hostel.coordinates.lat), parseFloat(hostel.coordinates.lng)]}
                    markers={[{ 
                      lat: parseFloat(hostel.coordinates.lat), 
                      lng: parseFloat(hostel.coordinates.lng), 
                      title: hostel.name,
                      color: 'blue'
                    }]}
                    scrollWheelZoom={true}
                    doubleClickZoom={true}
                    dragging={true}
                    touchZoom={true}
                    boxZoom={true}
                    keyboard={true}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Fees</h3>
                <p className="text-3xl font-bold text-primary-600 flex items-center">
                  <FaRupeeSign className="mr-1" />
                  {hostel?.fees?.toLocaleString('en-IN')}
                  <span className="text-lg text-gray-600 ml-2">
                    /{hostel?.feesPeriod === 'monthly' ? 'month' : hostel?.feesPeriod}
                  </span>
                </p>
                {(hostel?.availableRooms !== undefined || hostel?.roomsAvailable !== undefined) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {hostel.availableRooms || hostel.roomsAvailable || 0} room{(hostel.availableRooms || hostel.roomsAvailable || 0) !== 1 ? 's' : ''} available
                  </p>
                )}
              </div>

              {user?.role === 'student' && hostel && ((hostel.availableRooms > 0) || (hostel.roomsAvailable > 0)) && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaRupeeSign />
                  <span>Book Now</span>
                </button>
              )}
              {user?.role === 'student' && hostel && (hostel.availableRooms === 0 || hostel.roomsAvailable === 0) && (
                <div className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-lg text-center text-sm font-medium">
                  No rooms available
                </div>
              )}
              {(!user || user.role !== 'student') && (
                <div className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-lg text-center text-sm font-medium">
                  Please login as student to book
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Contact Admin</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get in touch with the hostel admin to schedule a visit or ask questions.
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
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {hostel && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          paymentType="HOSTEL_BOOKING"
          entityId={hostel.id}
          amount={hostel.fees}
          entityName={hostel.name}
          onSuccess={(payment) => {
            toast.success('Booking confirmed!')
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default HostelDetails

