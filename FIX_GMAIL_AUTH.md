# 🔧 Gmail Authentication Hatası Çözümü

## ❌ Hata Mesajı
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

## 🔍 Sorun
Gmail App Password doğru çalışmıyor. Bu genellikle şu nedenlerden kaynaklanır:

1. **2FA (İki Faktörlü Doğrulama) aktif değil**
2. **App Password yanlış kopyalanmış**
3. **App Password silinmiş veya geçersiz**
4. **Gmail hesabı "Daha az güvenli uygulamalara erişim" kapalı**

## ✅ Çözüm Adımları

### 1. Gmail Hesabında 2FA'yı Aktifleştirin

1. [Google Account Security](https://myaccount.google.com/security) sayfasına gidin
2. "2-Step Verification" (İki Adımlı Doğrulama) bölümünü bulun
3. Eğer aktif değilse, aktifleştirin
4. Telefon numaranızı doğrulayın

### 2. Yeni App Password Oluşturun

1. [App Passwords](https://myaccount.google.com/apppasswords) sayfasına gidin
2. "Select app" dropdown'dan "Mail" seçin
3. "Select device" dropdown'dan "Other (Custom name)" seçin
4. "Hal Kompleksi Server" yazın
5. "Generate" butonuna tıklayın
6. **16 haneli şifreyi kopyalayın** (boşluklar olmadan)

### 3. Sunucuda App Password'u Güncelleyin

```bash
cd /var/www/hal-kompleksi/backend

# .env dosyasını düzenle
nano .env

# EMAIL_PASS satırını yeni App Password ile değiştirin
EMAIL_PASS=yeni-16-haneli-app-password-buraya

# Kaydedin (Ctrl+X, Y, Enter)

# PM2'yi restart et
cd ..
pm2 restart hal-kompleksi-backend --update-env

# Logları kontrol et
pm2 logs hal-kompleksi-backend --lines 20 --nostream | grep -i "email"
```

### 4. Test Edin

Şifre sıfırlama isteği göndererek test edin. Eğer hala hata alıyorsanız:

```bash
# Email configuration check loglarını kontrol et
pm2 logs hal-kompleksi-backend --lines 50 --nostream | grep -i "email\|📧\|configuration"
```

## 🔐 Güvenlik Notları

- **App Password'u asla paylaşmayın**
- **App Password'u git'e commit etmeyin** (zaten .gitignore'da)
- **Her sunucu için ayrı App Password kullanın**
- **App Password'u düzenli olarak yenileyin**

## 📧 Email: destek.halkompleksi@gmail.com

Bu email adresi için App Password oluşturduğunuzdan emin olun.

## 🆘 Hala Çalışmıyorsa

1. Gmail hesabınızın "Less secure app access" ayarını kontrol edin (artık kullanılmıyor, 2FA gerekli)
2. Gmail hesabınızın kilitli olmadığından emin olun
3. App Password'un doğru kopyalandığından emin olun (boşluk yok, 16 karakter)
4. Sunucudaki .env dosyasında EMAIL_USER ve EMAIL_PASS'in doğru olduğunu kontrol edin
