# 📜 CONTENT RIGHTS INFORMATION - İçerik Hakları Rehberi

## Apple'dan Gelen Uyarı
```
You must set up Content Rights Information in App Information.
```

Bu, App Store Connect'te doldurulması gereken **zorunlu** bir alandır.

---

## 📍 Nasıl Erişilir?

1. **App Store Connect**'e giriş yapın: https://appstoreconnect.apple.com
2. **My Apps** → **Hal Kompleksi** seçin
3. Sol menüden **App Information** (Uygulama Bilgileri) sekmesini tıklayın
4. Aşağı kaydırın ve **"Content Rights"** bölümünü bulun

---

## ❓ Content Rights Nedir?

**Content Rights**, uygulamanızdaki içeriğin kimden geldiğini ve telif haklarının kime ait olduğunu Apple'a bildirdiğiniz bölümdür.

### Apple 2 Soru Sorar:

---

## ✅ SORU 1: Does your app contain, display, or access third-party content?

**Türkçe:** Uygulamanız üçüncü taraf içerik içeriyor mu, gösteriyor mu veya erişim sağlıyor mu?

### Hal Kompleksi için CEVAP: **✅ YES (EVET)**

**Neden?**
- ✅ Kullanıcılar (satıcılar) ürün fotoğrafları yüklüyor
- ✅ Kullanıcılar ürün videoları yüklüyor
- ✅ Kullanıcılar ürün açıklamaları yazıyor
- ✅ Kullanıcılar profil fotoğrafları yüklüyor

Bu tür içerikler **"User-Generated Content"** (Kullanıcı Tarafından Oluşturulan İçerik) kategorisine girer ve **third-party content** sayılır.

---

## ✅ SORU 2: Do you have all necessary rights to that content?

**Türkçe:** Bu içerik için gerekli tüm haklara sahip misiniz?

Bu soruya 2 şekilde cevap verebilirsiniz:

### SEÇENEK A: ✅ YES - Haklara Sahibim

**Ne zaman seçilir:**
- Tüm içeriğin hak sahibiyseniz
- Kullanıcılardan içerik hakları için onay alıyorsanız
- Kullanım Koşullarınızda içerik haklarını düzenliyorsanız

**Hal Kompleksi için:** ✅ **BU SEÇENEĞİ SEÇİN**

**Neden?**
- Kullanıcılar kayıt olurken **Kullanım Koşulları**nı kabul ediyor
- Kullanım Koşullarında, kullanıcıların yüklediği içeriğin haklarına sahip olduklarını taahhüt ediyorlar
- Platform, içeriği denetleme ve kaldırma hakkına sahip
- Telif hakkı ihlali durumunda içerik kaldırılıyor

### SEÇENEK B: ❌ NO - Haklara Sahip Değilim

**Ne zaman seçilir:**
- Kontrolünüz dışında üçüncü taraf içerik gösteriyorsanız
- API'den veri çekiyorsanız (örn: haber API'si)
- Lisans almadan başkalarının içeriğini kullanıyorsanız

**Hal Kompleksi için:** ❌ **BU SEÇENEĞİ SEÇMEYIN**

---

## 📝 CONTENT RIGHTS İÇİN DOĞRU YAPILANDIRMA

### App Store Connect'te Doldurun:

```
📍 Content Rights Bölümü:

Question 1:
"Does your app contain, display, or access third-party content?"
✅ YES

Question 2:
"Do you have all necessary rights to that content or are you otherwise permitted to use it?"
✅ YES

Explanation (Açıklama):
"This app contains user-generated content. All users agree to Terms of Service 
which state that they own the rights to content they upload or have permission 
to use it. The platform reserves the right to remove any content that violates 
intellectual property rights."
```

---

## 📋 KULLANIM KOŞULLARI (Terms of Service)

Apple'ın istediği içerik haklarını garanti altına almak için, uygulamanızın **Kullanım Koşulları** olmalı.

### Minimum İçerik Hakları Maddesi:

```markdown
## İçerik Hakları ve Sorumluluklar

### Kullanıcı İçerikleri

1. **İçerik Sahipliği:**
   - Uygulamaya yüklediğiniz tüm içeriklerin (fotoğraf, video, metin, vb.) 
     hak sahibi olduğunuzu veya bunları kullanma izninizin olduğunu beyan edersiniz.

2. **Lisans Verme:**
   - Yüklediğiniz içeriklerin platformumuzda gösterilmesi, saklanması ve 
     diğer kullanıcılara sunulması için bize dünya çapında, gayri münhasır, 
     telif ücreti olmayan bir lisans verirsiniz.

3. **Telif Hakkı İhlali:**
   - Telif hakkı ihlali yapan içerikler derhal kaldırılır.
   - Tekrarlayan ihlallerde hesap kalıcı olarak kapatılabilir.

4. **Sorumluluk:**
   - Yüklediğiniz içeriklerden tamamen siz sorumlusunuz.
   - Hal Kompleksi, kullanıcı içeriklerinden sorumlu değildir.

5. **İçerik Denetimi:**
   - Platform, içerikleri denetleme ve uygunsuz içerikleri kaldırma hakkına sahiptir.
   - Şüpheli içerikler incelenir ve gerekirse kaldırılır.

### Yasak İçerikler

Aşağıdaki içeriklerin yüklenmesi yasaktır:
- ❌ Telif hakkı ihlali yapan içerikler
- ❌ Başkalarına ait fotoğraflar (izinsiz)
- ❌ Yanıltıcı veya sahte ürün resimleri
- ❌ Uygunsuz veya müstehcen içerikler
- ❌ Şiddet veya nefret içeren içerikler

### İçerik Kaldırma Süreci

1. **Şikayet:** support@halkompleksi.com adresine bildirim gönderin
2. **İnceleme:** Şikayet 48 saat içinde incelenir
3. **Karar:** İhlal tespit edilirse içerik kaldırılır
4. **Bildirim:** İlgili kullanıcı bilgilendirilir

### Telif Hakkı Şikayeti (DMCA)

Telif hakkınızın ihlal edildiğini düşünüyorsanız:

📧 E-posta: copyright@halkompleksi.com
📝 Gerekli Bilgiler:
- Telif hakkı sahibi olduğunuza dair kanıt
- İhlal eden içeriğin linki
- İletişim bilgileriniz
- İmzanız ve tarih
```

---

## 🛡️ UYGULAMA İÇİ KORUMA ÖNLEMLERİ

Hal Kompleksi'nin halihazırda uyguladığı koruma önlemleri:

### ✅ Mevcut Önlemler:

1. **Admin Onay Sistemi:**
   - Yeni ürünler admin onayından geçiyor
   - Şüpheli içerikler reddediliyor

2. **Raporlama Mekanizması:**
   - Kullanıcılar şüpheli içerikleri rapor edebilir
   - Admin panelinde inceleme yapılabilir

3. **İçerik Denetimi:**
   - Admin panelinde tüm ürünler görülebiliyor
   - Uygunsuz içerik kaldırılabiliyor

### 🔧 Eklenmesi Gerekenler (Opsiyonel):

```javascript
// backend/src/routes/products.js içine eklenebilir:

// Telif hakkı şikayeti endpoint'i
router.post('/report-copyright', auth, async (req, res) => {
  try {
    const { productId, reason, evidence } = req.body;
    
    // Şikayeti kaydet
    const report = new CopyrightReport({
      product: productId,
      reporter: req.user.id,
      reason,
      evidence,
      status: 'pending'
    });
    
    await report.save();
    
    // Admin'e bildirim gönder
    await notifyAdmins('copyright-report', { productId, reportId: report._id });
    
    res.json({ 
      success: true, 
      message: 'Şikayetiniz alındı ve incelenecek' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📄 TERMS OF SERVICE (Kullanım Koşulları) HTML SAYFASI

Kullanım Koşulları sayfası hazırladım (aşağıda). Bu sayfayı:

1. Web sitenizde yayınlayın: `https://yourdomain.com/terms`
2. App Store Connect'te "Terms of Service URL" olarak ekleyin
3. Kayıt ekranında kullanıcılara gösterin

---

## ✅ APP STORE CONNECT'TE DOLDURMA ADIMLARI

### Adım 1: App Information'a Git
```
App Store Connect → My Apps → Hal Kompleksi → App Information
```

### Adım 2: Content Rights Bölümünü Bul
```
Aşağı kaydırın → "Content Rights" başlığını bulun
```

### Adım 3: Soruları Yanıtla
```
Question 1: "Does your app contain third-party content?"
→ ✅ YES seçin

Question 2: "Do you have rights to that content?"
→ ✅ YES seçin
```

### Adım 4: Açıklama Ekle (İsteğe Bağlı)
```
İngilizce olarak kısa bir açıklama yazın:

"This app displays user-generated content. All users agree to Terms 
of Service which require them to own or have permission to use any 
content they upload. The platform has content moderation and removal 
capabilities for infringing content."
```

### Adım 5: Save (Kaydet)
```
Sağ üst köşeden "Save" butonuna tıklayın
```

---

## 🚨 SIKÇA YAPILAN HATALAR

### ❌ Hata 1: "NO" seçmek
**Doğrusu:** User-generated content içeren uygulamalar için "YES, YES" seçin

### ❌ Hata 2: Terms of Service olmaması
**Doğrusu:** Mutlaka bir Kullanım Koşulları sayfası hazırlayın

### ❌ Hata 3: İçerik denetimi olmaması
**Doğrusu:** Admin onay sistemi zaten var, bu yeterli

### ❌ Hata 4: Copyright policy olmaması
**Doğrusu:** Gizlilik Politikası gibi, telif hakkı politikası da ekleyin

---

## 📊 CONTENT TYPES KARŞILAŞTIRMASI

| İçerik Tipi | Third-Party? | Rights Needed? | Hal Kompleksi'nde? |
|-------------|--------------|----------------|---------------------|
| Ürün Fotoğrafları | ✅ Yes (User) | ✅ Yes | ✅ Var |
| Ürün Videoları | ✅ Yes (User) | ✅ Yes | ✅ Var |
| Ürün Açıklamaları | ✅ Yes (User) | ✅ Yes | ✅ Var |
| Profil Fotoğrafları | ✅ Yes (User) | ✅ Yes | ✅ Var |
| Kategori İkonları | ❌ No (App) | ✅ Yes | ✅ Var |
| Piyasa Raporları | ❌ No (Admin) | ✅ Yes | ✅ Var |

---

## ✅ KONTROL LİSTESİ

Yüklemeden önce kontrol edin:

- [ ] App Store Connect → App Information açıldı
- [ ] "Content Rights" bölümü bulundu
- [ ] Soru 1: "Third-party content?" → YES seçildi
- [ ] Soru 2: "Have rights?" → YES seçildi
- [ ] Açıklama eklendi (opsiyonel)
- [ ] Save butonu tıklandı
- [ ] Terms of Service sayfası hazırlandı
- [ ] Terms of Service URL yayında
- [ ] Privacy Policy URL yayında
- [ ] App Privacy formu dolduruldu

---

## 🎯 HIZLI ÖZET

### Hal Kompleksi için Doğru Ayarlar:

```
✅ Third-party content: YES
   (Kullanıcılar içerik yüklüyor)

✅ Have rights: YES
   (Kullanım Koşullarıyla garanti altında)

✅ Content moderation: ACTIVE
   (Admin onay sistemi var)

✅ Terms of Service: REQUIRED
   (Hazırlanmalı ve yayınlanmalı)

✅ Copyright policy: REQUIRED
   (Kullanım Koşullarına eklenmeli)
```

---

## 📞 YARDIM

**Content Rights Reddedilirse:**
- Resolution Center'dan Apple'ın geri bildirimini okuyun
- Terms of Service'i güncelleyin
- İçerik denetim süreçlerini açıklayın
- Tekrar submit edin

**Apple Documentation:**
- https://developer.apple.com/app-store/review/guidelines/#intellectual-property

---

## 🔗 SIRA SENDE

### Hemen Yapılacaklar:

1. ✅ **App Information** → Content Rights → YES/YES seçin
2. ✅ **Terms of Service** sayfası hazırlayın (aşağıda hazır)
3. ✅ **Privacy Policy** yayınlayın (`privacy-policy.html` hazır)
4. ✅ **App Privacy** formunu doldurun (`APP_PRIVACY_GUIDE.md`)

---

## 🎉 TAMAMLANDI MI?

Bu formu doldurup kaydettiğinizde, bir engel daha aşılmış olacak! 🚀

**Sonraki Adım:** Metadata, screenshots ve build!

---

**Not:** Terms of Service HTML sayfası ayrı bir dosyada hazırlandı: `terms-of-service.html`

