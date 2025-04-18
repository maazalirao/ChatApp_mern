import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiArrowLeft, FiSearch, FiChevronUp, FiChevronDown, FiSettings, FiArrowDown, FiPaperclip, FiFile, FiImage, FiVideo, FiMusic, FiDownload, FiBell, FiBellOff, FiVolume, FiVolumeX, FiMoon, FiSun, FiCornerDownRight, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import { FaMicrophone, FaStop } from 'react-icons/fa';
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
  
  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
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
  
  const sendVoiceMessage = async () => {
    if (!audioBlob) return;
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result;
        
        // Send voice message
        socket.emit('chatMessage', {
          room,
          username,
          text: '',
          timestamp: new Date().toISOString(),
          type: 'audio',
          audio: base64Audio,
        });
        
        // Reset audio state
        setAudioBlob(null);
      };
    } catch (err) {
      console.error("Error sending voice message:", err);
      toast.error("Failed to send voice message");
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setAudioBlob(null);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
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
                  >
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">{msg.username}</span>
                      <div className="flex items-start">
                        <div className="bg-blue-500 text-white p-3 rounded-lg inline-block">
                          {msg.type === 'text' ? formatMessageText(msg.text) : msg.type === 'image' || msg.type === 'file' ? renderAttachmentInMessage(msg) : null}
                        </div>
                        <button 
                          onClick={() => setActiveReactionMessage(msg.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          😊
                        </button>
                      </div>
                      {renderReactions(msg.id)}
                      
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
            <div className={`relative flex items-center ${isDragging ? 'border-2 border-dashed border-blue-400 p-2 rounded' : ''}`}>
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
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
                type="text"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setMessage(e.target.value);
                    handleTyping();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 p-2 border dark:border-gray-600 dark:bg-gray-800 rounded-l"
              />
              
              {/* Voice recording button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-blue-500'}`}
                title={isRecording ? "Stop recording" : "Record voice message"}
              >
                <FaMicrophone />
              </button>
              
              <button
                onClick={showFileUpload ? sendMessageWithFiles : handleSendMessage}
                disabled={(!showFileUpload && message.trim() === '') || isLoading}
                className={`bg-blue-500 text-white p-2 rounded-full ${(!showFileUpload && message.trim() === '') || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              >
                <FaPaperPlane />
              </button>
            </div>
            {isDragging && (
              <div className="absolute inset-0 bg-blue-100 bg-opacity-50 z-10 flex items-center justify-center">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <p className="text-lg font-semibold">Drop files to upload</p>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
};

export default ChatRoom;
