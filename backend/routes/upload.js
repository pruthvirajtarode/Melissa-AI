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
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
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

        // Process document
        const processed = await processDocument(
            buffer,
            req.file.mimetype,
            req.file.originalname
        );

        // Prepare chunks for bulk addition
        const chunksToAdd = processed.chunks.map((chunk, index) => ({
            text: chunk,
            metadata: {
                source: processed.filename,
                filename: processed.filename,
                mimetype: processed.mimetype,
                summary: processed.summary,
                chunkIndex: index,
                totalChunks: processed.chunks.length,
                isActive: false // Set to false by default for admin review
            }
        }));

        // Save original document for download
        const OriginalDocument = require('../models/OriginalDocument');
        try {
            await OriginalDocument.findOneAndUpdate(
                { source: processed.filename },
                {
                    filename: processed.filename,
                    mimetype: processed.mimetype,
                    data: buffer,
                    size: req.file.size,
                    source: processed.filename
                },
                { upsert: true, new: true }
            );
            console.log(`✅ Original document saved: ${processed.filename}`);
        } catch (saveErr) {
            console.error('❌ Failed to save original document:', saveErr.message);
            // We continue processing even if original save fails, though ideally it shouldn't
        }

        // Add documents in bulk
        await vectorStore.addDocuments(chunksToAdd);

        res.json({
            message: 'Document processed and pending review',
            filename: processed.filename,
            chunks: processed.chunks.length
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to process document',
            message: error.message
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
