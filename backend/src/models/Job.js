const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  paymentAmount: { type: Number, required: true },

  category: {
    type: String,
    enum: ["tech", "delivery", "design", "writing", "tutoring", "other"],
    default: "other"
  },

  expectedDuration: {
    type: String,
    enum: ["1-2 hours", "2-4 hours", "4-8 hours", "1-2 days", "2-5 days", "1+ week"],
    default: "2-4 hours"
  },

  deadline: {
    type: Date,
    default: null
  },

  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  status: {
    type: String,
    enum: ["open", "in-progress", "completed"],
    default: "open"
  },

  workerRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
jobSchema.index({ status: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ acceptedBy: 1 });

module.exports = mongoose.model("Job", jobSchema);
