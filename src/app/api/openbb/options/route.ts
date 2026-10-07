import { NextRequest, NextResponse } from 'next/server';
import { getOpenBBOptionChain } from '@/lib/openbb/service';
import { getVerifiedBenchmarkPrice } from '@/data/idx_benchmark_prices';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'BBCA';
  const benchmark = getVerifiedBenchmarkPrice(symbol.toUpperCase());
  const price = benchmark ? benchmark.price : 9850;
  const data = getOpenBBOptionChain(symbol, price);
  return NextResponse.json(data);
}
