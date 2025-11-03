# 🔒 APP STORE - APP PRIVACY GUIDE

## Apple'dan Gelen Uyarı
```
Before you can submit this app for review, an Admin must provide 
information about the app's privacy practices in the App Privacy section.
```

Bu rehber, App Store Connect'te **App Privacy** bölümünü nasıl dolduracağınızı adım adım açıklar.

---

## 📍 Nasıl Erişilir?

1. **App Store Connect**'e giriş yapın: https://appstoreconnect.apple.com
2. **My Apps** → **Hal Kompleksi** seçin
3. Sol menüden **App Privacy** sekmesini tıklayın
4. **Get Started** butonuna tıklayın

---

## ✅ ADIM 1: DATA TYPES - Hangi Veriler Toplanıyor?

Apple, 6 ana kategoride veri toplar. Hal Kompleksi uygulaması için aşağıdaki verileri **EVET** olarak işaretleyin:

### 1️⃣ **Contact Info** ✅ (EVET)

**Toplanan Veriler:**
- ✅ **Email Address**: Kayıt ve giriş için
- ✅ **Phone Number**: Profil bilgisi ve iletişim için
- ✅ **Name**: Kullanıcı adı

**Her veri için sorulacaklar:**

#### Email Address
```
❓ How is this data used?
✅ App Functionality (Uygulamanın çalışması için gerekli)
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

#### Phone Number
```
❓ How is this data used?
✅ App Functionality
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

#### Name
```
❓ How is this data used?
✅ App Functionality
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

### 2️⃣ **Location** ✅ (EVET)

**Toplanan Veriler:**
- ✅ **Coarse Location**: Şehir, ilçe bilgisi
- ✅ **Precise Location**: GPS koordinatları (opsiyonel)

**Her veri için sorulacaklar:**

#### Coarse Location (Şehir/İlçe)
```
❓ How is this data used?
✅ App Functionality (Konum bazlı ürün arama)
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

#### Precise Location (GPS - Optional)
```
❓ How is this data used?
✅ App Functionality (Yakındaki satıcıları bulma)
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

### 3️⃣ **User Content** ✅ (EVET)

**Toplanan Veriler:**
- ✅ **Photos or Videos**: Ürün resimleri/videoları
- ✅ **Other User Content**: Ürün açıklamaları, yorumlar

**Her veri için sorulacaklar:**

#### Photos or Videos
```
❓ How is this data used?
✅ App Functionality (Ürün listeleme için)
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

#### Other User Content (Ürün açıklamaları)
```
❓ How is this data used?
✅ App Functionality
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

### 4️⃣ **Identifiers** ✅ (EVET)

**Toplanan Veriler:**
- ✅ **User ID**: MongoDB ObjectId

**Her veri için sorulacaklar:**

#### User ID
```
❓ How is this data used?
✅ App Functionality (Oturum yönetimi için)
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

### 5️⃣ **Purchases** ✅ (EVET)

**Toplanan Veriler:**
- ✅ **Purchase History**: Sipariş geçmişi

**Her veri için sorulacaklar:**

#### Purchase History
```
❓ How is this data used?
✅ App Functionality (Sipariş takibi için)
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

### 6️⃣ **Other Data** ✅ (EVET)

**Toplanan Veriler:**
- ✅ **Other Data Types**: İşletme bilgileri (satıcılar için)

**Her veri için sorulacaklar:**

#### Other Data (İşletme Bilgileri)
```
❓ How is this data used?
✅ App Functionality (Satıcı profili için)
✅ Third-Party Advertising (Hayır)
✅ Developer's Advertising or Marketing (Hayır)
✅ Analytics (Hayır)

❓ Is this data linked to the user's identity?
✅ Yes, Data is Linked to User

❓ Do you or your third-party partners use this data for tracking purposes?
✅ No, We Do Not Track
```

---

## ✅ ADIM 2: DATA USAGE - Veriler Nasıl Kullanılıyor?

Apple, her veri tipinin nasıl kullanıldığını sorar:

### **Hal Kompleksi için Genel Cevaplar:**

```
❓ Does this app collect data from this app?
✅ YES

❓ How is this data used?
✅ App Functionality (Uygulamanın temel özelliklerini sağlamak için)

❌ Third-Party Advertising (Hayır - Reklam yok)
❌ Developer's Advertising or Marketing (Hayır - Pazarlama için kullanmıyoruz)
❌ Analytics (Hayır - Analitik için kullanmıyoruz)
❌ Product Personalization (Hayır - Kişiselleştirme yok)
❌ Other Purposes (Hayır)
```

---

## ✅ ADIM 3: DATA LINKING - Veriler Kullanıcıya Bağlı mı?

```
❓ Is this data linked to the user's identity?
✅ YES, Data is Linked to User

Neden?
- Kullanıcı hesapları var
- Her ürün bir satıcıya ait
- Siparişler kullanıcılara bağlı
- Profil bilgileri kullanıcıya özel
```

---

## ✅ ADIM 4: TRACKING - Takip Yapılıyor mu?

```
❓ Do you or your third-party partners use this data for tracking purposes?
✅ NO, We Do Not Track

Neden?
- Reklam ağı yok
- Üçüncü taraf analitik yok
- Cross-app tracking yok
- Sadece app functionality için kullanılıyor
```

---

## 📋 HIZLI ÖZET: HAL KOMPLEKSİ İÇİN

| **Data Type** | **Collect?** | **Purpose** | **Linked to User?** | **Tracking?** |
|---------------|--------------|-------------|---------------------|---------------|
| Email | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| Phone | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| Name | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| Location (Coarse) | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| Location (Precise) | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| Photos/Videos | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| User Content | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| User ID | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| Purchase History | ✅ Yes | App Functionality | ✅ Yes | ❌ No |
| Business Info | ✅ Yes | App Functionality | ✅ Yes | ❌ No |

---

## 🔒 ADIM 5: PRIVACY POLICY URL

Apple, gizlilik politikanızın URL'sini ister:

### **Gerekli Minimum İçerik:**

```markdown
# Hal Kompleksi - Gizlilik Politikası

Son Güncelleme: [Tarih]

## 1. Toplanan Veriler

Hal Kompleksi uygulaması aşağıdaki bilgileri toplar:

### Hesap Bilgileri:
- Ad Soyad
- E-posta adresi
- Telefon numarası
- Şifre (şifrelenmiş)

### Konum Bilgileri:
- Şehir ve ilçe
- Adres bilgisi (opsiyonel)
- GPS koordinatları (opsiyonel, konum tabanlı arama için)

### Ürün ve İçerik:
- Yüklenen ürün resimleri ve videoları
- Ürün açıklamaları
- Profil fotoğrafı

### İşlem Bilgileri:
- Sipariş geçmişi
- Favoriler
- Ürün görüntüleme sayıları

### İşletme Bilgileri (Satıcılar için):
- İşletme adı
- Vergi numarası (opsiyonel)
- İş adresi

## 2. Verilerin Kullanımı

Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:

- **Hesap Yönetimi**: Kayıt olma, giriş yapma ve profil yönetimi
- **Ürün Listeleme**: Satıcıların ürün eklemesi ve yönetmesi
- **Alıcı-Satıcı İletişimi**: Kullanıcılar arasında iletişim sağlama
- **Konum Tabanlı Arama**: Yakındaki ürünleri ve satıcıları bulma
- **Sipariş Yönetimi**: Sipariş oluşturma ve takibi
- **Uygulama Güvenliği**: Hesap güvenliği ve kötüye kullanım önleme

## 3. Veri Paylaşımı

### Verileriniz KİMSE ile paylaşılmaz, SADECE:
- **WhatsApp**: Satıcıyla iletişim kurmak için WhatsApp'a yönlendirme yapılır
- **MongoDB**: Veritabanı hizmeti (veri saklamak için)

### Asla paylaşılmaz:
- ❌ Reklam şirketleri
- ❌ Veri simsarları
- ❌ Üçüncü taraf pazarlama firmaları
- ❌ Analitik servisleri (kişisel veri içermeden)

## 4. Veri Güvenliği

Verilerinizin güvenliği için:
- ✅ Şifreler bcrypt ile hash'lenir
- ✅ HTTPS ile şifreli iletişim
- ✅ JWT token tabanlı güvenli kimlik doğrulama
- ✅ Sunucu güvenlik duvarı ve rate limiting
- ✅ Düzenli güvenlik güncellemeleri

## 5. Kullanıcı Hakları

Kullanıcılar olarak haklarınız:

### ✅ Erişim Hakkı:
- Hangi verilerinizin toplandığını öğrenebilirsiniz

### ✅ Düzeltme Hakkı:
- Profil ayarlarından bilgilerinizi güncelleyebilirsiniz

### ✅ Silme Hakkı:
- Hesabınızı ve tüm verilerinizi silebilirsiniz
- support@halkompleksi.com adresine e-posta gönderin

### ✅ İtiraz Hakkı:
- Veri işleme süreçlerine itiraz edebilirsiniz

### ✅ Veri Taşınabilirliği:
- Verilerinizin bir kopyasını talep edebilirsiniz

## 6. Çerezler ve İzleme

Hal Kompleksi uygulaması:
- ❌ Reklam çerezleri kullanmaz
- ❌ Üçüncü taraf izleme araçları kullanmaz
- ❌ Cross-app tracking yapmaz
- ✅ Sadece oturum yönetimi için token kullanır (cihazda saklanır)

## 7. Çocukların Gizliliği

Uygulamamız 13 yaşından küçük çocuklara yönelik değildir. 
13 yaşından küçük kullanıcılardan bilerek veri toplamıyoruz.

## 8. Veri Saklama Süresi

- **Aktif hesaplar**: Hesap silinene kadar saklanır
- **Silinen hesaplar**: Veriler 30 gün içinde tamamen silinir
- **Sipariş kayıtları**: Yasal yükümlülükler için 5 yıl saklanır

## 9. Değişiklikler

Bu gizlilik politikası güncellenebilir. 
Önemli değişiklikler olduğunda:
- Uygulama içi bildirim gösterilir
- E-posta gönderilir
- Web sitesinde duyurulur

## 10. İletişim

Gizlilik ile ilgili sorularınız için:

📧 E-posta: support@halkompleksi.com
📱 Telefon: +90 [Telefon Numaranız]
🌐 Web: https://halkompleksi.com
📍 Adres: [Şirket Adresiniz]

---

**Son Güncelleme:** 2 Kasım 2025
**Versiyon:** 1.0
```

### **Bu içeriği şuraya yükleyin:**
1. **Web sitenizde** bir sayfa oluşturun: `https://yourdomain.com/privacy`
2. **Veya GitHub Pages** kullanın (ücretsiz)
3. URL'i App Store Connect'e ekleyin

---

## ⚠️ SIKÇA YAPILAN HATALAR

### ❌ Hata 1: "We don't collect any data" demek
**Doğrusu:** Email, telefon ve diğer veriler toplandığını açıkça belirtin

### ❌ Hata 2: Tracking = Yes demek
**Doğrusu:** Reklam veya cross-app tracking yoksa "No" seçin

### ❌ Hata 3: Privacy Policy URL olmadan submit etmek
**Doğrusu:** Mutlaka bir gizlilik politikası sayfası yayınlayın

### ❌ Hata 4: Toplanan veriyi saklamak
**Doğrusu:** Her veri tipini açıkça listeleyin

---

## ✅ KONTROL LİSTESİ

Yüklemeden önce kontrol edin:

- [ ] App Store Connect → App Privacy açıldı
- [ ] Contact Info (Email, Phone, Name) eklendi
- [ ] Location (Coarse & Precise) eklendi
- [ ] User Content (Photos/Videos) eklendi
- [ ] Identifiers (User ID) eklendi
- [ ] Purchases (Purchase History) eklendi
- [ ] Her veri için "App Functionality" seçildi
- [ ] Her veri için "Linked to User" seçildi
- [ ] Her veri için "No Tracking" seçildi
- [ ] Privacy Policy URL eklendi
- [ ] Privacy Policy yayında ve erişilebilir
- [ ] "Submit" butonu tıklandı

---

## 🚀 SONRAKI ADIMLAR

App Privacy formunu tamamladıktan sonra:

1. ✅ **App Privacy formu** → Tamamlandı
2. ⏳ **Metadata** → Açıklama, screenshots, keywords ekleyin
3. ⏳ **Build** → EAS ile iOS build alın
4. ⏳ **TestFlight** → Internal testing yapın
5. ⏳ **Submit for Review** → Apple'a gönderin

---

## 📞 YARDIM

**App Privacy Reddedilirse:**
- Resolution Center'dan Apple'ın geri bildirimini okuyun
- Eksik veri tiplerini ekleyin
- Privacy policy'yi güncelleyin
- Tekrar submit edin

**Apple Documentation:**
- https://developer.apple.com/app-store/app-privacy-details/

---

## 🎉 BAŞARILAR!

Bu formu doğru doldurduğunuzda, App Store incelemesine göndermek için bir adım daha yaklaşmış olacaksınız! 🚀

**Önemli:** Privacy Policy mutlaka hazırlanmalı ve aktif bir URL'de yayınlanmalı!

