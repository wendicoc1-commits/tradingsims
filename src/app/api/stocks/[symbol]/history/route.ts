import { GET as getHistory } from '../../history/route';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const url = new URL(request.url);
  url.searchParams.set('symbol', symbol);
  return getHistory(new Request(url.toString(), request));
}
