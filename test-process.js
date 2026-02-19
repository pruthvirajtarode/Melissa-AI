const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { processDocument } = require('./backend/services/documentProcessor');
const connectDB = require('./backend/config/db');

async function test() {
    await connectDB();
    const filePath = path.join(__dirname, 'NMV Online Content/Accelerate Track/Board Governance.docx');

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    try {
        const buffer = fs.readFileSync(filePath);
        const processed = await processDocument(buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Board Governance.docx');
        console.log('Success:', processed.chunks.length, 'chunks');
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

test();
