#!/bin/bash
# Fix Nginx uploads route for halkompleksi.com

set -e

CONFIG_FILE="/etc/nginx/sites-available/halkompleksi.com"
UPLOADS_DIR="/var/www/hal-kompleksi/backend/uploads"

echo "🔧 Fixing Nginx uploads configuration..."

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

# Backup config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d-%H%M%S)"

# Check if SSL certificate exists
SSL_CERT="/etc/letsencrypt/live/halkompleksi.com/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/halkompleksi.com/privkey.pem"
HAS_SSL=false

if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
    HAS_SSL=true
    echo "✅ SSL certificate found"
fi

# Read current config
CURRENT_CONFIG=$(cat "$CONFIG_FILE")

# Check if we need to update uploads location
if grep -q "location /uploads/" "$CONFIG_FILE"; then
    echo "📋 Current /uploads/ configuration:"
    grep -A 5 "location /uploads/" "$CONFIG_FILE"
    
    # Fix uploads location - use exact match for /uploads/ and ensure proper alias
    if [ "$HAS_SSL" = true ]; then
        # HTTPS configuration
        cat > "$CONFIG_FILE" <<EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name halkompleksi.com www.halkompleksi.com;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name halkompleksi.com www.halkompleksi.com;

    # SSL Configuration
    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
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

    # Root directory for web app
    root /var/www/halkompleksi.com;
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

    # Uploads - FIXED: Use exact path matching
    location /uploads/ {
        alias $UPLOADS_DIR/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # Allow all image types
        types {
            image/jpeg jpg jpeg;
            image/png png;
            image/gif gif;
            image/webp webp;
            image/svg+xml svg;
        }
        default_type application/octet-stream;
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
        # HTTP-only configuration
        cat > "$CONFIG_FILE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name halkompleksi.com www.halkompleksi.com;

    # Root directory for web app
    root /var/www/halkompleksi.com;
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

    # Uploads - FIXED: Use exact path matching
    location /uploads/ {
        alias $UPLOADS_DIR/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # Allow all image types
        types {
            image/jpeg jpg jpeg;
            image/png png;
            image/gif gif;
            image/webp webp;
            image/svg+xml svg;
        }
        default_type application/octet-stream;
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
    fi
    
    echo "✅ Updated Nginx configuration"
else
    echo "⚠️  /uploads/ location not found in config, adding it..."
fi

# Fix file permissions
echo "🔐 Fixing file permissions..."
chown -R www-data:www-data "$UPLOADS_DIR"
chmod -R 755 "$UPLOADS_DIR"

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx
echo "✅ Done!"

# Test image URL
echo ""
echo "🧪 Testing image URL..."
curl -I "https://halkompleksi.com/uploads/products/product-1763787894713-381741863.jpg" 2>&1 | grep -E "HTTP|200|404" || echo "⚠️  Could not test (might be HTTP-only config)"

