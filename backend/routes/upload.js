const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { processDocument } = require('../services/documentProcessor');
const vectorStore = require('../services/vectorStore');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit (increased from 10MB)
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // XLSX
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
            'text/plain',
            // Some browsers send these MIME types for office files
            'application/octet-stream',
            'application/msword'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, DOCX, XLSX, PPTX, TXT`));
        }
    }
});

/**
 * POST /api/upload
 * Upload and process document
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            console.warn('⚠️ No file received in upload request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`📥 Received file: ${req.file.originalname} (${req.file.mimetype}), Size: ${req.file.size} bytes`);
        const buffer = req.file.buffer;

        // Process document — extract text, chunk, summarize
        const processed = await processDocument(
            buffer,
            req.file.mimetype,
            req.file.originalname
        );

        // Prepare chunks for vector store
        // isActive: true — admin uploads are trusted and immediately active
        const chunksToAdd = processed.chunks.map((chunk, index) => ({
            text: chunk,
            metadata: {
                source: processed.filename,
                filename: processed.filename,
                mimetype: processed.mimetype,
                summary: processed.summary || '',
                chunkIndex: index,
                totalChunks: processed.chunks.length,
                isActive: true  // ✅ Auto-approve admin uploads — show immediately
            }
        }));

        // ✅ Store original file binary in MongoDB for download support
        // M10 cluster has 10GB dedicated storage — safe to store originals
        try {
            const OriginalDocument = require('../models/OriginalDocument');
            const existingDoc = await OriginalDocument.findOne({ source: processed.filename });
            if (!existingDoc) {
                await OriginalDocument.create({
                    source: processed.filename,
                    filename: processed.filename,
                    mimetype: processed.mimetype,
                    data: buffer,
                    size: buffer.length
                });
                console.log(`💾 Original file stored in DB: ${processed.filename} (${buffer.length} bytes)`);
            }
        } catch (storageErr) {
            console.warn(`⚠️ Could not store original binary: ${storageErr.message}`);
        }

        // Add text chunks + embeddings to vector store
        await vectorStore.addDocuments(chunksToAdd);

        res.json({
            message: `Document uploaded and active! ${processed.chunks.length} chunks indexed.`,
            filename: processed.filename,
            chunks: processed.chunks.length,
            status: 'active'
        });


    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to process document',
            message: error.message || 'Unknown error occurred during processing'
        });
    }
});


/**
 * POST /api/upload/url
 * Process web page from URL
 */
router.post('/url', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const { scrapeWebPage, chunkText, summarizeDocument } = require('../services/documentProcessor');

        const text = await scrapeWebPage(url);
        const chunks = chunkText(text);
        const summary = await summarizeDocument(text);

        // Prepare chunks for bulk addition
        const chunksToAdd = chunks.map((chunk, index) => ({
            text: chunk,
            metadata: {
                source: url,
                type: 'webpage',
                summary: summary,
                chunkIndex: index,
                totalChunks: chunks.length,
                isActive: false // Set to false by default for admin review
            }
        }));

        // Add documents in bulk
        await vectorStore.addDocuments(chunksToAdd);

        res.json({
            message: 'Web page processed and pending review',
            url,
            chunks: chunks.length
        });

    } catch (error) {
        console.error('URL processing error:', error);
        res.status(500).json({
            error: 'Failed to process URL',
            message: error.message
        });
    }
});

module.exports = router;
