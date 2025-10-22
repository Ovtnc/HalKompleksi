# 📧 Email Konfigürasyonu Rehberi

Bu uygulama için email gönderme özelliğini aktif etmek için aşağıdaki adımları takip edin.

## ✅ Adım 1: Gmail App Password Oluşturma

### 1. Google Hesabınıza Giriş Yapın
- [Google Hesap Ayarları](https://myaccount.google.com/) adresine gidin

### 2. 2-Step Verification'ı Aktif Edin
- **Security** (Güvenlik) bölümüne gidin
- **2-Step Verification** seçeneğini bulun
- Henüz aktif değilse, aktif edin

### 3. App Password Oluşturun
- **2-Step Verification** sayfasında, en alta inin
- **App passwords** (Uygulama şifreleri) seçeneğine tıklayın
- **Select app**: "Mail" seçin
- **Select device**: "Other (Custom name)" seçin
- Bir isim girin: "Hal Kompleksi Backend"
- **Generate** butonuna tıklayın
- ⚠️ **16 karakterlik şifreyi kopyalayın** (boşluklar olmadan)

## ✅ Adım 2: Backend .env Dosyasını Yapılandırın

### Backend `.env` dosyanızı açın veya oluşturun:

```bash
cd backend
touch .env  # Eğer yoksa oluşturun
```

### Aşağıdaki satırları ekleyin:

```env
# Email Configuration
EMAIL_USER=sizin-email@gmail.com
EMAIL_PASS=abcdefghijklmnop  # 16 karakterlik app password (boşluksuz)
FRONTEND_URL=http://localhost:8081
```

### Tam `.env` Örneği:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hal-kompleksi
MONGODB_URI_CLOUD=mongodb+srv://username:password@cluster.mongodb.net/hal-kompleksi

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5001
NODE_ENV=development

# Email Configuration
EMAIL_USER=sizin-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
FRONTEND_URL=http://localhost:8081

# File Upload
MAX_FILE_SIZE=10485760
```

## ✅ Adım 3: Backend'i Yeniden Başlatın

```bash
cd backend
npm run dev
```

## ✅ Test Etme

### Backend'de test scripti çalıştırın:

```bash
cd backend
node test-email.js
```

### Başarılı Çıktı:
```
📋 Environment Variables:
EMAIL_USER: sizin-email@gmail.com
EMAIL_PASS: Set
FRONTEND_URL: http://localhost:8081
🧪 Testing email service...

📧 Testing welcome email...
Welcome email sent: <message-id>
✅ Success!
```

## 📌 Email Özellikleri

### 1. **Hoş Geldin Emaili**
- Kullanıcı kayıt olduğunda otomatik gönderilir
- Platform özelliklerini tanıtır
- Modern HTML tasarım

### 2. **Şifre Sıfırlama Emaili**
- Şifre sıfırlama isteğinde gönderilir
- Güvenli reset token içerir
- 10 dakika geçerlilik süresi

## 🔒 Güvenlik Notları

1. ⚠️ `.env` dosyasını **ASLA** git'e commit etmeyin (zaten .gitignore'da)
2. ✅ App Password kullanın, asıl Gmail şifrenizi kullanmayın
3. ✅ Production'da profesyonel email servisi kullanın:
   - **SendGrid** (Önerilen)
   - **AWS SES**
   - **Mailgun**
   - **Postmark**

## 🚨 Sorun Giderme

### "Invalid login" Hatası
- App password'ü doğru kopyaladığınızdan emin olun
- Boşlukları kaldırın
- 2FA'nın aktif olduğunu kontrol edin

### "Connection timeout" Hatası
- Firewall ayarlarını kontrol edin
- Gmail SMTP portlarının açık olduğundan emin olun

### Email Gönderilmiyor
- `.env` dosyasının doğru dizinde olduğundan emin olun
- Backend'i yeniden başlatın
- Environment variables'ların yüklendiğini kontrol edin

## 📞 Destek

Email yapılandırması ile ilgili sorun yaşarsanız:
- Backend konsol loglarını kontrol edin
- `test-email.js` scriptini çalıştırın
- `backend/EMAIL_SETUP.md` dosyasına bakın

---

**Not:** Production ortamında SendGrid veya AWS SES gibi profesyonel email servisleri kullanmanız önerilir.

