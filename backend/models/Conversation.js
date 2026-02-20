const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    ts: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
    conversationId: { type: String, required: true, unique: true, index: true },
    messages: { type: [MessageSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ConversationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Conversation', ConversationSchema);
