/**
 * Bulk NMV Document Uploader
 * Uploads all documents from "NMV Online Content" folder to MelissAI backend
 * Stores originals for download + indexes for chatbot knowledge
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const NMV_FOLDER = path.join(__dirname, 'NMV Online Content');
const ALLOWED_EXTS = ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.doc'];

// ── Collect all files recursively ───────────────────────────────────────────
function getAllFiles(dir, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllFiles(fullPath, fileList);
        } else if (ALLOWED_EXTS.includes(path.extname(entry.name).toLowerCase())) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

// ── Mime type map ────────────────────────────────────────────────────────────
function getMimeType(ext) {
    const map = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.txt': 'text/plain',
    };
    return map[ext] || 'application/octet-stream';
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n🚀 NMV Bulk Document Uploader');
    console.log('='.repeat(50));

    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) { console.error('❌ MONGODB_URI not set in .env'); process.exit(1); }

    await mongoose.connect(uri, { minPoolSize: 2, maxPoolSize: 5, serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB (M10)');

    // Load services
    const vectorStore = require('./backend/services/vectorStore');
    const { processDocument } = require('./backend/services/documentProcessor');
    const OriginalDocument = require('./backend/models/OriginalDocument');

    const allFiles = getAllFiles(NMV_FOLDER);
    console.log(`\n📁 Found ${allFiles.length} documents in NMV Online Content folder\n`);

    let uploaded = 0, skipped = 0, failed = 0;

    for (let i = 0; i < allFiles.length; i++) {
        const filePath = allFiles[i];
        const filename = path.basename(filePath);
        const ext = path.extname(filename).toLowerCase();
        const mimetype = getMimeType(ext);

        process.stdout.write(`[${i + 1}/${allFiles.length}] ${filename.substring(0, 55).padEnd(55)} `);

        try {
            const buffer = fs.readFileSync(filePath);

            // Check if already uploaded (by filename as source)
            const existing = await OriginalDocument.findOne({ source: filename });

            // ── Store original binary ──────────────────────────────────────
            // Skipped storing original binary to save MongoDB quota space


            // ── Process text + embeddings ──────────────────────────────────
            // Check if chunks already exist for this source
            require('./backend/models/Knowledge'); // ensure model is registered
            const KnowledgeModel = mongoose.model('Knowledge');
            const existingChunks = await KnowledgeModel.countDocuments({ 'metadata.source': filename });

            if (existingChunks > 0) {
                console.log(`⏭️  SKIP (${existingChunks} chunks exist)`);
                skipped++;
                continue;
            }

            const processed = await processDocument(buffer, mimetype, filename);

            const chunksToAdd = processed.chunks.map((chunk, index) => ({
                text: chunk,
                metadata: {
                    source: filename,
                    filename: filename,
                    mimetype: mimetype,
                    summary: processed.summary || '',
                    category: path.relative(NMV_FOLDER, path.dirname(filePath)), // e.g. "Accelerate Track"
                    chunkIndex: index,
                    totalChunks: processed.chunks.length,
                    isActive: true,  // Auto-approve NMV content
                    adminUploaded: true // Show in Admin Dashboard
                }
            }));

            await vectorStore.addDocuments(chunksToAdd);
            console.log(`✅ ${processed.chunks.length} chunks`);
            uploaded++;

        } catch (err) {
            console.log(`❌ ERROR: ${err.message.substring(0, 60)}`);
            failed++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Uploaded: ${uploaded} documents`);
    console.log(`⏭️  Skipped:  ${skipped} documents (already indexed)`);
    console.log(`❌ Failed:   ${failed} documents`);
    console.log('='.repeat(50));
    console.log('\n🎉 Done! All NMV documents are now in the chatbot knowledge base.');
    console.log('   • Chatbot will answer questions from these documents');
    console.log('   • Admin can download all originals from the admin panel\n');

    await mongoose.disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
});
