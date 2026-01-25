# Deployment Guide for app.ssgile.com

Bu rehber, web uygulamasını `app.ssgile.com` subdomain'ine deploy etmek için adımları içerir.

## Ön Gereksinimler

1. **Sunucu Erişimi**: SSH ile sunucuya erişim
2. **Nginx**: Sunucuda nginx kurulu olmalı
3. **Node.js**: Build için Node.js 18+ gerekli
4. **SSL Sertifikası**: Let's Encrypt (certbot) kurulu olmalı

## Deployment Adımları

### 1. Sunucuya Bağlanın

```bash
ssh kullanici@sunucu-ip
```

### 2. Projeyi Sunucuya Kopyalayın

```bash
# Local makineden
scp -r /Users/okanvatanci/Desktop/hal-kompleksi/web kullanici@sunucu-ip:/opt/hal-kompleksi/
```

### 3. Deployment Script'ini Çalıştırın

```bash
cd /opt/hal-kompleksi/web
sudo ./deploy-ssgile.sh
```

### 4. DNS Ayarları

DNS panelinizde (Natro, Cloudflare vb.) şu kaydı ekleyin:

```
Type: A
Name: app
Value: [Sunucu IP Adresiniz]
TTL: 3600
```

### 5. SSL Sertifikası Kurulumu

```bash
sudo certbot --nginx -d app.ssgile.com
```

Certbot otomatik olarak nginx yapılandırmasını güncelleyecektir.

### 6. Nginx'i Yeniden Başlatın

```bash
sudo systemctl reload nginx
```

## Manuel Deployment

Eğer script kullanmak istemiyorsanız:

### 1. Build

```bash
cd web
npm ci
npm run build
```

### 2. Dosyaları Kopyala

```bash
sudo mkdir -p /var/www/app.ssgile.com
sudo cp -r dist/* /var/www/app.ssgile.com/
sudo chown -R www-data:www-data /var/www/app.ssgile.com
```

### 3. Nginx Yapılandırması

`/etc/nginx/sites-available/app.ssgile.com` dosyasını oluşturun (script otomatik oluşturur).

### 4. Site'ı Aktifleştir

```bash
sudo ln -s /etc/nginx/sites-available/app.ssgile.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Güncelleme

Uygulamayı güncellemek için:

```bash
cd /opt/hal-kompleksi/web
git pull  # Eğer git kullanıyorsanız
sudo ./deploy-ssgile.sh
```

## Sorun Giderme

### Nginx Test Hatası

```bash
sudo nginx -t
```

Hataları kontrol edin ve düzeltin.

### Dosya İzinleri

```bash
sudo chown -R www-data:www-data /var/www/app.ssgile.com
sudo chmod -R 755 /var/www/app.ssgile.com
```

### Log Kontrolü

```bash
# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log
```

### SSL Sertifika Yenileme

```bash
sudo certbot renew --dry-run
```

## Yedekleme

Script otomatik olarak yedek oluşturur:
- Yedekler: `/var/www/backups/app.ssgile.com/`
- Format: `backup-YYYYMMDD-HHMMSS`

## API Yapılandırması

Web uygulaması API'ye `https://halkompleksi.com/api` üzerinden bağlanır. 
Eğer farklı bir API URL'i kullanmak isterseniz:

1. `.env.production` dosyası oluşturun:
```bash
VITE_API_BASE_URL=https://api.ssgile.com/api
```

2. Build sırasında bu değişken kullanılacaktır.

## Performans Optimizasyonu

- Gzip compression aktif
- Static asset caching (1 yıl)
- SPA routing için try_files kullanılıyor

## Güvenlik

- SSL/TLS zorunlu
- Security headers eklendi
- XSS ve clickjacking koruması

