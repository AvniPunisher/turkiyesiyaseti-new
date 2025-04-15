// backend/config/db.js
const mysql = require('mysql2/promise');

// DATABASE_URL'den bağlanma
const pool = mysql.createPool(process.env.DATABASE_URL);

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