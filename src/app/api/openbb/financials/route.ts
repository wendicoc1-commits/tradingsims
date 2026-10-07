import { NextRequest, NextResponse } from 'next/server';
import { getOpenBBFinancials } from '@/lib/openbb/service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'BBCA';
  const data = getOpenBBFinancials(symbol);
  return NextResponse.json(data);
}
