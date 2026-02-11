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
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const buffer = req.file.buffer;

        // Process document
        const processed = await processDocument(
            buffer,
            req.file.mimetype,
            req.file.originalname
        );

        // Add chunks to vector store
        const documentIds = [];
        for (const chunk of processed.chunks) {
            const id = await vectorStore.addDocument(chunk, {
                source: processed.filename,
                mimetype: processed.mimetype,
                chunkIndex: processed.chunks.indexOf(chunk),
                totalChunks: processed.chunks.length
            });
            documentIds.push(id);
        }

        res.json({
            message: 'Document processed successfully',
            filename: processed.filename,
            chunks: processed.chunks.length,
            documentIds
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

        const { scrapeWebPage, chunkText } = require('../services/documentProcessor');

        const text = await scrapeWebPage(url);
        const chunks = chunkText(text);

        const documentIds = [];
        for (const chunk of chunks) {
            const id = await vectorStore.addDocument(chunk, {
                source: url,
                type: 'webpage',
                chunkIndex: chunks.indexOf(chunk),
                totalChunks: chunks.length
            });
            documentIds.push(id);
        }

        res.json({
            message: 'Web page processed successfully',
            url,
            chunks: chunks.length,
            documentIds
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
