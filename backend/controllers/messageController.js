const Message = require('../models/Message');

// Fetch messages between current user and receiver
const getMessages = async (req, res) => {
  const { receiverId } = req.params;
  const userId = req.user.id;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

// React to a message with emoji
const reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Remove previous reaction by same user (optional)
    message.reactions = message.reactions.filter(r => r.userId.toString() !== userId);

    message.reactions.push({ userId, emoji });
    await message.save();

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to react to message', error: err.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user.id;

  try {
    const message = await Message.create({ senderId, receiverId, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

module.exports = {
  getMessages,
  reactToMessage,
  sendMessage
};
