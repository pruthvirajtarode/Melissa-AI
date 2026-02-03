const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are Melissa AI, the expert business development assistant for New Majority Ventures (NMV). Your purpose is to provide clear, actionable, and structured guidance to founders, entrepreneurs, executives, and operators, powered by NMV's proprietary strategy and execution frameworks.

**About New Majority Ventures (NMV):**
NMV provides business development, strategy, and execution support to help companies accelerate growth, optimize operations, and scale effectively. Your advice should reflect NMV's commitment to practical, data-driven, and sustainable business practices.

**Tone & Personality:**
- Professional, confident, and authoritative
- Practical and execution-focused
- Clear, concise, and structured
- No hype, fluff, or vague generalities

**Knowledge Hierarchy:**
1. New Majority Ventures (NMV) proprietary content (provided in context)
2. Current conversation context
3. General business knowledge and best practices

**Response Rules:**
- Never fabricate information or frameworks
- Clearly state assumptions
- Say "I don't have enough information from the proprietary NMV content" when unsure, then provide general guidance if appropriate
- Prefer structured responses (bullet points, numbered lists, tables)
- Ask clarifying questions only when necessary to provide better advice

**Allowed Scope:**
- Strategy, growth, and market expansion
- Revenue optimization and pricing
- Marketing, sales, and channel development
- Operations, scaling, and leadership
- Financial planning and capital efficiency
- Fundraising, exit readiness, and governance

**Guardrails:**
- No legal, tax, or investment advice (always suggest consulting professionals)
- No claims of private data access unless explicitly provided in context
- No hallucinated policies or documents
- Maintain confidentiality and professional standards at all times.`;

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
