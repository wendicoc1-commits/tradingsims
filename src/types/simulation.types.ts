// src/types/simulation.types.ts
/**
 * Strict Data Contracts for Autonomous AI Hedge Fund & Trading Floor Office
 */

export type AgentRole =
  | 'CHIEF_INVESTMENT_OFFICER'
  | 'CHIEF_RISK_OFFICER'
  | 'HEAD_QUANT'
  | 'SMC_STRUCTURE_SPECIALIST'
  | 'MACRO_ECONOMIST'
  | 'HFT_ARBITRAGEUR'
  | 'CRYPTO_DESK_LEAD';

export type AgentSimState =
  | 'IDLE'
  | 'ANALYZING'
  | 'DATA_TRANSFERRING'
  | 'CONVENING_WAR_ROOM'
  | 'ORDER_DISPATCH'
  | 'STRESSED_DRAWDOWN';

export type DeskTier = 'EXECUTIVE' | 'STANDARD' | 'INTERN';

export type PacketType =
  | 'TELEMETRY_FEED'     // Cyan (#00f0ff)
  | 'ALPHA_PROPOSAL'     // Amber (#f59e0b)
  | 'ORDER_FILL'         // Emerald (#10b981)
  | 'RISK_VETO';         // Crimson (#ef4444)

export interface ChainOfThoughtEntry {
  id: string;
  timestamp: number;
  tokenCount: number;
  latencyMs: number;
  thoughtSnippet: string;
  convictionScore: number; // 0.0 - 1.0
  proposedAction?: 'BUY' | 'SELL' | 'HOLD';
}

export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
  avatarUrl: string;
  status: AgentSimState;
  currentDeskId: string;
  targetDeskId: string | null;
  position: { x: number; y: number };
  velocity: { vx: number; vy: number };
  orientationAngle: number;
  rollingSharpeRatio: number;
  netAlphaUsd: number;
  maxDrawdownPct: number;
  winRatePct: number;
  taskQueueDepth: number;
  activeModelLatencyMs: number;
  cotHistory: ChainOfThoughtEntry[];
}

export interface MarketTelemetryEvent {
  sequenceId: number;
  timestamp: number;
  symbol: string;
  price: number;
  delta24h: number;
  volatilityIndex: number; // VIX / ATR
  tradeVolume: number;
  flowDirection: 'BULL' | 'BEAR' | 'NEUTRAL';
}

export interface CubicBezierControlPoints {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

export interface InterAgentDataPacket {
  packetId: string;
  sourceAgentId: string;
  targetAgentId: string;
  packetType: PacketType;
  payloadSizeKb: number;
  progress: number; // 0.0 -> 1.0
  travelSpeed: number;
  spline: CubicBezierControlPoints;
  isComplete: boolean;
}

export interface DeskEntity {
  deskId: string;
  tier: DeskTier;
  gridCoord: { gx: number; gy: number };
  worldCoord: { x: number; y: number };
  assignedAgentId: string | null;
  props: {
    coffeeCupCount: number;
    hasGoldenTrophy: boolean;
    monitorHealth: 'NORMAL' | 'GLITCH_SMOKE' | 'OFF';
  };
}

export interface EnvironmentAtmosphereState {
  regime: 'BULL_MOMENTUM' | 'BEAR_DRAWDOWN' | 'HIGH_VOLATILITY';
  ambientColor: string;
  reflectionIntensity: number;
  weatherParticles: 'GOLDEN_DUST' | 'CYBER_RAIN' | 'CRT_STATIC';
  hologramColor: string;
}
