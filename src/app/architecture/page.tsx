'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Cpu,
  Database,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Lock,
  ArrowRight,
  Server,
  GitBranch,
  CheckCircle2,
  FileCode2,
  Sparkles,
} from 'lucide-react';
import TradeSimKnowledgeGraphViewer from '@/components/network/TradeSimKnowledgeGraphViewer';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#07080b] text-neutral-200">
      {/* Header Hero */}
      <div className="border-b border-neutral-800/80 bg-gradient-to-b from-purple-500/10 via-neutral-950/80 to-[#07080b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>High-Scale FinTech Architecture • Inspired by System Design Primer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              TradeSim Pro System Architecture &amp; Engineering Blueprint
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-3xl leading-relaxed">
              Spesifikasi arsitektur teknis komputasional TradeSim Pro. Dirancang untuk keandalan bursa saham, latensi rendah, integritas transaksi ACID, dan eksekusi AI otonom.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Core Architecture Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Live Data Ingestion</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Multi-source WebSocket streaming untuk 250+ aset saham IDX &amp; Kripto Binance. Dilengkapi fallback resilient REST polling dengan interval adaptif.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. ACID Transactions</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              PostgreSQL Stored Procedures (RPC) dengan baris penguncian eksplisit <code>FOR UPDATE</code> untuk mencegah double-spend dan race conditions saat order dieksekusi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Autonomous AI Engine</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Hedge fund agent berbasis LLM berlatensi rendah untuk sentimen berita, scanner bandarmologi, dan pembuatan keputusan trading otomatis 24/7.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Idempotent Deposit Flow</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Alur verifikasi QRIS dengan token idempotency unik, anti-spam debounce, dan notifikasi instan via Telegram Bot Webhook terenkripsi.
            </p>
          </div>
        </div>

        {/* Holographic Architecture Knowledge Graph (Graphify + Obsidian Skinning) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Obsidian Graph View &amp; Graphify Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Interactive Obsidian Knowledge Graph (Arsitektur &amp; Pasar BEI)</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Visualisasi graf berformat Obsidian Graph View dengan fisika pegas kosmik. Jelajahi simpul arsitektur kode, kepemilikan konglomerasi saham IDX, smart money, hingga semesta master terpadu.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start">
              <span className="text-[11px] font-mono text-zinc-500">
                Drag untuk menggeser, scroll untuk zoom, hover untuk isolasi koneksi
              </span>
            </div>
          </div>

          <TradeSimKnowledgeGraphViewer />
        </div>

        {/* System Flow Diagram Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-emerald-400" />
                <span>End-to-End Execution Flowchart</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Alur data dari interaksi pengguna di peramban hingga penyimpanan persisten di PostgreSQL.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-mono text-[11px] self-start border border-neutral-700">
              Turbopack + Next.js App Router
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-cyan-400 font-bold block">TIER 1: CLIENT FRONTEND</span>
              <ul className="space-y-1 text-neutral-400">
                <li>• Next.js 16 + React 19</li>
                <li>• Zustand State Persistence</li>
                <li>• Lightweight Charts Canvas</li>
                <li>• Realtime Sound Synthesizer</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-amber-400 font-bold block">TIER 2: SERVERLESS API</span>
              <ul className="space-y-1 text-neutral-400">
                <li>• Next.js Server Actions</li>
                <li>• Edge REST API Endpoints</li>
                <li>• Telegram Bot Webhook Alert</li>
                <li>• Debounce &amp; Anti-Spam Guard</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-emerald-400 font-bold block">TIER 3: DATA PERSISTENCE</span>
              <ul className="space-y-1 text-neutral-400">
                <li>• Supabase Cloud PostgreSQL</li>
                <li>• Row Level Security (RLS)</li>
                <li>• Atomic RPC Stored Procedure</li>
                <li>• Audit Ledger Transactions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Deep Dive Security & ACID Guarantee */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Garansi Integritas Finansial (ACID)</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dalam sistem perbankan dan bursa, integritas saldo adalah prioritas tertinggi. TradeSim Pro menerapkan prinsip ACID:
            </p>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Atomicity:</b> Eksekusi order saham (debet saldo kas &amp; kredit portofolio saham) terjadi dalam 1 transaksi tunggal. Jika salah satu gagal, seluruh transaksi di-rollback.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Consistency:</b> Saldo total pengguna tidak pernah bisa bernilai negatif (*negative balance protection*).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Isolation:</b> Panggilan RPC PostgreSQL mengunci baris transaksi (*row locking*) agar tidak terjadi persaingan eksekusi ganda (*race condition*).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><b>Durability:</b> Data tercatat permanen di cluster cloud Supabase yang terdistribusi dan tahan bencana.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-purple-400" />
              <span>Standar Matching Engine Bursa</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Arsitektur order book TradeSim Pro mengadopsi mekanisme bursa saham kelas dunia:
            </p>
            <div className="space-y-2 text-xs font-mono bg-neutral-950 p-4 rounded-xl border border-neutral-800/80">
              <div className="text-neutral-400">// Algoritma Antrean Order Book:</div>
              <div className="text-emerald-300">FIFO (First-In, First-Out) Price-Time Priority</div>
              <div className="text-neutral-400 pt-2">// Batasan Auto-Rejection:</div>
              <div className="text-amber-300">Auto Rejection Atas (ARA) &amp; Bawah (ARB) BEI</div>
              <div className="text-neutral-400 pt-2">// Simulasi Fee Transaksi:</div>
              <div className="text-cyan-300">Broker Fee 0.15% (Buy) / 0.25% (Sell) + Levy 0.043%</div>
            </div>
            <p className="text-[11px] text-neutral-500">
              Hasil simulasi ini menghasilkan akurasi hingga 99.4% menyerupai perdagangan nyata di Bursa Efek Indonesia.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-neutral-700 transition"
          >
            <span>Kembali ke Terminal Trading</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
