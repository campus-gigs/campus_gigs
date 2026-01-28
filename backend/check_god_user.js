require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = process.env.SUPERADMIN_EMAIL;
        if (!email) {
            console.log('[VERIFY] No SUPERADMIN_EMAIL set in .env');
            return;
        }
        const user = await User.findOne({ email });

        if (user) {
            console.log(`[VERIFY] User Found: ${user.name}`);
            console.log(`[VERIFY] Email: ${user.email}`);
            console.log(`[VERIFY] Role: ${user.role}`); // This MUST be 'superadmin'
            console.log(`[VERIFY] ID: ${user._id}`);
        } else {
            console.log(`[VERIFY] User with email ${email} NOT FOUND.`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkUser();
