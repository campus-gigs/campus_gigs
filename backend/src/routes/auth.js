const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail, sendOtpEmail } = require("../utils/email");

const router = express.Router();

// Allowed college domains
const ALLOWED_DOMAINS = [
  "@vit.ac.in",
  "@vitstudent.ac.in"
];

// REGISTER
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    email = email.trim().toLowerCase();

    const isAllowed = ALLOWED_DOMAINS.some(domain =>
      email.endsWith(domain)
    );

    if (!isAllowed) {
      return res.status(400).json({
        msg: "Use your official VIT college email ID"
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.create({
      name,
      email,
      password: hash,
      isVerified: false,
      otp,
      otpExpires
    });

    // Send OTP email (Non-blocking to speed up UI)
    sendOtpEmail(email, otp).catch(err => console.error("Email send failed:", err));

    res.json({ msg: "Registration successful. Please verify your email with the OTP sent." });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "User already verified" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email after verification
    await sendWelcomeEmail(user.email, user.name);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, msg: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found. Please create an account." });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    if (user.isBanned) {
      return res.status(403).json({ msg: "Account has been banned" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});



// RESEND OTP
router.post("/resend-otp", async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email required" });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ msg: "User already verified" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email (Non-blocking)
    sendOtpEmail(email, otp).catch(err => console.error("Email send failed:", err));

    res.json({ msg: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
