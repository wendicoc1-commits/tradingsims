import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, HelpCircle, Layers, Award, Clock, BarChart2 } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export const metadata: Metadata = {
  title: '5 Strategi Trading Saham Paling Efektif untuk Pemula & Pro | TradeSim Pro',
  description: 'Pelajari 5 strategi trading saham terbaik di Bursa Efek Indonesia: Breakout Trading, Pullback Buy on Weakness, Swing Trading, Scalping, dan Volume Flow.',
  keywords: [
    'strategi trading saham',
    'cara trading saham',
    'teknik trading saham',
    'breakout saham',
    'buy on weakness',
    'scalping saham',
    'swing trading saham',
    'strategi trading pemula',
    'indikator trading saham',
  ],
  alternates: {
    canonical: 'https://www.tradingsims.my.id/learn/strategi-trading-saham',
  },
  openGraph: {
    title: '5 Strategi Trading Saham Paling Efektif | TradeSim Pro',
    description: 'Panduan lengkap strategi teknikal trading saham, konfirmasi volume bandarmologi, dan simulasi gratis.',
    url: 'https://www.tradingsims.my.id/learn/strategi-trading-saham',
    type: 'article',
  },
};

export default function StrategiTradingSahamPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: '5 Strategi Trading Saham Paling Efektif untuk Pemula & Pro',
    description: 'Panduan mendalam 5 metode analisis dan eksekusi strategi trading saham di bursa efek Indonesia.',
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/trading" className="hover:text-emerald-400 transition-colors">Trading</Link>
        <span>/</span>
        <span className="text-slate-200 font-medium">Strategi Trading Saham</span>
      </nav>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Strategi Teknikal
          </span>
          <span className="flex items-center text-xs text-slate-400 ml-auto">
            <Clock className="w-3.5 h-3.5 mr-1" /> Waktu Baca: 6 Menit
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          5 Strategi Trading Saham Paling Efektif untuk Pemula &amp; Pro
        </h1>

        <p className="text-base text-slate-300 leading-relaxed">
          Dalam pasar saham yang dinamis, tidak ada satu strategi yang berhasil 100% di semua kondisi. Kunci profit konsisten adalah memahami setup strategi yang tepat sesuai fase tren harga.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
          <EeatComplianceBadge />
          <ShareWebsiteButton />
        </div>
      </header>

      {/* 5 STRATEGIES BREAKDOWN */}
      <div className="space-y-8 mb-12">
        {/* STRATEGY 1 */}
        <section className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-bold text-emerald-400 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" /> 1. Breakout Trading (Beli saat Tembus Resistance)
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3">
            Strategi ini membeli saham ketika harga berhasil menembus level batas atas (Resistance) horizontal atau pola konsolidasi (misal: Cup and Handle, Ascending Triangle) yang disertai <strong>lonjakan volume transaksi minimal 150-200% di atas rata-rata 20 hari</strong>.
          </p>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <strong>Kunci Keberhasilan:</strong> Tunggu candle penutupan menembus resistance secara meyakinkan agar tidak terjebak <em>false breakout (fakeout)</em>.
          </div>
        </section>

        {/* STRATEGY 2 */}
        <section className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-bold text-cyan-400 mb-3 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2" /> 2. Pullback / Buy on Weakness (BoW di Area Support)
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3">
            Pada saham yang sedang dalam tren naik kuat (Uptrend), harga tidak bergerak lurus melainkan membentuk tangga (Higher High dan Higher Low). Strategi ini bersabar menunggu harga retrace atau koreksi sehat ke level Moving Average (MA20 atau MA50) atau garis support horizontal sebelum membeli.
          </p>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <strong>Keunggulan:</strong> Memberikan rasio Risk/Reward paling optimal karena titik Stop Loss dapat dipasang rapat tepat di bawah garis support.
          </div>
        </section>

        {/* STRATEGY 3 */}
        <section className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2" /> 3. Swing Trading Gelombang Tren (3 - 15 Hari)
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3">
            Menangkap ayunan satu siklus harga dari titik pantulan bawah menuju target resistance berikutnya. Swing trading mengkombinasikan indikator Stochastic RSI untuk mendeteksi kondisi jenuh jual (oversold) dan konfirmasi akumulasi institusi asing.
          </p>
        </section>

        {/* STRATEGY 4 */}
        <section className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-bold text-purple-400 mb-3 flex items-center">
            <Layers className="w-5 h-5 mr-2" /> 4. Volume Price Analysis &amp; Radar Bandarmologi
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3">
            Mengamati broker summary dan pergerakan dana besar (Smart Money). Jika harga saham bergerak mendatar (sideways) namun terjadi akumulasi masif dari broker institusi top, saham tersebut sedang dipersiapkan untuk fase kenaikan (markup).
          </p>
        </section>

        {/* STRATEGY 5 */}
        <section className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h2 className="text-xl font-bold text-rose-400 mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2" /> 5. Momentum Scalping (Fast Trade)
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3">
            Fokus pada saham-saham yang masuk dalam daftar Top Gainers dan memiliki turnover transaksi di atas Rp 20 Miliar di awal pembukaan bursa (jam 09:00 - 10:00 WIB). Scalper mengamati ketebalan antrean bid/offer di orderbook level 2 untuk keluar masuk cepat dengan target profit 1-3%.
          </p>
        </section>
      </div>

      {/* SIMULATION CALL TO ACTION */}
      <section className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Uji Coba 5 Strategi Ini di Simulator Trading Gratis
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-6">
          Jangan korbankan uang asli untuk menguji setup teknikal. Manfaatkan modal virtual Rp 50 Juta di TradeSim Pro sekarang.
        </p>
        <Link
          href="/trading"
          className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all inline-flex items-center"
        >
          Buka Halaman Simulator Trading <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>
    </div>
  );
}
