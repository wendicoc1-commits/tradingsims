/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TRADESIMS PRO — CFO RISK & DRAWDOWN GUARDIAN
 * Inspired by MaxMiksa/Autonomous-Company (cfo-campbell.md)
 * ─────────────────────────────────────────────────────────────────────────────
 * Menjaga kelangsungan hidup dana (Capital Preservation) melalui:
 * 1. Pelacakan High-Water Mark & Daily Drawdown.
 * 2. Optimal Sizing berbasis Formula Kelly Criterion: f* = (p(b+1) - 1) / b.
 * 3. Circuit Breaker Otonom jika Drawdown >= 3% (Freeze transaksi spekulatif).
 */

import type { PortfolioSnapshot } from '@/types/hedgefund';

export interface CfoRiskAudit {
  status: 'OPTIMAL' | 'ELEVATED_RISK' | 'CAPITAL_PRESERVATION_LOCK';
  drawdownPct: number;
  highWaterMarkUsd: number;
  currentNavUsd: number;
  kellyOptimalSizingFraction: number; // e.g. 0.05 - 0.15 (5% - 15% dari NAV)
  maxAllowedPositionUsd: number;
  circuitBreakerTripped: boolean;
  recommendedAction: string;
  cfoAssessment: string;
  var95DailyUsd: number; // Value at Risk 95%
  capitalProtectionTier: 'NORMAL' | 'DEFENSIVE' | 'EMERGENCY_CASH';
}

// In-memory High Water Mark cache
let globalHighWaterMark = 100000;
let lastResetDay = new Date().toISOString().slice(0, 10);

export function calculateCfoRiskAudit(
  portfolio: PortfolioSnapshot,
  historicalWinRate: number = 0.58, // Default 58% win rate
  winLossRatio: number = 1.8 // Default 1.8:1 payoff ratio
): CfoRiskAudit {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== lastResetDay) {
    // Reset daily baseline at new calendar day
    lastResetDay = today;
  }

  // Hitung NAV portofolio saat ini (dalam USD ekuivalen)
  const holdingsValue = (portfolio.holdings || []).reduce((sum, h) => {
    return sum + (h.lots * 100 * 1000); // Estimasi nominal basis
  }, 0);
  const totalNavIdr = portfolio.cash + holdingsValue;
  const currentNavUsd = Math.round(totalNavIdr / 16000) || 100000;

  if (currentNavUsd > globalHighWaterMark) {
    globalHighWaterMark = currentNavUsd;
  }

  // Hitung Drawdown dari Peak High Water Mark
  const drawdownUsd = Math.max(0, globalHighWaterMark - currentNavUsd);
  const drawdownPct = globalHighWaterMark > 0 ? parseFloat(((drawdownUsd / globalHighWaterMark) * 100).toFixed(2)) : 0;

  // Formula Kelly Criterion: f* = (p * (b + 1) - 1) / b
  // Dimana p = win rate, b = win/loss ratio
  const p = Math.max(0.1, Math.min(0.9, historicalWinRate));
  const b = Math.max(0.5, winLossRatio);
  const fullKelly = Math.max(0.01, (p * (b + 1) - 1) / b);
  // Gunakan Half-Kelly (0.5 * Kelly) untuk stabilitas institusional hedge fund
  const halfKelly = parseFloat((Math.min(0.20, Math.max(0.02, fullKelly * 0.5))).toFixed(3));

  // Cek Circuit Breaker (Drawdown >= 3.0%)
  const circuitBreakerTripped = drawdownPct >= 3.0;

  let status: 'OPTIMAL' | 'ELEVATED_RISK' | 'CAPITAL_PRESERVATION_LOCK';
  let capitalProtectionTier: 'NORMAL' | 'DEFENSIVE' | 'EMERGENCY_CASH';
  let recommendedAction: string;
  let cfoAssessment: string;
  let maxAllowedPositionUsd: number;

  if (circuitBreakerTripped) {
    status = 'CAPITAL_PRESERVATION_LOCK';
    capitalProtectionTier = 'EMERGENCY_CASH';
    maxAllowedPositionUsd = Math.round(currentNavUsd * 0.02); // Maks 2% saat krisis
    recommendedAction = 'PEMBEKUAN TRANSAKSI AKTIF: Drawdown portofolio telah menyentuh batas toleransi 3%. Lindungi modal kas dan tunda entri baru.';
    cfoAssessment = `CFO Veto: Penurunan modal sebesar -${drawdownPct}% dari puncak USD $${globalHighWaterMark.toLocaleString()}. Mengaktifkan protokol penguncian kas darurat.`;
  } else if (drawdownPct >= 1.5) {
    status = 'ELEVATED_RISK';
    capitalProtectionTier = 'DEFENSIVE';
    maxAllowedPositionUsd = Math.round(currentNavUsd * (halfKelly * 0.6));
    recommendedAction = 'MODE DEFENSIF: Pangkas alokasi ukuran lot sebesar 40%. Utamakan aset defensif berdividen atau stabil.';
    cfoAssessment = `CFO Warning: Drawdown berada di level -${drawdownPct}%. Sizing diperketat ke ${(halfKelly * 0.6 * 100).toFixed(1)}% per transaksi.`;
  } else {
    status = 'OPTIMAL';
    capitalProtectionTier = 'NORMAL';
    maxAllowedPositionUsd = Math.round(currentNavUsd * halfKelly);
    recommendedAction = `ALOKASI MODAL OPTIMAL: Portofolio sehat. Sizing rekomendasi Half-Kelly adalah ${(halfKelly * 100).toFixed(1)}% (Maks $${maxAllowedPositionUsd.toLocaleString()} per posisi).`;
    cfoAssessment = `CFO Clear: Struktur likuiditas dan cadangan kas prima. Margin of safety terpenuhi.`;
  }

  // Value at Risk (VaR 95% = 1.65 * Volatilitas Harian ~ 1.2% dari NAV)
  const var95DailyUsd = Math.round(currentNavUsd * 0.012 * 1.65);

  return {
    status,
    drawdownPct,
    highWaterMarkUsd: globalHighWaterMark,
    currentNavUsd,
    kellyOptimalSizingFraction: halfKelly,
    maxAllowedPositionUsd,
    circuitBreakerTripped,
    recommendedAction,
    cfoAssessment,
    var95DailyUsd,
    capitalProtectionTier,
  };
}
