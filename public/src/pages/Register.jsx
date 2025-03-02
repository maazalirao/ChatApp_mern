import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";

export default function Register() {
  const navigate = useNavigate();
  // Define a storage key with fallback
  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "chat-app-current-user";
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password !== confirmPassword) {
      toast.error(
        "Password and confirm password should be same.",
        toastOptions
      );
      return false;
    } else if (username.length < 3) {
      toast.error(
        "Username should be greater than 3 characters.",
        toastOptions
      );
      return false;
    } else if (password.length < 8) {
      toast.error(
        "Password should be equal or greater than 8 characters.",
        toastOptions
      );
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (handleValidation()) {
        const { email, username, password } = values;
        
        // Show a message for debugging
        toast.info(`Attempting to register user: ${username}`, toastOptions);
        
        const { data } = await axios.post(registerRoute, {
          username,
          email,
          password,
        });
        
        // Log response to console for debugging
        console.log("Registration response:", data);

        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        }
        
        if (data.status === true) {
          // Store user in localStorage
          localStorage.setItem(
            storageKey,
            JSON.stringify(data.user)
          );
          
          // Show success message
          toast.success("Registration successful!", toastOptions);
          
          // Delay navigation slightly to allow toast to show
          setTimeout(() => {
            navigate("/setAvatar");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      
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
          <p className="text-gray-600">Create your account</p>
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
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="input-field mt-1"
                placeholder="Enter your email"
                onChange={handleChange}
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
                placeholder="Create a password"
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                required
                className="input-field mt-1"
                placeholder="Confirm your password"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex justify-center"
          >
            Create Account
          </button>
          
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
