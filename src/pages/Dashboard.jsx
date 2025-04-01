import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiLogOut, FiUsers, FiMessageCircle, FiSun, FiMoon, FiAlertCircle, FiSearch, FiInfo } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Dashboard = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const { rooms, users, joinRoom, connected, connectionError } = useSocket();
  const navigate = useNavigate();

  // Check system preference for dark mode
  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateRoom = () => {
    if (!roomName.trim()) return;
    
    // Generate a random room ID
    const roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    joinRoom(roomId, roomName);
    navigate(`/chat/${roomId}`);
  };

  const handleJoinRoom = (roomId) => {
    joinRoom(roomId);
    navigate(`/chat/${roomId}`);
  };

  // Filter rooms based on search query
  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 bg-pattern relative">
      {/* Subtle background pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.02] pointer-events-none"></div>
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 sticky top-0 z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative">
              <FiMessageCircle className="text-primary-500 h-8 w-8 mr-3" />
              <div className="absolute inset-0 text-primary-500 h-8 w-8 mr-3 animate-ping opacity-30 rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-600">Chatter</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="btn-icon text-xl relative overflow-hidden group"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
              {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-600" />}
            </button>
            
            <div className="flex items-center">
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random`}
                alt={currentUser.username}
                className="avatar mr-2 ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 hover:scale-110 transition-transform duration-300"
                title={`${currentUser.username}'s profile picture`}
              />
              <span className="font-medium text-gray-900 dark:text-white">{currentUser.username}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 transform hover:-translate-y-1"
              title="Logout from your account"
            >
              <FiLogOut className="mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Connection Status */}
      {!connected && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
            <FiAlertCircle className="text-yellow-700 dark:text-yellow-500 mr-2 animate-pulse" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              {connectionError 
                ? `Connection error: ${connectionError}. Trying to reconnect...` 
                : "Connecting to server..."}
            </p>
          </div>
        </div>
      )}

      {/* Connection Debug Info (Only visible in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-100 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs">
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-primary">
                <strong>Connection:</strong> {connected ? 'Connected' : 'Disconnected'}
              </span>
              <span className="badge badge-primary">
                <strong>Server:</strong> http://localhost:3001
              </span>
              <span className="badge badge-primary">
                <strong>Users:</strong> {users.length}
              </span>
              <span className="badge badge-primary">
                <strong>Rooms:</strong> {rooms.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Rooms section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="inline-block mr-3 p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <FiMessageCircle className="text-primary-500" />
                </span>
                Chat Rooms
              </h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
                    title="Search for chat rooms"
                  />
                </div>
                
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="btn-primary flex items-center text-sm w-full sm:w-auto justify-center shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-1"
                  disabled={!connected}
                  title="Create a new chat room"
                >
                  <FiPlus className="mr-1" />
                  Create Room
                </button>
              </div>
            </div>
            
            {/* Create room modal */}
            {showCreateRoom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowCreateRoom(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-lg bg-white/90 dark:bg-gray-800/90"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-500 text-white p-4 rounded-full shadow-lg">
                      <FiPlus className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-center mt-2">
                    Create New Room
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="input-field focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
                      placeholder="Enter room name"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateRoom(false)}
                      className="btn-secondary hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      className="btn-primary shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-1"
                      disabled={!roomName.trim() || !connected}
                    >
                      Create
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredRooms && filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    variants={itemVariants}
                    className="card hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-300 overflow-hidden border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="p-5 relative">
                      {/* Decorative element */}
                      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary-500 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{room.name}</h3>
                        <span className="badge badge-success shadow-sm">
                          {room.users?.length || 0} active
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <FiUsers className="mr-1" />
                        <div className="flex -space-x-2 overflow-hidden">
                          {(room.users || []).slice(0, 3).map((user, idx) => (
                            <img 
                              key={idx} 
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800" 
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`} 
                              alt={user.username} 
                            />
                          ))}
                          {(room.users || []).length > 3 && (
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800">
                              +{(room.users || []).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(room.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                        <button className="text-primary-500 hover:text-primary-700 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          Join Room <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 text-center text-gray-500 dark:text-gray-400 shadow-md border border-gray-200 dark:border-gray-700">
                  {!connected ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-t-4 border-b-4 border-primary-500 rounded-full animate-spin mb-4"></div>
                      <p>Connecting to server...</p>
                    </div>
                  ) : searchQuery ? (
                    <div className="flex flex-col items-center">
                      <FiSearch className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2">No rooms found matching "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-primary-500 hover:text-primary-700 font-medium hover:underline"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FiMessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-4">No chat rooms available yet.</p>
                      <button
                        onClick={() => setShowCreateRoom(true)}
                        className="btn-primary flex items-center shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <FiPlus className="mr-1" />
                        Create Your First Room
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Users section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="inline-block mr-3 p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                <FiUsers className="text-primary-500" />
              </span>
              Online Users
            </h2>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <div className="p-3 bg-gray-50/90 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  {users.length} {users.length === 1 ? 'User' : 'Users'} Online
                </span>
                <span className="flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  </span>
                </span>
              </div>
              {users && users.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                  {users.map((user) => (
                    <motion.li
                      key={user.id}
                      variants={itemVariants}
                      className="p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200"
                    >
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="h-10 w-10 rounded-full mr-3 border-2 border-white dark:border-gray-800 shadow-sm hover:scale-110 transition-transform duration-300"
                        />
                        <span className="absolute bottom-0 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Online now</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                  {connected ? "No users online" : "Connecting to server..."}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 