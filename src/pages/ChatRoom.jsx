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
  FiFilter,
  FiVolume2,
  FiVolumeX,
  FiMusic,
  FiPlus,
  FiSkipBack,
  FiSkipForward,
  FiRefreshCcw,
  FiChevronsDown
} from 'react-icons/fi';
import { BsEmojiSmile, BsThreeDotsVertical, BsArrowLeft, BsPin, BsPinFill } from "react-icons/bs";
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
  const [themeVariant, setThemeVariant] = useState(localStorage.getItem('themeVariant') || 'default');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('chatTheme');
    // Default to system preference if no saved preference
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setDarkMode(prev => {
      const newTheme = !prev;
      localStorage.setItem('chatTheme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };
  
  // Apply theme to document when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Sound effects reference
  const soundEffectsRefs = {
    message: useRef(null),
    notification: useRef(null),
    sent: useRef(null),
    join: useRef(null),
    leave: useRef(null)
  };
  
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
  
  // Available theme variants
  const themeVariants = [
    { id: 'default', name: 'Default', description: 'Standard chat theme' },
    { id: 'comfortable', name: 'Comfortable', description: 'More spacing between elements' },
    { id: 'compact', name: 'Compact', description: 'Conserves vertical space' },
    { id: 'bubbly', name: 'Bubbly', description: 'Classic message bubble style' },
    { id: 'modern', name: 'Modern', description: 'Sleek and minimal design' }
  ];
  
  // Available theme colors
  const themeColors = [
    { id: 'indigo', name: 'Indigo', color: '#4f46e5' },
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'green', name: 'Green', color: '#10b981' },
    { id: 'rose', name: 'Rose', color: '#f43f5e' },
    { id: 'purple', name: 'Purple', color: '#8b5cf6' },
    { id: 'teal', name: 'Teal', color: '#14b8a6' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' }
  ];
  
  // Update theme settings
  const handleThemeChange = (variant, color, darkMode) => {
    let newVariant = variant !== undefined ? variant : themeVariant;
    let newColor = color !== undefined ? color : themeColor;
    let newDarkMode = darkMode !== undefined ? darkMode : isDarkMode;
    
    setThemeVariant(newVariant);
    setThemeColor(newColor);
    setIsDarkMode(newDarkMode);
    
    localStorage.setItem('themeVariant', newVariant);
    localStorage.setItem('themeColor', newColor);
    localStorage.setItem('darkMode', newDarkMode);
    
    // Apply theme classes to body
    document.body.className = `theme-${newVariant} theme-color-${newColor} ${newDarkMode ? 'dark' : 'light'}`;
  };
  
  // Initialize theme on component mount
  useEffect(() => {
    handleThemeChange(themeVariant, themeColor, isDarkMode);
  }, []);
  
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
      
      if (isNearBottom) {
        setHasNewMessages(false);
      }
    };
    
    chatMessages.addEventListener('scroll', handleScroll);
    return () => chatMessages.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Detect new messages when not at bottom
  useEffect(() => {
    if (!autoScroll && roomMessages.length > 0) {
      // Check if latest message is from someone else
      const latestMessage = roomMessages[roomMessages.length - 1];
      if (latestMessage && latestMessage.userId !== currentUser.id) {
        setHasNewMessages(true);
      }
    }
  }, [roomMessages, autoScroll, currentUser.id]);
  
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
  
  // Improved typing indicator animation
  const renderTypingIndicator = () => {
    const typingUsersList = Object.keys(typingUsers)
      .filter(id => id !== currentUser.id && typingUsers[id].roomId === roomId)
      .map(id => typingUsers[id].username);
    
    if (typingUsersList.length === 0) return null;
    
    let text = '';
    if (typingUsersList.length === 1) {
      text = `${typingUsersList[0]} is typing`;
    } else if (typingUsersList.length === 2) {
      text = `${typingUsersList[0]} and ${typingUsersList[1]} are typing`;
    } else {
      text = `${typingUsersList.length} people are typing`;
    }
    
    return (
      <div className="flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
        <div className="mr-2">{text}</div>
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full typing-dot"></div>
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full typing-dot"></div>
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full typing-dot"></div>
        </div>
      </div>
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
  
  // Initialize sound effects
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      soundEffectsRefs.message.current = new Audio('/sounds/message.mp3');
      soundEffectsRefs.notification.current = new Audio('/sounds/notification.mp3');
      soundEffectsRefs.sent.current = new Audio('/sounds/sent.mp3');
      soundEffectsRefs.join.current = new Audio('/sounds/join.mp3');
      soundEffectsRefs.leave.current = new Audio('/sounds/leave.mp3');
    }
    
    return () => {
      // Cleanup sound effects
      Object.values(soundEffectsRefs).forEach(sound => {
        if (sound.current) {
          sound.current.pause();
          sound.current = null;
        }
      });
    };
  }, []);
  
  // Play sound function with type parameter
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const sound = soundEffectsRefs[type]?.current;
    if (sound) {
      // Reset to start if already playing
      sound.currentTime = 0;
      sound.play().catch(err => console.log(`Failed to play ${type} sound:`, err));
    }
  };
  
  // Message history
  const [messageHistory, setMessageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save sent message to history
  const saveMessageToHistory = (text) => {
    if (!text.trim()) return;
    
    // Add to the beginning of history
    setMessageHistory(prev => {
      // Deduplicate
      const newHistory = [
        text,
        ...prev.filter(msg => msg !== text)
      ];
      
      // Limit to 20 messages
      return newHistory.slice(0, 20);
    });
    
    // Reset history index
    setHistoryIndex(-1);
  };

  // Updated message send handler to save to history
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
      // Save to history before sending
      saveMessageToHistory(message);
      
      // Send message
      sendMessage(roomId, message.trim());
      
      // Play sent sound effect
      playSound('sent');
      
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
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2" title={formatFullTimestamp(msg.createdAt)}>
              {formatMessageTime(msg.createdAt)}
            </span>
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
  
  // Render read receipts for a message
  const renderMessageReadIndicators = (message) => {
    const receipts = readReceipts[message.id] || [];
    
    // Don't show anything if no one has read the message
    if (receipts.length === 0) return null;
    
    // Don't show receipts for your own messages if only you have seen it
    if (message.userId === currentUser.id && receipts.length === 1 && receipts[0].userId === currentUser.id) {
      return null;
    }
    
    return (
      <div className="flex items-center mt-1 justify-end">
        <div className="flex -space-x-2">
          {receipts.slice(0, 3).map((receipt, index) => (
            <div 
              key={receipt.userId} 
              className="w-4 h-4 rounded-full border border-white dark:border-gray-800 bg-gray-300 flex items-center justify-center text-white text-[8px] border border-white dark:border-gray-900"
              title={receipt.username}
            >
              {receipt.username.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        {receipts.length > 3 && (
          <div 
            className="w-4 h-4 rounded-full border border-white dark:border-gray-800 bg-gray-300 flex items-center justify-center text-[8px]"
            title={`Read by ${receipts.length} users`}
          >
            +{receipts.length - 3}
          </div>
        )}
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
  
  // Voice recording functions
  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up visualizer
      const audioContext = audioContextRef.current;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Get data when available
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      // When recording stops
      mediaRecorder.onstop = () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        
        // Create a new audio recording ID
        const recordingId = `rec_${Date.now()}`;
        
        // Save to recordings state
        setRecordings(prev => ({
          ...prev,
          [recordingId]: {
            url: URL.createObjectURL(audioBlob),
            blob: audioBlob,
            duration: recordingDuration
          }
        }));
        
        // Send the voice message
        sendVoiceMessage(recordingId);
        
        // Reset state
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
        setIsRecording(false);
        setRecordingDuration(0);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(`Unable to access microphone: ${error.message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop the media recorder
      mediaRecorderRef.current.stop();
      
      // Clear the recording data
      audioChunksRef.current = [];
      
      // Clear the timer
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
      
      // Reset state
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const sendVoiceMessage = (recordingId) => {
    if (!recordings[recordingId]) return;
    
    // Create a voice message object
    const voiceMessage = {
      id: `voice_${Date.now()}`,
      roomId,
      userId: currentUser.id,
      user: currentUser,
      timestamp: new Date().toISOString(),
      type: 'voice',
      voice: {
        recordingId,
        duration: recordings[recordingId].duration
      },
      text: `Voice message (${formatDuration(recordings[recordingId].duration)})`
    };
    
    // Add to messages
    setRoomMessages(prev => [...prev, voiceMessage]);
    
    // Convert blob to base64 for transmission
    const reader = new FileReader();
    reader.readAsDataURL(recordings[recordingId].blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      
      // Emit socket event with voice data
      socket.emit('message', {
        ...voiceMessage,
        voice: {
          ...voiceMessage.voice,
          data: base64data
        }
      });
    };
    
    // Play sound effect
    playMessageSound();
  };

  const togglePlayVoiceMessage = (recordingId) => {
    // If there's already a playing audio, pause it
    if (playingAudio) {
      audioPlayerRef.current?.pause();
      setPlayingAudio(null);
    }
    
    // If the clicked message is not the one that was playing, play it
    if (recordingId !== playingAudio) {
      setPlayingAudio(recordingId);
      
      // Get the audio URL
      const audioUrl = recordings[recordingId]?.url;
      if (!audioUrl) return;
      
      // Play the audio
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
      } else {
        audioPlayerRef.current.src = audioUrl;
      }
      
      audioPlayerRef.current.play();
      
      // When audio ends, reset playing state
      audioPlayerRef.current.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  const renderVoiceMessage = (msg) => {
    if (!msg.voice) return <div>Voice message unavailable</div>;
    
    const recordingId = msg.voice.recordingId;
    const duration = msg.voice.duration;
    const isPlaying = playingAudio === recordingId;
    
    // If we received the voice message but don't have the recording
    // (this happens when receiving from another user)
    if (!recordings[recordingId] && msg.voice.data) {
      // Create blob and URL from the base64 data
      const byteString = atob(msg.voice.data.split(',')[1]);
      const mimeString = msg.voice.data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      
      // Add to recordings state
      setRecordings(prev => ({
        ...prev,
        [recordingId]: {
          url,
          blob,
          duration
        }
      }));
    }
    
    return (
      <div className="voice-message bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[240px]">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => togglePlayVoiceMessage(recordingId)}
            className="p-2 rounded-full bg-primary-500 text-white"
          >
            {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
          
          <div className="flex-1">
            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ 
                  width: isPlaying ? '100%' : '0%',
                  animation: isPlaying ? `progress ${duration}s linear` : 'none'
                }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDuration(duration)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Create a color palette for themes
  const colorOptions = [
    { name: 'indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'green', value: 'green', class: 'bg-green-500' },
    { name: 'red', value: 'red', class: 'bg-red-500' },
    { name: 'purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'teal', value: 'teal', class: 'bg-teal-500' }
  ];

  // Update theme color
  const updateThemeColor = (color) => {
    setThemeColor(color);
    localStorage.setItem('themeColor', color);
    document.documentElement.setAttribute('data-theme', color);
  };
  
  // Mark message as read
  const markMessageAsRead = (messageId) => {
    if (!messageId || !socket) return;
    
    socket.emit('message_read', {
      roomId,
      messageId,
      userId: currentUser.id,
      username: currentUser.username
    });
  };

  // Process visible messages and mark them as read
  const processVisibleMessages = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const messageId = entry.target.dataset.messageId;
        if (messageId) {
          markMessageAsRead(messageId);
        }
      }
    });
  };

  // Set up intersection observer for read receipts
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver(processVisibleMessages, options);
    
    // Get all message elements and observe them
    const messageElements = document.querySelectorAll('.message-item');
    messageElements.forEach(el => observer.observe(el));
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [roomMessages]);

  // Listen for read receipts
  useEffect(() => {
    if (!socket) return;
    
    socket.on('message_read', ({ messageId, userId, username }) => {
      setReadReceipts(prev => {
        // If this message already has read receipts
        if (prev[messageId]) {
          // If this user hasn't already been recorded
          if (!prev[messageId].some(receipt => receipt.userId === userId)) {
            return {
              ...prev,
              [messageId]: [...prev[messageId], { userId, username }]
            };
          }
        } else {
          // First read receipt for this message
          return {
            ...prev,
            [messageId]: [{ userId, username }]
          };
        }
        return prev;
      });
    });
    
    return () => {
      socket.off('message_read');
    };
  }, [socket]);

  // Render read receipts for a message
  const renderReadReceipts = (message) => {
    const receipts = readReceipts[message.id] || [];
    
    // Don't show anything if no one has read the message
    if (receipts.length === 0) return null;
    
    // Don't show receipts for your own messages if only you have seen it
    if (message.userId === currentUser.id && receipts.length === 1 && receipts[0].userId === currentUser.id) {
      return null;
    }
    
    return (
      <div className="flex items-center mt-1 justify-end">
        <div className="flex -space-x-2">
          {receipts.slice(0, 3).map((receipt, index) => (
            <div 
              key={receipt.userId} 
              className="w-4 h-4 rounded-full border border-white dark:border-gray-800 bg-gray-300 flex items-center justify-center text-white text-[8px] border border-white dark:border-gray-900"
              title={receipt.username}
            >
              {receipt.username.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        {receipts.length > 3 && (
          <div 
            className="w-4 h-4 rounded-full border border-white dark:border-gray-800 bg-gray-300 flex items-center justify-center text-[8px]"
            title={`Read by ${receipts.length} users`}
          >
            +{receipts.length - 3}
          </div>
        )}
      </div>
    );
  };
  
  // Format date for scheduler display
  const formatScheduledTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPp'); // Format like "Apr 10, 2023, 3:45 PM"
  };

  // Check for scheduled messages that need to be sent
  const checkScheduledMessages = () => {
    const now = new Date();
    
    // Find messages that are due to be sent
    const dueMessages = scheduledMessages.filter(msg => 
      new Date(msg.scheduledFor) <= now && msg.roomId === roomId
    );
    
    // Send each due message
    dueMessages.forEach(msg => {
      sendMessage(msg.roomId, msg.text);
      playMessageSound();
    });
    
    // Remove sent messages from the scheduled list
    if (dueMessages.length > 0) {
      const remainingMessages = scheduledMessages.filter(msg => 
        !dueMessages.some(dueMsg => dueMsg.id === msg.id)
      );
      
      setScheduledMessages(remainingMessages);
      localStorage.setItem('scheduledMessages', JSON.stringify(remainingMessages));
    }
  };

  // Set up interval to check for scheduled messages
  useEffect(() => {
    // Check on component mount
    checkScheduledMessages();
    
    // Set up interval to check every minute
    const interval = setInterval(checkScheduledMessages, 60000);
    
    return () => clearInterval(interval);
  }, [scheduledMessages, roomId]);

  // Schedule a message for later sending
  const handleScheduleNewMessage = () => {
    if (!message.trim()) return;
    
    // Validate date and time
    if (!scheduledDate || !scheduledTime) {
      alert('Please select both date and time for your scheduled message');
      return;
    }
    
    // Create datetime from date and time inputs
    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    
    // Check if the scheduled time is in the future
    if (scheduledFor <= new Date()) {
      alert('Please schedule the message for a future time');
      return;
    }
    
    // Create scheduled message object
    const scheduledMessage = {
      id: `scheduled_${Date.now()}`,
      text: message.trim(),
      roomId,
      scheduledFor: scheduledFor.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Add to scheduled messages
    const updatedScheduledMessages = [...scheduledMessages, scheduledMessage];
    setScheduledMessages(updatedScheduledMessages);
    
    // Save to localStorage
    localStorage.setItem('scheduledMessages', JSON.stringify(updatedScheduledMessages));
    
    // Clear input and close scheduler
    setMessage('');
    setScheduledDate('');
    setScheduledTime('');
    setShowScheduler(false);
    
    // Show confirmation
    alert(`Message scheduled for ${formatScheduledTime(scheduledFor)}`);
  };

  // Load scheduled messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('scheduledMessages');
    if (savedMessages) {
      try {
        setScheduledMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error parsing scheduled messages:', error);
      }
    }
  }, []);
  
  // Language options for translation
  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' }
  ];

  // Simple mock translation function (in real app, would use API)
  const translateMessage = (text, targetLang) => {
    // This would call a real translation API in production
    return `[${targetLang}] ${text}`;
  };

  // Handle translation request
  const handleTranslate = (messageId, text) => {
    // In a real app, you'd show a loading state during API call
    const translated = translateMessage(text, targetLanguage);
    
    setTranslatedMessages(prev => ({
      ...prev,
      [messageId]: translated
    }));
  };
  
  // Add keyframes for typing animation
  useEffect(() => {
    if (document.getElementById('typing-animation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'typing-animation-styles';
    style.innerHTML = `
      @keyframes typingDot {
        0%, 100% { opacity: 0.2; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-3px); }
      }
      .typing-dot {
        animation-duration: 1s;
        animation-name: typingDot;
        animation-iteration-count: infinite;
      }
      .typing-dot:nth-child(1) { animation-delay: 0s; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const styleElement = document.getElementById('typing-animation-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  // Quick reaction emojis
  const quickReactions = [
    { emoji: '👍', name: 'thumbs_up' },
    { emoji: '❤️', name: 'heart' },
    { emoji: '😂', name: 'joy' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '🔥', name: 'fire' }
  ];

  // Add quick reaction
  const addQuickReaction = (messageId, emoji) => {
    const reaction = {
      emoji,
      userId: currentUser.id,
      username: currentUser.username
    };
    
    socket.emit('message_reaction', {
      roomId,
      messageId,
      reaction
    });
  };
  
  // Connection states
  const CONNECTION_STATES = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting'
  };

  // Add connection state
  const [connectionState, setConnectionState] = useState(
    socket?.connected ? CONNECTION_STATES.CONNECTED : CONNECTION_STATES.CONNECTING
  );

  // Track socket connection
  useEffect(() => {
    if (!socket) return;
    
    const handleConnect = () => {
      setConnectionState(CONNECTION_STATES.CONNECTED);
      playSound('notification');
    };
    
    const handleDisconnect = () => {
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    };
    
    const handleConnecting = () => {
      setConnectionState(CONNECTION_STATES.CONNECTING);
    };
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect_attempt', handleConnecting);
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect_attempt', handleConnecting);
    };
  }, [socket, playSound]);

  // Connection status component
  const ConnectionStatus = () => {
    if (connectionState === CONNECTION_STATES.CONNECTED) {
      return null; // Don't show anything when connected
    }
    
    return (
      <div className={`
        fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
        px-4 py-2 rounded-full shadow-lg
        flex items-center space-x-2
        ${connectionState === CONNECTION_STATES.CONNECTING
          ? 'bg-yellow-500 text-yellow-50'
          : 'bg-red-500 text-red-50'
        }
      `}>
        <div className={`
          w-2 h-2 rounded-full
          ${connectionState === CONNECTION_STATES.CONNECTING 
            ? 'bg-yellow-200 animate-pulse' 
            : 'bg-red-200'
          }
        `}></div>
        <span>
          {connectionState === CONNECTION_STATES.CONNECTING
            ? 'Connecting...'
            : 'Disconnected. Attempting to reconnect...'
          }
        </span>
      </div>
    );
  };
  
  const MAX_MESSAGE_LENGTH = 500;
  
  // Handle up/down arrow keys to navigate history
  const handleHistoryNavigation = (e) => {
    // Handle up arrow to navigate backward in history
    if (e.key === 'ArrowUp' && !e.shiftKey && messageHistory.length > 0) {
      e.preventDefault();
      
      // First press should go to most recent message
      const newIndex = historyIndex < messageHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      
      // Set input to selected historical message
      setMessage(messageHistory[newIndex] || '');
    }
    
    // Handle down arrow to navigate forward in history
    if (e.key === 'ArrowDown' && !e.shiftKey && historyIndex > -1) {
      e.preventDefault();
      
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      // Set input to selected historical message, or clear if we're back to current
      setMessage(newIndex >= 0 ? messageHistory[newIndex] : '');
      
      // Move cursor to end of input
      setTimeout(() => {
        if (messageInputRef.current) {
          const length = messageInputRef.current.value.length;
          messageInputRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  };
  
  // Render theme settings panel
  const renderThemeSettings = () => {
    return (
      <div className="absolute top-14 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-80 p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Appearance Settings</h3>
          <button 
            onClick={() => setShowThemeSettings(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Theme Mode</span>
            <button 
              onClick={() => handleThemeChange(undefined, undefined, !isDarkMode)}
              className="flex items-center px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
            >
              {isDarkMode ? <FiMoon className="mr-1" /> : <FiSun className="mr-1" />}
              {isDarkMode ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Style</h4>
          <div className="grid grid-cols-2 gap-2">
            {themeVariants.map(variant => (
              <button
                key={variant.id}
                onClick={() => handleThemeChange(variant.id)}
                className={`p-2 rounded-md text-xs text-left ${
                  themeVariant === variant.id 
                    ? `ring-2 ring-${themeColor}-500 bg-${themeColor}-50 dark:bg-${themeColor}-900 dark:bg-opacity-20` 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="font-medium mb-1">{variant.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{variant.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Accent</h4>
          <div className="flex flex-wrap gap-2">
            {themeColors.map(color => (
              <button
                key={color.id}
                onClick={() => handleThemeChange(undefined, color.id)}
                className={`w-8 h-8 rounded-full ${
                  themeColor === color.id ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' : ''
                }`}
                style={{ backgroundColor: color.color }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Add or remove a reaction to a message
  const handleReaction = (messageId, emoji) => {
    if (!socket) return;
    
    socket.emit('add_reaction', {
      messageId,
      roomId,
      userId: currentUser.id,
      username: currentUser.username,
      emoji
    });
    
    setShowReactions(false);
    setReactionTarget(null);
  };
  
  // Effect to handle clicks outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
        setShowReactions(false);
        setReactionTarget(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Listen for reaction updates from server
  useEffect(() => {
    if (!socket) return;
    
    socket.on('reaction_updated', (data) => {
      setReactions(prevReactions => ({
        ...prevReactions,
        [data.messageId]: data.reactions
      }));
    });
    
    return () => {
      socket.off('reaction_updated');
    };
  }, [socket]);
  
  // Create an emoji picker component
  const renderEmojiPicker = () => {
    const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "👏", "🔥", "✅"];
    
    return (
      <div 
        ref={emojiPickerRef}
        className="absolute bottom-16 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50"
      >
        <div className="grid grid-cols-5 gap-2">
          {emojis.map(emoji => (
            <button
              key={emoji}
              className="w-10 h-10 text-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => {
                if (reactionTarget) {
                  handleReaction(reactionTarget, emoji);
                } else {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render reactions for a message
  const renderMessageReactions = (message) => {
    const messageReactions = reactions[message.id] || {};
    
    // If no reactions, return null
    if (Object.keys(messageReactions).length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(messageReactions).map(([emoji, users]) => (
          <button
            key={emoji}
            className={`text-xs rounded-full px-2 py-0.5 flex items-center gap-1 border ${
              users.some(u => u.userId === currentUser.id)
                ? 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
                : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700'
            }`}
            onClick={() => handleReaction(message.id, emoji)}
            title={users.map(u => u.username).join(', ')}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        ))}
      </div>
    );
  };
  
  // Function to open reaction picker for a specific message
  const openReactionPicker = (messageId) => {
    setReactionTarget(messageId);
    setShowReactions(true);
    setShowEmojiPicker(true);
  };
  
  // Update message JSX to include reaction button
  const renderMessage = (message, index) => {
    // ... existing code ...
    return (
      <motion.div
        // ... existing motion props ...
      >
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          {/* ... existing message content ... */}
          
          {/* Add reaction button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => openReactionPicker(message.id)}
              aria-label="Add reaction"
            >
              <BsEmojiSmile size={14} />
            </button>
          </div>
        </div>
        
        {/* Show message reactions */}
        {renderMessageReactions(message)}
        
        {/* ... existing read receipts ... */}
      </motion.div>
    );
  };
  
  // ... existing code ...
  
  // Sound effect related state
  const [soundEffectsList, setSoundEffectsList] = useState([
    { id: 'applause', name: 'Applause', url: '/sounds/applause.mp3' },
    { id: 'drumroll', name: 'Drum Roll', url: '/sounds/drumroll.mp3' },
    { id: 'tada', name: 'Ta-Da!', url: '/sounds/tada.mp3' },
    { id: 'laugh', name: 'Laugh', url: '/sounds/laugh.mp3' },
    { id: 'oops', name: 'Oops', url: '/sounds/oops.mp3' },
    { id: 'cheer', name: 'Cheer', url: '/sounds/cheer.mp3' }
  ]);
  const [showSoundEffects, setShowSoundEffects] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Play sound effect and send to chat
  const playSoundEffect = (soundId) => {
    if (isSoundMuted) return;
    
    // Find the sound effect
    const soundEffect = soundEffectsList.find(sound => sound.id === soundId);
    if (!soundEffect) return;
    
    // Create audio element
    const audio = new Audio(soundEffect.url);
    audio.volume = soundVolume;
    audio.play();
    
    // Send sound effect message to chat
    if (socket) {
      socket.emit('sound_effect', {
        roomId,
        userId: currentUser.id,
        username: currentUser.username,
        soundId,
        soundName: soundEffect.name
      });
    }
  };

  // Listen for sound effects from other users
  useEffect(() => {
    if (!socket) return;
    
    const handleSoundEffect = ({ userId, username, soundId, soundName }) => {
      // Don't play our own sound effects (we already played them)
      if (userId === currentUser.id) return;
      
      // Play the sound
      const soundEffect = soundEffectsList.find(sound => sound.id === soundId);
      if (soundEffect && !isSoundMuted) {
        const audio = new Audio(soundEffect.url);
        audio.volume = soundVolume;
        audio.play();
      }
      
      // Add a special message to the chat
      const newMessage = {
        id: `sound_${Date.now()}`,
        type: 'sound_effect',
        userId,
        username,
        roomId,
        soundId,
        soundName,
        createdAt: new Date().toISOString()
      };
      
      setRoomMessages(prev => [...prev, newMessage]);
    };
    
    socket.on('sound_effect', handleSoundEffect);
    
    return () => {
      socket.off('sound_effect', handleSoundEffect);
    };
  }, [socket, currentUser.id, soundEffectsList, isSoundMuted, soundVolume]);

  // Render sound effect message
  const renderSoundEffect = (message) => {
    return (
      <div className="flex items-center space-x-2 my-2 py-1 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-xs mx-auto">
        <FiMusic className="text-primary-500" />
        <div className="text-sm">
          <span className="font-medium">{message.username}</span> played sound effect: 
          <span className="font-medium ml-1">{message.soundName}</span>
        </div>
        <button 
          onClick={() => playSoundEffect(message.soundId)}
          className="ml-2 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          title="Play again"
        >
          <FiRefreshCcw size={16} />
        </button>
      </div>
    );
  };

  // Sound effects panel
  const renderSoundEffectsPanel = () => {
    if (!showSoundEffects) return null;
    
    return (
      <div className="absolute bottom-16 left-4 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 w-72">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Sound Effects</h3>
          <div className="flex items-center">
            <button 
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
              title={isSoundMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isSoundMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
            </button>
            <button 
              onClick={() => setShowSoundEffects(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Volume</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={soundVolume} 
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            disabled={isSoundMuted}
            className="w-full accent-primary-500" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {soundEffectsList.map(sound => (
            <button
              key={sound.id}
              onClick={() => playSoundEffect(sound.id)}
              disabled={isSoundMuted}
              className="text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <FiMusic className="text-primary-500" />
              <span>{sound.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center">
            <FiUpload className="mr-1" /> Upload custom sound
          </button>
        </div>
      </div>
    );
  };

  // Add sound effects button to the chat input toolbar
  const renderChatInputToolbar = () => (
    <div className="flex items-center space-x-2 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
      {/* ... existing toolbar buttons ... */}
      
      <button
        onClick={() => setShowSoundEffects(!showSoundEffects)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Sound Effects"
      >
        <FiMusic size={20} />
      </button>
      
      {/* ... existing toolbar buttons ... */}
    </div>
  );
  
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };

  // Add a function to format full timestamp for tooltip
  const formatFullTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return format(date, 'PPpp'); // Formats to something like "Apr 20, 2023, 3:45 PM EDT"
  };
  
  // Add state for new message indicator
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <div className="border-b py-2 px-3 flex items-center justify-between shadow-sm">
        {/* ... existing code for chat header ... */}
        
        {/* Theme toggle button - add after other header buttons */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-600" />}
        </button>
        
        {/* ... existing code ... */}
      </div>
      
      {/* Update other container classes to support dark mode */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
            ref={messagesContainerRef}
          >
            {/* ... existing code ... */}
          </div>
          
          <div className="border-t p-3 bg-white dark:bg-gray-900 dark:border-gray-700">
            {/* ... existing message input area ... */}
          </div>
        </div>
        
        {/* Update sidebar to support dark mode */}
        {showUsers && (
          <div className={`w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col ${showUsers ? 'md:relative absolute right-0 top-0 h-full z-20' : 'hidden'}`}>
            {/* ... existing user sidebar code ... */}
          </div>
        )}
      </div>
      
      {showScrollButton && (
        <button 
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-10 p-2 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-all transform hover:scale-110"
          title="Scroll to latest messages"
        >
          {hasNewMessages ? (
            <div className="relative">
              <FiChevronsDown className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            </div>
          ) : (
            <FiChevronsDown className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};

export default ChatRoom; 