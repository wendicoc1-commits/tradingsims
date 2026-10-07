'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BandarmologiRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?preset=bandarDesk');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-mono text-center px-4">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full">
        <Users className="w-8 h-8 animate-pulse" />
      </div>
      <h2 className="text-lg font-bold text-white">
        Bandarmologi Telah Diintegrasikan ke Terminal Widget
      </h2>
      <p className="text-xs text-zinc-400 max-w-md">
        Analisis Smart Money &amp; Broker Summary kini dapat dipantau langsung bersamaan dengan Candlestick Chart, Orderbook, dan slip trading di Workstation Utama.
      </p>
      <div className="pt-2">
        <Link
          href="/?preset=bandarDesk"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400 transition-all"
        >
          <span>Buka Widget Bandarmologi</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
