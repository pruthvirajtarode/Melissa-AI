/**
 * upload-all-nmv-docs.js
 * Uploads ALL documents from NMV Online Content folder to MelissAI Knowledge Base
 * Run: node upload-all-nmv-docs.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// ===================== CONFIG =====================
const BASE_URL = 'https://melissa-ai.vercel.app';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const NMV_FOLDER = path.join(__dirname, 'NMV Online Content');
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.pptx', '.ppt'];
const DELAY_MS = 5000; // 5 seconds between uploads to avoid Vercel rate limiting
// =================================================

let token = null;
let uploadedCount = 0;
let failedCount = 0;
let failedFiles = [];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function login() {
    console.log('\n🔐 Logging in to admin...');
    const res = await axios.post(`${BASE_URL}/api/admin/login`, {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
    });
    token = res.data.token;
    console.log('✅ Logged in successfully!');
}

function getAllFiles(dirPath, allFiles = []) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            getAllFiles(fullPath, allFiles);
        } else {
            const ext = path.extname(item).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
                allFiles.push(fullPath);
            }
        }
    }
    return allFiles;
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

async function uploadFile(filePath) {
    const filename = path.basename(filePath);
    const relativePath = path.relative(NMV_FOLDER, filePath);

    try {
        const form = new FormData();
        // Correct field name is 'file', correct endpoint is POST /api/upload
        form.append('file', fs.createReadStream(filePath), {
            filename: filename,
            contentType: getMimeType(filePath)
        });

        const res = await axios.post(`${BASE_URL}/api/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
            timeout: 180000 // 3 minutes timeout per file
        });

        console.log(`  ✅ [${uploadedCount + 1}] ${relativePath} → ${res.data.chunks || '?'} chunks`);
        uploadedCount++;
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
        const status = err.response?.status || 'N/A';
        console.log(`  ❌ [FAILED ${status}] ${relativePath} → ${errorMsg}`);
        failedCount++;
        failedFiles.push({ file: relativePath, error: `${status}: ${errorMsg}` });
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('  MelissAI - NMV Document Bulk Uploader v2');
    console.log('='.repeat(60));

    if (!fs.existsSync(NMV_FOLDER)) {
        console.error(`❌ NMV folder not found: ${NMV_FOLDER}`);
        process.exit(1);
    }

    await login();

    const allFiles = getAllFiles(NMV_FOLDER);
    console.log(`\n📂 Found ${allFiles.length} documents to upload\n`);

    for (let i = 0; i < allFiles.length; i++) {
        const filePath = allFiles[i];
        const relativePath = path.relative(NMV_FOLDER, filePath);
        console.log(`\n[${i + 1}/${allFiles.length}] Uploading: ${relativePath}`);

        await uploadFile(filePath);

        if (i < allFiles.length - 1) {
            process.stdout.write(`  ⏳ Waiting ${DELAY_MS / 1000}s...`);
            await sleep(DELAY_MS);
            process.stdout.write(' Done\n');
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('  📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    console.log(`  ✅ Successfully uploaded: ${uploadedCount} documents`);
    console.log(`  ❌ Failed:                ${failedCount} documents`);

    if (failedFiles.length > 0) {
        console.log('\n  Failed files:');
        failedFiles.forEach(f => console.log(`    - ${f.file}: ${f.error}`));
    }

    console.log('\n🎉 Done! Check Knowledge Base at: ' + BASE_URL + '/admin.html');
}

main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
