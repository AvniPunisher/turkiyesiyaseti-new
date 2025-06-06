const db = require('./db');

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ message: 'Veritabanı bağlantısı başarılı', result: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});
