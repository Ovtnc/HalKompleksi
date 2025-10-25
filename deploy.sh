#!/bin/bash

# 🚀 Hal Kompleksi - VPS Deployment Script
# VPS Server: 109.199.114.223

echo "🚀 Starting Hal Kompleksi deployment..."

# VPS Server bilgileri
VPS_HOST="109.199.114.223"
VPS_USER="root"
PROJECT_DIR="/var/www/hal-kompleksi"

echo "📋 Deployment Checklist:"
echo "1. VPS Server'a bağlan: ssh $VPS_USER@$VPS_HOST"
echo "2. Sistem güncellemeleri yap"
echo "3. Node.js ve MongoDB kur"
echo "4. PM2 kur"
echo "5. Proje klonla"
echo "6. Backend'i başlat"

echo ""
echo "🔧 VPS Server'da çalıştırılacak komutlar:"
echo ""

cat << 'EOF'
# 1. Sistem güncellemeleri
apt update && apt upgrade -y

# 2. Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 3. MongoDB kurulumu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# 4. PM2 kurulumu
npm install -g pm2

# 5. Proje dizini oluştur
mkdir -p /var/www/hal-kompleksi
cd /var/www/hal-kompleksi

# 6. Git clone
git clone https://github.com/Ovtnc/HalKompleksi.git .

# 7. Backend kurulumu
cd backend
npm install

# 8. Environment variables
cp env.production.example .env

# 9. PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 10. Nginx kurulumu ve konfigürasyonu
apt install nginx -y

# Nginx konfigürasyonu
cat > /etc/nginx/sites-available/hal-kompleksi << 'NGINX_EOF'
server {
    listen 80;
    server_name 109.199.114.223;

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# Konfigürasyonu aktif et
ln -s /etc/nginx/sites-available/hal-kompleksi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 11. Firewall konfigürasyonu
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 5001
ufw enable

echo "✅ Deployment completed!"
echo "Backend API: http://109.199.114.223:5001/api"
echo "Check status: pm2 status"
echo "View logs: pm2 logs hal-kompleksi-backend"
EOF

echo ""
echo "🎯 Deployment tamamlandıktan sonra:"
echo "- Backend API: http://109.199.114.223:5001/api"
echo "- Health check: curl http://109.199.114.223:5001/api/health"
echo "- PM2 status: pm2 status"
echo "- Logs: pm2 logs hal-kompleksi-backend"
echo ""
echo "📱 Frontend için:"
echo "- Android build: npx expo run:android --variant release"
echo "- iOS build: npx expo run:ios --configuration Release"
echo ""
echo "✅ Deployment hazır!"
