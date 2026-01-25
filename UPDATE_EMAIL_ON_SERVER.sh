#!/bin/bash
# Sunucuda çalıştırılacak email güncelleme scripti

echo "🔄 Email yapılandırması güncelleniyor..."

cd /var/www/hal-kompleksi

# Backend .env dosyasını yedekle
echo "💾 Mevcut .env dosyası yedekleniyor..."
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)

# Git pull için local değişiklikleri stash et
echo "📦 Local değişiklikler stash ediliyor..."
git stash

# Git pull
echo "📥 Git'ten son değişiklikleri çekiyorum..."
git pull origin main

# Stash'i geri yükle
echo "📦 Local değişiklikler geri yükleniyor..."
git stash pop || true

# Email bilgilerini güncelle (sadece EMAIL_USER ve EMAIL_PASS satırlarını)
echo "📧 Email bilgileri güncelleniyor..."
sed -i 's/^EMAIL_USER=.*/EMAIL_USER=destek.halkompleksi@gmail.com/' backend/.env
sed -i 's/^EMAIL_PASS=.*/EMAIL_PASS=mravliodhjdfsnfc/' backend/.env

# Kontrol et
echo ""
echo "✅ Güncellenen email bilgileri:"
grep "EMAIL_USER\|EMAIL_PASS" backend/.env

# PM2'yi restart et (environment variables'ı güncellemek için)
echo ""
echo "🔄 PM2 restart ediliyor (environment variables güncelleniyor)..."
pm2 restart hal-kompleksi-backend --update-env

echo ""
echo "✅ Email yapılandırması güncellendi!"
echo "📧 Yeni email: destek.halkompleksi@gmail.com"
echo ""
echo "🧪 Test için şifre sıfırlama isteği gönderebilirsiniz."
