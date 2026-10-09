/**
 * Utilitas dan Aturan Bursa Efek Indonesia (IDX) & Pasar US & Crypto
 */

import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';

export interface TickRule {
  min: number;
  max: number;
  tick: number;
}

// Fraksi Harga Resmi BEI (IDX) SK Direksi PT BEI
export const IDX_TICK_RULES: TickRule[] = [
  { min: 0, max: 200, tick: 1 },
  { min: 200, max: 500, tick: 2 },
  { min: 500, max: 2000, tick: 5 },
  { min: 2000, max: 5000, tick: 10 },
  { min: 5000, max: Infinity, tick: 25 },
];

/**
 * Mengambil fraksi harga yang sah untuk harga tertentu di BEI
 */
export function getIDXTickSize(price: number): number {
  if (price <= 0) return 1;
  const rule = IDX_TICK_RULES.find((r) => price >= r.min && price < r.max);
  return rule ? rule.tick : 25;
}

/**
 * Mengambil fraksi harga yang wajar untuk aset Crypto (USDT) & US Equities (USD)
 */
export function getForeignTick(val: number): number {
  if (val <= 0) return 0.0001;
  if (val < 0.01) return 0.00001;
  if (val < 1) return 0.0001;
  if (val < 10) return 0.001;
  if (val < 100) return 0.01;
  if (val < 1000) return 0.05;
  return 0.1;
}

/**
 * Validasi apakah harga mematuhi fraksi harga resmi BEI
 */
export function isValidIDXTick(price: number): { valid: boolean; tick: number; nearest: number } {
  const tick = getIDXTickSize(price);
  const remainder = price % tick;
  if (remainder === 0) {
    return { valid: true, tick, nearest: price };
  }
  const nearest = Math.round(price / tick) * tick;
  return { valid: false, tick, nearest };
}

const FALLBACK_CRYPTO = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK',
  'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET', 'ARB', 'OP', 'APT', 'KAS',
  'TON', 'SEI', 'LTC', 'BCH', 'XLM', 'ALGO', 'HBAR', 'ICP', 'FTM', 'POL', 'IMX',
  'STRK', 'TIA', 'MANTA', 'ZK', 'UNI', 'AAVE', 'MKR', 'ONDO', 'PENDLE', 'INJ', 'JUP',
  'ENA', 'CRV', 'LDO', 'RUNE', 'DYDX', 'RAY', 'AKT', 'AR', 'FIL', 'GRT', 'THETA',
  'WIF', 'BONK', 'FLOKI', 'POPCAT', 'MEW', 'BOME', 'NEIRO', 'PYTH', 'W', 'JTO',
  'STX', 'CHZ', 'ENS', 'GALA', 'SAND', 'MANA', 'APE',
]);

const FALLBACK_US = new Set([
  'NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'GOOG', 'GOOGLE', 'AMZN', 'META', 'NFLX',
  'AMD', 'INTC', 'SPY', 'QQQ', 'COIN', 'PLTR', 'AVGO', 'BRK.B', 'LLY', 'JPM', 'V',
  'WMT', 'ORCL', 'COST', 'XOM', 'QCOM', 'CRM', 'ADBE', 'MA', 'PG', 'JNJ', 'HD',
  'ARM', 'MU', 'TXN', 'AMAT', 'LRCX', 'KLAC', 'SMCI', 'NOW', 'SNOW', 'PANW', 'CRWD',
  'DDOG', 'NET', 'IBM', 'CSCO', 'DELL', 'DIS', 'MCD', 'SBUX', 'NKE', 'KO', 'PEP',
  'UBER', 'ABNB', 'SPOT', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'AXP', 'PYPL', 'UNH',
  'ABBV', 'MRK', 'PFE', 'TMO', 'ISRG', 'CVX', 'CAT', 'GE', 'BA', 'LMT', 'RTX',
  'DE', 'VOO', 'SOXX', 'SMH', 'TSM', 'BABA', 'ASML', 'NVO', 'SAP', 'SHEL', 'AZN',
  'RACE', 'TTE', 'SE', 'GRAB', 'CPNG', 'MELI', 'NU', 'VALE', 'PBR',
]);

/**
 * Menghitung jumlah lembar saham / unit koin dan informasi mata uang:
 * - Saham IDX (misal BBCA, BBCA.JK, PTBA): 1 lot = 100 lembar (IDR)
 * - Crypto Spot (misal BTC, BTCUSDT, ETH): satuan koin unit/desimal (USDT @ Rp 16.000)
 * - Saham US (misal NVDA, AAPL, GOOGL): 1 lembar shares (USD @ Rp 16.000)
 */
export function calculateShares(symbol: string, lots: number): {
  isCrypto: boolean;
  isUS: boolean;
  isIDX: boolean;
  shares: number;
  unitLabel: string;
  currency: 'IDR' | 'USDT' | 'USD';
  exchangeRate: number;
} {
  const clean = symbol.replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
  const isCrypto = symbol.toUpperCase().endsWith('USDT') || isCryptoSymbol(clean) || FALLBACK_CRYPTO.has(clean);
  const isUS = !isCrypto && (isUSSymbol(clean) || FALLBACK_US.has(clean) || clean.includes('.T') || clean.includes('.HK') || clean.includes('.KS') || clean.includes('.NS') || clean.includes('.AS') || clean.includes('.PA') || clean.includes('.DE'));
  const isIDX = !isCrypto && !isUS && (symbol.endsWith('.JK') || /^[A-Z]{4}$/.test(clean));

  if (isCrypto) {
    return {
      isCrypto: true,
      isUS: false,
      isIDX: false,
      shares: lots, // koin unit
      unitLabel: 'koin unit',
      currency: 'USDT',
      exchangeRate: 16000,
    };
  }

  if (isUS) {
    return {
      isCrypto: false,
      isUS: true,
      isIDX: false,
      shares: lots,
      unitLabel: 'lembar (shares)',
      currency: 'USD',
      exchangeRate: 16000,
    };
  }

  return {
    isCrypto: false,
    isUS: false,
    isIDX: true,
    shares: lots * 100,
    unitLabel: 'lot (100 lembar)',
    currency: 'IDR',
    exchangeRate: 1,
  };
}

/**
 * Normalisasi ticker agar konsisten
 */
export function normalizeSymbol(sym: string): { fullSymbol: string; displaySymbol: string } {
  let clean = sym.trim().toUpperCase().replace('.JK', '').replace(/USDT$/i, '');
  if (clean === 'GOOGLE') clean = 'GOOGL';
  if (isCryptoSymbol(clean) || FALLBACK_CRYPTO.has(clean) || sym.toUpperCase().endsWith('USDT')) {
    return { fullSymbol: `${clean}USDT`, displaySymbol: clean };
  }
  if (isUSSymbol(clean) || FALLBACK_US.has(clean) || sym.includes(':') || sym.startsWith('^')) {
    return { fullSymbol: clean, displaySymbol: clean };
  }
  // Default saham Indonesia jika 4 huruf
  if (clean.length === 4 && /^[A-Z]+$/.test(clean)) {
    return { fullSymbol: `${clean}.JK`, displaySymbol: clean };
  }
  return { fullSymbol: sym.includes('.') || sym.startsWith('^') ? sym : `${clean}.JK`, displaySymbol: clean };
}

/**
 * Almgren-Chriss Market Impact & Realistic Slippage Model
 * Mensimulasikan dampak pasar nyata pada MARKET order:
 * Semakin besar ukuran lot dibanding likuiditas normal, semakin besar slippage.
 */
export function calculateRealisticExecutionPrice(
  quotedPrice: number,
  lots: number,
  symbol: string,
  orderType: 'LIMIT' | 'MARKET',
  isSell: boolean = false
): {
  executedPrice: number;
  slippagePct: number;
  slippageNominal: number;
} {
  // Order LIMIT dieksekusi tepat pada limit price (zero unexpected slippage)
  if (orderType === 'LIMIT' || lots <= 0 || quotedPrice <= 0) {
    return {
      executedPrice: quotedPrice,
      slippagePct: 0,
      slippageNominal: 0,
    };
  }

  const cleanSym = symbol.replace('.JK', '').replace(/USDT$/i, '').toUpperCase();
  const isLargeCap = ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM', 'AMMN', 'AAPL', 'MSFT', 'NVDA', 'BTC', 'ETH'].includes(cleanSym);
  
  // Baseline participation threshold
  // Saham Bluechip likuid: dampak kecil (~0.05% - 0.2%)
  // Saham Smallcap/kripto volatil: dampak lebih nyata (~0.2% - 1.8%)
  const baseImpactFactor = isLargeCap ? 0.00008 : 0.00045;
  const sqrtLots = Math.sqrt(lots);
  
  // Square-Root Law of Market Impact
  let slippagePct = Math.min(0.035, baseImpactFactor * sqrtLots); // Max 3.5% slippage cap
  if (lots <= 5) slippagePct = 0; // Order retail mikro tanpa slippage

  const isForeign = isCryptoSymbol(cleanSym) || isUSSymbol(cleanSym);
  const factor = isSell ? (1 - slippagePct) : (1 + slippagePct);
  const rawExecuted = quotedPrice * factor;

  // Round executed price to valid exchange tick
  let executedPrice = rawExecuted;
  if (!isForeign) {
    const tick = getIDXTickSize(quotedPrice);
    executedPrice = isSell
      ? Math.floor(rawExecuted / tick) * tick
      : Math.ceil(rawExecuted / tick) * tick;
  } else {
    const precision = quotedPrice < 1 ? 4 : 2;
    executedPrice = Number(rawExecuted.toFixed(precision));
  }

  const slippageNominal = Math.abs(executedPrice - quotedPrice);

  return {
    executedPrice,
    slippagePct: Number((slippagePct * 100).toFixed(3)),
    slippageNominal,
  };
}
