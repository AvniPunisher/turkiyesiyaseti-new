// backend/config/db.js
const mysql = require('mysql2/promise');

// MySQL Bağlantı Havuzu
const createPool = () => {
  try {
    return mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'game_db',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000  // Bağlantı zaman aşımını artır (60 saniye)
    });
  } catch (error) {
    console.error('MySQL bağlantı havuzu oluşturulurken hata:', error);
    return null;
  }
};

// Havuz oluştur
const pool = createPool();

// Bağlantıyı test et
const testConnection = async () => {
  if (!pool) return false;
  
  try {
    const connection = await pool.getConnection();
    console.log('MySQL veritabanına başarıyla bağlandı!');
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL veritabanına bağlanırken hata:', error);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};