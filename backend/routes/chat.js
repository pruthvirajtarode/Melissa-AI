const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/openai');
const vectorStore = require('../services/vectorStore');
const OpenAI = require('openai');
const { SYSTEM_PROMPT } = require('../services/openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory conversation storage (use database in production)
const conversations = new Map();

// ─── Simple query-level response cache (avoids re-embedding same questions) ───
const queryCache = new Map();
const CACHE_MAX = 50;  // max entries before evicting oldest
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(query) {
    const key = query.toLowerCase().trim();
    const entry = queryCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.context;
    return null;
}

function setCache(query, context) {
    const key = query.toLowerCase().trim();
    if (queryCache.size >= CACHE_MAX) {
        // Evict the first (oldest) entry
        queryCache.delete(queryCache.keys().next().value);
    }
    queryCache.set(key, { context, ts: Date.now() });
}

// ─── Helper: build context from vector search ────────────────────────────────
async function buildContext(message) {
    // Check cache first to avoid redundant OpenAI embedding calls
    const cached = getCached(message);
    if (cached !== null) {
        console.log(`⚡ Cache hit for query`);
        return cached;
    }

    const relevantDocs = await vectorStore.search(message, 2); // 2 docs is enough
    let context = '';
    let maxSimilarity = 0;

    relevantDocs.forEach(doc => {
        if (doc.similarity > maxSimilarity) maxSimilarity = doc.similarity;
        if (doc.similarity > 0.72) {
            context += `\n[Source: ${doc.source}]\n${doc.text}\n`;
        }
    });

    // Cap context to keep prompt small and fast
    if (context.length > 800) context = context.substring(0, 800) + '...';

    console.log(`🔍 Max similarity: ${maxSimilarity.toFixed(3)}, context: ${context.length} chars`);
    setCache(message, context);
    return context;
}

/**
 * POST /api/chat/stream
 * Streaming chat endpoint using Server-Sent Events — tokens arrive word-by-word
 */
router.post('/stream', async (req, res) => {
    try {
        const { message, conversationId = 'default' } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        // Get or create conversation
        if (!conversations.has(conversationId)) conversations.set(conversationId, []);
        const conversation = conversations.get(conversationId);

        conversation.push({ role: 'user', content: message });

        // Build context
        const context = await buildContext(message);

        // Build system message
        const systemContent = context
            ? SYSTEM_PROMPT + `\n\n**Relevant Internal Content:**\n${context}`
            : SYSTEM_PROMPT;

        // Stream from OpenAI
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemContent }, ...conversation],
            temperature: 0.1,
            max_tokens: 150,
            top_p: 0.9,
            stream: true,
        });

        let fullResponse = '';

        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) {
                fullResponse += token;
                // Send each token as an SSE event
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        // Signal completion
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

        // Save full response to conversation history
        conversation.push({ role: 'assistant', content: fullResponse });
        if (conversation.length > 6) {
            conversations.set(conversationId, conversation.slice(-6));
        }

    } catch (error) {
        console.error('Stream chat error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
        res.end();
    }
});

/**
 * POST /api/chat
 * Standard (non-streaming) chat endpoint — kept for backward compatibility
 */
router.post('/', async (req, res) => {
    try {
        const { message, conversationId = 'default' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const startTime = Date.now();

        // Get or create conversation
        if (!conversations.has(conversationId)) conversations.set(conversationId, []);
        const conversation = conversations.get(conversationId);

        conversation.push({ role: 'user', content: message });

        const context = await buildContext(message);

        // Generate AI response
        const response = await generateResponse(conversation, context);

        conversation.push({ role: 'assistant', content: response });

        if (conversation.length > 6) {
            conversations.set(conversationId, conversation.slice(-6));
        }

        const responseTime = Date.now() - startTime;

        res.json({ response, conversationId, responseTime, contextUsed: !!context });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process message', message: error.message });
    }
});

/**
 * GET /api/chat/conversations
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
 */
router.get('/conversation/:id', (req, res) => {
    const { id } = req.params;
    const conversation = conversations.get(id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ conversation });
});

/**
 * DELETE /api/chat/conversation/:id
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

