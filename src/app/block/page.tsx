'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BlockTradesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/stream?tab=block');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] font-mono text-xs text-zinc-400">
      Mengalihkan ke Tab Transaksi Nego di Berita &amp; Wire Pasar...
    </div>
  );
}
