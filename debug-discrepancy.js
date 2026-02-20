const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Knowledge = require('./backend/models/Knowledge');
const OriginalDocument = require('./backend/models/OriginalDocument');
const connectDB = require('./backend/config/db');

async function debug() {
    await connectDB();
    const kSources = await Knowledge.distinct('metadata.source');
    const oSources = await OriginalDocument.distinct('source');

    console.log('Knowledge Sources:', kSources.length);
    console.log('OriginalDocument Sources:', oSources.length);

    const missingInOriginal = kSources.filter(s => !oSources.includes(s));
    console.log('Missing in OriginalDocument (sample):', missingInOriginal.slice(0, 5));

    process.exit(0);
}

debug();
