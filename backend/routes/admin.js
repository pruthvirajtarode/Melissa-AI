const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const vectorStore = require('../services/vectorStore');
const { SYSTEM_PROMPT } = require('../services/openai');

// Simple authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

/**
 * POST /api/admin/login
 * Admin login
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Simple authentication (use database in production)
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token, username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/admin/documents
 * Get all documents
 */
router.get('/documents', authenticateAdmin, async (req, res) => {
    try {
        const documents = await vectorStore.getGroupedDocuments();
        res.json({ documents });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

/**
 * POST /api/admin/document/approve
 * Approve/Activate document
 */
router.post('/document/approve', authenticateAdmin, async (req, res) => {
    try {
        const { source } = req.body;
        if (!source) return res.status(400).json({ error: 'Source is required' });

        const count = await vectorStore.approveBySource(source);
        res.json({ message: 'Document approved and added to chatbot knowledge', chunksActivated: count });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ error: 'Failed to approve document' });
    }
});

/**
 * DELETE /api/admin/document/:id
 * Delete document
 */
router.delete('/document/source', authenticateAdmin, async (req, res) => {
    try {
        const { source } = req.query;
        if (!source) return res.status(400).json({ error: 'Source is required' });

        const count = await vectorStore.deleteBySource(source);
        res.json({ message: 'Document deleted successfully', chunksDeleted: count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

/**
 * POST /api/admin/reindex
 * Re-index all documents
 */
router.post('/reindex', authenticateAdmin, async (req, res) => {
    try {
        await vectorStore.reindex();
        res.json({ message: 'Re-indexing completed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Re-indexing failed' });
    }
});

/**
 * GET /api/admin/analytics
 * Get usage analytics
 */
router.get('/analytics', authenticateAdmin, async (req, res) => {
    try {
        await vectorStore.ready;
        const grouped = await vectorStore.getGroupedDocuments();
        const analytics = {
            totalDocuments: grouped.length,
            totalChunks: vectorStore.documents.length,
            storageSize: JSON.stringify(vectorStore.documents).length,
        };

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/admin/system-prompt
 * Get system prompt
 */
router.get('/system-prompt', authenticateAdmin, (req, res) => {
    res.json({ systemPrompt: SYSTEM_PROMPT });
});

/**
 * DELETE /api/admin/clear-all
 * Clear all documents
 */
router.delete('/clear-all', authenticateAdmin, async (req, res) => {
    try {
        await vectorStore.clearAll();
        res.json({ message: 'All documents cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear documents' });
    }
});

module.exports = router;
