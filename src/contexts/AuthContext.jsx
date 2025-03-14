import { createContext, useState, useContext, useEffect } from 'react';

// Mock users database for demo purposes
const DEMO_USERS = [
  {
    id: 'user1',
    username: 'maaz',
    password: 'password123',
    email: 'alice@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Alice&background=random'
  },
  {
    id: 'user2',
    username: 'ali',
    password: 'password123',
    email: 'bob@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Bob&background=random'
  }
];

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = ({ username, password }) => {
    // Reset any previous errors
    setAuthError(null);
    
    // For demonstration, check against mock users or accept any username
    const foundUser = DEMO_USERS.find(
      user => user.username.toLowerCase() === username.toLowerCase() && 
              user.password === password
    );
    
    if (foundUser) {
      // Use the predefined user if found
      const userData = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        avatar: foundUser.avatar,
      };
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } else if (password === 'password123') {
      // If user not in mock DB but using the demo password, create a new user
      const userData = {
        id: `user_${Date.now()}`,
        username,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`
      };
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } else {
      // Authentication failed
      setAuthError('Invalid username or password. Try using "password123"');
      return { 
        success: false, 
        error: 'Invalid username or password. Try using "password123"' 
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const register = ({ username, email, password }) => {
    // Reset any previous errors
    setAuthError(null);
    
    // Check if username already exists
    if (DEMO_USERS.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      setAuthError('Username already exists. Try a different one or use the demo accounts.');
      return { 
        success: false, 
        error: 'Username already exists. Try a different one or use the demo accounts.' 
      };
    }
    
    // In a real app, we would send registration data to the server
    // For demo, we'll just create a user
    const userData = {
      id: `user_${Date.now()}`,
      username,
      email,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`
    };
    
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { success: true };
  };

  const value = {
    currentUser,
    authError,
    login,
    logout,
    register,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 