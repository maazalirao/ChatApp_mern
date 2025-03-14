# Chatter - Modern Chat Application

A beautiful, sleek and real-time chat application built with React, Node.js, and Socket.IO.

![Chatter Application](https://ui-avatars.com/api/?name=Chatter&background=random&size=250&bold=true)

## Features

- 🔐 User authentication system (simulated for demo)
- 💬 Real-time messaging with Socket.IO
- 📝 Typing indicators
- 👥 User presence (online status)
- 🏠 Create and join chat rooms
- 🌙 Dark mode support
- 📱 Responsive design for all devices
- ✨ Beautiful UI with animations
- 🚀 Fast and optimized performance

## Tech Stack

- **Frontend**:
  - React 19 (latest version)
  - React Router Dom
  - Framer Motion for animations
  - TailwindCSS for styling
  - Socket.IO Client

- **Backend**:
  - Node.js with Express
  - Socket.IO for real-time communication

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation


   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd server
   npm install
   cd ..
   ```

### Running the Application

1. Start the backend server:
   ```
   npm run server
   ```

2. In a new terminal, start the frontend development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

1. Register a new account (for demo purposes, this doesn't actually create a server-side account)
2. Log in with your username
3. Create a new chat room or join an existing one
4. Start chatting in real-time!

## Project Structure

```
chat-app-react-nodejs/
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth, Socket)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Main application pages
│   └── utils/            # Utility functions
├── server/               # Backend source code
│   ├── index.js          # Main server file
│   └── package.json      # Server dependencies
└── README.md             # Project documentation
```

## Future Enhancements

- Add persistent message history with a database
- Implement user authentication with JWT
- Add file/image sharing capabilities
- Add voice/video calling features
- Implement message reactions and replies
- Add group chat moderation features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React Icons](https://react-icons.github.io/react-icons/)
- [TailwindCSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)
