const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { processDocument } = require('../services/documentProcessor');
const vectorStore = require('../services/vectorStore');

const CONTENT_DIR = path.join(__dirname, '../../NMV Online Content');

/**
 * Recursively walk directory and find files
 */
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            const ext = path.extname(file).toLowerCase();
            if (ext === '.docx' || ext === '.pdf' || ext === '.txt') {
                results.push(file);
            }
        }
    });
    return results;
}

async function bulkIndex() {
    console.log('🚀 Starting bulk indexing of NMV Online Content...');

    if (!fs.existsSync(CONTENT_DIR)) {
        console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
        return;
    }

    const files = walk(CONTENT_DIR);
    console.log(`Found ${files.length} supported files to process.`);

    let totalChunks = 0;

    // Process files in sequence to avoid hitting rate limits too hard
    for (let i = 0; i < files.length; i++) {
        const filePath = files[i];
        const relativePath = path.relative(CONTENT_DIR, filePath);
        const folderName = path.dirname(relativePath).split(path.sep)[0] || 'Other';
        const fileName = path.basename(filePath);

        console.log(`\n[${i + 1}/${files.length}] Processing: ${relativePath}`);

        try {
            const buffer = fs.readFileSync(filePath);
            const mimetype = getMimetype(filePath);

            const processed = await processDocument(buffer, mimetype, fileName);

            console.log(`   Extracted ${processed.chunks.length} chunks.`);

            const docsToAdd = processed.chunks.map((chunk, index) => ({
                text: chunk,
                metadata: {
                    source: fileName,
                    path: relativePath,
                    category: folderName,
                    mimetype: processed.mimetype,
                    chunkIndex: index,
                    totalChunks: processed.chunks.length,
                    indexedAt: new Date().toISOString()
                }
            }));

            await vectorStore.addDocuments(docsToAdd);
            totalChunks += processed.chunks.length;

        } catch (error) {
            console.error(`   ❌ Error processing ${fileName}:`, error.message);
        }
    }

    console.log(`\n✨ Bulk indexing complete!`);
    console.log(`Total files processed: ${files.length}`);
    console.log(`Total chunks added: ${totalChunks}`);
}

function getMimetype(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.pdf': return 'application/pdf';
        case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case '.txt': return 'text/plain';
        default: return 'application/octet-stream';
    }
}

// Ensure vector store is loaded before starting
setTimeout(() => {
    bulkIndex().catch(err => {
        console.error('Fatal error during bulk indexing:', err);
    });
}, 1000);
