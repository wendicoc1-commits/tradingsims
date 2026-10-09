'use client'

import { create } from 'zustand'
import { FIRM_AGENTS, type DeptId } from '@/lib/hedgefund/firmRoster'

export type AgentFleetStatus = 'ACTIVE' | 'IDLE' | 'COMMUNICATING' | 'ERROR'
export type EnvironmentMode = 'PRODUCTION' | 'STAGING' | 'PAPER_SIM'

export interface AgentFleetItem {
  id: string
  name: string
  title: string
  dept: DeptId
  emoji: string
  status: AgentFleetStatus
  activeGoal: string
  currentStep: string
  progressPct: number
  contextTokens: number
  maxContextTokens: number
  lastTool: {
    name: string
    input: Record<string, any>
    output: Record<string, any>
    latencyMs: number
  } | null
  recentMemory: string[]
}

export interface TelemetryLogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM'
  agentId?: string
  source: string
  message: string
}

export interface InterAgentMessage {
  id: string
  timestamp: string
  fromAgentId: string
  fromAgentName: string
  toAgentId: string
  toAgentName: string
  channel: 'RISK_GATE' | 'CONSENSUS_VOTE' | 'ALPHA_ROUTING' | 'TELEMETRY'
  payload: string
}

interface MissionControlState {
  // Navigation & Docking
  selectedAgentId: string | null
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  bottomDrawerOpen: boolean
  bottomTab: 'LOGS' | 'INTER_AGENT' | 'TOKEN_METRICS'
  isFullscreen: boolean

  // Fleet & Runtime
  environment: EnvironmentMode
  isGlobalPaused: boolean
  fleet: Record<string, AgentFleetItem>
  throughput: {
    tokensPerSec: number
    activeAgentsCount: number
    modelLatencyMs: number
    gpuLoadPct: number
  }

  // Real-Time Event Streams
  logs: TelemetryLogEntry[]
  messages: InterAgentMessage[]

  // Actions
  selectAgent: (agentId: string | null) => void
  setAgentStatus: (agentId: string, status: AgentFleetStatus) => void
  toggleGlobalPause: () => void
  setEnvironment: (env: EnvironmentMode) => void
  togglePanel: (panel: 'left' | 'right' | 'bottom') => void
  setBottomTab: (tab: 'LOGS' | 'INTER_AGENT' | 'TOKEN_METRICS') => void
  toggleFullscreen: () => void
  injectPromptToAgent: (agentId: string, prompt: string) => void
  addLog: (log: Omit<TelemetryLogEntry, 'id' | 'timestamp'>) => void
  addInterAgentMessage: (msg: Omit<InterAgentMessage, 'id' | 'timestamp'>) => void
  resetPanels: () => void
}

// Initial fleet population based on firm roster
const createInitialFleet = (): Record<string, AgentFleetItem> => {
  const map: Record<string, AgentFleetItem> = {}
  
  FIRM_AGENTS.forEach((a, idx) => {
    const isLead = a.committee || idx < 8
    const status: AgentFleetStatus = isLead
      ? (idx % 3 === 0 ? 'COMMUNICATING' : 'ACTIVE')
      : (idx % 4 === 0 ? 'IDLE' : 'ACTIVE')

    map[a.id] = {
      id: a.id,
      name: a.name,
      title: a.title,
      dept: a.dept,
      emoji: a.emoji,
      status,
      activeGoal: a.duties[0] || 'Monitoring market order flow & cross-asset correlations',
      currentStep: 'Evaluating real-time OHLCV features & sentiment vectors',
      progressPct: Math.floor(Math.random() * 60 + 35),
      contextTokens: Math.floor(Math.random() * 24000 + 12000),
      maxContextTokens: 128000,
      lastTool: {
        name: idx % 2 === 0 ? 'vector_store_market_retrieval' : 'almgren_chriss_slippage_model',
        input: { symbol: 'BTCUSDT', lookback_candles: 64, slippage_tolerance: 0.0015 },
        output: { optimal_slice_lots: 12.5, expected_impact_bps: 1.4, status: 'VERIFIED' },
        latencyMs: Math.floor(Math.random() * 120 + 45)
      },
      recentMemory: [
        `Detected regime shift on ${a.dept} parameters.`,
        `Holding cross-department consensus with Investment Committee.`,
        `Episodic cache updated via VPS SQLite daemon.`
      ]
    }
  })

  return map
}

export const useMissionControlBridgeStore = create<MissionControlState>((set, get) => ({
  selectedAgentId: 'exec_cio',
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomDrawerOpen: false,
  bottomTab: 'LOGS',
  isFullscreen: false,

  environment: 'PRODUCTION',
  isGlobalPaused: false,
  fleet: createInitialFleet(),
  throughput: {
    tokensPerSec: 2480,
    activeAgentsCount: 42,
    modelLatencyMs: 184,
    gpuLoadPct: 38.4
  },

  logs: [
    {
      id: 'l-1',
      timestamp: '05:44:12.802',
      level: 'SYSTEM',
      source: 'VPS_BRIDGE:8002',
      message: 'Quant memory socket verified. Bi-directional WebSocket pipe OPEN.'
    },
    {
      id: 'l-2',
      timestamp: '05:44:14.119',
      level: 'INFO',
      agentId: 'quant_lead',
      source: 'KRONOS_ENGINE',
      message: 'RankIC score evaluated: 0.089 (+93% over baseline). Ghost candles injected.'
    },
    {
      id: 'l-3',
      timestamp: '05:44:15.541',
      level: 'INFO',
      agentId: 'risk_lead',
      source: 'CIRCUIT_BREAKER',
      message: 'VaR 99% portfolio constraint verified: 1.42% < limit (3.50%).'
    }
  ],

  messages: [
    {
      id: 'm-1',
      timestamp: '05:44:10',
      fromAgentId: 'macro_lead',
      fromAgentName: 'Ray Dalio',
      toAgentId: 'exec_cio',
      toAgentName: 'Warren Buffett',
      channel: 'CONSENSUS_VOTE',
      payload: 'USDT liquidity premium stable. Recommending overweight high-moat banking asset.'
    },
    {
      id: 'm-2',
      timestamp: '05:44:12',
      fromAgentId: 'quant_lead',
      fromAgentName: 'Jim Simons',
      toAgentId: 'risk_lead',
      toAgentName: 'Risk Officer',
      channel: 'RISK_GATE',
      payload: 'Transmitting cointegration matrix for ARB/OP pair. Z-score at +2.18 sigma.'
    }
  ],

  selectAgent: (agentId) => set({ selectedAgentId: agentId }),

  setAgentStatus: (agentId, status) =>
    set((state) => {
      const agent = state.fleet[agentId]
      if (!agent) return state
      return {
        fleet: {
          ...state.fleet,
          [agentId]: { ...agent, status }
        }
      }
    }),

  toggleGlobalPause: () =>
    set((state) => {
      const next = !state.isGlobalPaused
      return {
        isGlobalPaused: next,
        logs: [
          {
            id: `l-${Date.now()}`,
            timestamp: new Date().toISOString().substring(11, 23),
            level: next ? 'WARN' : 'INFO',
            source: 'MISSION_CONTROL_OP',
            message: next
              ? '🛑 GLOBAL CIRCUIT BREAKER TRIGGERED: All agent execution loops FROZEN.'
              : '▶ GLOBAL SWARM RESUMED: Normal autonomous scheduling restored.'
          },
          ...state.logs
        ]
      }
    }),

  setEnvironment: (env) =>
    set((state) => ({
      environment: env,
      logs: [
        {
          id: `l-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 23),
          level: 'SYSTEM',
          source: 'ENVIRONMENT_SWITCH',
          message: `Switched execution context to: [${env}].`
        },
        ...state.logs
      ]
    })),

  togglePanel: (panel) =>
    set((state) => {
      if (panel === 'left') return { leftPanelOpen: !state.leftPanelOpen }
      if (panel === 'right') return { rightPanelOpen: !state.rightPanelOpen }
      return { bottomDrawerOpen: !state.bottomDrawerOpen }
    }),

  setBottomTab: (tab) => set({ bottomTab: tab, bottomDrawerOpen: true }),

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  injectPromptToAgent: (agentId, prompt) =>
    set((state) => {
      const agent = state.fleet[agentId]
      if (!agent) return state
      const now = new Date().toISOString().substring(11, 23)
      return {
        fleet: {
          ...state.fleet,
          [agentId]: {
            ...agent,
            currentStep: `USER DIRECTIVE INJECTED: "${prompt.slice(0, 48)}..."`,
            recentMemory: [`DIRECTIVE: ${prompt}`, ...agent.recentMemory.slice(0, 4)]
          }
        },
        logs: [
          {
            id: `l-${Date.now()}`,
            timestamp: now,
            level: 'INFO',
            agentId,
            source: 'DIRECTIVE_INJECTOR',
            message: `User prompt injected into ${agent.name}: "${prompt}"`
          },
          ...state.logs
        ]
      }
    }),

  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          ...log,
          id: `l-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString().substring(11, 23)
        },
        ...state.logs.slice(0, 99)
      ]
    })),

  addInterAgentMessage: (msg) =>
    set((state) => ({
      messages: [
        {
          ...msg,
          id: `m-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 19)
        },
        ...state.messages.slice(0, 49)
      ]
    })),

  resetPanels: () =>
    set({
      leftPanelOpen: true,
      rightPanelOpen: true,
      bottomDrawerOpen: false
    })
}))
