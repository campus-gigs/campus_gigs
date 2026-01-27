require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/chat", require("./routes/chat"));

// Test Routes (for debugging)
app.use("/api/test", require("./routes/test"));

// Health Check (for uptime monitoring to prevent cold starts)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  // Debug Email Config
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`[Startup Debug] Email configuration detected for user: ${process.env.EMAIL_USER}`);
  } else {
    console.error(`[Startup Debug] CRITICAL: EMAIL_USER or EMAIL_PASS is missing from .env!`);
  }
});

