const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');
const Job = require('../src/models/Job');

dotenv.config({ path: '../backend/.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Find all messages without a conversationId
        const messages = await Message.find({ conversationId: { $exists: false } }).sort({ createdAt: 1 });
        console.log(`Found ${messages.length} legacy messages to migrate...`);

        for (const msg of messages) {
            let conversation;

            if (msg.job) {
                // Job Chat
                conversation = await Conversation.findOne({ type: 'JOB', contextId: msg.job });

                if (!conversation) {
                    // Create if missing. We need to find the job to know participants
                    const job = await Job.findById(msg.job);
                    if (!job) {
                        console.warn(`Skipping message ${msg._id}: Job ${msg.job} not found`);
                        continue;
                    }

                    // Assuming participants are postedBy and acceptedBy
                    // If acceptedBy is null, this message might be pre-acceptance (unlikely in old logic) -> skip or use sender + owner?
                    // Let's use sender + owner if acceptedBy missing
                    const participants = [job.postedBy];
                    if (job.acceptedBy) participants.push(job.acceptedBy);
                    else if (msg.sender.toString() !== job.postedBy.toString()) participants.push(msg.sender);

                    // Dedup
                    const uniqueParts = [...new Set(participants.map(p => p.toString()))];

                    conversation = new Conversation({
                        type: 'JOB',
                        contextId: msg.job,
                        participants: uniqueParts
                    });
                    await conversation.save();
                }
            } else if (msg.sender && msg.recipient) {
                // Direct Message
                const participants = [msg.sender, msg.recipient].sort();
                conversation = await Conversation.findOne({
                    type: 'DIRECT',
                    participants: { $all: participants, $size: 2 }
                });

                if (!conversation) {
                    conversation = new Conversation({
                        type: 'DIRECT',
                        participants: participants
                    });
                    await conversation.save();
                }
            } else {
                console.warn(`Skipping malformed message ${msg._id}`);
                continue;
            }

            // Update Message
            msg.conversationId = conversation._id;
            await msg.save();

            // Update Conversation Last Message
            conversation.lastMessage = msg._id;
            conversation.lastMessageContent = msg.content;
            conversation.updatedAt = msg.createdAt; // Preserve history order
            await conversation.save();
        }

        console.log('Migration Complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
