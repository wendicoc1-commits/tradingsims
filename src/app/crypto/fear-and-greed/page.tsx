'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Globe,
  Coins,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';

export default function CryptoFearAndGreedPage() {
  // Current sentiment index score (e.g. 68 Greed)
  const [indexScore] = useState<number>(68);

  const getSentimentCategory = (score: number) => {
    if (score >= 75) return { label: 'Extreme Greed', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 55) return { label: 'Greed', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 45) return { label: 'Neutral', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' };
    if (score >= 25) return { label: 'Fear', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Extreme Fear', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const sentiment = getSentimentCategory(indexScore);

  const majorCryptoTargets = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: '$67,420',
      support: '$64,500',
      resistance: '$70,200',
      rsi: '58 (Netral-Bullish)',
      trend: 'Bullish Continuation',
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: '$3,540',
      support: '$3,320',
      resistance: '$3,780',
      rsi: '54 (Netral)',
      trend: 'Akumulasi Konsolidasi',
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: '$178.50',
      support: '$162.00',
      resistance: '$195.00',
      rsi: '64 (Momentum Kuat)',
      trend: 'Breakout Ascending',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200">
      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-[#0c101a]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Flame className="h-3.5 w-3.5" />
                Live Market Sentiment Meter
              </div>
              <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Crypto Fear and Greed Index Hari Ini
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                Indikator psikologi pasar dan sentimen emosional trader kripto global. Diperbarui secara berkala berdasarkan volatilitas, volume, dan momentum pasar.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/crypto"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
              >
                <Zap className="h-4 w-4" />
                Trading Kripto Modal Virtual Rp 50 Juta
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Visual Sentiment Gauge Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c101a] p-8 text-center flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sentimen Pasar Kripto Saat Ini
              </div>
              <div className="mt-6 flex justify-center">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-900/60 shadow-2xl">
                  <div className="text-center">
                    <div className="text-5xl font-black text-white">{indexScore}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">Skala 0 - 100</div>
                  </div>
                </div>
              </div>

              <div className={`mt-6 inline-flex rounded-full border px-4 py-1.5 text-sm font-extrabold ${sentiment.bg} ${sentiment.color}`}>
                {sentiment.label}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-800/80 pt-4 text-xs text-slate-400 leading-relaxed">
              *Skor <strong>{indexScore}</strong> menandakan bahwa mayoritas pelaku pasar saat ini berada dalam fase optimis (Greed). Pertahankan manajemen risiko saat pasar mendekati zona Extreme Greed.
            </div>
          </div>

          {/* Historical Benchmark & Meaning Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c101a] p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Tingkatan & Siklus Sentimen Pasar Kripto
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                  <div>
                    <strong className="text-sm text-white">0 - 24 : Extreme Fear</strong>
                    <div className="text-xs text-slate-400">Ketakutan ekstrem pasar; peluang akumulasi terbaik jangka panjang.</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-400">Akumulasi</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                  <div>
                    <strong className="text-sm text-white">25 - 49 : Fear</strong>
                    <div className="text-xs text-slate-400">Keraguan dan kekhawatiran; volatilitas cenderung menyempit.</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400">Hati-Hati</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-slate-400"></span>
                  <div>
                    <strong className="text-sm text-white">50 : Netral</strong>
                    <div className="text-xs text-slate-400">Keseimbangan antara pembeli dan penjual di area konsolidasi.</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">Wait & See</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                  <div>
                    <strong className="text-sm text-white">51 - 74 : Greed (Kondisi Saat Ini)</strong>
                    <div className="text-xs text-slate-400">Optimisme tinggi, arus modal masuk meningkat stabil.</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">Tren Naik</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/50 p-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-600"></span>
                  <div>
                    <strong className="text-sm text-white">75 - 100 : Extreme Greed</strong>
                    <div className="text-xs text-slate-400">Euforia massal (FOMO); pasar rentan koreksi tajam (pullback).</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-400">Ambil Untung</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Target Levels for Top Cryptos */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-[#0c101a] p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-sky-400" />
            Level Kunci & Prediksi Target Harga Kripto Utama
          </h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Koin</th>
                  <th className="py-3 px-4">Harga Terakhir</th>
                  <th className="py-3 px-4">Support Kuat</th>
                  <th className="py-3 px-4">Resistance Target</th>
                  <th className="py-3 px-4">RSI (14)</th>
                  <th className="py-3 px-4">Struktur Tren</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {majorCryptoTargets.map((c) => (
                  <tr key={c.symbol} className="hover:bg-slate-800/20">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <CompanyLogo symbol={c.symbol} size={24} />
                      {c.symbol} ({c.name})
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{c.price}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{c.support}</td>
                    <td className="py-3.5 px-4 text-sky-400 font-semibold">{c.resistance}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">{c.rsi}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{c.trend}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/stock/${c.symbol}`}
                        className="rounded bg-emerald-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
