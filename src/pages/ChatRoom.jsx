import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [roomMessages, setRoomMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  // Animation variants for messages
  const bubbleVariants = {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 }
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

  // Add emoji to message
  const addEmoji = (emoji) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
  };
  
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
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
      </header>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {roomMessages.map((msg, index) => (
          <motion.div
            key={index}
            variants={bubbleVariants}
            whileTap="tap"
            whileHover="hover"
            className="mb-4"
          >
            <div className="bg-blue-500 text-white p-3 rounded-lg inline-block">
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>
      
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
        
        <form className="flex" onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            setRoomMessages([...roomMessages, { text: message }]);
            setMessage('');
          }
        }}>
          <input
            id="message-input"
            type="text"
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setMessage(e.target.value);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 p-2 border dark:border-gray-600 dark:bg-gray-800 rounded-l"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className={`p-2 rounded-r ${message.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'} text-white`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
