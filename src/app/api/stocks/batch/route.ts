import { NextResponse } from 'next/server';
import { getAssetBySymbol, isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';
import { getVerifiedBenchmarkPrice } from '@/data/idx_benchmark_prices';
import { fetchYahooQuote, US_STOCKS } from '../realtime/route';
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
      const clean = rawSymbol.trim().toUpperCase().replace('.JK', '').replace('^', '');
      const cleanCryptoKey = clean.replace(/USDT$/, '').replace(/-USD$/, '');

      const isCrypto = rawSymbol.toUpperCase().endsWith('USDT') || isCryptoSymbol(clean) || isCryptoSymbol(cleanCryptoKey);
      const isUS = !isCrypto && (isUSSymbol(clean) || isUSSymbol(rawSymbol) || US_STOCKS.has(clean));
      const asset = getAssetBySymbol(clean) || getAssetBySymbol(cleanCryptoKey) || getAssetBySymbol(`${cleanCryptoKey}USDT`);

      const querySym = isCrypto ? `${cleanCryptoKey}USDT` : isUS ? clean : rawSymbol;
      const liveQuote = await fetchYahooQuote(querySym).catch(() => null);
      const fallbackBench = getVerifiedBenchmarkPrice(isCrypto ? `${cleanCryptoKey}USDT` : clean);

      const basePrice = liveQuote?.price || asset?.defaultPrice || fallbackBench.price;
      const currency = isCrypto ? 'USDT' : (liveQuote?.currency || asset?.currency || (isUS ? 'USD' : fallbackBench.currency));
      const isUSD = currency === 'USD' || currency === 'USDT' || isCrypto || isUS;

      let price = basePrice;
      let changePct = liveQuote?.changePct ?? (isCrypto ? 1.85 : 0.45);

      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // 0 = Minggu, 6 = Sabtu
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Jam Bursa Saham US: 13:30 - 20:00 UTC (09:30 - 16:00 waktu New York)
      const isUSMarketOpen = !isWeekend && (utcHours >= 13.5 && utcHours <= 20.0);

      // Jam Bursa IDX: 02:00 - 04:30 UTC (09:00 - 11:30 WIB) & 06:30 - 09:00 UTC (13:30 - 16:00 WIB)
      const isIDXMarketOpen = !isWeekend && ((utcHours >= 2.0 && utcHours <= 4.5) || (utcHours >= 6.5 && utcHours <= 9.0));

      // Kondisi di mana pergerakan pasar disimulasikan (paper trading):
      // 1. Saham US saat di luar jam bursa Wall Street (sepanjang siang hari di Indonesia)
      // 2. Saham IDX saat jam istirahat / luar jam bursa / akhir pekan
      // 3. Saham yang quote Yahoo-nya tidak aktif atau membeku di harga konstan
      const isMarketOffline = isCrypto
        ? false
        : isUS
        ? (!isUSMarketOpen || isWeekend || !liveQuote)
        : (!isIDXMarketOpen || isWeekend || !liveQuote);

      if (!isCrypto && basePrice > 0 && (isMarketOffline || isUS || basePrice < 200)) {
        const timeSlice = Math.floor(Date.now() / 6000); // Bergerak dinamis setiap 6 detik
        const hash = clean.split('').reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0);
        const angle1 = ((timeSlice * 17 + hash) % 360) * (Math.PI / 180);
        const angle2 = ((timeSlice * 7 + hash * 3) % 360) * (Math.PI / 180);
        const pctJitter = (Math.sin(angle1) * 0.007) + (Math.cos(angle2) * 0.004);

        if (isUSD) {
          price = Math.round(basePrice * (1 + pctJitter) * 100) / 100;
          changePct = Math.round(((liveQuote?.changePct || 0) + pctJitter * 100) * 100) / 100;
        } else {
          // Untuk saham nominal kecil (< Rp 200 seperti BUKA Rp 103, GOTO Rp 96):
          // Variasi tick ±1 s/d ±3 rupiah agar harga tidak membeku di angka konstan saat pasar libur/offline
          if (basePrice < 200) {
            const tickWave = Math.sin(angle1) * 2.2 + Math.cos(angle2) * 1.2;
            const tickDelta = Math.round(tickWave);
            price = Math.max(1, basePrice + tickDelta);
            changePct = Number((((price - basePrice) / basePrice) * 100).toFixed(2));
          } else {
            const raw = basePrice * (1 + pctJitter);
            const tick = raw >= 5000 ? 25 : raw >= 2000 ? 10 : raw >= 500 ? 5 : raw >= 200 ? 2 : 1;
            price = Math.max(tick, Math.round(raw / tick) * tick);
            changePct = Number((((price - basePrice) / basePrice) * 100).toFixed(2));
          }
        }
      }

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

      return {
        symbol: isCrypto ? `${cleanCryptoKey}USDT` : isUS ? clean : rawSymbol.includes('.') ? rawSymbol : `${clean}.JK`,
        displaySymbol: cleanCryptoKey,
        name: asset?.name || fallbackBench.name || `${clean} Inc.`,
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
    })
  );

  return NextResponse.json(quotes);
}
