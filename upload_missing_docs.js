const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// ===================== CONFIG =====================
const BASE_URL = 'https://melissa-ai.vercel.app';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const NMV_FOLDER = path.join(__dirname, 'NMV Online Content');
const MISSING_FILES = [
    "Optimize Track\\Fundraising\\Fundraising (Old)\\Extended Pitch Deck Template.pptx",
    "Other\\Non-PDF slides\\1863 Sample Pitch Deck Template.pptx",
    "Scale Track\\Founder_Cash_Flow_and_Reserve_Metrics_Guide.pdf"
];
// =================================================

let token = null;

async function login() {
    console.log('\n🔐 Logging in to admin...');
    try {
        const res = await axios.post(`${BASE_URL}/api/admin/login`, {
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD
        });
        token = res.data.token;
        console.log('✅ Logged in successfully!');
    } catch (err) {
        console.error('❌ Login failed:', err.message);
        process.exit(1);
    }
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.ppt': 'application/vnd.ms-powerpoint'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

async function uploadFile(relativePath) {
    const filePath = path.join(NMV_FOLDER, relativePath);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }

    const filename = path.basename(filePath);
    console.log(`\n📤 Uploading: ${relativePath}`);

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), {
            filename: filename,
            contentType: getMimeType(filePath)
        });

        const res = await axios.post(`${BASE_URL}/api/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            timeout: 300000 // 5 minutes
        });

        console.log(`  ✅ Done! ${res.data.chunks || '?'} chunks indexed.`);
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
        console.log(`  ❌ FAILED: ${errorMsg}`);
    }
}

async function main() {
    await login();
    for (const file of MISSING_FILES) {
        await uploadFile(file);
    }
    console.log('\n🎉 Finished uploading missing documents!');
}

main().catch(err => console.error('Fatal error:', err));
