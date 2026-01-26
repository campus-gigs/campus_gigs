const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // First check if user is authenticated (req.user should be set by auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    // Check if user exists and is admin
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Admin access required" });
    }

    // Add user info to request
    req.admin = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    next();
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
