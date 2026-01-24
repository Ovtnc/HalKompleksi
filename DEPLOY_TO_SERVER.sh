#!/bin/bash

# 🚀 Hal Kompleksi - Sunucuya Deploy Script
# Bu script sunucuda çalıştırılmalıdır

echo "🚀 Hal Kompleksi - Sunucuya Deploy Başlıyor..."
echo ""

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Proje dizinleri
PROJECT_DIR="/var/www/hal-kompleksi"
BACKEND_DIR="$PROJECT_DIR/backend"
WEB_DIR="$PROJECT_DIR/web"

# Git pull
echo -e "${GREEN}📥 Git'ten güncellemeler çekiliyor...${NC}"
cd $PROJECT_DIR || { echo -e "${RED}❌ Proje dizini bulunamadı: $PROJECT_DIR${NC}"; exit 1; }
git pull origin main || { echo -e "${RED}❌ Git pull başarısız${NC}"; exit 1; }
echo -e "${GREEN}✅ Git pull tamamlandı${NC}"
echo ""

# Backend güncelleme
echo -e "${GREEN}🔧 Backend güncelleniyor...${NC}"
cd $BACKEND_DIR || { echo -e "${RED}❌ Backend dizini bulunamadı: $BACKEND_DIR${NC}"; exit 1; }
npm install --production || { echo -e "${YELLOW}⚠️ npm install uyarıları olabilir, devam ediliyor...${NC}"; }
echo -e "${GREEN}✅ Backend güncellemesi tamamlandı${NC}"
echo ""

# Web güncelleme
if [ -d "$WEB_DIR" ]; then
    echo -e "${GREEN}🌐 Web uygulaması güncelleniyor...${NC}"
    cd $WEB_DIR || { echo -e "${RED}❌ Web dizini bulunamadı: $WEB_DIR${NC}"; exit 1; }
    npm install --production || { echo -e "${YELLOW}⚠️ npm install uyarıları olabilir, devam ediliyor...${NC}"; }
    npm run build || { echo -e "${RED}❌ Web build başarısız${NC}"; exit 1; }
    echo -e "${GREEN}✅ Web uygulaması güncellendi${NC}"
    echo ""
fi

# PM2 restart
echo -e "${GREEN}🔄 Backend yeniden başlatılıyor...${NC}"
pm2 restart hal-kompleksi-backend || { echo -e "${RED}❌ PM2 restart başarısız${NC}"; exit 1; }
echo -e "${GREEN}✅ Backend yeniden başlatıldı${NC}"
echo ""

# Durum kontrolü
echo -e "${GREEN}📊 PM2 Durumu:${NC}"
pm2 status
echo ""

echo -e "${GREEN}✅ Deploy tamamlandı!${NC}"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Backend log'larını kontrol edin: pm2 logs hal-kompleksi-backend"
echo "2. Health check: curl https://halkompleksi.com/api/health"
echo "3. Web uygulamasını test edin: https://halkompleksi.com"
