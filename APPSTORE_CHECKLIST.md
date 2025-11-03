# 🍎 APP STORE YÜKLEME KONTROL LİSTESİ

## ❌ KRİTİK - Mutlaka Düzeltilmeli

### 1. SSL/HTTPS Kurulumu (EN ÖNEMLİ!)
- [ ] Backend sunucusuna SSL sertifikası kuruldu
- [ ] HTTPS ile erişim test edildi
- [ ] `https://109.199.114.223:5001/api` çalışıyor
- [ ] Tüm image URL'leri HTTPS üzerinden erişilebilir
- [ ] WhatsApp deeplinking HTTPS ile test edildi

**Şu an durum:** ❌ HTTP kullanılıyor → **Apple reddedecek!**
**Düzeltme:** `APPSTORE_SETUP.md` dosyasındaki SSL kurulum talimatlarını takip edin

---

## 🟡 ÖNEMLİ - Güncellenmeli

### 2. EAS Configuration
- [ ] `eas.json` → Apple ID güncellendi
- [ ] `eas.json` → ASC App ID eklendi  
- [ ] `eas.json` → Apple Team ID eklendi
- [ ] Google Service Account JSON eklendi (Android için)

**Şu an durum:** 🟡 Placeholder değerler var
**Düzeltme:** Gerçek Apple Developer bilgilerinizi girin

### 3. App Privacy (Gizlilik Formu) 🔴 ZORUNLU
- [ ] App Privacy formu dolduruldu
- [ ] Contact Info (Email, Phone, Name) eklendi
- [ ] Location (Coarse & Precise) eklendi
- [ ] User Content (Photos/Videos) eklendi
- [ ] Identifiers (User ID) eklendi
- [ ] Purchases (Purchase History) eklendi
- [ ] Privacy Policy yayınlandı
- [ ] Privacy Policy URL App Store Connect'e eklendi

**⚠️ ÖNEMLİ:** Apple, App Privacy formunu doldurmadan uygulama yükletmiyor!
**Rehber:** `APP_PRIVACY_GUIDE.md` dosyasına bakın
**Privacy Policy HTML:** `privacy-policy.html` hazır (düzenleyip yayınlayın)

### 3B. Content Rights (İçerik Hakları) 🔴 ZORUNLU
- [ ] App Information → Content Rights dolduruldu
- [ ] "Third-party content?" → YES seçildi
- [ ] "Have rights?" → YES seçildi
- [ ] Terms of Service hazırlandı
- [ ] Terms of Service yayınlandı
- [ ] Terms of Service URL App Store Connect'e eklendi

**⚠️ YENİ GEREKLILIK:** Apple, içerik haklarını belirtmeden submit ettirmiyor!
**Rehber:** `CONTENT_RIGHTS_GUIDE.md` dosyasına bakın
**Terms of Service HTML:** `terms-of-service.html` hazır (düzenleyip yayınlayın)

### 4. App Store Connect Metadata
- [ ] Uygulama açıklaması hazırlandı (Türkçe + İngilizce)
- [ ] Ekran görüntüleri hazırlandı (3+ boyut)
- [ ] App icon 1024x1024 hazır
- [ ] Keywords belirlendi
- [ ] Support URL belirlendi
- [ ] Kategori seçildi
- [ ] İçerik derecelendirmesi yapıldı
- [ ] Fiyatlandırma belirlendi

### 5. Test Hesabı
- [ ] Demo hesap oluşturuldu
- [ ] Hesap bilgileri test edildi
- [ ] Satıcı rolü aktif
- [ ] Örnek ürünler eklendi
- [ ] Tüm özellikler çalışıyor

**Demo Hesap:**
```
Email: demo@halkompleksi.com
Password: Demo123!
Role: seller
```

---

## ✅ TAMAMLANDI - İyi Durumda

### 6. Kod Kalitesi
- [x] Console.log'lar production'da kaldırılıyor (babel config)
- [x] Error handling yapılmış
- [x] Loading states var
- [x] Error messages kullanıcı dostu
- [x] TypeScript kullanılmış
- [x] ESLint yapılandırılmış

### 7. İzinler ve Gizlilik
- [x] Camera permission açıklaması (`NSCameraUsageDescription`)
- [x] Photo library permission (`NSPhotoLibraryUsageDescription`)
- [x] Location permission (`NSLocationWhenInUseUsageDescription`)
- [x] Microphone permission (`NSMicrophoneUsageDescription`)
- [x] WhatsApp URL scheme (`LSApplicationQueriesSchemes`)

### 8. App Configuration
- [x] Bundle Identifier: `com.halkompleksi.app`
- [x] Version: 1.0.0
- [x] Build Number: 1
- [x] Display Name: Hal Kompleksi
- [x] Minimum iOS: 12.0
- [x] Orientation: Portrait

### 9. Backend API
- [x] Authentication çalışıyor
- [x] Product CRUD operasyonları
- [x] Image upload sistemi
- [x] Profile image sistemi
- [x] Rate limiting aktif
- [x] CORS yapılandırması
- [x] Error handling
- [x] MongoDB bağlantısı

### 10. Features
- [x] User authentication (login/register)
- [x] Role switching (buyer/seller)
- [x] Product listing
- [x] Product detail
- [x] Product search & filters
- [x] Favorites
- [x] Profile management
- [x] Image picker & upload
- [x] WhatsApp integration
- [x] Market reports
- [x] Notifications
- [x] Admin panel

### 11. Performance
- [x] Image optimization
- [x] Lazy loading
- [x] Caching strategy
- [x] Bundle size optimized
- [x] React Native new architecture enabled

---

## 📋 YÜKLEME ADIMları

### Adım 1: SSL Kurulumu (Kritik!)
```bash
# Sunucuya bağlan
ssh root@109.199.114.223

# SSL sertifikası kur
certbot --nginx -d yourdomain.com
```

### Adım 2: eas.json Güncelle
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "GERÇEK-APPLE-ID",
        "ascAppId": "GERÇEK-ASC-ID",
        "appleTeamId": "GERÇEK-TEAM-ID"
      }
    }
  }
}
```

### Adım 3: Build
```bash
cd HalKompleksi
eas build --platform ios --profile production
```

### Adım 4: TestFlight
```bash
eas submit --platform ios --latest
```

### Adım 5: App Store Connect
1. App Store Connect'e gir
2. My Apps → Hal Kompleksi
3. Metadata ekle
4. Screenshots yükle
5. TestFlight'tan build seç
6. Submit for Review

---

## 🔍 TEST KONTROL LİSTESİ

TestFlight veya fiziksel cihazda test edin:

### Temel Fonksiyonlar
- [ ] Kayıt olma çalışıyor
- [ ] Giriş yapma çalışıyor
- [ ] Çıkış yapma çalışıyor
- [ ] Profil güncelleme çalışıyor
- [ ] Profil resmi yükleme çalışıyor
- [ ] Rol değiştirme çalışıyor

### Ürün Yönetimi
- [ ] Ürün listeleme çalışıyor
- [ ] Ürün detay görüntüleme
- [ ] Ürün arama çalışıyor
- [ ] Filtreler çalışıyor
- [ ] Favorilere ekleme çalışıyor
- [ ] Ürün ekleme (satıcı)
- [ ] Ürün düzenleme (satıcı)
- [ ] Ürün silme (satıcı)
- [ ] Resim/video upload

### İletişim
- [ ] WhatsApp butonu çalışıyor
- [ ] Telefon araması çalışıyor
- [ ] Paylaşma çalışıyor

### Performans
- [ ] Uygulama hızlı açılıyor
- [ ] Resimler hızlı yükleniyor
- [ ] Kaydırma akıcı
- [ ] Çökme/crash yok
- [ ] Memory leak yok

---

## ⚠️ YAYIN ÖNCESI SON KONTROL

1. **Tüm console.log'lar kaldırıldı mı?** ✅ (Otomatik)
2. **HTTPS kullanılıyor mu?** ❌ → SSL kur
3. **App Privacy formu dolduruldu mu?** 🔴 → ZORUNLU! `APP_PRIVACY_GUIDE.md`
4. **Content Rights ayarlandı mı?** 🔴 → ZORUNLU! `CONTENT_RIGHTS_GUIDE.md`
5. **Privacy policy yayında mı?** ❌ → `privacy-policy.html` düzenleyip yayınla
6. **Terms of Service yayında mı?** ❌ → `terms-of-service.html` düzenleyip yayınla
7. **Test hesabı çalışıyor mu?** → Test et
8. **Crash var mı?** → TestFlight logs kontrol et
9. **Apple guidelines uygun mu?** → Gözden geçir
10. **Support URL aktif mi?** → Kontrol et
11. **Metadata tam mı?** → Tamamla
12. **Screenshots hazır mı?** → Hazırla
13. **Backend stabil mi?** → Load test yap

---

## 📊 BEKLENEN TIMELINE

1. **SSL Kurulumu**: 1-2 saat
2. **EAS Config**: 30 dakika
3. **Build**: 30-45 dakika
4. **TestFlight Upload**: 15 dakika
5. **TestFlight Processing**: 10-30 dakika
6. **Internal Testing**: 2-3 gün
7. **Metadata Hazırlık**: 2-4 saat
8. **Submit for Review**: 5 dakika
9. **Apple Review**: 1-3 gün
10. **Yayına Girme**: Anında

**Toplam Tahmini Süre**: 5-7 gün

---

## 🚨 YAYIN ENGEL LİSTESİ

### Şu Anda App Store'a Gönderemezsiniz Çünkü:

1. ❌ **HTTP kullanımı** - Apple otomatik reddeder
2. 🔴 **App Privacy formu** - Doldurulmadan submit edilemez (ZORUNLU!)
3. 🔴 **Content Rights** - Doldurulmadan submit edilemez (ZORUNLU!)
4. 🟡 **EAS credentials** - Placeholder değerler
5. 🟡 **Privacy Policy URL** - Yayınlanmalı
6. 🟡 **Terms of Service URL** - Yayınlanmalı
7. 🟡 **Test hesabı** - Hazırlanmalı
8. 🟡 **Metadata** - Eklenmeli

### Düzeltme Sonrası Yayınlanabilir

SSL kurduktan ve credentials güncelledikten sonra yayınlanmaya hazır! 🚀

---

## 📞 DESTEK

**Backend Logs:**
```bash
pm2 logs hal-kompleksi
```

**Frontend Debugging:**
```bash
npx expo start --clear
```

**EAS Build Status:**
```bash
eas build:list
```

**Apple Review Status:**
- App Store Connect → My Apps → Activity

---

## ✅ SON ONAY

Yukarıdaki tüm ❌ ve 🟡 işaretli konular düzeltildiğinde, uygulamanız App Store'a yüklenmeye hazır olacak!

**En kritik:** SSL/HTTPS kurulumu - Bu olmadan Apple kesinlikle reddedecek.

