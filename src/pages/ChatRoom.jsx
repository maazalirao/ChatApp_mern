// ChatRoom component for real-time messaging
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiSend, 
  FiArrowLeft, 
  FiMoreVertical, 
  FiUsers, 
  FiLogOut, 
  FiInfo,
  FiMessageCircle,
  FiX,
  FiChevronDown,
  FiSmile
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [roomMessages, setRoomMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const { 
    messages, 
    typingUsers, 
    sendMessage, 
    sendTypingStatus, 
    leaveRoom, 
    rooms, 
    users,
    activeRoom,
    socket
  } = useSocket();
  
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  
  // Join the room when component mounts
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Listen for room info updates
    socket?.on('roomInfo', (data) => {
      if (data.roomId === roomId) {
        setRoomInfo(data);
      }
    });
    
    // Cleanup on unmount
    return () => {
      socket?.off('roomInfo');
    };
  }, [currentUser, navigate, roomId, socket]);
  
  // Set roomMessages whenever messages change
  useEffect(() => {
    // Filter messages for this room and deduplicate by ID
    const roomMsgs = messages.filter(msg => msg.roomId === roomId);
    
    // Deduplicate messages by ID (keep the most recent version of each message)
    const uniqueMessages = [];
    const messageIds = new Set();
    
    // Process in reverse to get newest version of duplicates
    for (let i = roomMsgs.length - 1; i >= 0; i--) {
      const msg = roomMsgs[i];
      if (!messageIds.has(msg.id)) {
        messageIds.add(msg.id);
        uniqueMessages.unshift(msg); // Add to front to maintain order
      }
    }
    
    console.log(`Setting ${uniqueMessages.length} room messages (filtered from ${roomMsgs.length})`);
    setRoomMessages(uniqueMessages);
  }, [messages, roomId]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);
  
  // Get current room information
  useEffect(() => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setRoomInfo(room);
    }
  }, [roomId, rooms]);
  
  // Handle a user joining the room
  const handleUserJoined = (data) => {
    // Add notification for user joining
  };
  
  // Handle a user leaving the room
  const handleUserLeft = (data) => {
    // Add notification for user leaving
  };
  
  // Close the dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu || showUsersList) {
        // Close dropdowns when clicking outside
        setShowMenu(false);
        setShowUsersList(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showUsersList]);
  
  // Handle typing indicator
  const handleTyping = () => {
    clearTimeout(typingTimeout);
    
    // Send typing status
    sendTypingStatus(roomId, true);
    
    // Set timeout to clear typing status after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      sendTypingStatus(roomId, false);
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    // Don't send empty messages
    if (message.trim() === '') return;
    
    try {
      console.log(`Sending message to room ${roomId}: "${message}"`);
      // Send message
      sendMessage(roomId, message.trim());
      
      // Clear input
      setMessage('');
      
      // Clear typing status
      sendTypingStatus(roomId, false);
      
      // Focus the input field
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add error handling here
    }
  };
  
  // Handle leaving the room
  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    navigate('/');
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  return (
    <div className="chat-container">
      {/* Chat header */}
      <div className="chat-header">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="btn-icon mr-2"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <FiArrowLeft />
          </button>
          
          <div className="flex items-center">
            <div className="relative">
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 mr-3">
                <FiMessageCircle size={20} />
              </div>
              <span className="absolute bottom-0 right-2 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </div>
            
            <div>
              <h2 className="font-bold">{roomInfo?.name || 'Chat Room'}</h2>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{roomInfo?.users?.length || 0} online</span>
                {typingUsers.filter(u => u.roomId === roomId).length > 0 && (
                  <span className="ml-2 animate-pulse text-gray-400">• Someone is typing...</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            className="btn-icon mr-1"
            onClick={() => setShowUsersList(!showUsersList)}
            aria-label="Show users"
            title="Show room participants"
          >
            <FiUsers />
          </button>
          
          <div className="relative">
            <button 
              className="btn-icon"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
              title="More room options"
            >
              <FiMoreVertical />
            </button>
            
            {/* Dropdown menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                >
                  <div className="py-1">
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setShowMenu(false);
                        setShowUsersList(true);
                      }}
                      title="View all room participants"
                    >
                      <FiUsers className="mr-2" />
                      View Participants
                    </button>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setShowMenu(false);
                        // Show room info or other actions
                      }}
                      title="View room information"
                    >
                      <FiInfo className="mr-2" />
                      Room Info
                    </button>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={handleLeaveRoom}
                      title="Leave this chat room"
                    >
                      <FiLogOut className="mr-2" />
                      Leave Room
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Users sidebar */}
      <AnimatePresence>
        {showUsersList && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="fixed inset-y-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-30 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold">Room Participants</h3>
              <button 
                onClick={() => setShowUsersList(false)}
                className="btn-icon"
                aria-label="Close users list"
                title="Close participants list"
              >
                <FiX />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-60px)]">
              <div className="space-y-4">
                {roomInfo?.users?.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                      alt={user.username}
                      className="avatar mr-3"
                    />
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs flex items-center text-green-500">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        Online
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat messages */}
      <div className="chat-messages">
        {roomMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center">
            <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiMessageCircle size={40} />
            </div>
            <h3 className="text-xl font-medium mb-2">No messages yet</h3>
            <p className="max-w-md text-gray-500 dark:text-gray-400">
              Be the first to start the conversation in this room! Send a message below to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {roomMessages.map((msg, index) => {
              // Check if message is from current user - use multiple checks for reliability
              const isCurrentUser = 
                // Check by userId
                msg.userId === currentUser.id ||
                // Check by the sender object
                (msg.user?.id === currentUser.id) ||
                // Check by username as fallback
                (msg.username === currentUser.username) ||
                (msg.user?.username === currentUser.username);
              
              return (
                <motion.div
                  key={msg.id || index}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCurrentUser && (
                    <img
                      src={msg.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.username || 'User')}&background=random`}
                      alt={msg.user?.username || 'User'}
                      className="h-8 w-8 rounded-full mr-2 self-end"
                    />
                  )}
                  
                  <div className="max-w-xs space-y-1">
                    {!isCurrentUser && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {msg.user?.username || 'User'}
                      </div>
                    )}
                    
                    <div className={isCurrentUser ? 'message-bubble-sent' : 'message-bubble-received'}>
                      {msg.text}
                    </div>
                    
                    <div className={`text-xs text-gray-400 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  
                  {isCurrentUser && (
                    <img
                      src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random`}
                      alt={currentUser.username}
                      className="h-8 w-8 rounded-full ml-2 self-end"
                    />
                  )}
                </motion.div>
              );
            })}
            
            {/* Typing indicator */}
            <AnimatePresence>
              {typingUsers.filter(u => u.roomId === roomId).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
                >
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm italic">
                    {typingUsers
                      .filter(u => u.roomId === roomId)
                      .map(u => u.username)
                      .join(', ')} is typing...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Chat input */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="btn-icon text-gray-500 dark:text-gray-400"
            aria-label="Add emoji"
            title="Add emoji to message"
          >
            <FiSmile />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={() => handleTyping()}
            ref={messageInputRef}
            placeholder="Type a message..."
            className="input-field flex-1"
            autoFocus
            title="Type your message here"
          />
          
          <button
            type="submit"
            className="btn-primary p-2 rounded-full flex items-center justify-center"
            disabled={!message.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom; 