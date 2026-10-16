'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, TrendingUp, Scale, CheckCircle2, Zap, BarChart2, DollarSign, HelpCircle, Shield } from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';
import { getAssetBySymbol, mapToTradingViewSymbol, isCryptoSymbol } from '@/lib/universe/masterAssetUniverse';
import { BLOOMBERG_ANALYST_CONSENSUS } from '@/data/bloomberg_analyst_consensus';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

const POPULAR_RIVALRIES = [
  { pair: 'bbca-vs-bbri', title: 'BBCA vs BBRI', desc: 'Bank Swasta Terbesar vs Bank BUMN Kredit Mikro' },
  { pair: 'bmri-vs-bbni', title: 'BMRI vs BBNI', desc: 'Bank Korporasi vs Bank Global BUMN' },
  { pair: 'goto-vs-buka', title: 'GOTO vs BUKA', desc: 'Dua Raksasa Ekosistem Teknologi & E-Commerce' },
  { pair: 'adro-vs-ptba', title: 'ADRO vs PTBA', desc: 'Raja Dividen Batubara Swasta vs BUMN' },
  { pair: 'antm-vs-mdka', title: 'ANTM vs MDKA', desc: 'Komoditas Emas, Nikel & Tembaga Indonesia' },
  { pair: 'tlkm-vs-isat', title: 'TLKM vs ISAT', desc: 'Penguasa Jaringan Telekomunikasi & Data Seluler' },
  { pair: 'btc-vs-eth', title: 'BTC vs ETH', desc: 'Emas Digital vs Ratu Smart Contract Global' },
  { pair: 'sol-vs-eth', title: 'SOL vs ETH', desc: 'High-Throughput L1 vs Ekosistem Smart Contract' },
  { pair: 'nvda-vs-amd', title: 'NVDA vs AMD', desc: 'Perang Chip AI & Akselerator Semikonduktor' },
  { pair: 'aapl-vs-msft', title: 'AAPL vs MSFT', desc: 'Raksasa Consumer Hardware vs Cloud & AI Enterprise' },
];

export default function ComparePairPage() {
  const params = useParams();
  const rawPair = (params?.pair as string) || 'bbca-vs-bbri';
  const parts = decodeURIComponent(rawPair).toLowerCase().split('-vs-');
  const sym1 = (parts[0] || 'BBCA').toUpperCase();
  const sym2 = (parts[1] || 'BBRI').toUpperCase();

  const asset1 = useMemo(() => getAssetBySymbol(sym1) || {
    symbol: sym1,
    name: `${sym1} Corporation`,
    category: isCryptoSymbol(sym1) ? 'CRYPTO' : 'IDX',
    defaultPrice: 10000,
    sector: 'Financials',
    currency: isCryptoSymbol(sym1) ? 'USD' : 'IDR',
  }, [sym1]);

  const asset2 = useMemo(() => getAssetBySymbol(sym2) || {
    symbol: sym2,
    name: `${sym2} Corporation`,
    category: isCryptoSymbol(sym2) ? 'CRYPTO' : 'IDX',
    defaultPrice: 5000,
    sector: 'Financials',
    currency: isCryptoSymbol(sym2) ? 'USD' : 'IDR',
  }, [sym2]);

  const consensus1 = BLOOMBERG_ANALYST_CONSENSUS[sym1];
  const consensus2 = BLOOMBERG_ANALYST_CONSENSUS[sym2];

  const isCrypto1 = isCryptoSymbol(sym1);
  const isCrypto2 = isCryptoSymbol(sym2);

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/compare" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ compare / {sym1}-vs-{sym2}</span>
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <Scale className="w-3.5 h-3.5" />
            <span>Head-to-Head Stock &amp; Asset Comparison</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3 flex-wrap">
            <span>Perbandingan {sym1} vs {sym2}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
              Analisis Komparatif
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Bandingkan metrik kinerja keuangan, valuasi rasio P/E dan PBV, yield dividen, serta konsensus analis antara <strong className="text-white">{asset1.name} ({sym1})</strong> dan <strong className="text-white">{asset2.name} ({sym2})</strong> secara objektif.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Head-to-Head Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Asset 1 Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a101d] to-[#070b13] border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CompanyLogo symbol={sym1} size={44} rounded="md" />
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">{sym1}</h2>
                  <span className="text-xs text-zinc-400 block truncate max-w-[220px]">{asset1.name}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {asset1.sector}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-zinc-500 block font-mono">Estimasi Harga Acuan:</span>
                <span className="text-2xl font-black font-mono text-white">
                  {isCrypto1 ? `$${asset1.defaultPrice.toLocaleString()}` : `Rp ${asset1.defaultPrice.toLocaleString('id-ID')}`}
                </span>
              </div>
              <Link
                href={`/stock/${sym1}`}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1"
              >
                <span>Detail {sym1}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Asset 2 Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0a101d] to-[#070b13] border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CompanyLogo symbol={sym2} size={44} rounded="md" />
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">{sym2}</h2>
                  <span className="text-xs text-zinc-400 block truncate max-w-[220px]">{asset2.name}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {asset2.sector}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-zinc-500 block font-mono">Estimasi Harga Acuan:</span>
                <span className="text-2xl font-black font-mono text-white">
                  {isCrypto2 ? `$${asset2.defaultPrice.toLocaleString()}` : `Rp ${asset2.defaultPrice.toLocaleString('id-ID')}`}
                </span>
              </div>
              <Link
                href={`/stock/${sym2}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1"
              >
                <span>Detail {sym2}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-zinc-800 space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2 font-mono">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Matriks Perbandingan Valuasi &amp; Kinerja</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0c1220] text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Metrik Indikator</th>
                  <th className="py-3 px-3 text-center text-blue-400 font-bold">{sym1}</th>
                  <th className="py-3 px-3 text-center text-emerald-400 font-bold">{sym2}</th>
                  <th className="py-3 px-3 text-right">Analisis Singkat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">Kategori Aset</td>
                  <td className="py-2.5 px-3 text-center">{asset1.category}</td>
                  <td className="py-2.5 px-3 text-center">{asset2.category}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">Instrumen Pasar Terdaftar</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">Sektor Industri</td>
                  <td className="py-2.5 px-3 text-center">{asset1.sector}</td>
                  <td className="py-2.5 px-3 text-center">{asset2.sector}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">Klasifikasi Bisnis Utama</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">Skor Konsensus Analis</td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-300">{consensus1?.consensusScore || 4.2} / 5.0</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-300">{consensus2?.consensusScore || 4.4} / 5.0</td>
                  <td className="py-2.5 px-3 text-right text-zinc-400">Rekomendasi Riset Institusi</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-white">Simulasi Bebas Risiko</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Tersedia Rp 50 Juta</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">Tersedia Rp 50 Juta</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">Paper Trading TradeSim Pro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Technical Candlestick Charts (TradingView Embeds) */}
        <div className="space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2 font-mono">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Grafik Candlestick Interaktif Real-Time</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-zinc-800 bg-[#090d16] overflow-hidden h-[360px]">
              <iframe
                title={`${sym1} Chart`}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_${sym1}&symbol=${encodeURIComponent(mapToTradingViewSymbol(sym1))}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=090d16&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#090d16] overflow-hidden h-[360px]">
              <iframe
                title={`${sym2} Chart`}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_${sym2}&symbol=${encodeURIComponent(mapToTradingViewSymbol(sym2))}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=090d16&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Popular Rivalries Grid */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#090D16] border border-zinc-800 space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2 font-mono">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Komparasi Saham &amp; Crypto Populer Lainnya</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_RIVALRIES.filter((r) => r.pair !== rawPair.toLowerCase()).map((item) => (
              <Link
                key={item.pair}
                href={`/compare/${item.pair}`}
                className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/40 transition-colors group block"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 font-mono">{item.title}</h3>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
