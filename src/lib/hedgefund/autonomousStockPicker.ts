/**
 * Fincept Capital — Autonomous Stock Selection & Alpha Screening Engine
 * 
 * Sistem ini memindai seluruh semesta emiten (universe) secara otonom
 * menggunakan 4 pilar kuantitatif & fundamental:
 * 1. Fundamental Quality Score (ROE, P/E diskon vs mean, Margin, Free Cash Flow)
 * 2. Quantitative / SMC Score (Order Block Demand, Bullish FVG, MTF Trend, R:R)
 * 3. Institutional Consensus & Flow (Bloomberg 12M Target, Insider Sentiment)
 * 4. Newsroom Live Crawler Sentiment (Google News RSS sentiment ratio)
 * 
 * Hasilnya: Leaderboard transparan dan pemilihan otomatis emiten #1 (Top Pick)
 * untuk diinvestasikan oleh Portfolio Management Pods tanpa perlu pemilihan manual.
 */

import { getGroundedStockIntelligence, type GroundedStockIntelligence } from '@/lib/agents/groundedStockIntelligence';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';
import type { LiveQuote, NewsItem } from '@/lib/hedgefund/deskReports';
import { checkIDXMarketStatus, isIndonesianStock } from '@/lib/market/marketHours';

export const UNIVERSE_TICKERS = [
  // Big Banks & Finance
  'BBCA', 'BMRI', 'BBRI', 'BBNI', 'BRIS', 'ARTO', 'BBTN',
  // Energy, Coal, Oil & Gas
  'ADRO', 'PTBA', 'PGAS', 'MEDC', 'AKRA', 'ENRG', 'PGEO', 'HRUM',
  // Conglomerate & Tech
  'ASII', 'GOTO', 'BUKA', 'EMTK',
  // Telco & Infrastructure
  'TLKM', 'ISAT', 'EXCL', 'TOWR', 'TBIG', 'JSMR',
  // Basic Materials, Metals, Mining & Conglomerate Leaders
  'AMMN', 'INKP', 'MDKA', 'ANTM', 'INCO', 'SMGR', 'BRPT', 'TPIA', 'BREN', 'CUAN', 'PTRO', 'PANI', 'MBMA', 'NCKL',
  // Consumer Staples & Retail
  'ICBP', 'UNVR', 'MYOR', 'CPIN', 'INDF', 'KLBF', 'ACES', 'MAPI',
  // Top Liquid Crypto (Spot Jesse Desk)
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT',
  // Mega Cap Global Tech
  'NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL',
] as const;

export type UniverseTicker = (typeof UNIVERSE_TICKERS)[number];

export interface StockAlphaEvaluation {
  symbol: string;
  name: string;
  currency: 'IDR' | 'USD';
  currentPrice: number;
  score: number; // 0 - 100
  rank: number;
  conviction: 'TOP_PICK' | 'STRONG_BUY' | 'BUY' | 'HOLD' | 'AVOID';
  sector: string;
  breakdown: {
    fundamental: number;     // 0 - 25
    technicalQuant: number;  // 0 - 25
    institutional: number;   // 0 - 25
    newsSentiment: number;   // 0 - 25
  };
  metrics: {
    roe: number;
    peRatio: number;
    impliedUpsidePct: number;
    riskRewardRatio: number;
    mtfTrend: string;
    insiderSentiment: string;
    newsSentimentPct: number;
  };
  keyDrivers: string[];
  suggestedAction: {
    action: 'BUY' | 'WAIT';
    entry: number;
    stopLoss: number;
    targetPrice: number;
    riskRewardRatio: number;
    upsidePct: number;
  };
}

export interface UniverseScanResult {
  topPick: StockAlphaEvaluation;
  rankedLeaderboard: StockAlphaEvaluation[];
  scannedCount: number;
  timestamp: string;
  summaryThesis: string;
}

const POSITIVE_WORDS = [
  'rekor', 'laba', 'naik', 'tumbuh', 'dividen', 'lonjakan', 'akuisisi',
  'ekspansi', 'surplus', 'bullish', 'investasi', 'kinerja', 'positif',
  'untung', 'melejit', 'pertumbuhan', 'profit', 'gain', 'all-time',
];

const NEGATIVE_WORDS = [
  'turun', 'rugi', 'anjlok', 'gagal', 'merosot', 'bearish', 'defisit',
  'sanksi', 'beban', 'penurunan', 'anjlok', 'krisis', 'volatil', 'hambatan',
  'lemah', 'investigasi', 'denda',
];

function evaluateNewsSentiment(symbol: string, name: string, news: NewsItem[]): { score: number; pct: number } {
  if (!news || news.length === 0) {
    return { score: 15, pct: 60 }; // Default baseline
  }

  const symLower = symbol.toLowerCase();
  const nameParts = name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  const matched = news.filter((n) => {
    const text = (n.title + ' ' + (n.snippet || '')).toLowerCase();
    return text.includes(symLower) || nameParts.some((p) => text.includes(p));
  });

  if (matched.length === 0) {
    return { score: 16, pct: 64 };
  }

  let posCount = 0;
  let negCount = 0;

  matched.forEach((m) => {
    const text = (m.title + ' ' + (m.snippet || '')).toLowerCase();
    POSITIVE_WORDS.forEach((w) => {
      if (text.includes(w)) posCount++;
    });
    NEGATIVE_WORDS.forEach((w) => {
      if (text.includes(w)) negCount++;
    });
  });

  const total = posCount + negCount;
  if (total === 0) {
    return { score: 17, pct: 68 };
  }

  const positiveRatio = posCount / total;
  // Scaled 0 to 25
  const rawScore = Math.round(positiveRatio * 25);
  const score = Math.max(5, Math.min(25, rawScore));
  const pct = Math.round(positiveRatio * 100);

  return { score, pct };
}

function evaluateFundamentalScore(intel: GroundedStockIntelligence): { score: number; drivers: string[] } {
  const isCrypto = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT'].includes(intel.symbol.toUpperCase());
  if (isCrypto) {
    let score = 0;
    const drivers: string[] = [];
    const sym = intel.symbol.toUpperCase();
    if (['BTC', 'ETH'].includes(sym)) {
      score += 10;
      drivers.push(`Fundamental Kripto: Aset Tier-1 Dominan dengan likuiditas institusional global`);
    } else if (['SOL', 'BNB', 'XRP'].includes(sym)) {
      score += 8;
      drivers.push(`Fundamental Kripto: Ekosistem Layer-1 berkinerja tinggi dengan adopsi luas`);
    } else {
      score += 7;
      drivers.push(`Fundamental Kripto: Likuiditas spot tinggi di buku order 24/7`);
    }

    score += 8;
    drivers.push(`Arus Modal Institusional: Dukungan adopsi ETF spot & likuiditas global M2`);
    score += 6;
    drivers.push(`Tokenomics: Tanpa beban utang (Zero Debt) & desentralisasi jaringan`);
    return { score: Math.min(25, score), drivers };
  }

  let score = 0;
  const drivers: string[] = [];
  const fin = intel.financials;

  // ROE (Return on Equity) - max 8 poin
  if (fin.roe >= 18) {
    score += 8;
    drivers.push(`ROE Prima (${fin.roe.toFixed(1)}%) mencerminkan efisiensi modal institusional`);
  } else if (fin.roe >= 12) {
    score += 6;
    drivers.push(`ROE Sehat (${fin.roe.toFixed(1)}%)`);
  } else if (fin.roe >= 6) {
    score += 4;
  } else {
    score += 1;
  }

  // P/E Valuation - max 7 poin
  if (fin.peRatio > 0 && fin.peRatio <= 14) {
    score += 7;
    drivers.push(`Valuasi P/E menarik (${fin.peRatio.toFixed(1)}x) berada di bawah rata-rata historis`);
  } else if (fin.peRatio > 14 && fin.peRatio <= 22) {
    score += 5;
  } else if (fin.peRatio > 22 && fin.peRatio <= 35) {
    score += 3;
  } else if (fin.peRatio <= 0) {
    score += 0;
  } else {
    score += 2;
  }

  // Free Cash Flow & Margin - max 5 poin
  if (fin.fcfPositive && fin.netMarginPct >= 12) {
    score += 5;
    drivers.push(`Net Margin solid (${fin.netMarginPct.toFixed(1)}%) didukung FCF positif`);
  } else if (fin.fcfPositive || fin.netMarginPct >= 8) {
    score += 3;
  } else {
    score += 1;
  }

  // Debt to Equity Health - max 5 poin
  if (fin.debtToEquity < 1.0) {
    score += 5;
    drivers.push(`Neraca konservatif dengan D/E rendah (${fin.debtToEquity.toFixed(2)}x)`);
  } else if (fin.debtToEquity < 2.5) {
    score += 4;
  } else if (fin.debtToEquity < 6.0) {
    score += 3; // Wajar untuk bank
  } else {
    score += 1;
  }

  return { score: Math.min(25, score), drivers };
}

function evaluateTechnicalQuantScore(intel: GroundedStockIntelligence): { score: number; drivers: string[] } {
  let score = 0;
  const drivers: string[] = [];
  const tech = intel.technicals;

  // Multi-Timeframe Trend Consensus - max 9 poin
  if (tech.mtfConsensus === 'STRONG_BULLISH') {
    score += 9;
    drivers.push('Sinyal Kuantitatif: Multi-Timeframe Strong Bullish Alignment');
  } else if (tech.mtfConsensus === 'BULLISH') {
    score += 7;
    drivers.push('Sinyal Kuantitatif: MTF Trend Bullish');
  } else if (tech.mtfConsensus === 'NEUTRAL') {
    score += 4;
  } else {
    score += 1;
  }

  // Smart Money Concepts: Order Block & Fair Value Gap - max 8 poin
  let smcPoints = 0;
  if (tech.orderBlockDemand && tech.orderBlockDemand.min > 0) {
    smcPoints += 4;
    drivers.push(`SMC: Zona Order Block Demand teridentifikasi (${tech.orderBlockDemand.min.toLocaleString('id-ID')} - ${tech.orderBlockDemand.max.toLocaleString('id-ID')})`);
  }
  if (tech.fairValueGap && tech.fairValueGap.type === 'BULLISH') {
    smcPoints += 4;
    drivers.push('SMC: Terdapat Bullish Fair Value Gap (FVG) yang belum termitigasi');
  } else if (tech.fairValueGap) {
    smcPoints += 1;
  }
  score += Math.min(8, smcPoints);

  // Suggested Risk-Reward Ratio - max 8 poin
  const rr = tech.suggestedRiskReward;
  if (rr.action === 'BUY' && rr.ratio >= 2.5) {
    score += 8;
    drivers.push(`Risk-Reward asimetris menguntungkan (1 : ${rr.ratio.toFixed(2)})`);
  } else if (rr.action === 'BUY' && rr.ratio >= 1.8) {
    score += 6;
    drivers.push(`Risk-Reward memadai (1 : ${rr.ratio.toFixed(2)})`);
  } else if (rr.action === 'BUY') {
    score += 4;
  } else {
    score += 1;
  }

  return { score: Math.min(25, score), drivers };
}

function evaluateInstitutionalScore(intel: GroundedStockIntelligence): { score: number; drivers: string[] } {
  let score = 0;
  const drivers: string[] = [];
  const ic = intel.institutionalConsensus;
  const flow = intel.ownershipAndFlow;

  // Implied Upside % - max 10 poin
  if (ic.impliedUpsidePct >= 20) {
    score += 10;
    drivers.push(`Konsensus Bloomberg: Potensi kenaikan 12 bulan +${ic.impliedUpsidePct.toFixed(1)}%`);
  } else if (ic.impliedUpsidePct >= 10) {
    score += 7;
    drivers.push(`Konsensus Bloomberg: Potensi kenaikan +${ic.impliedUpsidePct.toFixed(1)}%`);
  } else if (ic.impliedUpsidePct >= 3) {
    score += 4;
  } else {
    score += 1;
  }

  // Consensus Rating - max 8 poin
  if (ic.consensusRating === 'STRONG BUY') {
    score += 8;
  } else if (ic.consensusRating === 'BUY') {
    score += 6;
  } else if (ic.consensusRating === 'HOLD') {
    score += 4;
  } else {
    score += 1;
  }

  // Insider, Foreign Flow & Bandarmologi Sentiment - max 7 poin
  const isCrypto = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT'].includes(intel.symbol.toUpperCase());
  if (isCrypto && intel.cryptoWhale) {
    if (intel.cryptoWhale.whaleSentiment === 'STRONG_ACCUMULATION') {
      score += 7;
      drivers.push(`On-Chain Whale: ${intel.cryptoWhale.whaleSentimentLabel} (${intel.cryptoWhale.netWhaleFlowFormatted})`);
    } else if (intel.cryptoWhale.whaleSentiment === 'MILD_ACCUMULATION') {
      score += 5;
      drivers.push(`On-Chain Whale: Akumulasi dompet paus terkonsentrasi (${intel.cryptoWhale.netWhaleFlowFormatted})`);
    } else if (intel.cryptoWhale.whaleSentiment === 'NEUTRAL') {
      score += 3;
    } else {
      score += 1;
    }
  } else if (intel.bandarmologi) {
    if (intel.bandarmologi.status === 'BIG_ACCUMULATION') {
      score += 7;
      drivers.push(`Bandarmologi: ${intel.bandarmologi.statusLabel} (${intel.bandarmologi.foreignNetFlowFormatted}) · Top Buyer: ${intel.bandarmologi.topBuyers.map((b) => b.code).join(', ')}`);
    } else if (intel.bandarmologi.status === 'NORMAL_ACCUMULATION') {
      score += 5;
      drivers.push(`Bandarmologi: ${intel.bandarmologi.statusLabel} (CR3: ${intel.bandarmologi.concentrationRatio3}%)`);
    } else if (intel.bandarmologi.status === 'NEUTRAL') {
      score += 3;
    } else {
      score += 1;
      drivers.push(`Bandarmologi: Waspada ${intel.bandarmologi.statusLabel} (${intel.bandarmologi.foreignNetFlowFormatted})`);
    }
  } else if (flow.insiderSentiment === 'VERY_BULLISH' || flow.insiderSentiment === 'BULLISH') {
    score += 6;
    drivers.push(`Arus Modal: Sentimen akumulasi insider/institusi ${flow.insiderSentiment}`);
  } else {
    score += 3;
  }

  return { score: Math.min(25, score), drivers };
}

function detectSector(symbol: string): string {
  const asset = getAssetBySymbol(symbol);
  if (asset?.sector) return asset.sector;
  if (['BBCA', 'BMRI', 'BBRI', 'BBNI', 'BRIS', 'ARTO', 'BBTN'].includes(symbol)) return 'Financials / Banking';
  if (['ADRO', 'PTBA', 'PGAS', 'MEDC', 'AKRA', 'ENRG', 'PGEO'].includes(symbol)) return 'Energy & Resources';
  if (['ICBP', 'UNVR', 'MYOR', 'CPIN', 'INDF', 'KLBF'].includes(symbol)) return 'Consumer Goods & Healthcare';
  if (['GOTO', 'BUKA', 'EMTK', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL'].includes(symbol)) return 'Technology & Media';
  if (['ASII'].includes(symbol)) return 'Automotive & Conglomerate';
  if (['TLKM', 'ISAT', 'EXCL', 'TOWR'].includes(symbol)) return 'Telecommunication & Infra';
  if (['AMMN', 'INKP', 'MDKA', 'ANTM', 'INCO', 'SMGR', 'BRPT', 'TPIA', 'BREN', 'CUAN', 'PTRO', 'PANI'].includes(symbol)) return 'Basic Materials, Mining & Conglomerate';
  if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK'].includes(symbol)) return 'Crypto (Jesse Desk)';
  return 'Equity Market';
}

/**
 * Memindai seluruh semesta emiten dan menyusun ranking Alpha komprehensif
 */
export function scanUniverseForTopAlpha(
  news: NewsItem[] = [],
  liveQuotes?: Record<string, LiveQuote>,
  extraTickers: string[] = []
): UniverseScanResult {
  const evaluations: StockAlphaEvaluation[] = [];

  const tickerPool = Array.from(
    new Set([
      ...UNIVERSE_TICKERS,
      ...extraTickers.map((t) => t.replace('.JK', '').replace(/USDT$/i, '').toUpperCase()),
    ])
  );

  for (const sym of tickerPool) {
    const liveQ = liveQuotes?.[sym];
    const intel = getGroundedStockIntelligence(sym, liveQ?.live ? liveQ.price : undefined);

    const fEval = evaluateFundamentalScore(intel);
    const tEval = evaluateTechnicalQuantScore(intel);
    const iEval = evaluateInstitutionalScore(intel);
    const nEval = evaluateNewsSentiment(sym, intel.name, news);

    const totalScore = Math.min(100, fEval.score + tEval.score + iEval.score + nEval.score);

    const isIndo = isIndonesianStock(sym);
    const idxMarketCheck = checkIDXMarketStatus();
    const isBEIOpen = idxMarketCheck.isOpen;

    let conviction: StockAlphaEvaluation['conviction'] = 'HOLD';
    if (!isBEIOpen && isIndo) {
      conviction = 'HOLD'; // Bursa BEI sedang tutup, saham tidak dapat dibeli saat ini
    } else if (totalScore >= 85) conviction = 'STRONG_BUY';
    else if (totalScore >= 75) conviction = 'BUY';
    else if (totalScore >= 60) conviction = 'HOLD';
    else conviction = 'AVOID';

    const allDrivers = [
      ...fEval.drivers.slice(0, 2),
      ...tEval.drivers.slice(0, 2),
      ...iEval.drivers.slice(0, 1),
    ];

    if (!isBEIOpen && isIndo) {
      allDrivers.unshift('Bursa BEI Tutup (Buka 09:00 WIB) — Di luar jam perdagangan reguler');
    }

    if (nEval.pct >= 70) {
      allDrivers.push(`Sentimen Berita Live: ${nEval.pct}% sentimen positif dari crawler`);
    }

    const rr = intel.technicals.suggestedRiskReward;
    // Jika bursa BEI tutup, aksi saham Indonesia wajib WAIT, bukan BUY
    const action = (!isBEIOpen && isIndo) ? 'WAIT' : (rr.action === 'BUY' ? 'BUY' : 'WAIT');

    evaluations.push({
      symbol: sym,
      name: intel.name,
      currency: intel.currency,
      currentPrice: intel.currentPrice,
      score: totalScore,
      rank: 0, // diisi setelah sorting
      conviction,
      sector: detectSector(sym),
      breakdown: {
        fundamental: fEval.score,
        technicalQuant: tEval.score,
        institutional: iEval.score,
        newsSentiment: nEval.score,
      },
      metrics: {
        roe: intel.financials.roe,
        peRatio: intel.financials.peRatio,
        impliedUpsidePct: intel.institutionalConsensus.impliedUpsidePct,
        riskRewardRatio: rr.ratio,
        mtfTrend: intel.technicals.mtfConsensus,
        insiderSentiment: intel.ownershipAndFlow.insiderSentiment,
        newsSentimentPct: nEval.pct,
      },
      keyDrivers: allDrivers,
      suggestedAction: {
        action,
        entry: rr.entry,
        stopLoss: rr.stopLoss,
        targetPrice: rr.tp1,
        riskRewardRatio: rr.ratio,
        upsidePct: intel.institutionalConsensus.impliedUpsidePct,
      },
    });
  }

  const idxMarketCheck = checkIDXMarketStatus();
  const isBEIOpen = idxMarketCheck.isOpen;

  // Urutkan aset:
  // JIKA BURSA BEI TUTUP (malam/weekend):
  // Aset aktif yang buka 24/7 (Kripto Spot & Saham Global Luar Negeri) WAJIB didahulukan di puncak leaderboard!
  // Saham Indonesia yang sedang libur/tutup ditempatkan di bawah aset aktif agar AI tidak rapat di saham tutup.
  evaluations.sort((a, b) => {
    if (!isBEIOpen) {
      const aIndo = isIndonesianStock(a.symbol);
      const bIndo = isIndonesianStock(b.symbol);
      if (aIndo !== bIndo) {
        return aIndo ? 1 : -1; // Aset Kripto / Global aktif diutamakan di peringkat atas
      }
    }
    if (b.score !== a.score) return b.score - a.score;
    return b.metrics.impliedUpsidePct - a.metrics.impliedUpsidePct;
  });

  // Assign ranks & mark top pick
  evaluations.forEach((item, index) => {
    item.rank = index + 1;
    if (index === 0) {
      item.conviction = 'TOP_PICK';
    }
  });

  const topPick = evaluations[0];
  const summaryThesis = !isBEIOpen
    ? `Sistem pemindaian otonom Fincept Capital menyaring ${evaluations.length} aset. Berhubung Bursa BEI sedang tutup (${idxMarketCheck.statusLabel}), komite memprioritaskan aset aktif Kripto 24/7 & Global Luar Negeri. Aset ${topPick.symbol} (${topPick.name}) menduduki peringkat #1 Alpha aktif dengan skor ${topPick.score}/100. Pemicu: ${topPick.keyDrivers.slice(0, 3).join('; ')}.`
    : `Sistem pemindaian otonom Fincept Capital menyaring ${evaluations.length} emiten. Saham ${topPick.symbol} (${topPick.name}) menduduki peringkat #1 dengan skor komposit ${topPick.score}/100. Pemicu keunggulan: ${topPick.keyDrivers.slice(0, 3).join('; ')}.`;

  return {
    topPick,
    rankedLeaderboard: evaluations,
    scannedCount: evaluations.length,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    summaryThesis,
  };
}
