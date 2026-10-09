'use client'

import React, { useState } from 'react'
import { ShieldAlert, ShieldCheck, CheckCircle2, XCircle, Terminal, Send, AlertTriangle, Cpu, Zap, PauseCircle, PlayCircle, Clock } from 'lucide-react'

interface DecisionTicket {
  id: string
  agentName: string
  agentAvatar: string
  action: 'BUY' | 'SELL' | 'REBALANCE'
  symbol: string
  assetClass: 'CRYPTO' | 'IDX' | 'US'
  riskScore: number // 0-100
  amount: string
  rationale: string
  timestamp: string
}

export default function MissionControlDecisionCenter({
  isEmbedded = false
}: {
  isEmbedded?: boolean
}) {
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('Warren Buffett')
  const [taskInstruction, setTaskInstruction] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [tickets, setTickets] = useState<DecisionTicket[]>([
    {
      id: 't-1',
      agentName: 'George Soros',
      agentAvatar: '🦅',
      action: 'BUY',
      symbol: 'ARBUSDT',
      assetClass: 'CRYPTO',
      riskScore: 84,
      amount: '$2,500 (~Rp 40.500.000)',
      rationale: 'Breakout 4H + RSI Divergence & Lonjakan On-chain Whale Accumulation',
      timestamp: '1 mnt lalu'
    },
    {
      id: 't-2',
      agentName: 'Cathie Wood',
      agentAvatar: '🚀',
      action: 'BUY',
      symbol: 'RENDERUSDT',
      assetClass: 'CRYPTO',
      riskScore: 58,
      amount: '$1,200',
      rationale: 'Permintaan GPU compute network melonjak +23% minggu ini',
      timestamp: '4 mnt lalu'
    },
    {
      id: 't-3',
      agentName: 'Warren Buffett',
      agentAvatar: '👴',
      action: 'BUY',
      symbol: 'BBCA.JK',
      assetClass: 'IDX',
      riskScore: 22,
      amount: 'Rp 25.000.000 (25 Lot)',
      rationale: 'Margin of Safety 18%, ROE stabil > 20%, Moat perbankan Indonesia kokoh',
      timestamp: '8 mnt lalu'
    }
  ])

  const [missions, setMissions] = useState([
    { id: 'm-1', agent: 'Jim Simons', task: 'Scan Cointegration Pairs (USDT)', status: 'DONE', time: '2 mnt lalu' },
    { id: 'm-2', agent: 'Ray Dalio', task: 'Macro Liquidity Stress Test', status: 'RUNNING (70%)', time: '5 mnt lalu' }
  ])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleApprove = (ticket: DecisionTicket) => {
    setTickets(prev => prev.filter(t => t.id !== ticket.id))
    showToast(`✓ Order ${ticket.symbol} (${ticket.amount}) dari ${ticket.agentName} DISETUJUI & diteruskan ke Broker!`)
  }

  const handleReject = (ticket: DecisionTicket) => {
    setTickets(prev => prev.filter(t => t.id !== ticket.id))
    showToast(`✕ Usulan transaksi dari ${ticket.agentName} DITOLAK (VETO oleh Pengguna).`)
  }

  const handleDispatchTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskInstruction.trim()) return
    const newMission = {
      id: `m-${Date.now()}`,
      agent: selectedAgent,
      task: taskInstruction.trim(),
      status: 'QUEUED & ANALYZING...',
      time: 'Baru saja'
    }
    setMissions(prev => [newMission, ...prev])
    showToast(`🚀 Misi "${taskInstruction.trim()}" didelegasikan ke ${selectedAgent}`)
    setTaskInstruction('')
  }

  const toggleKillSwitch = () => {
    const nextState = !isKillSwitchActive
    setIsKillSwitchActive(nextState)
    if (nextState) {
      showToast('🛑 CIRCUIT BREAKER TRIPPED: Seluruh aktivitas autonomous trading swarm DIBEKUKAN!')
    } else {
      showToast('▶ Autonomous Swarm kembali aktif normal.')
    }
  }

  return (
    <div className={`rounded-2xl border border-slate-800 bg-[#060b17]/95 shadow-2xl backdrop-blur-md overflow-hidden ${
      isEmbedded ? 'w-full mb-4' : 'w-full'
    }`}>
      {/* ── Top Header & Emergency Kill Switch ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs tracking-wider font-mono">
                MISSION CONTROL · OVERSIGHT & DECISIONS
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 ${
                isKillSwitchActive
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isKillSwitchActive ? 'bg-red-400' : 'bg-emerald-400 animate-ping'}`} />
                {isKillSwitchActive ? 'CIRCUIT BREAKER: HALTED' : 'HUMAN-IN-THE-LOOP ACTIVE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Supervisi Transaksi Berisiko & Delegasi Tugas AI Swarm</p>
          </div>
        </div>

        {/* Emergency Kill Switch Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleKillSwitch}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border ${
              isKillSwitchActive
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300'
                : 'bg-red-950/70 hover:bg-red-900 border-red-500/60 text-red-300'
            }`}
          >
            {isKillSwitchActive ? (
              <>
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>RESUME SWARM</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>🛑 KILL SWITCH</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Status Metrics Bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-[#040813] border-b border-slate-900 text-xs font-mono">
        <div className="p-2 rounded bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-500 block">PENDING APPROVALS</span>
          <span className="text-base font-bold text-amber-400">{tickets.length} Tiket</span>
        </div>
        <div className="p-2 rounded bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-500 block">DAILY CAPITAL CAP</span>
          <span className="text-base font-bold text-emerald-400">$10,000</span>
        </div>
        <div className="p-2 rounded bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-500 block">EST. TOKEN BURN</span>
          <span className="text-base font-bold text-cyan-400">142.8k (~$0.04)</span>
        </div>
        <div className="p-2 rounded bg-[#091122] border border-slate-800">
          <span className="text-[10px] text-slate-500 block">SWARM STATUS</span>
          <span className={`text-base font-bold ${isKillSwitchActive ? 'text-red-400' : 'text-emerald-400'}`}>
            {isKillSwitchActive ? 'FROZEN' : '6 AGENTS ONLINE'}
          </span>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 font-bold hover:text-white">✕</button>
        </div>
      )}

      {/* ── Main Content: Tickets & Task Delegation ── */}
      <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-mono">

        {/* 1. Left: Decision & Approval Queue (Cols 7) */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>📥 Decisions Queue (Butuh Persetujuan)</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                {tickets.length}
              </span>
            </span>
            <span className="text-[10px] text-slate-500">Human-in-the-Loop</span>
          </div>

          {tickets.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
              <p className="text-xs text-slate-400 font-bold">Semua Keputusan Telah Direview</p>
              <p className="text-[10px] text-slate-600">Tidak ada order berisiko tinggi yang tertahan.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {tickets.map(t => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-[#080f1e] border border-slate-800 hover:border-amber-500/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{t.agentAvatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{t.agentName}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            t.riskScore > 70
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : t.riskScore > 40
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            RISK {t.riskScore}/100
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Usulan {t.action} {t.symbol}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500">{t.timestamp}</span>
                  </div>

                  <div className="p-2 rounded bg-black/60 border border-slate-900 text-[10px] space-y-0.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Alokasi Dana:</span>
                      <span className="font-bold text-white">{t.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rasional:</span>
                      <span className="text-slate-300 text-right truncate max-w-[240px]">{t.rationale}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleReject(t)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold border border-slate-700 transition"
                    >
                      ✕ Tolak (Veto)
                    </button>
                    <button
                      onClick={() => handleApprove(t)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition shadow-md shadow-emerald-950 flex items-center gap-1"
                    >
                      ✓ Setujui & Eksekusi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Right: Task Delegation & Mission Log (Cols 5) */}
        <div className="md:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span>📋 Delegasi Tugas ke Meja Agen</span>
            </span>
            <span className="text-[10px] text-slate-500">Custom Research</span>
          </div>

          <form onSubmit={handleDispatchTask} className="p-3 rounded-xl bg-[#080f1e] border border-slate-800 space-y-2">
            <div>
              <label className="text-[9px] text-slate-500 block mb-0.5">TARGET AGEN</label>
              <select
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                className="w-full bg-[#040812] border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="Warren Buffett">👴 Warren Buffett (Fundamental)</option>
                <option value="George Soros">🦅 George Soros (Macro Trend)</option>
                <option value="Jim Simons">📐 Jim Simons (Quant Arbitrage)</option>
                <option value="Ray Dalio">⚖️ Ray Dalio (Risk Parity)</option>
                <option value="Cathie Wood">🚀 Cathie Wood (High Growth)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-500 block mb-0.5">INSTRUKSI TUGAS</label>
              <input
                type="text"
                value={taskInstruction}
                onChange={e => setTaskInstruction(e.target.value)}
                placeholder="Contoh: Analisis laporan keuangan BBRI"
                className="w-full bg-[#040812] border border-slate-700 rounded-lg p-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-950 flex items-center justify-center gap-1"
            >
              <Send className="w-3 h-3" /> Delegasikan ke Agen
            </button>
          </form>

          {/* Active Missions Stream */}
          <div className="p-2.5 rounded-xl bg-[#080f1e] border border-slate-800 space-y-1.5">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Papan Misi Aktif</span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {missions.map(m => (
                <div key={m.id} className="p-2 rounded bg-black/50 border border-slate-900 flex items-start justify-between gap-1 text-[10px]">
                  <div>
                    <div className="text-white font-semibold truncate max-w-[180px]">{m.agent}: {m.task}</div>
                    <div className="text-[8px] text-slate-400">
                      Status: <span className={m.status.includes('DONE') ? 'text-emerald-400' : 'text-amber-400'}>{m.status}</span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-500 whitespace-nowrap">{m.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
