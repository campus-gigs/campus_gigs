const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    attachment: {
        path: { type: String }, // URL/Path to file
        type: { type: String, enum: ['image', 'file'], default: 'image' },
        originalName: String
    },
    // Deprecated fields kept for archival pointers
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
