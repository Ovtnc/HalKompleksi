#!/bin/bash
# Sunucuda çalıştırılacak email düzeltme scripti

echo "🔍 Email yapılandırması kontrol ediliyor..."

cd /var/www/hal-kompleksi/backend

# 1. .env dosyasını kontrol et
echo ""
echo "📋 .env dosyası içeriği:"
cat .env | grep EMAIL

# 2. Email bilgilerini güncelle (eğer güncellenmemişse)
echo ""
echo "📧 Email bilgileri güncelleniyor..."
sed -i 's/^EMAIL_USER=.*/EMAIL_USER=destek.halkompleksi@gmail.com/' .env
sed -i 's/^EMAIL_PASS=.*/EMAIL_PASS=mravliodhjdfsnfc/' .env

# 3. Güncellenmiş değerleri göster
echo ""
echo "✅ Güncellenmiş email bilgileri:"
cat .env | grep EMAIL

# 4. PM2'yi tamamen durdur ve yeniden başlat
echo ""
echo "🔄 PM2 durduruluyor..."
pm2 stop hal-kompleksi-backend

echo "⏳ 2 saniye bekleniyor..."
sleep 2

echo "🚀 PM2 yeniden başlatılıyor (environment variables ile)..."
pm2 start ecosystem.config.js --env production --update-env

# Alternatif: Eğer ecosystem.config.js kullanmıyorsanız:
# pm2 restart hal-kompleksi-backend --update-env

# 5. PM2 durumunu kontrol et
echo ""
echo "📊 PM2 durumu:"
pm2 status

# 6. Son logları kontrol et (email configuration check için)
echo ""
echo "📋 Son loglar (email configuration check):"
pm2 logs hal-kompleksi-backend --lines 30 --nostream | grep -i "email\|📧\|EMAIL"

echo ""
echo "✅ İşlem tamamlandı!"
echo ""
echo "🧪 Test için şifre sıfırlama isteği gönderebilirsiniz."
echo "📧 Email gönderen: destek.halkompleksi@gmail.com"
