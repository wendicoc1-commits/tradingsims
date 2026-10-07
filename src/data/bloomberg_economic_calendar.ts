export interface EconomicEvent {
  id: string;
  time: string; // e.g. "14:30 WIB"
  date: string; // e.g. "2026-10-15"
  country: 'ID' | 'US' | 'EU' | 'CN' | 'JP' | 'GB';
  flag: string;
  eventName: string;
  period: string; // e.g. "Sep 2026", "Q3 2026"
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual: string | null;
  consensus: string;
  previous: string;
  revisedFrom?: string;
  unit: '%' | 'B USD' | 'K Jobs' | 'Index Points' | 'T IDR';
  category: 'Suku Bunga & Moneter' | 'Inflasi (CPI/PPI)' | 'Ketenagakerjaan (NFP)' | 'Perdagangan & Devisa' | 'Pertumbuhan PDB (GDP)' | 'Aktivitas Manufaktur (PMI)';
  summary: string;
  marketImplication: string;
}

export const BLOOMBERG_ECONOMIC_EVENTS: EconomicEvent[] = [
  // ── 1. BANK INDONESIA RATE DECISION (RDG) ──
  {
    id: 'eco-id-birate-01',
    time: '14:30 WIB',
    date: '2026-10-22',
    country: 'ID',
    flag: '🇮🇩',
    eventName: 'Keputusan Suku Bunga Acuan Bank Indonesia (BI-Rate 7D RR)',
    period: 'Okt 2026',
    impact: 'HIGH',
    actual: '6.00%',
    consensus: '6.00%',
    previous: '6.00%',
    unit: '%',
    category: 'Suku Bunga & Moneter',
    summary: 'Rapat Dewan Gubernur (RDG) Bank Indonesia mempertahankan BI-Rate pada level 6,00% untuk menjaga stabilitas nilai tukar Rupiah dan memperkuat transmisi pelonggaran likuiditas perbankan.',
    marketImplication: 'Netral-positif untuk sektor perbankan (BBCA, BBRI, BMRI) dengan Net Interest Margin (NIM) yang terjaga stabil di kisaran 5,1% - 5,4%.'
  },
  // ── 2. US FED FOMC INTEREST RATE DECISION ──
  {
    id: 'eco-us-fomc-01',
    time: '01:00 WIB',
    date: '2026-11-06',
    country: 'US',
    flag: '🇺🇸',
    eventName: 'US Federal Reserve FOMC Interest Rate Decision (Upper Bound)',
    period: 'Nov 2026',
    impact: 'HIGH',
    actual: null,
    consensus: '4.75%',
    previous: '5.00%',
    unit: '%',
    category: 'Suku Bunga & Moneter',
    summary: 'The Fed diperkirakan melanjutkan siklus pemangkasan suku bunga acuan sebesar 25 bps ke rentang 4,50% - 4,75% menyusul pendinginan pasar tenaga kerja Amerika Serikat.',
    marketImplication: 'Sangat bullish bagi pasar saham berkembang (Emerging Markets) dan IHSG; memicu aliran dana asing (foreign inflow) masuk kembali ke instrumen SBN dan big-caps.'
  },
  // ── 3. INDONESIA CPI INFLATION YOY ──
  {
    id: 'eco-id-cpi-01',
    time: '11:00 WIB',
    date: '2026-10-01',
    country: 'ID',
    flag: '🇮🇩',
    eventName: 'Inflasi Indeks Harga Konsumen (CPI) Indonesia YoY',
    period: 'Sep 2026',
    impact: 'HIGH',
    actual: '1.84%',
    consensus: '1.92%',
    previous: '2.12%',
    unit: '%',
    category: 'Inflasi (CPI/PPI)',
    summary: 'Badan Pusat Statistik (BPS) melaporkan inflasi tahunan berada di dalam sasaran target 2,5±1% Bank Indonesia didorong penurunan harga komoditas pangan bergejolak (volatile food).',
    marketImplication: 'Memberikan ruang pelonggaran moneter lanjutan bagi Bank Indonesia dan menopang daya beli konsumen ritel (ICBP, INDF, AMRT).'
  },
  // ── 4. US CPI INFLATION YOY ──
  {
    id: 'eco-us-cpi-01',
    time: '19:30 WIB',
    date: '2026-10-10',
    country: 'US',
    flag: '🇺🇸',
    eventName: 'US Consumer Price Index (CPI) Headline YoY',
    period: 'Sep 2026',
    impact: 'HIGH',
    actual: '2.40%',
    consensus: '2.30%',
    previous: '2.50%',
    unit: '%',
    category: 'Inflasi (CPI/PPI)',
    summary: 'Tingkat inflasi tahunan AS melambat ke 2,4%, mendekati target jangka panjang 2,0% yang ditetapkan Federal Reserve.',
    marketImplication: 'Meredakan ekspektasi lonjakan imbal hasil US Treasury 10-tahun dan memperkuat sentimen risk-on saham teknologi global.'
  },
  // ── 5. US NON-FARM PAYROLLS (NFP) ──
  {
    id: 'eco-us-nfp-01',
    time: '19:30 WIB',
    date: '2026-10-02',
    country: 'US',
    flag: '🇺🇸',
    eventName: 'US Non-Farm Payrolls (NFP Employment Change)',
    period: 'Sep 2026',
    impact: 'HIGH',
    actual: '254K',
    consensus: '150K',
    previous: '159K',
    unit: 'K Jobs',
    category: 'Ketenagakerjaan (NFP)',
    summary: 'Penambahan lapangan kerja sektor non-pertanian AS melonjak tak terduga menjadi 254.000 pekerjaan dengan tingkat pengangguran turun ke 4,1%.',
    marketImplication: 'Menepis kekhawatiran resesi ekonomi AS (Soft Landing scenario terkonfirmasi); Dolar AS menguat terhadap valuta utama dunia.'
  },
  // ── 6. CADANGAN DEVISA INDONESIA ──
  {
    id: 'eco-id-reserves-01',
    time: '10:00 WIB',
    date: '2026-10-07',
    country: 'ID',
    flag: '🇮🇩',
    eventName: 'Posisi Cadangan Devisa Bank Indonesia',
    period: 'Sep 2026',
    impact: 'MEDIUM',
    actual: '$149.9 B',
    consensus: '$150.2 B',
    previous: '$150.2 B',
    unit: 'B USD',
    category: 'Perdagangan & Devisa',
    summary: 'Cadangan devisa Indonesia setara dengan pembiayaan 6,5 bulan impor atau 6,3 bulan impor dan pembayaran utang luar negeri pemerintah, jauh di atas standar kecukupan internasional 3 bulan.',
    marketImplication: 'Ketahanan eksternal yang sangat memadai untuk melakukan intervensi stabilitas Rupiah di pasar spot dan DNDF.'
  },
  // ── 7. NERACA PERDAGANGAN INDONESIA (TRADE BALANCE) ──
  {
    id: 'eco-id-trade-01',
    time: '11:00 WIB',
    date: '2026-10-15',
    country: 'ID',
    flag: '🇮🇩',
    eventName: 'Neraca Perdagangan Indonesia (Trade Balance Surplus)',
    period: 'Sep 2026',
    impact: 'MEDIUM',
    actual: '+$2.78 B',
    consensus: '+$2.50 B',
    previous: '+$2.89 B',
    unit: 'B USD',
    category: 'Perdagangan & Devisa',
    summary: 'Surplus neraca perdagangan Indonesia berlanjut selama 53 bulan berturut-turut ditopang ekspor nikel, tembaga, batubara, dan CPO ke pasar mitra dagang Asia.',
    marketImplication: 'Pasokan likuiditas valas domestik terjaga positif; katalis pendukung bagi saham eksportir komoditas (ADRO, PTBA, MEDC, AMMN).'
  },
  // ── 8. PERTUMBUHAN PDB INDONESIA (GDP GROWTH YOY) ──
  {
    id: 'eco-id-gdp-01',
    time: '11:00 WIB',
    date: '2026-11-05',
    country: 'ID',
    flag: '🇮🇩',
    eventName: 'Pertumbuhan Produk Domestik Bruto (GDP) Indonesia YoY',
    period: 'Q3 2026',
    impact: 'HIGH',
    actual: null,
    consensus: '5.08%',
    previous: '5.05%',
    unit: '%',
    category: 'Pertumbuhan PDB (GDP)',
    summary: 'Konsensus ekonom memproyeksikan ekonomi Indonesia tumbuh 5,08% YoY pada kuartal III ditopang konsumsi rumah tangga dan realisasi investasi hilirisasi.',
    marketImplication: 'Fondasi fundamental makro yang kokoh menjaga rating kredit Sovereign Indonesia pada level Investment Grade (Baa2 Moody\'s / BBB Fitch).'
  },
  // ── 9. CHINA MANUFACTURING PMI (CAIXIN) ──
  {
    id: 'eco-cn-pmi-01',
    time: '08:45 WIB',
    date: '2026-10-01',
    country: 'CN',
    flag: '🇨🇳',
    eventName: 'China Caixin Manufacturing PMI',
    period: 'Sep 2026',
    impact: 'HIGH',
    actual: '50.3',
    consensus: '50.5',
    previous: '50.4',
    unit: 'Index Points',
    category: 'Aktivitas Manufaktur (PMI)',
    summary: 'Sektor manufaktur swasta Tiongkok bertahan di zona ekspansi (>50,0) merespons peluncuran paket stimulus moneter dan pemangkasan RRR oleh People\'s Bank of China (PBOC).',
    marketImplication: 'Katalis langsung bagi permintaan komoditas tambang dan energi Indonesia yang diekspor ke Tiongkok.'
  },
  // ── 10. BANK OF JAPAN (BOJ) RATE DECISION ──
  {
    id: 'eco-jp-rate-01',
    time: '10:30 WIB',
    date: '2026-10-31',
    country: 'JP',
    flag: '🇯🇵',
    eventName: 'Bank of Japan (BOJ) Policy Rate Decision',
    period: 'Okt 2026',
    impact: 'MEDIUM',
    actual: null,
    consensus: '0.25%',
    previous: '0.25%',
    unit: '%',
    category: 'Suku Bunga & Moneter',
    summary: 'Gubernur Kazuo Ueda diproyeksikan mempertahankan suku bunga pada 0,25% sembari memantau volatilitas pasar valuta asing dan dinamika Yen Carry Trade.',
    marketImplication: 'Menghindari gejolak unwinding Yen Carry Trade global yang sempat menekan bursa saham pada Agustus lalu.'
  }
];
