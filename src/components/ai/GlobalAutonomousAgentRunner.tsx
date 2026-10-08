'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bot, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { useAIAgentStore } from '@/store/aiAgentStore';
import { runAutonomousAgentCycle } from '@/lib/hedgefund/autonomousTradingEngine';
import { UNIVERSE_TICKERS } from '@/lib/hedgefund/autonomousStockPicker';
import { tradeSimAudio } from '@/lib/tradeSimAudio';

/**
 * GlobalAutonomousAgentRunner
 * 
 * Background supervisor yang berjalan di seluruh halaman website:
 * Memastikan AI Agent tetap memindai Alpha, melindungi keuntungan (Take Profit),
 * memotong kerugian (Stop Loss), dan mengeksekusi rotasi modal meskipun pengguna
 * TIDAK sedang membuka halaman AI Trading Floor (/ai).
 */
export default function GlobalAutonomousAgentRunner() {
  const pathname = usePathname();
  const { autoTradingEnabled, setAutoTradingEnabled } = useAIAgentStore();
  const [toastNotification, setToastNotification] = useState<{ id: string; message: string; type: 'trade' | 'info' } | null>(null);
  const isExecutingRef = useRef(false);

  useEffect(() => {
    // Jika auto-trading dinonaktifkan pengguna, jangan jalankan background loop
    if (!autoTradingEnabled) return;

    const runCycle = async () => {
      if (isExecutingRef.current) return;
      isExecutingRef.current = true;

      try {
        // 1. Ambil berita pasar terbaru dari crawler
        let news = [];
        try {
          const nRes = await fetch('/api/crawler/news?limit=20', { cache: 'no-store' });
          const nData = await nRes.json();
          if (nData?.success && Array.isArray(nData.articles)) {
            news = nData.articles;
          }
        } catch {
          // Fallback jika crawler offline
        }

        // 2. Ambil kuotasi harga realtime untuk semesta saham & kripto
        let liveQuotesMap: Record<string, any> = {};
        try {
          const tickersParam = UNIVERSE_TICKERS.join(',');
          const qRes = await fetch(`/api/stocks/realtime?tickers=${encodeURIComponent(tickersParam)}`, { cache: 'no-store' });
          const qData = await qRes.json();
          if (qData?.quotes) {
            liveQuotesMap = qData.quotes;
          }
        } catch {
          // Fallback kuotasi
        }

        // 3. Eksekusi siklus otonom penuh (TP/SL, Sizing, OODA GPT-4o, dan Buy Alpha Pick)
        const cycleResult = await runAutonomousAgentCycle(news, liveQuotesMap, { skipEquityBuy: false });

        if (cycleResult.tradeExecuted && cycleResult.actionTaken) {
          tradeSimAudio.playOrderFilledChime();
          setToastNotification({
            id: `toast-${Date.now()}`,
            message: cycleResult.actionTaken,
            type: 'trade',
          });
        }
      } catch (err) {
        console.error('[GlobalAutonomousAgentRunner] Siklus gagal:', err);
      } finally {
        isExecutingRef.current = false;
      }
    };

    // Jalankan pertama kali setelah delay 1.5 detik
    const initialTimer = setTimeout(runCycle, 1500);

    // Jalankan siklus berkala setiap 15 detik
    const intervalTimer = setInterval(runCycle, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [autoTradingEnabled]);

  // Auto-dismiss toast setelah 8 detik
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  return (
    <>
      {/* Toast Notifikasi Eksekusi AI Background */}
      {toastNotification && (
        <div className="fixed bottom-10 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="bg-[#0b0e14] border border-amber-500/40 rounded-xl p-3.5 shadow-2xl shadow-amber-500/10 text-white flex items-start gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold font-mono tracking-wide text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI AGENT OTONOM (BACKGROUND)
                </span>
                <button
                  onClick={() => setToastNotification(null)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-zinc-200 mt-1 font-sans leading-relaxed">
                {toastNotification.message}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Link
                  href="/portfolio"
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                >
                  Lihat Portofolio →
                </Link>
                <Link
                  href="/ai"
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Buka AI Floor
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
