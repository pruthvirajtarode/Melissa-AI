require('dotenv').config();
const mongoose = require('mongoose');
const vectorStore = require('./backend/services/vectorStore');

async function testSearch() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Testing several queries...');

    const queries = [
        'How do I build an executive team?',
        'What are the risk management to-dos?',
        'Tell me about series B readiness',
        'How to optimize cash flow?',
        'What is in the Accelerate track?'
    ];

    for (const q of queries) {
        console.log(`\nQuery: "${q}"`);
        const results = await vectorStore.search(q, 3);
        if (results.length > 0) {
            console.log(`✅ Found ${results.length} results.`);
            console.log(`🔝 Top result source: ${results[0].source}`);
            console.log(`🔝 Similarity: ${results[0].similarity.toFixed(4)}`);
            // Print first 100 chars of top result
            console.log(`🔝 Preview: "${results[0].text.substring(0, 150).replace(/\n/g, ' ')}..."`);
        } else {
            console.log(`❌ No results found.`);
        }
    }

    await mongoose.disconnect();
}

testSearch().catch(console.error);
