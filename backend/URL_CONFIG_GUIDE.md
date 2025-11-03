# 🌐 URL YÖNETİMİ REHBERİ

## 📋 Genel Bakış

Bu proje artık **kolay değiştirilebilir URL yönetimi** sistemi ile geliyor. Tüm URL'leri tek bir yerden yönetebilir ve hızlıca geliştirme/production ortamları arasında geçiş yapabilirsiniz.

---

## 🔧 Backend URL Yapılandırması

### Dosya Konumu
```
backend/src/config/urls.js
```

### Nasıl Kullanılır?

#### 1️⃣ Development (Geliştirme) için:

```javascript
const DEV_CONFIG = {
  API_URL: 'http://localhost:5001/api',
  WEB_URL: 'http://localhost:5001',
  FRONTEND_URL: 'http://localhost:8081',
  DOMAIN: 'localhost',
  PORT: 5001,
};
```

#### 2️⃣ Production (Canlı Sunucu) için:

**IP Adresi ile:**
```javascript
const PROD_CONFIG = {
  API_URL: 'http://109.199.114.223:5001/api',
  WEB_URL: 'http://109.199.114.223:5001',
  FRONTEND_URL: 'http://109.199.114.223:5001',
  DOMAIN: '109.199.114.223',
  PORT: 5001,
};
```

**Domain (SSL sonrası):**
```javascript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  FRONTEND_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
  PORT: 443,
};
```

### Helper Methodlar

```javascript
const { getProductUrl, getImageUrl, WEB_URL } = require('./config/urls');

// Ürün linki oluştur
const productLink = getProductUrl('12345');
// Sonuç: http://109.199.114.223:5001/product/12345

// Görsel URL'i oluştur
const imageUrl = getImageUrl('/uploads/products/image.jpg');
// Sonuç: http://109.199.114.223:5001/uploads/products/image.jpg
```

---

## 📱 Frontend URL Yapılandırması

### Dosya Konumu
```
HalKompleksi/src/config/env.ts
```

### Nasıl Kullanılır?

#### 1️⃣ Development (Geliştirme) için:

```typescript
const DEV_CONFIG = {
  API_URL: 'http://localhost:5001/api',
  WEB_URL: 'http://localhost:5001',
  DOMAIN: 'localhost:5001',
};
```

#### 2️⃣ Production (Canlı Sunucu) için:

**IP Adresi ile:**
```typescript
const PROD_CONFIG = {
  API_URL: 'http://109.199.114.223:5001/api',
  WEB_URL: 'http://109.199.114.223:5001',
  DOMAIN: '109.199.114.223:5001',
};
```

**Domain (SSL sonrası):**
```typescript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
};
```

### Helper Methodlar

```typescript
import { ENV } from './config/env';

// Ürün URL'i al
const productUrl = ENV.getProductUrl('12345');

// API endpoint URL'i al
const apiUrl = ENV.getApiUrl('/products');

// Web URL'i al
const webUrl = ENV.getWebUrl('/about');
```

---

## 🚀 Hızlı Değişiklik Nasıl Yapılır?

### Backend için:
1. `backend/src/config/urls.js` dosyasını aç
2. `PROD_CONFIG` içindeki URL'leri değiştir
3. Sunucuyu yeniden başlat: `npm restart` veya `pm2 restart hal-kompleksi`

### Frontend için:
1. `HalKompleksi/src/config/env.ts` dosyasını aç
2. `PROD_CONFIG` içindeki URL'leri değiştir
3. Uygulamayı yeniden build et: `npm run build:android` veya `npm run build:ios`

---

## 🌍 Environment Variables ile Kullanım

Backend için `.env` dosyası oluşturabilirsiniz:

```env
NODE_ENV=production
PORT=5001
API_URL=http://109.199.114.223:5001/api
WEB_URL=http://109.199.114.223:5001
FRONTEND_URL=http://109.199.114.223:5001
DOMAIN=109.199.114.223
```

Bu değerler `urls.js` dosyasındaki default değerleri override eder.

---

## 📝 Kontrol Listesi

### ✅ URL'leri değiştirirken:

- [ ] Backend `urls.js` dosyasını güncelle
- [ ] Frontend `env.ts` dosyasını güncelle
- [ ] Her iki dosyada da aynı URL'leri kullan
- [ ] HTTPS için SSL sertifikası yapılandır
- [ ] Backend'i yeniden başlat
- [ ] Frontend'i yeniden build et
- [ ] Test et: Ürün paylaşımı, görsel yükleme, API çağrıları

### 🔒 SSL Sertifikası sonrası:

- [ ] HTTP → HTTPS değiştir
- [ ] Port 5001 → 443 değiştir (veya uygun port)
- [ ] Domain kullan (IP yerine)
- [ ] iOS Info.plist'te ATS exception'ları kaldır
- [ ] Test et: Tüm API çağrıları ve paylaşımlar

---

## 🐛 Sorun Giderme

### Server başlatınca URL'leri göremiyorsanız:

Backend başladığında şu log'ları göreceksiniz:
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
📦 MongoDB: cloud
============================================
```

### Paylaşım linkleri çalışmıyorsa:

1. `urls.js` ve `env.ts` dosyalarındaki URL'leri kontrol edin
2. Backend'in çalıştığından emin olun
3. CORS ayarlarını kontrol edin
4. Firewall/güvenlik duvarı ayarlarını kontrol edin

---

## 📞 Destek

Sorun yaşarsanız:
1. Backend log'larını kontrol edin: `pm2 logs hal-kompleksi`
2. Frontend console'u kontrol edin
3. URL yapılandırmasını tekrar gözden geçirin

---

**Son Güncelleme:** 2025-11-03

