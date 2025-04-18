import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiArrowLeft, FiSearch, FiChevronUp, FiChevronDown, FiSettings, FiArrowDown, FiPaperclip, FiFile, FiImage, FiVideo, FiMusic, FiDownload, FiBell, FiBellOff, FiVolume, FiVolumeX, FiMoon, FiSun, FiCornerDownRight, FiMessageSquare, FiChevronRight, FiMaximize, FiZoomIn, FiZoomOut, FiRotateCw, FiClock, FiCalendar, FiCheck, FiGlobe, FiBookmark, FiTag, FiEdit, FiBold, FiItalic, FiCode, FiLink, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight, FiLock, FiKey, FiShield, FiPlayCircle, FiPauseCircle, FiTrash2, FiMic, FiMicOff, FiPlay, FiPause, FiTrash } from 'react-icons/fi';
import { FaMicrophone, FaStop, FaPause, FaPlay, FaVolumeUp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { FaPaperPlane } from 'react-icons/fa';
import { useSelector } from "react-redux";

const ChatRoom = ({ socket, username, room, setRoom, navigate }) => {
  const [message, setMessage] = useState('');
  const [roomMessages, setRoomMessages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [reactions, setReactions] = useState({});
  const [activeReactionMessage, setActiveReactionMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [users, setUsers] = useState([
    { id: 1, username: 'Alice', status: 'online', lastSeen: null, customStatus: 'Working on project', isIdle: false },
    { id: 2, username: 'Bob', status: 'away', lastSeen: new Date(Date.now() - 15 * 60000), customStatus: 'In a meeting', isIdle: true },
    { id: 3, username: 'Charlie', status: 'offline', lastSeen: new Date(Date.now() - 120 * 60000), customStatus: '', isIdle: false },
    { id: 4, username: 'David', status: 'online', lastSeen: null, customStatus: 'Available', isIdle: false },
  ]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#3b82f6', // Default blue
    secondaryColor: '#10b981', // Default green
    accentColor: '#8b5cf6', // Default purple
  });
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordingTimerRef = useRef(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [notificationSettings, setNotificationSettings] = useState({
    soundEnabled: true,
    desktopEnabled: false,
    mentionsOnly: false
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const notificationAudio = useMemo(() => new Audio('/notification.mp3'), []);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [userStatus, setUserStatus] = useState('online');
  const [customStatusMessage, setCustomStatusMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState(null);
  const [isIdle, setIsIdle] = useState(false);
  const IDLE_TIME = 5 * 60 * 1000; // 5 minutes
  const [activeThread, setActiveThread] = useState(null);
  const [showThreads, setShowThreads] = useState(false);
  const [threadReplies, setThreadReplies] = useState({});
  const [threadParentLookup, setThreadParentLookup] = useState({});
  const threadListRef = useRef(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0);
  const [keySequence, setKeySequence] = useState([]);
  const messageInputRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageDragPosition, setImageDragPosition] = useState({ x: 0, y: 0 });
  const lightboxRef = useRef(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [showScheduledMessages, setShowScheduledMessages] = useState(false);
  const [readReceipts, setReadReceipts] = useState({});
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [translations, setTranslations] = useState({});
  const [userLanguage, setUserLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
  ]);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [activeBookmark, setActiveBookmark] = useState(null);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarkCategories, setBookmarkCategories] = useState([
    { id: 1, name: 'Important', color: 'red' },
    { id: 2, name: 'Todo', color: 'green' },
    { id: 3, name: 'Question', color: 'blue' },
    { id: 4, name: 'Idea', color: 'purple' },
    { id: 5, name: 'Follow-up', color: 'orange' }
  ]);
  const [bookmarkCategory, setBookmarkCategory] = useState(1);
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [messageSelection, setMessageSelection] = useState({ start: 0, end: 0 });
  const [messageFormat, setMessageFormat] = useState({
    bold: false,
    italic: false,
    code: false,
    link: false,
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showEncryptionSettings, setShowEncryptionSettings] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [privateMessageUser, setPrivateMessageUser] = useState(null);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [encryptedMessages, setEncryptedMessages] = useState({});
  const [keysExchanged, setKeysExchanged] = useState({});
  
  // Enhanced audio recording and playback state
  const [recordingQuality, setRecordingQuality] = useState('standard'); // 'low', 'standard', 'high'
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const audioRefs = useRef({});
  const progressIntervals = useRef({});
  const [audioMessages, setAudioMessages] = useState({});
  const [soundEffects, setSoundEffects] = useState({
    recordStart: new Audio('/sounds/record-start.mp3'),
    recordStop: new Audio('/sounds/record-stop.mp3'),
    messageSent: new Audio('/sounds/message-sent.mp3')
  });
  
  const { roomId } = useParams();
  const messageRefs = useRef({});
  
  // Animation variants for messages
  const bubbleVariants = {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 }
  };
  
  // Animation variants for notifications
  const notificationVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  };
  
  // Show notification
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  // Search messages
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase();
    const results = roomMessages.filter(msg => 
      msg.text.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
    
    if (results.length === 0) {
      showNotification('No messages found', 'info');
    } else {
      scrollToMessage(results[0].id);
      showNotification(`Found ${results.length} messages`, 'success');
    }
  };
  
  // Navigate between search results
  const navigateResults = (direction) => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
      newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    }
    
    setCurrentResultIndex(newIndex);
    scrollToMessage(searchResults[newIndex].id);
  };
  
  // Scroll to a specific message
  const scrollToMessage = (messageId) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Highlight message briefly
      const element = messageRefs.current[messageId];
      element.classList.add('bg-yellow-100', 'dark:bg-yellow-900');
      setTimeout(() => {
        element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900');
      }, 1500);
    }
  };
  
  // Apply formatting to message
  const applyFormatting = (type) => {
    const input = document.getElementById('message-input');
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
  
  // Handle typing indicator
  const handleTyping = () => {
    // Simulate sending typing status to server
    setIsTyping(true);
    
    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    
    setTypingTimeout(timeout);
  };
  
  // Handle adding a reaction to a message
  const handleAddReaction = (emoji, messageId) => {
    const currentUserId = 1; // Assuming current user ID
    
    // Update reactions state
    setReactions(prevReactions => {
      // Get existing reactions for this message
      const messageReactions = prevReactions[messageId] || [];
      
      // Check if user already reacted with this emoji
      const existingReactionIndex = messageReactions.findIndex(
        r => r.emoji === emoji && r.userId === currentUserId
      );
      
      let updatedMessageReactions;
      
      if (existingReactionIndex >= 0) {
        // Remove reaction if it already exists
        updatedMessageReactions = [
          ...messageReactions.slice(0, existingReactionIndex),
          ...messageReactions.slice(existingReactionIndex + 1)
        ];
      } else {
        // Add new reaction
        updatedMessageReactions = [
          ...messageReactions,
          { emoji, userId: currentUserId, username: 'You' }
        ];
      }
      
      return {
        ...prevReactions,
        [messageId]: updatedMessageReactions
      };
    });
    
    setActiveReactionMessage(null);
  };
  
  // Render reactions for a message
  const renderReactions = (messageId) => {
    const messageReactions = reactions[messageId] || [];
    
    if (messageReactions.length === 0) {
      return null;
    }
    
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
        {Object.entries(groupedReactions).map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => handleAddReaction(emoji, messageId)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs flex items-center space-x-1 hover:bg-gray-200 dark:hover:bg-gray-600"
            title={users.map(u => u.username).join(', ')}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        ))}
      </div>
    );
  };
  
  // Simulate other users typing (for demo purposes)
  useEffect(() => {
    // Randomly have Bob or Alice start typing
    const randomStartTyping = () => {
      const randomUser = Math.random() > 0.5 ? 
        { id: 2, username: 'Bob' } : 
        { id: 1, username: 'Alice' };
      
      setTypingUsers(prev => ({
        ...prev,
        [randomUser.id]: randomUser.username
      }));
      
      // Stop typing after random time
      setTimeout(() => {
        setTypingUsers(prev => {
          const newTypingUsers = { ...prev };
          delete newTypingUsers[randomUser.id];
          return newTypingUsers;
        });
      }, 2000 + Math.random() * 3000);
    };
    
    // Set interval for random typing events
    const typingInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        randomStartTyping();
      }
    }, 5000);
    
    return () => clearInterval(typingInterval);
  }, []);
  
  // Render typing indicator
  const renderTypingIndicator = () => {
    const typingUsersList = Object.keys(typingUsers).map(id => typingUsers[id]);
    
    if (typingUsersList.length === 0) {
      return null;
    }
    
    let typingText = '';
    if (typingUsersList.length === 1) {
      typingText = `${typingUsersList[0]} is typing...`;
    } else if (typingUsersList.length === 2) {
      typingText = `${typingUsersList[0]} and ${typingUsersList[1]} are typing...`;
    } else {
      typingText = 'Several people are typing...';
    }
    
    return (
      <div className="text-xs text-gray-500 italic p-2 animate-pulse">
        {typingText}
        <span className="inline-block">
          <span className="dots-typing">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </span>
      </div>
    );
  };
  
  // Add styles for typing dots animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes dotTyping {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      .dots-typing span {
        animation: dotTyping 1.5s infinite;
        display: inline-block;
        opacity: 0;
      }
      
      .dots-typing span:nth-child(1) {
        animation-delay: 0s;
      }
      
      .dots-typing span:nth-child(2) {
        animation-delay: 0.5s;
      }
      
      .dots-typing span:nth-child(3) {
        animation-delay: 1s;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add emoji to message
  const addEmoji = (emoji) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get notification color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'command':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = { 
        id: Date.now(),
        text: message,
        timestamp: new Date().toISOString(),
        userId: 1, // Assuming current user
        username: 'You'
      };
      
      setRoomMessages([...roomMessages, newMessage]);
      setMessage('');
      showNotification('Message sent', 'success');
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setCurrentResultIndex(-1);
    setShowSearch(false);
  };
  
  // Add some sample messages for testing search
  useEffect(() => {
    if (roomMessages.length === 0) {
      const sampleMessages = [
        { id: 1, text: "Hello everyone!", timestamp: new Date().toISOString(), userId: 2, username: "Alice" },
        { id: 2, text: "Hi Alice, how are you doing today?", timestamp: new Date().toISOString(), userId: 3, username: "Bob" },
        { id: 3, text: "I'm doing great, thanks for asking!", timestamp: new Date().toISOString(), userId: 2, username: "Alice" },
        { id: 4, text: "Welcome to our chat room", timestamp: new Date().toISOString(), userId: 4, username: "David" },
        { id: 5, text: "Has anyone seen the latest product update?", timestamp: new Date().toISOString(), userId: 3, username: "Bob" },
      ];
      setRoomMessages(sampleMessages);
    }
  }, [roomMessages.length]);
  
  // Format message text with markdown support
  const formatMessageText = (text) => {
    if (!text) return null;
    
    // Process markdown
    // 1. Code blocks
    let formattedText = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-200 p-2 rounded my-1 overflow-x-auto">$1</pre>');
    
    // 2. Inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>');
    
    // 3. Bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 4. Italic
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // 5. Links
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
    
    // 6. Auto-detect URLs not in markdown format
    const urlPattern = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    formattedText = formattedText.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };
  
  // Auto-scroll function that scrolls to the bottom of messages
  const scrollToBottom = (behavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Check if should show the jump to bottom button
  const handleMessagesScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // Only show button when not at bottom and have some scroll distance
    setShowScrollButton(!isAtBottom && scrollHeight > clientHeight + 200);
  };

  // Scroll to bottom when new messages arrive if already at bottom
  useEffect(() => {
    if (roomMessages.length > 0) {
      // Auto-scroll only if user was already at the bottom
      if (!showScrollButton) {
        scrollToBottom();
      }
    }
  }, [roomMessages, showScrollButton]);

  // Scroll to bottom on initial load and room change
  useEffect(() => {
    scrollToBottom();
  }, [roomId]);
  
  // Apply custom theme colors to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', customTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', customTheme.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', customTheme.accentColor);
  }, [customTheme]);

  const handleThemeChange = (property, value) => {
    setCustomTheme(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const renderThemeSettings = () => {
    if (!showThemeSettings) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute right-0 top-16 z-50 w-72 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg"
      >
        <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-200">Customize Theme</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={customTheme.primaryColor}
                onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                className="h-8 w-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customTheme.primaryColor}
                onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                className="ml-2 px-2 py-1 w-24 text-sm border rounded"
              />
              <button
                onClick={() => handleThemeChange('primaryColor', '#3b82f6')}
                className="ml-2 text-xs text-blue-500 hover:text-blue-600"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Secondary Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={customTheme.secondaryColor}
                onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                className="h-8 w-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customTheme.secondaryColor}
                onChange={(e) => handleThemeChange('secondaryColor', e.target.value)}
                className="ml-2 px-2 py-1 w-24 text-sm border rounded"
              />
              <button
                onClick={() => handleThemeChange('secondaryColor', '#10b981')}
                className="ml-2 text-xs text-blue-500 hover:text-blue-600"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Accent Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                value={customTheme.accentColor}
                onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                className="h-8 w-8 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customTheme.accentColor}
                onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                className="ml-2 px-2 py-1 w-24 text-sm border rounded"
              />
              <button
                onClick={() => handleThemeChange('accentColor', '#8b5cf6')}
                className="ml-2 text-xs text-blue-500 hover:text-blue-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => setShowThemeSettings(false)}
            className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  };
  
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  
  // Add scroll position tracking
  useEffect(() => {
    const chatContainer = messagesEndRef.current;
    if (!chatContainer) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setIsScrolledUp(!isAtBottom);
      
      // Reset new messages count when scrolled to bottom
      if (isAtBottom) {
        setNewMessagesCount(0);
      }
    };
    
    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (roomMessages.length && messagesEndRef.current) {
      if (!isScrolledUp) {
        scrollToBottom();
      } else {
        // Increment new messages count when user is scrolled up
        setNewMessagesCount(prev => prev + 1);
      }
    }
  }, [roomMessages.length]);
  
  // Enhanced voice recording with quality options
  const startRecording = async () => {
    try {
      // Play record start sound
      soundEffects.recordStart.play().catch(err => console.error("Could not play sound effect:", err));
      
      const constraints = { audio: true };
      
      // Set audio quality based on selected option
      if (recordingQuality !== 'standard') {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: recordingQuality === 'high' ? 48000 : 16000,
          sampleSize: recordingQuality === 'high' ? 24 : 16
        };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const options = { mimeType: 'audio/webm' };
      const recorder = new MediaRecorder(stream, options);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        // Play record stop sound
        soundEffects.recordStop.play().catch(err => console.error("Could not play sound effect:", err));
        
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Create audio URL for preview
        const audioURL = URL.createObjectURL(blob);
        const audio = new Audio(audioURL);
        
        // Calculate audio duration
        audio.addEventListener('loadedmetadata', () => {
          const duration = Math.round(audio.duration);
          setAudioMessages(prev => ({
            ...prev,
            preview: {
              id: 'preview',
              url: audioURL,
              blob,
              duration,
              timestamp: new Date().toISOString()
            }
          }));
        });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Setup timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      
      // Discard the recording
      setTimeout(() => {
        setAudioBlob(null);
        setAudioMessages(prev => {
          const newState = { ...prev };
          delete newState.preview;
          return newState;
        });
      }, 100);
    }
  };
  
  const sendVoiceMessage = async () => {
    if (!audioBlob) return;
    
    try {
      // Play message sent sound
      soundEffects.messageSent.play().catch(err => console.error("Could not play sound effect:", err));
      
      // Convert blob to base64 (for API transmission)
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result;
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create new audio message
        const audioMessageId = Date.now();
        const newMessage = {
          id: audioMessageId,
          text: '🎤 Voice Message',
          timestamp: new Date().toISOString(),
          userId: 1, // Current user 
          username: 'You',
          type: 'audio',
          audio: {
            url: audioUrl,
            duration: audioMessages.preview?.duration || 0,
            transcription: ''  // Would be filled by a speech-to-text service
          }
        };
        
        // Add message to room messages
        setRoomMessages(prev => [...prev, newMessage]);
        
        // Update audio messages state
        setAudioMessages(prev => {
          const newState = { ...prev };
          delete newState.preview; // Remove preview
          newState[audioMessageId] = {
            id: audioMessageId,
            url: audioUrl,
            blob: audioBlob,
            duration: audioMessages.preview?.duration || 0,
            timestamp: new Date().toISOString()
          };
          return newState;
        });
        
        // Reset audio state
        setAudioBlob(null);
        
        // In a real app, you would send this to the server
        // socket.emit('audioMessage', { room, username, audioBase64: base64Audio, duration: audioMessages.preview?.duration || 0 });
        
        // Show notification
        showNotification('Voice message sent', 'success');
      };
    } catch (err) {
      console.error("Error sending voice message:", err);
      toast.error("Failed to send voice message");
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Play/pause audio message
  const toggleAudioPlayback = (audioId) => {
    const audioElement = audioRefs.current[audioId];
    if (!audioElement) return;
    
    // If this is already the playing audio
    if (playingAudioId === audioId) {
      if (audioElement.paused) {
        audioElement.play().catch(err => console.error("Error playing audio:", err));
      } else {
        audioElement.pause();
      }
    } else {
      // If another audio is playing, pause it first
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
        
        // Clear the progress interval for the previous audio
        if (progressIntervals.current[playingAudioId]) {
          clearInterval(progressIntervals.current[playingAudioId]);
        }
      }
      
      // Play the new audio
      setPlayingAudioId(audioId);
      audioElement.currentTime = 0;
      audioElement.play().catch(err => console.error("Error playing audio:", err));
      
      // Setup progress tracking
      progressIntervals.current[audioId] = setInterval(() => {
        setAudioProgress(prev => ({
          ...prev,
          [audioId]: (audioElement.currentTime / audioElement.duration) * 100
        }));
        
        // Stop interval if audio ended
        if (audioElement.ended) {
          clearInterval(progressIntervals.current[audioId]);
          setPlayingAudioId(null);
        }
      }, 100);
      
      // Setup ended event
      audioElement.onended = () => {
        setPlayingAudioId(null);
        if (progressIntervals.current[audioId]) {
          clearInterval(progressIntervals.current[audioId]);
        }
      };
    }
  };
  
  // Transcribe audio to text (mock for demo)
  const transcribeAudio = (audioId) => {
    // In a real app, this would call a speech-to-text API
    // Here we'll just simulate it
    
    showNotification('Transcribing voice message...', 'info');
    
    // Simulate API delay
    setTimeout(() => {
      const mockTranscriptions = [
        "Hey everyone, just checking in!",
        "I wanted to discuss the project timeline.",
        "Let's schedule a meeting for tomorrow.",
        "Great work on the latest feature!",
        "I have some feedback on the new design."
      ];
      
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      // Update message with transcription
      setRoomMessages(prev => 
        prev.map(msg => 
          msg.id === audioId
            ? { ...msg, audio: { ...msg.audio, transcription: randomTranscription } }
            : msg
        )
      );
      
      showNotification('Transcription complete', 'success');
    }, 2000);
  };
  
  // Audio message visualization animation variants
  const audioWaveVariants = {
    playing: {
      scale: [1, 1.2, 1, 0.8, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5
      }
    },
    paused: {
      scale: 1
    }
  };
  
  // Render audio recording UI
  const renderAudioRecording = () => {
    if (!isRecording && !audioBlob) return null;
    
    if (isRecording) {
      return (
        <div className="flex items-center space-x-3 p-2 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded-md border border-red-200 dark:border-red-800">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">
              <FaMicrophone />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Recording...</div>
              <div className="text-sm text-red-600 dark:text-red-400">{formatTime(recordingTime)}</div>
            </div>
            <div className="h-2 mt-1">
              <div className="voice-wave flex items-center space-x-1">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="voice-wave-bar bg-red-400 dark:bg-red-500" 
                    style={{ 
                      height: `${Math.max(3, Math.min(16, Math.random() * 16))}px`,
                      width: '2px',
                      animationDelay: `${i * 0.05}s`
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex space-x-2">
            <button
              onClick={cancelRecording}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Cancel"
            >
              <FiTrash2 size={18} />
            </button>
            <button
              onClick={stopRecording}
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
              title="Stop recording"
            >
              <FaStop size={18} />
            </button>
          </div>
        </div>
      );
    }
    
    // Show audio preview with send option
    if (audioBlob && audioMessages.preview) {
      return (
        <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleAudioPlayback('preview')}
              className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600"
            >
              {playingAudioId === 'preview' ? <FaPause /> : <FaPlay />}
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Voice message preview</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {formatTime(playingAudioId === 'preview' 
                  ? (audioProgress.preview / 100) * audioMessages.preview.duration 
                  : audioMessages.preview.duration)}
              </div>
            </div>
            <div className="h-2 mt-1 bg-blue-100 dark:bg-blue-800 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${audioProgress.preview || 0}%` }}
              />
            </div>
            <audio 
              ref={el => audioRefs.current.preview = el} 
              src={audioMessages.preview.url} 
              preload="metadata"
              className="hidden"
            />
          </div>
          <div className="flex-shrink-0 flex space-x-2">
            <button
              onClick={() => {
                setAudioBlob(null);
                setAudioMessages(prev => {
                  const newState = { ...prev };
                  delete newState.preview;
                  return newState;
                });
              }}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              title="Discard"
            >
              <FiTrash2 size={18} />
            </button>
            <button
              onClick={sendVoiceMessage}
              className="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600"
              title="Send voice message"
            >
              <FaPaperPlane size={18} />
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Render audio message in chat
  const renderAudioMessage = (message) => {
    if (message.type !== 'audio' || !message.audio) return null;
    
    const isPlaying = playingAudioId === message.id;
    const progress = audioProgress[message.id] || 0;
    const transcription = message.audio.transcription;
    
    return (
      <div className="mt-1 max-w-xs">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          <button
            onClick={() => toggleAudioPlayback(message.id)}
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 flex-shrink-0"
          >
            {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(isPlaying 
                  ? (progress / 100) * message.audio.duration 
                  : message.audio.duration)}
              </span>
              
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex space-x-1">
                {!transcription && (
                  <button
                    onClick={() => transcribeAudio(message.id)}
                    className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Transcribe"
                  >
                    <FiEdit size={14} />
                  </button>
                )}
                <button
                  onClick={() => {
                    // Download functionality
                    const a = document.createElement('a');
                    a.href = message.audio.url;
                    a.download = `voice-message-${new Date(message.timestamp).toISOString().replace(/:/g, '-')}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  title="Download"
                >
                  <FiDownload size={14} />
                </button>
              </div>
            </div>
            
            <audio 
              ref={el => audioRefs.current[message.id] = el} 
              src={message.audio.url} 
              preload="metadata"
              className="hidden"
            />
          </div>
        </div>
        
        {transcription && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 p-1.5 rounded border border-gray-200 dark:border-gray-700">
            <FiVolumeX size={12} className="inline mr-1" />
            {transcription}
          </div>
        )}
      </div>
    );
  };

  // Update CSS for voice wave animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes voiceWave {
        0% { height: 3px; }
        50% { height: 12px; }
        100% { height: 3px; }
      }
      
      .voice-wave-bar {
        animation: voiceWave 1s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Add voice recording quality settings
  const renderVoiceSettings = () => (
    <div className="mt-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voice Recording Quality</h4>
      <div className="flex space-x-2">
        <button
          onClick={() => setRecordingQuality('low')}
          className={`px-3 py-1 text-xs rounded ${
            recordingQuality === 'low'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Low (Small Size)
        </button>
        <button
          onClick={() => setRecordingQuality('standard')}
          className={`px-3 py-1 text-xs rounded ${
            recordingQuality === 'standard'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => setRecordingQuality('high')}
          className={`px-3 py-1 text-xs rounded ${
            recordingQuality === 'high'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          High (Better Quality)
        </button>
      </div>
    </div>
  );
  
  // Cleanup audio resources when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all intervals
      Object.values(progressIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
      
      // Clean up all audio elements
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
      
      // Clean up any blob URLs
      Object.values(audioMessages).forEach(msg => {
        if (msg.url) {
          URL.revokeObjectURL(msg.url);
        }
      });
    };
  }, [audioMessages]);
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      type: file.type,
      size: file.size,
      uploading: false,
      progress: 0
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  const uploadAttachment = async (attachment) => {
    // In a real app, you'd upload to a server
    // This is a simulation of file upload
    setAttachments(prev => prev.map(a => 
      a.id === attachment.id ? {...a, uploading: true} : a
    ));

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[attachment.id] || 0) + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return {...prev, [attachment.id]: newProgress};
      });
    }, 300);

    // For demo purposes, wait for "upload" to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create a message with the attachment
    const msgData = {
      room,
      author: username,
      message: "",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      attachment: {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        url: attachment.preview || "#", // In a real app, this would be the server URL
        isImage: attachment.type.startsWith('image/')
      }
    };
    
    // Send to the server
    socket.emit("send_message", msgData);
    
    // Remove from attachments list after sending
    setAttachments(prev => prev.filter(a => a.id !== attachment.id));
    setUploadProgress(prev => {
      const { [attachment.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const renderAttachmentPreviews = () => {
    if (attachments.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
        {attachments.map(attachment => (
          <div key={attachment.id} className="relative group">
            {attachment.type.startsWith('image/') ? (
              <div className="relative w-24 h-24 rounded overflow-hidden">
                <img 
                  src={attachment.preview} 
                  alt={attachment.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => uploadAttachment(attachment)}
                    className="p-1 bg-green-500 rounded-full text-white mx-1"
                  >
                    <FiDownload size={14} />
                  </button>
                  <button 
                    onClick={() => removeAttachment(attachment.id)}
                    className="p-1 bg-red-500 rounded-full text-white mx-1"
                  >
                    <FiX size={14} />
                  </button>
                </div>
                {uploadProgress[attachment.id] > 0 && uploadProgress[attachment.id] < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${uploadProgress[attachment.id]}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded flex flex-col items-center justify-center p-2">
                <FiFile size={20} className="text-gray-500 mb-1" />
                <div className="text-xs text-center truncate w-full">
                  {attachment.name}
                </div>
                <button 
                  onClick={() => uploadAttachment(attachment)}
                  className="absolute top-1 right-1 p-1 bg-green-500 rounded-full text-white"
                  style={{ fontSize: '8px' }}
                >
                  <FiDownload size={10} />
                </button>
                <button 
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute top-1 left-1 p-1 bg-red-500 rounded-full text-white"
                  style={{ fontSize: '8px' }}
                >
                  <FiX size={10} />
                </button>
                {uploadProgress[attachment.id] > 0 && uploadProgress[attachment.id] < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${uploadProgress[attachment.id]}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAttachmentInMessage = (message) => {
    if (!message.attachment) return null;
    
    return (
      <div className="mt-2 max-w-xs">
        {message.attachment.isImage ? (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={message.attachment.url} 
              alt={message.attachment.name}
              className="max-w-full max-h-60 object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <FiFile className="mr-2 text-blue-500" />
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm">{message.attachment.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(message.attachment.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <a 
              href={message.attachment.url}
              download={message.attachment.name}
              className="p-1 bg-blue-500 rounded text-white ml-2"
            >
              <FiDownload size={16} />
            </a>
          </div>
        )}
      </div>
    );
  };

  // Handle notification permission
  useEffect(() => {
    if (notificationSettings.desktopEnabled && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        setHasPermission(permission === 'granted');
      });
    } else if (Notification.permission === 'granted') {
      setHasPermission(true);
    }
  }, [notificationSettings.desktopEnabled]);
  
  // Handle notifications for new messages
  useEffect(() => {
    if (!roomMessages.length || !room) return;
    
    // Get last message
    const lastMsg = roomMessages[roomMessages.length - 1];
    
    // Skip if it's the user's own message
    if (lastMsg.sender === username) return;
    
    // If tab is not focused, increment unread count
    if (!document.hasFocus()) {
      setUnreadCount(prev => prev + 1);
      
      // Play sound if enabled
      if (notificationSettings.soundEnabled) {
        notificationAudio.play().catch(err => console.error('Error playing notification:', err));
      }
      
      // Show desktop notification if enabled
      if (notificationSettings.desktopEnabled && hasPermission) {
        // Skip if mentions only is enabled and the message doesn't mention the user
        if (notificationSettings.mentionsOnly && 
            !lastMsg.text.includes(`@${username}`)) {
          return;
        }
        
        const notification = new Notification(`${lastMsg.sender} in ${room.name}`, {
          body: lastMsg.text.substring(0, 60) + (lastMsg.text.length > 60 ? '...' : ''),
          icon: '/logo.png'
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    }
  }, [roomMessages, room, username, notificationSettings, hasPermission, notificationAudio]);
  
  // Reset unread count when tab gets focus
  useEffect(() => {
    const handleFocus = () => setUnreadCount(0);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  // Update document title with unread count
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Chat App`;
    } else {
      document.title = 'Chat App';
    }
  }, [unreadCount]);
  
  const renderNotificationControls = () => (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-2">
      <h3 className="text-sm font-medium mb-1">Notification Settings</h3>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setNotificationSettings(prev => ({
            ...prev, 
            soundEnabled: !prev.soundEnabled
          }))}
          className="flex items-center text-sm px-2 py-1 rounded bg-white dark:bg-gray-700 shadow-sm"
        >
          {notificationSettings.soundEnabled ? (
            <><FiVolume className="mr-1" /> Sound On</>
          ) : (
            <><FiVolumeX className="mr-1" /> Sound Off</>
          )}
        </button>
        
        <button 
          onClick={() => setNotificationSettings(prev => ({
            ...prev, 
            desktopEnabled: !prev.desktopEnabled
          }))}
          className="flex items-center text-sm px-2 py-1 rounded bg-white dark:bg-gray-700 shadow-sm"
        >
          {notificationSettings.desktopEnabled ? (
            <><FiBell className="mr-1" /> Desktop On</>
          ) : (
            <><FiBellOff className="mr-1" /> Desktop Off</>
          )}
        </button>
        
        {notificationSettings.desktopEnabled && (
          <button 
            onClick={() => setNotificationSettings(prev => ({
              ...prev, 
              mentionsOnly: !prev.mentionsOnly
            }))}
            className={`flex items-center text-sm px-2 py-1 rounded bg-white dark:bg-gray-700 shadow-sm ${
              notificationSettings.mentionsOnly ? 'text-blue-600 dark:text-blue-400' : ''
            }`}
          >
            @Mentions Only
          </button>
        )}
      </div>
    </div>
  );

  // Apply theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Track user activity for idle status
  useEffect(() => {
    const resetIdleTimer = () => {
      if (isIdle) {
        // User is back from being idle
        setIsIdle(false);
        
        // Update user status if it was previously set to away due to idle
        if (userStatus === 'away' && !customStatusMessage.includes('(Auto: Away)')) {
          setUserStatus('online');
          
          // Notify others that user is back online
          socket && socket.emit('updateUserStatus', {
            username,
            status: 'online',
            customStatus: customStatusMessage
          });
        }
      }
      
      // Clear existing timeout
      if (idleTimeout) clearTimeout(idleTimeout);
      
      // Set new idle timeout
      const timeout = setTimeout(() => {
        setIsIdle(true);
        
        // Only change status to away if currently online
        if (userStatus === 'online') {
          setUserStatus('away');
          
          // Notify others that user is away
          socket && socket.emit('updateUserStatus', {
            username,
            status: 'away',
            customStatus: customStatusMessage + ' (Auto: Away)'
          });
        }
      }, IDLE_TIME);
      
      setIdleTimeout(timeout);
    };
    
    // Add event listeners to detect user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetIdleTimer));
    
    // Initial setup
    resetIdleTimer();
    
    // Cleanup
    return () => {
      events.forEach(event => document.removeEventListener(event, resetIdleTimer));
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [idleTimeout, isIdle, userStatus, customStatusMessage, username, socket]);
  
  // Handle manual status changes
  const updateUserStatus = (status, customMessage = customStatusMessage) => {
    setUserStatus(status);
    setCustomStatusMessage(customMessage);
    
    // Update last seen timestamp if going offline
    if (status === 'offline') {
      // Find current user and update
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.username === username) {
            return {
              ...user,
              status: 'offline',
              lastSeen: new Date(),
              customStatus: customMessage
            };
          }
          return user;
        });
      });
    }
    
    // Notify other users about status change
    socket && socket.emit('updateUserStatus', {
      username,
      status,
      customStatus: customMessage
    });
    
    setShowStatusModal(false);
  };
  
  // Format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const diff = now - new Date(timestamp);
    
    // Less than a minute
    if (diff < 60000) {
      return 'just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Format date for older messages
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Render status modal
  const renderStatusModal = () => {
    if (!showStatusModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-80">
          <h3 className="text-lg font-medium mb-3">Update Your Status</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex space-x-2">
              <button
                onClick={() => updateUserStatus('online')}
                className={`px-3 py-1 rounded ${userStatus === 'online' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                Online
              </button>
              <button
                onClick={() => updateUserStatus('away')}
                className={`px-3 py-1 rounded ${userStatus === 'away' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                Away
              </button>
              <button
                onClick={() => updateUserStatus('busy')}
                className={`px-3 py-1 rounded ${userStatus === 'busy' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                Busy
              </button>
              <button
                onClick={() => updateUserStatus('offline')}
                className={`px-3 py-1 rounded ${userStatus === 'offline' ? 'bg-gray-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                Offline
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Custom Status Message</label>
            <input
              type="text"
              value={customStatusMessage}
              onChange={(e) => setCustomStatusMessage(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={50}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              {50 - customStatusMessage.length} characters remaining
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowStatusModal(false)}
              className="px-4 py-2 text-sm border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => updateUserStatus(userStatus, customStatusMessage)}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Enhanced user list with status information
  const renderEnhancedUsersList = () => {
    if (!showUsersList) return null;
    
    return (
      <div className="w-64 md:w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold">Users</h2>
          <div className="flex items-center">
            {/* Current user status indicator */}
            <div
              className="flex items-center mr-2 cursor-pointer"
              onClick={() => setShowStatusModal(true)}
            >
              <div className={`w-3 h-3 rounded-full mr-1 ${getStatusColor(userStatus)}`}></div>
              <span className="text-sm">{userStatus}</span>
            </div>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setShowUsersList(false)}
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <li key={user.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(user.status)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username}</span>
                      {user.isIdle && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 italic">idle</span>
                      )}
                      {typingUsers[user.id] && (
                        <span className="ml-2 text-xs text-blue-500 italic">typing...</span>
                      )}
                    </div>
                    {user.customStatus && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.customStatus}</p>
                    )}
                    {user.status === 'offline' && user.lastSeen && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Last seen: {formatLastSeen(user.lastSeen)}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {renderNotificationControls()}
      </div>
    );
  };

  // Handle starting a thread from a message
  const startThread = (messageId) => {
    setActiveThread(messageId);
    
    // Initialize thread replies if not already present
    if (!threadReplies[messageId]) {
      setThreadReplies(prev => ({ ...prev, [messageId]: [] }));
    }
    
    setShowThreads(true);
    
    // Scroll to the thread panel when it's opened
    setTimeout(() => {
      threadListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Handle sending a message in a thread
  const sendThreadReply = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !activeThread) return;
    
    // Find parent message
    const parentMessage = roomMessages.find(msg => msg.id === activeThread);
    if (!parentMessage) return;
    
    // Create new reply
    const newReply = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      userId: 1, // Current user
      username: 'You',
      parentId: activeThread
    };
    
    // Add reply to thread
    setThreadReplies(prev => ({
      ...prev,
      [activeThread]: [...(prev[activeThread] || []), newReply]
    }));
    
    // Track message's parent for thread lookup
    setThreadParentLookup(prev => ({
      ...prev,
      [newReply.id]: activeThread
    }));
    
    // Clear input
    setMessage('');
    
    // If this is a simulated environment, update unread reply count for others
    setRoomMessages(prev => 
      prev.map(msg => 
        msg.id === activeThread
          ? { ...msg, replyCount: (msg.replyCount || 0) + 1, hasUnreadReplies: true }
          : msg
      )
    );
    
    // Notify about thread reply (in a real app)
    // socket.emit('threadReply', { room, parentId: activeThread, reply: newReply });
  };
  
  // Close thread panel
  const closeThreadPanel = () => {
    setShowThreads(false);
    setActiveThread(null);
  };
  
  // Get thread count for a message
  const getThreadCount = (messageId) => {
    return (threadReplies[messageId] || []).length;
  };
  
  // Mark thread as read
  const markThreadAsRead = (messageId) => {
    setRoomMessages(prev => 
      prev.map(msg => 
        msg.id === messageId
          ? { ...msg, hasUnreadReplies: false }
          : msg
      )
    );
  };
  
  // Find Thread Parent Message
  const findThreadParentMessage = (messageId) => {
    return roomMessages.find(msg => msg.id === messageId);
  };
  
  // Get All Thread Messages
  const getThreadMessages = (messageId) => {
    return threadReplies[messageId] || [];
  };
  
  // Render thread button on a message
  const renderThreadButton = (message) => {
    const replyCount = getThreadCount(message.id);
    
    return (
      <button
        className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 mt-1"
        onClick={() => startThread(message.id)}
      >
        <FiMessageSquare className="mr-1" size={12} />
        {replyCount > 0 ? (
          <span className="flex items-center">
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            {message.hasUnreadReplies && <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
          </span>
        ) : (
          <span>Reply in thread</span>
        )}
      </button>
    );
  };
  
  // Render the thread panel
  const renderThreadPanel = () => {
    if (!showThreads || !activeThread) return null;
    
    const parentMessage = findThreadParentMessage(activeThread);
    if (!parentMessage) return null;
    
    const threadMessages = getThreadMessages(activeThread);
    
    return (
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col" ref={threadListRef}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold">Thread</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={closeThreadPanel}
          >
            <FiX size={18} />
          </button>
        </div>
        
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{parentMessage.username}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(parentMessage.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-700 p-2 rounded mt-1 shadow-sm">
              {formatMessageText(parentMessage.text)}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {threadMessages.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No replies yet. Start the conversation!
            </div>
          ) : (
            threadMessages.map((reply, index) => (
              <div key={reply.id} className="mb-3">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{reply.username}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(reply.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-700 p-2 rounded mt-1 shadow-sm">
                  {formatMessageText(reply.text)}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={sendThreadReply} className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Reply to thread..."
              className="flex-1 p-2 border rounded-l dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className={`bg-blue-500 text-white px-4 rounded-r ${!message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              Reply
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  // Initialize some sample thread replies for demo purposes
  useEffect(() => {
    if (Object.keys(threadReplies).length === 0 && roomMessages.length > 0) {
      // Add sample replies to the first message
      const firstMsgId = roomMessages[0]?.id;
      if (firstMsgId) {
        setThreadReplies({
          [firstMsgId]: [
            {
              id: Date.now() - 5000,
              text: "That's a great point! I completely agree.",
              timestamp: new Date(Date.now() - 5000).toISOString(),
              userId: 2,
              username: 'Bob', 
              parentId: firstMsgId
            },
            {
              id: Date.now() - 3000,
              text: "I have some additional thoughts on this topic that might be helpful.",
              timestamp: new Date(Date.now() - 3000).toISOString(),
              userId: 3,
              username: 'Charlie', 
              parentId: firstMsgId
            }
          ]
        });
        
        // Set thread parent lookup
        setThreadParentLookup({
          [Date.now() - 5000]: firstMsgId,
          [Date.now() - 3000]: firstMsgId
        });
        
        // Update message to show it has replies
        setRoomMessages(prev => 
          prev.map(msg => 
            msg.id === firstMsgId
              ? { ...msg, replyCount: 2, hasUnreadReplies: true }
              : msg
          )
        );
      }
    }
  }, [roomMessages]);
  
  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs/textareas unless it's special combinations
      if (
        (e.target.tagName === 'INPUT' || 
         e.target.tagName === 'TEXTAREA') && 
        !(e.ctrlKey || e.metaKey || e.altKey)
      ) {
        return;
      }
      
      // Handle key sequences (like Vim/Emacs style)
      const now = Date.now();
      if (now - lastKeyPressTime < 1000) { // 1 second timeout for sequences
        setKeySequence(prev => [...prev, e.key]);
      } else {
        setKeySequence([e.key]);
      }
      setLastKeyPressTime(now);
      
      // Check for key sequences
      const updatedSequence = [...keySequence, e.key];
      if (updatedSequence.join('') === 'gg') {
        // "gg" = scroll to top
        messagesContainerRef.current.scrollTop = 0;
        e.preventDefault();
        setKeySequence([]);
        showCommandFeedback('Scrolled to top');
        return;
      } else if (updatedSequence.join('') === 'G') {
        // "G" = scroll to bottom
        scrollToBottom('smooth');
        e.preventDefault();
        setKeySequence([]);
        showCommandFeedback('Scrolled to bottom');
        return;
      }
      
      // Main shortcuts with modifiers
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '/':
            // Focus search
            setShowSearch(true);
            setTimeout(() => {
              document.querySelector('input[placeholder="Search messages..."]')?.focus();
            }, 0);
            e.preventDefault();
            showCommandFeedback('Search activated');
            break;
            
          case 'k':
            // Show keyboard shortcuts
            setShowShortcutsModal(true);
            e.preventDefault();
            break;
            
          case '.':
            // Focus message input
            messageInputRef.current?.focus();
            e.preventDefault();
            showCommandFeedback('Message input focused');
            break;
            
          case 'b':
            // Bold text
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
              applyFormatting('bold');
              e.preventDefault();
              showCommandFeedback('Bold formatting applied');
            }
            break;
            
          case 'i':
            // Italic text
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
              applyFormatting('italic');
              e.preventDefault();
              showCommandFeedback('Italic formatting applied');
            }
            break;
            
          default:
            break;
        }
      } else {
        // Shortcuts without modifiers
        switch (e.key) {
          case 'Escape':
            // Close modals
            if (showShortcutsModal) {
              setShowShortcutsModal(false);
            } else if (showSearch) {
              setShowSearch(false);
            } else if (showEmojiPicker) {
              setShowEmojiPicker(false);
            } else if (showThemeSettings) {
              setShowThemeSettings(false);
            } else if (showUsersList) {
              setShowUsersList(false);
            } else if (showThreads) {
              closeThreadPanel();
            }
            break;
            
          case 'j':
            // Navigate down (if not typing)
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              messagesContainerRef.current.scrollTop += 100;
              e.preventDefault();
            }
            break;
            
          case 'k':
            // Navigate up (if not typing)
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              messagesContainerRef.current.scrollTop -= 100;
              e.preventDefault();
            }
            break;
            
          case 'u':
            // Toggle users panel (if not typing)
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              setShowUsersList(prev => !prev);
              e.preventDefault();
              showCommandFeedback(showUsersList ? 'Users panel closed' : 'Users panel opened');
            }
            break;
            
          case 't':
            // Toggle theme (if not typing)
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              toggleTheme();
              e.preventDefault();
              showCommandFeedback(isDarkMode ? 'Light theme activated' : 'Dark theme activated');
            }
            break;
            
          case 's':
            // Toggle status (if not typing)
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
              setShowStatusModal(prev => !prev);
              e.preventDefault();
              showCommandFeedback('Status modal toggled');
            }
            break;
            
          case 'n':
            // Next search result
            if (searchResults.length > 0) {
              navigateResults('next');
              e.preventDefault();
              showCommandFeedback('Next search result');
            }
            break;
            
          case 'N':
            // Previous search result
            if (searchResults.length > 0) {
              navigateResults('prev');
              e.preventDefault();
              showCommandFeedback('Previous search result');
            }
            break;
            
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showShortcutsModal,
    showSearch,
    showEmojiPicker,
    showThemeSettings,
    showUsersList,
    showThreads,
    searchResults,
    isDarkMode,
    lastKeyPressTime,
    keySequence,
    applyFormatting,
    toggleTheme,
    navigateResults
  ]);
  
  // Show temporary command feedback
  const showCommandFeedback = (message) => {
    showNotification(message, 'command');
  };

  // Render keyboard shortcuts modal
  const renderShortcutsModal = () => {
    if (!showShortcutsModal) return null;
    
    const shortcutsList = [
      { key: 'Ctrl + /', description: 'Focus search' },
      { key: 'Ctrl + K', description: 'Show keyboard shortcuts' },
      { key: 'Ctrl + .', description: 'Focus message input' },
      { key: 'Ctrl + B', description: 'Bold text (when typing)' },
      { key: 'Ctrl + I', description: 'Italic text (when typing)' },
      { key: 'ESC', description: 'Close panels/modals' },
      { key: 'J', description: 'Scroll down (when not typing)' },
      { key: 'K', description: 'Scroll up (when not typing)' },
      { key: 'U', description: 'Toggle users panel' },
      { key: 'T', description: 'Toggle dark/light theme' },
      { key: 'S', description: 'Toggle status modal' },
      { key: 'N', description: 'Next search result' },
      { key: 'Shift + N', description: 'Previous search result' },
      { key: 'GG', description: 'Scroll to top of chat' },
      { key: 'G', description: 'Scroll to bottom of chat' }
    ];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcutsList.map((shortcut, index) => (
              <div key={index} className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
                <kbd className="px-2 py-1 mr-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm">
                  {shortcut.key}
                </kbd>
                <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded">
            <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Pro Tips</h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-5">
              <li>Most shortcuts won't trigger when you're typing in an input field</li>
              <li>Use keyboard navigation to quickly jump between messages and search results</li>
              <li>Type "gg" quickly to jump to the top of chat history (like in Vim)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  // Open image in lightbox
  const openLightbox = (imageUrl, altText = '') => {
    setLightboxImage({
      url: imageUrl,
      alt: altText
    });
    setImageScale(1);
    setImageRotation(0);
    setImageDragPosition({ x: 0, y: 0 });
    
    // Disable body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };
  
  // Close lightbox
  const closeLightbox = () => {
    setLightboxImage(null);
    setImageScale(1);
    setImageRotation(0);
    
    // Re-enable body scroll
    document.body.style.overflow = 'auto';
  };
  
  // Zoom in/out image
  const zoomImage = (zoomIn) => {
    setImageScale(prevScale => {
      const newScale = zoomIn 
        ? Math.min(prevScale + 0.5, 5) // Max zoom 5x
        : Math.max(prevScale - 0.5, 0.5); // Min zoom 0.5x
      return newScale;
    });
  };
  
  // Rotate image
  const rotateImage = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };
  
  // Reset image transformations
  const resetImage = () => {
    setImageScale(1);
    setImageRotation(0);
    setImageDragPosition({ x: 0, y: 0 });
  };
  
  // Handle lightbox key controls
  useEffect(() => {
    if (!lightboxImage) return;
    
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case '+':
          zoomImage(true);
          break;
        case '-':
          zoomImage(false);
          break;
        case 'r':
          rotateImage();
          break;
        case '0':
          resetImage();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);
  
  // Handle mouse wheel zoom on image
  const handleMouseWheel = useCallback((e) => {
    if (lightboxImage) {
      e.preventDefault();
      zoomImage(e.deltaY < 0);
    }
  }, [lightboxImage]);
  
  useEffect(() => {
    const lightboxElement = lightboxRef.current;
    if (lightboxElement) {
      lightboxElement.addEventListener('wheel', handleMouseWheel, { passive: false });
      return () => lightboxElement.removeEventListener('wheel', handleMouseWheel);
    }
  }, [handleMouseWheel, lightboxImage]);

  // Render lightbox
  const renderLightbox = () => {
    if (!lightboxImage) return null;
    
    return (
      <motion.div 
        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={lightboxRef}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-white p-2 hover:bg-gray-800 rounded-full z-10"
          onClick={closeLightbox}
        >
          <FiX size={24} />
        </button>
        
        {/* Lightbox controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
          <button 
            className="p-3 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700"
            onClick={() => zoomImage(true)}
            title="Zoom In (+)"
          >
            <FiZoomIn size={20} />
          </button>
          <button 
            className="p-3 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700"
            onClick={() => zoomImage(false)}
            title="Zoom Out (-)"
          >
            <FiZoomOut size={20} />
          </button>
          <button 
            className="p-3 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700"
            onClick={rotateImage}
            title="Rotate (R)"
          >
            <FiRotateCw size={20} />
          </button>
          <button 
            className="p-3 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-gray-700"
            onClick={resetImage}
            title="Reset (0)"
          >
            <FiMaximize size={20} />
          </button>
        </div>
        
        {/* Image container */}
        <motion.div
          drag
          dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
          onDragEnd={(e, info) => {
            setImageDragPosition({
              x: imageDragPosition.x + info.offset.x,
              y: imageDragPosition.y + info.offset.y
            });
          }}
          style={{
            cursor: 'grab',
            rotateZ: imageRotation,
            scale: imageScale,
            x: imageDragPosition.x,
            y: imageDragPosition.y
          }}
          className="relative max-w-[90vw] max-h-[80vh]"
        >
          <img 
            src={lightboxImage.url} 
            alt={lightboxImage.alt}
            className="pointer-events-none max-w-full max-h-[80vh] object-contain"
            onDoubleClick={() => zoomImage(imageScale < 2)}
          />
        </motion.div>
      </motion.div>
    );
  };
  
  // Enhanced image display in message
  const renderEnhancedAttachmentInMessage = (message) => {
    if (!message.attachment) return null;
    
    return (
      <div className="mt-2 max-w-xs">
        {message.attachment.isImage ? (
          <div className="rounded-lg overflow-hidden cursor-pointer group relative">
            <div 
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => openLightbox(message.attachment.url, message.attachment.name)}
            >
              <FiMaximize className="text-white text-lg" />
            </div>
            <img 
              src={message.attachment.url} 
              alt={message.attachment.name}
              className="max-w-full max-h-60 object-contain"
              onClick={() => openLightbox(message.attachment.url, message.attachment.name)}
            />
          </div>
        ) : (
          <div className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <FiFile className="mr-2 text-blue-500" />
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm">{message.attachment.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(message.attachment.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <a 
              href={message.attachment.url}
              download={message.attachment.name}
              className="p-1 bg-blue-500 rounded text-white ml-2"
            >
              <FiDownload size={16} />
            </a>
          </div>
        )}
      </div>
    );
  };
  
  // Enhanced attachment previews 
  const renderEnhancedAttachmentPreviews = () => {
    if (attachments.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
        {attachments.map(attachment => (
          <div key={attachment.id} className="relative group">
            {attachment.type.startsWith('image/') ? (
              <div className="relative w-24 h-24 rounded overflow-hidden">
                <img 
                  src={attachment.preview} 
                  alt={attachment.name} 
                  className="w-full h-full object-cover"
                  onClick={() => openLightbox(attachment.preview, attachment.name)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => openLightbox(attachment.preview, attachment.name)} 
                      className="p-1 bg-gray-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiMaximize size={14} />
                    </button>
                    <button 
                      onClick={() => uploadAttachment(attachment)}
                      className="p-1 bg-green-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiDownload size={14} />
                    </button>
                    <button 
                      onClick={() => removeAttachment(attachment.id)}
                      className="p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                </div>
                {uploadProgress[attachment.id] > 0 && uploadProgress[attachment.id] < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${uploadProgress[attachment.id]}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded flex flex-col items-center justify-center p-2">
                <FiFile size={20} className="text-gray-500 mb-1" />
                <div className="text-xs text-center truncate w-full">
                  {attachment.name}
                </div>
                <button 
                  onClick={() => uploadAttachment(attachment)}
                  className="absolute top-1 right-1 p-1 bg-green-500 rounded-full text-white"
                  style={{ fontSize: '8px' }}
                >
                  <FiDownload size={10} />
                </button>
                <button 
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute top-1 left-1 p-1 bg-red-500 rounded-full text-white"
                  style={{ fontSize: '8px' }}
                >
                  <FiX size={10} />
                </button>
                {uploadProgress[attachment.id] > 0 && uploadProgress[attachment.id] < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${uploadProgress[attachment.id]}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Handle scheduled message sending
  const scheduleMessage = () => {
    if (!message.trim()) {
      showNotification('Please enter a message to schedule', 'warning');
      return;
    }
    
    const now = new Date();
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    // Validate scheduled time is in the future
    if (scheduledDateTime <= now) {
      showNotification('Scheduled time must be in the future', 'error');
      return;
    }
    
    const newScheduledMessage = {
      id: Date.now(),
      text: message,
      scheduledFor: scheduledDateTime.toISOString(),
      timestamp: now.toISOString(),
      userId: 1, // Current user
      username: 'You',
      attachments: [...attachments]
    };
    
    setScheduledMessages([...scheduledMessages, newScheduledMessage]);
    
    // Clear inputs
    setMessage('');
    setAttachments([]);
    setShowScheduleModal(false);
    
    showNotification(`Message scheduled for ${scheduledDateTime.toLocaleString()}`, 'success');
  };
  
  // Initialize scheduled date and time fields
  useEffect(() => {
    if (showScheduleModal) {
      const now = new Date();
      // Set default time 5 minutes from now
      const futureTime = new Date(now.getTime() + 5 * 60000);
      
      // Format date as YYYY-MM-DD for date input
      const formattedDate = futureTime.toISOString().split('T')[0];
      setScheduledDate(formattedDate);
      
      // Format time as HH:MM for time input
      const hours = String(futureTime.getHours()).padStart(2, '0');
      const minutes = String(futureTime.getMinutes()).padStart(2, '0');
      setScheduledTime(`${hours}:${minutes}`);
    }
  }, [showScheduleModal]);
  
  // Check for scheduled messages that need to be sent
  useEffect(() => {
    if (scheduledMessages.length === 0) return;
    
    const checkScheduledInterval = setInterval(() => {
      const now = new Date();
      const messagesToSend = [];
      const remainingMessages = [];
      
      scheduledMessages.forEach(msg => {
        const scheduledTime = new Date(msg.scheduledFor);
        if (scheduledTime <= now) {
          messagesToSend.push(msg);
        } else {
          remainingMessages.push(msg);
        }
      });
      
      // Send messages whose time has come
      if (messagesToSend.length > 0) {
        messagesToSend.forEach(msg => {
          // Create sent message object
          const sentMessage = {
            id: Date.now() + Math.random(),
            text: msg.text,
            timestamp: new Date().toISOString(),
            userId: msg.userId,
            username: msg.username,
            attachments: msg.attachments || []
          };
          
          // Add to room messages
          setRoomMessages(prev => [...prev, sentMessage]);
          
          // Notify that scheduled message was sent
          showNotification('Scheduled message sent', 'success');
          
          // In a real app, would send via socket
          // socket.emit('chatMessage', sentMessage);
        });
        
        // Update scheduled messages list
        setScheduledMessages(remainingMessages);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkScheduledInterval);
  }, [scheduledMessages]);
  
  // Render scheduled messages modal
  const renderScheduleMessageModal = () => {
    if (!showScheduleModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Schedule Message</h2>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your message will be sent at the specified time:</p>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded mb-4 text-gray-800 dark:text-gray-200">
              {message || '<No message entered>'}
              {attachments.length > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  + {attachments.length} attachment(s)
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="block w-full pl-10 pr-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="text-gray-400" />
                </div>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="block w-full pl-10 pr-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 text-sm border rounded"
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
              onClick={scheduleMessage}
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render scheduled messages list
  const renderScheduledMessagesList = () => {
    if (!showScheduledMessages) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Scheduled Messages</h2>
            <button
              onClick={() => setShowScheduledMessages(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {scheduledMessages.length === 0 ? (
            <p className="text-center py-6 text-gray-500 dark:text-gray-400">
              You don't have any scheduled messages
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {scheduledMessages.map(msg => {
                const scheduledTime = new Date(msg.scheduledFor);
                const timeRemaining = scheduledTime - new Date();
                const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                
                return (
                  <li key={msg.id} className="py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">
                        Scheduled for: {scheduledTime.toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          setScheduledMessages(prev => prev.filter(m => m.id !== msg.id));
                          showNotification('Scheduled message canceled', 'info');
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">{msg.text}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        + {msg.attachments.length} attachment(s)
                      </div>
                    )}
                    <div className="text-xs text-green-500 mt-1">
                      Sending in {hoursRemaining > 0 ? `${hoursRemaining}h ` : ''}{minutesRemaining}m
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };
  
  // Mark messages as read when they become visible
  const messageObserver = useRef(null);
  
  useEffect(() => {
    // Initialize Intersection Observer to detect when messages are visible
    const options = {
      root: messagesContainerRef.current,
      rootMargin: '0px',
      threshold: 0.5, // Message is considered "read" when 50% visible
    };
    
    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          if (messageId) {
            markMessageAsRead(Number(messageId));
          }
        }
      });
    };
    
    messageObserver.current = new IntersectionObserver(handleIntersection, options);
    
    // Observe all message elements
    Object.values(messageRefs.current).forEach(element => {
      if (element) {
        messageObserver.current.observe(element);
      }
    });
    
    return () => {
      if (messageObserver.current) {
        messageObserver.current.disconnect();
      }
    };
  }, [roomMessages]);
  
  // Update observer when new messages are added
  useEffect(() => {
    if (messageObserver.current) {
      // Observe any new message elements
      Object.values(messageRefs.current).forEach(element => {
        if (element) {
          messageObserver.current.observe(element);
        }
      });
    }
  }, [roomMessages]);
  
  // Mark a message as read by the current user
  const markMessageAsRead = (messageId) => {
    // Skip if it's the current user's message
    const message = roomMessages.find(msg => msg.id === messageId);
    if (!message || message.userId === 1) return; // Assuming current user ID is 1
    
    // Update read receipts for this message
    setReadReceipts(prev => {
      // Only update if this user hasn't already read this message
      const currentReaders = prev[messageId] || [];
      if (currentReaders.some(reader => reader.userId === 1)) return prev;
      
      const updatedReaders = [
        ...currentReaders,
        {
          userId: 1,
          username: 'You',
          timestamp: new Date().toISOString()
        }
      ];
      
      // In a real application, you would emit this to the server
      // socket.emit('messageRead', { messageId, userId: 1, timestamp: new Date().toISOString() });
      
      return {
        ...prev,
        [messageId]: updatedReaders
      };
    });
  };
  
  // Toggle read receipts visibility
  const toggleReadReceipts = () => {
    setShowReadReceipts(prev => !prev);
    showNotification(showReadReceipts 
      ? 'Read receipts hidden' 
      : 'Read receipts visible',
      'info');
  };
  
  // Dummy function to simulate other users reading messages
  useEffect(() => {
    // Skip if there are no messages
    if (roomMessages.length === 0) return;
    
    // Simulate other users reading messages after random delays
    const simulateReads = setTimeout(() => {
      // Get the IDs of the latest messages (last 3)
      const latestMessageIds = roomMessages
        .slice(-3)
        .map(msg => msg.id)
        .filter(id => id);
      
      if (latestMessageIds.length === 0) return;
      
      // Add read receipts for random users
      setReadReceipts(prev => {
        const updated = { ...prev };
        
        latestMessageIds.forEach(messageId => {
          // Get existing readers or initialize empty array
          const currentReaders = prev[messageId] || [];
          
          // Add some random readers (users 2, 3, 4)
          const newReaders = [];
          
          // Alice (user 2) always reads quickly
          if (!currentReaders.some(r => r.userId === 2)) {
            newReaders.push({
              userId: 2,
              username: 'Alice',
              timestamp: new Date().toISOString()
            });
          }
          
          // Bob (user 3) reads sometimes
          if (Math.random() > 0.3 && !currentReaders.some(r => r.userId === 3)) {
            newReaders.push({
              userId: 3,
              username: 'Bob',
              timestamp: new Date().toISOString()
            });
          }
          
          // Charlie (user 4) reads rarely
          if (Math.random() > 0.7 && !currentReaders.some(r => r.userId === 4)) {
            newReaders.push({
              userId: 4,
              username: 'David',
              timestamp: new Date().toISOString()
            });
          }
          
          updated[messageId] = [...currentReaders, ...newReaders];
        });
        
        return updated;
      });
    }, 3000 + Math.random() * 5000); // Random delay between 3-8 seconds
    
    return () => clearTimeout(simulateReads);
  }, [roomMessages]);
  
  // Render read receipts for a message
  const renderReadReceipts = (messageId) => {
    if (!showReadReceipts) return null;
    
    const readers = readReceipts[messageId] || [];
    if (readers.length === 0) return null;
    
    // Don't show read receipts for messages from other users
    const message = roomMessages.find(msg => msg.id === messageId);
    if (!message || message.userId !== 1) return null;
    
    // Format the display based on how many users have read it
    return (
      <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex -space-x-1 mr-1">
          {readers.slice(0, 3).map((reader, index) => (
            <div 
              key={reader.userId} 
              className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
              style={{ zIndex: 10 - index }}
              title={`${reader.username} read at ${new Date(reader.timestamp).toLocaleTimeString()}`}
            >
              <FiCheck size={8} className="text-gray-700 dark:text-gray-300" />
            </div>
          ))}
        </div>
        <span className="text-xs">
          {readers.length === 1 ? 'Read by 1 person' : `Read by ${readers.length} people`}
        </span>
      </div>
    );
  };
  
  // Add read receipt toggle to settings
  const renderReadReceiptSetting = () => (
    <div className="mt-3 flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">Show read receipts</span>
      <button
        onClick={toggleReadReceipts}
        className={`relative inline-flex items-center h-6 rounded-full w-11 ${
          showReadReceipts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span className="sr-only">Toggle read receipts</span>
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            showReadReceipts ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
  
  // Detect foreign language messages that need translation
  const detectLanguage = async (text) => {
    // This is a simplified mock language detection
    // In a real app, you'd use a service like Google Cloud Translation API
    
    // Check for common words in different languages to simulate detection
    const spanishWords = ['hola', 'gracias', 'buenos', 'días', 'cómo', 'estás'];
    const frenchWords = ['bonjour', 'merci', 'comment', 'ça', 'va', 'salut'];
    const germanWords = ['hallo', 'danke', 'guten', 'tag', 'wie', 'gehts'];
    
    const words = text.toLowerCase().split(/\s+/);
    
    let detectedLanguage = 'en'; // Default to English
    
    // Check for Spanish
    if (words.some(word => spanishWords.includes(word))) {
      detectedLanguage = 'es';
    }
    // Check for French
    else if (words.some(word => frenchWords.includes(word))) {
      detectedLanguage = 'fr';
    }
    // Check for German
    else if (words.some(word => germanWords.includes(word))) {
      detectedLanguage = 'de';
    }
    
    return detectedLanguage;
  };
  
  // Translate a message
  const translateMessage = async (messageId, targetLanguage = userLanguage) => {
    setTranslating(true);
    
    try {
      const message = roomMessages.find(msg => msg.id === messageId);
      if (!message) return;
      
      // Skip if already translated to this language
      if (translations[messageId]?.language === targetLanguage) {
        setTranslating(false);
        return;
      }
      
      // Detect source language if not already known
      const sourceLanguage = translations[messageId]?.sourceLanguage || await detectLanguage(message.text);
      
      // Skip translation if the source language is the same as target
      if (sourceLanguage === targetLanguage) {
        setTranslations(prev => ({
          ...prev,
          [messageId]: {
            original: message.text,
            translated: null,
            sourceLanguage,
            language: targetLanguage,
            needsTranslation: false
          }
        }));
        
        setTranslating(false);
        return;
      }
      
      // In a real app, you'd call a translation service here
      // Mock translation for demo purposes
      const mockTranslations = {
        'es': {
          'Hello everyone!': '¡Hola a todos!',
          "Hi Alice, how are you doing today?": "Hola Alice, ¿cómo estás hoy?",
          "I'm doing great, thanks for asking!": "Estoy muy bien, ¡gracias por preguntar!",
          "Welcome to our chat room": "Bienvenido a nuestra sala de chat",
          "Has anyone seen the latest product update?": "¿Alguien ha visto la última actualización del producto?"
        },
        'fr': {
          'Hello everyone!': 'Bonjour à tous!',
          "Hi Alice, how are you doing today?": "Salut Alice, comment vas-tu aujourd'hui ?",
          "I'm doing great, thanks for asking!": "Je vais très bien, merci de demander !",
          "Welcome to our chat room": "Bienvenue dans notre salon de discussion",
          "Has anyone seen the latest product update?": "Quelqu'un a-t-il vu la dernière mise à jour du produit ?"
        },
        'de': {
          'Hello everyone!': 'Hallo zusammen!',
          "Hi Alice, how are you doing today?": "Hallo Alice, wie geht es dir heute?",
          "I'm doing great, thanks for asking!": "Mir geht es gut, danke der Nachfrage!",
          "Welcome to our chat room": "Willkommen in unserem Chatroom",
          "Has anyone seen the latest product update?": "Hat jemand das neueste Produkt-Update gesehen?"
        }
      };
      
      // Get the translation or generate placeholder
      let translatedText = null;
      
      if (mockTranslations[targetLanguage] && mockTranslations[targetLanguage][message.text]) {
        translatedText = mockTranslations[targetLanguage][message.text];
      } else {
        // Generate a placeholder translation for demo purposes
        translatedText = `[${getLanguageName(targetLanguage)} translation: ${message.text}]`;
      }
      
      // Update translations state
      setTranslations(prev => ({
        ...prev,
        [messageId]: {
          original: message.text,
          translated: translatedText,
          sourceLanguage,
          language: targetLanguage,
          needsTranslation: true
        }
      }));
      
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Translation error:', error);
      showNotification('Translation failed', 'error');
    } finally {
      setTranslating(false);
    }
  };
  
  // Auto-translate new messages if enabled
  useEffect(() => {
    if (!autoTranslate) return;
    
    // Get the latest message
    const latestMessage = roomMessages[roomMessages.length - 1];
    if (!latestMessage) return;
    
    // Skip user's own messages
    if (latestMessage.userId === 1) return;
    
    // Check if already has translation
    if (translations[latestMessage.id]) return;
    
    // Translate the message
    translateMessage(latestMessage.id);
  }, [roomMessages, autoTranslate]);
  
  // Get language name from code
  const getLanguageName = (languageCode) => {
    const language = supportedLanguages.find(lang => lang.code === languageCode);
    return language ? language.name : languageCode.toUpperCase();
  };
  
  // Toggle auto-translation
  const toggleAutoTranslate = () => {
    setAutoTranslate(prev => !prev);
    showNotification(
      autoTranslate ? 'Auto-translation disabled' : 'Auto-translation enabled',
      'info'
    );
  };
  
  // Render translation UI for a message
  const renderTranslationUI = (messageId) => {
    const message = roomMessages.find(msg => msg.id === messageId);
    if (!message) return null;
    
    const translation = translations[messageId];
    
    // If we don't have translation info yet, show translate button
    if (!translation) {
      return (
        <button
          onClick={() => translateMessage(messageId)}
          className="flex items-center text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 mt-1"
          disabled={translating}
        >
          <FiGlobe className="mr-1" size={12} />
          <span>{translating ? 'Translating...' : 'Translate'}</span>
        </button>
      );
    }
    
    // If no translation needed, show language indicator
    if (!translation.needsTranslation) {
      return (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          <FiGlobe className="mr-1" size={12} />
          <span>Original: {getLanguageName(translation.sourceLanguage)}</span>
        </div>
      );
    }
    
    // Show translated text with toggle
    return (
      <div className="mt-1">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
          <FiGlobe className="mr-1" size={12} />
          <span>
            Translated from {getLanguageName(translation.sourceLanguage)} to {getLanguageName(translation.language)}
          </span>
          <button
            onClick={() => {
              setTranslations(prev => ({
                ...prev,
                [messageId]: {
                  ...prev[messageId],
                  showOriginal: !prev[messageId].showOriginal
                }
              }));
            }}
            className="ml-2 text-blue-500 hover:underline"
          >
            {translation.showOriginal ? 'Show translation' : 'Show original'}
          </button>
        </div>
        {translation.showOriginal ? (
          <div className="text-sm text-gray-600 dark:text-gray-400 italic">
            {translation.original}
          </div>
        ) : (
          <div className="text-sm text-blue-600 dark:text-blue-400">
            {translation.translated}
          </div>
        )}
      </div>
    );
  };
  
  // Render language settings modal
  const renderLanguageSettings = () => {
    if (!showLanguageSettings) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Language Settings</h2>
            <button
              onClick={() => setShowLanguageSettings(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your language</label>
            <select
              value={userLanguage}
              onChange={(e) => setUserLanguage(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This is the language messages will be translated to
            </p>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-translate messages</span>
            <button
              onClick={toggleAutoTranslate}
              className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                autoTranslate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className="sr-only">Toggle auto-translate</span>
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  autoTranslate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Auto-translation will automatically translate incoming messages to your preferred language.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowLanguageSettings(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Bookmark a message
  const bookmarkMessage = (messageId) => {
    const message = roomMessages.find(msg => msg.id === messageId);
    if (!message) return;
    
    // Check if already bookmarked
    if (bookmarks.some(bookmark => bookmark.messageId === messageId)) {
      showNotification('Message already bookmarked', 'info');
      return;
    }
    
    // Set as active bookmark to add notes, etc.
    setActiveBookmark(messageId);
    setBookmarkNote('');
    setBookmarkCategory(1); // Default to 'Important'
    setShowAddBookmarkModal(true);
  };
  
  // Save the bookmark with notes and category
  const saveBookmark = () => {
    if (!activeBookmark) return;
    
    const message = roomMessages.find(msg => msg.id === activeBookmark);
    if (!message) return;
    
    const category = bookmarkCategories.find(cat => cat.id === bookmarkCategory);
    
    const newBookmark = {
      id: Date.now(),
      messageId: activeBookmark,
      message: message.text,
      username: message.username,
      timestamp: message.timestamp,
      note: bookmarkNote,
      category: category,
      createdAt: new Date().toISOString()
    };
    
    setBookmarks(prev => [...prev, newBookmark]);
    setShowAddBookmarkModal(false);
    setActiveBookmark(null);
    
    showNotification('Message bookmarked', 'success');
  };
  
  // Edit a bookmark's note or category
  const editBookmark = (bookmarkId) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;
    
    setActiveBookmark(bookmark.messageId);
    setBookmarkNote(bookmark.note);
    setBookmarkCategory(bookmark.category.id);
    setShowAddBookmarkModal(true);
    
    // Remove the old bookmark (will be replaced with updated one)
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };
  
  // Remove a bookmark
  const removeBookmark = (bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    showNotification('Bookmark removed', 'info');
  };
  
  // Scroll to a bookmarked message
  const goToBookmarkedMessage = (messageId) => {
    scrollToMessage(messageId);
    setShowBookmarks(false);
  };
  
  // Add a bookmark button to messages
  const renderBookmarkButton = (messageId) => {
    const isBookmarked = bookmarks.some(b => b.messageId === messageId);
    
    return (
      <button
        onClick={() => bookmarkMessage(messageId)}
        className={`flex items-center text-xs ${
          isBookmarked 
            ? 'text-yellow-500 dark:text-yellow-400' 
            : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
        } mt-1 ml-2`}
        title={isBookmarked ? 'Already bookmarked' : 'Bookmark this message'}
      >
        <FiBookmark className="mr-1" size={12} />
      </button>
    );
  };
  
  // Render add/edit bookmark modal
  const renderAddBookmarkModal = () => {
    if (!showAddBookmarkModal || !activeBookmark) return null;
    
    const message = roomMessages.find(msg => msg.id === activeBookmark);
    if (!message) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[500px] max-w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Bookmark Message</h2>
            <button
              onClick={() => setShowAddBookmarkModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{message.username}</span>
              <span>{new Date(message.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200">{message.text}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {bookmarkCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setBookmarkCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    bookmarkCategory === category.id
                      ? `bg-${category.color}-500 text-white`
                      : `bg-${category.color}-100 text-${category.color}-700 dark:bg-${category.color}-900 dark:bg-opacity-30 dark:text-${category.color}-300`
                  }`}
                >
                  <FiTag className="mr-1" size={12} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Add a note (optional)
            </label>
            <textarea
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="Why is this message important?"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-h-[80px]"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              className="px-4 py-2 text-sm border rounded"
              onClick={() => setShowAddBookmarkModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
              onClick={saveBookmark}
            >
              Save Bookmark
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render bookmarks panel
  const renderBookmarksPanel = () => {
    if (!showBookmarks) return null;
    
    // Group bookmarks by category
    const groupedBookmarks = bookmarks.reduce((acc, bookmark) => {
      const categoryId = bookmark.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(bookmark);
      return acc;
    }, {});
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Your Bookmarks</h2>
            <button
              onClick={() => setShowBookmarks(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <FiBookmark size={40} className="mb-3" />
              <p>You haven't bookmarked any messages yet</p>
              <p className="text-sm mt-2">Bookmark important messages to find them later</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2">
              {bookmarkCategories.map(category => {
                const categoryBookmarks = groupedBookmarks[category.id] || [];
                if (categoryBookmarks.length === 0) return null;
                
                return (
                  <div key={category.id} className="mb-4">
                    <h3 className={`text-sm font-medium text-${category.color}-600 dark:text-${category.color}-400 mb-2 flex items-center`}>
                      <FiTag className="mr-1" size={12} />
                      {category.name} ({categoryBookmarks.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {categoryBookmarks.map(bookmark => (
                        <div 
                          key={bookmark.id} 
                          className={`p-3 rounded border-l-4 border-${category.color}-500 bg-gray-50 dark:bg-gray-700`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {bookmark.username}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(bookmark.timestamp).toLocaleString()}
                              </span>
                              <button
                                onClick={() => editBookmark(bookmark.id)}
                                className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                title="Edit bookmark"
                              >
                                <FiEdit size={14} />
                              </button>
                              <button
                                onClick={() => removeBookmark(bookmark.id)}
                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                title="Remove bookmark"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          </div>
                          
                          <p 
                            className="text-gray-800 dark:text-gray-200 cursor-pointer hover:underline"
                            onClick={() => goToBookmarkedMessage(bookmark.messageId)}
                          >
                            {bookmark.message}
                          </p>
                          
                          {bookmark.note && (
                            <div className="mt-2 text-sm italic text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 p-2 rounded">
                              {bookmark.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Track the current text selection in the message input
  const handleMessageSelect = () => {
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    // Only update if there's an actual selection
    if (start !== end) {
      setMessageSelection({ start, end });
      const selectedText = message.substring(start, end);
      
      // Detect formats in selection
      setMessageFormat({
        bold: /^\*\*.*\*\*$/.test(selectedText),
        italic: /^_.*_$/.test(selectedText),
        code: /^`.*`$/.test(selectedText),
        link: /^\[.*\]\(.*\)$/.test(selectedText),
      });
    }
  };
  
  // Track input focus to show/hide formatting toolbar
  const handleMessageFocus = () => {
    setShowFormatting(true);
  };
  
  // Apply rich text formatting to the message
  const applyRichFormat = (formatType) => {
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = '';
    let newStart = start;
    let newEnd = end;
    
    switch (formatType) {
      case 'bold':
        if (messageFormat.bold) {
          // Remove bold formatting
          formattedText = selectedText.substring(2, selectedText.length - 2);
          newStart = start;
          newEnd = end - 4;
        } else {
          // Add bold formatting
          formattedText = `**${selectedText}**`;
          newStart = start;
          newEnd = end + 4;
        }
        break;
      
      case 'italic':
        if (messageFormat.italic) {
          // Remove italic formatting
          formattedText = selectedText.substring(1, selectedText.length - 1);
          newStart = start;
          newEnd = end - 2;
        } else {
          // Add italic formatting
          formattedText = `_${selectedText}_`;
          newStart = start;
          newEnd = end + 2;
        }
        break;
      
      case 'code':
        if (messageFormat.code) {
          // Remove code formatting
          formattedText = selectedText.substring(1, selectedText.length - 1);
          newStart = start;
          newEnd = end - 2;
        } else {
          // Add code formatting
          formattedText = `\`${selectedText}\``;
          newStart = start;
          newEnd = end + 2;
        }
        break;
      
      case 'codeblock':
        // Always add code block (no removal logic for simplicity)
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        newStart = start;
        newEnd = end + 8;
        break;
      
      case 'link':
        // Show link modal
        setLinkText(selectedText);
        setLinkUrl('');
        setShowLinkModal(true);
        return;
      
      case 'quote':
        // Add quote formatting
        const lines = selectedText.split('\n');
        formattedText = lines.map(line => `> ${line}`).join('\n');
        newStart = start;
        newEnd = end + (2 * lines.length); // '> ' adds 2 chars per line
        break;
      
      case 'list':
        // Add list formatting
        const listLines = selectedText.split('\n');
        formattedText = listLines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        newStart = start;
        newEnd = end + listLines.reduce((sum, _, i) => sum + String(i + 1).length + 2, 0);
        break;
      
      case 'bullet':
        // Add bullet list formatting
        const bulletLines = selectedText.split('\n');
        formattedText = bulletLines.map(line => `• ${line}`).join('\n');
        newStart = start;
        newEnd = end + (2 * bulletLines.length); // '• ' adds 2 chars per line
        break;
      
      default:
        return;
    }
    
    // Update the message with the formatted text
    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Update message format state
    setMessageFormat(prev => ({
      ...prev,
      [formatType]: !prev[formatType]
    }));
    
    // Focus back on input after formatting with the proper selection
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(newStart, newEnd);
    }, 0);
  };
  
  // Insert link into the message
  const insertLink = () => {
    if (!linkUrl.trim()) {
      showNotification('Please enter a URL', 'warning');
      return;
    }
    
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const { start, end } = messageSelection;
    const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
    
    // Replace the selected text with the link
    const newMessage = message.substring(0, start) + linkMarkdown + message.substring(end);
    setMessage(newMessage);
    
    // Close the link modal
    setShowLinkModal(false);
    
    // Focus back on input
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
    }, 0);
  };
  
  // Render link modal
  const renderLinkModal = () => {
    if (!showLinkModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 max-w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Insert Link</h2>
            <button
              onClick={() => setShowLinkModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Display text"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              className="px-4 py-2 text-sm border rounded"
              onClick={() => setShowLinkModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
              onClick={insertLink}
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render formatting toolbar
  const renderFormattingToolbar = () => {
    if (!showFormatting) return null;
    
    const hasSelection = messageSelection.start !== messageSelection.end;
    
    return (
      <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600 space-x-1 overflow-x-auto">
        <button
          onClick={() => applyRichFormat('bold')}
          className={`p-1.5 rounded ${messageFormat.bold ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'} ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Bold (Ctrl+B)"
        >
          <FiBold size={16} />
        </button>
        
        <button
          onClick={() => applyRichFormat('italic')}
          className={`p-1.5 rounded ${messageFormat.italic ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'} ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Italic (Ctrl+I)"
        >
          <FiItalic size={16} />
        </button>
        
        <button
          onClick={() => applyRichFormat('code')}
          className={`p-1.5 rounded ${messageFormat.code ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'} ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Inline Code"
        >
          <FiCode size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 my-auto mx-1"></div>
        
        <button
          onClick={() => applyRichFormat('link')}
          className={`p-1.5 rounded ${messageFormat.link ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'} ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Insert Link"
        >
          <FiLink size={16} />
        </button>
        
        <button
          onClick={() => applyRichFormat('quote')}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Quote"
        >
          <FiAlignLeft size={16} />
        </button>
        
        <button
          onClick={() => applyRichFormat('codeblock')}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Code Block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 my-auto mx-1"></div>
        
        <button
          onClick={() => applyRichFormat('list')}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Numbered List"
        >
          <FiList size={16} />
        </button>
        
        <button
          onClick={() => applyRichFormat('bullet')}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${!hasSelection && 'opacity-50 cursor-not-allowed'}`}
          disabled={!hasSelection}
          title="Bullet List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };
  
  // Enhanced message format function with additional markdown support
  const enhancedFormatMessageText = (text) => {
    if (!text) return null;
    
    // 1. Code blocks with syntax highlighting (simulated)
    let formattedText = text.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
      const language = codeContent.split('\n')[0].trim();
      const code = language ? codeContent.substring(language.length).trim() : codeContent;
      
      const languageClass = language ? ` language-${language}` : '';
      
      return `<pre class="bg-gray-800 text-gray-200 p-2 rounded my-2 overflow-x-auto${languageClass}">${code}</pre>`;
    });
    
    // 2. Inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">$1</code>');
    
    // 3. Bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 4. Italic
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // 5. Links with improved styling
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline flex items-center"><span>$1</span><svg class="inline-block ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>');
    
    // 6. Auto-detect URLs not in markdown format
    const urlPattern = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    formattedText = formattedText.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
    
    // 7. Blockquotes
    formattedText = formattedText.replace(/^>\s(.*?)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-2 text-gray-600 dark:text-gray-400 italic my-2">$1</blockquote>');
    
    // 8. Numbered lists
    formattedText = formattedText.replace(/^(\d+)\.\s(.*)$/gm, (match, number, item) => {
      return `<div class="flex"><span class="mr-2">${number}.</span><span>${item}</span></div>`;
    });
    
    // 9. Bullet lists
    formattedText = formattedText.replace(/^[•]\s(.*)$/gm, '<div class="flex"><span class="mr-2">•</span><span>$1</span></div>');
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };
  
  useEffect(() => {
    // ... existing code ...
    
    // Listen for private message requests
    socket.on('private_message_request', (data) => {
      showNotification(`${data.fromUser} wants to start a private conversation`, 'info');
      
      // Add a notification that allows accepting/declining
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now(),
          type: 'private_request',
          fromUser: data.fromUser,
          message: `${data.fromUser} wants to start a private conversation`,
          timestamp: new Date(),
          read: false,
          actions: [
            {
              label: 'Accept',
              action: () => acceptPrivateConversation(data.fromUser)
            },
            {
              label: 'Decline',
              action: () => declinePrivateConversation(data.fromUser)
            }
          ]
        }
      ]);
    });
    
    // Listen for private message response
    socket.on('private_message_response', (data) => {
      if (data.accepted) {
        showNotification(`${data.fromUser} accepted your private conversation request`, 'success');
        setPrivateMessageUser(data.fromUser);
        setIsPrivateMode(true);
        generateEncryptionKey(data.fromUser);
      } else {
        showNotification(`${data.fromUser} declined your private conversation request`, 'error');
      }
    });
    
    // Listen for encryption key exchange
    socket.on('encryption_key_exchange', (data) => {
      if (data.toUser === username) {
        // Store the key for this user
        setKeysExchanged(prev => ({
          ...prev,
          [data.fromUser]: {
            publicKey: data.publicKey,
            timestamp: new Date()
          }
        }));
        
        showNotification(`Secure connection established with ${data.fromUser}`, 'success');
      }
    });
    
    // Listen for encrypted messages
    socket.on('encrypted_message', (data) => {
      if (data.toUser === username || data.fromUser === username) {
        try {
          // Decrypt the message if we have the key
          const decryptedText = decryptMessage(data.text, data.fromUser);
          
          // Create a new message object with the decrypted text
          const decryptedMessage = {
            ...data,
            text: decryptedText,
            isEncrypted: true,
            decrypted: true
          };
          
          // Add the decrypted message to the message list
          setRoomMessages(prevMessages => [...prevMessages, decryptedMessage]);
        } catch (error) {
          console.error('Failed to decrypt message:', error);
          // Add the encrypted message with a note that it couldn't be decrypted
          setRoomMessages(prevMessages => [
            ...prevMessages,
            {
              ...data,
              text: '[Encrypted message - decryption failed]',
              isEncrypted: true,
              decrypted: false
            }
          ]);
        }
      }
    });
    
    return () => {
      // ... existing cleanup ...
      socket.off('private_message_request');
      socket.off('private_message_response');
      socket.off('encryption_key_exchange');
      socket.off('encrypted_message');
    };
  }, [socket, username, keysExchanged]);
  
  // Request a private conversation with a user
  const requestPrivateConversation = (targetUser) => {
    if (targetUser === username) {
      showNotification("You can't start a private conversation with yourself", 'warning');
      return;
    }
    
    socket.emit('private_message_request', {
      fromUser: username,
      toUser: targetUser,
      room
    });
    
    showNotification(`Private conversation request sent to ${targetUser}`, 'info');
  };
  
  // Accept a private conversation request
  const acceptPrivateConversation = (fromUser) => {
    socket.emit('private_message_response', {
      fromUser: username,
      toUser: fromUser,
      accepted: true
    });
    
    setPrivateMessageUser(fromUser);
    setIsPrivateMode(true);
    generateEncryptionKey(fromUser);
    
    // Remove the notification
    setNotifications(prev => prev.filter(n => 
      !(n.type === 'private_request' && n.fromUser === fromUser)
    ));
  };
  
  // Decline a private conversation request
  const declinePrivateConversation = (fromUser) => {
    socket.emit('private_message_response', {
      fromUser: username,
      toUser: fromUser,
      accepted: false
    });
    
    // Remove the notification
    setNotifications(prev => prev.filter(n => 
      !(n.type === 'private_request' && n.fromUser === fromUser)
    ));
  };
  
  // End the private conversation
  const endPrivateConversation = () => {
    setPrivateMessageUser(null);
    setIsPrivateMode(false);
    setEncryptionEnabled(false);
    showNotification('Private conversation ended', 'info');
  };
  
  // Generate a simple encryption key (in a real app, use a proper crypto library)
  const generateEncryptionKey = (targetUser) => {
    // In a real implementation, use proper crypto libraries
    // This is a simple mock for demonstration purposes
    const mockPublicKey = btoa(`${username}-${Date.now()}-${Math.random()}`);
    
    // Exchange the key with the other user
    socket.emit('encryption_key_exchange', {
      fromUser: username,
      toUser: targetUser,
      publicKey: mockPublicKey
    });
    
    // Store our own key
    setEncryptionKey(mockPublicKey);
    
    // Enable encryption by default for private conversations
    setEncryptionEnabled(true);
  };
  
  // Encrypt a message (simplified mock implementation)
  const encryptMessage = (text, targetUser) => {
    if (!encryptionEnabled || !keysExchanged[targetUser]) {
      return text; // Return plaintext if encryption is disabled or no key
    }
    
    // In a real app, use proper encryption with the exchanged keys
    // This is just a simple mock for demonstration
    return btoa(`encrypted:${text}`);
  };
  
  // Decrypt a message (simplified mock implementation)
  const decryptMessage = (text, fromUser) => {
    if (!encryptionEnabled || !keysExchanged[fromUser]) {
      return text; // Return as is if encryption is disabled or no key
    }
    
    try {
      // In a real app, use proper decryption with the exchanged keys
      // This is just a simple mock for demonstration
      const decodedText = atob(text);
      if (decodedText.startsWith('encrypted:')) {
        return decodedText.substring(10); // Remove the 'encrypted:' prefix
      }
      return text; // Return original if not properly formatted
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Encrypted message]';
    }
  };
  
  // Send private encrypted message
  const sendPrivateMessage = () => {
    if (!privateMessageUser) {
      showNotification('No private conversation active', 'warning');
      return;
    }
    
    if (!message.trim() && (!attachments || attachments.length === 0)) {
      return;
    }
    
    const encryptedText = encryptMessage(message, privateMessageUser);
    
    const messageData = {
      fromUser: username,
      toUser: privateMessageUser,
      text: encryptedText,
      isPrivate: true,
      isEncrypted: encryptionEnabled,
      timestamp: new Date().toISOString()
    };
    
    socket.emit('encrypted_message', messageData);
    
    // Add to local messages with the original text (not encrypted)
    const localMessageCopy = {
      ...messageData,
      text: message, // Use the original text for local display
      id: Date.now(),
      decrypted: true,
      sender: 'me'
    };
    
    setRoomMessages(prevMessages => [...prevMessages, localMessageCopy]);
    setMessage(''); // Clear the input
    playMessageSentSound();
  };
  
  // Handle send message with encryption option
  const handleSendMessageWithEncryption = () => {
    if (isPrivateMode) {
      sendPrivateMessage();
    } else {
      handleSendMessage();
    }
  };
  
  // Render encryption settings modal
  const renderEncryptionSettings = () => {
    if (!showEncryptionSettings) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 max-w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <FiShield className="mr-2" /> Encryption Settings
            </h2>
            <button
              onClick={() => setShowEncryptionSettings(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium">
                <FiLock className="mr-2" /> Enable End-to-End Encryption
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="toggle-encryption"
                  checked={encryptionEnabled}
                  onChange={() => setEncryptionEnabled(!encryptionEnabled)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="toggle-encryption"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    encryptionEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                ></label>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <p className="mb-2">
                <strong>How end-to-end encryption works:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Messages are encrypted on your device before sending</li>
                <li>Only you and the recipient can read the messages</li>
                <li>The server cannot access the content of your messages</li>
                <li>Encryption keys are exchanged securely between users</li>
              </ul>
            </div>
            
            {privateMessageUser && (
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded text-sm">
                <p className="font-medium">
                  Private conversation with {privateMessageUser}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {encryptionEnabled 
                    ? "Messages are encrypted end-to-end"
                    : "Enable encryption for secure communication"}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            {privateMessageUser && (
              <button
                className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded hover:bg-red-100 dark:hover:bg-red-900"
                onClick={endPrivateConversation}
              >
                End Private Chat
              </button>
            )}
            <button
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setShowEncryptionSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render the private chat indicator
  const renderPrivateChatIndicator = () => {
    if (!isPrivateMode) return null;
    
    return (
      <div className="bg-blue-500 text-white px-3 py-1 text-sm flex items-center justify-between">
        <div className="flex items-center">
          <FiLock className="mr-1" size={14} />
          <span>Private chat with {privateMessageUser}</span>
          {encryptionEnabled && <FiShield className="ml-2" size={14} title="Encrypted" />}
        </div>
        <button
          onClick={endPrivateConversation}
          className="text-white hover:text-gray-200"
          title="End private chat"
        >
          <FiX size={16} />
        </button>
      </div>
    );
  };
  
  // Render encryption status indicator for messages
  const renderEncryptionStatus = (message) => {
    if (!message.isEncrypted) return null;
    
    return (
      <span className="ml-1 text-xs flex items-center" title={message.decrypted ? "End-to-end encrypted" : "Encrypted message"}>
        <FiLock size={10} className={message.decrypted ? "text-green-500" : "text-yellow-500"} />
      </span>
    );
  };
  
  // Add a user menu option to start private conversations
  const renderUserContextMenu = (user) => {
    if (user === username) return null;
    
    return (
      <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
        <div className="py-1">
          <button
            onClick={() => {
              requestPrivateConversation(user);
              setShowUserContextMenu(null);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center">
              <FiLock className="mr-2" size={14} />
              <span>Start private conversation</span>
            </div>
          </button>
          {/* Other user actions... */}
        </div>
      </div>
    );
  };
  
  const [messageReadStatus, setMessageReadStatus] = useState({});
  
  // Initialize Intersection Observer to detect when messages are viewed
  useEffect(() => {
    if (!socket) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          if (messageId) {
            // Send read receipt to server
            socket.emit('message_read', { 
              roomId, 
              messageId, 
              userId: users.find(u => u.username === username)?.id || 1,
              readAt: new Date().toISOString()
            });
          }
        }
      });
    }, { threshold: 0.5 });
    
    // Attach observer to message elements
    const attachObserver = () => {
      const messageElements = document.querySelectorAll('.message-item');
      messageElements.forEach(el => observer.observe(el));
    };
    
    // Initial attachment
    attachObserver();
    
    // Reattach when messages change
    const messageObserver = new MutationObserver(attachObserver);
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messageObserver.observe(messagesContainer, { childList: true, subtree: true });
    }
    
    // Listen for read receipts from server
    const handleReadReceipt = (data) => {
      setMessageReadStatus(prev => ({
        ...prev,
        [data.messageId]: {
          ...(prev[data.messageId] || {}),
          [data.userId]: data.readAt
        }
      }));
    };
    
    socket.on('message_read_receipt', handleReadReceipt);
    
    return () => {
      observer.disconnect();
      messageObserver.disconnect();
      socket.off('message_read_receipt', handleReadReceipt);
    };
  }, [socket, roomId, username, users]);
  
  // Function to render read receipts
  const renderReadReceipts = (message) => {
    if (!messageReadStatus[message.id]) return null;
    
    const readByCount = Object.keys(messageReadStatus[message.id]).length;
    if (readByCount === 0) return null;
    
    return (
      <div className="read-receipts">
        <FiCheck 
          className={`read-icon ${readByCount > 0 ? 'active' : ''}`}
          color={readByCount > 0 ? '#4caf50' : '#ccc'}
        />
        {readByCount > 1 && (
          <span className="read-count">{readByCount}</span>
        )}
      </div>
    );
  };
  
  // Update message rendering to include read receipts
  const renderMessage = useCallback((msg) => {
    const isCurrentUser = msg.userId === (users.find(u => u.username === username)?.id || 1);
    
    // ... existing message rendering code ...
    
    return (
      <div 
        className={`message-item ${isCurrentUser ? 'sent' : 'received'}`}
        ref={el => messageRefs.current[msg.id] = el}
        data-message-id={msg.id}
      >
        {/* ... existing message content ... */}
        
        {/* Add read receipts at the end of the message for current user's messages */}
        {isCurrentUser && renderReadReceipts(msg)}
      </div>
    );
  }, [messageReadStatus, users, username]);
  
  const getRichReadReceipts = (messageId) => {
    if (!showReadReceipts || !readReceipts[messageId]) return null;
    
    // Sort readers by timestamp (most recent first)
    const readers = [...readReceipts[messageId]].sort((a, b) => b.timestamp - a.timestamp);
    
    if (readers.length === 0) return null;
    
    // When message is read by many users, show counts with hover details
    return (
      <div className="read-receipts-container">
        {readers.length <= 3 ? (
          // Show individual avatars for small groups
          <div className="flex items-center space-x-1">
            {readers.map((reader) => (
              <div 
                key={reader.userId} 
                className="read-receipt-avatar"
                title={`Read by ${reader.username} at ${new Date(reader.timestamp).toLocaleTimeString()}`}
              >
                <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white">
                  {reader.username.charAt(0).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show count for larger groups
          <div 
            className="read-receipt-count text-xs text-gray-400"
            title={readers.map(r => `${r.username} at ${new Date(r.timestamp).toLocaleTimeString()}`).join('\n')}
          >
            <FiCheck className="inline-block mr-1" size={10} />
            <span>{readers.length}</span>
          </div>
        )}
      </div>
    );
  };

  // Enhanced version of the existing renderMessage function to include rich read receipts
  const renderMessage = (message, index) => {
    const isCurrentUser = message.userId === (users.find(u => u.username === username)?.id || 1);
    const messageContainerClass = isCurrentUser
      ? "chat-message-container self-end max-w-[85%] md:max-w-[70%]"
      : "chat-message-container self-start max-w-[85%] md:max-w-[70%]";

    const messageClass = isCurrentUser
      ? "flex items-start message-bubble bg-blue-600 text-white rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl shadow-md"
      : "flex items-start message-bubble bg-gray-200 dark:bg-gray-700 rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl shadow-md";

    // Check if this message is being replied to
    const isBeingRepliedTo = message.id === replyingTo?.id;
    
    return (
      <div
        ref={el => (messageRefs.current[message.id] = el)}
        key={message.id}
        className={`${messageContainerClass} ${
          message.highlight ? "highlight-message" : ""
        } ${isBeingRepliedTo ? "being-replied-to" : ""}`}
        onClick={() => handleMessageClick(message)}
      >
        <motion.div
          variants={bubbleVariants}
          whileTap="tap"
          whileHover="hover"
          className={messageClass}
          style={{
            padding: '0.75rem',
            position: 'relative'
          }}
        >
          {!isCurrentUser && (
            <div className="message-username font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">
              {message.username}
            </div>
          )}
          
          {/* Reply indicator */}
          {message.replyTo && (
            <div className="reply-indicator p-2 rounded bg-gray-100 dark:bg-gray-600 mb-2 text-sm">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                <FiCornerDownRight className="mr-1" />
                <span>Replying to {message.replyToUser}</span>
              </div>
              <div className="truncate">{message.replyToText}</div>
            </div>
          )}
          
          {/* Message content based on type */}
          {message.type === 'audio' ? (
            renderAudioMessage(message)
          ) : message.type === 'image' || message.type === 'video' || message.type === 'file' ? (
            renderAttachmentInMessage(message)
          ) : (
            <div className="message-text">
              {enhancedFormatMessageText(message.text)}
            </div>
          )}
          
          {/* Display reactions */}
          {renderReactions(message.id)}
          
          {/* Translation UI */}
          {message.text && renderTranslationUI(message.id)}
          
          {/* Thread indicator */}
          {getThreadCount(message.id) > 0 && renderThreadButton(message)}
          
          {/* Time and read receipts */}
          <div className="flex items-center justify-end mt-1 space-x-2">
            <div className="message-time text-xs opacity-70">
              {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            
            {/* Enhanced read receipts */}
            {isCurrentUser && getRichReadReceipts(message.id)}
          </div>
          
          {/* Decoration element for chat bubble */}
          <div 
            className={`message-decoration absolute w-3 h-3 ${
              isCurrentUser ? 'right-0 bg-blue-600' : 'left-0 bg-gray-200 dark:bg-gray-700'
            }`}
            style={{
              top: 0,
              [isCurrentUser ? 'right' : 'left']: -6,
              clipPath: isCurrentUser 
                ? 'polygon(0 0, 100% 0, 100% 100%)' 
                : 'polygon(0 0, 100% 0, 0 100%)'
            }}
          />
        </motion.div>
      </div>
    );
  };

  // Actively track messages that are visible on screen
  const trackMessageVisibility = () => {
    if (!messagesContainerRef.current) return;
    
    const options = {
      root: messagesContainerRef.current,
      rootMargin: '0px',
      threshold: 0.5 // Element is considered visible when 50% is in view
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          if (messageId) {
            // Don't mark your own messages as read
            const message = roomMessages.find(m => m.id === messageId);
            if (message && message.username !== username) {
              markMessageAsRead(messageId);
            }
          }
        }
      });
    }, options);
    
    // Observe all messages except user's own
    Object.entries(messageRefs.current).forEach(([messageId, element]) => {
      if (element) {
        const message = roomMessages.find(m => m.id === messageId);
        if (message && message.username !== username) {
          element.dataset.messageId = messageId;
          observer.observe(element);
        }
      }
    });
    
    return () => observer.disconnect();
  };

  // Updated function to mark a message as read
  const markMessageAsRead = (messageId) => {
    // Check if we've already sent a read receipt for this message
    const existingReceipt = readReceipts[messageId]?.find(r => r.username === username);
    if (existingReceipt) return;
    
    // Send read receipt to server
    socket.emit('read_receipt', {
      room,
      messageId,
      username,
      userId: socket.id,
      timestamp: Date.now()
    });
  };

  // Handle incoming read receipts
  const handleReadReceipt = (data) => {
    setReadReceipts(prev => {
      const updatedReceipts = { ...prev };
      if (!updatedReceipts[data.messageId]) {
        updatedReceipts[data.messageId] = [];
      }
      
      // Check if this receipt already exists
      const existingIndex = updatedReceipts[data.messageId].findIndex(
        r => r.userId === data.userId
      );
      
      if (existingIndex >= 0) {
        // Update existing receipt
        updatedReceipts[data.messageId][existingIndex] = data;
      } else {
        // Add new receipt
        updatedReceipts[data.messageId].push(data);
      }
      
      return updatedReceipts;
    });
  };

  // Update useEffect to handle read receipts and track message visibility
  useEffect(() => {
    // Listen for read receipts
    socket.on('read_receipt', handleReadReceipt);
    
    // Setup visibility tracking
    const cleanup = trackMessageVisibility();
    
    return () => {
      socket.off('read_receipt', handleReadReceipt);
      if (cleanup) cleanup();
    };
  }, [socket, roomMessages]);
  
  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              variants={notificationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`${getNotificationColor(notification.type)} text-white px-4 py-2 rounded-lg shadow-lg max-w-xs`}
            >
              {notification.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Reaction Emoji Picker */}
      {activeReactionMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="mb-2 text-center font-medium">Add Reaction</h3>
            <div className="grid grid-cols-6 gap-2 max-w-xs">
              {['👍', '👎', '❤️', '😂', '😯', '😢', '😡', '🎉', '🔥', '🙏', '👀', '💯'].map(emoji => (
                <button
                  key={emoji}
                  className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => handleAddReaction(emoji, activeReactionMessage)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
                onClick={() => setActiveReactionMessage(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
            onClick={() => navigate('/')}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Chat Room</h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* Status indicator for current user */}
          <button 
            onClick={() => setShowStatusModal(true)} 
            className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className={`w-3 h-3 rounded-full mr-1 ${getStatusColor(userStatus)}`}></div>
            <span className="text-sm">{userStatus}</span>
          </button>
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowSearch(!showSearch)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowUsersList(!showUsersList)}
          >
            Users ({users.filter(u => u.status === 'online').length})
          </button>
          <button
            onClick={() => setShowThemeSettings(!showThemeSettings)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            title="Theme Settings"
          >
            <FiSettings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {renderThemeSettings()}
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowShortcutsModal(true)}
            title="Keyboard Shortcuts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {/* Scheduled messages button */}
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            onClick={() => setShowScheduledMessages(true)}
            title="Scheduled Messages"
          >
            <FiClock size={18} />
            {scheduledMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {scheduledMessages.length}
              </span>
            )}
          </button>
          {/* Language button */}
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            onClick={() => setShowLanguageSettings(true)}
            title="Language Settings"
          >
            <FiGlobe size={18} />
            {autoTranslate && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
          {/* Bookmarks button */}
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            onClick={() => setShowBookmarks(true)}
            title="Your Bookmarks"
          >
            <FiBookmark size={18} />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </header>
      
      {/* Search Bar */}
      {showSearch && (
        <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 p-2 rounded-l border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r"
            >
              Search
            </button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="flex items-center justify-between mt-2 text-sm">
              <div>
                {`${currentResultIndex + 1} of ${searchResults.length} results`}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateResults('prev')}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  disabled={searchResults.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateResults('next')}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  disabled={searchResults.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={clearSearch}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
            {roomMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No messages yet. Send the first message!</p>
              </div>
            ) : (
              roomMessages.map((msg, index) => {
                const isSearchResult = searchResults.includes(msg);
                const isCurrentResult = searchResults[currentResultIndex]?.id === msg.id;
                const hasThread = getThreadCount(msg.id) > 0;
                const isThreadParent = hasThread || msg.replyCount > 0;
                
                // Check if this is a reply to a thread
                const isThreadReply = !!threadParentLookup[msg.id];
                const parentId = threadParentLookup[msg.id];
                
                // If it's a thread reply and not in thread view, show it differently
                if (isThreadReply && !isThreadParent && activeThread !== parentId) {
                  return (
                    <motion.div
                      key={msg.id || index}
                      variants={bubbleVariants}
                      whileTap="tap"
                      whileHover="hover"
                      className={`mb-4 group transition-colors duration-300 p-1 rounded-lg ${
                        isCurrentResult ? 'bg-yellow-100 dark:bg-yellow-900' : ''
                      }`}
                      ref={el => messageRefs.current[msg.id] = el}
                      data-message-id={msg.id}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <FiCornerDownRight className="mr-1" size={12} />
                          <span>Replied to a thread • </span>
                          <button 
                            className="ml-1 text-blue-500 hover:underline"
                            onClick={() => {
                              startThread(parentId);
                              markThreadAsRead(parentId);
                            }}
                          >
                            View thread
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                
                return (
                  <motion.div
                    key={msg.id || index}
                    variants={bubbleVariants}
                    whileTap="tap"
                    whileHover="hover"
                    className={`mb-4 group transition-colors duration-300 p-1 rounded-lg ${
                      isCurrentResult ? 'bg-yellow-100 dark:bg-yellow-900' : ''
                    }`}
                    ref={el => messageRefs.current[msg.id] = el}
                    data-message-id={msg.id}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">{msg.username}</span>
                      <div className="flex items-start">
                        <div className={`${msg.isPrivate ? 'bg-blue-600' : 'bg-blue-500'} text-white p-3 rounded-lg inline-block`}>
                          {enhancedFormatMessageText(msg.text)}
                        </div>
                        <div className="flex items-center ml-2">
                          <button 
                            onClick={() => setActiveReactionMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            😊
                          </button>
                          {renderBookmarkButton(msg.id)}
                        </div>
                      </div>
                      {renderReactions(msg.id)}
                      {renderReadReceipts(msg.id)}
                      {renderTranslationUI(msg.id)}
                      
                      {/* Add thread button */}
                      {renderThreadButton(msg)}
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Typing Indicator */}
          {renderTypingIndicator()}
          
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {renderAttachmentPreviews()}
            
            {/* Formatting Toolbar */}
            {renderFormattingToolbar()}
            
            <div className={`relative flex items-center mt-2 ${isDragging ? 'border-2 border-dashed border-blue-400 p-2 rounded' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                title="Attach file (Ctrl+P)"
              >
                <FiPaperclip />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple
                onChange={handleFileSelect} 
                className="hidden" 
              />
              
              <input
                id="message-input"
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setMessage(e.target.value);
                    handleTyping();
                  }
                }}
                onSelect={handleMessageSelect}
                onFocus={handleMessageFocus}
                onBlur={() => {
                  // Don't hide immediately to allow clicking formatting buttons
                  setTimeout(() => setShowFormatting(false), 200);
                }}
                placeholder={isPrivateMode 
                  ? `Private message to ${privateMessageUser}${encryptionEnabled ? ' (encrypted)' : ''}` 
                  : "Type a message..."
                }
                className="flex-1 p-2 border dark:border-gray-600 dark:bg-gray-800 rounded-l"
              />
              
              {/* Encryption toggle for quick access */}
              {isPrivateMode && (
                <button
                  onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                  className={`p-2 ${
                    encryptionEnabled 
                      ? 'text-green-500 hover:text-green-600' 
                      : 'text-gray-500 hover:text-gray-600'
                  }`}
                  title={encryptionEnabled ? "Encryption enabled" : "Encryption disabled"}
                >
                  <FiLock size={20} />
                </button>
              )}
              
              {/* Schedule button */}
              <button
                onClick={() => setShowScheduleModal(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                title="Schedule message"
              >
                <FiClock size={20} />
              </button>
              
              <button
                onClick={handleSendMessageWithEncryption}
                disabled={(!message.trim() && attachments.length === 0) || isLoading}
                className={`bg-blue-500 text-white p-2 rounded-r ${(!message.trim() && attachments.length === 0) || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              >
                <FaPaperPlane />
              </button>
            </div>
            
            {/* Character count */}
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isPrivateMode && (
                  <span className="flex items-center">
                    <FiLock size={12} className="mr-1" />
                    {encryptionEnabled ? 'Encrypted' : 'Not encrypted'}
                  </span>
                )}
              </span>
              <span 
                className={`text-xs ${
                  message.length > 400 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {message.length}/500
              </span>
            </div>
          </div>
          
          {/* Link Modal */}
          <AnimatePresence>
            {showLinkModal && renderLinkModal()}
          </AnimatePresence>
          
          {isDragging && (
            <div className="absolute inset-0 bg-blue-100 bg-opacity-50 z-10 flex items-center justify-center">
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <p className="text-lg font-semibold">Drop files to upload</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Users Sidebar */}
        {renderEnhancedUsersList()}
        
        {/* Thread Panel */}
        {renderThreadPanel()}
      </div>
      
      {/* Status Modal */}
      {renderStatusModal()}
      
      {/* Jump to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute right-8 bottom-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg z-10 transition-all"
          aria-label="Scroll to bottom"
        >
          <FiArrowDown size={20} />
        </button>
      )}
      
      {/* Keyboard shortcuts overlay */}
      {renderShortcutsModal()}
      
      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxImage && renderLightbox()}
      </AnimatePresence>
      
      {/* Scheduled message modals */}
      <AnimatePresence>
        {showScheduleModal && renderScheduleMessageModal()}
        {showScheduledMessages && renderScheduledMessagesList()}
      </AnimatePresence>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded">
        <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-200">Preferences</h3>
        
        <div className="space-y-4">
          {/* ... existing theme settings ... */}
        </div>
          
        {renderReadReceiptSetting()}
      </div>
      {/* Language Settings Modal */}
      <AnimatePresence>
        {showLanguageSettings && renderLanguageSettings()}
      </AnimatePresence>
      {/* Bookmarks Modal */}
      <AnimatePresence>
        {showBookmarks && renderBookmarksPanel()}
        {showAddBookmarkModal && renderAddBookmarkModal()}
      </AnimatePresence>
      {/* Encryption Settings Modal */}
      <AnimatePresence>
        {showEncryptionSettings && renderEncryptionSettings()}
      </AnimatePresence>
      {/* Private chat indicator */}
      {renderPrivateChatIndicator()}
      <style jsx>{`
        // ... existing styles ...
        .read-receipts {
          display: flex;
          align-items: center;
          margin-left: auto;
          font-size: 12px;
          color: #8a8a8a;
        }
        
        .read-icon {
          margin-right: 4px;
          transition: color 0.3s ease;
        }
        
        .read-icon.active {
          color: #4caf50;
        }
        
        .read-count {
          font-size: 10px;
          background: #e1e1e1;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default ChatRoom;
