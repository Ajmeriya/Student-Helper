const express = require('express');
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's chats
// @route   GET /api/v1/chats
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const chats = await Chat.find({
      'participants.userId': req.user.id,
      active: true
    })
    .populate('participants.userId', 'name profileImage')
    .populate('relatedItemId', 'title images price')
    .populate('relatedHostelId', 'name images price')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get unread message count
// @route   GET /api/v1/chats/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const chats = await Chat.find({
      'participants.userId': req.user.id,
      active: true
    });

    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        if (message.senderId.toString() !== req.user.id && !message.read) {
          unreadCount++;
        }
      });
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single chat
// @route   GET /api/v1/chats/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.userId', 'name profileImage')
      .populate('relatedItemId', 'title images price sellerId')
      .populate('relatedHostelId', 'name images price ownerId');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of this chat
    const isParticipant = chat.participants.some(
      participant => participant.userId._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Update last seen for the user
    const userParticipant = chat.participants.find(
      participant => participant.userId._id.toString() === req.user.id
    );
    if (userParticipant) {
      userParticipant.lastSeen = new Date();
      await chat.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create or get existing chat
// @route   POST /api/v1/chats
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { recipientId, chatType, relatedItemId, relatedHostelId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    if (recipientId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Check if chat already exists between these users for this specific item/hostel
    let existingChatQuery = {
      'participants.userId': { $all: [req.user.id, recipientId] }
    };

    if (relatedItemId) {
      existingChatQuery.relatedItemId = relatedItemId;
    } else if (relatedHostelId) {
      existingChatQuery.relatedHostelId = relatedHostelId;
    }

    let chat = await Chat.findOne(existingChatQuery)
      .populate('participants.userId', 'name profileImage')
      .populate('relatedItemId', 'title images price')
      .populate('relatedHostelId', 'name images price');

    if (chat) {
      return res.status(200).json({
        success: true,
        message: 'Chat already exists',
        data: chat
      });
    }

    // Get recipient details
    const User = require('../models/User');
    const recipient = await User.findById(recipientId).select('name');
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [
        {
          userId: req.user.id,
          name: req.user.name,
          lastSeen: new Date()
        },
        {
          userId: recipientId,
          name: recipient.name,
          lastSeen: new Date()
        }
      ],
      chatType: chatType || 'general',
      relatedItemId: relatedItemId || undefined,
      relatedHostelId: relatedHostelId || undefined
    });

    // Populate the chat
    chat = await Chat.findById(chat._id)
      .populate('participants.userId', 'name profileImage')
      .populate('relatedItemId', 'title images price')
      .populate('relatedHostelId', 'name images price');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Send message
// @route   POST /api/v1/chats/:id/messages
// @access  Private
router.post('/:id/messages', protect, async (req, res, next) => {
  try {
    const { message, messageType = 'text', fileUrl } = req.body;

    if (!message && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required'
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of this chat
    const isParticipant = chat.participants.some(
      participant => participant.userId.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this chat'
      });
    }

    // Add message to chat
    const newMessage = {
      senderId: req.user.id,
      senderName: req.user.name,
      message: message || '',
      messageType,
      fileUrl,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Emit real-time message via Socket.IO
    const messageData = {
      _id: newMessage._id,
      chatId: chat._id,
      message: newMessage.message,
      senderId: req.user.id,
      senderName: req.user.name,
      timestamp: newMessage.timestamp
    };

    if (req.io) {
      console.log('🚀 EMITTING MESSAGE VIA SOCKET:');
      console.log('  Chat ID:', req.params.id);
      console.log('  Message Data:', messageData);
      console.log('  Rooms in IO:', Object.keys(req.io.sockets.adapter.rooms));
      
      // Emit to all users in the chat room
      req.io.to(req.params.id).emit('receive_message', messageData);
      
      console.log('✅ Message emitted to room:', req.params.id);
    } else {
      console.error('❌ req.io not available!');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Mark messages as read
// @route   PUT /api/v1/chats/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of this chat
    const isParticipant = chat.participants.some(
      participant => participant.userId.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Mark all messages as read for this user (except their own messages)
    chat.messages.forEach(message => {
      if (message.senderId.toString() !== req.user.id) {
        message.read = true;
      }
    });

    await chat.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete chat
// @route   DELETE /api/v1/chats/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is part of this chat
    const isParticipant = chat.participants.some(
      participant => participant.userId.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }

    // Mark chat as inactive instead of deleting
    chat.active = false;
    await chat.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;