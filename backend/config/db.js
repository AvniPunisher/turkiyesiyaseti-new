// backend/config/db.js içinde düzeltme
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Bağlantı havuzu oluştur
const createPool = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'centerbeam.proxy.rlwy.net',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'GlQDHJUcMhNEkIUEziauWOrfLJMqhtGi',
      database: process.env.DB_NAME || 'railway',
      port: process.env.DB_PORT || '13703',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false  // Railway için SSL gerekli
      }
    });
    
    console.log('MySQL bağlantı havuzu başarıyla oluşturuldu');
    return pool;
  } catch (error) {
    console.error('MySQL bağlantı havuzu oluşturulurken hata:', error);
    return null;
  }
};

const pool = createPool();

module.exports = {
  pool,
  testConnection: async () => {
    if (!pool) return false;
    
    try {
      const connection = await pool.getConnection();
      console.log('MySQL veritabanına başarıyla bağlandı!');
      
      // Test sorgusu
      const [result] = await connection.query('SELECT 1 as result');
      console.log('Test sorgusu sonucu:', result);
      
      connection.release();
      return true;
    } catch (error) {
      console.error('MySQL veritabanına bağlanırken hata:', error);
      return false;
    }
  }
};
