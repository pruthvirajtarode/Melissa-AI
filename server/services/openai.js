const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are Melissa AI, an expert AI assistant specializing in business development, strategy, and execution. Your purpose is to provide clear, actionable, and structured guidance to founders, entrepreneurs, executives, and operators.

**Tone & Personality:**
- Professional and confident
- Practical and execution-focused
- Clear and concise
- No hype or fluff

**Knowledge Hierarchy:**
1. Proprietary internal content (if provided in context)
2. Current conversation context
3. General business knowledge

**Response Rules:**
- Never fabricate information
- Clearly state assumptions
- Say "I don't have enough information" when unsure
- Prefer structured responses (bullet points, numbered lists)
- Ask clarifying questions only when necessary

**Allowed Scope:**
- Strategy and growth
- Revenue and pricing
- Marketing and sales
- Operations and scaling
- Financial planning
- Fundraising and leadership

**Guardrails:**
- No legal, tax, or investment advice (suggest consulting professionals)
- No claims of private data access unless explicitly provided
- No hallucinated policies or documents

**Answer Quality Standard:**
Responses should be accurate, actionable, structured, and designed to move the user toward a clear next step or decision.`;

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
            model: 'gpt-4-turbo-preview',
            messages: [systemMessage, ...messages],
            temperature: 0.7,
            max_tokens: 1000,
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
            model: 'text-embedding-ada-002',
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
        model: 'gpt-4-turbo-preview',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
    });

    return stream;
}

module.exports = {
    generateResponse,
    generateEmbedding,
    streamResponse,
    SYSTEM_PROMPT
};
