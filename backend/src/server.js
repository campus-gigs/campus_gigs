require("dotenv").config();
const express = require("express");
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

// Test Routes (for debugging)
app.use("/api/test", require("./routes/test"));

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_chat', (jobId) => {
    socket.join(jobId);
    console.log(`Socket ${socket.id} joined room: ${jobId}`);
  });

  socket.on('disconnect', () => {
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

