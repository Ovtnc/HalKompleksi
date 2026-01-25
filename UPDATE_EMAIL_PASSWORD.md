# 📧 Gmail App Password Güncelleme Rehberi

## ✅ Yapılanlar

1. ✅ Local `.env` dosyası güncellendi
2. ✅ Git'e commit ve push edildi

## 📋 Sunucuda Yapılacaklar (Adım Adım)

### Adım 1: Git Pull
```bash
cd /var/www/hal-kompleksi
git pull origin main
```

### Adım 2: .env Dosyasını Güncelle
```bash
cd backend

# Mevcut .env dosyasını kontrol et
cat .env | grep EMAIL

# Email password'u güncelle
sed -i 's/^EMAIL_PASS=.*/EMAIL_PASS=pvtybbzlqlnhllpg/' .env

# Kontrol et
cat .env | grep EMAIL
```

### Adım 3: PM2'yi Restart Et
```bash
cd /var/www/hal-kompleksi

# PM2'yi durdur
pm2 stop hal-kompleksi-backend

# Kısa bekleme
sleep 2

# PM2'yi yeniden başlat (environment variables yüklenecek)
pm2 start ecosystem.config.js --env production --update-env

# Alternatif: Sadece restart
# pm2 restart hal-kompleksi-backend --update-env
```

### Adım 4: Kontrol Et
```bash
# PM2 durumu
pm2 status

# Email configuration loglarını kontrol et
pm2 logs hal-kompleksi-backend --lines 50 --nostream | grep -i "email\|📧\|configuration"

# PM2 environment variables'ı kontrol et
pm2 env 0 | grep -i email
```

### Adım 5: Test Et
1. Mobil uygulamada "Şifremi Unuttum" butonuna tıklayın
2. Email adresinizi girin
3. Email'inizi kontrol edin (spam klasörünü de kontrol edin)
4. Email `destek.halkompleksi@gmail.com` adresinden gelmeli
5. 4 haneli kodu alın ve uygulamada girin

## 🔍 Sorun Giderme

### Email gelmiyorsa:
1. **PM2 loglarını kontrol edin:**
   ```bash
   pm2 logs hal-kompleksi-backend --lines 100 | grep -i "email\|error"
   ```

2. **Gmail App Password kontrolü:**
   - [Google App Passwords](https://myaccount.google.com/apppasswords) sayfasına gidin
   - Yeni oluşturduğunuz App Password'un aktif olduğundan emin olun
   - App Password'u doğru kopyaladığınızdan emin olun (boşluk yok, 16 karakter)

3. **Backend .env dosyasını kontrol edin:**
   ```bash
   cd /var/www/hal-kompleksi/backend
   cat .env | grep EMAIL
   ```

4. **PM2 environment variables'ı kontrol edin:**
   ```bash
   pm2 env 0
   ```

### Hala eski email geliyorsa:
```bash
# PM2'yi tamamen durdur ve sil
pm2 stop hal-kompleksi-backend
pm2 delete hal-kompleksi-backend

# Yeniden başlat
cd /var/www/hal-kompleksi
pm2 start ecosystem.config.js --env production --update-env
```

## 📝 Notlar

- **Yeni App Password:** `pvtybbzlqlnhllpg`
- **Email Adresi:** `destek.halkompleksi@gmail.com`
- **PM2 restart sonrası** environment variables yüklenir
- **Cluster mode** kullanıldığı için tüm instance'lar yeniden başlatılır
