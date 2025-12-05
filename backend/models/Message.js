const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a sender']
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a receiver']
  },
  conversationId: {
    type: String,
    required: [true, 'Message must belong to a conversation']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  relatedItem: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item'
  },
  relatedHostel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hostel'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }]
}, {
  timestamps: true
});

// Create compound index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Generate conversation ID from two user IDs
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  // Sort to ensure consistent conversation ID regardless of order
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Virtual for checking if message belongs to a conversation about an item/hostel
messageSchema.virtual('isAboutListing').get(function() {
  return !!(this.relatedItem || this.relatedHostel);
});

// Pre-save middleware to generate conversation ID if not provided
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    this.conversationId = this.constructor.generateConversationId(this.sender, this.receiver);
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);