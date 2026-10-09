'use client'

import React, { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  ChevronDown
} from 'lucide-react'
import {
  useMissionControlBridgeStore,
  type AgentFleetStatus
} from '@/store/useMissionControlBridgeStore'
import { DEPARTMENTS, type DeptId } from '@/lib/hedgefund/firmRoster'

export default function AgentRosterPanel() {
  const { fleet, selectedAgentId, selectAgent } = useMissionControlBridgeStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('ALL')

  const agentList = useMemo(() => Object.values(fleet), [fleet])

  const filteredAgents = useMemo(() => {
    return agentList.filter((a) => {
      const matchDept = selectedDept === 'ALL' || a.dept === selectedDept
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.dept.toLowerCase().includes(q)
      return matchDept && matchSearch
    })
  }, [agentList, selectedDept, searchQuery])

  const statusBadge = (status: AgentFleetStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        )
      case 'COMMUNICATING':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            COMM
          </span>
        )
      case 'IDLE':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            IDLE
          </span>
        )
      case 'ERROR':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            ALERT
          </span>
        )
    }
  }

  const deptCount = (deptId: string) => {
    if (deptId === 'ALL') return agentList.length
    return agentList.filter((a) => a.dept === deptId).length
  }

  return (
    <aside className="w-72 h-full bg-[#09090b] border-r border-[#27272a] flex flex-col justify-between text-xs font-mono select-none overflow-hidden shrink-0">
      {/* ── Top: Header & Search ── */}
      <div className="p-3 border-b border-[#27272a] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white font-bold text-xs tracking-wider">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>AGENT ROSTER &amp; FLEET</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
            {filteredAgents.length}/{agentList.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari agen, dept, atau tugas..."
            className="w-full bg-[#121215] border border-[#27272a] focus:border-amber-500 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Department Chips Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-2 py-0.5 rounded transition ${
              selectedDept === 'ALL'
                ? 'bg-amber-500 text-black font-extrabold'
                : 'bg-[#121215] text-zinc-400 hover:text-white border border-[#27272a]'
            }`}
          >
            ALL ({deptCount('ALL')})
          </button>
          {DEPARTMENTS.slice(0, 6).map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              className={`px-2 py-0.5 rounded whitespace-nowrap transition ${
                selectedDept === d.id
                  ? 'bg-amber-500 text-black font-extrabold'
                  : 'bg-[#121215] text-zinc-400 hover:text-white border border-[#27272a]'
              }`}
            >
              {d.emoji} {d.id} ({deptCount(d.id)})
            </button>
          ))}
        </div>
      </div>

      {/* ── Agent List ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e24] p-1.5 space-y-1 custom-scrollbar">
        {filteredAgents.map((agent) => {
          const isSelected = agent.id === selectedAgentId

          return (
            <div
              key={agent.id}
              onClick={() => selectAgent(agent.id)}
              className={`p-2.5 rounded-lg transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 border-amber-500/60 shadow-md shadow-amber-500/10'
                  : 'bg-[#0e0e12]/60 hover:bg-[#14141a] border-transparent hover:border-[#27272a]'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base shrink-0">{agent.emoji}</span>
                  <div className="truncate">
                    <div className="font-bold text-white text-[11px] truncate flex items-center gap-1">
                      <span>{agent.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <div className="text-[9px] text-zinc-400 truncate">
                      {agent.title}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">{statusBadge(agent.status)}</div>
              </div>

              {/* Progress bar of current goal */}
              <div className="mt-1.5 space-y-0.5">
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span className="truncate max-w-[160px]">{agent.activeGoal}</span>
                  <span className="font-bold text-zinc-400">{agent.progressPct}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      agent.status === 'COMMUNICATING'
                        ? 'bg-cyan-400'
                        : agent.status === 'ACTIVE'
                        ? 'bg-emerald-400'
                        : 'bg-zinc-600'
                    }`}
                    style={{ width: `${agent.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {filteredAgents.length === 0 && (
          <div className="p-6 text-center text-zinc-500 text-xs">
            Tidak ada agen yang sesuai dengan pencarian.
          </div>
        )}
      </div>

      {/* ── Bottom Summary ── */}
      <div className="p-2.5 bg-[#0e0e12] border-t border-[#27272a] text-[10px] text-zinc-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Multi-Agent Swarm Active</span>
        </span>
        <span className="font-bold text-white">50 TOTAL DESKS</span>
      </div>
    </aside>
  )
}
