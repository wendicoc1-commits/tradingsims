'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Zap,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface TermItem {
  term: string;
  category: 'Dasar' | 'Teknikal' | 'Fundamental' | 'Bandarmologi';
  definition: string;
  example: string;
  actionHint: string;
}

const STOCK_GLOSSARY: TermItem[] = [
  {
    term: 'Bid & Offer',
    category: 'Dasar',
    definition: 'Bid adalah harga penawaran beli saham yang diajukan oleh calon pembeli, sedangkan Offer (atau Ask) adalah harga penawaran jual yang diajukan oleh pemilik saham.',
    example: 'Jika antrean Bid tertinggi BBCA di Rp 5.000 dan Offer terendah di Rp 5.025, maka transaksi akan terjadi jika salah satu pihak mengalah.',
    actionHint: 'Lihat antrean Bid & Offer live di Orderbook Level 2 TradeSim Pro.',
  },
  {
    term: 'Lot Saham',
    category: 'Dasar',
    definition: 'Satuan standar transaksi saham di Bursa Efek Indonesia (BEI). 1 Lot setara dengan tepat 100 lembar saham.',
    example: 'Membeli 10 lot saham BBRI pada harga Rp 4.500 memerlukan modal: 10 lot x 100 lembar x Rp 4.500 = Rp 4.500.000.',
    actionHint: 'Gunakan Kalkulator Lot Saham TradeSim Pro untuk konversi cepat.',
  },
  {
    term: 'HAKA (Hajar Kanan)',
    category: 'Dasar',
    definition: 'Istilah beli saham langsung pada kolom antrean jual (Offer/kanan) agar order langsung match seketika tanpa perlu mengantre.',
    example: 'Trader melakukan HAKA saat melihat momentum harga saham naik sangat cepat agar tidak ketinggalan kereta.',
    actionHint: 'Coba eksekusi Market Buy (HAKA) di Terminal Simulator TradeSim.',
  },
  {
    term: 'HAKI (Hajar Kiri)',
    category: 'Dasar',
    definition: 'Istilah jual saham langsung pada kolom antrean beli (Bid/kiri) agar saham langsung laku terjual seketika.',
    example: 'Trader melakukan HAKI saat ingin segera mengamankan profit atau cut loss darurat.',
    actionHint: 'Praktikkan Market Sell (HAKI) tanpa takut rugi di TradeSim.',
  },
  {
    term: 'ARA (Auto Rejection Atas)',
    category: 'Dasar',
    definition: 'Batas kenaikan harga maksimal saham dalam satu hari perdagangan bursa (berkisar antara 20% hingga 35% tergantung fraksi harga).',
    example: 'Jika harga saham mencapai batas ARA, sistem bursa akan menolak penawaran beli di atas harga tersebut.',
    actionHint: 'Pantau saham yang mendekati ARA di menu Top Gainers TradeSim.',
  },
  {
    term: 'ARB (Auto Rejection Bawah)',
    category: 'Dasar',
    definition: 'Batas penurunan harga maksimal saham dalam satu hari bursa (saat ini simetris hingga -20% s/d -35%).',
    example: 'Saham yang turun drastis hingga batas ARB tidak dapat ditawar lebih rendah lagi pada hari itu.',
    actionHint: 'Latih manajemen risiko agar portofolio tidak tersangkut di saham ARB.',
  },
  {
    term: 'Bandarmologi',
    category: 'Bandarmologi',
    definition: 'Metode analisis untuk melacak pergerakan dana besar (Smart Money / Bandar / Institusi Asing) melalui Broker Summary dan data transaksi bursa.',
    example: 'Jika broker asing konsisten melakukan akumulasi beli bersih selama 5 hari berturut-turut, saham berpotensi terdorong naik.',
    actionHint: 'Buka Radar Bandarmologi & Broker Summary di TradeSim Pro.',
  },
  {
    term: 'Cut Loss',
    category: 'Teknikal',
    definition: 'Tindakan menjual saham yang posisinya sedang merugi untuk mencegah kerugian yang jauh lebih besar dan menjaga sisa modal.',
    example: 'Trader menentukan batas cut loss maksimal -5%. Jika harga menembus batas itu, saham segera dijual.',
    actionHint: 'Latih disiplin cut loss tanpa risiko modal uang asli di TradeSim.',
  },
  {
    term: 'Take Profit',
    category: 'Teknikal',
    definition: 'Tindakan menjual saham yang posisinya sedang untung untuk merealisasikan keuntungan (Capital Gain).',
    example: 'Membeli di harga Rp 1.000 dan memasang target Take Profit di harga Rp 1.200 (+20%).',
    actionHint: 'Pasang Limit Order Take Profit otomatis di TradeSim Pro.',
  },
  {
    term: 'Dividen Yield',
    category: 'Fundamental',
    definition: 'Rasio persentase dividen tunai per lembar saham dibandingkan dengan harga pasar saham saat ini.',
    example: 'Saham berharga Rp 4.000 membagikan dividen Rp 200 per lembar, maka dividend yield-nya adalah (200 / 4000) x 100% = 5%.',
    actionHint: 'Cek jadwal dan estimasi yield di Kalender Dividen TradeSim.',
  },
  {
    term: 'PER (Price to Earnings Ratio)',
    category: 'Fundamental',
    definition: 'Rasio valuasi yang membandingkan harga saham saat ini dengan laba bersih per lembar saham (EPS). Semakin rendah umumnya semakin murah.',
    example: 'PER 10x berarti investor bersedia membayar Rp 10 untuk setiap Rp 1 laba yang dihasilkan perusahaan.',
    actionHint: 'Gunakan Screener Saham TradeSim untuk menyaring saham dengan PER rendah.',
  },
  {
    term: 'PBV (Price to Book Value)',
    category: 'Fundamental',
    definition: 'Rasio valuasi yang membandingkan harga pasar saham dengan nilai buku ekuitas per saham (BVPS). PBV < 1 sering dianggap undervalued.',
    example: 'Saham bank dengan PBV 0.8x diperdagangkan dengan diskon 20% di bawah nilai aset bersihnya.',
    actionHint: 'Saring saham undervalued dengan Screener Saham TradeSim.',
  },
  {
    term: 'Support & Resistance',
    category: 'Teknikal',
    definition: 'Support adalah batas bawah harga di mana minat beli cukup kuat untuk menahan penurunan. Resistance adalah batas atas harga di mana tekanan jual menahan kenaikan.',
    example: 'BBCA berulang kali memantul saat menyentuh harga Rp 4.800 (Support) dan tertahan di Rp 5.200 (Resistance).',
    actionHint: 'Gunakan drawing tools candlestick di Chart TradeSim untuk menggambar garis support.',
  },
  {
    term: 'Paper Trading',
    category: 'Dasar',
    definition: 'Metode latihan simulasi trading saham atau kripto menggunakan dana virtual pada data pasar yang nyata tanpa melibatkan uang riil.',
    example: 'TradeSim Pro memberikan modal virtual Rp 50.000.000 untuk paper trading saham BEI dan kripto 24/7.',
    actionHint: 'Buka akun TradeSim Pro gratis dan rasakan sensasi bursa nyata.',
  },
  {
    term: 'IHSG (Indeks Harga Saham Gabungan)',
    category: 'Dasar',
    definition: 'Indeks komposit yang mengukur performa rata-rata seluruh saham yang tercatat di Bursa Efek Indonesia (BEI).',
    example: 'IHSG menguat +1.2% ke level 7.350 menandakan mayoritas saham berkapitalisasi besar mengalami kenaikan.',
    actionHint: 'Pantau peta pergerakan IHSG dan sektoral di menu Pasar TradeSim.',
  },
  {
    term: 'LQ45 & IDX30',
    category: 'Dasar',
    definition: 'Indeks yang berisikan 45 dan 30 saham paling likuid dengan kapitalisasi pasar besar serta kondisi fundamental prima di BEI.',
    example: 'Saham BBCA, BBRI, BMRI, dan TLKM adalah konstituen utama indeks LQ45.',
    actionHint: 'Pilih kategori LQ45 di Market Board TradeSim untuk trading saham blue chip.',
  },
];

export default function IstilahSahamPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');

  const filteredTerms = useMemo(() => {
    return STOCK_GLOSSARY.filter((item) => {
      const matchSearch =
        item.term.toLowerCase().includes(search.toLowerCase()) ||
        item.definition.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCategory === 'SEMUA' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-emerald-400 transition">Beranda</Link>
          <span>/</span>
          <Link href="/learn/apa-itu-paper-trading" className="hover:text-emerald-400 transition">Edukasi</Link>
          <span>/</span>
          <span className="text-emerald-400 font-medium">Kamus Istilah Saham</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Glosarium Pasar Modal Indonesia (BEI / IDX)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Kamus Istilah Saham Terlengkap (A-Z)
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Pahami arti istilah penting yang paling sering digunakan para trader bursa saham Indonesia. Langsung praktikkan tanpa risiko dengan modal virtual Rp 50 Juta di TradeSim Pro.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari istilah saham (misal: Bid, Lot, HAKA, ARB, Bandarmologi)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['SEMUA', 'Dasar', 'Teknikal', 'Fundamental', 'Bandarmologi'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Glossary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {filteredTerms.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">
                    {item.term}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  {item.definition}
                </p>
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-4 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold block mb-1">Contoh Nyata:</span>
                  {item.example}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 italic">
                  💡 {item.actionHint}
                </span>
                <Link
                  href="/terminal"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 shrink-0"
                >
                  <span>Coba</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 p-8 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Ingin Praktikkan Istilah Ini di Pasar Saham Nyata?
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              Teori saja tidak cukup. Rasakan sensasi HAKA, HAKI, membaca antrean orderbook, dan analisis bandarmologi dengan modal virtual gratis Rp 50.000.000 di TradeSim Pro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/terminal"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Mulai Trading Simulator Gratis
              </Link>
              <Link
                href="/stock/BBCA"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition border border-slate-700"
              >
                Lihat Simulasi Saham BBCA
              </Link>
            </div>
          </div>
        </div>

        {/* Related Educational Guides & Calculators (Internal SEO Hub) */}
        <div className="pt-6 border-t border-slate-800 space-y-4 text-left">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Panduan Saham &amp; Kalkulator Terkait:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Link
              href="/learn/cara-main-saham-pemula"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors group block"
            >
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">Panduan Pemula</span>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Cara Main Saham dari Nol</h4>
              <p className="text-[11px] text-slate-400 mt-1">Langkah awal, modal minimal, dan tips memilih saham pertama.</p>
            </Link>
            <Link
              href="/learn/jam-bursa-saham-idx"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors group block"
            >
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase block mb-1">Operasional Bursa</span>
              <h4 className="text-xs font-bold text-white group-hover:text-blue-300">Jam Bursa Saham BEI Terbaru</h4>
              <p className="text-[11px] text-slate-400 mt-1">Jadwal resmi Sesi 1, Sesi 2, dan Pre-Opening Senin - Jumat.</p>
            </Link>
            <Link
              href="/learn/istilah-bandarmologi-saham"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors group block"
            >
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">Smart Money</span>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Kamus Lengkap Bandarmologi</h4>
              <p className="text-[11px] text-slate-400 mt-1">Akumulasi, distribusi, dan cara baca broker summary.</p>
            </Link>
            <Link
              href="/tools/kalkulator-cagr-saham"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-colors group block"
            >
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block mb-1">Kalkulator Finansial</span>
              <h4 className="text-xs font-bold text-white group-hover:text-purple-300">Kalkulator CAGR Investasi</h4>
              <p className="text-[11px] text-slate-400 mt-1">Hitung pertumbuhan majemuk bunga tahunan portofolio.</p>
            </Link>
            <Link
              href="/tools/kalkulator-fee-saham"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors group block"
            >
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">Kalkulator Broker</span>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Kalkulator Fee &amp; Breakeven</h4>
              <p className="text-[11px] text-slate-400 mt-1">Hitung fee beli, fee jual, dan pajak PPh bursa saham.</p>
            </Link>
            <Link
              href="/tools/kalkulator-lot"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors group block"
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block mb-1">Konversi Lot</span>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">Kalkulator Lot &amp; Lembar Saham</h4>
              <p className="text-[11px] text-slate-400 mt-1">Konversi instan lot ke rupiah dan estimasi modal beli.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
