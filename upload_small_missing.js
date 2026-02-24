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
    "Scale Track\\Founder_Cash_Flow_and_Reserve_Metrics_Guide.pdf"
];
// =================================================

let token = null;

async function login() {
    console.log('\n🔐 Logging in to admin...');
    const res = await axios.post(`${BASE_URL}/api/admin/login`, {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
    });
    token = res.data.token;
    console.log('✅ Logged in successfully!');
}

async function uploadFile(relativePath) {
    const filePath = path.join(NMV_FOLDER, relativePath);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }

    const filename = path.basename(filePath);
    console.log(`\n📤 Uploading: ${relativePath}`);

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), {
        filename: filename,
        contentType: 'application/pdf'
    });

    const res = await axios.post(`${BASE_URL}/api/upload`, form, {
        headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${token}`
        }
    });

    console.log(`  ✅ Done! ${res.data.chunks || '?'} chunks indexed.`);
}

async function main() {
    await login();
    for (const file of MISSING_FILES) {
        await uploadFile(file);
    }
}

main().catch(err => console.error('Error:', err.response?.data || err.message));
