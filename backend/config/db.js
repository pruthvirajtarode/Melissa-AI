const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            console.error('❌ MongoDB URI not found in environment variables');
            return;
        }
        const conn = await mongoose.connect(uri, {
            minPoolSize: 2,       // Keep min 2 connections alive to avoid cold-start delay
            maxPoolSize: 10,      // Allow up to 10 concurrent connections
            serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        // Don't exit process in production (Vercel), just log error
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
