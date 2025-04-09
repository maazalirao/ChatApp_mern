// ChatRoom component for real-time messaging
import { useState, useEffect, useRef, useMemo } from 'react';
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
  FiAtSign
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
  
  // Handle sending a message with mentions
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
      
      // Extract mentions for notifications
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(message)) !== null) {
        const username = match[1];
        const mentionedUser = roomInfo?.users?.find(
          user => user.username.toLowerCase() === username.toLowerCase()
        );
        
        if (mentionedUser && mentionedUser.id !== currentUser.id) {
          mentions.push(mentionedUser.id);
        }
      }
      
      // If there are mentions, include them in the message data
      const messageWithMentions = {
        roomId,
        text: message.trim(),
        mentions: mentions.length > 0 ? mentions : undefined
      };
      
      // Send message with mentions
      sendMessage(roomId, message.trim(), mentions);
      
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
  
  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Generate a unique ID for this recording
        const recordingId = `recording-${Date.now()}`;
        
        // Store the recording
        setRecordings(prev => ({
          ...prev,
          [recordingId]: {
            url: audioUrl,
            duration: recordingDuration,
            blob: audioBlob
          }
        }));
        
        // Reset recording duration
        setRecordingDuration(0);
        
        // Send the voice message
        sendVoiceMessage(recordingId, audioBlob);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear the duration timer
      clearInterval(recordingTimerRef.current);
    }
  };
  
  // Cancel voice recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear the duration timer
      clearInterval(recordingTimerRef.current);
      
      // Clear audio chunks
      audioChunksRef.current = [];
      
      // Reset recording duration
      setRecordingDuration(0);
    }
  };
  
  // Send voice message
  const sendVoiceMessage = async (recordingId, audioBlob) => {
    setIsSending(true);
    
    try {
      // In a real app, you would upload the audio blob to your server
      // For demo purposes, we'll create a local URL and add it to messages
      
      // Create a new message with voice recording
      const voiceMessage = {
        id: `voice-${Date.now()}`,
        roomId,
        userId: currentUser.id,
        user: currentUser,
        timestamp: new Date().toISOString(),
        type: 'voice',
        recording: recordingId,
        duration: recordingDuration
      };
      
      // Add to messages (this would typically be handled by the socket in a real app)
      setRoomMessages(prev => [...prev, voiceMessage]);
      
      // Play the send sound
      messageSound.current?.play().catch(err => console.log('Cannot play sound'));
      
      // Reset sending state after a short delay
      setTimeout(() => setIsSending(false), 300);
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert(`Failed to send voice message: ${error.message}`);
      setIsSending(false);
    }
  };
  
  // Format recording duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Play/pause audio
  const toggleAudio = (recordingId) => {
    if (playingAudio === recordingId) {
      // Pause the currently playing audio
      audioPlayerRef.current?.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      audioPlayerRef.current?.pause();
      
      // Play the new audio
      audioPlayerRef.current = new Audio(recordings[recordingId]?.url);
      audioPlayerRef.current.play();
      setPlayingAudio(recordingId);
      
      // Listen for when audio ends
      audioPlayerRef.current.onended = () => {
        setPlayingAudio(null);
      };
    }
  };
  
  // Clean up audio URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to avoid memory leaks
      Object.values(recordings).forEach(recording => {
        if (recording.url) {
          URL.revokeObjectURL(recording.url);
        }
      });
      
      // Stop any playing audio
      audioPlayerRef.current?.pause();
      
      // Stop any active recording
      if (isRecording) {
        cancelRecording();
      }
    };
  }, [recordings, isRecording]);
  
  // Render voice message
  const renderVoiceMessage = (message) => {
    const recordingId = message.recording;
    const recording = recordings[recordingId];
    
    if (!recording) {
      return <div className="text-sm text-gray-500">Voice message unavailable</div>;
    }
    
    return (
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
        <button
          onClick={() => toggleAudio(recordingId)}
          className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-500 text-white"
        >
          {playingAudio === recordingId ? <FiPause /> : <FiPlay />}
        </button>
        
        <div className="flex-1">
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500"
              style={{ 
                width: playingAudio === recordingId ? 
                  `${(audioPlayerRef.current?.currentTime / audioPlayerRef.current?.duration) * 100}%` : 
                  '0%'
              }}
            ></div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">{formatDuration(recording.duration)}</div>
      </div>
    );
  };
  
  // User status options
  const statusOptions = [
    { id: 'online', label: 'Online', color: 'bg-green-500', icon: null },
    { id: 'away', label: 'Away', color: 'bg-yellow-500', icon: <FiClock size={12} /> },
    { id: 'busy', label: 'Busy', color: 'bg-red-500', icon: <FiMinus size={12} /> },
    { id: 'offline', label: 'Offline', color: 'bg-gray-400', icon: <FiAlertCircle size={12} /> }
  ];
  
  // Update user status
  const updateUserStatus = (status) => {
    setUserStatus(status);
    localStorage.setItem('userStatus', status);
    
    // Emit status change to other users
    socket.emit('user_status_update', {
      roomId,
      userId: currentUser.id,
      status
    });
    
    setShowStatusPicker(false);
  };
  
  // Track user statuses
  const [userStatuses, setUserStatuses] = useState({});
  
  useEffect(() => {
    // Listen for status updates from other users
    socket.on('user_status_update', ({ userId, status }) => {
      setUserStatuses(prev => ({
        ...prev,
        [userId]: status
      }));
    });
    
    // Emit our initial status
    socket.emit('user_status_update', {
      roomId,
      userId: currentUser.id,
      status: userStatus
    });
    
    return () => {
      socket.off('user_status_update');
    };
  }, [socket, currentUser, roomId, userStatus]);
  
  // Get status of a user
  const getUserStatus = (userId) => {
    return userStatuses[userId] || 'online';
  };
  
  // Render status indicator
  const renderStatusIndicator = (status, className = '') => {
    const statusOption = statusOptions.find(opt => opt.id === status) || statusOptions[0];
    
    return (
      <div className={`relative ${className}`}>
        <span className={`${statusOption.color} h-3 w-3 rounded-full ${className} flex items-center justify-center`}>
          {statusOption.icon && <span className="text-white">{statusOption.icon}</span>}
        </span>
      </div>
    );
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };
  
  // Process uploaded files
  const processFiles = (fileList) => {
    setFileUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    
    // Array to store file promises
    const filePromises = [];
    
    // Process each file
    Array.from(fileList).forEach(file => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a promise to read the file
      const filePromise = new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          // For images, store the data URL for preview
          const isImage = file.type.startsWith('image/');
          
          // Store file info
          setFiles(prev => ({
            ...prev,
            [fileId]: {
              id: fileId,
              name: file.name,
              type: file.type,
              size: file.size,
              url: isImage ? reader.result : null,
              blob: file
            }
          }));
          
          resolve(fileId);
        };
        
        // Read as data URL for images, or just complete for other files
        if (file.type.startsWith('image/')) {
          reader.readAsDataURL(file);
        } else {
          // For non-images, just complete without reading the file content
          reader.onload();
        }
      });
      
      filePromises.push(filePromise);
    });
    
    // When all files are processed, send file messages
    Promise.all(filePromises).then(fileIds => {
      // Complete upload progress
      setUploadProgress(100);
      
      // Send file messages
      fileIds.forEach(fileId => {
        sendFileMessage(fileId);
      });
      
      // Reset upload state
      setTimeout(() => {
        setFileUploading(false);
        setUploadProgress(0);
      }, 500);
    });
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
    messageSound.current?.play().catch(err => console.log('Cannot play sound'));
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
  
  return (
    <div 
      className="chat-container"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
          {/* Status indicator */}
          <div className="relative mr-3">
            <button
              className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm"
              onClick={() => setShowStatusPicker(!showStatusPicker)}
              title="Change your status"
            >
              {renderStatusIndicator(userStatus, 'mr-1')}
              <span className="hidden md:inline">{statusOptions.find(s => s.id === userStatus)?.label}</span>
            </button>
            
            {/* Status picker */}
            {showStatusPicker && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 w-40">
                <div className="py-1">
                  {statusOptions.map(option => (
                    <button
                      key={option.id}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => updateUserStatus(option.id)}
                    >
                      {renderStatusIndicator(option.id, 'mr-2')}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
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
          
          <button 
            className="btn-icon mr-1"
            onClick={toggleThemeSettings}
            aria-label="Theme settings"
            title="Theme settings"
          >
            <FiSettings size={18} />
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
                {roomInfo?.users?.map((user) => {
                  const status = getUserStatus(user.id);
                  const statusText = statusOptions.find(s => s.id === status)?.label || 'Online';
                  const statusColor = statusOptions.find(s => s.id === status)?.color || 'bg-green-500';
                  
                  return (
                    <div 
                      key={user.id} 
                      className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                          alt={user.username}
                          className="avatar mr-3"
                        />
                        {renderStatusIndicator(status, 'absolute bottom-0 right-1 border-2 border-white dark:border-gray-800')}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs flex items-center text-gray-500">
                          {statusText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Theme settings panel */}
      <AnimatePresence>
        {showThemeSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Theme Settings</h3>
                <button className="btn-icon" onClick={() => setShowThemeSettings(false)}>
                  <FiX size={18} />
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span>Dark Mode</span>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isDarkMode ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className="sr-only">Toggle dark mode</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  ></span>
                </button>
              </div>
              
              <div>
                <span className="block mb-2">Theme Color</span>
                <div className="grid grid-cols-4 gap-2">
                  {themeColors.map(color => (
                    <button
                      key={color.name}
                      className={`w-full h-8 rounded-md border ${
                        themeColor === color.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-black dark:ring-white' : ''
                      }`}
                      style={{ backgroundColor: color.primary }}
                      onClick={() => setThemeColor(color.name)}
                      title={color.name}
                    />
                  ))}
                </div>
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
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {renderStatusIndicator(getUserStatus(group.userId))}
                    </div>
                    
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
                                  {msg.type === 'voice' ? 
                                    renderVoiceMessage(msg) : 
                                    msg.type === 'file' ? renderFileMessage(msg) : 
                                    formatMessageWithMentions(msg.text)}
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
      
      {/* Chat input with mention dropdown */}
      <div className="chat-input-container relative">
        {/* Mention dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-4 mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            <div className="py-1">
              {filteredUsers.map((user, index) => (
                <button
                  key={user.id}
                  className={`flex w-full items-center px-4 py-2 text-sm text-left ${
                    index === mentionIndex 
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => insertMention(user)}
                >
                  <div className="flex items-center">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                      alt={user.username}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span>{user.username}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
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
          
          <button
            type="button"
            className="btn-icon text-gray-500 dark:text-gray-400"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <FiPaperclip />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          
          {!isRecording && (
            <button
              type="submit"
              className={`btn-primary p-2 rounded-full flex items-center justify-center ${isSending ? 'animate-pulse' : ''}`}
              disabled={!message.trim() || isSending}
              aria-label="Send message"
              title="Send message"
            >
              <FiSend size={18} />
            </button>
          )}
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