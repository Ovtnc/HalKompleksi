#!/bin/bash
# Sunucuda çalıştırılacak KESIN email düzeltme scripti

set -e  # Hata durumunda dur

echo "🔧 EMAIL YAPILANDIRMASI KESIN ÇÖZÜM"
echo "===================================="

cd /var/www/hal-kompleksi/backend

# 1. .env dosyasını kontrol et ve güncelle
echo ""
echo "📋 1. .env dosyası kontrol ediliyor..."
if [ ! -f ".env" ]; then
    echo "❌ .env dosyası bulunamadı!"
    exit 1
fi

# Email bilgilerini kontrol et
EMAIL_USER=$(grep "^EMAIL_USER=" .env | cut -d'=' -f2)
EMAIL_PASS=$(grep "^EMAIL_PASS=" .env | cut -d'=' -f2)

echo "Mevcut EMAIL_USER: $EMAIL_USER"
echo "Mevcut EMAIL_PASS: ${EMAIL_PASS:0:4}****"

# Email bilgilerini güncelle
sed -i 's/^EMAIL_USER=.*/EMAIL_USER=destek.halkompleksi@gmail.com/' .env
sed -i 's/^EMAIL_PASS=.*/EMAIL_PASS=pvtybbzlqlnhllpg/' .env

# Production ayarları
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://halkompleksi.com|' .env

echo "✅ .env dosyası güncellendi"

# 2. ecosystem.config.js'i güncelle
echo ""
echo "📋 2. ecosystem.config.js güncelleniyor..."

cat > ecosystem.config.js << 'EOF'
// Load .env file directly
const path = require('path');
const fs = require('fs');

// Read .env file directly to ensure values are loaded
const envPath = path.join(__dirname, '.env');
let envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  });
}

module.exports = {
  apps: [{
    name: 'hal-kompleksi-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,
      MONGODB_URI: envVars.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi',
      JWT_SECRET: envVars.JWT_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      EMAIL_USER: envVars.EMAIL_USER || process.env.EMAIL_USER || 'destek.halkompleksi@gmail.com',
      EMAIL_PASS: envVars.EMAIL_PASS || process.env.EMAIL_PASS || ''
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

echo "✅ ecosystem.config.js güncellendi"

# 3. Kontrol
echo ""
echo "📋 3. Kontroller..."
echo "EMAIL_USER: $(grep "^EMAIL_USER=" .env | cut -d'=' -f2)"
echo "EMAIL_PASS: $(grep "^EMAIL_PASS=" .env | cut -d'=' -f2 | cut -c1-4)****"
echo "NODE_ENV: $(grep "^NODE_ENV=" .env | cut -d'=' -f2)"

# 4. PM2'yi tamamen durdur ve sil
echo ""
echo "🛑 4. PM2 durduruluyor..."
cd /var/www/hal-kompleksi
pm2 stop hal-kompleksi-backend 2>/dev/null || true
pm2 delete hal-kompleksi-backend 2>/dev/null || true
sleep 3

# 5. PM2'yi yeniden başlat
echo ""
echo "🚀 5. PM2 yeniden başlatılıyor..."
cd backend
pm2 start ecosystem.config.js --env production

# 6. Bekle ve kontrol
echo ""
echo "⏳ 6. Bekleniyor (5 saniye)..."
sleep 5

# 7. PM2 durumu
echo ""
echo "📊 7. PM2 durumu:"
pm2 status

# 8. Logları kontrol et
echo ""
echo "📋 8. Email configuration logları:"
cd ..
pm2 logs hal-kompleksi-backend --lines 50 --nostream | grep -i "email\|📧\|configuration\|hasEmail" | tail -10 || echo "Log bulunamadı"

# 9. PM2 environment variables kontrolü
echo ""
echo "📋 9. PM2 environment variables:"
pm2 env 0 | grep -i email || echo "EMAIL variables görünmüyor"

echo ""
echo "===================================="
echo "✅ İŞLEM TAMAMLANDI!"
echo ""
echo "🧪 Test için şifre sıfırlama isteği gönderebilirsiniz."
echo "📧 Email gönderen: destek.halkompleksi@gmail.com"
