# Sunucu Kurulum Rehberi

## Sunucuya Bağlanma

```bash
ssh root@109.199.114.223
```

## Yöntem 1: Git Clone ile (Önerilen)

Sunucuda direkt git clone yapın:

```bash
# Sunucuda
cd /opt
git clone https://github.com/Ovtnc/HalKompleksi.git
cd HalKompleksi/web
chmod +x deploy-ssgile-git.sh
sudo ./deploy-ssgile-git.sh
```

## Yöntem 2: Local'den Script Kopyalama

Local makineden (Mac'inizden) script'i kopyalayın:

```bash
# Local makinede (Mac'inizde)
cd /Users/okanvatanci/Desktop/hal-kompleksi
scp web/deploy-ssgile-git.sh root@109.199.114.223:/opt/
```

Sonra sunucuda:

```bash
# Sunucuda
chmod +x /opt/deploy-ssgile-git.sh
sudo /opt/deploy-ssgile-git.sh
```

## İlk Kurulum Adımları

### 1. Gerekli Paketleri Kurun

```bash
# Node.js 18+ kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git kurulumu (genelde zaten kurulu)
sudo apt-get install -y git

# Nginx kurulumu
sudo apt-get install -y nginx

# Certbot (SSL için)
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2. Git Repository'yi Clone Edin

```bash
cd /opt
git clone https://github.com/Ovtnc/HalKompleksi.git
```

### 3. Deployment Script'ini Çalıştırın

```bash
cd /opt/HalKompleksi/web
chmod +x deploy-ssgile-git.sh
sudo ./deploy-ssgile-git.sh
```

### 4. DNS Ayarları

DNS panelinizde (Natro/Cloudflare):
```
Type: A
Name: app
Value: 109.199.114.223
TTL: 3600
```

### 5. SSL Sertifikası

```bash
sudo certbot --nginx -d app.ssgile.com
```

## Güncelleme

Her değişiklikten sonra:

```bash
cd /opt/HalKompleksi/web
sudo ./deploy-ssgile-git.sh
```

Veya direkt:

```bash
sudo /opt/HalKompleksi/web/deploy-ssgile-git.sh
```

