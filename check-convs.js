require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('./backend/models/Conversation');

async function check() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    const count = await Conversation.countDocuments();
    const latest = await Conversation.find().sort({ updatedAt: -1 }).limit(1);
    console.log('Total Conversations:', count);
    if (latest.length > 0) {
        console.log('Latest Conversation:', JSON.stringify(latest[0], null, 2));
    }
    process.exit(0);
}

check();
