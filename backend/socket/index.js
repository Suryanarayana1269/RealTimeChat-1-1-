const mongoose = require('mongoose');
const Message = require('../models/Message');
const connectedUsers = new Map(); // userId -> socketId

function broadcastOnlineUsers(io) {
  const onlineUserIds = Array.from(connectedUsers.keys());
  io.emit('online_users', onlineUserIds);
}

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id);

    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log('User registered:', userId);
      broadcastOnlineUsers(io);
    });

   socket.on('send_message', async ({ senderId, receiverId, text, tempId }) => {
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      reactions: [],
    });

    const savedMessage = await newMessage.save();
    const messageToSend = savedMessage.toObject();
    if (tempId) messageToSend.tempId = tempId; // <-- FIX: attach tempId to the outgoing message

    const receiverSocketId = connectedUsers.get(receiverId);

    if (receiverSocketId && receiverId !== senderId) {
      io.to(receiverSocketId).emit('receive_message', messageToSend);
    }
    socket.emit('receive_message', messageToSend);
  } catch (err) {
    console.error('Error saving message:', err);
  }
});

    socket.on('react_message', async ({ messageId, userId, emoji }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
          console.error('Invalid messageId for reaction:', messageId);
          return;
        }
        const message = await Message.findById(messageId);
        if (!message) return;

        message.reactions = message.reactions.filter(r => r.userId.toString() !== userId);
        message.reactions.push({ userId, emoji });

        await message.save();

        const participants = [message.senderId.toString(), message.receiverId.toString()];
        participants.forEach(pid => {
          const sid = connectedUsers.get(pid);
          if (sid) {
            io.to(sid).emit('message_reacted', message);
          }
        });
      } catch (err) {
        console.error('Error reacting message:', err);
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
  // Emit to the receiver only
  const receiverSocketId = onlineUsers.get(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('typing', { senderId });
  }
});

    socket.on('disconnect', () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log('User disconnected:', userId);
          broadcastOnlineUsers(io);
          break;
        }
      }
    });
  });
}

module.exports = setupSocket;
