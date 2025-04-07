// ChatRoom component for real-time messaging
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
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
  FiSmile,
  FiTrash2,
  FiBold,
  FiItalic,
  FiUnderline,
  FiThumbsUp,
  FiHeart,
  FiLaugh,
  FiFrown
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showReactions, setShowReactions] = useState(null);
  
  // Sound effects
  const messageSound = useRef(typeof Audio !== 'undefined' ? new Audio('/sounds/message.mp3') : null);
  
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
    setIsLoading(false);
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
    
    // Limit message length
    if (message.length > 500) {
      alert('Message is too long! Maximum 500 characters allowed.');
      return;
    }
    
    setIsSending(true);
    
    try {
      console.log(`Sending message to room ${roomId}: "${message}"`);
      console.log('Message sent at:', new Date().toISOString());
      // Send message
      sendMessage(roomId, message.trim());
      
      // Play sound effect
      messageSound.current?.play().catch(err => console.log('Cannot play sound'));
      
      // Clear input
      setMessage('');
      
      // Clear typing status
      sendTypingStatus(roomId, false);
      
      // Focus the input field
      messageInputRef.current?.focus();
      
      // Reset sending state after a short delay to show animation
      setTimeout(() => setIsSending(false), 300);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error toast to user
      alert(`Failed to send message: ${error.message}`);
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Send on Enter, but not with Shift+Enter (which creates a new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
    handleTyping();
  };
  
  // Handle leaving the room
  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      leaveRoom(roomId);
      navigate('/');
    }
  };

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  // Apply text formatting
  const applyFormatting = (type) => {
    const input = messageInputRef.current;
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = message;
    const selectedText = text.substring(start, end);
    
    let formattedText = '';
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      default:
        return;
    }
    
    const newText = text.substring(0, start) + formattedText + text.substring(end);
    setMessage(newText);
    
    // Focus back on input after formatting
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + 2, end + 2);
    }, 0);
  };
  
  // Render formatted text
  const renderFormattedText = (text) => {
    // Replace markdown-style formatting
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    
    // Then process URLs
    const urlPattern = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const parts = formattedText.split(urlPattern);
    
    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <a 
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };
  
  // Replace formatMessageText with renderFormattedText
  const formatMessageText = (text) => {
    return renderFormattedText(text);
  };
  
  // Handle adding a reaction to a message
  const handleAddReaction = (messageId, reaction) => {
    // In a real app, this would send the reaction to the server
    console.log(`Adding reaction ${reaction} to message ${messageId}`);
    
    // For demo purposes, we'll just update the local state
    setRoomMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId) {
          // Initialize reactions if they don't exist
          if (!msg.reactions) {
            msg.reactions = {};
          }
          
          // Initialize this reaction if it doesn't exist
          if (!msg.reactions[reaction]) {
            msg.reactions[reaction] = [];
          }
          
          // Add the current user to the reaction if not already there
          if (!msg.reactions[reaction].includes(currentUser.id)) {
            msg.reactions[reaction].push(currentUser.id);
          }
          
          return { ...msg };
        }
        return msg;
      })
    );
    
    // Close the reactions menu
    setShowReactions(null);
  };
  
  // Handle removing a reaction from a message
  const handleRemoveReaction = (messageId, reaction) => {
    // In a real app, this would send the removal to the server
    console.log(`Removing reaction ${reaction} from message ${messageId}`);
    
    // For demo purposes, we'll just update the local state
    setRoomMessages(prevMessages => 
      prevMessages.map(msg => {
        if (msg.id === messageId && msg.reactions && msg.reactions[reaction]) {
          // Remove the current user from the reaction
          msg.reactions[reaction] = msg.reactions[reaction].filter(id => id !== currentUser.id);
          
          // If no one reacted with this emoji, remove it
          if (msg.reactions[reaction].length === 0) {
            delete msg.reactions[reaction];
          }
          
          return { ...msg };
        }
        return msg;
      })
    );
  };
  
  // Check if the current user has reacted with a specific emoji
  const hasReacted = (message, reaction) => {
    return message.reactions && 
           message.reactions[reaction] && 
           message.reactions[reaction].includes(currentUser.id);
  };
  
  // Get reaction count for a specific emoji
  const getReactionCount = (message, reaction) => {
    return message.reactions && message.reactions[reaction] ? message.reactions[reaction].length : 0;
  };
  
  // Render reactions for a message
  const renderReactions = (message) => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) {
      return null;
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(message.reactions).map(([reaction, userIds]) => (
          <button
            key={reaction}
            className={`flex items-center px-1.5 py-0.5 rounded-full text-xs ${
              hasReacted(message, reaction) 
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => hasReacted(message, reaction) 
              ? handleRemoveReaction(message.id, reaction)
              : handleAddReaction(message.id, reaction)
            }
            title={userIds.map(id => {
              const user = users.find(u => u.id === id);
              return user ? user.username : 'Unknown user';
            }).join(', ')}
          >
            {getReactionEmoji(reaction)} {userIds.length}
          </button>
        ))}
      </div>
    );
  };
  
  // Get emoji for reaction type
  const getReactionEmoji = (reaction) => {
    switch (reaction) {
      case 'thumbsup': return '👍';
      case 'heart': return '❤️';
      case 'laugh': return '😂';
      case 'sad': return '😢';
      default: return reaction;
    }
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
                      className="flex w-full items-center px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      onClick={() => {
                        setShowMenu(false);
                        setRoomMessages([]);
                      }}
                      title="Clear chat history"
                    >
                      <FiTrash2 className="mr-2" />
                      Clear Chat
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : roomMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center">
            <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiMessageCircle size={40} />
            </div>
            <h3 className="text-xl font-medium mb-2">Chat is empty</h3>
            <p className="max-w-md text-gray-500 dark:text-gray-400">
              Start a conversation! Send a message below to break the ice.
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
                      {formatMessageText(msg.text)}
                    </div>
                    
                    {renderReactions(msg)}
                    
                    <div className={`text-xs text-gray-400 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                      <span className="mx-1">•</span>
                      <span title={new Date(msg.timestamp).toLocaleString()}>
                        {format(new Date(msg.timestamp), 'h:mm a')}
                      </span>
                      {isCurrentUser && <span className="ml-1 text-green-500">✓</span>}
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
            
            {/* Add reaction button */}
            <div className="flex justify-center mt-2">
              <button
                className="btn-icon text-gray-500 dark:text-gray-400"
                onClick={() => setShowReactions(showReactions === null ? 'new' : null)}
                title="Add reaction"
              >
                <FiSmile />
              </button>
              
              {showReactions === 'new' && (
                <div className="absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 flex space-x-1">
                  <button
                    className="btn-icon text-gray-500 dark:text-gray-400 hover:text-primary-500"
                    onClick={() => handleAddReaction('new', 'thumbsup')}
                    title="👍 Thumbs up"
                  >
                    👍
                  </button>
                  <button
                    className="btn-icon text-gray-500 dark:text-gray-400 hover:text-primary-500"
                    onClick={() => handleAddReaction('new', 'heart')}
                    title="❤️ Heart"
                  >
                    ❤️
                  </button>
                  <button
                    className="btn-icon text-gray-500 dark:text-gray-400 hover:text-primary-500"
                    onClick={() => handleAddReaction('new', 'laugh')}
                    title="😂 Laugh"
                  >
                    😂
                  </button>
                  <button
                    className="btn-icon text-gray-500 dark:text-gray-400 hover:text-primary-500"
                    onClick={() => handleAddReaction('new', 'sad')}
                    title="😢 Sad"
                  >
                    😢
                  </button>
                </div>
              )}
            </div>
            
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
          <div className="relative">
            <button
              type="button"
              className="btn-icon text-gray-500 dark:text-gray-400"
              aria-label="Formatting options"
              title="Text formatting options"
              onClick={() => setShowFormatting(!showFormatting)}
            >
              <FiBold />
            </button>
            
            {showFormatting && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 flex space-x-1">
                <button
                  type="button"
                  className="btn-icon text-gray-500 dark:text-gray-400"
                  onClick={() => applyFormatting('bold')}
                  title="Bold"
                >
                  <FiBold />
                </button>
                <button
                  type="button"
                  className="btn-icon text-gray-500 dark:text-gray-400"
                  onClick={() => applyFormatting('italic')}
                  title="Italic"
                >
                  <FiItalic />
                </button>
                <button
                  type="button"
                  className="btn-icon text-gray-500 dark:text-gray-400"
                  onClick={() => applyFormatting('underline')}
                  title="Underline"
                >
                  <FiUnderline />
                </button>
              </div>
            )}
          </div>
          
          <button
            type="button"
            className="btn-icon text-gray-500 dark:text-gray-400"
            aria-label="Add emoji"
            title="Add emoji to message"
          >
            <FiSmile />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={messageInputRef}
              placeholder="Write something nice..."
              className="input-field w-full"
              autoFocus
              title="Type your message here (Press Enter to send)"
              maxLength={500}
            />
            <div className="absolute right-2 bottom-1 text-xs text-gray-400">
              {message.length}/500
            </div>
          </div>
          
          <button
            type="submit"
            className={`btn-primary p-2 rounded-full flex items-center justify-center ${isSending ? 'animate-pulse' : ''}`}
            disabled={!message.trim() || isSending}
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