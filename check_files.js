const fs = require('fs');
const path = require('path');

const NMV_FOLDER = path.join(__dirname, 'NMV Online Content');

function checkFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            checkFiles(fullPath);
        } else {
            if (stat.size === 0) {
                console.log(`⚠️ Empty file: ${fullPath}`);
            }
            if (item.startsWith('._')) {
                console.log(`🗑️ macOS metadata file (junk): ${fullPath}`);
            }
        }
    });
}

console.log('Checking NMV content for issues...');
checkFiles(NMV_FOLDER);
console.log('Check complete.');
