import { useState, useRef, useEffect } from 'react';
import './ChatStyles.css';
import { 
  FiSend, 
  FiSmile, 
  FiPaperclip, 
  FiMic, 
  FiSearch, 
  FiMoreVertical, 
  FiPhone, 
  FiVideo, 
  FiMessageSquare,
  FiUser,
  FiMenu,
  FiChevronLeft
} from 'react-icons/fi';

const ChatApp = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! How are you doing today?",
      isUser: false,
      timestamp: "09:41",
      sender: "Sarah Johnson",
      avatar: "SJ"
    },
    {
      id: 2,
      text: "I'm good, thanks for asking! Just finishing up some work. How about you?",
      isUser: true,
      timestamp: "09:42",
      status: "read"
    },
    {
      id: 3,
      text: "I'm doing well! I was wondering if you'd like to join our team meeting tomorrow at 2pm?",
      isUser: false,
      timestamp: "09:45",
      sender: "Sarah Johnson",
      avatar: "SJ"
    },
    {
      id: 4,
      text: "Sure, I'd be happy to join. Is it the regular Zoom link?",
      isUser: true,
      timestamp: "09:47",
      status: "read"
    },
    {
      id: 5,
      text: "Yes, same link as always. I'll send a calendar invite shortly to make sure you have it.",
      isUser: false,
      timestamp: "09:48",
      sender: "Sarah Johnson",
      avatar: "SJ"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (messages.length > 0 && !messages[messages.length - 1].isUser) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: newMessage,
        isUser: true,
        timestamp: currentTime,
        status: "sent"
      }]);
      setNewMessage('');
      
      // Simulate a reply after a delay
      setTimeout(() => {
        const responses = [
          "That sounds great!",
          "I understand. Let's discuss this further.",
          "Thanks for letting me know.",
          "I'll get back to you on that soon.",
          "Let me check and confirm."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: randomResponse,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: "Sarah Johnson",
          avatar: "SJ"
        }]);
      }, 3000);
    }
  };

  // Group messages by sender for better UI
  const groupedMessages = messages.reduce((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup[0].isUser === message.isUser) {
      lastGroup.push(message);
    } else {
      groups.push([message]);
    }
    
    return groups;
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="chat-app">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon"><FiMessageSquare size={16} /></span>
            <span>ChatApp</span>
          </div>
        </div>
        
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search messages..." 
          />
        </div>
        
        <div className="channel-list">
          <div className="channel-item active">
            <div className="avatar">
              SJ
              <span className="avatar-status status-online"></span>
            </div>
            <div className="channel-info">
              <span className="channel-name">Sarah Johnson</span>
              <span className="channel-last-message">I'll send a calendar invite shortly...</span>
            </div>
            <div className="channel-meta">
              <span className="channel-time">09:48</span>
              <span className="channel-badge">2</span>
            </div>
          </div>
          
          <div className="channel-item">
            <div className="avatar">
              TG
            </div>
            <div className="channel-info">
              <span className="channel-name">Team Group</span>
              <span className="channel-last-message">Alex: When is the deadline?</span>
            </div>
            <div className="channel-meta">
              <span className="channel-time">Yesterday</span>
              <span className="channel-badge">5</span>
            </div>
          </div>
          
          <div className="channel-item">
            <div className="avatar">
              MP
            </div>
            <div className="channel-info">
              <span className="channel-name">Michael Peterson</span>
              <span className="channel-last-message">Let's catch up next week</span>
            </div>
            <div className="channel-meta">
              <span className="channel-time">Wed</span>
            </div>
          </div>
          
          <div className="channel-item">
            <div className="avatar">
              JD
            </div>
            <div className="channel-info">
              <span className="channel-name">Jessica Davis</span>
              <span className="channel-last-message">Thanks for your help!</span>
            </div>
            <div className="channel-meta">
              <span className="channel-time">Mon</span>
            </div>
          </div>
          
          <div className="channel-item">
            <div className="avatar">
              RH
            </div>
            <div className="channel-info">
              <span className="channel-name">Robert Hudson</span>
              <span className="channel-last-message">The files are ready for review</span>
            </div>
            <div className="channel-meta">
              <span className="channel-time">Jun 25</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <div className="chat-header-info">
            <button className="icon-button md-only" onClick={toggleSidebar}>
              {sidebarOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
            </button>
            <div className="avatar">
              SJ
              <span className="avatar-status status-online"></span>
            </div>
            <div>
              <h3 className="chat-header-title">Sarah Johnson</h3>
              <span className="chat-header-subtitle">Online</span>
            </div>
          </div>
          
          <div className="chat-header-actions">
            <button className="icon-button">
              <FiSearch size={20} />
            </button>
            <button className="icon-button">
              <FiPhone size={20} />
            </button>
            <button className="icon-button">
              <FiVideo size={20} />
            </button>
            <button className="icon-button">
              <FiMoreVertical size={20} />
            </button>
          </div>
        </div>
        
        <div className="messages-container">
          <div className="chat-date-separator">
            <span>Today</span>
          </div>

          {groupedMessages.map((group, groupIndex) => (
            <div 
              key={groupIndex} 
              className={`message-group ${group[0].isUser ? 'user' : ''}`}
            >
              {!group[0].isUser && (
                <div className="avatar">
                  {group[0].avatar}
                </div>
              )}
              
              <div className="message-content">
                {!group[0].isUser && (
                  <span className="message-sender">{group[0].sender}</span>
                )}
                
                {group.map((message, messageIndex) => (
                  <div key={message.id} className="message">
                    <p>{message.text}</p>
                  </div>
                ))}
                
                <div className="message-meta">
                  <span className="message-timestamp">{group[group.length - 1].timestamp}</span>
                  {group[0].isUser && group[0].status && (
                    <div className="message-status">
                      <span>✓✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <button className="input-action-button">
              <FiPaperclip size={20} />
            </button>
            
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            
            <button className="input-action-button">
              <FiSmile size={20} />
            </button>
            <button className="input-action-button">
              <FiMic size={20} />
            </button>
            
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp; 