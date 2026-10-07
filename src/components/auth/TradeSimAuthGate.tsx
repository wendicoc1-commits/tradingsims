'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Coins,
  LineChart,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function TradeSimAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loginWithEmail, registerWithEmail, enterGuestMode, isLoading, authError } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localMsg, setLocalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b] text-emerald-400 font-sans">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-mono tracking-wider">MEMUAT TRADESIM PRO WORKSTATION...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the full workstation
  if (user) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMsg(null);

    if (!email || !password) {
      setLocalMsg({ type: 'error', text: 'Email dan password wajib diisi.' });
      return;
    }

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        setLocalMsg({ type: 'success', text: 'Autentikasi berhasil! Mengalihkan ke workstation...' });
      } else {
        setLocalMsg({ type: 'error', text: res.error || 'Email atau password tidak cocok.' });
      }
    } else {
      if (!fullName) {
        setLocalMsg({ type: 'error', text: 'Nama lengkap wajib diisi untuk pendaftaran.' });
        return;
      }
      const res = await registerWithEmail(email, password, fullName);
      if (res.success) {
        setLocalMsg({
          type: 'success',
          text: 'Pendaftaran berhasil! Modal virtual Rp 100.000.000 telah masuk ke akun Anda.',
        });
      } else {
        setLocalMsg({ type: 'error', text: res.error || 'Pendaftaran gagal. Periksa format email Anda.' });
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100 font-sans select-none">
      {/* Background Subtle Modern FinTech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col w-full h-full justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-black px-2.5 py-1 rounded text-xs font-black tracking-wider flex items-center gap-1.5 shadow-sm">
              <LineChart className="w-4 h-4" />
              <span>TRADESIM PRO</span>
            </div>
            <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">
              INSTITUTIONAL TRADING WORKSTATION
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CLOUD GATEWAY READY</span>
          </div>
        </div>

        {/* Center Auth Card */}
        <div className="flex-1 flex items-center justify-center my-6">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {mode === 'login' ? 'Masuk ke TradeSim Pro' : 'Buat Akun Trader'}
              </h1>
              <p className="text-xs text-zinc-400 mt-1.5">
                {mode === 'login'
                  ? 'Akses portfolio live, order desk, dan data pasar terverifikasi.'
                  : 'Dapatkan modal virtual Rp 100.000.000 gratis untuk memulai simulasi.'}
              </p>
            </div>

            {/* Notification Banner */}
            {(localMsg || authError) && (
              <div
                className={`mb-5 p-3 rounded-lg text-xs flex items-start gap-2.5 border ${
                  localMsg?.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {localMsg?.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{localMsg?.text || authError}</span>
              </div>
            )}

            {/* Mode Switch Tabs */}
            <div className="flex border border-zinc-800 rounded-lg p-1 bg-zinc-900/60 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLocalMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                MASUK (LOGIN)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLocalMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                DAFTAR BARU (GRATIS)
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Raden Trader"
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'MASUK KE WORKSTATION' : 'BUAT AKUN & TERIMA RP 100 JUTA'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Guest Mode Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#121215] px-2 text-zinc-500">Atau Eksplorasi Langsung</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => enterGuestMode()}
              className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Coba Demo Instan (Mode Tamu)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-3">
          TradeSim Pro • Legal Simulator & FinTech Execution Engine • 100% Free & Open Architecture
        </div>
      </div>
    </div>
  );
}
