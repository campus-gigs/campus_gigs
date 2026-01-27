require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const verifyDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const userCount = await User.countDocuments();
        console.log(`📊 Total Users in DB: ${userCount}`);

        const users = await User.find({}, 'name email role');
        console.log('📋 Users List:', users);

    } catch (error) {
        console.error('❌ DB Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

verifyDB();
