const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendJobAcceptedEmail, sendJobCompletedEmail } = require("../utils/email");

/* Open jobs with search and filters */
router.get("/", async (req, res) => {
  try {
    const { search = "", category = "", minPrice = "", maxPrice = "", duration = "", sortBy = "newest" } = req.query;

    const query = { status: "open" };

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.paymentAmount = {};
      if (minPrice) query.paymentAmount.$gte = Number(minPrice);
      if (maxPrice) query.paymentAmount.$lte = Number(maxPrice);
    }

    // Filter by duration
    if (duration) {
      query.expectedDuration = duration;
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case "price-low":
        sort = { paymentAmount: 1 };
        break;
      case "price-high":
        sort = { paymentAmount: -1 };
        break;
      case "deadline":
        sort = { deadline: 1 };
        break;
      case "newest":
      default:
        sort = { createdAt: -1 };
        break;
    }

    const jobs = await Job.find(query)
      .populate("postedBy", "name rating ratingCount")
      .sort(sort);

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* My dashboard */
router.get("/my", auth, async (req, res) => {
  const posted = await Job.find({ postedBy: req.user.id })
    .populate("acceptedBy", "name email phone")
    .sort({ createdAt: -1 });

  const accepted = await Job.find({ acceptedBy: req.user.id })
    .populate("postedBy", "name email phone rating ratingCount")
    .sort({ createdAt: -1 });

  res.json({ posted, accepted });
});

/* Post job */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, price, category, expectedDuration, deadline } = req.body;

    if (!title || !price) {
      return res.status(400).json({ msg: "Title and price required" });
    }

    const job = await Job.create({
      title,
      description: description || "",
      paymentAmount: Number(price),
      category: category || "other",
      expectedDuration: expectedDuration || "2-4 hours",
      deadline: deadline ? new Date(deadline) : null,
      postedBy: req.user.id
    });
    await job.populate("postedBy", "name rating ratingCount");
    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Delete job */
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Only the job owner can delete" });

    if (job.status !== "open")
      return res.status(400).json({ msg: "Can only delete jobs that are still open" });

    await job.deleteOne();
    res.json({ msg: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Accept job */
router.post("/:id/accept", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.status !== "open")
      return res.status(400).json({ msg: "Job is no longer available" });

    if (job.acceptedBy)
      return res.status(400).json({ msg: "Job already accepted" });

    if (job.postedBy.toString() === req.user.id)
      return res.status(400).json({ msg: "Cannot accept your own job" });

    job.acceptedBy = req.user.id;
    job.status = "in-progress";
    await job.save();

    await job.populate("postedBy", "name email rating ratingCount");
    await job.populate("acceptedBy", "name email phone");

    // Send email to job owner
    if (job.postedBy && job.postedBy.email) {
      await sendJobAcceptedEmail(job.postedBy.email, job.title, job.acceptedBy.name);
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Complete job */
router.post("/:id/complete", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (!job.acceptedBy || job.acceptedBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Only the assigned worker can complete this job" });

    if (job.status !== "in-progress")
      return res.status(400).json({ msg: "Job must be in-progress to complete" });

    job.status = "completed";
    await job.save();

    await job.populate("postedBy", "name email rating ratingCount");
    await job.populate("acceptedBy", "name email phone");

    // Send email to job owner (worker completed it)
    if (job.postedBy && job.postedBy.email) {
      await sendJobCompletedEmail(job.postedBy.email, job.title, job.acceptedBy.name);
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Review worker */
router.post("/:id/review", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ msg: "Only the job poster can review" });

    if (job.status !== "completed")
      return res.status(400).json({ msg: "Job must be completed before reviewing" });

    if (job.workerRating) {
      return res.status(400).json({ msg: "Job already reviewed" });
    }

    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    job.workerRating = rating;
    await job.save();

    // Update worker's aggregated rating
    if (job.acceptedBy) {
      const worker = await User.findById(job.acceptedBy);
      if (worker) {
        const totalRating = worker.rating * worker.ratingCount + rating;
        worker.ratingCount += 1;
        worker.rating = totalRating / worker.ratingCount;
        await worker.save();
      }
    }

    await job.populate("postedBy", "name rating ratingCount");
    await job.populate("acceptedBy", "name email phone");
    res.json(job);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Toggle favorite job */
router.post("/:id/favorite", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    const isFavorite = user.favorites.includes(jobId);

    if (isFavorite) {
      user.favorites = user.favorites.filter(id => id.toString() !== jobId);
    } else {
      user.favorites.push(jobId);
    }

    await user.save();
    res.json({
      isFavorite: !isFavorite,
      favorites: user.favorites
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* Get favorite jobs */
router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.favorites || user.favorites.length === 0) {
      return res.json([]);
    }
    const favoriteJobs = await Job.find({ _id: { $in: user.favorites }, status: "open" })
      .populate("postedBy", "name rating ratingCount")
      .sort({ createdAt: -1 });
    res.json(favoriteJobs);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
