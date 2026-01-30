import { useState, useEffect } from 'react'
import { FaTimes, FaRupeeSign, FaCreditCard } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../utils/constants'

const PaymentModal = ({ isOpen, onClose, paymentType, entityId, amount, entityName, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [bookingStartDate, setBookingStartDate] = useState('')
  const [bookingEndDate, setBookingEndDate] = useState('')
  const [months, setMonths] = useState(1)

  useEffect(() => {
    if (months > 0 && bookingStartDate) {
      const start = new Date(bookingStartDate)
      const end = new Date(start)
      end.setMonth(end.getMonth() + months)
      setBookingEndDate(end.toISOString().split('T')[0])
    }
  }, [months, bookingStartDate])

  const handleDummyPayment = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to continue')
        onClose()
        return
      }

      const requestData = {
        paymentType,
        entityId,
        amount,
        currency: 'INR',
        notes: `Payment for ${entityName}`,
        dummy: true // Flag to indicate dummy payment
      }

      if (paymentType === 'PG_BOOKING' || paymentType === 'HOSTEL_BOOKING') {
        if (!bookingStartDate) {
          toast.error('Please select booking start date')
          setLoading(false)
          return
        }
        requestData.bookingStartDate = new Date(bookingStartDate).toISOString()
        if (bookingEndDate) {
          requestData.bookingEndDate = new Date(bookingEndDate).toISOString()
        }
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please login again')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          setLoading(false)
          return
        }
        const errorText = await response.text()
        let errorMessage = 'Failed to process payment'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        toast.error(errorMessage)
        setLoading(false)
        return
      }

      const result = await response.json()

      if (result.success) {
        toast.success('Payment successful! (Demo Mode)')
        onSuccess && onSuccess(result.payment)
        onClose()
      } else {
        toast.error(result.message || 'Failed to process payment')
      }
    } catch (error) {
      toast.error('Failed to process payment: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Item</p>
            <p className="font-semibold text-gray-900">{entityName}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Amount</p>
            <p className="text-2xl font-bold text-primary-600 flex items-center">
              <FaRupeeSign className="mr-1" />
              {amount.toLocaleString('en-IN')}
            </p>
          </div>

          {(paymentType === 'PG_BOOKING' || paymentType === 'HOSTEL_BOOKING') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Start Date
                </label>
                <input
                  type="date"
                  value={bookingStartDate}
                  onChange={(e) => setBookingStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
                  min={1}
                  max={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {bookingEndDate && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Booking End Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(bookingEndDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleDummyPayment}
            disabled={loading || (paymentType !== 'ITEM_PURCHASE' && !bookingStartDate)}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaCreditCard />
                <span>Complete Payment ₹{amount.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Demo Mode - Payment simulation (No real transaction)
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
