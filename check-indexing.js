const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Knowledge = require('./backend/models/Knowledge');
const connectDB = require('./backend/config/db');

async function checkStatus() {
    await connectDB();
    const count = await Knowledge.countDocuments();
    const activeCount = await Knowledge.countDocuments({ 'metadata.isActive': true });

    // Get unique sources
    const sources = await Knowledge.distinct('metadata.source');

    console.log(`Total chunks in DB: ${count}`);
    console.log(`Active chunks in DB: ${activeCount}`);
    console.log(`Unique sources: ${sources.length}`);
    console.log('\nSources list:');
    sources.slice(0, 20).forEach(s => console.log(`- ${s}`));
    if (sources.length > 20) console.log('...');

    process.exit(0);
}

checkStatus().catch(err => {
    console.error(err);
    process.exit(1);
});
