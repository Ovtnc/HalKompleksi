# ⚠️ APP STORE'A YÜKLEMEDEN ÖNCE YAPMALISINIZ

## 🔴 KRİTİK - ZORUNLU

### 1. SSL Sertifikası (EN ÖNEMLİ!)

**Neden:** Apple App Store, HTTPS olmayan API'lara izin vermez.

**Şu An:** HTTP kullanılıyor + ATS exception var (geçici çözüm)

**Yapılacak:**
```bash
# Sunucuya bağlan
ssh root@109.199.114.223

# Let's Encrypt ile SSL kur
apt-get update
apt-get install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com

# Test et
curl https://yourdomain.com/api/products
```

**Sonra:**
1. `HalKompleksi/src/config/env.ts` → URL'i HTTPS yap
2. `HalKompleksi/ios/HalKompleksi/Info.plist` → ATS exception kaldır
3. Test et

---

### 2. EAS Credentials Güncelle

**Dosya:** `HalKompleksi/eas.json`

**Değiştirilecekler:**
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "sizin-apple-id@example.com",  // ← Güncelleyin
        "ascAppId": "1234567890",                  // ← App Store Connect'ten alın
        "appleTeamId": "ABCD123456"                // ← developer.apple.com → Membership
      }
    }
  }
}
```

**Nasıl Bulunur:**
- Apple ID: Apple Developer hesabınızın email'i
- ASC App ID: App Store Connect → My Apps → App Information → Apple ID
- Team ID: developer.apple.com → Account → Membership → Team ID

---

### 3. Demo Test Hesabı Oluştur

```sql
-- Backend'de bir test kullanıcısı oluşturun
Email: demo@halkompleksi.com
Password: Demo123!
Role: seller (hem buyer hem seller yetkisi)
```

**Test Et:**
- Giriş yapabiliyor mu?
- Ürün ekleyebiliyor mu?
- Profil güncelleyebiliyor mu?
- WhatsApp çalışıyor mu?

---

## 🟡 ÖNEMLİ - Tamamlanmalı

### 4. App Store Connect Metadata

1. **App Store Connect'e gir:**
   - https://appstoreconnect.apple.com
   - My Apps → Create New App

2. **Gerekli Bilgiler:**
   ```
   Name: Hal Kompleksi
   Primary Language: Turkish
   Bundle ID: com.halkompleksi.app
   SKU: halkompleksi001
   ```

3. **Açıklama (Türkçe):**
   ```
   Hal Kompleksi - Çiftçiler ve Alıcıları Buluşturan Platform

   Hal Kompleksi, tarım ürünleri ticaretini kolaylaştıran modern bir platformdur. 
   Çiftçiler ve satıcılar ürünlerini listeleyebilir, alıcılar ise ihtiyaçları olan 
   ürünleri kolayca bulabilir.

   Özellikler:
   • Ürün listeleme ve arama
   • Kategorilere göre filtreleme
   • Konum bazlı arama
   • Doğrudan iletişim (WhatsApp entegrasyonu)
   • Profil yönetimi
   • Favoriler sistemi
   • Güncel hal fiyatları
   • Piyasa raporları
   ```

4. **Keywords:**
   ```
   hal, tarım, çiftçi, ürün, pazar, organik, sebze, meyve, ticaret, alıcı
   ```

5. **Support URL:**
   ```
   https://halkompleksi.com/support  (hazırlanmalı)
   ```

6. **Privacy Policy URL:**
   ```
   https://halkompleksi.com/privacy  (hazırlanmalı)
   ```

---

### 5. Ekran Görüntüleri Hazırla

**Gerekli Boyutlar:**
- 6.7" (iPhone 14 Pro Max): 1290 x 2796 px - 3+ screenshot
- 5.5" (iPhone 8 Plus): 1242 x 2208 px - 3+ screenshot

**Hangi Ekranlar:**
1. Ana sayfa (ürün listesi)
2. Ürün detay
3. Profil/Ayarlar
4. Satıcı dashboard
5. Ürün ekleme ekranı

**Not:** TestFlight'tan veya simulator'dan alabilirsiniz.

---

### 6. Privacy Policy Hazırla

**Minimum İçerik:**
```
1. Toplanan Veriler:
   - Email adresi
   - Telefon numarası
   - Konum bilgisi (opsiyonel)
   - Yüklenen fotoğraflar

2. Veri Kullanımı:
   - Hesap oluşturma ve yönetimi
   - Ürün listeleme
   - İletişim sağlama

3. Üçüncü Taraf Servisler:
   - WhatsApp (iletişim için)
   - MongoDB (veri saklama)

4. Veri Güvenliği:
   - Şifreler hash'leniyor
   - HTTPS ile iletişim
   - JWT authentication

5. Kullanıcı Hakları:
   - Hesap silme hakkı
   - Veri indirme hakkı
   - İletişim: support@halkompleksi.com
```

**Yayınlama:**
- Web sitesinde yayınlayın
- URL'i App Store Connect'e ekleyin

---

## 📱 BUILD ve YÜKLEME ADIMLARI

### Adım 1: Son Kontroller
```bash
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi

# Lint check
npm run lint

# Type check
npm run type-check

# Test (varsa)
npm test
```

### Adım 2: EAS Login
```bash
npx eas login
```

### Adım 3: iOS Build
```bash
# Production build
eas build --platform ios --profile production

# Build tamamlanana kadar bekleyin (30-45 dakika)
```

### Adım 4: TestFlight'a Submit
```bash
# Otomatik submit
eas submit --platform ios --latest

# Veya manuel: Build'i indirin ve Transporter ile yükleyin
```

### Adım 5: TestFlight Testing
1. App Store Connect → TestFlight
2. Build'i seçin
3. Internal Testing Group oluşturun
4. Test edin (en az 5 kişi, 2-3 gün)

### Adım 6: App Store Submit
1. App Store Connect → My Apps → Hal Kompleksi
2. + Version → 1.0
3. Metadata'yı doldurun
4. Screenshots'ları yükleyin
5. TestFlight build'i seçin
6. **App Review Information:**
   ```
   Demo Account:
   Username: demo@halkompleksi.com
   Password: Demo123!
   
   Notes:
   - Demo hesabı ile giriş yapın
   - Satıcı rolünde test edebilirsiniz
   - Ürün ekleyebilir, düzenleyebilirsiniz
   - WhatsApp ile iletişim özelliği test edilebilir
   ```
7. Submit for Review

---

## ⏱️ ZAMANLAMA

| Adım | Süre |
|------|------|
| SSL Kurulumu | 1-2 saat |
| Metadata Hazırlık | 2-4 saat |
| Screenshot Hazırlama | 1-2 saat |
| Build | 30-45 dakika |
| TestFlight Upload | 15-30 dakika |
| Internal Testing | 2-3 gün |
| Submit for Review | 5 dakika |
| **Apple Review** | **1-3 gün** |
| Yayına Girme | Anında |

**Toplam:** ~5-7 gün

---

## 🚨 SIKÇA SORULAN SORULAR

### Apple neden reddeder?
1. **HTTP kullanımı** - En yaygın red nedeni (SSL kurun!)
2. **Test hesabı çalışmıyor** - Mutlaka test edin
3. **Çökme/crash** - TestFlight'ta test edin
4. **Metadata eksik** - Tüm alanları doldurun
5. **Gizlilik politikası yok** - Hazırlayın

### SSL nasıl kurulur?
```bash
# Certbot ile kolay kurulum
certbot --nginx -d yourdomain.com

# Otomatik yenileme
certbot renew --dry-run
```

### HTTP exception kaldırılmalı mı?
**Evet!** SSL kurduktan sonra:
1. `Info.plist` → NSExceptionDomains bölümünü sil
2. `env.ts` → URL'i HTTPS yap
3. Test et

### Build sırasında hata alırsam?
```bash
# Cache temizle
expo r -c

# Node modules temizle
rm -rf node_modules package-lock.json
npm install

# iOS pods temizle
cd ios && pod install && cd ..

# Tekrar dene
eas build --platform ios --profile production
```

---

## ✅ KONTROL LİSTESİ

Yüklemeden önce kontrol edin:

- [ ] SSL sertifikası kuruldu
- [ ] HTTPS test edildi
- [ ] eas.json güncellendi
- [ ] Demo hesap hazır ve test edildi
- [ ] Metadata tamamlandı
- [ ] Screenshots hazırlandı
- [ ] Privacy policy yayınlandı
- [ ] Support URL aktif
- [ ] TestFlight testi yapıldı
- [ ] Crash/bug yok
- [ ] WhatsApp integration çalışıyor
- [ ] Tüm özellikler test edildi

---

## 📞 YARDIM

**Build Hataları:**
```bash
eas build:list              # Build durumlarını göster
eas build:view [BUILD_ID]   # Detaylı log
```

**Backend Hataları:**
```bash
ssh root@109.199.114.223
pm2 logs hal-kompleksi
```

**Apple Review Rejection:**
- Resolution Center'dan iletişime geçin
- Sorunları düzeltin
- Tekrar submit edin

---

## 🎉 BAŞARILAR!

Bu checklist'i tamamladığınızda, uygulamanız App Store'da yayına girmeye hazır olacak!

**Son hatırlatma:** SSL kurulumu ZORUNLU, bu olmadan Apple kesinlikle reddeder! 🔒


