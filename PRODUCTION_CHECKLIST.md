# 🚀 Production Deployment Checklist

## ✅ Tamamlananlar

- [x] 4 haneli şifre sıfırlama kodu sistemi implementasyonu
- [x] Web app reset password sayfası
- [x] Email template güncellemesi
- [x] TypeScript hataları düzeltildi (`forgotPassword`, `resetPassword` metodları eklendi)
- [x] Mobile app'teki DEBUG console.log'lar kaldırıldı (`api.ts`)

## ⚠️ Kritik Sorunlar (Sunucuda Düzeltilmeli)

### 1. Backend Environment Variables (Sunucuda)

**Sunucudaki `/var/www/hal-kompleksi/backend/.env` dosyası şu şekilde olmalı:**

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hal-kompleksi
# VEYA MongoDB Atlas kullanıyorsanız:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hal-kompleksi
JWT_SECRET=hal-kompleksi-super-secret-key-2024-production-change-this
FRONTEND_URL=https://halkompleksi.com

# Email Configuration
EMAIL_USER=destek.halkompleksi@gmail.com
EMAIL_PASS=mravliodhjdfsnfc
```

**⚠️ ÖNEMLİ:** Sunucuda `.env` dosyasını kontrol edin:
```bash
cd /var/www/hal-kompleksi/backend
cat .env | grep NODE_ENV
# Eğer "development" görüyorsanız, "production" olarak değiştirin
```

### 2. Console.log Temizliği

**Mobile App (HalKompleksi):**
- ✅ `api.ts` içindeki DEBUG loglar kaldırıldı
- ⚠️ Hala çok fazla `console.log` var (581 adet) - Production'da performans etkisi minimal ama temizlenebilir

**Backend:**
- ⚠️ Bazı `console.log`'lar var ama bunlar error tracking için gerekli olabilir
- Production'da `console.error` kullanılmalı, `console.log` yerine

**Web App:**
- ⚠️ 188 adet `console.log` var - Temizlenebilir

### 3. TypeScript Hataları

- ✅ `forgotPassword` ve `resetPassword` metodları eklendi
- ✅ Linter hataları yok

### 4. Build ve Deployment

**Web App:**
- ✅ `terser` dependency eklendi
- ✅ Build başarılı
- ⚠️ Sunucuda build dosyaları doğru yere kopyalanmalı:
  ```bash
  cd /var/www/hal-kompleksi/web
  npm run build
  sudo cp -r dist/* /var/www/halkompleksi.com/
  sudo chown -R www-data:www-data /var/www/halkompleksi.com
  sudo systemctl reload nginx
  ```

**Backend:**
- ✅ PM2 ile çalışıyor
- ⚠️ `npm audit fix` çalıştırılmalı (7 vulnerabilities var)

### 5. Security Kontrolleri

- ✅ Rate limiting aktif
- ✅ JWT authentication çalışıyor
- ✅ Password hashing (bcrypt) aktif
- ✅ CORS yapılandırması doğru
- ⚠️ `JWT_SECRET` production'da güçlü bir değer olmalı
- ⚠️ MongoDB connection string güvenli olmalı

## 📋 Sunucuda Yapılacaklar

### 1. Environment Variables Kontrolü

```bash
# SSH ile sunucuya bağlan
ssh root@109.199.114.223

# Backend .env kontrolü
cd /var/www/hal-kompleksi/backend
cat .env

# Eğer NODE_ENV=development ise:
nano .env
# NODE_ENV=production olarak değiştir
# FRONTEND_URL=https://halkompleksi.com olarak değiştir
# MONGODB_URI'yi kontrol et (production MongoDB URI olmalı)

# PM2'yi yeniden başlat (environment variables için)
pm2 restart hal-kompleksi-backend --update-env
```

### 2. Web App Deployment

```bash
cd /var/www/hal-kompleksi/web

# Git pull
git pull origin main

# Dependencies yükle (dev dependencies dahil)
npm install

# Build
npm run build

# Deploy
sudo cp -r dist/* /var/www/halkompleksi.com/
sudo chown -R www-data:www-data /var/www/halkompleksi.com
sudo chmod -R 755 /var/www/halkompleksi.com

# Nginx reload
sudo systemctl reload nginx

# Test
curl -I https://halkompleksi.com/reset-password
```

### 3. Security Audit

```bash
cd /var/www/hal-kompleksi/backend
npm audit fix

cd /var/www/hal-kompleksi/web
npm audit fix
```

### 4. PM2 Logs Kontrolü

```bash
# Backend loglarını kontrol et
pm2 logs hal-kompleksi-backend --lines 50

# Hata var mı kontrol et
pm2 logs hal-kompleksi-backend --err --lines 100
```

## 🎯 Production Ready Durumu

### ✅ Hazır Olanlar:
- [x] Şifre sıfırlama sistemi (4 haneli kod)
- [x] Web app reset password sayfası
- [x] Email servisi yapılandırması
- [x] TypeScript hataları düzeltildi
- [x] Build sistemi çalışıyor

### ⚠️ Sunucuda Yapılması Gerekenler:
- [ ] Backend `.env` dosyasında `NODE_ENV=production`
- [ ] Backend `.env` dosyasında `FRONTEND_URL=https://halkompleksi.com`
- [ ] MongoDB URI production için doğru
- [ ] Web app build dosyaları doğru yere kopyalandı
- [ ] `npm audit fix` çalıştırıldı
- [ ] PM2 restart edildi (`--update-env` ile)

### 💡 İsteğe Bağlı İyileştirmeler:
- [ ] Console.log'ları production-safe hale getir (__DEV__ kontrolü ile)
- [ ] Error tracking servisi ekle (Sentry, LogRocket, vb.)
- [ ] Performance monitoring ekle
- [ ] Database backup stratejisi

## 🚀 Deployment Komutu (Sunucuda)

Tüm adımları tek seferde yapmak için:

```bash
#!/bin/bash
# Sunucuda çalıştırılacak deployment script

cd /var/www/hal-kompleksi

# 1. Git pull
git pull origin main

# 2. Backend
cd backend
npm install --production
npm audit fix
pm2 restart hal-kompleksi-backend --update-env

# 3. Web App
cd ../web
npm install
npm run build
sudo cp -r dist/* /var/www/halkompleksi.com/
sudo chown -R www-data:www-data /var/www/halkompleksi.com
sudo systemctl reload nginx

echo "✅ Deployment tamamlandı!"
```

## 📝 Notlar

1. **Local `.env` dosyası development için kalabilir** - Sadece sunucudaki `.env` production olmalı
2. **Console.log'lar** - Production'da performans etkisi minimal ama temizlenebilir
3. **MongoDB URI** - Production'da gerçek MongoDB connection string kullanılmalı
4. **JWT_SECRET** - Production'da güçlü, rastgele bir değer olmalı
