# 🔧 "HOST ERROR" HATASI ÇÖZÜMÜ

## 📋 Hata Analizi

**Durum:**
- ✅ Tarayıcı çalışıyor
- ✅ Cloudflare çalışıyor
- ❌ Sunucuda "Host Error"

**Muhtemel Sebepler:**
1. Nginx Host header problemi
2. Backend server çalışmıyor
3. Port kapalı
4. Proxy ayarları yanlış

---

## 🚀 HIZLI ÇÖZÜM (5 dakika)

### ADIM 1: Backend Çalışıyor mu Kontrol Et

```bash
# SSH ile bağlan
ssh root@109.199.114.223

# PM2 status kontrol et
pm2 status

# Backend loglarına bak
pm2 logs hal-kompleksi --lines 50
```

**Beklenen Sonuç:**
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ mode    │ status  │ cpu      │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ hal-kompleksi    │ fork    │ online  │ 0%       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

**Eğer "stopped" ise:**
```bash
pm2 restart hal-kompleksi
```

---

### ADIM 2: Nginx Config Düzelt

```bash
# Nginx config dosyasını aç
sudo nano /etc/nginx/sites-available/hal-kompleksi
```

**DOĞRU CONFIG (Kopyala-yapıştır):**

```nginx
server {
    listen 80;
    server_name halkompleksi.com www.halkompleksi.com;

    # Cloudflare'den gelen gerçek IP'yi al
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

    # Client body size artır (video için)
    client_max_body_size 50M;

    # Timeout artır
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;

    # API endpoint
    location /api {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        
        # Host header'ları düzelt
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        
        # WebSocket için
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Cache ayarları
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # Static files - Uploads
    location /uploads {
        alias /root/hal-kompleksi/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # Health check
    location /api/health {
        proxy_pass http://127.0.0.1:5001/api/health;
        proxy_set_header Host $host;
        access_log off;
    }

    # Root - Frontend veya API
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }

    # Logging
    access_log /var/log/nginx/hal-kompleksi.access.log;
    error_log /var/log/nginx/hal-kompleksi.error.log warn;
}
```

**Kaydet:** `Ctrl+X`, `Y`, `Enter`

---

### ADIM 3: Nginx Test ve Restart

```bash
# Config test et
sudo nginx -t

# Beklenen sonuç:
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Eğer hata varsa:**
```bash
# Syntax hatası gösterecek, satır numarasını kontrol et
```

**Hata yoksa restart et:**
```bash
sudo systemctl restart nginx
```

---

### ADIM 4: Port ve Firewall Kontrol

```bash
# Backend portu dinliyor mu?
sudo netstat -tulpn | grep :5001

# Beklenen sonuç:
# tcp  0  0  127.0.0.1:5001  0.0.0.0:*  LISTEN  12345/node

# Firewall durumu
sudo ufw status

# Port 80 açık mı kontrol et
```

**Port 80 açık değilse:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

### ADIM 5: Backend Server Kontrol

```bash
# Backend klasörüne git
cd /root/hal-kompleksi/backend

# Manuel test et
node src/server.js
```

**Çıktı görmeli:**
```
============================================
🚀 Hal Kompleksi API
============================================
📍 Server: http://0.0.0.0:5001
🌐 API URL: http://109.199.114.223:5001/api
...
```

**Çalışıyorsa `Ctrl+C` ile durdur ve PM2 ile başlat:**
```bash
pm2 restart hal-kompleksi
```

---

## 🔍 LOG KONTROLÜ

### Nginx Error Logları
```bash
sudo tail -f /var/log/nginx/error.log
```

**Yaygın Hatalar:**

#### "upstream prematurely closed connection"
**Çözüm:** Backend çalışmıyor
```bash
pm2 restart hal-kompleksi
```

#### "no live upstreams"
**Çözüm:** Port 5001 dinlenmiyor
```bash
sudo netstat -tulpn | grep :5001
```

#### "could not be resolved"
**Çözüm:** Host name yanlış
- Nginx config'te `127.0.0.1` kullan `localhost` yerine

---

### Backend Logları
```bash
pm2 logs hal-kompleksi --lines 100
```

**Dikkat edilecek hatalar:**
- MongoDB bağlantı hatası
- Port already in use
- EADDRINUSE error

---

## 🧪 TEST ET

### 1. Localhost Test
```bash
# Sunucuda, backend'e direkt eriş
curl http://localhost:5001/api/health

# Beklenen sonuç:
# {"status":"OK","timestamp":"..."}
```

### 2. External Test
```bash
# Kendi bilgisayarından
curl http://109.199.114.223/api/health

# Veya tarayıcıda
# http://109.199.114.223/api/health
```

### 3. Domain Test
```bash
# Domain üzerinden
curl https://halkompleksi.com/api/health

# Tarayıcıda
# https://halkompleksi.com/api/health
```

---

## 🚨 ÖZELLİKLE KONTROL ET

### Backend Server Ayarları

`backend/src/server.js` dosyasında:

```javascript
// Port binding - 0.0.0.0 olmalı!
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Sadece localhost değil!
// ❌ YANLIŞ: app.listen(PORT, 'localhost', ...)
// ✅ DOĞRU: app.listen(PORT, '0.0.0.0', ...)
```

**Düzelt ve restart:**
```bash
pm2 restart hal-kompleksi
```

---

### CORS Ayarları

`backend/src/server.js` içinde:

```javascript
app.use(cors({
  origin: '*',  // Geliştirme için hepsine izin ver
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 💡 HIZLI FIX SCRIPT

Tüm adımları otomatik yap:

```bash
# Bu script'i çalıştır
cat > /tmp/fix-host-error.sh << 'EOF'
#!/bin/bash
echo "🔧 Host Error Düzeltme Script"
echo "================================"

echo "1. PM2 Status..."
pm2 status

echo ""
echo "2. Backend yeniden başlatılıyor..."
pm2 restart hal-kompleksi

echo ""
echo "3. Nginx test ediliyor..."
sudo nginx -t

echo ""
echo "4. Nginx restart ediliyor..."
sudo systemctl restart nginx

echo ""
echo "5. Port kontrol ediliyor..."
sudo netstat -tulpn | grep :5001

echo ""
echo "6. Health check test ediliyor..."
sleep 2
curl http://localhost:5001/api/health

echo ""
echo "✅ Tamamlandı!"
echo "Şimdi tarayıcıda test et: https://halkompleksi.com/api/health"
EOF

chmod +x /tmp/fix-host-error.sh
/tmp/fix-host-error.sh
```

---

## 📊 SON KONTROL

Tamamlandıktan sonra:

```bash
# 1. Backend çalışıyor mu?
pm2 status
# ✅ online olmalı

# 2. Port dinliyor mu?
sudo netstat -tulpn | grep :5001
# ✅ LISTEN görmeli

# 3. Nginx çalışıyor mu?
sudo systemctl status nginx
# ✅ active (running) olmalı

# 4. Health check
curl http://localhost:5001/api/health
# ✅ {"status":"OK"} dönmeli

# 5. External access
curl http://109.199.114.223/api/health
# ✅ {"status":"OK"} dönmeli

# 6. Domain ile
curl https://halkompleksi.com/api/health
# ✅ {"status":"OK"} dönmeli
```

---

## 🎯 SORUN DEVAM EDİYORSA

### Detaylı Debug

```bash
# 1. Tüm logları izle
pm2 logs hal-kompleksi &
sudo tail -f /var/log/nginx/error.log &

# 2. Test request at
curl -v https://halkompleksi.com/api/health

# 3. Çıktıyı kontrol et
```

### Cloudflare Ayarları

1. Cloudflare dashboard → **SSL/TLS**
2. Mode: **Flexible** olmalı (başlangıç için)
3. **Edge Certificates** → **Always Use HTTPS** → ON

### Geçici Cloudflare Bypass Test

```bash
# Cloudflare'i bypass ederek direkt sunucuya git
curl -H "Host: halkompleksi.com" http://109.199.114.223/api/health
```

**Çalışıyorsa:** Cloudflare ayarlarında problem var
**Çalışmıyorsa:** Sunucu/Nginx konfigürasyonunda problem var

---

## ✅ BAŞARILI SONUÇ

Herşey çalıştığında:

```bash
curl -I https://halkompleksi.com

# Sonuç:
HTTP/2 200
server: cloudflare
content-type: text/html
...
```

Tarayıcıda:
- ✅ https://halkompleksi.com → Çalışıyor
- ✅ https://halkompleksi.com/api/health → {"status":"OK"}
- ✅ Yeşil kilit 🔒 görünüyor

---

## 📞 DESTEK

Hala çalışmıyorsa, bu bilgileri paylaş:

```bash
# Log çıktılarını topla
echo "=== PM2 Status ===" > debug.txt
pm2 status >> debug.txt
echo "" >> debug.txt

echo "=== PM2 Logs ===" >> debug.txt
pm2 logs hal-kompleksi --lines 50 --nostream >> debug.txt
echo "" >> debug.txt

echo "=== Nginx Error ===" >> debug.txt
sudo tail -100 /var/log/nginx/error.log >> debug.txt
echo "" >> debug.txt

echo "=== Netstat ===" >> debug.txt
sudo netstat -tulpn | grep :5001 >> debug.txt

# Dosyayı göster
cat debug.txt
```

---

**Son Güncelleme:** 2025-11-03

