const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Job = require("../models/Job");
const auth = require("../middleware/auth");

/* Get user profile */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Calculate stats
    const completedJobs = await Job.countDocuments({
      acceptedBy: req.user.id,
      status: "completed"
    });

    const jobsPosted = await Job.countDocuments({
      postedBy: req.user.id
    });

    const jobsCompleted = await Job.countDocuments({
      acceptedBy: req.user.id,
      status: "completed"
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: user.rating,
        ratingCount: user.ratingCount,
        profilePhoto: user.profilePhoto,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt
      },
      stats: {
        jobsPosted,
        jobsCompleted,
        averageRating: user.ratingCount > 0 ? user.rating.toFixed(1) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Update user profile */
router.put("/", auth, async (req, res) => {
  try {
    const { name, phone, bio, profilePhoto } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      rating: user.rating,
      ratingCount: user.ratingCount,
      profilePhoto: user.profilePhoto,
      phone: user.phone,
      bio: user.bio
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Get public profile (for viewing other users) */
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -email");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const jobsCompleted = await Job.countDocuments({
      acceptedBy: req.params.userId,
      status: "completed"
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        rating: user.rating || 0,
        ratingCount: user.ratingCount || 0,
        profilePhoto: user.profilePhoto,
        bio: user.bio || ""
      },
      stats: {
        jobsCompleted,
        averageRating: (user.ratingCount > 0 && typeof user.rating === 'number')
          ? user.rating.toFixed(1)
          : "0.0"
      }
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* Delete user account */
router.delete("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 1. Delete all jobs posted by user
    // This will orphan any chats associated with these jobs, effectively "deleting" them from view
    // as they won't appear in anyone's list if the job is deleted.
    await Job.deleteMany({ postedBy: req.user.id });

    // 2. Update jobs accepted by user
    // Reset status to open and remove acceptedBy
    await Job.updateMany(
      { acceptedBy: req.user.id },
      {
        $unset: { acceptedBy: "" },
        $set: { status: "open" }
      }
    );

    // 3. Delete user
    // Messages sent by user are NOT deleted, but 'sender' will now populate as null.
    // Frontend must handle this.
    await user.deleteOne();

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
