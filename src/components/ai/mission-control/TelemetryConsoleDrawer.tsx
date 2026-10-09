'use client'

import React, { useState } from 'react'
import {
  Terminal,
  MessageSquare,
  BarChart3,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Filter,
  ArrowRight
} from 'lucide-react'
import {
  useMissionControlBridgeStore,
  type TelemetryLogEntry
} from '@/store/useMissionControlBridgeStore'

export default function TelemetryConsoleDrawer() {
  const {
    bottomDrawerOpen,
    togglePanel,
    bottomTab,
    setBottomTab,
    logs,
    messages,
    throughput
  } = useMissionControlBridgeStore()

  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM'>('ALL')
  const [isExpanded, setIsExpanded] = useState(false)

  if (!bottomDrawerOpen) return null

  const filteredLogs = logs.filter((l) => {
    if (levelFilter === 'ALL') return true
    return l.level === levelFilter
  })

  const getLevelBadge = (level: TelemetryLogEntry['level']) => {
    switch (level) {
      case 'SYSTEM':
        return <span className="px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">SYS</span>
      case 'WARN':
        return <span className="px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">WRN</span>
      case 'ERROR':
        return <span className="px-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">ERR</span>
      case 'INFO':
      default:
        return <span className="px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">INF</span>
    }
  }

  return (
    <div className={`w-full bg-[#08080c] border-t border-[#27272a] flex flex-col font-mono text-xs select-none transition-all z-20 shrink-0 ${
      isExpanded ? 'h-80' : 'h-52'
    }`}>
      {/* ── Console Header & Tabs ── */}
      <div className="h-9 px-3 bg-[#0d0d12] border-b border-[#27272a] flex items-center justify-between text-[11px]">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBottomTab('LOGS')}
            className={`px-3 py-1 rounded-t flex items-center gap-1.5 transition cursor-pointer ${
              bottomTab === 'LOGS'
                ? 'bg-[#08080c] text-white border-t border-x border-[#27272a] font-bold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>RAW TELEMETRY ({filteredLogs.length})</span>
          </button>

          <button
            onClick={() => setBottomTab('INTER_AGENT')}
            className={`px-3 py-1 rounded-t flex items-center gap-1.5 transition cursor-pointer ${
              bottomTab === 'INTER_AGENT'
                ? 'bg-[#08080c] text-white border-t border-x border-[#27272a] font-bold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>INTER-AGENT COMMS ({messages.length})</span>
          </button>

          <button
            onClick={() => setBottomTab('TOKEN_METRICS')}
            className={`px-3 py-1 rounded-t flex items-center gap-1.5 transition cursor-pointer ${
              bottomTab === 'TOKEN_METRICS'
                ? 'bg-[#08080c] text-white border-t border-x border-[#27272a] font-bold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>TOKEN &amp; LATENCY CHARTS</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {bottomTab === 'LOGS' && (
            <div className="flex items-center gap-1 text-[9px]">
              {(['ALL', 'INFO', 'WARN', 'SYSTEM'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    levelFilter === lvl
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-zinc-500 hover:text-white transition"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => togglePanel('bottom')}
            className="p-1 rounded text-zinc-500 hover:text-white transition"
            title="Tutup Console"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Console Content ── */}
      <div className="flex-1 overflow-y-auto p-2.5 custom-scrollbar bg-black/40">
        {/* TAB 1: RAW LOGS */}
        {bottomTab === 'LOGS' && (
          <div className="space-y-1 font-mono text-[10px]">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 hover:bg-zinc-900/60 p-0.5 rounded transition">
                <span className="text-zinc-500 shrink-0">{log.timestamp}</span>
                <span className="shrink-0">{getLevelBadge(log.level)}</span>
                <span className="text-amber-400/90 font-bold shrink-0">[{log.source}]</span>
                <span className="text-zinc-300 leading-tight">{log.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: INTER-AGENT COMMS */}
        {bottomTab === 'INTER_AGENT' && (
          <div className="space-y-1.5 font-mono text-[10px]">
            {messages.map((msg) => (
              <div key={msg.id} className="p-2 rounded bg-[#0d0d14] border border-[#27272a] space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <span className="text-cyan-300">{msg.fromAgentName}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-500" />
                    <span className="text-purple-300">{msg.toAgentName}</span>
                    <span className="px-1 py-0.2 rounded text-[8px] bg-zinc-800 text-amber-300 ml-1">
                      {msg.channel}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-[9px]">{msg.timestamp}</span>
                </div>
                <div className="text-zinc-300 text-[11px] pl-1 border-l-2 border-cyan-500/50">
                  {msg.payload}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: TOKEN CONSUMPTION & THROUGHPUT */}
        {bottomTab === 'TOKEN_METRICS' && (
          <div className="h-full flex flex-col justify-between p-2 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 rounded bg-[#101018] border border-zinc-800">
                <span className="text-zinc-500 block">CURRENT TOKEN RATE</span>
                <span className="text-base font-bold text-amber-400">{throughput.tokensPerSec} tok/s</span>
              </div>
              <div className="p-2 rounded bg-[#101018] border border-zinc-800">
                <span className="text-zinc-500 block">INFERENCE LATENCY</span>
                <span className="text-base font-bold text-cyan-400">{throughput.modelLatencyMs} ms</span>
              </div>
              <div className="p-2 rounded bg-[#101018] border border-zinc-800">
                <span className="text-zinc-500 block">DAILY COST BURN</span>
                <span className="text-base font-bold text-emerald-400">~$0.043 / Hari</span>
              </div>
              <div className="p-2 rounded bg-[#101018] border border-zinc-800">
                <span className="text-zinc-500 block">VRAM SATURATION</span>
                <span className="text-base font-bold text-purple-400">{throughput.gpuLoadPct}%</span>
              </div>
            </div>

            {/* Visual Bar / Sparkline */}
            <div className="p-2.5 rounded bg-[#101018] border border-zinc-800 space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>THROUGHPUT STABILITY (LAST 60 TICKS)</span>
                <span className="text-emerald-400 font-bold">99.8% STABLE</span>
              </div>
              <div className="h-6 flex items-end gap-1 overflow-hidden pt-1">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const h = Math.floor(Math.sin(idx * 0.4) * 40 + 55)
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-cyan-950 to-cyan-500 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
