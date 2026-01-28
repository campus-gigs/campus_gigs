# Campus Gigs 🎓

**Campus Gigs** is a robust, full-stack freelance marketplace built specifically for university ecosystems. It facilitates secure, micro-task transactions between students (Clients) and student-freelancers (Workers).

## 📌 Project Overview

### Problem
Students often need quick cash or help with simple tasks (deliveries, assignments, moving help), but existing platforms (Upwork, Fiverr) are too formal, expensive, or global.

### Solution
A hyper-local marketplace where:
*   Students post tasks with a budget.
*   Peers apply instantly.
*   Chat & coordination happens in real-time.
*   Payments and completion are tracked securely.

### Key Features
*   **Role-Based Auth**: Students, Admins, and Super Admin (God Mode) with specific privileges.
*   **Real-Time Chat**: WebSockets (Socket.io) for instant DMs and job-specific conversations.
*   **Smart Notifications**: Automatic email alerts (Resend/Gmail) when users are offline.
*   **Job Management**: Full lifecycle tracking (Open -> Accepted -> In Progress -> Completed).
*   **Admin Dashboard**: User management, content moderation, and platform statistics.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React.js](https://reactjs.org/) (v18)
*   **Routing**: React Router DOM (v6)
*   **State Management**: React Context API
*   **Styling**: Tailwind CSS + Radix UI + Lucide React (Icons)
*   **HTTP Client**: Axios (with Interceptors)
*   **Real-time**: Socket.io Client

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: MongoDB (Mongoose ODM)
*   **Real-time**: Socket.io
*   **Security**: Helmet, CORS, Bcrypt, JWT
*   **Email**: Nodemailer (SMTP/Gmail)

### Infrastructure
*   **Hosting**: Vercel (Frontend), Render (Backend)
*   **Database**: MongoDB Atlas
*   **Email Service**: Resend (SMTP) / Gmail Fallback

---

## 📂 Folder & File Structure

### Backend (`/backend`)
Responsible for API, Database, and WebSocket logic.

| Path | Description |
| :--- | :--- |
| `src/server.js` | **Entry Point**. Initializes Express, Socket.io, DB connection, and Middleware. handles `trust proxy` and CORS. |
| `src/config/db.js` | Handles MongoDB connection logic. |
| **`src/models/`** | **Data Models** (Schema definitions) |
| `.../User.js` | User schema (Name, Email, Password, Role, Avg Rating). |
| `.../Job.js` | Job schema (Title, Price, Status, PostedBy, AcceptedBy). |
| `.../Conversation.js` | **[NEW]** Unifies Job Chats & DMs into one entity. |
| `.../Message.js` | Linked to `Conversation`. Legacy fields deprecated. |
| **`src/middleware/`** | **Request Interceptors** |
| `.../auth.js` | Verifies JWT Token from `x-auth-token` header. Attaches `req.user`. |
| `.../admin.js` | Ensures `req.user.role` is 'admin'. |
| `.../superadmin.js` | Ensures `req.user.role` is 'superadmin' (God Mode). |
| `.../upload.js` | Multer configuration for file uploads. |
| **`src/routes/`** | **API Endpoints** |
| `.../auth.js` | Login, Register, Verify OTP. |
| `.../jobs.js` | CRUD for Jobs, Search, Apply. |
| `.../chat.js` | Message handling (DMs & Job Chats). |
| `.../god.js` | Super Admin exclusive routes (Impersonation, Broadcast). |
| `src/utils/email.js` | **Smart Emailer**. Supports SMTP (Resend) with Gmail fallback. |

### Frontend (`/frontend`)
React Single Page Application (SPA).

| Path | Description |
| :--- | :--- |
| `src/App.jsx` | Main Router configuration. Handles protected routes and layouts. |
| `src/index.js` | Entry point. Mounts React to DOM. |
| `src/utils/api.js` | **Axios Instance**. Auto-attaches JWT token to every request. Handles centralized error logging. |
| `src/context/AuthContext.js` | Global Auth State. Handles Login/Logout logic and User data. |
| **`src/components/`** | **UI Components** |
| `.../Layout/` | `Sidebar`, `DashboardLayout`, `Navbar`. |
| `.../Dashboard/` | Main views: `JobBoard` (Search), `MyJobs` (History), `ChatPage`. |
| `.../Jobs/` | `JobCard`, `CreateJobDialog`, `ChatDialog` (The specific chat window). |
| `.../Admin/` | `AdminPanel`: Table views for user management and moderation. |

---

## 🏗️ Architecture Flow

### 1. Request Lifecycle
1.  **Client**: User clicks "Post Job" in React.
2.  **Axios**: Sends `POST /api/jobs` request with JSON body + JWT Header.
3.  **Express**: Receives request at Port 5000.
4.  **Middleware**: `auth.js` decodes JWT. If valid, allows pass.
5.  **Controller**: `routes/jobs.js` validates input and creates a `Job` document.
6.  **Database**: Mongoose saves the document to MongoDB.
7.  **Response**: Server sends `200 OK` with the new Job data.
8.  **Client Update**: React updates state and shows a specific "Success" toast.

### 2. Real-Time Chat Architecture
1.  **Connection**: Client connects to `Socket.io` server on login.
2.  **Room Join**: When opening a chat, Client emits `join_conversation(conversationId)`.
3.  **Messaging**:
    *   Sender emits `send_message` (via API, then broadcast).
    *   **Typing Indicators**: Client emits `typing` / `stop_typing` events.
    *   Server emits `receive_message` to the specific Room.
    *   **Optimistic UI**: Client shows message immediately.
    *   **Smart Notification**: Server checks if Recipient is connected.
        *   **If Online**: Emits a `notification` event.
        *   **If Offline**: Sends an email via `nodemailer`.

---

## 🔐 Environment Variables

**Do not share these keys publicly.**

### Backend (`/backend/.env`)
| Variable | Purpose | Example Value |
| :--- | :--- | :--- |
| `PORT` | API Port | `5000` |
| `MONGO_URI` | Database Connection | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Token Encryption Key | `crypto-random-string` |
| `FRONTEND_URL` | CORS Policy (Comma Separated) | `https://campusgigs.site,http://localhost:3000` |
| `EMAIL_USER` | Sending Email Address | `notifications@campusgigs.com` |
| `EMAIL_PASS` | App Password or SMTP Pass | `xxxx-xxxx-xxxx` |
| `SMTP_HOST` | (Optional) Custom SMTP | `smtp.resend.com` |
| `SMTP_PORT` | (Optional) Custom Port | `587` |
| `SUPERADMIN_EMAIL` | Auto-promote this user to God Mode | `admin@university.edu` |

### Frontend (`/frontend/.env`)
| Variable | Purpose | Example Value |
| :--- | :--- | :--- |
| `REACT_APP_BACKEND_URL` | API Base URL | `https://campus-gigs-backend.onrender.com` |

---

## ⚡ Setup & Local Development

### 1. Installation
```bash
# Clone
git clone https://github.com/your-repo/campus-gigs.git
cd campus-gigs

# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install
```

### 2. Configuration
Create `.env` files in both folders using the tables above.

### 3. Running
**Terminal 1 (Backend)**
```bash
cd backend
npm run dev
# Watch for: "Server running on port 5000" & "MongoDB Connected"
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

---

## 🔄 Data Migration (Chat Upgrade)
Version 2.0 introduced a unified `Conversation` model. If you are updating from v1.0, you must run the migration script to convert legacy messages:
```bash
cd backend
node scripts/migrate_chats.js
```

---

## 📡 API Reference

### Authentication (`/api/auth`)
*   `POST /register`: Sign up (Sends OTP).
*   `POST /verify-otp`: Activate account.
*   `POST /login`: Get JWT token.

### Jobs (`/api/jobs`)
*   `GET /`: List all jobs (Query params: `search`, `category`, `status`).
*   `POST /`: Create job.
*   `PUT /:id/apply`: Accept a job.
*   `PUT /:id/complete`: Mark job as done (Requester only).

### Chat (`/api/chat`)
*   `GET /conversations`: List all unified (Job + Direct) conversations.
*   `POST /start`: Start or retrieve a conversation (Idempotent).
*   `GET /:conversationId/messages`: Get message history.
*   `POST /:conversationId/messages`: Send a message.

### Admin (`/api/admin`)
*   `GET /stats`: Dashboard metrics.
*   `GET /users`: User management list.
*   `PATCH /users/:id/ban`: Ban user.

### God Mode (`/api/god`)
*   `POST /impersonate/:id`: Generate login token for ANY user.
*   `POST /broadcast`: Send system-wide alert.
*   `DELETE /users/:id`: Permanently delete user.

---

## 🚀 Deployment Guide

### Frontend (Vercel)
1.  **Build Command**: `npm run build`
2.  **Output Directory**: `build`
3.  **Environment Variable**: `REACT_APP_BACKEND_URL` (Points to Render).
4.  **Important**: `vercel.json` is included to handle SPA routing (rewrites to index.html).

### Backend (Render)
1.  **Build Command**: `npm install`
2.  **Start Command**: `node src/server.js`
3.  **Environment Variables**: Add all backend `.env` keys.
4.  **Health Check**: Set path to `/health`.

---

## 🔧 Common Issues & Fixes

**Issue: CORS Error (Network Error)**
*   **Fix**: Ensure `FRONTEND_URL` in backend matches your Vercel domain exactly.
*   **Fix**: If using `www`, add it too: `https://site.com,https://www.site.com`.

**Issue: Messages not appearing instantly**
*   **Fix**: Check if `Socket.io` connection is established in browser Network tab (`/socket.io/?...`).
*   **Fix**: Ensure your firewall/proxy allows WebSocket connections.

**Issue: "Not Authorized"**
*   **Fix**: Your JWT expired. Log out and log back in.

---

*Documentation generated for Campus Gigs v2.0*
