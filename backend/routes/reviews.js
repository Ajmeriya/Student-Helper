const express = require('express');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    let filter = {};
    
    // Filter by review type
    if (req.query.reviewType) {
      filter.reviewType = req.query.reviewType;
    }
    
    // Filter by target ID (item, hostel, or user)
    if (req.query.itemId) {
      filter.itemId = req.query.itemId;
    }
    if (req.query.hostelId) {
      filter.hostelId = req.query.hostelId;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const reviews = await Review.find(filter)
      .populate('reviewerId', 'name profileImage verified')
      .populate('itemId', 'title images')
      .populate('hostelId', 'name images')
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get reviews stats for target
// @route   GET /api/v1/reviews/stats
// @access  Public
router.get('/stats', async (req, res, next) => {
  try {
    const { reviewType, itemId, hostelId, userId } = req.query;

    if (!reviewType || !['item', 'hostel', 'user'].includes(reviewType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid review type is required'
      });
    }

    let matchCondition = { reviewType };
    
    if (reviewType === 'item' && itemId) {
      matchCondition.itemId = require('mongoose').Types.ObjectId(itemId);
    } else if (reviewType === 'hostel' && hostelId) {
      matchCondition.hostelId = require('mongoose').Types.ObjectId(hostelId);
    } else if (reviewType === 'user' && userId) {
      matchCondition.userId = require('mongoose').Types.ObjectId(userId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Target ID is required'
      });
    }

    const stats = await Review.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingBreakdown: {
            $push: '$rating'
          }
        }
      },
      {
        $addFields: {
          ratingCounts: {
            1: { $size: { $filter: { input: '$ratingBreakdown', cond: { $eq: ['$$this', 1] } } } },
            2: { $size: { $filter: { input: '$ratingBreakdown', cond: { $eq: ['$$this', 2] } } } },
            3: { $size: { $filter: { input: '$ratingBreakdown', cond: { $eq: ['$$this', 3] } } } },
            4: { $size: { $filter: { input: '$ratingBreakdown', cond: { $eq: ['$$this', 4] } } } },
            5: { $size: { $filter: { input: '$ratingBreakdown', cond: { $eq: ['$$this', 5] } } } }
          }
        }
      },
      {
        $project: {
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1,
          ratingCounts: 1
        }
      }
    ]);

    const result = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewerId', 'name profileImage verified')
      .populate('itemId', 'title images')
      .populate('hostelId', 'name images')
      .populate('userId', 'name profileImage');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create new review
// @route   POST /api/v1/reviews
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { rating, title, text, reviewType, itemId, hostelId, userId } = req.body;

    // Validate review type and target
    if (!['item', 'hostel', 'user'].includes(reviewType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review type'
      });
    }

    // Check that appropriate target ID is provided
    if (reviewType === 'item' && !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required for item reviews'
      });
    }
    if (reviewType === 'hostel' && !hostelId) {
      return res.status(400).json({
        success: false,
        message: 'Hostel ID is required for hostel reviews'
      });
    }
    if (reviewType === 'user' && !userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required for user reviews'
      });
    }

    // Prevent self-review for users
    if (reviewType === 'user' && userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review yourself'
      });
    }

    // Check if user is trying to review their own item/hostel
    if (reviewType === 'item') {
      const Item = require('../models/Item');
      const item = await Item.findById(itemId);
      if (item && item.sellerId.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot review your own item'
        });
      }
    }

    if (reviewType === 'hostel') {
      const Hostel = require('../models/Hostel');
      const hostel = await Hostel.findById(hostelId);
      if (hostel && hostel.ownerId.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot review your own hostel'
        });
      }
    }

    // Add user to req.body
    const reviewData = {
      rating,
      title,
      text,
      reviewType,
      reviewerId: req.user.id,
      reviewerName: req.user.name
    };

    // Add appropriate target ID
    if (reviewType === 'item') reviewData.itemId = itemId;
    if (reviewType === 'hostel') reviewData.hostelId = hostelId;
    if (reviewType === 'user') reviewData.userId = userId;

    const review = await Review.create(reviewData);

    // Populate the review
    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name profileImage verified')
      .populate('itemId', 'title images')
      .populate('hostelId', 'name images')
      .populate('userId', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private (Owner only)
router.put('/:id', protect, async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns the review
    if (review.reviewerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Only allow updating rating, title, and text
    const updateData = {
      rating: req.body.rating || review.rating,
      title: req.body.title || review.title,
      text: req.body.text || review.text
    };

    review = await Review.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('reviewerId', 'name profileImage verified')
     .populate('itemId', 'title images')
     .populate('hostelId', 'name images')
     .populate('userId', 'name profileImage');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns the review or is admin
    if (review.reviewerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Mark review as helpful
// @route   PUT /api/v1/reviews/:id/helpful
// @access  Private
router.put('/:id/helpful', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked this as helpful
    const existingHelpful = review.helpful.find(
      helpful => helpful.userId.toString() === req.user.id
    );

    if (existingHelpful) {
      // Remove helpful mark
      review.helpful = review.helpful.filter(
        helpful => helpful.userId.toString() !== req.user.id
      );
    } else {
      // Add helpful mark
      review.helpful.push({ userId: req.user.id });
    }

    await review.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: existingHelpful ? 'Helpful mark removed' : 'Review marked as helpful',
      data: {
        helpful: !existingHelpful,
        totalHelpful: review.helpful.length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Report review
// @route   PUT /api/v1/reviews/:id/report
// @access  Private
router.put('/:id/report', protect, async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !['Spam', 'Inappropriate', 'Fake', 'Other'].includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Valid report reason is required'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already reported this review
    const existingReport = review.reported.find(
      report => report.userId.toString() === req.user.id
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review'
      });
    }

    // Add report
    review.reported.push({
      userId: req.user.id,
      reason,
      reportedAt: new Date()
    });

    await review.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;