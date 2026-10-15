import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TradeSim Pro - Trading Simulator Indonesia',
    short_name: 'TradeSim Pro',
    description: 'Platform trading simulator saham Indonesia (BEI) dan crypto spot 24/7 dengan data pasar real-time & orderbook level 2.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090a0f',
    theme_color: '#10b981',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
