import { useState, useRef, useEffect } from 'react';
import './ChatStyles.css';
import { FiSend, FiSmile, FiMessageCircle } from 'react-icons/fi';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: newMessage,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-app">
      <div className="sidebar">
        <h2 className="text-accent">Conversations</h2>
        <div className="channel-list">
          <div className="channel-item">
            <div className="avatar bg-gradient-to-br from-primary to-accent">
              <FiMessageCircle className="text-white" />
            </div>
            <span className="font-medium">Main Chat</span>
            <span className="ml-auto text-xs bg-accent text-white px-2 py-1 rounded-full">3 new</span>
          </div>
          {/* Add more channels here */}
        </div>
      </div>

      <div className="chat-area">
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isUser ? 'user' : ''}`}>
              <p>{msg.text}</p>
              <span className="message-timestamp">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
          <div className="typing-indicator">
            <div className="typing-dot" style={{ animationDelay: '0s' }} />
            <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
            <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        <div className="input-container">
          <div className="relative">
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-accent">
              <FiSmile size={20} />
            </button>
            <input
              type="text"
              className="message-input pl-12"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="send-button">
              <FiSend className="text-white mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp; 