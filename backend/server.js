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
app.use('/api/character', require('./routes/character')); // Bu satırı ekleyin eğer yoksa
app.use('/api/party', require('./routes/party')); // Bu satırı ekleyin

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

// Aşağıdaki kodu backend/server.js dosyasının en altına ekleyin
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ success: true, message: 'API aktif', environment: process.env.NODE_ENV });
});

// Tablo durumunu kontrol et
app.get('/api/check-tables', async (req, res) => {
  try {
    const { pool } = require('./config/db');
    
    // Tabloları kontrol et
    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [process.env.DB_NAME || 'railway']);
    
    return res.status(200).json({
      success: true,
      tables: tables.map(t => t.table_name)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Veritabanı tabloları kontrol edilirken hata oluştu',
      error: error.message
    });
  }
});

// backend/server.js içindeki bağlantı kurulduktan hemen sonra
// Tabloları otomatik oluştur
const initializeTables = async () => {
  try {
    const { pool } = require('./config/db');
    const fs = require('fs');
    const path = require('path');
    
    console.log('Veritabanı tablolarını oluşturma başlatıldı...');
    
    // Tabloları kontrol et
    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [process.env.DB_NAME || 'railway']);
    
    // Tablolar zaten varsa oluşturma
    if (tables.length > 0) {
      console.log('Veritabanı tabloları zaten mevcut.');
      return;
    }
    
    const sqlPath = path.join(__dirname, 'config', 'init.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // SQL komutlarını bölme
    const statements = sqlScript.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
        console.log('SQL komutu çalıştırıldı.');
      }
    }
    
    console.log('Veritabanı tabloları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken hata:', error);
  }
};

initializeTables();
