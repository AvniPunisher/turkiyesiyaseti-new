// backend/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { testConnection } = require('./config/db');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const gameRoutes = require('./routes/game');
const partyRoutes = require('./routes/party'); // Yeni: Parti route'ları

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Veritabanı bağlantısını test et
testConnection()
  .then(success => {
    console.log('Veritabanı bağlantı testi:', success ? 'Başarılı' : 'Başarısız');
  })
  .catch(err => {
    console.error('Veritabanı bağlantı testi hatası:', err);
  });

// Route'ları tanımla
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/party', partyRoutes); // Yeni: Parti API rotası

// Ana endpoint (sağlık kontrolü)
app.get('/api/health-check', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API aktif ve çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'İstenen endpoint bulunamadı',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;