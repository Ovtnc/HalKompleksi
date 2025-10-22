# Email Gönderme Sistemi Kurulumu

## Gmail SMTP Kullanarak Email Gönderme

### 1. Gmail App Password Oluşturma

1. Google hesabınıza giriş yapın
2. **Google Account** > **Security** > **2-Step Verification** (2FA aktif olmalı)
3. **App passwords** bölümüne gidin
4. **Select app**: "Mail" seçin
5. **Select device**: "Other" seçin ve "Hal Kompleksi" yazın
6. **Generate** butonuna tıklayın
7. 16 karakterlik app password'ü kopyalayın

### 2. Environment Variables Ayarlama

`.env` dosyasına aşağıdaki değişkenleri ekleyin:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:8081
```

### 3. Test Etme

```bash
# Email servisini test et
node test-email.js
```

### 4. Email Şablonları

#### Şifre Sıfırlama Emaili
- Modern HTML tasarım
- Responsive layout
- Gmail uyumlu
- 10 dakika geçerlilik süresi

#### Hoş Geldin Emaili
- Platform tanıtımı
- Özellik listesi
- Marka kimliği

### 5. Güvenlik Notları

- App password'ü asla kodda hardcode etmeyin
- Environment variables kullanın
- Production'da güvenli email servisleri kullanın (SendGrid, AWS SES)

### 6. Troubleshooting

#### "Invalid login" hatası
- 2FA'nın aktif olduğundan emin olun
- App password'ün doğru olduğundan emin olun

#### "Connection timeout" hatası
- Firewall ayarlarını kontrol edin
- Gmail SMTP portlarının açık olduğundan emin olun

### 7. Production Önerileri

- **SendGrid**: Profesyonel email servisi
- **AWS SES**: Amazon'un email servisi
- **Mailgun**: Gelişmiş email API'si
- **Postmark**: Transactional email servisi
