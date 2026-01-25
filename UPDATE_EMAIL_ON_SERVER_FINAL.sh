#!/bin/bash
# Sunucuda çalıştırılacak email password güncelleme scripti

echo "📧 Email password güncelleniyor..."

cd /var/www/hal-kompleksi

# 1. Mevcut .env dosyasını yedekle
echo "💾 Mevcut .env dosyası yedekleniyor..."
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)

# 2. Git stash (local değişiklikleri sakla)
echo "📦 Local değişiklikler stash ediliyor..."
git stash

# 3. Git pull
echo "📥 Git pull yapılıyor..."
git pull origin main

# 4. Stash'i geri yükle
echo "📦 Local değişiklikler geri yükleniyor..."
git stash pop || true

# 5. Email password'u güncelle (production ayarları korunur)
echo "📧 Email password güncelleniyor..."
cd backend
sed -i 's/^EMAIL_PASS=.*/EMAIL_PASS=pvtybbzlqlnhllpg/' .env

# Production ayarlarını kontrol et ve güncelle
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://halkompleksi.com|' .env

# 6. Kontrol et
echo ""
echo "✅ Güncellenmiş email bilgileri:"
grep -E "EMAIL_USER|EMAIL_PASS|NODE_ENV|FRONTEND_URL" .env

# 7. PM2 restart
echo ""
echo "🔄 PM2 restart ediliyor..."
cd ..
pm2 stop hal-kompleksi-backend
sleep 2
pm2 start ecosystem.config.js --env production --update-env

# 8. Kontrol
echo ""
echo "📊 PM2 durumu:"
pm2 status

echo ""
echo "📋 Son loglar (email configuration):"
sleep 3
pm2 logs hal-kompleksi-backend --lines 30 --nostream | grep -i "email\|📧\|configuration" | tail -10

echo ""
echo "✅ Email password güncellendi!"
echo "📧 Yeni password: pvtybbzlqlnhllpg"
