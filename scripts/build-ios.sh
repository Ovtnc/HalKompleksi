#!/bin/bash

# iOS Build Script for Hal Kompleksi
# Optimized for production builds

set -e

echo "🚀 Starting iOS build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf ios/build
rm -rf ios/DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData

# Clear Metro cache
echo "🗑️ Clearing Metro cache..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 5
kill $METRO_PID 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --silent

# Type checking
echo "🔍 Running type check..."
npx tsc --noEmit

# Linting
echo "🔧 Running linter..."
npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0

# Prebuild
echo "🏗️ Running prebuild..."
npx expo prebuild --platform ios --clean

# Install iOS dependencies
echo "📱 Installing iOS dependencies..."
cd ios
pod install --repo-update

# Build iOS
echo "🍎 Building iOS app..."
xcodebuild \
  -workspace HalKompleksi.xcworkspace \
  -scheme HalKompleksi \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath HalKompleksi.xcarchive \
  archive

echo "✅ iOS build completed successfully!"
echo "📁 Archive location: ios/HalKompleksi.xcarchive"
