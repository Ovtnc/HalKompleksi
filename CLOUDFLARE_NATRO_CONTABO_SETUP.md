# 🌐 CLOUDFLARE + NATRO (Domain) + CONTABO (Server) BAĞLANTI REHBERİ

## 📋 Genel Bakış

**Senaryo:**
- 🌍 **Domain:** Natro'da kayıtlı (örn: halkompleksi.com)
- 🖥️ **Server:** Contabo VPS (IP: 109.199.114.223)
- ⚡ **CDN/Proxy:** Cloudflare (ücretsiz)

**Avantajlar:**
- ✅ Ücretsiz SSL sertifikası
- ✅ DDoS koruması
- ✅ Hızlı yükleme (CDN)
- ✅ Kolay yönetim
- ✅ Analytics

---

## 🎯 ADIM 1: Cloudflare Hesabı Oluştur (5 dakika)

### 1.1. Kayıt Ol
1. https://cloudflare.com adresine git
2. **Sign Up** butonuna tıkla
3. Email ve şifre ile kayıt ol
4. Email'ini doğrula

### 1.2. Domain Ekle
1. Cloudflare dashboard'a giriş yap
2. **Add a Site** butonuna tıkla
3. Domain adını gir: `halkompleksi.com`
4. **Add Site** butonuna tıkla
5. **Free Plan** seç ve **Continue** tıkla

### 1.3. DNS Kayıtlarını Tara
Cloudflare otomatik olarak mevcut DNS kayıtlarını tarayacak.
- Listeyi kontrol et
- **Continue** tıkla

---

## 🔧 ADIM 2: DNS Kayıtlarını Yapılandır (10 dakika)

### 2.1. A Record Ekle (Ana Domain)

**Cloudflare DNS Management** sayfasında:

```
Type: A
Name: @ (veya halkompleksi.com)
IPv4 address: 109.199.114.223
Proxy status: ✅ Proxied (turuncu bulut)
TTL: Auto
```

**Add Record** butonuna tıkla.

### 2.2. A Record Ekle (www Subdomain)

```
Type: A
Name: www
IPv4 address: 109.199.114.223
Proxy status: ✅ Proxied (turuncu bulut)
TTL: Auto
```

**Add Record** butonuna tıkla.

### 2.3. CNAME Record Ekle (API için - opsiyonel)

```
Type: CNAME
Name: api
Target: halkompleksi.com
Proxy status: ✅ Proxied
TTL: Auto
```

### 2.4. Örnek DNS Yapılandırması

```
┌─────────┬──────────────────┬──────────────────────┬─────────────┐
│ Type    │ Name             │ Content              │ Proxy       │
├─────────┼──────────────────┼──────────────────────┼─────────────┤
│ A       │ @                │ 109.199.114.223      │ ✅ Proxied  │
│ A       │ www              │ 109.199.114.223      │ ✅ Proxied  │
│ CNAME   │ api              │ halkompleksi.com     │ ✅ Proxied  │
│ TXT     │ @                │ (email doğrulama)    │ DNS Only    │
└─────────┴──────────────────┴──────────────────────┴─────────────┘
```

**Continue** butonuna tıkla.

---

## 📝 ADIM 3: Cloudflare Nameserver'larını Al (2 dakika)

Cloudflare size **2 adet nameserver** verecek:

```
nameserver 1: chad.ns.cloudflare.com
nameserver 2: lola.ns.cloudflare.com
```

⚠️ **ÖNEMLİ:** Bu nameserver'ları kaydet! Bir sonraki adımda lazım olacak.

**Done, check nameservers** butonuna tıklama, henüz!

---

## 🌍 ADIM 4: Natro Domain Ayarları (10 dakika)

### 4.1. Natro'ya Giriş Yap
1. https://www.natro.com adresine git
2. Müşteri giriş yap
3. **Domain Yönetimi** bölümüne git

### 4.2. Domain'i Seç
1. `halkompleksi.com` domain'ine tıkla
2. **Nameserver Ayarları** veya **DNS Yönetimi** bölümünü bul

### 4.3. Nameserver'ları Değiştir

**Mevcut Nameserver'lar (Natro):**
```
ns1.natro.com
ns2.natro.com
```

**Yeni Nameserver'lar (Cloudflare'den aldığın):**
```
chad.ns.cloudflare.com
lola.ns.cloudflare.com
```

**NOT:** Senin nameserver'ların farklı olabilir! Cloudflare'den aldığın nameserver'ları kullan.

### 4.4. Kaydet ve Bekle
1. **Kaydet** butonuna tıkla
2. Propagation (yayılma) için **24-48 saat** bekle
   - Genelde 1-2 saatte tamamlanır
   - Maksimum 48 saat sürebilir

---

## ⏱️ ADIM 5: DNS Propagation Kontrolü (1-48 saat)

### 5.1. Cloudflare'de Kontrol Et
1. Cloudflare dashboard'a geri dön
2. **Done, check nameservers** butonuna tıkla
3. Cloudflare nameserver'ları kontrol edecek

**Durum Mesajları:**
- 🟡 **Pending**: Henüz aktif değil, bekleyin
- 🟢 **Active**: Tamamlandı! ✅

### 5.2. Manuel Kontrol

**Online Araçlar:**
- https://www.whatsmydns.net/#NS/halkompleksi.com
- https://dnschecker.org/#NS/halkompleksi.com

**Terminal/CMD:**
```bash
# Nameserver kontrolü
nslookup -type=NS halkompleksi.com

# A record kontrolü
nslookup halkompleksi.com

# Dig ile kontrol (Mac/Linux)
dig halkompleksi.com +short
```

**Beklenen Sonuç:**
```
halkompleksi.com -> 109.199.114.223
```

---

## 🔒 ADIM 6: SSL/TLS Yapılandırması (5 dakika)

### 6.1. Cloudflare SSL Ayarları

1. Cloudflare dashboard'da **SSL/TLS** sekmesine git
2. **Encryption mode** seçimi yap:

#### Seçenek A: Flexible (Kolay - Önerilen başlangıç için)
```
User <--HTTPS--> Cloudflare <--HTTP--> Server
```
- ✅ Hemen çalışır
- ✅ Kurulum gerektirmez
- ⚠️ Server ile Cloudflare arası şifresiz

#### Seçenek B: Full (Orta seviye)
```
User <--HTTPS--> Cloudflare <--HTTPS--> Server
```
- ✅ Daha güvenli
- ⚠️ Server'da self-signed SSL gerekir

#### Seçenek C: Full (Strict) (En güvenli)
```
User <--HTTPS--> Cloudflare <--HTTPS--> Server
```
- ✅ En güvenli
- ⚠️ Server'da geçerli SSL sertifikası gerekir
- ⚠️ Let's Encrypt kurulumu gerekir

**ÖNERİ:** Önce **Flexible** ile başla, sonra **Full (Strict)** yap.

### 6.2. SSL Mode'u Seç
- **Flexible** seç
- Kaydet

### 6.3. Always Use HTTPS
1. **SSL/TLS** > **Edge Certificates** git
2. **Always Use HTTPS** açık yap (ON)
3. HTTP → HTTPS otomatik yönlendirme aktif olacak

### 6.4. Automatic HTTPS Rewrites
1. **Automatic HTTPS Rewrites** açık yap (ON)
2. HTTP linkleri otomatik HTTPS'e çevrilecek

---

## 🚀 ADIM 7: Contabo Server Yapılandırması (15 dakika)

### 7.1. SSH ile Bağlan
```bash
ssh root@109.199.114.223
```

### 7.2. Nginx Yapılandırması

**Backend Config:**
```bash
sudo nano /etc/nginx/sites-available/hal-kompleksi
```

**Nginx Config İçeriği:**
```nginx
# HTTP - Cloudflare'den gelecek
server {
    listen 80;
    server_name halkompleksi.com www.halkompleksi.com;

    # Cloudflare IP'lerini güven
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    # Client body size (video için)
    client_max_body_size 50M;

    # API Proxy
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /uploads {
        alias /root/hal-kompleksi/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Root
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.3. Nginx'i Aktif Et ve Başlat
```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/hal-kompleksi /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Yeniden başlat
sudo systemctl restart nginx
```

### 7.4. Firewall Ayarları
```bash
# Port 80 aç
sudo ufw allow 80/tcp

# Port 443 aç (gelecek için)
sudo ufw allow 443/tcp

# Kontrol et
sudo ufw status
```

---

## 🔄 ADIM 8: Backend URL'lerini Güncelle (5 dakika)

### 8.1. Frontend env.ts
```typescript
// HalKompleksi/src/config/env.ts
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
};
```

### 8.2. Backend urls.js
```javascript
// backend/src/config/urls.js
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  FRONTEND_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
  PORT: 5001,
};
```

### 8.3. Backend'i Yeniden Başlat
```bash
cd /root/hal-kompleksi/backend
pm2 restart hal-kompleksi
```

---

## ✅ ADIM 9: Test Et (10 dakika)

### 9.1. Domain Erişim Testi
```bash
# Terminal'de test et
curl -I https://halkompleksi.com

# Beklenen sonuç:
# HTTP/2 200
# server: cloudflare
```

### 9.2. Tarayıcıdan Test Et
1. https://halkompleksi.com aç
2. SSL kilit simgesini kontrol et (🔒)
3. **F12** > **Console** > hata var mı kontrol et

### 9.3. API Test Et
```bash
# Health check
curl https://halkompleksi.com/api/health

# Products
curl https://halkompleksi.com/api/products
```

### 9.4. SSL Test
https://www.ssllabs.com/ssltest/analyze.html?d=halkompleksi.com

**Beklenen Skor:** A veya A+

### 9.5. Mobil Uygulama Test Et
1. Uygulamayı yeniden build et
2. Login dene
3. Ürün listele
4. Ürün detay aç
5. Görsel yükle
6. Paylaşım yap

---

## 🛡️ ADIM 10: Cloudflare Güvenlik Ayarları (10 dakika)

### 10.1. Firewall Rules
1. **Security** > **WAF** > **Firewall Rules** git
2. **Create a Firewall rule** tıkla

**Örnek: API Rate Limiting**
```
Rule name: API Rate Limit
When incoming requests match:
  - URI Path contains "/api/"
  - Request Count > 100 per minute
Then:
  - Challenge (CAPTCHA)
```

### 10.2. Bot Fight Mode
1. **Security** > **Bots** git
2. **Bot Fight Mode** aktif et (ON)
3. Botları otomatik engelleyecek

### 10.3. DDoS Protection
1. **Security** > **DDoS** git
2. Otomatik aktiftir
3. Ayarları kontrol et

### 10.4. Browser Integrity Check
1. **Security** > **Settings** git
2. **Browser Integrity Check** aktif et (ON)

---

## ⚡ ADIM 11: Performans Optimizasyonları (5 dakika)

### 11.1. Auto Minify
1. **Speed** > **Optimization** git
2. **Auto Minify** aktif et:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### 11.2. Brotli Compression
1. **Speed** > **Optimization** git
2. **Brotli** aktif et (ON)

### 11.3. Rocket Loader
1. **Speed** > **Optimization** git
2. **Rocket Loader** aktif et (ON)
3. JavaScript'leri async yükleyecek

### 11.4. Caching
1. **Caching** > **Configuration** git
2. **Caching Level**: Standard
3. **Browser Cache TTL**: 4 hours

---

## 🔧 SORUN GİDERME

### ❌ Problem 1: "DNS_PROBE_FINISHED_NXDOMAIN"

**Sebep:** DNS henüz yayılmadı

**Çözüm:**
```bash
# DNS kontrolü
nslookup halkompleksi.com

# Flush DNS (Windows)
ipconfig /flushdns

# Flush DNS (Mac)
sudo dscacheutil -flushcache

# Flush DNS (Linux)
sudo systemd-resolve --flush-caches
```

### ❌ Problem 2: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Sebep:** SSL ayarları yanlış

**Çözüm:**
1. Cloudflare SSL mode: **Flexible** yap
2. 5 dakika bekle
3. Tarayıcı cache'ini temizle

### ❌ Problem 3: "522 Connection Timed Out"

**Sebep:** Server erişilemiyor

**Çözüm:**
```bash
# Server çalışıyor mu?
pm2 status

# Nginx çalışıyor mu?
sudo systemctl status nginx

# Port 80 açık mı?
sudo netstat -tulpn | grep :80
```

### ❌ Problem 4: API çalışmıyor

**Çözüm:**
```bash
# Backend logları kontrol et
pm2 logs hal-kompleksi

# Nginx error logları
sudo tail -f /var/log/nginx/error.log

# Backend URL'leri kontrol et
cat /root/hal-kompleksi/backend/src/config/urls.js
```

### ❌ Problem 5: Görseller yüklenmiyor

**Çözüm:**
```bash
# Uploads klasörü var mı?
ls -la /root/hal-kompleksi/backend/uploads/

# İzinler doğru mu?
sudo chmod -R 755 /root/hal-kompleksi/backend/uploads/

# Nginx config doğru mu?
sudo nginx -t
```

---

## 📊 İZLEME VE ANALİTİK

### Cloudflare Analytics
1. **Analytics** > **Traffic** git
2. İstatistikleri izle:
   - Günlük ziyaretçi
   - Bandwidth kullanımı
   - Engellenen tehditler
   - Ülke bazlı istatistikler

### SSL Expiration
Cloudflare otomatik yeniliyor, takip gerek yok!

---

## 🎯 GELECEKTEKİ İYİLEŞTİRMELER

### 1. Let's Encrypt SSL (Contabo'da)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d halkompleksi.com -d www.halkompleksi.com
```
Sonra Cloudflare SSL mode: **Full (Strict)** yap

### 2. Cloudflare Workers
- Edge computing
- API caching
- Custom logic

### 3. Load Balancing
- Multiple servers
- Automatic failover

---

## ✅ KONTROL LİSTESİ

Tamamlandıktan sonra kontrol et:

- [ ] Cloudflare hesabı oluşturuldu
- [ ] Domain Cloudflare'e eklendi
- [ ] DNS kayıtları yapılandırıldı (A, CNAME)
- [ ] Natro nameserver'ları Cloudflare'e yönlendirildi
- [ ] DNS propagation tamamlandı (24-48 saat)
- [ ] SSL/TLS Flexible mode aktif
- [ ] Always Use HTTPS aktif
- [ ] Nginx yapılandırması tamamlandı
- [ ] Backend URL'leri güncellendi
- [ ] Frontend URL'leri güncellendi
- [ ] HTTPS üzerinden erişim çalışıyor
- [ ] API erişimi çalışıyor
- [ ] SSL testi başarılı (A veya A+)
- [ ] Mobil uygulama test edildi
- [ ] Güvenlik ayarları yapıldı
- [ ] Performans optimizasyonları yapıldı

---

## 📞 DESTEK

**Cloudflare Dokümantasyon:**
https://developers.cloudflare.com/

**Natro Destek:**
https://www.natro.com/destek

**Contabo Destek:**
https://contabo.com/en/support/

---

## 🎉 TEBRİKLER!

Artık:
- ✅ Domain + Server bağlantınız kuruldu
- ✅ Ücretsiz SSL sertifikanız var
- ✅ DDoS korumanız aktif
- ✅ CDN ile hızlı yükleme
- ✅ HTTPS ile güvenli bağlantı

**Şimdi ne yapmalısın?**
1. Mobil uygulamayı rebuild et (HTTPS URL'lerle)
2. Store'a yükle
3. Kullanıcı testleri yap
4. Monitoring kur

---

**Son Güncelleme:** 2025-11-03

**Tahmini Tamamlanma Süresi:** 2-4 saat (DNS propagation dahil: 24-48 saat)

