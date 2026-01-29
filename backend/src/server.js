require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Security Headers
const helmet = require('helmet');
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Trust Proxy (Required for Rate Limiting & Secure Cookies behind Render/Vercel LB)
app.set('trust proxy', 1);

const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(/[ ,]+/).map(url => url.trim()) : [])
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach io to app so routes can use it
app.set('io', io);

// Track online users (UserId -> Set of SocketIds)
const onlineUsers = new Map();
app.set('onlineUsers', onlineUsers);

const compression = require('compression');
app.use(compression());

// ... (Rate limiting code remains same) ...
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

connectDB();

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/god", require("./routes/god"));

// Test Routes
app.use("/api/test", require("./routes/test"));

// Auto-Promote God User
const User = require('./models/User');
const enlistGodUser = async () => {
  // Promote specified users to SUPERADMIN role on startup
  try {
    const godEmails = (process.env.SUPERADMIN_EMAIL || '')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    if (godEmails.length === 0) return;

    for (const email of godEmails) {
      const godUser = await User.findOne({ email });
      if (godUser) {
        let changed = false;
        if (godUser.role !== 'superadmin') {
          godUser.role = 'superadmin';
          changed = true;
        }
        if (!godUser.isVerified) {
          godUser.isVerified = true;
          changed = true;
        }

        if (changed) {
          await godUser.save();
          console.log(`[GOD MODE] User ${email} has been elevated to SUPERADMIN.`);
        }
      }
    }
  } catch (err) {
    console.error('[GOD MODE] Error:', err);
  }
};

mongoose.connection.once('open', () => {
  enlistGodUser();
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user identification
  const userId = socket.handshake.query.userId;
  if (userId) {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    console.log(`User ${userId} is online (Sockets: ${onlineUsers.get(userId).size})`);
  }

  // Join Conversation Room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  // Typing Indicators
  socket.on('typing', ({ conversationId, userName }) => {
    socket.to(conversationId).emit('typing', { conversationId, userName });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(conversationId).emit('stop_typing', { conversationId });
  });

  // Legacy support for older frontend clients (can remove later)
  socket.on('join_chat', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    if (userId && onlineUsers.has(userId)) {
      const userSockets = onlineUsers.get(userId);
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} went offline`);
      } else {
        console.log(`User ${userId} socket disconnected (Remaining: ${userSockets.size})`);
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Health Check (for uptime monitoring to prevent cold starts)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({
    msg: "Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  // Debug Email Config
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`[Startup Debug] Email configuration detected.`);
  } else {
    console.error(`[Startup Debug] CRITICAL: EMAIL_USER or EMAIL_PASS is missing from .env!`);
  }

  // Debug Frontend URL
  if (process.env.FRONTEND_URL) {
    console.log(`[Startup Debug] CORS/Socket allowed for: ${process.env.FRONTEND_URL}`);
  } else {
    console.warn(`[Startup Debug] WARNING: FRONTEND_URL is not set. CORS/Socket might be unrestricted or broken.`);
  }
});

