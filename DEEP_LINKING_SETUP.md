# 🔗 Deep Linking & Universal Links Kurulumu

Ürün paylaşım linkleri artık uygulamayı doğrudan açabilir!

## ✅ Yapılan Değişiklikler

### 1. **App.json Yapılandırması**
- ✅ iOS için `associatedDomains` eklendi
- ✅ Android için `intentFilters` eklendi
- ✅ URL scheme: `halkompleksi://`
- ✅ Universal link: `https://halkompleksi.com`

### 2. **Backend Routes**
- ✅ `/product/:productId` - Web görüntüleme sayfası
- ✅ `/.well-known/apple-app-site-association` - iOS Universal Links
- ✅ `/.well-known/assetlinks.json` - Android App Links

### 3. **Paylaşım Mesajı**
- ✅ Basitleştirilmiş paylaşım mesajı
- ✅ Universal Link kullanımı (hem web hem app)
- ✅ Otomatik yönlendirme

## 🎯 Nasıl Çalışır?

### Kullanıcı Deneyimi:

1. **Ürün Paylaş** butonuna basılır
2. Paylaşım mesajı oluşturulur: `https://halkompleksi.com/product/123456`
3. Link paylaşılır (WhatsApp, SMS, sosyal medya, vs.)
4. Alıcı linke tıklar:
   - ✅ **Uygulama yüklüyse**: Direkt ürün detay sayfası açılır
   - ✅ **Uygulama yoksa**: Web sayfası açılır ve App Store/Google Play linkler gösterilir
   - ✅ Web sayfası otomatik olarak uygulamayı açmayı dener

## 📱 Test Etme

### iOS Test:
```bash
# Uygulamayı build et
npx expo run:ios

# Deep link test
xcrun simctl openurl booted "halkompleksi://product/PRODUCT_ID"

# Universal link test
xcrun simctl openurl booted "https://halkompleksi.com/product/PRODUCT_ID"
```

### Android Test:
```bash
# Uygulamayı build et
npx expo run:android

# Deep link test
adb shell am start -W -a android.intent.action.VIEW -d "halkompleksi://product/PRODUCT_ID" com.halkompleksi.app

# Universal link test
adb shell am start -W -a android.intent.action.VIEW -d "https://halkompleksi.com/product/PRODUCT_ID" com.halkompleksi.app
```

### Manuel Test:
1. Uygulamayı açın
2. Bir ürün seçin
3. Paylaş butonuna basın
4. Kendine mesaj gönderin (WhatsApp, SMS)
5. Linke tıklayın
6. Uygulamanın otomatik açıldığını görün

## 🔧 Gerekli Ayarlar

### iOS - Apple Developer:
1. Apple Developer hesabınıza giriş yapın
2. Certificates, Identifiers & Profiles > Identifiers
3. Bundle ID'nizi seçin: `com.halkompleksi.app`
4. Associated Domains capability'sini aktif edin
5. Domain ekleyin: `applinks:halkompleksi.com`

### Android - Google Play Console:
1. Google Play Console'a giriş yapın
2. App signing altından SHA256 fingerprint'i alın
3. Backend'de `server.js` dosyasını güncelleyin:
   ```javascript
   sha256_cert_fingerprints: [
     'YOUR_SHA256_FINGERPRINT_HERE'  // Buraya yapıştır
   ]
   ```

### Backend - SSL Zorunlu:
⚠️ **ÖNEMLİ**: Universal Links yalnızca HTTPS ile çalışır!

```bash
# SSL sertifikanızın aktif olduğundan emin olun
curl https://halkompleksi.com/.well-known/apple-app-site-association
```

## 🌐 Domain Yapılandırması

### DNS Ayarları:
Domain'inizin backend serverınıza işaret ettiğinden emin olun:
```
halkompleksi.com -> 109.199.114.223
```

### SSL Sertifikası:
Let's Encrypt ile ücretsiz SSL:
```bash
certbot --nginx -d halkompleksi.com
```

## 📋 Link Formatları

### Deep Link (Custom Scheme):
```
halkompleksi://product/123456
```
- ✅ Uygulama yüklüyse çalışır
- ❌ Uygulama yoksa hata verir
- ❌ Web'de çalışmaz

### Universal Link (HTTPS):
```
https://halkompleksi.com/product/123456
```
- ✅ Uygulama yüklüyse uygulama açılır
- ✅ Uygulama yoksa web sayfası açılır
- ✅ Her platformda çalışır
- ✅ **ÖNERİLEN YÖNTEM**

## 🐛 Sorun Giderme

### iOS'ta Çalışmıyor:
1. Associated Domains doğru mu?
   ```bash
   # app.json kontrol
   "associatedDomains": ["applinks:halkompleksi.com"]
   ```

2. Apple dosyası erişilebilir mi?
   ```bash
   curl https://halkompleksi.com/.well-known/apple-app-site-association
   ```

3. TEAM_ID doğru mu?
   - Apple Developer > Membership > Team ID
   - Backend `server.js`'te güncelleyin

### Android'de Çalışmıyor:
1. Intent filter doğru mu?
   ```bash
   # app.json kontrol
   "intentFilters": [...]
   ```

2. SHA256 fingerprint doğru mu?
   ```bash
   # Play Console'dan alın ve server.js'e ekleyin
   ```

3. assetlinks.json erişilebilir mi?
   ```bash
   curl https://halkompleksi.com/.well-known/assetlinks.json
   ```

### Web Sayfası Açılmıyor:
1. Backend route doğru mu?
   ```bash
   curl https://halkompleksi.com/product/TEST_ID
   ```

2. product.html dosyası var mı?
   ```bash
   ls backend/public/product.html
   ```

## 🚀 Deploy Checklist

- [ ] SSL sertifikası aktif
- [ ] Backend route'lar test edildi
- [ ] iOS Associated Domains yapılandırıldı
- [ ] Android Intent Filters yapılandırıldı
- [ ] Apple Team ID güncellendi
- [ ] Android SHA256 fingerprint eklendi
- [ ] Production build test edildi
- [ ] Link paylaşımı test edildi

## 📚 Kaynaklar

- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [Expo Linking](https://docs.expo.dev/guides/linking/)

## 💡 İpuçları

1. **Test ortamında**: Deep link kullanın (hızlı ve kolay)
2. **Production'da**: Universal link kullanın (profesyonel ve güvenli)
3. **Her zaman**: HTTPS kullanın (güvenlik ve iOS zorunluluğu)
4. **Paylaşırken**: Kısa ve açık mesajlar kullanın

---

✅ **Artık ürün linkleri hem web'de hem uygulamada sorunsuz çalışıyor!**

