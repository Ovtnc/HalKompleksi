#!/bin/bash

# Deployment script for halkompleksi.com (main domain)
# This script deploys the web app to the main domain

set -e

echo "🚀 Starting deployment to halkompleksi.com..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="halkompleksi.com"
PROJECT_DIR="/opt/hal-kompleksi"
WEB_DIR="$PROJECT_DIR/web"
BUILD_DIR="$WEB_DIR/dist"
DEPLOY_DIR="/var/www/halkompleksi.com"
BACKUP_DIR="/var/www/backups/halkompleksi.com"
GIT_REPO="https://github.com/Ovtnc/HalKompleksi.git"
GIT_BRANCH="${GIT_BRANCH:-main}"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script requires sudo privileges${NC}"
    echo "Please run: sudo ./deploy-main-domain.sh"
    exit 1
fi

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required commands
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed. Please install git first.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}📁 Creating project directory...${NC}"
    mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR" || exit

# Clone or update repository
if [ ! -d ".git" ]; then
    echo -e "${GREEN}📥 Cloning repository...${NC}"
    git clone "$GIT_REPO" .
else
    echo -e "${GREEN}🔄 Updating repository...${NC}"
    git fetch origin
    git reset --hard "origin/$GIT_BRANCH"
    git clean -fd
    echo -e "${GREEN}✅ Repository updated to latest commit${NC}"
    git log -1 --oneline
fi

# Navigate to web directory
if [ ! -d "$WEB_DIR" ]; then
    echo -e "${RED}❌ Web directory not found: $WEB_DIR${NC}"
    exit 1
fi

cd "$WEB_DIR" || exit
echo -e "${GREEN}📁 Current directory: $(pwd)${NC}"

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
if [ -f "package-lock.json" ]; then
    npm ci --silent --production=false
else
    npm install --silent --production=false
fi

# Build the application
echo -e "${GREEN}🏗️  Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed! dist directory not found.${NC}"
    exit 1
fi

# Check if dist directory has files
if [ -z "$(ls -A $BUILD_DIR)" ]; then
    echo -e "${RED}❌ Build directory is empty!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Create backup directory
echo -e "${GREEN}💾 Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR)" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$BACKUP_NAME" 2>/dev/null || true
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/$BACKUP_NAME${NC}"
fi

# Create deploy directory
echo -e "${GREEN}📂 Creating deploy directory...${NC}"
mkdir -p "$DEPLOY_DIR"

# Copy build files
echo -e "${GREEN}📋 Copying build files...${NC}"
rsync -av --delete "$BUILD_DIR/" "$DEPLOY_DIR/" || cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"

# Set permissions
echo -e "${GREEN}🔐 Setting permissions...${NC}"
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# Create nginx configuration for main domain (if it doesn't exist)
if [ ! -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    echo -e "${GREEN}⚙️  Creating nginx configuration...${NC}"
    cat > "/etc/nginx/sites-available/$DOMAIN" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Root directory for web app
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

    # API proxy
    location /api/ {
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

    # Uploads
    location /uploads/ {
        alias /var/www/hal-kompleksi/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Privacy policy and terms (from backend)
    location /privacy-policy.html {
        alias /var/www/hal-kompleksi/backend/public/privacy-policy.html;
    }

    location /terms-of-service.html {
        alias /var/www/hal-kompleksi/backend/public/terms-of-service.html;
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
else
    echo -e "${YELLOW}ℹ️  Nginx configuration already exists${NC}"
fi

# Enable site
echo -e "${GREEN}🔗 Enabling nginx site...${NC}"
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/ 2>/dev/null || true

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

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application is available at: https://$DOMAIN${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Info:${NC}"
echo "  - Branch: $GIT_BRANCH"
echo "  - Commit: $(git log -1 --oneline)"
echo "  - Deploy Directory: $DEPLOY_DIR"
echo "  - Backup Directory: $BACKUP_DIR"
echo ""

