#!/bin/bash

# Deployment script for app.ssgile.com subdomain
# This script builds and deploys the web application

set -e

echo "🚀 Starting deployment to app.ssgile.com..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SUBDOMAIN="app.ssgile.com"
BUILD_DIR="dist"
DEPLOY_DIR="/var/www/app.ssgile.com"
BACKUP_DIR="/var/www/backups/app.ssgile.com"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script requires sudo privileges${NC}"
    echo "Please run: sudo ./deploy-ssgile.sh"
    exit 1
fi

# Navigate to web directory
cd "$(dirname "$0")" || exit
echo -e "${GREEN}📁 Current directory: $(pwd)${NC}"

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm ci --silent

# Build the application
echo -e "${GREEN}🏗️  Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed! dist directory not found.${NC}"
    exit 1
fi

# Create backup directory
echo -e "${GREEN}💾 Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$BACKUP_NAME" || true
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/$BACKUP_NAME${NC}"
fi

# Create deploy directory
echo -e "${GREEN}📂 Creating deploy directory...${NC}"
mkdir -p "$DEPLOY_DIR"

# Copy build files
echo -e "${GREEN}📋 Copying build files...${NC}"
cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"

# Set permissions
echo -e "${GREEN}🔐 Setting permissions...${NC}"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# Create nginx configuration
echo -e "${GREEN}⚙️  Creating nginx configuration...${NC}"
cat > "/etc/nginx/sites-available/app.ssgile.com" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name app.ssgile.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.ssgile.com;

    # SSL Configuration (update with your certificate paths)
    ssl_certificate /etc/letsencrypt/live/app.ssgile.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.ssgile.com/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Root directory
    root $DEPLOY_DIR;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass https://halkompleksi.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # SPA routing - all routes to index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Enable site
echo -e "${GREEN}🔗 Enabling nginx site...${NC}"
ln -sf /etc/nginx/sites-available/app.ssgile.com /etc/nginx/sites-enabled/

# Test nginx configuration
echo -e "${GREEN}🧪 Testing nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    exit 1
fi

# Reload nginx
echo -e "${GREEN}🔄 Reloading nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application is available at: https://app.ssgile.com${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Set up SSL certificate: sudo certbot --nginx -d app.ssgile.com"
echo "2. Update DNS: Add A record for app.ssgile.com pointing to your server IP"
echo "3. Verify deployment: curl -I https://app.ssgile.com"

