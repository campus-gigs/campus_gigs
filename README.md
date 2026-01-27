# 🎓 Campus Gigs

**The Safe, Verified Freelance Marketplace for Students.**

Campus Gigs connects students who need help with tasks to students who want to earn extra cash. Built with safety and trust in mind, featuring verified `.edu` email access and real-time communication.

![Campus Gigs Landing Page](https://via.placeholder.com/800x400?text=Campus+Gigs+Hero+Image)
*(Replace with actual screenshot)*

---

## 🚀 Tech Stack

**Frontend:**
*   **React (Vite):** Fast, modern UI library.
*   **Tailwind CSS:** Utility-first styling for beautiful customized designs.
*   **Shadcn/UI:** Premium, accessible UI components (based on Radix UI).
*   **Lucide React:** Clean, consistent iconography.
*   **Socket.io Client:** Real-time bi-directional event communication.

**Backend:**
*   **Node.js & Express:** Robust REST API server.
*   **MongoDB (Mongoose):** NoSQL database for flexible data modeling.
*   **Socket.io:** WebSocket server for instant chat.
*   **Resend:** Reliable email delivery service (Transactional emails).
*   **JWT (JSON Web Tokens):** Secure stateless authentication.

---

## ✨ Key Features

1.  **Verified Student Access:** Signup requires a valid `.edu` email address to ensure a safe campus community.
2.  **Job Marketplace:**
    *   **Post Gigs:** Students can post jobs (Moved-in help, Tutoring, Design, etc.) with a budget and deadline.
    *   **Apply & Accept:** Efficient workflow to hire the right person.
3.  **Real-Time Chat:**
    *   Instant messaging between Client and Worker using **Socket.io**.
    *   Typing indicators and live updates without refreshing.
4.  **Professional Notifications:**
    *   Branded HTML emails for Account Verification, Job Updates, and New Messages.
    *   CSS-only logo design ensures emails look great on all clients.
5.  **Review System:**
    *   5-Star rating system to build trust.
    *   Workers earn a reputation score displayed on their profile.
6.  **Modern UI/UX:**
    *   **Dark Mode:** Fully supported system-wide dark theme.
    *   **Mobile Responsive:** Works perfectly on phones with a native-app feel (Drawer menu, touch targets).

---

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/campus-gigs/campus_gigs.git
cd campus-gigs
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
EMAIL_USER=resend
EMAIL_PASS=your_resend_api_key
clientURL=http://localhost:3000
```
*Tip: Get a free API key from [Resend.com](https://resend.com).*

Start the Server:
```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

Start the React App:
```bash
npm start
# App runs on http://localhost:3000
```

---

## 📂 Project Structure

```text
campus-gigs/
├── backend/                # Express Server
│   ├── src/
│   │   ├── config/         # DB Connection
│   │   ├── middleware/     # Auth & Error handling
│   │   ├── models/         # Mongoose Schemas (User, Job, Message)
│   │   ├── routes/         # API Endpoints
│   │   ├── utils/          # Helpers (Email, etc.)
│   │   └── server.js       # Entry point (Http + Socket.io)
│   └── package.json
│
└── frontend/               # React Application
    ├── public/             # Static Assets (Logo, Favicon)
    ├── src/
    │   ├── components/     # UI Components (Chat, Jobs, Layout)
    │   ├── context/        # Global State (AuthContext)
    │   ├── pages/          # Full Pages (Landing, Dashboard)
    │   ├── App.jsx         # Routing Logic
    │   └── index.css       # Tailwind & Global Styles
    └── package.json
```

---

## 🚢 Deployment

**Backend (Render/Heroku):**
1.  Connect your repo.
2.  Set Build Command: `npm install`
3.  Set Start Command: `node src/server.js`
4.  Add Environment Variables from your `.env`.

**Frontend (Vercel/Netlify):**
1.  Connect your repo.
2.  Set Root Directory to `frontend`.
3.  Set Build Command: `npm run build`
4.  Set Output Directory: `build` (or `dist` for Vite).
5.  Add `REACT_APP_BACKEND_URL` to Environment Variables.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

*Built with ❤️ for Students.*
