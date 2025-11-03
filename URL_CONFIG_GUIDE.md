# 🌐 Frontend URL YÖNETİMİ REHBERİ

## 📋 Hızlı Başlangıç

Tüm URL'leri **tek bir dosyadan** yönetin!

---

## 📍 Dosya Konumu

```
HalKompleksi/src/config/env.ts
```

---

## 🔧 Nasıl Değiştirilir?

### 1️⃣ DEVELOPMENT (Geliştirme) için:

Dosyayı açın ve `DEV_CONFIG` bölümünü bulun:

```typescript
const DEV_CONFIG = {
  API_URL: 'http://localhost:5001/api',
  WEB_URL: 'http://localhost:5001',
  DOMAIN: 'localhost:5001',
};
```

### 2️⃣ PRODUCTION (Canlı) için:

`PROD_CONFIG` bölümünü güncelleyin:

**IP Adresi ile (Şu anki):**
```typescript
const PROD_CONFIG = {
  API_URL: 'http://109.199.114.223:5001/api',
  WEB_URL: 'http://109.199.114.223:5001',
  DOMAIN: '109.199.114.223:5001',
};
```

**Domain ile (SSL sonrası):**
```typescript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
};
```

---

## 🚀 Otomatik Geçiş

Uygulama otomatik olarak doğru konfigürasyonu kullanır:

- **Development mode** (`npm start`) → `DEV_CONFIG`
- **Production build** (`npm run build`) → `PROD_CONFIG`

---

## 🛠️ Kullanım Örnekleri

### Ürün URL'i oluştur:
```typescript
import { ENV } from './config/env';

const productUrl = ENV.getProductUrl('abc123');
// Sonuç: http://109.199.114.223:5001/product/abc123
```

### API çağrısı yap:
```typescript
const apiUrl = ENV.getApiUrl('/products');
// Sonuç: http://109.199.114.223:5001/api/products
```

### Web sayfası URL'i al:
```typescript
const webUrl = ENV.getWebUrl('/privacy');
// Sonuç: http://109.199.114.223:5001/privacy
```

---

## ✅ Değişiklik Sonrası Yapılacaklar

### 1. URL'leri değiştirdikten sonra:
```bash
# Cache'i temizle
npm run clean

# Uygulamayı yeniden başlat
npm start
```

### 2. Production build için:
```bash
# Android
npm run build:android

# iOS
npm run build:ios

# Her ikisi
eas build --platform all
```

---

## 🔍 Mevcut URL'leri Görmek

Uygulama başladığında console'da göreceksiniz:
```
ENV Configuration:
- API_BASE_URL: http://109.199.114.223:5001/api
- WEB_BASE_URL: http://109.199.114.223:5001
- DOMAIN: 109.199.114.223:5001
```

---

## 🌐 Paylaşım Özellikleri

Ürün paylaşımında kullanılan URL'ler otomatik olarak bu ayarlardan gelir:

### WhatsApp Paylaşımı:
```
🌿 Domates

💰 Fiyat: 15 ₺/kg
📦 Stok: 500 kg
📍 Konum: Antalya

🔗 Detaylar için: http://109.199.114.223:5001/product/abc123

📱 Hal Kompleksi
```

### Satıcıya Mesaj:
```
Merhaba, Hal Kompleksi üzerinden "Domates" hakkında bilgi almak istiyorum.

Fiyat: 15 ₺/kg
Stok: 500 kg
```

---

## 📱 Platform Özellikleri

### iOS:
- ActionSheet menü ile paylaşım seçenekleri
- Native görünüm

### Android:
- Alert Dialog ile paylaşım seçenekleri
- Material Design

Her iki platformda:
- ✅ WhatsApp paylaşımı
- ✅ Instagram Stories
- ✅ Diğer uygulamalar (sistem paylaşım menüsü)

---

## 🔒 SSL Geçişi

SSL sertifikası aldıktan sonra:

### 1. env.ts'i güncelle:
```typescript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',  // ✅ HTTPS
  WEB_URL: 'https://halkompleksi.com',       // ✅ HTTPS
  DOMAIN: 'halkompleksi.com',                 // ✅ Domain
};
```

### 2. iOS Info.plist'ten ATS exception'ı kaldır
```xml
<!-- Bu kısmı sil veya yorum yap -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
</dict>
```

### 3. Rebuild et
```bash
eas build --platform all
```

---

## 🐛 Sorun Giderme

### URL'ler paylaşımda görünmüyorsa:
1. `env.ts` dosyasını kontrol et
2. Backend'in aynı URL'leri kullandığından emin ol
3. Uygulamayı yeniden başlat (`npm run clean && npm start`)

### API çağrıları başarısız oluyorsa:
1. Backend'in çalıştığından emin ol
2. URL'lerin doğru olduğunu kontrol et
3. CORS ayarlarını kontrol et
4. Firewall/güvenlik duvarı ayarlarını kontrol et

### Görseller yüklenmiyor:
1. Backend'de `uploads` klasörü erişilebilir mi?
2. URL'ler doğru mu?
3. CORS header'ları ekli mi?

---

## 📞 Backend ile Senkronizasyon

⚠️ **ÖNEMLİ:** Backend ve Frontend'te **aynı URL'leri** kullanın!

**Backend:** `backend/src/config/urls.js`
**Frontend:** `HalKompleksi/src/config/env.ts`

İkisini de güncelleyip senkronize tutun.

---

## 📝 Kontrol Listesi

URL değişikliği yaparken:

- [ ] `env.ts` dosyasını güncelle
- [ ] Backend `urls.js` ile senkronize et
- [ ] Cache'i temizle (`npm run clean`)
- [ ] Uygulamayı yeniden başlat
- [ ] Test et:
  - [ ] Ürün paylaşımı
  - [ ] WhatsApp mesajı
  - [ ] Instagram Stories
  - [ ] API çağrıları
  - [ ] Görsel yükleme
- [ ] Production build yap
- [ ] Store'a yükle

---

**Son Güncelleme:** 2025-11-03

**Dosya Konumu:** `HalKompleksi/src/config/env.ts`

