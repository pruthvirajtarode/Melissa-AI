const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const OriginalDocument = require('./backend/models/OriginalDocument');
const connectDB = require('./backend/config/db');

connectDB().then(async () => {
    const count = await OriginalDocument.countDocuments();
    console.log('OriginalDocuments Count:', count);
    process.exit(0);
});
