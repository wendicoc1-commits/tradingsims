import { ImageResponse } from 'next/og';
import { getAssetBySymbol } from '@/lib/universe/masterAssetUniverse';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ pair: string }> | { pair: string };
}

export default async function Image({ params }: Props) {
  const resolvedParams = await params;
  const rawPair = resolvedParams?.pair || 'bbca-vs-bbri';
  const parts = decodeURIComponent(rawPair).toLowerCase().split('-vs-');
  const sym1 = (parts[0] || 'BBCA').toUpperCase();
  const sym2 = (parts[1] || 'BBRI').toUpperCase();

  const asset1 = getAssetBySymbol(sym1);
  const asset2 = getAssetBySymbol(sym2);

  const name1 = asset1?.name || sym1;
  const name2 = asset2?.name || sym2;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#070a12',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #10b98115 0%, transparent 70%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px 80px',
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 24px',
            borderRadius: '999px',
            backgroundColor: '#10b98120',
            border: '1px solid #10b98140',
            color: '#34d399',
            fontSize: '16px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          ⚡ TRADESIM PRO · KOMPARASI PASAR MODAL
        </div>

        {/* Central VS Layout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '50px',
            width: '100%',
          }}
        >
          {/* Asset 1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
              borderRadius: '24px',
              backgroundColor: '#0c1426',
              border: '2px solid #3b82f640',
              width: '420px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '64px', fontWeight: 900, color: '#60a5fa', letterSpacing: '-2px' }}>
              {sym1}
            </div>
            <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '8px', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name1}
            </div>
          </div>

          {/* VS Circle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '999px',
              backgroundColor: '#f59e0b',
              color: '#000000',
              fontSize: '28px',
              fontWeight: 900,
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
            }}
          >
            VS
          </div>

          {/* Asset 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
              borderRadius: '24px',
              backgroundColor: '#0c1426',
              border: '2px solid #10b98140',
              width: '420px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '64px', fontWeight: 900, color: '#34d399', letterSpacing: '-2px' }}>
              {sym2}
            </div>
            <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '8px', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name2}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            color: '#64748b',
            letterSpacing: '1px',
          }}
        >
          Valuasi Fundamental · Konsensus Analis · Chart Real-Time · tradingsims.my.id
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
