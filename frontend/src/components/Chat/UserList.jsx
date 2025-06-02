import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { fetchUsers } from '../../utils/api.js';

const userItemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 200 }
  }),
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } }
};

const UserList = ({ token, currentUserId, onSelectUser, selectedUserId, onlineUsers = [] }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const res = await fetchUsers(token);
        // Exclude current user
        const otherUsers = res.data.filter(user => user._id !== currentUserId);
        setUsers(otherUsers);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [token, currentUserId]);

  if (loading) return <p className="p-4">Loading users...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4 text-blue-700">Users</h3>
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-gray-500">No other users found</p>
        ) : (
          <ul>
            <AnimatePresence>
              {users.map((user, i) => (
                <motion.li
                  key={user._id}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg mb-2 cursor-pointer border shadow-sm
                    ${user._id === selectedUserId
                      ? 'bg-gradient-to-r from-blue-200 to-purple-200 shadow-lg border-blue-400 text-blue-800 font-semibold'
                      : 'hover:bg-blue-100/70 border-transparent'}
                  `}
                  onClick={() => onSelectUser(user)}
                  custom={i}
                  variants={userItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <motion.span
                    className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold"
                    whileHover={{ scale: 1.12 }}
                  >
                    {user.name[0].toUpperCase()}
                    {/* Online indicator */}
                    <motion.span
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        onlineUsers.includes(user._id) ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                      title={onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                      animate={onlineUsers.includes(user._id)
                        ? { scale: [1, 1.3, 1] }
                        : { scale: 1 }}
                      transition={onlineUsers.includes(user._id)
                        ? { repeat: Infinity, duration: 1.2 }
                        : {}}
                    ></motion.span>
                  </motion.span>
                  <span>
                    {user.name}{' '}
                    <span className="text-xs text-gray-500">({user.email})</span>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserList;