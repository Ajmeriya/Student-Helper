const Message = require('../models/Message');
const User = require('../models/User');
const Item = require('../models/Item');
const Hostel = require('../models/Hostel');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Send a message
// @route   POST /api/v1/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, content, relatedItem, relatedHostel } = req.body;
  
  // Validate receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return next(new ErrorResponse('Receiver not found', 404));
  }
  
  // Can't send message to self
  if (receiverId === req.user.id) {
    return next(new ErrorResponse('Cannot send message to yourself', 400));
  }
  
  // Validate related item or hostel if provided
  if (relatedItem) {
    const item = await Item.findById(relatedItem);
    if (!item) {
      return next(new ErrorResponse('Related item not found', 404));
    }
  }
  
  if (relatedHostel) {
    const hostel = await Hostel.findById(relatedHostel);
    if (!hostel) {
      return next(new ErrorResponse('Related hostel not found', 404));
    }
  }
  
  // Create message
  const message = await Message.create({
    sender: req.user.id,
    receiver: receiverId,
    content,
    relatedItem,
    relatedHostel
  });
  
  // Populate sender and receiver info
  await message.populate([
    { path: 'sender', select: 'name profileImage' },
    { path: 'receiver', select: 'name profileImage' },
    { path: 'relatedItem', select: 'title price images' },
    { path: 'relatedHostel', select: 'name price images' }
  ]);
  
  // Emit real-time message if socket.io is available
  if (req.io && req.activeUsers) {
    const receiverSocketId = req.activeUsers.get(receiverId);
    if (receiverSocketId) {
      const payload = {
        message,
        conversationId: message.conversationId
      };
      // Backward-compatible event name + unified event used elsewhere
      req.io.to(receiverSocketId).emit('new_message', payload);
      req.io.to(receiverSocketId).emit('receive_message', payload);
    }
  }
  
  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Get conversations for current user
// @route   GET /api/v1/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Message.aggregate([
    {
      // Match messages where user is sender or receiver
      $match: {
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id }
        ],
        isDeleted: false
      }
    },
    {
      // Sort by creation date descending
      $sort: { createdAt: -1 }
    },
    {
      // Group by conversation ID and get latest message
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$receiver', req.user._id] },
                { $eq: ['$isRead', false] }
              ]},
              1,
              0
            ]
          }
        }
      }
    },
    {
      // Sort conversations by last message time
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
  
  // Populate user and listing info
  const populatedConversations = await Message.populate(conversations, [
    { path: 'lastMessage.sender', select: 'name profileImage' },
    { path: 'lastMessage.receiver', select: 'name profileImage' },
    { path: 'lastMessage.relatedItem', select: 'title price images' },
    { path: 'lastMessage.relatedHostel', select: 'name price images' }
  ]);
  
  res.status(200).json({
    success: true,
    count: populatedConversations.length,
    data: populatedConversations
  });
});

// @desc    Get messages in a conversation
// @route   GET /api/v1/messages/conversation/:conversationId
// @access  Private
exports.getConversationMessages = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  
  // Verify user is part of this conversation
  const conversationCheck = await Message.findOne({
    conversationId,
    $or: [
      { sender: req.user.id },
      { receiver: req.user.id }
    ]
  });
  
  if (!conversationCheck) {
    return next(new ErrorResponse('Conversation not found or access denied', 404));
  }
  
  // Get messages
  const messages = await Message.find({
    conversationId,
    isDeleted: false
  })
  .populate([
    { path: 'sender', select: 'name profileImage' },
    { path: 'receiver', select: 'name profileImage' },
    { path: 'relatedItem', select: 'title price images' },
    { path: 'relatedHostel', select: 'name price images' }
  ])
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(startIndex);
  
  // Mark unread messages as read
  await Message.updateMany({
    conversationId,
    receiver: req.user.id,
    isRead: false
  }, {
    isRead: true,
    readAt: new Date()
  });
  
  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages.reverse() // Reverse to show oldest first
  });
});

// @desc    Mark messages as read
// @route   PUT /api/v1/messages/read/:conversationId
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  
  const result = await Message.updateMany({
    conversationId,
    receiver: req.user.id,
    isRead: false
  }, {
    isRead: true,
    readAt: new Date()
  });
  
  res.status(200).json({
    success: true,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// @desc    Get unread message count
// @route   GET /api/v1/messages/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Message.countDocuments({
    receiver: req.user.id,
    isRead: false,
    isDeleted: false
  });
  
  res.status(200).json({
    success: true,
    data: { count }
  });
});

// @desc    Delete a message (soft delete)
// @route   DELETE /api/v1/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);
  
  if (!message) {
    return next(new ErrorResponse('Message not found', 404));
  }
  
  // Only sender can delete their message
  if (message.sender.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this message', 403));
  }
  
  message.isDeleted = true;
  await message.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Start conversation about an item
// @route   POST /api/v1/messages/start-item-conversation
// @access  Private
exports.startItemConversation = asyncHandler(async (req, res, next) => {
  const { itemId, message } = req.body;
  
  const item = await Item.findById(itemId).populate('sellerId', 'name _id');
  if (!item) {
    return next(new ErrorResponse('Item not found', 404));
  }
  
  // Can't message yourself about your own item
  if (item.sellerId._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot message yourself about your own item', 400));
  }
  
  // Create initial message
  const newMessage = await Message.create({
    sender: req.user.id,
    receiver: item.sellerId._id,
    content: message || `Hi, I'm interested in your item "${item.title}". Is it still available?`,
    relatedItem: itemId
  });
  
  await newMessage.populate([
    { path: 'sender', select: 'name profileImage' },
    { path: 'receiver', select: 'name profileImage' },
    { path: 'relatedItem', select: 'title price images' }
  ]);
  
  res.status(201).json({
    success: true,
    data: {
      message: newMessage,
      conversationId: newMessage.conversationId
    }
  });
});

// @desc    Start conversation about a hostel
// @route   POST /api/v1/messages/start-hostel-conversation
// @access  Private
exports.startHostelConversation = asyncHandler(async (req, res, next) => {
  const { hostelId, message } = req.body;
  
  const hostel = await Hostel.findById(hostelId).populate('ownerId', 'name _id');
  if (!hostel) {
    return next(new ErrorResponse('Hostel not found', 404));
  }
  
  // Can't message yourself about your own property
  if (hostel.ownerId._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot message yourself about your own property', 400));
  }
  
  // Create initial message
  const newMessage = await Message.create({
    sender: req.user.id,
    receiver: hostel.ownerId._id,
    content: message || `Hi, I'm interested in your property "${hostel.name}". Are there any rooms available?`,
    relatedHostel: hostelId
  });
  
  await newMessage.populate([
    { path: 'sender', select: 'name profileImage' },
    { path: 'receiver', select: 'name profileImage' },
    { path: 'relatedHostel', select: 'name price images' }
  ]);
  
  res.status(201).json({
    success: true,
    data: {
      message: newMessage,
      conversationId: newMessage.conversationId
    }
  });
});