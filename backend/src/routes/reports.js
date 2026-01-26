const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const auth = require("../middleware/auth");

/* Create Report */
router.post("/", auth, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ msg: "All fields required" });
    }

    if (!["user", "job"].includes(targetType)) {
      return res.status(400).json({ msg: "Invalid target type" });
    }

    const report = await Report.create({
      reportedBy: req.user.id,
      targetType,
      targetId,
      reason
    });

    res.json({ msg: "Report submitted successfully", report });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
