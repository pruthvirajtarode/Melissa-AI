const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const vectorStore = require('./backend/services/vectorStore');
const connectDB = require('./backend/config/db');

async function clean() {
    await connectDB();
    console.log('🧹 Clearing Knowledge Base for fresh indexing...');
    await vectorStore.clearAll();
    console.log('✅ Knowledge Base cleared.');
    process.exit(0);
}

clean();
