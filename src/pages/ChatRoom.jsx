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
  FiMessageCircle
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
    
    // Set room info
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setRoomInfo(room);
    }
  }, [currentUser, roomId, rooms, navigate]);
  
  // Set active room and update messages when roomId changes
  useEffect(() => {
    if (messages[roomId]) {
      console.log(`Loading ${messages[roomId].length} messages for room ${roomId}`);
      setRoomMessages(messages[roomId]);
    } else {
      console.log(`No messages found for room ${roomId}`);
      setRoomMessages([]);
    }
  }, [roomId, messages]);
  
  // Listen for user join/leave events and add system messages
  useEffect(() => {
    if (!socket) return;
    
    const handleUserJoined = (data) => {
      if (data.room.id !== roomId) return;
      
      // Don't show message for the current user
      if (data.user.id === socket.id) return;
      
      // Add system message
      const systemMessage = {
        id: `system_${Date.now()}`,
        isSystem: true,
        text: data.message,
        timestamp: new Date().toISOString()
      };
      
      setRoomMessages(prev => [...prev, systemMessage]);
    };
    
    const handleUserLeft = (data) => {
      if (data.room.id !== roomId) return;
      
      // Add system message
      const systemMessage = {
        id: `system_${Date.now()}`,
        isSystem: true,
        text: data.message,
        timestamp: new Date().toISOString()
      };
      
      setRoomMessages(prev => [...prev, systemMessage]);
    };
    
    socket.on('user_joined_room', handleUserJoined);
    socket.on('user_left_room', handleUserLeft);
    
    return () => {
      socket.off('user_joined_room', handleUserJoined);
      socket.off('user_left_room', handleUserLeft);
    };
  }, [socket, roomId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);
  
  // Automatically focus the message input
  useEffect(() => {
    messageInputRef.current?.focus();
  }, [roomId]);
  
  // Handle typing status
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(roomId, true);
    }
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set a new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(roomId, false);
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    console.log(`Sending message to room ${roomId}: "${message.trim()}"`);
    
    try {
      sendMessage(roomId, message.trim());
      setMessage('');
      
      // Clear typing status
      setIsTyping(false);
      sendTypingStatus(roomId, false);
      
      // Focus back to input
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add an error state and show it to the user
    }
  };
  
  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    navigate('/dashboard');
  };

  // Get who's typing
  const whoIsTyping = typingUsers[roomId]?.filter(user => user.id !== currentUser?.id) || [];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Chat header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4">
              <FiArrowLeft size={20} />
            </Link>
            
            <div className="flex items-center">
              <FiMessageCircle className="text-blue-500 h-6 w-6 mr-2" />
              <h1 className="font-bold text-gray-900 dark:text-white">
                {roomInfo?.name || `Room ${roomId.split('_')[1]}`}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={() => setShowUsersList(true)} 
              className="btn-secondary flex items-center text-xs mr-2"
            >
              <FiUsers className="mr-1" />
              <span className="hidden sm:inline">Users</span>
              <span className="inline sm:hidden ml-1">({roomInfo?.users?.length || 0})</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <FiMoreVertical />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowUsersList(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiUsers className="inline mr-2" />
                      Show Users
                    </button>
                    <button
                      onClick={handleLeaveRoom}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiLogOut className="inline mr-2" />
                      Leave Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Users list sidebar */}
      <AnimatePresence>
        {showUsersList && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-0 z-50 flex"
          >
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowUsersList(false)}  
            ></div>
            
            <div className="relative ml-auto w-80 h-full bg-white dark:bg-gray-800 shadow-xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Room Users</h2>
                <button
                  onClick={() => setShowUsersList(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiArrowLeft />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center">
                    <FiInfo className="mr-2" />
                    Room Information
                  </h3>
                  <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    {roomInfo?.name || `Room ${roomId.split('_')[1]}`}
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-500">
                    {roomInfo?.users?.length || 0} users active
                  </p>
                </div>
                
                <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Active Users
                </h3>
                
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {roomInfo?.users?.map((roomUser) => {
                    const user = users.find(u => u.id === roomUser.id);
                    if (!user) return null;
                    
                    return (
                      <li key={user.id} className="py-3 flex items-center">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="h-8 w-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.username}
                            {user.id === currentUser.id && (
                              <span className="ml-2 text-xs text-blue-500">(You)</span>
                            )}
                          </p>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-4">
          {roomMessages.length > 0 ? (
            roomMessages.map((msg) => {
              // Handle system messages differently
              if (msg.isSystem) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div className="text-center py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300 max-w-xs">
                      {msg.text}
                    </div>
                  </motion.div>
                );
              }
              
              const isSelf = msg.sender?.id === currentUser.id || msg.sender?.id === socket?.id;
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  {!isSelf && (
                    <img
                      src={msg.sender?.avatar}
                      alt={msg.sender?.username}
                      className="h-8 w-8 rounded-full mr-2 self-end"
                    />
                  )}
                  
                  <div className={`max-w-xs sm:max-w-md`}>
                    {!isSelf && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 ml-1 mb-1">
                        {msg.sender?.username}
                      </div>
                    )}
                    
                    <div className={isSelf ? 'message-bubble-sent' : 'message-bubble-received'}>
                      <p>{msg.text}</p>
                      <div className="text-xs opacity-70 text-right mt-1">
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-2">No messages yet.</p>
              <p>Send the first message to start the conversation!</p>
            </div>
          )}
          
          {/* Who's typing indicator */}
          {whoIsTyping.length > 0 && (
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <div className="flex space-x-1 mr-2">
                <div className="animate-bounce">•</div>
                <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</div>
                <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>•</div>
              </div>
              {whoIsTyping.length === 1 
                ? `${whoIsTyping[0].username} is typing...` 
                : `${whoIsTyping.length} people are typing...`}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Chat input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto flex items-center"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleTyping}
            ref={messageInputRef}
            placeholder="Type a message..."
            className="input-field flex-1 mr-2"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={`btn-primary p-3 rounded-full ${!message.trim() && 'opacity-50 cursor-not-allowed'}`}
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom; 