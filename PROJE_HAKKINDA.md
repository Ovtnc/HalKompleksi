# 🏪 Hal Kompleksi - Dijital Toptan Satış Platformu

## 📋 Proje Özeti

**Hal Kompleksi**, geleneksel hal sitelerini dijital ortama taşıyan, modern bir B2B (işletmeden işletmeye) ve B2C (işletmeden tüketiciye) mobil e-ticaret platformudur. Toptancılar, üreticiler ve alıcılar arasında güvenli, hızlı ve kolay bir şekilde ticaret yapılmasını sağlar.

## 🎯 Projenin Amacı

Bu platform, geleneksel hal sitelerinin karşılaştığı zorlukları çözmek için geliştirilmiştir:

- ✅ **Erişilebilirlik**: Hal sitesine fiziksel olarak gitmeden ürünlere erişim
- ✅ **Şeffaflık**: Güncel fiyatlar ve piyasa raporları
- ✅ **Verimlilik**: Hızlı arama, filtreleme ve sipariş yönetimi
- ✅ **İletişim**: Satıcı-alıcı arasında doğrudan iletişim
- ✅ **Güvenilirlik**: Kayıtlı satıcılar ve kullanıcı değerlendirmeleri

## 👥 Hedef Kullanıcılar

### 1. **Alıcılar (Müşteriler)**
- Restoranlar, marketler, otel işletmeleri
- Bireysel tüketiciler
- Toplu alım yapan kurumlar

### 2. **Satıcılar (Toptancılar/Üreticiler)**
- Hal esnafı
- Tarım üreticileri
- Toptan satıcılar
- İthalatçı/ihracatçılar

### 3. **Yöneticiler**
- Platform yöneticileri
- Hal kompleksi yetkilileri

## 🌟 Ana Özellikler

### 📱 Mobil Uygulama (iOS & Android)

#### Kullanıcı Özellikleri
- **Kayıt & Giriş Sistemi**: Güvenli JWT tabanlı kimlik doğrulama
- **Ürün Arama & Filtreleme**: 
  - Kategori, fiyat aralığı, konum bazlı arama
  - 10+ farklı ürün kategorisi (Sebze, Meyve, Baharat, vb.)
  - Popüler ve öne çıkan ürünler
- **Favori Ürünler**: Beğenilen ürünleri kaydetme
- **Sipariş Yönetimi**: Sipariş oluşturma ve takibi
- **Profil Yönetimi**: Kullanıcı bilgilerini güncelleme
- **Bildirimler**: Anlık sipariş ve mesaj bildirimleri
- **Piyasa Raporları**: Güncel hal fiyatları ve piyasa analizleri
- **Konum Tabanlı Arama**: Yakındaki satıcıları bulma

#### Satıcı Özellikleri
- **Ürün Yönetimi**: 
  - Yeni ürün ekleme
  - Ürün düzenleme ve silme
  - Çoklu fotoğraf yükleme (resim & video desteği)
  - Stok ve fiyat güncelleme
- **Satıcı Profili**:
  - İşletme bilgileri
  - Konum bilgisi
  - İletişim detayları
- **Satış İstatistikleri**: Satış performansı ve analitik
- **Sipariş Yönetimi**: Gelen siparişleri görüntüleme ve yönetme

#### Yönetici Özellikleri
- **Kullanıcı Yönetimi**: Kullanıcı onaylama ve yönetme
- **Ürün Denetimi**: Ürün onaylama ve moderasyon
- **Kategori Yönetimi**: Yeni kategori ekleme ve düzenleme
- **Konum Yönetimi**: Bölge ve konum tanımlama
- **Piyasa Raporları**: Güncel piyasa verilerini yayınlama
- **İstatistikler**: Platform kullanım istatistikleri

### 🖥️ Backend API Sistemi

#### Teknik Özellikler
- **RESTful API**: Modern API mimarisi
- **JWT Authentication**: Güvenli token tabanlı kimlik doğrulama
- **MongoDB Database**: Esnek ve ölçeklenebilir veritabanı
- **File Upload**: Cloudinary/Local storage ile dosya yükleme
- **Email Service**: Şifre sıfırlama ve bildirim e-postaları
- **Real-time Notifications**: Anlık bildirim sistemi
- **Rate Limiting**: API güvenliği ve kötüye kullanım önleme
- **Input Validation**: Veri doğrulama ve güvenlik
- **Error Handling**: Merkezi hata yönetimi

#### Veritabanı Şeması
1. **Users (Kullanıcılar)**
   - Kişisel bilgiler (ad, email, telefon)
   - Kullanıcı tipi (alıcı/satıcı/admin)
   - Profil fotoğrafı
   - Konum bilgisi

2. **Products (Ürünler)**
   - Başlık, açıklama, fiyat
   - Kategori ve birim
   - Çoklu medya (resim/video)
   - Stok durumu
   - Konum ve satıcı bilgisi

3. **Categories (Kategoriler)**
   - 10 ana kategori
   - İkonlar ve açıklamalar

4. **Orders (Siparişler)**
   - Sipariş detayları
   - Durum takibi
   - Teslimat bilgileri
   - Ödeme durumu

5. **Locations (Konumlar)**
   - Şehir, ilçe, hal isimleri
   - Coğrafi koordinatlar

6. **Market Reports (Piyasa Raporları)**
   - Günlük hal fiyatları
   - Piyasa analizleri
   - Tarih ve kategori bilgisi

7. **Notifications (Bildirimler)**
   - Sistem bildirimleri
   - Sipariş güncellemeleri
   - Mesaj bildirimleri

8. **Product Requests (Ürün Talepleri)**
   - Satıcı ürün ekleme talepleri
   - Admin onay süreci

## 🛠️ Teknoloji Stack

### Frontend (Mobil Uygulama)
```
- React Native 0.81.4
- Expo 54
- TypeScript
- React Navigation (Bottom Tabs, Stack, Drawer)
- React Native Paper (UI Components)
- AsyncStorage (Local Storage)
- Expo Image Picker, Camera, Location
- Socket.io Client (Real-time)
- React Native Chart Kit (İstatistikler)
```

### Backend (API Sunucusu)
```
- Node.js 18+
- Express.js
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- bcryptjs (Şifre hashleme)
- Multer (Dosya yükleme)
- Nodemailer (Email servisi)
- Express Validator (Validasyon)
- Helmet (Güvenlik)
- CORS
- Morgan (Logging)
```

### Deployment & DevOps
```
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- PM2 (Process Manager)
- Production ready konfigürasyonlar
```

## 📊 İş Akışları

### 1. Alıcı Kullanıcı Akışı
```
Kayıt Ol → Profil Oluştur → Ürünleri Ara/Filtrele → 
Ürün Detayı Görüntüle → Favorilere Ekle → Sipariş Ver → 
Sipariş Takibi → Satıcıyı Değerlendir
```

### 2. Satıcı Kullanıcı Akışı
```
Kayıt Ol → Satıcı Profili Oluştur → Admin Onayı Bekle → 
Ürün Ekle (Fotoğraf/Video yükle) → Admin Onayı → 
Ürün Yayınla → Siparişleri Yönet → Stok Güncelle
```

### 3. Admin Akışı
```
Giriş Yap → Yeni Satıcı Taleplerini İncele → Onayla/Reddet → 
Ürün Taleplerini İncele → Onayla/Düzenle → 
Piyasa Raporu Yayınla → Kullanıcı Yönetimi
```

## 🔒 Güvenlik Önlemleri

- ✅ JWT token tabanlı kimlik doğrulama
- ✅ Bcrypt ile şifre hashleme
- ✅ Rate limiting (API kötüye kullanım önleme)
- ✅ Input validation (XSS, SQL Injection koruması)
- ✅ CORS policy
- ✅ Helmet güvenlik başlıkları
- ✅ File upload güvenliği (tip ve boyut kontrolleri)
- ✅ Role-based access control (RBAC)

## 📱 Desteklenen Platformlar

- ✅ iOS (iPhone, iPad)
- ✅ Android (Telefon, Tablet)
- ⚠️ Web (Kısıtlı destek - Expo web)

## 🚀 Kurulum ve Çalıştırma

### Backend Kurulumu
```bash
cd backend
npm install
# .env dosyasını yapılandır
npm run dev  # Development
npm start    # Production
```

### Mobil Uygulama Kurulumu
```bash
cd HalKompleksi
npm install
npx expo start
# iOS için: npx expo run:ios
# Android için: npx expo run:android
```

### Docker ile Kurulum
```bash
cd backend
docker-compose up -d
```

## 📈 Gelecek Planları

- [ ] Gerçek zamanlı chat sistemi
- [ ] Canlı müzayede özelliği
- [ ] Çoklu dil desteği (İngilizce, Arapça)
- [ ] Ödeme entegrasyonu (Stripe, PayPal, Iyzico)
- [ ] QR kod ile ürün takibi
- [ ] Web admin paneli
- [ ] Gelişmiş analitik ve raporlama
- [ ] Push notification servisi
- [ ] SMS bildirimleri
- [ ] Kampanya ve indirim sistemi
- [ ] Satıcı puanlama sistemi
- [ ] Video chat desteği

## 📞 İletişim ve Destek

Bu proje **Okan Vatancı** tarafından geliştirilmektedir.

## 📄 Lisans

MIT License - Bu yazılım açık kaynak kodludur ve ticari kullanım için uygundur.

---

## 🎯 Proje Değer Önerisi

**Hal Kompleksi**, geleneksel hal sitelerinin dijital dönüşümünü sağlayarak:

1. **Satıcılar için**: Daha geniş müşteri kitlesine ulaşma, online satış kanalı
2. **Alıcılar için**: Zaman tasarrufu, fiyat karşılaştırma, kaliteli ürüne erişim
3. **Hal Yönetimi için**: Dijital kayıt, piyasa takibi, veri analitiği
4. **Ekonomi için**: Şeffaf piyasa, verimli ticaret, kayıt dışılığın azalması

Bu platform, tarım ve gıda sektöründe dijitalleşmeyi hızlandırarak, tüm paydaşlar için değer yaratmaktadır.

