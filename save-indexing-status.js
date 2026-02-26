const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Knowledge = require('./backend/models/Knowledge');
const connectDB = require('./backend/config/db');
const fs = require('fs');

async function checkStatus() {
    await connectDB();
    const count = await Knowledge.countDocuments();
    const activeCount = await Knowledge.countDocuments({ 'metadata.isActive': true });
    const sources = await Knowledge.distinct('metadata.source');
    const adminUploaded = await Knowledge.countDocuments({ 'metadata.adminUploaded': true });

    const result = {
        totalChunks: count,
        activeChunks: activeCount,
        adminUploadedChunks: adminUploaded,
        uniqueSources: sources.length
    };

    fs.writeFileSync('indexing-summary.json', JSON.stringify(result, null, 2));
    console.log('Saved summary to indexing-summary.json');
    process.exit(0);
}

checkStatus().catch(err => {
    console.error(err);
    process.exit(1);
});
