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
  FiFrown,
  FiCopy,
  FiReply,
  FiEdit,
  FiSearch,
  FiChevronUp
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [swipedMessageId, setSwipedMessageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionMessage, setReactionMessage] = useState(null);
  const [reactions, setReactions] = useState({});
  
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
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roomMessages, autoScroll]);
  
  // Check if we need to show the scroll button
  useEffect(() => {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatMessages;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setAutoScroll(isNearBottom);
      setShowScrollButton(!isNearBottom);
    };
    
    chatMessages.addEventListener('scroll', handleScroll);
    return () => chatMessages.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Scroll to bottom when clicking the scroll button
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
  };
  
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
  
  const bubbleVariants = {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 }
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
  const handleAddReaction = (emoji, messageId) => {
    const reaction = {
      emoji: emoji.native,
      userId: currentUser.id,
      username: currentUser.username
    };
    
    const messageReactions = reactions[messageId] || [];
    const existingReactionIndex = messageReactions.findIndex(
      r => r.emoji === emoji.native && r.userId === currentUser.id
    );
    
    let updatedReactions;
    if (existingReactionIndex >= 0) {
      // Remove reaction if it already exists
      updatedReactions = {
        ...reactions,
        [messageId]: [
          ...messageReactions.slice(0, existingReactionIndex),
          ...messageReactions.slice(existingReactionIndex + 1)
        ]
      };
    } else {
      // Add new reaction
      updatedReactions = {
        ...reactions,
        [messageId]: [...messageReactions, reaction]
      };
    }
    
    setReactions(updatedReactions);
    socket.emit('message_reaction', {
      roomId,
      messageId,
      reaction
    });
    setShowReactionPicker(false);
  };
  
  useEffect(() => {
    socket.on('message_reaction', ({ messageId, reaction }) => {
      setReactions(prev => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), reaction]
      }));
    });
    
    socket.on('reaction_removed', ({ messageId, userId }) => {
      setReactions(prev => ({
        ...prev,
        [messageId]: (prev[messageId] || []).filter(r => r.userId !== userId)
      }));
    });
    
    return () => {
      socket.off('message_reaction');
      socket.off('reaction_removed');
    };
  }, []);
  
  const renderReactions = (message) => {
    const messageReactions = reactions[message.id] || [];
    if (messageReactions.length === 0) return null;
    
    // Group reactions by emoji
    const groupedReactions = messageReactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {});
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(groupedReactions).map(([emoji, reactions]) => {
          const hasReacted = reactions.some(r => r.userId === currentUser.id);
          
          return (
            <button
              key={emoji}
              onClick={() => handleAddReaction({ native: emoji }, message.id)}
              className={`
                inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs
                ${hasReacted ? 
                  'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 
                  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }
                hover:bg-primary-200 dark:hover:bg-primary-800
                transition-colors duration-200
              `}
              title={reactions.map(r => r.username).join(', ')}
            >
              <span>{emoji}</span>
              <span>{reactions.length}</span>
            </button>
          );
        })}
      </div>
    );
  };
  
  // Handle message actions
  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    // Could show a toast notification here
  };
  
  const handleReplyToMessage = (msg) => {
    setMessage(`> ${msg.user?.username || 'User'}: ${msg.text}\n\n`);
    messageInputRef.current?.focus();
  };
  
  const handleEditMessage = (msg) => {
    if (msg.userId === currentUser.id) {
      setMessage(msg.text);
      messageInputRef.current?.focus();
      // In a real app, you'd want to mark this as an edit
    }
  };
  
  const handleDeleteMessage = (msg) => {
    if (msg.userId === currentUser.id) {
      if (window.confirm('Are you sure you want to delete this message?')) {
        setRoomMessages(prev => prev.filter(m => m.id !== msg.id));
        // In a real app, you'd want to send this to the server
      }
    }
  };
  
  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setSelectedResultIndex(-1);
      return;
    }
    
    // Search through messages
    const results = roomMessages.reduce((acc, msg, index) => {
      if (msg.text.toLowerCase().includes(query.toLowerCase())) {
        acc.push({ index, message: msg });
      }
      return acc;
    }, []);
    
    setSearchResults(results);
    setSelectedResultIndex(results.length - 1);
  };
  
  // Navigate search results
  const navigateSearch = (direction) => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'up') {
      newIndex = selectedResultIndex > 0 ? selectedResultIndex - 1 : searchResults.length - 1;
    } else {
      newIndex = selectedResultIndex < searchResults.length - 1 ? selectedResultIndex + 1 : 0;
    }
    
    setSelectedResultIndex(newIndex);
    
    // Scroll to the selected message
    const messageElement = document.getElementById(`message-${searchResults[newIndex].message.id}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Group messages by user and time
  const groupMessages = (messages) => {
    return messages.reduce((groups, message, index) => {
      const prevMessage = messages[index - 1];
      
      // Check if this message should be grouped with the previous one
      const shouldGroup = prevMessage && 
        // Same user
        prevMessage.userId === message.userId &&
        // Within 2 minutes
        (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 120000);
      
      if (shouldGroup) {
        // Add to the last group
        const lastGroup = groups[groups.length - 1];
        lastGroup.messages.push(message);
        return groups;
      } else {
        // Start a new group
        groups.push({
          id: message.id,
          userId: message.userId,
          user: message.user,
          messages: [message]
        });
        return groups;
      }
    }, []);
  };
  
  return (
    <div className="chat-container">
      {/* Chat header */}
      <div className="chat-header">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="btn-icon mr-2 md:hidden"
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
              <h2 className="font-bold truncate max-w-[150px] md:max-w-none">{roomInfo?.name || 'Chat Room'}</h2>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{roomInfo?.users?.length || 0} online</span>
                {typingUsers.filter(u => u.roomId === roomId).length > 0 && (
                  <span className="ml-2 animate-pulse text-gray-400 hidden md:inline">• Someone is typing...</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            className="btn-icon mr-1"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search messages"
            title="Search messages"
          >
            <FiSearch />
          </button>
          
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
      
      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-2 flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="input-field w-full pl-8"
                  autoFocus
                />
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              
              {searchResults.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {selectedResultIndex + 1} of {searchResults.length}
                  </span>
                  <div className="flex">
                    <button
                      className="btn-icon"
                      onClick={() => navigateSearch('up')}
                      title="Previous result"
                    >
                      <FiChevronUp />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => navigateSearch('down')}
                      title="Next result"
                    >
                      <FiChevronDown />
                    </button>
                  </div>
                </div>
              )}
              
              <button
                className="btn-icon"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                title="Close search"
              >
                <FiX />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Users sidebar */}
      <AnimatePresence>
        {showUsersList && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="fixed inset-y-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-30 overflow-hidden md:relative md:shadow-none"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold">Room Participants</h3>
              <button 
                onClick={() => setShowUsersList(false)}
                className="btn-icon md:hidden"
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
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center p-4">
            <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiMessageCircle size={40} />
            </div>
            <h3 className="text-xl font-medium mb-2">Chat is empty</h3>
            <p className="max-w-md text-gray-500 dark:text-gray-400">
              Start a conversation! Send a message below to break the ice.
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {groupMessages(roomMessages).map((group) => {
              const isCurrentUser = 
                // Check by userId
                group.userId === currentUser.id ||
                // Check by the sender object
                (group.user?.id === currentUser.id) ||
                // Check by username as fallback
                (group.user?.username === currentUser.username);
              
              return (
                <div key={group.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  {!isCurrentUser && (
                    <img
                      src={group.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.user?.username || 'User')}&background=random`}
                      alt={group.user?.username || 'User'}
                      className="h-8 w-8 rounded-full mr-2 self-start sticky top-0"
                    />
                  )}
                  
                  <div className="max-w-xs space-y-1">
                    {!isCurrentUser && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        {group.user?.username || 'User'}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      {group.messages.map((msg, msgIndex) => {
                        const isHighlighted = searchResults.length > 0 && 
                          selectedResultIndex >= 0 && 
                          searchResults[selectedResultIndex].message.id === msg.id;
                        
                        const isFirstInGroup = msgIndex === 0;
                        const isLastInGroup = msgIndex === group.messages.length - 1;
                        
                        return (
                          <motion.div
                            key={msg.id}
                            id={`message-${msg.id}`}
                            variants={messageVariants}
                            initial="hidden"
                            animate="visible"
                            className={`group ${isHighlighted ? 'bg-yellow-50 dark:bg-yellow-900/20 -mx-4 px-4 py-2 rounded-lg' : ''}`}
                          >
                            <motion.div
                              drag="x"
                              dragConstraints={{ left: 0, right: 0 }}
                              onDragEnd={(e, { offset }) => {
                                if (Math.abs(offset.x) > 50) {
                                  setSwipedMessageId(msg.id);
                                }
                              }}
                              className="relative"
                            >
                              <div 
                                className={`
                                  p-3 break-words relative
                                  ${isCurrentUser ? 'bg-primary-500 text-white ml-auto' : 'bg-gray-100 dark:bg-gray-800'}
                                  ${isFirstInGroup ? (isCurrentUser ? 'rounded-tr-lg' : 'rounded-tl-lg') : ''}
                                  ${isLastInGroup ? (isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none') : ''}
                                  rounded-lg
                                  hover:shadow-md transition-shadow duration-200
                                `}
                              >
                                <motion.div
                                  variants={bubbleVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  {formatMessageText(msg.text)}
                                </motion.div>
                                
                                {isLastInGroup && (
                                  <div 
                                    className={`absolute bottom-0 ${isCurrentUser ? 'right-0 transform translate-x-2' : 'left-0 transform -translate-x-2'} 
                                      w-4 h-4 ${isCurrentUser ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'}
                                    `} 
                                    style={{
                                      clipPath: isCurrentUser ? 
                                        'polygon(0 0, 100% 0, 100% 100%)' : 
                                        'polygon(0 0, 100% 0, 0 100%)'
                                    }}
                                  />
                                )}
                              </div>
                              
                              {/* Message actions */}
                              {swipedMessageId === msg.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className={`absolute ${isCurrentUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} 
                                    top-0 flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1`}
                                >
                                  <button
                                    className="btn-icon text-gray-500 dark:text-gray-400 hover:text-primary-500"
                                    onClick={() => {
                                      handleCopyMessage(msg.text);
                                      setSwipedMessageId(null);
                                    }}
                                    title="Copy message"
                                  >
                                    <FiCopy size={16} />
                                  </button>
                                  <button
                                    className="btn-icon text-gray-500 dark:text-gray-400 hover:text-primary-500"
                                    onClick={() => {
                                      handleReplyToMessage(msg);
                                      setSwipedMessageId(null);
                                    }}
                                    title="Reply to message"
                                  >
                                    <FiReply size={16} />
                                  </button>
                                  {isCurrentUser && (
                                    <>
                                      <button
                                        className="btn-icon text-gray-500 dark:text-gray-400 hover:text-primary-500"
                                        onClick={() => {
                                          handleEditMessage(msg);
                                          setSwipedMessageId(null);
                                        }}
                                        title="Edit message"
                                      >
                                        <FiEdit size={16} />
                                      </button>
                                      <button
                                        className="btn-icon text-red-500 hover:text-red-600"
                                        onClick={() => {
                                          handleDeleteMessage(msg);
                                          setSwipedMessageId(null);
                                        }}
                                        title="Delete message"
                                      >
                                        <FiTrash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                </motion.div>
                              )}
                            </motion.div>
                            
                            {/* Reaction picker */}
                            <button
                              onClick={() => {
                                setReactionMessage(msg);
                                setShowReactionPicker(true);
                              }}
                              className="absolute -right-8 top-1/2 transform -translate-y-1/2 
                                opacity-0 group-hover:opacity-100
                                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                transition-opacity duration-200"
                            >
                              <FiSmile className="w-4 h-4" />
                            </button>
                            
                            {/* Render reactions */}
                            {renderReactions(msg)}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {isCurrentUser && (
                    <img
                      src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random`}
                      alt={currentUser.username}
                      className="h-8 w-8 rounded-full ml-2 self-start sticky top-0"
                    />
                  )}
                </div>
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
            
            {/* Scroll to bottom button */}
            {showScrollButton && (
              <button
                className="fixed bottom-24 right-4 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
                onClick={scrollToBottom}
                title="Scroll to bottom"
              >
                <FiChevronDown size={20} />
              </button>
            )}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Chat input */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 p-4">
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
      
      {/* Reaction picker */}
      {showReactionPicker && reactionMessage?.id === msg.id && (
        <div className="absolute right-0 bottom-full mb-2 z-50">
          <div className="relative">
            <Picker
              data={data}
              onEmojiSelect={(emoji) => handleAddReaction(emoji, msg.id)}
              theme={isDarkMode ? 'dark' : 'light'}
              previewPosition="none"
              skinTonePosition="none"
              searchPosition="none"
              perLine={8}
              maxFrequentRows={1}
            />
            <button
              onClick={() => setShowReactionPicker(false)}
              className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1
                text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                shadow-md"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom; 