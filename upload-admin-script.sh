#!/bin/bash

# Admin script'ini sunucuya yükle ve çalıştır
# Kullanım: ./upload-admin-script.sh

echo "🚀 Admin Script Upload Tool"
echo ""

SERVER_IP="109.199.114.223"
SERVER_USER="root"
BACKEND_PATH="/var/www/hal-kompleksi/backend"

echo "📤 Script sunucuya yükleniyor..."
echo "   Sunucu: $SERVER_USER@$SERVER_IP"
echo "   Hedef: $BACKEND_PATH/scripts/"
echo ""

# Script'i sunucuya yükle
scp backend/scripts/create-admin.js $SERVER_USER@$SERVER_IP:$BACKEND_PATH/scripts/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script yüklendi!"
    echo ""
    echo "📝 Şimdi şunu çalıştırabilirsiniz:"
    echo ""
    echo "ssh $SERVER_USER@$SERVER_IP \"cd $BACKEND_PATH && node scripts/create-admin.js --email ibrahim@halkompleksi.com --password 'Halkompleksi382.' --name 'Admin User' --force-update\""
    echo ""
else
    echo "❌ Yükleme başarısız! Manuel olarak yükleyin:"
    echo "   scp backend/scripts/create-admin.js $SERVER_USER@$SERVER_IP:$BACKEND_PATH/scripts/"
    echo ""
fi





