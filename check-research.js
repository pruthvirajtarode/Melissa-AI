require('dotenv').config();
const mongoose = require('mongoose');
const Knowledge = require('./backend/models/Knowledge');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const docs = await Knowledge.find({ 'metadata.source': /Research/i }).select('metadata.source metadata.isActive metadata.filename').limit(10);
        console.log("Research documents found:", docs.length);
        console.log(docs);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
run();
