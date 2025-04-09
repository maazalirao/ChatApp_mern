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
  FiPrinter
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
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-col items-start">
          <div className="flex space-x-1 items-center">
            <div className="flex space-x-0.5">
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
  
  // Enhanced typing status handling
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(roomId, true);
    }
    
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
      messageSound.current?.play().catch(err => console.log('Cannot play sound'));
      
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
    messageSound.current?.play().catch(err => console.log('Cannot play sound'));
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
    messageSound.current?.play().catch(err => console.log('Cannot play sound'));
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            aria-label="Back to dashboard"
          >
            <FiArrowLeft size={20} />
          </button>
          
          <div className="flex-1 mx-4 flex items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
              {roomInfo?.name || 'Chat Room'}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Pinned Messages Button */}
          <button
            onClick={() => setShowPinned(prev => !prev)}
            className={`p-2 rounded-full relative ${
              pinnedMessages.length > 0
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-600 dark:text-gray-400'
            } hover:bg-gray-100 dark:hover:bg-gray-700`}
            title="Pinned Messages"
          >
            <FiPin size={20} className={showPinned ? "rotate-45" : ""} />
            {pinnedMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {pinnedMessages.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowUsersList(true)}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Show users"
          >
            <FiUsers size={20} />
          </button>
          
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="More options"
          >
            <FiMoreVertical size={20} />
          </button>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-4 top-16 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowMenu(false);
                    setShowUsersList(true);
                  }}
                >
                  <FiUsers className="mr-2" /> View Participants
                </button>
                
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowMenu(false);
                    // Show room info
                  }}
                >
                  <FiInfo className="mr-2" /> Room Info
                </button>
                
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowMenu(false);
                    // Clear chat history
                  }}
                >
                  <FiTrash2 className="mr-2" /> Clear History
                </button>
                
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowMenu(false);
                    handleLeaveRoom();
                  }}
                >
                  <FiLogOut className="mr-2" /> Leave Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Pinned Messages Panel */}
      {showPinned && pinnedMessages.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-900 p-2 overflow-auto max-h-40">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center">
              <FiPin size={14} className="mr-1" /> Pinned Messages
            </h3>
            <button 
              onClick={() => setShowPinned(false)}
              className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              <FiX size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            {pinnedMessages.map(msg => {
              const pinnedByUser = msg.pinnedBy;
              const formattedDate = new Date(msg.pinnedAt || msg.timestamp).toLocaleString();
              
              return (
                <motion.div
                  key={`pinned-${msg.id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm flex items-start gap-3"
                >
                  <img 
                    src={msg.user?.avatar || defaultAvatar} 
                    alt={msg.user?.username} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {msg.user?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          onClick={() => handlePinMessage(msg)}
                          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 p-1"
                          title="Unpin message"
                        >
                          <FiPin size={14} className="rotate-45" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                    
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                      Pinned by {pinnedByUser} · {formattedDate}
                    </div>
                    
                    <button
                      onClick={() => {
                        // Find the message in the room messages
                        const element = document.getElementById(`msg-${msg.id}`);
                        if (element) {
                          // Scroll to the message
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          
                          // Highlight the message briefly
                          element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
                          setTimeout(() => {
                            element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
                          }, 2000);
                        }
                      }}
                      className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Jump to message
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
      
      <div 
        className="chat-container"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* ... existing code for chat container ... */}
        
        {/* In the message actions area, add Pin button */}
        {/* Find the message actions menu and add this button */}
        {/* Inside the message actions menu (in the swipe area) */}
        {/*
        <button
          onClick={() => handlePinMessage(msg)}
          className={`p-2 rounded-full ${
            pinnedMessages.some(m => m.id === msg.id)
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          } hover:opacity-80`}
          title={pinnedMessages.some(m => m.id === msg.id) ? "Unpin message" : "Pin message"}
        >
          <FiPin size={16} />
        </button>
        */}
        
        {/* Pin Indicator on messages */}
        {/*
        {pinnedMessages.some(m => m.id === msg.id) && (
          <div className="absolute -top-3 left-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full px-2 py-0.5 text-xs flex items-center">
            <FiPin size={10} className="mr-1" />
            Pinned
          </div>
        )}
        */}
        
        {/* ... rest of existing code ... */}
      </div>
    </div>
  );
};

export default ChatRoom; 