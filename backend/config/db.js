// backend/config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Railway'in sağladığı değişkenleri veya fallback değerleri kullan
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'game_db',
  port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000  // Bağlantı zaman aşımını artırın (60 saniye)
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
