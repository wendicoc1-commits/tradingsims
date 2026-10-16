import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, CheckCircle2, Shield, Zap, TrendingUp, HelpCircle, Layers, Award } from 'lucide-react';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

export default function CaraMainSahamPemulaPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Cara Main Saham untuk Pemula dari Nol: Panduan Praktis & Simulasi Tanpa Risiko',
    description: 'Panduan langkah demi langkah cara memulai investasi dan trading saham di Bursa Efek Indonesia (BEI) untuk pemula dari nol modal virtual.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cara Mulai Main Saham untuk Pemula',
    description: '4 langkah praktis memulai trading dan investasi saham di pasar modal Indonesia.',
    totalTime: 'PT5M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Pahami Konsep Dasar Saham & Fraksi Harga',
        text: 'Saham adalah bukti kepemilikan nilai suatu perusahaan. Pembelian minimal di BEI adalah 1 lot (100 lembar).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Buka Rekening Dana Nasabah (RDN) atau Gunakan Paper Trading',
        text: 'Untuk pemula yang belum siap risiko uang riil, gunakan platform simulator paper trading seperti TradeSim Pro dengan modal virtual Rp 50 Juta.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Pilih Saham Blue Chip Berfundamental Sehat',
        text: 'Fokus pada saham indeks LQ45 atau IDX30 seperti BBCA, BBRI, BMRI, TLKM, atau ASII yang likuid dan memiliki profit bisnis konsisten.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Tentukan Target Profit & Disiplin Stop Loss',
        text: 'Gunakan money management dengan batas risiko maksimal 1-2% dari total modal per transaksi sebelum mengeksekusi order.',
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Berapa modal minimal untuk main saham di Indonesia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Modal minimal untuk membeli saham di Indonesia adalah harga 1 lot (100 lembar). Misalnya saham GOTO berharga Rp 60 per lembar, maka 1 lot hanya membutuhkan modal Rp 6.000. Untuk saham BBCA seharga Rp 10.000 per lembar, 1 lot membutuhkan Rp 1.000.000.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah pemula bisa rugi saat main saham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, harga saham berfluktuasi setiap detik. Namun risiko kerugian dapat diminimalkan dengan belajar analisis fundamental, membatasi kerugian via Stop Loss, dan berlatih terlebih dahulu di simulator paper trading seperti TradeSim Pro tanpa risiko uang asli.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apa perbedaan investor saham dan trader saham?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Investor membeli saham untuk jangka panjang (bulanan hingga tahunan) mengandalkan dividen dan pertumbuhan laba perusahaan. Sedangkan trader memanfaatkan fluktuasi harga jangka pendek (menit, harian, atau mingguan) mengandalkan grafik teknikal.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ learn / pemula</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ShareWebsiteButton />
            <Link
              href="/terminal"
              className="text-xs font-bold px-3 py-1.5 rounded bg-emerald-500 text-black hover:bg-emerald-400 transition-colors flex items-center gap-1 font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <span>Mulai Latihan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Title & E-E-A-T */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Panduan Saham Pemula 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Cara Main Saham untuk Pemula dari Nol: Panduan Praktis &amp; Simulasi Tanpa Risiko
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Ingin mulai berinvestasi di pasar modal Indonesia namun bingung harus mulai dari mana? Simak panduan komprehensif langkah demi langkah, istilah wajib tahu (lot, bid/offer, dividen), dan cara berlatih simulasi trading gratis modal Rp 50 Juta.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Direct Answer Box for AI & Featured Snippets */}
        <div className="p-5 rounded-2xl bg-[#090D16] border border-emerald-500/30 space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Ringkasan Cepat (Direct Answer)
          </span>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            <strong>Cara main saham untuk pemula di Indonesia</strong> dimulai dengan memahami bahwa pembelian minimal saham di Bursa Efek Indonesia (BEI) adalah <strong>1 lot (100 lembar)</strong>. Pemula disarankan memilih saham berkapitalisasi besar (Blue Chip seperti BBCA, BBRI, BMRI), membatasi risiko kerugian dengan Stop Loss, dan menguji kemampuan analisa di platform simulasi paper trading gratis seperti <Link href="/terminal" className="text-emerald-400 underline font-semibold">TradeSim Pro</Link> sebelum memakai uang asli.
          </p>
        </div>

        {/* 4 Steps Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>4 Langkah Memulai Main Saham dari Nol</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                step: '01',
                title: 'Ketahui Satuan Beli (1 Lot = 100 Lembar)',
                desc: 'Di bursa Indonesia, Anda tidak bisa membeli 1 lembar saham sembarangan. Minimal transaksi adalah 1 lot (100 lembar). Jadi jika harga saham TLKM Rp 3.000, modal 1 lot adalah Rp 300.000.',
              },
              {
                step: '02',
                title: 'Pilih Saham Perusahaan Berprofit Sehat',
                desc: 'Hindari saham gorengan berfluktuasi ekstrem. Utamakan emiten dengan fundamental teruji di indeks LQ45 atau IDX30 yang rutin membagikan dividen tahunan.',
              },
              {
                step: '03',
                title: 'Pahami Jam Perdagangan Bursa (BEI)',
                desc: 'Bursa saham buka hari Senin - Jumat dengan dua sesi: Sesi 1 (09:00 - 12:00 WIB) dan Sesi 2 (13:30 - 15:49 WIB). Di luar jam tersebut bursa tutup.',
              },
              {
                step: '04',
                title: 'Latihan di Simulator Paper Trading',
                desc: 'Sebelum mempertaruhkan tabungan nyata, latih kepekaan membaca chart candlestick dan orderbook di TradeSim Pro dengan modal virtual Rp 50.000.000.',
              },
            ].map((card) => (
              <div key={card.step} className="p-5 rounded-xl bg-[#090D16] border border-zinc-800 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400">{card.step}</span>
                <h3 className="font-bold text-sm text-white">{card.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table: Investor vs Trader */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-zinc-800 space-y-4">
          <h2 className="font-bold text-base text-white font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Perbandingan: Investor Saham vs Trader Saham</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0c1220] text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Karakteristik</th>
                  <th className="py-2.5 px-3">Investor (Investing)</th>
                  <th className="py-2.5 px-3">Trader (Trading)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">Tujuan Utama</td>
                  <td className="py-2.5 px-3">Pertumbuhan aset jangka panjang & dividen</td>
                  <td className="py-2.5 px-3">Memanfaatkan fluktuasi harga harian/mingguan</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">Analisis Utama</td>
                  <td className="py-2.5 px-3">Laporan Keuangan & Laba Fundamental</td>
                  <td className="py-2.5 px-3">Chart Candlestick & Indikator Teknikal</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">Tingkat Stres</td>
                  <td className="py-2.5 px-3 text-emerald-400">Rendah (tidak perlu mantau tiap menit)</td>
                  <td className="py-2.5 px-3 text-amber-400">Tinggi (butuh disiplin Stop Loss ketat)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Call-to-action Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0a121d] to-[#070a10] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-white">Siap Mulai Latihan Saham Hari Ini?</h3>
            <p className="text-xs text-zinc-400">Daftar dalam 10 detik dan nikmati saldo virtual Rp 50.000.000 untuk beli saham BBCA, BBRI, GOTO tanpa risiko.</p>
          </div>
          <Link
            href="/terminal"
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold font-mono text-xs hover:bg-emerald-400 transition-colors shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Mulai Paper Trading Gratis
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pt-6 border-t border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <span>Pertanyaan Populer Pemula (FAQ)</span>
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
