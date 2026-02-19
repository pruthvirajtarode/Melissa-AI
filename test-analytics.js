require('dotenv').config();
const mongoose = require('mongoose');
const vectorStore = require('./backend/services/vectorStore');
const Knowledge = require('./backend/models/Knowledge');

async function testAnalytics() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        console.log('Fetching grouped documents...');
        const grouped = await vectorStore.getGroupedDocuments();
        console.log('✅ Grouped documents size:', grouped.length);

        console.log('Counting chunks...');
        const totalChunks = await Knowledge.countDocuments();
        console.log('✅ Total chunks:', totalChunks);

        process.exit(0);
    } catch (error) {
        console.error('❌ Analytics Logic Error:', error);
        process.exit(1);
    }
}

testAnalytics();
