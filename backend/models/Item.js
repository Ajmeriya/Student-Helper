const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an item title'],
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: 500
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Books',
      'Electronics',
      'Furniture',
      'Stationery',
      'Sports',
      'Clothing',
      'Gadgets',
      'Others'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  condition: {
    type: String,
    required: [true, 'Please specify item condition'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  images: [{
    type: String,
    required: true
  }],
  sellerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerContact: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: [true, 'Please add item location']
  },
  sold: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }],
  tags: [{
    type: String
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create index for text search
itemSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Item', itemSchema);