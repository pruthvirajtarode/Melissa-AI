const mammoth = require('mammoth');
const fs = require('fs');

async function testMammoth() {
    try {
        console.log('Testing Mammoth with an empty buffer...');
        const buffer = Buffer.from('this is a test'); // Not a real zip/docx
        const result = await mammoth.extractRawText({ buffer });
        console.log('Result:', result.value);
    } catch (error) {
        console.error('✅ Caught expected error from mammoth:', error.message);
    }
}

testMammoth();
