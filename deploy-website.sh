#!/bin/bash

echo "🚀 Deploying Hal Kompleksi Website..."
echo ""

# Git kontrolü
if ! git diff-index --quiet HEAD --; then
    echo "📝 Committing changes..."
    git add backend/public/ backend/src/server.js *.md
    git commit -m "Update website - $(date +%Y-%m-%d)"
    git push origin main
    echo "✅ Pushed to GitHub"
else
    echo "✅ No changes to commit"
fi

echo ""
echo "🚀 Deploying to production server..."

# SSH ile deploy
ssh root@109.199.114.223 << 'EOF'
    set -e
    echo "📂 Navigating to project..."
    cd /var/www/hal-kompleksi
    
    echo "⬇️  Pulling latest changes..."
    git pull origin main
    
    echo "🔄 Restarting backend..."
    cd backend
    pm2 restart hal-kompleksi-backend
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📊 Backend status:"
    pm2 status hal-kompleksi-backend
EOF

echo ""
echo "🌐 Testing website..."
echo ""

# Test ana sayfa
if curl -s -o /dev/null -w "%{http_code}" https://halkompleksi.com/ | grep -q "200"; then
    echo "✅ Homepage: https://halkompleksi.com/"
else
    echo "❌ Homepage failed"
fi

# Test gizlilik
if curl -s -o /dev/null -w "%{http_code}" https://halkompleksi.com/privacy-policy.html | grep -q "200"; then
    echo "✅ Privacy Policy: https://halkompleksi.com/privacy-policy.html"
else
    echo "❌ Privacy Policy failed"
fi

# Test şartlar
if curl -s -o /dev/null -w "%{http_code}" https://halkompleksi.com/terms-of-service.html | grep -q "200"; then
    echo "✅ Terms of Service: https://halkompleksi.com/terms-of-service.html"
else
    echo "❌ Terms of Service failed"
fi

echo ""
echo "🎉 Deployment finished!"
echo "🌐 Visit: https://halkompleksi.com"
echo ""

