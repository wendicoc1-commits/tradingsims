import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'TradeSim Pro - #1 Trading Simulator Saham Indonesia (BEI) & Crypto';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
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
          backgroundImage: 'radial-gradient(circle at 50% 20%, #10b98125 0%, transparent 60%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#090a0f',
            }}
          >
            TS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1px' }}>
              TradeSim <span style={{ color: '#10b981' }}>Pro</span>
            </span>
            <span style={{ fontSize: '16px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Institutional Workstation
            </span>
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '24px',
            maxWidth: '1000px',
            background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          #1 Trading Simulator Saham BEI & Crypto 24/7
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Latihan paper trading saham IDX & crypto spot tanpa risiko finansial nyata. Data pasar real-time, orderbook level 2, dan modal virtual gratis Rp 50 Juta.
        </div>

        {/* Badges Footer */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
          }}
        >
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              backgroundColor: '#10b98115',
              border: '1px solid #10b98150',
              color: '#34d399',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            💰 Saldo Virtual Rp 50.000.000
          </div>
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              backgroundColor: '#06b6d415',
              border: '1px solid #06b6d450',
              color: '#38bdf8',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            ⚡ Data Pasar Real-Time
          </div>
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              backgroundColor: '#f59e0b15',
              border: '1px solid #f59e0b50',
              color: '#fbbf24',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            ⭐ Rating 4.9 (12K+ Traders)
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
