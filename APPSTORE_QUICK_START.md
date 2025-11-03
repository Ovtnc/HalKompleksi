# 🚀 APP STORE'A YÜKLEME - HIZLI BAŞLANGIÇ

## 📋 Size Hazırladığım Dosyalar

✅ **APP_PRIVACY_GUIDE.md** - App Privacy formu nasıl doldurulur
✅ **CONTENT_RIGHTS_GUIDE.md** - Content Rights nasıl ayarlanır
✅ **privacy-policy.html** - Gizlilik Politikası sayfası (HAZIR)
✅ **terms-of-service.html** - Kullanım Koşulları sayfası (HAZIR)
✅ **APPSTORE_CHECKLIST.md** - Genel kontrol listesi

---

## 🎯 ŞİMDİ NE YAPMALISINIZ?

Apple size 2 zorunlu şey istiyor:
1. 🔴 **App Privacy** formunu doldur
2. 🔴 **Content Rights** bilgisini doldur

Her ikisi de **ZORUNLU** - Bunlar olmadan submit edemezsiniz!

---

## 📝 ADIM ADIM YAPILACAKLAR

### ✅ ADIM 1: Privacy Policy ve Terms of Service'i Yayınlayın

**Ne yapmalısınız:**
1. `privacy-policy.html` dosyasını açın
2. İçindeki placeholder'ları doldurun:
   - `[Telefon Numaranız]` → Gerçek telefon numaranızı yazın
   - `[Şirket Adresiniz]` → Şirket/iş adresinizi yazın
   - `support@halkompleksi.com` → Gerçek e-postanız (veya bunu kullanın)
3. `terms-of-service.html` dosyasını açın
4. Aynı placeholder'ları doldurun
5. Her iki dosyayı da bir web sunucusuna yükleyin

**Nereye yükleyeceksiniz:**
- Kendi web siteniz: `https://yourdomain.com/privacy` ve `https://yourdomain.com/terms`
- **VEYA** GitHub Pages (ücretsiz):
  1. GitHub'da yeni repo oluşturun: `halkompleksi-policies`
  2. Dosyaları yükleyin
  3. Settings → Pages → Enable GitHub Pages
  4. URL: `https://yourusername.github.io/halkompleksi-policies/privacy-policy.html`

**Kontrol edin:**
```bash
# URL'lerin çalıştığını test edin
curl https://yourdomain.com/privacy
curl https://yourdomain.com/terms
```

---

### ✅ ADIM 2: App Privacy Formunu Doldurun

**Nereye:**
App Store Connect → My Apps → Hal Kompleksi → **App Privacy**

**Ne yapacaksınız:**
`APP_PRIVACY_GUIDE.md` dosyasını açın ve adım adım takip edin.

**Özet:**
- ✅ Contact Info → Email, Phone, Name → YES
- ✅ Location → Coarse & Precise → YES
- ✅ User Content → Photos/Videos → YES
- ✅ Identifiers → User ID → YES
- ✅ Purchases → Purchase History → YES
- ✅ Her veri için: "App Functionality" seçin
- ✅ Her veri için: "Linked to User" seçin
- ✅ Her veri için: "No Tracking" seçin
- ✅ Privacy Policy URL'i ekleyin

**Süre:** ~15-20 dakika

---

### ✅ ADIM 3: Content Rights'ı Ayarlayın

**Nereye:**
App Store Connect → My Apps → Hal Kompleksi → **App Information**

**Ne yapacaksınız:**
`CONTENT_RIGHTS_GUIDE.md` dosyasını açın ve adım adım takip edin.

**Özet:**
```
Q1: "Does your app contain third-party content?"
→ ✅ YES

Q2: "Do you have rights to that content?"
→ ✅ YES

Explanation (opsiyonel):
"This app displays user-generated content. All users agree to 
Terms of Service which require them to own or have permission 
to use any content they upload."
```

**Süre:** ~5 dakika

---

### ✅ ADIM 4: Diğer Metadata'yı Tamamlayın

**Nereye:**
App Store Connect → My Apps → Hal Kompleksi → **App Store** sekmesi

**Ne yapacaksınız:**

#### A) Uygulama Açıklaması (Türkçe)
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

Hal Kompleksi ile tarım ürünleri ticareti artık çok daha kolay!
```

#### B) Keywords (Anahtar Kelimeler)
```
hal, tarım, çiftçi, ürün, pazar, organik, sebze, meyve, ticaret, alıcı, 
satıcı, toptan, perakende, gıda, baharat
```

#### C) Support URL
```
https://yourdomain.com/support
VEYA
mailto:support@halkompleksi.com
```

#### D) Marketing URL (opsiyonel)
```
https://yourdomain.com
```

#### E) Kategori
```
Primary: Business (İşletme)
Secondary: Food & Drink (Gıda ve İçecek)
```

#### F) Screenshots
Gerekli boyutlar:
- **6.7"** (iPhone 14 Pro Max): 1290 x 2796 px - 3+ screenshot
- **5.5"** (iPhone 8 Plus): 1242 x 2208 px - 3+ screenshot

**Hangi ekranları gösterin:**
1. Ana sayfa (ürün listesi)
2. Ürün detay sayfası
3. Satıcı profili / dashboard
4. Ürün ekleme ekranı
5. Profil/ayarlar ekranı

**Screenshot nasıl alınır:**
- Simulator'da Command + S
- Veya TestFlight'tan gerçek cihazda screenshot

---

### ✅ ADIM 5: Demo Test Hesabı Oluşturun

**Backend'de demo hesap oluşturun:**

```bash
# Backend'e bağlanın
ssh root@109.199.114.223

# MongoDB'ye bağlanın
mongosh

# Demo user oluşturun
use halkompleksi

db.users.insertOne({
  name: "Demo Kullanıcı",
  email: "demo@halkompleksi.com",
  password: "$2a$12$...", // Demo123! şifresi hash'i
  phone: "05551234567",
  userType: "seller",
  userRoles: ["buyer", "seller"],
  activeRole: "seller",
  isActive: true,
  createdAt: new Date()
})
```

**VEYA** uygulama üzerinden kayıt olun:
- Email: `demo@halkompleksi.com`
- Password: `Demo123!`
- Phone: `05551234567`
- Type: Seller

**App Store Connect'te ekleyin:**
```
App Review Information → Sign-in required → YES

Demo Account:
Username: demo@halkompleksi.com
Password: Demo123!

Notes:
This demo account has seller permissions. You can:
- View all products
- Add new products
- Edit/delete products
- Switch between buyer and seller roles
- Use WhatsApp integration to contact
```

---

## ⚡ HIZLI KONTROL LİSTESİ

Aşağıdaki her şeyi kontrol edin:

```
[✅/❌] Privacy Policy yayında ve erişilebilir
[✅/❌] Terms of Service yayında ve erişilebilir
[✅/❌] App Privacy formu tamamen dolduruldu
[✅/❌] Content Rights ayarlandı (YES/YES)
[✅/❌] App açıklaması eklendi
[✅/❌] Keywords eklendi
[✅/❌] Screenshots yüklendi (6.7" ve 5.5")
[✅/❌] App icon 1024x1024 yüklendi
[✅/❌] Support URL eklendi
[✅/❌] Demo hesap oluşturuldu ve test edildi
[✅/❌] Kategori seçildi
[✅/❌] Fiyatlandırma (Free) seçildi
```

---

## 🚨 UNUTMAYIN!

### Hala Yapılması Gerekenler:

1. ❌ **HTTPS/SSL Kurulumu** - EN ÖNEMLİ!
   - Backend sunucuya SSL sertifikası kurulmalı
   - `NATRO_DNS_CONTABO_SSL.md` dosyasına bakın
   - Apple, HTTP kullanımını reddeder!

2. 🟡 **EAS Credentials**
   - `eas.json` → Apple ID, ASC App ID, Team ID güncelleyin
   - `TODO_BEFORE_APPSTORE.md` dosyasına bakın

3. 🟡 **Build & Submit**
   - SSL kurduktan sonra production build alın
   - TestFlight'a yükleyin
   - App Store'a submit edin

---

## 📊 TAMAMLANMA DURUMU

| Görev | Durum | Süre |
|-------|-------|------|
| Privacy Policy hazırla | ✅ HAZIR | - |
| Terms of Service hazırla | ✅ HAZIR | - |
| Privacy/Terms yayınla | ⏳ YAPILACAK | 30 dk |
| App Privacy formu | ⏳ YAPILACAK | 20 dk |
| Content Rights | ⏳ YAPILACAK | 5 dk |
| Metadata | ⏳ YAPILACAK | 1 saat |
| Screenshots | ⏳ YAPILACAK | 1 saat |
| Demo hesap | ⏳ YAPILACAK | 10 dk |
| SSL kurulumu | ⏳ YAPILACAK | 2 saat |
| Build & Submit | ⏳ YAPILACAK | 1 saat |

**Toplam Tahmini Süre:** ~6-8 saat

---

## 🎯 ÖNCELİK SIRASI

### Şimdi Hemen (Apple'ın istediği):
1. 🔴 Privacy/Terms dosyalarını düzenle ve yayınla
2. 🔴 App Privacy formunu doldur
3. 🔴 Content Rights'ı ayarla

### Sonra (Metadata):
4. 🟡 Uygulama açıklaması yaz
5. 🟡 Screenshots hazırla
6. 🟡 Demo hesap oluştur

### En Son (Technical):
7. ❌ SSL kurulumu yap
8. 🟡 EAS credentials güncelle
9. 🟡 Build al ve yükle

---

## 📞 SIKÇA SORULAN SORULAR

### Q: Privacy Policy ve Terms'i nereye yüklemeliyim?
**A:** 
- **En kolay:** GitHub Pages (ücretsiz, hızlı)
- **En iyi:** Kendi domain'inizde (profesyonel görünür)
- **Geçici:** Netlify, Vercel gibi ücretsiz hostingler

### Q: App Privacy'de hangi seçenekleri işaretlemeliyim?
**A:** `APP_PRIVACY_GUIDE.md` dosyasında hepsi detaylı anlatılmış. Özet:
- Tüm toplanan veriler: Email, Phone, Name, Location, Photos, User ID, Purchases
- Tümü için: "App Functionality" + "Linked to User" + "No Tracking"

### Q: Content Rights'ta hangi cevapları vermeliyim?
**A:** Her iki soruya da **YES** (EVET):
- Q1: Third-party content? → YES
- Q2: Have rights? → YES

### Q: SSL kurmadan submit edebilir miyim?
**A:** Hayır! Apple, HTTP kullanımını otomatik reddeder. SSL zorunlu.

### Q: Metadata'yı İngilizce mi yazmalıyım?
**A:** Primary language Turkish seçerseniz Türkçe yeterli. Ama İngilizce de eklerseniz daha geniş kitleye ulaşırsınız.

---

## ✅ BİTİRDİĞİNİZDE

Bu adımları tamamladığınızda:
- ✅ Apple'ın zorunlu formları doldurulmuş olacak
- ✅ Metadata hazır olacak
- ✅ Submit'e hazır olacaksınız

**Tek eksiğiniz:** SSL kurulumu + EAS credentials + Build

---

## 🎉 BAŞARILAR!

Bu rehberi takip ettiğinizde, App Store'a yükleme sürecinin %70'ini tamamlamış olacaksınız!

**Sonraki adım:** SSL kurulumu ve build almak.

---

**Hazırlayan:** AI Assistant | **Tarih:** 2 Kasım 2025

