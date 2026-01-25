#!/bin/bash
# Add SSL to halkompleksi.com nginx configuration

DOMAIN="halkompleksi.com"
CONFIG_FILE="/etc/nginx/sites-available/$DOMAIN"
SSL_CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/$DOMAIN/privkey.pem"

echo "🔍 Checking SSL certificate..."

if [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ]; then
    echo "✅ SSL certificate found"
    
    # Backup existing config
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d-%H%M%S)"
    
    # Check if HTTPS is already configured
    if grep -q "listen 443 ssl" "$CONFIG_FILE"; then
        echo "ℹ️  HTTPS already configured"
        exit 0
    fi
    
    echo "🔧 Adding HTTPS configuration..."
    
    # Create new config with HTTPS
    cat > "$CONFIG_FILE" <<'NGINX_EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name halkompleksi.com www.halkompleksi.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name halkompleksi.com www.halkompleksi.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/halkompleksi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/halkompleksi.com/privkey.pem;
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
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
        try_files $uri $uri/ /index.html;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINX_EOF
    
    echo "✅ HTTPS configuration added"
    
    # Test nginx
    echo "🧪 Testing nginx configuration..."
    if nginx -t; then
        echo "✅ Nginx configuration is valid"
        echo "🔄 Reloading nginx..."
        systemctl reload nginx
        echo "✅ Done! HTTPS is now enabled"
    else
        echo "❌ Nginx configuration test failed!"
        # Restore backup
        mv "$CONFIG_FILE.backup."* "$CONFIG_FILE" 2>/dev/null || true
        exit 1
    fi
else
    echo "❌ SSL certificate not found!"
    echo "💡 Run: sudo certbot --nginx -d $DOMAIN"
    exit 1
fi

