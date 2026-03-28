require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const http = require('http');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const bidRoutes = require('./routes/bids');
const transactionRoutes = require('./routes/transactions');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const platformSettingsRoutes = require('./routes/platformSettings');

const app = express();
const server = http.createServer(app);

connectDB();

initSocket(server);

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

app.use(cors({ origin: true, credentials: true }));
app.use(compression());

app.use((req, res, next) => {
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) {
      console.error('JSON parse error:', err);
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
  });
});

app.use((req, res, next) => {
  express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/platform-settings', platformSettingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message && err.message.includes('Only')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error.' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
