'use client';

import React from 'react';
import { X, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Scale, Quote, Sparkles } from 'lucide-react';
import type { MungerInversionResult } from '@/lib/hedgefund/mungerInversionEngine';

interface MungerInversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MungerInversionResult;
  symbol: string;
}

export default function MungerInversionModal({
  isOpen,
  onClose,
  result,
  symbol,
}: MungerInversionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d1117] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white font-mono tracking-wide">
                  MUNGER INVERSION PROTOCOL — RED-TEAM PRE-MORTEM
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  {symbol}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Audit penantang keras untuk mencegah kesalahan investasi fatal (Invert, always invert).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Munger Maxim Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <Quote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-amber-200 italic font-sans text-xs leading-relaxed">
                {result.mungerMaxim}
              </p>
              <span className="text-[10px] text-amber-400/80 font-bold tracking-wider">
                — CHARLIE MUNGER (1924–2023)
              </span>
            </div>
          </div>

          {/* Verdict Score Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#12161f] border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">VERDICT AKHIR</span>
              <span
                className={`text-base font-black mt-1 ${
                  result.verdict === 'APPROVED'
                    ? 'text-emerald-400'
                    : result.verdict === 'CONDITIONAL'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {result.verdict === 'APPROVED' ? '✅ DISETUJUI' : result.verdict === 'CONDITIONAL' ? '⚠️ KONDISIONAL' : '🚫 DITOLAK (VETO)'}
              </span>
            </div>

            <div className="bg-[#12161f] border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">PRE-MORTEM RISK</span>
              <span className="text-base font-black mt-1 text-white">
                {result.preMortemRiskScore}/100
              </span>
              <span className="text-[10px] text-zinc-500">
                {result.preMortemRiskScore < 35 ? 'Risiko Rendah' : result.preMortemRiskScore < 65 ? 'Risiko Terukur' : 'Bahaya Ekstrem'}
              </span>
            </div>

            <div className="bg-[#12161f] border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">RISK/REWARD ASIMETRI</span>
              <span className="text-base font-black mt-1 text-cyan-400">
                {result.asymmetricUpsideRatio}:1
              </span>
              <span className="text-[10px] text-zinc-500">Minimum: 1.5:1</span>
            </div>
          </div>

          {/* Fatal Flaw / Veto Alert if present */}
          {result.vetoReason && (
            <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 text-xs block">VETO RED-TEAM DIAKTIFKAN:</span>
                <span className="text-rose-200 text-xs">{result.vetoReason}</span>
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              TEMUAN KRITIS RED-TEAM:
            </span>
            <div className="space-y-1.5">
              {result.inversionObservations.length > 0 ? (
                result.inversionObservations.map((obs, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 text-xs">
                    <span className="text-amber-400">•</span>
                    <span>{obs}</span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-zinc-500 italic">Tidak ada anomali negatif yang terdeteksi.</div>
              )}
            </div>
          </div>

          {/* Passed Checks */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              CHECKLIST PERTAHANAN LOLOS:
            </span>
            <div className="space-y-1.5">
              {result.passedChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mitigation Advice */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs">
            <span className="font-bold text-zinc-300 block mb-1">PANDUAN EKSEKUSI MUNGER:</span>
            <p className="text-zinc-400 font-sans">{result.mitigationAdvice}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-[#161b22] flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-mono">
            Autonomous-Company Architecture • Charlie Munger Inversion Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all font-mono"
          >
            Tutup Audit
          </button>
        </div>
      </div>
    </div>
  );
}
