'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Layers, ArrowRight, ArrowLeft, TrendingUp, BarChart2, Shield, CheckCircle2, Zap } from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';
import EeatComplianceBadge from '@/components/seo/EeatComplianceBadge';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

interface SectorConfig {
  name: string;
  category: string;
  desc: string;
  symbols: string[];
}

const SECTOR_DATA: Record<string, SectorConfig> = {
  perbankan: {
    name: 'Perbankan & Lembaga Keuangan',
    category: 'Financial Services',
    desc: 'Sektor perbankan merupakan penggerak utama bobot indeks IHSG (mencapai >35% bobot bursa). Terkenal dengan dividen stabil dan permodalan kuat (CAR > 20%).',
    symbols: ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS', 'BDMN', 'BBTN', 'BNGA', 'ARTO', 'MEGA', 'BJTM', 'BJBR'],
  },
  'energi-dan-batubara': {
    name: 'Energi, Minyak & Pertambangan Batubara',
    category: 'Energy & Commodities',
    desc: 'Sektor komoditas energi dengan cash flow tinggi dan payout ratio dividen terbesar di BEI. Sangat dipengaruhi harga batubara Newcastle dan tren energi global.',
    symbols: ['ADRO', 'PTBA', 'ITMG', 'MEDC', 'PGAS', 'BUMI', 'DEWA', 'ENRG', 'AKRA', 'HRUM', 'ESSA', 'PGEO'],
  },
  'teknologi-dan-digital': {
    name: 'Teknologi, E-Commerce & Infrastruktur Digital',
    category: 'Technology & Internet',
    desc: 'Ekosistem digital Indonesia yang mencakup ride-hailing, e-commerce, media digital, dan data center masa depan berbasis komputasi AI.',
    symbols: ['GOTO', 'BUKA', 'EMTK', 'SCMA', 'MTDL', 'WIFI'],
  },
  'konsumer-dan-ritel': {
    name: 'Barang Konsumsi Primer & Ritel Modern',
    category: 'Consumer Staples & Discretionary',
    desc: 'Sektor defensif dengan perputaran kas cepat yang tahan terhadap inflasi dan siklus ekonomi. Didukung oleh konsumsi domestik 280 juta penduduk Indonesia.',
    symbols: ['ICBP', 'INDF', 'UNVR', 'MYOR', 'AMRT', 'MIDI', 'CMRY', 'SIDO', 'ACES', 'MAPI', 'MAPA'],
  },
  'infrastruktur-dan-telekomunikasi': {
    name: 'Telekomunikasi, Menara & Jalan Tol',
    category: 'Telecommunications & Infrastructure',
    desc: 'Penyedia infrastruktur konektivitas data dan logistik nasional dengan pendapatan sewa jangka panjang yang stabil dan dividen terukur.',
    symbols: ['TLKM', 'ISAT', 'EXCL', 'TOWR', 'TBIG', 'JSMR'],
  },
  'kripto-layer-1': {
    name: 'Cryptocurrency Blockchain Layer 1',
    category: 'Digital Assets',
    desc: 'Protokol blockchain pondasi generasi baru dengan desentralisasi dan konsensus global. Diperdagangkan 24 jam nonstop 7 hari seminggu di TradeSim Pro.',
    symbols: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'SUI', 'NEAR', 'TRX'],
  },
};

export default function SectorDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'perbankan';
  const sector = SECTOR_DATA[slug] || SECTOR_DATA.perbankan;

  const stockList = useMemo(() => {
    return sector.symbols.map((sym) => {
      const asset = getAssetBySymbol(sym);
      return {
        symbol: sym,
        name: asset?.name || `${sym} Corporation`,
        price: asset?.defaultPrice || 5000,
        currency: asset?.currency || 'IDR',
      };
    });
  }, [sector]);

  return (
    <div className="min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/markets" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="font-bold text-sm tracking-tight text-white font-mono">
              TRADESIM<span className="text-amber-400">.OS</span> <span className="text-zinc-500 text-xs font-normal">/ sektor / {slug}</span>
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
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>Sektor Pasar Modal: {sector.category}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Daftar Saham Sektor {sector.name}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            {sector.desc} Seluruh emiten di bawah ini tersedia untuk simulasi trading bebas risiko dengan modal virtual Rp 50.000.000 di TradeSim Pro.
          </p>
          <EeatComplianceBadge reviewedDate="16 Oktober 2026" reviewerName="TradeSim Pro Quantitative Desk" />
        </div>

        {/* Constituents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stockList.map((item) => (
            <Link
              key={item.symbol}
              href={`/stock/${item.symbol}`}
              className="p-4 rounded-xl bg-[#090D16] border border-zinc-800 hover:border-emerald-500/40 transition-colors group block space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <CompanyLogo symbol={item.symbol} size={32} rounded="md" />
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 font-mono">
                      {item.symbol}
                    </h3>
                    <span className="text-[10px] text-zinc-500 block truncate max-w-[130px] font-sans">
                      {item.name}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </div>

              <div className="pt-2 border-t border-zinc-850 flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500 text-[10px]">Harga:</span>
                <span className="font-bold text-white">
                  {item.currency === 'USD' ? `$${item.price.toLocaleString()}` : `Rp ${item.price.toLocaleString('id-ID')}`}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Other Sectors Navigation */}
        <div className="p-6 rounded-2xl bg-[#090D16] border border-zinc-800 space-y-4">
          <h2 className="font-bold text-base text-white font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Jelajahi Sektor Lainnya:</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(SECTOR_DATA).filter(([k]) => k !== slug).map(([key, sec]) => (
              <Link
                key={key}
                href={`/sektor/${key}`}
                className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/40 transition-colors group block"
              >
                <h3 className="font-bold text-xs text-white group-hover:text-emerald-300 font-mono mb-1">{sec.name}</h3>
                <span className="text-[10px] text-zinc-400">{sec.symbols.length} Emiten Unggulan</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
