import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FaSearch, FaRupeeSign, FaUser, FaComments } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Marketplace = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')

  const categories = ['Books', 'Electronics', 'Furniture', 'Clothing', 'Other']

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockItems = [
      {
        id: '1',
        title: 'Engineering Mathematics Book',
        description: 'First year engineering mathematics book, good condition',
        price: 300,
        category: 'Books',
        seller: { name: 'John Doe', id: 'seller1' },
        images: [],
        city: 'Nadiad'
      },
      {
        id: '2',
        title: 'Laptop Stand',
        description: 'Adjustable laptop stand, barely used',
        price: 500,
        category: 'Electronics',
        seller: { name: 'Jane Smith', id: 'seller2' },
        images: [],
        city: 'Nadiad'
      }
    ]
    setItems(mockItems)
    setFilteredItems(mockItems)
    setLoading(false)
  }, [])

  useEffect(() => {
    let filtered = [...items]

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (category) {
      filtered = filtered.filter(item => item.category === category)
    }

    setFilteredItems(filtered)
  }, [items, searchTerm, category])

  const handleContact = (sellerId, itemId) => {
    navigate(`/chat?user=${sellerId}&item=${itemId}&type=marketplace`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Buy and sell items with fellow students</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item found' : 'items found'}
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-48 bg-gray-200">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-primary-600 font-bold text-xl">
                      <FaRupeeSign />
                      <span>{item.price}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <FaUser className="mr-1" />
                      <span>{item.seller.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleContact(item.seller.id, item.id)}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
                  >
                    <FaComments />
                    <span>Contact Seller</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No items found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketplace

