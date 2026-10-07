'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Clock, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function StatusBar() {
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [timeWib, setTimeWib] = useState<string>('');
  const [latency, setLatency] = useState<number>(14);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
      // WIB = UTC+7
      const wibDate = new Date(now.getTime() + 7 * 3600 * 1000);
      setTimeWib(wibDate.toISOString().slice(11, 19) + ' WIB');
    };

    updateClocks();
    const clockInterval = setInterval(updateClocks, 1000);

    const latencyInterval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 8) + 11);
    }, 4000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(latencyInterval);
    };
  }, []);

  return (
    <footer
      className="h-6.5 shrink-0 border-t flex items-center justify-between px-3 text-[10px] font-mono select-none z-30"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
      }}
    >
      {/* Left: Software Version & Active Desk */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--accent)' }}>
          <Terminal className="w-3 h-3 text-amber-500" />
          <span>BLOOMBERG TERMINAL <span className="text-[9px] text-neutral-400 font-normal">v4.5.2</span></span>
        </div>

        <span className="text-neutral-700 hidden sm:inline">|</span>

        <div className="hidden sm:flex items-center gap-1 text-neutral-300">
          <span className="text-[9px] text-neutral-500 font-sans uppercase">DESK:</span>
          <span className="font-semibold text-amber-400">IDX EQUITY WORKSTATION</span>
        </div>

        <span className="text-neutral-700 hidden md:inline">|</span>

        <div className="hidden md:flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live" />
          <span>WS FEED: 252 IDX ASSETS CONNECTED</span>
        </div>
      </div>

      {/* Right: Latency, Memory, and Real-time Dual Clocks */}
      <div className="flex items-center gap-3 font-mono-num">
        <div className="hidden lg:flex items-center gap-1">
          <Cpu className="w-2.5 h-2.5 text-neutral-500" />
          <span>MEM: 154 MB</span>
        </div>

        <div className="flex items-center gap-1">
          <Wifi className="w-2.5 h-2.5 text-emerald-500" />
          <span suppressHydrationWarning className="text-emerald-400 font-medium">{latency}ms</span>
        </div>

        <span className="text-neutral-700 hidden sm:inline">|</span>

        <div className="flex items-center gap-2">
          <span suppressHydrationWarning className="text-neutral-300 font-medium">{timeWib}</span>
          <span suppressHydrationWarning className="text-neutral-500 hidden sm:inline">({timeUtc})</span>
        </div>

        <div className="flex items-center gap-1 pl-1">
          <span className="px-1.5 py-0.2 rounded font-bold text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ● READY
          </span>
        </div>
      </div>
    </footer>
  );
}
