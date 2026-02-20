require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const docs = await mongoose.connection.collection('knowledges').aggregate([
        {
            $match: {
                $or: [
                    { 'metadata.adminUploaded': true },
                    { 'metadata.category': { $exists: false } }
                ]
            }
        },
        { $limit: 3 },
        { $project: { embedding: 0, text: 0 } }
    ]).toArray();
    fs.writeFileSync('docs-match.json', JSON.stringify(docs, null, 2));
    mongoose.disconnect();
});
