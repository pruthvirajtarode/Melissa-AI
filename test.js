const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const OriginalDocument = require('./backend/models/OriginalDocument');
    const Knowledge = require('./backend/models/Knowledge');

    const sourceToFind = "Artificial Intelligence Integration Assessment.docx";

    console.log("Searching OriginalDocument for:", sourceToFind);
    const doc = await OriginalDocument.findOne({ source: sourceToFind }).lean();
    console.log("Original result:", doc ? doc._id : "NOT FOUND");

    const kDoc = await Knowledge.findOne({ 'metadata.source': sourceToFind }, 'metadata.source').lean();
    console.log("Knowledge result:", kDoc ? kDoc.metadata.source : "NOT FOUND");

    process.exit(0);
}

run().catch(console.error);
