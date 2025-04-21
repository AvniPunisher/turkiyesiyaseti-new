// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısını import et
const { testConnection, pool } = require('./config/db');

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
      // Bağlantı başarılı ise tabloları kontrol et ve oluştur
      initializeDatabase();
    }
  })
  .catch(err => {
    console.error('Veritabanı bağlantı testi sırasında hata:', err);
    console.log('Hata olmadan devam ediliyor.');
  });

// Rotalar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/game'));
app.use('/api/character', require('./routes/character')); 
app.use('/api/party', require('./routes/party')); 

// 404 hata yakalama
app.use((req, res) => {
  res.status(404).json({ message: 'Aradığınız sayfa bulunamadı' });
});

// Genel hata yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Sunucu hatası' });
});

// Sağlık kontrolü endpointi
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ success: true, message: 'API aktif', environment: process.env.NODE_ENV });
});

// Tablo durumunu kontrol et
app.get('/api/check-tables', async (req, res) => {
  try {
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

// Tabloları oluştur ve kontrol et
const initializeDatabase = async () => {
  try {
    console.log('Veritabanı tabloları kontrol ediliyor...');
    
    // Önce game_saves tablosunu kontrol et
    const [existingTables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = 'game_saves'
    `, [process.env.DB_NAME || 'railway']);
    
    if (existingTables.length === 0) {
      console.log('game_saves tablosu bulunamadı, temel tabloları oluşturuluyor...');
      
      // Temel tablolar için SQL
      const basicSqlPath = path.join(__dirname, 'config', 'init.sql');
      if (fs.existsSync(basicSqlPath)) {
        const basicSqlScript = fs.readFileSync(basicSqlPath, 'utf8');
        
        // SQL komutlarını bölme
        const basicStatements = basicSqlScript.split(';').filter(stmt => stmt.trim() !== '');
        
        for (const statement of basicStatements) {
          if (statement.trim()) {
            await pool.query(statement);
            console.log('Temel SQL komutu çalıştırıldı');
          }
        }
        
        console.log('Temel tablolar başarıyla oluşturuldu!');
      } else {
        console.error('init.sql dosyası bulunamadı!');
      }
    }
    
    // Snapshot tablolarını kontrol et
    const [snapshotTables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name IN ('character_snapshots', 'party_snapshots')
    `, [process.env.DB_NAME || 'railway']);
    
    if (snapshotTables.length < 2) {
      console.log('Snapshot tabloları eksik, oluşturuluyor...');
      
      // Snapshot SQL kodunu oluştur
      const snapshotSql = `
-- Karakter snapshot tablosu
CREATE TABLE IF NOT EXISTS character_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  save_id INT NOT NULL,
  character_id INT NOT NULL,
  character_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (save_id) REFERENCES game_saves(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES game_characters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_save_snapshot (save_id)
);

-- Parti snapshot tablosu
CREATE TABLE IF NOT EXISTS party_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  save_id INT NOT NULL,
  party_id INT NOT NULL,
  party_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (save_id) REFERENCES game_saves(id) ON DELETE CASCADE,
  FOREIGN KEY (party_id) REFERENCES game_parties(id) ON DELETE CASCADE,
  UNIQUE KEY unique_save_snapshot (save_id)
);`;
      
      // SQL komutlarını bölme
      const snapshotStatements = snapshotSql.split(';').filter(stmt => stmt.trim() !== '');
      
      for (const statement of snapshotStatements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
            console.log('Snapshot SQL komutu çalıştırıldı');
          } catch (sqlError) {
            console.error('Snapshot SQL hatası:', sqlError);
          }
        }
      }
      
      console.log('Snapshot tabloları başarıyla oluşturuldu!');
    }
    
    // Mevcut kayıtlar için snapshot'ları oluştur
    await migrateExistingData();
    
    console.log('Veritabanı başarıyla hazırlandı!');
  } catch (error) {
    console.error('Veritabanı hazırlama hatası:', error);
  }
};

// Mevcut kayıtları snapshot formatına taşı
const migrateExistingData = async () => {
  try {
    const gameService = require('./services/gameService');
    
    console.log('Mevcut kayıtlar kontrol ediliyor...');
    
    // Snapshot'ı olmayan oyun kayıtlarını al
    const [gameSaves] = await pool.query(`
      SELECT gs.id, gs.character_id, gs.party_id 
      FROM game_saves gs
      LEFT JOIN character_snapshots cs ON gs.id = cs.save_id
      WHERE cs.id IS NULL
    `);
    
    if (gameSaves.length === 0) {
      console.log('Taşınacak kayıt bulunmadı.');
      return;
    }
    
    console.log(`${gameSaves.length} kayıt için snapshot oluşturulacak...`);
    
    // Her kayıt için snapshot oluştur
    for (const save of gameSaves) {
      try {
        // Karakter snapshot'ı oluştur
        await gameService.storeCharacterSnapshot(pool, save.id, save.character_id);
        
        // Parti snapshot'ı oluştur (eğer parti varsa)
        if (save.party_id) {
          await gameService.storePartySnapshot(pool, save.id, save.party_id);
        }
        
        console.log(`Kayıt ID ${save.id} için snapshot oluşturuldu.`);
      } catch (snapshotError) {
        console.error(`Kayıt ID ${save.id} için snapshot oluşturma hatası:`, snapshotError);
      }
    }
    
    console.log('Veri taşıma işlemi tamamlandı!');
  } catch (error) {
    console.error('Veri taşıma hatası:', error);
  }
};

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
