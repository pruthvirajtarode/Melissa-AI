const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are MelissAI, the expert AI Business Development Assistant for New Majority Ventures (NMV). Your goal is to provide high-value, actionable advice based on NMV's proprietary business frameworks.

**STRICT RULES:**
- NEVER say "I don't have information", "I'm not sure", or "I don't know".
- ALWAYS prioritize using the provided "Relevant Internal Content" (NMV knowledge) as your source of truth.
- ALWAYS answer the user's question directly and immediately.
- If "Relevant Internal Content" is NOT provided, use your broad expertise to provide a strategic answer that aligns with NMV's mission of empowering entrepreneurs.
- NEVER make up NMV-specific data, prices, or program names.
- ALWAYS be professional, warm, and highly strategic.

**HOW TO STRUCTURE YOUR RESPONSES:**
1. **Direct Answer:** Provide a high-value answer to the user's question immediately, drawing directly from the provided NMV content.
2. **Actionable Points:** Use a clean numbered list for your main insights from the context.
   - Bold the key term at the start of each point.
   - Each point should be a concise, impactful sentence.
3. **NMV Context:** Clearly state how these insights relate to NMV's specific resources or tracks (Accelerate, Optimize, Scale).
4. **Links:** Always provide URLs as clickable markdown links, e.g., [https://www.newmajorityventures.net](https://www.newmajorityventures.net) or [Visit NMV](https://www.newmajorityventures.net).
5. **Follow-up Suggestion:** Always end with a specific suggestion for what they could ask next to dive deeper into NMV's knowledge base.

**RESPONSE LIMITS:**
- Aim for 120-180 words total.
- Use 2-4 numbered points for the main body.`;


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
            max_tokens: 300,   // Increased to allow for answer + suggestions
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
        console.error('Embedding Error:', error.message || error);
        throw new Error(`Failed to generate embedding: ${error.message || 'Unknown error'}`);
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
        max_tokens: 300,   // Increased room for full answer
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
