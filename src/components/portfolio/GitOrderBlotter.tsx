'use client';

import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bot,
  Zap,
  DollarSign,
  X,
  FileText,
  Search,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { tradeSimAudio } from '@/lib/tradeSimAudio';

interface GitOrderCommit {
  id: string;
  hash: string;
  branch: 'main' | 'order' | 'ai';
  type: 'DEPOSIT' | 'ORDER_FILLED' | 'AI_EXECUTION' | 'PENDING';
  actor: string;
  symbol?: string;
  action?: 'BUY' | 'SELL';
  lots?: number;
  price?: number;
  total?: number;
  pnl?: number;
  pnlPercent?: number;
  fee?: number;
  broker?: string;
  timestamp: string;
  title: string;
  desc: string;
  acidStatus: 'COMMITTED' | 'WAL_LOGGED' | 'RESOLVED';
}

export default function GitOrderBlotter() {
  const { holdings, orders, cash } = usePortfolioStore();
  const [selectedCommit, setSelectedCommit] = useState<GitOrderCommit | null>(null);
  const [activeBranchFilter, setActiveBranchFilter] = useState<'ALL' | 'main' | 'order' | 'ai'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate synthetic and live ACID transaction commits from portfolio state
  const commits: GitOrderCommit[] = useMemo(() => {
    const list: GitOrderCommit[] = [];

    // 1. Initial Deposit / RDN Commit on main branch
    list.push({
      id: 'commit-main-genesis',
      hash: '11e400',
      branch: 'main',
      type: 'DEPOSIT',
      actor: 'Core Banking Gateway',
      total: 1000000000,
      timestamp: '09:00:00 WIB',
      title: 'deposit(qris): Virtual Cash RDN credited +Rp 1.000.000.000',
      desc: 'Sistem perbankan virtual menginisialisasi saldo kas RDN. ACID Ledger tersimpan di Supabase PostgreSQL WAL.',
      acidStatus: 'COMMITTED',
    });

    // 2. Orders from usePortfolioStore
    (orders || []).forEach((ord, idx) => {
      const isFilled = ord.status === 'FILLED';
      const isAI = idx % 2 === 1; // Mark alternating as AI agent executions
      const hashId = (ord.id ? ord.id.replace(/[^a-f0-9]/gi, '') : Math.random().toString(16)).slice(0, 6);

      list.push({
        id: `commit-order-${ord.id || idx}`,
        hash: hashId.padEnd(6, '0'),
        branch: isAI ? 'ai' : 'order',
        type: isFilled ? (isAI ? 'AI_EXECUTION' : 'ORDER_FILLED') : 'PENDING',
        actor: isAI ? 'AI Chief Quant Sentinel' : 'Trader Workstation Desk',
        symbol: ord.displaySymbol || ord.symbol || 'BBCA',
        action: ord.type,
        lots: ord.lots,
        price: ord.price,
        total: ord.total || (ord.price * ord.lots * 100),
        fee: Math.round((ord.total || (ord.price * ord.lots * 100)) * 0.0015),
        broker: 'YP (Mirae Asset)',
        timestamp: ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString('id-ID') + ' WIB' : '10:15:20 WIB',
        title: `${ord.type.toLowerCase()}(${ord.displaySymbol || ord.symbol}): ${ord.lots} LOT @ Rp ${ord.price.toLocaleString('id-ID')}`,
        desc: isFilled
          ? `Order ${ord.type} terpenuhi pada antrian bursa IDX. Match Engine menyelesaikan kliring dengan settlement ACID.`
          : `Order ${ord.type} sedang berada di buku pesanan (Pending Limit Order). Menunggu matching level harga.`,
        acidStatus: isFilled ? 'COMMITTED' : 'WAL_LOGGED',
      });
    });

    // 3. Fallback demo commit if orders are empty
    if (list.length === 1) {
      list.unshift({
        id: 'commit-demo-filled',
        hash: '7a9f12',
        branch: 'order',
        type: 'ORDER_FILLED',
        actor: 'Match Engine ACID #04',
        symbol: 'BBCA',
        action: 'BUY',
        lots: 500,
        price: 10450,
        total: 522500000,
        pnl: 12500000,
        pnlPercent: 2.39,
        fee: 783750,
        broker: 'YP (Mirae Asset Sekuritas)',
        timestamp: '10:42:01 WIB',
        title: 'settlement: MATCHED 500 LOT BBCA @ Rp 10.450',
        desc: 'Eksekusi transaksi beli saham BBCA pada support level 10.450. Kliring KPEI ACID selesai.',
        acidStatus: 'COMMITTED',
      });
      list.splice(1, 0, {
        id: 'commit-demo-ai',
        hash: 'c410be',
        branch: 'ai',
        type: 'AI_EXECUTION',
        actor: 'AI Trading Sentinel #01',
        symbol: 'BMRI',
        action: 'BUY',
        lots: 200,
        price: 6850,
        total: 137000000,
        fee: 205500,
        broker: 'CC (Mandiri Sekuritas)',
        timestamp: '10:30:15 WIB',
        title: 'quant(sentinel): Signal Alpha Arbitrage on BMRI @ Rp 6.850',
        desc: 'Model deteksi volume spike menyetujui eksekusi otomatis limit order pada antrian bid 1.',
        acidStatus: 'COMMITTED',
      });
    }

    return list;
  }, [orders]);

  const filteredCommits = useMemo(() => {
    return commits.filter((c) => {
      const matchBranch = activeBranchFilter === 'ALL' || c.branch === activeBranchFilter;
      const matchSearch =
        !searchQuery ||
        c.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.symbol && c.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchBranch && matchSearch;
    });
  }, [commits, activeBranchFilter, searchQuery]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 font-mono-num select-none">
      {/* ── Sub-header: Git Log Command Line & Branch Badges ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-extrabold text-sm">
              $ git log --graph --all --oneline transactions/
            </span>
          </div>
          <p className="text-xs text-[var(--text-dim)] mt-0.5">
            ACID Order Execution Blotter &amp; Audit Trail (Visualisasi Cabang Transaksi ala Eddy Naboulet OS)
          </p>
        </div>

        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-[var(--border-color)] rounded-lg text-xs">
          <button
            onClick={() => {
              tradeSimAudio.playActionTone();
              setActiveBranchFilter('ALL');
            }}
            className={`px-2.5 py-1 rounded transition cursor-pointer font-bold ${
              activeBranchFilter === 'ALL'
                ? 'bg-white text-black font-extrabold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua ({commits.length})
          </button>
          <button
            onClick={() => {
              tradeSimAudio.playActionTone();
              setActiveBranchFilter('main');
            }}
            className={`px-2.5 py-1 rounded transition cursor-pointer font-bold flex items-center gap-1 ${
              activeBranchFilter === 'main'
                ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                : 'text-emerald-400 hover:text-white'
            }`}
          >
            <span>main</span>
          </button>
          <button
            onClick={() => {
              tradeSimAudio.playActionTone();
              setActiveBranchFilter('order');
            }}
            className={`px-2.5 py-1 rounded transition cursor-pointer font-bold flex items-center gap-1 ${
              activeBranchFilter === 'order'
                ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                : 'text-cyan-400 hover:text-white'
            }`}
          >
            <span>order/idx</span>
          </button>
          <button
            onClick={() => {
              tradeSimAudio.playActionTone();
              setActiveBranchFilter('ai');
            }}
            className={`px-2.5 py-1 rounded transition cursor-pointer font-bold flex items-center gap-1 ${
              activeBranchFilter === 'ai'
                ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                : 'text-purple-400 hover:text-white'
            }`}
          >
            <span>ai/quant</span>
          </button>
        </div>
      </div>

      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari commit hash (7a9f12), emiten (BBCA), atau judul order..."
          className="w-full bg-black/40 border border-[var(--border-color)] rounded-lg pl-8 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 transition"
        />
      </div>

      {/* ── Git Timeline Track List ── */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredCommits.map((c, index) => {
          const isMerge = c.type === 'ORDER_FILLED';
          const isAI = c.branch === 'ai';
          const isDeposit = c.branch === 'main';

          return (
            <div
              key={c.id}
              onClick={() => {
                tradeSimAudio.playActionTone();
                setSelectedCommit(c);
              }}
              className="tactile-btn flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400/80 hover:shadow-lg transition cursor-pointer group"
            >
              {/* Branch Node Icon & Connector Line */}
              <div className="flex flex-col items-center pt-0.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center font-black text-[9px] shadow-sm ${
                    isMerge
                      ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : isAI
                      ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      : 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  }`}
                >
                  {isMerge ? <GitMerge className="w-3 h-3" /> : isAI ? <Bot className="w-3 h-3" /> : <GitCommit className="w-3 h-3" />}
                </div>
                {index < filteredCommits.length - 1 && (
                  <div
                    className={`w-0.5 h-10 my-1 ${
                      isMerge
                        ? 'bg-cyan-500/30'
                        : isAI
                        ? 'bg-purple-500/30'
                        : 'bg-emerald-500/30'
                    }`}
                  />
                )}
              </div>

              {/* Commit Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded bg-white/10 text-cyan-300 font-bold text-[11px] font-mono">
                    commit {c.hash}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                      isMerge
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : isAI
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {c.acidStatus}
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px]">{c.timestamp}</span>
                </div>

                <div className="text-xs font-extrabold text-[var(--text-main)] group-hover:text-cyan-300 transition mt-1 truncate">
                  {c.title}
                </div>

                <div className="text-[11px] text-[var(--text-dim)] mt-0.5 line-clamp-1">
                  {c.desc}
                </div>

                {/* Financial Metrics Strip */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-dim)] mt-1.5 pt-1 border-t border-white/[0.04]">
                  {c.total && (
                    <span>
                      Total: <strong className="text-white">Rp {Math.round(c.total).toLocaleString('id-ID')}</strong>
                    </span>
                  )}
                  {c.broker && (
                    <span>
                      Broker: <strong className="text-zinc-300">{c.broker}</strong>
                    </span>
                  )}
                  {c.pnl && (
                    <span className="text-emerald-400 font-bold">
                      Unrealized: +Rp {Math.round(c.pnl).toLocaleString('id-ID')} ({c.pnlPercent}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Inspect Arrow */}
              <div className="text-right shrink-0 pt-1">
                <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 inline-flex items-center gap-1 transition">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Inspector Modal Drawer ── */}
      {selectedCommit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-extrabold text-white text-sm">
                  ACID COMMIT INSPECTOR [{selectedCommit.hash}]
                </span>
              </div>
              <button
                onClick={() => {
                  tradeSimAudio.playActionTone();
                  setSelectedCommit(null);
                }}
                className="text-zinc-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Commit Headline</span>
                <span className="text-sm font-extrabold text-white">{selectedCommit.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/40 border border-white/5">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Aktor Eksekusi</span>
                  <span className="font-bold text-cyan-400">{selectedCommit.actor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Cabang Git</span>
                  <span className="font-bold text-purple-400">branch: {selectedCommit.branch}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Waktu Transaksi</span>
                  <span className="font-bold text-zinc-200">{selectedCommit.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">ACID Consensus</span>
                  <span className="font-bold text-emerald-400">{selectedCommit.acidStatus}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-bold">Catatan Audit Trail</span>
                <p className="text-zinc-300 leading-relaxed mt-0.5">{selectedCommit.desc}</p>
              </div>

              {selectedCommit.total && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-zinc-400 font-bold">Total Nilai Transaksi:</span>
                  <strong className="text-emerald-400 text-sm">
                    Rp {Math.round(selectedCommit.total).toLocaleString('id-ID')}
                  </strong>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                tradeSimAudio.playActionTone();
                setSelectedCommit(null);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md transition"
            >
              Tutup Audit Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
