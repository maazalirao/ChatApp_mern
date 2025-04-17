import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiArrowLeft, FiSearch, FiChevronUp, FiChevronDown, FiSettings, FiArrowDown, FiPaperclip, FiFile, FiImage, FiVideo, FiMusic, FiDownload } from 'react-icons/fi';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { FaPaperPlane } from 'react-icons/fa';
import { useSelector } from "react-redux";

const ChatRoom = ({ socket }) => {
  const [message, setMessage] = useState('');
  const [roomMessages, setRoomMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
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
    { id: 1, username: 'Alice', status: 'online' },
    { id: 2, username: 'Bob', status: 'away' },
    { id: 3, username: 'Charlie', status: 'offline' },
    { id: 4, username: 'David', status: 'online' },
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
  
  const navigate = useNavigate();
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
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setShowFileUpload(true);
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setShowFileUpload(true);
    }
  };

  // Remove a selected file
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length <= 1) {
      setShowFileUpload(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return <FiImage size={20} />;
      case 'video':
        return <FiVideo size={20} />;
      case 'audio':
        return <FiMusic size={20} />;
      default:
        return <FiFile size={20} />;
    }
  };

  // Get file size in readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Send message with files
  const sendMessageWithFiles = async () => {
    if (selectedFiles.length === 0 && message.trim() === '') return;
    
    const messagesToSend = [];
    
    // Handle text message if present
    if (message.trim() !== '') {
      messagesToSend.push({
        type: 'text',
        content: message
      });
    }
    
    // Handle file uploads
    for (const file of selectedFiles) {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // Example: Send to a file upload endpoint
        // In a real app, you would use fetch or axios to send to your server
        // const response = await fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData
        // });
        // const result = await response.json();
        
        // For demo, we'll simulate a successful upload with a fake URL
        const fileUrl = URL.createObjectURL(file);
        
        messagesToSend.push({
          type: file.type.startsWith('image/') ? 'image' : 'file',
          content: fileUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        // Handle upload error
      }
    }
    
    // Send each message
    for (const msgData of messagesToSend) {
      socket.emit("send_message", {
        room: room,
        content: msgData.content,
        type: msgData.type,
        sender: currentUser,
        time: new Date(),
        ...(msgData.fileName && { fileName: msgData.fileName }),
        ...(msgData.fileSize && { fileSize: msgData.fileSize }),
        ...(msgData.fileType && { fileType: msgData.fileType })
      });
    }
    
    // Reset state
    setMessage("");
    setSelectedFiles([]);
    setShowFileUpload(false);
  };

  // Render file upload area
  const renderFileUploadArea = () => {
    if (!showFileUpload) return null;
    
    return (
      <div className="file-upload-area p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h3>
          <button 
            onClick={() => {
              setSelectedFiles([]);
              setShowFileUpload(false);
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={18} />
          </button>
        </div>
        
        <div className="selected-files-list max-h-40 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div key={index} className="selected-file flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded mb-2">
              <div className="flex items-center space-x-2">
                {file.type.startsWith('image/') ? (
                  <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={file.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {getFileIcon(file)}
                  </div>
                )}
                <div className="file-info">
                  <p className="text-sm font-medium truncate max-w-[150px]">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button 
                onClick={() => removeSelectedFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-2">
          <button 
            onClick={sendMessageWithFiles}
            className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  // Render file message
  const renderFileMessage = (msg) => {
    if (msg.type === 'image') {
      return (
        <div className="image-message mb-1">
          <img 
            src={msg.content} 
            alt={msg.fileName || 'Image'} 
            className="max-w-[300px] max-h-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(msg.content, '_blank')}
          />
        </div>
      );
    } else if (msg.type === 'file') {
      return (
        <div className="file-message p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mb-1 flex items-center space-x-2">
          <div className="file-icon text-gray-500 dark:text-gray-400">
            <FiFile size={20} />
          </div>
          <div className="file-info flex-1">
            <p className="text-sm font-medium">{msg.fileName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(msg.fileSize)}</p>
          </div>
          <a 
            href={msg.content} 
            download={msg.fileName}
            className="download-button text-blue-500 hover:text-blue-700"
          >
            <FiDownload size={18} />
          </a>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
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
            Back
          </button>
          <h1 className="text-xl font-semibold">Chat Room</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
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
                
                // Render audio message
                if (msg.type === 'audio') {
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
                            <div className="mt-1">
                              <audio controls src={msg.audio} className="max-w-full" />
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveReactionMessage(msg.id)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            😊
                          </button>
                        </div>
                        {renderReactions(msg.id)}
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
                          {msg.type === 'text' ? formatMessageText(msg.text) : msg.type === 'image' || msg.type === 'file' ? renderFileMessage(msg) : null}
                        </div>
                        <button 
                          onClick={() => setActiveReactionMessage(msg.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          😊
                        </button>
                      </div>
                      {renderReactions(msg.id)}
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
            {/* Formatting toolbar */}
            <div className="mb-2 flex items-center space-x-2">
              <button 
                onClick={() => applyFormatting('bold')} 
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="font-bold">B</span>
              </button>
              <button 
                onClick={() => applyFormatting('italic')} 
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="italic">I</span>
              </button>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                😊
              </button>
              <div className="flex-1"></div>
              <span className={`text-xs ${message.length > 450 ? 'text-orange-500' : ''} ${message.length > 490 ? 'text-red-500' : ''}`}>
                {message.length}/500
              </span>
            </div>
            
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded mb-2 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {['😀', '😂', '😍', '🥰', '😎', '😇', '🤔', '😴', 
                    '👍', '👏', '🙌', '🎉', '❤️', '🔥', '⭐', '💯'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {audioBlob ? (
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">
                    <FaMicrophone />
                  </span>
                  <span>Voice message ready</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={cancelRecording}
                    className="text-red-500 hover:text-red-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={sendVoiceMessage}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : isRecording ? (
              <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/30 rounded-lg p-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 animate-pulse">
                    <FaMicrophone />
                  </span>
                  <span>Recording... {formatTime(recordingTime)}</span>
                </div>
                <button 
                  onClick={stopRecording}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <FaStop />
                </button>
              </div>
            ) : null}
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Attach files"
              >
                <FiPaperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
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
          </div>
        </div>
        
        {/* Users Sidebar */}
        {showUsersList && (
          <div className="w-64 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold">Users</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setShowUsersList(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(user => (
                  <li key={user.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(user.status)}`}></div>
                      <span>{user.username}</span>
                      {typingUsers[user.id] && (
                        <span className="ml-2 text-xs text-gray-500 italic">typing...</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
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
      
      {/* File upload area */}
      {renderFileUploadArea()}
    </div>
  );
};

export default ChatRoom;
