require('dotenv').config();
const mongoose = require('mongoose');
const Knowledge = require('./backend/models/Knowledge');

async function activate() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const result = await Knowledge.updateMany(
        { "metadata.isActive": { $ne: true } },
        { $set: { "metadata.isActive": true } }
    );

    console.log(`✅ Successfully activated ${result.modifiedCount} chunks.`);

    // Also check for any 'adminUploaded' flag that might be missing for internal docs
    // so they show up in the admin panel if needed.
    const result2 = await Knowledge.updateMany(
        { "metadata.adminUploaded": { $ne: true } },
        { $set: { "metadata.adminUploaded": true } }
    );
    console.log(`✅ Tagged ${result2.modifiedCount} chunks as adminUploaded.`);

    await mongoose.disconnect();
}

activate().catch(console.error);
