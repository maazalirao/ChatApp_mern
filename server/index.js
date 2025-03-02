const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Set up in-memory fallback data for development
const inMemoryUsers = new Map();
const inMemoryMessages = new Map();

// Initialize MongoDB connection with error handling
let dbConnected = false;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
    dbConnected = true;
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err.message);
    console.log("Using in-memory fallback data instead");
  });

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful", dbConnected });
});

// Middleware to handle MongoDB connection issues
app.use((req, res, next) => {
  // Add flag to indicate if MongoDB is connected
  req.dbConnected = dbConnected;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log('='.repeat(50));
  console.log(`SERVER RUNNING ON PORT ${process.env.PORT}`);
  console.log(`MongoDB Connection: ${dbConnected ? 'SUCCESSFUL' : 'FAILED - Using In-Memory Storage'}`);
  console.log(`API available at: http://localhost:${process.env.PORT}`);
  console.log('='.repeat(50));
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
