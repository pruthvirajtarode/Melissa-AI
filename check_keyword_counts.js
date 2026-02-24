require('dotenv').config();
const mongoose = require('mongoose');
const Knowledge = require('./backend/models/Knowledge');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const q1 = { $or: [{ text: /nmvu/i }, { 'metadata.source': /nmvu/i }, { 'metadata.filename': /nmvu/i }] };
    const q2 = { $or: [{ text: /optimize/i }, { 'metadata.source': /optimize/i }, { 'metadata.filename': /optimize/i }] };

    const countBoth = await Knowledge.countDocuments({ $and: [q1, q2], "metadata.isActive": true });
    console.log(`Chunks with BOTH "nmvu" and "optimize": ${countBoth}`);

    const countNMVu = await Knowledge.countDocuments({ $or: [{ text: /nmvu/i }, { 'metadata.source': /nmvu/i }], "metadata.isActive": true });
    console.log(`Chunks with "nmvu": ${countNMVu}`);

    const countOptimize = await Knowledge.countDocuments({ $or: [{ text: /optimize/i }, { 'metadata.source': /optimize/i }], "metadata.isActive": true });
    console.log(`Chunks with "optimize": ${countOptimize}`);

    await mongoose.disconnect();
}

check().catch(console.error);
