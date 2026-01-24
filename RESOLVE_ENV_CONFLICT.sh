#!/bin/bash
# Sunucuda çalıştırılacak conflict çözme scripti

echo "🔧 Git conflict çözülüyor..."

cd /var/www/hal-kompleksi

# 1. Mevcut .env dosyasını yedekle
echo "💾 Mevcut .env dosyası yedekleniyor..."
cp backend/.env backend/.env.production.backup

# 2. Conflict'i çöz - sunucudaki production ayarlarını koru
echo "📋 Conflict çözülüyor..."
cd backend

# Git'teki .env dosyasını al ama production ayarlarını koru
git checkout --theirs .env 2>/dev/null || true

# Production ayarlarını geri yükle (NODE_ENV, MONGODB_URI, vb.)
if [ -f ".env.production.backup" ]; then
    # Production ayarlarını koru
    PROD_NODE_ENV=$(grep "^NODE_ENV=" .env.production.backup | cut -d'=' -f2)
    PROD_MONGODB_URI=$(grep "^MONGODB_URI=" .env.production.backup | cut -d'=' -f2)
    PROD_JWT_SECRET=$(grep "^JWT_SECRET=" .env.production.backup | cut -d'=' -f2)
    PROD_FRONTEND_URL=$(grep "^FRONTEND_URL=" .env.production.backup | cut -d'=' -f2)
    
    # .env dosyasını güncelle
    if [ ! -z "$PROD_NODE_ENV" ]; then
        sed -i "s/^NODE_ENV=.*/NODE_ENV=$PROD_NODE_ENV/" .env
    fi
    if [ ! -z "$PROD_MONGODB_URI" ]; then
        sed -i "s|^MONGODB_URI=.*|MONGODB_URI=$PROD_MONGODB_URI|" .env
    fi
    if [ ! -z "$PROD_JWT_SECRET" ]; then
        sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$PROD_JWT_SECRET|" .env
    fi
    if [ ! -z "$PROD_FRONTEND_URL" ]; then
        sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=$PROD_FRONTEND_URL|" .env
    fi
fi

# Email bilgilerini güncelle
sed -i 's/^EMAIL_USER=.*/EMAIL_USER=destek.halkompleksi@gmail.com/' .env
sed -i 's/^EMAIL_PASS=.*/EMAIL_PASS=mravliodhjdfsnfc/' .env

# 3. Git add ve commit
cd ..
git add backend/.env
git commit -m "Resolve .env conflict - keep production settings, update email"

# 4. Kontrol et
echo ""
echo "✅ Güncellenmiş .env dosyası:"
cat backend/.env

echo ""
echo "✅ Conflict çözüldü!"
