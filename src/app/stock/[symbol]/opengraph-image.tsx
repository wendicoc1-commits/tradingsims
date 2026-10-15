import { ImageResponse } from 'next/og';
import { getAssetBySymbol, isCryptoSymbol } from '@/lib/universe/masterAssetUniverse';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ symbol: string }> | { symbol: string };
}

export default async function Image({ params }: Props) {
  const resolvedParams = await params;
  const rawSymbol = resolvedParams?.symbol || 'BBCA';
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();

  const asset = getAssetBySymbol(symbol);
  const isCrypto = isCryptoSymbol(symbol) || symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA'].includes(symbol);

  const assetName = asset?.name || (isCrypto ? `${symbol} / Tether US Dollar Spot` : `Saham ${symbol} (Bursa Efek Indonesia)`);
  const assetCategory = isCrypto ? 'Kripto Spot 24/7' : 'Saham BEI / IDX';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090a0f',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #10b98120 0%, transparent 65%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 20px',
            borderRadius: '999px',
            backgroundColor: '#10b98115',
            border: '1px solid #10b98140',
            color: '#34d399',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '28px',
          }}
        >
          <span>TradeSim Pro</span>
          <span>•</span>
          <span>{assetCategory}</span>
        </div>

        {/* Big Symbol Ticker */}
        <div
          style={{
            fontSize: '92px',
            fontWeight: 900,
            letterSpacing: '-2px',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #10b981, #38bdf8)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {symbol}
        </div>

        {/* Asset Name */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: '20px',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          {assetName}
        </div>

        {/* Feature Subtitle */}
        <div
          style={{
            fontSize: '20px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '850px',
            marginBottom: '40px',
          }}
        >
          Simulasi Paper Trading Real-Time • Orderbook Level 2 • Modal Virtual Gratis Rp 50 Juta
        </div>

        {/* Footer Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            paddingTop: '24px',
            borderTop: '1px solid #1e293b',
          }}
        >
          <div style={{ color: '#38bdf8', fontSize: '18px', fontWeight: 600 }}>
            📊 Candlestick Chart
          </div>
          <div style={{ color: '#64748b' }}>•</div>
          <div style={{ color: '#34d399', fontSize: '18px', fontWeight: 600 }}>
            🛡️ 100% Tanpa Risiko Uang Riil
          </div>
          <div style={{ color: '#64748b' }}>•</div>
          <div style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 600 }}>
            ⚡ tradingsims.my.id
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
