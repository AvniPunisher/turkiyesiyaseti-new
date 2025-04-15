// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Ortam değişkenlerini yükle
dotenv.config();

// Express uygulaması
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Veritabanı bağlantısını test et
testConnection()
  .then(connected => {
    if (!connected) {
      console.error('Veritabanı bağlantısı kurulamadı, sunucu başlatılamıyor.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Veritabanı bağlantı testi sırasında hata:', err);
    process.exit(1);
  });

// Ana rota
app.get('/', (req, res) => {
  res.json({ message: 'Türkiye Siyaset Simülasyonu API' });
});

// Rotalar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/game'));

// 404 hata yakalama
app.use((req, res) => {
  res.status(404).json({ message: 'Aradığınız sayfa bulunamadı' });
});

// Genel hata yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası' });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});