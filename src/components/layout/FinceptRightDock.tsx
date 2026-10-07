'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useMarketStore, useWatchlistStore, usePortfolioStore } from '@/store';
import CompanyLogo from '@/components/common/CompanyLogo';
import { INVESTING_COM_GLOBAL_DIVIDENDS } from '@/data/investing_global_dividends';
import { calculateShares, isValidIDXTick } from '@/lib/stockRules';
import TopUpModal from '@/components/portfolio/TopUpModal';

export default function FinceptRightDock() {
  const {
    isRightDockOpen,
    setRightDockOpen,
    activeDockTab,
    setActiveDockTab,
    selectedSymbol,
    setSelectedSymbol,
  } = useMarketStore();

  const { watchlists, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const { cash, placeBuyOrder, placeSellOrder } = usePortfolioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderSymbol, setOrderSymbol] = useState(selectedSymbol.replace('.JK', ''));
  const [orderPrice, setOrderPrice] = useState('10525');
  const [orderLots, setOrderLots] = useState('1');
  const [orderNotification, setOrderNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Sync orderSymbol when selectedSymbol changes
  useEffect(() => {
    if (selectedSymbol) {
      setOrderSymbol(selectedSymbol.replace('.JK', ''));
    }
  }, [selectedSymbol]);

  // Handle ESC key to close dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRightDockOpen) {
        setRightDockOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRightDockOpen, setRightDockOpen]);

  const defaultWatchlist = watchlists[0] || { items: [] };

  // Calculate order execution values
  const priceNum = parseFloat(orderPrice) || 0;
  const lotsNum = parseInt(orderLots, 10) || 0;
  const rawSym = orderSymbol.trim().toUpperCase();
  const shareInfo = calculateShares(rawSym, lotsNum);
  const tradeValue = Math.round(priceNum * shareInfo.shares * shareInfo.exchangeRate);
  const brokerFee = Math.round(tradeValue * 0.0015);
  const taxFee = orderType === 'SELL' ? Math.round(tradeValue * 0.001) : 0;
  const totalCost = orderType === 'BUY' ? tradeValue + brokerFee : tradeValue - (brokerFee + taxFee);

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawSym) {
      setOrderNotification({ type: 'error', message: 'Masukkan simbol ticker.' });
      return;
    }
    if (priceNum <= 0 || lotsNum <= 0) {
      setOrderNotification({ type: 'error', message: 'Harga dan jumlah harus lebih dari 0.' });
      return;
    }

    if (orderType === 'BUY') {
      if (totalCost > cash) {
        setOrderNotification({
          type: 'error',
          message: `Saldo kas tidak mencukupi (Perlu Rp ${totalCost.toLocaleString('id-ID')}).`,
        });
        return;
      }
      const res = placeBuyOrder({
        symbol: rawSym,
        price: priceNum,
        lots: lotsNum,
        assetClass: shareInfo.isCrypto ? 'CRYPTO' : 'EQUITY',
        currency: shareInfo.currency,
        exchangeRate: shareInfo.exchangeRate,
        cryptoUnits: shareInfo.isCrypto ? lotsNum : undefined,
      });
      if (res.error) {
        setOrderNotification({ type: 'error', message: res.error });
        return;
      }
      const unitLabel = shareInfo.isCrypto ? 'koin' : 'lot';
      setOrderNotification({
        type: 'success',
        message: `Order BELI ${lotsNum} ${unitLabel} ${rawSym} berhasil dieksekusi (Total: Rp ${totalCost.toLocaleString('id-ID')})!`,
      });
    } else {
      const res = placeSellOrder({
        symbol: rawSym,
        price: priceNum,
        lots: lotsNum,
        assetClass: shareInfo.isCrypto ? 'CRYPTO' : 'EQUITY',
        currency: shareInfo.currency,
        exchangeRate: shareInfo.exchangeRate,
        cryptoUnits: shareInfo.isCrypto ? lotsNum : undefined,
      });
      if (res.error) {
        setOrderNotification({ type: 'error', message: res.error });
        return;
      }
      const unitLabel = shareInfo.isCrypto ? 'koin' : 'lot';
      setOrderNotification({
        type: 'success',
        message: `Order JUAL ${lotsNum} ${unitLabel} ${rawSym} berhasil dieksekusi!`,
      });
    }

    setTimeout(() => setOrderNotification(null), 4000);
  };

  return (
    <>
      {/* ── Retracted Dock Edge Handle Button (Always Visible) ── */}
      {!isRightDockOpen && (
        <button
          onClick={() => setRightDockOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#121216] hover:bg-[#18181b] border-l-2 border-t border-b border-[#f59e0b] text-[#f59e0b] shadow-[0_0_15px_rgba(0,0,0,0.8)] py-3 px-1.5 rounded-l-md flex flex-col items-center gap-2 cursor-pointer transition-transform hover:-translate-x-1"
          title="Buka Watchlist & Quick Order Desk"
        >
          <span className="text-[10px] font-mono font-extrabold tracking-widest [writing-mode:vertical-rl] uppercase">
            QUICK DESK
          </span>
          <Zap className="w-3.5 h-3.5 fill-[#f59e0b] animate-pulse" />
        </button>
      )}

      {/* ── Sliding Drawer Dock ── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-[#0c0d10] border-l border-[#27272a] shadow-2xl z-50 flex flex-col transition-transform duration-200 ease-in-out font-mono ${
          isRightDockOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top Header of Dock */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-[#121216] border-b border-[#27272a]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="text-xs font-bold tracking-wider text-white uppercase">BLOOMBERG DOCK</span>
            <span className="text-[9px] text-[#71717a]">| FAST TRADING</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setRightDockOpen(false)}
              className="p-1 text-[#71717a] hover:text-white hover:bg-[#27272a] rounded cursor-pointer transition-colors"
              title="Tutup Panel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Watchlist vs Order */}
        <div className="grid grid-cols-2 p-1.5 bg-[#121216] border-b border-[#27272a] gap-1 text-xs">
          <button
            onClick={() => setActiveDockTab('watchlist')}
            className={`py-1.5 rounded font-bold text-center cursor-pointer transition-colors ${
              activeDockTab === 'watchlist'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-transparent text-[#71717a] hover:text-white hover:bg-[#18181b]'
            }`}
          >
            📊 WATCHLIST ({defaultWatchlist.items.length})
          </button>
          <button
            onClick={() => setActiveDockTab('order')}
            className={`py-1.5 rounded font-bold text-center cursor-pointer transition-colors ${
              activeDockTab === 'order'
                ? 'bg-[#f59e0b] text-black shadow-sm'
                : 'bg-transparent text-[#71717a] hover:text-white hover:bg-[#18181b]'
            }`}
          >
            ⚡ QUICK ORDER
          </button>
        </div>

        {/* Dock Content Body */}
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          {/* ── TAB 1: WATCHLIST ── */}
          {activeDockTab === 'watchlist' && (
            <div className="space-y-3">
              {/* Quick Search & Add */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#71717a]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari & tambah saham (BBCA, KO)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b] rounded text-xs text-white placeholder-[#52525b] outline-none"
                />
              </div>

              {/* Search Suggestions if typing */}
              {searchQuery && (
                <div className="bg-[#121216] border border-[#27272a] rounded p-1 space-y-1 text-xs max-h-48 overflow-y-auto">
                  {INVESTING_COM_GLOBAL_DIVIDENDS.filter(
                    (s) =>
                      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                    .slice(0, 5)
                    .map((s) => (
                      <div
                        key={s.ticker}
                        className="flex items-center justify-between p-1.5 hover:bg-[#27272a] rounded cursor-pointer"
                        onClick={() => {
                          addToWatchlist('default-watchlist', {
                            symbol: s.ticker,
                            displaySymbol: s.ticker,
                            name: s.name,
                          });
                          setSearchQuery('');
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <CompanyLogo symbol={s.ticker} name={s.name} size={18} />
                          <span>{s.flag}</span>
                          <span className="font-bold text-[#f59e0b]">{s.ticker}</span>
                          <span className="text-[10px] text-zinc-400 truncate max-w-[110px]">{s.name}</span>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                      </div>
                    ))}
                </div>
              )}

              {/* Watchlist Items Table */}
              <div className="space-y-1">
                {defaultWatchlist.items.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-xs">
                    Watchlist masih kosong. Cari saham di atas untuk menambahkan.
                  </div>
                ) : (
                  defaultWatchlist.items.map((item) => {
                    const isSelected = selectedSymbol.includes(item.displaySymbol);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-[#18181b] border-[#f59e0b]/50'
                            : 'bg-[#121216] border-[#27272a] hover:bg-[#18181b]'
                        }`}
                        onClick={() => setSelectedSymbol(item.symbol)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CompanyLogo symbol={item.displaySymbol} name={item.name} size={22} rounded="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-white group-hover:text-[#f59e0b]">
                                {item.displaySymbol}
                              </span>
                              <Link
                                href={`/stock/${item.displaySymbol}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-zinc-500 hover:text-zinc-300"
                                title="Buka Detail Saham"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <div className="text-[10px] text-[#71717a] truncate max-w-[130px]">
                              {item.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderSymbol(item.displaySymbol);
                              setActiveDockTab('order');
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                            title="Buka form order beli"
                          >
                            TRADE
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWatchlist('default-watchlist', item.id);
                            }}
                            className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus dari watchlist"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: QUICK ORDER DESK ── */}
          {activeDockTab === 'order' && (
            <form onSubmit={handleExecuteOrder} className="space-y-3.5">
              {/* Cash Available Info */}
              <div className="flex items-center justify-between p-2 rounded bg-[#121216] border border-[#27272a] text-xs">
                <span className="text-[#71717a]">Kas RDN Tersedia:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#f59e0b]">
                    Rp {Math.round(cash).toLocaleString('id-ID')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(true)}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-extrabold text-[10px] border border-amber-500/40 cursor-pointer transition-all"
                    title="Top Up Saldo via QRIS Resmi (Rp 10.000 = Rp 1.000.000 Kas)"
                  >
                    + Top Up
                  </button>
                </div>
              </div>

              {/* Order Type Toggle: BUY / SELL */}
              <div className="grid grid-cols-2 gap-1 bg-[#121216] p-1 rounded border border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setOrderType('BUY')}
                  className={`py-1.5 rounded font-extrabold text-xs cursor-pointer transition-colors ${
                    orderType === 'BUY'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  BELI (BUY)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('SELL')}
                  className={`py-1.5 rounded font-extrabold text-xs cursor-pointer transition-colors ${
                    orderType === 'SELL'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  JUAL (SELL)
                </button>
              </div>

              {/* Ticker Input */}
              <div>
                <label className="text-[10px] text-[#71717a] uppercase font-bold block mb-1">
                  Ticker Simbol
                </label>
                <input
                  type="text"
                  value={orderSymbol}
                  onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
                  placeholder="BBCA, BBRI, KO, AAPL..."
                  className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b] rounded text-xs font-bold text-white uppercase outline-none"
                />
              </div>

              {/* Price Input & Quick Increments */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[#71717a] uppercase font-bold">
                    Harga Limit (IDR / USD)
                  </label>
                  <span className="text-[9px] text-[#71717a]">Fraksi BEI / Pasar</span>
                </div>
                <input
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b] rounded text-xs font-bold text-white outline-none"
                />
              </div>

              {/* Lots Input & Quick Lot Pills */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[#71717a] uppercase font-bold">
                    Jumlah Lot
                  </label>
                  <span className="text-[9px] text-zinc-400">
                    ({shareInfo.shares.toLocaleString()} lembar)
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={orderLots}
                  onChange={(e) => setOrderLots(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-[#f59e0b] rounded text-xs font-bold text-white outline-none"
                />
                <div className="grid grid-cols-4 gap-1 mt-1.5 text-[10px]">
                  {[1, 5, 10, 50].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setOrderLots(String(l))}
                      className="py-1 rounded bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-zinc-300 font-bold transition-colors cursor-pointer"
                    >
                      {l} Lot
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee & Total Summary */}
              <div className="p-2.5 rounded bg-[#121216] border border-[#27272a] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-zinc-400">
                  <span>Nilai Transaksi:</span>
                  <span className="font-mono text-white">Rp {Math.round(tradeValue).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[10px]">
                  <span>Broker Fee (0.15%):</span>
                  <span>Rp {brokerFee.toLocaleString('id-ID')}</span>
                </div>
                {orderType === 'SELL' && (
                  <div className="flex justify-between text-zinc-500 text-[10px]">
                    <span>PPh Bursa (0.1%):</span>
                    <span>Rp {taxFee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t border-[#27272a] pt-1.5 flex justify-between font-bold text-white text-xs">
                  <span>Total {orderType === 'BUY' ? 'Biaya' : 'Diterima'}:</span>
                  <span className={orderType === 'BUY' ? 'text-amber-400' : 'text-emerald-400'}>
                    Rp {Math.round(totalCost).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Notification Banner */}
              {orderNotification && (
                <div
                  className={`p-2 rounded text-xs font-bold flex items-center gap-1.5 ${
                    orderNotification.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {orderNotification.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{orderNotification.message}</span>
                </div>
              )}

              {/* Execute Button */}
              <button
                type="submit"
                className={`w-full py-2.5 rounded font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-[0.98] ${
                  orderType === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                {orderType === 'BUY' ? `EKSEKUSI BELI ${rawSym}` : `EKSEKUSI JUAL ${rawSym}`}
              </button>
            </form>
          )}
        </div>

        {/* Bottom Link to Full Portfolio */}
        <div className="p-2 bg-[#121216] border-t border-[#27272a] flex items-center justify-between text-[11px] text-[#71717a]">
          <Link
            href="/portfolio"
            onClick={() => setRightDockOpen(false)}
            className="text-[#f59e0b] hover:underline flex items-center gap-1"
          >
            <span>Buka Portofolio Lengkap & Realized P/L &rarr;</span>
          </Link>
          <span className="text-[9px]">Bloomberg Terminal v2.5</span>
        </div>
      </div>

      {/* Top Up Saldo Kas RDN Modal (QRIS) */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </>
  );
}
