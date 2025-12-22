#!/bin/bash
# Fix nginx server name conflict

echo "🔍 Çakışan yapılandırmaları kontrol ediyorum..."

# hal-kompleksi yapılandırmasını kontrol et
if [ -f "/etc/nginx/sites-available/hal-kompleksi" ]; then
    echo "📄 hal-kompleksi yapılandırması:"
    echo "-----------------------------------"
    cat /etc/nginx/sites-available/hal-kompleksi
    echo "-----------------------------------"
    echo ""
    
    # Eğer halkompleksi.com kullanıyorsa, devre dışı bırak
    if grep -q "server_name.*halkompleksi.com" /etc/nginx/sites-available/hal-kompleksi; then
        echo "⚠️  hal-kompleksi yapılandırması halkompleksi.com kullanıyor!"
        echo "🔄 Devre dışı bırakılıyor..."
        
        # Backup
        cp /etc/nginx/sites-available/hal-kompleksi /etc/nginx/sites-available/hal-kompleksi.backup.$(date +%Y%m%d-%H%M%S)
        
        # Disable
        if [ -L "/etc/nginx/sites-enabled/hal-kompleksi" ]; then
            sudo rm /etc/nginx/sites-enabled/hal-kompleksi
            echo "✅ hal-kompleksi devre dışı bırakıldı"
        fi
    fi
fi

# Test
echo ""
echo "🧪 Nginx yapılandırması test ediliyor..."
if nginx -t; then
    echo "✅ Nginx yapılandırması geçerli!"
    echo "🔄 Nginx reload ediliyor..."
    systemctl reload nginx
    echo "✅ Tamamlandı!"
else
    echo "❌ Hata var, lütfen kontrol edin"
    exit 1
fi

