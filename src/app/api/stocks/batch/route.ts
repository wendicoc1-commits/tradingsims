import { NextResponse } from 'next/server';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';
import { getVerifiedBenchmarkPrice } from '@/data/idx_benchmark_prices';
import { getUnifiedStockQuote, classifySymbolMarket } from '../realtime/route';
import type { StockQuote } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols') || '';
  const symbols = symbolsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json([]);
  }

  const quotes: StockQuote[] = await Promise.all(
    symbols.map(async (rawSymbol) => {
      const { clean, cleanCryptoKey, marketType } = classifySymbolMarket(rawSymbol);
      const isCrypto = marketType === 'CRYPTO';
      const isUS = marketType === 'US';

      const asset =
        getAssetBySymbol(rawSymbol.toUpperCase()) ||
        getAssetBySymbol(clean) ||
        getAssetBySymbol(cleanCryptoKey) ||
        getAssetBySymbol(`${cleanCryptoKey}USDT`);

      const unified = await getUnifiedStockQuote(rawSymbol);
      const fallbackBench = getVerifiedBenchmarkPrice(isCrypto ? `${cleanCryptoKey}USDT` : clean);

      const price = unified.price;
      const prevClose = unified.prevClose || price;
      const changePt = unified.changePoint;
      const changePct = unified.changePct;
      const high = unified.high || price;
      const low = unified.low || price;
      const volume = unified.volume || (isCrypto || isUS ? 25_000_000 : 10_000_000);
      const currency = isCrypto ? 'USDT' : (unified.currency || asset?.currency || (isUS ? 'USD' : 'IDR'));
      const isUSD = currency === 'USD' || currency === 'USDT' || isCrypto || isUS;

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

      return {
        symbol: isCrypto ? `${cleanCryptoKey}USDT` : isUS ? clean : rawSymbol.includes('.') ? rawSymbol.toUpperCase() : `${clean}.JK`,
        displaySymbol: cleanCryptoKey,
        name: asset?.name || fallbackBench.name || `${clean} Tbk`,
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
        marketCap: isCrypto ? price * 19_000_000 : price * 1_000_000_000,
        peRatio: isCrypto ? null : 15.2,
        fiftyTwoWeekHigh: formatPrice(price * 1.35),
        fiftyTwoWeekLow: formatPrice(price * 0.65),
        sparkline,
        marketStatus: isCrypto ? 'OPEN' : 'REGULAR',
        timestamp: unified.updatedAt || new Date().toISOString(),
      };
    })
  );

  return NextResponse.json(quotes);
}
