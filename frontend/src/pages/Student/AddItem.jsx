import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const AddItem = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])

  const categories = [
    { value: 'books', label: 'Books' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'other', label: 'Other' }
  ]

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ]

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login again')
        navigate('/login')
        return
      }

      // Create FormData for file uploads
      const formData = new FormData()
      
      // Basic information
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('category', data.category)
      if (data.subcategory) formData.append('subcategory', data.subcategory)
      formData.append('price', parseFloat(data.price))
      formData.append('negotiable', data.negotiable || false)
      formData.append('condition', data.condition)
      formData.append('city', user.city)
      if (data.location) formData.append('location', data.location)
      
      // Additional info
      if (data.brand) formData.append('brand', data.brand)
      if (data.model) formData.append('model', data.model)
      if (data.year) formData.append('year', parseInt(data.year))
      if (data.contactMethod) formData.append('contactMethod', data.contactMethod)
      
      // Add images
      images.forEach((image) => {
        formData.append('images', image)
      })
      
      console.log('📤 Uploading item data...', {
        title: data.title,
        category: data.category,
        imagesCount: images.length
      })
      
      console.log('📤 Sending request to:', `${API_BASE_URL}/item`)
      console.log('📤 Authorization header:', `Bearer ${token ? token.substring(0, 20) + '...' : 'MISSING'}`)
      
      const response = await fetch(`${API_BASE_URL}/item`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData
      })

      console.log('📥 Response status:', response.status, response.statusText)

      // Check if response has JSON content
      const contentType = response.headers.get('content-type')
      let result
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        // If not JSON, read as text for error message
        const text = await response.text()
        throw new Error(`Server error: ${response.status} ${response.statusText}. ${text}`)
      }

      console.log('📦 API Response:', result)

      if (!response.ok) {
        // Check if it's an authentication error
        if (response.status === 401) {
          console.error('❌ Authentication failed! Status:', response.status)
          console.error('❌ Error response:', result)
          toast.error(result.message || 'Authentication failed. Please log in again.')
          // Clear old token and redirect to login
          console.log('🧹 Clearing localStorage...')
          localStorage.clear()
          setTimeout(() => {
            navigate('/login')
          }, 1000)
          return
        }
        throw new Error(result.message || result.error || 'Failed to create item')
      }

      if (result.success) {
        toast.success('Item posted successfully!')
        navigate('/student/my-items')
      } else {
        throw new Error(result.message || 'Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error(error.message || 'Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Item to Marketplace</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Engineering Mathematics Book - Semester 3"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe your item in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory (Optional)
                </label>
                <input
                  {...register('subcategory')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Textbooks, Laptops, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition *
                </label>
                <select
                  {...register('condition', { required: 'Condition is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Condition</option>
                  {conditions.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  {...register('price', { required: 'Price is required', min: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="500"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('negotiable')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Price is negotiable</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Additional Information (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  {...register('brand')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Apple, Samsung"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  {...register('model')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., iPhone 12, MacBook Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  {...register('year', { min: 1900, max: new Date().getFullYear() + 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  {...register('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Near College Gate"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Photos *
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {images.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">{images.length} image(s) selected</p>
            )}
            {images.length === 0 && (
              <p className="mt-1 text-xs text-red-600">At least one image is required</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting Item...' : 'Post Item'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/marketplace')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItem
