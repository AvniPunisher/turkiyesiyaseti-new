// backend/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});

const sendVerificationEmail = async (email, username, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://turkiyesiyaseti.net'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"Türkiye Siyaseti" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
    to: email,
    subject: 'E-posta Adresinizi Doğrulayın',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a2a3a;">Merhaba ${username},</h2>
        <p>Türkiye Siyaseti oyununa kaydolduğunuz için teşekkürler. Lütfen hesabınızı etkinleştirmek için aşağıdaki bağlantıya tıklayın:</p>
        <p style="text-align: center;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px;">E-posta Adresimi Doğrula</a>
        </p>
        <p>Bu bağlantı 24 saat boyunca geçerlidir.</p>
        <p>Eğer siz kaydolmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail
};
