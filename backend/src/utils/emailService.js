const nodemailer = require('nodemailer');
const { FRONTEND_URL } = require('../config/urls');

// Email transporter oluştur
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📧 Email configuration check:', {
    hasEmailUser: !!emailUser,
    emailUserLength: emailUser ? emailUser.length : 0,
    hasEmailPass: !!emailPass,
    emailPassLength: emailPass ? emailPass.length : 0
  });
  
  // Email yapılandırması kontrolü
  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password-here') {
    console.warn('⚠️  Email servisi yapılandırılmamış! EMAIL_USER ve EMAIL_PASS environment variable\'larını ayarlayın.');
    return null;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
};

// Şifre sıfırlama emaili gönder (4 haneli kod ile)
const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const transporter = createTransporter();
    
    // Email servisi yapılandırılmamışsa
    if (!transporter) {
      console.warn('Email servisi yapılandırılmamış, email gönderilemedi.');
      return { success: false, error: 'Email servisi yapılandırılmamış' };
    }
    
    // Deep link URL (mobil uygulama için)
    const deepLinkUrl = `halkompleksi://reset-password?code=${resetCode}`;
    // Universal link (iOS/Android için)
    const universalLinkUrl = `https://halkompleksi.com/reset-password?code=${resetCode}`;
    // Web uygulaması için reset URL (fallback)
    const resetUrl = `${FRONTEND_URL}/reset-password?code=${resetCode}`;
    
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
            
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              Merhaba,<br><br>
              Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki <strong>4 haneli doğrulama kodunu</strong> kullanarak yeni şifrenizi belirleyebilirsiniz.
            </p>
            
            <div style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border: 2px solid #34C759; text-align: center;">
              <p style="color: #1B5E20; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                🔐 4 Haneli Doğrulama Kodunuz
              </p>
              <div style="background: #FFFFFF; padding: 20px; border-radius: 10px; display: inline-block; margin: 10px 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <p style="color: #34C759; font-size: 36px; margin: 0; font-family: 'Courier New', monospace; font-weight: bold; letter-spacing: 12px; text-align: center;">
                  ${resetCode}
                </p>
              </div>
              <p style="color: #2E7D32; font-size: 14px; margin: 15px 0 0 0; font-weight: 500;">
                Bu kodu mobil uygulamadaki şifre sıfırlama ekranına girin
              </p>
              <p style="color: #FF9800; font-size: 12px; margin: 10px 0 0 0; font-weight: 600;">
                ⚠️ Kod 10 dakika geçerlidir
              </p>
            </div>
            
            <div style="background: #F5F5F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                📱 Nasıl Kullanılır:
              </p>
              <p style="color: #333; font-size: 13px; margin: 0; line-height: 1.6;">
                Yukarıdaki 4 haneli kodu kopyalayın ve mobil uygulamadaki şifre sıfırlama ekranına yapıştırın. Kod doğrulandıktan sonra yeni şifrenizi belirleyebilirsiniz.
              </p>
            </div>
            
            <p style="color: #666; font-size: 13px; line-height: 1.6; margin-top: 20px;">
              <strong>Güvenlik Uyarısı:</strong> Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz. Kodunuzu kimseyle paylaşmayın.
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
    console.log('✅ Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    return { success: false, error: error.message || 'Email gönderilemedi' };
  }
};

// Hoş geldin emaili gönder
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    // Email servisi yapılandırılmamışsa
    if (!transporter) {
      console.warn('Email servisi yapılandırılmamış, email gönderilemedi.');
      return { success: false, error: 'Email servisi yapılandırılmamış' };
    }
    
    // Email servisi yapılandırılmamışsa
    if (!transporter) {
      console.warn('Email servisi yapılandırılmamış, email gönderilemedi.');
      return { success: false, error: 'Email servisi yapılandırılmamış' };
    }
    
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
