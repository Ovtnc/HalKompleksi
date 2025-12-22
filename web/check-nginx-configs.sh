#!/bin/bash
# Check nginx configurations for conflicts

echo "🔍 Checking nginx configurations..."

echo ""
echo "📋 Files in /etc/nginx/sites-enabled/:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "📋 Files in /etc/nginx/sites-available/ (halkompleksi related):"
ls -la /etc/nginx/sites-available/ | grep -E "halkompleksi|hal-kompleksi" || echo "None found"

echo ""
echo "🔍 Checking if backend nginx.conf is linked:"
find /etc/nginx -type l -ls 2>/dev/null | grep -i "backend\|hal-kompleksi" || echo "No backend nginx.conf links found"

echo ""
echo "🔍 Checking for halkompleksi.com in all nginx configs:"
grep -r "server_name.*halkompleksi.com" /etc/nginx/sites-available/ /etc/nginx/sites-enabled/ 2>/dev/null | grep -v ".backup" || echo "None found"

echo ""
echo "💡 Solution:"
echo "   1. Backend nginx.conf should NOT be in /etc/nginx/sites-enabled/"
echo "   2. Only /etc/nginx/sites-available/halkompleksi.com should handle the main domain"
echo "   3. If backend nginx.conf is linked, remove it:"
echo "      sudo rm /etc/nginx/sites-enabled/<backend-nginx-link>"

