'use client'

import React, { useRef, useEffect } from 'react'
import TopCommandBar from './TopCommandBar'
import AgentRosterPanel from './AgentRosterPanel'
import ContextualAgentInspector from './ContextualAgentInspector'
import TelemetryConsoleDrawer from './TelemetryConsoleDrawer'
import VirtualAgentOfficeView from '@/components/ai/VirtualAgentOfficeView'
import {
  useMissionControlBridgeStore
} from '@/store/useMissionControlBridgeStore'

export default function AgentMissionControlDashboard() {
  const {
    leftPanelOpen,
    rightPanelOpen,
    bottomDrawerOpen,
    isFullscreen
  } = useMissionControlBridgeStore()

  const centralStageRef = useRef<HTMLDivElement | null>(null)

  // ResizeObserver aware container to guarantee zero canvas distortion upon panel docks
  useEffect(() => {
    const el = centralStageRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Trigger window resize event so internal canvas viewports adjust gracefully
        window.dispatchEvent(new Event('resize'))
      }
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className={`w-full bg-[#050508] text-slate-100 flex flex-col overflow-hidden font-mono select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen'
          : 'relative h-[calc(100vh-4rem)] min-h-[640px] rounded-xl border border-[#27272a] shadow-2xl'
      }`}
    >
      {/* ── 1. Top Command Bar ── */}
      <TopCommandBar />

      {/* ── 2. Middle Row: Left Roster + Central Office Canvas + Right Inspector ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Panel: Agent Fleet Roster (Animated Transition) */}
        <div
          className={`h-full transition-all duration-300 ease-in-out overflow-hidden z-20 ${
            leftPanelOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 pointer-events-none'
          }`}
        >
          <AgentRosterPanel />
        </div>

        {/* Central Stage: Existing Agent Office Canvas */}
        <main
          ref={centralStageRef}
          className="flex-1 h-full overflow-y-auto relative bg-[#030305] p-2 md:p-3 transition-all duration-300 custom-scrollbar"
        >
          {/* Embedding the complete 2D Virtual Agent Office Component */}
          <div className="w-full h-full min-h-[500px]">
            <VirtualAgentOfficeView />
          </div>
        </main>

        {/* Right Panel: Contextual Agent Inspector (Animated Transition) */}
        <div
          className={`h-full transition-all duration-300 ease-in-out overflow-hidden z-20 ${
            rightPanelOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'
          }`}
        >
          <ContextualAgentInspector />
        </div>

      </div>

      {/* ── 3. Bottom Drawer: Telemetry & Logs Console ── */}
      <TelemetryConsoleDrawer />
    </div>
  )
}
