const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'src', 'pages', 'ChatRoom.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix duplicates
// Replace duplicate recording states at lines ~140-144
content = content.replace(
  /\/\/ Enhanced audio recording and playback state\s*\n\s*const \[isRecording, setIsRecording\] = useState\(false\);\s*\n\s*const \[audioBlob, setAudioBlob\] = useState\(null\);\s*\n\s*const \[recordingTime, setRecordingTime\] = useState\(0\);\s*\n\s*const \[mediaRecorder, setMediaRecorder\] = useState\(null\);\s*\n\s*const recordingTimerRef = useRef\(null\);/,
  '// Enhanced audio recording and playback state\n  const recordingTimerRef = useRef(null);'
);

// Replace duplicate renderReadReceipts around line 4532
content = content.replace(
  /\/\/ Function to render read receipts\s*\n\s*const renderReadReceipts = \(message\) => \{\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\}/s,
  '// Using existing renderReadReceipts function from line ~3083'
);

// Replace duplicate renderMessage (useCallback version) around line 4552
content = content.replace(
  /\/\/ Update message rendering to include read receipts\s*\n\s*const renderMessage = useCallback\(\(msg\) => \{.*?\}\);/s, 
  '// Using main renderMessage function'
);

// Replace duplicate markMessageAsRead around line 4749
content = content.replace(
  /\/\/ Updated function to mark a message as read\s*\n\s*const markMessageAsRead = \(messageId\) => \{\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\};/s,
  '// Using existing markMessageAsRead function from line ~2980'
);

// Replace duplicate handleReadReceipt around line 4765
content = content.replace(
  /\/\/ Handle incoming read receipts\s*\n\s*const handleReadReceipt = \(data\) => \{\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\s*\n.*?\};/s,
  '// Using existing handleReadReceipt function from line ~4512'
);

// Write the file back
fs.writeFileSync(filePath, content);

console.log('Successfully fixed duplicate declarations in ChatRoom.jsx'); 