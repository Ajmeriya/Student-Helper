import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FaMapMarkerAlt, 
  FaBed, 
  FaRupeeSign,
  FaCheck,
  FaImages,
  FaVideo,
  FaComments
} from 'react-icons/fa'
import ImageGallery from 'react-image-gallery'
import ReactPlayer from 'react-player'
import MapComponent from '../../components/Common/MapComponent'

const HostelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockHostel = {
      id: id,
      name: 'Comfort Hostel',
      location: 'Nadiad',
      address: '123 Main Street, Nadiad',
      gender: 'boys',
      price: 8000,
      roomsAvailable: 5,
      totalRooms: 20,
      mess: true,
      wifi: true,
      laundry: true,
      gym: false,
      facilities: ['Mess', 'WiFi', 'Laundry'],
      images: [],
      videos: [],
      coordinates: { lat: 22.6944, lng: 72.8606 },
      admin: {
        name: 'Hostel Admin',
        id: 'admin1'
      }
    }
    setHostel(mockHostel)
    setLoading(false)
  }, [id])

  const handleContact = () => {
    navigate(`/chat?user=${hostel.admin.id}&property=${id}&type=hostel`)
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

  const galleryImages = hostel.images.length > 0 
    ? hostel.images.map(img => ({ original: img, thumbnail: img }))
    : [{ original: '/placeholder.jpg', thumbnail: '/placeholder.jpg' }]

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
                <div className="h-96">
                  <ImageGallery items={galleryImages} showThumbnails={true} />
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
              <h2 className="text-2xl font-semibold mb-4">Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Rooms Available</p>
                  <p className="text-lg font-semibold flex items-center">
                    <FaBed className="mr-2" />
                    {hostel.roomsAvailable} / {hostel.totalRooms}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Gender</p>
                  <p className="text-lg font-semibold capitalize">{hostel.gender}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Facilities Included</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center">
                  {hostel.mess ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <span className="text-red-500 mr-2">✗</span>
                  )}
                  <span className="text-sm">Mess Facility</span>
                </div>
                <div className="flex items-center">
                  {hostel.wifi ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <span className="text-red-500 mr-2">✗</span>
                  )}
                  <span className="text-sm">WiFi</span>
                </div>
                <div className="flex items-center">
                  {hostel.laundry ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <span className="text-red-500 mr-2">✗</span>
                  )}
                  <span className="text-sm">Laundry</span>
                </div>
                <div className="flex items-center">
                  {hostel.gym ? (
                    <FaCheck className="text-green-500 mr-2" />
                  ) : (
                    <span className="text-red-500 mr-2">✗</span>
                  )}
                  <span className="text-sm">Gym</span>
                </div>
                {hostel.studyRoom !== undefined && (
                  <div className="flex items-center">
                    {hostel.studyRoom ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <span className="text-red-500 mr-2">✗</span>
                    )}
                    <span className="text-sm">Study Room</span>
                  </div>
                )}
                {hostel.commonArea !== undefined && (
                  <div className="flex items-center">
                    {hostel.commonArea ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <span className="text-red-500 mr-2">✗</span>
                    )}
                    <span className="text-sm">Common Area</span>
                  </div>
                )}
                {hostel.security !== undefined && (
                  <div className="flex items-center">
                    {hostel.security ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <span className="text-red-500 mr-2">✗</span>
                    )}
                    <span className="text-sm">24/7 Security</span>
                  </div>
                )}
                {hostel.medical !== undefined && (
                  <div className="flex items-center">
                    {hostel.medical ? (
                      <FaCheck className="text-green-500 mr-2" />
                    ) : (
                      <span className="text-red-500 mr-2">✗</span>
                    )}
                    <span className="text-sm">Medical Facility</span>
                  </div>
                )}
              </div>
            </div>

            {/* Policies & Timings */}
            {(hostel.messTimings || hostel.curfewTimings || hostel.visitorPolicy || hostel.securityDeposit) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Policies & Timings</h2>
                <div className="space-y-3">
                  {hostel.messTimings && (
                    <div>
                      <p className="text-gray-600 text-sm">Mess Timings</p>
                      <p className="font-semibold">{hostel.messTimings}</p>
                    </div>
                  )}
                  {hostel.curfewTimings && (
                    <div>
                      <p className="text-gray-600 text-sm">Curfew Timings</p>
                      <p className="font-semibold">{hostel.curfewTimings}</p>
                    </div>
                  )}
                  {hostel.visitorPolicy && (
                    <div>
                      <p className="text-gray-600 text-sm">Visitor Policy</p>
                      <p className="font-semibold capitalize">{hostel.visitorPolicy.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  )}
                  {hostel.securityDeposit && (
                    <div>
                      <p className="text-gray-600 text-sm">Security Deposit</p>
                      <p className="font-semibold">₹{hostel.securityDeposit}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hostel.coordinates && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Location</h2>
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapComponent
                    center={[hostel.coordinates.lat, hostel.coordinates.lng]}
                    markers={[{ lat: hostel.coordinates.lat, lng: hostel.coordinates.lng, title: hostel.name }]}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-semibold mb-4">Contact Admin</h3>
              <p className="text-gray-600 mb-4">
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
  )
}

export default HostelDetails

