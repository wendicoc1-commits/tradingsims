/**
 * Kalkulasi Indikator Teknikal Finansial (EMA, RSI)
 */

export interface IndicatorPoint {
  time: any;
  value: number;
}

/**
 * Exponential Moving Average (EMA)
 * Multiplier = 2 / (period + 1)
 * EMA_today = (Close_today * Multiplier) + (EMA_yesterday * (1 - Multiplier))
 */
export function calculateEMA(
  candles: { time: any; close: number }[],
  period: number
): IndicatorPoint[] {
  if (candles.length < period) return [];

  const k = 2 / (period + 1);
  const result: IndicatorPoint[] = [];

  // Hitung SMA awal sebagai seed pertama
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += Number(candles[i].close);
  }
  let prevEMA = sum / period;

  result.push({
    time: candles[period - 1].time,
    value: Math.round(prevEMA * 100) / 100,
  });

  // Iterasi sisa candles dengan rumus EMA
  for (let i = period; i < candles.length; i++) {
    const close = Number(candles[i].close);
    const currentEMA = close * k + prevEMA * (1 - k);
    result.push({
      time: candles[i].time,
      value: Math.round(currentEMA * 100) / 100,
    });
    prevEMA = currentEMA;
  }

  return result;
}

/**
 * Relative Strength Index (RSI) - Periode default 14
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 */
export function calculateRSI(
  candles: { time: any; close: number }[],
  period: number = 14
): IndicatorPoint[] {
  if (candles.length <= period) return [];

  const changes: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    changes.push(Number(candles[i].close) - Number(candles[i - 1].close));
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    const diff = changes[i];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }

  avgGain /= period;
  avgLoss /= period;

  const result: IndicatorPoint[] = [];

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

  result.push({
    time: candles[period].time,
    value: Math.round(rsi * 100) / 100,
  });

  for (let i = period; i < changes.length; i++) {
    const diff = changes[i];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    result.push({
      time: candles[i + 1].time,
      value: Math.round(rsi * 100) / 100,
    });
  }

  return result;
}
