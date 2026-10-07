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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        setSuccessMsg('Login berhasil! Selamat datang kembali.');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } else {
      const res = await registerWithEmail(email, password, fullName);
      if (res.success) {
        setSuccessMsg('Pendaftaran berhasil! Akun dan modal awal portofolio Rp 100 Juta telah aktif.');
        setTimeout(() => {
          onClose();
        }, 1500);
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

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="space-y-2">
            {/* Apple ID Login */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuth('apple')}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {/* Apple Icon SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.8-11.72-14.28-5.77-9.03-10.28-19.53-13.53-31.5-3.26-11.97-4.89-23.4-4.89-34.3 0-14.36 3.59-26.31 10.77-35.84 7.18-9.53 16.48-14.39 27.9-14.59 5.22 0 10.99 1.41 17.3 4.24 6.32 2.83 10.42 4.34 12.31 4.54 1.41-.1 5.76-1.66 13.06-4.68 7.3-3.01 13.43-4.33 18.39-3.96 13.72.77 24.64 5.73 32.75 14.88-12.01 7.29-17.89 17.26-17.65 29.93.24 9.94 4.08 18.23 11.51 24.87 7.43 6.64 16.4 10.45 26.91 11.44-2.18 6.53-4.84 13.48-7.98 20.85zm-43.14-118.8c0 7.34-2.73 14.27-8.19 20.78-5.46 6.51-12.09 10.59-19.89 12.24-.13-1.09-.2-2.09-.2-3 0-7.39 2.87-14.61 8.6-21.67 5.74-7.06 12.65-11.23 20.74-12.51.13 1.37.19 2.76.19 4.16z" />
              </svg>
              <span>Lanjutkan dengan Apple ID</span>
            </button>

            {/* Facebook Login */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuth('facebook')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {/* Facebook Icon SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Lanjutkan dengan Facebook</span>
            </button>

            {/* Google Login */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuth('google')}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-50"
            >
              {/* Google Icon SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-950 px-3 text-[10px] uppercase font-bold text-zinc-500">
              atau via email
            </span>
            <div className="border-t border-zinc-800 w-full" />
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
