import { FaRupeeSign, FaRoute, FaWifi, FaDumbbell, FaUtensils, FaCar, FaSnowflake, FaHome, FaShieldAlt, FaTshirt, FaBook, FaTimes } from 'react-icons/fa'

const FilterPanel = ({ filters, onFilterChange, onClear, type }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={onClear}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
        >
          <FaTimes className="text-xs" />
          <span>Clear All</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">Min Price (₹)</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => onFilterChange('minPrice', e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Min"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">Max Price (₹)</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Distance Range (for PG) */}
        {type === 'pg' && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Distance Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Min Distance (km)</label>
                <div className="relative">
                  <FaRoute className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="number"
                    step="0.1"
                    value={filters.minDistance || ''}
                    onChange={(e) => onFilterChange('minDistance', e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="Min"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Max Distance (km)</label>
                <div className="relative">
                  <FaRoute className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="number"
                    step="0.1"
                    value={filters.maxDistance || ''}
                    onChange={(e) => onFilterChange('maxDistance', e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sharing Type (for PG) */}
        {type === 'pg' && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Sharing Type
            </label>
            <select
              value={filters.sharingType || ''}
              onChange={(e) => onFilterChange('sharingType', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
            >
              <option value="">All Types</option>
              <option value="single">Single Occupancy</option>
              <option value="double">Double Sharing</option>
              <option value="triple">Triple Sharing</option>
              <option value="quad">4+ Sharing</option>
            </select>
          </div>
        )}

        {/* Facilities */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Facilities
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {type === 'pg' && (
              <>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.ac || false}
                    onChange={(e) => onFilterChange('ac', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaSnowflake className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">AC</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.furnished || false}
                    onChange={(e) => onFilterChange('furnished', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaHome className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Furnished</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.ownerOnFirstFloor || false}
                    onChange={(e) => onFilterChange('ownerOnFirstFloor', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaShieldAlt className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Owner on 1st Floor</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.foodAvailable || false}
                    onChange={(e) => onFilterChange('foodAvailable', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaUtensils className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Food Available</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.parking || false}
                    onChange={(e) => onFilterChange('parking', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaCar className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Parking</span>
                </label>
              </>
            )}
            {type === 'hostel' && (
              <>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.mess || false}
                    onChange={(e) => onFilterChange('mess', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaUtensils className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Mess</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.wifi || false}
                    onChange={(e) => onFilterChange('wifi', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaWifi className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">WiFi</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.laundry || false}
                    onChange={(e) => onFilterChange('laundry', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaTshirt className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Laundry</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.gym || false}
                    onChange={(e) => onFilterChange('gym', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaDumbbell className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Gym</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.studyRoom || false}
                    onChange={(e) => onFilterChange('studyRoom', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaBook className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">Study Room</span>
                </label>
                <label className="flex items-center p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-primary-300 cursor-pointer transition-all group">
                  <input
                    type="checkbox"
                    checked={filters.security || false}
                    onChange={(e) => onFilterChange('security', e.target.checked)}
                    className="mr-2.5 w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <FaShieldAlt className="mr-2 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">24/7 Security</span>
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel

