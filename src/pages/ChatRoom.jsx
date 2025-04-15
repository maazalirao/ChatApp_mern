import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChatRoom = () => {
  const [message, setMessage] = useState('');
  const [roomMessages, setRoomMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  // Animation variants for messages
  const bubbleVariants = {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 }
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
        <form className="flex" onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            setRoomMessages([...roomMessages, { text: message }]);
            setMessage('');
          }
        }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
