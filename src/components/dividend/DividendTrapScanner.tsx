'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Percent,
  Coins,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  Calculator,
  Flame,
} from 'lucide-react';
import CompanyLogo from '@/components/common/CompanyLogo';

interface DividendTrapMetrics {
  symbol: string;
  name: string;
  price: number;
  dps: number;
  yield: number;
  cumDate: string;
  exDate: string;
  payoutRatio: number;
  fcfPerShare: number; // Free Cash Flow per share (Rp)
  fcfCoverage: number; // FCF / DPS
  piotroskiFScore: number; // 0 - 9
  historicalReboundDays: number; // Rata-rata hari pemulihan harga
  trapRiskScore: number; // 0 - 100 (Semakin tinggi semakin berbahaya)
  trapClassification: 'SAFE_COMPOUNDER' | 'MODERATE_RISK' | 'HIGH_DIVIDEND_TRAP';
  verdictReason: string;
}

const SAMPLE_TRAP_DATA: Record<string, DividendTrapMetrics> = {
  BMRI: {
    symbol: 'BMRI',
    name: 'PT Bank Mandiri (Persero) Tbk',
    price: 4030,
    dps: 353.95,
    yield: 8.78,
    cumDate: '2026-10-02',
    exDate: '2026-10-05',
    payoutRatio: 60.0,
    fcfPerShare: 590.2,
    fcfCoverage: 1.67,
    piotroskiFScore: 8,
    historicalReboundDays: 14,
    trapRiskScore: 18,
    trapClassification: 'SAFE_COMPOUNDER',
    verdictReason: 'Sangat Aman. FCF Coverage 1.67x membuktikan dividen dibayar dari uang kas operasional murni. Histori 5 tahun selalu menutup gap harga dalam 12-18 hari bursa.',
  },
  ADRO: {
    symbol: 'ADRO',
    name: 'PT Adaro Energy Indonesia Tbk',
    price: 2500,
    dps: 580,
    yield: 23.20,
    cumDate: '2026-10-14',
    exDate: '2026-10-15',
    payoutRatio: 48.0,
    fcfPerShare: 720.0,
    fcfCoverage: 1.24,
    piotroskiFScore: 7,
    historicalReboundDays: 32,
    trapRiskScore: 35,
    trapClassification: 'MODERATE_RISK',
    verdictReason: 'Risiko Moderat. Yield sangat tinggi (23.2%), namun siklus komoditas batubara dapat menunda pemulihan harga saham hingga 1-2 bulan jika harga komoditas global melemah.',
  },
  PTBA: {
    symbol: 'PTBA',
    name: 'PT Bukit Asam Tbk',
    price: 3180,
    dps: 397,
    yield: 12.48,
    cumDate: '2026-11-04',
    exDate: '2026-11-05',
    payoutRatio: 75.0,
    fcfPerShare: 310.0,
    fcfCoverage: 0.78,
    piotroskiFScore: 5,
    historicalReboundDays: 78,
    trapRiskScore: 68,
    trapClassification: 'HIGH_DIVIDEND_TRAP',
    verdictReason: 'Waspada Dividend Trap! FCF Coverage di bawah 1.0x (0.78x), menandakan kas internal tergerus untuk bayar dividen. Rata-rata rebound historis membutuhkan waktu hingga 78 hari bursa.',
  },
  BBCA: {
    symbol: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    price: 6100,
    dps: 270,
    yield: 4.43,
    cumDate: '2026-10-08',
    exDate: '2026-10-09',
    payoutRatio: 68.4,
    fcfPerShare: 410.0,
    fcfCoverage: 1.52,
    piotroskiFScore: 9,
    historicalReboundDays: 7,
    trapRiskScore: 10,
    trapClassification: 'SAFE_COMPOUNDER',
    verdictReason: 'Aristokrat Terbaik BEI (Piotroski Score 9/9). Penurunan Ex-Date sangat minim (4.4%) dan umumnya tertutup kembali dalam 5-8 hari bursa.',
  },
  UNVR: {
    symbol: 'UNVR',
    name: 'PT Unilever Indonesia Tbk',
    price: 1580,
    dps: 140,
    yield: 8.86,
    cumDate: '2026-11-10',
    exDate: '2026-11-11',
    payoutRatio: 99.0,
    fcfPerShare: 142.0,
    fcfCoverage: 1.01,
    piotroskiFScore: 4,
    historicalReboundDays: 95,
    trapRiskScore: 72,
    trapClassification: 'HIGH_DIVIDEND_TRAP',
    verdictReason: 'Peringatan Dividend Trap! Payout ratio 99% membatasi reinvestasi modal. Pertumbuhan laba stagnan membuat harga sulit rebound pasca Ex-Date.',
  },
};

export default function DividendTrapScanner() {
  const [selectedTicker, setSelectedTicker] = useState<string>('BMRI');
  const [lotsInput, setLotsInput] = useState<number>(100);

  const data = SAMPLE_TRAP_DATA[selectedTicker] || SAMPLE_TRAP_DATA['BMRI'];

  // BEP (Break-even point) calculations
  const totalCost = data.price * lotsInput * 100;
  const grossDividend = data.dps * lotsInput * 100;
  const theoreticalExPrice = data.price - data.dps;
  const theoreticalDropPercent = ((data.dps / data.price) * 100).toFixed(2);
  const maxSafeDropPrice = data.price - data.dps;

  return (
    <div className="space-y-4">
      {/* Top Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Analisis Saham:
          </span>
          {Object.keys(SAMPLE_TRAP_DATA).map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setSelectedTicker(sym)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTicker === sym
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-300 hover:text-white'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400">
          Model: <span className="text-amber-400 font-bold">Piotroski F-Score + FCF Coverage AI</span>
        </div>
      </div>

      {/* Main Verdict Card */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CompanyLogo symbol={data.symbol} name={data.name} size={44} rounded="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{data.symbol}</h3>
                {data.trapClassification === 'SAFE_COMPOUNDER' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    SAFE COMPOUNDER (Aman dari Trap)
                  </span>
                )}
                {data.trapClassification === 'MODERATE_RISK' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    MODERATE RISK (Pantau Siklus)
                  </span>
                )}
                {data.trapClassification === 'HIGH_DIVIDEND_TRAP' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                    HIGH DIVIDEND TRAP (Risiko Terjebak)
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">{data.name}</p>
            </div>
          </div>

          {/* Trap Risk Score Meter */}
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Trap Risk Score</div>
              <div className="flex items-center gap-2">
                <div className={`text-xl font-mono-num font-bold ${
                  data.trapRiskScore <= 30 ? 'text-emerald-400' : data.trapRiskScore <= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {data.trapRiskScore}/100
                </div>
                <div className="w-24 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      data.trapRiskScore <= 30 ? 'bg-emerald-500' : data.trapRiskScore <= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${data.trapRiskScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Piotroski F-Score</div>
              <div className="text-lg font-mono-num font-bold text-white">
                {data.piotroskiFScore}/9
                <span className="text-[11px] text-zinc-400 ml-1">
                  ({data.piotroskiFScore >= 7 ? 'Sangat Kuat' : data.piotroskiFScore >= 5 ? 'Moderat' : 'Lemah'})
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Est. Rebound Pasca Ex</div>
              <div className="text-lg font-mono-num font-bold text-amber-400">
                ~{data.historicalReboundDays} Hari Bursa
              </div>
            </div>
          </div>
        </div>

        {/* Reason summary box */}
        <div className={`mt-3 p-3 rounded-lg border text-xs flex items-start gap-2 ${
          data.trapClassification === 'SAFE_COMPOUNDER'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : data.trapClassification === 'MODERATE_RISK'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{data.verdictReason}</p>
        </div>
      </div>

      {/* Grid: Financial Health & Ex-Date Price BEP Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financial Quality Checks */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Kualitas Kas & Fundamental Dividen</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Free Cash Flow (FCF) Coverage</div>
                <div className="text-[11px] text-zinc-400">Rasio Kas Bebas terhadap Dividen yang Dibagikan</div>
              </div>
              <div className="text-right">
                <div className={`font-mono-num font-bold ${data.fcfCoverage >= 1.2 ? 'text-emerald-400' : data.fcfCoverage >= 1.0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {data.fcfCoverage}x
                </div>
                <div className="text-[10px] text-zinc-500">{data.fcfCoverage >= 1.0 ? 'Kas Surplus' : 'Kas Defisit'}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Dividend Payout Ratio (DPR)</div>
                <div className="text-[11px] text-zinc-400">Persentase Laba Bersih yang Dibagikan</div>
              </div>
              <div className="text-right">
                <div className="font-mono-num font-bold text-white">{data.payoutRatio}%</div>
                <div className="text-[10px] text-zinc-500">{data.payoutRatio <= 70 ? 'Sehat & Berkelanjutan' : 'Payout Sangat Tinggi'}</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Penurunan Harga Teoritis di Ex-Date</div>
                <div className="text-[11px] text-zinc-400">Harga pembukaan otomatis dipotong sebesar DPS</div>
              </div>
              <div className="text-right">
                <div className="font-mono-num font-bold text-rose-400">-{theoreticalDropPercent}%</div>
                <div className="text-[10px] text-zinc-400">Rp {theoreticalExPrice.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ex-Date Break-Even (BEP) Calculator */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Kalkulator Titik Impas (BEP) Ex-Date</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <label className="text-zinc-300 font-semibold">Simulasi Kepemilikan (Lot):</label>
              <input
                type="number"
                min={1}
                value={lotsInput}
                onChange={(e) => setLotsInput(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-white font-mono text-right focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Modal Investasi:</span>
                <span className="font-mono-num font-semibold text-white">Rp {totalCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Total Dividen Bersih Cair:</span>
                <span className="font-mono-num font-bold text-emerald-400">+Rp {grossDividend.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-300">Batas Harga Aman (BEP):</div>
                  <div className="text-[10px] text-zinc-400">Jika harga jual di atas level ini, Anda tetap profit</div>
                </div>
                <div className="font-mono-num font-bold text-amber-300 text-sm">
                  Rp {maxSafeDropPrice.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed italic">
              💡 Tips Antigravity: Jika Anda berniat mengumpulkan dividen (*dividend compounding*), abaikan penurunan Ex-Date dan aktifkan fitur <b>DRIP (Reinvestasi Otomatis)</b> untuk menambah jumlah lot tanpa modal baru.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
