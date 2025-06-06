// Gerekli importlar
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express(); // BU SATIR ÖNEMLİ

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Test endpoint buraya eklenmeli, app tanımlandıktan sonra
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

// Normal rotalar
const slotRoutes = require('./routes/slot.routes');
app.use('/api/slots', slotRoutes);

// Sunucu başlatma
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});
