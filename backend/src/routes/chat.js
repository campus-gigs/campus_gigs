const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Job = require('../models/Job');
const { sendNewMessageEmail } = require('../utils/email');

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
                const recipientSocketId = onlineUsers.get(recipientId);

                if (recipientSocketId) {
                    // User is ONLINE: Emit notification to their sidebar (Red Dot)
                    io.to(recipientSocketId).emit('new_message_notification', {
                        jobId: req.params.jobId,
                        senderName: message.sender.name,
                        content: content
                    });
                    console.log(`[Smart Notification] User ${recipientId} is online. Notification sent via Socket.`);
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

module.exports = router;
