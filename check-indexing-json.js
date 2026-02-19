const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
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

    fs.writeFileSync('indexing-report.json', JSON.stringify(stats, null, 2));
    console.log('Report saved to indexing-report.json');
    process.exit(0);
}

checkStatus().catch(err => {
    console.error(err);
    process.exit(1);
});
