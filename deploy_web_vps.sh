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
if [ ! -f "$APP_DIR/.env.local" ] || grep -q "your-project" "$APP_DIR/.env.local"; then
    cat << 'ENVEOF' > "$APP_DIR/.env.local"
NEXT_PUBLIC_SUPABASE_URL=https://wrbzwjriruttagqufalr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYnp3anJpcnV0dGFncXVmYWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzODA3MTksImV4cCI6MjEwNjk1NjcxOX0.WLXn-Er7cOwydeMBZsgKuWpt2dhqR0mZICaTG5Zf2-8
NEXT_PUBLIC_SITE_URL=https://tradingsims.my.id
ENVEOF
    echo "✅ .env.local telah dikonfigurasi dengan koneksi Supabase Cloud aktif!"
fi

echo "📦 [4/6] Menginstall package dan melakukan build Next.js..."
cd "$APP_DIR"
npm install --legacy-peer-deps
npm run build

echo "⚡ [5/6] Menjalankan TradeSims dengan PM2 (Auto-start on boot)..."
pm2 delete tradingsims 2>/dev/null || true
pm2 start npm --name "tradingsims" -- start -- -p 3000
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "🌐 [6/6] Mengonfigurasi Nginx Reverse Proxy..."
mkdir -p /etc/nginx/conf.d /etc/nginx/sites-available /etc/nginx/sites-enabled 2>/dev/null || true

cat << 'EOF' > /etc/nginx/conf.d/tradingsims.conf
server {
    listen 80;
    server_name tradingsims.my.id www.tradingsims.my.id;

    client_max_body_size 50M;

    # Kompresi Gzip untuk loading kilat
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_bypass 1;
        proxy_no_cache 1;
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
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
    }
}
EOF

# Link ke sites-enabled jika menggunakan struktur sites-available
if [ -d /etc/nginx/sites-available ]; then
    cp /etc/nginx/conf.d/tradingsims.conf /etc/nginx/sites-available/tradingsims
    ln -sf /etc/nginx/sites-available/tradingsims /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
fi

nginx -t 2>/dev/null || true
systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || nginx -s reload 2>/dev/null || true

echo ""
echo "=========================================================================="
echo "✅ DEPLOYMENT BERHASIL!"
echo "👉 Website aktif di port 3000 dan diteruskan via Nginx."
echo "👉 Untuk mengaktifkan SSL (HTTPS) gratis via Certbot, jalankan:"
echo "   certbot --nginx -d tradingsims.my.id -d www.tradingsims.my.id --non-interactive --agree-tos -m admin@tradingsims.my.id"
echo "=========================================================================="
