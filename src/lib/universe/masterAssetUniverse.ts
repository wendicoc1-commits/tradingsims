/**
 * Fincept Master Asset Universe
 * Unifies 1200+ assets across:
 * - 951+ Indonesia Stock Exchange (IDX / BEI) Equities
 * - 160+ Global US & International Stocks (NASDAQ, S&P 500, NYSE, TSE, HKEX, Euronext)
 * - 72+ Top Liquid Cryptocurrencies (Binance / Spot)
 */

import idxDividendJson from '@/data/idx_dividend_all.json';
import { IDX_BENCHMARK_PRICES } from '@/data/idx_benchmark_prices';
import { MASTER_GLOBAL_STOCKS, MASTER_GLOBAL_CRYPTO } from '@/data/global_markets_universe';

export type AssetCategory = 'IDX' | 'CRYPTO' | 'GLOBAL';

export interface UnifiedAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  sector: string;
  currency: 'IDR' | 'USD';
  market: 'IDX' | 'US' | 'CRYPTO';
  board?: string;
  defaultPrice: number;
  flag: string;
  isPopular?: boolean;
}

// 1. Top Cryptocurrencies generated dynamically from MASTER_GLOBAL_CRYPTO (72+ pairs)
const POPULAR_CRYPTO = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'SUI', 'NEAR',
  'LINK', 'PEPE', 'SHIB', 'RENDER', 'ARB', 'APT', 'TAO', 'FET', 'TON', 'KAS',
]);

const CRYPTO_MASTER: UnifiedAsset[] = MASTER_GLOBAL_CRYPTO.map((c) => {
  const base = c.symbol.replace(/USDT$/, '');
  return {
    symbol: base,
    name: c.name,
    category: 'CRYPTO' as AssetCategory,
    sector: `Crypto ${c.category}`,
    currency: 'USD' as const,
    market: 'CRYPTO' as const,
    defaultPrice: c.price,
    flag: '⚡',
    isPopular: POPULAR_CRYPTO.has(base),
  };
});

// 2. Global US & World Stocks (160+ emiten)
// 2. 951 IDX Stocks from idx_dividend_all.json
const POPULAR_IDX = new Set([
  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM',
  'ADRO', 'PTBA', 'PGAS', 'AMMN', 'ANTM', 'BREN',
  'ICBP', 'UNVR', 'MYOR', 'GOTO', 'BUKA', 'EMTK',
  'BRIS', 'MEDC', 'INKP', 'MDKA', 'CPIN', 'BRMS', 'CUAN',
]);

const IDX_MASTER: UnifiedAsset[] = (idxDividendJson as any[]).map((item) => {
  const code = (item.code || '').toUpperCase().trim();
  const benchmark = IDX_BENCHMARK_PRICES[code];
  const price = benchmark ? benchmark.price : (item.dps && item.yield ? Math.round((item.dps / item.yield) * 100) : 1000);

  return {
    symbol: code,
    name: item.name || `${code} Tbk`,
    category: 'IDX' as AssetCategory,
    sector: item.sector || 'General',
    currency: 'IDR' as const,
    market: 'IDX' as const,
    board: item.board || 'Utama',
    defaultPrice: price,
    flag: '🇮🇩',
    isPopular: POPULAR_IDX.has(code),
  };
});

const IDX_SET = new Set(IDX_MASTER.map((i) => i.symbol.toUpperCase()));

// 3. Global US & World Stocks (160+ emiten luar negeri)
const POPULAR_GLOBAL = new Set([
  'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'PLTR', 'AVGO', 'AMD',
  'BRK.B', 'LLY', 'JPM', 'V', 'WMT', 'NFLX', 'ORCL', 'COST', 'XOM', 'COIN', 'QCOM',
  'CRM', 'ADBE', 'INTC', 'MA', 'PG', 'JNJ', 'HD', 'TSM', 'BABA', 'ASML', 'NVO',
  'SPY', 'QQQ', 'SOXX', 'SMH', 'VOO',
]);

const GLOBAL_MASTER: UnifiedAsset[] = MASTER_GLOBAL_STOCKS
  .filter((s) => s.countryCode !== 'ID' && !IDX_SET.has(s.ticker.toUpperCase()))
  .map((s) => ({
    symbol: s.ticker.toUpperCase(),
    name: s.name,
    category: 'GLOBAL' as AssetCategory,
    sector: s.sector,
    currency: (s.currency === 'IDR' ? 'IDR' : 'USD') as const,
    market: (s.countryCode === 'ID' ? 'IDX' : 'US') as const,
    defaultPrice: s.price,
    flag: s.flag || '🌐',
    isPopular: POPULAR_GLOBAL.has(s.ticker.toUpperCase()),
  }));

// Master Map: Prioritaskan IDX dan Kripto agar tidak tertimpa saham global
export const MASTER_ASSETS: UnifiedAsset[] = [...CRYPTO_MASTER, ...IDX_MASTER, ...GLOBAL_MASTER];

// Index for O(1) lookup
const ASSET_BY_SYMBOL = new Map<string, UnifiedAsset>();
for (const a of MASTER_ASSETS) {
  const sym = a.symbol.toUpperCase();
  // Jangan menimpa emiten IDX jika simbol sama
  if (!ASSET_BY_SYMBOL.has(sym)) {
    ASSET_BY_SYMBOL.set(sym, a);
  }
  if (a.category === 'CRYPTO') {
    ASSET_BY_SYMBOL.set(`${sym}USDT`, a);
    ASSET_BY_SYMBOL.set(`${sym}-USD`, a);
  }
}

// Global sets for fast O(1) membership checks
const CRYPTO_SET = new Set(CRYPTO_MASTER.map((c) => c.symbol.toUpperCase()));
const GLOBAL_SET = new Set(GLOBAL_MASTER.map((g) => g.symbol.toUpperCase()));

/**
 * Check whether a symbol represents a Cryptocurrency
 */
export function isCryptoSymbol(symbol: string): boolean {
  if (!symbol) return false;
  const clean = symbol.trim().toUpperCase().replace(/USDT$/i, '').replace(/-USD$/i, '');
  return CRYPTO_SET.has(clean) || symbol.toUpperCase().endsWith('USDT');
}

/**
 * Check whether a symbol represents a US / Foreign Global Stock
 */
export function isUSSymbol(symbol: string): boolean {
  if (!symbol) return false;
  const clean = symbol.trim().toUpperCase().replace('.JK', '');
  if (symbol.toUpperCase().endsWith('.JK')) return false;
  if (IDX_SET.has(clean)) return false; // Saham IDX TIDAK PERNAH merupakan saham US!
  return GLOBAL_SET.has(clean);
}

/**
 * Return all supported crypto base tickers
 */
export function getAllCryptoSymbols(): string[] {
  return Array.from(CRYPTO_SET);
}

/**
 * Return all supported global / US stock tickers
 */
export function getAllGlobalSymbols(): string[] {
  return Array.from(GLOBAL_SET);
}

/**
 * Get asset definition by symbol (supports ticker like BBCA, BTC, NVDA, BTCUSDT)
 */
export function getAssetBySymbol(symbol: string): UnifiedAsset | undefined {
  if (!symbol) return undefined;
  const clean = symbol.toUpperCase().trim().replace('.JK', '');
  return ASSET_BY_SYMBOL.get(clean) || ASSET_BY_SYMBOL.get(clean.replace(/USDT$/i, ''));
}

/**
 * Filter assets by category ('ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL')
 */
export function getAssetsByCategory(category: 'ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL'): UnifiedAsset[] {
  if (category === 'ALL') return MASTER_ASSETS;
  return MASTER_ASSETS.filter((a) => a.category === category);
}

/**
 * Search assets by ticker or name with fast prefix + substring search
 */
export function searchAssets(
  query: string,
  category: 'ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL' = 'ALL',
  limit = 20
): UnifiedAsset[] {
  const q = query.toUpperCase().trim();
  const pool = category === 'ALL' ? MASTER_ASSETS : MASTER_ASSETS.filter((a) => a.category === category);

  if (!q) {
    // Return popular/first items
    const popular = pool.filter((a) => a.isPopular);
    return popular.length > 0 ? popular.slice(0, limit) : pool.slice(0, limit);
  }

  // Exact match first
  const exact = pool.filter((a) => a.symbol === q);
  // Starts with symbol
  const startsSym = pool.filter((a) => a.symbol !== q && a.symbol.startsWith(q));
  // Includes in name or sector
  const contains = pool.filter((a) => !a.symbol.startsWith(q) && (a.name.toUpperCase().includes(q) || a.sector.toUpperCase().includes(q)));

  return [...exact, ...startsSym, ...contains].slice(0, limit);
}

/**
 * Get all available sectors across master universe
 */
export function getAllSectors(): string[] {
  const set = new Set<string>();
  for (const a of MASTER_ASSETS) {
    if (a.sector) set.add(a.sector);
  }
  return Array.from(set).sort();
}

/**
 * Universe metrics
 */
export function getUniverseSummary() {
  return {
    totalAssets: MASTER_ASSETS.length,
    idxCount: IDX_MASTER.length,
    cryptoCount: CRYPTO_MASTER.length,
    globalCount: GLOBAL_MASTER.length,
  };
}

export const UNIVERSE_STATS = {
  totalAssets: MASTER_ASSETS.length,
  idxCount: IDX_MASTER.length,
  cryptoCount: CRYPTO_MASTER.length,
  globalCount: GLOBAL_MASTER.length,
};
