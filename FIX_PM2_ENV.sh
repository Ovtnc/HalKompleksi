#!/bin/bash
# Sunucuda çalıştırılacak PM2 environment variables düzeltme scripti

echo "🔧 PM2 environment variables düzeltiliyor..."

cd /var/www/hal-kompleksi/backend

# 1. .env dosyasını kontrol et
echo "📋 .env dosyası kontrol ediliyor..."
cat .env | grep -E "EMAIL_USER|EMAIL_PASS|NODE_ENV"

# 2. PM2'yi tamamen durdur
echo ""
echo "🛑 PM2 durduruluyor..."
pm2 stop hal-kompleksi-backend
pm2 delete hal-kompleksi-backend

# 3. Kısa bir bekleme
sleep 2

# 4. PM2 ecosystem.config.js'i kontrol et ve güncelle
echo ""
echo "📋 ecosystem.config.js kontrol ediliyor..."
cd /var/www/hal-kompleksi

# EMAIL_USER ve EMAIL_PASS ecosystem.config.js'de yoksa ekle
if ! grep -q "EMAIL_USER" backend/ecosystem.config.js; then
    echo "⚠️  EMAIL_USER ecosystem.config.js'de yok, ekleniyor..."
    # Bu manuel olarak yapılmalı veya sed ile eklenebilir
fi

# 5. PM2'yi yeniden başlat (ecosystem.config.js ile)
echo ""
echo "🚀 PM2 yeniden başlatılıyor..."
cd /var/www/hal-kompleksi
pm2 start ecosystem.config.js --env production --update-env

# Alternatif: Eğer ecosystem.config.js kullanmıyorsanız:
# cd backend
# pm2 start src/server.js --name hal-kompleksi-backend --instances max --exec-mode cluster --env production --update-env

# 6. PM2 environment variables'ı kontrol et
echo ""
echo "🔍 PM2 environment variables kontrol ediliyor..."
sleep 3
pm2 env 0 | grep -i email || echo "⚠️  EMAIL environment variables görünmüyor"

# 7. Logları kontrol et
echo ""
echo "📋 Son loglar (email configuration check):"
pm2 logs hal-kompleksi-backend --lines 30 --nostream | grep -i "email\|📧\|configuration\|EMAIL_USER\|EMAIL_PASS" | tail -20

echo ""
echo "✅ İşlem tamamlandı!"
echo ""
echo "🧪 Test için şifre sıfırlama isteği gönderebilirsiniz."
