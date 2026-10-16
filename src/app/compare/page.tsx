'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scale, ArrowRight, Zap, TrendingUp, Search, CheckCircle2 } from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

const POPULAR_RIVALRIES = [
  { pair: 'bbca-vs-bbri', title: 'BBCA vs BBRI', cat: 'Perbankan', desc: 'Bank Swasta Terbesar vs Bank BUMN Kredit Mikro' },
  { pair: 'bmri-vs-bbni', title: 'BMRI vs BBNI', cat: 'Perbankan', desc: 'Bank Korporasi Terbesar vs Bank BUMN Jaringan Global' },
  { pair: 'goto-vs-buka', title: 'GOTO vs BUKA', cat: 'Teknologi', desc: 'Dua Raksasa Ekosistem Teknologi & E-Commerce' },
  { pair: 'adro-vs-ptba', title: 'ADRO vs PTBA', cat: 'Batubara', desc: 'Raja Dividen Batubara Swasta vs Produsen Tambang BUMN' },
  { pair: 'antm-vs-mdka', title: 'ANTM vs MDKA', cat: 'Komoditas', desc: 'Komoditas Emas, Nikel & Tembaga Indonesia' },
  { pair: 'tlkm-vs-isat', title: 'TLKM vs ISAT', cat: 'Telco', desc: 'Penguasa Jaringan Telekomunikasi & Data Seluler' },
  { pair: 'asii-vs-untr', title: 'ASII vs UNTR', cat: 'Konglomerat', desc: 'Grup Otomotif Astra vs Alat Berat Pertambangan' },
  { pair: 'icbp-vs-indf', title: 'ICBP vs INDF', cat: 'Konsumer', desc: 'Produsen Mie Instan vs Holding Indofood Grup' },
  { pair: 'btc-vs-eth', title: 'BTC vs ETH', cat: 'Crypto', desc: 'Emas Digital Global vs Pondasi Smart Contract' },
  { pair: 'sol-vs-eth', title: 'SOL vs ETH', cat: 'Crypto', desc: 'High-Throughput Layer 1 vs Ekosistem Terbesar' },
  { pair: 'nvda-vs-amd', title: 'NVDA vs AMD', cat: 'Semikonduktor', desc: 'Raja Akselerator AI vs Kompetitor GPU/CPU' },
  { pair: 'aapl-vs-msft', title: 'AAPL vs MSFT', cat: 'Big Tech', desc: 'Ekosistem Gadget Premium vs Raksasa Enterprise Cloud' },
];

export default function CompareHubPage() {
  const router = useRouter();
  const [sym1, setSym1] = useState('BBCA');
  const [sym2, setSym2] = useState('BBRI');

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sym1 || !sym2) return;
    const clean1 = sym1.trim().toLowerCase();
    const clean2 = sym2.trim().toLowerCase();
    router.push(`/compare/${clean1}-vs-${clean2}`);
  };

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center font-mono">
              ⚡
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ compare</span>
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
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Title */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <Scale className="w-3.5 h-3.5" />
            <span>Pusat Komparasi Saham &amp; Aset Global</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Bandingkan Dua Saham Secara Objektif
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Pilih dua emiten saham atau koin kripto untuk melihat perbandingan rasio P/E, PBV, yield dividen, konsensus analis Bloomberg, dan chart teknikal berdampingan.
          </p>
        </div>

        {/* Custom Comparison Input Box */}
        <div className="p-6 rounded-2xl bg-[#090D16] border border-zinc-800 shadow-xl max-w-xl mx-auto space-y-4">
          <form onSubmit={handleCompare} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Aset Pertama:</label>
                <div className="flex items-center gap-2 bg-[#070A10] border border-zinc-700 rounded-lg px-3 py-2">
                  <CompanyLogo symbol={sym1} size={20} />
                  <input
                    type="text"
                    value={sym1}
                    onChange={(e) => setSym1(e.target.value.toUpperCase())}
                    placeholder="BBCA"
                    className="w-full bg-transparent text-white font-mono font-bold focus:outline-none uppercase text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Aset Kedua:</label>
                <div className="flex items-center gap-2 bg-[#070A10] border border-zinc-700 rounded-lg px-3 py-2">
                  <CompanyLogo symbol={sym2} size={20} />
                  <input
                    type="text"
                    value={sym2}
                    onChange={(e) => setSym2(e.target.value.toUpperCase())}
                    placeholder="BBRI"
                    className="w-full bg-transparent text-white font-mono font-bold focus:outline-none uppercase text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Scale className="w-4 h-4" />
              <span>Bandingkan {sym1} vs {sym2} Sekarang</span>
            </button>
          </form>
        </div>

        {/* Popular Head-to-Head Cards */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Perbandingan Rivalitas Terpopuler:</span>
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">12 Pilihan Populer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {POPULAR_RIVALRIES.map((item) => {
              const parts = item.pair.split('-vs-');
              return (
                <Link
                  key={item.pair}
                  href={`/compare/${item.pair}`}
                  className="p-4 rounded-xl bg-[#090D16] border border-zinc-800 hover:border-emerald-500/40 transition-colors group block space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <CompanyLogo symbol={parts[0]} size={20} />
                      <span className="text-zinc-600 font-mono text-xs font-bold">vs</span>
                      <CompanyLogo symbol={parts[1]} size={20} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{item.cat}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 font-mono">{item.title}</h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
