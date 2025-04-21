// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');

// reCAPTCHA doğrulama fonksiyonu
const verifyRecaptcha = async (recaptchaValue) => {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaValue}`,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
      }
    );
    
    return response.data.success;
  } catch (error) {
    console.error('reCAPTCHA doğrulama hatası:', error);
    return false;
  }
};

// Şifre karmaşıklığı kontrolü için yardımcı fonksiyon
const isPasswordStrong = (password) => {
  // En az 8 karakter, büyük/küçük harf, sayı ve özel karakter içermeli
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
};

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, recaptchaValue } = req.body;
    
    // reCAPTCHA doğrulama
    const recaptchaValid = await verifyRecaptcha(recaptchaValue);
    if (!recaptchaValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'reCAPTCHA doğrulaması başarısız oldu' 
      });
    }
    
    // Şifre karmaşıklığını kontrol et
    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 8 karakter uzunluğunda olmalı ve büyük/küçük harf, sayı ve özel karakter içermelidir.'
      });
    }
    
    // Email veya kullanıcı adının mevcut olup olmadığını kontrol et
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor' });
    }
    
    // Doğrulama tokeni oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 saat geçerli
    
    // Şifreyi hash'le
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Kullanıcıyı veritabanına ekle
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, verification_token, verification_token_expires, email_verified) VALUES (?, ?, ?, ?, ?, FALSE)',
      [username, email, hashedPassword, verificationToken, tokenExpires]
    );
    
    // Doğrulama e-postası gönder
    try {
      await sendVerificationEmail(email, username, verificationToken);
    } catch (emailError) {
      console.error('E-posta gönderim hatası:', emailError);
      // E-posta hatası olsa bile kullanıcıyı kaydet, sonra tekrar gönderilmesini sağlayabiliriz
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Kullanıcı başarıyla kaydedildi. Lütfen e-posta adresinizi doğrulayın.' 
    });
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
    
    // E-posta doğrulamasını kontrol et
    if (!user.email_verified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Lütfen önce e-posta adresinizi doğrulayın',
        needsVerification: true
      });
    }
    
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

// E-posta doğrulama endpoint'i
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Tokeni veritabanında ara
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW() AND email_verified = FALSE',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz veya süresi dolmuş doğrulama bağlantısı' 
      });
    }
    
    // Kullanıcıyı doğrulanmış olarak işaretle
    await pool.execute(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [users[0].id]
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'E-posta başarıyla doğrulandı. Artık giriş yapabilirsiniz.' 
    });
  } catch (error) {
    console.error('E-posta doğrulama hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Doğrulama e-postasını yeniden gönderme endpoint'i
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'E-posta adresi gereklidir' });
    }
    
    // Kullanıcıyı e-posta ile bul
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND email_verified = FALSE',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı veya zaten doğrulanmış' 
      });
    }
    
    // Yeni doğrulama tokeni oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);
    
    // Tokeni güncelle
    await pool.execute(
      'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
      [verificationToken, tokenExpires, users[0].id]
    );
    
    // Doğrulama e-postasını gönder
    await sendVerificationEmail(email, users[0].username, verificationToken);
    
    res.status(200).json({ 
      success: true, 
      message: 'Doğrulama e-postası yeniden gönderildi' 
    });
  } catch (error) {
    console.error('Doğrulama e-postası yeniden gönderme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
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
