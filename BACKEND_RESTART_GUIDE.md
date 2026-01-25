# Backend Yeniden Başlatma Rehberi

## Hızlı Restart

Backend zaten PM2'de çalışıyor. CORS değişikliklerinin aktif olması için yeniden başlatın:

```bash
# 1. Backend dizinine gidin
cd /root/backend
# veya
cd ~/backend
# veya backend'in bulunduğu dizin

# 2. PM2 ile restart
pm2 restart hal-kompleksi-backend

# 3. Durum kontrolü
pm2 status

# 4. Log'ları kontrol edin
pm2 logs hal-kompleksi-backend --lines 50
```

## Backend Dizini Bulma

Eğer backend dizinini bulamıyorsanız:

```bash
# PM2 process'lerinin çalıştığı dizini bulun
pm2 describe hal-kompleksi-backend | grep "script path"

# veya
pm2 info hal-kompleksi-backend
```

## Health Check

Backend'in çalıştığını test edin:

```bash
# Production
curl https://halkompleksi.com/api/health

# Beklenen yanıt:
# {"status":"OK","message":"Hal Kompleksi API is running","timestamp":"..."}
```

## CORS Kontrolü

CORS ayarlarının aktif olduğunu kontrol etmek için:

```bash
# Browser console'da test edin veya:
curl -H "Origin: http://localhost:3002" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://halkompleksi.com/api/health -v
```

## Sorun Giderme

### PM2 process bulunamıyor

```bash
# Tüm PM2 process'lerini listeleyin
pm2 list

# Eğer backend yoksa, başlatın
cd /root/backend  # veya backend dizininiz
pm2 start ecosystem.config.js
```

### Backend çalışmıyor

```bash
# Log'ları kontrol edin
pm2 logs hal-kompleksi-backend --err

# Manuel başlatma
cd /root/backend
node src/server.js
```

### Port çakışması

```bash
# 5001 portunu kullanan process
lsof -i :5001

# Process'i sonlandırın
kill -9 <PID>
```

## Otomatik Restart Script

```bash
#!/bin/bash
cd /root/backend
pm2 restart hal-kompleksi-backend
pm2 status
```

Script'i çalıştırılabilir yapın:
```bash
chmod +x restart-backend.sh
./restart-backend.sh
```



