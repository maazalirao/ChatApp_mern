import { useState } from 'react'
import './App.css'
import ChatApp from './components/ChatApp'

function App() {
  return (
    <div className="h-screen w-screen" style={{
      background: 'linear-gradient(45deg, #4f46e5 0%, #2dd4bf 100%)',
      padding: '20px',
      display: 'flex'
    }}>
      <ChatApp />
    </div>
  )
}

export default App
