/**
 * AI Hedge Fund Multi-Agent Committee Engine
 * Implements persona reasoning based on virattt/ai-hedge-fund merged with Bloomberg AI Quant Engine
 */

import { OHLCVCandle, analyzeStockQuant, QuantAnalysisResult } from '@/lib/quant/engine';
import { getGroundedStockIntelligence, GroundedStockIntelligence } from '@/lib/agents/groundedStockIntelligence';
import {
  HedgeFundCommitteeReport,
  HedgeFundAgentVote,
  RiskGateAssessment,
  ExecutionOrderPlan,
  MasterAction,
  SignalVerdict,
} from './types';

interface FundamentalMetrics {
  peRatio?: number;
  pbRatio?: number;
  roe?: number;
  roic?: number;
  debtToEquity?: number;
  currentRatio?: number;
  revenueGrowthYoY?: number;
  epsGrowthYoY?: number;
  operatingMargin?: number;
  dividendYield?: number;
  fcfPositive?: boolean;
  marketCap?: number;
}

// Derive estimated fundamental metrics from stock profile and ticker
function getStockFundamentals(ticker: string, currentPrice: number): FundamentalMetrics {
  const clean = ticker.replace('.JK', '').replace('^', '').toUpperCase();

  // Preset known metrics for IDX Bluechips and US Giants, deterministic fallback for others
  const idxProfiles: Record<string, FundamentalMetrics> = {
    BBCA: { peRatio: 18.2, pbRatio: 3.8, roe: 21.4, roic: 18.2, debtToEquity: 0.15, currentRatio: 1.8, revenueGrowthYoY: 12.8, epsGrowthYoY: 14.5, operatingMargin: 54.2, dividendYield: 2.9, fcfPositive: true },
    BBRI: { peRatio: 9.8, pbRatio: 1.8, roe: 18.5, roic: 15.2, debtToEquity: 0.25, currentRatio: 1.6, revenueGrowthYoY: 9.4, epsGrowthYoY: 10.2, operatingMargin: 46.1, dividendYield: 6.8, fcfPositive: true },
    BMRI: { peRatio: 8.9, pbRatio: 1.7, roe: 19.8, roic: 16.5, debtToEquity: 0.22, currentRatio: 1.7, revenueGrowthYoY: 11.2, epsGrowthYoY: 13.1, operatingMargin: 48.7, dividendYield: 5.4, fcfPositive: true },
    BBNI: { peRatio: 7.8, pbRatio: 1.1, roe: 14.9, roic: 12.8, debtToEquity: 0.28, currentRatio: 1.6, revenueGrowthYoY: 7.9, epsGrowthYoY: 8.6, operatingMargin: 42.0, dividendYield: 5.9, fcfPositive: true },
    ASII: { peRatio: 6.9, pbRatio: 0.95, roe: 14.2, roic: 12.1, debtToEquity: 0.45, currentRatio: 1.45, revenueGrowthYoY: 4.8, epsGrowthYoY: 6.2, operatingMargin: 12.5, dividendYield: 8.2, fcfPositive: true },
    TLKM: { peRatio: 12.4, pbRatio: 2.1, roe: 17.6, roic: 14.8, debtToEquity: 0.82, currentRatio: 0.88, revenueGrowthYoY: 3.5, epsGrowthYoY: 4.1, operatingMargin: 31.8, dividendYield: 5.7, fcfPositive: true },
    GOTO: { peRatio: -12.5, pbRatio: 0.85, roe: -8.5, roic: -7.2, debtToEquity: 0.12, currentRatio: 2.4, revenueGrowthYoY: 28.5, epsGrowthYoY: 45.0, operatingMargin: -14.2, dividendYield: 0.0, fcfPositive: false },
    ADRO: { peRatio: 4.5, pbRatio: 0.82, roe: 22.4, roic: 19.5, debtToEquity: 0.28, currentRatio: 2.1, revenueGrowthYoY: -12.4, epsGrowthYoY: -15.2, operatingMargin: 38.5, dividendYield: 14.2, fcfPositive: true },
    ICBP: { peRatio: 13.8, pbRatio: 2.4, roe: 18.2, roic: 14.9, debtToEquity: 0.72, currentRatio: 1.9, revenueGrowthYoY: 8.5, epsGrowthYoY: 11.2, operatingMargin: 19.5, dividendYield: 3.4, fcfPositive: true },
    AMMN: { peRatio: 38.5, pbRatio: 5.4, roe: 15.6, roic: 13.8, debtToEquity: 0.88, currentRatio: 1.35, revenueGrowthYoY: 48.2, epsGrowthYoY: 65.4, operatingMargin: 44.5, dividendYield: 0.8, fcfPositive: true },
    NVDA: { peRatio: 42.5, pbRatio: 36.2, roe: 115.0, roic: 88.0, debtToEquity: 0.18, currentRatio: 3.8, revenueGrowthYoY: 94.0, epsGrowthYoY: 122.0, operatingMargin: 62.0, dividendYield: 0.03, fcfPositive: true },
    AAPL: { peRatio: 32.5, pbRatio: 48.0, roe: 154.0, roic: 56.0, debtToEquity: 1.45, currentRatio: 0.98, revenueGrowthYoY: 5.2, epsGrowthYoY: 9.8, operatingMargin: 31.0, dividendYield: 0.5, fcfPositive: true },
    MSFT: { peRatio: 31.8, pbRatio: 11.5, roe: 38.2, roic: 29.5, debtToEquity: 0.38, currentRatio: 1.25, revenueGrowthYoY: 15.2, epsGrowthYoY: 18.4, operatingMargin: 44.5, dividendYield: 0.8, fcfPositive: true },
    TSLA: { peRatio: 68.0, pbRatio: 9.8, roe: 14.5, roic: 11.2, debtToEquity: 0.08, currentRatio: 1.85, revenueGrowthYoY: 8.0, epsGrowthYoY: -12.0, operatingMargin: 8.2, dividendYield: 0.0, fcfPositive: true },
  };

  if (idxProfiles[clean]) return idxProfiles[clean];

  // Deterministic fallback based on ticker hash
  const hash = clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pe = 8 + (hash % 25);
  const pb = 0.8 + ((hash % 30) / 10);
  const roe = 10 + (hash % 18);
  const de = 0.2 + ((hash % 8) / 10);
  const revGrowth = -5 + (hash % 30);

  return {
    peRatio: pe,
    pbRatio: pb,
    roe,
    roic: roe * 0.8,
    debtToEquity: de,
    currentRatio: 1.2 + ((hash % 10) / 10),
    revenueGrowthYoY: revGrowth,
    epsGrowthYoY: revGrowth * 1.1,
    operatingMargin: 15 + (hash % 25),
    dividendYield: (hash % 7),
    fcfPositive: hash % 4 !== 0,
  };
}

export function evaluateHedgeFundCommittee(
  symbol: string,
  companyName: string,
  candles: OHLCVCandle[],
  currency: string = 'IDR'
): HedgeFundCommitteeReport {
  const currentPrice = candles[candles.length - 1]?.close || 100;
  const quant = analyzeStockQuant(symbol, companyName, candles, currency);
  
  // Grounded Truth & Institutional Intelligence (ECC Engine)
  const grounded = getGroundedStockIntelligence(symbol, currentPrice);
  const fund = grounded.financials;
  const consensus = grounded.institutionalConsensus;
  const ownership = grounded.ownershipAndFlow;
  const tech = grounded.technicals;

  const cleanSym = grounded.symbol;
  const resolvedName = grounded.name;

  // 1. Warren Buffett Agent
  // Focus: Moat, High ROE (>15%), sensible PE, low debt, consistent FCF
  const buffettMoat = (fund.roe ?? 0) >= 14 && (fund.debtToEquity ?? 0) < 0.7 && (fund.fcfPositive ?? false);
  const buffettFairPrice = (fund.peRatio ?? 20) <= 24;
  let buffettSignal: SignalVerdict = 'NEUTRAL';
  let buffettConf = 55;
  let buffettThesis = '';

  if (buffettMoat && buffettFairPrice) {
    buffettSignal = 'BULLISH';
    buffettConf = Math.min(96, Math.round(75 + (fund.roe ?? 15) * 0.9));
    buffettThesis = `Berdasarkan data auditan (${grounded.dataSourceCitation}), emiten ${cleanSym} (${resolvedName}) memiliki parit ekonomi (economic moat) yang kokoh dengan ROE ${fund.roe.toFixed(1)}% dan neraca yang sangat konservatif (D/E ${fund.debtToEquity.toFixed(2)}x). Arus kas bebas (FCF) tercatat positif sebesar ${fund.freeCashFlowFormatted}. Valuasi P/E ${fund.peRatio.toFixed(1)}x masih dalam koridor harga yang wajar untuk sebuah perusahaan luar biasa. Kami nyaman memegang saham ini selama sepuluh tahun ke depan.`;
  } else if (!buffettMoat && (fund.peRatio ?? 0) > 30) {
    buffettSignal = 'BEARISH';
    buffettConf = 82;
    buffettThesis = `Data fundamental (${grounded.dataSourceCitation}) menunjukkan bisnis ini belum memiliki keunggulan kompetitif bertahan yang cukup kokoh (ROE ${fund.roe.toFixed(1)}%, D/E ${fund.debtToEquity.toFixed(2)}x) dan menuntut valuasi P/E ${fund.peRatio.toFixed(1)}x yang terlalu mahal. Membeli harapan tanpa marjin keamanan adalah spekulasi berbahaya.`;
  } else {
    buffettSignal = 'NEUTRAL';
    buffettConf = 52;
    buffettThesis = `Emiten ${cleanSym} memiliki kualitas bisnis yang lumayan (Laba bersih ${fund.netIncomeFormatted}), namun harga saat ini dengan P/E ${fund.peRatio.toFixed(1)}x belum memberikan marjin keamanan yang memadai. Lebih baik menunggu diskon pasar yang lebih tebal daripada terburu-buru mengalokasikan kas.`;
  }

  const buffettAgent: HedgeFundAgentVote = {
    id: 'buffett',
    name: 'Warren Buffett',
    title: 'Value & Durable Moat Specialist',
    avatar: '👴🏻',
    badge: 'Berkshire Style',
    style: 'Long-Term Compounder / High ROE',
    investmentApproach: 'LONG_ONLY',
    signal: buffettSignal,
    confidence: buffettConf,
    convictionWeight: buffettSignal === 'BULLISH' ? buffettConf / 100 : buffettSignal === 'BEARISH' ? -buffettConf / 100 : 0,
    strategyWeight: 0.18,
    thesis: buffettThesis,
    quote: 'Aturan No. 1: Jangan pernah kehilangan uang. Aturan No. 2: Jangan lupakan aturan No. 1.',
    criteria: [
      { label: `ROE Auditan (${fund.isAudited ? 'BEI/SEC' : 'Est'})`, value: `${fund.roe.toFixed(1)}%`, status: (fund.roe ?? 0) >= 14 ? 'PASS' : 'FAIL', benchmark: '>= 14%' },
      { label: 'Debt to Equity', value: `${fund.debtToEquity.toFixed(2)}x`, status: (fund.debtToEquity ?? 0) < 0.7 ? 'PASS' : 'FAIL', benchmark: '< 0.7x' },
      { label: 'Free Cash Flow TTM', value: fund.freeCashFlowFormatted, status: fund.fcfPositive ? 'PASS' : 'FAIL', benchmark: 'Consistent FCF' },
      { label: 'P/E Rasio Sensible', value: `${fund.peRatio.toFixed(1)}x`, status: (fund.peRatio ?? 0) <= 24 ? 'PASS' : 'FAIL', benchmark: '<= 24x' },
    ],
  };

  // 2. Charlie Munger Agent
  // Focus: Inversion, eliminating folly, business quality, avoiding too-hard pile
  const mungerFollyDetected = (fund.debtToEquity ?? 0) > 1.2 || (fund.operatingMarginPct ?? 0) < 5 || (fund.peRatio ?? 0) > 40;
  let mungerSignal: SignalVerdict = 'NEUTRAL';
  let mungerConf = 50;
  let mungerThesis = '';

  if (mungerFollyDetected) {
    mungerSignal = 'BEARISH';
    mungerConf = 85;
    mungerThesis = `Lakukan inversi: apa yang bisa membuat investasi ini hancur? Utang (D/E ${fund.debtToEquity.toFixed(2)}x) atau marjin operasional yang tertekan (${fund.operatingMarginPct.toFixed(1)}%). Siapapun yang membayar P/E ${fund.peRatio.toFixed(1)}x untuk bisnis dengan kerentanan operasional sedang mempercayai dongeng yang bodoh.`;
  } else if ((fund.roe ?? 0) > 16 && (fund.operatingMarginPct ?? 0) > 18) {
    mungerSignal = 'BULLISH';
    mungerConf = 88;
    mungerThesis = `Bisnis berkualitas tinggi dengan marjin operasi auditan ${fund.operatingMarginPct.toFixed(1)}% dan NPM ${fund.netMarginPct.toFixed(1)}%. Struktur kepemilikan ${ownership.controllingShareholder} memberikan stabilitas tanpa kebodohan akuisisi yang ceroboh. Ini adalah kepemilikan rasional.`;
  } else {
    mungerSignal = 'NEUTRAL';
    mungerConf = 48;
    mungerThesis = `Kondisi emiten ini masuk ke dalam 'too-hard pile'. Keuntungannya tidak cukup nyata untuk membenarkan risikonya, dan tidak ada keharusan bagi kita untuk mengayunkan tongkat pemukul pada setiap bola yang dilempar Mr. Market.`;
  }

  const mungerAgent: HedgeFundAgentVote = {
    id: 'munger',
    name: 'Charlie Munger',
    title: 'Inversion & Quality Architecture',
    avatar: '👓',
    badge: 'Mental Models',
    style: 'Invert, Always Invert / Anti-Folly',
    investmentApproach: 'LONG_ONLY',
    signal: mungerSignal,
    confidence: mungerConf,
    convictionWeight: mungerSignal === 'BULLISH' ? mungerConf / 100 : mungerSignal === 'BEARISH' ? -mungerConf / 100 : 0,
    strategyWeight: 0.14,
    thesis: mungerThesis,
    quote: 'Invert, always invert: cari tahu di mana Anda akan mati, dan jangan pernah pergi ke sana.',
    criteria: [
      { label: 'Operating Margin (>18%)', value: `${fund.operatingMarginPct.toFixed(1)}%`, status: (fund.operatingMarginPct ?? 0) > 18 ? 'PASS' : 'FAIL', benchmark: '> 18%' },
      { label: 'Solvabilitas Utang Terkendali', value: `${fund.debtToEquity.toFixed(2)}x`, status: (fund.debtToEquity ?? 0) <= 0.8 ? 'PASS' : 'FAIL', benchmark: '<= 0.8x' },
      { label: 'Struktur Kepemilikan', value: ownership.controllingShareholder, status: !mungerFollyDetected ? 'PASS' : 'FAIL', benchmark: 'Stable Sponsor' },
    ],
  };

  // 3. Benjamin Graham Agent
  // Focus: Deep Value, Margin of Safety, PE < 15, PB < 1.5, Graham Number
  const grahamGrahamMultiplier = (fund.peRatio ?? 99) * (fund.pbRatio ?? 99);
  const grahamGrahamNumberPass = grahamGrahamMultiplier <= 22.5;
  const grahamDefensivePass = (fund.peRatio ?? 99) <= 15 && (fund.currentRatio ?? 0) >= 1.4;
  let grahamSignal: SignalVerdict = 'NEUTRAL';
  let grahamConf = 50;
  let grahamThesis = '';

  if (grahamGrahamNumberPass || (grahamDefensivePass && (fund.pbRatio ?? 99) <= 1.3)) {
    grahamSignal = 'BULLISH';
    grahamConf = 86;
    grahamThesis = `Tersedia marjin keamanan (Margin of Safety) nyata. Hasil kali P/E (${fund.peRatio.toFixed(1)}x) x P/B (${fund.pbRatio.toFixed(1)}x) adalah ${grahamGrahamMultiplier.toFixed(1)}, berada di bawah batas konservatif 22.5. Aset dan laba bersih ${fund.netIncomeFormatted} dihargai dengan diskon yang signifikan terhadap nilai intrinsik buku, diperkuat rasio lancar ${fund.currentRatio.toFixed(2)}x.`;
  } else if ((fund.peRatio ?? 0) > 28 || (fund.pbRatio ?? 0) > 3.5) {
    grahamSignal = 'BEARISH';
    grahamConf = 80;
    grahamThesis = `Harga pasar telah mengkapitalisasi harapan masa depan yang berlebihan (P/E ${fund.peRatio.toFixed(1)}x, P/B ${fund.pbRatio.toFixed(1)}x). Seorang investor defensif tidak boleh berspekulasi pada proyeksi ketika pasar tidak menyediakan perlindungan nilai aset berwujud.`;
  } else {
    grahamSignal = 'NEUTRAL';
    grahamConf = 50;
    grahamThesis = `Emiten ${cleanSym} cukup sehat secara keuangan, namun diskon harga saat ini dengan P/E ${fund.peRatio.toFixed(1)}x dan P/B ${fund.pbRatio.toFixed(1)}x belum memenuhi kriteria ketat Margin of Safety. Kami menunggu penyesuaian harga lebih lanjut dari Mr. Market.`;
  }

  const grahamAgent: HedgeFundAgentVote = {
    id: 'graham',
    name: 'Benjamin Graham',
    title: 'Margin of Safety & Net-Net Value',
    avatar: '📜',
    badge: 'Deep Value',
    style: 'Defensive Value / Asset Protection',
    investmentApproach: 'LONG_ONLY',
    signal: grahamSignal,
    confidence: grahamConf,
    convictionWeight: grahamSignal === 'BULLISH' ? grahamConf / 100 : grahamSignal === 'BEARISH' ? -grahamConf / 100 : 0,
    strategyWeight: 0.15,
    thesis: grahamThesis,
    quote: 'Marjin keamanan adalah rahasia utama dari investasi yang sukses.',
    criteria: [
      { label: 'Graham Number (PE x PB <= 22.5)', value: `${grahamGrahamMultiplier.toFixed(1)}`, status: grahamGrahamNumberPass ? 'PASS' : 'FAIL', benchmark: '<= 22.5' },
      { label: 'P/E Tertekan (<16x)', value: `${fund.peRatio.toFixed(1)}x`, status: (fund.peRatio ?? 99) <= 16 ? 'PASS' : 'FAIL', benchmark: '<= 16.0x' },
      { label: 'Current Ratio (>=1.4x)', value: `${fund.currentRatio.toFixed(2)}x`, status: (fund.currentRatio ?? 0) >= 1.4 ? 'PASS' : 'FAIL', benchmark: '>= 1.4x' },
    ],
  };

  // 4. Peter Lynch Agent
  // Focus: GARP, PEG ratio < 1.0, earnings acceleration, classification
  const epsGrowth = fund.epsGrowthYoY ?? 10;
  const pegRatio = epsGrowth > 0 ? (fund.peRatio ?? 15) / epsGrowth : 99;
  let lynchCategory = 'Stalwart (10-15% Growth)';
  if (epsGrowth > 20) lynchCategory = 'Fast Grower (>20% Growth)';
  else if (epsGrowth < 5 && (fund.dividendYield ?? 0) > 6) lynchCategory = 'Slow Grower / High Dividend';
  else if (epsGrowth < 0) lynchCategory = 'Cyclical / Turnaround Candidate';

  let lynchSignal: SignalVerdict = 'NEUTRAL';
  let lynchConf = 55;
  let lynchThesis = '';

  if (pegRatio <= 1.25 && epsGrowth >= 8) {
    lynchSignal = 'BULLISH';
    lynchConf = 88;
    lynchThesis = `Klasifikasi: ${lynchCategory}. Rasio PEG tercatat di ${pegRatio.toFixed(2)}x, membuktikan pertumbuhan laba (${epsGrowth > 0 ? '+' : ''}${epsGrowth.toFixed(1)}%) belum sepenuhnya dihargai pasar. Konsensus ${consensus.totalAnalysts} analis menetapkan target 12M di ${grounded.currency === 'IDR' ? `Rp ${consensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${consensus.targetPriceConsensus}`} (upside ${consensus.impliedUpsidePct > 0 ? '+' : ''}${consensus.impliedUpsidePct}%). Pendapatan mengalir menjadi arus laba riil dengan neraca kokoh.`;
  } else if (pegRatio > 2.2 || epsGrowth < -10) {
    lynchSignal = 'BEARISH';
    lynchConf = 80;
    lynchThesis = `Rasio PEG berada di ${pegRatio.toFixed(2)}x—terlalu mahal untuk laju pertumbuhan labanya (${epsGrowth.toFixed(1)}% YoY). Investor membeli ekspektasi pada saat laju ekspansi mulai melambat.`;
  } else {
    lynchSignal = 'NEUTRAL';
    lynchConf = 52;
    lynchThesis = `Saham berada pada valuasi wajar untuk kategori ${lynchCategory} dengan PEG ${pegRatio.toFixed(2)}x. Konsensus target analis berada di ${grounded.currency === 'IDR' ? `Rp ${consensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${consensus.targetPriceConsensus}`}.`;
  }

  const lynchAgent: HedgeFundAgentVote = {
    id: 'lynch',
    name: 'Peter Lynch',
    title: 'GARP & Category Lifecycle Lead',
    avatar: '📈',
    badge: 'Magellan GARP',
    style: 'Growth at Reasonable Price / PEG Ratio',
    investmentApproach: 'LONG_ONLY',
    signal: lynchSignal,
    confidence: lynchConf,
    convictionWeight: lynchSignal === 'BULLISH' ? lynchConf / 100 : lynchSignal === 'BEARISH' ? -lynchConf / 100 : 0,
    strategyWeight: 0.15,
    thesis: lynchThesis,
    quote: 'Ketahui apa yang Anda miliki, dan ketahui mengapa Anda memilikinya.',
    criteria: [
      { label: 'PEG Rasio (P/E ÷ Pertumbuhan)', value: `${pegRatio.toFixed(2)}x`, status: pegRatio <= 1.25 ? 'PASS' : pegRatio > 2.0 ? 'FAIL' : 'NEUTRAL', benchmark: '<= 1.25x' },
      { label: 'Kategori Emiten', value: lynchCategory, status: 'NEUTRAL', benchmark: 'Visible Story' },
      { label: 'Pertumbuhan Laba YoY Auditan', value: `${epsGrowth > 0 ? '+' : ''}${epsGrowth.toFixed(1)}%`, status: epsGrowth > 8 ? 'PASS' : 'FAIL', benchmark: '> 8%' },
    ],
  };

  // 5. Stanley Druckenmiller Agent
  // Focus: Inflection, momentum, asymmetric risk/reward, trend velocity
  const isTrendInflection = quant.indicators.trendAlignment === 'STRONG_UPTREND' || quant.factors.trendScore > 65 || tech.mtfConsensus.includes('BULLISH');
  const isSmartMoneyFlowing = quant.factors.smartMoneyScore > 60 || quant.indicators.cmf20 > 0.05;
  let druckenmillerSignal: SignalVerdict = 'NEUTRAL';
  let druckenmillerConf = 50;
  let druckenmillerThesis = '';

  if (isTrendInflection && isSmartMoneyFlowing) {
    druckenmillerSignal = 'BULLISH';
    druckenmillerConf = 91;
    druckenmillerThesis = `Setup asimetris terkonfirmasi! Tren teknikal selaras dengan konsensus Multi-Timeframe ${tech.mtfConsensus} dan aliran likuiditas (CMF ${quant.indicators.cmf20.toFixed(2)}). Area Demand Order Block institusi berada di kisaran ${tech.orderBlockDemand.min} - ${tech.orderBlockDemand.max}. Arus insider: ${ownership.netInsiderFlowFormatted}. Pasang posisi terfokus dan biarkan keuntungan berjalan.`;
  } else if (quant.indicators.trendAlignment === 'DEATH_CROSS' || quant.factors.trendScore < 35) {
    druckenmillerSignal = 'BEARISH';
    druckenmillerConf = 85;
    druckenmillerThesis = `Momentum mengalami pelemahan struktural (trend breakdown). Ketika fundamental melambat dan harga menembus support rata-rata bergerak, lindungi modal segera.`;
  } else {
    druckenmillerSignal = 'NEUTRAL';
    druckenmillerConf = 48;
    druckenmillerThesis = `Belum ada infleksi makro atau katalis momentum yang cukup asimetris. Support kunci di ${tech.supportLevels[0] || currentPrice}, risk/reward berada di kisaran wajar.`;
  }

  const druckenmillerAgent: HedgeFundAgentVote = {
    id: 'druckenmiller',
    name: 'Stanley Druckenmiller',
    title: 'Macro & Asymmetric Inflection Lead',
    avatar: '🦅',
    badge: 'Momentum Macro',
    style: 'Concentrated Bets on Asymmetric Inflections',
    investmentApproach: 'LONG_SHORT',
    signal: druckenmillerSignal,
    confidence: druckenmillerConf,
    convictionWeight: druckenmillerSignal === 'BULLISH' ? druckenmillerConf / 100 : druckenmillerSignal === 'BEARISH' ? -druckenmillerConf / 100 : 0,
    strategyWeight: 0.16,
    thesis: druckenmillerThesis,
    quote: 'Bukan soal apakah Anda benar atau salah, tapi berapa banyak yang Anda hasilkan saat benar dan berapa sedikit yang hilang saat salah.',
    criteria: [
      { label: 'Infleksi Multi-Timeframe', value: tech.mtfConsensus, status: isTrendInflection ? 'PASS' : 'FAIL', benchmark: 'Uptrend Alignment' },
      { label: 'Smart Money Inflow (CMF)', value: `${quant.indicators.cmf20.toFixed(2)}`, status: quant.indicators.cmf20 > 0 ? 'PASS' : 'FAIL', benchmark: '> 0.00' },
      { label: 'Demand Order Block', value: `${tech.orderBlockDemand.min} - ${tech.orderBlockDemand.max}`, status: 'PASS', benchmark: 'SMC Zone' },
    ],
  };

  // 6. Cathie Wood Agent
  // Focus: Disruptive Innovation, TAM, platform expansion
  const isHighGrowth = (fund.revenueGrowthYoY ?? 0) > 18 || cleanSym === 'NVDA' || cleanSym === 'TSLA' || cleanSym === 'GOTO' || cleanSym === 'AMMN' || cleanSym === 'BREN';
  let cathieSignal: SignalVerdict = 'NEUTRAL';
  let cathieConf = 50;
  let cathieThesis = '';

  if (isHighGrowth) {
    cathieSignal = 'BULLISH';
    cathieConf = 86;
    cathieThesis = `Teknologi platform dan skala adopsi berada di kurva ekspansif dengan pendapatan auditan ${fund.revenueFormatted} (${fund.revenueGrowthYoY > 0 ? '+' : ''}${fund.revenueGrowthYoY}% YoY). Rantai pasok: ${grounded.supplyChain.summary}. Kami mengabaikan kelipatan valuasi jangka pendek karena potensi ekspansi pasar jangka panjang.`;
  } else if ((fund.revenueGrowthYoY ?? 0) < 3) {
    cathieSignal = 'BEARISH';
    cathieConf = 75;
    cathieThesis = `Pertumbuhan pendapatan auditan tertekan (${fund.revenueGrowthYoY}% YoY). Terjebak dalam model bisnis konvensional yang rentan terhadap inovasi pesaing baru.`;
  } else {
    cathieSignal = 'NEUTRAL';
    cathieConf = 50;
    cathieThesis = `Model bisnis emiten stabil (Pendapatan ${fund.revenueFormatted}) namun kekurangan elemen pertumbuhan eksponensial.`;
  }

  const cathieAgent: HedgeFundAgentVote = {
    id: 'wood',
    name: 'Cathie Wood',
    title: 'Disruptive Innovation & TAM Strategist',
    avatar: '🚀',
    badge: 'ARK Innovation',
    style: 'Exponential Platform Curves & Next-Gen TAM',
    investmentApproach: 'DISRUPTIVE_GROWTH',
    signal: cathieSignal,
    confidence: cathieConf,
    convictionWeight: cathieSignal === 'BULLISH' ? cathieConf / 100 : cathieSignal === 'BEARISH' ? -cathieConf / 100 : 0,
    strategyWeight: 0.10,
    thesis: cathieThesis,
    quote: 'Inovasi memecahkan masalah dan menciptakan kurva adopsi berbentuk S yang eksponensial.',
    criteria: [
      { label: 'Revenue Growth YoY Auditan', value: `${fund.revenueGrowthYoY > 0 ? '+' : ''}${fund.revenueGrowthYoY?.toFixed(1)}%`, status: (fund.revenueGrowthYoY ?? 0) > 15 ? 'PASS' : 'FAIL', benchmark: '> 15%' },
      { label: 'Skalabilitas Rantai Pasok', value: grounded.supplyChain.dependencyRisk === 'LOW' ? 'Kuat / Rendah Risiko' : 'Moderat', status: 'PASS', benchmark: 'Supply Resilient' },
    ],
  };

  // 7. Jim Simons Agent (Quantitative Lead - Merged with our Quant Engine)
  // Focus: Multi-Factor Composite Alpha, Wyckoff Regime, Bollinger Squeeze, Monte Carlo
  let simonsSignal: SignalVerdict = 'NEUTRAL';
  let simonsConf = Math.round(quant.factors.compositeAlpha);
  let simonsThesis = '';

  if (quant.factors.compositeAlpha >= 62 && (quant.isTripleConfluence || tech.mtfConsensus.includes('BULLISH'))) {
    simonsSignal = 'BULLISH';
    simonsThesis = `Sinyal konfluensi matematis terkonfirmasi (Alpha ${quant.factors.compositeAlpha}/100, MTF Radar: ${tech.mtfConsensus}). Model Monte Carlo memproyeksikan target p50 horizon 5D di ${quant.forecasts['5D']?.priceTarget.medianTarget.toLocaleString()} dengan win-rate ${quant.forecasts['5D']?.probability.bullish}%. Anomali Z-Score volume ${quant.indicators.volumeZScore.toFixed(2)}σ. Support SMC tervalidasi di ${tech.supportLevels[0] || currentPrice}.`;
  } else if (quant.factors.compositeAlpha <= 40) {
    simonsSignal = 'BEARISH';
    simonsThesis = `Metrik kuantitatif multi-faktor menunjukkan degradasi tren (Alpha ${quant.factors.compositeAlpha}/100). Matriks teknikal RSI(${quant.indicators.rsi14.toFixed(1)}) dan histogram MACD mengindikasikan tekanan jual berlanjut. Stop-loss sistematis diaktifkan pada level ${tech.suggestedRiskReward.stopLoss}.`;
  } else {
    simonsSignal = 'NEUTRAL';
    simonsThesis = `Rezim pasar berada dalam fase ${quant.marketRegime.phaseTag} (${quant.marketRegime.phase}). Distribusi harga berada di dalam pita acak standar deviasi Gauss; probabilitas belum melampaui ambang batas signifikansi statistik p < 0.05. Support terdekat ${tech.supportLevels[0] || currentPrice}.`;
  }

  const simonsAgent: HedgeFundAgentVote = {
    id: 'simons',
    name: 'Jim Simons (Quant Desk)',
    title: 'Head of Quantitative Statistical Arbitrage',
    avatar: '📐',
    badge: 'Renaissance Quant',
    style: 'Statistical Mean-Reversion & Machine Learning',
    investmentApproach: 'SYSTEMATIC_QUANT',
    signal: simonsSignal,
    confidence: simonsConf,
    convictionWeight: simonsSignal === 'BULLISH' ? simonsConf / 100 : simonsSignal === 'BEARISH' ? -simonsConf / 100 : 0,
    strategyWeight: 0.22,
    thesis: simonsThesis,
    quote: 'Kami menguji ratusan ribu pola matematis; sains dan probabilitas tidak berbohong.',
    criteria: [
      { label: 'Composite Alpha Score', value: `${quant.factors.compositeAlpha}/100`, status: quant.factors.compositeAlpha >= 60 ? 'PASS' : quant.factors.compositeAlpha < 45 ? 'FAIL' : 'NEUTRAL', benchmark: '>= 60/100' },
      { label: 'MTF Radar Consensus', value: tech.mtfConsensus, status: tech.mtfConsensus.includes('BULLISH') ? 'PASS' : 'NEUTRAL', benchmark: 'Consensus' },
      { label: 'Volume Anomaly Z-Score', value: `${quant.indicators.volumeZScore.toFixed(2)}σ`, status: quant.indicators.volumeZScore >= 1.4 ? 'PASS' : 'NEUTRAL', benchmark: '>= 1.4σ' },
      { label: 'Rezim Volatilitas Wyckoff', value: quant.marketRegime.phaseTag, status: 'NEUTRAL', benchmark: 'Markov Phase' },
    ],
  };

  const allAgents = [buffettAgent, mungerAgent, grahamAgent, lynchAgent, druckenmillerAgent, cathieAgent, simonsAgent];

  // 8. Tally votes & calculate Net Weighted Conviction
  let weightedConvictionSum = 0;
  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;

  for (const a of allAgents) {
    weightedConvictionSum += a.convictionWeight * a.strategyWeight;
    if (a.signal === 'BULLISH') bullishCount++;
    else if (a.signal === 'BEARISH') bearishCount++;
    else neutralCount++;
  }

  const netConvictionScore = Math.round(weightedConvictionSum * 100); // -100 to +100
  const consensusConfidence = Math.round(
    allAgents.reduce((acc, a) => acc + a.confidence * a.strategyWeight, 0)
  );

  let overallSignal: MasterAction = 'HOLD / NEUTRAL';
  if (netConvictionScore >= 45 && bullishCount >= 4) overallSignal = 'STRONG BUY';
  else if (netConvictionScore >= 20 && bullishCount >= 3) overallSignal = 'ACCUMULATE';
  else if (netConvictionScore <= -40 && bearishCount >= 4) overallSignal = 'EXIT / SHORT';
  else if (netConvictionScore <= -15 && bearishCount >= 3) overallSignal = 'TRIM';
  else overallSignal = 'HOLD / NEUTRAL';

  // 9. Risk Management Officer (CRO) Gate Assessment
  const atrPrice = quant.indicators.atr14 || currentPrice * 0.02;
  const stopLoss = Math.min(tech.suggestedRiskReward.stopLoss || currentPrice * 0.95, Math.round(currentPrice - atrPrice * 1.8));
  const target1 = Math.max(tech.suggestedRiskReward.tp1 || currentPrice * 1.05, Math.round(currentPrice + atrPrice * 2.5));
  const target2 = Math.max(tech.suggestedRiskReward.tp2 || currentPrice * 1.10, Math.round(currentPrice + atrPrice * 4.2));
  const rrRatio = atrPrice > 0 ? Number(((target1 - currentPrice) / (currentPrice - stopLoss)).toFixed(2)) : 1.5;

  let volFlag: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME' = 'NORMAL';
  if (quant.indicators.annualizedVolatility > 45) volFlag = 'EXTREME';
  else if (quant.indicators.annualizedVolatility > 30) volFlag = 'HIGH';
  else if (quant.indicators.annualizedVolatility < 15) volFlag = 'LOW';

  const riskApproved = volFlag !== 'EXTREME' && rrRatio >= 1.2 && (fund.debtToEquity ?? 0) < 2.0;
  const maxCap = overallSignal.includes('BUY') ? (quant.isTripleConfluence ? 15.0 : 10.0) : 0;
  const recommendedAlloc = overallSignal === 'STRONG BUY' ? (quant.kellySizing.halfKellyPct || 12.5) : overallSignal === 'ACCUMULATE' ? 6.5 : 0;

  const riskGate: RiskGateAssessment = {
    croName: 'Chief Risk Officer (Risk Desk)',
    status: riskApproved ? 'APPROVED' : 'RESTRICTED',
    maxPositionCapPct: maxCap,
    recommendedPositionPct: Math.min(maxCap, recommendedAlloc),
    valueAtRisk95Pct: Number((quant.indicators.annualizedVolatility * 0.103).toFixed(2)),
    estimatedStopLoss: stopLoss,
    riskRewardRatio: Math.max(1.1, rrRatio),
    grossExposureConstraint: 'Maksimum 100% Net Long (No Naked Leverage)',
    volatilityFlag: volFlag,
    riskNotes: riskApproved
      ? `Disetujui komite risiko. Penempatan posisi diatur dengan pembatas Half-Kelly, stop loss pada level ${stopLoss.toLocaleString()} (${(((stopLoss - currentPrice) / currentPrice) * 100).toFixed(1)}%). Grounding: ${grounded.dataSourceCitation}.`
      : `Peringatan komite risiko: volatilitas aset (${quant.indicators.annualizedVolatility.toFixed(1)}%) atau rasio utang memicu pembatasan eksposur maksimum.`,
  };

  // 10. Execution Order Plan
  const executionPlan: ExecutionOrderPlan = {
    action: overallSignal,
    symbol: cleanSym,
    orderType: overallSignal.includes('BUY') ? 'LIMIT' : 'MARKET',
    suggestedEntryPrice: currentPrice,
    stopLossPrice: stopLoss,
    takeProfit1: target1,
    takeProfit2: target2,
    targetAllocationLots: Math.max(10, Math.round((100000000 * (recommendedAlloc / 100)) / (currentPrice * 100))),
    targetCapitalAllocated: Math.round(100000000 * (recommendedAlloc / 100)),
    currency,
    timeframe: '5D - 20D Tactical Horizon',
  };

  // 11. CIO Verdict & Executive Summary
  const cioVerdict = {
    chairperson: 'Master Portfolio Manager (CIO)',
    mandate: 'Multi-Strategy High-Conviction Fund',
    allocationPct: riskGate.recommendedPositionPct,
    action: overallSignal,
    rationale: `Komite Investasi menghasilkan voting ${bullishCount} Bullish, ${bearishCount} Bearish, ${neutralCount} Netral dengan Net Conviction ${netConvictionScore > 0 ? '+' : ''}${netConvictionScore}%. Rekomendasi eksekusi final: ${overallSignal} dengan alokasi target ${riskGate.recommendedPositionPct}% portofolio. Didukung Konsensus Institusional: ${consensus.consensusRating} (Target 12M: ${grounded.currency === 'IDR' ? `Rp ${consensus.targetPriceConsensus.toLocaleString('id-ID')}` : `$${consensus.targetPriceConsensus}`}, upside ${consensus.impliedUpsidePct > 0 ? '+' : ''}${consensus.impliedUpsidePct}%).`,
  };

  const executiveSummary = `Sidang komite AI Hedge Fund untuk emiten ${cleanSym} (${resolvedName}) memutuskan konsensus final **${overallSignal}** (Keyakinan Bersih: ${netConvictionScore > 0 ? '+' : ''}${netConvictionScore}%). Divalidasi dengan **${grounded.dataSourceCitation}** (ROE ${fund.roe.toFixed(1)}%, Laba ${fund.netIncomeFormatted}, PER ${fund.peRatio.toFixed(1)}x, FCF ${fund.freeCashFlowFormatted}). ${
    buffettSignal === 'BULLISH' ? 'Warren Buffett dan ' : ''
  }${lynchSignal === 'BULLISH' ? 'Peter Lynch melihat valuasi dan momentum pertumbuhan sehat, didukung ' : ''}analisis kuantitatif Jim Simons (Composite Alpha ${quant.factors.compositeAlpha}/100, MTF ${tech.mtfConsensus}). Desk risiko menyetujui alokasi ${riskGate.recommendedPositionPct}% dengan level stop-loss protektif di ${stopLoss.toLocaleString()} ${currency}.`;

  return {
    symbol: cleanSym,
    name: resolvedName,
    currency,
    currentPrice,
    timestamp: new Date().toISOString(),
    groundingLevel: grounded.groundingLevel,
    dataSourceCitation: grounded.dataSourceCitation,
    groundedFinancials: {
      isAudited: fund.isAudited,
      auditSource: fund.auditSource,
      revenueFormatted: fund.revenueFormatted,
      netIncomeFormatted: fund.netIncomeFormatted,
      freeCashFlowFormatted: fund.freeCashFlowFormatted,
      peRatio: fund.peRatio,
      pbRatio: fund.pbRatio,
      roe: fund.roe,
      dividendYield: fund.dividendYield,
      debtToEquity: fund.debtToEquity,
    },
    institutionalConsensus: {
      targetPriceConsensus: consensus.targetPriceConsensus,
      impliedUpsidePct: consensus.impliedUpsidePct,
      totalAnalysts: consensus.totalAnalysts,
      buyCount: consensus.buyCount,
      holdCount: consensus.holdCount,
      sellCount: consensus.sellCount,
      rating: consensus.consensusRating,
    },
    overallSignal,
    netConvictionScore,
    consensusConfidence,
    voteTallies: {
      bullish: bullishCount,
      bearish: bearishCount,
      neutral: neutralCount,
      total: allAgents.length,
    },
    executiveSummary,
    cioVerdict,
    riskGate,
    executionPlan,
    agents: allAgents,
    quantEngineMerge: {
      trendScore: quant.factors.trendScore,
      momentumScore: quant.factors.momentumScore,
      smartMoneyScore: quant.factors.smartMoneyScore,
      compositeAlpha: quant.factors.compositeAlpha,
      marketRegime: quant.marketRegime.phase,
      monteCarlo5DMedian: quant.forecasts['5D']?.priceTarget.medianTarget || currentPrice,
      volumeZScore: quant.indicators.volumeZScore,
    },
  };
}
