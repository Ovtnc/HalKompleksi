#!/bin/bash
# Fix nginx SSL certificate issue for app.ssgile.com

CONFIG_FILE="/etc/nginx/sites-available/app.ssgile.com"
SSL_CERT="/etc/letsencrypt/live/app.ssgile.com/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/app.ssgile.com/privkey.pem"

if [ -f "$CONFIG_FILE" ]; then
    # Check if SSL cert exists
    if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
        echo "⚠️  SSL certificate not found, updating config to HTTP-only..."
        
        # Backup existing config
        cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d-%H%M%S)"
        
        # Create HTTP-only config
        cat > "$CONFIG_FILE" <<'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name app.ssgile.com;

    root /var/www/app.ssgile.com;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /api/ {
        proxy_pass https://halkompleksi.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINX_EOF
        echo "✅ Updated to HTTP-only configuration"
    else
        echo "✅ SSL certificate exists, config should be fine"
    fi
else
    echo "ℹ️  Config file not found: $CONFIG_FILE"
fi

# Test nginx config
echo ""
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
    echo "✅ Done!"
else
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

