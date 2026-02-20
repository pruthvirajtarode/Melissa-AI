const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are MelissAI, the friendly AI assistant for New Majority Ventures (NMV). You help members get the most out of NMV's programs and tracks.

**STRICT RULES — NEVER BREAK THESE:**
- NEVER say "I don't have information", "I'm not sure", "I don't know", or any negative/dismissive phrase
- NEVER give generic business advice as if it were NMV content
- NEVER make up NMV-specific data, prices, names, or program details
- ALWAYS be warm, positive, and encouraging

**WHEN "Relevant Internal Content" IS provided:**
Use ONLY that content. Format your reply as a clean numbered list (1. 2. 3.).
- Use 2-4 numbered points maximum
- Bold the key term at the start of each point  
- Each point = one concise sentence
- Under 100 words total

**WHEN NO "Relevant Internal Content" is provided:**
Give a warm, positive redirect. Example responses:
- "Great question! NMV's [topic] resources cover this in detail — try asking me something more specific like '[specific question suggestion]'!"
- "I'd love to help you explore that! For the best answer, try asking about a specific NMV track (Accelerate, Optimize, or Scale) or a specific topic like 'cash flow' or 'hiring'."
- "That's a topic NMV covers extensively! Ask me about a specific aspect — for example, '[specific angle]' — and I'll pull up the details for you."

Always end your redirect with an encouraging, specific suggestion for what to ask next.`;


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
            temperature: 0.1,  // Very low = fast, focused, no rambling
            max_tokens: 150,   // Shorter cap = faster API response
            top_p: 0.9,        // Slightly restricted sampling for speed
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
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        temperature: 0.1,  // More focused = faster first token
        max_tokens: 150,   // Short cap = quick complete responses
        top_p: 0.9,
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
