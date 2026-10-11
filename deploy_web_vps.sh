#!/bin/bash
# ==============================================================================
# TRADINGSIMS PRO - FULL PRODUCTION VPS DEPLOYMENT SCRIPT
# Domain: tradingsims.my.id & www.tradingsims.my.id
# ==============================================================================

set -e

echo "🚀 [1/6] Memperbarui sistem dan menginstall dependensi (Node.js 20, Git, Nginx, Certbot)..."
if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y curl git nginx certbot python3-certbot-nginx
elif command -v dnf >/dev/null 2>&1; then
    dnf install -y curl git nginx certbot python3-certbot-nginx
fi

# Install Node.js 20 LTS jika belum terpasang
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1)" != "v20" ]; then
    echo "📦 Menginstall Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs || dnf install -y nodejs
fi

# Install PM2 global
if ! command -v pm2 >/dev/null 2>&1; then
    echo "⚙️ Menginstall PM2 process manager..."
    npm install -g pm2
fi

echo "📂 [2/6] Mempersiapkan repositori TradeSims..."
APP_DIR="/var/www/tradingsims"
REPO_URL="https://github.com/wendicoc1-commits/tradingsims.git"

if [ -d "$APP_DIR/.git" ]; then
    echo "🔄 Repositori sudah ada, menarik pembaruan terbaru (git pull)..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
else
    echo "📥 Mengkloning repositori dari GitHub..."
    mkdir -p /var/www
    cd /var/www
    git clone "$REPO_URL" tradingsims
    cd "$APP_DIR"
fi

echo "🔑 [3/6] Memeriksa file konfigurasi (.env.local)..."
if [ ! -f "$APP_DIR/.env.local" ]; then
    if [ -f "$APP_DIR/.env.example" ]; then
        cp "$APP_DIR/.env.example" "$APP_DIR/.env.local"
        echo "⚠️ .env.local dibuat dari template .env.example. Silakan lengkapi kunci jika diperlukan."
    fi
fi

echo "📦 [4/6] Menginstall package dan melakukan build Next.js..."
cd "$APP_DIR"
npm install --legacy-peer-deps
npm run build

echo "⚡ [5/6] Menjalankan aplikasi dengan PM2 (Auto-restart 24/7)..."
pm2 delete tradingsims 2>/dev/null || true
pm2 start npm --name "tradingsims" -- start -- -p 3000
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "🌐 [6/6] Mengonfigurasi Nginx Reverse Proxy..."
cat << 'EOF' > /etc/nginx/sites-available/tradingsims
server {
    listen 80;
    server_name tradingsims.my.id www.tradingsims.my.id;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
    }
}
EOF

ln -sf /etc/nginx/sites-available/tradingsims /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t
systemctl reload nginx || service nginx reload

echo ""
echo "=========================================================================="
echo "✅ DEPLOYMENT BERHASIL! Website aktif di port 3000 via Nginx."
echo "👉 Untuk mengaktifkan SSL gratis (HTTPS), jalankan perintah:"
echo "   certbot --nginx -d tradingsims.my.id -d www.tradingsims.my.id --non-interactive --agree-tos -m admin@tradingsims.my.id"
echo "=========================================================================="
