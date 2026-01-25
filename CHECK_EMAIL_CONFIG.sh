#!/bin/bash
# Sunucuda çalıştırılacak email kontrol scripti

echo "🔍 Email yapılandırması kontrol ediliyor..."

cd /var/www/hal-kompleksi/backend

# 1. .env dosyasının tamamını kontrol et
echo ""
echo "📋 .env dosyası içeriği:"
cat .env

# 2. EMAIL_USER ve EMAIL_PASS satırlarını kontrol et
echo ""
echo "📧 Email bilgileri:"
grep -E "EMAIL_USER|EMAIL_PASS" .env || echo "❌ EMAIL_USER veya EMAIL_PASS bulunamadı!"

# 3. Eğer yoksa ekle
if ! grep -q "^EMAIL_USER=" .env; then
    echo ""
    echo "⚠️  EMAIL_USER bulunamadı, ekleniyor..."
    echo "EMAIL_USER=destek.halkompleksi@gmail.com" >> .env
fi

if ! grep -q "^EMAIL_PASS=" .env; then
    echo "⚠️  EMAIL_PASS bulunamadı, ekleniyor..."
    echo "EMAIL_PASS=mravliodhjdfsnfc" >> .env
fi

# 4. Güncellenmiş değerleri göster
echo ""
echo "✅ Güncellenmiş email bilgileri:"
grep -E "EMAIL_USER|EMAIL_PASS" .env

# 5. PM2 environment variables'ı kontrol et
echo ""
echo "🔍 PM2 environment variables kontrol ediliyor..."
pm2 env 0 | grep -i email || echo "⚠️  PM2'de EMAIL environment variables görünmüyor"

# 6. PM2'yi restart et
echo ""
echo "🔄 PM2 restart ediliyor..."
pm2 restart hal-kompleksi-backend --update-env

# 7. Logları kontrol et
echo ""
echo "📋 Son loglar (email configuration check):"
sleep 2
pm2 logs hal-kompleksi-backend --lines 50 --nostream | grep -i "email\|📧\|EMAIL\|configuration" | head -20

echo ""
echo "✅ Kontrol tamamlandı!"
