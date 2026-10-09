'use client';

import React from 'react';
import {
  BookOpen,
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  X,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { PostMortemEntry } from '@/lib/hedgefund/autonomousEcosystemSchema';

interface PostMortemVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: PostMortemEntry[];
  activeEntry: PostMortemEntry | null;
  onSelectEntry: (entry: PostMortemEntry) => void;
}

export default function PostMortemVaultModal({
  isOpen,
  onClose,
  entries,
  activeEntry,
  onSelectEntry,
}: PostMortemVaultModalProps) {
  if (!isOpen) return null;

  const current = activeEntry || entries[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0e17] border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.15)] flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>HALL OF POST-MORTEMS &amp; MEMORY VAULT</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono">
                  {entries.length} Catatan Refleksi
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Arsip Pembelajaran Agen &amp; Adaptasi Aturan Otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Sidebar + Main Detail */}
        <div className="flex flex-1 overflow-hidden divide-x divide-slate-800">
          {/* Entries List */}
          <div className="w-64 overflow-y-auto p-3 space-y-2 bg-slate-950/60 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase font-bold px-2 py-1">
              Daftar Insiden SL / Drawdown
            </div>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Belum ada insiden stop loss yang tercatat.
              </div>
            ) : (
              entries.map((item) => {
                const isSelected = current?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectEntry(item)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-cyan-500/60 bg-cyan-950/30 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-200">{item.symbol}</span>
                      <span className="text-[10px] text-rose-400 font-semibold">
                        -{item.lossPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.agentName}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active Detail Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {current ? (
              <>
                {/* Incident Summary Card */}
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Aset &amp; Agen Bertanggung Jawab
                    </span>
                    <div className="text-base font-bold text-slate-100 font-mono mt-0.5 flex items-center gap-2">
                      <span className="text-cyan-400">{current.symbol}</span>
                      <span className="text-xs text-slate-400">· {current.agentName}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 uppercase block">Realisasi Kerugian</span>
                    <span className="text-sm font-bold text-rose-400">
                      -${Math.abs(Math.round(current.lossUsd)).toLocaleString()} (-{current.lossPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Root Cause Diagnostics */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Investigasi Akar Masalah (Root Cause Diagnostic)
                  </span>
                  <p className="text-slate-200 text-xs font-medium leading-relaxed font-sans">
                    {current.rootCause}
                  </p>
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300 font-mono text-[11px]">
                    <strong>Cognitive Blindspot:</strong> {current.cognitiveBlindSpot}
                  </div>
                </div>

                {/* RAG Vector Store Commit */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Database className="w-3.5 h-3.5" />
                      Pembaruan Vektor RAG (Committed to SQLite Episodic Store)
                    </span>
                    <span className="text-[10px] text-slate-500">{current.vectorEmbeddingId}</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {current.lessonsLearned.map((lesson, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 select-none">❯</span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Parameter Weight Modulation */}
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    Modulasi Bobot Parameter Aturan (Rule Adaptation Matrix)
                  </span>
                  <div className="space-y-2">
                    {current.ruleModulation.map((mod, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="text-slate-200 font-bold block">{mod.parameter}</span>
                          <span className="text-[10px] text-slate-400">{mod.adjustmentReason}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 line-through">
                            {mod.beforeValue}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                          <span className="px-2 py-1 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
                            {mod.afterValue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500 font-mono text-xs">
                Pilih insiden untuk melihat analisis post-mortem.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
