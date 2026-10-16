import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, HelpCircle } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';

export default function PaperTradingArticlePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Apa itu Paper Trading? Pengertian, Manfaat & Cara Simulasi Saham BEI',
    description: 'Panduan lengkap memahami konsep paper trading, simulasi pasar saham modal virtual, dan strategi latihan tanpa risiko finansial.',
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
        name: 'Apa itu paper trading dalam dunia investasi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Paper trading adalah metode simulasi transaksi jual beli aset keuangan (seperti saham atau kripto) menggunakan saldo virtual tanpa risiko uang sungguhan, namun tetap menggunakan pergerakan grafik dan data harga pasar nyata (real-time).',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah hasil profit dari paper trading bisa dicairkan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tidak. Saldo dan keuntungan pada paper trading bersifat virtual dan dirancang murni untuk sarana edukasi, pengujian strategi teknikal, dan evaluasi psikologi trading sebelum menggunakan uang asli di sekuritas resmi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Di mana saya bisa mencoba paper trading saham Indonesia gratis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Anda dapat mencoba langsung di platform TradeSim Pro (tradingsims.my.id) yang menyediakan data real-time saham BEI/IDX dan modal virtual Rp 50.000.000 tanpa perlu kartu kredit atau deposit uang.',
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
            <span>Mulai Simulasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold mb-6">
          <BookOpen className="w-3.5 h-3.5" />
          PANDUAN EDUKASI INVESTASI SAHAM BEI
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-mono tracking-tight leading-tight">
          Apa itu Paper Trading? Pengertian, Manfaat &amp; Cara Simulasi Saham BEI
        </h1>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mt-4 border-b border-white/10 pb-6">
          <span>Ditulis oleh: Tim Edukasi TradeSim Pro</span>
          <span>•</span>
          <span>Waktu Baca: 4 Menit</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">Telah Diverifikasi Analis</span>
        </div>

        <article className="prose prose-invert max-w-none text-zinc-300 text-base leading-relaxed space-y-6 mt-8 font-sans">
          <p>
            Bagi siapa pun yang baru ingin terjun ke dunia pasar modal, ketakutan terbesar adalah <strong>kehilangan uang nyata karena salah membeli saham</strong>. Di sinilah konsep <strong>Paper Trading</strong> (atau sering disebut <em>Virtual Trading / Simulasi Saham</em>) menjadi gerbang awal paling krusial bagi seorang calon trader maupun investor profesional.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mt-8">
            Definisi &amp; Konsep Dasar Paper Trading
          </h2>
          <p>
            Secara historis, istilah <em>paper trading</em> berasal dari era sebelum adanya komputer, di mana para investor mencatat harga beli dan jual saham di atas selembar kertas (*paper*) untuk melacak performa tebakan mereka tanpa menyetor uang tunai.
          </p>
          <p>
            Di era modern saat ini, paper trading dijalankan melalui platform aplikasi berteknologi tinggi seperti <strong>TradeSim Pro</strong>. Anda diberikan saldo rekening virtual (misalnya <strong>Rp 50.000.000</strong>) untuk melakukan order beli (*Buy*) dan order jual (*Sell*) pada saham-saham nyata di Bursa Efek Indonesia (seperti BBCA, BBRI, ASII, GOTO) dengan data pergerakan harga pasar riil (*real-time*).
          </p>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mt-8">
            4 Manfaat Utama Melakukan Paper Trading Sebelum Pakai Uang Asli:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-emerald-400 font-mono font-bold text-sm mb-1">1. Nol Risiko Modal Finansial</div>
              <p className="text-xs text-zinc-400">
                Anda bisa mencoba teknik analisis baru tanpa takut tabungan gaji Anda tergerus saat terjadi koreksi pasar.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-emerald-400 font-mono font-bold text-sm mb-1">2. Uji Coba Indikator Teknikal</div>
              <p className="text-xs text-zinc-400">
                Uji apakah strategi Moving Average, RSI, Support &amp; Resistance, atau Bandarmologi Anda benar-benar menghasilkan *win-rate* positif.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-emerald-400 font-mono font-bold text-sm mb-1">3. Mengenal Mekanisme Orderbook BEI</div>
              <p className="text-xs text-zinc-400">
                Pahami cara kerja antrean Bid, penawaran Offer, fraksi harga saham (Rp 1, Rp 2, Rp 5, Rp 10, Rp 25), dan Auto Rejection (ARA &amp; ARB).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-emerald-400 font-mono font-bold text-sm mb-1">4. Melatih Disiplin Stop Loss</div>
              <p className="text-xs text-zinc-400">
                Belajar mengeksekusi rencana pemotongan rugi (*cut loss*) tanpa drama emosi penyesalan.
              </p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white mt-8">
            Cara Mulai Paper Trading Saham di TradeSim Pro
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm sm:text-base">
            <li>Buka halaman beranda <Link href="/" className="text-emerald-400 underline font-semibold">TradeSim Pro</Link>.</li>
            <li>Klik tombol <strong>Buka Workstation Terminal</strong>. Anda langsung menerima saldo modal virtual Rp 50.000.000.</li>
            <li>Cari kode saham favorit Anda (contoh: <code>BBCA</code>, <code>BBRI</code>, <code>TLKM</code>).</li>
            <li>Perhatikan pergerakan grafik candlestick dan kolom orderbook Level 2.</li>
            <li>Ketik jumlah lot yang ingin Anda beli, lalu klik <strong>Beli (Buy)</strong>.</li>
            <li>Pantau untung rugi (*Unrealized P&amp;L*) secara langsung dari menu Portofolio Anda.</li>
          </ol>

          {/* Interactive CTA Card */}
          <div className="my-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-zinc-950 border border-emerald-500/30 text-center not-prose">
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-white mb-2">
              Siap Mencoba Trading Saham Tanpa Risiko?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mb-6">
              Mulai latihan trading saham BEI dan crypto sekarang juga dengan Workstation Terminal TradeSim Pro. 100% Gratis &amp; Tanpa Deposit.
            </p>
            <Link
              href="/terminal"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>BUKA TERMINAL SIMULATOR SEKARANG</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 pt-8 border-t border-white/10 not-prose">
            <h3 className="text-xl font-bold font-mono text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Pertanyaan Umum Seputar Paper Trading
            </h3>
            <div className="space-y-3">
              <details className="p-4 rounded-xl bg-white/[0.02] border border-white/10 group cursor-pointer">
                <summary className="font-mono text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                  <span>Apakah data di simulator sama persis dengan bursa asli?</span>
                  <span className="text-emerald-400">+</span>
                </summary>
                <p className="mt-2 text-xs text-zinc-400 font-sans leading-relaxed">
                  Ya, TradeSim Pro menggunakan umpan data harga pasar real-time langsung dari bursa saham BEI dan pasar crypto spot 24/7.
                </p>
              </details>

              <details className="p-4 rounded-xl bg-white/[0.02] border border-white/10 group cursor-pointer">
                <summary className="font-mono text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
                  <span>Berapa lama seorang pemula sebaiknya latihan di simulator?</span>
                  <span className="text-emerald-400">+</span>
                </summary>
                <p className="mt-2 text-xs text-zinc-400 font-sans leading-relaxed">
                  Idealnya minimal 1 hingga 3 bulan, atau sampai Anda berhasil membukukan konsistensi profit dan disiplin risiko minimal pada 30 transaksi simulasi berturut-turut.
                </p>
              </details>
            </div>
          </div>

          {/* Related Educational Guides & Calculators (Internal SEO Hub) */}
          <div className="mt-10 pt-6 border-t border-zinc-800 not-prose space-y-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Panduan Saham &amp; Kalkulator Terkait:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Link
                href="/learn/cara-main-saham-pemula"
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-colors group block"
              >
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">Panduan Pemula</span>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Cara Main Saham dari Nol</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Langkah awal, modal minimal, dan tips memilih saham pertama.</p>
              </Link>
              <Link
                href="/learn/jam-bursa-saham-idx"
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-blue-500/40 transition-colors group block"
              >
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase block mb-1">Operasional Bursa</span>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Jam Bursa Saham BEI Terbaru</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Jadwal resmi Sesi 1, Sesi 2, dan Pre-Opening Senin - Jumat.</p>
              </Link>
              <Link
                href="/learn/istilah-bandarmologi-saham"
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-500/40 transition-colors group block"
              >
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">Smart Money</span>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Kamus Lengkap Bandarmologi</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Akumulasi, distribusi, dan cara baca broker summary.</p>
              </Link>
              <Link
                href="/tools/kalkulator-cagr-saham"
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition-colors group block"
              >
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block mb-1">Kalkulator Finansial</span>
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300">Kalkulator CAGR Investasi</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Hitung pertumbuhan majemuk bunga tahunan portofolio.</p>
              </Link>
              <Link
                href="/tools/kalkulator-fee-saham"
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-colors group block"
              >
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">Kalkulator Broker</span>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Kalkulator Fee &amp; Breakeven</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Hitung fee beli, fee jual, dan pajak PPh bursa saham.</p>
              </Link>
              <Link
                href="/learn/cara-baca-orderbook-level-2"
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 transition-colors group block"
              >
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block mb-1">Analisis Orderbook</span>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Cara Baca Orderbook Level 2</h4>
                <p className="text-[11px] text-zinc-400 mt-1">Deteksi bid palsu, fake wall, dan antrean tebal institusi.</p>
              </Link>
            </div>
          </div>

          <div className="mt-8 not-prose">
            <EeatComplianceBadge />
          </div>
        </article>
      </main>
    </div>
  );
}
