#!/bin/bash

# Git-based deployment script for app.ssgile.com
# This script runs on the server and pulls from git, builds and deploys

set -e

echo "🚀 Starting Git-based deployment to app.ssgile.com..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUBDOMAIN="app.ssgile.com"
PROJECT_DIR="/opt/hal-kompleksi"
WEB_DIR="$PROJECT_DIR/web"
BUILD_DIR="$WEB_DIR/dist"
DEPLOY_DIR="/var/www/app.ssgile.com"
BACKUP_DIR="/var/www/backups/app.ssgile.com"
GIT_REPO="https://github.com/Ovtnc/HalKompleksi.git"
GIT_BRANCH="${GIT_BRANCH:-main}"  # Default to main branch

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script requires sudo privileges${NC}"
    echo "Please run: sudo ./deploy-ssgile-git.sh"
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

# Check if SSL certificate exists
SSL_CERT="/etc/letsencrypt/live/app.ssgile.com/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/app.ssgile.com/privkey.pem"
HAS_SSL=false

if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
    HAS_SSL=true
    echo -e "${GREEN}✅ SSL certificate found${NC}"
else
    echo -e "${YELLOW}⚠️  SSL certificate not found. Will create HTTP-only configuration.${NC}"
    echo -e "${YELLOW}   Run 'sudo certbot --nginx -d app.ssgile.com' after DNS is configured.${NC}"
fi

# Create nginx configuration if it doesn't exist
if [ ! -f "/etc/nginx/sites-available/app.ssgile.com" ]; then
    echo -e "${GREEN}⚙️  Creating nginx configuration...${NC}"
    
    if [ "$HAS_SSL" = true ]; then
        # HTTPS configuration
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

    # SSL Configuration
    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
    
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
    else
        # HTTP-only configuration (for initial setup)
        cat > "/etc/nginx/sites-available/app.ssgile.com" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name app.ssgile.com;

    # Root directory
    root $DEPLOY_DIR;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

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
    fi
else
    echo -e "${YELLOW}ℹ️  Nginx configuration already exists${NC}"
    
    # If SSL certificate exists but config doesn't have it, update config
    if [ "$HAS_SSL" = true ]; then
        if ! grep -q "ssl_certificate" "/etc/nginx/sites-available/app.ssgile.com"; then
            echo -e "${YELLOW}⚠️  SSL certificate found but config doesn't use it.${NC}"
            echo -e "${YELLOW}   Please update nginx config manually or run: sudo certbot --nginx -d app.ssgile.com${NC}"
        fi
    fi
fi

# Enable site
echo -e "${GREEN}🔗 Enabling nginx site...${NC}"
ln -sf /etc/nginx/sites-available/app.ssgile.com /etc/nginx/sites-enabled/ 2>/dev/null || true

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
echo -e "${GREEN}🌐 Application is available at: https://app.ssgile.com${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Info:${NC}"
echo "  - Branch: $GIT_BRANCH"
echo "  - Commit: $(git log -1 --oneline)"
echo "  - Deploy Directory: $DEPLOY_DIR"
echo "  - Backup Directory: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}📝 Next steps (if not done already):${NC}"
echo "1. Set up SSL certificate: sudo certbot --nginx -d app.ssgile.com"
echo "2. Update DNS: Add A record for app.ssgile.com pointing to your server IP"
echo "3. Verify deployment: curl -I https://app.ssgile.com"

