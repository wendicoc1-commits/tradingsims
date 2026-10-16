import React from 'react';
import Link from 'next/link';
import { Target, ArrowRight, CheckCircle2, Shield, Eye, TrendingUp, HelpCircle, Zap, Crosshair } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function IstilahBandarmologiPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Istilah Bandarmologi Saham Lengkap: Akumulasi, Distribusi & Cara Membaca Broker Summary',
    description: 'Kamus panduan istilah bandarmologi bursa saham Indonesia (BEI) untuk mendeteksi jejak smart money dan aliran dana institusi besar.',
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
        name: 'Apa itu bandarmologi dalam saham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bandarmologi adalah metode analisis pergerakan aliran dana besar (Smart Money / Market Maker / Bandar) di bursa saham untuk mengetahui apakah suatu saham sedang dikumpulkan (akumulasi) atau dijual secara bertahap (distribusi).',
        },
      },
      {
        '@type': 'Question',
        name: 'Apa bedanya Akumulasi dan Distribusi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Akumulasi adalah proses di mana bandar atau institusi besar membeli saham dalam jumlah masif secara diam-diam tanpa menaikkan harga terlalu drastis. Distribusi adalah kebalikannya, saat bandar menjual saham kepemilikannya kepada investor ritel di harga tinggi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apa itu Broker Summary (Broksum)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Broker Summary adalah laporan ringkasan transaksi jual-beli saham berdasarkan kode sekuritas/broker (seperti CC, PD, YP, NI). Analis bandarmologi menggunakan broksum untuk melihat sekuritas mana yang memborong (top buyer) dan sekuritas mana yang melepas (top seller).',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center font-mono">
              ⚡
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ learn / bandarmologi</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ShareWebsiteButton />
            <Link
              href="/bandar"
              className="text-xs font-bold px-3 py-1.5 rounded bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center gap-1 font-mono shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            >
              <span>Radar Bandar</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Title & E-E-A-T */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium">
            <Target className="w-3.5 h-3.5" />
            <span>Kamus Bandarmologi &amp; Smart Money</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Istilah Bandarmologi Saham Lengkap: Akumulasi, Distribusi &amp; Broker Summary
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Pahami cara membaca jejak aliran dana institusi besar (Smart Money) di Bursa Efek Indonesia. Pelajari istilah krusial bandarmologi agar Anda tidak lagi menjadi korban guyuran saham di pucuk.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Direct Answer */}
        <div className="p-5 rounded-2xl bg-[#090D16] border border-amber-500/30 space-y-3">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Intisari Bandarmologi
          </span>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            <strong>Bandarmologi</strong> adalah ilmu yang mempelajari pergerakan volume dan perpindahan barang dari satu pihak ke pihak lain di pasar saham. Prinsip dasarnya sederhana: <em>"Beli saat bandar sedang akumulasi di harga bawah, dan jual saat bandar mulai distribusi ke ritel di harga atas."</em>
          </p>
        </div>

        {/* Key Terms Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <Crosshair className="w-5 h-5 text-amber-400" />
            <span>Kamus Istilah Utama Bandarmologi</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {[
              {
                term: 'Akumulasi (Accumulation)',
                badge: 'Fase 1',
                color: 'text-emerald-400',
                desc: 'Proses di mana bandar atau konglomerat mengumpulkan saham dalam jumlah besar di rentang harga sempit (sideways). Ciri khasnya volume tinggi namun pergerakan harga tertahan.',
              },
              {
                term: 'Mark Up (Pengerekkan Harga)',
                badge: 'Fase 2',
                color: 'text-cyan-400',
                desc: 'Setelah barang terkumpul cukup banyak, bandar mulai memicu lonjakan harga dengan memakan offer hingga auto rejection atas (ARA) untuk memancing minat ritel (FOMO).',
              },
              {
                term: 'Distribusi (Distribution)',
                badge: 'Fase 3',
                color: 'text-rose-400',
                desc: 'Bandar mulai menjual saham yang dibeli murah kepada investor ritel yang baru masuk karena berita positif. Harga tampak kuat tetapi volume jual diam-diam sangat besar.',
              },
              {
                term: 'Mark Down (Banting Harga)',
                badge: 'Fase 4',
                color: 'text-amber-400',
                desc: 'Setelah bandar selesai keluar membawa profit, tidak ada lagi yang menahan harga sehingga saham anjlok drastis (Auto Rejection Bawah / ARB beruntun).',
              },
              {
                term: 'Broker Summary (Broksum)',
                badge: 'Alat Analisa',
                color: 'text-blue-400',
                desc: 'Tabel yang merangkum nilai net buy dan net sell seluruh kode sekuritas bursa pada saham tertentu, memperlihatkan tingkat konsentrasi pembelian oleh 3-5 broker teratas.',
              },
              {
                term: 'Foreign Flow (Asing)',
                badge: 'Arus Modal',
                color: 'text-purple-400',
                desc: 'Aliran dana investor institusi luar negeri. Net foreign buy (pembelian bersih asing) sering menjadi katalis penggerak utama pada saham indeks LQ45 seperti BBCA dan BMRI.',
              },
            ].map((item) => (
              <div key={item.term} className="p-5 rounded-xl bg-[#090D16] border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-sm ${item.color}`}>{item.term}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{item.badge}</span>
                </div>
                <p className="text-zinc-400 leading-relaxed font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Radar Bandar Promotion */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0a121d] to-[#070a10] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-white">Ingin Melihat Aliran Bandar Real-Time?</h3>
            <p className="text-xs text-zinc-400">TradeSim Pro dilengkapi fitur Radar Bandarmologi untuk mendeteksi akumulasi masif, net foreign buy, dan anomali transaksi broker bursa secara langsung.</p>
          </div>
          <Link
            href="/bandar"
            className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold font-mono text-xs hover:bg-amber-400 transition-colors shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            Buka Radar Bandarmologi
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pt-6 border-t border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>Pertanyaan Seputar Bandarmologi (FAQ)</span>
          </h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#090D16] border border-zinc-800/80 space-y-1.5">
                <h3 className="font-bold text-sm text-white">{item.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
