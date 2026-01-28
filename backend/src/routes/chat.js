const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Job = require('../models/Job');
const { sendNewMessageEmail } = require('../utils/email');

// @route   GET /api/chat/dms
// @desc    Get list of users whom I have direct messages with
// @access  Private
router.get('/dms', auth, async (req, res) => {
    try {
        const myId = req.user.id;

        // Find all messages where I am sender or recipient, and job is null
        const distinctUsers = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: new mongoose.Types.ObjectId(myId) }, { recipient: new mongoose.Types.ObjectId(myId) }],
                    $or: [{ job: { $exists: false } }, { job: null }]
                }
            },
            {
                $group: {
                    _id: null,
                    senders: { $addToSet: '$sender' },
                    recipients: { $addToSet: '$recipient' }
                }
            },
            {
                $project: {
                    participants: { $setUnion: ['$senders', '$recipients'] }
                }
            }
        ]);

        console.log(`[DEBUG] Found ${distinctUsers.length > 0 ? distinctUsers[0].participants.length : 0} DM participants for user ${myId}`);

        if (distinctUsers.length === 0) {
            return res.json([]);
        }

        let participantIds = distinctUsers[0].participants
            .filter(id => id.toString() !== myId);

        const User = require('../models/User');
        const users = await User.find({ _id: { $in: participantIds } })
            .select('name email profilePhoto role');

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/chat/:jobId
// @desc    Get all messages for a job
// @access  Private
router.get('/:jobId', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if user is participant
        const isOwner = job.postedBy.toString() === req.user.id;
        const isWorker = job.acceptedBy && job.acceptedBy.toString() === req.user.id;

        if (!isOwner && !isWorker) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const messages = await Message.find({ job: req.params.jobId })
            .populate('sender', 'name')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chat/:jobId
// @desc    Send a message
// @access  Private
router.post('/:jobId', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if user is participant
        const isOwner = job.postedBy.toString() === req.user.id;
        const isWorker = job.acceptedBy && job.acceptedBy.toString() === req.user.id;

        if (!isOwner && !isWorker) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const newMessage = new Message({
            job: req.params.jobId,
            sender: req.user.id,
            content
        });


        const message = await newMessage.save();
        await message.populate('sender', 'name');

        // Real-time: Emit to the room (for chat window)
        const io = req.app.get('io');
        io.to(req.params.jobId).emit('receive_message', message);

        // Smart Logic: Check if recipient is online
        const onlineUsers = req.app.get('onlineUsers');

        // We need to fetch the job with participants' emails/ids to know who to send to
        const jobWithEmails = await Job.findById(req.params.jobId)
            .populate('postedBy', 'email')
            .populate('acceptedBy', 'email');

        if (jobWithEmails) {
            let recipientEmail;
            let recipientId;

            if (req.user.id === jobWithEmails.postedBy._id.toString()) {
                // Sender is owner, send to worker
                recipientEmail = jobWithEmails.acceptedBy?.email;
                recipientId = jobWithEmails.acceptedBy?._id.toString();
            } else {
                // Sender is worker, send to owner
                recipientEmail = jobWithEmails.postedBy?.email;
                recipientId = jobWithEmails.postedBy?._id.toString();
            }

            if (recipientId) {
                const recipientSocketIds = onlineUsers.get(recipientId);

                if (recipientSocketIds && recipientSocketIds.size > 0) {
                    // Emit to ALL active sockets for this user (Sidebar, Mobile, etc.)
                    recipientSocketIds.forEach(socketId => {
                        io.to(socketId).emit('new_message_notification', {
                            jobId: req.params.jobId,
                            senderName: message.sender.name,
                            content: content
                        });
                    });
                    console.log(`[Smart Notification] User ${recipientId} is online on ${recipientSocketIds.size} devices.`);
                } else if (recipientEmail) {
                    // User is OFFLINE: Send Email
                    console.log(`[Smart Notification] User ${recipientId} is offline. Sending Email.`);
                    sendNewMessageEmail(recipientEmail, message.sender.name, content).catch(err => console.error('Email send failed', err));
                }
            }
        }

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



/* DIRECT MESSAGING ROUTES */

// @route   GET /api/chat/direct/:userId
// @desc    Get direct messages with a specific user
// @access  Private
router.get('/direct/:userId', auth, async (req, res) => {
    try {
        const myId = req.user.id;
        const otherId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: otherId },
                { sender: otherId, recipient: myId }
            ],
            job: { $exists: false } // Ensure it's a DM, not a job chat
        })
            .populate('sender', 'name')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chat/direct/:userId
// @desc    Send a direct message
// @access  Private
router.post('/direct/:userId', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const recipientId = req.params.userId;
        const senderId = req.user.id;

        // Validation: Verify recipient exists
        const recipientUser = await require('../models/User').findById(recipientId);
        if (!recipientUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            content
        });

        const message = await newMessage.save();
        await message.populate('sender', 'name');

        // Real-time: Emit to recipient
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        const recipientSocketId = onlineUsers.get(recipientId);

        if (recipientSocketId) {
            // Emit to specific socket
            io.to(recipientSocketId).emit('receive_direct_message', message);

            // Notification
            io.to(recipientSocketId).emit('new_message_notification', {
                senderName: message.sender.name,
                content: content,
                isDirect: true,
                senderId: senderId
            });
        } else if (recipientUser.email) {
            // Offline Email Notification
            sendNewMessageEmail(recipientUser.email, message.sender.name, content).catch(err => console.error(err));
        }

        // Emit back to sender (so they see it immediately if using multiple tabs, or just for consistency)
        const senderSocketIds = onlineUsers.get(senderId);
        if (senderSocketIds) {
            senderSocketIds.forEach(socketId => {
                io.to(socketId).emit('receive_direct_message', message);
            });
        }

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
