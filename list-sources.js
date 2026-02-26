const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Knowledge = require('./backend/models/Knowledge');
const connectDB = require('./backend/config/db');

async function listSources() {
    await connectDB();
    const sources = await Knowledge.distinct('metadata.source');
    console.log(`Total unique sources: ${sources.length}`);
    sources.slice(0, 100).forEach((s, i) => console.log(`${i + 1}. ${s}`));
    process.exit(0);
}

listSources().catch(err => {
    console.error(err);
    process.exit(1);
});
