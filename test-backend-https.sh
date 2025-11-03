#!/bin/bash

echo "======================================"
echo "🔍 Backend HTTPS Test Script"
echo "======================================"
echo ""

# Test URLs
API_URL="https://halkompleksi.com/api"
HTTP_API_URL="http://halkompleksi.com/api"

echo "1️⃣ DNS Kontrolü..."
echo "-----------------------------------"
nslookup halkompleksi.com
echo ""

echo "2️⃣ HTTPS API Health Check..."
echo "-----------------------------------"
curl -v "${API_URL}/health" 2>&1 | grep -E "HTTP|SSL|TLS|Connected"
echo ""

echo "3️⃣ HTTP API Test (redirect kontrolü)..."
echo "-----------------------------------"
curl -I "${HTTP_API_URL}/health" 2>&1 | head -10
echo ""

echo "4️⃣ Şehirler Endpoint Test..."
echo "-----------------------------------"
echo "HTTPS:"
curl -s "${API_URL}/locations/cities" | head -20
echo ""

echo "5️⃣ Kategoriler Endpoint Test..."
echo "-----------------------------------"
echo "HTTPS:"
curl -s "${API_URL}/categories" | head -20
echo ""

echo "6️⃣ Ürünler Endpoint Test..."
echo "-----------------------------------"
echo "HTTPS:"
curl -s "${API_URL}/products?page=1&limit=5" | head -20
echo ""

echo "7️⃣ SSL Sertifika Kontrolü..."
echo "-----------------------------------"
echo | openssl s_client -connect halkompleksi.com:443 -servername halkompleksi.com 2>/dev/null | grep -E "subject=|issuer=|verify return:"
echo ""

echo "======================================"
echo "✅ Test tamamlandı!"
echo "======================================"
echo ""
echo "⚠️ SSL hatası görürseniz:"
echo "   1. Backend sunucuda certbot kurmalısınız"
echo "   2. SSL_SETUP_IP_DOMAIN.md dosyasını takip edin"
echo ""
echo "⚠️ Connection refused görürseniz:"
echo "   1. Backend çalışıyor mu kontrol edin"
echo "   2. Nginx doğru yapılandırıldı mı kontrol edin"
echo "   3. Firewall portları açık mı kontrol edin"
echo ""

