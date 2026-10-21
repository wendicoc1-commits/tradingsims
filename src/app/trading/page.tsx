import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, TrendingUp, BarChart3, CheckCircle2, Award, Users, DollarSign, Laptop, Sparkles, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trading Simulator Indonesia - Belajar Trading Saham & Crypto Gratis #1 | TradeSim Pro',
  description: 'Platform trading simulator saham Indonesia (BEI) dan kripto spot 24/7 gratis modal virtual Rp 50 Juta. Belajar trading real-time, orderbook level 2, dan tanpa risiko rugi.',
  keywords: [
    'trading',
    'trading simulator',
    'trading simulator indonesia',
    'belajar trading',
    'aplikasi trading',
    'paper trading indonesia',
    'trading saham',
    'trading crypto',
    'simulator trading saham idx',
    'belajar trading gratis',
    'platform trading tanpa modal',
  ],
  alternates: {
    canonical: 'https://www.tradingsims.my.id/trading',
  },
  openGraph: {
    title: 'Trading Simulator Indonesia #1 - Belajar Trading Saham & Crypto Gratis',
    description: 'Latihan trading saham BEI dan crypto dengan data bursa real-time, modal virtual Rp 50 Juta, dan AI risk management.',
    url: 'https://www.tradingsims.my.id/trading',
    type: 'website',
  },
};

export default function TradingHubPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TradeSim Pro Trading Simulator',
    url: 'https://www.tradingsims.my.id/trading',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description: 'Platform trading simulator institusional untuk saham BEI dan aset kripto dengan data pasar real-time dan modal virtual gratis Rp 50 Juta.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apa itu platform trading simulator TradeSim Pro?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TradeSim Pro adalah aplikasi trading simulator dan paper trading interaktif berbasis web untuk saham Bursa Efek Indonesia (BEI / IDX) dan aset kripto 24/7. Platform ini menyediakan data pasar real-time, orderbook Level 2, dan modal virtual Rp 50 Juta sehingga Anda bisa belajar trading tanpa risiko kehilangan uang riil.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah trading di simulator TradeSim Pro sepenuhnya gratis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, 100% gratis. Setiap pengguna langsung mendapatkan saldo virtual awal Rp 50.000.000 (untuk saham BEI) atau $100.000 USD (untuk kripto) tanpa perlu deposit kartu kredit atau nomor rekening.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah data harga saham dan kripto di TradeSim Pro sesuai dengan bursa asli?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, data harga, grafik candlestick, antrean bid/offer (orderbook), dan persentase perubahan harga disinkronkan secara real-time dengan bursa efek dan likuiditas pasar spot global.',
        },
      },
      {
        '@type': 'Question',
        name: 'Mengapa pemula wajib mencoba trading simulator sebelum trading uang asli?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simulator melatih disiplin psikologi, pengujian strategi teknikal, dan penentuan posisi stop loss tanpa tekanan kerugian finansial nyata. 90% trader pemula kehilangan modal di bulan pertama karena terjun tanpa jam terbang di simulator.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Platform Trading Simulator Saham &amp; Crypto #1 Indonesia</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Kuasai Seni <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Trading</span> Saham &amp; Crypto Tanpa Risiko Uang Riil
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Latih analisis teknikal, eksekusi HAKA/HAKI di antrean orderbook live BEI, dan bangun konsistensi profit dengan saldo virtual gratis <strong>Rp 50.000.000</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/terminal"
              className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base sm:text-lg transition-all transform hover:scale-105 inline-flex items-center shadow-xl shadow-emerald-500/25"
            >
              Mulai Trading Sekarang — Gratis <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/learn/apa-itu-trading"
              className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base transition-all inline-flex items-center border border-slate-700"
            >
              <BookOpen className="w-5 h-5 mr-2 text-cyan-400" /> Baca Panduan Trading Pemula
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 pt-8 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-black text-emerald-400">Rp 50 Juta</div>
              <div className="text-xs text-slate-400 font-medium">Modal Virtual Awal</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-black text-cyan-400">950+ Saham</div>
              <div className="text-xs text-slate-400 font-medium">Bursa Efek Indonesia (IDX)</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-black text-amber-400">24/7 Nonstop</div>
              <div className="text-xs text-slate-400 font-medium">Kripto Spot Real-Time</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-2xl font-black text-purple-400">Zero Risk</div>
              <div className="text-xs text-slate-400 font-medium">100% Bebas Kerugian Riil</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY TRADING SIMULATOR MATTERS */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Mengapa Trader Sukses Mengawali Karir di Trading Simulator?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Pasar modal tidak memberi toleransi bagi trader yang bertaruh tanpa rencana. TradeSim Pro memberikan lingkungan latihan profesional setara terminal institusi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Orderbook Level 2 Real-Time</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau antrean volume bid dan offer saham asli, amati tekanan jual-beli, dan rasakan dinamika likuiditas bursa persis seperti menggunakan software sekuritas profesional.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Manajemen Risiko &amp; Drawdown Guard</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dilengkapi kalkulasi Half-Kelly Optimal Sizing dan proteksi High-Water Mark modal portofolio agar Anda terbiasa disiplin menjaga batas risiko per transaksi.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Quantitative Workstation</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Didukung Munger Inversion Protocol untuk audit red-team pre-mortem saham dan radar bandarmologi broker summary guna mendeteksi akumulasi dana institusi besar.
            </p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE: TRADESIM PRO VS AKUN RIIL */}
      <section className="py-12 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
          Perbandingan: Belajar di TradeSim Pro vs Langsung Uang Riil
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-100 font-semibold uppercase text-xs">
              <tr>
                <th className="p-4">Fitur &amp; Karakteristik</th>
                <th className="p-4 text-emerald-400">TradeSim Pro Simulator</th>
                <th className="p-4 text-rose-400">Akun Trading Uang Riil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950">
              <tr className="hover:bg-slate-900/50">
                <td className="p-4 font-semibold text-slate-200">Biaya Awal</td>
                <td className="p-4 text-emerald-400 font-bold">100% Gratis</td>
                <td className="p-4">Deposit Uang Tabungan</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="p-4 font-semibold text-slate-200">Risiko Kerugian Modal</td>
                <td className="p-4 text-emerald-400 font-bold">Nol (0% Risiko)</td>
                <td className="p-4 text-rose-400 font-bold">Tinggi (Bisa Habis)</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="p-4 font-semibold text-slate-200">Kesesuaian Data Pasar</td>
                <td className="p-4">Real-Time BEI / Crypto</td>
                <td className="p-4">Real-Time BEI / Crypto</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="p-4 font-semibold text-slate-200">Kebebasan Uji Coba Strategi</td>
                <td className="p-4 text-emerald-400">Tanpa Batas (Bebas Eksperimen)</td>
                <td className="p-4">Dihantui Ketakutan Psikologis</td>
              </tr>
              <tr className="hover:bg-slate-900/50">
                <td className="p-4 font-semibold text-slate-200">Dukungan AI Finansial</td>
                <td className="p-4 text-emerald-400 font-bold">Tersedia 24/7 Terintegrasi</td>
                <td className="p-4">Jarang Ada / Berbayar Mahal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* QUICK LINKS DIRECTORY TO TOP ASSETS & TOOLS */}
      <section className="py-12 max-w-6xl mx-auto px-4 border-t border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6">Mulai Eksplorasi Simulator Trading:</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-emerald-400 uppercase text-xs tracking-wider mb-3">Simulasi Saham Unggulan BEI</h3>
            <ul className="space-y-2">
              <li><Link href="/stock/BBCA" className="hover:text-emerald-400">Trading Saham BBCA (Bank BCA)</Link></li>
              <li><Link href="/stock/BBRI" className="hover:text-emerald-400">Trading Saham BBRI (Bank BRI)</Link></li>
              <li><Link href="/stock/BMRI" className="hover:text-emerald-400">Trading Saham BMRI (Bank Mandiri)</Link></li>
              <li><Link href="/stock/ASII" className="hover:text-emerald-400">Trading Saham ASII (Astra International)</Link></li>
              <li><Link href="/stock/TLKM" className="hover:text-emerald-400">Trading Saham TLKM (Telkom)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-cyan-400 uppercase text-xs tracking-wider mb-3">Kalkulator Finansial Trading</h3>
            <ul className="space-y-2">
              <li><Link href="/tools/kalkulator-risk-reward" className="hover:text-cyan-400">Kalkulator Risk/Reward Saham</Link></li>
              <li><Link href="/tools/kalkulator-cut-loss-bep" className="hover:text-cyan-400">Kalkulator Cut Loss &amp; BEP</Link></li>
              <li><Link href="/tools/kalkulator-fee-saham" className="hover:text-cyan-400">Kalkulator Fee Beli/Jual Broker</Link></li>
              <li><Link href="/tools/kalkulator-lot" className="hover:text-cyan-400">Kalkulator Lot Saham ke Rupiah</Link></li>
              <li><Link href="/tools/kalkulator-averaging-saham" className="hover:text-cyan-400">Kalkulator Averaging Down Saham</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-400 uppercase text-xs tracking-wider mb-3">Panduan &amp; Duel Populer</h3>
            <ul className="space-y-2">
              <li><Link href="/learn/apa-itu-trading" className="hover:text-amber-400">Apa itu Trading? Panduan Lengkap</Link></li>
              <li><Link href="/learn/cara-main-saham-pemula" className="hover:text-amber-400">Cara Main Saham untuk Pemula</Link></li>
              <li><Link href="/vs/bbca-vs-bbri" className="hover:text-amber-400">Duel Saham: BBCA vs BBRI</Link></li>
              <li><Link href="/vs/antm-vs-mdka" className="hover:text-amber-400">Duel Saham: ANTM vs MDKA</Link></li>
              <li><Link href="/crypto" className="hover:text-amber-400">Simulator Trading Kripto 24/7</Link></li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-12 max-w-4xl mx-auto px-4 border-t border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions (FAQ)</h2>
        <div className="space-y-4">
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-base mb-2">Apakah saldo virtual TradeSim Pro bisa diuangkan?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tidak. Saldo virtual Rp 50 Juta adalah uang simulasi yang ditujukan murni untuk sarana latihan, pengujian strategi, dan riset pasar tanpa risiko finansial nyata.
            </p>
          </div>
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-slate-100 text-base mb-2">Apakah saya perlu menginstal aplikasi untuk mulai trading?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tidak perlu. TradeSim Pro berbasis Progressive Web App (PWA) modern yang dapat diakses langsung dari peramban PC, laptop, tablet, maupun smartphone tanpa perlu mengunduh file installer.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL BOTTOM CTA */}
      <section className="py-12 text-center bg-gradient-to-t from-emerald-950/30 to-slate-950 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Siap Menjadi Trader yang Berprofit Konsisten?
          </h2>
          <p className="text-slate-300 mb-6 text-sm sm:text-base">
            Uji strategi Anda hari ini di simulator trading tercanggih di Indonesia.
          </p>
          <Link
            href="/terminal"
            className="px-8 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all inline-flex items-center shadow-lg shadow-emerald-500/20"
          >
            Buka Terminal Simulator Sekarang <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
