const PG = require('../models/PG');
const User = require('../models/User');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const axios = require('axios');

// DDU (Dharamsinh Desai University) coordinates in Nadiad, Gujarat
const DDU_COORDINATES = {
  latitude: 22.6953,
  longitude: 72.8493
};

// @desc    Get all PGs (optionally filter by propertyType: Hostel | PG)
// @route   GET /api/v1/pgs
// @access  Public
  exports.getPGs = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = PG.find(JSON.parse(queryStr)).lean().populate({
      path: 'ownerId',
      select: 'name phone email location rating totalRatings'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-datePosted');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await PG.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const pgs = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: pgs.length,
      pagination,
      data: pgs
    });
  });

// @desc    Get single PG
// @route   GET /api/v1/pgs/:id
// @access  Public
exports.getPG = asyncHandler(async (req, res, next) => {
const pg = await PG.findById(req.params.id).lean().populate({
    path: 'ownerId',
    select: 'name phone email location rating totalRatings profileImage'
  });

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  // Check if user has liked this PG
  let isLiked = false;
  if (req.user && pg.likes) {
    isLiked = pg.likes.some(like => like.userId.toString() === req.user.id);
  }

const pgWithLikeStatus = {
    ...pg,
    isLiked
  };

  res.status(200).json({
    success: true,
    data: pgWithLikeStatus
  });
});

// @desc    Create new PG
// @route   POST /api/v1/pgs
// @access  Private (Broker only)
exports.createPG = asyncHandler(async (req, res, next) => {
  // Parse JSON fields from FormData
  if (req.body.location && typeof req.body.location === 'string') {
    req.body.location = JSON.parse(req.body.location);
  }
  if (req.body.facilities && typeof req.body.facilities === 'string') {
    req.body.facilities = JSON.parse(req.body.facilities);
  }
  if (req.body.rules && typeof req.body.rules === 'string') {
    req.body.rules = JSON.parse(req.body.rules);
  }
  if (req.body.fees && typeof req.body.fees === 'string') {
    try { req.body.fees = JSON.parse(req.body.fees); } catch {}
  }
  // Normalize boolean/number fields possibly sent as strings
  ['acAvailable','nonAcAvailable','messAvailable'].forEach(f=>{
    if (typeof req.body[f] === 'string') req.body[f] = req.body[f] === 'true';
  });
  ['acRooms','nonAcRooms','totalRooms','availableRooms','floorNumber','roomSize','price','distanceFromCollege'].forEach(f=>{
    if (typeof req.body[f] === 'string' && req.body[f] !== '') req.body[f] = Number(req.body[f]);
  });
  if (req.body.fees) {
    ['securityDeposit','electricityPerUnit','maintenancePerMonth'].forEach(f=>{
      if (typeof req.body.fees[f] === 'string' && req.body.fees[f] !== '') req.body.fees[f] = Number(req.body.fees[f]);
    });
  }
  
  // Add owner info to req.body
  req.body.ownerId = req.user.id;
  req.body.ownerName = req.user.name;
  req.body.ownerContact = req.user.phone;

  // Calculate distance from DDU if coordinates provided
  if (req.body.location && req.body.location.coordinates) {
    const distance = calculateDistance(
      DDU_COORDINATES.latitude,
      DDU_COORDINATES.longitude,
      req.body.location.coordinates.latitude,
      req.body.location.coordinates.longitude
    );
    req.body.distanceFromCollege = parseFloat(distance.toFixed(2));
  }

  // Handle uploaded files
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  if (req.files) {
    if (req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map(file => `${baseUrl}/uploads/hostels/${file.filename}`);
    }
    if (req.files.videos && req.files.videos.length > 0) {
      req.body.videos = req.files.videos.map(file => `${baseUrl}/uploads/videos/${file.filename}`);
    }
  }
  
  // Ensure images array exists
  if (!req.body.images) {
    req.body.images = [];
  }
  if (!req.body.videos) {
    req.body.videos = [];
  }

  // Get AI rent prediction
  try {
    const prediction = await getPredictedRent(req.body);
    req.body.predictedPrice = prediction;
  } catch (error) {
    console.log('AI prediction failed:', error.message);
    // Continue without prediction if AI service fails
  }

  const pg = await PG.create(req.body);

  res.status(201).json({
    success: true,
    data: pg
  });
});

// @desc    Update PG
// @route   PUT /api/v1/pgs/:id
// @access  Private
exports.updatePG = asyncHandler(async (req, res, next) => {
  let pg = await PG.findById(req.params.id);

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is PG owner
  if (pg.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this PG`, 401));
  }

  // Parse/normalize optional JSON and boolean/number strings
  if (req.body.location && typeof req.body.location === 'string') {
    try { req.body.location = JSON.parse(req.body.location); } catch {}
  }
  if (req.body.facilities && typeof req.body.facilities === 'string') {
    try { req.body.facilities = JSON.parse(req.body.facilities); } catch {}
  }
  if (req.body.rules && typeof req.body.rules === 'string') {
    try { req.body.rules = JSON.parse(req.body.rules); } catch {}
  }
  if (req.body.fees && typeof req.body.fees === 'string') {
    try { req.body.fees = JSON.parse(req.body.fees); } catch {}
  }
  ['acAvailable','nonAcAvailable','messAvailable'].forEach(f=>{
    if (typeof req.body[f] === 'string') req.body[f] = req.body[f] === 'true';
  });
  ['acRooms','nonAcRooms','totalRooms','availableRooms','floorNumber','roomSize','price','distanceFromCollege'].forEach(f=>{
    if (typeof req.body[f] === 'string' && req.body[f] !== '') req.body[f] = Number(req.body[f]);
  });
  if (req.body.fees) {
    ['securityDeposit','electricityPerUnit','maintenancePerMonth'].forEach(f=>{
      if (typeof req.body.fees[f] === 'string' && req.body.fees[f] !== '') req.body.fees[f] = Number(req.body.fees[f]);
    });
  }

  // Handle uploaded files
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  if (req.files) {
    if (req.files.images && req.files.images.length > 0) {
      const newImages = req.files.images.map(file => `${baseUrl}/uploads/hostels/${file.filename}`);
      
      // If keeping existing images, merge them
      if (req.body.keepExistingImages === 'true' && pg.images) {
        req.body.images = [...pg.images, ...newImages];
      } else {
        req.body.images = newImages;
      }
    }
    
    if (req.files.videos && req.files.videos.length > 0) {
      const newVideos = req.files.videos.map(file => `${baseUrl}/uploads/videos/${file.filename}`);
      
      // If keeping existing videos, merge them
      if (req.body.keepExistingVideos === 'true' && pg.videos) {
        req.body.videos = [...pg.videos, ...newVideos];
      } else {
        req.body.videos = newVideos;
      }
    }
  }
  
  // Recalculate distance if coordinates changed
  if (req.body.location && req.body.location.coordinates) {
    const distance = calculateDistance(
      DDU_COORDINATES.latitude,
      DDU_COORDINATES.longitude,
      req.body.location.coordinates.latitude,
      req.body.location.coordinates.longitude
    );
    req.body.distanceFromCollege = parseFloat(distance.toFixed(2));
  }

  // Get updated AI prediction
  try {
    const updatedData = { ...pg.toObject(), ...req.body };
    const prediction = await getPredictedRent(updatedData);
    req.body.predictedPrice = prediction;
  } catch (error) {
    console.log('AI prediction failed:', error.message);
  }

  pg = await PG.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: pg
  });
});

// @desc    Delete PG
// @route   DELETE /api/v1/pgs/:id
// @access  Private
exports.deletePG = asyncHandler(async (req, res, next) => {
  const pg = await PG.findById(req.params.id);

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is PG owner
  if (pg.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this PG`, 401));
  }

  await pg.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search PGs near DDU
// @route   GET /api/v1/pgs/search
// @access  Public
exports.searchPGs = asyncHandler(async (req, res, next) => {
  const { 
    q, 
    roomType, 
    minPrice, 
    maxPrice, 
    furnishing, 
    maxDistance,
    facilities,
    gender,
    availableRooms
  } = req.query;
  
  let query = {};

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Room type filter
  if (roomType && roomType !== 'all') {
    query.roomType = roomType;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }

  // Furnishing filter
  if (furnishing && furnishing !== 'all') {
    query.furnishing = furnishing;
  }

  // Distance filter
  if (maxDistance) {
    query.distanceFromCollege = { $lte: parseFloat(maxDistance) };
  }

  // Gender filter
  if (gender && gender !== 'all') {
    query.gender = gender;
  }

  // Facilities filter
  if (facilities) {
    const facilitiesArray = facilities.split(',');
    query.facilities = { $in: facilitiesArray };
  }

  // Available rooms filter
  if (availableRooms === 'true') {
    query.availableRooms = { $gt: 0 };
  }

  // Only show active PGs
  query.active = true;


const pgs = await PG.find(query)
    .lean()
    .populate({
      path: 'ownerId',
      select: 'name location phone email rating'
    })
    .sort('distanceFromCollege')
    .limit(50);

  res.status(200).json({
    success: true,
    count: pgs.length,
    data: pgs
  });
});

// @desc    Get my PGs (for brokers)
// @route   GET /api/v1/pgs/my-pgs
// @access  Private
exports.getMyPGs = asyncHandler(async (req, res, next) => {
  const pgs = await PG.find({ ownerId: req.user.id }).sort('-datePosted');

  res.status(200).json({
    success: true,
    count: pgs.length,
    data: pgs
  });
});

// @desc    Get AI rent prediction
// @route   POST /api/v1/pgs/predict-rent
// @access  Private
exports.predictRent = asyncHandler(async (req, res, next) => {
  try {
    const prediction = await getPredictedRent(req.body);
    
    res.status(200).json({
      success: true,
      data: {
        predictedRent: prediction,
        factors: {
          distanceFromCollege: req.body.distanceFromCollege,
          roomSize: req.body.roomSize,
          facilitiesCount: req.body.facilities ? req.body.facilities.length : 0,
          furnishing: req.body.furnishing,
          roomType: req.body.roomType,
          city: 'Nadiad'
        }
      }
    });
  } catch (error) {
    return next(new ErrorResponse('Rent prediction service unavailable', 503));
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to get AI rent prediction
async function getPredictedRent(pgData) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    const predictionData = {
      distanceFromCollege: pgData.distanceFromCollege || 2.5,
      roomSize: pgData.roomSize || 150,
      facilitiesCount: pgData.facilities ? pgData.facilities.length : 5,
      furnishing: pgData.furnishing || 'Semi Furnished',
      roomType: pgData.roomType || 'Double',
      city: 'Nadiad' // DDU is in Nadiad, Gujarat
    };

    const response = await axios.post(`${aiServiceUrl}/predict-rent`, predictionData, {
      timeout: 5000 // 5 second timeout
    });

    if (response.data && response.data.success) {
      return response.data.predictedRent;
    }
    
    // Fallback calculation if AI service fails
    return calculateFallbackRent(predictionData);
  } catch (error) {
    console.log('AI service error:', error.message);
    // Fallback calculation
    return calculateFallbackRent(pgData);
  }
}

// Fallback rent calculation specific to Nadiad/DDU area
function calculateFallbackRent(data) {
  // Base rent for Nadiad area (DDU vicinity)
  let baseRent = 8000;

  // Distance factor (closer to DDU = higher rent)
  const distanceFromDDU = data.distanceFromCollege || 2.5;
  if (distanceFromDDU <= 1) {
    baseRent += 3000; // Very close to DDU
  } else if (distanceFromDDU <= 2) {
    baseRent += 2000; // Close to DDU
  } else if (distanceFromDDU <= 5) {
    baseRent += 1000; // Moderate distance
  }
  // Beyond 5km, no distance bonus

  // Room size factor
  const roomSize = data.roomSize || 150;
  if (roomSize > 200) {
    baseRent += 1500; // Large room
  } else if (roomSize > 150) {
    baseRent += 1000; // Medium room
  }
  // Small rooms get no bonus

  // Facilities factor
  const facilitiesCount = data.facilitiesCount || 5;
  baseRent += facilitiesCount * 200;

  // Room type factor
  const roomTypeMultipliers = {
    'Single': 1.4,
    'Double': 1.0,
    'Triple': 0.8,
    'Shared': 0.7,
    'Dormitory': 0.6
  };
  baseRent *= roomTypeMultipliers[data.roomType] || 1.0;

  // Furnishing factor
  const furnishingMultipliers = {
    'Fully Furnished': 1.3,
    'Semi Furnished': 1.0,
    'Unfurnished': 0.8
  };
  baseRent *= furnishingMultipliers[data.furnishing] || 1.0;

  // Floor penalty (ground floor is less desirable in India)
  if (data.floorNumber === 0 || data.floorNumber === '0' || data.floorNumber === 'Ground') {
    baseRent *= 0.9; // 10% reduction for ground floor
  }

  return Math.max(3000, Math.round(baseRent)); // Minimum rent of ₹3000
}

// @desc    Toggle like PG
// @route   POST /api/v1/pgs/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const pg = await PG.findById(req.params.id);

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  const likeIndex = pg.likes.findIndex(like => like.userId.toString() === req.user.id);
  let isLiked;

  if (likeIndex > -1) {
    // Unlike
    pg.likes.splice(likeIndex, 1);
    isLiked = false;
  } else {
    // Like
    pg.likes.push({ userId: req.user.id });
    isLiked = true;
  }

  await pg.save();

  res.status(200).json({
    success: true,
    data: {
      likes: pg.likes,
      isLiked
    }
  });
});

// @desc    Track PG view
// @route   POST /api/v1/pgs/:id/view
// @access  Private
exports.trackView = asyncHandler(async (req, res, next) => {
  const pg = await PG.findById(req.params.id);

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  // Don't track views for the PG owner
  if (req.user && pg.ownerId.toString() === req.user.id) {
    return res.status(200).json({ success: true, data: { views: pg.views } });
  }

  // Increment view count
  await PG.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  
  res.status(200).json({
    success: true,
    data: { views: pg.views + 1 }
  });
});

// @desc    Add review to PG
// @route   POST /api/v1/pgs/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  
  const pg = await PG.findById(req.params.id);

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  // Check if user is trying to review their own PG
  if (pg.ownerId.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot review your own property', 400));
  }

  // Check if user already reviewed this PG
  const existingReview = await Review.findOne({
    hostelId: req.params.id,
    reviewerId: req.user.id
  });

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this property', 400));
  }

  const review = await Review.create({
    rating,
    text: comment,
    title: `Review for ${pg.name}`,
    reviewType: 'pg',
    hostelId: req.params.id,
    reviewerId: req.user.id,
    reviewerName: req.user.name
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews for PG
// @route   GET /api/v1/pgs/:id/reviews
// @access  Public
exports.getPGReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ hostelId: req.params.id })
    .populate({
      path: 'reviewerId',
      select: 'name'
    })
    .sort('-createdAt');

  // Transform reviews to match frontend expectations
  const transformedReviews = reviews.map(review => ({
    _id: review._id,
    rating: review.rating,
    comment: review.text,
    createdAt: review.createdAt,
    userId: {
      _id: review.reviewerId._id,
      name: review.reviewerId.name
    }
  }));

  res.status(200).json({
    success: true,
    count: transformedReviews.length,
    data: transformedReviews
  });
});

// @desc    AI recommendations for PGs
// @route   GET /api/v1/pgs/ai/recommendations
// @access  Public
exports.getRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const docs = await PG.find({ active: true }).lean().limit(200);
  const scored = docs.map(h => {
    const price = Number(h.price) || 0;
    const predicted = Number(h.predictedPrice) || price;
    const distance = Number(h.distanceFromCollege) || 5;
    const availability = Math.max(0, Math.min(1, (Number(h.availableRooms)||0) / (Number(h.totalRooms)||1))); // 0..1
    const rating = Math.max(0, Math.min(1, (Number(h.rating)||0) / 5));
    // Value score: higher when price below prediction, closer distance, more availability, better ratings
    const deal = Math.max(-1, Math.min(1, (predicted - price) / Math.max(1000, predicted)));
    const proximity = Math.max(0, (5 - distance) / 5); // up to 5km preference
    const score = 0.45*deal + 0.25*proximity + 0.2*availability + 0.1*rating;
    return { score, doc: h };
  })
  .sort((a,b)=> b.score - a.score)
  .slice(0, limit)
  .map(x => ({ ...x.doc, aiScore: Number(x.score.toFixed(3)) }));

  res.status(200).json({ success: true, count: scored.length, data: scored });
});

// @desc    Admin: Mark PG as sold out
// @route   PUT /api/v1/pgs/:id/sold-out
// @access  Private (Admin only)
exports.markAsSoldOut = asyncHandler(async (req, res, next) => {
  const { duration, reason } = req.body;
  
  const pg = await PG.findById(req.params.id);

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  // Only admin can mark as sold out
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admin can mark properties as sold out', 403));
  }

  // Parse duration (e.g., "6 months", "1 year")
  let durationData = null;
  if (duration) {
    const durationParts = duration.split(' ');
    if (durationParts.length === 2) {
      durationData = {
        amount: parseInt(durationParts[0]),
        unit: durationParts[1].toLowerCase().replace(/s$/, '') + 's' // normalize to plural
      };
    }
  }

  const updateData = {
    soldOut: !pg.soldOut,
    soldOutDate: pg.soldOut ? null : new Date(),
    soldOutReason: pg.soldOut ? null : reason,
    soldOutDuration: pg.soldOut ? null : durationData,
    availableRooms: pg.soldOut ? pg.totalRooms : 0
  };

  const updatedPG = await PG.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedPG,
    message: updatedPG.soldOut 
      ? `Property marked as sold out${duration ? ` for ${duration}` : ''}` 
      : 'Property marked as available'
  });
});


// @desc    Admin: Remove PG
// @route   DELETE /api/v1/pgs/:id/admin-remove
// @access  Private (Admin only)
exports.adminRemovePG = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  
  const pg = await PG.findById(req.params.id);

  if (!pg) {
    return next(new ErrorResponse(`PG not found with id of ${req.params.id}`, 404));
  }

  // Only admin can remove PGs
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admin can remove properties', 403));
  }

  // Soft delete by marking as inactive
  const updatedPG = await PG.findByIdAndUpdate(
    req.params.id,
    { 
      active: false,
      soldOut: true,
      soldOutReason: reason || 'Removed by admin',
      soldOutDate: new Date()
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedPG,
    message: 'Property has been removed by admin'
  });
});
