const mongoose = require('mongoose');

let _connectionPromise = null;

const connectDB = async () => {
    if (_connectionPromise) return _connectionPromise; // reuse existing connection promise

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        console.error('❌ MongoDB URI not found in environment variables');
        return;
    }

    _connectionPromise = mongoose.connect(uri, {
        minPoolSize: 2,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000, // Wait up to 30s for Atlas to respond
        socketTimeoutMS: 60000,          // Allow longer operations (large insertMany)
        // Note: bufferCommands is intentionally left as default (true)
        // The DB-ready guard in index.js handles connection timing for all /api routes
    }).then(conn => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    }).catch(error => {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        _connectionPromise = null; // allow retry on next request
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw error;
    });

    return _connectionPromise;
};

module.exports = connectDB;
