#!/bin/bash

# 🧹 TEMİZ BUILD ALMA SCRIPT'İ
# =============================

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}🧹 XCODE CACHE TEMİZLEME VE TEMİZ BUILD${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${YELLOW}⚠️  Bu işlem tüm cache'leri temizleyecek!${NC}"
echo ""

cd /Users/okanvatanci/Desktop/hal-kompleksi

# 1. Xcode'u kapat
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}ADIM 1: Xcode'u Kapatma${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Xcode kapatılıyor..."
killall Xcode 2>/dev/null || echo "Xcode zaten kapalı"
sleep 2
echo "${GREEN}✅ Xcode kapatıldı${NC}"
echo ""

# 2. DerivedData temizle
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}ADIM 2: DerivedData Temizleme${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "DerivedData siliniyor..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "${GREEN}✅ DerivedData temizlendi${NC}"
echo ""

# 3. iOS build klasörünü temizle
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}ADIM 3: iOS Build Klasörü Temizleme${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "ios/build siliniyor..."
rm -rf ios/build
echo "${GREEN}✅ iOS build klasörü temizlendi${NC}"
echo ""

# 4. Xcode Archives temizle
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}ADIM 4: Eski Archive'ları Temizleme${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Eski archive'lar siliniyor..."
rm -rf ~/Library/Developer/Xcode/Archives/*
echo "${GREEN}✅ Eski archive'lar temizlendi${NC}"
echo ""

# 5. Pods'ları yeniden yükle
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}ADIM 5: CocoaPods Yeniden Yükleme${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
cd ios
echo "Pods temizleniyor..."
pod deintegrate 2>/dev/null || echo "Deintegrate atlandı"
pod cache clean --all 2>/dev/null || echo "Cache clean atlandı"
echo ""
echo "Pods yeniden yükleniyor..."
pod install
cd ..
echo "${GREEN}✅ Pods yeniden yüklendi${NC}"
echo ""

# 6. Version kontrolü
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}ADIM 6: Version Doğrulama${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

VERSION=$(cat ios/HalKompleksi/Info.plist | grep -A1 "CFBundleShortVersionString" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
BUILD=$(cat ios/HalKompleksi/Info.plist | grep -A1 "<key>CFBundleVersion</key>" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')

echo "📋 Mevcut ayarlar:"
echo "   Version: ${GREEN}$VERSION${NC}"
echo "   Build: ${GREEN}$BUILD${NC}"
echo ""

if [ "$VERSION" != "1.0.1" ] || [ "$BUILD" != "2" ]; then
    echo "${RED}❌ HATA: Version veya Build yanlış!${NC}"
    echo "${YELLOW}Düzeltme yapılıyor...${NC}"
    
    # Info.plist'i düzelt
    sed -i '' '/<key>CFBundleShortVersionString<\/key>/,/<\/string>/ s/<string>.*<\/string>/<string>1.0.1<\/string>/' ios/HalKompleksi/Info.plist
    sed -i '' '/<key>CFBundleVersion<\/key>/,/<\/string>/ s/<string>.*<\/string>/<string>2<\/string>/' ios/HalKompleksi/Info.plist
    
    echo "${GREEN}✅ Version ve Build düzeltildi${NC}"
else
    echo "${GREEN}✅ Version ve Build doğru!${NC}"
fi
echo ""

# 7. Xcode'u aç
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}ADIM 7: Xcode'u Açma${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${GREEN}Xcode açılıyor...${NC}"
open ios/HalKompleksi.xcworkspace
sleep 3
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}✅ TEMİZLEME TAMAMLANDI!${NC}"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${YELLOW}🎯 XCODE'DA YAPMANZ GEREKENLER:${NC}"
echo ""
echo "1️⃣  ${YELLOW}Sol panelde 'HalKompleksi' projesine tıklayın${NC}"
echo ""
echo "2️⃣  ${YELLOW}TARGETS → HalKompleksi → General${NC}"
echo "    ${GREEN}Version: 1.0.1 olduğunu kontrol edin${NC}"
echo "    ${GREEN}Build: 2 olduğunu kontrol edin${NC}"
echo ""
echo "    ${RED}⚠️  Eğer yanlışsa:${NC}"
echo "    ${YELLOW}→ Version kutusuna: 1.0.1 yazın${NC}"
echo "    ${YELLOW}→ Build kutusuna: 2 yazın${NC}"
echo ""
echo "3️⃣  ${YELLOW}Product → Clean Build Folder (⌘ + ⇧ + K)${NC}"
echo ""
echo "4️⃣  ${YELLOW}Üst toolbar'da 'Any iOS Device (arm64)' seçin${NC}"
echo "    ${RED}(Simulator değil!)${NC}"
echo ""
echo "5️⃣  ${YELLOW}Product → Archive${NC}"
echo "    ${GREEN}Build ~5-15 dakika sürecek${NC}"
echo ""
echo "6️⃣  ${YELLOW}Archive tamamlanınca:${NC}"
echo "    → Distribute App"
echo "    → App Store Connect"
echo "    → Upload"
echo "    → Next → Next → Upload"
echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${GREEN}💡 İPUCU:${NC}"
echo "Archive yapmadan önce ${YELLOW}Clean Build Folder${NC} yapmayı unutmayın!"
echo "Bu, eski cache'lerin kullanılmamasını garanti eder."
echo ""
echo "${GREEN}✨ Başarılar!${NC}"
echo ""


