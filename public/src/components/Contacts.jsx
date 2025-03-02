import React, { useState, useEffect } from "react";

export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    setCurrentUserName(data.username);
  }, []);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-primary-800">Mbot Chats</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact, index) => {
          return (
            <div
              key={contact._id}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 
                ${index === currentSelected ? "bg-primary-50" : ""}`}
              onClick={() => changeCurrentChat(index, contact)}
            >
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {contact.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {contact.username}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {currentUserName ? currentUserName[0].toUpperCase() : ""}
            </span>
          </div>
          <span className="font-medium text-gray-900">
            {currentUserName}
          </span>
        </div>
      </div>
    </div>
  );
}
