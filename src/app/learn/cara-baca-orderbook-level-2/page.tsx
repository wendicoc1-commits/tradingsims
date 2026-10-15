import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Shield, Zap, TrendingUp, HelpCircle } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';

export default function OrderbookArticlePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Cara Membaca Orderbook Level 2 Saham & Crypto (Bid vs Offer)',
    description: 'Panduan teknis dan praktis membaca kedalaman pasar (Market Depth), antrean Bid Offer saham BEI, dan analisis likuiditas orderbook.',
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
        name: 'Apa perbedaan Bid dan Offer dalam orderbook saham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bid (di sisi kiri) adalah daftar antrean harga dan jumlah lot yang ingin DIBELI oleh pelaku pasar. Sedangkan Offer atau Ask (di sisi kanan) adalah daftar antrean harga dan jumlah lot yang ingin DIJUAL oleh pemilik saham.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apa arti Level 2 dalam orderbook?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Orderbook Level 1 hanya menampilkan harga tertinggi beli (Best Bid) dan harga terendah jual (Best Offer). Sedangkan Orderbook Level 2 menampilkan kedalaman berlapis hingga puluhan tingkatan harga dan volume lot di setiap antrean pasar.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B0E14]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold text-white text-base">
            <span className="w-7 h-7 rounded bg-emerald-500 text-black flex items-center justify-center font-black text-xs">
              TS
            </span>
            <span>TradeSim Pro</span>
          </Link>
          <Link
            href="/terminal"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
          >
            <span>Live Orderbook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold mb-6">
          <Layers className="w-3.5 h-3.5" />
          BEDAH TEKNIKAL &amp; KEDALAMAN PASAR (MARKET DEPTH)
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-mono tracking-tight leading-tight">
          Cara Membaca Orderbook Level 2 Saham &amp; Crypto (Bid vs Offer)
        </h1>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mt-4 border-b border-white/10 pb-6">
          <span>Ditulis oleh: Tim Edukasi TradeSim Pro</span>
          <span>•</span>
          <span>Waktu Baca: 5 Menit</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">Telah Diverifikasi Analis</span>
        </div>

        <article className="prose prose-invert max-w-none text-zinc-300 text-base leading-relaxed space-y-6 mt-8 font-sans">
          <p>
            Jika Anda ingin menjadi seorang <em>scalper</em>, <em>day trader</em>, atau memahami bagaimana bandar dan institusi menggerakkan harga saham di Bursa Efek Indonesia (BEI), maka <strong>Orderbook Level 2</strong> adalah senjata utama yang wajib Anda kuasai selain grafik candlestick.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mt-8">
            Anatomi Sederhana Orderbook: Bid vs Offer (Ask)
          </h2>
          <p>
            Di layar terminal trading TradeSim Pro, orderbook terbagi menjadi dua kolom utama:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-6 font-mono">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center justify-between">
                <span>KOLOM BID (BELI)</span>
                <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded">Sisi Kiri</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans mt-2">
                Menunjukkan antrean calon pembeli yang ingin menawar harga saham serendah mungkin. Jika Anda ingin langsung menjual barang Anda tanpa antre (*Haka / Hajar Kiri*), Anda akan mencocokkan harga di kolom Bid ini.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <div className="text-rose-400 font-bold text-sm mb-1 flex items-center justify-between">
                <span>KOLOM OFFER / ASK (JUAL)</span>
                <span className="text-xs bg-rose-500/20 px-2 py-0.5 rounded">Sisi Kanan</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans mt-2">
                Menunjukkan antrean pemilik saham yang ingin menjual saham mereka setinggi mungkin. Jika Anda ingin langsung mendapatkan saham tanpa antre (*Haki / Hajar Kanan*), Anda harus membeli di harga kolom Offer ini.
              </p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mt-8">
            Membedakan Volume Bid Tebal vs Offer Tebal
          </h2>
          <ul className="list-disc pl-5 space-y-3 text-sm sm:text-base">
            <li>
              <strong>Bid Tebal, Offer Tipis (Potensi Bullish / Support Kuat):</strong> Menandakan banyak pembeli yang bersedia menampung saham jika harganya turun, dan penjual di atasnya sedikit sehingga harga relatif lebih mudah terdorong naik.
            </li>
            <li>
              <strong>Offer Tebal, Bid Tipis (Tekanan Jual / Resistance Kuat):</strong> Menandakan ada tembok penjualan besar di atas. Saham akan sulit menembus level harga tersebut kecuali ada institusi besar yang melakukan pembelian masif (*big buyer absorption*).
            </li>
            <li>
              <strong>Waspadai Fenomena &quot;Fake Bid&quot; (Umpan Bandar):</strong> Kadang antrean Bid tebal sengaja dipasang oleh *market maker* agar terlihat kuat, namun ditarik secara tiba-tiba (*cancel order*) tepat saat harga mendekat untuk menjebak trader retail.
            </li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mt-8">
            Praktekkan Langsung di Terminal TradeSim Pro
          </h2>
          <p>
            Teori membaca orderbook paling efektif dipelajari dengan melihat pergerakan antrean lot yang bergerak secara real-time. Di Workstation TradeSim Pro, Anda bisa mengamati pergerakan orderbook Level 2 pada saham-saham likuid seperti BBCA, BBRI, BMRI, dan GOTO secara gratis tanpa risiko uang asli.
          </p>

          {/* Interactive CTA Card */}
          <div className="my-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-zinc-950 border border-emerald-500/30 text-center not-prose">
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-white mb-2">
              Pantau Orderbook Level 2 Real-Time Sekarang
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mb-6">
              Buka terminal dan rasakan sensasi eksekusi Hajar Kanan (HAKA) dan Hajar Kiri (HAKI) dengan modal virtual Rp 50 Juta.
            </p>
            <Link
              href="/terminal"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>BUKA TERMINAL ORDERBOOK TRADESIM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 not-prose">
            <EeatComplianceBadge />
          </div>
        </article>
      </main>
    </div>
  );
}
