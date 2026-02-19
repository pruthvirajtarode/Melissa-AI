require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const settingsRoutes = require('./routes/settings');

const app = express();

// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MellissAI Server Running' });
});

// Serve main app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Specifically detect Vercel read-only filesystem errors
  const isVercelFsError = process.env.VERCEL && (
    err.code === 'EROFS' ||
    err.message.includes('read-only') ||
    err.message.includes('permission denied')
  );

  res.status(500).json({
    error: isVercelFsError ? 'Vercel filesystem is read-only. Use the "Bot Identity" section to update via URL.' : 'Something went wrong!',
    message: err.message
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 MellissAI Server running on port ${PORT}`);
    console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`💬 Chat interface: http://localhost:${PORT}`);
  });
}

module.exports = app;
