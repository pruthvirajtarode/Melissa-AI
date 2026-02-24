require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const officeparser = require('officeparser');
const pdfParse = require('pdf-parse');
const Knowledge = require('./backend/models/Knowledge');
const OriginalDocument = require('./backend/models/OriginalDocument');
const { generateEmbedding, summarizeDocument } = require('./backend/services/openai');

const NMV_FOLDER = path.join(__dirname, 'NMV Online Content');
const FILES = [
    "Optimize Track/Fundraising/Fundraising (Old)/Extended Pitch Deck Template.pptx",
    "Other/Non-PDF slides/1863 Sample Pitch Deck Template.pptx",
    "Scale Track/Founder_Cash_Flow_and_Reserve_Metrics_Guide.pdf"
];

function chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}

async function processFile(relPath) {
    const fullPath = path.join(NMV_FOLDER, relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ Skipping (not found): ${relPath}`);
        return;
    }

    console.log(`\n📦 Processing: ${relPath}`);
    const buffer = fs.readFileSync(fullPath);
    const filename = path.basename(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    let text = '';
    let mimetype = '';

    try {
        if (ext === '.pptx') {
            mimetype = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            text = await new Promise((resolve, reject) => {
                officeparser.parseOffice(buffer, (data, err) => {
                    if (err) reject(err); else resolve(data);
                });
            });
        } else if (ext === '.pdf') {
            mimetype = 'application/pdf';
            try {
                const data = await pdfParse(buffer);
                text = data.text;
            } catch (err) {
                console.warn(`⚠️ PDF parse failed for ${filename}, trying fallback...`);
                // Fallback for bad XRef
                text = `[Document: ${filename}. Content could not be fully extracted due to file formatting issues.]`;
            }
        }

        if (!text || text.trim().length === 0) {
            console.warn(`⚠️ No text extracted from ${filename}`);
            return;
        }

        const chunks = chunkText(text);
        console.log(`🧩 Extracted ${text.length} chars, created ${chunks.length} chunks.`);

        const summary = await summarizeDocument(text);
        console.log(`📝 Generated summary.`);

        // 1. Store Original Binary
        const existingOrig = await OriginalDocument.findOne({ source: filename });
        if (!existingOrig) {
            await OriginalDocument.create({
                source: filename,
                filename: filename,
                mimetype: mimetype,
                data: buffer,
                size: buffer.length
            });
            console.log(`💾 Binary stored in DB.`);
        }

        // 2. Store Chunks + Embeddings
        const chunksToInsert = [];
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await generateEmbedding(chunks[i]);
            chunksToInsert.push({
                text: chunks[i],
                embedding: embedding,
                metadata: {
                    source: filename,
                    filename: filename,
                    mimetype: mimetype,
                    summary: summary,
                    chunkIndex: i,
                    totalChunks: chunks.length,
                    isActive: true,
                    adminUploaded: true
                }
            });
            if ((i + 1) % 10 === 0) process.stdout.write('.');
        }

        await Knowledge.insertMany(chunksToInsert);
        console.log(`\n✅ Indexed ${chunksToInsert.length} chunks to Knowledge collection.`);

    } catch (err) {
        console.error(`❌ Error processing ${filename}:`, err.message);
    }
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const f of FILES) {
        await processFile(f);
    }

    console.log('\n🏁 Local processing complete!');
    await mongoose.disconnect();
}

run().catch(console.error);
