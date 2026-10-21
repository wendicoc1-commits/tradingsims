#!/bin/bash
set -e

echo "=========================================================================="
echo "🔄 MEMPERBARUI TRADESIMS PRO (ZERO DOWNTIME DEPLOYMENT)..."
echo "=========================================================================="

APP_DIR="/var/www/tradingsims"
cd "$APP_DIR"

# 1. Pastikan swap aktif jika RAM terbatas agar build WASM tidak dihentikan oleh kernel (OOM)
SWAP_TOTAL=$(free -m 2>/dev/null | awk '/^Swap:/ {print $2}' || echo "0")
if [ -z "$SWAP_TOTAL" ] || [ "$SWAP_TOTAL" -lt 1000 ]; then
    echo "💾 [0/3] Menyiapkan swap memory 2GB untuk kestabilan proses build..."
    if [ ! -f /swapfile ]; then
        fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 2>/dev/null || true
        chmod 600 /swapfile 2>/dev/null || true
        mkswap /swapfile 2>/dev/null || true
    fi
    swapon /swapfile 2>/dev/null || true
fi

echo "📥 [1/3] Mengambil kode terbaru dari GitHub..."
git fetch origin main
git reset --hard origin/main

echo "📦 [2/3] Melakukan build Next.js baru di latar belakang (Website tetap aktif)..."
export NODE_OPTIONS="--max-old-space-size=3072"
npm run build

# 📄 Sinkronisasi hasil prerender sitemap ke public/sitemap.xml
if [ -f "$APP_DIR/.next/server/app/sitemap.xml.body" ]; then
    cp -f "$APP_DIR/.next/server/app/sitemap.xml.body" "$APP_DIR/public/sitemap.xml" 2>/dev/null || true
fi

# Pastikan izin folder dapat diakses Nginx
chmod -R 755 "$APP_DIR/.next" 2>/dev/null || true

echo "⚡ [3/3] Melakukan reload PM2 tanpa jeda (Zero-Downtime Reload)..."
pm2 reload tradingsims --update-env 2>/dev/null || pm2 restart tradingsims --update-env 2>/dev/null || pm2 start npm --name "tradingsims" --cwd "$APP_DIR" -- start -- -p 3000
pm2 save

# 🔒 Pastikan port 8002 tertutup di firewall publik VPS
if command -v ufw >/dev/null 2>&1; then
    ufw delete allow 8002/tcp 2>/dev/null || true
fi

# ⚙️ Sinkronisasi Quant Bridge Python ke /root/quant_engine/
mkdir -p /root/quant_engine
if [ -f "$APP_DIR/quant_engine/bridge.py" ]; then
    cp -f "$APP_DIR/quant_engine/bridge.py" /root/quant_engine/bridge.py 2>/dev/null || true
fi
systemctl restart quant-bridge 2>/dev/null || true

# Reload Nginx jika konfigurasi valid
nginx -t && systemctl reload nginx 2>/dev/null || true

echo ""
echo "=========================================================================="
echo "✅ PEMBARUAN SUKSES! TradeSims Pro live tanpa downtime."
echo "👉 Akses: https://tradingsims.my.id"
echo "=========================================================================="
