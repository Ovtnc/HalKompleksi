# 🚨 APP STORE HATALARI - ÇÖZÜM REHBERİ

## Apple'dan Gelen Hatalar

Apple'dan aldığınız iki kritik hatayı düzeltmek için bu rehberi takip edin:

1. **2.3.3 Performance: Accurate Metadata**
2. **5.1.1 Legal: Privacy - Data Collection and Storage**

---

## 🔴 HATA 1: 2.3.3 Performance - Accurate Metadata

### ❌ Ne Anlama Geliyor?

Apple, uygulamanızın **App Store'daki açıklaması, screenshot'ları ve özelliklerinin** gerçek uygulama ile **tam olarak eşleşmesini** istiyor.

### 🔍 Apple'ın Kontrol Ettiği Şeyler:

- ✅ Uygulama açıklaması gerçeği yansıtıyor mu?
- ✅ Screenshot'lar güncel ve gerçek mi?
- ✅ Bahsedilen özellikler çalışıyor mu?
- ✅ Demo hesap verildiyse çalışıyor mu?
- ✅ Yanıltıcı veya abartılı ifadeler var mı?

### ✅ NASIL DÜZELTİRSİNİZ?

#### ADIM 1: App Store Connect'e Girin

```
https://appstoreconnect.apple.com
→ My Apps
→ Hal Kompleksi
→ App Store (sekmesi)
```

---

#### ADIM 2: Uygulama Açıklamasını Güncelleyin

**App Store Connect → App Information → Description** bölümüne şunu yazın:

```
🏪 Hal Kompleksi - Çiftçiler ve Alıcıları Buluşturan Platform

Hal Kompleksi, tarım ürünleri ticaretini kolaylaştıran modern bir platformdur. 
Çiftçiler ürünlerini listeleyebilir, alıcılar ihtiyaç duydukları ürünleri 
kolayca bulabilir.

✨ ÖZELLİKLER:

📦 Ürün Yönetimi
• Ürün listeleme (fotoğraf ve video ile)
• Kategori bazlı ürün arama
• Fiyat, miktar ve açıklama ekleme
• Ürün düzenleme ve silme

🔍 Akıllı Arama
• Kategorilere göre filtreleme (sebze, meyve, süt ürünleri vb.)
• Şehir ve ilçe bazlı arama
• Konum bazlı yakındaki satıcıları bulma
• Anahtar kelime ile arama

👤 Profil Yönetimi
• Alıcı veya satıcı olarak kayıt
• Profil fotoğrafı ve bilgileri güncelleme
• İşletme bilgileri ekleme (satıcılar için)
• Rol değiştirme (alıcı ↔ satıcı)

💬 İletişim
• Satıcıyla doğrudan WhatsApp ile iletişim
• Telefon numarası görüntüleme
• Konum paylaşımı

⭐ Diğer Özellikler
• Favori ürünler listesi
• Sipariş geçmişi
• Güncel hal fiyatları ve piyasa raporları
• Şehir ve kategori bazlı istatistikler

🔒 Güvenlik
• Güvenli kimlik doğrulama
• Şifrelenmiş veri iletişimi
• Kullanıcı gizliliği koruması

Hal Kompleksi ile tarım ürünleri ticareti artık çok daha kolay ve şeffaf!
```

**NOT:** Yukarıdaki açıklamada uygulamada OLMAYAN hiçbir özellik yok. Hepsi çalışan özelliklerdir.

---

#### ADIM 3: Keywords (Anahtar Kelimeler) Ekleyin

**App Store Connect → App Store → Keywords** bölümüne:

```
hal,tarım,çiftçi,ürün,pazar,organik,sebze,meyve,ticaret,alıcı,satıcı,toptan,perakende,gıda,baharat
```

(Maksimum 100 karakter, virgülle ayrılmış)

---

#### ADIM 4: Screenshots Hazırlayın

Apple, en az **2 farklı ekran boyutu** için screenshot ister:

**Gerekli Boyutlar:**
- **6.7"** (iPhone 14 Pro Max): **1290 x 2796 px** → En az 3 screenshot
- **5.5"** (iPhone 8 Plus): **1242 x 2208 px** → En az 3 screenshot

**Hangi Ekranları Gösterin:**

1. **Ana Sayfa (Ürün Listesi)**
   - Ürünlerin kategorilere göre listelendiği ekran
   
2. **Ürün Detay Sayfası**
   - Bir ürünün fotoğrafları, fiyatı, açıklaması
   - "WhatsApp ile İletişim" butonu görünsün
   
3. **Satıcı Dashboard**
   - Satıcının kendi ürünlerini gördüğü ekran
   - "Ürün Ekle" butonu görünsün
   
4. **Ürün Ekleme Ekranı**
   - Yeni ürün ekleme formu
   
5. **Profil Ekranı**
   - Kullanıcı profili ve ayarlar

**Screenshot Nasıl Alınır:**

```bash
# Xcode Simulator'da:
1. Simulator'ı açın (iOS Simulator)
2. Device seçin: iPhone 14 Pro Max
3. Uygulamayı çalıştırın
4. Ekranı gösterin
5. Command + S → Screenshot kaydedilir

# Ardından 5.5" için:
1. Device seçin: iPhone 8 Plus
2. Aynı işlemi tekrarlayın
```

---

#### ADIM 5: Demo Hesap Bilgilerini Ekleyin

**App Store Connect → App Review Information → Sign-In Information**

```
✅ Sign-in required: YES

Demo Account:
- Username: demo@halkompleksi.com
- Password: Demo123!

Notes for Reviewer (İngilizce yazın):
"This demo account has full seller permissions. You can:
- View all products in different categories
- Add new products with photos
- Edit and delete products
- Switch between buyer and seller roles
- Use WhatsApp integration to contact sellers
- Search products by location and category

The app is fully functional and all features described in the
App Store listing are working properly."
```

**ÖNEMLİ:** Bu demo hesabın backend'de aktif olduğundan emin olun!

---

#### ADIM 6: Support URL Ekleyin

**App Store Connect → App Information → Support URL**

```
https://halkompleksi.com/support

VEYA email linki:

mailto:support@halkompleksi.com
```

---

## 🔴 HATA 2: 5.1.1 Legal - Privacy - Data Collection and Storage

### ❌ Ne Anlama Geliyor?

Apple, uygulamanızın:
1. **Hangi verileri topladığını**
2. **Bu verileri nasıl kullandığını**
3. **Verileri kimlerle paylaştığını**

açıkça belirtmenizi istiyor.

### 🔍 Apple'ın İstediği 3 Şey:

1. ✅ **App Privacy formu** doldurulmuş olmalı
2. ✅ **Privacy Policy URL'i** aktif olmalı (erişilebilir)
3. ✅ **Privacy Policy içeriği** yeterli detayda olmalı

### ✅ NASIL DÜZELTİRSİNİZ?

---

#### ADIM 1: Privacy Policy ve Terms of Service'i Yayınlayın

**Dosyalar zaten hazır! Şimdi yayınlamanız gerekiyor:**

Sizde şu dosyalar var:
- ✅ `privacy-policy.html` (hazır ve placeholder'lar dolduruldu)
- ✅ `terms-of-service.html` (hazır ve placeholder'lar dolduruldu)

**Şimdi bunları bir web sunucusuna yüklemeniz gerekiyor.**

##### Seçenek 1: GitHub Pages (ÜCRETSİZ - Önerilen)

```bash
# 1. GitHub'da yeni repo oluşturun
# Repo adı: halkompleksi-policies
# Public olarak oluşturun

# 2. Repo'yu klonlayın
git clone https://github.com/KULLANICI_ADINIZ/halkompleksi-policies.git
cd halkompleksi-policies

# 3. Dosyaları kopyalayın
cp ../hal-kompleksi/privacy-policy.html .
cp ../hal-kompleksi/terms-of-service.html .

# 4. Commit ve push
git add .
git commit -m "Add privacy policy and terms of service"
git push origin main

# 5. GitHub Pages'i aktif edin
# GitHub repo → Settings → Pages
# Source: Deploy from branch
# Branch: main
# Folder: / (root)
# Save

# 6. URL'niz hazır:
# https://KULLANICI_ADINIZ.github.io/halkompleksi-policies/privacy-policy.html
# https://KULLANICI_ADINIZ.github.io/halkompleksi-policies/terms-of-service.html
```

##### Seçenek 2: Kendi Sunucunuzda (Backend ile birlikte)

Backend sunucunuzda zaten bu dosyalar var ve yayında:

```
https://halkompleksi.com/privacy-policy.html
https://halkompleksi.com/terms-of-service.html
```

**KONTROL EDİN:**

```bash
# Terminal'de test edin:
curl https://halkompleksi.com/privacy-policy.html
curl https://halkompleksi.com/terms-of-service.html

# Tarayıcıda açıp görüntüleyin
```

---

#### ADIM 2: App Privacy Formunu Doldurun

**App Store Connect → My Apps → Hal Kompleksi → App Privacy → Get Started**

Bu form **15-20 dakika** sürer. Aşağıdaki tabloyu takip edin:

---

### 📋 HAL KOMPLEKSİ - APP PRIVACY FORMU

#### 1️⃣ **Contact Info** (İletişim Bilgileri)

Apple soruyor: "Does your app collect Contact Info?"
→ **✅ YES**

Hangi veriler toplandı?
- ✅ **Name** (Ad Soyad)
- ✅ **Email Address** (E-posta)
- ✅ **Phone Number** (Telefon)

**Her veri için aşağıdaki soruları cevaplayın:**

```
❓ How is this data used?
✅ App Functionality (Uygulamanın çalışması için)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

#### 2️⃣ **Location** (Konum Bilgisi)

Apple soruyor: "Does your app collect Location?"
→ **✅ YES**

Hangi konum verileri toplandı?
- ✅ **Coarse Location** (Şehir, ilçe)
- ✅ **Precise Location** (GPS - opsiyonel)

**Her veri için:**

```
❓ How is this data used?
✅ App Functionality (Konum bazlı arama için)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

#### 3️⃣ **User Content** (Kullanıcı İçeriği)

Apple soruyor: "Does your app collect User Content?"
→ **✅ YES**

Hangi içerikler toplandı?
- ✅ **Photos or Videos** (Ürün fotoğrafları)
- ✅ **Other User Content** (Ürün açıklamaları)

**Her veri için:**

```
❓ How is this data used?
✅ App Functionality (Ürün listeleme için)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

#### 4️⃣ **Identifiers** (Tanımlayıcılar)

Apple soruyor: "Does your app collect Identifiers?"
→ **✅ YES**

Hangi tanımlayıcılar toplandı?
- ✅ **User ID** (MongoDB ObjectId)

**Cevaplar:**

```
❓ How is this data used?
✅ App Functionality (Oturum yönetimi)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

#### 5️⃣ **Purchases** (Satın Almalar)

Apple soruyor: "Does your app collect Purchase History?"
→ **✅ YES**

Hangi veriler toplandı?
- ✅ **Purchase History** (Sipariş geçmişi)

**Cevaplar:**

```
❓ How is this data used?
✅ App Functionality (Sipariş takibi)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

#### 6️⃣ **Other Data** (Diğer Veriler)

Apple soruyor: "Does your app collect Other Data?"
→ **✅ YES**

Hangi veriler toplandı?
- ✅ **Other Data Types** (İşletme bilgileri - satıcılar için)

**Cevaplar:**

```
❓ How is this data used?
✅ App Functionality (Satıcı profili)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

#### ADIM 3: Privacy Policy URL'ini Ekleyin

App Privacy formunun sonunda Apple soracak:

```
❓ What is your Privacy Policy URL?
```

**Cevap:**

```
https://halkompleksi.com/privacy-policy.html

VEYA GitHub Pages kullandıysanız:

https://KULLANICI_ADINIZ.github.io/halkompleksi-policies/privacy-policy.html
```

---

#### ADIM 4: Content Rights'ı Ayarlayın

**App Store Connect → App Information → Content Rights**

```
❓ Does your app contain third-party content?
✅ YES (Kullanıcılar ürün yüklüyor)

❓ Do you have rights to that content?
✅ YES (Kullanıcılar Terms of Service'i kabul ediyor)

Açıklama (opsiyonel):
"This app displays user-generated content (product listings). 
All users agree to Terms of Service which require them to own 
or have permission to use any content they upload."
```

---

## ✅ KONTROL LİSTESİ

Aşağıdakileri tamamladınız mı?

### Hata 1: Accurate Metadata
- [ ] Uygulama açıklaması güncellendi (gerçekçi özellikler)
- [ ] Keywords eklendi
- [ ] Screenshots hazırlandı (6.7" ve 5.5")
- [ ] Demo hesap bilgileri eklendi
- [ ] Support URL eklendi

### Hata 2: Privacy
- [ ] Privacy Policy yayınlandı (erişilebilir)
- [ ] Terms of Service yayınlandı (erişilebilir)
- [ ] App Privacy formu dolduruldu:
  - [ ] Contact Info (Name, Email, Phone)
  - [ ] Location (Coarse & Precise)
  - [ ] User Content (Photos/Videos)
  - [ ] Identifiers (User ID)
  - [ ] Purchases (Purchase History)
  - [ ] Other Data (Business Info)
- [ ] Privacy Policy URL eklendi
- [ ] Content Rights ayarlandı (YES/YES)

---

## 🚀 SONRAKİ ADIMLAR

Bu iki hatayı düzelttikten sonra:

1. **Save** butonuna basın (her bölümde)
2. **Submit for Review** butonuna tıklayın
3. Apple'ın incelemesini bekleyin (1-3 gün)

---

## ⚠️ SIKÇA SORULAN SORULAR

### S1: Privacy Policy'yi nereye yüklemeliyim?

**C:** En kolay yol GitHub Pages (ücretsiz). Alternatif olarak kendi sunucunuza.

---

### S2: Demo hesap şart mı?

**C:** Evet! Apple, uygulamanızı test etmeden onaylamaz. Demo hesap çalışır durumda olmalı.

---

### S3: Screenshot'ları nereden alabilirim?

**C:** Xcode Simulator'dan (Command + S) veya TestFlight'tan gerçek cihazdan.

---

### S4: "No Tracking" derken ne demek istiyorlar?

**C:** Reklamcılık, analitik veya cross-app tracking (çapraz uygulama takibi) yapmıyorsanız "No" seçin.

---

### S5: Bu hataları düzeltsem hemen onaylanır mıyam?

**C:** Bu 2 hata düzeltilirse büyük kısmını halledersiniz. Ancak Apple başka şeyler de isteyebilir:
- SSL/HTTPS kullanımı (zorunlu!)
- Çalışan bir uygulama
- Hatasız build

---

## 📞 DESTEK

Bu hatalarla ilgili sorularınız için:

- 📧 Email: support@halkompleksi.com
- 📄 Detaylı rehberler:
  - `APP_PRIVACY_GUIDE.md` - Privacy formu detayları
  - `CONTENT_RIGHTS_GUIDE.md` - Content rights detayları
  - `APPSTORE_QUICK_START.md` - Genel rehber

---

## 🎉 BAŞARILAR!

Bu rehberi takip ettiğinizde Apple'ın bu iki hatasını düzeltmiş olacaksınız!

**Son Not:** Apple'ın incelemesi 1-3 gün sürer. Sabırlı olun ve bekleyin. 🚀

---

**Hazırlayan:** AI Assistant  
**Tarih:** 5 Kasım 2025  
**Versiyon:** 1.0


