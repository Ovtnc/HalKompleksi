#!/bin/bash

# Android Build Script for Hal Kompleksi
# Optimized for production builds

set -e

echo "🚀 Starting Android build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean
rm -rf android/app/build
rm -rf android/.gradle

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
npx expo prebuild --platform android --clean

# Build APK
echo "📱 Building Android APK..."
cd android
./gradlew assembleRelease \
  --no-daemon \
  --parallel \
  --build-cache \
  --configuration-cache

echo "✅ Android build completed successfully!"
echo "📁 APK location: android/app/build/outputs/apk/release/app-release.apk"
