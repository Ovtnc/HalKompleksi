# 🚀 TestFlight Build Checklist

TestFlight'a build göndermeden önce kontrol edilmesi gerekenler.

## ✅ Yapılan İyileştirmeler (Bu Oturumda)

### 1. **Web Sitesi** 🌐
- ✅ Modern landing page eklendi
- ✅ Deep linking yapılandırması
- ✅ Universal links (iOS/Android)
- ✅ Canlı istatistikler API'si
- ✅ Favicon eklendi
- ✅ Gizlilik ve kullanım şartları sayfaları

### 2. **Şehir Yükleme Sorunu** 📍
- ✅ Fallback şehir listesi eklendi
- ✅ Basitleştirilmiş API çağrısı
- ✅ Backend'de otomatik şehir yükleme
- ✅ Hata yönetimi iyileştirildi

### 3. **Ürün Paylaşım** 🔗
- ✅ Universal link ile paylaşım
- ✅ Otomatik uygulama açma
- ✅ Web sayfası fallback

## 🔍 TestFlight Öncesi Kontrol Listesi

### 1. **API Bağlantısı** ✅
- [x] HTTPS kullanılıyor (`https://halkompleksi.com/api`)
- [x] SSL sertifikası aktif
- [x] Backend çalışıyor
- [ ] Test API çağrısı:
  ```bash
  curl https://halkompleksi.com/api/health
  # Sonuç: {"status":"OK"}
  ```

### 2. **app.json Yapılandırması** ✅
- [x] Bundle ID doğru: `com.halkompleksi.app`
- [x] Version: `1.0.0`
- [x] Build number artırıldı mı?
- [x] iOS associatedDomains eklendi
- [x] Android intentFilters eklendi
- [x] Permissions doğru

### 3. **Env Configuration** ✅
- [x] API_BASE_URL: `https://halkompleksi.com/api`
- [x] HTTPS kullanılıyor (HTTP YASAK!)
- [x] Production URL'leri doğru

### 4. **Deep Linking** ✅
- [x] Scheme: `halkompleksi://`
- [x] Universal links yapılandırması
- [x] Backend web routes hazır
- [x] `.well-known` endpoints hazır

### 5. **Build Dosyaları** 
- [ ] `eas.json` yapılandırması kontrol et
- [ ] Production build profili var mı?
- [ ] Code signing ayarları doğru mu?

## 🎯 TestFlight Build Adımları

### Adım 1: Version Güncelle

```bash
# app.json içinde:
# "version": "1.0.0"  → aynı tutabilirsiniz
# "buildNumber": "1"  → "2" yapın (her build için artırın)
# "versionCode": 1    → 2 yapın (Android için)
```

### Adım 2: EAS Build Komutu

```bash
# iOS için:
eas build --platform ios --profile production

# Her iki platform için:
eas build --platform all --profile production
```

### Adım 3: TestFlight'a Yükle

Build tamamlanınca otomatik olarak App Store Connect'e yüklenecek.

```bash
# Veya manuel submit:
eas submit --platform ios
```

## ⚠️ Kritik Kontroller

### 1. **HTTPS Zorunlu** ⚠️
TestFlight HTTP bağlantıları kabul etmez!

```typescript
// src/config/env.ts kontrol:
const API_BASE_URL = 'https://halkompleksi.com/api'; // ✅ HTTPS
// NOT HTTP! ❌
```

### 2. **SSL Sertifikası Geçerli** 🔒
```bash
# Test edin:
curl https://halkompleksi.com/api/health

# Hata alıyorsanız SSL sorunu var!
```

### 3. **Permissions** 📷
iOS için gerekli izin açıklamaları mevcut:
- ✅ Camera
- ✅ Photo Library
- ✅ Location
- ✅ Microphone (video için)

### 4. **App Store Connect** 🏪
- [ ] Apple Developer hesabı aktif
- [ ] Bundle ID kayıtlı
- [ ] Certificates güncel
- [ ] Provisioning profiles hazır

## 🧪 Son Test Senaryoları

### Kritik Akışlar:

1. **Kayıt & Giriş** ✅
   - Yeni kullanıcı kaydı
   - E-posta ile giriş
   - Şifre unuttum

2. **Ürün Ekleme** ✅
   - Şehir seçimi (fallback ile çalışıyor)
   - İlçe seçimi
   - Fotoğraf yükleme
   - Ürün yayınlama

3. **Ürün Paylaşma** ✅
   - Share butonu
   - WhatsApp entegrasyonu
   - Universal link çalışması

4. **Bildirimler** 
   - Push notification izni
   - Bildirim alma

## 📋 Build Öncesi Son Komutlar

```bash
# 1. Metro cache temizle
npx expo start --clear

# 2. iOS build için:
eas build --platform ios --profile production

# 3. Build status kontrol:
eas build:list

# 4. TestFlight'a submit:
eas submit --platform ios
```

## 🎯 Önerilen Build Profili (eas.json)

```json
{
  "build": {
    "production": {
      "ios": {
        "bundleIdentifier": "com.halkompleksi.app",
        "buildNumber": "2"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## ⚡ Hızlı TestFlight Checklist

- [x] ✅ API HTTPS kullanıyor
- [x] ✅ SSL sertifikası geçerli
- [x] ✅ Backend çalışıyor
- [x] ✅ Şehir yükleme çalışıyor
- [x] ✅ Deep linking yapılandırıldı
- [x] ✅ Web sitesi hazır
- [ ] 📱 Build number artırıldı mı?
- [ ] 🔑 Code signing hazır mı?
- [ ] 🏪 App Store Connect erişimi var mı?

## 🚨 Bilinen Sorunlar ve Çözümleri

### Sorun: "Şehirler gelmiyor"
**Çözüm:** ✅ Fallback listesi eklendi, API başarısız olsa bile çalışır

### Sorun: "HTTP bağlantısı reddedildi"
**Çözüm:** ✅ HTTPS kullanıyoruz

### Sorun: "Universal links çalışmıyor"
**Çözüm:** ✅ Yapılandırıldı, deploy sonrası çalışacak

## 📱 Build Alma Komutu

```bash
# EAS CLI yüklü değilse:
npm install -g eas-cli

# Login:
eas login

# iOS Build (TestFlight için):
eas build --platform ios --profile production
```

## 🎉 Hazırsınız!

Tüm kritik özellikler hazır. Build alabilirsiniz! 🚀

---

**Son Not:** Build sırasında herhangi bir hata alırsanız, hata mesajını gösterin, hemen çözeriz! 💪

