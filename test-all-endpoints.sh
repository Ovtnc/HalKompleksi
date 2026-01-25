#!/bin/bash

echo "🧪 HTTPS ENDPOINT TESTLERİ"
echo "================================"
echo ""

BASE_URL="https://halkompleksi.com"

# Test 1: Health Check
echo "1. ✅ Health Check:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" $BASE_URL/api/health
echo ""

# Test 2: Cities
echo "2. 🏙️  Cities API:"
CITIES_RESPONSE=$(curl -s $BASE_URL/api/locations/cities)
CITIES_COUNT=$(echo $CITIES_RESPONSE | grep -o '"name"' | wc -l)
curl -s -o /dev/null -w "   Status: %{http_code}\n" $BASE_URL/api/locations/cities
echo "   Cities: $CITIES_COUNT"
echo ""

# Test 3: Categories
echo "3. 📂 Categories API:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" $BASE_URL/api/products/categories
echo ""

# Test 4: Products
echo "4. 📦 Products API:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" "$BASE_URL/api/products?limit=5"
echo ""

# Test 5: Featured Products
echo "5. ⭐ Featured Products:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" "$BASE_URL/api/products?featured=true&limit=5"
echo ""

# Test 6: Product Images (Upload klasörü)
echo "6. 🖼️  Product Images (Upload):"
curl -s -o /dev/null -w "   Status: %{http_code}\n" $BASE_URL/uploads/products/
echo ""

# Test 7: Privacy Policy
echo "7. 📄 Privacy Policy:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" $BASE_URL/privacy-policy.html
echo ""

# Test 8: Terms of Service
echo "8. 📄 Terms of Service:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" $BASE_URL/terms-of-service.html
echo ""

# Test 9: SSL Certificate
echo "9. 🔒 SSL Certificate:"
echo "   Expiry: $(echo | openssl s_client -connect halkompleksi.com:443 -servername halkompleksi.com 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
echo ""

# Test 10: HTTP -> HTTPS Redirect
echo "10. 🔄 HTTP to HTTPS Redirect:"
curl -s -o /dev/null -w "   Status: %{http_code}\n" -L http://halkompleksi.com
echo ""

echo "================================"
echo "✅ Test tamamlandı!"
echo ""
echo "BEKLENİLEN SONUÇLAR:"
echo "  1-5, 10: 200 (OK)"
echo "  6: 403 veya 404 (normal)"
echo "  7-8: 200 (privacy/terms varsa) veya 404"
echo "  9: Geçerli tarih (2026-02-01)"

