/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TRADESIMS PRO — AUTONOMOUS MARKET BRIEFING & DISPATCH ENGINE
 * Inspired by MaxMiksa/Autonomous-Company (marketing-godin.md & operations-pg.md)
 * ─────────────────────────────────────────────────────────────────────────────
 * Menghasilkan ringkasan intelijen pasar otonom (Morning Briefing & Closing Wrap)
 * dan mempublikasikannya ke Telegram Bot / Dashboard tanpa campur tangan manusia.
 */

import { scanUniverseForTopAlpha } from '@/lib/hedgefund/autonomousStockPicker';
import { evaluateMungerInversion } from '@/lib/hedgefund/mungerInversionEngine';
import { calculateCfoRiskAudit } from '@/lib/hedgefund/cfoRiskGuardian';
import type { PortfolioSnapshot } from '@/types/hedgefund';

export interface MarketBriefingPayload {
  type: 'MORNING_OPEN' | 'CLOSING_WRAP';
  timestamp: number;
  formattedTimeWib: string;
  regime: string;
  headline: string;
  executiveSummary: string;
  topAlphaPicks: {
    symbol: string;
    score: number;
    mungerVerdict: string;
    catalyst: string;
    targetPrice: number;
  }[];
  cfoStatus: {
    navUsd: number;
    drawdownPct: number;
    protectionTier: string;
  };
  telegramMessageHtml: string;
}

export async function generateAutonomousBriefing(
  type: 'MORNING_OPEN' | 'CLOSING_WRAP' = 'MORNING_OPEN',
  portfolio?: PortfolioSnapshot
): Promise<MarketBriefingPayload> {
  const now = new Date();
  const timeWib = now.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Default portfolio fallback
  const p: PortfolioSnapshot = portfolio || {
    cash: 100_000_000,
    realizedPL: 4_250_000,
    holdings: [
      { displaySymbol: 'BBCA', lots: 25 },
      { displaySymbol: 'BTC', lots: 0.15 },
    ],
    trades: [],
  };

  // Pindai Universe untuk Alpha Teratas
  const scan = scanUniverseForTopAlpha([], undefined, (p.holdings || []).map((h) => h.displaySymbol));
  const topPicks = scan.rankedLeaderboard.slice(0, 3).map((item) => {
    const candidate = scan.scannedEvaluations.find((e) => e.symbol === item.symbol) || {
      symbol: item.symbol,
      score: item.score,
      keyDrivers: ['Momentum Alpha Kuat', 'Arus Kas Stabil'],
      technicalAnalysis: { rsi: 54 },
      sizing: { targetPrice: 10000, stopLoss: 9200 },
    };
    const mungerAudit = evaluateMungerInversion(candidate as any, null, p);
    return {
      symbol: item.symbol,
      score: item.score,
      mungerVerdict: mungerAudit.verdict,
      catalyst: item.drivers[0] || 'Pertumbuhan Volume & Alpha Kuantitatif',
      targetPrice: candidate.sizing?.targetPrice || 0,
    };
  });

  const cfo = calculateCfoRiskAudit(p);

  const isMorning = type === 'MORNING_OPEN';
  const headline = isMorning
    ? `🌅 TradeSims Morning Intel — Pembukaan Pasar ${dateStr}`
    : `🌆 TradeSims Closing Wrap — Penutupan Sesi ${dateStr}`;

  const executiveSummary = isMorning
    ? `Pasar bersiap membuka sesi dengan sentimen ${scan.dominantCategory}. Algoritma mengidentifikasi ${topPicks.length} peluang alpha dengan validasi Red-Team Munger.`
    : `Sesi perdagangan ditutup dengan status portofolio ${cfo.status}. Total NAV $${cfo.currentNavUsd.toLocaleString()} USD dengan kontrol drawdown -${cfo.drawdownPct}%.`;

  // Format pesan ramah Telegram HTML
  let telegramHtml = `<b>${headline}</b>\n`;
  telegramHtml += `<i>Waktu: ${timeWib} WIB | Status: ${cfo.capitalProtectionTier}</i>\n\n`;
  telegramHtml += `📊 <b>Ringkasan Eksekutif:</b>\n${executiveSummary}\n\n`;

  telegramHtml += `🎯 <b>Top Alpha Picks (Vetted by Munger Red-Team):</b>\n`;
  topPicks.forEach((pick, idx) => {
    const badge = pick.mungerVerdict === 'APPROVED' ? '✅ [Lolos Munger]' : pick.mungerVerdict === 'CONDITIONAL' ? '⚠️ [Kondisional]' : '🚫 [Ditolak Red-Team]';
    telegramHtml += `${idx + 1}. <b>${pick.symbol}</b> (Skor ${pick.score}/100) ${badge}\n`;
    telegramHtml += `   └ <i>Katalis: ${pick.catalyst}</i>\n`;
  });

  telegramHtml += `\n⚖️ <b>Audit CFO & Proteksi Modal:</b>\n`;
  telegramHtml += `• NAV Portofolio: <b>$${cfo.currentNavUsd.toLocaleString()} USD</b>\n`;
  telegramHtml += `• Drawdown: <b>-${cfo.drawdownPct}%</b> (Toleransi Maks: 3.0%)\n`;
  telegramHtml += `• Sizing Kelly Optimal: <b>${(cfo.kellyOptimalSizingFraction * 100).toFixed(1)}%</b> per posisi\n\n`;
  telegramHtml += `🔗 <a href="https://tradingsims.my.id/ai">Buka TradeSim Virtual Office &rarr;</a>`;

  return {
    type,
    timestamp: Date.now(),
    formattedTimeWib: `${timeWib} WIB`,
    regime: scan.dominantCategory,
    headline,
    executiveSummary,
    topAlphaPicks: topPicks,
    cfoStatus: {
      navUsd: cfo.currentNavUsd,
      drawdownPct: cfo.drawdownPct,
      protectionTier: cfo.capitalProtectionTier,
    },
    telegramMessageHtml: telegramHtml,
  };
}
