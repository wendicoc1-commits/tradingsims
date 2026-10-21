/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TRADESIMS PRO — SWARM INTELLIGENCE MARKET SIMULATION ENGINE
 * Inspired by MiroFish (Multi-Agent Market Simulation & CAMEL-AI OASIS)
 * 
 * Simulates 50-100 heterogeneous market agent archetypes reacting to macro shocks,
 * news events, and price breakouts through multi-round diffusion dynamics.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getVerifiedBenchmarkPrice, IDX_BENCHMARK_PRICES } from '@/data/idx_benchmark_prices';
import { ALL_ID_HEATMAP_UNIVERSE } from '@/data/heatmap_stocks_universe';
import { MASTER_GLOBAL_STOCKS } from '@/data/global_markets_universe';

export type AgentArchetype =
  | 'RETAIL_FOMO'         // 40%: Chases green candles, panics on red, headline-driven
  | 'SMART_MONEY'         // 25%: Counter-cyclical, hunts liquidity pockets, accumulates in blood
  | 'MOMENTUM_SCALPER'    // 20%: Neutral, exploits orderbook velocity, tight stops
  | 'MUNGER_CONTRARIAN';  // 15%: Deep value, seeks margin of safety, identifies traps

export type AgentAction = 'STRONG_BUY' | 'ACCUMULATE' | 'HOLD' | 'TRIM' | 'PANIC_SELL';

export type CrowdPsychologyState =
  | 'EUPHORIA'              // Extreme greed, retail FOMO peak, smart money preparing to distribute
  | 'SMART_ACCUMULATION'    // Quiet institutional buying during fear
  | 'DISTRIBUTION_TRAP'     // Fake breakout trap, whale exit liquidity
  | 'CAPITULATION'          // Panic dump, high volume bottoming process
  | 'NEUTRAL_CONSOLIDATION';// Rangebound chop, low conviction

export interface SwarmAgent {
  id: string;
  name: string;
  archetype: AgentArchetype;
  capitalSize: number;       // In IDR or USD equivalent
  riskTolerance: number;    // 0.0 (Ultra defensive) to 1.0 (Degen risk-on)
  sentiment: number;        // -1.0 (Extreme Fear) to +1.0 (Extreme Greed)
  currentAction: AgentAction;
  lastReasoning: string;
  reactionSpeedMs: number;  // Latency in acting
}

export interface SimulationRoundResult {
  round: number;
  label: string;
  timestamp: string;
  buyCount: number;
  sellCount: number;
  holdCount: number;
  netOrderflowImbalancePct: number; // -100% to +100%
  simulatedPriceChangePct: number;
  dominantSentiment: number;
  narrativePulse: string;
}

export interface SwarmSimulationResult {
  symbol: string;
  name: string;
  basePrice: number;
  currency: string;
  scenario: string;
  scenarioType: 'RATE_HIKE' | 'WHALE_DUMP' | 'BREAKOUT_ATH' | 'EARNINGS_SHOCK' | 'CUSTOM';
  timestamp: string;
  totalAgents: number;
  consensusScore: number; // 0 (Extreme Bearish) to 100 (Extreme Bullish)
  expectedPriceImpactPct: number;
  confidenceInterval: {
    lowPct: number;
    highPct: number;
  };
  crowdState: CrowdPsychologyState;
  whaleTrapProbability: number; // 0 - 100%
  liquidityStressScore: number; // 0 - 100%
  rounds: SimulationRoundResult[];
  agentRosterSample: SwarmAgent[];
  cSuiteVerdicts: {
    bezos: { vote: string; insight: string };
    munger: { vote: string; insight: string };
    vogels: { vote: string; insight: string };
    godin: { vote: string; insight: string };
  };
  actionRecommendation: 'ACCUMULATE_WITH_WHALES' | 'EXPLOIT_PUMP_AND_TRIM' | 'WAIT_FOR_CAPITULATION' | 'DEFENSIVE_CASH';
}

export interface PresetScenario {
  id: string;
  label: string;
  description: string;
  type: SwarmSimulationResult['scenarioType'];
  impactVector: number; // -1.0 to +1.0 initial bias
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'rate_hike_50bps',
    label: 'BI Suku Bunga Naik 50 bps',
    description: 'Bank Indonesia menaikkan 7-Day Reverse Repo Rate 50 bps di luar konsensus pasar.',
    type: 'RATE_HIKE',
    impactVector: -0.45,
  },
  {
    id: 'whale_dump_10k',
    label: 'Whale Liquidity Dump (-10%)',
    description: 'Akun institusi besar mendadak melepas 10.000 lot/koin ke bid orderbook secara agresif.',
    type: 'WHALE_DUMP',
    impactVector: -0.65,
  },
  {
    id: 'breakout_ath_volume',
    label: 'Breakout All-Time High Masif',
    description: 'Harga menembus level resistensi psikologis ATH dengan lonjakan volume 350% di atas MA20.',
    type: 'BREAKOUT_ATH',
    impactVector: 0.75,
  },
  {
    id: 'earnings_beat_30pct',
    label: 'Laba Bersih Q3 Meledak +30% YoY',
    description: 'Laporan keuangan terbit dengan net margin rekor dan dividen yield melonjak ke 8.5%.',
    type: 'EARNINGS_SHOCK',
    impactVector: 0.60,
  },
  {
    id: 'audit_investigation',
    label: 'Isu Audit Investigasi Keuangan',
    description: 'Rumor regulator OJK / SEC menyelidiki piutang bermasalah & anomali arus kas emiten.',
    type: 'EARNINGS_SHOCK',
    impactVector: -0.80,
  },
];

// Helper to resolve asset names & prices
export function resolveAssetBasic(ticker: string, customPrice?: number) {
  const clean = ticker.replace('.JK', '').replace('^', '').toUpperCase().trim();
  let name = `${clean} Tbk`;
  let price = customPrice || 0;
  let currency = 'IDR';

  const idMatch = ALL_ID_HEATMAP_UNIVERSE.find(
    (s) => s.displaySymbol.toUpperCase() === clean || s.symbol.replace('.JK', '').toUpperCase() === clean
  );
  if (idMatch) {
    name = idMatch.name;
    if (!price) price = idMatch.price;
  } else if (IDX_BENCHMARK_PRICES[clean]) {
    name = IDX_BENCHMARK_PRICES[clean].name;
    if (!price) price = IDX_BENCHMARK_PRICES[clean].price;
  } else {
    const globalMatch = MASTER_GLOBAL_STOCKS.find((g) => g.ticker.toUpperCase() === clean);
    if (globalMatch) {
      name = globalMatch.name;
      if (!price) price = globalMatch.price;
      currency = globalMatch.currency;
    }
  }

  if (!price) {
    price = clean === 'BTC' ? 68000 : clean === 'ETH' ? 2600 : clean === 'BBCA' ? 10450 : 3500;
  }

  return { clean, name, price, currency };
}

// Generate realistic swarm agent population
function generateSwarmPopulation(count: number = 60, seedShift: number = 0): SwarmAgent[] {
  const agents: SwarmAgent[] = [];

  const retailNames = [
    'Rifki Trader Santai', 'Dian Scalper Telegram', 'Budi Crypto Hunter',
    'Kevin Margin Call', 'Siti Saham Dividen', 'Andi FOMO Army',
    'Chandra Swing Trader', 'Rina Rebahan Invest', 'Eko Teknikal Pagi',
    'Putra Breakout Seeker', 'Dewi Chart Enthusiast', 'Fajar Woles Trade'
  ];

  const smartMoneyNames = [
    'Citadel Asia Desk', 'BlackRock Alpha Macro', 'Temasek Quant Allocator',
    'Ashmore Liquid Fund', 'Schroders Dividend Core', 'Vanguard Flow Arbitrage',
    'Bridgewater Systematic', 'Point72 Volatility Book', 'Millennium Orderbook Hunt'
  ];

  const scalperNames = [
    'HFT Algo X-7', 'Cross-Exchange Arbitrageur', 'Tick-Level Spread Eater',
    'Liquidity Provider Bot #12', 'Microsecond Delta Scalper', 'VWAP Execution Engine'
  ];

  const contrarianNames = [
    'Munger Margin of Safety Desk', 'Graham Deep Net-Current Fund', 'Howard Marks Oaktree Cycle',
    'Klarman Margin Margin Guard', 'Burry Asymmetric Short Desk'
  ];

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let archetype: AgentArchetype = 'RETAIL_FOMO';
    let name = '';
    let capital = 10_000_000;
    let riskTol = 0.5;
    let speed = 250;

    if (rand < 0.40) {
      archetype = 'RETAIL_FOMO';
      name = `${retailNames[i % retailNames.length]} #${i + 1}`;
      capital = Math.round(5_000_000 + Math.random() * 95_000_000);
      riskTol = 0.65 + Math.random() * 0.35;
      speed = 300 + Math.random() * 700;
    } else if (rand < 0.65) {
      archetype = 'SMART_MONEY';
      name = `${smartMoneyNames[i % smartMoneyNames.length]} #${i + 1}`;
      capital = Math.round(500_000_000 + Math.random() * 9_500_000_000);
      riskTol = 0.30 + Math.random() * 0.25;
      speed = 80 + Math.random() * 120;
    } else if (rand < 0.85) {
      archetype = 'MOMENTUM_SCALPER';
      name = `${scalperNames[i % scalperNames.length]} #${i + 1}`;
      capital = Math.round(50_000_000 + Math.random() * 450_000_000);
      riskTol = 0.50 + Math.random() * 0.30;
      speed = 5 + Math.random() * 40;
    } else {
      archetype = 'MUNGER_CONTRARIAN';
      name = `${contrarianNames[i % contrarianNames.length]} #${i + 1}`;
      capital = Math.round(200_000_000 + Math.random() * 3_000_000_000);
      riskTol = 0.15 + Math.random() * 0.20;
      speed = 500 + Math.random() * 1000;
    }

    agents.push({
      id: `agent-${i + 1}`,
      name,
      archetype,
      capitalSize: capital,
      riskTolerance: Number(riskTol.toFixed(2)),
      sentiment: 0,
      currentAction: 'HOLD',
      lastReasoning: 'Menunggu sinyal stimulus pasar...',
      reactionSpeedMs: Math.round(speed),
    });
  }

  return agents;
}

/**
 * Run a multi-round Swarm Intelligence Market Simulation
 * 
 * Round 0 (T0): Initial shock impact & reflexive reaction
 * Round 1 (T1): Peer observation & liquidity cascade
 * Round 2 (T2): Institutional absorption vs. retail exhaustion (Equilibrium)
 */
export async function runSwarmSimulation(
  symbolInput: string,
  scenarioPrompt: string,
  customPrice?: number,
  agentCount: number = 50
): Promise<SwarmSimulationResult> {
  const { clean: symbol, name, price, currency } = resolveAssetBasic(symbolInput, customPrice);

  // Match preset scenario if applicable, or parse custom
  const matchedPreset = PRESET_SCENARIOS.find(
    (p) => scenarioPrompt.toLowerCase().includes(p.id) || scenarioPrompt.toLowerCase().includes(p.label.toLowerCase())
  );

  let initialShockVector = 0;
  let scenarioType: SwarmSimulationResult['scenarioType'] = 'CUSTOM';
  let scenarioLabel = scenarioPrompt.trim() || 'Simulasi Volatilitas Pasar Terbuka';

  if (matchedPreset) {
    initialShockVector = matchedPreset.impactVector;
    scenarioType = matchedPreset.type;
    scenarioLabel = matchedPreset.label;
  } else {
    // Basic sentiment scoring from natural language prompt
    const lower = scenarioPrompt.toLowerCase();
    const bullWords = ['naik', 'laba', 'beat', 'breakout', 'all-time high', 'ath', 'dividen', 'bullish', 'whale buy', 'merger', 'akuisisi'];
    const bearWords = ['turun', 'rugi', 'dump', 'drop', 'suku bunga', 'inflasi', 'fraud', 'investigasi', 'bearish', 'sell', 'kebangkrutan', 'ban'];

    let bullScore = 0;
    let bearScore = 0;
    bullWords.forEach((w) => { if (lower.includes(w)) bullScore += 1; });
    bearWords.forEach((w) => { if (lower.includes(w)) bearScore += 1; });

    if (bullScore > bearScore) {
      initialShockVector = Math.min(0.85, 0.3 + bullScore * 0.2);
      scenarioType = 'BREAKOUT_ATH';
    } else if (bearScore > bullScore) {
      initialShockVector = Math.max(-0.85, -0.3 - bearScore * 0.2);
      scenarioType = bearScore >= 2 ? 'WHALE_DUMP' : 'RATE_HIKE';
    } else {
      initialShockVector = (Math.random() - 0.5) * 0.4;
    }
  }

  // Generate Swarm
  const agents = generateSwarmPopulation(agentCount);
  const rounds: SimulationRoundResult[] = [];

  let currentShock = initialShockVector;
  let cumulativePriceChange = 0;

  // Simulate 3 Rounds (T0 -> T1 -> T2)
  const roundConfigs = [
    { round: 0, label: 'T0: Initial Shock & Algorithmic Reflex', weight: 1.0 },
    { round: 1, label: 'T1: Feedback Loop & Retail Momentum', weight: 0.8 },
    { round: 2, label: 'T2: Institutional Clearing & Equilibrium', weight: 0.6 },
  ];

  for (const rc of roundConfigs) {
    let buyCount = 0;
    let sellCount = 0;
    let holdCount = 0;
    let netCapitalFlow = 0; // Buy capital (+) vs Sell capital (-)

    agents.forEach((agent) => {
      // Decision logic based on Archetype + Shock + Noise
      const noise = (Math.random() - 0.5) * 0.2;
      let agentScore = 0;

      if (agent.archetype === 'RETAIL_FOMO') {
        // High reactivity to initial shock direction, amplified in T1
        const momentumSensitivity = rc.round === 1 ? 1.4 : 1.0;
        agentScore = currentShock * momentumSensitivity + noise * 1.5;

        if (agentScore > 0.25) {
          agent.currentAction = 'STRONG_BUY';
          agent.sentiment = Math.min(1.0, 0.5 + agentScore);
          agent.lastReasoning = `FOMO breakout terdeteksi! Mengejar momentum kenaikan di ${symbol}.`;
          buyCount++;
          netCapitalFlow += agent.capitalSize * 0.6;
        } else if (agentScore < -0.25) {
          agent.currentAction = 'PANIC_SELL';
          agent.sentiment = Math.max(-1.0, -0.5 + agentScore);
          agent.lastReasoning = `Tekanan jual ekstrem. Cutloss pengaman modal!`;
          sellCount++;
          netCapitalFlow -= agent.capitalSize * 0.7;
        } else {
          agent.currentAction = 'HOLD';
          agent.lastReasoning = `Wait and see arah candle konfirmasi berikutnya.`;
          holdCount++;
        }
      } else if (agent.archetype === 'SMART_MONEY') {
        // Counter-cyclical: If shock is heavily negative, Smart Money accumulates dips. If positive FOMO, they trim!
        if (rc.round === 0) {
          // Shock absorption
          agentScore = currentShock * 0.3 + noise;
        } else {
          // Exploitation phase
          agentScore = -currentShock * 0.7 + noise; // Inverted
        }

        if (agentScore > 0.2) {
          agent.currentAction = 'ACCUMULATE';
          agent.sentiment = 0.4;
          agent.lastReasoning = `Menyerap likuiditas diskon dari penjual panik pada level support kuat.`;
          buyCount++;
          netCapitalFlow += agent.capitalSize * 0.4;
        } else if (agentScore < -0.2) {
          agent.currentAction = 'TRIM';
          agent.sentiment = -0.2;
          agent.lastReasoning = `Distribusi bertahap memanfaatkan antusiasme retail yang overbought.`;
          sellCount++;
          netCapitalFlow -= agent.capitalSize * 0.35;
        } else {
          agent.currentAction = 'HOLD';
          agent.lastReasoning = `Menunggu spread orderbook mengering sebelum intervensi blok besar.`;
          holdCount++;
        }
      } else if (agent.archetype === 'MOMENTUM_SCALPER') {
        // Ultra reactive, rides immediate vector
        agentScore = currentShock * 1.2 + noise * 0.5;
        if (agentScore > 0.15) {
          agent.currentAction = 'STRONG_BUY';
          agent.sentiment = 0.7;
          agent.lastReasoning = `Orderbook delta positif melonjak. Scalping bid velocity.`;
          buyCount++;
          netCapitalFlow += agent.capitalSize * 0.2;
        } else if (agentScore < -0.15) {
          agent.currentAction = 'PANIC_SELL';
          agent.sentiment = -0.7;
          agent.lastReasoning = `Bid tipis jebol. Scalp sell down-tick.`;
          sellCount++;
          netCapitalFlow -= agent.capitalSize * 0.2;
        } else {
          agent.currentAction = 'HOLD';
          agent.lastReasoning = `Spread terlalu lebar, menunggu orderbook normal.`;
          holdCount++;
        }
      } else {
        // MUNGER_CONTRARIAN
        if (currentShock > 0.4) {
          agent.currentAction = 'TRIM';
          agent.sentiment = -0.4;
          agent.lastReasoning = `Euphoria berlebihan tanpa didukung margin of safety. Kurangi eksposur!`;
          sellCount++;
          netCapitalFlow -= agent.capitalSize * 0.25;
        } else if (currentShock < -0.4) {
          agent.currentAction = 'ACCUMULATE';
          agent.sentiment = 0.5;
          agent.lastReasoning = `Valuasi terlempar ke wilayah irasional. Waktu membeli aset berkualitas.`;
          buyCount++;
          netCapitalFlow += agent.capitalSize * 0.5;
        } else {
          agent.currentAction = 'HOLD';
          agent.lastReasoning = `Tidak ada diskon asimetris yang cukup besar. Lebih baik pegang kas.`;
          holdCount++;
        }
      }
    });

    const netRatio = (buyCount - sellCount) / agents.length;
    const roundPriceImpact = Number((netRatio * 4.5 * rc.weight).toFixed(2));
    cumulativePriceChange += roundPriceImpact;

    // Narrative generation for this round
    let narrative = '';
    if (rc.round === 0) {
      narrative = netRatio > 0.15
        ? 'Lonjakan order beli awal dipicu respon instan algoritma dan pembeli retail awal.'
        : netRatio < -0.15
        ? 'Gelombang aksi jual instan memicu likuidasi stop-loss di orderbook.'
        : 'Reaksi awal terbelah, pelaku pasar mencerna implikasi berita.';
    } else if (rc.round === 1) {
      narrative = netRatio > 0.2
        ? 'FOMO retail mencapai puncaknya, mengejar kenaikan harga tanpa batas toleransi risiko.'
        : netRatio < -0.2
        ? 'Kepanikan menyebar luas ke investor ritel yang merealisasikan kerugian.'
        : 'Smart money mulai memasuki pasar menyerap order berlawanan.';
    } else {
      narrative = Math.abs(netRatio) < 0.1
        ? 'Pasar mencapai titik ekuilibrium baru; likuiditas kembali normal.'
        : netRatio > 0
        ? 'Tekanan beli mendominasi hingga penutupan sesi simulasi.'
        : 'Aksi jual tetap dominan, menandakan penurunan tren yang lebih panjang.';
    }

    rounds.push({
      round: rc.round,
      label: rc.label,
      timestamp: `T+${rc.round * 15}m`,
      buyCount,
      sellCount,
      holdCount,
      netOrderflowImbalancePct: Math.round(netRatio * 100),
      simulatedPriceChangePct: roundPriceImpact,
      dominantSentiment: Number(((buyCount / (buyCount + sellCount || 1)) * 2 - 1).toFixed(2)),
      narrativePulse: narrative,
    });

    // Update shock for next round (diffusion & damping)
    currentShock = currentShock * 0.5 + netRatio * 0.3;
  }

  // Calculate final aggregated metrics
  const lastRound = rounds[rounds.length - 1];
  const totalBuys = rounds.reduce((acc, r) => acc + r.buyCount, 0);
  const totalSells = rounds.reduce((acc, r) => acc + r.sellCount, 0);
  const consensusScore = Math.min(98, Math.max(8, Math.round((totalBuys / (totalBuys + totalSells || 1)) * 100)));

  // Determine Crowd Psychology State
  let crowdState: CrowdPsychologyState = 'NEUTRAL_CONSOLIDATION';
  let whaleTrapProb = 15;
  let liquidityStress = 25;

  if (consensusScore >= 78) {
    crowdState = 'EUPHORIA';
    whaleTrapProb = 68; // High risk of retail trap
    liquidityStress = 45;
  } else if (consensusScore <= 25) {
    crowdState = 'CAPITULATION';
    whaleTrapProb = 20; // Genuine panic
    liquidityStress = 85;
  } else if (consensusScore > 55 && cumulativePriceChange > 1.5) {
    crowdState = 'DISTRIBUTION_TRAP';
    whaleTrapProb = 75;
    liquidityStress = 55;
  } else if (consensusScore < 45 && cumulativePriceChange < -1.0) {
    crowdState = 'SMART_ACCUMULATION';
    whaleTrapProb = 35;
    liquidityStress = 40;
  }

  // Expected price impact bounds
  const lowBound = Number((cumulativePriceChange - Math.abs(cumulativePriceChange * 0.35) - 0.5).toFixed(2));
  const highBound = Number((cumulativePriceChange + Math.abs(cumulativePriceChange * 0.35) + 0.5).toFixed(2));

  // Determine strategic recommendation
  let recommendation: SwarmSimulationResult['actionRecommendation'] = 'DEFENSIVE_CASH';
  if (crowdState === 'SMART_ACCUMULATION') {
    recommendation = 'ACCUMULATE_WITH_WHALES';
  } else if (crowdState === 'EUPHORIA' || crowdState === 'DISTRIBUTION_TRAP') {
    recommendation = 'EXPLOIT_PUMP_AND_TRIM';
  } else if (crowdState === 'CAPITULATION') {
    recommendation = 'WAIT_FOR_CAPITULATION';
  }

  // C-Suite Executive Verdicts based on Swarm Results
  const cSuiteVerdicts = {
    bezos: {
      vote: consensusScore > 50 ? 'EXPAND POSITION' : 'HOLD CORE MOAT',
      insight: `Simulasi swarm mengonfirmasi bahwa volatilitas jangka pendek ini (${cumulativePriceChange > 0 ? '+' : ''}${cumulativePriceChange.toFixed(1)}%) tidak mengubah nilai intrinsik kapital 5-10 tahun ${symbol}. Jika likuiditas tertekan, manfaatkan untuk memperkuat kepemilikan inti.`,
    },
    munger: {
      vote: whaleTrapProb > 60 ? 'AVOID THE MANIA' : consensusScore < 30 ? 'GREEDY WHEN FEARFUL' : 'SIT ON YOUR HANDS',
      insight: whaleTrapProb > 60
        ? `Inversi: Jangan pernah mengejar apa yang dibeli kawanan retail yang sedang mabuk euforia (${whaleTrapProb}% probabilitas jebakan bandar). Selalu tanyakan: apa yang bisa membuat kita hancur?`
        : `Kawanan sedang ketakutan. Jika bisnis ${name} memiliki neraca benteng dan kas bersih, inilah momen rasional untuk bertindak tanpa emosi.`,
    },
    vogels: {
      vote: liquidityStress > 60 ? 'STRICT SLIPPAGE CAP' : 'EXECUTE TWAP',
      insight: `Skor stress likuiditas di ${liquidityStress}/100. Eksekusi order harus dipecah menjadi sub-lot algoritmik (TWAP) untuk mencegah slippage akibat ketidakseimbangan orderflow antartick.`,
    },
    godin: {
      vote: consensusScore > 65 ? 'VIRAL SURGE' : 'NARRATIVE FATIGUE',
      insight: `Persepsi kawanan retail terhadap skenario "${scenarioLabel}" menyebar dengan kecepatan tinggi. Tren narasi saat ini berada pada fase ${crowdState}. Manfaatkan resonansi emosional ini sebelum perhatian beralih.`,
    },
  };

  return {
    symbol,
    name,
    basePrice: price,
    currency,
    scenario: scenarioLabel,
    scenarioType,
    timestamp: new Date().toISOString(),
    totalAgents: agents.length,
    consensusScore,
    expectedPriceImpactPct: Number(cumulativePriceChange.toFixed(2)),
    confidenceInterval: {
      lowPct: lowBound,
      highPct: highBound,
    },
    crowdState,
    whaleTrapProbability: whaleTrapProb,
    liquidityStressScore: liquidityStress,
    rounds,
    agentRosterSample: agents.slice(0, 16), // Return top 16 representative agents for visual inspection
    cSuiteVerdicts,
    actionRecommendation: recommendation,
  };
}
