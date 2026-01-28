# Campus Gigs Chat System - Development & Behavior Guide

This document captures the architecture, behavioral rules, and source code of the Campus Gigs Chat System (v2.0).

---

## 🧠 System Behavior & Implementation Rules

### 1. Auto-Scroll Logic
**Strict Rule**: We do NOT use generic auto-scroll on every render.
-   **Initial Load**: The chat snaps instantly to the bottom using `useLayoutEffect`. Users do *not* see a scrolling animation.
-   **New Message**: Auto-scroll triggers *only* when:
    1.  A new message arrives via Socket.IO.
    2.  AND the user is already near the bottom (within 150px) OR the user is the sender.
-   **Manual Navigation**: If a user scrolls up to read history, incoming messages will NOT force-scroll them down.

### 2. Media Upload Flow
**Strict Rule**: No "fire and forget". Media is part of the message lifecycle.
1.  **Selection**: User selects an image. It is *not* uploaded yet.
2.  **Preview**: A local preview (`URL.createObjectURL`) is shown above the input box.
3.  **Sending**:
    -   When "Send" is clicked, we *first* upload the file (`POST /api/chat/upload`).
    -   On success, we get the file `path`.
    -   *Then* we create the message with `{ content, attachment: { path } }`.
    -   This ensures no "ghost" images exist without messages.

### 3. Emoji Support
-   **Insertion**: Emojis are inserted at the **current cursor position**, not just appended to the end.
-   **Focus**: The input field retains focus after insertion, allowing continuous typing.
-   **Keyboard**: `Enter` sends the message; `Shift+Enter` adds a new line.

### 4. Component Responsibility
-   **`ChatPanel.jsx`**: **Single Source of Truth**. Handles *all* logic (sockets, state, API calls).
-   **`ChatDialog.jsx`**: **Wrapper Only**. It purely renders `ChatPanel` inside a Radix UI Dialog. It contains *zero* chat logic.

### 5. Attachment Rendering
-   **Images**: Rendered inline with `max-width: 200px`.
-   **Interaction**: All images are wrapped in `<a>` tags. Clicking them opens the full-resolution version in a new tab.
-   **Validation**: Frontend limits files to 5MB (Image only). Backend validates via `Multer`.

---

## 🏗️ Backend Architecture

### 1. File Upload Middleware (`src/middleware/upload.js`)
Configures Multer for handling image uploads.
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-random-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
```

### 2. Conversation Model (`src/models/Conversation.js`)
Defines the chat container (Job or Direct).
```javascript
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    type: {
        type: String,
        enum: ['JOB', 'DIRECT'],
        default: 'DIRECT'
    },
    // For Job chats, we link strictly to the Job to ensure 1-to-1 mapping per job
    contextId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: function () { return this.type === 'JOB'; }
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageContent: { type: String }, // Cache for faster preview
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true // Gives us createdAt and updatedAt (for sorting)
});

// Index for fast lookup of my conversations
ConversationSchema.index({ participants: 1, updatedAt: -1 });
ConversationSchema.index({ contextId: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
```

### 3. Message Model (`src/models/Message.js`)
Defines individual messages with attachment support.
```javascript
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    // ... readBy ...
    attachment: {
        path: { type: String }, // URL/Path to file
        type: { type: String, enum: ['image', 'file'], default: 'image' },
        originalName: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
```

---

## 🎨 Frontend Implementation

### 1. Chat Panel (`src/components/Jobs/ChatPanel.jsx`)
The core logic implementation.

```javascript
/* Key Logic Highlights */

// 1. Auto-Scroll Logic
useLayoutEffect(() => {
    if (!containerRef.current || messages.length === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // Check if user is near bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    const last = messages[messages.length - 1];
    const isMine = last?.sender?._id === user._id;

    // Instant snap on first load
    if (isFirstLoadRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); // Or direct scrollTop manipulation
        isFirstLoadRef.current = false;
    } 
    // Smooth scroll only if following flow
    else if (isNearBottom || isMine) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
}, [messages, user._id]);

// 2. Media Handling
const handleSend = async (e) => {
    if (e) e.preventDefault();
    
    // Upload FIRST
    if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await chatAPI.uploadAttachment(formData);
        attachment = { path: res.data.path, type: 'image' };
    }

    // Then Send
    await chatAPI.sendConversationMessage(activeConversation._id, newMessage, attachment);
};

// 3. Emoji Insertion
const handleEmojiClick = (emoji) => {
    const cursor = textareaRef.current.selectionStart;
    const text = newMessage.slice(0, cursor) + emoji.emoji + newMessage.slice(cursor);
    setNewMessage(text);
    // Restore cursor position
    requestAnimationFrame(() => {
        textareaRef.current.selectionStart = cursor + emoji.emoji.length;
        textareaRef.current.focus();
    });
};
```
