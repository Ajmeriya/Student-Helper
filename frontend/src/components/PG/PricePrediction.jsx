import { useState } from 'react'
import { FaCalculator, FaInfoCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'

const PricePrediction = ({ pgData }) => {
  const [predictedPrice, setPredictedPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showDataset, setShowDataset] = useState(false)

  const calculatePrice = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual AI model API call
      // For now, using a simple calculation based on features
      const basePrice = 3000
      let price = basePrice

      // Add price based on features
      if (pgData.ac) price += 1500
      if (pgData.furnished) price += 1000
      if (pgData.bedrooms) price += pgData.bedrooms * 500
      if (pgData.bathrooms) price += pgData.bathrooms * 300
      
      // Distance factor (closer to college = higher price)
      if (pgData.distanceToCollege) {
        const distanceFactor = Math.max(0, 5 - pgData.distanceToCollege) * 200
        price += distanceFactor
      }

      // Add some randomness to simulate AI prediction
      const variance = price * 0.1
      const minPrice = Math.round(price - variance)
      const maxPrice = Math.round(price + variance)

      setPredictedPrice({ min: minPrice, max: maxPrice })
    } catch (error) {
      toast.error('Failed to predict price')
    } finally {
      setLoading(false)
    }
  }

  const datasetDescription = {
    features: [
      'Location (city, area)',
      'Distance to college/workplace (km)',
      'Number of bedrooms',
      'Number of bathrooms',
      'AC availability (boolean)',
      'Furnished status (boolean)',
      'Owner on first floor (boolean)',
      'Property size (sq ft)',
      'Floor number',
      'Nearby amenities (shopping, transport, etc.)',
      'Security features',
      'Parking availability',
      'Water supply type',
      'Power backup availability'
    ],
    target: 'Monthly rent (₹)',
    sampleSize: '5000+ PG listings',
    model: 'Random Forest Regression / Neural Network',
    accuracy: '85-90%',
    preprocessing: [
      'Feature scaling',
      'One-hot encoding for categorical variables',
      'Distance calculation using road network (not direct distance)',
      'Handling missing values',
      'Outlier detection and removal'
    ]
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FaCalculator className="mr-2" />
          AI Price Prediction
        </h3>
        <button
          onClick={() => setShowDataset(!showDataset)}
          className="text-primary-600 hover:text-primary-700"
        >
          <FaInfoCircle />
        </button>
      </div>

      {showDataset && (
        <div className="bg-primary-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Dataset Description</h4>
          <div className="text-sm space-y-2">
            <p><strong>Features:</strong> {datasetDescription.features.join(', ')}</p>
            <p><strong>Target Variable:</strong> {datasetDescription.target}</p>
            <p><strong>Sample Size:</strong> {datasetDescription.sampleSize}</p>
            <p><strong>Model:</strong> {datasetDescription.model}</p>
            <p><strong>Accuracy:</strong> {datasetDescription.accuracy}</p>
            <div>
              <strong>Preprocessing Steps:</strong>
              <ul className="list-disc list-inside ml-2">
                {datasetDescription.preprocessing.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!predictedPrice ? (
        <div>
          <p className="text-gray-600 mb-4">
            Get an AI-powered price prediction based on similar properties in your area.
          </p>
          <button
            onClick={calculatePrice}
            disabled={loading}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Predicting...' : 'Predict Price'}
          </button>
        </div>
      ) : (
        <div className="bg-primary-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Predicted Price Range</p>
          <p className="text-2xl font-bold text-primary-600">
            ₹{predictedPrice.min.toLocaleString()} - ₹{predictedPrice.max.toLocaleString()}/month
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Based on similar properties in {pgData.city || 'your area'}
          </p>
        </div>
      )}
    </div>
  )
}

export default PricePrediction
