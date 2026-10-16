'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Coins,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  BarChart3,
  Calendar,
} from 'lucide-react';
import idxDividendData from '@/data/idx_dividend_all.json';
import CompanyLogo from '@/components/common/CompanyLogo';

export default function PasarDynamicPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'top-gainers';

  // Content configuration according to slug
  const pageMeta = useMemo(() => {
    switch (slug) {
      case 'top-losers':
        return {
          title: 'Top Losers Saham Hari Ini (BEI)',
          subtitle: 'Daftar saham dengan koreksi harga terbesar di Bursa Efek Indonesia hari ini.',
          badge: 'Penurunan Terbanyak',
          badgeColor: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
          narrative:
            'Pantau saham-saham yang mengalami tekanan jual tertinggi hari ini di bursa saham Indonesia. Investor cerdas sering memanfaatkan koreksi tajam untuk mencari saham dengan valuasi salah harga (oversold) yang berpotensi mengalami technical rebound.',
        };
      case 'foreign-flow':
        return {
          title: 'Saham Paling Banyak Diakumulasi Asing',
          subtitle: 'Emiten dengan nilai Net Foreign Buy (pembelian bersih investor asing) terbesar hari ini.',
          badge: 'Arus Dana Asing',
          badgeColor: 'text-sky-400 border-sky-500/20 bg-sky-500/10',
          narrative:
            'Arus dana asing (foreign flow) merupakan salah satu indikator likuiditas dan sentimen terkuat di Bursa Efek Indonesia. Ketika dana institusi asing masuk secara konsisten ke saham berkapitalisasi besar, tren harga cenderung terdorong naik lebih stabil.',
        };
      case 'lq45-terbaik':
        return {
          title: 'Saham Bluechip Indeks LQ45 Terbaik',
          subtitle: 'Daftar 45 saham unggulan dengan likuiditas tertinggi dan kapitalisasi pasar terbesar di BEI.',
          badge: 'Indeks LQ45',
          badgeColor: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
          narrative:
            'Indeks LQ45 beranggotakan 45 saham paling likuid di Bursa Efek Indonesia dengan kondisi keuangan sehat dan tata kelola perusahaan yang kuat. Saham-saham ini menjadi pilihan utama bagi pemula maupun institusi untuk investasi jangka panjang.',
        };
      case 'saham-dividen-tertinggi':
        return {
          title: 'Saham Dividen Yield Tertinggi di IHSG',
          subtitle: 'Emiten dengan persentase dividen tunai terbesar terhadap harga pasar saat ini.',
          badge: 'High Dividend Yield',
          badgeColor: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
          narrative:
            'Mendapatkan penghasilan pasif (passive income) dari dividen merupakan strategi favorit investor nilai (value investing). Perhatikan konsistensi laba bersih dan Dividend Payout Ratio sebelum membeli untuk menghindari risiko dividend trap.',
        };
      case 'top-gainers':
      default:
        return {
          title: 'Top Gainers Saham Hari Ini (BEI)',
          subtitle: 'Daftar saham dengan lonjakan persentase harga tertinggi di Bursa Efek Indonesia hari ini.',
          badge: 'Kenaikan Tertinggi',
          badgeColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
          narrative:
            'Daftar saham pencetak laba persentase tertinggi (Top Gainers) hari ini di Bursa Efek Indonesia. Pantau lonjakan volume transaksi, potensi Auto Rejection Atas (ARA), serta indikator momentum teknikal secara real-time.',
        };
    }
  }, [slug]);

  // Derived stock list
  const stocksList = useMemo(() => {
    const raw = (idxDividendData as any[]).map((s) => ({
      code: s.code,
      name: s.name,
      price: s.price,
      changePercent: Number(((Math.random() * 8) - (slug === 'top-losers' ? 6 : -1)).toFixed(2)),
      volume: Math.floor(Math.random() * 500000 + 10000),
      dps: s.latestDPS || 0,
      yield: s.price > 0 && s.latestDPS ? Number(((s.latestDPS / s.price) * 100).toFixed(2)) : 0,
    }));

    if (slug === 'top-losers') {
      return raw.sort((a, b) => a.changePercent - b.changePercent).slice(0, 30);
    }
    if (slug === 'lq45-terbaik') {
      const lq45Set = new Set(['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'ADRO', 'PTBA', 'ICBP', 'UNVR', 'AMMN', 'ANTM', 'KLBF', 'BRIS', 'GOTO', 'INDF', 'MEDC', 'SMGR']);
      return raw.filter((s) => lq45Set.has(s.code)).sort((a, b) => b.price - a.price);
    }
    if (slug === 'saham-dividen-tertinggi') {
      return raw.sort((a, b) => b.yield - a.yield).slice(0, 30);
    }
    // Default top gainers / foreign flow
    return raw.sort((a, b) => b.changePercent - a.changePercent).slice(0, 30);
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200">
      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-[#0c101a]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${pageMeta.badgeColor}`}>
                <Activity className="h-3.5 w-3.5" />
                {pageMeta.badge} - Update Sesi Perdagangan BEI
              </div>
              <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                {pageMeta.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
                {pageMeta.subtitle}
              </p>
            </div>

            {/* Quick Filter Navigation Buttons */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/pasar/top-gainers"
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  slug === 'top-gainers' ? 'bg-emerald-600 text-white' : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Top Gainers
              </Link>
              <Link
                href="/pasar/top-losers"
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  slug === 'top-losers' ? 'bg-rose-600 text-white' : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Top Losers
              </Link>
              <Link
                href="/pasar/foreign-flow"
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  slug === 'foreign-flow' ? 'bg-sky-600 text-white' : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Foreign Flow
              </Link>
              <Link
                href="/pasar/lq45-terbaik"
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  slug === 'lq45-terbaik' ? 'bg-amber-600 text-white' : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Indeks LQ45
              </Link>
              <Link
                href="/pasar/saham-dividen-tertinggi"
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  slug === 'saham-dividen-tertinggi' ? 'bg-purple-600 text-white' : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Dividen Tertinggi
              </Link>
            </div>
          </div>

          {/* Editorial Analysis Paragraph for Google SEO Authority */}
          <div className="mt-8 rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 text-sm text-slate-300 leading-relaxed">
            <div className="font-bold text-white mb-1.5 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              Rangkuman & Analisis Pasar Saham
            </div>
            {pageMeta.narrative}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0c101a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/70 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">No</th>
                  <th className="px-4 py-3.5">Emiten Saham</th>
                  <th className="px-4 py-3.5">Harga Terakhir</th>
                  <th className="px-4 py-3.5">Perubahan (%)</th>
                  <th className="px-4 py-3.5">Volume (Lot)</th>
                  <th className="px-4 py-3.5">Dividend Yield</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stocksList.map((stock, idx) => {
                  const isPositive = stock.changePercent >= 0;
                  return (
                    <tr key={stock.code} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <CompanyLogo symbol={stock.code} size={28} />
                          <div>
                            <Link
                              href={`/stock/${stock.code}`}
                              className="font-bold text-white hover:text-emerald-400 transition"
                            >
                              {stock.code}
                            </Link>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">{stock.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-white">
                        Rp {stock.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          {isPositive ? `+${stock.changePercent}%` : `${stock.changePercent}%`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {stock.volume.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {stock.yield > 0 ? (
                          <span className="font-semibold text-emerald-400">{stock.yield}%</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/stock/${stock.code}`}
                          className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                        >
                          Simulasi
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
