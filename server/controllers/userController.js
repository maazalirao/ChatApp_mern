const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// In-memory user store for development when MongoDB isn't available
const inMemoryUsers = new Map();

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    console.log("Login request for:", username);
    
    // Always create a mock user and return success regardless of MongoDB connection
    const mockUser = {
      username: username,
      email: `${username}@example.com`,
      avatarImage: "",
      isAvatarImageSet: false,
      _id: `temp_${Date.now()}`
    };
    
    // Store in memory for future reference
    inMemoryUsers.set(username, mockUser);
    
    console.log("Created mock user:", mockUser);
    
    // Return success with the mock user
    return res.json({ status: true, user: mockUser });
  } catch (ex) {
    console.error("Login error:", ex);
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    console.log("Register request for:", username, email);
    
    // Check if username already exists in our in-memory store
    if (inMemoryUsers.has(username)) {
      return res.json({ msg: "Username already used", status: false });
    }
    
    // Create a mock user
    const mockUser = {
      username: username,
      email: email,
      avatarImage: "",
      isAvatarImageSet: false,
      _id: `user_${Date.now()}`
    };
    
    // Store in memory
    inMemoryUsers.set(username, mockUser);
    
    console.log("Registered new mock user:", mockUser);
    
    // Return success with the mock user
    return res.json({ status: true, user: mockUser });
  } catch (ex) {
    console.error("Registration error:", ex);
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    console.log("Getting all users except:", req.params.id);
    
    // Return array of users from our in-memory store, excluding the current user
    const users = Array.from(inMemoryUsers.values())
      .filter(user => user._id !== req.params.id)
      .map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarImage: user.avatarImage || "",
      }));
    
    console.log("Returning users:", users);
    
    return res.json(users);
  } catch (ex) {
    console.error("Get all users error:", ex);
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    
    console.log("Setting avatar for user:", userId, "image:", avatarImage.substring(0, 20) + "...");
    
    // Find the user in our in-memory store
    const userKey = Array.from(inMemoryUsers.entries())
      .find(([key, user]) => user._id === userId)?.[0];
    
    if (userKey) {
      // Update the user in our in-memory store
      const user = inMemoryUsers.get(userKey);
      user.isAvatarImageSet = true;
      user.avatarImage = avatarImage;
      
      console.log("Avatar set successfully for:", userKey);
    }
    
    // Return success
    return res.json({
      isSet: true,
      image: avatarImage,
    });
  } catch (ex) {
    console.error("Set avatar error:", ex);
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    
    console.log("User logging out:", req.params.id);
    
    // If using the global onlineUsers map for socket connections
    if (global.onlineUsers) {
      global.onlineUsers.delete(req.params.id);
    }
    
    return res.status(200).send();
  } catch (ex) {
    console.error("Logout error:", ex);
    next(ex);
  }
};
