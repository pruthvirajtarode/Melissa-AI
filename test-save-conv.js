require('dotenv').config();
const mongoose = require('mongoose');
const Conversation = require('./backend/models/Conversation');

async function testSave() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(uri);
    try {
        const convId = 'test_' + Date.now();
        const conv = new Conversation({
            conversationId: convId,
            messages: [{ role: 'user', content: 'hello test' }]
        });
        await conv.save();
        console.log('✅ Save successful:', convId);
    } catch (e) {
        console.error('❌ Save failed:', e.message);
    }
    process.exit(0);
}

testSave();
