import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../hooks/useSocket.jsx';
import { fetchMessages } from '../../utils/api.js';
import UserList from './UserList.jsx';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥'];

const bubbleVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } },
};

const sendBtnVariants = {
  rest: { scale: 1, boxShadow: '0 2px 8px #a5b4fc33' },
  hover: { scale: 1.08, boxShadow: '0 4px 24px #818cf833' },
  tap: { scale: 0.96 },
};

const ChatWindow = () => {
  const { user, token, logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const onReceiveMessage = (message) => {
    setMessages((msgs) => {
      if (message.tempId) {
        const idx = msgs.findIndex((m) => m.tempId === message.tempId);
        if (idx !== -1) {
          const updatedMsgs = [...msgs];
          updatedMsgs[idx] = { ...message };
          return updatedMsgs;
        }
      }
      if (message._id && msgs.some((m) => m._id === message._id)) return msgs;
      if (message.tempId && msgs.some((m) => m.tempId === message.tempId)) return msgs;
      return [...msgs, message];
    });
  };

  const onMessageReacted = (updatedMessage) => {
    setMessages((msgs) =>
      msgs.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
    );
  };

  const { sendMessage, reactMessage } = useSocket(
    user?._id,
    onReceiveMessage,
    onMessageReacted,
    setOnlineUsers
  );

  useEffect(() => {
    if (!selectedUser) return setMessages([]);
    const loadMessages = async () => {
      try {
        const res = await fetchMessages(selectedUser._id, token);
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      }
    };
    loadMessages();
  }, [selectedUser, token, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) return;
    let timeout;
    if (input) {
      setIsTyping(true);
      timeout = setTimeout(() => setIsTyping(false), 1200);
    } else {
      setIsTyping(false);
    }
    return () => clearTimeout(timeout);
  }, [input, selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const tempId = `${Date.now()}-${Math.random()}`;
    const messageData = {
      senderId: user._id,
      receiverId: selectedUser._id,
      text: input.trim(),
      createdAt: new Date().toISOString(),
      reactions: [],
      tempId,
    };
    setMessages((prev) => [...prev, { ...messageData }]);
    sendMessage(messageData);
    setInput('');
  };

  const handleReact = (messageId, emoji) => {
    reactMessage({ messageId, userId: user._id, emoji });
    setShowEmojiPickerFor(null);
  };

  const isUserOnline = (id) => onlineUsers.includes(id);

  return (
    <motion.div
      className="flex h-[90vh] border rounded-3xl shadow-2xl bg-gradient-to-br from-blue-100/80 via-purple-100/80 to-pink-100/80 overflow-hidden backdrop-blur-xl ring-2 ring-blue-200/40 drop-shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    >
      {/* Sidebar */}
      <motion.div
        className="w-1/4 border-r bg-white/70 backdrop-blur-lg overflow-y-auto"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
      >
        <UserList
          token={token}
          currentUserId={user._id}
          selectedUserId={selectedUser?._id}
          onSelectUser={setSelectedUser}
          onlineUsers={onlineUsers}
        />
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div className="flex items-center justify-between px-8 py-5 border-b bg-white/60 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-3">
            {selectedUser ? (
              <>
                <motion.span
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl font-semibold select-none"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {selectedUser.name[0].toUpperCase()}
                </motion.span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedUser.name}
                    {isUserOnline(selectedUser._id) && (
                      <span className="ml-2 text-xs text-green-600 font-normal">• online</span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isTyping ? 'Typing...' : 'Active now'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-400 select-none">Select a user to chat</p>
            )}
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="font-bold text-sm text-gray-700 mb-1">{user.name}</div>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-semibold text-sm"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-purple-300">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.senderId === user._id;
              return (
                <motion.div
                  key={msg.tempId || msg._id}
                  className={`max-w-[60%] my-2 p-3 rounded-xl break-words whitespace-pre-wrap ${
                    isOwn
                      ? 'ml-auto bg-purple-400 text-white'
                      : 'mr-auto bg-gray-200 text-gray-900'
                  }`}
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div>{msg.text}</div>
                  <div className="mt-1 flex gap-2">
                    {msg.reactions?.map((r) => (
                      <span key={r.userId} title={`User ${r.userId} reacted`}>
                        {r.emoji}
                      </span>
                    ))}
                    <button
                      onClick={() => setShowEmojiPickerFor(msg._id)}
                      className="ml-auto text-sm text-gray-600 hover:text-gray-900"
                      aria-label="React to message"
                    >
                      😊
                    </button>
                  </div>
                  {showEmojiPickerFor === msg._id && (
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => handleReact(msg._id, e)}
                          className="text-lg"
                          aria-label={`React with ${e}`}
                        >
                          {e}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowEmojiPickerFor(null)}
                        className="ml-2 text-red-500 font-semibold"
                        aria-label="Close emoji picker"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-5 border-t bg-white/60 backdrop-blur-md flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedUser ? 'Type your message...' : 'Select a user to chat'}
            disabled={!selectedUser}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring focus:ring-purple-400"
            aria-label="Message input"
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || !selectedUser}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-5 py-2 rounded-lg font-semibold"
            variants={sendBtnVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            aria-label="Send message"
          >
            Send
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatWindow;
