const nodemailer = require('nodemailer');
const { FRONTEND_URL } = require('../config/urls');

// Email transporter oluştur
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Şifre sıfırlama emaili gönder
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Hal Kompleksi - Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #27AE60, #2ECC71); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Hal Kompleksi</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Tarım Ürünleri Platformu</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #2E7D32; margin-top: 0;">Şifre Sıfırlama İsteği</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Merhaba,<br><br>
              Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #27AE60, #2ECC71); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Şifremi Sıfırla
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Önemli:</strong> Bu bağlantı 10 dakika geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Eğer buton çalışmıyorsa, aşağıdaki bağlantıyı tarayıcınıza kopyalayın:<br>
              <a href="${resetUrl}" style="color: #27AE60; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #2E7D32; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              © 2024 Hal Kompleksi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Hoş geldin emaili gönder
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Hal Kompleksi - Hoş Geldiniz!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #27AE60, #2ECC71); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Hal Kompleksi</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Tarım Ürünleri Platformu</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #2E7D32; margin-top: 0;">Hoş Geldiniz, ${name}!</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hal Kompleksi platformuna başarıyla kayıt oldunuz. Artık tarım ürünlerini satın alabilir, satabilir ve piyasa raporlarını takip edebilirsiniz.
            </p>
            
            <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2E7D32; margin-top: 0;">Platform Özellikleri:</h3>
              <ul style="color: #333; line-height: 1.8;">
                <li>✅ Ürün satın alma ve satma</li>
                <li>✅ Favori ürünleri kaydetme</li>
                <li>✅ Piyasa raporlarını takip etme</li>
                <li>✅ Bildirim sistemi</li>
                <li>✅ Güvenli ödeme sistemi</li>
              </ul>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Herhangi bir sorunuz olursa, bizimle iletişime geçmekten çekinmeyin.
            </p>
          </div>
          
          <div style="background: #2E7D32; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              © 2024 Hal Kompleksi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
