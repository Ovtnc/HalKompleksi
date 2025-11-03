# TestFlight'ta Veriler Gözükmüyor - HTTPS Çözümü

## 🔍 Problem
TestFlight build'inde ad, ürün resimleri ve şehirler gözükmüyor.

## ✅ Çözüm
Frontend HTTPS kullanıyor ama:
1. ✅ Backend SSL sertifikası çalışıyor (Let's Encrypt)
2. ✅ API endpoint'leri HTTPS üzerinden çalışıyor
3. ❌ Veritabanındaki eski resim URL'leri HTTP kullanıyor

---

## 🚀 Adım 1: Frontend URL Yapılandırması (✅ Yapıldı)

`src/config/env.ts` dosyası HTTPS kullanacak şekilde güncellendi:

```typescript
const API_BASE_URL = 'https://halkompleksi.com/api';
const WEB_BASE_URL = 'https://halkompleksi.com';
```

---

## 🔧 Adım 2: Backend Veritabanı URL'lerini Düzelt

Veritabanındaki eski HTTP URL'lerini HTTPS'e çevirmek için migration script'i hazırlandı.

### Backend Sunucunuzda:

```bash
# 1. Backend dizinine git
cd /path/to/backend

# 2. Migration script'ini çalıştır
node scripts/fix-https-urls.js

# 3. Sonucu kontrol et
# Script tüm HTTP URL'leri HTTPS'e çevirecek
```

**Script şunları yapar:**
- ✅ Ürün resimlerini HTTP → HTTPS
- ✅ Profil resimlerini HTTP → HTTPS
- ✅ Piyasa raporu resimlerini HTTP → HTTPS
- ✅ Eski IP adreslerini domain ile değiştirir

---

## 📱 Adım 3: Backend Production Modunda Çalışıyor mu Kontrol Et

Backend sunucunuzda `.env` dosyasını kontrol edin:

```bash
# Backend sunucuda
cat /path/to/backend/.env

# Şunlar olmalı:
NODE_ENV=production
```

Eğer `NODE_ENV=production` değilse:

```bash
# .env dosyasını düzenle
nano /path/to/backend/.env

# Ekle veya güncelle:
NODE_ENV=production

# Backend'i yeniden başlat
pm2 restart hal-kompleksi-backend
# veya
pm2 restart all
```

---

## 🔄 Adım 4: Yeni TestFlight Build Al

Şimdi tüm değişiklikler yapıldığına göre yeni build alabilirsiniz:

```bash
# Proje dizininde
cd /Users/okanvatanci/Desktop/hal-kompleksi

# Build al (EAS kullanıyorsanız)
eas build --platform ios --profile production

# Veya local build
npx expo prebuild --clean
cd ios
xcodebuild archive \
  -workspace HalKompleksi.xcworkspace \
  -scheme HalKompleksi \
  -configuration Release \
  -archivePath build/HalKompleksi.xcarchive

# TestFlight'a yükle
xcodebuild -exportArchive \
  -archivePath build/HalKompleksi.xcarchive \
  -exportPath build \
  -exportOptionsPlist exportOptions.plist
```

---

## 🧪 Adım 5: Test

### Backend'i Test Et:

```bash
# Test script'i çalıştır
./test-backend-https.sh
```

**Kontrol Listesi:**
- [x] SSL sertifikası çalışıyor ✅
- [x] API endpoint'leri HTTPS üzerinden çalışıyor ✅
- [x] Şehirler endpoint'i veri dönüyor ✅
- [x] Kategoriler endpoint'i veri dönüyor ✅
- [x] Ürünler endpoint'i veri dönüyor ✅
- [ ] **Resim URL'leri HTTPS kullanıyor** ← Migration script'ten sonra ✅ olacak

### Manuel Test:

```bash
# Şehirler
curl https://halkompleksi.com/api/locations/cities

# Kategoriler
curl https://halkompleksi.com/api/categories

# Ürünler (resim URL'lerini kontrol et)
curl https://halkompleksi.com/api/products?page=1&limit=5 | grep -o '"url":"[^"]*"'

# Resim URL'leri şöyle olmalı:
# "url":"https://halkompleksi.com/uploads/..."
# OLMAMALI:
# "url":"http://halkompleksi.com/uploads/..."
# "url":"http://109.199.114.223:5001/uploads/..."
```

---

## 📝 Özet

### Yapılanlar:
1. ✅ Frontend env.ts HTTPS'e çevrildi
2. ✅ Backend SSL sertifikası çalışıyor
3. ✅ Migration script oluşturuldu

### Yapılacaklar:
1. ⏳ Backend sunucuda migration script'i çalıştır
2. ⏳ Backend'in production modunda olduğunu kontrol et
3. ⏳ Yeni TestFlight build al
4. ⏳ TestFlight'ta test et

---

## 🆘 Sorun Giderme

### "Resimler hala gözükmüyor"

```bash
# 1. Backend logs kontrol et
pm2 logs hal-kompleksi-backend

# 2. Nginx logs kontrol et
sudo tail -f /var/log/nginx/error.log

# 3. Resim URL'lerini manuel test et
curl -I https://halkompleksi.com/uploads/products/[dosya-adi]
```

### "Mixed Content Error" (HTTP/HTTPS karışık)

Bu hata iOS'ta resimlerin yüklenmemesine neden olur. 

**Çözüm:**
- Tüm resim URL'leri HTTPS olmalı
- Migration script'i çalıştırın
- Backend'in WEB_URL değişkeni HTTPS kullanmalı

### "Connection Refused"

```bash
# Backend çalışıyor mu?
curl https://halkompleksi.com/api/health

# Nginx çalışıyor mu?
sudo systemctl status nginx

# SSL sertifikası geçerli mi?
sudo certbot certificates
```

---

## ✅ Başarılı Kurulum Kontrolü

TestFlight'ta:
- [ ] Şehirler listesi görünüyor
- [ ] Kategoriler görünüyor
- [ ] Ürün listesi görünüyor
- [ ] Ürün resimleri yükleniyor
- [ ] Profil resimleri yükleniyor
- [ ] Kullanıcı adları görünüyor
- [ ] Ürün detayları açılıyor

---

## 🎉 Sonuç

Migration script'i çalıştırdıktan sonra yeni build almanız gerekecek. Bu işlem:
- ⏱️ Süre: ~10-15 dakika (migration + build)
- 💰 Maliyet: Ücretsiz
- 🔧 Zorluk: Kolay

**Önemli:** Migration script'i sadece bir kez çalıştırmanız yeterli.

Sorularınız varsa yardımcı olabilirim! 🚀

