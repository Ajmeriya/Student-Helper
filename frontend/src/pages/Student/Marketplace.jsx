import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FaSearch, FaRupeeSign, FaUser, FaComments, FaPlus, FaList, FaCreditCard } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import PaymentModal from '../../components/Payment/PaymentModal'
import { API_BASE_URL } from '../../utils/constants'
import toast from 'react-hot-toast'


const Marketplace = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const categories = ['books', 'electronics', 'furniture', 'clothing', 'other']

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          city: user?.city || '',
          status: 'available'
        })
        
        const response = await fetch(`${API_BASE_URL}/item?${params.toString()}`)
        const result = await response.json()
        
        if (result.success) {
          const mappedItems = (result.items || []).map(item => ({
            id: item._id || item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            condition: item.condition,
            images: item.images || [],
            seller: item.seller ? {
              id: String(item.seller._id || item.seller.id || ''),
              name: item.seller.name || 'Unknown'
            } : { id: '', name: 'Unknown' },
            city: item.city,
            negotiable: item.negotiable
          }))
          setItems(mappedItems)
          setFilteredItems(mappedItems)
        } else {
          toast.error(result.message || 'Failed to fetch items')
          setItems([])
          setFilteredItems([])
        }
      } catch (error) {
        console.error('Error fetching items:', error)
        toast.error('Failed to fetch items')
        setItems([])
        setFilteredItems([])
      } finally {
        setLoading(false)
      }
    }
    
    if (user?.city) {
      fetchItems()
    } else {
      setLoading(false)
    }
  }, [user?.city])

  useEffect(() => {
    let filtered = [...items]

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (category) {
      filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase())
    }

    setFilteredItems(filtered)
  }, [items, searchTerm, category])

  const handleContact = (item) => {
    if (!user) {
      toast.error('Please login to contact seller')
      navigate('/login')
      return
    }
    
    const sellerId = item.seller?._id || item.seller?.id || item.sellerId
    const itemId = item._id || item.id
    
    if (!sellerId) {
      toast.error('Seller information not available')
      return
    }
    
    console.log('💬 Contacting seller:', { sellerId, itemId })
    navigate(`/chat?user=${sellerId}&property=${itemId}&type=item`)
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
              <p className="text-gray-600">Buy and sell items with fellow students</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link
                to="/student/my-items"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
              >
                <FaList />
                <span>My Items</span>
              </Link>
              <Link
                to="/student/add-item"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
              >
                <FaPlus />
                <span>Add Item</span>
              </Link>
            </div>
          </div>
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
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                      <FaUser className="text-4xl opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-primary-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md capitalize">
                      {item.category}
                    </span>
                    {item.condition && (
                      <span className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md capitalize">
                        {item.condition}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex flex-col">
                      <div className="flex items-center text-primary-600 font-bold text-2xl">
                        <FaRupeeSign className="text-xl" />
                        <span>{item.price?.toLocaleString('en-IN')}</span>
                      </div>
                      {item.negotiable && (
                        <span className="text-xs text-gray-500 mt-0.5">Negotiable</span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm bg-gray-50 px-3 py-1.5 rounded-md">
                      <FaUser className="mr-1.5 text-primary-600" />
                      <span className="font-medium">{item.seller.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user && user.role === 'student' && item.seller && item.seller.id && 
                     item.seller.id !== '' && 
                     String(item.seller.id) !== String(user.id || user._id || '') && (
                      <button
                        onClick={() => {
                          if (!user) {
                            toast.error('Please login to purchase items')
                            navigate('/login')
                            return
                          }
                          setSelectedItem(item)
                          setShowPaymentModal(true)
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                      >
                        <FaCreditCard />
                        <span>Buy Now</span>
                      </button>
                    )}
                    {(!user || user.role !== 'student' || !item.seller || !item.seller.id || 
                      item.seller.id === '' || String(item.seller.id) === String(user.id || user._id || '')) && (
                      <button
                        onClick={() => handleContact(item)}
                        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!item.seller || !item.seller.id || item.seller.id === ''}
                      >
                        <FaComments />
                        <span>Contact Seller</span>
                      </button>
                    )}
                    {user && user.role === 'student' && item.seller && item.seller.id && 
                     item.seller.id !== '' && 
                     String(item.seller.id) !== String(user.id || user._id || '') && (
                      <button
                        onClick={() => handleContact(item)}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!item.seller || !item.seller.id || item.seller.id === ''}
                      >
                        <FaComments />
                        <span>Contact</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No items found</p>
            <Link
              to="/student/add-item"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2 mx-auto"
            >
              <FaPlus />
              <span>Post Your First Item</span>
            </Link>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedItem && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedItem(null)
          }}
          paymentType="ITEM_PURCHASE"
          entityId={selectedItem.id}
          amount={selectedItem.price}
          entityName={selectedItem.title}
          onSuccess={(payment) => {
            toast.success('Purchase successful!')
            setItems(items.filter(i => i.id !== selectedItem.id))
            setFilteredItems(filteredItems.filter(i => i.id !== selectedItem.id))
            setSelectedItem(null)
          }}
        />
      )}
    </div>
  )
}

export default Marketplace
