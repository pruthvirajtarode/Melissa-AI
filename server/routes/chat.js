const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/openai');
const vectorStore = require('../services/vectorStore');

// In-memory conversation storage (use database in production)
const conversations = new Map();

/**
 * POST /api/chat
 * Main chat endpoint
 */
router.post('/', async (req, res) => {
    try {
        const { message, conversationId = 'default' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const startTime = Date.now();

        // Get or create conversation
        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, []);
        }

        const conversation = conversations.get(conversationId);

        // Add user message to conversation
        conversation.push({
            role: 'user',
            content: message
        });

        // Search vector store for relevant context
        const relevantDocs = await vectorStore.search(message, 3);

        const context = relevantDocs
            .filter(doc => doc.similarity > 0.7) // Only use highly relevant docs
            .map(doc => doc.text)
            .join('\n\n');

        // Generate AI response
        const response = await generateResponse(conversation, context);

        // Add assistant response to conversation
        conversation.push({
            role: 'assistant',
            content: response
        });

        // Limit conversation history to last 10 messages
        if (conversation.length > 10) {
            conversations.set(conversationId, conversation.slice(-10));
        }

        const responseTime = Date.now() - startTime;

        res.json({
            response,
            conversationId,
            responseTime,
            contextUsed: relevantDocs.length > 0,
            relevantDocuments: relevantDocs.length
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process message',
            message: error.message
        });
    }
});

/**
 * GET /api/chat/conversations
 * Get all conversation IDs
 */
router.get('/conversations', (req, res) => {
    const conversationList = Array.from(conversations.keys()).map(id => ({
        id,
        messageCount: conversations.get(id).length,
        lastMessage: conversations.get(id).slice(-1)[0]
    }));

    res.json({ conversations: conversationList });
});

/**
 * GET /api/chat/conversation/:id
 * Get specific conversation
 */
router.get('/conversation/:id', (req, res) => {
    const { id } = req.params;
    const conversation = conversations.get(id);

    if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ conversation });
});

/**
 * DELETE /api/chat/conversation/:id
 * Delete conversation
 */
router.delete('/conversation/:id', (req, res) => {
    const { id } = req.params;

    if (conversations.has(id)) {
        conversations.delete(id);
        res.json({ message: 'Conversation deleted' });
    } else {
        res.status(404).json({ error: 'Conversation not found' });
    }
});

module.exports = router;
