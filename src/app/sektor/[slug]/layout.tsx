import type { Metadata } from 'next';
import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

const SECTOR_TITLES: Record<string, { title: string; desc: string; keywords: string[] }> = {
  perbankan: {
    title: 'Daftar Saham Sektor Perbankan BEI Terbaik & Terbesar: BBCA, BBRI, BMRI, BBNI',
    desc: 'Daftar lengkap saham sektor perbankan dan finansial di Bursa Efek Indonesia (BEI). Analisis fundamental rasio kredit, dividen jumbo, dan simulasi paper trading gratis di TradeSim Pro.',
    keywords: ['saham perbankan', 'saham bank terbaik', 'bbca bbri bmri bbni', 'saham finansial bei', 'dividen bank'],
  },
  'energi-dan-batubara': {
    title: 'Daftar Saham Sektor Energi & Batubara BEI: ADRO, PTBA, ITMG, MEDC, PGAS',
    desc: 'Daftar saham sektor energi, minyak bumi, gas, dan pertambangan batubara dengan dividen yield tertinggi di BEI. Pantau harga komoditas dan rasio valuasi di TradeSim Pro.',
    keywords: ['saham batubara', 'saham energi bei', 'adro ptba itmg', 'saham dividen batubara', 'saham minyak gas'],
  },
  'teknologi-dan-digital': {
    title: 'Daftar Saham Sektor Teknologi & Digital Indonesia: GOTO, BUKA, EMTK, DCII',
    desc: 'Pantau pergerakan saham sektor teknologi, e-commerce, media digital, dan data center Indonesia. Analisis volume transaksi dan grafik candlestick di TradeSim Pro.',
    keywords: ['saham teknologi', 'saham goto buka', 'saham digital bei', 'saham data center dcii', 'tech stocks indonesia'],
  },
  'konsumer-dan-ritel': {
    title: 'Daftar Saham Sektor Konsumer & Barang Konsumsi BEI: ICBP, INDF, UNVR, MYOR',
    desc: 'Daftar emiten sektor consumer goods defensif dan ritel modern terbesar di Indonesia. Analisis pertumbuhan penjualan, margin laba, dan kestabilan portofolio di TradeSim Pro.',
    keywords: ['saham konsumer', 'saham consumer goods', 'icbp indf unvr myor', 'saham alfamart amrt', 'saham defensif bei'],
  },
  'infrastruktur-dan-telekomunikasi': {
    title: 'Daftar Saham Sektor Telekomunikasi & Menara: TLKM, ISAT, EXCL, TOWR, TBIG',
    desc: 'Daftar emiten operator seluler dan penyedia menara telekomunikasi Indonesia. Evaluasi rasio EV/EBITDA, dividen, dan penetrasi 5G di TradeSim Pro.',
    keywords: ['saham telekomunikasi', 'saham telkom tlkm', 'saham menara towr tbig', 'isat excl', 'saham infrastruktur'],
  },
  'kripto-layer-1': {
    title: 'Daftar Cryptocurrency Layer 1 Terbesar: Bitcoin, Ethereum, Solana, BNB',
    desc: 'Pantau daftar koin kripto blockchain Layer 1 teratas dengan kapitalisasi pasar terbesar. Analisis harga Binance live 24/7 dan simulasi quant AI di TradeSim Pro.',
    keywords: ['kripto layer 1', 'bitcoin ethereum solana', 'crypto spot trading', 'koin crypto terbaik', 'jesse ai quant'],
  },
};

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'perbankan';
  const meta = SECTOR_TITLES[slug] || {
    title: `Daftar Saham Sektor ${slug.toUpperCase()} Bursa Efek Indonesia | TradeSim Pro`,
    desc: `Pantau daftar emiten saham sektor ${slug} di BEI / IDX lengkap dengan harga real-time, valuasi P/E, dan simulasi trading gratis di TradeSim Pro.`,
    keywords: [`saham sektor ${slug}`, 'saham bei', 'trading simulator indonesia'],
  };

  const pageUrl = `${SITE_URL}/sektor/${slug}`;

  return {
    title: `${meta.title} | TradeSim Pro`,
    description: meta.desc,
    keywords: meta.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url: pageUrl,
      title: `${meta.title} - TradeSim Pro`,
      description: meta.desc,
      images: [`${SITE_URL}/og-preview.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} - TradeSim Pro`,
      description: meta.desc,
      images: [`${SITE_URL}/og-preview.png`],
    },
  };
}

export default async function SectorLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'perbankan';
  const meta = SECTOR_TITLES[slug] || {
    title: `Daftar Saham Sektor ${slug.toUpperCase()}`,
    desc: `Daftar saham sektor ${slug} di Bursa Efek Indonesia.`,
  };
  const pageUrl = `${SITE_URL}/sektor/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.title,
    description: meta.desc,
    url: pageUrl,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Beranda',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Pasar & Saham',
          item: `${SITE_URL}/markets`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `Sektor ${slug}`,
          item: pageUrl,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
