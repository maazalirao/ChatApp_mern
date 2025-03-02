import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmileFill } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiPickerHideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event, emojiObject) => {
    let message = msg;
    message += emojiObject.emoji;
    setMsg(message);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <div className="relative">
      <div className={`absolute bottom-full mb-2 ${showEmojiPicker ? 'block' : 'hidden'}`}>
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </div>
      
      <form onSubmit={sendChat} className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={handleEmojiPickerHideShow}
          >
            <BsEmojiSmileFill className="text-xl" />
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Type your message here..."
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
          className="flex-1 input-field"
        />
        
        <button
          type="submit"
          className="btn-primary px-6 py-2 flex items-center gap-2"
        >
          <span>Send</span>
          <IoMdSend />
        </button>
      </form>
    </div>
  );
}
