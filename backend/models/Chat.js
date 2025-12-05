const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String // For image or file messages
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  chatType: {
    type: String,
    enum: ['item_inquiry', 'hostel_inquiry', 'general'],
    default: 'general'
  },
  relatedItemId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item'
  },
  relatedHostelId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hostel'
  },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    timestamp: Date,
    senderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field and lastMessage before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update lastMessage if messages array has content
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.message,
      timestamp: lastMsg.timestamp,
      senderId: lastMsg.senderId
    };
  }
  
  next();
});

// Create index for efficient queries
chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ chatType: 1 });
chatSchema.index({ relatedItemId: 1 });
chatSchema.index({ relatedHostelId: 1 });
chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);