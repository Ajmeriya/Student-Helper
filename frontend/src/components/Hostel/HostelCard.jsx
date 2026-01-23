import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaBed, FaRupeeSign, FaCheck, FaWifi, FaUtensils, FaTshirt, FaDumbbell, FaHome } from 'react-icons/fa'
import { motion } from 'framer-motion'

const HostelCard = ({ hostel }) => {
  const facilities = []
  if (hostel.facilities?.mess) facilities.push({ icon: FaUtensils, label: 'Mess', color: 'green' })
  if (hostel.facilities?.wifi) facilities.push({ icon: FaWifi, label: 'WiFi', color: 'blue' })
  if (hostel.facilities?.laundry) facilities.push({ icon: FaTshirt, label: 'Laundry', color: 'purple' })
  if (hostel.facilities?.gym) facilities.push({ icon: FaDumbbell, label: 'Gym', color: 'orange' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
    >
      <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {hostel.images && hostel.images.length > 0 ? (
          <img
            src={hostel.images[0]}
            alt={hostel.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <FaHome className="text-4xl opacity-50" />
          </div>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
          hostel.gender === 'boys' ? 'bg-blue-500' : 'bg-pink-500'
        } text-white`}>
          {hostel.gender === 'boys' ? 'Boys' : 'Girls'}
        </span>
        {hostel.availableRooms !== undefined && hostel.availableRooms > 0 && (
          <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {hostel.availableRooms} Available
          </span>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-1">{hostel.name}</h3>
        
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-2 text-primary-600" />
            <span className="truncate">{hostel.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <FaBed className="mr-2 text-primary-600" />
            <span className="font-medium">{hostel.availableRooms || hostel.roomsAvailable || 0} rooms available</span>
          </div>
        </div>

        {/* Facilities */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {facilities.map((facility, idx) => {
              const Icon = facility.icon
              const colorClasses = {
                green: 'bg-green-100 text-green-800 border-green-200',
                blue: 'bg-blue-100 text-blue-800 border-blue-200',
                purple: 'bg-purple-100 text-purple-800 border-purple-200',
                orange: 'bg-orange-100 text-orange-800 border-orange-200'
              }
              return (
                <span key={idx} className={`${colorClasses[facility.color]} text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 border font-medium`}>
                  <Icon className="text-xs" />
                  {facility.label}
                </span>
              )
            })}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex flex-col">
            <div className="flex items-center text-primary-600 font-bold text-2xl">
              <FaRupeeSign className="text-xl" />
              <span>{hostel.fees?.toLocaleString('en-IN') || hostel.price?.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-xs text-gray-500 font-normal">
              per {hostel.feesPeriod === 'monthly' ? 'month' : hostel.feesPeriod || 'month'}
            </span>
          </div>
          
          <Link
            to={`/student/hostel/${hostel.id}`}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default HostelCard
