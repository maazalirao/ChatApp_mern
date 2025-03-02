import React from "react";
import Robot from "../assets/robot.gif";

export default function Welcome() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50">
      <img src={Robot} alt="Robot" className="h-80 mb-8" />
      <h1 className="text-4xl font-bold text-primary-800 mb-2">
        Welcome to Mbot
      </h1>
      <p className="text-gray-600">
        Please select a chat to start messaging
      </p>
    </div>
  );
}
