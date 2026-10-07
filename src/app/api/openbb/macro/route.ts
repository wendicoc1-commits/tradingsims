import { NextResponse } from 'next/server';
import { getOpenBBFredMacro } from '@/lib/openbb/service';

export async function GET() {
  const data = getOpenBBFredMacro();
  return NextResponse.json(data);
}
