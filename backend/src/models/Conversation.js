const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    type: {
        type: String,
        enum: ['JOB', 'DIRECT'],
        default: 'DIRECT'
    },
    // For Job chats, we link strictly to the Job to ensure 1-to-1 mapping per job
    contextId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: function () { return this.type === 'JOB'; }
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageContent: { type: String }, // Cache for faster preview
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true // Gives us createdAt and updatedAt (for sorting)
});

// Index for fast lookup of my conversations
ConversationSchema.index({ participants: 1, updatedAt: -1 });
ConversationSchema.index({ contextId: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
