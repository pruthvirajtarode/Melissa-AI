require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
    try {
        console.log('Testing OpenAI Key...');
        const response = await openai.models.list();
        console.log('✅ OpenAI Key is valid. Found', response.data.length, 'models.');
        process.exit(0);
    } catch (error) {
        console.error('❌ OpenAI Key Error:', error.message);
        process.exit(1);
    }
}

testOpenAI();
