# 🇹🇷 Natro Domain + Contabo Server için SSL Kurulumu

## Senaryo
- **Domain:** Natro'da (örn: halkompleksi.com)
- **Backend Server:** Contabo VPS (109.199.114.223)
- **Hedef:** https://api.halkompleksi.com ile SSL'li erişim

---

## 📍 ADIM 1: Natro DNS Ayarları

### 1.1. Natro Paneline Giriş

1. https://www.natro.com/panel adresine gidin
2. Kullanıcı adı ve şifrenizle giriş yapın

### 1.2. Domain Yönetimi

1. Ana sayfada **"Alan Adlarım"** veya **"Domain Yönetimi"** bölümüne tıklayın
2. Domain'inizi bulun (örn: halkompleksi.com)
3. Domain'in yanındaki **"Yönet"** butonuna tıklayın

### 1.3. DNS Yönetimi

1. Sol menüden veya üst sekmelerden **"DNS Yönetimi"** seçeneğini bulun
2. **"DNS Kayıtları"** veya **"Zone Kayıtları"** sayfasına gidin

### 1.4. A Kaydı Ekleme

**A Kaydı Eklemek için:**

#### Seçenek A: Subdomain (api.halkompleksi.com) - ÖNERİLEN

```
Kayıt Tipi: A
Host/Alt Alan Adı: api
Değer/IP Adresi: 109.199.114.223
TTL: 3600 (1 saat) veya varsayılan
```

**Natro'da görüneceği şekil:**
```
Tip    Host    Değer              TTL
A      api     109.199.114.223    3600
```

#### Seçenek B: Root Domain (halkompleksi.com)

```
Kayıt Tipi: A
Host/Alt Alan Adı: @ (veya boş bırakın)
Değer/IP Adresi: 109.199.114.223
TTL: 3600
```

#### Seçenek C: Her İkisi de (En İyisi)

```
# API için
A      api     109.199.114.223    3600

# Ana domain için
A      @       109.199.114.223    3600

# WWW için
A      www     109.199.114.223    3600
```

### 1.5. Kaydet

1. **"Kaydet"** veya **"Ekle"** butonuna tıklayın
2. Değişikliklerin kaydedildiğini onaylayın

---

## 🕐 ADIM 2: DNS Yayılmasını Bekle

DNS değişikliklerinin tüm internet üzerinde yayılması zaman alır.

### 2.1. Kontrol Et (Windows/Mac/Linux)

```bash
# Yeni DNS ayarını kontrol et
nslookup api.halkompleksi.com

# Çıktı böyle olmalı:
# Name:    api.halkompleksi.com
# Address: 109.199.114.223
```

**Alternatif kontrol:**
```bash
# Ping test
ping api.halkompleksi.com

# Dig test (daha detaylı)
dig api.halkompleksi.com
```

### 2.2. Online DNS Kontrol

Tarayıcıdan bu siteleri kullanın:
- https://www.whatsmydns.net/
- https://dnschecker.org/

Domain adınızı girin ve A kaydını kontrol edin.

### 2.3. Bekleme Süresi

- **Minimum:** 5-15 dakika
- **Ortalama:** 30-60 dakika
- **Maksimum:** 24-48 saat

⏰ **Not:** Natro genelde hızlıdır, 15-30 dakika içinde yayılır.

---

## 🔐 ADIM 3: Contabo Sunucuda SSL Kurulumu

DNS yayılımı tamamlandıktan sonra Contabo sunucunuza bağlanın.

### 3.1. Contabo VPS'e Bağlan

```bash
# SSH ile bağlan
ssh root@109.199.114.223

# Şifrenizi girin
```

### 3.2. Sistem Güncelleme

```bash
apt-get update
apt-get upgrade -y
```

### 3.3. Nginx Kontrolü

```bash
# Nginx yüklü mü kontrol et
nginx -v

# Yüklü değilse kur
apt-get install nginx -y

# Nginx çalışıyor mu kontrol et
systemctl status nginx
```

### 3.4. Certbot Kurulumu

```bash
# Certbot ve Nginx plugin'i kur
apt-get install certbot python3-certbot-nginx -y

# Kurulum kontrolü
certbot --version
```

### 3.5. SSL Sertifikası Al

```bash
# Tek domain için
certbot --nginx -d api.halkompleksi.com

# Birden fazla domain için
certbot --nginx -d halkompleksi.com -d www.halkompleksi.com -d api.halkompleksi.com

# Certbot soracak:
# Email: sizin-email@example.com (Enter)
# Terms of Service: A (Enter)
# Share email: N (Enter)
# HTTP to HTTPS redirect: 2 (Enter) - Otomatik yönlendirme için
```

**Başarılı çıktı:**
```
Congratulations! You have successfully enabled https://api.halkompleksi.com

IMPORTANT NOTES:
 - Congratulations! Your certificate and chain have been saved at:
   /etc/letsencrypt/live/api.halkompleksi.com/fullchain.pem
```

### 3.6. Otomatik Yenileme Test

```bash
# Otomatik yenileme test et
certbot renew --dry-run

# Başarılı ise çıktı:
# Congratulations, all simulated renewals succeeded
```

---

## 🔧 ADIM 4: Nginx Yapılandırması

### 4.1. Nginx Config Dosyasını Düzenle

```bash
# Mevcut Nginx config'i kontrol et
cat /etc/nginx/sites-available/default

# Düzenle
nano /etc/nginx/sites-available/default
```

### 4.2. Örnek Nginx Yapılandırması

```nginx
# HTTP -> HTTPS yönlendirme
server {
    listen 80;
    server_name api.halkompleksi.com halkompleksi.com www.halkompleksi.com;
    
    # Let's Encrypt ACME challenge için
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Diğer tüm istekleri HTTPS'e yönlendir
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS sunucu
server {
    listen 443 ssl http2;
    server_name api.halkompleksi.com;

    # SSL sertifikaları (Certbot otomatik ekler)
    ssl_certificate /etc/letsencrypt/live/api.halkompleksi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.halkompleksi.com/privkey.pem;
    
    # SSL ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384';
    
    # SSL session cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # File upload limit
    client_max_body_size 10M;

    # API endpoint'leri
    location /api/ {
        proxy_pass http://localhost:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # OPTIONS requests için
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Static files (resimler)
    location /uploads/ {
        alias /var/www/hal-kompleksi/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 4.3. Config Test ve Restart

```bash
# Config dosyasını test et
nginx -t

# Başarılı ise:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Nginx'i yeniden başlat
systemctl restart nginx

# Status kontrol
systemctl status nginx
```

---

## 📱 ADIM 5: Backend Uygulama Ayarları

### 5.1. Backend .env Dosyası

```bash
# Backend dizinine git
cd /path/to/your/backend

# .env dosyasını düzenle
nano .env
```

**.env içeriği:**
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hal-kompleksi
JWT_SECRET=guclu-bir-secret-key-buraya-yazin
CORS_ORIGIN=https://api.halkompleksi.com,https://halkompleksi.com

# Email settings (eğer varsa)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sizin-email@gmail.com
EMAIL_PASS=uygulama-sifresi
```

### 5.2. Backend'i Yeniden Başlat

```bash
# PM2 kullanıyorsanız
pm2 restart hal-kompleksi

# PM2 kullanmıyorsanız kur
npm install -g pm2
pm2 start src/server.js --name hal-kompleksi
pm2 save
pm2 startup
```

---

## 📲 ADIM 6: Frontend (React Native) Güncellemeleri

### 6.1. env.ts Güncelle

```bash
# Mac/Linux
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi
```

**Dosya:** `src/config/env.ts`

```typescript
export const ENV = {
  // ✅ HTTPS ile güncellenmiş URL
  API_BASE_URL: getEnvValue('API_BASE_URL', 'https://api.halkompleksi.com/api'),
  
  APP_NAME: 'Hal Kompleksi',
  APP_VERSION: '1.0.0',
  IS_DEV: __DEV__,
  ENABLE_LOGGING: __DEV__,
};
```

### 6.2. Info.plist Temizle

**Dosya:** `ios/HalKompleksi/Info.plist`

**ÖNCEKİ (HTTP exception - KALDIR):**
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSAllowsLocalNetworking</key>
  <true/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>109.199.114.223</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
      <key>NSIncludesSubdomains</key>
      <true/>
    </dict>
  </dict>
</dict>
```

**YENİ (Temiz - HTTPS için):**
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

---

## ✅ ADIM 7: Test

### 7.1. Tarayıcıdan Test

```
https://api.halkompleksi.com/api/products
```

Ürün listesini JSON formatında görmelisiniz.

### 7.2. Terminal'den Test

```bash
# HTTPS test
curl https://api.halkompleksi.com/api/products

# SSL sertifika bilgileri
curl -vI https://api.halkompleksi.com

# SSL detaylı test
openssl s_client -connect api.halkompleksi.com:443 -servername api.halkompleksi.com
```

### 7.3. SSL Labs Test

Tarayıcıdan:
```
https://www.ssllabs.com/ssltest/analyze.html?d=api.halkompleksi.com
```

**Hedef:** A veya A+ rating

### 7.4. Mobil Uygulamada Test

```bash
# Cache temizle
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi
npm run clean

# Yeniden çalıştır
npm start
```

**Test Et:**
- Login çalışıyor mu?
- Ürünler yükleniyor mu?
- Resimler görünüyor mu?
- WhatsApp link çalışıyor mu?

---

## 🚨 SORUN GİDERME

### Sorun 1: DNS yayılmadı

**Belirti:** `nslookup api.halkompleksi.com` hata veriyor

**Çözüm:**
```bash
# Daha fazla bekleyin (30-60 dakika)
# Natro DNS'lerini kontrol edin:
# ns1.natro.com
# ns2.natro.com

# Flush DNS cache (Mac)
sudo dscacheutil -flushcache

# Flush DNS cache (Windows)
ipconfig /flushdns

# Flush DNS cache (Linux)
sudo systemd-resolve --flush-caches
```

### Sorun 2: Certbot "domain not pointing" hatası

**Belirti:** Certbot domain'in IP'ye işaret etmediğini söylüyor

**Çözüm:**
```bash
# DNS tam yayılmamış, bekleyin
# Yayılmayı kontrol et:
dig api.halkompleksi.com

# Yayılmışsa force renewal deneyin:
certbot --nginx -d api.halkompleksi.com --force-renewal
```

### Sorun 3: "502 Bad Gateway"

**Belirti:** Tarayıcıda 502 hatası

**Çözüm:**
```bash
# Backend çalışıyor mu?
pm2 status

# Backend log kontrol
pm2 logs hal-kompleksi

# Backend yeniden başlat
pm2 restart hal-kompleksi

# Nginx log kontrol
tail -f /var/log/nginx/error.log
```

### Sorun 4: "ERR_CERT_AUTHORITY_INVALID"

**Belirti:** SSL sertifikası geçersiz hatası

**Çözüm:**
```bash
# Sertifika dosyalarını kontrol et
ls -la /etc/letsencrypt/live/api.halkompleksi.com/

# Sertifikayı yeniden al
certbot --nginx -d api.halkompleksi.com --force-renewal

# Nginx restart
systemctl restart nginx
```

### Sorun 5: Resimler yüklenmiyor

**Belirti:** API çalışıyor ama resimler 404

**Çözüm:**
```bash
# Uploads dizini var mı?
ls -la /var/www/hal-kompleksi/uploads/

# Yoksa oluştur ve yetki ver
mkdir -p /var/www/hal-kompleksi/uploads
chmod -R 755 /var/www/hal-kompleksi/uploads

# Backend uploads dizinini kopyala
cp -r /path/to/backend/uploads/* /var/www/hal-kompleksi/uploads/

# Nginx config'te path doğru mu kontrol et
```

### Sorun 6: CORS hatası

**Belirti:** Browser console'da CORS error

**Çözüm:**

Backend `.env`:
```bash
CORS_ORIGIN=https://api.halkompleksi.com,https://halkompleksi.com
```

Backend `server.js`:
```javascript
app.use(cors({
  origin: [
    'https://api.halkompleksi.com',
    'https://halkompleksi.com',
    'https://www.halkompleksi.com'
  ],
  credentials: true
}));
```

Nginx config'e CORS header ekle (yukarıda var).

---

## 📊 KONTROL LİSTESİ

### Natro (Domain)
- [ ] Natro paneline giriş yapıldı
- [ ] DNS yönetimine gidildi
- [ ] A kaydı eklendi (api → 109.199.114.223)
- [ ] Kayıt kaydedildi
- [ ] DNS yayılması kontrol edildi (nslookup)

### Contabo (Server)
- [ ] SSH ile bağlanıldı
- [ ] Certbot kuruldu
- [ ] SSL sertifikası alındı
- [ ] Nginx yapılandırıldı
- [ ] Nginx test edildi (nginx -t)
- [ ] Nginx yeniden başlatıldı
- [ ] Backend .env güncellendi
- [ ] Backend yeniden başlatıldı

### Frontend (React Native)
- [ ] env.ts HTTPS URL'e güncellendi
- [ ] Info.plist HTTP exception kaldırıldı
- [ ] Cache temizlendi
- [ ] Uygulama test edildi

### Test
- [ ] Tarayıcıdan HTTPS çalışıyor
- [ ] curl test başarılı
- [ ] SSL Labs A+ rating aldı
- [ ] Mobil uygulamada API çalışıyor
- [ ] Resimler yükleniyor
- [ ] WhatsApp link çalışıyor

---

## 🎉 BAŞARILI KURULUM

Tüm adımları tamamladıysanız:

✅ **Domain:** https://api.halkompleksi.com  
✅ **SSL:** Let's Encrypt (A+ rating)  
✅ **Backend:** Contabo VPS (109.199.114.223)  
✅ **Frontend:** HTTPS üzerinden bağlanıyor  
✅ **Apple:** App Store'a yüklemeye hazır!

---

## 📞 DESTEK

### Natro Destek
- **Web:** https://www.natro.com/destek
- **Tel:** 0850 282 0505
- **Mail:** destek@natro.com

### Contabo Destek
- **Web:** https://contabo.com/support/
- **Ticket:** https://my.contabo.com/

---

## 💡 EK İPUÇLARI

### 1. Multiple Domain (Alt Domain) Eklemeleri

Gelecekte başka subdomain'ler eklemek isterseniz:

**Natro'da:**
```
A    blog     109.199.114.223    3600
A    cdn      109.199.114.223    3600
A    admin    109.199.114.223    3600
```

**Contabo'da:**
```bash
certbot --nginx -d api.halkompleksi.com -d blog.halkompleksi.com -d cdn.halkompleksi.com
```

### 2. WWW Redirect

www'lu versiyonu www'suz versiyona yönlendirmek için:

**Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name www.halkompleksi.com;
    return 301 https://halkompleksi.com$request_uri;
}
```

### 3. Performans İyileştirme

```bash
# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 4. Güvenlik İyileştirme

```bash
# Fail2ban kur (brute force koruması)
apt-get install fail2ban -y

# UFW firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### 5. Monitoring

```bash
# Certbot sertifika durumu
certbot certificates

# Nginx access log
tail -f /var/log/nginx/access.log

# Backend logs
pm2 logs hal-kompleksi --lines 100
```

---

## ⏱️ TAHMINI SÜRELER

| Adım | Süre |
|------|------|
| Natro DNS ayarları | 5 dakika |
| DNS yayılması | 15-60 dakika |
| Contabo SSL kurulumu | 15 dakika |
| Nginx yapılandırma | 10 dakika |
| Frontend güncelleme | 5 dakika |
| Test | 10 dakika |
| **TOPLAM** | **1-2 saat** |

---

## 🚀 SONRAKİ ADIM

SSL kurulumundan sonra:
1. `APPSTORE_CHECKLIST.md` dosyasına dönün
2. Diğer App Store gereksinimlerini tamamlayın
3. EAS build alın
4. TestFlight'a gönderin

**Başarılar!** 🎉

