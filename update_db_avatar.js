const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

const settingsSchema = new mongoose.Schema({
    avatarUrl: String,
    avatarData: String,
    avatarMimeType: String
}, { collection: 'settings' });

const Settings = mongoose.model('Settings', settingsSchema);

async function updateAvatar() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const newAvatarUrl = 'images/bot-silhouette.svg';

        // Update all settings documents (usually there is only one)
        const result = await Settings.updateMany({}, {
            $set: {
                avatarUrl: newAvatarUrl,
                avatarData: null,
                avatarMimeType: null
            }
        });

        console.log(`✅ Database updated. Matches: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        // Let's also check if there's any other settings collection name
        // Sometimes it might be capitalized or pluralized differently in the model but mapped to a specific name
        // We'll check the current settings after update
        const currentSettings = await Settings.find({});
        console.log('Current settings in DB:', JSON.stringify(currentSettings, null, 2));

        if (currentSettings.length === 0) {
            console.log('ℹ️ No settings document found. Creating a default one...');
            const defaultSettings = new Settings({
                avatarUrl: newAvatarUrl,
                botName: 'MelissAI',
                welcomeMessage: "Hi! I'm MelissAI, your business development assistant. How can I help you today?"
            });
            await defaultSettings.save();
            console.log('✅ Default settings created');
        }

    } catch (error) {
        console.error('❌ Error updating database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateAvatar();
