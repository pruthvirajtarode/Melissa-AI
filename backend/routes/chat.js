const express = require('express');
const router = express.Router();
const { generateResponse, SYSTEM_PROMPT } = require('../services/openai');
const vectorStore = require('../services/vectorStore');
const OpenAI = require('openai');
const Conversation = require('../models/Conversation');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Response cache (avoids re-embedding same questions) ─────────────────────
const queryCache = new Map();
const CACHE_MAX = 50;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

function getCached(query) {
    const key = query.toLowerCase().trim();
    const entry = queryCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.context;
    return null;
}

function setCache(query, context) {
    const key = query.toLowerCase().trim();
    if (queryCache.size >= CACHE_MAX) queryCache.delete(queryCache.keys().next().value);
    queryCache.set(key, { context, ts: Date.now() });
}

// ─── Helper: Vector-search context ───────────────────────────────────────────
async function buildContext(message) {
    const cached = getCached(message);
    if (cached !== null) { console.log('⚡ Cache hit'); return cached; }

    const relevantDocs = await vectorStore.search(message, 3);
    let context = '';
    let maxSim = 0;

    relevantDocs.forEach(doc => {
        if (doc.similarity > maxSim) maxSim = doc.similarity;
        if (doc.similarity > 0.62) {
            context += `\n[Source: ${doc.source}]\n${doc.text}\n`;
        }
    });

    if (context.length > 1200) context = context.substring(0, 1200) + '...';
    console.log(`🔍 Max similarity: ${maxSim.toFixed(3)}, context: ${context.length} chars`);
    setCache(message, context);
    return context;
}

// ─── Helper: Load conversation messages from MongoDB ─────────────────────────
async function getConversation(conversationId) {
    try {
        let conv = await Conversation.findOne({ conversationId });
        if (!conv) conv = new Conversation({ conversationId, messages: [] });
        return conv;
    } catch (e) {
        console.warn('DB conversation load failed, using empty:', e.message);
        return { conversationId, messages: [], save: async () => { } };
    }
}

// ─── Helper: Save conversation to MongoDB ────────────────────────────────────
async function saveConversation(conv) {
    try {
        // Keep last 10 messages to avoid document bloat
        if (conv.messages.length > 10) conv.messages = conv.messages.slice(-10);
        conv.updatedAt = new Date();
        await conv.save();
    } catch (e) {
        console.warn('DB conversation save failed:', e.message);
    }
}

/**
 * POST /api/chat/stream — Streaming chat with SSE
 */
router.post('/stream', async (req, res) => {
    try {
        const { message, conversationId = `conv_${Date.now()}` } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        // Load from DB
        const conv = await getConversation(conversationId);
        conv.messages.push({ role: 'user', content: message });

        const context = await buildContext(message);
        const systemContent = context
            ? SYSTEM_PROMPT + `\n\n**Relevant Internal Content:**\n${context}`
            : SYSTEM_PROMPT;

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemContent }, ...conv.messages.slice(-6).map(m => ({ role: m.role, content: m.content }))],
            temperature: 0.1,
            max_tokens: 200,
            top_p: 0.9,
            stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) {
                fullResponse += token;
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();

        // Persist to MongoDB
        conv.messages.push({ role: 'assistant', content: fullResponse });
        await saveConversation(conv);

    } catch (error) {
        console.error('Stream chat error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
        res.end();
    }
});

/**
 * POST /api/chat — Standard (non-streaming) endpoint
 */
router.post('/', async (req, res) => {
    try {
        const { message, conversationId = `conv_${Date.now()}` } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const startTime = Date.now();
        const conv = await getConversation(conversationId);
        conv.messages.push({ role: 'user', content: message });

        const context = await buildContext(message);
        const response = await generateResponse(conv.messages.slice(-6).map(m => ({ role: m.role, content: m.content })), context);

        conv.messages.push({ role: 'assistant', content: response });
        await saveConversation(conv);

        res.json({ response, conversationId, responseTime: Date.now() - startTime, contextUsed: !!context });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process message', message: error.message });
    }
});

/**
 * GET /api/chat/conversations — List all conversations for admin panel
 */
router.get('/conversations', async (req, res) => {
    try {
        const convs = await Conversation.find({}, {
            conversationId: 1,
            messages: { $slice: -1 }, // only last message
            updatedAt: 1,
            createdAt: 1
        }).sort({ updatedAt: -1 }).limit(50).lean();

        const conversationList = convs.map(c => ({
            id: c.conversationId,
            messageCount: c.messages?.length || 0,
            lastMessage: c.messages?.[0] || null,
            updatedAt: c.updatedAt,
            createdAt: c.createdAt
        }));

        res.json({ conversations: conversationList });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.json({ conversations: [] });
    }
});

/**
 * GET /api/chat/conversation/:id — Get full conversation
 */
router.get('/conversation/:id', async (req, res) => {
    try {
        const conv = await Conversation.findOne({ conversationId: req.params.id }).lean();
        if (!conv) return res.status(404).json({ error: 'Conversation not found' });
        res.json({ conversation: conv.messages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load conversation' });
    }
});

/**
 * DELETE /api/chat/conversation/:id
 */
router.delete('/conversation/:id', async (req, res) => {
    try {
        await Conversation.deleteOne({ conversationId: req.params.id });
        res.json({ message: 'Conversation deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

module.exports = router;
