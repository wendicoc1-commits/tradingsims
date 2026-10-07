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
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function BloombergAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loginWithEmail, registerWithEmail, isLoading, authError } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localMsg, setLocalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or first client hydration, render placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-amber-500 font-mono">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs tracking-wider">MEMUAT SISTEM KEAMANAN TERMINAL...</span>
        </div>
      </div>
    );
  }

  // If user is logged in, show the full dashboard & application
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
        setLocalMsg({ type: 'success', text: 'Autentikasi berhasil! Membuka Terminal Workstation...' });
      } else {
        setLocalMsg({ type: 'error', text: res.error || 'Email atau kata sandi tidak cocok. Silakan coba lagi.' });
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
          text: 'Pendaftaran berhasil! Modal awal Rp 100.000.000 telah masuk ke portofolio Anda.',
        });
      } else {
        setLocalMsg({ type: 'error', text: res.error || 'Pendaftaran gagal. Periksa format email Anda.' });
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070709] text-zinc-100 font-mono select-none">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2315_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2315_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Auth Container */}
      <div className="relative z-10 flex flex-col w-full h-full justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500 text-black px-2 py-0.5 rounded text-xs font-black tracking-widest">
              FINCEPT
            </span>
            <span className="text-xs font-bold text-amber-400 tracking-wider hidden sm:inline">
              BLOOMBERG PROFESSIONAL SERVICE
            </span>
            <span className="text-[10px] text-zinc-500 hidden md:inline">
              SECURE WORKSTATION TERMINAL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider">
              AKSES TERKUNCI // HARUS LOGIN
            </span>
          </div>
        </div>

        {/* Center Auth Gate Box */}
        <div className="my-auto py-6 flex justify-center">
          <div className="w-full max-w-md bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Terminal Icon & Title */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                Portal Masuk Terminal
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Silakan masuk atau buat akun baru untuk mengakses data pasar, bot trading, dan portofolio.
              </p>
            </div>

            {/* Banner Saldo 100 Juta */}
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold block text-white">Modal Simulasi Rp 100.000.000</span>
                  <span className="text-[10px] text-amber-200/80">
                    Setiap akun baru otomatis mendapatkan modal kas RDN
                  </span>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500 text-black px-2 py-0.5 rounded font-black shrink-0">
                100% GRATIS
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLocalMsg(null);
                }}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLocalMsg(null);
                }}
                className={`py-2 rounded-lg transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {/* Notification Alert */}
            {localMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 border ${
                  localMsg.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}
              >
                {localMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{localMsg.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'register' && (
                <div>
                  <label className="text-zinc-400 block mb-1">Nama Lengkap Member</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-zinc-400 block mb-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Kata Sandi (Password)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>MEMPROSES VERIFIKASI...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'MASUK KE TERMINAL <GO>' : 'DAFTAR & KLAIM RP 100JT <GO>'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-900 pt-3 text-[10px] text-zinc-600 gap-2">
          <span>&copy; {new Date().getFullYear()} FINCEPT BLOOMBERG TERMINAL &bull; TRADINGSIMS WORKSTATION</span>
          <span className="flex items-center gap-1 text-emerald-500/80">
            <ShieldCheck className="w-3.5 h-3.5" />
            TERENKRIPSI AMAN &bull; POSTGRESQL CLOUD DATABASE
          </span>
        </div>
      </div>
    </div>
  );
}
