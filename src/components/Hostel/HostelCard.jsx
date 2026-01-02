import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaBed, FaRupeeSign, FaCheck } from 'react-icons/fa'
import { motion } from 'framer-motion'

const HostelCard = ({ hostel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
    >
      <div className="relative h-48 bg-gray-200">
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
        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
          hostel.gender === 'boys' ? 'bg-blue-500' : 'bg-pink-500'
        } text-white`}>
          {hostel.gender === 'boys' ? 'Boys' : 'Girls'}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{hostel.name}</h3>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-2" />
            <span>{hostel.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <FaBed className="mr-2" />
            <span>{hostel.roomsAvailable} rooms available</span>
          </div>
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-2 mb-3">
          {hostel.mess && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
              <FaCheck className="mr-1" />
              Mess
            </span>
          )}
          {hostel.wifi && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
              <FaCheck className="mr-1" />
              WiFi
            </span>
          )}
          {hostel.laundry && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded flex items-center">
              <FaCheck className="mr-1" />
              Laundry
            </span>
          )}
          {hostel.gym && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded flex items-center">
              <FaCheck className="mr-1" />
              Gym
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-primary-600 font-bold text-xl">
            <FaRupeeSign />
            <span>{hostel.price}</span>
            <span className="text-sm text-gray-600 font-normal ml-1">/month</span>
          </div>
          
          <Link
            to={`/student/hostel/${hostel.id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default HostelCard

