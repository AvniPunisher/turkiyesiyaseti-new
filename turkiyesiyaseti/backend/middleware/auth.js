// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Token'i alma
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
    }
    
    // Token'i doğrulama
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcı bilgisini request nesnesine ekle
    req.user = {
      userId: decodedToken.userId,
      username: decodedToken.username
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token süresi doldu' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Geçersiz token' });
    }
    
    console.error('Yetkilendirme hatası:', error);
    res.status(401).json({ message: 'Yetkilendirme hatası' });
  }
};