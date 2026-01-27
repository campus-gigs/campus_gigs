require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity, or restrict to frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Attach io to app so routes can use it
app.set('io', io);

// Track online users (UserId -> SocketId)
const onlineUsers = new Map();
app.set('onlineUsers', onlineUsers);

const compression = require('compression');
app.use(compression());

connectDB();

app.use(cors());
app.use(express.json());

// Serve static files (like logo.svg) from the public folder
app.use(express.static('public'));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/god", require("./routes/god"));

// Test Routes (for debugging)
app.use("/api/test", require("./routes/test"));

// Auto-Promote God User on Startup
const User = require('./models/User');
const enlistGodUser = async () => {
  try {
    const godEmail = "arunreddy.k2023@vitstudent.ac.in";
    const godUser = await User.findOne({ email: godEmail });
    if (godUser && godUser.role !== 'superadmin') {
      godUser.role = 'superadmin';
      godUser.isVerified = true;
      await godUser.save();
      console.log(`[GOD MODE] User ${godEmail} has been elevated to SUPERADMIN.`);
    } else if (godUser) {
      console.log(`[GOD MODE] Superadmin ${godEmail} is active.`);
    } else {
      console.log(`[GOD MODE] Waiting for ${godEmail} to register...`);
    }
  } catch (err) {
    console.error('[GOD MODE] Error elevating user:', err);
  }
};
// Run after DB connection
mongoose.connection.once('open', () => {
  enlistGodUser();
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user identification
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online (Socket: ${socket.id})`);
  }

  socket.on('join_chat', (jobId) => {
    socket.join(jobId);
    console.log(`Socket ${socket.id} joined room: ${jobId}`);
  });

  socket.on('disconnect', () => {
    if (userId) {
      onlineUsers.delete(userId);
      console.log(`User ${userId} went offline`);
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Health Check (for uptime monitoring to prevent cold starts)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  // Debug Email Config
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`[Startup Debug] Email configuration detected for user: ${process.env.EMAIL_USER}`);
  } else {
    console.error(`[Startup Debug] CRITICAL: EMAIL_USER or EMAIL_PASS is missing from .env!`);
  }
});

