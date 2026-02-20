const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const OriginalDocument = require('./backend/models/OriginalDocument');
const connectDB = require('./backend/config/db');

async function stats() {
    await connectDB();
    const result = await OriginalDocument.aggregate([
        { $group: { _id: '$mimetype', count: { $sum: 1 } } }
    ]);
    console.log('OriginalDocument Stats:', result);
    process.exit(0);
}

stats();
