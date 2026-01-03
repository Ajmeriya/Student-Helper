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
 */

import PG from '../models/PG.js'
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
    const filter = { isActive: true }

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
    const pg = await PG.findById(req.params.id)
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
 * Body: All PG fields (see model)
 * 
 * Note: Only brokers can create PGs (enforced by requireRole middleware)
 */
export const createPG = async (req, res) => {
  try {
    // req.userId comes from auth middleware
    // req.user comes from auth middleware (includes role)
    // requireRole('broker') middleware ensures only brokers reach here
    
    // Create PG with broker set to current user
    const pg = await PG.create({
      ...req.body,
      broker: req.userId // Set broker to authenticated user (who is a broker)
    })

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

    // Update PG
    const updatedPG = await PG.findByIdAndUpdate(
      req.params.id,
      req.body,
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

