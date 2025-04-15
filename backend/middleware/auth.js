// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Token'ı al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcı bilgisini request'e ekle
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(401).json({ message: 'Yetkilendirme hatası: Geçersiz token' });
  }
};