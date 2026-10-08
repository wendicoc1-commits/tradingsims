/**
 * Fincept Master Asset Universe
 * Unifies 1000+ assets across:
 * - 951+ Indonesia Stock Exchange (IDX / BEI) Equities
 * - 50+ Global US & International Stocks (NASDAQ, S&P 500)
 * - 15+ Top Liquid Cryptocurrencies (Binance / Spot)
 */

import idxDividendJson from '@/data/idx_dividend_all.json';
import { IDX_BENCHMARK_PRICES } from '@/data/idx_benchmark_prices';
import { MASTER_GLOBAL_STOCKS } from '@/data/global_markets_universe';

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

// 1. Top Cryptocurrencies
const CRYPTO_MASTER: UnifiedAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin (Spot / Satoshi)', category: 'CRYPTO', sector: 'Digital Gold / L1', currency: 'USD', market: 'CRYPTO', defaultPrice: 81118, flag: '⚡', isPopular: true },
  { symbol: 'ETH', name: 'Ethereum (Smart Contracts)', category: 'CRYPTO', sector: 'Layer-1 Smart Contracts', currency: 'USD', market: 'CRYPTO', defaultPrice: 2450, flag: '⚡', isPopular: true },
  { symbol: 'SOL', name: 'Solana (High Throughput L1)', category: 'CRYPTO', sector: 'Layer-1 High Speed', currency: 'USD', market: 'CRYPTO', defaultPrice: 108.32, flag: '⚡', isPopular: true },
  { symbol: 'BNB', name: 'BNB (Binance Ecosystem)', category: 'CRYPTO', sector: 'Exchange Token / L1', currency: 'USD', market: 'CRYPTO', defaultPrice: 585, flag: '⚡', isPopular: true },
  { symbol: 'DOGE', name: 'Dogecoin (Meme Liquidity)', category: 'CRYPTO', sector: 'Meme / Payment', currency: 'USD', market: 'CRYPTO', defaultPrice: 0.0827, flag: '⚡', isPopular: true },
  { symbol: 'XRP', name: 'XRP (Ripple Settlement)', category: 'CRYPTO', sector: 'Cross-Border Payments', currency: 'USD', market: 'CRYPTO', defaultPrice: 1.42, flag: '⚡', isPopular: true },
  { symbol: 'ADA', name: 'Cardano (PoS Blockchain)', category: 'CRYPTO', sector: 'Layer-1 UTXO', currency: 'USD', market: 'CRYPTO', defaultPrice: 0.35, flag: '⚡' },
  { symbol: 'AVAX', name: 'Avalanche (Subnet Consensus)', category: 'CRYPTO', sector: 'Layer-1 Multi-Chain', currency: 'USD', market: 'CRYPTO', defaultPrice: 26.5, flag: '⚡' },
  { symbol: 'SUI', name: 'Sui Network (Move VM)', category: 'CRYPTO', sector: 'Layer-1 Move Language', currency: 'USD', market: 'CRYPTO', defaultPrice: 1.85, flag: '⚡' },
  { symbol: 'NEAR', name: 'NEAR Protocol (AI Chain)', category: 'CRYPTO', sector: 'Layer-1 Sharded / AI', currency: 'USD', market: 'CRYPTO', defaultPrice: 4.67, flag: '⚡' },
  { symbol: 'LINK', name: 'Chainlink (Oracle Network)', category: 'CRYPTO', sector: 'Decentralized Oracle', currency: 'USD', market: 'CRYPTO', defaultPrice: 11.5, flag: '⚡' },
  { symbol: 'PEPE', name: 'Pepe Token (Deflationary Meme)', category: 'CRYPTO', sector: 'Meme Momentum', currency: 'USD', market: 'CRYPTO', defaultPrice: 0.00000378, flag: '⚡' },
  { symbol: 'RENDER', name: 'Render Network (GPU Cloud)', category: 'CRYPTO', sector: 'Decentralized Compute', currency: 'USD', market: 'CRYPTO', defaultPrice: 1.828, flag: '⚡' },
  { symbol: 'ARB', name: 'Arbitrum (L2 Rollup)', category: 'CRYPTO', sector: 'Layer-2 Ethereum Scaling', currency: 'USD', market: 'CRYPTO', defaultPrice: 0.1672, flag: '⚡' },
  { symbol: 'APT', name: 'Aptos (Move Language L1)', category: 'CRYPTO', sector: 'Layer-1 High Speed', currency: 'USD', market: 'CRYPTO', defaultPrice: 0.7161, flag: '⚡' },
  { symbol: 'SHIB', name: 'Shiba Inu (Ecosystem)', category: 'CRYPTO', sector: 'Meme Ecosystem', currency: 'USD', market: 'CRYPTO', defaultPrice: 0.000018, flag: '⚡' },
  { symbol: 'DOT', name: 'Polkadot (Interoperability)', category: 'CRYPTO', sector: 'Cross-Chain Relay', currency: 'USD', market: 'CRYPTO', defaultPrice: 4.25, flag: '⚡' },
  { symbol: 'TAO', name: 'Bittensor (Decentralized AI)', category: 'CRYPTO', sector: 'Machine Intelligence', currency: 'USD', market: 'CRYPTO', defaultPrice: 540, flag: '⚡' },
  { symbol: 'FET', name: 'Artificial Superintelligence', category: 'CRYPTO', sector: 'Autonomous AI Agents', currency: 'USD', market: 'CRYPTO', defaultPrice: 1.35, flag: '⚡' },
];

// 2. Global US Stocks
const GLOBAL_MASTER: UnifiedAsset[] = MASTER_GLOBAL_STOCKS.map((s) => ({
  symbol: s.ticker.toUpperCase(),
  name: s.name,
  category: 'GLOBAL' as AssetCategory,
  sector: s.sector,
  currency: 'USD' as const,
  market: 'US' as const,
  defaultPrice: s.price,
  flag: s.flag || '🌐',
  isPopular: ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'PLTR'].includes(s.ticker.toUpperCase()),
}));

// Popular IDX Bluechips
const POPULAR_IDX = new Set([
  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM',
  'ADRO', 'PTBA', 'PGAS', 'AMMN', 'ANTM', 'BREN',
  'ICBP', 'UNVR', 'MYOR', 'GOTO', 'BUKA', 'EMTK',
  'BRIS', 'MEDC', 'INKP', 'MDKA', 'CPIN', 'BRMS', 'CUAN',
]);

// 3. 951 IDX Stocks from idx_dividend_all.json
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

// Master Map
export const MASTER_ASSETS: UnifiedAsset[] = [...CRYPTO_MASTER, ...IDX_MASTER, ...GLOBAL_MASTER];

// Index for O(1) lookup
const ASSET_BY_SYMBOL = new Map<string, UnifiedAsset>();
for (const a of MASTER_ASSETS) {
  ASSET_BY_SYMBOL.set(a.symbol.toUpperCase(), a);
}

/**
 * Get asset definition by symbol (supports ticker like BBCA, BTC, NVDA)
 */
export function getAssetBySymbol(symbol: string): UnifiedAsset | undefined {
  if (!symbol) return undefined;
  const clean = symbol.toUpperCase().trim().replace('.JK', '');
  return ASSET_BY_SYMBOL.get(clean);
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
 * Total statistics for UI display
 */
export const UNIVERSE_STATS = {
  totalAssets: MASTER_ASSETS.length,
  idxCount: IDX_MASTER.length,
  cryptoCount: CRYPTO_MASTER.length,
  globalCount: GLOBAL_MASTER.length,
};
