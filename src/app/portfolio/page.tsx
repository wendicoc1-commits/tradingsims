'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  PieChart,
  History,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Landmark,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Calendar,
  BarChart3,
  ShieldAlert,
  Download,
  Newspaper,
} from 'lucide-react';
import { usePortfolioStore, KNOWN_DIVIDENDS } from '@/store';
import { calculateShares, isValidIDXTick } from '@/lib/stockRules';
import { exportToCsv } from '@/lib/exportCsv';
import DividendCalendar from '@/components/dividend/DividendCalendar';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import PortfolioNewsFeed from '@/components/portfolio/PortfolioNewsFeed';
import CompanyLogo from '@/components/common/CompanyLogo';
import PortfolioStressTestModal from '@/components/portfolio/PortfolioStressTestModal';
import InstitutionalPortfolioDesk from '@/components/portfolio/InstitutionalPortfolioDesk';
import FinceptAIPortfolioAgentBar from '@/components/portfolio/FinceptAIPortfolioAgentBar';

function formatPrice(price: number) {
  return price.toLocaleString('id-ID');
}

/* ─── Order Form (Paper Trading Engine) ─── */
function OrderForm() {
  const { cash, placeBuyOrder, placeSellOrder } = usePortfolioStore();
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [lots, setLots] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const priceNum = parseFloat(price) || 0;
  const lotsNum = parseInt(lots, 10) || 0;
  const rawSym = symbol.trim().toUpperCase();

  const shareInfo = calculateShares(rawSym, lotsNum);
  const tradeValue = priceNum * shareInfo.shares;
  
  // Rincian fee broker & PPh bursa
  const brokerFee = Math.round(tradeValue * 0.0015); // 0.15%
  const taxFee = orderType === 'SELL' ? Math.round(tradeValue * 0.0010) : 0; // PPh Final 0.1% untuk jual
  const totalFee = brokerFee + taxFee;
  const grandTotal = orderType === 'BUY' ? tradeValue + totalFee : tradeValue - totalFee;

  // Validasi fraksi harga BEI secara realtime
  const tickValidation = rawSym && priceNum > 0 && !shareInfo.isUS ? isValidIDXTick(priceNum) : { valid: true, tick: 1, nearest: priceNum };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSym || priceNum <= 0 || lotsNum <= 0) {
      setNotification({ type: 'error', message: 'Silakan isi kode saham, harga, dan lot dengan benar.' });
      return;
    }

    if (!tickValidation.valid) {
      setNotification({
        type: 'error',
        message: `Harga Rp ${priceNum} tidak mematuhi fraksi harga BEI (Tick size: Rp ${tickValidation.tick}). Rekomendasi terdekat: Rp ${tickValidation.nearest}.`,
      });
      return;
    }

    if (orderType === 'BUY') {
      const res = placeBuyOrder({
        symbol: rawSym,
        displaySymbol: rawSym,
        price: priceNum,
        lots: lotsNum,
        name: rawSym,
        orderType: 'LIMIT',
      });
      if (res.order) {
        setNotification({ type: 'success', message: `Order BUY ${lotsNum} lot ${rawSym} berhasil dieksekusi!` });
        setSymbol('');
        setPrice('');
        setLots('');
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal melakukan pembelian.' });
      }
    } else {
      const res = placeSellOrder({
        symbol: rawSym,
        displaySymbol: rawSym,
        price: priceNum,
        lots: lotsNum,
        orderType: 'LIMIT',
      });
      if (res.order) {
        const plText = (res.order.realizedPL || 0) >= 0 ? `+Rp ${formatPrice(res.order.realizedPL || 0)}` : `-Rp ${formatPrice(Math.abs(res.order.realizedPL || 0))}`;
        setNotification({
          type: 'success',
          message: `Order SELL ${lotsNum} lot ${rawSym} berhasil diproses! Realized P/L: ${plText}`,
        });
        setSymbol('');
        setPrice('');
        setLots('');
      } else {
        setNotification({ type: 'error', message: res.error || 'Gagal memproses penjualan.' });
      }
    }

    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Order Execution (Beli / Jual Saham)
        </span>
      </div>

      {notification && (
        <div
          className="mb-3 p-2.5 rounded-lg text-xs flex items-center gap-2"
          style={{
            backgroundColor: notification.type === 'success' ? 'var(--positive-bg)' : 'var(--negative-bg)',
            color: notification.type === 'success' ? 'var(--positive)' : 'var(--negative)',
            border: `1px solid ${notification.type === 'success' ? 'var(--positive)' : 'var(--negative)'}`,
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Buy/Sell toggle */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <button
          type="button"
          onClick={() => setOrderType('BUY')}
          className="flex-1 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
          style={{
            backgroundColor: orderType === 'BUY' ? 'var(--positive)' : 'transparent',
            color: orderType === 'BUY' ? '#000' : 'var(--text-muted)',
          }}
        >
          BUY (Beli)
        </button>
        <button
          type="button"
          onClick={() => setOrderType('SELL')}
          className="flex-1 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
          style={{
            backgroundColor: orderType === 'SELL' ? 'var(--negative)' : 'transparent',
            color: orderType === 'SELL' ? '#fff' : 'var(--text-muted)',
          }}
        >
          SELL (Jual)
        </button>
      </div>

      {/* Form fields */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[11px] block mb-1" style={{ color: 'var(--text-muted)' }}>
            Kode Saham IDX (e.g. BBCA, BBRI) atau US (NVDA, AAPL)
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. BBCA, BBRI, BMRI, TLKM"
            className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono bg-transparent outline-none uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Harga (Rp)
              </label>
              {priceNum > 0 && !shareInfo.isUS && (
                <span className="text-[10px] font-mono" style={{ color: tickValidation.valid ? 'var(--positive)' : 'var(--negative)' }}>
                  Tick: {tickValidation.tick}
                </span>
              )}
            </div>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9850"
              className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono-num bg-transparent outline-none"
              style={{
                borderColor: !tickValidation.valid ? 'var(--negative)' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {!tickValidation.valid && (
              <span className="text-[10px] block mt-0.5 text-red-400">
                Gunakan Rp {tickValidation.nearest}
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] block mb-1" style={{ color: 'var(--text-muted)' }}>
              Jumlah {shareInfo.unitLabel}
            </label>
            <input
              type="number"
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              placeholder="10"
              className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono-num bg-transparent outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            {lotsNum > 0 && (
              <span className="text-[10px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                = {shareInfo.shares.toLocaleString()} lembar
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Transaksi Realistis */}
        <div className="space-y-1.5 pt-2 border-t text-[11px]" style={{ borderColor: 'var(--border)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Nilai Bruto Saham</span>
            <span className="font-mono-num" style={{ color: 'var(--text-primary)' }}>
              Rp {formatPrice(tradeValue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Fee Broker & Bursa (0.15%)</span>
            <span className="font-mono-num" style={{ color: 'var(--text-primary)' }}>
              Rp {formatPrice(brokerFee)}
            </span>
          </div>
          {orderType === 'SELL' && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>PPh Final Penjualan (0.10%)</span>
              <span className="font-mono-num" style={{ color: 'var(--text-primary)' }}>
                Rp {formatPrice(taxFee)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--text-primary)' }}>
              {orderType === 'BUY' ? 'Total Debit Kas' : 'Total Kredit Bersih ke Kas'}
            </span>
            <span className="font-mono-num" style={{ color: 'var(--accent)' }}>
              Rp {formatPrice(Math.round(grandTotal))}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          style={{
            backgroundColor: orderType === 'BUY' ? 'var(--positive)' : 'var(--negative)',
            color: orderType === 'BUY' ? '#000' : '#fff',
          }}
        >
          {orderType === 'BUY' ? 'Eksekusi Beli Sekarang' : 'Eksekusi Jual Sekarang'}
        </button>

        <div className="pt-2 border-t border-zinc-800">
          <Link
            href="/crypto"
            className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-all text-xs font-mono group"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <div>
                <span className="font-bold block text-white group-hover:text-cyan-300 transition-colors">
                  Trading Crypto Spot (Jesse AI)
                </span>
                <span className="text-[10px] text-zinc-400">
                  BTC, ETH, SOL, DOGE · Eksekusi 24/7
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ─── Portfolio Page ─── */
export default function PortfolioPage() {
  const {
    cash,
    realizedPL,
    holdings,
    orders,
    dividends,
    claimDividend,
    claimDividendWithDRIP,
    distributeAllEligibleDividends,
    distributeAllEligibleDividendsWithDRIP,
    resetCashOnly,
    resetPortfolio,
    resetToDefaultDemo,
    updateHoldingPrices,
  } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<'holdings' | 'dividends' | 'calendar' | 'analytics' | 'orders' | 'news'>('holdings');
  const [portfolioView, setPortfolioView] = useState<'institutional' | 'classic'>('institutional');
  const [dividendMsg, setDividendMsg] = useState<string | null>(null);
  const [useDRIP, setUseDRIP] = useState(false);
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Auto-sync holding prices with backend live prices (with offline fallback)
    const syncPrices = async () => {
      if (holdings.length === 0) return;
      try {
        const symbols = holdings.map((h) => {
          const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT'].includes(h.displaySymbol.toUpperCase());
          if (isCrypto) return h.symbol;
          return h.symbol.includes('.') ? h.symbol : `${h.displaySymbol}.JK`;
        });
        const { fetchBatchQuotes } = await import('@/lib/api');
        const raw = await fetchBatchQuotes(symbols).catch(() => null);
        const quotesList = Array.isArray(raw) ? raw : (raw as any)?.quotes || [];
        const map: Record<string, number> = {};
        quotesList.forEach((q: any) => {
          if (q?.price > 0) {
            map[q.symbol] = q.price;
            map[q.displaySymbol] = q.price;
            if (q.symbol.endsWith('USDT')) {
              map[q.symbol.replace(/USDT$/, '')] = q.price;
            }
          }
        });

        // Fallback to local stock & crypto universe if backend is offline
        if (Object.keys(map).length === 0) {
          const { ALL_ID_HEATMAP_UNIVERSE } = await import('@/data/heatmap_stocks_universe');
          const { getVerifiedBenchmarkPrice } = await import('@/data/idx_benchmark_prices');
          holdings.forEach((h) => {
            const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').toUpperCase();
            const found = ALL_ID_HEATMAP_UNIVERSE.find(
              (s) => s.displaySymbol === cleanSym || s.symbol.toUpperCase() === `${cleanSym}.JK`
            );
            if (found && found.price > 0) {
              map[h.symbol] = found.price;
              map[h.displaySymbol] = found.price;
            } else {
              const bench = getVerifiedBenchmarkPrice(cleanSym);
              if (bench && bench.price > 0) {
                map[h.symbol] = bench.price;
                map[h.displaySymbol] = bench.price;
              }
            }
          });
        }

        if (Object.keys(map).length > 0) {
          updateHoldingPrices(map);
        }
      } catch {
        // Fallback gracefully without throwing
      }
    };

    syncPrices();
    const interval = setInterval(syncPrices, 30000); // Sinkronisasi otomatis tiap 30 detik
    return () => clearInterval(interval);
  }, [holdings.length, updateHoldingPrices]);

  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
    if (isCrypto) {
      const rate = h.exchangeRate || 16000;
      const units = h.cryptoUnits ?? h.lots;
      return sum + h.currentPrice * units * rate;
    }
    return sum + (h.currentPrice * (h.shares || h.lots * 100));
  }, 0);
  const totalPortfolioValue = totalHoldingsValue + cash;
  const totalUnrealizedPL = holdings.reduce((sum, h) => sum + (h.unrealizedPL || 0), 0);
  const totalDividendsReceived = dividends.reduce((sum, d) => sum + d.netAmount, 0);
  const totalPassiveIncome = totalDividendsReceived;

  const handleClaimSingle = (sym: string, dps: number) => {
    const res = claimDividend(sym, dps);
    setDividendMsg(res.message);
    setTimeout(() => setDividendMsg(null), 5000);
  };

  const handleClaimSingleDRIP = (sym: string, dps: number) => {
    const res = claimDividendWithDRIP(sym, dps);
    setDividendMsg(res.message);
    setTimeout(() => setDividendMsg(null), 6000);
  };

  const handleClaimAll = () => {
    if (useDRIP) {
      const res = distributeAllEligibleDividendsWithDRIP();
      if (res.count > 0) {
        setDividendMsg(
          `✨ Auto-DRIP Berhasil! Total dividen Rp ${res.totalDividendValue.toLocaleString(
            'id-ID'
          )} telah di-reinvestasi menjadi +${res.totalLotsAdded} Lot tambahan saham (${res.symbols.join(
            ', '
          )}). Sisa kembalian kas: Rp ${res.leftoverCashAdded.toLocaleString('id-ID')} masuk ke RDN!`
        );
      } else {
        setDividendMsg('Tidak ada dividen yang memenuhi syarat untuk program reinvestasi DRIP.');
      }
    } else {
      const res = distributeAllEligibleDividends();
      if (res.total > 0) {
        setDividendMsg(
          `Berhasil mencairkan total dividen sebesar Rp ${res.total.toLocaleString(
            'id-ID'
          )} dari ${res.count} saham (${res.symbols.join(', ')}) langsung ke saldo kas RDN!`
        );
      } else {
        setDividendMsg(
          'Tidak ada dividen yang dapat dicairkan. Pastikan portofolio Anda memiliki saham yang membagikan dividen (seperti BBCA, BBRI, ITMG, PTBA, UNTR, PGAS).'
        );
      }
    }
    setTimeout(() => setDividendMsg(null), 6000);
  };

  const handleResetCashOnly = () => {
    resetCashOnly(100000000);
    setDividendMsg('⚡ Saldo Kas RDN berhasil diisi ulang menjadi Rp 100.000.000 tanpa mengubah saham Anda!');
    setTimeout(() => setDividendMsg(null), 5000);
  };

  const handleResetTotal = () => {
    if (
      window.confirm(
        'Pilih Opsi Reset Portofolio:\n\nOK = Reset ke Kondisi Awal Demo (BBCA & BBRI, Saldo Rp 100 Juta)\nCancel = Batal'
      )
    ) {
      resetToDefaultDemo();
      setDividendMsg('Semua saldo dan portofolio berhasil di-reset kembali ke kondisi awal demo (Rp 100 Juta)!');
      setTimeout(() => setDividendMsg(null), 5000);
    }
  };

  const handleExportHoldingsCsv = () => {
    if (holdings.length === 0) return;
    exportToCsv(
      holdings,
      [
        { header: 'Ticker', key: (h) => h.displaySymbol || h.symbol },
        { header: 'Nama Perusahaan', key: (h) => h.name },
        { header: 'Harga Beli Rata-Rata (IDR)', key: (h) => h.avgPrice },
        { header: 'Lot', key: (h) => h.lots },
        { header: 'Jumlah Lembar', key: (h) => h.shares || h.lots * 100 },
        { header: 'Harga Pasar Terkini (IDR)', key: (h) => h.currentPrice },
        { header: 'Total Nilai Pasar (IDR)', key: (h) => Math.round(h.currentPrice * (h.shares || h.lots * 100)) },
        { header: 'Floating Gain Loss (IDR)', key: (h) => Math.round(h.unrealizedPL || 0) },
        { header: 'Floating Gain Loss (%)', key: (h) => h.unrealizedPLPercent || 0 },
      ],
      'Portofolio_Holdings'
    );
  };

  const handleExportOrdersCsv = () => {
    if (orders.length === 0) return;
    exportToCsv(
      orders,
      [
        { header: 'ID Transaksi', key: (o) => o.id },
        { header: 'Waktu Eksekusi', key: (o) => o.createdAt },
        { header: 'Ticker', key: (o) => o.displaySymbol || o.symbol },
        { header: 'Aksi', key: (o) => o.type },
        { header: 'Tipe Order', key: (o) => o.orderType },
        { header: 'Harga Eksekusi (IDR)', key: (o) => o.price },
        { header: 'Lot', key: (o) => o.lots },
        { header: 'Jumlah Lembar', key: (o) => (o.lots * 100) },
        { header: 'Total Nilai (IDR)', key: (o) => Math.round(o.total) },
        { header: 'Fee & Pajak (IDR)', key: (o) => Math.round(o.fee) },
        { header: 'Realized Gain Loss (IDR)', key: (o) => o.realizedPL !== undefined ? Math.round(o.realizedPL) : 0 },
        { header: 'Status', key: (o) => o.status },
      ],
      'Riwayat_Transaksi_Order'
    );
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ── Fincept AI Autonomous Portfolio Agent Desk ── */}
      <FinceptAIPortfolioAgentBar />

      {/* View Switcher: Institutional Desk vs Classic View */}
      <div className="flex items-center justify-between bg-[#09090b] border border-[#27272a] p-1.5 rounded-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPortfolioView('institutional')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              portfolioView === 'institutional'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            🏛️ INSTITUTIONAL DESK & CORRELATION
          </button>
          <button
            onClick={() => setPortfolioView('classic')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              portfolioView === 'classic'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white border border-[#27272a]'
            }`}
          >
            📑 CLASSIC DETAILED DESK
          </button>
        </div>
        <span className="text-[10px] text-[#71717a] hidden sm:inline">
          {portfolioView === 'institutional' ? 'BLOOMBERG PORTFOLIO ATTRIBUTION' : 'DETAILED HOLDINGS & ORDERS'}
        </span>
      </div>

      {portfolioView === 'institutional' ? (
        <div className="space-y-4">
          <InstitutionalPortfolioDesk />
          <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-sm">
            <h2 className="text-xs font-bold text-[#f59e0b] mb-2 uppercase">
              QUICK ORDER EXECUTION DESK
            </h2>
            <OrderForm />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Portofolio Saham, Dividen & SBN Ritel
              </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Real-time Portfolio Tracking &bull; Realized / Unrealized Gain &bull; Dividen & SBN
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setUseDRIP(!useDRIP)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              useDRIP
                ? 'bg-purple-600/25 text-purple-300 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
            title="Dividend Reinvestment Plan (DRIP): Otomatis mengonversi dividen kas menjadi lot saham tambahan di harga pasar (0 fee broker)"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: useDRIP ? '#a855f7' : '#71717a' }} />
            <span>Mode DRIP: {useDRIP ? 'AKTIF (Auto-Reinvest)' : 'KAS RDN'}</span>
          </button>
          <button
            onClick={handleClaimAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm hover:brightness-110"
            style={{
              backgroundColor: useDRIP ? '#a855f7' : 'var(--accent)',
              color: useDRIP ? '#fff' : '#000',
            }}
            title={useDRIP ? 'Reinvestasikan dividen langsung menjadi lot saham' : 'Cairkan semua dividen ke saldo kas'}
          >
            <Gift className="w-3.5 h-3.5" />
            {useDRIP ? '✨ Eksekusi DRIP (Reinvestasi Saham)' : 'Cairkan Semua Dividen'}
          </button>
          <button
            type="button"
            onClick={() => setIsStressTestOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-rose-400 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20"
            title="Uji ketahanan portofolio terhadap skenario krisis historis & simulasi Monte Carlo"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Stress Test & Monte Carlo</span>
          </button>
          <button
            type="button"
            onClick={handleResetCashOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
            title="Isi ulang Saldo Kas RDN ke Rp 100.000.000 tanpa menghapus posisi saham Anda"
          >
            <Coins className="w-3.5 h-3.5" />
            Top Up Saldo Kas (Rp 100Jt)
          </button>
          <button
            type="button"
            onClick={handleResetTotal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-red-400 border-red-500/40 bg-red-500/10 hover:bg-red-500/20"
            title="Reset seluruh portofolio & transaksi ke kondisi awal demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Portofolio Demo
          </button>
        </div>
      </div>

      {dividendMsg && (
        <div
          className="p-3 rounded-lg text-xs font-semibold flex items-center gap-2"
          style={{ backgroundColor: 'var(--positive-bg)', color: 'var(--positive)', border: '1px solid var(--positive)' }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dividendMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Total Nilai Aset</div>
          <div className="text-lg font-bold font-mono-num" style={{ color: 'var(--text-primary)' }}>
            Rp {formatPrice(Math.round(totalPortfolioValue))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Kas Tersedia (RDN)</span>
            <button
              type="button"
              onClick={handleResetCashOnly}
              className="text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
              title="Isi ulang Saldo Kas RDN ke Rp 100.000.000 (Saham Anda tetap aman)"
            >
              <Coins className="w-3 h-3 text-amber-500" />
              <span>Isi Ulang</span>
            </button>
          </div>
          <div className="text-lg font-bold font-mono-num" style={{ color: 'var(--accent)' }}>
            Rp {formatPrice(Math.round(cash))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Unrealized Gain / Loss</div>
          <div
            className="text-lg font-bold font-mono-num flex items-center gap-1"
            style={{ color: totalUnrealizedPL >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {totalUnrealizedPL >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            Rp {formatPrice(Math.round(Math.abs(totalUnrealizedPL)))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Realized Profit / Loss</div>
          <div
            className="text-lg font-bold font-mono-num flex items-center gap-1"
            style={{ color: (realizedPL || 0) >= 0 ? 'var(--positive)' : 'var(--negative)' }}
          >
            {(realizedPL || 0) >= 0 ? '+' : '-'}Rp {formatPrice(Math.round(Math.abs(realizedPL || 0)))}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Passive Income</div>
          <div className="text-lg font-bold font-mono-num flex items-center gap-1" style={{ color: 'var(--positive)' }}>
            <Coins className="w-4 h-4" />
            Rp {formatPrice(Math.round(totalPassiveIncome))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tabs Area */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setActiveTab('holdings')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'holdings' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'holdings' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <PieChart className="w-4 h-4" /> Saham Dimiliki ({holdings.length})
            </button>
            <button
              onClick={() => setActiveTab('dividends')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'dividends' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'dividends' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Coins className="w-4 h-4" /> Klaim Dividen ({dividends.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'calendar' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'calendar' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Calendar className="w-4 h-4 text-amber-400" /> Kalender Dividen
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'analytics' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'analytics' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Analisis & Alokasi
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'orders' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <History className="w-4 h-4" /> Riwayat Order & Realized P/L ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0"
              style={{
                color: activeTab === 'news' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'news' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Newspaper className="w-4 h-4 text-[#f59e0b]" /> Berita Saham Saya
            </button>
          </div>

          {/* TAB 1: HOLDINGS SAHAM */}
          {activeTab === 'holdings' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-zinc-400">
                  Total {holdings.length} posisi saham aktif dalam portofolio
                </span>
                {holdings.length > 0 && (
                  <button
                    onClick={handleExportHoldingsCsv}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 rounded text-xs font-mono font-semibold transition-colors cursor-pointer"
                    title="Ekspor seluruh posisi saham ke format CSV (kompatibel Excel & Google Sheets)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Portofolio CSV</span>
                  </button>
                )}
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {holdings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center" style={{ color: 'var(--text-muted)' }}>
                  <Briefcase className="w-10 h-10 mb-2 opacity-30" />
                  <div className="text-sm font-bold text-gray-300">Portofolio Saham Masih Kosong</div>
                  <div className="text-xs max-w-xs">Beli saham IDX melalui form di samping kanan untuk mulai mengumpulkan dividen.</div>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="data-table min-w-[760px] w-full">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th className="text-right">Avg Buy (Fee Inkl.)</th>
                        <th className="text-right">Lot (Lembar)</th>
                        <th className="text-right">Harga Live</th>
                        <th className="text-right">Total Nilai</th>
                        <th className="text-right">Floating Gain/Loss</th>
                        <th className="text-center">Aksi Dividen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => {
                        const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT');
                        const rate = h.exchangeRate || 16000;
                        const units = isCrypto ? (h.cryptoUnits ?? h.lots) : (h.shares || h.lots * 100);
                        const val = isCrypto ? h.currentPrice * units * rate : h.currentPrice * units;
                        const isPositive = (h.unrealizedPL || 0) >= 0;
                        const cleanSym = (h.displaySymbol || h.symbol).replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
                        const divInfo = KNOWN_DIVIDENDS[cleanSym];
                        const totalDividend = divInfo && divInfo.dps > 0 ? divInfo.dps * units : 0;
                        return (
                          <tr key={h.symbol} className={isCrypto ? 'bg-cyan-950/10' : ''}>
                            <td>
                              <div className="flex items-center gap-2">
                                {isCrypto ? (
                                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-black shrink-0">
                                    ⚡
                                  </div>
                                ) : (
                                  <CompanyLogo symbol={h.displaySymbol} name={h.name} size={24} rounded="md" />
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <Link
                                      href={isCrypto ? '/crypto' : `/stock/${h.displaySymbol}`}
                                      className="font-bold text-xs font-mono hover:underline"
                                      style={{ color: isCrypto ? '#06b6d4' : 'var(--accent)' }}
                                    >
                                      {cleanSym}
                                    </Link>
                                    {isCrypto && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                        CRYPTO
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{h.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right font-mono-num text-xs font-semibold">
                              {isCrypto ? `$${h.avgPrice.toLocaleString()} USDT` : `Rp ${formatPrice(h.avgPrice)}`}
                              {isCrypto && (
                                <span className="text-[10px] block text-zinc-500">
                                  (≈ Rp {formatPrice(Math.round(h.avgPrice * rate))})
                                </span>
                              )}
                            </td>
                            <td className="text-right font-mono-num text-xs">
                              {isCrypto ? (
                                <span className="font-semibold text-cyan-300">{units.toFixed(4)} koin</span>
                              ) : (
                                <>
                                  <span className="font-semibold">{h.lots} lot</span>
                                  <span className="text-[10px] block text-gray-400">({units.toLocaleString()} lbr)</span>
                                </>
                              )}
                            </td>
                            <td className="text-right font-mono-num text-xs font-semibold">
                              {isCrypto ? (
                                <span className="text-white">${h.currentPrice.toLocaleString()}</span>
                              ) : (
                                `Rp ${formatPrice(h.currentPrice)}`
                              )}
                            </td>
                            <td className="text-right font-mono-num text-xs font-bold">
                              Rp {formatPrice(Math.round(val))}
                            </td>
                            <td
                              className="text-right font-mono-num text-xs font-semibold"
                              style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}
                            >
                              {isPositive ? '+' : ''}Rp {formatPrice(Math.round(h.unrealizedPL || 0))} ({h.unrealizedPLPercent || 0}%)
                            </td>
                            <td className="text-center">
                              {isCrypto ? (
                                <Link
                                  href="/crypto"
                                  className="px-2.5 py-1 rounded text-[11px] font-bold transition-all inline-flex items-center gap-1 font-mono text-cyan-300 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 shadow-sm"
                                  title="Buka Jesse AI Quant Desk untuk trading koin ini"
                                >
                                  <Coins className="w-3 h-3 text-cyan-400" />
                                  <span>Jesse Desk</span>
                                </Link>
                              ) : divInfo && divInfo.dps > 0 ? (
                                <div className="inline-flex items-center gap-1.5">
                                  {useDRIP ? (
                                    <button
                                      onClick={() => handleClaimSingleDRIP(h.symbol, divInfo.dps)}
                                      className="px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer hover:opacity-90 inline-flex items-center gap-1 font-mono text-purple-300 border border-purple-500/50 bg-purple-500/15 shadow-sm"
                                      title={`DRIP: Otomatis belikan lot saham ${cleanSym} dari total dividen Rp ${formatPrice(totalDividend)}`}
                                    >
                                      <Sparkles className="w-3 h-3 text-purple-400" />
                                      <span>DRIP (+Lot)</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleClaimSingle(h.symbol, divInfo.dps)}
                                      className="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer hover:opacity-90 inline-flex items-center gap-1 font-mono"
                                      style={{ backgroundColor: 'var(--positive-bg)', color: 'var(--positive)', border: '1px solid var(--positive)' }}
                                      title={`Klaim dividen Rp ${divInfo.dps}/lbr (Total: Rp ${formatPrice(totalDividend)}) ke kas`}
                                    >
                                      <Coins className="w-3 h-3" />
                                      <span>Klaim Rp {formatPrice(divInfo.dps)}</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded font-mono"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                                  title="Emiten berstatus Non-Dividen (fokus ekspansi/rugi bersih)"
                                >
                                  Non-Dividen
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

          {/* TAB 2: DIVIDEND TRACKER */}
          {activeTab === 'dividends' && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Dividen Yield & Rekapitulasi Pembagian Kas
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Dividen otomatis masuk ke Kas RDN (0% PPh Final jika diinvestasikan kembali sesuai UU HPP).
                  </div>
                </div>
                <button
                  onClick={handleClaimAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--positive)', color: '#000' }}
                >
                  Cairkan Semua
                </button>
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="data-table min-w-[700px] w-full">
                    <thead>
                      <tr>
                        <th>ID Pembayaran</th>
                        <th>Ticker</th>
                        <th className="text-right">DPS (Rp/lembar)</th>
                        <th className="text-right">Lembar Saham</th>
                        <th className="text-right">Total Dividen Diterima</th>
                        <th>Tanggal Pembayaran</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dividends.map((d) => (
                        <tr key={d.id}>
                          <td className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{d.id}</td>
                          <td className="font-bold text-xs font-mono" style={{ color: 'var(--accent)' }}>
                            <div className="flex items-center gap-1.5">
                              <CompanyLogo symbol={d.displaySymbol} size={18} rounded="sm" border={false} />
                              <span>{d.displaySymbol}</span>
                            </div>
                          </td>
                          <td className="text-right font-mono-num text-xs">Rp {formatPrice(d.dividendPerShare)}</td>
                          <td className="text-right font-mono-num text-xs">{d.shares.toLocaleString()} lbr</td>
                          <td className="text-right font-mono-num text-xs font-bold" style={{ color: 'var(--positive)' }}>
                            Rp {formatPrice(d.netAmount)}
                          </td>
                          <td className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{d.paymentDate}</td>
                          <td className="text-center">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded font-mono"
                              style={{ backgroundColor: 'var(--positive-bg)', color: 'var(--positive)' }}
                            >
                              DITERIMA
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: KALENDER DIVIDEN & COUNTDOWN */}
          {activeTab === 'calendar' && (
            <DividendCalendar />
          )}

          {/* TAB 4: RIWAYAT ORDER & REALIZED P/L */}
          {activeTab === 'orders' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-zinc-400">
                  Log audit transaksi order & eksekusi bursa ({orders.length} order)
                </span>
                {orders.length > 0 && (
                  <button
                    onClick={handleExportOrdersCsv}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 rounded text-xs font-mono font-semibold transition-colors cursor-pointer"
                    title="Ekspor seluruh riwayat order & realized P/L ke format CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Riwayat Order CSV</span>
                  </button>
                )}
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center" style={{ color: 'var(--text-muted)' }}>
                  <History className="w-10 h-10 mb-2 opacity-30" />
                  <div className="text-sm font-bold text-gray-300">Belum Ada Transaksi</div>
                  <div className="text-xs">Semua eksekusi order akan tercatat di log audit ini.</div>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="data-table min-w-[760px] w-full">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Ticker</th>
                        <th className="text-center">Tipe</th>
                        <th className="text-right">Harga</th>
                        <th className="text-right">Lot (Lembar)</th>
                        <th className="text-right">Fee & Pajak</th>
                        <th className="text-right">Total Transaksi</th>
                        <th className="text-right">Realized Gain/Loss</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const hasRealized = o.type === 'SELL' && o.realizedPL !== undefined;
                        const isGain = (o.realizedPL || 0) >= 0;
                        return (
                          <tr key={o.id}>
                            <td className="text-xs font-mono-num" style={{ color: 'var(--text-muted)' }}>
                              {new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="font-bold text-xs font-mono" style={{ color: 'var(--accent)' }}>
                              <div className="flex items-center gap-1.5">
                                <CompanyLogo symbol={o.displaySymbol} size={18} rounded="sm" border={false} />
                                <span>{o.displaySymbol}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                                style={{
                                  backgroundColor: o.type === 'BUY' ? 'var(--positive-bg)' : 'var(--negative-bg)',
                                  color: o.type === 'BUY' ? 'var(--positive)' : 'var(--negative)',
                                }}
                              >
                                {o.type}
                              </span>
                            </td>
                            <td className="text-right font-mono-num text-xs">{formatPrice(o.price)}</td>
                            <td className="text-right font-mono-num text-xs">
                              {o.lots} lot <span className="text-[10px] text-gray-400">({o.shares || o.lots * 100} lbr)</span>
                            </td>
                            <td className="text-right font-mono-num text-xs" style={{ color: 'var(--text-muted)' }}>
                              Rp {formatPrice(o.fee)}
                            </td>
                            <td className="text-right font-mono-num text-xs font-semibold">
                              Rp {formatPrice(Math.round(o.total))}
                            </td>
                            <td className="text-right font-mono-num text-xs">
                              {hasRealized ? (
                                <span
                                  className="font-bold px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: isGain ? 'var(--positive-bg)' : 'var(--negative-bg)',
                                    color: isGain ? 'var(--positive)' : 'var(--negative)',
                                  }}
                                >
                                  {isGain ? '+' : ''}Rp {formatPrice(Math.round(o.realizedPL!))} ({o.realizedPLPercent}%)
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                              )}
                            </td>
                            <td className="text-center">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                                style={{
                                  backgroundColor: 'var(--blue-bg)',
                                  color: 'var(--blue)',
                                }}
                              >
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

          {/* TAB: ANALYTICS & ALLOCATION */}
          {activeTab === 'analytics' && (
            <PortfolioAnalytics />
          )}

          {/* TAB: BERITA & ARSIP SEBELUMNYA SAHAM SAYA */}
          {activeTab === 'news' && (
            <PortfolioNewsFeed />
          )}
        </div>

        {/* Order Execution Widget */}
        <div>
          <OrderForm />
        </div>
      </div>
    </div>
  )}

      {/* Portfolio Stress Testing & Monte Carlo Modal */}
      <PortfolioStressTestModal
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
      />
    </div>
  );
}
