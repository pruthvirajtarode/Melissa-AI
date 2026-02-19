const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Knowledge = require('./backend/models/Knowledge');
const connectDB = require('./backend/config/db');

async function check() {
    await connectDB();
    const sources = await Knowledge.distinct('metadata.source', { 'metadata.path': { $exists: false } });
    console.log('Sources without path (likely UI uploads):', sources);
    process.exit(0);
}

check();
