/**
 * Autonomous AI Hedge Fund Ecosystem Schema
 * 
 * Modul terpadu untuk:
 * 1. Black Swan Crisis Simulation
 * 2. RAG Episodic Memory & Post-Mortem Reflective Vault
 * 3. Dynamic Meritocratic Capital Allocation & Spatial Desk Tiers
 * 4. Regulatory Compliance Inspection Gateway
 */

export type CrisisScenarioType =
  | 'FLASH_CRASH'         // -15% index drop in 60s
  | 'LIQUIDITY_DROUGHT'    // Spread widens 10x, high slippage
  | 'REGULATORY_BLACKOUT' // Emergency asset freeze / circuit breaker
  | 'RATING_DOWNGRADE';   // Sudden credit shock

export interface CrisisEventPayload {
  crisisId: string;
  type: CrisisScenarioType;
  severity: 'ELEVATED' | 'CRITICAL' | 'CATASTROPHIC';
  triggeredAt: number;
  durationSeconds: number;
  marketImpact: {
    priceDropPct: number;
    spreadMultiplier: number;
    slippageMultiplier: number;
  };
  officeState: {
    alarmAudio: boolean;
    lightingColor: string; // e.g. 'rgba(239, 68, 68, 0.4)'
    circuitBreakerTripped: boolean;
  };
}

export interface PostMortemEntry {
  id: string;
  tradeId: string;
  agentId: string;
  agentName: string;
  symbol: string;
  lossUsd: number;
  lossPct: number;
  entryPrice: number;
  exitPrice: number;
  timestamp: number;
  rootCause: string;
  cognitiveBlindSpot: string;
  lessonsLearned: string[];
  vectorEmbeddingId: string;
  ruleModulation: {
    parameter: string;
    beforeValue: number;
    afterValue: number;
    adjustmentReason: string;
  }[];
}

export type DeskTier =
  | 'CORNER_PENTHOUSE' // Highest Sharpe, Gold Aura, Dual Ultrawide
  | 'SENIOR_DESK'      // Standard Lead Office
  | 'BULLPEN_STANDARD' // Standard Floor Desk
  | 'INTERN_EXILE';    // Drawdown penalty box

export interface MeritocraticAllocation {
  agentId: string;
  agentName: string;
  deskTier: DeskTier;
  rollingSharpe: number;
  sortinoRatio: number;
  winRatePct: number;
  consecutiveWins: number;
  currentAumUsd: number;
  allocatedCapitalPct: number; // e.g. 35% of Fund NAV
  rank: number;
}

export interface ComplianceCheckSlip {
  orderId: string;
  agentId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  lots: number;
  exposureUsd: number;
  fundNavUsd: number;
  currentConcentrationPct: number;
  maxAllowedConcentrationPct: number;
  passed: boolean;
  rejectionReason?: string;
  timestamp: number;
  auditHash: string; // SHA-256 for audit trail
}
