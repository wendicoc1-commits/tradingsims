'use client'

import React, { useState } from 'react'
import {
  Cpu,
  Brain,
  Wrench,
  Send,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  FileCode,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import {
  useMissionControlBridgeStore,
  type AgentFleetStatus
} from '@/store/useMissionControlBridgeStore'

export default function ContextualAgentInspector() {
  const {
    selectedAgentId,
    fleet,
    setAgentStatus,
    injectPromptToAgent,
    setBottomTab
  } = useMissionControlBridgeStore()

  const [promptInput, setPromptInput] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const agent = selectedAgentId ? fleet[selectedAgentId] : null

  const handleInject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptInput.trim() || !agent) return
    injectPromptToAgent(agent.id, promptInput.trim())
    setToastMsg(`✓ Perintah langsung diinjeksi ke ${agent.name}`)
    setPromptInput('')
    setTimeout(() => setToastMsg(null), 3500)
  }

  const toggleAgentPause = () => {
    if (!agent) return
    const nextStatus: AgentFleetStatus = agent.status === 'IDLE' ? 'ACTIVE' : 'IDLE'
    setAgentStatus(agent.id, nextStatus)
  }

  if (!agent) {
    return (
      <aside className="w-80 h-full bg-[#09090b] border-l border-[#27272a] p-4 text-xs font-mono flex flex-col items-center justify-center text-center text-zinc-500">
        <Cpu className="w-8 h-8 mb-2 text-zinc-600 animate-pulse" />
        <span className="font-bold text-zinc-400">PILIH AGEN DI LANTAI KANTOR</span>
        <span className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">
          Klik salah satu meja agen di denah 2D atau daftar sebelah kiri untuk membuka telemetri kontekstual.
        </span>
      </aside>
    )
  }

  return (
    <aside className="w-80 h-full bg-[#09090b] border-l border-[#27272a] flex flex-col justify-between text-xs font-mono select-none overflow-hidden shrink-0">
      {/* ── Top Header: Agent Bio & Status ── */}
      <div className="p-3 border-b border-[#27272a] space-y-2 bg-[#0d0d12]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl shrink-0 shadow-sm">
              {agent.emoji}
            </div>
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>{agent.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-800 text-amber-300 font-bold border border-zinc-700">
                  {agent.dept}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate max-w-[170px]">
                {agent.title}
              </div>
            </div>
          </div>

          <button
            onClick={toggleAgentPause}
            className={`p-1.5 rounded transition ${
              agent.status === 'IDLE'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white'
            }`}
            title={agent.status === 'IDLE' ? 'Resume Agent Loop' : 'Pause Agent Loop'}
          >
            {agent.status === 'IDLE' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
          </button>
        </div>

        {/* Status ribbon */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="p-1 rounded bg-[#131318] border border-zinc-800">
            <span className="text-zinc-500 block">STATUS</span>
            <span className={`font-bold ${
              agent.status === 'ACTIVE'
                ? 'text-emerald-400'
                : agent.status === 'COMMUNICATING'
                ? 'text-cyan-400'
                : 'text-zinc-400'
            }`}>
              {agent.status}
            </span>
          </div>
          <div className="p-1 rounded bg-[#131318] border border-zinc-800">
            <span className="text-zinc-500 block">CONTEXT TOKENS</span>
            <span className="font-bold text-cyan-300">
              {(agent.contextTokens / 1000).toFixed(1)}k / 128k
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-1.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] text-emerald-200 font-semibold animate-fadeIn">
            {toastMsg}
          </div>
        )}
      </div>

      {/* ── Scrollable Inspector Body ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar">

        {/* 1. Active Goal & Execution Step */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>ACTIVE GOAL &amp; STEP</span>
            </span>
            <span className="text-[10px] text-amber-400">{agent.progressPct}%</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#121216] border border-[#27272a] space-y-1.5">
            <div className="text-white font-semibold text-[11px] leading-tight">
              {agent.activeGoal}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-start gap-1">
              <span className="text-cyan-400 font-bold shrink-0">STEP:</span>
              <span>{agent.currentStep}</span>
            </div>
          </div>
        </div>

        {/* 2. Live Tool Execution Payload */}
        {agent.lastTool && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>TOOL EXECUTION I/O</span>
              </span>
              <span className="text-[10px] text-zinc-500">{agent.lastTool.latencyMs}ms</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0c0c10] border border-cyan-950/70 space-y-2 text-[10px]">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                <span className="text-cyan-300 font-bold truncate">{agent.lastTool.name}</span>
                <span className="text-[9px] text-emerald-400 font-bold">200 OK</span>
              </div>

              <div>
                <span className="text-zinc-500 block mb-0.5">INPUT ARGS:</span>
                <pre className="p-1.5 rounded bg-black/60 border border-zinc-900 text-zinc-300 text-[9px] overflow-x-auto">
                  {JSON.stringify(agent.lastTool.input, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-zinc-500 block mb-0.5">OUTPUT PAYLOAD:</span>
                <pre className="p-1.5 rounded bg-black/60 border border-zinc-900 text-emerald-400 text-[9px] overflow-x-auto">
                  {JSON.stringify(agent.lastTool.output, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 3. Memory & Context Window Trace */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>EPISODIC MEMORY TRACE</span>
            </span>
            <span className="text-[10px] text-purple-400">SQLite VPS</span>
          </div>

          <div className="p-2 rounded-lg bg-[#121216] border border-[#27272a] space-y-1.5">
            {agent.recentMemory.map((mem, idx) => (
              <div key={idx} className="p-1.5 rounded bg-black/40 border border-zinc-900 text-[10px] text-zinc-300 flex items-start gap-1.5">
                <span className="text-purple-400 font-bold shrink-0">#{idx + 1}</span>
                <span className="leading-snug">{mem}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom: User Prompt Injector ── */}
      <div className="p-3 border-t border-[#27272a] bg-[#0c0c10] space-y-2">
        <form onSubmit={handleInject} className="space-y-1.5">
          <label className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>INJEKSIKAN DIRECTIVE LANGSUNG</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={`Beri perintah ke ${agent.name.split(' ')[0]}...`}
              className="w-full bg-[#141418] border border-[#27272a] focus:border-amber-500 rounded-lg pl-2.5 pr-8 py-1.5 text-[11px] text-white placeholder-zinc-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber-400 hover:text-white p-1 rounded"
              title="Kirim directive"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[10px] pt-1">
          <button
            onClick={() => setBottomTab('LOGS')}
            className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Terminal className="w-3 h-3" />
            <span>Buka Raw Logs</span>
          </button>
          <span className="text-zinc-600">Fincept Cognitive Loop</span>
        </div>
      </div>
    </aside>
  )
}
