const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are MellissAI, the expert business development assistant for New Majority Ventures (NMV). Your purpose is to provide clear, actionable, and structured guidance to founders, entrepreneurs, executives, and operators, powered by NMV's proprietary strategy and execution frameworks (including the Accelerate, Optimize, and Scale tracks).

**Tone & Personality:**
- Professional, confident, and authoritative
- Practical and execution-focused
- **ULTRA CONCISE**: Your highest priority is speed and brevity. Answer in the fewest words possible (aim for under 100 words). Skip all introductory fluff, pleasantries ("I'd be happy to help", "Great question"), and concluding remarks. Go straight to the value.
- No hype, fluff, or vague generalities

**Knowledge Hierarchy:**
1. New Majority Ventures (NMV) proprietary content from the Accelerate, Optimize, and Scale tracks (provided in context)
2. Current conversation context
3. General business knowledge and best practices

**Response Rules:**
- **Prioritize Proprietary Content**: Your absolute priority is to answer using the "Relevant Internal Content" provided. Analyze it deeply before formulating a response.
- **Stay Brief**: Keep responses short and impactful.
- Never fabricate information or frameworks.
- If the answer is clearly within the internal context, do not include general knowledge unless it enhances the specific NMV framework.
- Say "I don't have enough information from the proprietary NMV content" only when the internal context is zero or irrelevant, then provide general guidance if appropriate.
- Prefer structured responses (bullet points, numbered lists).
- Ask clarifying questions only when necessary.

**Allowed Scope:**
- Strategy, growth, and market expansion
- Revenue optimization and pricing
- Marketing, sales, and channel development
- Operations, scaling, and leadership
- Financial planning and capital efficiency
- Fundraising, exit readiness, and governance

**Citations:**
- When using information from the provided "Relevant Internal Content", mention the source name or document title.
- If you use the provided "AI Summary" of a document, you can refer to it as "NMV Training Insights".
- Keep citations subtle but clear.

**Guardrails:**
- No legal, tax, or investment advice
- No claims of private data access unless explicitly provided in context
- No hallucinated policies or documents
- Maintain confidentiality.`;

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
            temperature: 0.3, // Even lower for faster, more focused output
            max_tokens: 300,  // Further reduced for speed
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
