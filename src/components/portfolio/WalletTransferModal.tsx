'use client';

import React, { useState } from 'react';
import { usePortfolioStore } from '@/store';
import { 
  ArrowRightLeft, 
  Bot, 
  Wallet, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletTransferModal({ isOpen, onClose }: WalletTransferModalProps) {
  const cash = usePortfolioStore((s) => s.cash);
  const aiCash = usePortfolioStore((s) => s.aiCash || 0);
  const transferToAiWallet = usePortfolioStore((s) => s.transferToAiWallet);
  const transferFromAiWallet = usePortfolioStore((s) => s.transferFromAiWallet);

  const [direction, setDirection] = useState<'TO_AI' | 'FROM_AI'>('TO_AI');
  const [nominalStr, setNominalStr] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const maxAvailable = direction === 'TO_AI' ? cash : aiCash;
  const nominalNum = parseFloat(nominalStr.replace(/\D/g, '')) || 0;

  const handleQuickPreset = (value: number) => {
    const clamped = Math.min(value, maxAvailable);
    setNominalStr(clamped.toLocaleString('id-ID'));
  };

  const handlePercentagePreset = (pct: number) => {
    const val = Math.floor(maxAvailable * (pct / 100));
    setNominalStr(val.toLocaleString('id-ID'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setNominalStr('');
      return;
    }
    const num = parseInt(raw, 10);
    setNominalStr(num.toLocaleString('id-ID'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nominalNum <= 0) {
      toast.error('Masukkan nominal transfer yang valid.');
      return;
    }
    if (nominalNum > maxAvailable) {
      toast.error(
        direction === 'TO_AI'
          ? 'Saldo kas Dompet Utama tidak mencukupi.'
          : 'Saldo kas Dompet AI Bot tidak mencukupi.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (direction === 'TO_AI') {
        const res = transferToAiWallet(nominalNum);
        if (res.success) {
          toast.success(
            `⚡ Berhasil Alokasi Modal: Rp ${nominalNum.toLocaleString('id-ID')} ke Dompet AI Bot!`,
            { description: 'Agen AI kini memiliki modal resmi untuk menjalankan strategi kuantitatif.' }
          );
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
          import('@/lib/tradeSimAudio').then(({ tradeSimAudio }) => tradeSimAudio.playOrderFilledChime()).catch(() => {});
          setNominalStr('');
          onClose();
        } else {
          toast.error(res.error || 'Gagal melakukan alokasi dana.');
        }
      } else {
        const res = transferFromAiWallet(nominalNum);
        if (res.success) {
          toast.success(
            `💰 Berhasil Tarik Modal: Rp ${nominalNum.toLocaleString('id-ID')} ke Dompet Utama!`,
            { description: 'Dana aman dan siap digunakan untuk trading manual Anda.' }
          );
          confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
          import('@/lib/tradeSimAudio').then(({ tradeSimAudio }) => tradeSimAudio.playOrderFilledChime()).catch(() => {});
          setNominalStr('');
          onClose();
        } else {
          toast.error(res.error || 'Gagal melakukan penarikan dana.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#27272a] bg-[#121216]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Alokasi Modal &amp; Pindah Dana</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Sub-Account
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Pisahkan modal trading manual vs modal bot AI secara independen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Dual Balance Cards Preview */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Dompet Utama */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              direction === 'TO_AI' 
                ? 'bg-zinc-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/20' 
                : 'bg-zinc-950/40 border-zinc-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  Dompet Manual
                </span>
                {direction === 'TO_AI' && (
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">Sumber</span>
                )}
              </div>
              <div className="text-lg font-bold text-white font-mono tracking-tight truncate">
                Rp {cash.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Khusus trading tangan Anda
              </div>
            </div>

            {/* Card 2: Dompet AI Bot */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              direction === 'FROM_AI' 
                ? 'bg-zinc-900/90 border-amber-500/50 shadow-md shadow-amber-950/20' 
                : 'bg-zinc-950/40 border-zinc-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  Dompet AI Bot
                </span>
                {direction === 'FROM_AI' && (
                  <span className="text-[10px] text-amber-400 font-mono font-bold">Sumber</span>
                )}
              </div>
              <div className="text-lg font-bold text-[#f59e0b] font-mono tracking-tight truncate">
                Rp {aiCash.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Plafon risiko otonom bot
              </div>
            </div>
          </div>

          {/* Direction Switcher Button */}
          <div className="flex items-center justify-center -my-1">
            <button
              type="button"
              onClick={() => {
                setDirection(direction === 'TO_AI' ? 'FROM_AI' : 'TO_AI');
                setNominalStr('');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white border border-zinc-700 transition shadow-sm cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {direction === 'TO_AI' ? 'Utama ➡️ Dompet AI Bot' : 'Dompet AI Bot ➡️ Utama'}
              </span>
              <span className="text-[10px] text-zinc-500">(Klik untuk Tukar Arah)</span>
            </button>
          </div>

          {/* Input Nominal Field */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-zinc-300">
                Nominal Transfer ({direction === 'TO_AI' ? 'Alokasi ke Bot' : 'Tarik ke Utama'})
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                Tersedia: Rp {maxAvailable.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                Rp
              </span>
              <input
                type="text"
                value={nominalStr}
                onChange={handleInputChange}
                placeholder="Contoh: 10.000.000"
                className="w-full pl-11 pr-4 py-2.5 bg-black/60 border border-[#27272a] rounded-xl text-base font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleQuickPreset(5_000_000)}
              className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white transition"
            >
              5 Juta
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(10_000_000)}
              className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white transition"
            >
              10 Juta
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(25_000_000)}
              className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-300 hover:text-white transition"
            >
              25 Juta
            </button>
            <button
              type="button"
              onClick={() => handlePercentagePreset(50)}
              className="py-1.5 px-2 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/40 rounded-lg text-[11px] font-mono text-cyan-300 font-bold transition"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => handlePercentagePreset(100)}
              className="py-1.5 px-2 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-800/40 rounded-lg text-[11px] font-mono text-amber-300 font-bold transition"
            >
              100% Max
            </button>
          </div>

          {/* Institutional Security Notice */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex items-start gap-2.5 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-zinc-200">Kontrol Risiko Maksimal:</strong> Dana di Dompet AI Bot adalah batas plafon mutlak bagi agen otomatis (Jesse Livermore &amp; Hedge Fund Desk). Saldo di Dompet Utama Anda <strong>100% terlindungi dan tidak akan pernah disentuh bot</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || nominalNum <= 0 || nominalNum > maxAvailable}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span>Konfirmasi Pindah Dana</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
