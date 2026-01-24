#!/bin/bash

# Backend restart script
echo "🔄 Backend yeniden başlatılıyor..."

# Backend dizinine git
cd /root/backend || cd ~/backend || cd /var/www/backend || exit 1

# PM2 ile restart
echo "📦 PM2 ile restart ediliyor..."
pm2 restart hal-kompleksi-backend

# Durum kontrolü
echo "✅ Backend durumu:"
pm2 status

echo ""
echo "📋 Log'ları görmek için:"
echo "   pm2 logs hal-kompleksi-backend"
echo ""
echo "🔍 Health check:"
echo "   curl https://halkompleksi.com/api/health"



