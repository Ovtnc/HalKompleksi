#!/bin/bash
# Debug script for uploads issue

echo "🔍 Debugging uploads issue..."
echo ""

# 1. Check if file exists
FILE="/var/www/hal-kompleksi/backend/uploads/products/product-1763787894713-381741863.jpg"
echo "📂 1. Checking file existence:"
if [ -f "$FILE" ]; then
    echo "✅ File exists: $FILE"
    ls -la "$FILE"
else
    echo "❌ File NOT found: $FILE"
fi

echo ""
echo "📂 2. Checking uploads directory structure:"
ls -la /var/www/hal-kompleksi/backend/uploads/ | head -10

echo ""
echo "📂 3. Checking products directory:"
ls -la /var/www/hal-kompleksi/backend/uploads/products/ | head -5

echo ""
echo "🔐 4. Checking file permissions:"
stat -c "%U:%G %a %n" /var/www/hal-kompleksi/backend/uploads/products/product-1763787894713-381741863.jpg 2>/dev/null || echo "File not found"

echo ""
echo "📋 5. Current Nginx /uploads/ configuration:"
grep -A 10 "location /uploads/" /etc/nginx/sites-available/halkompleksi.com

echo ""
echo "🧪 6. Testing with curl:"
echo "   Request: https://halkompleksi.com/uploads/products/product-1763787894713-381741863.jpg"
curl -I "https://halkompleksi.com/uploads/products/product-1763787894713-381741863.jpg" 2>&1 | head -15

echo ""
echo "🧪 7. Testing with HTTP (no SSL):"
curl -I "http://halkompleksi.com/uploads/products/product-1763787894713-381741863.jpg" 2>&1 | head -15

echo ""
echo "📋 8. Nginx error log (last 5 lines):"
sudo tail -5 /var/log/nginx/error.log

echo ""
echo "📋 9. Nginx access log (last 5 lines for uploads):"
sudo tail -20 /var/log/nginx/access.log | grep uploads | tail -5

