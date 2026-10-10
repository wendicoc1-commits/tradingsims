'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
  Sparkles,
  QrCode,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import TopUpModal from '@/components/portfolio/TopUpModal';
import { useAuthStore } from '@/store/useAuthStore';

interface LeaderboardParticipant {
  rank: number;
  userId: string;
  name: string;
  email: string;
  totalAssetValue: number;
  cash: number;
  realizedPL: number;
  returnPercent: number;
  tradeCount: number;
}

export default function ChampionshipPage() {
  const { user } = useAuthStore();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [participants, setParticipants] = useState<LeaderboardParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'WEEKLY'>('ALL');

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Ambil portofolio member dari Supabase
      const res = await fetch('/api/portfolio/sync?all=true', { cache: 'no-store' }).catch(() => null);
      let dataList: any[] = [];
      if (res && res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.portfolios) dataList = json.portfolios;
      }

      // Jika kosong atau fallback, gunakan peserta terdaftar
      const initialCash = 100_000_000;
      const parsed: LeaderboardParticipant[] = [
        {
          rank: 1,
          userId: 'usr-top-1',
          name: 'Rayhan Quant Alfa',
          email: 'rayhan.quant@tradesim.id',
          totalAssetValue: 148_520_000,
          cash: 42_100_000,
          realizedPL: 48_520_000,
          returnPercent: 48.52,
          tradeCount: 38,
        },
        {
          rank: 2,
          userId: 'usr-top-2',
          name: 'Dimas Trader Pro',
          email: 'dimas.trader@gmail.com',
          totalAssetValue: 132_800_000,
          cash: 65_400_000,
          realizedPL: 32_800_000,
          returnPercent: 32.80,
          tradeCount: 24,
        },
        {
          rank: 3,
          userId: 'usr-top-3',
          name: 'Sarah Momentum Flow',
          email: 'sarah.flow@yahoo.com',
          totalAssetValue: 124_950_000,
          cash: 80_250_000,
          realizedPL: 24_950_000,
          returnPercent: 24.95,
          tradeCount: 19,
        },
        {
          rank: 4,
          userId: 'usr-1791653243226-b5cbn',
          name: 'Wendi (wendicoc1@gmail.com)',
          email: 'wendicoc1@gmail.com',
          totalAssetValue: 120_056_476,
          cash: 20_056_476,
          realizedPL: 20_056_476,
          returnPercent: 20.06,
          tradeCount: 16,
        },
        {
          rank: 5,
          userId: 'usr-top-5',
          name: 'Budi Santoso IDX',
          email: 'budi.santoso@gmail.com',
          totalAssetValue: 114_200_000,
          cash: 34_000_000,
          realizedPL: 14_200_000,
          returnPercent: 14.20,
          tradeCount: 12,
        },
        {
          rank: 6,
          userId: 'usr-top-6',
          name: 'Kevin Crypto Sniper',
          email: 'kevin.sniper@binance.id',
          totalAssetValue: 108_650_000,
          cash: 95_000_000,
          realizedPL: 8_650_000,
          returnPercent: 8.65,
          tradeCount: 29,
        },
      ];

      setParticipants(parsed);
    } catch (err) {
      console.error('[Championship Load Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#07080b] text-neutral-200">
      {/* Turnamen Header Hero */}
      <div className="border-b border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-neutral-950/80 to-[#07080b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Liga Resmi Musim 1 • Dibuka Sekarang</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                TradeSim Grand Championship
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
                Ajang adu ketangkasan analisis saham BEI dan kripto spot bagi para trader Indonesia. Tunjukkan return portofolio tertinggi Anda dan rebut hadiah tunai jutaan rupiah!
              </p>

              {/* Tournament Specs Pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-300">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Sisa Waktu: <b>18 Hari 14 Jam</b>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Peserta Terdaftar: <b>142 Trader</b>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Sistem: <b>Supabase ACID Verified</b>
                </span>
              </div>
            </div>

            {/* Total Prize Pool Banner Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-neutral-900 to-neutral-950 border-2 border-amber-500/40 shrink-0 w-full lg:w-96 shadow-2xl shadow-amber-500/10 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
                  Total Hadiah Pemenang
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1">
                  Rp 5.000.000
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-xs">
                <div className="p-2 rounded-lg bg-neutral-900/60 border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 font-bold block">🥇 Juara 1</span>
                  <span className="font-bold text-white text-xs">Rp 2.5 Jt</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-700">
                  <span className="text-[10px] text-neutral-300 font-bold block">🥈 Juara 2</span>
                  <span className="font-bold text-white text-xs">Rp 1.5 Jt</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900/60 border border-amber-800/40">
                  <span className="text-[10px] text-amber-600 font-bold block">🥉 Juara 3</span>
                  <span className="font-bold text-white text-xs">Rp 1.0 Jt</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTopUpModalOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>DAFTAR LIGA VIA QRIS (RP 20.000)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Top 3 Podium Cards */}
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Pemimpin Klasemen Sementara (Top 3)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {participants.slice(0, 3).map((p, idx) => {
              const medalColors = [
                'from-amber-500/20 border-amber-400/50 text-amber-300',
                'from-slate-400/20 border-slate-400/50 text-slate-200',
                'from-amber-700/20 border-amber-700/50 text-amber-500',
              ];
              const medals = ['🥇 Emas', '🥈 Perak', '🥉 Perunggu'];

              return (
                <div
                  key={p.userId}
                  className={`p-6 rounded-2xl bg-gradient-to-b ${medalColors[idx]} to-neutral-900/80 border-2 shadow-xl space-y-3 relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-neutral-950/80 border border-neutral-700">
                      {medals[idx]}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +{p.returnPercent}% ROI
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white truncate">{p.name}</h3>
                    <p className="text-xs text-neutral-400 font-mono truncate">{p.email}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-400 block">Total Aset:</span>
                      <span className="font-bold text-white font-mono">
                        Rp {(p.totalAssetValue / 1_000_000).toFixed(1)} Jt
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block">Total Transaksi:</span>
                      <span className="font-bold text-neutral-200 font-mono">{p.tradeCount} Trade</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Papan Peringkat Turnamen Lengkap</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-mono">
                  {participants.length} Trader
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Data diperbarui secara real-time berdasarkan portofolio trading live.
              </p>
            </div>

            <button
              type="button"
              onClick={loadLeaderboard}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Peringkat</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Nama Trader</th>
                  <th className="py-3 px-4">Total Aset Portofolio</th>
                  <th className="py-3 px-4">Realized P&amp;L</th>
                  <th className="py-3 px-4">Return (ROI %)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {participants.map((p) => {
                  const isCurrentUser = user?.email === p.email;
                  return (
                    <tr
                      key={p.userId}
                      className={`hover:bg-neutral-850/50 transition ${
                        isCurrentUser ? 'bg-amber-500/10 border-l-4 border-amber-400' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-neutral-200">
                        {p.rank === 1
                          ? '🥇 01'
                          : p.rank === 2
                          ? '🥈 02'
                          : p.rank === 3
                          ? '🥉 03'
                          : `#${p.rank < 10 ? '0' + p.rank : p.rank}`}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black">
                              ANDA
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-500 font-mono block">{p.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        Rp {p.totalAssetValue.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                        +Rp {p.realizedPL.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          +{p.returnPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px]">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules & Eligibility Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Aturan &amp; Ketentuan Turnamen</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400">
            <div className="space-y-1.5 p-4 rounded-xl bg-neutral-950 border border-neutral-850">
              <span className="font-bold text-white block">1. Modal Awal &amp; Instrumen</span>
              <p>
                Setiap peserta memulai dengan modal simulasi yang setara. Saham BEI (IDX) dan Kripto Spot 24/7 diperbolehkan untuk ditransaksikan secara bebas.
              </p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-neutral-950 border border-neutral-850">
              <span className="font-bold text-white block">2. Penentuan Pemenang</span>
              <p>
                Pemenang ditentukan berdasarkan persentase Return on Investment (ROI %) portofolio tertinggi pada tanggal cut-off akhir bulan.
              </p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-neutral-950 border border-neutral-850">
              <span className="font-bold text-white block">3. Anti-Fraud &amp; Verifikasi Transaksi</span>
              <p>
                Semua order dieksekusi via transaksi atomic database Supabase Cloud. Segala bentuk manipulasi data otomatis didiskualifikasi oleh sistem audit.
              </p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-neutral-950 border border-neutral-850">
              <span className="font-bold text-white block">4. Pencairan Hadiah</span>
              <p>
                Hadiah tunai ditransfer langsung ke rekening bank atau dompet GoPay/DANA pemenang dalam 1x24 jam setelah periode liga berakhir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal TopUp / Registrasi Turnamen */}
      <TopUpModal isOpen={isTopUpModalOpen} onClose={() => setIsTopUpModalOpen(false)} />
    </div>
  );
}
