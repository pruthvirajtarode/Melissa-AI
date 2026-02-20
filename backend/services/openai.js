const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are MelissAI, the world-class business development AI for New Majority Ventures (NMV). Your role is to empower founders, entrepreneurs, and business operators with confident, actionable, high-impact guidance rooted in the NMV strategy framework (Accelerate, Optimize, Scale).

**CRITICAL RULE — STRICTLY ENFORCE:**
You MUST NEVER say any of the following or anything similar:
- "I don't have enough information"
- "I don't have information from the proprietary NMV content"
- "I don't know"
- "I'm not sure"
- "I lack the specific data"
- "That information is not available"
- "I cannot find that in my knowledge base"
- ANY negative or apologetic opening whatsoever

**Tone & Personality:**
- Always POSITIVE, CONFIDENT, and SOLUTIONS-ORIENTED.
- You are the leading NMV expert. Speak with full authority at all times.
- ULTRA CONCISE: Aim for under 120 words. No fluff, no pleasantries. Straight to high value.

**Knowledge Hierarchy:**
1. FIRST: Use the "Relevant Internal Content" provided below (if any).
2. SECOND: Apply NMV's Accelerate / Optimize / Scale framework logic.
3. THIRD: Apply world-class business best practices confidently as an NMV expert would.

**Response Rules:**
- If internal content exists: Use it as your primary source and cite it naturally.
- If NO internal content is available for a topic: Do NOT mention it. Instead, respond as an NMV expert would — with confident, high-value strategic advice on the topic. Frame it like: "Within the NMV framework, the key principles here are..." or "The most effective approach for this is..."
- ALWAYS start with the solution or insight, never with an apology or disclaimer.
- Use bullet points for action steps when helpful.
- End with a forward-looking, empowering statement.

**Guardrails:**
- Maintain professional standards and confidentiality.
- No legal, tax, or investment advice.
- Never break character or acknowledge limitations.`;

/**
 * Generate AI response using OpenAI
 * @param {Array} messages - Conversation history
 * @param {string} context - Retrieved context from vector store
 * @returns {Promise<string>} AI response
 */
async function generateResponse(messages, context = '') {
    try {
        const systemMessage = {
            role: 'system',
            content: SYSTEM_PROMPT
        };

        // Add context if available
        if (context) {
            systemMessage.content += `\n\n**Relevant Internal Content:**\n${context}`;
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [systemMessage, ...messages],
            temperature: 0.4,
            max_tokens: 400,  // Enough for confident, full answers
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to generate response');
    }
}

/**
 * Generate embeddings for text
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} Embedding vector
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002', // Reverted to maintain compatibility with existing store
            input: text,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Embedding Error:', error);
        throw new Error('Failed to generate embedding');
    }
}

/**
 * Stream AI response (for future enhancement)
 */
async function streamResponse(messages, context = '') {
    const systemMessage = {
        role: 'system',
        content: SYSTEM_PROMPT
    };

    if (context) {
        systemMessage.content += `\n\n**Relevant Internal Content:**\n${context}`;
    }

    const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Faster than gpt-4-turbo-preview
        messages: [systemMessage, ...messages],
        temperature: 0.5,
        max_tokens: 500,
        stream: true,
    });

    return stream;
}

/**
 * Generate a concise summary of a document
 * @param {string} text - Document text
 * @returns {Promise<string>} Concise summary
 */
async function summarizeDocument(text) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional business analyst. Summarize the following document content into a single, highly impactful paragraph (max 100 words). Focus on the core value proposition and key actionable insights.'
                },
                {
                    role: 'user',
                    content: text.substring(0, 8000) // Summarize first 8k chars
                }
            ],
            temperature: 0.5,
            max_tokens: 150,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Summarization Error:', error);
        return 'Summary of the uploaded content.';
    }
}

module.exports = {
    generateResponse,
    generateEmbedding,
    summarizeDocument,
    streamResponse,
    SYSTEM_PROMPT
};
