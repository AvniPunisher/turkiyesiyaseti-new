// backend/config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Bağlantı bilgilerini loglama (debug için)
console.log('Veritabanı bağlantı bilgileri:', {
  host: process.env.DB_HOST || 'gondola.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || '39852'
});

// Veritabanı havuzu oluştur
const createPool = () => {
  try {
    return mysql.createPool({
      host: process.env.DB_HOST || 'gondola.proxy.rlwy.net',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'tSItToNewOGEpbXYaHxuDywazsHVwHUF',
      database: process.env.DB_NAME || 'railway',
      port: process.env.DB_PORT || '39852',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false  // Railway için SSL bağlantısına izin ver
      }
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
    
    // Basit bir sorgu çalıştır
    const [result] = await connection.query('SELECT 1 as result');
    console.log('Test sorgusu sonucu:', result);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL veritabanına bağlanırken hata:', error);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  query: async (sql, params) => {
    if (!pool) throw new Error('Veritabanı bağlantısı bulunamadı');
    return pool.query(sql, params);
  }
};
