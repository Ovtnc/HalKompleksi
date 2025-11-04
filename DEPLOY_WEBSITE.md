# 🚀 Web Sayfası Yükleme Kılavuzu

Backend'e yeni eklenen web sayfalarını production server'a yüklemek için adım adım rehber.

## 📦 Yüklenecek Dosyalar

```
backend/
├── public/
│   ├── index.html              # ✅ YENİ - Ana sayfa
│   ├── product.html            # ✅ YENİ - Ürün detay
│   ├── privacy-policy.html     # ✅ YENİ - Gizlilik
│   └── terms-of-service.html   # ✅ YENİ - Şartlar
└── src/
    └── server.js               # ✅ GÜNCELLENDİ - Route'lar eklendi
```

## 🎯 Yöntem 1: Git ile Yükleme (ÖNERİLEN)

### Adım 1: Git'e Commit
```bash
# Yerel makinenizde
cd /Users/okanvatanci/Desktop/hal-kompleksi

# Değişiklikleri stage'e al
git add backend/public/*.html
git add backend/src/server.js
git add WEBSITE_SETUP.md
git add DEPLOY_WEBSITE.md

# Commit
git commit -m "feat: Add website landing page and legal pages"

# Push to GitHub
git push origin main
```

### Adım 2: Server'da Güncelle
```bash
# SSH ile server'a bağlan
ssh root@109.199.114.223

# Proje dizinine git
cd /var/www/hal-kompleksi

# Son değişiklikleri çek
git pull origin main

# Backend'e git
cd backend

# PM2 ile restart
pm2 restart hal-kompleksi-backend

# Log'ları kontrol et
pm2 logs hal-kompleksi-backend --lines 50
```

### Adım 3: Test Et
```bash
# Tarayıcıda aç veya curl ile test et
curl https://halkompleksi.com/
curl https://halkompleksi.com/privacy-policy.html
curl https://halkompleksi.com/terms-of-service.html
```

## 🎯 Yöntem 2: SCP ile Dosya Gönderme

Eğer Git kullanamıyorsanız, doğrudan dosya kopyalayabilirsiniz:

```bash
# Yerel makinenizde

# public klasörünü kopyala
scp -r backend/public root@109.199.114.223:/var/www/hal-kompleksi/backend/

# server.js dosyasını kopyala
scp backend/src/server.js root@109.199.114.223:/var/www/hal-kompleksi/backend/src/

# SSH ile bağlan ve restart et
ssh root@109.199.114.223 "cd /var/www/hal-kompleksi/backend && pm2 restart hal-kompleksi-backend"
```

## 🎯 Yöntem 3: SFTP ile Yükleme

FTP client kullanıyorsanız (FileZilla, Cyberduck, vs.):

1. **Bağlantı Bilgileri:**
   - Host: `109.199.114.223`
   - Protocol: `SFTP`
   - Port: `22`
   - Username: `root`
   - Password: [SSH şifreniz]

2. **Dosyaları Yükle:**
   - Local: `/Users/okanvatanci/Desktop/hal-kompleksi/backend/public/`
   - Remote: `/var/www/hal-kompleksi/backend/public/`

3. **server.js'yi güncelle:**
   - Local: `/Users/okanvatanci/Desktop/hal-kompleksi/backend/src/server.js`
   - Remote: `/var/www/hal-kompleksi/backend/src/server.js`

4. **Terminal'den restart:**
   ```bash
   ssh root@109.199.114.223 "pm2 restart hal-kompleksi-backend"
   ```

## ✅ Deployment Checklist

Yüklemeden önce kontrol edin:

- [ ] `backend/public/` klasöründe 4 HTML dosyası var
- [ ] `backend/src/server.js` güncellenmiş (route'lar eklendi)
- [ ] Git commit yapıldı (Yöntem 1 için)
- [ ] SSL sertifikası aktif (`https://` çalışıyor)
- [ ] Backend çalışıyor (`pm2 status` ile kontrol)

## 🧪 Test Adımları

### 1. Backend Çalışıyor mu?
```bash
ssh root@109.199.114.223
pm2 status

# Çıktı:
# hal-kompleksi-backend | online
```

### 2. Dosyalar Yüklendi mi?
```bash
ssh root@109.199.114.223
ls -la /var/www/hal-kompleksi/backend/public/

# Görmeniz gerekenler:
# index.html
# product.html
# privacy-policy.html
# terms-of-service.html
```

### 3. Web Sayfaları Açılıyor mu?
```bash
# Ana sayfa
curl -I https://halkompleksi.com/
# Beklenen: HTTP/1.1 200 OK

# Gizlilik
curl -I https://halkompleksi.com/privacy-policy.html
# Beklenen: HTTP/1.1 200 OK

# Şartlar
curl -I https://halkompleksi.com/terms-of-service.html
# Beklenen: HTTP/1.1 200 OK
```

### 4. Tarayıcıda Test
1. `https://halkompleksi.com/` - Ana sayfa açılmalı
2. App Store butonları görünmeli
3. Özellikler kartları görünmeli
4. Footer linkleri çalışmalı

## 🐛 Sorun Giderme

### Sayfa 404 Veriyor

**Çözüm 1: Dosya yolunu kontrol et**
```bash
ssh root@109.199.114.223
cd /var/www/hal-kompleksi/backend
ls -la public/

# Dosyalar yoksa:
mkdir -p public
# Dosyaları tekrar yükle
```

**Çözüm 2: server.js route'ları kontrol et**
```bash
ssh root@109.199.114.223
cd /var/www/hal-kompleksi/backend/src
grep "app.get('/'," server.js

# Görünmüyorsa server.js'yi tekrar yükle
```

**Çözüm 3: PM2 restart**
```bash
ssh root@109.199.114.223
pm2 restart hal-kompleksi-backend
pm2 logs --lines 20
```

### Sayfa Yavaş Yükleniyor

**Nginx cache temizle:**
```bash
ssh root@109.199.114.223
nginx -s reload
```

### SSL Hatası

**SSL sertifikasını kontrol et:**
```bash
ssh root@109.199.114.223
certbot certificates

# Yenile (gerekirse):
certbot renew --nginx
```

## 📝 Güncellemeler İçin

Web sayfalarında değişiklik yaparsanız:

```bash
# 1. Yerel değişiklikleri yap (HTML düzenle)

# 2. Test et
cd backend
npm start
# http://localhost:5001 aç ve test et

# 3. Git commit
git add .
git commit -m "Update landing page content"
git push origin main

# 4. Server'a deploy
ssh root@109.199.114.223
cd /var/www/hal-kompleksi
git pull origin main
pm2 restart hal-kompleksi-backend
```

## 🎨 İçerik Güncellemeleri

### İstatistikleri Değiştir
`backend/public/index.html` - satır 210 civarı:
```html
<div class="stat-item">
    <h3>1000+</h3>  <!-- Burası güncellenebilir -->
    <p>Aktif Kullanıcı</p>
</div>
```

### App Store Linklerini Güncelle
Tüm HTML dosyalarında:
```html
<!-- Google Play -->
href="https://play.google.com/store/apps/details?id=com.halkompleksi.app"

<!-- App Store - YOUR_APP_ID'yi değiştir -->
href="https://apps.apple.com/app/hal-kompleksi/YOUR_APP_ID"
```

### İletişim Bilgilerini Güncelle
```html
<!-- Email -->
<a href="mailto:info@halkompleksi.com">

<!-- Telefon -->
+90 XXX XXX XX XX
```

## 🚨 Acil Durum - Geri Alma

Bir sorun olursa önceki versiyona dön:

```bash
ssh root@109.199.114.223
cd /var/www/hal-kompleksi

# Son 5 commit'i göster
git log --oneline -5

# İstediğin commit'e dön
git reset --hard COMMIT_HASH

# Backend restart
cd backend
pm2 restart hal-kompleksi-backend
```

## 📊 Monitoring

### PM2 Dashboard
```bash
ssh root@109.199.114.223
pm2 monit
# Gerçek zamanlı CPU, Memory kullanımı
```

### Log'ları İzle
```bash
ssh root@109.199.114.223
pm2 logs hal-kompleksi-backend --lines 100

# Sadece hataları göster
pm2 logs hal-kompleksi-backend --err --lines 50
```

### Web Sayfası Erişim Log'ları
```bash
ssh root@109.199.114.223
tail -f /var/log/nginx/access.log

# Sadece ana sayfa erişimleri
grep "GET / " /var/log/nginx/access.log
```

## 🎯 Hızlı Deploy Script

Otomatik deploy için script oluşturabilirsiniz:

```bash
# deploy-website.sh
#!/bin/bash

echo "🚀 Deploying website to production..."

# Git push
git add .
git commit -m "Update website"
git push origin main

# SSH ile deploy
ssh root@109.199.114.223 << 'EOF'
  cd /var/www/hal-kompleksi
  git pull origin main
  cd backend
  pm2 restart hal-kompleksi-backend
  echo "✅ Deployment complete!"
EOF

echo "🌐 Testing: https://halkompleksi.com"
curl -I https://halkompleksi.com/
```

Çalıştırmak için:
```bash
chmod +x deploy-website.sh
./deploy-website.sh
```

## 💡 İpuçları

1. **Git kullanın**: En güvenli ve takip edilebilir yöntem
2. **Önce test edin**: Yerel olarak test edin, sonra yükleyin
3. **Backup alın**: Değişiklik öncesi backup almayı unutmayın
4. **Log'ları izleyin**: Deploy sonrası mutlaka log'lara bakın
5. **Cache temizleyin**: Değişiklik görünmüyorsa cache temizleyin

## ✅ Son Kontrol

Deploy tamamlandıktan sonra:

- [ ] `https://halkompleksi.com/` açılıyor
- [ ] App Store butonları çalışıyor
- [ ] Footer linkleri çalışıyor
- [ ] Responsive (mobilde) çalışıyor
- [ ] SSL sertifikası geçerli (kilit ikonu)
- [ ] No console errors (F12 > Console)

---

**🎉 Başarıyla deploy olduktan sonra web siteniz yayında olacak!**

