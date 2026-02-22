require('dotenv').config();
const { generateEmbedding } = require('./backend/services/openai');

async function test() {
    try {
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(generateEmbedding('Hello world ' + i));
            console.log('Fired ' + i);
        }
        await Promise.all(promises);
        console.log('5 embeddings succeeded in parallel');
    } catch (err) {
        console.error('Failed:', err.message);
    }
}
test();
