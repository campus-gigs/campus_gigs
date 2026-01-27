const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user"
  },

  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  profilePhoto: { type: String, default: null },
  phone: { type: String, default: "" },
  bio: { type: String, default: "" },

  isActive: {
    type: Boolean,
    default: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: { type: String },
  otpExpires: { type: Date },

  isBanned: {
    type: Boolean,
    default: false
  },

  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isActive: 1 });

module.exports = mongoose.model("User", UserSchema);
