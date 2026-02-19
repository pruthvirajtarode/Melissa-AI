require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI not found');
            process.exit(1);
        }
        console.log('Attempting to connect to:', uri.split('@')[1]);
        await mongoose.connect(uri);
        console.log('✅ Connected successfully to MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
