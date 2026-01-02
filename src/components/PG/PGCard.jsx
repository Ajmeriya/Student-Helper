import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaRuler, FaBed, FaBath, FaRupeeSign, FaRoute } from 'react-icons/fa'
import { motion } from 'framer-motion'

const PGCard = ({ pg }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
    >
      <div className="relative h-48 bg-gray-200">
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
        {pg.ac && (
          <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            AC Available
          </span>
        )}
        {pg.furnished && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
            Furnished
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{pg.title}</h3>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-2" />
            <span>{pg.location}</span>
          </div>
          
          {pg.distanceToCollege && (
            <div className="flex items-center text-gray-600 text-sm">
              <FaRoute className="mr-2" />
              <span>{pg.distanceToCollege} km from college</span>
            </div>
          )}
          
          <div className="flex items-center space-x-4 text-gray-600 text-sm">
            {pg.bedrooms && (
              <div className="flex items-center">
                <FaBed className="mr-1" />
                <span>{pg.bedrooms} Beds</span>
              </div>
            )}
            {pg.bathrooms && (
              <div className="flex items-center">
                <FaBath className="mr-1" />
                <span>{pg.bathrooms} Baths</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-primary-600 font-bold text-xl">
            <FaRupeeSign />
            <span>{pg.price}</span>
            <span className="text-sm text-gray-600 font-normal ml-1">/month</span>
          </div>
          
          <Link
            to={`/student/pg/${pg.id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default PGCard

