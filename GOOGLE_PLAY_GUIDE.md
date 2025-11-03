# 🤖 GOOGLE PLAY STORE YÜKLEME REHBERİ

## 📋 Genel Bakış

Google Play Store'a uygulama yüklemek için gereken tüm adımlar bu rehberde!

**İyi Haber:** Privacy Policy ve Terms of Service zaten hazır! Apple için hazırladıklarınızı kullanabilirsiniz. 🎉

---

## 🎯 GOOGLE PLAY GEREKSİNİMLERİ

### ✅ Zorunlu Olanlar

1. **Google Play Developer Hesabı** ($25 tek seferlik ücret)
2. **Privacy Policy URL** ✅ (Zaten hazır!)
3. **Data Safety Form** (Apple'ın App Privacy'sine benzer)
4. **Content Rating** (Yaş sınırı)
5. **Store Listing** (Açıklama, screenshots, icon)
6. **AAB/APK Dosyası** (Build)
7. **App Signing Key**

### 🟡 Opsiyonel (Önerilen)

- Terms of Service URL ✅ (Zaten hazır!)
- Support email/website
- Marketing materials
- Feature graphic (1024x500)
- Promotional video

---

## 📍 BAŞLANGIÇ: GOOGLE PLAY CONSOLE

### Adım 1: Developer Hesabı Oluşturun

1. **Google Play Console**'a gidin: https://play.google.com/console
2. **Create Account** → **Developer**
3. **$25 ödeme** yapın (tek seferlik, ömür boyu geçerli)
4. **Developer adı** belirleyin (sonradan değiştirilemez!)
5. **Konum** seçin: Turkey
6. **Developer türü**: Individual veya Organization

### Adım 2: Yeni Uygulama Oluşturun

1. **Create App** butonuna tıklayın
2. **App name**: `Hal Kompleksi`
3. **Default language**: Turkish
4. **App or game**: App
5. **Free or paid**: Free
6. **Developer Program Policies** onaylayın
7. **US export laws** onaylayın
8. **Create app**

---

## 🔐 ADIM 1: DATA SAFETY (Veri Güvenliği)

Apple'ın App Privacy'si gibi, Google'ın da **Data Safety** formu var.

### Forma Erişim
```
Google Play Console → [Your App] → App content → Data safety
```

### SORU 1: Does your app collect or share user data?

**Cevap:** ✅ **YES**

---

### SORU 2: Is all of the user data collected by your app encrypted in transit?

**Cevap:** ✅ **YES** (HTTPS kullanıyorsunuz - SSL kurduktan sonra)

---

### SORU 3: Do you provide a way for users to request that their data is deleted?

**Cevap:** ✅ **YES**

**Açıklama:** Users can delete their account from the app settings or by contacting support@halkompleksi.com

---

### SORU 4: What data does your app collect?

Hal Kompleksi için işaretlenecek veri tipleri:

#### 📧 **Personal info** ✅
- [ ] Name
- [ ] Email address
- [ ] User IDs
- [ ] Address
- [ ] Phone number
- [ ] Race and ethnicity
- [ ] Political or religious beliefs
- [ ] Sexual orientation
- [ ] Other info

**Hal Kompleksi için seçin:**
- ✅ **Name**
- ✅ **Email address**
- ✅ **Phone number**
- ✅ **Address** (location address)

#### 📍 **Location** ✅
- [ ] Approximate location
- [ ] Precise location

**Hal Kompleksi için seçin:**
- ✅ **Approximate location** (City, district)
- ✅ **Precise location** (GPS - optional)

#### 📸 **Photos and videos** ✅
- [ ] Photos
- [ ] Videos

**Hal Kompleksi için seçin:**
- ✅ **Photos** (Product images, profile pictures)
- ✅ **Videos** (Product videos)

#### 💬 **Messages** ❌
- [ ] Emails
- [ ] SMS or MMS
- [ ] Other in-app messages

**Hal Kompleksi için:** ❌ HAYIR (WhatsApp kullanıyorsunuz, kendi mesajlaşma yok)

#### 💰 **Financial info** ❌
- [ ] User payment info
- [ ] Purchase history
- [ ] Credit score
- [ ] Other financial info

**Hal Kompleksi için:** ❌ HAYIR (Ödeme sistemi yok - şu an için)

**NOT:** Sipariş geçmişi varsa, aşağıdaki "App activity" altında işaretleyin.

#### 🏥 **Health and fitness** ❌
**Hal Kompleksi için:** ❌ HAYIR

#### 📱 **App activity** ✅
- [ ] App interactions
- [ ] In-app search history
- [ ] Installed apps
- [ ] Other user-generated content
- [ ] Other actions

**Hal Kompleksi için seçin:**
- ✅ **App interactions** (Favorites, views)
- ✅ **In-app search history** (Product searches)
- ✅ **Other user-generated content** (Product listings, descriptions)

#### 🌐 **Web browsing** ❌
**Hal Kompleksi için:** ❌ HAYIR

#### 🆔 **App info and performance** ✅
- [ ] Crash logs
- [ ] Diagnostics
- [ ] Other app performance data

**Hal Kompleksi için seçin:**
- ✅ **Crash logs**
- ✅ **Diagnostics**

#### 📱 **Device or other IDs** ✅
- [ ] Device or other IDs

**Hal Kompleksi için seçin:**
- ✅ **Device or other IDs** (JWT tokens, session IDs)

---

### SORU 5: How is user data collected and shared?

Her veri tipi için şunları sorulur:

#### Is this data collected, shared, or both?
- ✅ **Collected** (Tüm veriler için)
- ❌ **Shared** (Sadece WhatsApp redirect için)

#### Is this data processed ephemerally?
- ❌ **NO** (Veriler saklanıyor)

#### Is this data required or optional?
- **Name, Email, Phone:** ✅ Required (Kayıt için gerekli)
- **Location:** 🟡 Optional (Kullanıcı isterse verir)
- **Photos/Videos:** 🟡 Optional (Satıcılar için gerekli, alıcılar için değil)
- **Device IDs:** ✅ Required (Session için gerekli)

#### Why is this data collected?
Her veri için seçenekler:

✅ **App functionality** (Ana amaç)
❌ Advertising or marketing
❌ Analytics
❌ Developer communications
❌ Fraud prevention, security, and compliance
❌ Personalization
❌ Account management

**Hal Kompleksi için:** Sadece **App functionality** seçin!

---

### Data Safety Form Özeti

```
📊 HAL KOMPLEKSİ - DATA SAFETY SUMMARY

✅ Collects data: YES
✅ Encrypted in transit: YES
✅ User can request deletion: YES

📋 Data Types Collected:
├── Personal info
│   ├── Name (Required, App functionality)
│   ├── Email (Required, App functionality)
│   ├── Phone (Required, App functionality)
│   └── Address (Optional, App functionality)
├── Location
│   ├── Approximate (Optional, App functionality)
│   └── Precise (Optional, App functionality)
├── Photos and videos
│   ├── Photos (Optional, App functionality)
│   └── Videos (Optional, App functionality)
├── App activity
│   ├── App interactions (Collected, App functionality)
│   ├── Search history (Collected, App functionality)
│   └── User content (Collected, App functionality)
├── App info
│   ├── Crash logs (Collected, App functionality)
│   └── Diagnostics (Collected, App functionality)
└── Device IDs (Required, App functionality)

🔒 All data linked to user identity
❌ No data used for tracking
✅ Data deletion available
```

---

## 🎮 ADIM 2: CONTENT RATING (İçerik Derecelendirmesi)

### Forma Erişim
```
Google Play Console → [Your App] → App content → Content rating
```

### Questionnaire (Anket)

#### 1. Select your app category
**Cevap:** ✅ **Utility, Productivity, Communication, or Other**

#### 2. Does your app contain violence?
**Cevap:** ❌ **NO**

#### 3. Does your app contain sexual content?
**Cevap:** ❌ **NO**

#### 4. Does your app contain bad language?
**Cevap:** ❌ **NO**

#### 5. Does your app contain controlled substances?
**Cevap:** ❌ **NO**

#### 6. Does your app allow users to interact?
**Cevap:** ✅ **YES** (User-generated content)

**Alt sorular:**
- Can users communicate freely? ✅ YES (WhatsApp üzerinden)
- Is user content moderated? ✅ YES (Admin onay sistemi var)
- Can users share their location? ✅ YES (Opsiyonel)
- Can users buy physical goods? ✅ YES (Tarım ürünleri)

#### 7. Does your app share user location?
**Cevap:** ✅ **YES** (Optional - konum bazlı arama için)

### Beklenen Rating

Bu cevaplarla muhtemelen:
- **ESRB:** Everyone
- **PEGI:** 3
- **USK:** 0
- **IARC:** 3+

---

## 📝 ADIM 3: STORE LISTING (Mağaza Sayfası)

### App Details

#### App name
```
Hal Kompleksi
```

#### Short description (80 karakter max)
```
Çiftçiler ve alıcıları buluşturan tarım ürünleri platformu
```

#### Full description (4000 karakter max)
```
🌾 Hal Kompleksi - Tarım Ürünleri Ticaret Platformu

Hal Kompleksi, tarım ürünleri ticaretini dijitalleştiren, çiftçiler, 
toptancılar ve alıcıları bir araya getiren modern bir mobil platformdur.

🎯 ÖZELLİKLER

📱 Ürün Yönetimi
• Kolay ürün ekleme ve düzenleme
• Çoklu fotoğraf ve video desteği
• Kategori ve filtreleme sistemi
• Stok takibi ve fiyat güncelleme
• Ürün görüntüleme istatistikleri

🔍 Gelişmiş Arama
• Kategorilere göre filtreleme
• Fiyat aralığı filtresi
• Konum bazlı arama
• Popüler ve öne çıkan ürünler
• Favori ürünler listesi

💼 Satıcı Özellikleri
• Profesyonel satıcı profili
• İşletme bilgileri yönetimi
• Ürün listeleme ve yönetimi
• Satış istatistikleri
• Müşteri değerlendirmeleri

🛒 Alıcı Özellikleri
• Geniş ürün yelpazesi
• Güvenli satıcılar
• Doğrudan iletişim (WhatsApp)
• Favori satıcılar
• Sipariş geçmişi

📍 Konum Tabanlı
• Yakındaki satıcıları bulun
• Şehir ve ilçe filtreleme
• Teslimat bölgesi belirleme

📊 Piyasa Raporları
• Güncel hal fiyatları
• Piyasa analizleri
• Sezonluk ürün bilgileri

🔔 Bildirimler
• Yeni ürün bildirimleri
• Sipariş güncellemeleri
• Piyasa rapor bildirimleri

🌟 Neden Hal Kompleksi?

✓ Ücretsiz kullanım
✓ Güvenli platform
✓ Kolay kullanım
✓ Hızlı iletişim
✓ Güncel piyasa verileri
✓ Profesyonel destek

📦 ÜRÜN KATEGORİLERİ

• Sebzeler
• Meyveler
• Baharat ve Kuruyemiş
• Gıda Ürünleri
• Nakliye Hizmetleri
• Kasa ve Ambalaj
• Zirai İlaç ve Gübre
• İndir-Bindir Hizmetleri
• Emlak
• Araç-Gereç
• Diğer

👥 KİMLER KULLANIR?

🌾 Çiftçiler ve Üreticiler
Platform üzerinden ürünlerinizi listeleyerek daha geniş bir müşteri 
kitlesine ulaşabilirsiniz.

🏪 Toptancı ve Hal Esnafı
İşletmenizi dijitalleştirin, siparişlerinizi yönetin, müşterilerinizle 
kolayca iletişim kurun.

🍴 Restoranlar ve Marketler
İhtiyacınız olan taze ürünleri bulun, fiyatları karşılaştırın, 
doğrudan satıcıyla iletişime geçin.

🔒 GÜVENLİK VE GİZLİLİK

• Güvenli veri şifreleme (HTTPS)
• Gizlilik politikasına uygun
• Kullanıcı verilerinin korunması
• Admin onay sistemi
• İçerik moderasyonu

📞 DESTEK VE İLETİŞİM

Sorularınız ve önerileriniz için:
📧 Email: support@halkompleksi.com
🌐 Web: https://halkompleksi.com

🚀 HADİ BAŞLAYALIM!

Hal Kompleksi'ni indirin, kayıt olun ve tarım ürünleri ticaretinin 
dijital dünyasına adım atın!

Türkiye'nin en büyük tarım ürünleri toptan ticaret platformu olmaya 
doğru ilerliyoruz. Siz de bu büyümeye ortak olun!

---

© 2025 Hal Kompleksi. Tüm hakları saklıdır.
```

---

### Graphics Assets (Görseller)

#### 1. App Icon (512x512 PNG)
```
✅ Mevcut: HalKompleksi/assets/icon.png
Boyut: 1024x1024 → 512x512'ye resize edin
Format: PNG, 32-bit, alpha channel yok
```

#### 2. Feature Graphic (1024x500 PNG) - ZORUNLU
```
❌ Oluşturulmalı!

Öneri içerik:
- Hal Kompleksi logosu
- "Çiftçiler ve Alıcıları Buluşturuyoruz" sloganı
- Ürün/sebze görselleri
- Renk paleti: Yeşil tonları (#4CAF50, #8BC34A)

Canva veya Figma ile hazırlayabilirsiniz.
```

#### 3. Phone Screenshots (ZORUNLU)
```
Minimum: 2 screenshot
Maksimum: 8 screenshot
Boyut: 16:9 aspect ratio
Önerilen: 1080x1920 (Portrait) veya 1920x1080 (Landscape)

Hangi ekranlar:
1. ✅ Ana sayfa (Ürün listesi)
2. ✅ Ürün detay
3. ✅ Satıcı dashboard
4. ✅ Ürün ekleme ekranı
5. ✅ Profil/Ayarlar
6. ✅ Kategoriler
7. ✅ Arama ve filtreleme
8. ✅ Piyasa raporları
```

#### 4. 7-inch Tablet Screenshots (Opsiyonel)
```
Boyut: 1024x600 veya 1024x768
Minimum: 1 screenshot
Maksimum: 8 screenshot
```

#### 5. 10-inch Tablet Screenshots (Opsiyonel)
```
Boyut: 1920x1200 veya 2560x1800
Minimum: 1 screenshot
Maksimum: 8 screenshot
```

#### 6. Promotional Video (Opsiyonel)
```
YouTube URL
Maksimum: 30-120 saniye
Uygulama kullanımını gösteren kısa video
```

---

### Store Settings

#### Category
```
Primary: Business
Secondary: Shopping (opsiyonel)
```

#### Tags (Etiketler)
```
tarım, hal, çiftçi, ürün, pazar, sebze, meyve, toptan, 
toptancı, alıcı, satıcı, organik, gıda
```

#### Contact Details
```
✅ Email: support@halkompleksi.com
✅ Phone: +90 [Telefon Numaranız] (opsiyonel)
✅ Website: https://halkompleksi.com

🔐 Privacy policy: https://yourdomain.com/privacy-policy.html
```

---

## 🔐 ADIM 4: APP SIGNING (Uygulama İmzalama)

### Google Play App Signing (Önerilen)

Google'ın otomatik imzalama sistemini kullanın:

```bash
# EAS ile build aldığınızda otomatik olarak yönetilir
eas build --platform android --profile production
```

EAS, Google Play App Signing'i otomatik yapılandırır.

### Manual Signing (Manuel)

Eğer kendiniz imzalamak isterseniz:

```bash
# Keystore oluşturun
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore hal-kompleksi.keystore \
  -alias hal-kompleksi \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Şifreyi güvenli bir yerde saklayın!
```

---

## 📦 ADIM 5: BUILD & UPLOAD (Derleme ve Yükleme)

### EAS ile Build Alma

```bash
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi

# Production build
eas build --platform android --profile production

# Build tamamlanınca AAB dosyası indirilir
```

### Google Play Console'a Yükleme

#### Yöntem 1: EAS ile Otomatik Submit (Önerilen)

```bash
# Google Play'e otomatik submit
eas submit --platform android --latest

# Service Account JSON gerekli (ilk seferde)
# EAS size adım adım yol gösterecek
```

#### Yöntem 2: Manuel Upload

1. **Google Play Console** → [Your App]
2. **Production** → **Create new release**
3. **Upload** → AAB dosyasını yükleyin
4. **Release name**: 1.0.0 (1)
5. **Release notes** yazın:
```
İlk sürüm! 🎉

• Ürün listeleme ve arama
• Kategori filtreleme
• Konum bazlı arama
• Satıcı-alıcı iletişimi
• Profil yönetimi
• Piyasa raporları
• Admin onay sistemi
```
6. **Review** → **Start rollout to Production**

---

## 🧪 ADIM 6: TESTING (Test)

### Internal Testing (Dahili Test)

Yayından önce test edin:

1. **Google Play Console** → **Testing** → **Internal testing**
2. **Create release**
3. **Upload AAB**
4. **Testers** ekleyin (email adresleriyle)
5. **Save** ve **Review release**

Test kullanıcıları şu linkten indirebilir:
```
https://play.google.com/apps/internaltest/[Package-ID]
```

### Closed Testing (Kapalı Test)

Daha geniş test grubu için:

1. **Testing** → **Closed testing**
2. **Create track** (Alpha veya Beta)
3. **Upload AAB**
4. **Testers** ekleyin (liste veya Google Group)

### Open Testing (Açık Test)

Herkesin erişebileceği beta:

1. **Testing** → **Open testing**
2. **Create release**
3. Google Play'de "Beta" etiketi ile görünür

---

## ✅ ADIM 7: PUBLISH (Yayınla)

### Pre-launch Report

Google otomatik olarak uygulamanızı test eder:

- ✅ Crash testi
- ✅ Performans testi
- ✅ Screenshot'lar alır
- ✅ Güvenlik kontrolü

Sonuçları inceleyin ve sorunları düzeltin.

### Production Release

1. Tüm formları doldurun ✅
2. Store listing tamamlayın ✅
3. Content rating alın ✅
4. Data safety onaylayın ✅
5. Pricing (Free) belirleyin ✅
6. Countries (Türkiye veya tümü) seçin ✅
7. **Review** → **Start rollout**

### Rollout Options

- **Staged rollout**: %20 → %50 → %100 (önerilen)
- **Full rollout**: Hemen %100'e yayınla

---

## 📊 REVIEW SÜRECI

### Timeline

| Adım | Süre |
|------|------|
| Build | 30-45 dakika |
| Upload | 5-10 dakika |
| Pre-launch report | 1-2 saat |
| Review (ilk kez) | 1-7 gün |
| Review (güncelleme) | Birkaç saat |
| Yayına girme | Anında |

### Review Kriterleri

Google şunları kontrol eder:

- ✅ App content policy
- ✅ Metadata quality
- ✅ Privacy policy
- ✅ Data safety accuracy
- ✅ Target audience
- ✅ Crash rate
- ✅ Security vulnerabilities

---

## 🚨 SIKÇA YAPILAN HATALAR

### ❌ Hata 1: Privacy Policy eksik
**Doğrusu:** Mutlaka geçerli bir URL ekleyin

### ❌ Hata 2: Feature graphic yok
**Doğrusu:** 1024x500 feature graphic ZORUNLU

### ❌ Hata 3: Screenshots yetersiz
**Doğrusu:** Minimum 2, önerilen 4-8 screenshot

### ❌ Hata 4: Data safety yanlış
**Doğrusu:** Gerçekten topladığınız verileri işaretleyin

### ❌ Hata 5: App crashes
**Doğrusu:** Pre-launch report'u inceleyin, crashleri düzeltin

---

## 📋 CHECKLIST (Kontrol Listesi)

### Başlamadan Önce

- [ ] Google Play Developer hesabı ($25)
- [ ] Privacy Policy URL hazır
- [ ] Terms of Service URL hazır
- [ ] App icon 512x512 hazır
- [ ] Screenshots hazır (2-8 adet)
- [ ] Feature graphic 1024x500 hazır

### Google Play Console

- [ ] Uygulama oluşturuldu
- [ ] Store listing tamamlandı
- [ ] Data safety formu dolduruldu
- [ ] Content rating alındı
- [ ] App category seçildi
- [ ] Contact details eklendi
- [ ] Privacy policy URL eklendi
- [ ] Pricing (Free) ayarlandı
- [ ] Distribution countries seçildi

### Build & Upload

- [ ] Android build alındı (AAB)
- [ ] App signing yapılandırıldı
- [ ] Production'a yüklendi
- [ ] Release notes yazıldı
- [ ] Pre-launch report passed
- [ ] Review'a gönderildi

---

## 🎯 EAS CONFIGURATION (eas.json)

`HalKompleksi/eas.json` dosyanızı kontrol edin:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",  // veya "app-bundle" (önerilen)
        "gradleCommand": ":app:bundleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production",
        "releaseStatus": "completed"
      }
    }
  }
}
```

### Service Account Setup

Google Play'e otomatik submit için:

1. **Google Cloud Console** → IAM & Admin → Service Accounts
2. **Create Service Account**
3. **Grant access** → Role: Service Account User
4. **Create Key** → JSON
5. `google-service-account.json` olarak kaydedin
6. **Google Play Console** → Setup → API access → Grant access

---

## 🚀 BUILD ve YÜKLEME KOMUTLARI

```bash
# Android build al
eas build --platform android --profile production

# Build durumunu kontrol et
eas build:list

# Google Play'e submit et (service account ile)
eas submit --platform android --latest

# Manuel upload için AAB indir
eas build:download --build-id [BUILD_ID]
```

---

## 📊 APPLE vs GOOGLE KARŞILAŞTIRMA

| Özellik | Apple App Store | Google Play Store |
|---------|----------------|-------------------|
| Developer Ücreti | $99/yıl | $25 (tek seferlik) |
| Review Süresi | 1-3 gün | Birkaç saat - 7 gün |
| Privacy Form | App Privacy | Data Safety |
| Content Rights | Zorunlu | Yok |
| Binary Format | IPA | AAB/APK |
| Signing | Apple yönetir | Google yönetir (veya manuel) |
| Test | TestFlight | Internal/Closed/Open Testing |
| Rollout | Hemen %100 | Kademeli (staged) |

---

## 🎉 TAMAMLANDI MI?

Bu adımları tamamladığınızda:

- ✅ Google Play'de uygulama sayfası oluşturulacak
- ✅ Data safety ve content rating tamamlanacak
- ✅ Store listing hazır olacak
- ✅ Build alınıp yüklenecek
- ✅ Review süreci başlayacak
- ✅ 1-7 gün içinde yayına girecek! 🚀

---

## 📞 DESTEK

**Build Hataları:**
```bash
eas build:view [BUILD_ID]  # Detaylı log
```

**Play Console Hataları:**
- Google Play Console → Help & feedback

**Rejection:**
- Policy Center'dan detaylı bilgi alın
- Düzeltin ve tekrar submit edin

---

## 🔗 FAYDALI LİNKLER

- 📘 Google Play Console: https://play.google.com/console
- 📘 Developer Policies: https://play.google.com/about/developer-content-policy/
- 📘 App Signing: https://developer.android.com/studio/publish/app-signing
- 📘 EAS Build: https://docs.expo.dev/build/introduction/
- 📘 EAS Submit: https://docs.expo.dev/submit/introduction/

---

**Hazırlayan:** AI Assistant | **Tarih:** 2 Kasım 2025

**Başarılar! 🎉 Google Play'de görüşmek üzere!** 🤖

