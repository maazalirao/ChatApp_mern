import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMessageSquare, FiLogIn, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // In a real app, we would validate with a server
      // For demo purposes, we'll just simulate a login
      setTimeout(() => {
        const result = login({ username, password });
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Invalid credentials');
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  // Animation variants
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
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }}
            className="flex justify-center mb-6"
          >
            <div className="h-20 w-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center shadow-lg">
              <FiMessageSquare size={48} className="text-primary-500 dark:text-primary-400" />
            </div>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Welcome to Chatter
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Log in to connect with friends
          </motion.p>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" 
          className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 border border-gray-100 dark:border-gray-700"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-6"
            >
              <FiAlertCircle className="flex-shrink-0 text-red-500 dark:text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <motion.div 
              variants={itemVariants}
              className="mb-6"
            >
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  <FiUser />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter your username"
                />
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mb-6"
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  <FiLock />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>
            
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FiLogIn className="mr-2" />
              )}
              {isLoading ? 'Logging in...' : 'Log In'}
            </motion.button>
          </form>
          
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center text-sm"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <p>© 2023 Chatter. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 