# Backend Bağlantı Sorun Giderme

## Health Endpoint Kontrolü

Backend health endpoint'i: `/api/health`

### Test Komutları

```bash
# Production sunucu
curl https://halkompleksi.com/api/health

# Local development
curl http://localhost:5001/api/health
```

### Beklenen Yanıt

```json
{
  "status": "OK",
  "message": "Hal Kompleksi API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Backend Durum Kontrolü

### 1. Backend Çalışıyor mu?

```bash
cd backend

# PM2 ile kontrol
pm2 status

# PM2 log'ları
pm2 logs hal-kompleksi-backend

# Docker ile kontrol
docker ps
docker logs hal-kompleksi-api
```

### 2. Backend'i Başlatma

```bash
cd backend

# PM2 ile
pm2 start ecosystem.config.js

# veya direkt
npm start

# Docker ile
docker-compose up -d
```

### 3. Nginx Kontrolü

```bash
# Nginx durumu
sudo systemctl status nginx

# Nginx log'ları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Nginx yeniden başlatma
sudo systemctl restart nginx
```

### 4. Port Kontrolü

```bash
# 5001 portunu kullanan process
lsof -i :5001

# veya
netstat -tulpn | grep 5001
```

## Yaygın Sorunlar

### 1. "Connection refused"
- Backend çalışmıyor
- Yanlış port kullanılıyor
- Firewall engelliyor

### 2. "Timeout"
- Backend yavaş yanıt veriyor
- Network sorunu
- Backend overload

### 3. "404 Not Found"
- Health endpoint yanlış
- Nginx routing sorunu
- Backend route tanımlı değil

### 4. "502 Bad Gateway"
- Backend çalışmıyor
- Nginx backend'e ulaşamıyor
- Port uyumsuzluğu

## Nginx Konfigürasyonu

Nginx'te `/api/health` endpoint'i için doğru proxy ayarları:

```nginx
location /api/health {
    proxy_pass http://api/api/health;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Hızlı Test Script

```bash
#!/bin/bash
echo "Testing backend connection..."

# Production
echo "Testing production..."
curl -f https://halkompleksi.com/api/health && echo "✅ Production OK" || echo "❌ Production FAILED"

# Local
echo "Testing local..."
curl -f http://localhost:5001/api/health && echo "✅ Local OK" || echo "❌ Local FAILED"
```



