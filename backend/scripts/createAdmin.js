const path = require("path");
const fs = require("fs");

// Try to load .env from backend directory first, then root
const backendEnv = path.join(__dirname, "../.env");
const rootEnv = path.join(__dirname, "../../.env");

if (fs.existsSync(backendEnv)) {
  require("dotenv").config({ path: backendEnv });
} else if (fs.existsSync(rootEnv)) {
  require("dotenv").config({ path: rootEnv });
} else {
  require("dotenv").config();
}

// Verify MONGO_URI is set
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env file");
  console.error("Please make sure you have a .env file in the backend directory with:");
  console.error("MONGO_URI=your_mongodb_connection_string");
  process.exit(1);
}

const mongoose = require("mongoose");
const User = require("../src/models/User");
const connectDB = require("../src/config/db");

connectDB().then(async () => {
  const email = process.argv[2];
  
  if (!email) {
    console.log("❌ Please provide an email address");
    console.log("Usage: node backend/scripts/createAdmin.js your.email@vit.ac.in");
    process.exit(1);
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      console.log("Please register this email first, then run this script again.");
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`✅ ${email} is already an admin`);
      process.exit(0);
    }

    user.role = "admin";
    await user.save();
    console.log(`✅ ${email} is now an admin!`);
    console.log("You can now login and access the Admin Dashboard.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
});
