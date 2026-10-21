import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, HelpCircle, Layers, Award, AlertTriangle, BarChart3, Clock } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export const metadata: Metadata = {
  title: 'Trading Adalah: Pengertian, Jenis, Cara Kerja & Panduan Belajar Pemula',
  description: 'Panduan lengkap apa itu trading, perbedaan trading vs investasi, jenis scalping, day trading, swing trading, risiko, dan cara belajar simulasi trading gratis tanpa modal.',
  keywords: [
    'trading',
    'apa itu trading',
    'belajar trading',
    'cara trading',
    'trading saham',
    'trading crypto',
    'perbedaan trading dan investasi',
    'aplikasi trading pemula',
    'simulasi trading gratis',
    'day trading indonesia',
    'swing trading',
    'scalping saham',
  ],
  alternates: {
    canonical: 'https://www.tradingsims.my.id/learn/apa-itu-trading',
  },
  openGraph: {
    title: 'Trading Adalah: Pengertian, Jenis, Cara Kerja & Panduan Pemula | TradeSim Pro',
    description: 'Pahami apa itu trading dari nol, strategi analisis teknikal, manajemen risiko modal, dan latihan trading gratis tanpa risiko.',
    url: 'https://www.tradingsims.my.id/learn/apa-itu-trading',
    type: 'article',
  },
};

export default function ApaItuTradingPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Trading Adalah: Pengertian, Jenis, Cara Kerja, dan Panduan Belajar Pemula',
    description: 'Panduan otoritatif mengenai konsep trading finansial, instrumen saham dan kripto, metode analisis, serta simulasi tanpa risiko.',
    author: {
      '@type': 'Organization',
      name: 'TradeSim Pro Quantitative Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TradeSim Pro Institute',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.tradingsims.my.id/og-preview.png',
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apa itu trading?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trading adalah aktivitas jual beli instrumen keuangan (seperti saham, mata uang kripto, obligasi, atau valuta asing) dalam rentang waktu singkat hingga menengah untuk memperoleh keuntungan finansial dari selisih harga beli dan harga jual (capital gain).',
        },
      },
      {
        '@type': 'Question',
        name: 'Apa perbedaan mendasar antara trading dan investasi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Perbedaan utama terletak pada horizon waktu dan pendekatan analisis. Trader berfokus pada fluktuasi harga jangka pendek (menit, hari, hingga beberapa minggu) menggunakan analisis teknikal. Sedangkan investor berfokus pada pertumbuhan nilai jangka panjang (tahunan) berdasarkan kinerja fundamental dan dividen perusahaan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah trading bisa dipelajari tanpa modal uang riil?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, Anda dapat belajar trading secara gratis dan tanpa risiko menggunakan simulator paper trading seperti TradeSim Pro. Platform ini menyediakan saldo virtual Rp 50 Juta dengan data pasar live bursa untuk melatih psikologi dan strategi transaksi Anda.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apa saja gaya atau jenis trading yang paling populer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Terdapat 4 gaya utama: 1) Scalping (transaksi kilat dalam hitungan detik hingga menit), 2) Day Trading (membuka dan menutup posisi dalam hari yang sama), 3) Swing Trading (menahan posisi beberapa hari hingga minggu), dan 4) Position Trading (menahan posisi tren besar bulanan).',
        },
      },
      {
        '@type': 'Question',
        name: 'Berapa modal awal minimal untuk mulai trading saham di Indonesia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Di Bursa Efek Indonesia (BEI), pembelian minimal adalah 1 lot (100 lembar saham). Saham dengan harga Rp 100/lembar hanya membutuhkan modal Rp 10.000 per lot. Namun pemula sangat disarankan berlatih dahulu di akun simulasi paper trading sebelum menggunakan uang riil.',
        },
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/learn/cara-main-saham-pemula" className="hover:text-emerald-400 transition-colors">Edukasi</Link>
        <span>/</span>
        <span className="text-slate-200 font-medium">Apa itu Trading</span>
      </nav>

      {/* Header & Badges */}
      <header className="mb-8 pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Panduan Lengkap
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Pillar Page
          </span>
          <span className="flex items-center text-xs text-slate-400 ml-auto">
            <Clock className="w-3.5 h-3.5 mr-1" /> Waktu Baca: 7 Menit
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Trading Adalah: Pengertian, Jenis, Cara Kerja &amp; Panduan Belajar Pemula
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Ingin memahami apa itu trading secara menyeluruh? Pelajari definisi fundamental, perbedaannya dengan investasi, gaya trading populer (scalping hingga swing), risiko finansial, dan cara memulai latihan trading gratis tanpa risiko modal.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
          <EeatComplianceBadge />
          <ShareWebsiteButton />
        </div>
      </header>

      {/* DEFINITION CALLOUT BOX (Targeting Google Featured Snippet Posisi 0) */}
      <section className="p-6 mb-8 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-lg">
        <h2 className="text-lg font-bold text-emerald-400 flex items-center mb-2">
          <Award className="w-5 h-5 mr-2" /> Definisi Resmi: Apa itu Trading?
        </h2>
        <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
          <strong>Trading adalah</strong> aktivitas transaksi jual dan beli instrumen pasar keuangan—seperti saham bursa (BEI), aset kripto (crypto), obligasi, atau valuta asing (forex)—dalam jangka waktu relatif singkat guna meraup keuntungan dari volatilitas dan pergerakan selisih harga (<em>capital gain</em>). Seseorang yang melakukan aktivitas ini disebut sebagai <strong>trader</strong>.
        </p>
      </section>

      {/* SECTION 1: PERBEDAAN TRADING VS INVESTASI */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-emerald-400" /> 1. Perbedaan Utama Trading vs Investasi
        </h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Banyak pemula sering menyamakan trading dengan investasi. Padahal, keduanya memiliki filosofi, horizon waktu, dan manajemen risiko yang sangat bertolak belakang:
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-800 mb-4">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-100 font-semibold uppercase text-xs">
              <tr>
                <th className="p-3">Parameter</th>
                <th className="p-3 text-emerald-400">Trading</th>
                <th className="p-3 text-blue-400">Investasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Horizon Waktu</td>
                <td className="p-3">Jangka Pendek (Detik, Jam, Hari, Minggu)</td>
                <td className="p-3">Jangka Panjang (1 - 10+ Tahun)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Fokus Analisis</td>
                <td className="p-3">Analisis Teknikal, Price Action, Orderbook &amp; Flow Bandarmologi</td>
                <td className="p-3">Analisis Fundamental, Laporan Keuangan, &amp; Prospek Industri</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Sumber Profit Utama</td>
                <td className="p-3">Selisih harga jual dan beli (Capital Gain)</td>
                <td className="p-3">Dividen berkala &amp; pertumbuhan nilai jangka panjang</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Tingkat Keterlibatan</td>
                <td className="p-3">Tinggi (Perlu memantau chart &amp; eksekusi aktif)</td>
                <td className="p-3">Pasif / Semi-aktif (Buy &amp; Hold)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Perlakuan saat Harga Turun</td>
                <td className="p-3 text-rose-400">Disiplin Stop Loss (Cut Loss) untuk amankan modal</td>
                <td className="p-3 text-emerald-400">Averaging Down / Beli Lebih Banyak saat valuasi murah</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 2: 4 GAYA TRADING POPULER */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Layers className="w-6 h-6 mr-2 text-emerald-400" /> 2. Empat Jenis dan Gaya Trading Paling Populer
        </h2>
        <p className="text-slate-300 leading-relaxed mb-6">
          Setiap trader memiliki profil psikologi dan toleransi risiko yang berbeda. Berikut adalah 4 klasifikasi gaya trading:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors">
            <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-400" /> A. Scalping (Scalper)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Membuka dan menutup puluhan transaksi dalam hitungan detik hingga beberapa menit. Memanfaatkan spread bid-offer sempit dan volatilitas cepat dengan target cuan 1-2% per trade.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors">
            <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" /> B. Day Trading (Day Trader)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Seluruh posisi transaksi diselesaikan dalam hari yang sama sebelum bursa tutup. Trader tidak menahan posisi semalaman (<em>overnight risk</em>) untuk menghindari berita buruk saat pasar tutup.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors">
            <h3 className="text-lg font-bold text-amber-400 mb-2 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-amber-400" /> C. Swing Trading (Swing Trader)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Menahan saham dari beberapa hari hingga 2-3 minggu guna menangkap ayunan gelombang tren (swing high/swing low). Sangat cocok untuk individu yang memiliki pekerjaan tetap.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors">
            <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-400" /> D. Position Trading
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Memegang posisi selama beberapa bulan untuk menunggangi tren makro ekonomi besar. Pendekatan ini menggabungkan analisis teknikal grafik mingguan dan katalis fundamental.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: MANAJEMEN RISIKO (GOLDEN RULES) */}
      <section className="mb-10 p-6 rounded-xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Shield className="w-6 h-6 mr-2 text-rose-400" /> 3. Tiga Aturan Emas Manajemen Risiko Trading
        </h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Lebih dari 80% trader pemula mengalami kerugian bukan karena strategi analisis yang salah, melainkan karena gagal mengelola risiko modal (*money management*):
        </p>

        <ul className="space-y-3 text-slate-300 text-sm sm:text-base">
          <li className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Aturan Risiko 1% - 2%:</strong> Jangan pernah mempertaruhkan lebih dari 1-2% total modal akun Anda dalam satu transaksi tunggal.</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Rasio Asimetris Risk to Reward (Minimal 1 : 1.5):</strong> Pastikan potensi keuntungan selalu lebih besar daripada potensi kerugian saat menentukan level Stop Loss. Gunakan <Link href="/tools/kalkulator-risk-reward" className="text-emerald-400 underline">Kalkulator Risk/Reward kami</Link>.</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Disiplin Stop Loss Otomatis:</strong> Selalu tetapkan batas keluar sebelum memasukkan order. Jangan pernah membiarkan kerugian kecil berubah menjadi bencana portofolio yang menggerus psikologi.</span>
          </li>
        </ul>
      </section>

      {/* SECTION 4: CARA BELAJAR TRADING TANPA RISIKO */}
      <section className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          Mulai Latihan Trading Gratis Tanpa Takut Rugi Uang Riil
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto mb-6 text-sm sm:text-base leading-relaxed">
          Jangan langsung menggunakan uang tabungan Anda untuk mencoba strategi baru. Gunakan <strong>TradeSim Pro</strong>, simulator trading saham BEI dan kripto 24/7 dengan data live pasar, orderbook interaktif, dan saldo virtual gratis <strong>Rp 50 Juta</strong>.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/terminal"
            className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all transform hover:scale-105 inline-flex items-center shadow-lg shadow-emerald-500/20"
          >
            Buka Simulator Trading Sekarang <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            href="/tools/kalkulator-fee-saham"
            className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all inline-flex items-center"
          >
            Hitung Fee Transaksi Saham
          </Link>
        </div>
      </section>

      {/* SECTION 5: FAQ ACCORDION (Rich Snippet SEO) */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <HelpCircle className="w-6 h-6 mr-2 text-emerald-400" /> Pertanyaan Paling Sering Diajukan (FAQ Trading)
        </h2>

        <div className="space-y-4">
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-base mb-2">Apa itu trading saham?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trading saham adalah transaksi jual dan beli lembar saham perusahaan publik yang terdaftar di Bursa Efek Indonesia (BEI) dengan tujuan memperoleh keuntungan dari fluktuasi harga harian maupun mingguan.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-base mb-2">Berapa keuntungan yang bisa didapatkan dari trading?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Keuntungan trading tidak bersifat pasti dan berbanding lurus dengan risiko. Trader profesional umumnya menargetkan pertumbuhan portofolio konsisten berkisar 2% - 10% per bulan dengan menerapkan manajemen risiko disiplin, bukan mengharapkan kekayaan instan dalam semalam.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-base mb-2">Apakah trading itu judi?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trading menjadi mirip judi jika pelakunya masuk ke pasar hanya mengandalkan tebakan, emosi, dan rumor tanpa analisis teknikal, kalkulasi probabilitas, dan manajemen risiko modal. Namun jika dilakukan secara sistematis dengan strategi teruji, trading adalah aktivitas bisnis profesional yang sah.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-base mb-2">Apa saja alat yang dibutuhkan untuk trading?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Anda membutuhkan perangkat (PC/smartphone), koneksi internet stabil, platform grafik analisa teknikal (candlestick chart &amp; orderbook), kalkulator risiko transaksi, serta rekening sekuritas terdaftar OJK untuk eksekusi nyata.
            </p>
          </div>
        </div>
      </section>

      {/* Internal Link Silo Navigation */}
      <footer className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap justify-between gap-4">
        <div>
          <span>Artikel Terkait: </span>
          <Link href="/learn/apa-itu-paper-trading" className="text-emerald-400 hover:underline mr-3">Apa itu Paper Trading</Link>
          <Link href="/learn/cara-baca-orderbook-level-2" className="text-emerald-400 hover:underline mr-3">Cara Baca Orderbook Level 2</Link>
          <Link href="/learn/istilah-bandarmologi-saham" className="text-emerald-400 hover:underline">Istilah Bandarmologi</Link>
        </div>
        <Link href="/" className="hover:text-slate-200">&larr; Kembali ke Beranda TradeSim Pro</Link>
      </footer>
    </div>
  );
}
