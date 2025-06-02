import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (userId, onReceiveMessage, onMessageReacted, setOnlineUsers) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Prevent duplicate connections
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Connect to WebSocket server
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 5, // Optional: auto-reconnects
    });

    

    // On connect
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to socket server');
      socketRef.current.emit('register', userId);
    });

    // Handle disconnection
    socketRef.current.on('disconnect', () => {
      console.log('⚠️ Disconnected from socket server');
    });

    // Handle message received
    socketRef.current.on('receive_message', (message) => {
      console.log('📩 Message received:', message);
      if (onReceiveMessage) onReceiveMessage(message);
    });

    // Handle message reaction
    socketRef.current.on('message_reacted', (updatedMessage) => {
      console.log('❤️ Message reacted:', updatedMessage);
      if (onMessageReacted) onMessageReacted(updatedMessage);
    });

    // Handle online users update
    socketRef.current.on('online_users', (users) => {
      console.log('🟢 Online users:', users);
      if (setOnlineUsers) setOnlineUsers(users);
    });

    // Clean up socket connection
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket disconnected on unmount');
      }
    };
  }, [userId]);

  // Send a message
  const sendMessage = ({ senderId, receiverId, text, tempId }) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { senderId, receiverId, text, tempId });
    }
  };

  // React to a message
  const reactMessage = ({ messageId, userId, emoji }) => {
    if (socketRef.current) {
      socketRef.current.emit('react_message', { messageId, userId, emoji });
    }
  };

  // Send typing event
  const sendTyping = ({ senderId, receiverId }) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { senderId, receiverId });
    }
  };

  return { sendMessage, reactMessage, sendTyping };
};