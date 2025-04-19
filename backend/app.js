// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Route dosyaları
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const gameRoutes = require('./routes/game');

// Veritabanı bağlantısı
const { testConnection } = require('./config/db');

// .env dosyasını yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// CORS ve body-parser middleware'leri
app.use(cors());
app.use(express.json());

// API rotaları
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/game', gameRoutes);

// Sağlık kontrolü endpoint'i
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API aktif ve çalışıyor' });
});

// Veritabanı bağlantısını test et
testConnection()
  .then(connected => {
    if (connected) {
      console.log('Veritabanı bağlantısı başarılı');
    } else {
      console.error('Veritabanı bağlantısı başarısız');
    }
  })
  .catch(err => {
    console.error('Veritabanı bağlantısı test edilirken hata:', err);
  });

// Production modunda frontend dosyalarını serve et
if (process.env.NODE_ENV === 'production') {
  // Frontend build klasörünü statik olarak serve et
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Tüm GET isteklerini index.html'e yönlendir (React routing için)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Modül olarak dışa aktar
module.exports = app;
