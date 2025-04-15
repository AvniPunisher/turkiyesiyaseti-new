// Bir test-db.js dosyası oluşturun ve Railway'e deploy edin
const mysql = require('mysql2/promise');

async function main() {
  console.log('Bağlantı bilgileri:', {
    host: process.env.MYSQL_HOST || process.env.DB_HOST,
    user: process.env.MYSQL_USER || process.env.DB_USER,
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
    port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306
  });

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || process.env.DB_HOST,
      user: process.env.MYSQL_USER || process.env.DB_USER,
      password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
      port: process.env.MYSQL_PORT || process.env.DB_PORT || 3306,
      connectTimeout: 60000
    });

    console.log('Bağlantı başarılı!');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Sorgu sonucu:', rows);
    await connection.end();
  } catch (err) {
    console.error('Bağlantı hatası:', err);
  }
}

main();