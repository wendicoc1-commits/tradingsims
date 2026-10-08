export interface StockQuote {
  symbol: string
  displaySymbol: string
  name: string
  market: string
  country: string
  currency: string
  sector: string
  price: number
  open: number
  high: number
  low: number
  changePoint: number
  changePercentage: number
  volume: number
  marketCap: number
  peRatio: number | null
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  sparkline: number[]
  marketStatus?: {
    isOpen?: boolean
    session?: string
    timezone?: string
    localTime?: string
    exchange?: string
  } | string
  timestamp: string | number
}

export interface MarketBoardItem {
  symbol: string
  displaySymbol: string
  name: string
  market: string
  country: string
  currency: string
  sector: string
  board: string
  tier: string
  isLQ45: boolean
  hasLiveQuote: boolean
  price: number
  changePoint: number
  changePercentage: number
  high: number
  low: number
  sparkline: number[]
}

export interface SearchResult {
  symbol: string
  displaySymbol: string
  name: string
  market: string
  country: string
  currency: string
  sector: string
  board: string
  tier: string
  type: string
}

export interface HistoryCandle {
  time: string | number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface WatchlistItem {
  id: string
  symbol: string
  displaySymbol: string
  name: string
  addedAt: string
}

export interface Watchlist {
  id: string
  name: string
  items: WatchlistItem[]
  createdAt: string
}

export interface Order {
  id: string
  symbol: string
  displaySymbol: string
  type: 'BUY' | 'SELL'
  orderType: 'LIMIT' | 'MARKET'
  price: number
  lots: number
  shares: number
  total: number // Nilai bruto
  fee: number // Total fee
  brokerFee?: number // 0.15% untuk saham / 0.1% untuk crypto
  taxFee?: number // PPh Final 0.1% untuk SELL
  realizedPL?: number // Keuntungan/kerugian terealisasi (hanya untuk SELL)
  realizedPLPercent?: number
  takeProfitPrice?: number
  stopLossPrice?: number
  validityType?: 'DAY' | 'GTC'
  assetClass?: 'EQUITY' | 'CRYPTO'
  currency?: 'IDR' | 'USDT' | 'USD'
  cryptoUnits?: number
  exchangeRate?: number
  status: 'PENDING' | 'FILLED' | 'CANCELLED'
  createdAt: string
  filledAt?: string
}

export interface PortfolioHolding {
  symbol: string
  displaySymbol: string
  name: string
  avgPrice: number // Basis harga rata-rata inklusif fee beli
  lots: number
  shares: number
  currentPrice: number
  unrealizedPL: number
  unrealizedPLPercent: number
  takeProfitPrice?: number
  stopLossPrice?: number
  peakPrice?: number // Harga tertinggi yang pernah dicapai sejak posisi dibuka
  trailingStopPct?: number // Persentase trailing stop dinamis (misal 3.5% atau 5%)
  trailingStopPrice?: number // Harga trailing stop aktif yang bergerak naik mengikuti peakPrice
  twapExecution?: { isTwap: boolean; slicesTotal: number; slicesFilled: number }
  validityType?: 'DAY' | 'GTC'
  assetClass?: 'EQUITY' | 'CRYPTO'
  currency?: 'IDR' | 'USDT' | 'USD'
  cryptoUnits?: number
  exchangeRate?: number
  totalDividendEarned?: number
  realizedPL?: number // Akumulasi profit/loss terealisasi dari penjualan emiten ini
  createdAt?: string
  lastBoughtAt?: number
  source?: 'USER' | 'AI_AGENT'
}

export interface DividendRecord {
  id: string
  symbol: string
  displaySymbol: string
  name: string
  dividendPerShare: number
  shares: number
  grossAmount: number
  taxAmount: number
  netAmount: number
  cumDate: string
  paymentDate: string
  status: 'PAID' | 'UPCOMING'
}

export interface PostAuthor {
  id: string
  username: string
  avatar: string
  verified: boolean
}

export interface Post {
  id: string
  author: PostAuthor
  content: string
  cashtags: string[]
  sentiment: 'BULLISH' | 'BEARISH' | null
  likes: number
  comments: number
  reposts: number
  createdAt: string
  images: string[]
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  followers: number
  following: number
  totalPosts: number
}

export interface MarketSummary {
  status?: string
  timestamp?: number
  data?: StockQuote[]
  indices?: Record<string, { price: number; changePoint: number; changePercentage: number }>
  topGainers?: MarketBoardItem[]
  topLosers?: MarketBoardItem[]
  mostActive?: MarketBoardItem[]
  marketStatus?: string
  advances?: number
  declines?: number
  unchanged?: number
  totalVolume?: number
  totalTurnover?: number
  [key: string]: unknown
}

export interface ConditionalOrder {
  id: string
  symbol: string
  displaySymbol: string
  type: 'BUY' | 'SELL'
  conditionType: 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP' | 'BREAKOUT_BUY'
  triggerPrice: number
  trailingPercent?: number
  peakPrice?: number
  lots: number
  status: 'ACTIVE' | 'TRIGGERED' | 'CANCELLED'
  createdAt: string
  triggeredAt?: string
}

export interface CommodityItem {
  id: string
  name: string
  symbol: string
  category: 'COMMODITY' | 'MACRO' | 'GLOBAL_INDEX'
  unit: string
  price: number
  changePoint: number
  changePercent: number
  relatedStocks: string[]
}

export interface HeatmapStock {
  symbol: string
  name: string
  sector: string
  marketCap: number
  price: number
  changePercent: number
  volume: number
  isSyariah?: boolean
}

