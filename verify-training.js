const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Knowledge = require('./backend/models/Knowledge');
const connectDB = require('./backend/config/db');

const CONTENT_DIR = path.join(__dirname, 'NMV Online Content');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            const ext = path.extname(fullPath).toLowerCase();
            const fileName = path.basename(fullPath);
            if ((ext === '.docx' || ext === '.pdf' || ext === '.txt' || ext === '.pptx' || ext === '.xlsx' || ext === '.csv') &&
                !fileName.startsWith('~$') && !fileName.startsWith('.')) {
                results.push(path.relative(CONTENT_DIR, fullPath));
            }
        }
    });
    return results;
}

async function verifyAll() {
    await connectDB();
    const localFiles = walk(CONTENT_DIR);
    const dbSources = await Knowledge.distinct('metadata.source');
    const dbSourcesSet = new Set(dbSources);

    const missing = localFiles.filter(f => !dbSourcesSet.has(f));

    console.log(`PROGRESS_SUMMARY:`);
    console.log(`TOTAL_LOCAL_FILES: ${localFiles.length}`);
    console.log(`TOTAL_SOURCES_IN_DB: ${dbSources.length}`);
    console.log(`MISSING_FILES: ${missing.length}`);

    if (missing.length === 0) {
        console.log('STATUS: COMPLETE_SUCCESS');
    } else {
        console.log('STATUS: IN_PROGRESS');
        console.log('SAMPLE_MISSING:', missing.slice(0, 5));
    }

    process.exit(0);
}

verifyAll();
