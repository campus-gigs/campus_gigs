# Campus Gigs 🎓
> **The Safe, Verified Marketplace for Students.**

**Campus Gigs** is a full-stack MERN application designed to connect students for micro-jobs and tasks. It features real-time messaging, secure user authentication (verified .edu emails), and a robust job management system.

![Campus Gigs Dashboard Mockup](https://via.placeholder.com/800x400?text=Campus+Gigs+Dashboard+Preview)

---

## 🎨 UI/UX Design & Architecture

The User Interface is built with a "Mobile-First" philosophy, ensuring a seamless experience across all devices.

### Key Design Highlights:
*   **Responsive Dashboard Layout**: A complex flexbox layout (`DashboardLayout.jsx`) that adapts content containers based on context:
    *   **Chat Mode**: Strictly constrained height (`100dvh` & `h-full`) to prevent window scrolling and allow internal message scrolling.
    *   **Document Mode**: Natural height (`w-full`) for Profile/Admin pages to allow standard scrolling without footer overlap.
*   **Smart Sidebar**: A responsive navigation drawer that slides out on mobile but remains fixed on desktop. It converts `h-screen` to `h-full` to respect mobile browser address bars.
*   **Real-Time Interactions**: Optimistic UI updates in Chat ensure messages appear instantly while background socket events confirm delivery.
*   **Dark Mode Support**: Fully integrated dark theme using Tailwind's `dark:` classes and CSS variables.

---

## 🛠️ Technology Stack

### Frontend
*   **React 18**: Component-based UI library.
*   **Tailwind CSS**: Utility-first styling for rapid custom designs.
*   **Socket.io Client**: Real-time bi-directional event communication.
*   **Lucide React**: Modern, consistent icon set.
*   **Shadcn/UI (Concepts)**: Reusable UI components (Cards, Dialogs, Inputs) built on Radix primitives.

### Backend
*   **Node.js & Express**: High-performance REST API and Socket server.
*   **MongoDB & Mongoose**: Flexible document schema for Jobs, Users, and Conversations.
*   **Socket.io**: Handling real-time rooms, typing indicators, and online status.
*   **Resend API**: Reliable transactional email delivery (replacing unreliable SMTP).

---

## 📂 Project Structure & Key Files

Here is an overview of the core codebase structure:

```bash
campus-gigs/
├── backend/
│   ├── src/
│   │   ├── config/         # DB Connection
│   │   ├── middleware/     # Auth, Upload, SuperAdmin checks
│   │   ├── models/         # Mongoose Schemas (User, Job, Message)
│   │   ├── routes/         # API Endpoints
│   │   ├── utils/          # Email(Resend), Cloudinary helpers
│   │   └── server.js       # Entry point + Socket.io Logic
│   └── .env                # Secrets (DB URI, API Keys)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Admin/      # Admin Panel & God Mode
    │   │   ├── Auth/       # Login/Signup/OTP
    │   │   ├── Dashboard/  # Core pages (Profile, MyJobs)
    │   │   ├── Jobs/       # ChatPanel, JobCards, Dialogs
    │   │   └── Layout/     # DashboardLayout, Sidebar, Header
    │   ├── context/        # AuthContext (Global State)
    │   ├── pages/          # Landing Page (Public)
    │   └── utils/          # Axios instance
    └── index.css           # Global Styles & Tailwind Directives
```

---

## 💻 Key Implementation Details

Here are the most critical parts of the code that power the application.

### 1. The Socket.io Server logic (`backend/src/server.js`)
Handles real-time connections, joining chat rooms, and online status tracking.

```javascript
// Managing Online Users with a Map
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
     // Add user to online map
     if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
     onlineUsers.get(userId).add(socket.id);
  }

  // Join specific conversation room for privacy
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    // Cleanup logic...
  });
});
```

### 2. The Chat Panel UI (`ChatPanel.jsx`)
Handles the complex scroll logic and message mounting.

```javascript
// Smart Scroll to Bottom Logic
useLayoutEffect(() => {
    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    };

    // Scroll on mount or new message if near bottom
    if (isNearBottom || isMine) {
        scrollToBottom();
    }
}, [messages, user._id]);

// Optimistic Deduplication
socket.on('receive_message', (msg) => {
    // Logic to prevent double-rendering messages sent by self
    // checks tempId matches or timestmap proximity...
});
```

### 3. Responsive Layout (`DashboardLayout.jsx`)
The wrapper that fixes the "broken UI" issues by adapting to the content type.

```javascript
<main className={`flex-1 flex flex-col ${isChat ? 'overflow-hidden p-0' : 'overflow-y-auto p-6'}`}>
  {/* 
      Chat gets 'h-full' to lock strict height. 
      Other pages get 'w-full' to grow naturally.
  */}
  <div className={`flex flex-col ${isChat ? 'flex-1 h-full min-h-0' : 'w-full'}`}>
    <Outlet />
  </div>
</main>
```

### 4. Robust Email Service (`email.js`)
Uses Resend API to ensure 99.9% delivery rates, solving previous SMTP timeouts.

```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, htmlContent) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: [to],
    subject: subject,
    html: htmlContent, // Beautiful HTML templates included
  });
  return { success: !error, id: data?.id };
};
```

---

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install Dependencies**:
    ```bash
    cd backend && npm install
    cd frontend && npm install
    ```
3.  **Environment Setup**:
    Create `.env` files in both directories. Ensure you have:
    *   `MONGO_URI`
    *   `RESEND_API_KEY`
    *   `FRONTEND_URL` (for CORS)
4.  **Run Development Servers**:
    ```bash
    # Backend (Port 5000)
    npm run dev
    
    # Frontend (Port 3000)
    npm start
    ```

## 🔒 Security Features
*   **Helmet & Rate Limiting**: Protects against DDOS and header attacks.
*   **JWT Authentication**: Secure, stateless session management.
*   **God Mode**: Super-admin capabilities for platform moderation.

---
&copy; 2026 Campus Gigs. Built for students.
