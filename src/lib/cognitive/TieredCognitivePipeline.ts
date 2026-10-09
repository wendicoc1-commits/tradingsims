// src/lib/cognitive/TieredCognitivePipeline.ts
/**
 * Tiered Execution Hybrid Architecture
 * Menghubungkan Otak AI Kognitif (Tree-of-Thoughts, The Critic, Quorum)
 * dengan Otot Eksekusi Kuantitatif (Freqtrade untuk Kripto & Lumibot untuk Saham).
 */

import { globalEpisodicMemory, EpisodicHeuristic } from './EpisodicMemoryStore';

export type ExecutionTier = 'TIER_1_FAST' | 'TIER_2_COGNITIVE' | 'TIER_3_POSTMORTEM';

export interface TradeCandidateProposal {
  symbol: string;
  price: number;
  targetLots: number;
  totalValueIdr: number;
  alphaScore: number;
  signalReason: string;
  marketRegime: 'BULL_MOMENTUM' | 'BEAR_DRAWDOWN' | 'HIGH_VOLATILITY' | 'CALM_EQUILIBRIUM';
  isCrypto: boolean;
  atr?: number;
}

export interface TreeOfThoughtsBranch {
  id: 'H1_MOMENTUM' | 'H2_ACCUMULATION' | 'H3_HEDGE';
  thesis: string;
  expectedAlphaBps: number;
  maxDrawdownExposurePct: number;
  signalToNoiseRatio: number; // 0.0 - 1.0
  epistemicConfidence: number; // 0.0 - 1.0
  score: number;
  pruned: boolean;
}

export interface CriticAuditReport {
  passed: boolean;
  detectedBiases: string[];
  falsificationVulnerabilities: string[];
  suggestedActionClampPct: number; // e.g., 100% or 50%
}

export interface TieredEvaluationResult {
  approved: boolean;
  tier: ExecutionTier;
  targetEngine: 'freqtrade' | 'lumibot';
  reason: string;
  adjustedLots: number;
  totWinner?: TreeOfThoughtsBranch;
  criticReport?: CriticAuditReport;
  pastMistakesConsidered: EpisodicHeuristic[];
  quorumScore: {
    leadVote: 'APPROVE' | 'REJECT';
    alphaVote: 'APPROVE' | 'REJECT';
    riskVote: 'APPROVE' | 'VETO';
    approvalRatio: number;
  };
}

export interface TradeOutcomeTelemetry {
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  realizedPnlIdr: number;
  realizedPnlPct: number;
  stopLossHit: boolean;
  marketRegime: 'BULL_MOMENTUM' | 'BEAR_DRAWDOWN' | 'HIGH_VOLATILITY' | 'CALM_EQUILIBRIUM';
  rationale: string;
  engineUsed: 'freqtrade' | 'lumibot';
}

// Plafon Nominal untuk Tier 1 (Rp 20 Juta / ~$1,300)
const TIER_1_NOMINAL_LIMIT_IDR = 20_000_000;

export class TieredCognitivePipeline {
  private lastEvaluation: TieredEvaluationResult | null = null;
  private recentPostMortemLogs: string[] = [];

  /**
   * Evaluasi Bertingkat (Tiered Pipeline Decision Router)
   */
  public async evaluateTradeProposal(
    proposal: TradeCandidateProposal
  ): Promise<TieredEvaluationResult> {
    const targetEngine: 'freqtrade' | 'lumibot' = proposal.isCrypto ? 'freqtrade' : 'lumibot';
    const pastMistakes = globalEpisodicMemory.retrieveSimilarMistakes(
      proposal.symbol,
      proposal.marketRegime,
      3
    );

    // Kriteria Eskalasi ke Tier 2:
    // 1. Nominal order besar (>= Rp 20 Juta), ATAU
    // 2. Regime pasar berbahaya (BEAR_DRAWDOWN / HIGH_VOLATILITY), ATAU
    // 3. Ada memori kegagalan masa lalu yang terdeteksi untuk aset ini
    const requiresDeepCognitiveGate =
      proposal.totalValueIdr >= TIER_1_NOMINAL_LIMIT_IDR ||
      proposal.marketRegime === 'BEAR_DRAWDOWN' ||
      proposal.marketRegime === 'HIGH_VOLATILITY' ||
      pastMistakes.length > 0;

    // ─────────────────────────────────────────────────────────────
    // JALUR TIER 1: FAST LINEAR GATE (< 100ms)
    // ─────────────────────────────────────────────────────────────
    if (!requiresDeepCognitiveGate) {
      const isAlphaAdequate = proposal.alphaScore >= 75;
      const isSizingSafe = proposal.targetLots > 0 && proposal.totalValueIdr > 0;

      const result: TieredEvaluationResult = {
        approved: isAlphaAdequate && isSizingSafe,
        tier: 'TIER_1_FAST',
        targetEngine,
        reason: isAlphaAdequate
          ? `[TIER 1 FAST] Order di bawah plafon Rp 20jt dan regime stabil (${proposal.marketRegime}). Diteruskan langsung ke ${targetEngine.toUpperCase()} Engine.`
          : `[TIER 1 FAST REJECT] Skor Alpha (${proposal.alphaScore}) di bawah ambang 75.`,
        adjustedLots: proposal.targetLots,
        pastMistakesConsidered: [],
        quorumScore: {
          leadVote: isAlphaAdequate ? 'APPROVE' : 'REJECT',
          alphaVote: isAlphaAdequate ? 'APPROVE' : 'REJECT',
          riskVote: 'APPROVE',
          approvalRatio: isAlphaAdequate ? 1.0 : 0.0,
        },
      };

      this.lastEvaluation = result;
      return result;
    }

    // ─────────────────────────────────────────────────────────────
    // JALUR TIER 2: DEEP COGNITIVE CONSENSUS (2-4 detik)
    // ─────────────────────────────────────────────────────────────
    // 1. Periksa Anti-Pattern Violation dari Memori Masa Lalu
    let antiPatternViolationReason: string | null = null;
    for (const mistake of pastMistakes) {
      if (
        mistake.regime === proposal.marketRegime &&
        mistake.rootCause === 'ASSUMPTION_ERROR' &&
        proposal.signalReason.toLowerCase().includes('breakout')
      ) {
        antiPatternViolationReason = `Melanggar Aturan Memori: ${mistake.rule}`;
        break;
      }
    }

    // 2. Tree-of-Thoughts (ToT) Branching
    const totBranches: TreeOfThoughtsBranch[] = [
      {
        id: 'H1_MOMENTUM',
        thesis: `Breakout Momentum kelanjutan tren (${proposal.symbol})`,
        expectedAlphaBps: Math.round(proposal.alphaScore * 4.5),
        maxDrawdownExposurePct: proposal.marketRegime === 'BEAR_DRAWDOWN' ? 5.5 : 2.5,
        signalToNoiseRatio: 0.72,
        epistemicConfidence: 0.8,
        score: 0,
        pruned: false,
      },
      {
        id: 'H2_ACCUMULATION',
        thesis: `Akumulasi bertahap di area Support / Smart Money Order Block`,
        expectedAlphaBps: Math.round(proposal.alphaScore * 3.8),
        maxDrawdownExposurePct: 1.8,
        signalToNoiseRatio: 0.85,
        epistemicConfidence: 0.88,
        score: 0,
        pruned: false,
      },
      {
        id: 'H3_HEDGE',
        thesis: `Pasif defensif / Invalidation Hedge (Wait and see)`,
        expectedAlphaBps: 50,
        maxDrawdownExposurePct: 0.5,
        signalToNoiseRatio: 0.95,
        epistemicConfidence: 0.95,
        score: 0,
        pruned: false,
      },
    ];

    // Evaluasi cabang ToT
    for (const branch of totBranches) {
      const riskDenom = Math.max(0.1, branch.maxDrawdownExposurePct);
      const alphaNormalized = branch.expectedAlphaBps / 100;
      const rawScore = (alphaNormalized * branch.signalToNoiseRatio * branch.epistemicConfidence) / riskDenom;
      branch.score = Number(Math.min(1.0, rawScore / 5).toFixed(3));
      branch.pruned = branch.score < 0.35;
    }

    const viableBranches = totBranches.filter((b) => !b.pruned).sort((a, b) => b.score - a.score);
    const totWinner = viableBranches.length > 0 ? viableBranches[0] : totBranches[2];

    // 3. Dialectical Red-Teaming ("The Critic")
    const detectedBiases: string[] = [];
    const vulnerabilities: string[] = [];
    let suggestedClamp = 1.0;

    if (proposal.marketRegime === 'HIGH_VOLATILITY') {
      detectedBiases.push('OVERCONFIDENCE');
      vulnerabilities.push('Volatilitas tinggi meningkatkan risiko wick slippage.');
      suggestedClamp = 0.5; // Pangkas lot 50%
    }

    if (proposal.marketRegime === 'BEAR_DRAWDOWN' && proposal.signalReason.toLowerCase().includes('breakout')) {
      detectedBiases.push('RECENCY_BIAS');
      vulnerabilities.push('Breakout di fase bear market memiliki probabilitas false break 68%.');
      suggestedClamp = 0.4;
    }

    const criticPassed = detectedBiases.length === 0 || suggestedClamp >= 0.5;
    const criticReport: CriticAuditReport = {
      passed: criticPassed,
      detectedBiases,
      falsificationVulnerabilities: vulnerabilities,
      suggestedActionClampPct: Math.round(suggestedClamp * 100),
    };

    // 4. Quorum Consensus Voting
    const leadVote = antiPatternViolationReason ? 'REJECT' : 'APPROVE';
    const alphaVote = totWinner.id !== 'H3_HEDGE' && proposal.alphaScore >= 75 ? 'APPROVE' : 'REJECT';
    
    // Risk Auditor memiliki hak VETO mutlak
    let riskVote: 'APPROVE' | 'VETO' = 'APPROVE';
    if (antiPatternViolationReason) {
      riskVote = 'VETO';
    } else if (proposal.marketRegime === 'HIGH_VOLATILITY' && !proposal.isCrypto && proposal.targetLots > 50) {
      riskVote = 'VETO';
    } else if (detectedBiases.includes('RECENCY_BIAS') && proposal.marketRegime === 'BEAR_DRAWDOWN') {
      riskVote = 'VETO';
    }

    const approveVotes = [leadVote === 'APPROVE', alphaVote === 'APPROVE', riskVote === 'APPROVE'].filter(Boolean).length;
    const approvalRatio = approveVotes / 3;
    const quorumPassed = approvalRatio >= 2 / 3 && riskVote !== 'VETO';

    const finalLots = Math.max(1, Math.round(proposal.targetLots * suggestedClamp));

    const result: TieredEvaluationResult = {
      approved: quorumPassed,
      tier: 'TIER_2_COGNITIVE',
      targetEngine,
      reason: quorumPassed
        ? `[TIER 2 KONSENSUS DISETUJUI] Kuorum ${(approvalRatio * 100).toFixed(0)}% lolos. Hipotesis unggul: ${totWinner.thesis}. Alokasi disesuaikan: ${finalLots} lot (${criticReport.suggestedActionClampPct}% dari nominal awal). Diteruskan ke ${targetEngine.toUpperCase()} Engine.`
        : `[TIER 2 DITOLAK / VETO] ${antiPatternViolationReason || (riskVote === 'VETO' ? 'Risk Auditor mengaktifkan Hak Veto Mutlak.' : 'Kuorum tidak mencapai 2/3.')}`,
      adjustedLots: quorumPassed ? finalLots : 0,
      totWinner,
      criticReport,
      pastMistakesConsidered: pastMistakes,
      quorumScore: {
        leadVote,
        alphaVote,
        riskVote,
        approvalRatio: Number(approvalRatio.toFixed(2)),
      },
    };

    this.lastEvaluation = result;
    return result;
  }

  /**
   * JALUR TIER 3: ASYNCHRONOUS POST-MORTEM REFLECTION
   * Dijalankan di latar belakang saat transaksi selesai rugi / kena stop loss
   */
  public async triggerAsyncPostMortem(outcome: TradeOutcomeTelemetry): Promise<void> {
    if (!outcome.stopLossHit && outcome.realizedPnlPct >= -1.5) {
      return; // Tidak perlu post-mortem jika trade untung atau drawdown kecil normal
    }

    // Ekstraksi Root Cause Analysis (RCA)
    let rootCause: 'ASSUMPTION_ERROR' | 'EXECUTION_SLIPPAGE' | 'DATA_ANOMALY' | 'REGIME_SHIFT' = 'ASSUMPTION_ERROR';
    let ruleText = '';

    if (outcome.marketRegime === 'BEAR_DRAWDOWN') {
      rootCause = 'REGIME_SHIFT';
      ruleText = `Dilarang Long agresif di ${outcome.symbol} saat regime BEAR_DRAWDOWN. Batasi drawdown dengan konfirmasi candle harian.`;
    } else if (outcome.realizedPnlPct <= -5.0) {
      rootCause = 'EXECUTION_SLIPPAGE';
      ruleText = `Slippage ekstrim di ${outcome.symbol} (${outcome.realizedPnlPct}%). Wajib gunakan limit order / iceberg pada ${outcome.engineUsed.toUpperCase()}.`;
    } else {
      ruleText = `Stop Loss tersentuh di ${outcome.symbol}. Perlebar buffer stoploss berbasis ATR atau kurangi ukuran lot awal.`;
    }

    const committed = globalEpisodicMemory.commitLesson({
      symbol: outcome.symbol,
      regime: outcome.marketRegime,
      rootCause,
      rule: ruleText,
      pnlPct: Number(outcome.realizedPnlPct.toFixed(2)),
      tags: [outcome.symbol, outcome.marketRegime, outcome.engineUsed.toUpperCase()],
    });

    const logEntry = `[TIER 3 POST-MORTEM] Pelajaran baru dikomit (${committed.id}): "${committed.rule}"`;
    this.recentPostMortemLogs.unshift(logEntry);
    if (this.recentPostMortemLogs.length > 20) this.recentPostMortemLogs.pop();
  }

  public getLastEvaluation(): TieredEvaluationResult | null {
    return this.lastEvaluation;
  }

  public getRecentPostMortemLogs(): string[] {
    return [...this.recentPostMortemLogs];
  }
}

export const globalTieredEngine = new TieredCognitivePipeline();
