import type { Metadata } from 'next';
import React from 'react';
import { KAMUS_TERMS } from '@/data/kamus_finansial_data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tradingsims.my.id';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'price-to-earnings-ratio-per';
  const item = KAMUS_TERMS.find((t) => t.slug === slug);

  const termName = item?.term || slug.replace(/-/g, ' ').toUpperCase();
  const title = `Apa Itu ${termName}? Pengertian, Rumus & Contoh Lengkap | TradeSim Pro`;
  const description = item?.shortDefinition || `Penjelasan lengkap istilah ${termName} dalam pasar modal saham Indonesia dan cara penggunaannya di TradeSim Pro.`;
  const pageUrl = `${SITE_URL}/kamus/${slug}`;

  return {
    title,
    description,
    keywords: [
      `apa itu ${termName.toLowerCase()}`,
      `pengertian ${termName.toLowerCase()}`,
      `rumus ${termName.toLowerCase()}`,
      `contoh ${termName.toLowerCase()}`,
      'istilah saham bei',
      'kamus pasar modal indonesia',
      'belajar saham pemula',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url: pageUrl,
      title,
      description,
      images: [`${SITE_URL}/og-preview.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og-preview.png`],
    },
  };
}

export default async function KamusDetailLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'price-to-earnings-ratio-per';
  const item = KAMUS_TERMS.find((t) => t.slug === slug);
  const pageUrl = `${SITE_URL}/kamus/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
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
            name: 'Kamus Saham',
            item: `${SITE_URL}/kamus`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: item?.term || slug,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'DefinedTerm',
        name: item?.term || slug,
        description: item?.shortDefinition || '',
        inDefinedTermSet: `${SITE_URL}/kamus`,
        url: pageUrl,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Apa itu ${item?.term}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item?.shortDefinition || '',
            },
          },
          {
            '@type': 'Question',
            name: `Bagaimana contoh penerapan ${item?.term} pada saham nyata?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item?.example || '',
            },
          },
        ],
      },
    ],
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
