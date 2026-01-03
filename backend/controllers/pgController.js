/**
 * STEP 4: PG Controller
 * 
 * Handles all PG-related operations:
 * - Get all PGs (with filters)
 * - Get single PG by ID
 * - Create new PG (requires authentication)
 * - Update PG (requires authentication + ownership)
 * - Delete PG (requires authentication + ownership)
 * - Get broker's PGs
 * - Update PG status (mark as sold/on rent)
 */

import PG from '../models/PG.js'
import { uploadImages, uploadVideos } from '../middleware/upload.js'
import cloudinary from '../config/cloudinary.js'

// Verify Cloudinary config at import time
if (!cloudinary.config().api_key) {
  console.error('⚠️  Warning: Cloudinary not configured. Image uploads will fail.')
}
/**
 * Get all PGs with optional filters
 * 
 * Query Parameters (optional):
 * - city: Filter by city
 * - minPrice: Minimum price
 * - maxPrice: Maximum price
 * - sharingType: single, double, triple, quad
 * - ac: true/false
 * - furnished: true/false
 * - search: Search in title or location
 * 
 * Example: GET /api/pg?city=Nadiad&minPrice=4000&ac=true
 */
export const getAllPGs = async (req, res) => {
  try {
    // Get query parameters from URL
    const {
      city,
      minPrice,
      maxPrice,
      sharingType,
      ac,
      furnished,
      ownerOnFirstFloor,
      foodAvailable,
      parking,
      minDistance,
      maxDistance,
      search
    } = req.query

    // Build filter object (start with active PGs only)
    // Show available and onRent PGs to students, but hide sold ones
    const filter = { 
      isActive: true,
      status: { $in: ['available', 'onRent'] } // Only show available and onRent PGs to students
    }

    // City filter (required for students)
    if (city) {
      filter.city = city
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice) // Greater than or equal
      if (maxPrice) filter.price.$lte = Number(maxPrice) // Less than or equal
    }

    // Sharing type filter
    if (sharingType) {
      filter.sharingType = sharingType
    }

    // Boolean filters (only add if true)
    if (ac === 'true') filter.ac = true
    if (furnished === 'true') filter.furnished = true
    if (ownerOnFirstFloor === 'true') filter.ownerOnFirstFloor = true
    if (foodAvailable === 'true') filter.foodAvailable = true
    if (parking === 'true') filter.parking = true

    // Distance filter
    if (minDistance || maxDistance) {
      filter.distanceToCollege = {}
      if (minDistance) filter.distanceToCollege.$gte = Number(minDistance)
      if (maxDistance) filter.distanceToCollege.$lte = Number(maxDistance)
    }

    // Search filter (search in title or location)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
        { location: { $regex: search, $options: 'i' } }
      ]
    }

    // Find PGs matching the filter
    // sort by newest first (createdAt: -1 means descending)
    const pgs = await PG.find(filter).sort({ createdAt: -1 })

    // Send response
    res.json({
      success: true,
      count: pgs.length,
      pgs
    })
  } catch (error) {
    console.error('Error fetching PGs:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching PGs',
      error: error.message
    })
  }
}

/**
 * Get single PG by ID
 * 
 * Endpoint: GET /api/pg/:id
 * Example: GET /api/pg/65a1b2c3d4e5f6g7h8i9j0k1
 */
export const getPGById = async (req, res) => {
  try {
    const { id } = req.params

    // Validate MongoDB ObjectId format (24 hex characters)
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PG ID format'
      })
    }

    const pg = await PG.findById(id)
      .populate('broker', 'name email phoneNumber') // Include broker info

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      })
    }

    res.json({
      success: true,
      pg
    })
  } catch (error) {
    console.error('Error fetching PG:', error)
    
    // Handle cast errors specifically
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid PG ID format',
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching PG',
      error: error.message
    })
  }
}

/**
 * Create new PG
 * 
 * Endpoint: POST /api/pg
 * Requires: Authentication + Broker role
 * Body: All PG fields (see model) + images/videos files
 * 
 * Note: Only brokers can create PGs (enforced by requireRole middleware)
 */
export const createPG = async (req, res) => {
  try {
    // req.userId comes from auth middleware
    // req.user comes from auth middleware (includes role)
    // requireRole('broker') middleware ensures only brokers reach here
    
    console.log('📦 Request files:', req.files ? Object.keys(req.files) : 'No files')
    console.log('📦 Request body keys:', Object.keys(req.body))
    
    let imageUrls = []
    let videoUrls = []

    // Check file structure - multer.fields() creates { images: [...], videos: [...] }
    const imageFiles = req.files?.images || []
    const videoFiles = req.files?.videos || []

    console.log(`📸 Found ${imageFiles.length} image(s)`)
    console.log(`🎥 Found ${videoFiles.length} video(s)`)

    // Upload images if provided
    if (imageFiles.length > 0) {
      try {
        console.log('📸 Processing images:', imageFiles.length)
        if (imageFiles[0]) {
          console.log('First image file structure:', {
            fieldname: imageFiles[0].fieldname,
            originalname: imageFiles[0].originalname,
            mimetype: imageFiles[0].mimetype,
            size: imageFiles[0].size,
            hasBuffer: !!imageFiles[0].buffer,
            bufferLength: imageFiles[0].buffer ? imageFiles[0].buffer.length : 0
          })
        }
        
        imageUrls = await uploadImages(imageFiles)
        console.log(`✅ Uploaded ${imageUrls.length} images to Cloudinary`)
      } catch (error) {
        console.error('❌ Error uploading images:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images',
          error: error.message || 'Unknown error'
        })
      }
    }

    // Upload videos if provided
    if (videoFiles.length > 0) {
      try {
        console.log('🎥 Processing videos:', videoFiles.length)
        videoUrls = await uploadVideos(videoFiles)
        console.log(`✅ Uploaded ${videoUrls.length} videos to Cloudinary`)
      } catch (error) {
        console.error('❌ Error uploading videos:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        return res.status(500).json({
          success: false,
          message: 'Failed to upload videos',
          error: error.message || 'Unknown error'
        })
      }
    }

    // Create PG with broker set to current user
    const pgData = {
      ...req.body,
      broker: req.userId, // Set broker to authenticated user (who is a broker)
      images: imageUrls,
      videos: videoUrls,
      status: 'available', // Default status
      // Parse dates if provided as strings
      availabilityDate: req.body.availabilityDate ? new Date(req.body.availabilityDate) : new Date()
    }

    const pg = await PG.create(pgData)

    // Populate broker info in response
    await pg.populate('broker', 'name email phoneNumber')

    res.status(201).json({
      success: true,
      message: 'PG created successfully',
      pg
    })
  } catch (error) {
    console.error('Error creating PG:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating PG',
      error: error.message
    })
  }
}

/**
 * Update PG
 * 
 * Endpoint: PUT /api/pg/:id
 * Requires: Authentication + Must be the owner
 */
export const updatePG = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id)

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      })
    }

    // Check if user is the owner
    if (pg.broker.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this PG'
      })
    }

    // Handle image uploads if new images provided
    let imageUrls = pg.images || []
    if (req.files?.images && req.files.images.length > 0) {
      try {
        const newImageUrls = await uploadImages(req.files.images)
        imageUrls = [...imageUrls, ...newImageUrls] // Append new images
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images',
          error: error.message
        })
      }
    }

    // Handle video uploads if new videos provided
    let videoUrls = pg.videos || []
    if (req.files?.videos && req.files.videos.length > 0) {
      try {
        const newVideoUrls = await uploadVideos(req.files.videos)
        videoUrls = [...videoUrls, ...newVideoUrls] // Append new videos
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload videos',
          error: error.message
        })
      }
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      images: imageUrls,
      videos: videoUrls
    }

    // Handle date parsing
    if (req.body.availabilityDate) {
      updateData.availabilityDate = new Date(req.body.availabilityDate)
    }
    if (req.body.soldDate) {
      updateData.soldDate = new Date(req.body.soldDate)
    }
    if (req.body.rentalStartDate) {
      updateData.rentalStartDate = new Date(req.body.rentalStartDate)
      // Calculate rental end date if rental period is provided
      if (req.body.rentalPeriod) {
        const startDate = new Date(req.body.rentalStartDate)
        updateData.rentalEndDate = new Date(startDate.setMonth(startDate.getMonth() + parseInt(req.body.rentalPeriod)))
      }
    }

    // Update PG
    const updatedPG = await PG.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // new: true returns updated document
    ).populate('broker', 'name email phoneNumber')

    res.json({
      success: true,
      message: 'PG updated successfully',
      pg: updatedPG
    })
  } catch (error) {
    console.error('Error updating PG:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating PG',
      error: error.message
    })
  }
}

/**
 * Update PG Status
 * 
 * Endpoint: PATCH /api/pg/:id/status
 * Requires: Authentication + Must be the owner
 * Body: { status: 'available' | 'sold' | 'onRent', rentalPeriod?: number, soldDate?: date, rentalStartDate?: date }
 */
export const updatePGStatus = async (req, res) => {
  try {
    const { status, rentalPeriod, soldDate, rentalStartDate } = req.body

    const pg = await PG.findById(req.params.id)

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      })
    }

    // Check if user is the owner
    if (pg.broker.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this PG'
      })
    }

    // Validate status
    if (!['available', 'sold', 'onRent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: available, sold, or onRent'
      })
    }

    // Prepare update data
    const updateData = { status }

    // Handle sold status
    if (status === 'sold') {
      updateData.soldDate = soldDate ? new Date(soldDate) : new Date()
      updateData.rentalStartDate = null
      updateData.rentalEndDate = null
      updateData.rentalPeriod = null
    }

    // Handle onRent status
    if (status === 'onRent') {
      if (!rentalPeriod) {
        return res.status(400).json({
          success: false,
          message: 'Rental period (in months) is required for onRent status'
        })
      }
      updateData.rentalPeriod = parseInt(rentalPeriod)
      updateData.rentalStartDate = rentalStartDate ? new Date(rentalStartDate) : new Date()
      
      // Calculate rental end date
      const startDate = updateData.rentalStartDate
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + updateData.rentalPeriod)
      updateData.rentalEndDate = endDate
      
      updateData.soldDate = null
    }

    // Handle available status
    if (status === 'available') {
      updateData.soldDate = null
      updateData.rentalStartDate = null
      updateData.rentalEndDate = null
      updateData.rentalPeriod = null
    }

    // Update PG
    const updatedPG = await PG.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('broker', 'name email phoneNumber')

    res.json({
      success: true,
      message: `PG marked as ${status}`,
      pg: updatedPG
    })
  } catch (error) {
    console.error('Error updating PG status:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating PG status',
      error: error.message
    })
  }
}

/**
 * Delete PG (soft delete - sets isActive to false)
 * 
 * Endpoint: DELETE /api/pg/:id
 * Requires: Authentication + Must be the owner
 */
export const deletePG = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id)

    if (!pg) {
      return res.status(404).json({
        success: false,
        message: 'PG not found'
      })
    }

    // Check if user is the owner
    if (pg.broker.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this PG'
      })
    }

    // Soft delete (set isActive to false instead of actually deleting)
    pg.isActive = false
    await pg.save()

    res.json({
      success: true,
      message: 'PG deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting PG:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting PG',
      error: error.message
    })
  }
}

/**
 * Get broker's PGs
 * 
 * Endpoint: GET /api/pg/my-pgs
 * Requires: Authentication (broker role)
 */
export const getMyPGs = async (req, res) => {
  try {
    // Get all PGs created by current user
    const pgs = await PG.find({ broker: req.userId })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: pgs.length,
      pgs
    })
  } catch (error) {
    console.error('Error fetching my PGs:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching your PGs',
      error: error.message
    })
  }
}

