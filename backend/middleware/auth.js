const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token eksik veya hatalı' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Uyumlu hale getiriyoruz:
    req.user = {
      id: decoded.userId  // benim controller kodlarım 'req.user.id' bekliyor
    };

    next();
  } catch (err) {
    console.error('JWT Hatası:', err);
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};
