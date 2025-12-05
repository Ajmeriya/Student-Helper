const Item = require('../models/Item');
const User = require('../models/User');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all items
// @route   GET /api/v1/items
// @access  Public
exports.getItems = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Handle available filter (show only unsold items)
  if (req.query.available === 'true') {
    reqQuery.sold = false;
  }

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'available'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Item.find(JSON.parse(queryStr)).populate({
    path: 'sellerId',
    select: 'name location rating'
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
  const total = await Item.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const items = await query;

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
    count: items.length,
    pagination,
    data: items
  });
});

// @desc    Get single item
// @route   GET /api/v1/items/:id
// @access  Public
exports.getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate({
    path: 'sellerId',
    select: 'name location phone email rating totalRatings'
  });

  if (!item) {
    return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
  }

  // Check if user has liked this item
  let isLiked = false;
  if (req.user && item.likes) {
    isLiked = item.likes.some(like => like.userId.toString() === req.user.id);
  }

  const itemWithLikeStatus = {
    ...item.toObject(),
    isLiked
  };

  res.status(200).json({
    success: true,
    data: itemWithLikeStatus
  });
});

// @desc    Create new item
// @route   POST /api/v1/items
// @access  Private
exports.createItem = asyncHandler(async (req, res, next) => {
  // Add seller info to req.body
  req.body.sellerId = req.user.id;
  req.body.sellerName = req.user.name;
  req.body.sellerContact = req.user.phone;
  
  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    req.body.images = req.files.map(file => `${baseUrl}/uploads/items/${file.filename}`);
  } else if (!req.body.images) {
    req.body.images = [];
  }

  const item = await Item.create(req.body);

  res.status(201).json({
    success: true,
    data: item
  });
});

// @desc    Update item
// @route   PUT /api/v1/items/:id
// @access  Private
exports.updateItem = asyncHandler(async (req, res, next) => {
  let item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner
  if (item.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this item`, 401));
  }
  
  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const newImages = req.files.map(file => `${baseUrl}/uploads/items/${file.filename}`);
    
    // If keeping existing images, merge them
    if (req.body.keepExistingImages === 'true' && item.images) {
      req.body.images = [...item.images, ...newImages];
    } else {
      req.body.images = newImages;
    }
  }

  item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Delete item
// @route   DELETE /api/v1/items/:id
// @access  Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner
  if (item.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this item`, 401));
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search items
// @route   GET /api/v1/items/search
// @access  Public
exports.searchItems = asyncHandler(async (req, res, next) => {
  const { q, category, minPrice, maxPrice, condition, location } = req.query;
  
  let query = {};

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Category filter
  if (category && category !== 'all') {
    query.category = category;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseInt(minPrice);
    if (maxPrice) query.price.$lte = parseInt(maxPrice);
  }

  // Condition filter
  if (condition && condition !== 'all') {
    query.condition = condition;
  }

  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Only show available items
  query.sold = false;

  const items = await Item.find(query)
    .populate({
      path: 'sellerId',
      select: 'name location rating'
    })
    .sort('-datePosted')
    .limit(50);

  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get my items
// @route   GET /api/v1/items/my-items
// @access  Private
exports.getMyItems = asyncHandler(async (req, res, next) => {
  const items = await Item.find({ sellerId: req.user.id }).sort('-datePosted');

  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Mark item as sold
// @route   PUT /api/v1/items/:id/sold
// @access  Private
exports.markAsSold = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is item owner
  if (item.sellerId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this item`, 401));
  }

  item.sold = !item.sold;
  await item.save();

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Toggle like item
// @route   POST /api/v1/items/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
  }

  const likeIndex = item.likes.findIndex(like => like.userId.toString() === req.user.id);
  let isLiked;

  if (likeIndex > -1) {
    // Unlike
    item.likes.splice(likeIndex, 1);
    isLiked = false;
  } else {
    // Like
    item.likes.push({ userId: req.user.id });
    isLiked = true;
  }

  await item.save();

  res.status(200).json({
    success: true,
    data: {
      likes: item.likes,
      isLiked
    }
  });
});

// @desc    Track item view
// @route   POST /api/v1/items/:id/view
// @access  Private
exports.trackView = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
  }

  // Don't track views for the item owner
  if (req.user && item.sellerId.toString() === req.user.id) {
    return res.status(200).json({ success: true, data: { views: item.views } });
  }

  // Increment view count
  await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  
  res.status(200).json({
    success: true,
    data: { views: item.views + 1 }
  });
});

// @desc    Add review to item
// @route   POST /api/v1/items/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
  }

  // Check if user is trying to review their own item
  if (item.sellerId.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot review your own item', 400));
  }

  // Check if user already reviewed this item
  const existingReview = await Review.findOne({
    itemId: req.params.id,
    reviewerId: req.user.id
  });

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this item', 400));
  }

  const review = await Review.create({
    rating,
    text: comment,
    title: `Review for ${item.title}`,
    reviewType: 'item',
    itemId: req.params.id,
    reviewerId: req.user.id,
    reviewerName: req.user.name
  });

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews for item
// @route   GET /api/v1/items/:id/reviews
// @access  Public
exports.getItemReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ itemId: req.params.id })
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
