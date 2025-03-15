import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as React from 'react';
import { motion } from 'framer-motion';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatRoom from './pages/ChatRoom';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Debug component for development
const DebugPanel = ({ show, toggleShow }) => {
  if (!show) {
    return (
      <button
        onClick={toggleShow}
        className="fixed right-4 bottom-4 bg-gray-800 text-white p-2 rounded-full z-50 opacity-70 hover:opacity-100"
      >
        Debug
      </button>
    );
  }
  
  return (
    <div className="fixed right-4 bottom-4 bg-gray-800 text-white p-4 rounded-lg z-50 w-80 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <button onClick={toggleShow} className="text-white">×</button>
      </div>
      <div className="text-xs space-y-1">
        <div>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
        <div>
          <strong>Socket Server:</strong> http://localhost:3001
        </div>
        <div>
          <strong>React Version:</strong> {React.version}
        </div>
        
        <div className="mt-2 bg-gray-700 p-2 rounded">
          <p className="font-bold">Demo Accounts:</p>
          <ul className="mt-1 space-y-1">
            <li>Username: alice / Password: password123</li>
            <li>Username: bob / Password: password123</li>
            <li>Or create any account with password: password123</li>
          </ul>
        </div>
        
        <div className="mt-2">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs w-full"
          >
            Clear Storage & Reload
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading Chatter...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat/:roomId" element={<ChatRoom />} />
              <Route path="/" element={
                <Navigate to="/dashboard" />
              } />
            </Routes>
            
            {process.env.NODE_ENV === 'development' && (
              <DebugPanel 
                show={showDebug} 
                toggleShow={() => setShowDebug(!showDebug)} 
              />
            )}
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
