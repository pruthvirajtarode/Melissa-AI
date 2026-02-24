require('dotenv').config();
const mongoose = require('mongoose');
const Knowledge = require('./backend/models/Knowledge');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const sourcesInDB = await Knowledge.distinct('metadata.source');
    console.log(`Unique sources in DB: ${sourcesInDB.length}`);

    const introDocs = sourcesInDB.filter(s => /intro/i.test(s));
    console.log(`Intro docs in DB: ${introDocs.length}`);

    const stats = await Knowledge.aggregate([
        {
            $group: {
                _id: '$metadata.source',
                total: { $sum: 1 },
                active: { $sum: { $cond: ['$metadata.isActive', 1, 0] } }
            }
        },
        {
            $match: {
                _id: { $in: introDocs }
            }
        }
    ]);

    console.log('\nStatus of Intro Documents:');
    stats.forEach(s => {
        console.log(`- ${s._id}: ${s.active}/${s.total} active`);
    });

    // Also check for "NMVU Optimize" related docs
    const optimizeDocs = sourcesInDB.filter(s => /optimize/i.test(s));
    const optimizeStats = await Knowledge.aggregate([
        {
            $group: {
                _id: '$metadata.source',
                total: { $sum: 1 },
                active: { $sum: { $cond: ['$metadata.isActive', 1, 0] } }
            }
        },
        {
            $match: {
                _id: { $in: optimizeDocs }
            }
        }
    ]);

    console.log('\nStatus of Optimize Documents:');
    optimizeStats.forEach(s => {
        if (s.active < s.total) {
            console.log(`- ${s._id}: ${s.active}/${s.total} active`);
        }
    });

    await mongoose.disconnect();
}

check().catch(console.error);
