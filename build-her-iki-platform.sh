#!/bin/bash

echo "🚀 HAL KOMPLEKSİ - HER İKİ PLATFORM BUILD"
echo "========================================"
echo ""

echo "📋 Version: 1.0.7"
echo "📋 iOS Build: 8"
echo "📋 Android versionCode: 2"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 ANDROID BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/okanvatanci/Desktop/hal-kompleksi/android

echo "🧹 Cleaning..."
./gradlew clean

echo ""
echo "📦 Building AAB (Google Play)..."
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ANDROID BUILD BAŞARILI!"
    echo "📦 AAB: android/app/build/outputs/bundle/release/app-release.aab"
    AAB_SIZE=$(ls -lh app/build/outputs/bundle/release/app-release.aab | awk '{print $5}')
    echo "📊 Boyut: $AAB_SIZE"
    echo ""
    open app/build/outputs/bundle/release/
else
    echo ""
    echo "❌ Android build başarısız!"
fi

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 iOS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧹 Cleaning iOS cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ios/build

echo ""
echo "📦 Installing pods..."
cd ios
pod install
cd ..

echo ""
echo "📱 Opening Xcode..."
open ios/HalKompleksi.xcworkspace

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ HAZIRLIK TAMAMLANDI!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🤖 ANDROID:"
echo "   ✅ AAB hazır: android/app/build/outputs/bundle/release/app-release.aab"
echo "   → Google Play Console'a yükleyin"
echo ""
echo "🍎 iOS (Xcode'da):"
echo "   1. General → Version: 1.0.7, Build: 8"
echo "   2. Any iOS Device seçin"
echo "   3. Product → Clean Build Folder"
echo "   4. Product → Archive"
echo "   5. Distribute App → Upload"
echo ""
echo "✨ Başarılar!"
echo ""
