const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Knowledge = require('./backend/models/Knowledge');
const connectDB = require('./backend/config/db');

async function checkStatus() {
    await connectDB();

    const stats = await Knowledge.aggregate([
        {
            $group: {
                _id: "$metadata.source",
                count: { $sum: 1 },
                activeCount: { $sum: { $cond: [{ $eq: ["$metadata.isActive", true] }, 1, 0] } }
            }
        },
        { $sort: { count: -1 } }
    ]);

    console.log(`Unique Sources Found: ${stats.length}`);
    console.log('--------------------------------------------------');
    stats.forEach(s => {
        console.log(`Source: ${s._id}`);
        console.log(`  - Total Chunks: ${s.count}`);
        console.log(`  - Active Chunks: ${s.activeCount}`);
    });

    process.exit(0);
}

checkStatus().catch(err => {
    console.error(err);
    process.exit(1);
});
