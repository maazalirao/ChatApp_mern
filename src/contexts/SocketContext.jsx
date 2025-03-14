import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [connectionError, setConnectionError] = useState(null);
  
  const { currentUser, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('Attempting to connect to socket server...');
    
    // Using a try-catch to handle any connection errors
    try {
      const socketInstance = io('http://localhost:3001', {
        transports: ['websocket', 'polling'], // Try WebSocket first, then fall back to polling
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000 // Increase timeout
      });
      
      setSocket(socketInstance);

      // Socket event listeners
      socketInstance.on('connect', () => {
        setConnected(true);
        setConnectionError(null);
        console.log('Connected to server with ID:', socketInstance.id);
        
        // Join as a user with username
        socketInstance.emit('join_user', {
          username: currentUser.username,
          avatar: currentUser.avatar
        });
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setConnectionError(err.message);
        setConnected(false);
      });

      socketInstance.on('connect_timeout', () => {
        console.error('Connection timeout');
        setConnectionError('Connection timeout');
        setConnected(false);
      });

      socketInstance.on('disconnect', (reason) => {
        setConnected(false);
        console.log('Disconnected from server. Reason:', reason);
      });

      socketInstance.on('users_update', (updatedUsers) => {
        console.log('Received users update:', updatedUsers);
        setUsers(updatedUsers);
      });

      socketInstance.on('rooms_update', (updatedRooms) => {
        console.log('Received rooms update:', updatedRooms);
        setRooms(updatedRooms);
      });

      // Handle receiving messages
      socketInstance.on('receive_message', (newMessage) => {
        console.log('Received new message:', newMessage);
        
        // Ensure we have the roomId for organization
        if (!newMessage.roomId && activeRoom) {
          newMessage.roomId = activeRoom;
        }
        
        setMessages(prev => {
          // Get current messages for this room, or empty array if none
          const roomMessages = prev[newMessage.roomId] || [];
          
          // Avoid duplicate messages (check by id)
          if (roomMessages.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          
          // Return updated messages with new message added to the room
          return {
            ...prev,
            [newMessage.roomId]: [...roomMessages, newMessage]
          };
        });
      });

      // Handle user joined room notifications
      socketInstance.on('user_joined_room', (data) => {
        console.log('User joined room:', data);
        // You could display a notification or update room users here
      });
      
      // Handle user left room notifications
      socketInstance.on('user_left_room', (data) => {
        console.log('User left room:', data);
        // You could display a notification or update room users here
      });

      socketInstance.on('user_typing', ({ user, isTyping, roomId }) => {
        if (!roomId) return;
        
        setTypingUsers(prev => {
          if (isTyping) {
            // Ensure no duplicates
            const currentTypers = prev[roomId] || [];
            if (currentTypers.some(u => u.id === user.id)) {
              return prev;
            }
            return { ...prev, [roomId]: [...currentTypers, user] };
          } else {
            return { 
              ...prev, 
              [roomId]: (prev[roomId] || []).filter(u => u.id !== user.id)
            };
          }
        });
      });

      // Handle message history when joining a room
      socketInstance.on('message_history', ({ roomId, messages }) => {
        console.log(`Received message history for room ${roomId}: ${messages.length} messages`);
        
        if (!roomId || !messages || !messages.length) return;
        
        // Update messages state with history
        setMessages(prev => {
          // Skip if we already have messages for this room (avoid duplicates)
          if (prev[roomId] && prev[roomId].length > 0) {
            return prev;
          }
          
          return {
            ...prev,
            [roomId]: messages
          };
        });
      });

      // Cleanup on unmount
      return () => {
        console.log('Cleaning up socket connection');
        socketInstance.disconnect();
      };
    } catch (err) {
      console.error('Error initializing socket:', err);
      setConnectionError(err.message);
    }
  }, [isAuthenticated, currentUser]);

  // Functions to interact with the socket
  const joinRoom = (roomId, roomName = '') => {
    if (!socket || !connected) {
      console.warn('Cannot join room - socket not connected');
      return;
    }
    
    console.log(`Joining room: ${roomId} with name: ${roomName}`);
    socket.emit('join_room', {
      roomId,
      roomName,
      username: currentUser.username
    });
    
    setActiveRoom(roomId);
  };

  const leaveRoom = (roomId) => {
    if (!socket || !connected) {
      console.warn('Cannot leave room - socket not connected');
      return;
    }
    
    console.log(`Leaving room: ${roomId}`);
    socket.emit('leave_room', roomId);
    
    if (activeRoom === roomId) {
      setActiveRoom(null);
    }
  };

  const sendMessage = (roomId, message) => {
    if (!socket || !connected) {
      console.warn('Cannot send message - socket not connected');
      return;
    }
    
    if (!roomId) {
      console.error('Cannot send message - no roomId provided');
      return;
    }
    
    const timestamp = new Date().toISOString();
    const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const messageData = {
      id: messageId,
      roomId,
      message,
      timestamp
    };
    
    console.log(`Sending message to room ${roomId}:`, messageData);
    
    // Optimistically add the message to our local state
    const newMessage = {
      id: messageId,
      roomId,
      text: message,
      timestamp,
      sender: {
        id: socket.id,
        username: currentUser.username,
        avatar: currentUser.avatar
      }
    };
    
    // Add to local messages immediately (optimistic update)
    setMessages(prev => {
      const roomMessages = prev[roomId] || [];
      return {
        ...prev,
        [roomId]: [...roomMessages, newMessage]
      };
    });
    
    // Then send to server
    socket.emit('send_message', messageData);
  };

  const sendTypingStatus = (roomId, isTyping) => {
    if (!socket || !connected) {
      console.warn('Cannot send typing status - socket not connected');
      return;
    }
    
    if (!roomId) {
      console.warn('Cannot send typing status - no roomId provided');
      return;
    }
    
    socket.emit('typing', {
      roomId,
      isTyping
    });
  };

  const value = {
    socket,
    connected,
    connectionError,
    users,
    rooms,
    activeRoom,
    messages,
    typingUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTypingStatus,
    setActiveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 