# 🌐 HAL KOMPLEKSİ - URL YÖNETİM SİSTEMİ

## 📋 Genel Bakış

Bu proje artık **merkezi URL yönetim sistemi** ile gelir. Tüm URL'leri tek yerden değiştirebilir, development/production ortamları arasında kolayca geçiş yapabilirsiniz.

---

## 🎯 Hızlı Başlangıç

### 1️⃣ Frontend URL'lerini Değiştir
📁 **Dosya:** `HalKompleksi/src/config/env.ts`

```typescript
// PRODUCTION ayarları
const PROD_CONFIG = {
  API_URL: 'http://109.199.114.223:5001/api',
  WEB_URL: 'http://109.199.114.223:5001',
  DOMAIN: '109.199.114.223:5001',
};
```

### 2️⃣ Backend URL'lerini Değiştir
📁 **Dosya:** `backend/src/config/urls.js`

```javascript
// PRODUCTION ayarları
const PROD_CONFIG = {
  API_URL: 'http://109.199.114.223:5001/api',
  WEB_URL: 'http://109.199.114.223:5001',
  FRONTEND_URL: 'http://109.199.114.223:5001',
  DOMAIN: '109.199.114.223',
  PORT: 5001,
};
```

### 3️⃣ Senkronize Et
⚠️ **ÖNEMLİ:** Her iki dosyada da **aynı URL'leri** kullanın!

---

## 🚀 Yeni Özellikler

### ✅ Link ile Paylaşım
Ürün paylaşımlarında artık **tam URL** gidiyor:
```
🌿 Domates

💰 Fiyat: 15 ₺/kg
📦 Stok: 500 kg
📍 Konum: Antalya

🔗 Detaylar için: http://109.199.114.223:5001/product/abc123

📱 Hal Kompleksi
```

### ✅ WhatsApp Otomatik Mesaj
Satıcıya WhatsApp ile yazarken **otomatik mesaj** hazır geliyor:
```
Merhaba, Hal Kompleksi üzerinden "Domates" hakkında bilgi almak istiyorum.

Fiyat: 15 ₺/kg
Stok: 500 kg
```

### ✅ Instagram Stories
Ürün görselini Instagram Stories'e direkt paylaşabilme.

### ✅ Paylaşım Menüsü
- iOS: Native ActionSheet
- Android: Material Dialog

Seçenekler:
- WhatsApp
- Instagram Stories
- Diğer uygulamalar

---

## 📂 Dosya Yapısı

```
hal-kompleksi/
├── HalKompleksi/                        # Frontend
│   ├── src/
│   │   └── config/
│   │       └── env.ts                   # 🎯 Frontend URL Config
│   └── URL_CONFIG_GUIDE.md              # 📖 Frontend Rehber
│
├── backend/                             # Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── urls.js                  # 🎯 Backend URL Config
│   │   └── server.js                    # ✅ Güncellenmiş
│   └── URL_CONFIG_GUIDE.md              # 📖 Backend Rehber
│
└── URL_YONETIMI.md                      # 📖 Bu dosya
```

---

## 🔄 URL Değişikliği Adımları

### Senaryo 1: IP Adresi Değişti

#### Frontend (env.ts):
```typescript
const PROD_CONFIG = {
  API_URL: 'http://YENİ_IP:5001/api',
  WEB_URL: 'http://YENİ_IP:5001',
  DOMAIN: 'YENİ_IP:5001',
};
```

#### Backend (urls.js):
```javascript
const PROD_CONFIG = {
  API_URL: 'http://YENİ_IP:5001/api',
  WEB_URL: 'http://YENİ_IP:5001',
  FRONTEND_URL: 'http://YENİ_IP:5001',
  DOMAIN: 'YENİ_IP',
  PORT: 5001,
};
```

### Senaryo 2: Domain Aldınız (SSL ile)

#### Frontend (env.ts):
```typescript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
};
```

#### Backend (urls.js):
```javascript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  FRONTEND_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
  PORT: 443,
};
```

### Senaryo 3: Port Değişti

Sadece `PORT` değerini güncelleyin:
```javascript
// Backend urls.js
PORT: 8080,

// Frontend env.ts
API_URL: 'http://109.199.114.223:8080/api',
WEB_URL: 'http://109.199.114.223:8080',
```

---

## 🛠️ Değişiklik Sonrası Yapılacaklar

### Backend:
```bash
# Sunucuyu yeniden başlat
pm2 restart hal-kompleksi

# Veya
npm restart
```

### Frontend:
```bash
# Cache temizle
cd HalKompleksi
npm run clean

# Development test
npm start

# Production build
npm run build:android
npm run build:ios
```

---

## ✅ Test Kontrol Listesi

URL değişikliği sonrası test edin:

- [ ] **API Bağlantısı:** Uygulama açılıyor mu?
- [ ] **Ürün Listesi:** Ürünler görünüyor mu?
- [ ] **Ürün Detay:** Detay sayfası açılıyor mu?
- [ ] **Görsel Yükleme:** Görseller yükleniyor mu?
- [ ] **WhatsApp Paylaşımı:** Link doğru mu?
- [ ] **Instagram Stories:** Görsel paylaşılıyor mu?
- [ ] **Genel Paylaşım:** URL doğru mu?
- [ ] **Satıcıya Mesaj:** WhatsApp otomatik mesaj çalışıyor mu?

---

## 🔍 Kontrol Komutları

### Backend URL'lerini görmek:
```bash
cd backend
npm start
```

Çıktı:
```
============================================
🚀 Hal Kompleksi API
============================================
📍 Server: http://0.0.0.0:5001
🌐 API URL: http://109.199.114.223:5001/api
🖥️  Web URL: http://109.199.114.223:5001
📱 Frontend URL: http://109.199.114.223:5001
🏷️  Domain: 109.199.114.223
🌍 Environment: production
============================================
```

### Frontend URL'lerini görmek:
Uygulama console'unda:
```javascript
import { ENV } from './config/env';
console.log('Current URLs:', {
  API: ENV.API_BASE_URL,
  WEB: ENV.WEB_BASE_URL,
  DOMAIN: ENV.DOMAIN
});
```

---

## 🔒 SSL Sertifikası Kurulumu Sonrası

### 1. URL'leri Güncelle
- HTTP → HTTPS
- Port 5001 → 443 (veya uygun)
- IP → Domain

### 2. iOS ATS Exception Kaldır
`HalKompleksi/ios/HalKompleksi/Info.plist`:
```xml
<!-- Bu kısmı sil -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

### 3. Rebuild
```bash
eas build --platform all
```

---

## 🐛 Sorun Giderme

### Problem: Paylaşım linkleri çalışmıyor

**Çözüm:**
1. Frontend ve Backend URL'leri aynı mı?
2. Backend çalışıyor mu? (`pm2 status`)
3. Port açık mı? (`netstat -tulpn | grep 5001`)

### Problem: Görseller yüklenmiyor

**Çözüm:**
1. `backend/public/uploads` klasörü var mı?
2. CORS ayarları doğru mu?
3. URL'ler doğru mu?

### Problem: API çağrıları başarısız

**Çözüm:**
1. Backend logs: `pm2 logs hal-kompleksi`
2. Frontend console: Chrome DevTools
3. Network tab'ı inceleyin

---

## 📞 Helper Methodlar

### Frontend (TypeScript):
```typescript
import { ENV } from './config/env';

// Ürün URL'i
const url = ENV.getProductUrl('abc123');

// API endpoint
const api = ENV.getApiUrl('/products');

// Web sayfası
const web = ENV.getWebUrl('/privacy');
```

### Backend (JavaScript):
```javascript
const { getProductUrl, getImageUrl } = require('./config/urls');

// Ürün URL'i
const url = getProductUrl('abc123');

// Görsel URL'i
const image = getImageUrl('/uploads/products/test.jpg');
```

---

## 📚 Detaylı Rehberler

- **Frontend:** `HalKompleksi/URL_CONFIG_GUIDE.md`
- **Backend:** `backend/URL_CONFIG_GUIDE.md`

---

## 🎉 Artık Hazırsınız!

URL yönetimi artık çok kolay:
1. ✅ Tek dosyadan değiştir
2. ✅ Otomatik senkronizasyon
3. ✅ Helper methodlar
4. ✅ Detaylı loglar
5. ✅ Kolay test

---

**Son Güncelleme:** 2025-11-03

**Sorular için:** URL yapılandırma rehberlerini inceleyin veya development ekibine başvurun.

