import React, { useEffect, useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";

export default function SetAvatar() {
  const api = `https://api.multiavatar.com`;
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "chat-app-current-user";
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  useEffect(() => {
    console.log("SetAvatar: Checking localStorage with key:", storageKey);
    const userData = localStorage.getItem(storageKey);
    if (!userData) {
      console.log("SetAvatar: No user data found, redirecting to login");
      navigate("/login");
    } else {
      console.log("SetAvatar: User data found:", JSON.parse(userData));
    }
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      try {
        console.log("SetAvatar: Setting profile picture with selected avatar index:", selectedAvatar);
        const userData = localStorage.getItem(storageKey);
        
        if (!userData) {
          console.error("SetAvatar: No user data found in localStorage");
          toast.error("Your session has expired. Please login again.", toastOptions);
          navigate("/login");
          return;
        }
        
        console.log("SetAvatar: User data from localStorage:", userData);
        let user;
        
        try {
          user = JSON.parse(userData);
        } catch (error) {
          console.error("SetAvatar: Failed to parse user data:", error);
          toast.error("Invalid user data. Please login again.", toastOptions);
          navigate("/login");
          return;
        }
        
        if (!user._id) {
          console.error("SetAvatar: User ID is missing in user data");
          toast.error("User ID is missing. Please login again.", toastOptions);
          navigate("/login");
          return;
        }

        console.log("SetAvatar: Sending request to:", `${setAvatarRoute}/${user._id}`);
        
        // Add timeout to the request to prevent long hanging requests
        const { data } = await axios.post(
          `${setAvatarRoute}/${user._id}`, 
          { image: avatars[selectedAvatar] },
          { timeout: 10000 }
        );

        console.log("SetAvatar: Server response:", data);
        if (data.isSet) {
          user.isAvatarImageSet = true;
          user.avatarImage = data.image;
          console.log("SetAvatar: Updated user data:", user);
          localStorage.setItem(
            storageKey,
            JSON.stringify(user)
          );
          console.log("SetAvatar: Redirecting to chat");
          navigate("/");
        } else {
          toast.error("Error setting avatar. Please try again.", toastOptions);
        }
      } catch (error) {
        console.error("SetAvatar: Error setting profile picture:", error);
        
        // More detailed error handling
        if (error.response) {
          toast.error(`Server error: ${error.response.data?.message || "Unknown error"}`, toastOptions);
        } else if (error.request) {
          toast.error("Server did not respond. Please check your internet connection.", toastOptions);
        } else {
          toast.error(`Error: ${error.message}`, toastOptions);
        }
      }
    }
  };

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        console.log("SetAvatar: Fetching avatars");
        const data = [];
        
        const avatarSeeds = Array.from({ length: 4 }, () => 
          Math.floor(Math.random() * 10000).toString()
        );
        
        console.log("SetAvatar: Using seeds:", avatarSeeds);
        
        for (const seed of avatarSeeds) {
          try {
            const image = await axios.get(`${api}/${seed}`);
            const buffer = Buffer.from(image.data);
            data.push(buffer.toString("base64"));
          } catch (error) {
            console.error(`SetAvatar: Error fetching avatar with seed ${seed}:`, error);
            toast.error(`Failed to load one avatar. Using fallback.`, toastOptions);
            data.push("PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJncmF5IiAvPjwvc3ZnPg==");
          }
        }
        
        console.log("SetAvatar: Avatars fetched successfully");
        if (data.length > 0) {
          setAvatars(data);
          setIsLoading(false);
        } else {
          toast.error("Failed to load any avatars. Please try again later.", toastOptions);
        }
      } catch (error) {
        console.error("SetAvatar: Error in avatar fetching process:", error);
        toast.error("Failed to load avatars. Please try again.", toastOptions);
        setIsLoading(false);
      }
    };
    
    fetchAvatars();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      {isLoading ? (
        <div className="text-center">
          <img src={loader} alt="loader" className="w-24 h-24 mx-auto" />
          <p className="text-gray-600 mt-4">Loading avatars...</p>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Choose your Mbot avatar
            </h1>
            <p className="text-gray-600 mt-2">
              Select an avatar for your profile
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            {avatars.map((avatar, index) => {
              return (
                <div
                  key={index}
                  className={`cursor-pointer p-2 rounded-full transition-all duration-300 ${
                    selectedAvatar === index 
                      ? "border-4 border-primary-600" 
                      : "border-4 border-transparent hover:border-primary-200"
                  }`}
                  onClick={() => setSelectedAvatar(index)}
                >
                  <img
                    src={`data:image/svg+xml;base64,${avatar}`}
                    alt={`Avatar ${index}`}
                    className="w-16 h-16"
                  />
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={setProfilePicture} 
            className="btn-primary w-full py-3"
          >
            Set as Profile Picture
          </button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
