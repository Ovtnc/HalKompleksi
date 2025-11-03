# SSL Kurulumu - Backend IP + Ayrı Domain

## Senaryo
- Backend: 109.199.114.223 (VPS/Sunucu)
- Domain: halkompleksi.com (başka bir provider'da)
- Hedef: https://api.halkompleksi.com → 109.199.114.223:5001

---

## ✅ ÇÖZÜM 1: Domain'i Backend IP'sine Yönlendir (ÖNERİLEN)

### Adım 1: DNS A Record Ekle

Domain sağlayıcınızın (GoDaddy, Namecheap, vb.) panelinden:

```
Type: A Record
Name: api (veya @)
Value: 109.199.114.223
TTL: 3600 (1 saat)
```

**Örnek DNS Ayarları:**
```
api.halkompleksi.com    A    109.199.114.223
```

**Veya root domain için:**
```
halkompleksi.com        A    109.199.114.223
www.halkompleksi.com    A    109.199.114.223
```

⏰ **Not:** DNS yayılması 5 dakika - 24 saat sürebilir.

**Test et:**
```bash
# DNS yayılmasını kontrol et
nslookup api.halkompleksi.com
# Çıktı: 109.199.114.223 görmeli

ping api.halkompleksi.com
# Çıktı: 109.199.114.223'e ping atmalı
```

---

### Adım 2: Sunucuda SSL Kurulumu

```bash
# Sunucuya bağlan
ssh root@109.199.114.223

# Certbot kur
apt-get update
apt-get install certbot python3-certbot-nginx -y

# SSL sertifikası al (domain için)
certbot --nginx -d api.halkompleksi.com

# Veya birden fazla domain için
certbot --nginx -d api.halkompleksi.com -d halkompleksi.com -d www.halkompleksi.com

# Otomatik yenileme test et
certbot renew --dry-run
```

**Certbot soru soracak:**
```
Email: sizin-email@example.com
Terms of Service: (A)gree
Share email: (N)o
```

---

### Adım 3: Nginx Yapılandırması

Certbot otomatik yapılandırır ama kontrol edin:

```bash
nano /etc/nginx/sites-available/default
```

**Örnek Nginx Config:**
```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name api.halkompleksi.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name api.halkompleksi.com;

    # SSL sertifikaları (certbot otomatik ekler)
    ssl_certificate /etc/letsencrypt/live/api.halkompleksi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.halkompleksi.com/privkey.pem;
    
    # SSL ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Backend'e proxy
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
    }

    # Static files
    location /uploads/ {
        alias /var/www/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Nginx'i yeniden başlat:**
```bash
nginx -t  # Config test
systemctl restart nginx
```

---

### Adım 4: Frontend'i Güncelle

`HalKompleksi/src/config/env.ts`:
```typescript
export const ENV = {
  API_BASE_URL: getEnvValue('API_BASE_URL', 'https://api.halkompleksi.com/api'),
  // ...
};
```

`HalKompleksi/ios/HalKompleksi/Info.plist`:
```xml
<!-- NSExceptionDomains bölümünü KALDIR -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

---

### Adım 5: Test

```bash
# SSL test
curl https://api.halkompleksi.com/api/products

# SSL sertifikası kontrol
openssl s_client -connect api.halkompleksi.com:443 -servername api.halkompleksi.com

# SSL Labs test (tarayıcıda)
# https://www.ssllabs.com/ssltest/analyze.html?d=api.halkompleksi.com
```

---

## 🔄 ÇÖZÜM 2: Cloudflare Proxy (Kolay ama Dikkatli)

**Avantajlar:**
- Çok hızlı kurulum (5 dakika)
- Ücretsiz SSL
- DDoS koruması
- CDN

**Dezavantajlar:**
- API endpoint'leri için önerilmez
- Request limitleri olabilir
- Cloudflare üzerinden geçer (privacy concern)

### Kurulum:

1. **Cloudflare'e domain ekle:**
   - cloudflare.com → Add Site
   - halkompleksi.com ekle
   - Nameserver'ları değiştir

2. **DNS ayarları:**
   ```
   Type: A
   Name: api
   Content: 109.199.114.223
   Proxy: ✅ ON (turuncu bulut)
   ```

3. **SSL/TLS ayarları:**
   - SSL/TLS → Full (strict)
   - Edge Certificates → Always Use HTTPS: ON

4. **API güvenliği (önemli!):**
   - Firewall Rules ekle
   - Origin server IP'sini koruma

**Frontend:**
```typescript
API_BASE_URL: 'https://api.halkompleksi.com/api'
```

---

## 🆓 ÇÖZÜM 3: ZeroSSL veya Self-Signed (Test İçin)

### ZeroSSL (Let's Encrypt alternatifi):

```bash
# Acme.sh kur
curl https://get.acme.sh | sh
source ~/.bashrc

# ZeroSSL ile sertifika al
acme.sh --register-account -m sizin-email@example.com
acme.sh --issue --nginx -d api.halkompleksi.com
acme.sh --install-cert -d api.halkompleksi.com \
  --cert-file /etc/nginx/ssl/cert.pem \
  --key-file /etc/nginx/ssl/key.pem \
  --fullchain-file /etc/nginx/ssl/fullchain.pem \
  --reloadcmd "systemctl reload nginx"
```

---

## 🚨 ÇÖZÜM 4: IP için Self-Signed SSL (Apple Reddeder!)

**SADECE TEST İÇİN! App Store için kullanmayın!**

```bash
# Self-signed sertifika oluştur
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/selfsigned.key \
  -out /etc/nginx/ssl/selfsigned.crt \
  -subj "/CN=109.199.114.223"

# Nginx'e ekle
ssl_certificate /etc/nginx/ssl/selfsigned.crt;
ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
```

❌ **Apple bunu kabul etmez!** Production'da kullanmayın.

---

## 📊 KARŞILAŞTIRMA

| Çözüm | Süre | Güvenlik | Apple | Zorluk | Maliyet |
|-------|------|----------|-------|--------|---------|
| Domain + Let's Encrypt | 1-2 saat | ⭐⭐⭐⭐⭐ | ✅ | Kolay | Ücretsiz |
| Cloudflare | 30 dakika | ⭐⭐⭐⭐ | ✅ | Çok Kolay | Ücretsiz |
| ZeroSSL | 1 saat | ⭐⭐⭐⭐⭐ | ✅ | Orta | Ücretsiz |
| Self-Signed | 10 dakika | ⭐⭐ | ❌ | Kolay | Ücretsiz |

---

## 🎯 TAVSİYE

**En İyi Seçim:** Domain + Let's Encrypt (Çözüm 1)

**Neden:**
- ✅ Apple kabul eder
- ✅ Tam kontrol sizde
- ✅ Ücretsiz
- ✅ Otomatik yenileme
- ✅ Performans kaybı yok
- ✅ Privacy korumalı

**Hızlı Seçim:** Cloudflare (Çözüm 2)
- Çok hızlı kurulum
- Ama API için optimal değil

---

## 🔧 HANGİ DOMAIN KULLANILMALI?

### Seçenek 1: Subdomain (Önerilen)
```
Ana Site: https://halkompleksi.com
API: https://api.halkompleksi.com
Resimler: https://cdn.halkompleksi.com
```

### Seçenek 2: Root Domain
```
Ana Site + API: https://halkompleksi.com/api
```

**Önerilen:** Subdomain (api.halkompleksi.com) - Daha profesyonel

---

## 📝 ADIM ADIM KURULUM

### 1. DNS Ayarları (Domain Provider)
```
A Record: api → 109.199.114.223
```
⏰ Bekleme: 5-60 dakika

### 2. DNS Yayılmasını Bekle
```bash
nslookup api.halkompleksi.com
```

### 3. SSL Kur
```bash
ssh root@109.199.114.223
certbot --nginx -d api.halkompleksi.com
```

### 4. Nginx Ayarla
```bash
nginx -t && systemctl restart nginx
```

### 5. Test Et
```bash
curl https://api.halkompleksi.com/api/products
```

### 6. Frontend Güncelle
```typescript
API_BASE_URL: 'https://api.halkompleksi.com/api'
```

### 7. Info.plist Temizle
HTTP exception'ı kaldır

### 8. Build & Test
```bash
eas build --platform ios --profile production
```

---

## ❓ SIKÇA SORULAN SORULAR

### Q: Domain'im başka firmada, backend başka sunucuda. Sorun olur mu?
**A:** Hayır, sadece DNS A record ekleyerek domain'i IP'ye yönlendirin.

### Q: DNS yayılması ne kadar sürer?
**A:** 5 dakika ile 48 saat arası. Genelde 1-2 saat.

### Q: Let's Encrypt ücretsiz mi?
**A:** Evet, tamamen ücretsiz ve otomatik yenilenir.

### Q: Cloudflare kullanmalı mıyım?
**A:** Web siteleri için harika, API'ler için dikkatli kullanın.

### Q: SSL sertifikası ne kadar geçerli?
**A:** Let's Encrypt 90 gün, otomatik yenilenir.

### Q: IP değişirse ne olur?
**A:** DNS A record'u yeni IP ile güncelleyin, SSL aynı kalır.

---

## 🆘 SORUN GİDERME

### Certbot "domain not pointing to this IP" hatası
```bash
# DNS yayılmasını kontrol et
dig api.halkompleksi.com

# Yayılmadıysa bekle, yayılmışsa:
certbot --nginx -d api.halkompleksi.com --force-renewal
```

### Nginx "Unable to find certificate" hatası
```bash
# Sertifikaları kontrol et
ls -la /etc/letsencrypt/live/api.halkompleksi.com/

# Yeniden oluştur
certbot --nginx -d api.halkompleksi.com --force-renewal
```

### "ERR_CERT_AUTHORITY_INVALID" hatası
- Self-signed kullanıyorsanız: Let's Encrypt'e geçin
- Domain yanlışsa: DNS kontrol et

### Mobil uygulamada "Network Error"
```typescript
// env.ts doğru mu kontrol et
console.log(ENV.API_BASE_URL); // https:// olmalı

// Info.plist NSExceptionDomains kaldırıldı mı kontrol et
```

---

## ✅ BAŞARILI KURULUM KONTROLÜx

- [ ] DNS A record eklendi
- [ ] DNS yayılması tamamlandı (nslookup test)
- [ ] SSL sertifikası kuruldu
- [ ] HTTPS çalışıyor (curl test)
- [ ] Nginx yapılandırıldı
- [ ] Frontend URL güncellendi
- [ ] Info.plist temizlendi
- [ ] SSL Labs test A+ aldı
- [ ] Mobil uygulamada test edildi
- [ ] Resim upload test edildi
- [ ] WhatsApp link test edildi

---

## 🎉 SONUÇ

Domain + Let's Encrypt kombinasyonu en güvenilir ve Apple'ın tercih ettiği yöntemdir. 

**Tahmini Süre:** 1-2 saat (DNS yayılması dahil)

**Maliyet:** Ücretsiz 🆓

**Zorluk:** Kolay 👍

Sorularınız varsa yardımcı olabilirim! 🚀

