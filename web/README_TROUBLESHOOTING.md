# Sorun Giderme Rehberi

## "Sunucuya bağlanılamıyor" Hatası

Bu hata, web uygulamasının backend API'ye bağlanamadığı anlamına gelir.

### 1. Backend'in Çalıştığını Kontrol Edin

```bash
# Backend klasörüne gidin
cd backend

# Backend çalışıyor mu kontrol edin
curl http://localhost:5001/api/health

# veya production için:
curl https://halkompleksi.com/api/health
```

### 2. Backend'i Başlatın (Eğer Çalışmıyorsa)

```bash
cd backend

# Development için:
npm start

# veya PM2 ile:
pm2 start ecosystem.config.js

# veya Docker ile:
docker-compose up -d
```

### 3. API URL'ini Kontrol Edin

Web uygulaması otomatik olarak:
- **Development**: `http://localhost:5001/api` kullanır
- **Production**: `https://halkompleksi.com/api` kullanır

Manuel olarak değiştirmek için `.env` dosyası oluşturun:

```bash
cd web
echo "VITE_API_BASE_URL=http://localhost:5001/api" > .env
echo "VITE_WEB_BASE_URL=http://localhost:5001" >> .env
```

Sonra uygulamayı yeniden başlatın:
```bash
npm run dev
```

### 4. CORS Sorununu Kontrol Edin

Backend'in `src/server.js` dosyasında CORS ayarlarını kontrol edin. `localhost:3000` (Vite default port) listede olmalı.

### 5. Browser Console'u Kontrol Edin

1. F12 tuşuna basın (Developer Tools)
2. Console sekmesine gidin
3. Hata mesajlarını kontrol edin
4. Network sekmesinde API isteklerini kontrol edin

### 6. Port Çakışması

Eğer başka bir uygulama 5001 portunu kullanıyorsa:

```bash
# Port kullanımını kontrol edin
lsof -i :5001

# veya
netstat -an | grep 5001
```

### 7. Firewall Kontrolü

Firewall'un 5001 portunu engellemediğinden emin olun.

### 8. API Status Widget

Development modunda, sağ alt köşede API bağlantı durumu gösterilir. Bu widget:
- ✅ Yeşil: Backend'e bağlanıldı
- ❌ Kırmızı: Backend'e bağlanılamıyor

"Tekrar Dene" butonuna tıklayarak bağlantıyı test edebilirsiniz.

## Yaygın Hatalar ve Çözümleri

### "Failed to fetch"
- Backend çalışmıyor olabilir
- API URL yanlış olabilir
- CORS sorunu olabilir

### "Network Error"
- İnternet bağlantısını kontrol edin
- Backend sunucusunun erişilebilir olduğundan emin olun

### "CORS policy"
- Backend CORS ayarlarını kontrol edin
- `localhost:3000` CORS listesinde olmalı

## Hızlı Test

Backend'in çalıştığını test etmek için:

```bash
# Health check
curl http://localhost:5001/api/health

# Products listesi
curl http://localhost:5001/api/products

# Categories
curl http://localhost:5001/api/products/categories
```

Başarılı yanıt alırsanız backend çalışıyor demektir.



