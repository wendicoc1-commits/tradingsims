'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  User,
  LogOut,
  Terminal
} from 'lucide-react';

interface AdminAuthContextType {
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminLogoutButton({ className }: { className?: string }) {
  const { logout } = useAdminAuth();
  return (
    <button
      type="button"
      onClick={logout}
      className={className || "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold transition cursor-pointer"}
      title="Keluar dari sesi administrator"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Keluar Admin</span>
    </button>
  );
}

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedAuth = sessionStorage.getItem('tradesim_admin_auth');
        if (savedAuth === 'true') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const cleanUser = username.trim();
    const cleanPass = password;

    // Kredensial khusus administrator: admin | Aa240200
    if ((cleanUser === 'admin' || cleanUser === 'admin@tradesim.id') && cleanPass === 'Aa240200') {
      try {
        sessionStorage.setItem('tradesim_admin_auth', 'true');
        document.cookie = 'tradesim_admin_auth=true; path=/admin; max-age=86400';
      } catch {}
      setIsAuthenticated(true);
      setErrorMsg(null);
    } else {
      setErrorMsg('Kredensial tidak valid: Username atau password salah!');
    }

    setIsSubmitting(false);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('tradesim_admin_auth');
      document.cookie = 'tradesim_admin_auth=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}
    setIsAuthenticated(false);
    setPassword('');
    setErrorMsg(null);
  };

  // State awal saat membaca session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Memverifikasi Sesi Administrator...</span>
        </div>
      </div>
    );
  }

  // Jika belum login, tampilkan Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden select-none">
        {/* Latar belakang grid aksen cyber */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Card Login Admin */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/5">
            {/* Logo & Header */}
            <div className="text-center mb-6">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center text-neutral-950 shadow-lg shadow-emerald-500/25 mb-3">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center justify-center gap-2">
                TRADESIM PRO <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-bold">ADMIN GATE</span>
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Area Terbatas: Masukkan kredensial administrator
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-mono">
                  USERNAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-neutral-600 outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-mono">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password admin"
                    autoFocus
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-neutral-600 outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk ke Panel Admin</span>
              </button>
            </form>

            {/* Back link */}
            <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Trading App</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika terautentikasi, render panel admin dengan context logout
  return (
    <AdminAuthContext.Provider value={{ logout: handleLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
