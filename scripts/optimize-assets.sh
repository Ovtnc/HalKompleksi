#!/bin/bash

# Asset Optimization Script for Hal Kompleksi
# Optimizes images and other assets for production

set -e

echo "🎨 Starting asset optimization..."

# Create optimized directories
mkdir -p assets/optimized
mkdir -p assets/webp
mkdir -p assets/avif

# Optimize images
echo "📸 Optimizing images..."
if command -v squoosh-cli &> /dev/null; then
  # Optimize with Squoosh
  squoosh-cli --webp auto --avif auto assets/*.png assets/*.jpg assets/*.jpeg
else
  echo "⚠️ Squoosh CLI not found. Install with: npm install -g @squoosh/cli"
fi

# Optimize with ImageMagick if available
if command -v magick &> /dev/null; then
  echo "🔧 Optimizing with ImageMagick..."
  
  # Convert to WebP
  for file in assets/*.{png,jpg,jpeg}; do
    if [ -f "$file" ]; then
      filename=$(basename "$file" | cut -d. -f1)
      magick "$file" -quality 80 "assets/webp/${filename}.webp"
    fi
  done
  
  # Convert to AVIF
  for file in assets/*.{png,jpg,jpeg}; do
    if [ -f "$file" ]; then
      filename=$(basename "$file" | cut -d. -f1)
      magick "$file" -quality 80 "assets/avif/${filename}.avif"
    fi
  done
else
  echo "⚠️ ImageMagick not found. Install for better optimization."
fi

# Optimize SVG files
echo "🎯 Optimizing SVG files..."
if command -v svgo &> /dev/null; then
  svgo assets/*.svg --output assets/optimized/
else
  echo "⚠️ SVGO not found. Install with: npm install -g svgo"
fi

# Generate responsive images
echo "📱 Generating responsive images..."
for file in assets/*.{png,jpg,jpeg}; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" | cut -d. -f1)
    extension="${file##*.}"
    
    # Generate different sizes
    if command -v magick &> /dev/null; then
      magick "$file" -resize 50% "assets/optimized/${filename}_small.${extension}"
      magick "$file" -resize 75% "assets/optimized/${filename}_medium.${extension}"
      cp "$file" "assets/optimized/${filename}_large.${extension}"
    fi
  fi
done

# Create asset manifest
echo "📋 Creating asset manifest..."
cat > assets/manifest.json << EOF
{
  "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "optimized": true,
  "formats": ["webp", "avif", "png", "jpg"],
  "sizes": ["small", "medium", "large"]
}
EOF

echo "✅ Asset optimization completed!"
echo "📁 Optimized assets saved to: assets/optimized/"
echo "📁 WebP assets saved to: assets/webp/"
echo "📁 AVIF assets saved to: assets/avif/"
