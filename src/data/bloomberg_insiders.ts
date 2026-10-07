export interface InsiderTransaction {
  id: string;
  date: string;
  insiderName: string;
  position: string;
  transactionType: 'BUY' | 'SELL';
  shares: number;
  lot: number;
  pricePerShare: number;
  totalValueIdr: number; // in IDR
  sharesHeldAfter: number;
  ownershipPercentAfter: number;
  filingNotice: string;
}

export interface InstitutionalHolder {
  rank: number;
  institutionName: string;
  type: 'FOREIGN_FUND' | 'DOMESTIC_INSTITUTION' | 'SOVEREIGN_WEALTH' | 'FOUNDER';
  country: string;
  sharesHeld: number;
  ownershipPercent: number;
  changeQuarterShares: number; // positive = added, negative = sold
  valueIdr: number;
}

export interface StockOwnershipData {
  symbol: string;
  name: string;
  insiderSentiment: 'VERY_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  netInsiderFlow30D: number; // in IDR (positive = net buy)
  insiderBuyCount30D: number;
  insiderSellCount30D: number;
  shareholderDistribution: {
    controllingShareholders: number; // percentage
    domesticInstitutions: number;
    foreignInstitutions: number;
    domesticRetail: number;
  };
  insiderTransactions: InsiderTransaction[];
  topInstitutionalHolders: InstitutionalHolder[];
}

export const BLOOMBERG_OWNERSHIP_DATA: Record<string, StockOwnershipData> = {
  BBCA: {
    symbol: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    insiderSentiment: 'VERY_BULLISH',
    netInsiderFlow30D: 48250000000, // +48.25 Miliar
    insiderBuyCount30D: 5,
    insiderSellCount30D: 0,
    shareholderDistribution: {
      controllingShareholders: 54.94, // PT Dwimuria Investama Andalan (Djarum Group)
      foreignInstitutions: 29.85,
      domesticInstitutions: 9.65,
      domesticRetail: 5.56,
    },
    insiderTransactions: [
      {
        id: 'ins-bbca-1',
        date: '2026-09-26',
        insiderName: 'Jahja Setiaatmadja',
        position: 'Presiden Direktur',
        transactionType: 'BUY',
        shares: 1000000,
        lot: 10000,
        pricePerShare: 10175,
        totalValueIdr: 10175000000,
        sharesHeldAfter: 41811690,
        ownershipPercentAfter: 0.0339,
        filingNotice: 'Investasi Pribadi Jangka Panjang (Keterbukaan Informasi OJK)',
      },
      {
        id: 'ins-bbca-2',
        date: '2026-09-20',
        insiderName: 'Armand Wahyudi Hartono',
        position: 'Wakil Presiden Direktur',
        transactionType: 'BUY',
        shares: 1500000,
        lot: 15000,
        pricePerShare: 10150,
        totalValueIdr: 15225000000,
        sharesHeldAfter: 52400000,
        ownershipPercentAfter: 0.0425,
        filingNotice: 'Akumulasi Kepemilikan Saham Manajemen',
      },
      {
        id: 'ins-bbca-3',
        date: '2026-09-14',
        insiderName: 'Gregory Hendra Lembong',
        position: 'Wakil Presiden Direktur',
        transactionType: 'BUY',
        shares: 800000,
        lot: 8000,
        pricePerShare: 10200,
        totalValueIdr: 8160000000,
        sharesHeldAfter: 12500000,
        ownershipPercentAfter: 0.0101,
        filingNotice: 'Pembelian Terbuka Reguler',
      },
      {
        id: 'ins-bbca-4',
        date: '2026-09-08',
        insiderName: 'Subur Tan',
        position: 'Direktur',
        transactionType: 'BUY',
        shares: 750000,
        lot: 7500,
        pricePerShare: 10225,
        totalValueIdr: 7668750000,
        sharesHeldAfter: 17200000,
        ownershipPercentAfter: 0.0139,
        filingNotice: 'Investasi Pribadi Reguler',
      },
      {
        id: 'ins-bbca-5',
        date: '2026-09-02',
        insiderName: 'Santoso',
        position: 'Direktur',
        transactionType: 'BUY',
        shares: 700000,
        lot: 7000,
        pricePerShare: 10025,
        totalValueIdr: 7017500000,
        sharesHeldAfter: 15400000,
        ownershipPercentAfter: 0.0125,
        filingNotice: 'Akumulasi Rutin Kuartalan',
      },
    ],
    topInstitutionalHolders: [
      {
        rank: 1,
        institutionName: 'PT Dwimuria Investama Andalan (Djarum Group)',
        type: 'FOUNDER',
        country: 'Indonesia',
        sharesHeld: 67729700000,
        ownershipPercent: 54.94,
        changeQuarterShares: 0,
        valueIdr: 694229425000000,
      },
      {
        rank: 2,
        institutionName: 'The Vanguard Group, Inc.',
        type: 'FOREIGN_FUND',
        country: 'United States',
        sharesHeld: 3240000000,
        ownershipPercent: 2.63,
        changeQuarterShares: 125000000,
        valueIdr: 33210000000000,
      },
      {
        rank: 3,
        institutionName: 'BlackRock Fund Advisors',
        type: 'FOREIGN_FUND',
        country: 'United States',
        sharesHeld: 2890000000,
        ownershipPercent: 2.34,
        changeQuarterShares: 94000000,
        valueIdr: 29622500000000,
      },
      {
        rank: 4,
        institutionName: 'Capital Research and Management Co.',
        type: 'FOREIGN_FUND',
        country: 'United States',
        sharesHeld: 2450000000,
        ownershipPercent: 1.99,
        changeQuarterShares: 56000000,
        valueIdr: 25112500000000,
      },
      {
        rank: 5,
        institutionName: 'GIC Private Limited (Sovereign Wealth Fund Singapore)',
        type: 'SOVEREIGN_WEALTH',
        country: 'Singapore',
        sharesHeld: 1980000000,
        ownershipPercent: 1.61,
        changeQuarterShares: 32000000,
        valueIdr: 20295000000000,
      },
      {
        rank: 6,
        institutionName: 'Norges Bank Investment Management (NBIM)',
        type: 'SOVEREIGN_WEALTH',
        country: 'Norway',
        sharesHeld: 1720000000,
        ownershipPercent: 1.39,
        changeQuarterShares: 45000000,
        valueIdr: 17630000000000,
      },
      {
        rank: 7,
        institutionName: 'BPJS Ketenagakerjaan (JHT / JP)',
        type: 'DOMESTIC_INSTITUTION',
        country: 'Indonesia',
        sharesHeld: 1650000000,
        ownershipPercent: 1.34,
        changeQuarterShares: 78000000,
        valueIdr: 16912500000000,
      },
    ],
  },
  BMRI: {
    symbol: 'BMRI',
    name: 'PT Bank Mandiri (Persero) Tbk',
    insiderSentiment: 'BULLISH',
    netInsiderFlow30D: 24500000000,
    insiderBuyCount30D: 3,
    insiderSellCount30D: 0,
    shareholderDistribution: {
      controllingShareholders: 52.0, // Pemerintah RI
      foreignInstitutions: 31.2,
      domesticInstitutions: 12.4,
      domesticRetail: 4.4,
    },
    insiderTransactions: [
      {
        id: 'ins-bmri-1',
        date: '2026-09-24',
        insiderName: 'Darmawan Junaidi',
        position: 'Direktur Utama',
        transactionType: 'BUY',
        shares: 1200000,
        lot: 12000,
        pricePerShare: 7050,
        totalValueIdr: 8460000000,
        sharesHeldAfter: 18900000,
        ownershipPercentAfter: 0.0202,
        filingNotice: 'Pembelian Terbuka Pemenuhan Saham Manajemen',
      },
    ],
    topInstitutionalHolders: [
      {
        rank: 1,
        institutionName: 'Negara Republik Indonesia (Pemerintah RI)',
        type: 'FOUNDER',
        country: 'Indonesia',
        sharesHeld: 48533333333,
        ownershipPercent: 52.0,
        changeQuarterShares: 0,
        valueIdr: 344586666664300,
      },
      {
        rank: 2,
        institutionName: 'The Vanguard Group, Inc.',
        type: 'FOREIGN_FUND',
        country: 'United States',
        sharesHeld: 2450000000,
        ownershipPercent: 2.62,
        changeQuarterShares: 85000000,
        valueIdr: 17395000000000,
      },
    ],
  },
};

export function getOwnershipData(symbol: string): StockOwnershipData {
  const clean = symbol.toUpperCase().trim();
  if (BLOOMBERG_OWNERSHIP_DATA[clean]) {
    return BLOOMBERG_OWNERSHIP_DATA[clean];
  }
  // Generic fallback ownership structure
  return {
    symbol: clean,
    name: `${clean} Listed Entity`,
    insiderSentiment: 'BULLISH',
    netInsiderFlow30D: 15400000000,
    insiderBuyCount30D: 2,
    insiderSellCount30D: 0,
    shareholderDistribution: {
      controllingShareholders: 51.0,
      foreignInstitutions: 24.5,
      domesticInstitutions: 16.5,
      domesticRetail: 8.0,
    },
    insiderTransactions: [
      {
        id: `ins-${clean}-1`,
        date: '2026-09-22',
        insiderName: 'Dewan Direksi & Manajemen Kunci',
        position: 'Direksi Eksekutif',
        transactionType: 'BUY',
        shares: 850000,
        lot: 8500,
        pricePerShare: 1000,
        totalValueIdr: 850000000,
        sharesHeldAfter: 8500000,
        ownershipPercentAfter: 0.085,
        filingNotice: 'Investasi Pribadi Manajemen Kunci',
      },
    ],
    topInstitutionalHolders: [
      {
        rank: 1,
        institutionName: 'Pemegang Saham Pengendali (Holding / Sponsor)',
        type: 'FOUNDER',
        country: 'Indonesia',
        sharesHeld: 5100000000,
        ownershipPercent: 51.0,
        changeQuarterShares: 0,
        valueIdr: 5100000000000,
      },
      {
        rank: 2,
        institutionName: 'Vanguard Emerging Markets Stock Index',
        type: 'FOREIGN_FUND',
        country: 'United States',
        sharesHeld: 240000000,
        ownershipPercent: 2.4,
        changeQuarterShares: 12000000,
        valueIdr: 240000000000,
      },
      {
        rank: 3,
        institutionName: 'BPJS Ketenagakerjaan',
        type: 'DOMESTIC_INSTITUTION',
        country: 'Indonesia',
        sharesHeld: 180000000,
        ownershipPercent: 1.8,
        changeQuarterShares: 8000000,
        valueIdr: 180000000000,
      },
    ],
  };
}
