'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  HelpCircle,
  Calculator,
} from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';
import IPOAllotmentCalculator from '@/components/ipo/IPOAllotmentCalculator';

// Tipe data calon emiten belum IPO (Pipeline & Sedang Penawaran)
export interface UpcomingIPO {
  id: string;
  tickerExpected: string;
  companyName: string;
  sector: string;
  subSector: string;
  stage: 'BOOK_BUILDING' | 'OFFERING' | 'ALLOTMENT' | 'PIPELINE';
  priceRange: string;
  sharesOffered: string; // lembar
  targetFunds: string; // IDR
  leadUnderwriter: string;
  bookBuildingDates: string;
  offeringDates: string;
  estimatedListingDate: string;
  useOfFunds: string;
  warrantRatio?: string; // misal 2:1
  prospectusUrl?: string;
  highlights: string[];
}

// Tipe data emiten yang sudah resmi IPO (Listing)
export interface ListedIPO {
  symbol: string;
  name: string;
  sector: string;
  listingDate: string;
  board: 'Utama' | 'Pengembangan' | 'Akselerasi';
  ipoPrice: number;
  currentPrice: number;
  fundsRaised: string; // IDR
  leadUnderwriter: string;
  firstDayReturn: number; // %
  totalReturnSinceIPO: number; // %
  marketCap: number;
}

const UPCOMING_IPO_DATA: UpcomingIPO[] = [
  {
    id: 'up-1',
    tickerExpected: 'NUSA',
    companyName: 'PT Nusantara Data Center Hyperscale Tbk',
    sector: 'Teknologi & Infrastruktur Digital',
    subSector: 'Data Center & Cloud',
    stage: 'BOOK_BUILDING',
    priceRange: 'Rp 1.150 - Rp 1.450',
    sharesOffered: '1.250.000.000 (15,0%)',
    targetFunds: 'Rp 1,81 Triliun',
    leadUnderwriter: 'Mandiri Sekuritas, Indo Premier Sekuritas (CC, PD)',
    bookBuildingDates: '01 - 10 Okt 2026',
    offeringDates: '18 - 22 Okt 2026',
    estimatedListingDate: '26 Okt 2026',
    useOfFunds: '70% ekspansi kampus Hyperscale Cikarang & 30% modal kerja operasional',
    warrantRatio: '5 : 1 (Waran Seri I Gratis)',
    highlights: [
      'Penyedia data center Tier-IV dengan kapasitas 80 MW',
      'Klien utama mencakup hyperscaler global & bank tier-1',
      'Pertumbuhan pendapatan CAGR 3 tahun mencapai +42%',
    ],
  },
  {
    id: 'up-2',
    tickerExpected: 'BATR',
    companyName: 'PT Baterai Anoda Mineral Tbk',
    sector: 'Barang Baku (Basic Materials)',
    subSector: 'Ekosistem EV & Pengolahan Mineral',
    stage: 'OFFERING',
    priceRange: 'Rp 480 (Harga Final)',
    sharesOffered: '2.000.000.000 (20,0%)',
    targetFunds: 'Rp 960,0 Miliar',
    leadUnderwriter: 'Trimegah Sekuritas, BCA Sekuritas (LG, SQ)',
    bookBuildingDates: '22 - 28 Sep 2026',
    offeringDates: '02 - 06 Okt 2026',
    estimatedListingDate: '10 Okt 2026',
    useOfFunds: '85% pembangunan fasilitas smelter pemurnian HPAL nikel-kobalt',
    warrantRatio: '2 : 1 (Waran Seri I)',
    highlights: [
      'Memegang kontrak offtake jangka panjang dengan produsen baterai Korsel',
      'Lokasi tambang terintegrasi di Morowali Industrial Park',
    ],
  },
  {
    id: 'up-3',
    tickerExpected: 'KOPI',
    companyName: 'PT Kenangan Kopi Nusantara Tbk',
    sector: 'Konsumer Non-Primer (F&B)',
    subSector: 'Restoran & Rantai Ritel Cepat Saji',
    stage: 'PIPELINE',
    priceRange: 'Rp 750 - Rp 950 (Estimasi OJK)',
    sharesOffered: '1.800.000.000 (18,5%)',
    targetFunds: 'Rp 1,53 Triliun',
    leadUnderwriter: 'CLSA Sekuritas, Mandiri Sekuritas (KZ, CC)',
    bookBuildingDates: 'Estimasi Q4 2026',
    offeringDates: 'Estimasi Q4 2026',
    estimatedListingDate: 'November 2026',
    useOfFunds: 'Ekspansi gerai internasional ke Asia Tenggara & otomatisasi rantai pasok',
    highlights: [
      'Jaringan lebih dari 950 gerai di seluruh Indonesia',
      'Mencapai EBITDA positif dengan margin laba kotor 68%',
    ],
  },
  {
    id: 'up-4',
    tickerExpected: 'LOGI',
    companyName: 'PT Logistik Digital Samudera Tbk',
    sector: 'Transportasi & Logistik',
    subSector: 'Freight Forwarding & Smart Logistics',
    stage: 'ALLOTMENT',
    priceRange: 'Rp 220 (Penjatahan Selesai)',
    sharesOffered: '850.000.000 (22,0%)',
    targetFunds: 'Rp 187,0 Miliar',
    leadUnderwriter: 'Sucor Sekuritas (AZ)',
    bookBuildingDates: '15 - 20 Sep 2026',
    offeringDates: '25 - 29 Sep 2026',
    estimatedListingDate: '05 Okt 2026',
    useOfFunds: 'Pengadaan armada truk listrik pendingin & ekspansi hub pergudangan Jawa-Bali',
    highlights: [
      'Over-subscribed hingga 28,4x pada pooling penjatahan terpusat e-IPO',
    ],
  },
];

const LISTED_IPO_DATA: ListedIPO[] = [
  {
    symbol: 'BREN',
    name: 'Barito Renewables Energy Tbk',
    sector: 'Infrastruktur Energi',
    listingDate: '06 Okt 2023',
    board: 'Utama',
    ipoPrice: 780,
    currentPrice: 7250,
    fundsRaised: 'Rp 3,13 Triliun',
    leadUnderwriter: 'BCA Sekuritas (SQ)',
    firstDayReturn: 25.0, // ARA
    totalReturnSinceIPO: 829.5,
    marketCap: 969000000000000,
  },
  {
    symbol: 'AMMN',
    name: 'Amman Mineral Internasional Tbk',
    sector: 'Energi & Tambang Tembaga',
    listingDate: '07 Jul 2023',
    board: 'Utama',
    ipoPrice: 1695,
    currentPrice: 4170,
    fundsRaised: 'Rp 10,73 Triliun',
    leadUnderwriter: 'Mandiri, BNI, BRI Danareksa (CC, NI, OD)',
    firstDayReturn: 18.5,
    totalReturnSinceIPO: 146.0,
    marketCap: 302000000000000,
  },
  {
    symbol: 'CUAN',
    name: 'Petrindo Jaya Kreasi Tbk',
    sector: 'Energi & Batu Bara',
    listingDate: '08 Mar 2023',
    board: 'Utama',
    ipoPrice: 220,
    currentPrice: 8400,
    fundsRaised: 'Rp 371,8 Miliar',
    leadUnderwriter: 'Henan Putihrai (HP)',
    firstDayReturn: 24.5,
    totalReturnSinceIPO: 3718.2,
    marketCap: 94000000000000,
  },
  {
    symbol: 'PGEO',
    name: 'Pertamina Geothermal Energy Tbk',
    sector: 'Infrastruktur & Panas Bumi',
    listingDate: '24 Feb 2023',
    board: 'Utama',
    ipoPrice: 875,
    currentPrice: 1140,
    fundsRaised: 'Rp 9,05 Triliun',
    leadUnderwriter: 'Mandiri Sekuritas, CLSA (CC, KZ)',
    firstDayReturn: -5.0,
    totalReturnSinceIPO: 30.3,
    marketCap: 47200000000000,
  },
  {
    symbol: 'AUTO',
    name: 'Astra Otoparts Tbk',
    sector: 'Komponen Otomotif',
    listingDate: '15 Jan 1998',
    board: 'Utama',
    ipoPrice: 2100,
    currentPrice: 2340,
    fundsRaised: 'Rp 350 Miliar',
    leadUnderwriter: 'Danareksa Sekuritas',
    firstDayReturn: 12.0,
    totalReturnSinceIPO: 11.4,
    marketCap: 11200000000000,
  },
  {
    symbol: 'GOTO',
    name: 'GoTo Gojek Tokopedia Tbk',
    sector: 'Teknologi Digital',
    listingDate: '11 Apr 2022',
    board: 'Utama',
    ipoPrice: 338,
    currentPrice: 58,
    fundsRaised: 'Rp 13,73 Triliun',
    leadUnderwriter: 'Mandiri, Indo Premier, Trimegah (CC, PD, LG)',
    firstDayReturn: 13.0,
    totalReturnSinceIPO: -82.8,
    marketCap: 69000000000000,
  },
  {
    symbol: 'BELI',
    name: 'Global Digital Niaga Tbk (Blibli)',
    sector: 'Teknologi & E-commerce',
    listingDate: '08 Nov 2022',
    board: 'Utama',
    ipoPrice: 450,
    currentPrice: 470,
    fundsRaised: 'Rp 7,99 Triliun',
    leadUnderwriter: 'BCA Sekuritas, BRI Danareksa (SQ, OD)',
    firstDayReturn: 4.8,
    totalReturnSinceIPO: 4.4,
    marketCap: 55800000000000,
  },
];

export default function IPOTrackerPage() {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'LISTED' | 'CALCULATOR'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedBoard, setSelectedBoard] = useState<string>('ALL');

  // Filter Upcoming IPOs
  const filteredUpcoming = useMemo(() => {
    return UPCOMING_IPO_DATA.filter((item) => {
      const matchStage = selectedStage === 'ALL' || item.stage === selectedStage;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.tickerExpected.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q);
      return matchStage && matchQuery;
    });
  }, [selectedStage, searchQuery]);

  // Filter Listed IPOs
  const filteredListed = useMemo(() => {
    return LISTED_IPO_DATA.filter((item) => {
      const matchBoard = selectedBoard === 'ALL' || item.board === selectedBoard;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q);
      return matchBoard && matchQuery;
    });
  }, [selectedBoard, searchQuery]);

  // Stage Badge Helper
  const getStageBadge = (stage: UpcomingIPO['stage']) => {
    switch (stage) {
      case 'BOOK_BUILDING':
        return { label: 'Book Building (Penawaran Awal)', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'OFFERING':
        return { label: 'Offering (Penawaran Umum)', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'ALLOTMENT':
        return { label: 'Allotment (Penjatahan Selesai)', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'PIPELINE':
        return { label: 'Pipeline Antrean OJK/BEI', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    }
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Top Header Ribbon ── */}
      <div
        className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                IDX e-IPO & PIPELINE LISTING TRACKER
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border text-amber-400 bg-amber-500/10 border-amber-500/30">
                BEI / OJK DESK
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Portal komprehensif emiten yang akan melantai (belum IPO) & rekam jejak performa saham pasca IPO di Bursa Efek Indonesia.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Ticker, PT, atau Sektor..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* ── Main Tab Switcher (Belum IPO vs Sudah IPO) ── */}
      <div className="flex border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('UPCOMING')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          style={{
            color: activeTab === 'UPCOMING' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'UPCOMING' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Saham Belum IPO & Pipeline e-IPO ({UPCOMING_IPO_DATA.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LISTED')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          style={{
            color: activeTab === 'LISTED' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'LISTED' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Saham Sudah IPO & Rekam Jejak Listing ({LISTED_IPO_DATA.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CALCULATOR')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          style={{
            color: activeTab === 'CALCULATOR' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === 'CALCULATOR' ? '2px solid var(--accent)' : '2px solid transparent',
          }}
        >
          <Calculator className="w-4 h-4 text-purple-400" />
          <span>Kalkulator Penjatahan & ARA Estimator</span>
        </button>
      </div>

      {/* ── TAB 3: KALKULATOR PENJATAHAN & ARA ESTIMATOR ── */}
      {activeTab === 'CALCULATOR' && (
        <IPOAllotmentCalculator />
      )}

      {/* ── TAB 1: SAHAM BELUM IPO & PIPELINE e-IPO ── */}
      {activeTab === 'UPCOMING' && (
        <div className="space-y-4">
          {/* Stage Filter Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-neutral-500 mr-1">Filter Tahapan:</span>
            {[
              { key: 'ALL', label: 'Semua Pipeline' },
              { key: 'BOOK_BUILDING', label: '1. Book Building' },
              { key: 'OFFERING', label: '2. Offering' },
              { key: 'ALLOTMENT', label: '3. Allotment' },
              { key: 'PIPELINE', label: '4. Pipeline Antrean' },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStage(st.key)}
                className={`px-3 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedStage === st.key
                    ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Cards Grid of Upcoming IPOs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUpcoming.map((ipo) => {
              const badge = getStageBadge(ipo.stage);
              return (
                <div
                  key={ipo.id}
                  className="p-4 rounded-xl border flex flex-col justify-between shadow-sm transition-all hover:border-neutral-700 space-y-3"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                >
                  <div>
                    {/* Header Item */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {ipo.tickerExpected}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white mt-1.5">{ipo.companyName}</h3>
                        <span className="text-[11px] text-neutral-400">{ipo.sector} &bull; {ipo.subSector}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase block">Estimasi Listing</span>
                        <span className="text-xs font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 inline-block mt-0.5">
                          {ipo.estimatedListingDate}
                        </span>
                      </div>
                    </div>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Rentang Harga</span>
                        <span className="font-bold text-emerald-400">{ipo.priceRange}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Target Emisi</span>
                        <span className="font-bold text-white">{ipo.targetFunds}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 block">Porsi Saham Publik</span>
                        <span className="font-bold text-neutral-300">{ipo.sharesOffered}</span>
                      </div>
                    </div>

                    {/* Timeline & Underwriter Info */}
                    <div className="mt-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="text-neutral-500">Jadwal Book Building:</span>
                        <span className="font-medium">{ipo.bookBuildingDates}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="text-neutral-500">Jadwal Penawaran Umum:</span>
                        <span className="font-medium">{ipo.offeringDates}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="text-neutral-500">Penjamin Emisi (Lead):</span>
                        <span className="font-semibold text-amber-300 truncate max-w-[200px]">{ipo.leadUnderwriter}</span>
                      </div>
                      {ipo.warrantRatio && (
                        <div className="flex items-center justify-between text-emerald-400 font-semibold pt-1 border-t border-neutral-800">
                          <span>Bonus Waran (Sweetener):</span>
                          <span>{ipo.warrantRatio}</span>
                        </div>
                      )}
                    </div>

                    {/* Highlights Bullets */}
                    <div className="mt-3 p-2.5 rounded-lg bg-neutral-900/50 border border-neutral-800/80">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Poin Kunci & Prospektus:
                      </span>
                      <ul className="space-y-1 text-[11px] text-neutral-300">
                        {ipo.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">&bull;</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-1.5 pt-1.5 border-t border-neutral-800 text-[10px] text-neutral-400">
                        <b>Penggunaan Dana:</b> {ipo.useOfFunds}
                      </div>
                    </div>
                  </div>

                  {/* Order Simulation Action Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-xs">
                    <span className="text-[11px] text-neutral-500">
                      Platform: e-ipo.co.id
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`Simulasi Pemesanan e-IPO ${ipo.tickerExpected} berhasil didaftarkan ke sistem broker demo!`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Simulasi Pesan e-IPO</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: SAHAM SUDAH RESMI IPO (LISTED) ── */}
      {activeTab === 'LISTED' && (
        <div className="space-y-4">
          {/* Board Filter Ribbon */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500">Papan Pencatatan:</span>
              {['ALL', 'Utama', 'Pengembangan', 'Akselerasi'].map((bd) => (
                <button
                  key={bd}
                  type="button"
                  onClick={() => setSelectedBoard(bd)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    selectedBoard === bd
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {bd === 'ALL' ? 'Semua Papan' : `Papan ${bd}`}
                </button>
              ))}
            </div>

            <span className="text-xs text-neutral-400">
              Menampilkan {filteredListed.length} emiten pilihan dengan historis listing
            </span>
          </div>

          {/* Listed Table */}
          <div
            className="rounded-xl border overflow-hidden shadow-sm"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-right">
                <thead>
                  <tr className="border-b text-neutral-400 border-neutral-800 bg-neutral-900/40">
                    <th className="py-2.5 px-3 text-left">Emiten</th>
                    <th className="py-2.5 px-3 text-left">Tanggal Listing</th>
                    <th className="py-2.5 px-3 text-center">Papan</th>
                    <th className="py-2.5 px-3">Harga IPO</th>
                    <th className="py-2.5 px-3">Harga Saat Ini</th>
                    <th className="py-2.5 px-3">Hari Pertama (Day 1)</th>
                    <th className="py-2.5 px-3">Total Return Sejak IPO</th>
                    <th className="py-2.5 px-3">Dana Terhimpun</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70">
                  {filteredListed.map((item) => (
                    <tr key={item.symbol} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-left">
                        <div className="flex items-center gap-2">
                          <CompanyLogo symbol={item.symbol} name={item.name} size={28} rounded="md" />
                          <div>
                            <Link
                              href={`/stock/${item.symbol}`}
                              className="font-bold text-white hover:text-amber-400 transition-colors"
                            >
                              {item.symbol}
                            </Link>
                            <span className="text-[11px] text-neutral-500 block truncate max-w-[140px]">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-left text-neutral-400">
                        {item.listingDate}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-neutral-300">
                          {item.board}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300">
                        Rp {item.ipoPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        Rp {item.currentPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
                            item.firstDayReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.firstDayReturn >= 0 ? '+' : ''}{item.firstDayReturn}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.totalReturnSinceIPO >= 0
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.totalReturnSinceIPO >= 0 ? '+' : ''}{item.totalReturnSinceIPO.toLocaleString('id-ID')}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-300 font-medium">
                        {item.fundsRaised}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Link
                          href={`/stock/${item.symbol}`}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Terminal</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
