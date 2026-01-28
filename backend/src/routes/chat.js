const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Job = require('../models/Job');
const { sendNewMessageEmail } = require('../utils/email');
const upload = require('../middleware/upload');

// @route   POST /api/chat/upload
// @desc    Upload an image for chat
// @access  Private
router.post('/upload', auth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        // Return path relative to server root, e.g., 'uploads/123.jpg'
        res.json({ path: req.file.path.replace(/\\/g, '/') });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the current user (Sorted by recent)
// @access  Private
router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id })
            .populate('participants', 'name email profilePhoto role')
            .populate('contextId', 'title status') // Populate Job details if it's a job chat
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chat/start
// @desc    Start or Get specific conversation (Idempotent)
// @access  Private
router.post('/start', auth, async (req, res) => {
    try {
        const { recipientId, jobId } = req.body;
        const myId = req.user.id;

        let conversation;

        if (jobId) {
            // JOB CHAT STRATEGY
            // Search for existing chat for this specific Job
            conversation = await Conversation.findOne({
                type: 'JOB',
                contextId: jobId
            });

            if (!conversation) {
                // Verify Job Exists and Users are relevant
                const job = await Job.findById(jobId);
                if (!job) return res.status(404).json({ msg: 'Job not found' });

                // Participants: Owner and Worker (or Applicant in future expansion)
                // If I am owner, recipient must be worker. If I am worker, recipient is owner.
                // For simplicity/robustness, we just clean the array of [myId, recipientId]

                conversation = new Conversation({
                    participants: [myId, recipientId],
                    type: 'JOB',
                    contextId: jobId
                });
                await conversation.save();
            }
        } else {
            // DIRECT CHAT STRATEGY
            conversation = await Conversation.findOne({
                type: 'DIRECT',
                participants: { $all: [myId, recipientId], $size: 2 }
            });

            if (!conversation) {
                // Check if Recipient Exists
                const userExists = await User.exists({ _id: recipientId });
                if (!userExists) return res.status(404).json({ msg: 'User not found' });

                conversation = new Conversation({
                    participants: [myId, recipientId],
                    type: 'DIRECT'
                });
                await conversation.save();
            }
        }

        // Return the full conversation object so frontend can immediately open it
        const fullConv = await Conversation.findById(conversation._id)
            .populate('participants', 'name email profilePhoto')
            .populate('contextId', 'title status');

        res.json(fullConv);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/chat/:conversationId/messages
// @desc    Get history for a conversation
// @access  Private
router.get('/:conversationId/messages', auth, async (req, res) => {
    try {
        // Security: Ensure I am a participant
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            participants: req.user.id
        });

        if (!conversation) {
            return res.status(403).json({ msg: 'Access denied or chat not found' });
        }

        const messages = await Message.find({ conversationId: req.params.conversationId })
            .populate('sender', 'name')
            .sort({ createdAt: 1 }); // Oldest first for chat history

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chat/:conversationId/messages
// @desc    Send a message
// @access  Private
router.post('/:conversationId/messages', auth, async (req, res) => {
    try {
        const { content, attachment } = req.body; // attachment: { path, originalName, type }
        const conversationId = req.params.conversationId;
        const myId = req.user.id;

        // 1. Validate Access
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: myId
        }).populate('participants', 'name email');

        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }

        // 2. Create Message
        const newMessage = new Message({
            conversationId: conversationId,
            sender: myId,
            content: content,
            attachment: attachment // Add attachment
            // (Optional: add job/recipient legacy fields if we wanted db migration ease, but skipping for cleaner split)
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate('sender', 'name');

        // 3. Update Conversation (Last Message + Timestamp)
        conversation.lastMessage = savedMessage._id;
        conversation.lastMessageContent = content; // Preview cache
        // Reset unread count for me, Increment for others? (omitted for speed, can add later)
        await conversation.save();

        // 4. Real-time Emission
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');

        // Emit to the "Room" (Clients listening to this conversationId)
        io.to(conversationId).emit('receive_message', savedMessage);

        // 5. Smart Notifications (Online/Offline)
        const recipients = conversation.participants.filter(p => p._id.toString() !== myId);

        recipients.forEach(recipient => {
            const recipientId = recipient._id.toString();
            const recipientSockets = onlineUsers.get(recipientId);

            if (recipientSockets && recipientSockets.size > 0) {
                // Online: Send Toast/Sidebar update
                recipientSockets.forEach(socketId => {
                    io.to(socketId).emit('new_message_notification', {
                        conversationId: conversationId,
                        senderName: savedMessage.sender.name,
                        content: content
                    });
                });
            } else {
                // Offline: Email (Async)
                sendNewMessageEmail(recipient.email, savedMessage.sender.name, content)
                    .catch(err => console.error('[Email] Failed to send chat notification', err));
            }
        });

        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
