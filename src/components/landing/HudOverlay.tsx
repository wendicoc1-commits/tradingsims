'use client';

import React, { useState, useEffect } from 'react';

export default function HudOverlay() {
  const [timeStr, setTimeStr] = useState('');
  const [latency, setLatency] = useState(11);
  const [audioActive, setAudioActive] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    const latInterval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 4) + 9);
    }, 3000);
    return () => {
      clearInterval(interval);
      clearInterval(latInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 font-mono text-[11px] text-zinc-400 select-none">
      {/* ── 4 Corner Brackets (max.areebali style HUD) ── */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />

      {/* ── Top HUD Status Line (Hidden on mobile) ── */}
      <div className="hidden lg:flex items-center justify-between px-14 pt-3.5 tracking-wider">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">[SYS.TRADESIM_V5]</span>
          <span className="text-zinc-600">•</span>
          <span>FEED: NASDAQ/IDX/BINANCE</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">PING: {latency}ms</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-zinc-300">{timeStr}</span>
          <span className="text-zinc-600">•</span>
          <button
            type="button"
            onClick={() => setAudioActive(!audioActive)}
            className="pointer-events-auto flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/10 hover:border-emerald-400/50 bg-black/40 text-[10px] uppercase transition-colors cursor-pointer text-zinc-300 hover:text-emerald-300"
          >
            <span>AUDIO HUD</span>
            <span className="flex items-end gap-[2px] h-2.5">
              <span className={`w-[2px] bg-emerald-400 transition-all ${audioActive ? 'h-2.5 animate-pulse' : 'h-1'}`} />
              <span className={`w-[2px] bg-emerald-400 transition-all ${audioActive ? 'h-1.5 animate-pulse delay-75' : 'h-1.5'}`} />
              <span className={`w-[2px] bg-emerald-400 transition-all ${audioActive ? 'h-3 animate-pulse delay-150' : 'h-1'}`} />
            </span>
          </button>
        </div>
      </div>

      {/* ── Bottom HUD Status Line ── */}
      <div className="hidden lg:flex items-center justify-between px-14 pb-3.5 absolute bottom-0 left-0 right-0 tracking-wider">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">SECURE CHANNEL ACTIVE</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">ENCRYPTION: TLS 1.3 / CHACHA20</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-500">
          <span>COORDINATES: -6.2088° S, 106.8456° E</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">[PAGE 01/01]</span>
        </div>
      </div>
    </div>
  );
}
