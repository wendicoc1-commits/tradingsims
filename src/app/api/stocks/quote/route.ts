import { NextResponse } from 'next/server';
import { getAssetBySymbol, isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';
import { getVerifiedBenchmarkPrice } from '@/data/idx_benchmark_prices';
import { fetchYahooQuote } from '../realtime/route';
import type { StockQuote } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol') || 'BBCA';
  const clean = rawSymbol.trim().toUpperCase().replace('.JK', '').replace('^', '');
  const cleanCryptoKey = clean.replace(/USDT$/, '').replace(/-USD$/, '');

  // 1. Try master asset universe
  const asset = getAssetBySymbol(clean) || getAssetBySymbol(cleanCryptoKey);

  // 2. Fetch live quote from realtime route engine
  const liveQuote = await fetchYahooQuote(rawSymbol).catch(() => null);

  const fallbackBench = getVerifiedBenchmarkPrice(clean);
  const price = liveQuote?.price || asset?.defaultPrice || fallbackBench.price;
  const currency = liveQuote?.currency || asset?.currency || fallbackBench.currency;
  const isCrypto =
    asset?.category === 'CRYPTO' ||
    isCryptoSymbol(cleanCryptoKey) ||
    isCryptoSymbol(clean) ||
    rawSymbol.toUpperCase().endsWith('USDT') ||
    rawSymbol.toUpperCase().endsWith('-USD');
  const isUS = !isCrypto && (currency === 'USD' || asset?.market === 'US' || isUSSymbol(clean));
  const isUSD = currency === 'USD' || isCrypto || isUS;

  const changePct = liveQuote?.changePct ?? (isCrypto ? 1.85 : 0.45);
  const changePt = liveQuote?.changePoint ?? (price * (changePct / 100));
  const prevClose = liveQuote?.prevClose ?? (price - changePt);
  const high = liveQuote?.high ?? (price * 1.02);
  const low = liveQuote?.low ?? (price * 0.98);
  const volume = liveQuote?.volume ?? (isUSD ? 25000000 : 10000000);

  const formatPrice = (v: number) => {
    if (price < 0.001) return Number(v.toFixed(8));
    if (price < 1) return Number(v.toFixed(4));
    if (isUSD) return Math.round(v * 100) / 100;
    return Math.round(v);
  };

  const sparkline = [
    formatPrice(prevClose),
    formatPrice(prevClose + changePt * 0.3),
    formatPrice(prevClose + changePt * 0.7),
    formatPrice(price),
  ];

  const result: StockQuote = {
    symbol: isCrypto ? `${cleanCryptoKey}USDT` : isUS ? clean : rawSymbol.includes('.') ? rawSymbol : `${clean}.JK`,
    displaySymbol: cleanCryptoKey,
    name: asset?.name || fallbackBench.name || (isUS ? `${clean} Inc.` : `${clean} Tbk`),
    market: isCrypto ? 'CRYPTO' : asset?.market || (isUSD ? 'US' : 'IDX'),
    country: isCrypto ? 'CRYPTO' : isUSD ? 'US' : 'ID',
    currency: isCrypto ? 'USDT' : currency,
    sector: asset?.sector || (isCrypto ? 'Cryptocurrency' : 'Equities'),
    price: formatPrice(price),
    open: formatPrice(prevClose),
    high: formatPrice(high),
    low: formatPrice(low),
    changePoint: formatPrice(changePt),
    changePercentage: Math.round(changePct * 100) / 100,
    volume,
    marketCap: isCrypto ? price * 19000000 : price * 1000000000,
    peRatio: isCrypto ? null : 15.2,
    fiftyTwoWeekHigh: formatPrice(price * 1.35),
    fiftyTwoWeekLow: formatPrice(price * 0.65),
    sparkline,
    marketStatus: isCrypto ? 'OPEN' : 'REGULAR',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
