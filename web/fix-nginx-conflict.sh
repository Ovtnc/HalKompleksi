#!/bin/bash
# Fix nginx server name conflict between backend nginx.conf and sites-available

echo "🔍 Checking for conflicting nginx configurations..."

# Check if backend nginx.conf has halkompleksi.com
if grep -q "server_name.*halkompleksi.com" /var/www/hal-kompleksi/backend/nginx.conf 2>/dev/null || \
   grep -q "server_name.*halkompleksi.com" /opt/hal-kompleksi/backend/nginx.conf 2>/dev/null; then
    echo "⚠️  Found halkompleksi.com in backend nginx.conf"
    echo "ℹ️  Backend nginx.conf should only handle API, not the main domain"
fi

# Check sites-available
if [ -f "/etc/nginx/sites-available/halkompleksi.com" ]; then
    echo "✅ Found /etc/nginx/sites-available/halkompleksi.com"
    
    # Check if it's enabled
    if [ -L "/etc/nginx/sites-enabled/halkompleksi.com" ]; then
        echo "✅ Site is enabled"
    else
        echo "⚠️  Site is not enabled, enabling it..."
        sudo ln -sf /etc/nginx/sites-available/halkompleksi.com /etc/nginx/sites-enabled/
    fi
fi

# Check main nginx.conf
MAIN_NGINX_CONF="/etc/nginx/nginx.conf"
if grep -q "server_name.*halkompleksi.com" "$MAIN_NGINX_CONF" 2>/dev/null; then
    echo "⚠️  Found halkompleksi.com in main nginx.conf"
    echo "ℹ️  This might cause conflicts with sites-available"
fi

# List all nginx configs with halkompleksi.com
echo ""
echo "📋 All nginx configs mentioning halkompleksi.com:"
grep -r "server_name.*halkompleksi.com" /etc/nginx/ 2>/dev/null | grep -v ".backup" || echo "None found in /etc/nginx/"

echo ""
echo "💡 Solution:"
echo "   - Backend nginx.conf should only handle API (via Docker or separate port)"
echo "   - Main domain (halkompleksi.com) should be handled by /etc/nginx/sites-available/"
echo "   - If backend nginx.conf has the domain, remove it or change the server_name"

