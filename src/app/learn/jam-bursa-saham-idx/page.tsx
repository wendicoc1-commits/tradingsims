import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, CheckCircle2, Shield, Calendar, AlertTriangle, Zap, HelpCircle } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function JamBursaSahamPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Jam Bursa Saham Indonesia (BEI / IDX) Terbaru: Jadwal Sesi 1, Sesi 2, Pre-Opening & Pre-Closing',
    description: 'Jadwal resmi jam operasional perdagangan pasar saham Bursa Efek Indonesia (BEI / IDX) Senin sampai Jumat.',
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
        name: 'Sesi 1 bursa saham buka jam berapa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sesi 1 perdagangan saham di Bursa Efek Indonesia (BEI) dibuka pukul 09:00 WIB dan ditutup pukul 12:00 WIB untuk hari Senin sampai Kamis. Khusus hari Jumat, Sesi 1 ditutup lebih awal pukul 11:30 WIB.',
        },
      },
      {
        '@type': 'Question',
        name: 'Sesi 2 bursa saham buka jam berapa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sesi 2 dibuka pukul 13:30 WIB untuk hari Senin - Kamis, dan pukul 14:00 WIB untuk hari Jumat. Sesi perdagangan reguler berakhir pada pukul 15:49 WIB diikuti sesi Pre-Closing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah bursa saham buka di hari Sabtu dan Minggu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tidak, bursa saham BEI tutup pada hari Sabtu, Minggu, dan hari libur nasional (tanggal merah). Namun jika Anda ingin trading di akhir pekan, Anda bisa trading aset Kripto yang buka 24 jam nonstop setiap hari di TradeSim Pro.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apa itu sesi Pre-Opening dan Pre-Closing di saham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pre-Opening (08:45 - 08:59 WIB) adalah sesi pembentukan harga pembukaan (Opening Price) untuk saham LQ45. Pre-Closing (15:50 - 16:00 WIB) adalah sesi pembentukan harga penutupan resmi (Closing Price) seluruh saham bursa.',
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
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ learn / jam-bursa</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ShareWebsiteButton />
            <Link
              href="/terminal"
              className="text-xs font-bold px-3 py-1.5 rounded bg-emerald-500 text-black hover:bg-emerald-400 transition-colors flex items-center gap-1 font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <span>Buka Terminal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Title & Badge */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Jadwal Operasional BEI / IDX 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Jam Bursa Saham Indonesia (BEI / IDX) Terbaru: Sesi 1, Sesi 2 &amp; Pre-Opening
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Panduan lengkap jadwal resmi jam perdagangan bursa efek Indonesia hari Senin hingga Jumat. Wajib dipahami trader agar tidak salah pasang antrean order beli/jual di pasar reguler.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Direct Answer Box */}
        <div className="p-5 rounded-2xl bg-[#090D16] border border-blue-500/30 space-y-3">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Ringkasan Jam Bursa (WIB)
          </span>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            <strong>Jam buka bursa saham Indonesia (BEI):</strong> Hari Senin - Kamis: Sesi 1 (09:00 - 12:00 WIB) dan Sesi 2 (13:30 - 15:49 WIB). Khusus hari Jumat: Sesi 1 (09:00 - 11:30 WIB) dan Sesi 2 (14:00 - 15:49 WIB). Di luar jam tersebut, perdagangan saham bursa ditutup.
          </p>
        </div>

        {/* Schedule Tables */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Tabel Jam Perdagangan Pasar Reguler BEI</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Senin - Kamis */}
            <div className="p-5 rounded-2xl bg-[#090D16] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="font-bold text-sm text-white font-mono">Senin s/d Kamis</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">4 Hari Kerja</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Pre-Opening:</span>
                  <span className="text-white font-bold">08:45:00 - 08:59:00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Sesi I (Pagi):</span>
                  <span className="text-emerald-400 font-bold">09:00:00 - 12:00:00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Istirahat Siang:</span>
                  <span className="text-zinc-500">12:00:00 - 13:30:00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Sesi II (Siang):</span>
                  <span className="text-emerald-400 font-bold">13:30:00 - 15:49:59 WIB</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Pre-Closing &amp; Crossing:</span>
                  <span className="text-white font-bold">15:50:00 - 16:15:00 WIB</span>
                </div>
              </div>
            </div>

            {/* Khusus Hari Jumat */}
            <div className="p-5 rounded-2xl bg-[#090D16] border border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <h3 className="font-bold text-sm text-white font-mono">Khusus Hari Jumat</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">Ibadah Sholat Jumat</span>
              </div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Pre-Opening:</span>
                  <span className="text-white font-bold">08:45:00 - 08:59:00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Sesi I (Pagi):</span>
                  <span className="text-amber-400 font-bold">09:00:00 - 11:30:00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Istirahat Sholat Jumat:</span>
                  <span className="text-zinc-500">11:30:00 - 14:00:00 WIB</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-400">Sesi II (Siang):</span>
                  <span className="text-amber-400 font-bold">14:00:00 - 15:49:59 WIB</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-400">Pre-Closing &amp; Crossing:</span>
                  <span className="text-white font-bold">15:50:00 - 16:15:00 WIB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekend Trading Notice */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-[#070a10] border border-cyan-500/30 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm font-mono">
            <Zap className="w-4 h-4" />
            <span>Ingin Trading di Hari Sabtu &amp; Minggu?</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            Meskipun bursa saham BEI tutup di akhir pekan, pasar <strong>Cryptocurrency Spot</strong> (Bitcoin, Ethereum, Solana, BNB) di TradeSim Pro tetap berjalan <strong>24 jam sehari nonstop, 7 hari seminggu</strong>. Anda tetap bisa melatih strategi kuantitatif kapan saja.
          </p>
          <div className="pt-2">
            <Link
              href="/crypto"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs hover:bg-cyan-500/30 transition-colors"
            >
              <span>Buka Crypto Trading Desk 24/7</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pt-6 border-t border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
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
