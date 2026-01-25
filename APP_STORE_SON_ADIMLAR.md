# 🚀 APP STORE'A YÜKLEME - SON ADIMLAR

## ⚠️ ÖNEMLİ: Bu Adımları Sırayla Takip Edin!

---

## ADIM 1: SSL/HTTPS Kurulumu (EN KRİTİK!) 🔒

### Backend Sunucunuza SSL Sertifikası Kurmalısınız!

**Şu anki durum:** ✅ Frontend HTTPS kullanacak şekilde güncellendi
**Eksik olan:** Backend sunucunuzda SSL sertifikası kurulu değil

### SSL Kurulum Seçenekleri:

#### Seçenek A: Let's Encrypt (ÜCRETSİZ - Önerilen)
```bash
# Sunucuya bağlanın
ssh root@109.199.114.223

# Certbot yükleyin
apt-get update
apt-get install certbot python3-certbot-nginx

# SSL sertifikası alın
certbot --nginx -d halkompleksi.com

# Otomatik yenileme ayarlayın
certbot renew --dry-run
```

#### Seçenek B: Cloudflare (ÜCRETSİZ - En Kolay)
1. Cloudflare'e domain ekleyin
2. SSL/TLS → "Full" veya "Full (strict)" seçin
3. Nameserver'ları güncelleyin
4. Cloudflare otomatik SSL sağlar ✓

**Detaylı rehber:** `CLOUDFLARE_NATRO_CONTABO_SETUP.md` dosyasına bakın

### Test Edin:
```bash
# HTTPS çalışıyor mu?
curl -I https://halkompleksi.com/api/health

# Başarılı yanıt almalısınız
# HTTP/2 200 OK
```

---

## ADIM 2: EAS Configuration Güncellemesi 🔑

### 2.1 Apple Developer Bilgilerinizi Alın

1. **Apple Developer hesabınıza gidin:** https://developer.apple.com
2. **Apple ID:** developer@sizinmail.com (hesabınızın e-postası)
3. **Team ID:** 
   - https://developer.apple.com/account → Membership → Team ID
   - Örnek: `XYZ1234ABC`

### 2.2 App Store Connect'te App Oluşturun

1. https://appstoreconnect.apple.com → My Apps → +
2. **Bundle ID:** `com.halkompleksi.app` seçin
3. **App Name:** "Hal Kompleksi"
4. Oluşturulduktan sonra **App ID**'yi not edin (örnek: 1234567890)

### 2.3 eas.json'u Güncelleyin

```bash
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi
```

Dosyayı açın ve şu değerleri GÜNCELLEYİN:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

---

## ADIM 3: Privacy Policy ve Terms of Service Yayınlama 📄

### 3.1 Dosyaları Düzenleyin

**Privacy Policy:** `privacy-policy.html`
- Satır 264: Telefon numaranızı ekleyin
- Satır 266: Adresinizi ekleyin
- Satır 268: Şirket adınızı ekleyin

**Terms of Service:** `terms-of-service.html`
- Satır 340: Yetkili mahkeme şehrini ekleyin
- Satır 393: Telefon numaranızı ekleyin
- Satır 395: Adresinizi ekleyin
- Satır 397: Şirket adınızı ekleyin
- Satır 398: Vergi numaranızı ekleyin

### 3.2 Dosyaları Web Sitenize Yükleyin

Backend sunucunuza yükleyin:

```bash
# Backend public klasörüne kopyalayın
scp privacy-policy.html root@109.199.114.223:/root/hal-kompleksi-backend/public/
scp terms-of-service.html root@109.199.114.223:/root/hal-kompleksi-backend/public/
```

VEYA

Cloudflare Pages / Vercel / Netlify gibi bir servise yükleyin (ÜCRETSİZ).

### 3.3 URL'leri Test Edin

Şu URL'ler çalışmalı:
- https://halkompleksi.com/privacy-policy.html
- https://halkompleksi.com/terms-of-service.html

---

## ADIM 4: Test Hesabı Hazırlama 👤

### Demo hesap oluşturun:

```
Email: demo@halkompleksi.com
Şifre: Demo123!
Rol: seller (satıcı)
Örnek ürünler: En az 3-5 ürün ekleyin
```

Apple review ekibi bu hesapla test yapacak!

---

## ADIM 5: App Store Connect Metadata 📝

### 5.1 App Information

1. **Category:** Shopping veya Food & Drink
2. **Subtitle:** "Çiftçiler ve Alıcılar Buluşuyor"
3. **Keywords:** hal,tarım,çiftçi,alıcı,ürün,sebze,meyve,market,toptan
4. **Privacy Policy URL:** https://halkompleksi.com/privacy-policy.html
5. **Terms of Service URL:** https://halkompleksi.com/terms-of-service.html

### 5.2 Pricing and Availability

- **Price:** Free
- **Availability:** Turkey (Türkiye)

### 5.3 Age Ratings

- **Age Rating:** 4+
- No objectionable content

### 5.4 App Privacy (ÇOK ÖNEMLİ!) 🔴

**Privacy Practices başlığında:**

1. **Data Collection:**
   - Contact Info → Name, Email, Phone Number
   - Location → Coarse Location, Precise Location
   - User Content → Photos or Videos
   - Identifiers → User ID
   - Purchases → Purchase History

2. **Data Uses:**
   - Product Personalization
   - App Functionality
   - Analytics (NO - kullanmıyoruz)
   - Advertising (NO - kullanmıyoruz)

3. **Data Linked to User:**
   - ✓ All collected data is linked to user identity

4. **Tracking:**
   - ❌ NO - We do NOT track users

**Detaylı rehber:** `APP_PRIVACY_GUIDE.md`

### 5.5 Content Rights (ÇOK ÖNEMLİ!) 🔴

1. **App Information → Content Rights:**
   - "Does your app display third-party content?" → **YES**
   - "Do you have all necessary rights?" → **YES**
   - Açıklama: "Users upload their own product images. We have terms of service requiring users to have rights to uploaded content."

**Detaylı rehber:** `CONTENT_RIGHTS_GUIDE.md`

---

## ADIM 6: Ekran Görüntüleri Hazırlama 📱

### Gerekli Boyutlar:

1. **iPhone 6.7"** (iPhone 15 Pro Max): 1290 x 2796 px (3-10 adet)
2. **iPhone 6.5"** (iPhone 11 Pro Max): 1242 x 2688 px (3-10 adet)
3. **iPhone 5.5"** (iPhone 8 Plus): 1242 x 2208 px (3-10 adet)

### Önerilen Ekranlar:

1. Ana sayfa (ürün listesi)
2. Ürün detay sayfası
3. Arama ve filtreler
4. Satıcı profili
5. Ürün ekleme ekranı

### Araçlar:

- iOS Simulator → Cmd+S (ekran görüntüsü)
- Veya App Store Screenshot Generator kullanın

---

## ADIM 7: Production Build 🏗️

### 7.1 Temizlik

```bash
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi

# Cache temizle
rm -rf .expo ios/build node_modules/.cache

# Bağımlılıkları yeniden yükle
npm install
```

### 7.2 EAS Login

```bash
# EAS'a giriş yapın
npx eas login

# Projeyi yapılandırın (ilk kez)
npx eas build:configure
```

### 7.3 iOS Build

```bash
# Production build başlat
npx eas build --platform ios --profile production
```

**Süre:** ~30-45 dakika
**Sonuç:** .ipa dosyası (TestFlight için)

---

## ADIM 8: TestFlight'a Yükleme ✈️

### Otomatik Yükleme:

```bash
npx eas submit --platform ios --latest
```

### Manual Yükleme:

1. Build tamamlanınca .ipa dosyasını indirin
2. Xcode → Window → Organizer
3. iOS Apps → + → .ipa dosyasını seçin
4. Distribute App → App Store Connect

**TestFlight'ta görünmesi:** 10-30 dakika

---

## ADIM 9: Internal Testing 🧪

1. TestFlight → Internal Testing → Add Testers
2. Test hesabıyla tüm özellikleri test edin:
   - ✓ Kayıt / Giriş
   - ✓ Ürün listeleme
   - ✓ Arama ve filtreler
   - ✓ Ürün ekleme (satıcı)
   - ✓ WhatsApp entegrasyonu
   - ✓ Profil düzenleme
   - ✓ Resim yükleme

**Test süresi:** 2-3 gün (kapsamlı test için)

---

## ADIM 10: Submit for Review 📤

### 10.1 Final Kontrol

- ✅ HTTPS çalışıyor
- ✅ TestFlight'ta test edildi
- ✅ Privacy Policy yayında
- ✅ Terms of Service yayında
- ✅ App Privacy formu dolu
- ✅ Content Rights ayarlandı
- ✅ Screenshots yüklendi
- ✅ Demo hesap hazır
- ✅ Metadata tam

### 10.2 Submit

1. App Store Connect → My Apps → Hal Kompleksi
2. + Version or Platform → iOS
3. Version: 1.0.0
4. Build seçin (TestFlight'tan)
5. **What's New in This Version:**
   ```
   İlk sürüm! 🎉
   
   • Çiftçiler ürünlerini listeleyebilir
   • Alıcılar ürün arayabilir ve satıcılarla iletişime geçebilir
   • WhatsApp entegrasyonu
   • Konum bazlı arama
   • Favori ürünler
   ```
6. **App Review Information:**
   - Demo account bilgilerini ekleyin
   - Demo hesap notları: "Bu hesapla satıcı özellikleri test edilebilir"
7. **Submit for Review** butonuna tıklayın

---

## ADIM 11: Apple Review Süreci ⏳

### Beklenen Süre:
- **1. Review:** 1-3 gün
- **Reddetme durumu:** Düzelt ve tekrar gönder (1-2 gün)
- **Onay:** Hemen yayına alabilirsiniz!

### Sık Reddedilme Sebepleri:

1. ❌ HTTP kullanımı → HTTPS'e geçtik ✓
2. ❌ Privacy Policy eksik → Hazır ✓
3. ❌ Demo hesap çalışmıyor → Test edin!
4. ❌ Crash/bug var → TestFlight'ta test edin!
5. ❌ App Privacy formu eksik → Doldurun!

### Review Sırasında:

- **Preparing for Review:** 1-2 saat
- **In Review:** Apple test ediyor (1-24 saat)
- **Pending Developer Release:** Onaylandı! 🎉

---

## SON KONTROL LİSTESİ ✅

### Teknik:
- [ ] HTTPS kullanıyor
- [ ] SSL sertifikası kurulu
- [ ] Backend API çalışıyor
- [ ] Image upload çalışıyor
- [ ] WhatsApp deeplink çalışıyor

### App Store Connect:
- [ ] eas.json credentials güncellendi
- [ ] Privacy Policy yayında
- [ ] Terms of Service yayında
- [ ] App Privacy formu dolu
- [ ] Content Rights ayarlandı
- [ ] Screenshots yüklendi
- [ ] Demo hesap çalışıyor
- [ ] Metadata eksiksiz

### Test:
- [ ] TestFlight'ta test edildi
- [ ] Crash yok
- [ ] Tüm özellikler çalışıyor
- [ ] Demo hesap test edildi

---

## 📊 TIMELINE

| Adım | Süre |
|------|------|
| SSL Kurulumu | 1-2 saat |
| EAS Config | 30 dakika |
| Metadata Hazırlık | 2-3 saat |
| Build | 30-45 dakika |
| TestFlight Upload | 15 dakika |
| Internal Testing | 2-3 gün |
| Submit | 10 dakika |
| Apple Review | 1-3 gün |
| **TOPLAM** | **5-7 gün** |

---

## 🆘 YARDIM

### Backend Logs:
```bash
ssh root@109.199.114.223
pm2 logs hal-kompleksi
```

### EAS Build Status:
```bash
npx eas build:list
```

### TestFlight Status:
- App Store Connect → TestFlight → iOS

---

## ✅ HER ŞEY HAZIR OLDUĞUNDA

1. HTTPS çalışıyor ✓
2. EAS credentials güncellenmiş ✓
3. Privacy & Terms yayında ✓
4. TestFlight'ta test edilmiş ✓
5. Metadata eksiksiz ✓

**→ Submit for Review butonuna basabilirsiniz!** 🚀

---

**Başarılar! 🎉**

Sorularınız olursa her adımda yardımcı olabilirim.

