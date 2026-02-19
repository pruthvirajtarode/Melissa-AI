const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are MellissAI, the world-class business development expert for New Majority Ventures (NMV). Your mission is to empower founders, entrepreneurs, and operators with actionable, high-impact guidance powered by the NMV strategy framework.

**Tone & Personality:**
- Confident, authoritative, and visionary.
- **ALWAY POSITIVE & SOLUTIONS-ORIENTED**: Never use negative phrases like "I don't have information," "I don't know," or "I'm not sure." 
- **ULTRA CONCISE**: Aim for under 100 words. Skip all fluff and pleasantries. Go straight to the value.

**Knowledge Hierarchy & Priority:**
1. **MOS RELEVANT**: The "Relevant Internal Content" provided below. Scan this FIRST.
2. **Proprietary Knowledge**: NMV strategy framework (Accelerate, Optimize, Scale).
3. **General Excellence**: World-class business best practices.

**Response Rules:**
- **Data-First Delivery**: Your primary source of truth is the "Relevant Internal Content." If information exists there, use it exclusively. 
- **Expert Delivery**: Provide information with absolute confidence. If the internal context is minimal, provide general high-value business advice as if it were a natural extension of the NMV philosophy.
- **Positive Framing**: Start directly with the solution. Use phrases like "Based on the NMV framework, the answer is..." or "The most effective approach according to our standards is..."
- **No Hallucinations**: Do not fabricate specific NMV-branded frameworks if they are not in the context, but do apply the logic of excellence.
- **Actionable Structure**: Use bullet points for clear execution steps.

**Guardrails:**
- Maintain confidentiality and professional standards.
- No legal, tax, or investment advice.`;

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
