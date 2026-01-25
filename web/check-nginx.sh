#!/bin/bash
# Nginx yapılandırmasını kontrol etme script'i

echo "🔍 Nginx Yapılandırması Kontrolü"
echo "=================================="
echo ""

# 1. Nginx durumu
echo "📊 1. Nginx Durumu:"
systemctl status nginx --no-pager -l | head -10
echo ""

# 2. Nginx yapılandırması test
echo "🧪 2. Nginx Yapılandırması Test:"
nginx -t
echo ""

# 3. Aktif siteler
echo "📋 3. Aktif Siteler (sites-enabled):"
ls -la /etc/nginx/sites-enabled/
echo ""

# 4. Mevcut yapılandırmalar
echo "📁 4. Mevcut Yapılandırmalar (sites-available):"
ls -la /etc/nginx/sites-available/ | grep -E "halkompleksi|app.ssgile"
echo ""

# 5. halkompleksi.com yapılandırması
if [ -f "/etc/nginx/sites-available/halkompleksi.com" ]; then
    echo "📄 5. halkompleksi.com Yapılandırması:"
    echo "-----------------------------------"
    cat /etc/nginx/sites-available/halkompleksi.com
    echo ""
    echo "-----------------------------------"
else
    echo "⚠️  5. halkompleksi.com yapılandırması bulunamadı!"
fi
echo ""

# 6. Web app dosyaları kontrolü
echo "📂 6. Web App Dosyaları:"
if [ -d "/var/www/halkompleksi.com" ]; then
    echo "✅ /var/www/halkompleksi.com dizini mevcut"
    echo "   Dosya sayısı: $(ls -1 /var/www/halkompleksi.com | wc -l)"
    echo "   index.html var mı: $([ -f "/var/www/halkompleksi.com/index.html" ] && echo "✅ Evet" || echo "❌ Hayır")"
    ls -lh /var/www/halkompleksi.com/ | head -10
else
    echo "❌ /var/www/halkompleksi.com dizini bulunamadı!"
fi
echo ""

# 7. Port dinleme kontrolü
echo "🔌 7. Nginx Port Dinleme:"
netstat -tlnp | grep nginx || ss -tlnp | grep nginx
echo ""

# 8. Backend API kontrolü
echo "🔗 8. Backend API Durumu:"
curl -s http://localhost:5001/api/health | head -5 || echo "❌ Backend API'ye erişilemiyor"
echo ""

echo "✅ Kontrol tamamlandı!"

