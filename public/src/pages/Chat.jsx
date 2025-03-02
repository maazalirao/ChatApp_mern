import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  // Define a storage key with fallback
  const storageKey = process.env.REACT_APP_LOCALHOST_KEY || "chat-app-current-user";
  
  useEffect(() => {
    console.log("Chat component: Checking if user is logged in");
    if (!localStorage.getItem(storageKey)) {
      console.log("Chat component: No user found in localStorage, redirecting to login");
      navigate("/login");
    } else {
      const user = JSON.parse(localStorage.getItem(storageKey));
      console.log("Chat component: User found in localStorage:", user);
      
      // Check if user has avatar set
      if (!user.isAvatarImageSet) {
        console.log("Chat component: User has no avatar set, redirecting to avatar page");
        navigate("/setAvatar");
      } else {
        setCurrentUser(user);
      }
    }
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      console.log("Chat component: Connecting socket for user:", currentUser._id);
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            console.log("Chat component: Fetching contacts for user:", currentUser._id);
            const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            console.log("Chat component: Contacts fetched successfully:", data.data);
            setContacts(data.data);
          } catch (error) {
            console.error("Chat component: Error fetching contacts:", error);
          }
        } else {
          console.log("Chat component: Redirecting to avatar page");
          navigate("/setAvatar");
        }
      }
    };
    
    fetchContacts();
  }, [currentUser]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto h-screen py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg h-[85vh] overflow-hidden">
          <div className="grid grid-cols-4 h-full">
            <div className="col-span-1 border-r border-gray-200">
              <Contacts contacts={contacts} changeChat={handleChatChange} />
            </div>
            <div className="col-span-3">
              {currentChat === undefined ? (
                <Welcome />
              ) : (
                <ChatContainer currentChat={currentChat} socket={socket} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
