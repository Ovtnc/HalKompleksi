# 🌐 Hal Kompleksi Web Sayfası Kurulumu

Uygulama tanıtım sayfası ve diğer web sayfaları backend'de statik HTML olarak sunuluyor.

## 📁 Dosya Yapısı

```
backend/
├── public/
│   ├── index.html              # 🏠 Ana sayfa (Landing page)
│   ├── product.html            # 📦 Ürün detay sayfası (Deep linking için)
│   ├── privacy-policy.html     # 🔒 Gizlilik politikası
│   └── terms-of-service.html   # 📜 Kullanım şartları
└── src/
    └── server.js               # 🚀 Route tanımlamaları
```

## 🎨 Web Sayfaları

### 1. Ana Sayfa (`/`)
**URL:** `https://halkompleksi.com/`

**İçerik:**
- ✅ Hero section (başlık, açıklama, CTA butonları)
- ✅ Özellikler (6 ana özellik kartı)
- ✅ İstatistikler (1000+ kullanıcı, 500+ ilan, vs.)
- ✅ Nasıl Çalışır (3 adım)
- ✅ CTA section (uygulama indirme linkleri)
- ✅ Footer (linkler, sosyal medya, telif hakkı)

**Animasyonlar:**
- Fade-in on scroll
- Smooth scrolling
- İstatistik sayıları animasyonlu

### 2. Ürün Detay (`/product/:productId`)
**URL:** `https://halkompleksi.com/product/123456`

**İçerik:**
- ✅ Ürün bilgileri (API'den yüklenir)
- ✅ Otomatik uygulama yönlendirme
- ✅ App Store/Google Play linkleri
- ✅ Güzel tasarım ve kullanıcı deneyimi

**Özellikler:**
- Deep linking desteği
- Otomatik uygulama açma
- Fallback web görünümü

### 3. Gizlilik Politikası (`/privacy-policy.html`)
**URL:** `https://halkompleksi.com/privacy-policy.html`

**İçerik:**
- Toplanan bilgiler
- Bilgilerin kullanımı
- Veri güvenliği
- Kullanıcı hakları (KVKK)
- İletişim bilgileri

### 4. Kullanım Şartları (`/terms-of-service.html`)
**URL:** `https://halkompleksi.com/terms-of-service.html`

**İçerik:**
- Genel hükümler
- İlan yayınlama kuralları
- Yasak aktiviteler
- Sorumluluk sınırlaması
- Uyuşmazlık çözümü

## 🎯 Özellikler

### Responsive Tasarım
- ✅ Mobil uyumlu
- ✅ Tablet uyumlu
- ✅ Desktop uyumlu
- ✅ Tüm ekran boyutlarında güzel görünür

### Performans
- ✅ Tek sayfa yükleme (no framework)
- ✅ Optimize edilmiş CSS
- ✅ Hızlı yükleme
- ✅ SEO dostu

### Modern UI/UX
- ✅ Gradient renkler
- ✅ Smooth animasyonlar
- ✅ İkonlar (emoji-based, no external dependencies)
- ✅ Box shadows ve hover efektleri
- ✅ Profesyonel görünüm

## 🚀 Backend Route'lar

```javascript
// server.js içinde

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ürün detay
app.get('/product/:productId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/product.html'));
});

// Gizlilik politikası
app.get('/privacy-policy.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/privacy-policy.html'));
});

// Kullanım şartları
app.get('/terms-of-service.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/terms-of-service.html'));
});
```

## 🔧 Özelleştirme

### Renk Teması
```css
:root {
  --primary: #2ECC71;        /* Ana renk (yeşil) */
  --primary-dark: #27AE60;   /* Koyu yeşil */
  --secondary: #3498DB;      /* İkincil renk (mavi) */
  --dark: #2C3E50;          /* Koyu gri */
  --light: #ECF0F1;         /* Açık gri */
}
```

### İstatistikleri Güncelleme
`index.html` dosyasında:
```javascript
// Stats Section
const values = [1000, 500, 81, 10]; // Güncel değerler
```

### App Store Linklerini Güncelleme
Tüm sayfalarda:
```html
<!-- Google Play -->
<a href="https://play.google.com/store/apps/details?id=com.halkompleksi.app">

<!-- App Store -->
<a href="https://apps.apple.com/app/hal-kompleksi/YOUR_APP_ID">
```

### İletişim Bilgilerini Güncelleme
```html
<!-- Email -->
<a href="mailto:halkompleksitr@gmail.com">

<!-- Telefon -->
+90 XXX XXX XX XX
```

## 🌐 Domain Yapılandırması

### DNS Ayarları
```
A Record:
halkompleksi.com -> 109.199.114.223

CNAME (opsiyonel):
www.halkompleksi.com -> halkompleksi.com
```

### SSL Sertifikası
```bash
# Let's Encrypt ile ücretsiz SSL
sudo certbot --nginx -d halkompleksi.com -d www.halkompleksi.com

# Otomatik yenileme
sudo certbot renew --dry-run
```

### Nginx Yapılandırması
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name halkompleksi.com www.halkompleksi.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name halkompleksi.com www.halkompleksi.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/halkompleksi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/halkompleksi.com/privkey.pem;
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Test Etme

### Yerel Test
```bash
cd backend
npm start

# Tarayıcıda:
http://localhost:5001/
http://localhost:5001/product/test123
http://localhost:5001/privacy-policy.html
http://localhost:5001/terms-of-service.html
```

### Production Test
```bash
# HTTPS zorunlu!
curl https://halkompleksi.com/
curl https://halkompleksi.com/product/test123
curl https://halkompleksi.com/api/health
```

## 📱 SEO ve Meta Tags

### Open Graph Tags (Sosyal Medya)
```html
<meta property="og:title" content="Hal Kompleksi">
<meta property="og:description" content="...">
<meta property="og:image" content="/assets/og-image.png">
<meta property="og:url" content="https://halkompleksi.com">
```

### Google Analytics (Opsiyonel)
```html
<!-- index.html içine ekle -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🚀 Deploy Checklist

- [ ] Backend güncellenmiş ve çalışıyor
- [ ] SSL sertifikası aktif (HTTPS)
- [ ] Domain DNS ayarları yapılmış
- [ ] Nginx yapılandırması güncellenmiş
- [ ] Tüm linkler test edilmiş
- [ ] App Store linkleri güncellenmiş
- [ ] İletişim bilgileri güncellenmiş
- [ ] Responsive tasarım test edilmiş
- [ ] SEO meta tags eklenmiş

## 💡 İpuçları

1. **Görsel Eklemek İstiyorsanız:**
   ```bash
   # backend/public/assets/ klasörü oluştur
   mkdir -p backend/public/assets
   
   # Görselleri ekle
   # HTML'de kullan:
   <img src="/assets/logo.png" alt="Logo">
   ```

2. **Blog Bölümü Eklemek İstiyorsanız:**
   - `backend/public/blog/` klasörü oluştur
   - Her yazı için HTML sayfası oluştur
   - Ana sayfaya blog linki ekle

3. **Dil Desteği Eklemek İstiyorsanız:**
   - `backend/public/en/` klasörü oluştur
   - İngilizce sayfaları ekle
   - Dil seçici ekle

## 📚 Kaynaklar

- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [HTML5 Boilerplate](https://html5boilerplate.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/) - Browser compatibility

---

✅ **Web sayfanız hazır! `https://halkompleksi.com` adresinden erişilebilir.**

