const FilterPanel = ({ filters, onFilterChange, onClear, type }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Min Price (₹)
        </label>
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => onFilterChange('minPrice', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Min"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Price (₹)
        </label>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Max"
        />
      </div>

      {/* Distance Range (for PG) */}
      {type === 'pg' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={filters.minDistance}
              onChange={(e) => onFilterChange('minDistance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Min"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={filters.maxDistance}
              onChange={(e) => onFilterChange('maxDistance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Max"
            />
          </div>
        </>
      )}

      {/* Sharing Type (for PG) */}
      {type === 'pg' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sharing Type
          </label>
          <select
            value={filters.sharingType || ''}
            onChange={(e) => onFilterChange('sharingType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="single">Single Occupancy</option>
            <option value="double">Double Sharing</option>
            <option value="triple">Triple Sharing</option>
            <option value="quad">4+ Sharing</option>
          </select>
        </div>
      )}

      {/* Checkboxes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facilities
        </label>
        {type === 'pg' && (
          <>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.ac}
                onChange={(e) => onFilterChange('ac', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">AC Available</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.furnished}
                onChange={(e) => onFilterChange('furnished', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Furnished</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.ownerOnFirstFloor}
                onChange={(e) => onFilterChange('ownerOnFirstFloor', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Owner on First Floor</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.foodAvailable}
                onChange={(e) => onFilterChange('foodAvailable', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Food Available</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.parking}
                onChange={(e) => onFilterChange('parking', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Parking</span>
            </label>
          </>
        )}
        {type === 'hostel' && (
          <>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.mess}
                onChange={(e) => onFilterChange('mess', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Mess Facility</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.wifi}
                onChange={(e) => onFilterChange('wifi', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">WiFi</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.laundry}
                onChange={(e) => onFilterChange('laundry', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Laundry</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.gym}
                onChange={(e) => onFilterChange('gym', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Gym</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.studyRoom}
                onChange={(e) => onFilterChange('studyRoom', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Study Room</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.security}
                onChange={(e) => onFilterChange('security', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">24/7 Security</span>
            </label>
          </>
        )}
      </div>

      {/* Clear Button */}
      <div className="flex items-end">
        <button
          onClick={onClear}
          className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
