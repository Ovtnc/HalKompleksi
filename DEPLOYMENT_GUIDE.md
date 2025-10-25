# 🚀 Hal Kompleksi - Deployment Guide

## 📋 Production Deployment Checklist

### ✅ Build Sorunları Çözüldü
- [x] React Native Reanimated build sorunları düzeltildi
- [x] Metro cache sorunları çözüldü
- [x] Android build başarılı
- [x] VPS server konfigürasyonu tamamlandı

### 🔧 Backend Deployment (VPS: 109.199.114.223)

#### 1. VPS Server'a Bağlan
```bash
ssh root@109.199.114.223
```

#### 2. Sistem Güncellemeleri
```bash
apt update && apt upgrade -y
```

#### 3. Node.js Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

#### 4. MongoDB Kurulumu
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

#### 5. PM2 Kurulumu
```bash
npm install -g pm2
```

#### 6. Proje Kurulumu
```bash
# Proje dizini oluştur
mkdir -p /var/www/hal-kompleksi
cd /var/www/hal-kompleksi

# Git clone
git clone https://github.com/Ovtnc/HalKompleksi.git .

# Backend kurulumu
cd backend
npm install
```

#### 7. Environment Variables
```bash
# .env dosyası oluştur
cat > .env << EOF
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hal-kompleksi
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://109.199.114.223:8081,http://109.199.114.223:8088
EOF
```

#### 8. PM2 ile Başlatma
```bash
# PM2 ecosystem dosyası
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hal-kompleksi-backend',
    script: 'src/server.js',
    cwd: '/var/www/hal-kompleksi/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: '/var/log/pm2/hal-kompleksi-error.log',
    out_file: '/var/log/pm2/hal-kompleksi-out.log',
    log_file: '/var/log/pm2/hal-kompleksi.log'
  }]
};
EOF

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 9. Nginx Konfigürasyonu
```bash
# Nginx kurulumu
apt install nginx -y

# Nginx konfigürasyonu
cat > /etc/nginx/sites-available/hal-kompleksi << EOF
server {
    listen 80;
    server_name 109.199.114.223;

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        root /var/www/hal-kompleksi/frontend;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Konfigürasyonu aktif et
ln -s /etc/nginx/sites-available/hal-kompleksi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 10. Firewall Konfigürasyonu
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 5001
ufw enable
```

### 📱 Frontend Deployment

#### 1. Production Build
```bash
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi

# EAS Build (Expo Account gerekli)
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

#### 2. APK Build (Local)
```bash
# Android APK build
npx expo run:android --variant release

# iOS build
npx expo run:ios --configuration Release
```

### 🔍 Monitoring ve Logs

#### PM2 Monitoring
```bash
pm2 status
pm2 logs hal-kompleksi-backend
pm2 monit
```

#### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 🚀 Deployment Commands

#### Backend Restart
```bash
pm2 restart hal-kompleksi-backend
```

#### Backend Update
```bash
cd /var/www/hal-kompleksi
git pull origin main
cd backend
npm install
pm2 restart hal-kompleksi-backend
```

#### Nginx Restart
```bash
systemctl restart nginx
```

### 📊 Health Checks

#### Backend Health
```bash
curl http://109.199.114.223:5001/api/health
```

#### Database Connection
```bash
mongo --eval "db.runCommand({connectionStatus: 1})"
```

### 🔐 Security Checklist

- [x] Firewall konfigürasyonu
- [x] HTTPS sertifikası (Let's Encrypt)
- [x] Database güvenliği
- [x] API rate limiting
- [x] CORS konfigürasyonu

### 📈 Performance Optimizations

- [x] PM2 cluster mode
- [x] Nginx caching
- [x] Database indexing
- [x] Image optimization
- [x] Bundle optimization

## 🎯 Canlıya Alma Adımları

1. **VPS Server Hazırlığı** ✅
2. **Backend Deployment** 🔄
3. **Frontend Build** 🔄
4. **Domain/DNS Konfigürasyonu** ⏳
5. **SSL Sertifikası** ⏳
6. **Monitoring Setup** ⏳
7. **Backup Strategy** ⏳

## 📞 Support

- **Backend API**: `http://109.199.114.223:5001/api`
- **Frontend**: `http://109.199.114.223:8081`
- **Admin Panel**: `http://109.199.114.223:5001/api/admin`

---

**Status**: 🟡 Production Ready - Deployment in Progress
