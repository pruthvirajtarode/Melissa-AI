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

        // Search vector store — 3 results is enough and faster than 5
        const relevantDocs = await vectorStore.search(message, 3);

        let context = "";
        let maxSimilarity = 0;

        console.log(`🔍 Chat Search: found ${relevantDocs.length} potential matches`);

        relevantDocs.forEach(doc => {
            if (doc.similarity > maxSimilarity) maxSimilarity = doc.similarity;

            // Higher threshold 0.72 — only include genuinely relevant chunks
            if (doc.similarity > 0.72) {
                console.log(`   ✅ Match: ${doc.source} (Score: ${doc.similarity.toFixed(3)})`);
                context += `\n[Source: ${doc.source}]\n${doc.text}\n`;
            } else {
                console.log(`   ❌ Skip: ${doc.source} (Score: ${doc.similarity.toFixed(3)})`);
            }
        });

        // Cap context length to keep OpenAI request small and fast
        if (context.length > 1500) {
            context = context.substring(0, 1500) + '...';
        }

        if (relevantDocs.length > 0 && !context) {
            console.warn(`⚠️ No matches passed similarity threshold (Max: ${maxSimilarity.toFixed(3)})`);
        }

        // Generate AI response
        const response = await generateResponse(conversation, context);

        // Add assistant response to conversation
        conversation.push({
            role: 'assistant',
            content: response
        });

        // Limit conversation history to last 6 messages (3 exchanges) for speed
        if (conversation.length > 6) {
            conversations.set(conversationId, conversation.slice(-6));
        }

        const responseTime = Date.now() - startTime;

        res.json({
            response,
            conversationId,
            responseTime,
            contextUsed: !!context,
            relevantDocuments: relevantDocs.length,
            debug: {
                maxScore: maxSimilarity,
                topMatches: relevantDocs.slice(0, 3).map(d => ({
                    source: d.source,
                    score: d.similarity
                }))
            }
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
