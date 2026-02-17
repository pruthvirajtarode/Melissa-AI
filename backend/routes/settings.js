const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Simple authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Settings file path
const SETTINGS_FILE = path.join(__dirname, '../../data/settings.json');

// Ensure data directory exists (Skip on Vercel as it's read-only)
const dataDir = path.join(__dirname, '../../data');
if (!process.env.VERCEL && !fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Default settings
const defaultSettings = {
    avatarUrl: 'images/melliss-avatar.svg',
    botName: 'MellissAI12',
    welcomeMessage: "Hi! I'm MellissAI12, your business development assistant. How can I help you today?"
};

// Helper to get settings
function getSettings() {
    if (fs.existsSync(SETTINGS_FILE)) {
        try {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
            return { ...defaultSettings, ...JSON.parse(data) };
        } catch (e) {
            console.error('Error reading settings:', e);
            return defaultSettings;
        }
    }
    return defaultSettings;
}

// Helper to save settings
function saveSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../../frontend/images/uploads');
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|svg|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images allowed'));
    }
});

/**
 * GET /api/settings
 * Publicly accessible settings (for chatbot UI)
 */
router.get('/', (req, res) => {
    res.json(getSettings());
});

/**
 * POST /api/settings/avatar
 * Upload new avatar (Requires Admin)
 */
router.post('/avatar', authenticateAdmin, uploadAvatar.single('avatar'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const settings = getSettings();
        settings.avatarUrl = `images/uploads/${req.file.filename}`;
        saveSettings(settings);

        res.json({ message: 'Avatar updated', avatarUrl: settings.avatarUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

/**
 * POST /api/settings/update
 * Update general settings (Requires Admin)
 */
router.post('/update', authenticateAdmin, (req, res) => {
    try {
        const { botName, welcomeMessage } = req.body;
        const settings = getSettings();
        if (botName) settings.botName = botName;
        if (welcomeMessage) settings.welcomeMessage = welcomeMessage;
        saveSettings(settings);
        res.json({ message: 'Saved', settings });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
