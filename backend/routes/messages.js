const express = require('express');
const {
  sendMessage,
  getConversations,
  getConversationMessages,
  markAsRead,
  getUnreadCount,
  deleteMessage,
  startItemConversation,
  startHostelConversation
} = require('../controllers/messages');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Message routes
router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:conversationId', getConversationMessages);
router.put('/read/:conversationId', markAsRead);
router.get('/unread-count', getUnreadCount);
router.delete('/:id', deleteMessage);

// Conversation starter routes
router.post('/start-item-conversation', startItemConversation);
router.post('/start-hostel-conversation', startHostelConversation);

module.exports = router;