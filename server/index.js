const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

// Store connected users and active rooms
const users = {};
const rooms = {};

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining with username
  socket.on('join_user', (userData) => {
    const { username, avatar } = userData;
    users[socket.id] = { 
      username, 
      avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random`,
      id: socket.id 
    };
    
    // Send the updated users list to all clients
    io.emit('users_update', Object.values(users));
    
    // Send existing rooms to the new user
    socket.emit('rooms_update', Object.values(rooms));
  });

  // Handle creating/joining a room
  socket.on('join_room', (roomData) => {
    const { roomId, username } = roomData;
    
    console.log(`${username} (${socket.id}) joining room: ${roomId}`);
    
    socket.join(roomId);
    
    // Create room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        name: roomData.roomName || `Room ${roomId}`,
        users: [],
        messages: []
      };
    }
    
    // Add user to room if not already there
    if (!rooms[roomId].users.find(user => user.id === socket.id)) {
      rooms[roomId].users.push({
        id: socket.id,
        username: username
      });
    }
    
    // Send message history to the joining user
    if (rooms[roomId].messages.length > 0) {
      console.log(`Sending ${rooms[roomId].messages.length} message history to user ${socket.id}`);
      socket.emit('message_history', {
        roomId,
        messages: rooms[roomId].messages
      });
    }
    
    // Notify room that user has joined
    io.to(roomId).emit('user_joined_room', {
      room: rooms[roomId],
      user: users[socket.id],
      message: `${username} has joined the room`
    });
    
    // Update rooms list for all users
    io.emit('rooms_update', Object.values(rooms));
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const { roomId, message, text, timestamp, id } = messageData;
    
    console.log(`Received message for room ${roomId}:`, messageData);
    
    if (rooms[roomId]) {
      const newMessage = {
        id: id || Date.now().toString(),
        userId: socket.id,
        user: users[socket.id],
        text: text || message,
        timestamp: timestamp || new Date().toISOString(),
        roomId: roomId
      };
      
      // Add message to room history
      rooms[roomId].messages.push(newMessage);
      
      console.log(`Broadcasting message to room ${roomId}:`, newMessage);
      
      // Send message to all users in the room
      io.to(roomId).emit('receive_message', newMessage);
    } else {
      console.error(`Message sent to non-existent room: ${roomId}`);
      // Let the sender know there was an error
      socket.emit('message_error', { 
        error: 'Room does not exist', 
        roomId 
      });
    }
  });

  // Handle user typing indicator
  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('user_typing', {
      user: users[socket.id],
      isTyping
    });
  });

  // Handle leaving a room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    
    if (rooms[roomId]) {
      // Remove user from room
      rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);
      
      // Notify room that user has left
      io.to(roomId).emit('user_left_room', {
        room: rooms[roomId],
        user: users[socket.id],
        message: `${users[socket.id]?.username} has left the room`
      });
      
      // Delete room if empty
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      }
      
      // Update rooms list for all users
      io.emit('rooms_update', Object.values(rooms));
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Leave all rooms the user was in
    for (const roomId in rooms) {
      if (rooms[roomId].users.find(user => user.id === socket.id)) {
        // Remove user from room
        rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);
        
        // Notify room that user has left
        io.to(roomId).emit('user_left_room', {
          room: rooms[roomId],
          user: users[socket.id],
          message: `${users[socket.id]?.username} has left the room`
        });
        
        // Delete room if empty
        if (rooms[roomId].users.length === 0) {
          delete rooms[roomId];
        }
      }
    }
    
    // Remove user from users list
    delete users[socket.id];
    
    // Update users and rooms lists
    io.emit('users_update', Object.values(users));
    io.emit('rooms_update', Object.values(rooms));
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('Chat App Server is running!');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 