/**
 * Types & Contracts for AI Hedge Fund Multi-Agent Architecture
 * Inspired by virattt/ai-hedge-fund and merged with Bloomberg Terminal AI Quant Engine
 */

import { OHLCVCandle, QuantAnalysisResult } from '@/lib/quant/engine';

export type AgentPersonaId =
  | 'buffett'
  | 'munger'
  | 'graham'
  | 'lynch'
  | 'druckenmiller'
  | 'wood'
  | 'simons';

export type SignalVerdict = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export type MasterAction =
  | 'STRONG BUY'
  | 'ACCUMULATE'
  | 'HOLD / NEUTRAL'
  | 'TRIM'
  | 'EXIT / SHORT';

export interface AgentCheckCriterion {
  label: string;
  value: string | number;
  status: 'PASS' | 'FAIL' | 'NEUTRAL';
  benchmark: string;
}

export interface HedgeFundAgentVote {
  id: AgentPersonaId;
  name: string;
  title: string;
  avatar: string;
  badge: string;
  style: string;
  investmentApproach: 'LONG_ONLY' | 'LONG_SHORT' | 'SYSTEMATIC_QUANT' | 'DISRUPTIVE_GROWTH';
  signal: SignalVerdict;
  confidence: number; // 0 - 100%
  convictionWeight: number; // -1.0 to +1.0
  strategyWeight: number; // e.g. 15% committee weight
  thesis: string;
  criteria: AgentCheckCriterion[];
  quote: string;
}

export interface RiskGateAssessment {
  croName: string;
  status: 'APPROVED' | 'RESTRICTED' | 'REJECTED';
  maxPositionCapPct: number; // e.g. 15%
  recommendedPositionPct: number;
  valueAtRisk95Pct: number;
  estimatedStopLoss: number;
  riskRewardRatio: number;
  grossExposureConstraint: string;
  volatilityFlag: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
  riskNotes: string;
}

export interface ExecutionOrderPlan {
  action: MasterAction;
  symbol: string;
  orderType: 'LIMIT' | 'MARKET';
  suggestedEntryPrice: number;
  stopLossPrice: number;
  takeProfit1: number;
  takeProfit2: number;
  targetAllocationLots: number;
  targetCapitalAllocated: number;
  currency: string;
  timeframe: string;
}

export interface HedgeFundCommitteeReport {
  symbol: string;
  name: string;
  currency: string;
  currentPrice: number;
  timestamp: string;
  groundingLevel?: 'AUDITED_BEI_SEC' | 'INSTITUTIONAL_BENCHMARK' | 'CALIBRATED_FALLBACK';
  dataSourceCitation?: string;
  groundedFinancials?: {
    isAudited: boolean;
    auditSource: string;
    revenueFormatted: string;
    netIncomeFormatted: string;
    freeCashFlowFormatted: string;
    peRatio: number;
    pbRatio: number;
    roe: number;
    dividendYield: number;
    debtToEquity: number;
  };
  institutionalConsensus?: {
    targetPriceConsensus: number;
    impliedUpsidePct: number;
    totalAnalysts: number;
    buyCount: number;
    holdCount: number;
    sellCount: number;
    rating: string;
  };
  overallSignal: MasterAction;
  netConvictionScore: number; // -100 to +100
  consensusConfidence: number; // 0 to 100%
  voteTallies: {
    bullish: number;
    bearish: number;
    neutral: number;
    total: number;
  };
  executiveSummary: string;
  cioVerdict: {
    chairperson: string;
    mandate: string;
    allocationPct: number;
    action: MasterAction;
    rationale: string;
  };
  riskGate: RiskGateAssessment;
  executionPlan: ExecutionOrderPlan;
  agents: HedgeFundAgentVote[];
  quantEngineMerge: {
    trendScore: number;
    momentumScore: number;
    smartMoneyScore: number;
    compositeAlpha: number;
    marketRegime: string;
    monteCarlo5DMedian: number;
    volumeZScore: number;
  };
}

export interface PaperFundMandate {
  id: string;
  name: string;
  description: string;
  activeAgents: AgentPersonaId[];
  capital: number;
  cash: number;
  holdings: Record<string, { lots: number; avgPrice: number; currentPrice: number; unrealizedPL: number }>;
  history: {
    date: string;
    ticker: string;
    action: string;
    price: number;
    lots: number;
    conviction: number;
  }[];
}
