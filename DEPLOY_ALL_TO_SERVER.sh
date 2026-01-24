#!/bin/bash
# Sunucuda çalıştırılacak tam deployment scripti

set -e  # Hata durumunda dur

echo "🚀 Hal Kompleksi - Tam Deployment Başlatılıyor..."
echo "=========================================="

cd /var/www/hal-kompleksi

# 1. Git Pull
echo ""
echo "📥 Git'ten son değişiklikleri çekiliyor..."
git pull origin main

# 2. Backend Deployment
echo ""
echo "🔧 Backend deployment başlatılıyor..."
cd backend

# .env dosyasını kontrol et
if [ ! -f ".env" ]; then
    echo "❌ .env dosyası bulunamadı!"
    exit 1
fi

# Email bilgilerini kontrol et ve güncelle
if ! grep -q "^EMAIL_USER=" .env; then
    echo "⚠️  EMAIL_USER bulunamadı, ekleniyor..."
    echo "EMAIL_USER=destek.halkompleksi@gmail.com" >> .env
fi

if ! grep -q "^EMAIL_PASS=" .env; then
    echo "⚠️  EMAIL_PASS bulunamadı, ekleniyor..."
    echo "EMAIL_PASS=mravliodhjdfsnfc" >> .env
fi

# Production ayarlarını kontrol et
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://halkompleksi.com|' .env

# Dependencies yükle
echo "📦 Backend dependencies yükleniyor..."
npm install --production

# Security audit (opsiyonel)
echo "🔒 Security audit çalıştırılıyor..."
npm audit fix --force || true

# PM2 restart
echo "🔄 PM2 restart ediliyor..."
cd ..
pm2 restart hal-kompleksi-backend --update-env

# 3. Web App Deployment
echo ""
echo "🌐 Web app deployment başlatılıyor..."
cd web

# Dependencies yükle (dev dependencies dahil - build için gerekli)
echo "📦 Web app dependencies yükleniyor..."
npm install

# Build
echo "🏗️  Web app build ediliyor..."
npm run build

# Deploy
echo "📤 Web app deploy ediliyor..."
sudo cp -r dist/* /var/www/halkompleksi.com/
sudo chown -R www-data:www-data /var/www/halkompleksi.com
sudo chmod -R 755 /var/www/halkompleksi.com

# Nginx reload
echo "🔄 Nginx reload ediliyor..."
sudo systemctl reload nginx

# 4. Durum Kontrolü
echo ""
echo "=========================================="
echo "✅ Deployment Tamamlandı!"
echo ""
echo "📊 PM2 Durumu:"
pm2 status

echo ""
echo "📋 Son Loglar (Email Configuration Check):"
pm2 logs hal-kompleksi-backend --lines 20 --nostream | grep -i "email\|📧\|configuration" | tail -10 || echo "Log bulunamadı"

echo ""
echo "🌐 Web App Test:"
curl -I https://halkompleksi.com/reset-password 2>/dev/null | head -1 || echo "Web app test edilemedi"

echo ""
echo "✅ Tüm deployment işlemleri tamamlandı!"
