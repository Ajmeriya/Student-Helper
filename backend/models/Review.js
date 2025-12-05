const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  title: {
    type: String,
    required: [true, 'Please add a review title'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add review text'],
    maxlength: 500
  },
  reviewType: {
    type: String,
    required: [true, 'Please specify review type'],
    enum: ['item', 'hostel', 'user']
  },
  reviewerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerName: {
    type: String,
    required: true
  },
  // Reference to the item, hostel, or user being reviewed
  itemId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item'
  },
  hostelId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hostel'
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  // For transaction-based reviews
  transactionCompleted: {
    type: Boolean,
    default: false
  },
  helpful: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  reported: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['Spam', 'Inappropriate', 'Fake', 'Other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per item/hostel/user
reviewSchema.index({ reviewerId: 1, itemId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewerId: 1, hostelId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewerId: 1, userId: 1 }, { unique: true, sparse: true });

// Static method to get average rating and update the target model
reviewSchema.statics.getAverageRating = async function(modelType, targetId) {
  let matchCondition = {};
  
  if (modelType === 'item') {
    matchCondition.itemId = mongoose.Types.ObjectId(targetId);
  } else if (modelType === 'hostel') {
    matchCondition.hostelId = mongoose.Types.ObjectId(targetId);
  } else if (modelType === 'user') {
    matchCondition.userId = mongoose.Types.ObjectId(targetId);
  }

  const obj = await this.aggregate([
    {
      $match: matchCondition
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  try {
    let Model;
    if (modelType === 'item') {
      Model = mongoose.model('Item');
    } else if (modelType === 'hostel') {
      Model = mongoose.model('Hostel');
    } else if (modelType === 'user') {
      Model = mongoose.model('User');
    }

    if (obj[0]) {
      await Model.findByIdAndUpdate(targetId, {
        rating: Math.ceil(obj[0].averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: obj[0].totalRatings
      });
    } else {
      await Model.findByIdAndUpdate(targetId, {
        rating: 0,
        totalRatings: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  if (this.itemId) {
    this.constructor.getAverageRating('item', this.itemId);
  } else if (this.hostelId) {
    this.constructor.getAverageRating('hostel', this.hostelId);
  } else if (this.userId) {
    this.constructor.getAverageRating('user', this.userId);
  }
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function() {
  if (this.itemId) {
    this.constructor.getAverageRating('item', this.itemId);
  } else if (this.hostelId) {
    this.constructor.getAverageRating('hostel', this.hostelId);
  } else if (this.userId) {
    this.constructor.getAverageRating('user', this.userId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);