# E-posta Servisi Kurulum Rehberi

Bu rehber, Hal Kompleksi backend'inde e-posta servisini yapılandırmak için adım adım talimatlar içerir.

## Gmail ile E-posta Servisi Kurulumu

### 1. Gmail App Password Oluşturma

Gmail ile e-posta göndermek için App Password (Uygulama Şifresi) oluşturmanız gerekir:

1. **Google Hesabınıza giriş yapın**: https://myaccount.google.com
2. **Güvenlik** sekmesine gidin
3. **2 Adımlı Doğrulama** özelliğinin açık olduğundan emin olun (gerekirse açın)
4. **Uygulama şifreleri** bölümüne gidin:
   - https://myaccount.google.com/apppasswords
   - Veya: Güvenlik → 2 Adımlı Doğrulama → Uygulama şifreleri
5. **Uygulama seçin**: "Mail" seçin
6. **Cihaz seçin**: "Diğer (Özel ad)" seçin ve "Hal Kompleksi Backend" yazın
7. **Oluştur** butonuna tıklayın
8. **16 haneli şifreyi kopyalayın** (boşluklar olmadan)

### 2. Environment Variables Ayarlama

`.env` dosyasını açın ve aşağıdaki değerleri güncelleyin:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

**Örnek:**
```env
EMAIL_USER=hal.kompleksi@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**ÖNEMLİ:** `EMAIL_PASS` değerinde boşluklar varsa kaldırın veya tırnak içine alın.

### 3. Alternatif E-posta Servisleri

Gmail yerine başka bir e-posta servisi kullanmak isterseniz, `backend/src/utils/emailService.js` dosyasını düzenleyin:

#### Outlook/Hotmail için:
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

#### SMTP ile özel sunucu için:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### 4. E-posta Servisini Test Etme

Backend'i başlattıktan sonra, şifre sıfırlama özelliğini test edin:

1. Mobil uygulamada "Şifremi Unuttum" butonuna tıklayın
2. E-posta adresinizi girin
3. E-postanızı kontrol edin

### 5. Sorun Giderme

#### "Invalid login" hatası alıyorsanız:
- Gmail App Password'un doğru kopyalandığından emin olun
- 2 Adımlı Doğrulama'nın açık olduğunu kontrol edin
- `.env` dosyasındaki değerlerin doğru olduğunu kontrol edin

#### "Connection timeout" hatası alıyorsanız:
- İnternet bağlantınızı kontrol edin
- Firewall'un 587 portunu engellemediğinden emin olun
- Gmail'in "Daha az güvenli uygulamalara izin ver" ayarını kontrol edin (artık gerekli değil, App Password kullanıyoruz)

#### E-posta gönderilemiyor ama hata yok:
- Backend loglarını kontrol edin: `console.log` çıktılarına bakın
- E-posta servisinin doğru yapılandırıldığını kontrol edin
- Spam klasörünü kontrol edin

### 6. Production Ortamı için Öneriler

Production'da e-posta servisi kullanırken:

1. **Güvenlik**: `.env` dosyasını asla Git'e commit etmeyin
2. **Rate Limiting**: E-posta gönderme işlemlerinde rate limiting kullanın
3. **Monitoring**: E-posta gönderme başarısını loglayın ve izleyin
4. **Backup**: E-posta servisi çalışmazsa alternatif bir yöntem kullanın (SMS, push notification vb.)

### 7. Test Endpoint'i (Opsiyonel)

E-posta servisini test etmek için bir test endpoint'i ekleyebilirsiniz:

```javascript
// backend/src/routes/test.js
const express = require('express');
const router = express.Router();
const { sendPasswordResetEmail } = require('../utils/emailService');

router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendPasswordResetEmail(email, 'test-token-123');
    
    if (result.success) {
      res.json({ message: 'Test e-postası gönderildi', messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Yardım

Sorun yaşıyorsanız:
1. Backend loglarını kontrol edin
2. `.env` dosyasındaki değerleri doğrulayın
3. Gmail App Password'un doğru oluşturulduğundan emin olun
