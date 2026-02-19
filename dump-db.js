require('dotenv').config();
const mongoose = require('mongoose');
const Knowledge = require('./backend/models/Knowledge');

async function dumpKnowledge() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const count = await Knowledge.countDocuments();
        console.log('Total Records in DB:', count);

        const samples = await Knowledge.find().limit(5);
        console.log('Sample Records:', JSON.stringify(samples, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

dumpKnowledge();
