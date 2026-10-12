#!/bin/bash
set -e

echo "=========================================================================="
echo "🔄 MEMPERBARUI TRADESIMS PRO KE VERSI TERBARU..."
echo "=========================================================================="

APP_DIR="/var/www/tradingsims"
cd "$APP_DIR"

echo "📥 [1/4] Mengambil kode terbaru dari GitHub..."
git fetch origin main
git reset --hard origin/main

echo "🧹 [2/4] Membersihkan cache build lama (.next)..."
pm2 stop tradingsims 2>/dev/null || true
rm -rf .next

echo "📦 [3/4] Melakukan build Next.js baru..."
npm run build

echo "⚡ [4/4] Memulai ulang service PM2 & Nginx..."
pm2 restart tradingsims 2>/dev/null || pm2 start npm --name "tradingsims" --cwd "$APP_DIR" -- start -- -p 3000
pm2 save

# Pastikan izin folder dapat diakses Nginx
chmod -R 755 "$APP_DIR/.next" 2>/dev/null || true

# Update konfigurasi Nginx jika diperlukan
if [ -f "$APP_DIR/deploy_web_vps.sh" ]; then
    bash "$APP_DIR/deploy_web_vps.sh" || true
else
    nginx -t && systemctl reload nginx 2>/dev/null || true
fi

echo ""
echo "=========================================================================="
echo "✅ PEMBARUAN SUKSES! TradeSims Pro telah aktif dengan kode terbaru."
echo "👉 Akses: https://tradingsims.my.id"
echo "=========================================================================="
