// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Email veya kullanıcı adının mevcut olup olmadığını kontrol et
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor' });
    }
    
    // Şifreyi hash'le
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Kullanıcıyı veritabanına ekle
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    res.status(201).json({ success: true, message: 'Kullanıcı başarıyla kaydedildi' });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  try {
    console.log("Login isteği alındı:", req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("Email veya şifre eksik");
      return res.status(400).json({ success: false, message: 'Email ve şifre gereklidir' });
    }
    
    // Kullanıcıyı e-posta ile bul
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    console.log("Kullanıcı sorgusu sonucu:", users.length > 0 ? "Kullanıcı bulundu" : "Kullanıcı bulunamadı");
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Geçersiz e-posta veya şifre' });
    }
    
    const user = users[0];
    
    // Şifreyi kontrol et
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Şifre kontrolü:", passwordMatch ? "Eşleşti" : "Eşleşmedi");
    
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Geçersiz e-posta veya şifre' });
    }
    
    // JWT secret kontrolü
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET çevre değişkeni tanımlanmamış!");
      return res.status(500).json({ success: false, message: 'Sunucu yapılandırma hatası' });
    }
    
    // JWT token oluştur
    try {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log("Token başarıyla oluşturuldu");
      
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (tokenError) {
      console.error("Token oluşturma hatası:", tokenError);
      return res.status(500).json({ success: false, message: 'Token oluşturma hatası' });
    }
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
});

// Kullanıcı bilgilerini getir (token kontrolü)
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Kullanıcı bilgilerini getir
    const [users] = await pool.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        createdAt: users[0].created_at
      }
    });
  } catch (error) {
    console.error('Kullanıcı bilgileri getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router;