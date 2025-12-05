const Hostel = require('../models/Hostel');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const axios = require('axios');

const DDU_COORDINATES = { latitude: 22.6953, longitude: 72.8493 };

// List Hostels
exports.getHostels = asyncHandler(async (req, res) => {
  const reqQuery = { ...req.query };
  ['select','sort','page','limit'].forEach(p=> delete reqQuery[p]);
let query = Hostel.find(JSON.parse(JSON.stringify(reqQuery))).lean().populate({ path: 'ownerId', select: 'name phone email location rating totalRatings' });
  if (req.query.select) query = query.select(req.query.select.split(',').join(' '));
  if (req.query.sort) query = query.sort(req.query.sort.split(',').join(' ')); else query = query.sort('-datePosted');
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const total = await Hostel.countDocuments();
  const hostels = await query.skip(startIndex).limit(limit);
  const pagination = {};
  if (page * limit < total) pagination.next = { page: page + 1, limit };
  if (startIndex > 0) pagination.prev = { page: page - 1, limit };
  res.status(200).json({ success: true, count: hostels.length, pagination, data: hostels });
});

// Get single Hostel
exports.getHostel = asyncHandler(async (req, res, next) => {
const hostel = await Hostel.findById(req.params.id).lean().populate({ path: 'ownerId', select: 'name phone email location rating totalRatings profileImage' });
  if (!hostel) return next(new ErrorResponse(`Hostel not found with id of ${req.params.id}`, 404));
  let isLiked = false;
  if (req.user && hostel.likes) isLiked = hostel.likes.some(l => l.userId.toString() === req.user.id);
res.status(200).json({ success: true, data: { ...hostel, isLiked } });
});

// Create Hostel (Only hostel_admin and admin)
// Authorization is handled by route middleware
exports.createHostel = asyncHandler(async (req, res) => {
  // Parse JSON fields from FormData
  if (req.body.location && typeof req.body.location === 'string') req.body.location = JSON.parse(req.body.location);
  if (req.body.facilities && typeof req.body.facilities === 'string') req.body.facilities = JSON.parse(req.body.facilities);
  if (req.body.rules && typeof req.body.rules === 'string') req.body.rules = JSON.parse(req.body.rules);
  if (req.body.regulations && typeof req.body.regulations === 'string') req.body.regulations = JSON.parse(req.body.regulations);
  if (req.body.mess && typeof req.body.mess === 'string') req.body.mess = JSON.parse(req.body.mess);
  if (req.body.fees && typeof req.body.fees === 'string') req.body.fees = JSON.parse(req.body.fees);
  if (req.body.rooms && typeof req.body.rooms === 'string') req.body.rooms = JSON.parse(req.body.rooms);
  
  // Set owner info
  req.body.ownerId = req.user.id;
  req.body.ownerName = req.user.name;
  req.body.ownerContact = req.user.phone;
  
  // Ensure both 'name' and 'hostelName' are set (model requires 'name')
  if (req.body.hostelName && !req.body.name) {
    req.body.name = req.body.hostelName;
  }
  if (req.body.name && !req.body.hostelName) {
    req.body.hostelName = req.body.name;
  }
  
  // Calculate distance from college
  if (req.body.location && req.body.location.coordinates) {
    const d = calculateDistance(DDU_COORDINATES.latitude, DDU_COORDINATES.longitude, req.body.location.coordinates.latitude, req.body.location.coordinates.longitude);
    req.body.distanceFromCollege = parseFloat(d.toFixed(2));
  }
  
  // Handle uploaded files
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  if (req.files) {
    if (req.files.images && req.files.images.length > 0) req.body.images = req.files.images.map(f => `${baseUrl}/uploads/hostels/${f.filename}`);
    if (req.files.videos && req.files.videos.length > 0) req.body.videos = req.files.videos.map(f => `${baseUrl}/uploads/videos/${f.filename}`);
  }
  if (!req.body.images) req.body.images = [];
  if (!req.body.videos) req.body.videos = [];
  
  // Calculate totalBeds if rooms array is provided
  if (req.body.rooms && Array.isArray(req.body.rooms) && req.body.rooms.length > 0) {
    req.body.totalBeds = req.body.rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    req.body.occupiedBeds = req.body.rooms.reduce((sum, room) => sum + (room.occupied || 0), 0);
    req.body.availableBeds = req.body.totalBeds - req.body.occupiedBeds;
  }
  
  try { req.body.predictedPrice = await getPredictedRent(req.body); } catch {}
  const hostel = await Hostel.create(req.body);
  res.status(201).json({ success: true, data: hostel });
});

// Update Hostel (Only hostel_admin and admin)
exports.updateHostel = asyncHandler(async (req, res, next) => {
  let hostel = await Hostel.findById(req.params.id);
  if (!hostel) return next(new ErrorResponse(`Hostel not found with id of ${req.params.id}`, 404));
  
  // Check authorization - only hostel_admin or admin can update
  if (req.user.role !== 'hostel_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only Hostel Administrators can update hostels', 403));
  }
  if (hostel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this hostel', 401));
  }
  
  // Parse JSON fields
  if (req.body.location && typeof req.body.location === 'string') {
    try { req.body.location = JSON.parse(req.body.location); } catch {}
  }
  if (req.body.regulations && typeof req.body.regulations === 'string') {
    try { req.body.regulations = JSON.parse(req.body.regulations); } catch {}
  }
  if (req.body.mess && typeof req.body.mess === 'string') {
    try { req.body.mess = JSON.parse(req.body.mess); } catch {}
  }
  if (req.body.rooms && typeof req.body.rooms === 'string') {
    try { req.body.rooms = JSON.parse(req.body.rooms); } catch {}
  }
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  if (req.files) {
    if (req.files.images && req.files.images.length > 0) {
      const newImages = req.files.images.map(f => `${baseUrl}/uploads/hostels/${f.filename}`);
      req.body.images = (req.body.keepExistingImages === 'true' && hostel.images) ? [...hostel.images, ...newImages] : newImages;
    }
    if (req.files.videos && req.files.videos.length > 0) {
      const newVideos = req.files.videos.map(f => `${baseUrl}/uploads/videos/${f.filename}`);
      req.body.videos = (req.body.keepExistingVideos === 'true' && hostel.videos) ? [...hostel.videos, ...newVideos] : newVideos;
    }
  }
  if (req.body.location && req.body.location.coordinates) {
    const d = calculateDistance(DDU_COORDINATES.latitude, DDU_COORDINATES.longitude, req.body.location.coordinates.latitude, req.body.location.coordinates.longitude);
    req.body.distanceFromCollege = parseFloat(d.toFixed(2));
  }
  
  // Recalculate beds if rooms updated
  if (req.body.rooms && Array.isArray(req.body.rooms) && req.body.rooms.length > 0) {
    req.body.totalBeds = req.body.rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
    req.body.occupiedBeds = req.body.rooms.reduce((sum, room) => sum + (room.occupied || 0), 0);
    req.body.availableBeds = req.body.totalBeds - req.body.occupiedBeds;
  }
  
  try { const merged = { ...hostel.toObject(), ...req.body }; req.body.predictedPrice = await getPredictedRent(merged); } catch {}
  hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: hostel });
});

// Delete Hostel (Only hostel_admin and admin)
exports.deleteHostel = asyncHandler(async (req, res, next) => {
  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) return next(new ErrorResponse(`Hostel not found with id of ${req.params.id}`, 404));
  
  if (req.user.role !== 'hostel_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only Hostel Administrators can delete hostels', 403));
  }
  if (hostel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }
  await hostel.deleteOne();
  res.status(200).json({ success: true, data: {} });
});

// Search Hostels
exports.searchHostels = asyncHandler(async (req, res) => {
  const { q, roomType, minPrice, maxPrice, furnishing, maxDistance, facilities, gender, availableRooms } = req.query;
  const query = { active: true };
  if (q) query.$text = { $search: q };
  if (roomType && roomType !== 'all') query.roomType = roomType;
  if (minPrice || maxPrice) { query.price = {}; if (minPrice) query.price.$gte = parseInt(minPrice); if (maxPrice) query.price.$lte = parseInt(maxPrice); }
  if (furnishing && furnishing !== 'all') query.furnishing = furnishing;
  if (maxDistance) query.distanceFromCollege = { $lte: parseFloat(maxDistance) };
  if (gender && gender !== 'all') query.gender = gender;
  if (facilities) query.facilities = { $in: facilities.split(',') };
  if (availableRooms === 'true') query.availableRooms = { $gt: 0 };
const hostels = await Hostel.find(query).lean().populate({ path: 'ownerId', select: 'name location phone email rating' }).sort('distanceFromCollege').limit(50);
  res.status(200).json({ success: true, count: hostels.length, data: hostels });
});

// My Hostels (Only hostel_admin and admin)
exports.getMyHostels = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'hostel_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only Hostel Administrators can view their hostels', 403));
  }
  const hostels = await Hostel.find({ ownerId: req.user.id }).sort('-datePosted');
  res.status(200).json({ success: true, count: hostels.length, data: hostels });
});

// Shared helpers and endpoints
exports.predictRent = asyncHandler(async (req, res, next) => {
  try {
    const prediction = await getPredictedRent(req.body);
    res.status(200).json({ success: true, data: { predictedRent: prediction, factors: { distanceFromCollege: req.body.distanceFromCollege, roomSize: req.body.roomSize, facilitiesCount: req.body.facilities ? req.body.facilities.length : 0, furnishing: req.body.furnishing, roomType: req.body.roomType, city: 'Nadiad' } } });
  } catch (e) { return next(new ErrorResponse('Rent prediction service unavailable', 503)); }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; const dLat = (lat2 - lat1) * (Math.PI/180); const dLon = (lon2 - lon1) * (Math.PI/180);
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function getPredictedRent(data) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const predictionData = { distanceFromCollege: data.distanceFromCollege || 2.5, roomSize: data.roomSize || 150, facilitiesCount: data.facilities ? data.facilities.length : 5, furnishing: data.furnishing || 'Semi Furnished', roomType: data.roomType || 'Double', city: 'Nadiad' };
    const response = await axios.post(`${aiServiceUrl}/predict-rent`, predictionData, { timeout: 5000 });
    if (response.data && response.data.success) return response.data.predictedRent;
    return calculateFallbackRent(predictionData);
  } catch (e) { return calculateFallbackRent(data); }
}

function calculateFallbackRent(data) {
  let base = 8000; const d = data.distanceFromCollege || 2.5; if (d<=1) base+=3000; else if (d<=2) base+=2000; else if (d<=5) base+=1000;
  const size = data.roomSize || 150; if (size>200) base+=1500; else if (size>150) base+=1000;
  const fc = data.facilitiesCount || 5; base += fc*200;
  const rtMul = { Single:1.4, Double:1.0, Triple:0.8, Shared:0.7, Dormitory:0.6 }[data.roomType] || 1.0; base *= rtMul;
  const furMul = { 'Fully Furnished':1.3, 'Semi Furnished':1.0, 'Unfurnished':0.8 }[data.furnishing] || 1.0; base *= furMul;
  if (data.floorNumber === 0 || data.floorNumber === '0' || data.floorNumber === 'Ground') base *= 0.9;
  return Math.max(3000, Math.round(base));
}

exports.toggleLike = asyncHandler(async (req, res, next) => {
  const hostel = await Hostel.findById(req.params.id); if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  const idx = hostel.likes.findIndex(l => l.userId.toString() === req.user.id); let isLiked;
  if (idx > -1) { hostel.likes.splice(idx, 1); isLiked = false; } else { hostel.likes.push({ userId: req.user.id }); isLiked = true; }
  await hostel.save();
  res.status(200).json({ success: true, data: { likes: hostel.likes, isLiked } });
});

exports.trackView = asyncHandler(async (req, res, next) => {
  const hostel = await Hostel.findById(req.params.id); if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  if (req.user && hostel.ownerId.toString() === req.user.id) return res.status(200).json({ success: true, data: { views: hostel.views } });
  await Hostel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.status(200).json({ success: true, data: { views: (hostel.views || 0) + 1 } });
});

exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body; const hostel = await Hostel.findById(req.params.id);
  if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  if (hostel.ownerId.toString() === req.user.id) return next(new ErrorResponse('Cannot review your own property', 400));
  const existing = await Review.findOne({ hostelId: req.params.id, reviewerId: req.user.id });
  if (existing) return next(new ErrorResponse('You have already reviewed this property', 400));
  const review = await Review.create({ rating, text: comment, title: `Review for ${hostel.name}`, reviewType: 'hostel', hostelId: req.params.id, reviewerId: req.user.id, reviewerName: req.user.name });
  res.status(201).json({ success: true, data: review });
});

exports.getHostelReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ hostelId: req.params.id }).populate({ path: 'reviewerId', select: 'name' }).sort('-createdAt');
  const transformed = reviews.map(r => ({ _id: r._id, rating: r.rating, comment: r.text, createdAt: r.createdAt, userId: { _id: r.reviewerId._id, name: r.reviewerId.name } }));
  res.status(200).json({ success: true, count: transformed.length, data: transformed });
});

exports.markAsSoldOut = asyncHandler(async (req, res, next) => {
  const { duration, reason } = req.body; const hostel = await Hostel.findById(req.params.id); if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  if (req.user.role !== 'admin') return next(new ErrorResponse('Only admin can mark as sold out', 403));
  let durationData = null; if (duration) { const parts = duration.split(' '); if (parts.length===2) durationData = { amount: parseInt(parts[0]), unit: parts[1].toLowerCase().replace(/s$/, '')+'s' }; }
  const updated = await Hostel.findByIdAndUpdate(req.params.id, { soldOut: !hostel.soldOut, soldOutDate: hostel.soldOut ? null : new Date(), soldOutReason: hostel.soldOut ? null : reason, soldOutDuration: hostel.soldOut ? null : durationData, availableRooms: hostel.soldOut ? hostel.totalRooms : 0 }, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: updated });
});

exports.adminRemoveHostel = asyncHandler(async (req, res, next) => {
  const { reason } = req.body; const hostel = await Hostel.findById(req.params.id); if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  if (req.user.role !== 'admin') return next(new ErrorResponse('Only admin can remove properties', 403));
  const updated = await Hostel.findByIdAndUpdate(req.params.id, { active: false, soldOut: true, soldOutReason: reason || 'Removed by admin', soldOutDate: new Date() }, { new: true });
  res.status(200).json({ success: true, data: updated, message: 'Property has been removed by admin' });
});

// AI recommendations for Hostels
exports.getRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const docs = await Hostel.find({ active: true }).lean().limit(200);
  const ranked = docs.map(h => {
    const price = Number(h.price) || 0;
    const predicted = Number(h.predictedPrice) || price;
    const distance = Number(h.distanceFromCollege) || 5;
    const availability = Math.max(0, Math.min(1, (Number(h.availableRooms)||0) / (Number(h.totalRooms)||1)));
    const rating = Math.max(0, Math.min(1, (Number(h.rating)||0) / 5));
    const deal = Math.max(-1, Math.min(1, (predicted - price) / Math.max(1000, predicted)));
    const proximity = Math.max(0, (5 - distance) / 5);
    const score = 0.45*deal + 0.25*proximity + 0.2*availability + 0.1*rating;
    return { score, doc: h };
  })
  .sort((a,b)=> b.score - a.score)
  .slice(0, limit)
  .map(x => ({ ...x.doc, aiScore: Number(x.score.toFixed(3)) }));
  res.status(200).json({ success: true, count: ranked.length, data: ranked });
});

// @desc    Add student to hostel
// @route   POST /api/v1/hostels/:id/students
// @access  Private (Owner/Admin only)
exports.addStudent = asyncHandler(async (req, res, next) => {
  const { studentId, studentName, studentEmail, studentPhone, roomNo, bedNo } = req.body;
  
  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  
  // Check authorization - only hostel_admin or admin
  if (req.user.role !== 'hostel_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only Hostel Administrators can manage students', 403));
  }
  if (hostel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to add students', 401));
  }
  
  // Check if student already exists
  const existingStudent = hostel.students.find(s => 
    s.studentId.toString() === studentId && s.isActive === true
  );
  if (existingStudent) {
    return next(new ErrorResponse('Student is already allocated in this hostel', 400));
  }
  
  // Check availability
  if (hostel.availableBeds <= 0 && hostel.availableRooms <= 0) {
    return next(new ErrorResponse('No beds/rooms available', 400));
  }
  
  // Add student
  hostel.students.push({
    studentId,
    studentName: studentName || 'Unknown',
    studentEmail,
    studentPhone,
    roomNo,
    bedNo,
    joinDate: new Date(),
    isActive: true,
    paymentStatus: 'pending'
  });
  
  // Update bed counts
  hostel.occupiedBeds = (hostel.occupiedBeds || 0) + 1;
  hostel.availableBeds = Math.max(0, (hostel.availableBeds || 0) - 1);
  
  // Update room occupancy if roomNo provided
  if (roomNo && hostel.rooms && hostel.rooms.length > 0) {
    const room = hostel.rooms.find(r => r.roomNo === roomNo);
    if (room) {
      room.occupied = (room.occupied || 0) + 1;
      room.available = Math.max(0, room.capacity - room.occupied);
    }
  }
  
  await hostel.save();
  res.status(201).json({ success: true, data: hostel });
});

// @desc    Remove student from hostel
// @route   DELETE /api/v1/hostels/:id/students/:studentId
// @access  Private (Owner/Admin only)
exports.removeStudent = asyncHandler(async (req, res, next) => {
  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  
  // Check authorization - only hostel_admin or admin
  if (req.user.role !== 'hostel_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only Hostel Administrators can manage students', 403));
  }
  if (hostel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }
  
  const studentIndex = hostel.students.findIndex(s => 
    s.studentId.toString() === req.params.studentId && s.isActive === true
  );
  
  if (studentIndex === -1) {
    return next(new ErrorResponse('Student not found in this hostel', 404));
  }
  
  const student = hostel.students[studentIndex];
  student.isActive = false;
  student.leaveDate = new Date();
  
  // Update bed counts
  hostel.occupiedBeds = Math.max(0, (hostel.occupiedBeds || 0) - 1);
  hostel.availableBeds = (hostel.availableBeds || 0) + 1;
  
  // Update room occupancy
  if (student.roomNo && hostel.rooms && hostel.rooms.length > 0) {
    const room = hostel.rooms.find(r => r.roomNo === student.roomNo);
    if (room) {
      room.occupied = Math.max(0, (room.occupied || 0) - 1);
      room.available = room.capacity - room.occupied;
    }
  }
  
  await hostel.save();
  res.status(200).json({ success: true, data: hostel });
});

// @desc    Get all students in hostel
// @route   GET /api/v1/hostels/:id/students
// @access  Private (Owner/Admin only)
exports.getStudents = asyncHandler(async (req, res, next) => {
  const hostel = await Hostel.findById(req.params.id)
    .populate('students.studentId', 'name email phone')
    .select('students');
  
  if (!hostel) return next(new ErrorResponse('Hostel not found', 404));
  
  // Check authorization - only hostel_admin or admin
  if (req.user.role !== 'hostel_admin' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Only Hostel Administrators can view students', 403));
  }
  if (hostel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }
  
  const activeStudents = hostel.students.filter(s => s.isActive !== false);
  res.status(200).json({ success: true, count: activeStudents.length, data: activeStudents });
});
