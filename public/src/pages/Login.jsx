import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  // Define a storage key with fallback
  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "chat-app-current-user";
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };
  
  useEffect(() => {
    // Check if user is already logged in
    console.log("Using storage key:", storageKey);
    if (localStorage.getItem(storageKey)) {
      navigate("/");
    }
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    // Always return true to bypass validation
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { username, password } = values;
      
      // Show a message for debugging
      toast.info(`Attempting to log in with username: ${username}`, toastOptions);
      console.log("Login: Using storage key:", storageKey);
      
      // Make the request to the server
      const { data } = await axios.post(loginRoute, {
        username,
        password,
      });
      
      // Log response to console for debugging
      console.log("Login response:", data);
      
      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      
      if (data.status === true) {
        // Log user data for debugging
        console.log("User data to store:", data.user);
        console.log("User has avatar set:", data.user.isAvatarImageSet);
        
        // Store user in localStorage with fallback key
        localStorage.setItem(
          storageKey,
          JSON.stringify(data.user)
        );
        
        console.log("User data stored in localStorage");
        
        // Show success message
        toast.success("Login successful!", toastOptions);
        
        // Delay navigation slightly to allow toast to show
        setTimeout(() => {
          if (data.user.isAvatarImageSet) {
            console.log("Login: User has avatar, navigating to chat");
            navigate("/");
          } else {
            console.log("Login: User needs avatar, navigating to avatar selection");
            navigate("/setAvatar");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Show more detailed error information
      if (error.response) {
        toast.error(`Server error: ${error.response.data.message || "Unknown error"}`, toastOptions);
      } else if (error.request) {
        toast.error("No response from server. Check if the server is running.", toastOptions);
      } else {
        toast.error(`Error: ${error.message}`, toastOptions);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-primary-800 mb-2">Mbot</h2>
          <p className="text-gray-600">Welcome back! Sign in to your account</p>
          <p className="text-xs text-amber-600 mt-1">Dev mode: Authentication bypassed - any credentials work</p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                required
                className="input-field mt-1"
                placeholder="Enter your username"
                onChange={handleChange}
                min="3"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                className="input-field mt-1"
                placeholder="Enter your password"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex justify-center"
          >
            Sign In
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Create one
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
