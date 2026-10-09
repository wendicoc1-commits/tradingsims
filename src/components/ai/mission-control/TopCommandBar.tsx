'use client'

import React from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  Pause,
  Play,
  Zap,
  Cpu,
  Layers,
  Activity,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Terminal,
  RefreshCw
} from 'lucide-react'
import {
  useMissionControlBridgeStore,
  type EnvironmentMode
} from '@/store/useMissionControlBridgeStore'

export default function TopCommandBar() {
  const {
    environment,
    setEnvironment,
    isGlobalPaused,
    toggleGlobalPause,
    throughput,
    leftPanelOpen,
    rightPanelOpen,
    bottomDrawerOpen,
    togglePanel,
    isFullscreen,
    toggleFullscreen
  } = useMissionControlBridgeStore()

  const environments: EnvironmentMode[] = ['PRODUCTION', 'STAGING', 'PAPER_SIM']

  return (
    <header className="h-14 bg-[#09090b] border-b border-[#27272a] px-3 md:px-4 flex items-center justify-between gap-3 text-xs font-mono select-none shrink-0 z-30">
      {/* ── Brand & Fleet Status ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shadow-sm shadow-amber-500/20">
            ⚡
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs tracking-wider">
                FINCEPT AI MISSION CONTROL
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                ORCHESTRATOR v4.8
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Autonomous Swarm &amp; Spatial Trading Floor
            </div>
          </div>
        </div>

        {/* Global Pause Circuit Breaker */}
        <button
          onClick={toggleGlobalPause}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
            isGlobalPaused
              ? 'bg-red-950/80 hover:bg-red-900 border-red-500/60 text-red-200 animate-pulse'
              : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/40 text-emerald-300'
          }`}
          title={isGlobalPaused ? 'Klik untuk Melanjutkan AI Swarm' : 'Klik untuk Membekukan Semua Agen'}
        >
          {isGlobalPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>RESUME SWARM</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>FREEZE FLEET</span>
            </>
          )}
        </button>
      </div>

      {/* ── Center: Real-Time Telemetry Metrics HUD ── */}
      <div className="hidden lg:flex items-center gap-2 text-[11px]">
        {/* Tokens / Sec */}
        <div className="px-2.5 py-1 rounded bg-[#121215] border border-[#27272a] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-400">THROUGHPUT:</span>
          <span className="text-white font-bold">{throughput.tokensPerSec.toLocaleString()} tok/s</span>
        </div>

        {/* Active Fleet */}
        <div className="px-2.5 py-1 rounded bg-[#121215] border border-[#27272a] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-400">FLEET:</span>
          <span className="text-emerald-300 font-bold">{throughput.activeAgentsCount}/50 ONLINE</span>
        </div>

        {/* Latency */}
        <div className="px-2.5 py-1 rounded bg-[#121215] border border-[#27272a] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-400">INFERENCE:</span>
          <span className="text-cyan-300 font-bold">{throughput.modelLatencyMs}ms</span>
        </div>

        {/* GPU Load */}
        <div className="px-2.5 py-1 rounded bg-[#121215] border border-[#27272a] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-zinc-400">GPU VRAM:</span>
          <span className="text-purple-300 font-bold">{throughput.gpuLoadPct}%</span>
        </div>
      </div>

      {/* ── Right: Environment Switcher & Panel Docking Toggles ── */}
      <div className="flex items-center gap-2">
        {/* Environment Switcher */}
        <div className="flex items-center bg-[#121215] p-0.5 rounded-lg border border-[#27272a] text-[10px]">
          {environments.map((env) => (
            <button
              key={env}
              onClick={() => setEnvironment(env)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                environment === env
                  ? env === 'PRODUCTION'
                    ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                    : env === 'STAGING'
                    ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                    : 'bg-emerald-500 text-black font-extrabold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {env === 'PAPER_SIM' ? 'PAPER' : env}
            </button>
          ))}
        </div>

        {/* Dock Controls */}
        <div className="flex items-center gap-1 border-l border-[#27272a] pl-2">
          {/* Left Panel Toggle */}
          <button
            onClick={() => togglePanel('left')}
            className={`p-1.5 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition ${
              leftPanelOpen ? 'text-amber-400' : 'text-zinc-500'
            }`}
            title={leftPanelOpen ? 'Tutup Roster Kiri' : 'Buka Roster Kiri'}
          >
            {leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          {/* Bottom Drawer Toggle */}
          <button
            onClick={() => togglePanel('bottom')}
            className={`p-1.5 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition ${
              bottomDrawerOpen ? 'text-cyan-400' : 'text-zinc-500'
            }`}
            title={bottomDrawerOpen ? 'Tutup Console Bawah' : 'Buka Console Bawah'}
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Right Panel Toggle */}
          <button
            onClick={() => togglePanel('right')}
            className={`p-1.5 rounded hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition ${
              rightPanelOpen ? 'text-amber-400' : 'text-zinc-500'
            }`}
            title={rightPanelOpen ? 'Tutup Inspector Kanan' : 'Buka Inspector Kanan'}
          >
            {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-[#18181b] text-zinc-400 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Command Center'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
