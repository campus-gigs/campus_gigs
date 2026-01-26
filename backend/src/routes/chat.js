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

        // Send email notification to the recipient
        // We need to fetch the job with participants' emails to know who to send to
        const jobWithEmails = await Job.findById(req.params.jobId)
            .populate('postedBy', 'email')
            .populate('acceptedBy', 'email');

        if (jobWithEmails) {
            let recipientEmail;

            if (req.user.id === jobWithEmails.postedBy._id.toString()) {
                // Sender is owner, send to worker
                recipientEmail = jobWithEmails.acceptedBy?.email;
            } else {
                // Sender is worker, send to owner
                recipientEmail = jobWithEmails.postedBy?.email;
            }

            if (recipientEmail) {
                await sendNewMessageEmail(recipientEmail, message.sender.name, content);
            }
        }

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
