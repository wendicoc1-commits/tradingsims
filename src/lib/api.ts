import type {
  StockQuote,
  MarketBoardItem,
  SearchResult,
  HistoryCandle,
  MarketSummary,
} from '../types'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface SearchStocksResponse {
  query: string
  count: number
  results: SearchResult[]
}

export interface MarketBoardResponse {
  status: string
  total: number
  offset: number
  limit: number
  category: string
  data: MarketBoardItem[]
}

export interface HistoryResponse {
  symbol: string
  displaySymbol: string
  name: string
  currency: string
  timeframe: string
  candles: HistoryCandle[]
}

export interface AllStocksParams {
  board?: string
  sector?: string
  search?: string
  limit?: number
  offset?: number
}

export interface AllStocksResponse {
  status: string
  total: number
  offset: number
  limit: number
  data: Array<{
    code: string
    name: string
    board: string
    sector: string
    listingDate?: string
    shares?: number
    [key: string]: unknown
  }>
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = API_BASE ? `${API_BASE}${cleanEndpoint}` : cleanEndpoint
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    throw new Error(`API request failed: ${res.status} ${res.statusText}${errorText ? ` - ${errorText}` : ''}`)
  }

  return res.json() as Promise<T>
}

/**
 * Mengambil data quote lengkap untuk satu saham
 */
export async function fetchQuote(symbol: string): Promise<StockQuote> {
  const params = new URLSearchParams({ symbol })
  return request<StockQuote>(`/api/stocks/quote?${params.toString()}`)
}

/**
 * Mengambil harga dan data terkini untuk kumpulan simbol saham
 */
export async function fetchBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const params = new URLSearchParams({ symbols: symbols.join(',') })
  return request<StockQuote[]>(`/api/stocks/batch?${params.toString()}`)
}

/**
 * Mencari saham berdasarkan ticker atau nama emiten
 */
export async function searchStocks(query: string): Promise<SearchStocksResponse> {
  const params = new URLSearchParams({ q: query })
  return request<SearchStocksResponse>(`/api/stocks/search?${params.toString()}`)
}

/**
 * Mengambil data kartu saham untuk Market Board dengan filter kategori, pencarian, dan paginasi
 */
export async function fetchMarketBoard(
  category = 'ALL',
  search?: string,
  limit = 24,
  offset = 0
): Promise<MarketBoardResponse> {
  const params = new URLSearchParams({
    category,
    limit: String(limit),
    offset: String(offset),
  })
  if (search) {
    params.set('search', search)
  }
  return request<MarketBoardResponse>(`/api/markets/board?${params.toString()}`)
}

/**
 * Mengambil data candlestick OHLCV historis bursa asli dari Yahoo Finance
 */
export async function fetchHistory(symbol: string, timeframe = '1D'): Promise<HistoryResponse> {
  const params = new URLSearchParams({
    symbol,
    timeframe,
  });
  // Call internal Next.js API route directly
  const res = await fetch(`/api/stocks/history?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  return res.json() as Promise<HistoryResponse>;
}

/**
 * Mengambil seluruh daftar saham dengan filter board, sector, dan search
 */
export async function fetchAllStocks(params?: AllStocksParams): Promise<AllStocksResponse> {
  const searchParams = new URLSearchParams()
  if (params?.board) searchParams.set('board', params.board)
  if (params?.sector) searchParams.set('sector', params.sector)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
  if (params?.offset !== undefined) searchParams.set('offset', String(params.offset))

  const queryString = searchParams.toString()
  return request<AllStocksResponse>(`/api/stocks/all${queryString ? `?${queryString}` : ''}`)
}

/**
 * Mengambil ringkasan kondisi pasar dan indeks utama
 */
export async function fetchMarketSummary(): Promise<MarketSummary> {
  return request<MarketSummary>('/api/markets/summary')
}
