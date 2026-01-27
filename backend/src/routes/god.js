const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const superadmin = require('../middleware/superadmin');

// Apply auth and superadmin middleware to all routes
router.use(auth);
router.use(superadmin);

/* Broadcast Message to All Online Users */
router.post('/broadcast', async (req, res) => {
    try {
        const { message, type = 'info' } = req.body; // type: info, warning, success
        if (!message) return res.status(400).json({ msg: 'Message required' });

        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');

        // Emit to all connected clients
        io.emit('system_announcement', {
            message,
            type,
            timestamp: new Date()
        });

        res.json({
            msg: `Broadcast sent to ${onlineUsers?.size || 'all'} connected users`,
            onlineCount: onlineUsers?.size
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

/* Force Verify User */
router.post('/users/:id/verify', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.isVerified = true;
        user.otp = undefined; // Clear OTP
        await user.save();

        res.json({ msg: `User ${user.name} verified successfully` });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

/* Promote/Demote User Role */
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role. Cannot promote to superadmin directly.' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Prevent modifying other superadmins (if any logic allowed multiple, but we enforce one)
        if (user.role === 'superadmin') {
            return res.status(403).json({ msg: 'Cannot demote a God User' });
        }

        user.role = role;
        await user.save();

        res.json({
            msg: `User ${user.name} role updated to ${role}`,
            user: { _id: user._id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

/* GOD MODE: Impersonate User */
router.post("/impersonate/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Generate a temporary token for this user
        const jwt = require("jsonwebtoken");
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

/* GOD MODE: Delete User (Permanent) */
router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({ msg: "Cannot delete a Super Admin" });
        }

        await user.deleteOne();

        res.json({ msg: "User PERMANENTLY deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

/* Database Cleanup (Optional Utility) */
router.post('/database/cleanup', async (req, res) => {
    // Placeholder for future cleanup logic
    res.json({ msg: 'Cleanup functionality ready for implementation' });
});

module.exports = router;
