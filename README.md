# 📈 TradingSims - Indonesia Stock & Crypto Trading Simulator Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **TradingSims** adalah platform simulasi perdagangan saham Indonesia (IDX / BEI) dan mata uang kripto modern berbasis Next.js 16, Lightweight Charts, dan Supabase. Dirancang untuk edukasi finansial tanpa risiko modal nyata, dilengkapi analisis fundamental, kalkulator investasi interaktif, dan arsitektur programmatic SEO berdaya jelajah tinggi.

---

## 🌟 Fitur Utama (Core Features)

### 1. 📊 Simulasi Trading & Paper Trading Realistis
- **Virtual Portfolio**: Saldo modal virtual awal Rp 100.000.000 untuk simulasi order saham realistik.
- **Mekanisme Pasar Saham BEI**: Dukungan Order Type (`LIMIT` & `MARKET`), perhitungan fraksi harga, lot saham (1 lot = 100 lembar), serta kalkulasi fee beli/jual broker.
- **Interactive Technical Chart**: Ditenagai oleh TradingView [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) dengan multi-timeframe (1D, 1W, 1M, 1Y, All) dan candle interaktif.
- **Watchlist & Order Book**: Manajemen daftar pantau instan dan visualisasi bid/offer real-time.

### 2. 🧠 Analisis Fundamental & Diagnosa Saham
- **Piotroski F-Score (0-9)**: Evaluasi kesehatan finansial 9 kriteria (Profitability, Leverage, Operating Efficiency).
- **Benjamin Graham Fair Value Calculator**: Penaksiran nilai wajar intrinsik saham secara otomatis.
- **Financial Health Scorecard**: Ringkasan naratif otomatis mengenai valuasi, margin laba, dan rasio solvabilitas.

### 3. 🧮 Suite Kalkulator Finansial Interaktif
- **Kalkulator Dividen & Yield**: Simulasi nominal cash dividen berdasarkan kepemilikan lot dan yield tahunan.
- **Kalkulator CAGR (Compound Annual Growth Rate)**: Proyeksi pertumbuhan investasi majemuk jangka panjang.
- **Kalkulator Average Down & Risk/Reward**: Rencana manajemen modal dan titik *break-even*.

### 4. 🚀 Kalender Pasar & Sentimen
- **Kalender Dividen & Histori**: Tracking tanggal Cum Date, Ex Date, Recording Date, dan Payment Date.
- **Kalender IPO Saham**: Pantau prospektus, jadwal penawaran awal (bookbuilding), dan harga perdana emiten baru.
- **Crypto Fear & Greed Index**: Gauge meter sentimen pasar kripto harian untuk BTC, ETH, dan SOL.
- **Programmatic Market Wrap**: Pantauan otomatis Top Gainers, Top Losers, Foreign Net Flow, dan LQ45.

### 5. 🔍 Programmatic SEO & E-E-A-T Architecture
- **1.300+ Programmatic Landing Pages**: URL dinamis terindeks untuk emiten saham BEI, kamus finansial, kalkulator, dan perbandingan emiten.
- **Schema.org JSON-LD**: Dukungan terstruktur lengkap untuk `@type: FAQPage`, `FinancialProduct`, `DefinedTerm`, `BreadcrumbList`, dan `WebSite`.
- **Dynamic Social Card**: Otomatis menghasilkan open-graph visual kartu emiten dan dividen.
- **IndexNow & XML Sitemap**: Terhubung langsung dengan protokol mesin pencari Google & Bing/Yandex.

---

## 🛠️ Tech Stack

- **Frontend & Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide React, Framer Motion, Sonner
- **Charts & Visuals**: TradingView Lightweight Charts, Three.js, Canvas Confetti
- **State Management**: Zustand, TanStack React Query
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime) & Python Quant/ML Backend
- **Data Exporting**: SheetJS (XLSX), jsPDF, html2canvas
- **Web Server & Reverse Proxy**: Nginx & PM2 on Ubuntu Linux VPS

---

## 📁 Struktur Direktori

```plaintext
stockbit-web/
├── public/                 # Static assets, robots.txt, physical sitemap.xml
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── analisis/       # [symbol] Programmatic Fundamental Scorecard
│   │   ├── api/            # Route Handlers (IndexNow, Quotes, SEO)
│   │   ├── crypto/         # Crypto Fear & Greed index
│   │   ├── ipo/            # Kalender & Prospektus IPO
│   │   ├── kalender-dividen/ # Dividen Hub & per-stock dividend
│   │   ├── kalkulator/     # Financial calculator suites (CAGR, Lot, dll)
│   │   ├── kamus/          # Kamus Istilah Pasar Modal & Trading
│   │   ├── pasar/          # Market Wrap (Top Gainers, Losers, Foreign Flow)
│   │   ├── stock/          # Detail saham [symbol], chart, orderbook, FAQ
│   │   └── layout.tsx      # Root layout, Google Search Console verification
│   ├── components/         # Reusable UI & Trading widgets
│   ├── lib/                # API helpers, utils, Supabase client
│   ├── store/              # Zustand global state (portfolio, watchlist)
│   └── types/              # TypeScript interface definitions
├── deploy_web_vps.sh       # Automated Nginx & PM2 deployment script
└── package.json            # Project dependencies & scripts
```

---

## 💻 Panduan Instalasi Lokal (Getting Started)

### Prasyarat
- Node.js 18.x atau versi terbaru (direkomendasikan Node.js 20+)
- npm / yarn / pnpm

### 1. Clone Repository
```bash
git clone https://github.com/wendicoc1-commits/tradingsims.git
cd tradingsims
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan konfigurasi kunci API (Supabase URL, Anon Key, dsb).

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

### 5. Build untuk Produksi
```bash
npm run build
npm run start
```

---

## 🌐 Deployment (VPS & Production)

Proyek ini telah dilengkapi dengan skrip deployment otomatis ke VPS Linux menggunakan Nginx dan PM2:

```bash
# Update dan deploy versi terbaru di server VPS
bash deploy_web_vps.sh
```

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat `LICENSE` untuk informasi lebih lanjut.

---

<p align="center">
  Dibuat dengan ❤️ untuk kemajuan literasi finansial & edukasi pasar modal Indonesia.
</p>
