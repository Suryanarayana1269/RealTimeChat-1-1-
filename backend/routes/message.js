const express = require('express');
const router = express.Router();
const { getMessages, reactToMessage, sendMessage } = require('../controllers/messageController');
const authenticate = require('../middleware/auth');

// Get messages between two users
router.get('/:receiverId', authenticate, getMessages);

// Send a message
router.post('/', authenticate, sendMessage);

// React to a message
router.post('/:messageId/react', authenticate, reactToMessage);

module.exports = router;
