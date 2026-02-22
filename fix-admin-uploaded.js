require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);

    // Load Knowledge model
    require('./backend/models/Knowledge');
    const KnowledgeModel = mongoose.model('Knowledge');

    // Find how many documents are missing adminUploaded: true
    const count = await KnowledgeModel.countDocuments({ 'metadata.adminUploaded': { $ne: true } });
    console.log(`Found ${count} chunks missing adminUploaded: true`);

    // Update them all to be adminUploaded: true so they show in Admin Panel
    if (count > 0) {
        const result = await KnowledgeModel.updateMany({ 'metadata.adminUploaded': { $ne: true } }, { $set: { 'metadata.adminUploaded': true } });
        console.log(`Updated ${result.modifiedCount} chunks to have adminUploaded: true`);
    }

    await mongoose.disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
