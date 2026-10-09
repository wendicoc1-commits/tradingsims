'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Target,
  Coins,
  Wallet,
  Clock,
  XCircle,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { usePortfolioStore, KNOWN_DIVIDENDS } from '@/store';
import type { PortfolioHolding } from '@/types';

function formatPrice(val: number) {
  return Math.round(val).toLocaleString('id-ID');
}

export default function PortfolioAnalytics() {
  const { cash, holdings, orders, realizedPL, dividends, conditionalOrders, cancelConditionalOrder } = usePortfolioStore();

  // Total Equity Calculation
  const totalStockValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const shares = h.shares || (h.lots * 100);
      const prc = h.currentPrice || h.avgPrice;
      return sum + (shares * prc);
    }, 0);
  }, [holdings]);

  const totalNetWorth = cash + totalStockValue;

  // Sector Allocation Calculation
  const sectorAllocation = useMemo(() => {
    const sectors: Record<string, number> = {
      'Kas RDN': cash,
    };

    holdings.forEach((h) => {
      const clean = (h.displaySymbol || h.symbol).replace('.JK', '').toUpperCase();
      let sectorName = 'Lainnya';
      if (['BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS', 'BBTN', 'ARTO'].includes(clean)) sectorName = 'Perbankan & Keuangan';
      else if (['ADRO', 'PTBA', 'ITMG', 'PGAS', 'MEDC', 'BUMI'].includes(clean)) sectorName = 'Energi & Tambang';
      else if (['ICBP', 'INDF', 'UNVR', 'MYOR', 'CPIN', 'AMRT'].includes(clean)) sectorName = 'Konsumer Primer';
      else if (['TLKM', 'ISAT', 'EXCL', 'JSMR'].includes(clean)) sectorName = 'Infrastruktur & Telko';
      else if (['ASII', 'UNTR'].includes(clean)) sectorName = 'Otomotif & Industri';
      else if (['ANTM', 'MDKA', 'INCO', 'BRPT', 'TPIA'].includes(clean)) sectorName = 'Material Dasar';
      else sectorName = 'Ekuitas Lainnya';

      const val = (h.shares || (h.lots * 100)) * (h.currentPrice || h.avgPrice);
      sectors[sectorName] = (sectors[sectorName] || 0) + val;
    });

    const total = totalNetWorth || 1;
    return Object.entries(sectors).map(([name, value]) => ({
      name,
      value,
      percentage: Number(((value / total) * 100).toFixed(1)),
    })).sort((a, b) => b.value - a.value);
  }, [cash, holdings, totalNetWorth]);

  // Trading Performance & Win Rate
  const tradingMetrics = useMemo(() => {
    const sellOrders = orders.filter((o) => o.type === 'SELL' && o.status === 'FILLED');
    const winOrders = sellOrders.filter((o) => (o.realizedPL || 0) > 0);
    const lossOrders = sellOrders.filter((o) => (o.realizedPL || 0) < 0);
    const totalSells = sellOrders.length;
    const winRate = totalSells > 0 ? Math.round((winOrders.length / totalSells) * 100) : 100;

    const totalWinPL = winOrders.reduce((sum, o) => sum + (o.realizedPL || 0), 0);
    const totalLossPL = Math.abs(lossOrders.reduce((sum, o) => sum + (o.realizedPL || 0), 0));
    const profitFactor = totalLossPL > 0 ? Number((totalWinPL / totalLossPL).toFixed(2)) : totalWinPL > 0 ? 99.9 : 1.0;

    const totalUnrealizedPL = holdings.reduce((sum, h) => sum + (h.unrealizedPL || 0), 0);
    const totalDividendsEarned = dividends.reduce((sum, d) => sum + d.netAmount, 0);

    return {
      totalSells,
      winRate,
      profitFactor,
      totalRealizedPL: realizedPL,
      totalUnrealizedPL,
      totalDividendsEarned,
    };
  }, [orders, holdings, dividends, realizedPL]);

  // Annual Dividend Passive Income Forecast
  const annualDividendForecast = useMemo(() => {
    let annualTotal = 0;
    holdings.forEach((h) => {
      const clean = (h.displaySymbol || h.symbol).replace('.JK', '').toUpperCase();
      const div = KNOWN_DIVIDENDS[clean];
      if (div && div.dps > 0) {
        const shares = h.shares || (h.lots * 100);
        annualTotal += shares * div.dps;
      }
    });

    const monthlyAverage = Math.round(annualTotal / 12);

    return {
      stockDividendAnnual: annualTotal,
      combinedAnnual: annualTotal,
      monthlyAverage,
    };
  }, [holdings]);

  const activeConditionalOrders = useMemo(() => {
    return conditionalOrders.filter((o) => o.status === 'ACTIVE');
  }, [conditionalOrders]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <div
          className="rounded-xl border p-4 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Total Net Worth (Aset Bersih)</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono-num text-white">
              Rp {formatPrice(totalNetWorth)}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Kas: Rp {formatPrice(cash)} • Saham: Rp {formatPrice(totalStockValue)}
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div
          className="rounded-xl border p-4 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Trading Win Rate</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono-num text-amber-400">
              {tradingMetrics.winRate}%
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Profit Factor: {tradingMetrics.profitFactor}x • {tradingMetrics.totalSells} Transaksi Closed
            </div>
          </div>
        </div>

        {/* Realized & Unrealized P/L */}
        <div
          className="rounded-xl border p-4 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Total Capital Gain (P/L)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className={`text-xl font-bold font-mono-num ${tradingMetrics.totalUnrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {tradingMetrics.totalUnrealizedPL >= 0 ? '+' : ''}Rp {formatPrice(tradingMetrics.totalUnrealizedPL)}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Realized P/L: Rp {formatPrice(tradingMetrics.totalRealizedPL)}
            </div>
          </div>
        </div>

        {/* Passive Income Forecast */}
        <div
          className="rounded-xl border p-4 flex flex-col justify-between"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Proyeksi Passive Income / Thn</span>
            <Coins className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono-num text-indigo-400">
              Rp {formatPrice(annualDividendForecast.combinedAnnual)}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              ~Rp {formatPrice(annualDividendForecast.monthlyAverage)} / bulan
            </div>
          </div>
        </div>
      </div>

      {/* Sector Allocation & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation Bar & List */}
        <div
          className="rounded-xl border p-4 space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Alokasi Aset & Sektor Portofolio</h3>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">100% Total Equity</span>
          </div>

          {/* Allocation Multi-Segment Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-800">
            {sectorAllocation.map((s, idx) => {
              const colors = [
                'bg-emerald-500',
                'bg-indigo-500',
                'bg-amber-500',
                'bg-cyan-500',
                'bg-purple-500',
                'bg-rose-500',
                'bg-neutral-500',
              ];
              return (
                <div
                  key={s.name}
                  className={`${colors[idx % colors.length]} h-full transition-all duration-300`}
                  style={{ width: `${s.percentage}%` }}
                  title={`${s.name}: ${s.percentage}%`}
                />
              );
            })}
          </div>

          {/* Table List of Sectors */}
          <div className="divide-y divide-neutral-800/80 text-xs">
            {sectorAllocation.map((s, idx) => {
              const dotColors = [
                'bg-emerald-500',
                'bg-indigo-500',
                'bg-amber-500',
                'bg-cyan-500',
                'bg-purple-500',
                'bg-rose-500',
                'bg-neutral-500',
              ];
              return (
                <div key={s.name} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                    <span className="text-neutral-300 font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono-num">
                    <span className="text-neutral-400">Rp {formatPrice(s.value)}</span>
                    <span className="font-bold text-white w-12 text-right">{s.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Smart Conditional Orders */}
        <div
          className="rounded-xl border p-4 space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Smart Auto-Orders Aktif</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold font-mono">
              {activeConditionalOrders.length} Aktif
            </span>
          </div>

          {activeConditionalOrders.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-neutral-600" />
              <span>Belum ada auto-order trailing stop atau conditional order yang aktif.</span>
              <span className="text-[11px] text-neutral-400">
                Pasang di panel Chartbit Interactive saat mengeksekusi order saham.
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeConditionalOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-white text-sm">{order.displaySymbol}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                        {order.conditionType}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {order.lots} Lot ({order.type})
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono-num">
                      {order.conditionType === 'TRAILING_STOP' ? (
                        <span>
                          Trailing: <strong className="text-amber-400">{order.trailingPercent}%</strong> • Puncak: Rp {formatPrice(order.peakPrice || order.triggerPrice)}
                        </span>
                      ) : (
                        <span>
                          Trigger: <strong className="text-emerald-400">Rp {formatPrice(order.triggerPrice)}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => cancelConditionalOrder(order.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Batalkan Auto Order"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
