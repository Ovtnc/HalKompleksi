# Git-based Deployment Guide for app.ssgile.com

Bu rehber, web uygulamasını Git üzerinden `app.ssgile.com` subdomain'ine deploy etmek için adımları içerir.

## Ön Gereksinimler

1. **Sunucu Erişimi**: SSH ile sunucuya erişim
2. **Git**: Sunucuda git kurulu olmalı
3. **Node.js**: Node.js 18+ ve npm kurulu olmalı
4. **Nginx**: Sunucuda nginx kurulu olmalı
5. **SSL Sertifikası**: Let's Encrypt (certbot) kurulu olmalı

## İlk Kurulum (Sadece Bir Kez)

### 1. Sunucuya Bağlanın

```bash
ssh kullanici@sunucu-ip
```

### 2. Deployment Script'ini Sunucuya Kopyalayın

```bash
# Local makineden
scp web/deploy-ssgile-git.sh kullanici@sunucu-ip:/opt/
```

### 3. Script'i Çalıştırılabilir Yapın

```bash
# Sunucuda
sudo chmod +x /opt/deploy-ssgile-git.sh
```

### 4. İlk Deployment

```bash
sudo /opt/deploy-ssgile-git.sh
```

Script otomatik olarak:
- Git repository'yi clone eder (`/opt/hal-kompleksi`)
- Dependencies yükler
- Build yapar
- Nginx yapılandırması oluşturur
- Dosyaları deploy eder

## Güncelleme (Her Değişiklikten Sonra)

### Yöntem 1: Manuel Deployment

```bash
ssh kullanici@sunucu-ip
sudo /opt/deploy-ssgile-git.sh
```

### Yöntem 2: Git Hook ile Otomatik Deployment

Sunucuda webhook veya git hook kurabilirsiniz:

```bash
# Sunucuda
sudo mkdir -p /opt/hal-kompleksi/.git/hooks
sudo nano /opt/hal-kompleksi/.git/hooks/post-receive
```

Hook içeriği:
```bash
#!/bin/bash
cd /opt/hal-kompleksi
git --git-dir=/opt/hal-kompleksi/.git --work-tree=/opt/hal-kompleksi checkout -f
sudo /opt/deploy-ssgile-git.sh
```

### Yöntem 3: GitHub Actions (CI/CD)

`.github/workflows/deploy.yml` dosyası oluşturun:

```yaml
name: Deploy to app.ssgile.com

on:
  push:
    branches: [ main ]
    paths:
      - 'web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            sudo /opt/deploy-ssgile-git.sh
```

## Branch Değiştirme

Farklı bir branch deploy etmek için:

```bash
export GIT_BRANCH=develop
sudo /opt/deploy-ssgile-git.sh
```

## DNS Ayarları

DNS panelinizde (Natro, Cloudflare vb.) şu kaydı ekleyin:

```
Type: A
Name: app
Value: [Sunucu IP Adresiniz]
TTL: 3600
```

## SSL Sertifikası Kurulumu

```bash
sudo certbot --nginx -d app.ssgile.com
```

Certbot otomatik olarak nginx yapılandırmasını güncelleyecektir.

## Yapılandırma

### Environment Variables

Production environment variables için `.env.production` dosyası oluşturun:

```bash
cd /opt/hal-kompleksi/web
sudo nano .env.production
```

İçerik:
```
VITE_API_BASE_URL=https://halkompleksi.com/api
VITE_WEB_BASE_URL=https://app.ssgile.com
```

### Nginx Yapılandırması

Nginx yapılandırması: `/etc/nginx/sites-available/app.ssgile.com`

Manuel düzenleme için:
```bash
sudo nano /etc/nginx/sites-available/app.ssgile.com
sudo nginx -t
sudo systemctl reload nginx
```

## Sorun Giderme

### Git Clone Hatası

```bash
# Repository'yi manuel kontrol edin
cd /opt/hal-kompleksi
git remote -v
git status
```

### Build Hatası

```bash
# Node.js versiyonunu kontrol edin
node -v  # 18+ olmalı
npm -v

# Dependencies'i temizleyip yeniden yükleyin
cd /opt/hal-kompleksi/web
rm -rf node_modules package-lock.json
npm ci
```

### Nginx Test Hatası

```bash
sudo nginx -t
# Hataları kontrol edin ve düzeltin
```

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

# Build log (script çıktısı)
sudo /opt/deploy-ssgile-git.sh 2>&1 | tee /tmp/deploy.log
```

## Yedekleme

Script otomatik olarak yedek oluşturur:
- Yedekler: `/var/www/backups/app.ssgile.com/`
- Format: `backup-YYYYMMDD-HHMMSS`

Yedekten geri yükleme:
```bash
sudo cp -r /var/www/backups/app.ssgile.com/backup-YYYYMMDD-HHMMSS/* /var/www/app.ssgile.com/
sudo chown -R www-data:www-data /var/www/app.ssgile.com
sudo systemctl reload nginx
```

## Performans

- Gzip compression aktif
- Static asset caching (1 yıl)
- SPA routing için try_files kullanılıyor
- Code splitting ve minification

## Güvenlik

- SSL/TLS zorunlu
- Security headers eklendi
- XSS ve clickjacking koruması
- API proxy ile CORS kontrolü

## Otomatik Güncelleme (Cron Job)

Her gün otomatik güncelleme için cron job ekleyin:

```bash
sudo crontab -e
```

Ekleyin:
```
0 2 * * * /opt/deploy-ssgile-git.sh >> /var/log/deploy.log 2>&1
```

Bu her gece saat 02:00'de otomatik güncelleme yapar.

