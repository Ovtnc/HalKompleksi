# Trust Proxy Düzeltmesi

Backend log'larında `trust proxy` hatası var. Bu, Nginx reverse proxy arkasında çalışırken gerekli bir ayar.

## Sunucuda Düzeltme

### 1. Backend Dizinine Gidin

```bash
cd /var/www/hal-kompleksi/backend
```

### 2. Dosyayı Düzenleyin

```bash
nano src/server.js
```

### 3. Trust Proxy Ayarını Ekleyin

Şu satırları bulun (yaklaşık 24-28. satırlar):

```javascript
const app = express();
const PORT = urlConfig.PORT;

// Connect to MongoDB
connectDB();
```

Şunu ekleyin:

```javascript
const app = express();
const PORT = urlConfig.PORT;

// Trust proxy - Nginx reverse proxy için gerekli
app.set('trust proxy', true);

// Connect to MongoDB
connectDB();
```

### 4. Dosyayı Kaydedin ve Çıkın

- Nano: `Ctrl+O` (kaydet), `Enter`, `Ctrl+X` (çık)

### 5. Backend'i Yeniden Başlatın

```bash
pm2 restart hal-kompleksi-backend
```

### 6. Log'ları Kontrol Edin

```bash
pm2 logs hal-kompleksi-backend --lines 20
```

Artık `trust proxy` hatası görünmemeli.

## Alternatif: Dosyayı Local'den Kopyalama

Mac'inizden:

```bash
scp backend/src/server.js root@109.199.114.223:/var/www/hal-kompleksi/backend/src/server.js
```

Sonra sunucuda:

```bash
cd /var/www/hal-kompleksi/backend
pm2 restart hal-kompleksi-backend
```



