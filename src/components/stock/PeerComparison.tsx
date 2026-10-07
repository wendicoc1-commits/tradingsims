'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { StockQuote } from '@/types';
import CompanyLogo from '@/components/common/CompanyLogo';

interface PeerMetric {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  peRatio: number;
  pbvRatio: number;
  roe: number;
  npm: number;
  dividendYield: number;
  marketCapTrillion: number;
  valuation: 'UNDERVALUED' | 'FAIR' | 'PREMIUM';
}

const SECTOR_PEER_GROUPS: Record<string, PeerMetric[]> = {
  BANKING: [
    { symbol: 'BBCA', name: 'Bank Central Asia Tbk', price: 6025, changePercent: 0.42, peRatio: 22.4, pbvRatio: 4.8, roe: 21.8, npm: 44.5, dividendYield: 2.7, marketCapTrillion: 1245, valuation: 'PREMIUM' },
    { symbol: 'BBRI', name: 'Bank Rakyat Indonesia Tbk', price: 3060, changePercent: -1.29, peRatio: 12.8, pbvRatio: 2.3, roe: 18.2, npm: 31.0, dividendYield: 6.4, marketCapTrillion: 750, valuation: 'UNDERVALUED' },
    { symbol: 'BMRI', name: 'Bank Mandiri (Persero) Tbk', price: 4010, changePercent: 0.00, peRatio: 11.5, pbvRatio: 2.1, roe: 18.9, npm: 33.2, dividendYield: 5.4, marketCapTrillion: 639, valuation: 'UNDERVALUED' },
    { symbol: 'BBNI', name: 'Bank Negara Indonesia Tbk', price: 3400, changePercent: -0.29, peRatio: 9.8, pbvRatio: 1.2, roe: 15.1, npm: 25.8, dividendYield: 5.6, marketCapTrillion: 201, valuation: 'UNDERVALUED' },
    { symbol: 'BDMN', name: 'Bank Danamon Indonesia Tbk', price: 2780, changePercent: 0.00, peRatio: 7.9, pbvRatio: 0.6, roe: 8.4, npm: 18.5, dividendYield: 4.8, marketCapTrillion: 27, valuation: 'UNDERVALUED' },
  ],
  ENERGY: [
    { symbol: 'ITMG', name: 'Indo Tambangraya Megah Tbk', price: 26250, changePercent: 1.25, peRatio: 5.8, pbvRatio: 1.1, roe: 21.5, npm: 22.4, dividendYield: 16.8, marketCapTrillion: 29.6, valuation: 'UNDERVALUED' },
    { symbol: 'PTBA', name: 'Bukit Asam Tbk', price: 2740, changePercent: -0.36, peRatio: 6.9, pbvRatio: 1.5, roe: 22.1, npm: 17.8, dividendYield: 14.5, marketCapTrillion: 31.5, valuation: 'UNDERVALUED' },
    { symbol: 'ADRO', name: 'Adaro Energy Indonesia Tbk', price: 2430, changePercent: 0.83, peRatio: 4.5, pbvRatio: 0.9, roe: 25.4, npm: 28.1, dividendYield: 15.2, marketCapTrillion: 122.1, valuation: 'UNDERVALUED' },
    { symbol: 'PGAS', name: 'Perusahaan Gas Negara Tbk', price: 1560, changePercent: 0.97, peRatio: 7.4, pbvRatio: 0.8, roe: 11.2, npm: 8.9, dividendYield: 9.5, marketCapTrillion: 37.8, valuation: 'UNDERVALUED' },
    { symbol: 'BSSR', name: 'Baramulti Suksessarana Tbk', price: 3950, changePercent: -0.75, peRatio: 4.2, pbvRatio: 1.8, roe: 42.0, npm: 23.5, dividendYield: 17.5, marketCapTrillion: 10.3, valuation: 'UNDERVALUED' },
  ],
  CONSUMER: [
    { symbol: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk', price: 11450, changePercent: 0.88, peRatio: 15.2, pbvRatio: 3.1, roe: 20.4, npm: 12.8, dividendYield: 2.1, marketCapTrillion: 133.5, valuation: 'FAIR' },
    { symbol: 'INDF', name: 'Indofood Sukses Makmur Tbk', price: 6950, changePercent: 0.36, peRatio: 7.1, pbvRatio: 1.0, roe: 14.2, npm: 9.5, dividendYield: 4.1, marketCapTrillion: 61.0, valuation: 'UNDERVALUED' },
    { symbol: 'UNVR', name: 'Unilever Indonesia Tbk', price: 2260, changePercent: -1.30, peRatio: 18.5, pbvRatio: 18.2, roe: 85.0, npm: 13.1, dividendYield: 6.2, marketCapTrillion: 86.2, valuation: 'FAIR' },
    { symbol: 'MYOR', name: 'Mayora Indah Tbk', price: 2580, changePercent: 0.78, peRatio: 17.8, pbvRatio: 3.8, roe: 22.5, npm: 8.6, dividendYield: 2.3, marketCapTrillion: 57.6, valuation: 'FAIR' },
    { symbol: 'SIDO', name: 'Industri Jamu Sido Muncul Tbk', price: 620, changePercent: 1.64, peRatio: 16.5, pbvRatio: 5.2, roe: 31.8, npm: 29.5, dividendYield: 6.5, marketCapTrillion: 18.6, valuation: 'FAIR' },
  ],
  TELECOMMUNICATION: [
    { symbol: 'TLKM', name: 'Telkom Indonesia Tbk', price: 2240, changePercent: -0.44, peRatio: 13.8, pbvRatio: 2.2, roe: 17.1, npm: 18.2, dividendYield: 5.8, marketCapTrillion: 305.1, valuation: 'UNDERVALUED' },
    { symbol: 'ISAT', name: 'Indosat Ooredoo Hutchison Tbk', price: 2420, changePercent: -0.41, peRatio: 16.2, pbvRatio: 2.4, roe: 15.8, npm: 9.4, dividendYield: 3.2, marketCapTrillion: 78.0, valuation: 'FAIR' },
    { symbol: 'EXCL', name: 'XL Axiata Tbk', price: 2280, changePercent: 0.88, peRatio: 18.4, pbvRatio: 1.1, roe: 6.8, npm: 4.8, dividendYield: 2.1, marketCapTrillion: 29.8, valuation: 'FAIR' },
  ],
  AUTOMOTIVE: [
    { symbol: 'ASII', name: 'Astra International Tbk', price: 5075, changePercent: 0.50, peRatio: 6.8, pbvRatio: 1.0, roe: 15.6, npm: 10.8, dividendYield: 8.3, marketCapTrillion: 205.4, valuation: 'UNDERVALUED' },
    { symbol: 'AUTO', name: 'Astra Otoparts Tbk', price: 2320, changePercent: 0.87, peRatio: 5.5, pbvRatio: 0.8, roe: 15.2, npm: 9.4, dividendYield: 6.8, marketCapTrillion: 11.1, valuation: 'UNDERVALUED' },
    { symbol: 'SMSM', name: 'Selamat Sempurna Tbk', price: 1880, changePercent: 0.00, peRatio: 10.2, pbvRatio: 2.8, roe: 28.5, npm: 18.9, dividendYield: 4.8, marketCapTrillion: 10.8, valuation: 'FAIR' },
  ],
};

export default function PeerComparison({ quote }: { quote: StockQuote }) {
  const cleanSym = quote.symbol.replace('.JK', '').toUpperCase();

  // Tentukan grup sektor yang paling relevan
  const { sectorName, peers } = useMemo(() => {
    if (['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BDMN', 'BBTN', 'BRIS', 'MEGA'].includes(cleanSym)) {
      return { sectorName: 'Perbankan & Keuangan (Banking Pillars)', peers: SECTOR_PEER_GROUPS.BANKING };
    }
    if (['ITMG', 'PTBA', 'ADRO', 'PGAS', 'BSSR', 'MBAP', 'MEDC', 'HRUM', 'INDY'].includes(cleanSym)) {
      return { sectorName: 'Energi, Batubara & Utilitas (Energy & Resources)', peers: SECTOR_PEER_GROUPS.ENERGY };
    }
    if (['ICBP', 'INDF', 'UNVR', 'MYOR', 'SIDO', 'CMRY', 'KLBF', 'CPIN'].includes(cleanSym)) {
      return { sectorName: 'Konsumer Primer & Staples (Defensive Goods)', peers: SECTOR_PEER_GROUPS.CONSUMER };
    }
    if (['TLKM', 'ISAT', 'EXCL', 'TOWR', 'TBIG'].includes(cleanSym)) {
      return { sectorName: 'Telekomunikasi & Menara Data', peers: SECTOR_PEER_GROUPS.TELECOMMUNICATION };
    }
    if (['ASII', 'AUTO', 'SMSM', 'ASLC', 'IMAS'].includes(cleanSym)) {
      return { sectorName: 'Otomotif & Manufaktur Industri', peers: SECTOR_PEER_GROUPS.AUTOMOTIVE };
    }

    // Default: Banking atau grup relevan terdekat
    return { sectorName: 'Pembanding Sektor Industri Sejenis', peers: SECTOR_PEER_GROUPS.BANKING };
  }, [cleanSym]);

  return (
    <div className="rounded-xl border overflow-hidden shadow-sm space-y-0" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Peer Comparison Matrix &bull; {sectorName}
            </h3>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Komparasi valuasi valuasi P/E, P/BV, profitabilitas ROE, dan imbal hasil dividen terhadap emiten pesaing
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30 self-start sm:self-auto">
          {peers.length} Emiten Komparasi
        </span>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Emiten</th>
              <th className="text-right">Harga</th>
              <th className="text-right">P/E Ratio</th>
              <th className="text-right">P/BV Ratio</th>
              <th className="text-right">ROE (%)</th>
              <th className="text-right">Net Margin</th>
              <th className="text-right">Div. Yield</th>
              <th className="text-right">Market Cap</th>
              <th className="text-center">Valuasi</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((p) => {
              const isCurrentStock = p.symbol === cleanSym;
              return (
                <tr
                  key={p.symbol}
                  className={isCurrentStock ? 'bg-amber-400/5' : ''}
                  style={isCurrentStock ? { borderLeft: '3px solid var(--accent)' } : {}}
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <CompanyLogo symbol={p.symbol} name={p.name} size={24} rounded="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/stock/${p.symbol}`}
                            className="font-bold text-xs font-mono hover:underline"
                            style={{ color: isCurrentStock ? 'var(--accent)' : 'var(--text-primary)' }}
                          >
                            {p.symbol}
                          </Link>
                          {isCurrentStock && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40">
                              INI
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 max-w-[140px] truncate">{p.name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="text-right font-mono-num text-xs font-semibold text-white">
                    Rp {p.price.toLocaleString('id-ID')}
                  </td>

                  <td className="text-right font-mono-num text-xs font-bold text-zinc-200">
                    {p.peRatio.toFixed(1)}x
                  </td>

                  <td className="text-right font-mono-num text-xs text-zinc-300">
                    {p.pbvRatio.toFixed(1)}x
                  </td>

                  <td className="text-right font-mono-num text-xs font-bold" style={{ color: p.roe >= 15 ? 'var(--positive)' : 'var(--text-primary)' }}>
                    {p.roe.toFixed(1)}%
                  </td>

                  <td className="text-right font-mono-num text-xs text-zinc-300">
                    {p.npm.toFixed(1)}%
                  </td>

                  <td className="text-right font-mono-num text-xs font-bold text-amber-300">
                    {p.dividendYield > 0 ? `${p.dividendYield.toFixed(1)}%` : '—'}
                  </td>

                  <td className="text-right font-mono-num text-xs text-zinc-300">
                    Rp {p.marketCapTrillion} T
                  </td>

                  <td className="text-center font-mono">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                        p.valuation === 'UNDERVALUED'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                          : p.valuation === 'PREMIUM'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {p.valuation}
                    </span>
                  </td>

                  <td className="text-center">
                    {isCurrentStock ? (
                      <span className="text-[10px] text-zinc-500 font-mono">Aktif</span>
                    ) : (
                      <Link
                        href={`/stock/${p.symbol}`}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors hover:bg-white/10 text-zinc-300 hover:text-white inline-flex items-center gap-0.5"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <span>Cek</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
