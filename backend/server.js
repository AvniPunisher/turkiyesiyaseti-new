// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısını import et
const { testConnection } = require('./config/db');

// Express uygulaması
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ana rota
app.get('/', (req, res) => {
  res.json({ message: 'Türkiye Siyaset Simülasyonu API' });
});

// Veritabanı bağlantısını test et
testConnection()
  .then(connected => {
    if (!connected) {
      console.error('Veritabanı bağlantısı kurulamadı. Hata olmadan devam ediliyor.');
    } else {
      console.log('Veritabanı bağlantısı başarılı.');
    }
  })
  .catch(err => {
    console.error('Veritabanı bağlantı testi sırasında hata:', err);
    console.log('Hata olmadan devam ediliyor.');
  });

// Rotalar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/game'));
app.use('/api/character', require('./routes/character')); // Eksik
app.use('/api/party', require('./routes/party')); // Eksik

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
