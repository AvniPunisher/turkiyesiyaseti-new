// backend/config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// MySQL havuzu oluştur
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'game_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Bağlantıyı test et
const testConnection = async () => {
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