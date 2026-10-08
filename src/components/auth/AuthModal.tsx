'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithOAuth,
    loginAsGuest,
    isLoading,
    authError,
    isConfigured,
  } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sinkronkan mode saat defaultMode atau modal dibuka ulang
  React.useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setSuccessMsg(null);
      setLocalError(null);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setLocalError(null);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        setSuccessMsg('Login berhasil! Selamat datang kembali.');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setLocalError(res.error || 'Login gagal, periksa email dan password Anda.');
      }
    } else {
      const res = await registerWithEmail(email, password, fullName);
      if (res.success) {
        setSuccessMsg('Pendaftaran berhasil! Akun dan modal awal portofolio Rp 100 Juta telah aktif.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setLocalError(res.error || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    }
  };

  const handleOAuth = async (provider: 'apple' | 'facebook' | 'google') => {
    const res = await loginWithOAuth(provider);
    if (res.success && !isConfigured) {
      setSuccessMsg(`Login ${provider.toUpperCase()} mode demo berhasil!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-black text-sm">
              TS
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                TradingSims Member Area
              </h3>
              <p className="text-[11px] text-zinc-400">
                Simpan portofolio &amp; saldo kas Anda di cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Status Message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {(authError || localError) && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex flex-col gap-1.5 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{localError || authError}</span>
              </div>
              {(localError || authError)?.includes('belum terdaftar') && mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    setMode('register');
                  }}
                  className="text-amber-400 hover:underline text-left font-bold text-[11px] ml-6 cursor-pointer"
                >
                  👉 Klik di sini untuk mendaftar akun &quot;{email}&quot; sekarang &rarr;
                </button>
              )}
              {(localError || authError)?.includes('sudah terdaftar') && mode === 'register' && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    setMode('login');
                  }}
                  className="text-amber-400 hover:underline text-left font-bold text-[11px] ml-6 cursor-pointer"
                >
                  👉 Klik di sini untuk langsung Masuk (Login) &rarr;
                </button>
              )}
            </div>
          )}

          {/* Banner 100% Gratis */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold block text-white">Akun Member 100% Gratis</span>
                <span className="text-[10px] text-amber-200/80">
                  Daftar instan tanpa biaya · Otomatis dapat modal simulasi Rp 100.000.000
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-emerald-500 text-black px-2 py-0.5 rounded font-black shrink-0">
              GRATIS
            </span>
          </div>


          {/* Tab Mode: Masuk vs Daftar */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
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
              onClick={() => setMode('register')}
              className={`py-2 rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div>
                <label className="text-zinc-400 block mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
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
                  placeholder="budi@gmail.com"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang (Modal Rp 100Jt)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Tamu Demo */}
          <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Mau eksplorasi tanpa login?</span>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              Masuk sebagai Tamu &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
