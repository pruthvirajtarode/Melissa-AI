require('dotenv').config();
const mongoose = require('mongoose');
const vectorStore = require('./backend/services/vectorStore');
const fs = require('fs');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const q = "Research_Paper.";
        const relevantDocs = await vectorStore.search(q, 5);
        const result = {
            query: q,
            count: relevantDocs.length,
            docs: relevantDocs.map(d => ({ source: d.source, similarity: d.similarity }))
        };
        fs.writeFileSync('search-output.json', JSON.stringify(result, null, 2));
        console.log("Done");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
run();
