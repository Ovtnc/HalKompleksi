# Sunucuda CORS Güncelleme Adımları

Backend dizini: `/var/www/hal-kompleksi/backend`

## 1. Backend Dizinine Gidin

```bash
cd /var/www/hal-kompleksi/backend
```

## 2. CORS Ayarlarını Güncelleyin

`src/server.js` dosyasını düzenleyin:

```bash
nano src/server.js
```

Veya:

```bash
vi src/server.js
```

## 3. CORS Bölümünü Bulun ve Güncelleyin

Şu satırları bulun (yaklaşık 96-123. satırlar):

```javascript
// CORS configuration - Development'ta tüm originlere izin ver
app.use(cors({
  origin: urlConfig.IS_DEVELOPMENT ? '*' : [
    urlConfig.FRONTEND_URL,
    urlConfig.WEB_URL,
    'http://localhost:3000', // Vite web app
    // ... diğer portlar
  ],
```

Şunu ekleyin:

```javascript
// CORS configuration - Development'ta tüm originlere izin ver
app.use(cors({
  origin: urlConfig.IS_DEVELOPMENT ? '*' : [
    urlConfig.FRONTEND_URL,
    urlConfig.WEB_URL,
    'http://localhost:3000', // Vite web app (default)
    'http://localhost:3001', // Vite web app (alternative)
    'http://localhost:3002', // Vite web app (alternative)
    'http://localhost:3003', // Vite web app (alternative)
    'http://localhost:8081', 
    'http://localhost:8088', 
    'http://192.168.0.27:8081', 
    'http://192.168.0.27:8088', 
    'http://localhost:5001',
    'http://192.168.0.27:5001',
    'http://192.168.1.109:8081',
    'http://192.168.1.109:8082',
    'http://109.199.114.223:8081',
    'http://109.199.114.223:8088',
    'http://109.199.114.223:5001',
    'https://halkompleksi.com', // Production web
    'https://www.halkompleksi.com', // Production web (www)
    'exp://192.168.0.27:8081',
    'exp://192.168.1.109:8081',
    'exp://192.168.1.109:8082',
    'exp://109.199.114.223:8081',
    'exp://109.199.114.223:8088'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
}));
```

## 4. Dosyayı Kaydedin ve Çıkın

- Nano: `Ctrl+O` (kaydet), `Enter`, `Ctrl+X` (çık)
- Vi: `:wq` (kaydet ve çık)

## 5. Backend'i Yeniden Başlatın

```bash
pm2 restart hal-kompleksi-backend
```

## 6. Log'ları Kontrol Edin

```bash
pm2 logs hal-kompleksi-backend --lines 50
```

## 7. Health Check

```bash
curl https://halkompleksi.com/api/health
```

## Alternatif: Dosyayı Doğrudan Kopyalama

Eğer local'deki dosyayı sunucuya kopyalamak isterseniz:

```bash
# Local makineden (Mac'inizden)
scp backend/src/server.js root@109.199.114.223:/var/www/hal-kompleksi/backend/src/server.js

# Sonra sunucuda restart
ssh root@109.199.114.223
cd /var/www/hal-kompleksi/backend
pm2 restart hal-kompleksi-backend
```



