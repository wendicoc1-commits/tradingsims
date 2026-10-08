/**
 * Utilitas dan Aturan Bursa Efek Indonesia (IDX) & Pasar US
 */

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

const CRYPTO_TICKERS = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK',
  'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET', 'ARB', 'OP', 'APT', 'KAS', 'TON'
]);

const US_TICKERS = new Set([
  'NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'SPY', 'QQQ', 'COIN', 'PLTR'
]);

/**
 * Menghitung jumlah lembar saham / unit koin dan informasi mata uang:
 * - Saham IDX (misal BBCA, BBCA.JK, PTBA): 1 lot = 100 lembar (IDR)
 * - Crypto Spot (misal BTC, BTCUSDT, ETH): satuan koin unit/desimal (USDT @ Rp 16.000)
 * - Saham US (misal NVDA, AAPL): 1 lembar shares (USD @ Rp 16.000)
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
  const isCrypto = symbol.toUpperCase().endsWith('USDT') || CRYPTO_TICKERS.has(clean);
  const isUS = !isCrypto && US_TICKERS.has(clean);
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
  const clean = sym.trim().toUpperCase().replace('.JK', '').replace(/USDT$/i, '');
  if (CRYPTO_TICKERS.has(clean) || sym.toUpperCase().endsWith('USDT')) {
    return { fullSymbol: `${clean}USDT`, displaySymbol: clean };
  }
  if (US_TICKERS.has(clean) || sym.includes(':') || sym.startsWith('^')) {
    return { fullSymbol: clean, displaySymbol: clean };
  }
  // Default saham Indonesia jika 4 huruf
  if (clean.length === 4 && /^[A-Z]+$/.test(clean)) {
    return { fullSymbol: `${clean}.JK`, displaySymbol: clean };
  }
  return { fullSymbol: sym.includes('.') || sym.startsWith('^') ? sym : `${clean}.JK`, displaySymbol: clean };
}
