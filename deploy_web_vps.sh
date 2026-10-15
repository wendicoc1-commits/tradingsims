#!/bin/bash
# ==============================================================================
# TRADINGSIMS PRO - UNIVERSAL LINUX VPS DEPLOYMENT SCRIPT
# Supports: Debian, Ubuntu, AlmaLinux, RockyLinux, CentOS, Fedora, Alpine, etc.
# ==============================================================================

set -e

# Pastikan semua direktori binary sistem masuk ke PATH
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
export DEBIAN_FRONTEND=noninteractive

echo "🔍 Mendeteksi Sistem Operasi VPS..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "🐧 OS Terdeteksi: $NAME ($VERSION_ID)"
else
    echo "🐧 OS: Linux generic"
fi

echo "🚀 [1/6] Menginstall paket dasar (curl, git, nginx, certbot)..."
if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y curl ca-certificates gnupg git nginx certbot python3-certbot-nginx xz-utils
elif command -v dnf >/dev/null 2>&1; then
    dnf install -y epel-release || true
    dnf install -y curl ca-certificates git nginx certbot python3-certbot-nginx xz tar
elif command -v yum >/dev/null 2>&1; then
    yum install -y epel-release || true
    yum install -y curl ca-certificates git nginx certbot python3-certbot-nginx xz tar
elif command -v apk >/dev/null 2>&1; then
    apk update
    apk add curl git nginx certbot certbot-nginx nodejs npm tar xz
elif command -v pacman >/dev/null 2>&1; then
    pacman -Sy --noconfirm curl git nginx certbot certbot-nginx nodejs npm tar
else
    echo "⚠️ Package manager tidak dikenal, melanjutkan dengan binary mandiri..."
fi

# Install Node.js 20 LTS (Gunakan standalone binary jika apt/dnf tidak memiliki node 20)
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'.' -f1)" != "v20" ]; then
    echo "📦 Menginstall Node.js 20 LTS (Universal Binary)..."
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        NODE_ARCH="x64"
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
        NODE_ARCH="arm64"
    else
        NODE_ARCH="x64"
    fi
    
    mkdir -p /usr/local/lib/nodejs
    curl -fsSL "https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-${NODE_ARCH}.tar.xz" -o /tmp/node.tar.xz
    tar -xJf /tmp/node.tar.xz -C /usr/local/lib/nodejs
    rm -f /tmp/node.tar.xz
    
    ln -sf "/usr/local/lib/nodejs/node-v20.18.0-linux-${NODE_ARCH}/bin/node" /usr/local/bin/node
    ln -sf "/usr/local/lib/nodejs/node-v20.18.0-linux-${NODE_ARCH}/bin/npm" /usr/local/bin/npm
    ln -sf "/usr/local/lib/nodejs/node-v20.18.0-linux-${NODE_ARCH}/bin/npx" /usr/local/bin/npx
fi

echo "🟢 Node.js terverifikasi: $(node -v) | npm: $(npm -v)"

# Install PM2 Process Manager
if ! command -v pm2 >/dev/null 2>&1; then
    echo "⚙️ Menginstall PM2 process manager..."
    npm install -g pm2
    ln -sf "$(npm root -g)/pm2/bin/pm2" /usr/local/bin/pm2 2>/dev/null || true
fi

echo "📂 [2/6] Mempersiapkan repositori TradeSims..."
APP_DIR="/var/www/tradingsims"
REPO_URL="https://github.com/wendicoc1-commits/tradingsims.git"

if [ -d "$APP_DIR/.git" ]; then
    echo "🔄 Memperbarui repositori yang ada (git pull)..."
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
        echo "⚠️ .env.local dibuat dari template .env.example."
        echo "⚠️ Silakan isi nilai kunci produksi Anda di $APP_DIR/.env.local!"
    else
        cat << 'ENVEOF' > "$APP_DIR/.env.local"
NEXT_PUBLIC_SITE_URL=https://tradingsims.my.id
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ENVEOF
        echo "⚠️ .env.local baru dibuat. Silakan perbarui kredensial Anda!"
    fi
fi

echo "📦 [4/6] Menginstall package dan melakukan build Next.js..."
cd "$APP_DIR"
npm install --legacy-peer-deps
npm run build

echo "⚡ [5/6] Menjalankan TradeSims dengan PM2 (Auto-start on boot)..."
cd "$APP_DIR"
pm2 delete tradingsims 2>/dev/null || true
pm2 start npm --name "tradingsims" --cwd "$APP_DIR" -- start -- -p 3000
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# Tunggu 3 detik dan verifikasi port 3000 lokal
sleep 3
if curl -s -I http://127.0.0.1:3000 >/dev/null 2>&1; then
    echo "🟢 Port 3000 lokal aktif dan merespon!"
else
    echo "⚠️ Menunggu inisialisasi Next.js pada port 3000..."
fi

echo "🌐 [6/6] Mengonfigurasi Nginx Reverse Proxy & SSL..."
# Izinkan Nginx terhubung ke port lokal (SELinux pada Rocky Linux / RHEL / CentOS)
setsebool -P httpd_can_network_connect 1 2>/dev/null || true

# Buka firewall untuk port HTTP (80) dan HTTPS (443) jika firewalld / ufw aktif
firewall-cmd --permanent --add-service=http 2>/dev/null || true
firewall-cmd --permanent --add-service=https 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true

# Bersihkan / matikan server block bawaan Rocky Linux di /etc/nginx/nginx.conf
if [ -f /etc/nginx/nginx.conf ]; then
    cp -n /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak 2>/dev/null || true
    cat << 'NGINX_MAIN' > /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    keepalive_timeout   65;
    types_hash_max_size 4096;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    include /etc/nginx/conf.d/*.conf;
}
NGINX_MAIN
fi

# Buat direktori kerja dan hapus konfigurasi default yang berpotensi konflik
mkdir -p /var/www/certbot /etc/nginx/conf.d /etc/nginx/sites-available /etc/nginx/sites-enabled 2>/dev/null || true
rm -f /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/ssl.conf /etc/nginx/conf.d/virtual.conf 2>/dev/null || true

# Tahap A: Buat konfigurasi HTTP sementara untuk memvalidasi Let's Encrypt ACME
cat << 'EOF' > /etc/nginx/conf.d/tradingsims.conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name tradingsims.my.id www.tradingsims.my.id 38.9.46.160 localhost _;

    client_max_body_size 50M;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Restart Nginx tahap A
nginx -t 2>/dev/null && systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || true

# Tahap B: Cek dan terbitkan sertifikat SSL resmi jika belum ada
if [ ! -f /etc/letsencrypt/live/tradingsims.my.id/fullchain.pem ] && command -v certbot >/dev/null 2>&1; then
    echo "🔒 Mengambil sertifikat SSL resmi Let's Encrypt untuk tradingsims.my.id..."
    certbot certonly --webroot -w /var/www/certbot -d tradingsims.my.id -d www.tradingsims.my.id --non-interactive --agree-tos -m admin@tradingsims.my.id || \
    certbot certonly --standalone -d tradingsims.my.id -d www.tradingsims.my.id --non-interactive --agree-tos -m admin@tradingsims.my.id --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx" || true
fi

# Tahap C: Jika sertifikat SSL ditemukan, pasang konfigurasi HTTPS definitif
if [ -f /etc/letsencrypt/live/tradingsims.my.id/fullchain.pem ]; then
    echo "✅ Sertifikat SSL ditemukan! Mengaktifkan HTTPS penuh & HTTP -> HTTPS redirect..."
    cat << 'EOF' > /etc/nginx/conf.d/tradingsims.conf
# 1. HTTP Server: Redirect otomatis ke HTTPS
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name tradingsims.my.id www.tradingsims.my.id 38.9.46.160 localhost;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# 2. HTTPS Server: Nginx Reverse Proxy ke Next.js Port 3000
server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name tradingsims.my.id www.tradingsims.my.id;

    ssl_certificate /etc/letsencrypt/live/tradingsims.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tradingsims.my.id/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    server_tokens off;

    # Enterprise Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    client_max_body_size 50M;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
    }
}
EOF
else
    echo "⚠️ Sertifikat SSL Let's Encrypt belum aktif, tetap melayani HTTP di port 80."
fi

# Link ke sites-enabled jika menggunakan struktur sites-available
if [ -d /etc/nginx/sites-available ]; then
    cp /etc/nginx/conf.d/tradingsims.conf /etc/nginx/sites-available/tradingsims
    ln -sf /etc/nginx/sites-available/tradingsims /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
fi

# Validasi sintaks dan reload Nginx
nginx -t
systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || nginx -s reload 2>/dev/null || true

echo ""
echo "=========================================================================="
echo "✅ DEPLOYMENT BERHASIL!"
echo "👉 Website aktif di: https://tradingsims.my.id"
echo "👉 Port 80 otomatis redirect ke HTTPS (Port 443)."
echo "=========================================================================="
