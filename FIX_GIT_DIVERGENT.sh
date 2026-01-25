#!/bin/bash
# Sunucuda çalıştırılacak git divergent branches çözüm scripti

echo "🔧 Git divergent branches sorunu çözülüyor..."

cd /var/www/hal-kompleksi

# 1. Mevcut durumu kontrol et
echo "📋 Mevcut git durumu:"
git status

# 2. Git pull stratejisini ayarla (merge)
echo ""
echo "⚙️  Git pull stratejisi ayarlanıyor (merge)..."
git config pull.rebase false

# 3. Sunucudaki değişiklikleri yedekle
echo ""
echo "💾 Sunucudaki değişiklikler yedekleniyor..."
if [ -f "backend/.env" ]; then
    cp backend/.env backend/.env.server.backup
fi

# 4. Git pull (merge ile)
echo ""
echo "📥 Git pull yapılıyor (merge)..."
git pull origin main --no-edit || {
    echo "⚠️  Merge conflict var, çözülüyor..."
    
    # Conflict varsa, sunucudaki production ayarlarını koru
    if [ -f "backend/.env.server.backup" ]; then
        echo "📋 Production ayarları geri yükleniyor..."
        cp backend/.env.server.backup backend/.env
        
        # Email bilgilerini güncelle
        sed -i 's/^EMAIL_USER=.*/EMAIL_USER=destek.halkompleksi@gmail.com/' backend/.env
        sed -i 's/^EMAIL_PASS=.*/EMAIL_PASS=mravliodhjdfsnfc/' backend/.env
        
        # Production ayarları
        sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' backend/.env
        sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://halkompleksi.com|' backend/.env
        
        git add backend/.env
        git commit -m "Resolve merge conflict - keep production settings"
    fi
}

# 5. Kontrol
echo ""
echo "✅ Git durumu:"
git status

echo ""
echo "✅ Git pull tamamlandı!"
