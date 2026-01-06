import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaBed, FaBath, FaRupeeSign, FaRoute, FaSnowflake, FaHome, FaCalendarAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'

const PGCard = ({ pg }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
    >
      <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {pg.images && pg.images.length > 0 && pg.images[0] ? (
          <img
            src={pg.images[0]}
            alt={pg.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200" style={{ display: pg.images && pg.images.length > 0 && pg.images[0] ? 'none' : 'flex' }}>
          <FaHome className="text-4xl opacity-50" />
        </div>
        
        {/* Status Badge */}
        {pg.status && pg.status !== 'available' && (
          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
            pg.status === 'sold' ? 'bg-red-500 text-white' : 
            pg.status === 'onRent' ? 'bg-blue-500 text-white' : 
            'bg-green-500 text-white'
          }`}>
            {pg.status === 'sold' ? 'Sold' : pg.status === 'onRent' ? 'On Rent' : 'Available'}
          </span>
        )}
        
        {/* Feature Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {pg.ac && (
            <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
              <FaSnowflake className="text-xs" />
              AC
            </span>
          )}
          {pg.furnished && !pg.ac && (
            <span className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
              <FaHome className="text-xs" />
              Furnished
            </span>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-1">{pg.title}</h3>
        
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-2 text-primary-600" />
            <span className="truncate">{pg.location}</span>
          </div>
          
          {pg.distanceToCollege && (
            <div className="flex items-center text-gray-600 text-sm">
              <FaRoute className="mr-2 text-blue-500" />
              <span>{pg.distanceToCollege.toFixed(1)} km from college</span>
            </div>
          )}
          
          {pg.availabilityDate && (
            <div className="flex items-center text-gray-600 text-sm">
              <FaCalendarAlt className="mr-2 text-green-500" />
              <span>Available from {new Date(pg.availabilityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-gray-600 text-sm pt-1">
            {pg.bedrooms && (
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <FaBed className="mr-1.5 text-primary-600" />
                <span className="font-medium">{pg.bedrooms}</span>
              </div>
            )}
            {pg.bathrooms && (
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <FaBath className="mr-1.5 text-primary-600" />
                <span className="font-medium">{pg.bathrooms}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex flex-col">
            <div className="flex items-center text-primary-600 font-bold text-2xl">
              <FaRupeeSign className="text-xl" />
              <span>{pg.price?.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-xs text-gray-500 font-normal">per month</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              to={`/student/pg/${pg._id || pg.id}`}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              onClick={(e) => {
                if (!pg._id && !pg.id) {
                  e.preventDefault()
                  console.error('PG ID missing:', pg)
                }
              }}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PGCard

