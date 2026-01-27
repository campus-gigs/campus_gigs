const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Job = require("../models/Job");
const Report = require("../models/Report");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const jwt = require("jsonwebtoken");

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(admin);

/* Dashboard Statistics */
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: "open" });
    const completedJobs = await Job.countDocuments({ status: "completed" });
    const inProgressJobs = await Job.countDocuments({ status: "in-progress" });

    // Jobs by category
    const jobsByCategory = await Job.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    // Jobs by status
    const jobsByStatus = await Job.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent users (last 7 days)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Recent jobs (last 7 days)
    const recentJobs = await Job.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalJobs,
        openJobs,
        completedJobs,
        inProgressJobs,
        recentUsers,
        recentJobs
      },
      jobsByCategory,
      jobsByStatus
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Get All Users */
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", role = "", isActive = "", isBanned = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== "") query.isActive = isActive === "true";
    if (isBanned !== "") query.isBanned = isBanned === "true";

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Get User by ID */
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get user's job stats
    const jobsPosted = await Job.countDocuments({ postedBy: user._id });
    const jobsCompleted = await Job.countDocuments({
      acceptedBy: user._id,
      status: "completed"
    });

    res.json({
      user,
      stats: {
        jobsPosted,
        jobsCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Update User */
router.put("/users/:id", async (req, res) => {
  try {
    const { name, role, isActive, phone, bio } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone,
      bio: user.bio
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Ban/Unban User */
router.patch("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }



    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      msg: user.isBanned ? "User banned successfully" : "User unbanned successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Delete User */
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }



    user.isActive = false;
    await user.save();

    res.json({ msg: "User deactivated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Get All Jobs */
router.get("/jobs", async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", status = "", category = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .populate("acceptedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Get Job by ID */
router.get("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email phone")
      .populate("acceptedBy", "name email phone");

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Update Job */
router.put("/jobs/:id", async (req, res) => {
  try {
    const { status, title, description, paymentAmount } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    if (status) job.status = status;
    if (title) job.title = title;
    if (description !== undefined) job.description = description;
    if (paymentAmount) job.paymentAmount = Number(paymentAmount);

    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Delete Job */
router.delete("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    await job.deleteOne();
    res.json({ msg: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Get All Reports */
router.get("/reports", async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Delete Review (Remove workerRating from job) */
router.delete("/reviews/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    if (!job.workerRating) {
      return res.status(400).json({ msg: "No review to remove" });
    }

    // Remove rating and recalculate worker's average
    const rating = job.workerRating;
    job.workerRating = null;
    await job.save();

    // Update worker's aggregated rating
    if (job.acceptedBy) {
      const worker = await User.findById(job.acceptedBy);
      if (worker && worker.ratingCount > 0) {
        const totalRating = worker.rating * worker.ratingCount - rating;
        worker.ratingCount -= 1;
        worker.rating = worker.ratingCount > 0 ? totalRating / worker.ratingCount : 0;
        await worker.save();
      }
    }

    res.json({ msg: "Review removed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* GOD MODE: Impersonate User (Moved to /api/god) */

module.exports = router;
