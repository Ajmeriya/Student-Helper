import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const EditHostel = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // TODO: Replace with actual API call to fetch hostel data
    const mockHostel = {
      id: id,
      name: 'Comfort Hostel',
      location: 'Nadiad',
      gender: 'boys',
      price: 8000,
      totalRooms: 20,
      roomsAvailable: 5
    }

    Object.keys(mockHostel).forEach(key => {
      if (key !== 'id') {
        setValue(key, mockHostel[key])
      }
    })
    setLoading(false)
  }, [id, setValue])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('Updated Hostel Data:', data)
      toast.success('Hostel updated successfully!')
      navigate('/hostel-admin/my-hostels')
    } catch (error) {
      toast.error('Failed to update hostel')
    } finally {
      setSubmitting(false)
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Hostel</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Similar form fields as AddHostel */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hostel Name *
                </label>
                <input
                  {...register('name', { required: 'Hostel name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              {/* Add more fields */}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Hostel'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/hostel-admin/my-hostels')}
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

export default EditHostel

