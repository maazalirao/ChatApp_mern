// ChatRoom component for real-time messaging
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  FiChevronUp,
  FiSun,
  FiMoon,
  FiSettings,
  FiMic,
  FiPlay,
  FiPause,
  FiStopCircle,
  FiClock,
  FiAlertCircle,
  FiMinus,
  FiPaperclip,
  FiFile,
  FiImage,
  FiDownload,
  FiMaximize,
  FiUpload,
  FiAtSign,
  FiCornerUpRight,
  FiPin,
  FiPieChart,
  FiBarChart2,
  FiCheckCircle,
  FiPlusCircle,
  FiMinusCircle,
  FiPlusSquare,
  FiCode,
  FiCheck,
  FiMessageSquare,
  FiCornerUpLeft,
  FiMenu,
  FiChevronRight,
  FiMinimize,
  FiPrinter,
  FiBell,
  FiBellOff,
  FiCalendar,
  FiGlobe,
  FiBookmark,
  FiShare,
  FiExternalLink,
  FiFilter
} from 'react-icons/fi';
import { BsEmojiSmile, BsThreeDotsVertical, BsArrowLeft } from "react-icons/bs";
import { RiGifLine } from "react-icons/ri";
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { debounce } from 'lodash';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || 'indigo');
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true' || false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState({});
  const [playingAudio, setPlayingAudio] = useState(null);
  const [userStatus, setUserStatus] = useState(localStorage.getItem('userStatus') || 'online');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [files, setFiles] = useState({});
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showThread, setShowThread] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState("");
  const [gifResults, setGifResults] = useState([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [activePolls, setActivePolls] = useState([]);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [copiedSnippetId, setCopiedSnippetId] = useState(null);
  const [showPinned, setShowPinned] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('chatSoundEnabled') !== 'false' // default to true
  );
  const [readReceipts, setReadReceipts] = useState({});
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [showScheduledList, setShowScheduledList] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('targetLanguage') || 'en');
  const [bookmarkedMessages, setBookmarkedMessages] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [forwardToRoom, setForwardToRoom] = useState('');
  const [linkPreviews, setLinkPreviews] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    messageTypes: [],
    fromUsers: [],
    withMedia: false,
    onlyMentions: false,
    dateRange: {
      start: '',
      end: ''
    }
  });
  
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
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  
  // Initialize audio context for visualizations
  const audioContextRef = useRef(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);
  
  // Available theme colors
  const themeColors = [
    { name: 'indigo', primary: '#6366f1', dark: '#4338ca', light: '#e0e7ff' },
    { name: 'violet', primary: '#8b5cf6', dark: '#6d28d9', light: '#ede9fe' },
    { name: 'pink', primary: '#ec4899', dark: '#be185d', light: '#fce7f3' },
    { name: 'blue', primary: '#3b82f6', dark: '#1d4ed8', light: '#dbeafe' },
    { name: 'green', primary: '#10b981', dark: '#047857', light: '#d1fae5' },
    { name: 'red', primary: '#ef4444', dark: '#b91c1c', light: '#fee2e2' },
    { name: 'amber', primary: '#f59e0b', dark: '#b45309', light: '#fef3c7' },
    { name: 'teal', primary: '#14b8a6', dark: '#0f766e', light: '#ccfbf1' },
  ];
  
  // Apply theme color to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary-500', themeColors.find(c => c.name === themeColor)?.primary || '#6366f1');
    document.documentElement.style.setProperty('--color-primary-700', themeColors.find(c => c.name === themeColor)?.dark || '#4338ca');
    document.documentElement.style.setProperty('--color-primary-100', themeColors.find(c => c.name === themeColor)?.light || '#e0e7ff');
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);
  
  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);
  
  // Toggle theme settings
  const toggleThemeSettings = () => {
    setShowThemeSettings(!showThemeSettings);
    setShowMenu(false);
  };
  
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
  
  // Enhanced typing indicator renderer
  const renderTypingIndicator = () => {
    const typingUsersInRoom = typingUsers.filter(u => u.roomId === roomId);
    if (typingUsersInRoom.length === 0) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 max-w-xs"
      >
        <div className="flex -space-x-2">
          {typingUsersInRoom.slice(0, 3).map(user => {
            const userObj = roomInfo?.users?.find(u => u.id === user.id);
            return (
              <div key={user.id} className="relative">
                <img
                  src={userObj?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                  alt={user.username}
                  className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-800"
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border border-white dark:border-gray-800 animate-pulse"></div>
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-col items-start">
          <div className="flex space-x-1 items-center">
            <div className="typing-animation flex space-x-1">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            {typingUsersInRoom.length === 1 ? (
              <span>{typingUsersInRoom[0].username} is typing...</span>
            ) : typingUsersInRoom.length === 2 ? (
              <span>{typingUsersInRoom[0].username} and {typingUsersInRoom[1].username} are typing...</span>
            ) : (
              <span>Multiple people are typing...</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Add CSS for typing animation - place in a useEffect to add to document once
  useEffect(() => {
    // If the stylesheet already exists, don't add it again
    if (document.getElementById('typing-animation-style')) return;
    
    const style = document.createElement('style');
    style.id = 'typing-animation-style';
    style.innerHTML = `
      .typing-animation {
        display: flex;
        align-items: center;
      }
      
      .typing-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #9CA3AF;
        margin: 0 1px;
      }
      
      .typing-dot:nth-child(1) {
        animation: typing-dot 1.4s infinite;
        animation-delay: 0s;
      }
      
      .typing-dot:nth-child(2) {
        animation: typing-dot 1.4s infinite;
        animation-delay: 0.2s;
      }
      
      .typing-dot:nth-child(3) {
        animation: typing-dot 1.4s infinite;
        animation-delay: 0.4s;
      }
      
      @keyframes typing-dot {
        0% {
          transform: scale(1);
          opacity: 0.6;
        }
        
        20% {
          transform: scale(1.4);
          opacity: 1;
        }
        
        50%, 100% {
          transform: scale(1);
          opacity: 0.6;
        }
      }
      
      @media (prefers-color-scheme: dark) {
        .typing-dot {
          background-color: #D1D5DB;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Clean up the style when the component unmounts
    return () => {
      const styleElement = document.getElementById('typing-animation-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  // Enhanced typing status handling with debounce
  const debouncedSendTypingStatus = useCallback(
    debounce((roomId, isTyping) => {
      sendTypingStatus(roomId, isTyping);
    }, 500),
    [sendTypingStatus]
  );
  
  // Updated handleTyping with better debounce
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // Send typing status with debounce
    debouncedSendTypingStatus(roomId, true);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing status after inactivity
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(roomId, false);
    }, 3000);
    
    setTypingTimeout(timeout);
  };
  
  // Check if text contains @mentions and get the current mention search
  const checkForMentions = (text, cursorPos) => {
    // Find the @ character before the cursor position
    const beforeCursor = text.substring(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && (atIndex === 0 || beforeCursor[atIndex - 1] === ' ')) {
      // Get the text between @ and cursor
      const searchText = beforeCursor.substring(atIndex + 1);
      
      // Check if search text contains a space (mention completed)
      if (!searchText.includes(' ')) {
        setMentionSearch(searchText.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    
    // No valid mention search
    setShowMentions(false);
    setMentionSearch('');
  };
  
  // Filter users for mentioning
  const filteredUsers = useMemo(() => {
    if (!mentionSearch) return roomInfo?.users || [];
    
    return (roomInfo?.users || []).filter(user => 
      user.username.toLowerCase().includes(mentionSearch.toLowerCase())
    );
  }, [mentionSearch, roomInfo?.users]);
  
  // Handle input change with mention detection
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Save cursor position
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    // Check for @mentions
    checkForMentions(newValue, cursorPos);
  };
  
  // Handle mention selection with keyboard
  const handleMentionKeyDown = (e) => {
    if (!showMentions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex(prev => (prev + 1) % filteredUsers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filteredUsers[mentionIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowMentions(false);
    }
  };
  
  // Add the selected mention to the message
  const insertMention = (user) => {
    if (!user) return;
    
    const beforeCursor = message.substring(0, cursorPosition);
    const afterCursor = message.substring(cursorPosition);
    
    // Find the @ character before the cursor
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      // Replace from @ to cursor with @username
      const newMessage = 
        beforeCursor.substring(0, atIndex) + 
        `@${user.username} ` + 
        afterCursor;
      
      setMessage(newMessage);
      
      // Update cursor position after the inserted mention
      const newCursorPos = atIndex + user.username.length + 2; // +2 for @ and space
      
      // Focus and set cursor position after a small delay
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus();
          messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    
    // Hide mentions dropdown
    setShowMentions(false);
  };
  
  // Format message text with mentions highlighted
  const formatMessageWithMentions = (text) => {
    if (!text) return null;
    
    // Regular expression to find @mentions
    const mentionRegex = /@(\w+)/g;
    
    // Split the text by mentions
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // Add the mention
      parts.push({
        type: 'mention',
        username: match[1],
        raw: match[0]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    // Render parts
    return (
      <>
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          } else if (part.type === 'mention') {
            const mentionedUser = roomInfo?.users?.find(
              user => user.username.toLowerCase() === part.username.toLowerCase()
            );
            
            return (
              <span 
                key={index}
                className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-1 rounded"
              >
                {part.raw}
              </span>
            );
          }
          return null;
        })}
      </>
    );
  };
  
  // Start a reply to a message
  const startReply = (msg) => {
    setReplyToMessage(msg);
    // Focus the input field
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };
  
  // Cancel reply
  const cancelReply = () => {
    setReplyToMessage(null);
  };
  
  // Toggle sound notifications
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('chatSoundEnabled', newState.toString());
    
    // Show toast notification
    const message = newState ? 'Notifications unmuted' : 'Notifications muted';
    showToast(message);
  };
  
  // Update message sound effects with sound toggle
  useEffect(() => {
    messageSound.current = typeof Audio !== 'undefined' ? new Audio('/sounds/message.mp3') : null;
    
    return () => {
      if (messageSound.current) {
        messageSound.current.pause();
        messageSound.current = null;
      }
    };
  }, []);
  
  // Play sound only if enabled
  const playMessageSound = () => {
    if (soundEnabled && messageSound.current) {
      messageSound.current.play().catch(err => console.log('Cannot play sound', err));
    }
  };
  
  // Modify the handleSendMessage function to handle replies
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
      
      // Add reply information if replying to a message
      const messageData = {
        text: message.trim(),
        roomId,
        replyTo: replyToMessage ? {
          id: replyToMessage.id,
          text: replyToMessage.text?.substring(0, 50) || 'Message',
          userId: replyToMessage.userId,
          username: replyToMessage.user?.username || 'User'
        } : null
      };
      
      // Send message
      sendMessage(roomId, message.trim());
      
      // Play sound effect
      playMessageSound();
      
      // Clear input and reply state
      setMessage('');
      setReplyToMessage(null);
      
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
  
  // Render the reply preview for a message
  const renderReplyPreview = (msg) => {
    if (!msg.replyTo) return null;
    
    return (
      <div className="mb-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 border-l-2 border-primary-500 rounded text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
        <FiCornerUpRight size={12} />
        <span className="font-medium">{msg.replyTo.username}</span>
        <span className="truncate">{msg.replyTo.text}</span>
      </div>
    );
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
  
  // Send file message
  const sendFileMessage = (fileId) => {
    const file = files[fileId];
    if (!file) return;
    
    // Create file message
    const fileMessage = {
      id: `file-msg-${Date.now()}`,
      roomId,
      userId: currentUser.id,
      user: currentUser,
      timestamp: new Date().toISOString(),
      type: 'file',
      fileId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    };
    
    // Add to messages
    setRoomMessages(prev => [...prev, fileMessage]);
    
    // Play the send sound
    playMessageSound();
  };
  
  // Download file
  const downloadFile = (fileId) => {
    const file = files[fileId];
    if (!file) return;
    
    // Create a download link
    const link = document.createElement('a');
    
    // For images that have URL, use that
    if (file.url) {
      link.href = file.url;
    } else {
      // For other files, create a URL from the blob
      link.href = URL.createObjectURL(file.blob);
    }
    
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  // Render file message
  const renderFileMessage = (message) => {
    const fileId = message.fileId;
    const file = files[fileId];
    
    if (!file) {
      return <div className="text-sm text-gray-500">File unavailable</div>;
    }
    
    const isImage = file.type.startsWith('image/');
    
    if (isImage && file.url) {
      return (
        <div className="file-message">
          <div className="relative group">
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full rounded-lg max-h-64 object-contain bg-gray-50 dark:bg-gray-800"
            />
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => downloadFile(fileId)}
                className="p-2 bg-white rounded-full text-gray-800 mx-1 hover:bg-gray-100"
                title="Download image"
              >
                <FiDownload size={18} />
              </button>
              
              <button
                onClick={() => window.open(file.url, '_blank')}
                className="p-2 bg-white rounded-full text-gray-800 mx-1 hover:bg-gray-100"
                title="View full size"
              >
                <FiMaximize size={18} />
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <FiImage className="mr-1" />
            <span>{file.name} ({formatFileSize(file.size)})</span>
          </div>
        </div>
      );
    } else {
      // For non-image files
      return (
        <div className="file-message p-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 mr-3">
            <FiFile size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{file.name}</div>
            <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
          </div>
          
          <button
            onClick={() => downloadFile(fileId)}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Download file"
          >
            <FiDownload size={18} />
          </button>
        </div>
      );
    }
  };
  
  // Function to handle pinning/unpinning a message
  const handlePinMessage = (message) => {
    // Check if user has permission (assuming admin or room creator can pin)
    const canPin = currentUser.id === roomInfo?.createdBy || currentUser.isAdmin;
    
    if (!canPin) {
      showToast('You do not have permission to pin messages', 'error');
      return;
    }
    
    // Check if message is already pinned
    const isPinned = pinnedMessages.some(m => m.id === message.id);
    
    if (isPinned) {
      // Unpin the message
      socket.emit('unpin_message', { 
        messageId: message.id,
        roomId,
        unpinnedBy: currentUser.username 
      });
    } else {
      // Pin the message
      socket.emit('pin_message', { 
        messageId: message.id,
        roomId,
        pinnedBy: currentUser.username 
      });
    }
    
    // Close the swipe actions
    setSwipedMessageId(null);
  };
  
  // Listen for pin/unpin events
  useEffect(() => {
    socket.on('pin_message', ({ messageId, userId }) => {
      // Find the message in roomMessages
      const message = roomMessages.find(m => m.id === messageId);
      if (message && !pinnedMessages.some(m => m.id === messageId)) {
        setPinnedMessages(prev => [...prev, message]);
      }
    });
    
    socket.on('unpin_message', ({ messageId }) => {
      setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
    });
    
    return () => {
      socket.off('pin_message');
      socket.off('unpin_message');
    };
  }, [socket, roomMessages, pinnedMessages]);
  
  // Render pinned message
  const renderPinnedMessage = (msg) => {
    const isCurrentUser = msg.userId === currentUser.id || msg.user?.id === currentUser.id;
    
    return (
      <div key={msg.id} className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2 relative group">
        <img
          src={msg.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.username || 'User')}&background=random`}
          alt={msg.user?.username || 'User'}
          className="h-6 w-6 rounded-full mr-2"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="font-medium text-xs">{msg.user?.username || 'User'}</div>
            <div className="text-xs text-gray-500 ml-1">
              {format(new Date(msg.timestamp), 'PP')}
            </div>
          </div>
          
          <div className="text-sm truncate">
            {msg.type === 'voice' ? 'Voice message' : 
             msg.type === 'file' ? 'File: ' + (msg.fileName || 'Attachment') : 
             msg.text}
          </div>
        </div>
        
        <button
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={() => handlePinMessage(msg)}
          title="Unpin message"
        >
          <FiX size={16} />
        </button>
      </div>
    );
  };

  // Function to search for GIFs using the Giphy API
  const searchGifs = useCallback(debounce(async (query) => {
    if (!query) {
      setGifResults([]);
      setIsSearchingGifs(false);
      return;
    }
    
    setIsSearchingGifs(true);
    try {
      // Using the Giphy API
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=P30aJbiNV5N3m5bGBAW2I9oCcNxJsSLa&q=${encodeURIComponent(
          query
        )}&limit=20&offset=0&rating=g&lang=en`
      );
      const data = await response.json();
      setGifResults(data.data || []);
    } catch (error) {
      console.error("Error searching for GIFs:", error);
    } finally {
      setIsSearchingGifs(false);
    }
  }, 500), []);

  // Handle GIF search input change
  const handleGifSearchChange = (e) => {
    const query = e.target.value;
    setGifSearchQuery(query);
    searchGifs(query);
  };

  // Handle selecting a GIF to send
  const handleGifSelect = (gif) => {
    // Create a GIF message
    const gifMessage = {
      id: `gif-${Date.now()}`,
      roomId,
      userId: currentUser.id,
      user: currentUser,
      timestamp: new Date().toISOString(),
      type: 'gif',
      gif: {
        url: gif.images.fixed_height.url,
        width: gif.images.fixed_height.width,
        height: gif.images.fixed_height.height,
        title: gif.title
      },
      text: `Sent a GIF: ${gif.title}`
    };
    
    // Add to messages
    setRoomMessages(prev => [...prev, gifMessage]);
    
    // Emit socket event for GIF
    socket.emit('message', {
      ...gifMessage,
      roomId,
      type: 'gif'
    });
    
    // Close GIF picker
    setShowGifPicker(false);
    setGifSearchQuery("");
    setGifResults([]);
    
    // Play sound effect
    playMessageSound();
  };

  // Function to render a GIF message
  const renderGifMessage = (msg) => {
    if (!msg.gif || !msg.gif.url) return <div>GIF unavailable</div>;
    
    return (
      <div className="gif-message">
        <div className="relative group">
          <img 
            src={msg.gif.url} 
            alt={msg.gif.title || "GIF"} 
            className="rounded-lg max-w-full cursor-pointer"
            style={{ maxHeight: '200px' }}
            onClick={() => window.open(msg.gif.url, '_blank')}
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => window.open(msg.gif.url, '_blank')}
              className="p-2 bg-white rounded-full text-gray-800 mx-1 hover:bg-gray-100"
              title="View full size"
            >
              <FiMaximize size={18} />
            </button>
          </div>
        </div>
        
        {msg.gif.title && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <RiGifLine className="inline mr-1" />
            {msg.gif.title}
          </p>
        )}
      </div>
    );
  };

  // Load polls when entering room
  useEffect(() => {
    if (socket) {
      socket.on('room_polls', (polls) => {
        setActivePolls(polls);
      });
      
      socket.on('poll_vote', ({pollId, results}) => {
        setActivePolls(prev => prev.map(poll => 
          poll.id === pollId ? {...poll, results} : poll
        ));
      });
      
      socket.on('new_poll', (poll) => {
        setActivePolls(prev => [...prev, poll]);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('room_polls');
        socket.off('poll_vote');
        socket.off('new_poll');
      }
    };
  }, [socket]);

  const handleCreatePoll = () => {
    if (pollQuestion.trim() && pollOptions.filter(opt => opt.trim()).length >= 2) {
      const filteredOptions = pollOptions.filter(opt => opt.trim());
      socket.emit('create_poll', {
        roomId,
        question: pollQuestion,
        options: filteredOptions,
      });
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollCreator(false);
    }
  };

  const handleVote = (pollId, optionIndex) => {
    socket.emit('vote_poll', {
      roomId,
      pollId,
      optionIndex,
      userId: currentUser.id
    });
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };
  
  const renderMessageContent = (msg) => {
    if (msg.type === 'code') {
      return renderCodeSnippet(msg);
    } else if (msg.type === 'gif') {
      return renderGifMessage(msg);
    } else if (msg.type === 'poll') {
      return (
        <div className="poll-container bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
          <h4 className="font-medium text-black dark:text-white">{msg.content.question}</h4>
          <div className="poll-options mt-2">
            {msg.content.options.map((option, idx) => {
              const voteCount = msg.content.results?.[idx] || 0;
              const totalVotes = msg.content.results ? Object.values(msg.content.results).reduce((a, b) => a + b, 0) : 0;
              const percentage = totalVotes ? Math.round((voteCount / totalVotes) * 100) : 0;
              const hasVoted = msg.content.voted?.includes(currentUser.id);
              
              return (
                <div key={idx} className="poll-option my-1">
                  <button
                    onClick={() => !hasVoted && handleVote(msg.id, idx)}
                    disabled={hasVoted}
                    className={`w-full text-left p-2 rounded-md flex items-center ${
                      hasVoted ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="flex-grow">{option}</span>
                    {hasVoted && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {voteCount} · {percentage}%
                      </span>
                    )}
                  </button>
                  {hasVoted && (
                    <div className="h-1 bg-gray-300 dark:bg-gray-500 mt-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {msg.content.results ? Object.values(msg.content.results).reduce((a, b) => a + b, 0) : 0} votes
            </div>
          </div>
        </div>
      );
    } else if (msg.type === 'file') {
      return renderFileMessage(msg);
    } else if (msg.type === 'voice') {
      return renderVoiceMessage(msg);
    } else {
      return formatMessageWithMentions(msg.text);
    }
  };

  // Function to copy code to clipboard
  const copyCodeToClipboard = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // Show temporary copied notification by setting the message ID
        setCopiedSnippetId(content.id);
        setTimeout(() => setCopiedSnippetId(null), 2000);
      })
      .catch(err => console.error('Failed to copy code:', err));
  };

  // Function to render a code snippet message
  const renderCodeSnippet = (msg) => {
    if (!msg.code || !msg.code.content) return <div>Code snippet unavailable</div>;
    
    const isCopied = copiedSnippetId === msg.id;
    
    return (
      <div className="code-snippet-message w-full max-w-full">
        <div className="flex justify-between items-center bg-gray-800 dark:bg-gray-900 text-white text-xs rounded-t-md px-4 py-2">
          <span>{codeLanguageOptions.find(l => l.value === msg.code.language)?.label || msg.code.language}</span>
          <button
            onClick={() => copyCodeToClipboard(msg)}
            className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            title={isCopied ? "Copied!" : "Copy to clipboard"}
          >
            {isCopied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            <span>{isCopied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
        <div className="overflow-auto max-h-96 text-sm w-full">
          <SyntaxHighlighter
            language={msg.code.language}
            style={isDarkMode ? vscDarkPlus : vs}
            customStyle={{ margin: 0, borderRadius: '0 0 6px 6px' }}
            showLineNumbers={true}
            wrapLongLines={true}
          >
            {msg.code.content}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  };

  // Handle sending code snippet
  const handleSendCodeSnippet = () => {
    if (!codeSnippet.trim()) return;
    
    // Create a code snippet message
    const snippetMessage = {
      id: `snippet-${Date.now()}`,
      roomId,
      userId: currentUser.id,
      user: currentUser,
      timestamp: new Date().toISOString(),
      type: 'code',
      code: {
        content: codeSnippet,
        language: codeLanguage
      },
      text: `Sent a code snippet in ${codeLanguageOptions.find(l => l.value === codeLanguage)?.label || codeLanguage}`
    };
    
    // Add to messages
    setRoomMessages(prev => [...prev, snippetMessage]);
    
    // Emit socket event for code snippet
    socket.emit('message', {
      ...snippetMessage,
      roomId,
      type: 'code'
    });
    
    // Close code editor and reset
    setShowCodeEditor(false);
    setCodeSnippet('');
    
    // Play sound effect
    playMessageSound();
  };

  // Fetch pinned messages when room loads
  useEffect(() => {
    if (socket && roomInfo) {
      // Request pinned messages from server
      socket.emit('get_pinned_messages', { roomId: roomInfo.id });
      
      // Listen for pinned messages
      socket.on('pinned_messages', ({ messages }) => {
        setPinnedMessages(messages);
      });
      
      // Listen for new pin events
      socket.on('message_pinned', ({ message, pinnedBy, pinnedAt }) => {
        setPinnedMessages(prev => {
          // Check if already exists
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, { ...message, pinnedBy, pinnedAt }];
        });
        showToast(`${pinnedBy} pinned a message`);
      });
      
      // Listen for unpin events
      socket.on('message_unpinned', ({ messageId, unpinnedBy }) => {
        setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
        showToast(`${unpinnedBy} unpinned a message`);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('pinned_messages');
        socket.off('message_pinned');
        socket.off('message_unpinned');
      }
    };
  }, [socket, roomInfo]);

  // Mark messages as read when they're displayed
  useEffect(() => {
    if (socket && roomMessages.length > 0 && currentUser) {
      // Get the latest message
      const latestMessage = roomMessages[roomMessages.length - 1];
      
      // Only mark messages as read if the latest message is visible
      // (user is at the bottom of the chat)
      if (autoScroll && latestMessage.userId !== currentUser.id) {
        socket.emit('mark_messages_read', {
          roomId,
          userId: currentUser.id,
          username: currentUser.username,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [roomMessages, autoScroll, currentUser, roomId, socket]);
  
  // Listen for read receipts from other users
  useEffect(() => {
    if (socket) {
      socket.on('messages_read', ({ userId, username, timestamp }) => {
        if (userId !== currentUser.id) {
          setReadReceipts(prev => ({
            ...prev,
            [userId]: { username, timestamp }
          }));
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('messages_read');
      }
    };
  }, [socket, currentUser]);
  
  // Render read receipts for messages
  const renderReadReceipts = (message) => {
    // Only show read receipts for messages sent by the current user
    if (message.userId !== currentUser.id) return null;
    
    // Get users who have read this message (users with read timestamp after message timestamp)
    const readers = Object.entries(readReceipts)
      .filter(([userId, receipt]) => {
        return new Date(receipt.timestamp) > new Date(message.timestamp);
      })
      .map(([userId, receipt]) => receipt);
    
    if (readers.length === 0) return null;
    
    return (
      <div className="flex justify-end mt-1">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span className="mr-1">Read by</span>
          <div className="flex -space-x-2">
            {readers.slice(0, 3).map((receipt, index) => (
              <div 
                key={index} 
                className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] border border-white dark:border-gray-900"
                title={receipt.username}
              >
                {receipt.username.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          {readers.length > 3 && (
            <span className="ml-1">+{readers.length - 3}</span>
          )}
        </div>
      </div>
    );
  };

  // Initialize scheduled messages from localStorage
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('scheduledMessages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Filter out messages for this room only
        const roomScheduledMessages = parsedMessages.filter(msg => msg.roomId === roomId);
        setScheduledMessages(roomScheduledMessages);
      }
    } catch (error) {
      console.error('Error loading scheduled messages:', error);
    }
  }, [roomId]);
  
  // Check for messages to send every minute
  useEffect(() => {
    const checkScheduledMessages = () => {
      const now = new Date();
      const messagesToSend = scheduledMessages.filter(msg => {
        const scheduleTime = new Date(msg.scheduledFor);
        return scheduleTime <= now && msg.roomId === roomId;
      });
      
      // Send any messages whose time has come
      if (messagesToSend.length > 0) {
        messagesToSend.forEach(msg => {
          sendMessage(roomId, msg.text);
          showToast('Scheduled message sent');
        });
        
        // Remove sent messages from scheduled list
        const updatedMessages = scheduledMessages.filter(msg => 
          !messagesToSend.some(sendMsg => sendMsg.id === msg.id)
        );
        
        setScheduledMessages(updatedMessages);
        localStorage.setItem('scheduledMessages', JSON.stringify(updatedMessages));
      }
    };
    
    // Check right away when component mounts
    checkScheduledMessages();
    
    // Then check every 30 seconds
    const interval = setInterval(checkScheduledMessages, 30000);
    
    return () => clearInterval(interval);
  }, [scheduledMessages, roomId, sendMessage]);
  
  // Schedule a message for future delivery
  const scheduleMessage = () => {
    if (!message.trim()) {
      showToast('Cannot schedule an empty message', 'error');
      return;
    }
    
    const scheduleDateTimeStr = `${scheduledDate}T${scheduledTime}`;
    const scheduleDateTime = new Date(scheduleDateTimeStr);
    
    if (isNaN(scheduleDateTime.getTime())) {
      showToast('Invalid date or time', 'error');
      return;
    }
    
    if (scheduleDateTime <= new Date()) {
      showToast('Schedule time must be in the future', 'error');
      return;
    }
    
    const scheduledMsg = {
      id: `scheduled-${Date.now()}`,
      text: message.trim(),
      roomId,
      createdAt: new Date().toISOString(),
      scheduledFor: scheduleDateTime.toISOString(),
      userId: currentUser.id
    };
    
    const updatedScheduled = [...scheduledMessages, scheduledMsg];
    setScheduledMessages(updatedScheduled);
    localStorage.setItem('scheduledMessages', JSON.stringify(updatedScheduled));
    
    // Reset form
    setMessage('');
    setShowScheduler(false);
    setScheduledDate('');
    setScheduledTime('');
    
    showToast('Message scheduled for ' + scheduleDateTime.toLocaleString());
  };
  
  // Cancel a scheduled message
  const cancelScheduledMessage = (id) => {
    const updatedMessages = scheduledMessages.filter(msg => msg.id !== id);
    setScheduledMessages(updatedMessages);
    localStorage.setItem('scheduledMessages', JSON.stringify(updatedMessages));
    showToast('Scheduled message cancelled');
  };
  
  // Format a date for display
  const formatScheduledDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Available languages for translation
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];
  
  // Save target language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('targetLanguage', targetLanguage);
  }, [targetLanguage]);
  
  // Mock function for translation (in a real app, this would call a translation API)
  const translateText = async (text, targetLang) => {
    // This is a mock function - in a real app, you would use a translation API
    // such as Google Translate API, DeepL, or Microsoft Translator
    
    try {
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // MOCK TRANSLATION - replace with real API in production
      // This just adds a prefix to show it's "translated"
      return `[${targetLang}] ${text}`;
      
      // Example of how a real implementation might look:
      /*
      const response = await fetch('https://translation-api.example.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          text,
          source: 'auto',
          target: targetLang
        })
      });
      
      const data = await response.json();
      return data.translatedText;
      */
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  };
  
  // Handle message translation
  const handleTranslateMessage = async (messageId, text) => {
    if (!text) return;
    
    // Check if we already have a translation for this message in the target language
    if (translatedMessages[messageId]?.[targetLanguage]) {
      // We already have a translation, no need to translate again
      return;
    }
    
    // Show loading state
    setTranslatedMessages(prev => ({
      ...prev,
      [messageId]: {
        ...(prev[messageId] || {}),
        [targetLanguage]: { text: '...', loading: true }
      }
    }));
    
    // Translate the text
    const translatedText = await translateText(text, targetLanguage);
    
    // Update state with translated text
    setTranslatedMessages(prev => ({
      ...prev,
      [messageId]: {
        ...(prev[messageId] || {}),
        [targetLanguage]: { text: translatedText, loading: false }
      }
    }));
  };
  
  // Toggle message translation
  const toggleMessageTranslation = (messageId, text) => {
    // If we don't have a translation yet, get one
    if (!translatedMessages[messageId]?.[targetLanguage]) {
      handleTranslateMessage(messageId, text);
    }
    
    // Toggle showing the translation for this message
    setTranslatedMessages(prev => {
      const messageTrans = prev[messageId] || {};
      const isCurrentlyShowing = messageTrans.isShowing;
      
      return {
        ...prev,
        [messageId]: {
          ...messageTrans,
          isShowing: !isCurrentlyShowing
        }
      };
    });
  };
  
  // Check if a message is currently showing its translation
  const isShowingTranslation = (messageId) => {
    return translatedMessages[messageId]?.isShowing;
  };
  
  // Get the translated text for a message
  const getTranslatedText = (messageId, originalText) => {
    const messageTrans = translatedMessages[messageId];
    if (!messageTrans || !messageTrans.isShowing) return originalText;
    
    const translation = messageTrans[targetLanguage];
    if (!translation) return originalText;
    
    return translation.loading ? 'Translating...' : translation.text;
  };
  
  // Render a translation button for a message
  const renderTranslationButton = (message) => {
    if (!message.text) return null;
    
    const isShowing = isShowingTranslation(message.id);
    
    return (
      <button
        onClick={() => toggleMessageTranslation(message.id, message.text)}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center mt-1"
        title={isShowing ? "Show original" : "Translate message"}
      >
        <FiGlobe size={12} className="mr-1" />
        {isShowing ? "Show original" : "Translate"}
      </button>
    );
  };
  
  // Add language selector to menu
  const renderLanguageSelector = () => {
    return (
      <div className="relative group">
        <button
          className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300"
          title="Change translation language"
        >
          <FiGlobe size={16} />
          <span>{availableLanguages.find(lang => lang.code === targetLanguage)?.name || 'English'}</span>
        </button>
        
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 hidden group-hover:block">
          <div className="py-1 max-h-48 overflow-y-auto">
            {availableLanguages.map(lang => (
              <button
                key={lang.code}
                className={`flex w-full items-center px-4 py-2 text-sm ${
                  targetLanguage === lang.code
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setTargetLanguage(lang.code)}
              >
                {lang.name}
                {targetLanguage === lang.code && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem('bookmarkedMessages');
      if (savedBookmarks) {
        setBookmarkedMessages(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, []);
  
  // Save bookmarks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bookmarkedMessages', JSON.stringify(bookmarkedMessages));
  }, [bookmarkedMessages]);
  
  // Toggle bookmark for a message
  const toggleBookmark = (message) => {
    const isBookmarked = bookmarkedMessages.some(msg => msg.id === message.id);
    
    if (isBookmarked) {
      // Remove from bookmarks
      setBookmarkedMessages(bookmarkedMessages.filter(msg => msg.id !== message.id));
      showToast('Message removed from bookmarks');
    } else {
      // Add to bookmarks
      const bookmarkToAdd = {
        ...message,
        bookmarkedAt: new Date().toISOString(),
        roomName: roomInfo?.name || 'Chat Room'
      };
      setBookmarkedMessages([...bookmarkedMessages, bookmarkToAdd]);
      showToast('Message bookmarked');
    }
    
    // Close any open message actions
    setSwipedMessageId(null);
  };
  
  // Check if a message is bookmarked
  const isBookmarked = (messageId) => {
    return bookmarkedMessages.some(msg => msg.id === messageId);
  };
  
  // Delete a bookmark
  const deleteBookmark = (messageId) => {
    setBookmarkedMessages(bookmarkedMessages.filter(msg => msg.id !== messageId));
    showToast('Bookmark removed');
  };
  
  // Format bookmarked date
  const formatBookmarkedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Jump to a bookmarked message if it's in the current room
  const scrollToBookmarkedMessage = (messageId) => {
    // Find the element with the message ID
    const element = document.getElementById(`msg-${messageId}`);
    
    if (element) {
      // Scroll to the message
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the message briefly
      element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
      setTimeout(() => {
        element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
      }, 2000);
      
      setShowBookmarks(false);
    } else {
      // Message is not in the current room
      showToast('Message is not in this room', 'warning');
    }
  };
  
  // Render bookmark button for message actions
  const renderBookmarkButton = (message) => {
    const bookmarked = isBookmarked(message.id);
    
    return (
      <button
        onClick={() => toggleBookmark(message)}
        className={`p-2 rounded-full ${
          bookmarked
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        } hover:opacity-80`}
        title={bookmarked ? "Remove bookmark" : "Bookmark message"}
      >
        <FiBookmark size={16} className={bookmarked ? "fill-current" : ""} />
      </button>
    );
  };
  
  // Render bookmarks panel
  const renderBookmarksPanel = () => {
    if (!showBookmarks) return null;
    
    return (
      <div className="absolute right-0 top-16 w-80 max-w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
            <FiBookmark size={16} className="mr-2" />
            Bookmarked Messages
          </h3>
          <button 
            onClick={() => setShowBookmarks(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiX size={18} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2">
          {bookmarkedMessages.length === 0 ? (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
              No bookmarked messages yet
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarkedMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm relative group"
                >
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteBookmark(msg.id)}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                      title="Remove bookmark"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <img 
                      src={msg.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.user?.username || 'User')}&background=random`}
                      alt={msg.user?.username} 
                      className="w-6 h-6 rounded-full object-cover mr-2"
                    />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {msg.user?.username || 'Unknown User'}
                    </span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {msg.roomName || 'Unknown Room'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 break-words">
                    {msg.text}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Bookmarked on {formatBookmarkedDate(msg.bookmarkedAt)}
                    </span>
                    
                    {msg.roomId === roomId && (
                      <button
                        onClick={() => scrollToBookmarkedMessage(msg.id)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Jump to message
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Handle opening the forward dialog
  const handleOpenForward = (message) => {
    setForwardMessage(message);
    setShowForwardDialog(true);
    setSwipedMessageId(null); // Close any open swipe actions
  };
  
  // Forward message to selected room
  const handleForwardMessage = () => {
    if (!forwardMessage || !forwardToRoom) return;
    
    // Create the forwarded message
    const forwardedMessage = {
      text: forwardMessage.text,
      type: forwardMessage.type,
      forwardedFrom: {
        roomName: roomInfo?.name || 'Unknown Room',
        username: forwardMessage.user?.username || 'Unknown User'
      }
    };
    
    // Send the forwarded message to the selected room
    socket.emit('send_message', {
      roomId: forwardToRoom,
      ...forwardedMessage
    });
    
    // Reset state
    setShowForwardDialog(false);
    setForwardMessage(null);
    setForwardToRoom('');
    
    // Show feedback to user
    showToast('Message forwarded');
  };
  
  // Forward media messages (images, files, etc.)
  const handleForwardMediaMessage = () => {
    if (!forwardMessage || !forwardToRoom) return;
    
    // For media messages, we need to include all the media details
    const messageToForward = {
      ...forwardMessage,
      roomId: forwardToRoom,
      forwardedFrom: {
        roomName: roomInfo?.name || 'Unknown Room',
        username: forwardMessage.user?.username || 'Unknown User'
      },
      timestamp: new Date().toISOString()
    };
    
    // Remove IDs and other room-specific data
    delete messageToForward.id;
    
    // Send forwarded message event
    socket.emit('forward_message', messageToForward);
    
    // Reset state
    setShowForwardDialog(false);
    setForwardMessage(null);
    setForwardToRoom('');
    
    // Show feedback to user
    showToast('Message forwarded');
  };
  
  // Render forwarded badge if message was forwarded
  const renderForwardedBadge = (message) => {
    if (!message.forwardedFrom) return null;
    
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 italic mb-1 flex items-center">
        <FiShare size={12} className="mr-1" />
        Forwarded from {message.forwardedFrom.username} in {message.forwardedFrom.roomName}
      </div>
    );
  };
  
  // Render forward button for message actions
  const renderForwardButton = (message) => {
    return (
      <button
        onClick={() => handleOpenForward(message)}
        className="p-2 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:opacity-80"
        title="Forward message"
      >
        <FiShare size={16} />
      </button>
    );
  };
  
  // Render the forward dialog
  const renderForwardDialog = () => {
    if (!showForwardDialog) return null;
    
    // Filter out the current room
    const otherRooms = rooms.filter(room => room.id !== roomId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Forward Message</h3>
            <button 
              onClick={() => {
                setShowForwardDialog(false);
                setForwardMessage(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Message preview */}
          {forwardMessage && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex items-center mb-2">
                <img 
                  src={forwardMessage.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(forwardMessage.user?.username || 'User')}&background=random`}
                  alt={forwardMessage.user?.username || 'User'} 
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  {forwardMessage.user?.username || 'Unknown User'}
                </span>
              </div>
              
              <div className="text-sm text-gray-800 dark:text-gray-200 break-words">
                {forwardMessage.text}
              </div>
            </div>
          )}
          
          {/* Room selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Forward to:
            </label>
            
            {otherRooms.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                No other rooms available
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                {otherRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setForwardToRoom(room.id)}
                    className={`flex items-center p-3 w-full text-left ${
                      forwardToRoom === room.id 
                        ? 'bg-primary-50 dark:bg-primary-900' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium mr-3">
                      {room.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {room.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {room.participants || 0} participants
                      </div>
                    </div>
                    {forwardToRoom === room.id && (
                      <div className="text-primary-500 dark:text-primary-400">
                        <FiCheck size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowForwardDialog(false);
                setForwardMessage(null);
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md mr-2 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={forwardMessage?.type === 'text' ? handleForwardMessage : handleForwardMediaMessage}
              disabled={!forwardToRoom}
              className={`px-4 py-2 rounded-md text-white ${
                !forwardToRoom 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              Forward
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Function to extract URLs from message text
  const extractUrls = (text) => {
    if (!text) return [];
    
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };
  
  // Fetch link preview data
  const fetchLinkPreview = async (url, messageId) => {
    try {
      // Set loading state
      setLinkPreviews(prev => ({
        ...prev,
        [url]: { loading: true }
      }));
      
      // In a real app, you would use a backend service or API to fetch the preview
      // For demo purposes, we'll create a mock preview
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock preview based on the URL
      // In production, use a service like link-preview-js or opengraph.io
      const mockPreview = generateMockPreview(url);
      
      // Update state with preview data
      setLinkPreviews(prev => ({
        ...prev,
        [url]: {
          loading: false,
          ...mockPreview
        }
      }));
    } catch (error) {
      console.error('Error fetching link preview:', error);
      // Set error state
      setLinkPreviews(prev => ({
        ...prev,
        [url]: { loading: false, error: true }
      }));
    }
  };
  
  // Generate a mock preview based on the URL
  const generateMockPreview = (url) => {
    // This is just a mock function - in a real app, you would fetch actual preview data
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Create basic preview based on domain
    const preview = {
      url,
      title: `Content from ${domain}`,
      description: 'This is a mock preview for demonstration purposes. In a real application, this would be fetched from the actual page metadata.',
      domain,
      image: null
    };
    
    // Add mock images for some popular domains
    if (domain.includes('youtube')) {
      preview.title = 'YouTube Video';
      preview.image = 'https://i.imgur.com/ZY8dKAG.png';
    } else if (domain.includes('github')) {
      preview.title = 'GitHub Repository';
      preview.image = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    } else if (domain.includes('twitter') || domain.includes('x.com')) {
      preview.title = 'Twitter Post';
      preview.image = 'https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc7275.png';
    } else {
      // Generic image for other domains
      preview.image = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
    
    return preview;
  };
  
  // Process new messages to extract and fetch link previews
  useEffect(() => {
    // Process only the last few messages to avoid excessive API calls
    const recentMessages = roomMessages.slice(-5);
    
    recentMessages.forEach(msg => {
      if (msg.text) {
        const urls = extractUrls(msg.text);
        
        // Only fetch the first URL in the message
        if (urls.length > 0) {
          const firstUrl = urls[0];
          
          // Only fetch if we don't already have this preview
          if (!linkPreviews[firstUrl]) {
            fetchLinkPreview(firstUrl, msg.id);
          }
        }
      }
    });
  }, [roomMessages]);
  
  // Render link preview for a message
  const renderLinkPreview = (message) => {
    if (!message.text) return null;
    
    const urls = extractUrls(message.text);
    if (urls.length === 0) return null;
    
    // Use only the first URL for preview
    const url = urls[0];
    const preview = linkPreviews[url];
    
    if (!preview) return null;
    
    // Show loading state
    if (preview.loading) {
      return (
        <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-md p-3 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      );
    }
    
    // Show error state
    if (preview.error) {
      return null; // Skip showing anything on error
    }
    
    // Show preview
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block mt-2 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex">
          {preview.image && (
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <img 
                src={preview.image} 
                alt=""
                className="max-w-full max-h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://www.google.com/s2/favicons?domain=${preview.domain}&sz=64`;
                }}
              />
            </div>
          )}
          
          <div className="p-3 flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {preview.title}
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
              {preview.description}
            </div>
            
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
              <FiExternalLink size={12} className="mr-1" />
              {preview.domain}
            </div>
          </div>
        </div>
      </a>
    );
  };
  
  // Add the line-clamp utility classes
  useEffect(() => {
    // Check if the style already exists
    if (document.getElementById('line-clamp-style')) return;
    
    const style = document.createElement('style');
    style.id = 'line-clamp-style';
    style.innerHTML = `
      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const styleElement = document.getElementById('line-clamp-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  // Filter options
  const messageTypeOptions = [
    { id: 'text', label: 'Text Messages' },
    { id: 'file', label: 'Files & Attachments' },
    { id: 'image', label: 'Images' },
    { id: 'gif', label: 'GIFs' },
    { id: 'code', label: 'Code Snippets' },
    { id: 'poll', label: 'Polls' },
    { id: 'voice', label: 'Voice Messages' }
  ];
  
  // Apply filters to messages
  const filteredMessages = useMemo(() => {
    // Check if there are any active filters
    const hasActiveFilters = (
      activeFilters.messageTypes.length > 0 ||
      activeFilters.fromUsers.length > 0 ||
      activeFilters.withMedia ||
      activeFilters.onlyMentions ||
      activeFilters.dateRange.start ||
      activeFilters.dateRange.end
    );
    
    if (!hasActiveFilters) {
      return roomMessages;
    }
    
    return roomMessages.filter(msg => {
      // Filter by message type
      if (activeFilters.messageTypes.length > 0) {
        const messageType = msg.type || 'text';
        if (!activeFilters.messageTypes.includes(messageType)) {
          return false;
        }
      }
      
      // Filter by user
      if (activeFilters.fromUsers.length > 0) {
        const userId = msg.userId || msg.user?.id;
        if (!activeFilters.fromUsers.includes(userId)) {
          return false;
        }
      }
      
      // Filter for media messages
      if (activeFilters.withMedia) {
        const hasMedia = ['image', 'file', 'voice', 'gif'].includes(msg.type);
        if (!hasMedia) {
          return false;
        }
      }
      
      // Filter for messages with mentions
      if (activeFilters.onlyMentions) {
        const hasMention = msg.text && msg.text.includes('@');
        if (!hasMention) {
          return false;
        }
      }
      
      // Filter by date range
      const { start, end } = activeFilters.dateRange;
      const messageDate = new Date(msg.timestamp);
      
      if (start) {
        const startDate = new Date(start);
        if (messageDate < startDate) {
          return false;
        }
      }
      
      if (end) {
        const endDate = new Date(end);
        // Set to the end of the day
        endDate.setHours(23, 59, 59, 999);
        if (messageDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [roomMessages, activeFilters]);
  
  // Toggle a filter type
  const toggleMessageTypeFilter = (typeId) => {
    setActiveFilters(prev => {
      const types = [...prev.messageTypes];
      const typeIndex = types.indexOf(typeId);
      
      if (typeIndex === -1) {
        // Add the type
        types.push(typeId);
      } else {
        // Remove the type
        types.splice(typeIndex, 1);
      }
      
      return {
        ...prev,
        messageTypes: types
      };
    });
  };
  
  // Toggle a user filter
  const toggleUserFilter = (userId) => {
    setActiveFilters(prev => {
      const users = [...prev.fromUsers];
      const userIndex = users.indexOf(userId);
      
      if (userIndex === -1) {
        // Add the user
        users.push(userId);
      } else {
        // Remove the user
        users.splice(userIndex, 1);
      }
      
      return {
        ...prev,
        fromUsers: users
      };
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      messageTypes: [],
      fromUsers: [],
      withMedia: false,
      onlyMentions: false,
      dateRange: {
        start: '',
        end: ''
      }
    });
  };
  
  // Render filter badge
  const renderFilterBadge = () => {
    const filterCount = (
      activeFilters.messageTypes.length +
      activeFilters.fromUsers.length +
      (activeFilters.withMedia ? 1 : 0) +
      (activeFilters.onlyMentions ? 1 : 0) +
      (activeFilters.dateRange.start || activeFilters.dateRange.end ? 1 : 0)
    );
    
    if (filterCount === 0) return null;
    
    return (
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
        {filterCount}
      </span>
    );
  };
  
  // Render the filter panel
  const renderFilterPanel = () => {
    if (!showFilters) return null;
    
    // Get unique users in the room for user filter
    const roomUsers = roomInfo?.users || [];
    
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <FiFilter size={18} className="mr-2" /> Filter Messages
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear all
            </button>
            <button 
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Message Type Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Type</h4>
            <div className="space-y-1">
              {messageTypeOptions.map(type => (
                <div key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`type-${type.id}`}
                    checked={activeFilters.messageTypes.includes(type.id)}
                    onChange={() => toggleMessageTypeFilter(type.id)}
                    className="h-4 w-4 text-primary-500 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* User Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Users</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {roomUsers.map(user => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={activeFilters.fromUsers.includes(user.id)}
                    onChange={() => toggleUserFilter(user.id)}
                    className="h-4 w-4 text-primary-500 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor={`user-${user.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {user.username}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Filters</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="media-filter"
                  checked={activeFilters.withMedia}
                  onChange={() => setActiveFilters(prev => ({ ...prev, withMedia: !prev.withMedia }))}
                  className="h-4 w-4 text-primary-500 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="media-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Only show messages with media
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mentions-filter"
                  checked={activeFilters.onlyMentions}
                  onChange={() => setActiveFilters(prev => ({ ...prev, onlyMentions: !prev.onlyMentions }))}
                  className="h-4 w-4 text-primary-500 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="mentions-filter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Only show messages with @mentions
                </label>
              </div>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="date-from" className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  From
                </label>
                <input
                  type="date"
                  id="date-from"
                  value={activeFilters.dateRange.start}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="date-to" className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  To
                </label>
                <input
                  type="date"
                  id="date-to"
                  value={activeFilters.dateRange.end}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter results summary */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredMessages.length} of {roomMessages.length} messages
        </div>
      </div>
    );
  };
  
  // Handle adding emoji to message input
  const handleEmojiSelect = (emoji) => {
    const input = messageInputRef.current;
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = message;
    
    const newText = text.substring(0, start) + emoji.native + text.substring(end);
    setMessage(newText);
    
    // Update cursor position to after the inserted emoji
    const newPosition = start + emoji.native.length;
    
    // Focus back on input after inserting emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
    
    // Close emoji picker
    setShowEmoji(false);
  };

  // Toggle emoji picker visibility
  const toggleEmojiPicker = () => {
    setShowEmoji(prev => !prev);
    // Close other pickers/menus when opening emoji picker
    if (!showEmoji) {
      setShowGifPicker(false);
      setShowFormatting(false);
    }
  };
  
  // Render the chat interface
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Chat Header */}
      <div className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
          >
            <FiArrowLeft size={24} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="font-medium text-lg truncate max-w-[150px] md:max-w-xs">
              {roomInfo?.name || 'Chat Room'}
            </h1>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              {roomInfo?.users?.length || 0} online
            </div>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setShowSearch(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative"
          >
            <FiSearch size={20} />
          </button>
          
          <button 
            onClick={() => setShowPinned(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative"
          >
            <FiPin size={20} />
            {pinnedMessages.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {pinnedMessages.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setShowUsersList(true)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <FiUsers size={20} />
          </button>
          
          <button 
            onClick={() => setShowMenu(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative"
          >
            <FiMoreVertical size={20} />
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-1 w-56 z-50">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowFilters(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <FiFilter className="mr-2" />
                  <span>Filter Messages</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowBookmarks(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <FiBookmark className="mr-2" />
                  <span>Bookmarked Messages</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowThemeSettings(prev => !prev);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <FiSettings className="mr-2" />
                  <span>Appearance</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsDarkMode(prev => !prev);
                    localStorage.setItem('darkMode', !isDarkMode);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  {isDarkMode ? (
                    <>
                      <FiSun className="mr-2" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <FiMoon className="mr-2" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowScheduledList(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <FiClock className="mr-2" />
                  <span>Scheduled Messages</span>
                </button>
                
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                
                <button
                  onClick={() => {
                    handleLeaveRoom();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <FiLogOut className="mr-2" />
                  <span>Leave Room</span>
                </button>
              </div>
            )}
          </button>
        </div>
      </div>
      
      {/* Main chat area - flexible height container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat messages panel - scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* ... existing code ... */}
          
          {/* Chat input area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
            {/* Reply preview */}
            {replyToMessage && (
              <div className="flex items-center mb-2 p-2 rounded bg-gray-100 dark:bg-gray-700">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FiCornerUpRight className="mr-1" size={12} />
                    <span className="font-medium mr-1">
                      {replyToMessage.user?.username || 'User'}:
                    </span>
                    <span className="truncate">
                      {replyToMessage.text || 'Message'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={cancelReply}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
            
            {/* Message formatting toolbar */}
            {showFormatting && (
              <div className="flex space-x-2 mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <button 
                  onClick={() => applyFormatting('bold')} 
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Bold"
                >
                  <FiBold size={16} />
                </button>
                <button 
                  onClick={() => applyFormatting('italic')} 
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Italic"
                >
                  <FiItalic size={16} />
                </button>
                <button 
                  onClick={() => applyFormatting('underline')} 
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Underline"
                >
                  <FiUnderline size={16} />
                </button>
                <button 
                  onClick={() => {
                    setShowCodeEditor(true);
                    setShowFormatting(false);
                  }} 
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Code Snippet"
                >
                  <FiCode size={16} />
                </button>
                <button 
                  onClick={() => {
                    setShowPollCreator(true);
                    setShowFormatting(false);
                  }} 
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="Create Poll"
                >
                  <FiPieChart size={16} />
                </button>
              </div>
            )}
            
            {/* Emoji picker */}
            {showEmoji && (
              <div className="absolute bottom-20 right-16 z-10 shadow-lg rounded-lg overflow-hidden">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme={isDarkMode ? "dark" : "light"}
                  previewPosition="none"
                  skinTonePosition="none"
                  set="native"
                />
              </div>
            )}
            
            {/* Message input area */}
            <form onSubmit={handleSendMessage} className="flex items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={e => {
                    setMessage(e.target.value);
                    handleTyping();
                    
                    // Check for mention
                    const text = e.target.value;
                    const cursorPos = e.target.selectionStart;
                    setCursorPosition(cursorPos);
                    
                    // Find @ before cursor
                    const textBeforeCursor = text.substring(0, cursorPos);
                    const atIndex = textBeforeCursor.lastIndexOf('@');
                    
                    if (atIndex !== -1 && atIndex > textBeforeCursor.lastIndexOf(' ')) {
                      const mentionText = textBeforeCursor.substring(atIndex + 1);
                      setMentionSearch(mentionText);
                      setShowMentions(true);
                      setMentionIndex(0);
                    } else {
                      setShowMentions(false);
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-gray-700 dark:border-gray-600"
                  rows="1"
                  style={{ maxHeight: '120px', minHeight: '40px' }}
                  onKeyDown={e => {
                    handleMentionKeyDown(e);
                    handleKeyDown(e);
                  }}
                />
                
                {/* Character limit indicator */}
                <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                  {message.length > 400 ? (
                    <span className={message.length > 500 ? 'text-red-500' : 'text-yellow-500'}>
                      {message.length}/500
                    </span>
                  ) : null}
                </div>
                
                {/* Mentions dropdown */}
                {showMentions && filteredUsers.length > 0 && (
                  <div className="absolute bottom-full mb-1 left-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto w-64">
                    {filteredUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className={`
                          p-2 cursor-pointer flex items-center
                          ${index === mentionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}
                          hover:bg-gray-100 dark:hover:bg-gray-700
                        `}
                        onClick={() => insertMention(user)}
                      >
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                          alt={user.username}
                          className="h-6 w-6 rounded-full mr-2"
                        />
                        <div className="text-sm">{user.username}</div>
                        {user.status && (
                          <div className="ml-auto text-xs text-gray-500">{user.status}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Message action buttons */}
              <div className="flex items-center pl-2">
                <button
                  type="button"
                  onClick={toggleEmojiPicker}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
                  title="Add emoji"
                >
                  <FiSmile size={20} className={showEmoji ? "text-primary-500" : ""} />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowGifPicker(prev => !prev);
                    setShowEmoji(false);
                    setShowFormatting(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
                  title="Add GIF"
                >
                  <RiGifLine size={20} className={showGifPicker ? "text-primary-500" : ""} />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowFormatting(prev => !prev);
                    setShowEmoji(false);
                    setShowGifPicker(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-1"
                  title="Formatting options"
                >
                  <FiBold size={20} className={showFormatting ? "text-primary-500" : ""} />
                </button>

                <button
                  type="submit"
                  disabled={!message.trim() || isSending}
                  className={`
                    p-2 rounded-full ml-1
                    ${!message.trim() || isSending ? 
                      'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed' : 
                      'bg-primary-500 text-white hover:bg-primary-600'
                    }
                    transition-colors
                  `}
                  title="Send message"
                >
                  <FiSend size={20} />
                </button>
              </div>
            </form>
            
            {/* Typing indicator */}
            {typingUsers && typingUsers.length > 0 && typingUsers[0] !== currentUser.username && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                {typingUsers.length === 1 ? 
                  `${typingUsers[0]} is typing...` : 
                  `${typingUsers.length} people are typing...`
                }
              </div>
            )}
          </div>
        </div>
        
        {/* ... existing code ... */}
        
      </div>
    </div>
  );
};

export default ChatRoom; 