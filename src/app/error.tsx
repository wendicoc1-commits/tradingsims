'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[TradeSims Global Error Boundary Captured]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-200 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-zinc-950/90 p-6 shadow-2xl backdrop-blur-xl space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">
            Sistem Mengisolasi Kendala Rendering
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Terjadi pengecualian runtime saat memuat tampilan ini. Data akun dan portofolio Anda tetap aman.
            {error?.message ? ` (${error.message.slice(0, 100)})` : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black transition hover:bg-amber-400 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Muat Ulang Halaman</span>
          </button>

          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="border-t border-zinc-800/80 pt-4 text-[11px] text-zinc-500 font-mono">
          TradeSims Pro High-Availability Autonomous Platform
        </div>
      </div>
    </div>
  );
}
