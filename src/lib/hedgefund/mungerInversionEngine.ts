/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TRADESIMS PRO — MUNGER INVERSION PROTOCOL ENGINE
 * Inspired by MaxMiksa/Autonomous-Company (critic-munger.md)
 * ─────────────────────────────────────────────────────────────────────────────
 * Filosofi: "Invert, always invert." — Charlie Munger.
 * Red-team pre-mortem validator yang secara agresif mencari alasan kenapa
 * sebuah transaksi saham/crypto BISA GAGAL sebelum modal dialokasikan.
 */

import type { StockAlphaEvaluation } from '@/lib/agents/groundedStockIntelligence';
import type { StockQuote } from '@/types';
import type { PortfolioSnapshot } from '@/types/hedgefund';

export interface MungerInversionResult {
  verdict: 'APPROVED' | 'VETOED' | 'CONDITIONAL';
  criticName: string;
  preMortemRiskScore: number; // 0 (teraman) - 100 (sangat berbahaya/fatal)
  fatalFlawDetected: boolean;
  vetoReason?: string;
  inversionObservations: string[];
  asymmetricUpsideRatio: number;
  mungerMaxim: string;
  passedChecks: string[];
  mitigationAdvice: string;
}

const MUNGER_MAXIMS = [
  '“Invert, always invert: Put yourself in the shoes of the counterparty who is selling to you.”',
  '“It is remarkable how much long-term advantage people like us have gotten by trying to be consistently not stupid, instead of trying to be very intelligent.”',
  '“No wise pilot, no matter how great his talent and experience, fails to use his checklist.”',
  '“Acknowledging what you don’t know is the dawning of wisdom. Beware the false confidence of rapid price spikes.”',
  '“A great business at a fair price is superior to a fair business at a great price.”',
];

/**
 * Jalankan Audit Pre-Mortem Red-Team Munger terhadap kandidat aset
 */
export function evaluateMungerInversion(
  candidate: StockAlphaEvaluation,
  quote?: StockQuote | null,
  portfolio?: PortfolioSnapshot | null
): MungerInversionResult {
  const symbol = candidate.symbol.toUpperCase();
  const observations: string[] = [];
  const passedChecks: string[] = [];
  let riskScore = 15; // Baseline risk
  let fatalFlaw = false;
  let vetoReason: string | undefined = undefined;

  // ── CHECK 1: EVALUASI OVERHEATING & FOMO (RSI EXTREME) ──
  const rsi = candidate.technicalAnalysis?.rsi ?? 50;
  if (rsi >= 80) {
    riskScore += 35;
    observations.push(`⚠️ Ekstrem Overbought (RSI ${rsi.toFixed(1)}): Risiko blow-off top & sudden liquidity dry-up sangat tinggi.`);
    if (rsi >= 85) {
      fatalFlaw = true;
      vetoReason = `RSI ${rsi.toFixed(1)} mencerminkan euforia retail yang rawan pembalikan instan (FOMO Trap).`;
    }
  } else if (rsi >= 70) {
    riskScore += 15;
    observations.push(`RSI ${rsi.toFixed(1)} mendekati batas jenuh beli, momentum mulai rentan koreksi.`);
  } else {
    passedChecks.push(`Momentum RSI (${rsi.toFixed(1)}) berada dalam zona rasional, terhindar dari euforia ekstrem.`);
  }

  // ── CHECK 2: SMART MONEY / BANDARMOLOGI FAKEOUT ──
  const bandarVolume = candidate.smartMoneyFlow?.accumulationVolume || 0;
  const isAccumulating = candidate.smartMoneyFlow?.status === 'ACCUMULATION';
  const isDistribution = candidate.smartMoneyFlow?.status === 'DISTRIBUTION';

  if (isDistribution && candidate.score > 70) {
    riskScore += 40;
    fatalFlaw = true;
    vetoReason = `Divergensi Negatif Fatal: Skor teknikal tinggi (${candidate.score}) namun Smart Money sedang DISTRIBUSI (buang barang).`;
    observations.push(`🚨 Jebakan Distribusi: Terdeteksi upaya retail markup sementara bandar melepas posisi.`);
  } else if (isAccumulating) {
    passedChecks.push(`Smart Money selaras: Akumulasi institusi valid tanpa anomali buang barang.`);
  } else {
    observations.push(`Arus dana netral: Belum ada konfirmasi akumulasi institusi skala besar.`);
  }

  // ── CHECK 3: ASYMMETRIC RISK/REWARD RATIO ──
  const stopLoss = candidate.sizing?.stopLoss || 0;
  const targetPrice = candidate.sizing?.targetPrice || 0;
  const currentPrice = quote?.price || 1;

  let rrRatio = 2.0;
  if (currentPrice > 0 && stopLoss > 0 && targetPrice > currentPrice) {
    const upside = targetPrice - currentPrice;
    const downside = Math.max(1, currentPrice - stopLoss);
    rrRatio = parseFloat((upside / downside).toFixed(2));

    if (rrRatio < 1.5) {
      riskScore += 25;
      observations.push(`Rasio Risk/Reward tidak asimetris (${rrRatio}:1). Munger Rule: Jangan ambil risiko tanpa ganjaran minimal 1.5x.`);
      if (rrRatio < 1.0) {
        fatalFlaw = true;
        vetoReason = `Rasio Risk/Reward (${rrRatio}:1) di bawah 1:1 — asimetri negatif yang merugikan ekspektasi jangka panjang.`;
      }
    } else {
      passedChecks.push(`Rasio Asimetri Menguntungkan: R:R ${rrRatio}:1 memberikan margin of safety memadai.`);
    }
  }

  // ── CHECK 4: PORTFOLIO CONCENTRATION & EXPOSURE ──
  if (portfolio && portfolio.holdings) {
    const existingHolding = portfolio.holdings.find(
      (h) => h.displaySymbol?.toUpperCase() === symbol
    );
    if (existingHolding) {
      const currentNav = portfolio.cash + portfolio.holdings.reduce((sum, h) => sum + (h.lots * 100 * (quote?.price || 1)), 0);
      const holdingValue = existingHolding.lots * 100 * (quote?.price || 1);
      const concentrationPct = currentNav > 0 ? (holdingValue / currentNav) * 100 : 0;

      if (concentrationPct > 25) {
        riskScore += 30;
        fatalFlaw = true;
        vetoReason = `Over-Konsentrasi Portofolio: ${symbol} telah mencakup ${concentrationPct.toFixed(1)}% dari total NAV (Maks 25%).`;
        observations.push(`Batas eksposur terlewati untuk satu aset tunggal.`);
      } else {
        passedChecks.push(`Eksposur portofolio terkendali (${concentrationPct.toFixed(1)}% dari NAV).`);
      }
    }
  }

  // ── KESIMPULAN VERDICT ──
  let verdict: 'APPROVED' | 'VETOED' | 'CONDITIONAL';
  if (fatalFlaw || riskScore >= 65) {
    verdict = 'VETOED';
  } else if (riskScore >= 40) {
    verdict = 'CONDITIONAL';
  } else {
    verdict = 'APPROVED';
  }

  const randomMaxim = MUNGER_MAXIMS[Math.floor(Math.abs(symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % MUNGER_MAXIMS.length)];

  return {
    verdict,
    criticName: 'Charlie Munger (Red-Team Inversion)',
    preMortemRiskScore: Math.min(100, riskScore),
    fatalFlawDetected: fatalFlaw,
    vetoReason,
    inversionObservations: observations,
    asymmetricUpsideRatio: rrRatio,
    mungerMaxim: randomMaxim,
    passedChecks,
    mitigationAdvice: verdict === 'VETOED'
      ? 'BATALKAN EKSEKUSI. Red-Team mendeteksi risiko asimetris fatal. Cari kandidat dengan margin of safety lebih kokoh.'
      : verdict === 'CONDITIONAL'
      ? 'PANGKAS LOT SEBESAR 50%. Jalankan order bertahap (scaled-in) dengan trailing stop ketat.'
      : 'DISETUJUI PENUH. Tesis investasi lolos uji pre-mortem tanpa anomali fatal.',
  };
}
