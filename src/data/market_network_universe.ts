export interface NetworkCluster {
  id: string;
  name: string;
  description: string;
  color: string;
  glow: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  name: string;
  cluster: string;
  basePrice: number;
  marketCap: number; // in IDR (or USD for crypto)
  volume24h: number; // in IDR
  degree: number;
  isCrypto?: boolean;
  sector: string;
  notes?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  label: string;
  weight?: number; // 1 to 5
  type?: 'subsidiary' | 'sister' | 'jv' | 'flow' | 'synergy' | 'layer' | 'oracle';
}

export interface NetworkPresetData {
  title: string;
  subtitle: string;
  clusters: NetworkCluster[];
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export const MARKET_NETWORK_DATASETS: Record<'conglomerates' | 'smartMoney' | 'crypto', NetworkPresetData> = {
  conglomerates: {
    title: 'Peta Konglomerasi & Holding Group Indonesia',
    subtitle: 'Visualisasi kepemilikan saham lintas grup, relasi anak usaha, dan sinergi korporasi emiten BEI',
    clusters: [
      {
        id: 'barito',
        name: 'Barito Group (Prajogo Pangestu)',
        description: 'Konglomerat energi terbarukan, petrokimia, dan kontraktor tambang terbesar BEI',
        color: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.45)',
      },
      {
        id: 'djarum',
        name: 'Djarum Group (Keluarga Hartono)',
        description: 'Konglomerasi perbankan swasta terbesar, infrastruktur telekomunikasi, dan ekosistem digital',
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.45)',
      },
      {
        id: 'astra',
        name: 'Astra Group (Jardine Matheson)',
        description: 'Raksasa otomotif, alat berat, pembiayaan, agribisnis, dan infrastruktur Indonesia',
        color: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.45)',
      },
      {
        id: 'salim',
        name: 'Salim Group (First Pacific)',
        description: 'Pemimpin industri pangan olahan, perkebunan, ritel minimarket, dan infrastruktur data',
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.45)',
      },
      {
        id: 'bumn',
        name: 'BUMN / Himbara Core',
        description: 'Pilar perbankan negara, energi nasional, telekomunikasi, dan hilirisasi tambang',
        color: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.45)',
      },
      {
        id: 'sinarmas',
        name: 'Sinarmas Group (Keluarga Widjaja)',
        description: 'Pulp & paper dunia, properti terintegrasi, jasa keuangan, dan energi batu bara',
        color: '#ec4899',
        glow: 'rgba(236, 72, 153, 0.45)',
      },
    ],
    nodes: [
      // Barito Group
      { id: 'BRPT', label: 'BRPT', name: 'Barito Pacific Tbk.', cluster: 'barito', basePrice: 1120, marketCap: 105_000_000_000_000, volume24h: 320_000_000_000, degree: 5, sector: 'Basic Materials', notes: 'Holding induk utama Prajogo Pangestu' },
      { id: 'BREN', label: 'BREN', name: 'Barito Renewables Energy Tbk.', cluster: 'barito', basePrice: 7800, marketCap: 1_043_000_000_000_000, volume24h: 890_000_000_000, degree: 4, sector: 'Energy & Geothermal', notes: 'Anak usaha energi panas bumi raksasa' },
      { id: 'TPIA', label: 'TPIA', name: 'Chandra Asri Pacific Tbk.', cluster: 'barito', basePrice: 8950, marketCap: 774_000_000_000_000, volume24h: 210_000_000_000, degree: 3, sector: 'Chemicals & Petrochemicals', notes: 'Pabrik petrokimia terintegrasi terbesar RI' },
      { id: 'CUAN', label: 'CUAN', name: 'Petrindo Jaya Kreasi Tbk.', cluster: 'barito', basePrice: 6625, marketCap: 74_000_000_000_000, volume24h: 180_000_000_000, degree: 4, sector: 'Energy & Mining', notes: 'Holding batu bara dan tambang terdiversifikasi' },
      { id: 'PTRO', label: 'PTRO', name: 'Petrosea Tbk.', cluster: 'barito', basePrice: 17500, marketCap: 18_000_000_000_000, volume24h: 145_000_000_000, degree: 3, sector: 'Mining & EPC Contractor', notes: 'Kontraktor tambang & infrastruktur EPC' },

      // Djarum Group
      { id: 'BBCA', label: 'BBCA', name: 'Bank Central Asia Tbk.', cluster: 'djarum', basePrice: 10250, marketCap: 1_263_000_000_000_000, volume24h: 1_450_000_000_000, degree: 5, sector: 'Banking & Financials', notes: 'Bank swasta terbesar di Asia Tenggara' },
      { id: 'TOWR', label: 'TOWR', name: 'Sarana Menara Nusantara Tbk.', cluster: 'djarum', basePrice: 810, marketCap: 41_000_000_000_000, volume24h: 95_000_000_000, degree: 3, sector: 'Telecommunication Infrastructure', notes: 'Pemilik puluhan ribu menara telekomunikasi & fiber optik' },
      { id: 'BELI', label: 'BELI', name: 'Global Digital Niaga (Blibli)', cluster: 'djarum', basePrice: 470, marketCap: 55_000_000_000_000, volume24h: 40_000_000_000, degree: 3, sector: 'Consumer Tech & Ecommerce', notes: 'Ekosistem e-commerce Blibli, Tiket.com, & Ranch Market' },
      { id: 'RANC', label: 'RANC', name: 'Supra Boga Lestari Tbk.', cluster: 'djarum', basePrice: 420, marketCap: 1_200_000_000_000, volume24h: 12_000_000_000, degree: 2, sector: 'Retail Supermarket', notes: 'Jaringan supermarket premium 99 Ranch Market' },

      // Astra Group
      { id: 'ASII', label: 'ASII', name: 'Astra International Tbk.', cluster: 'astra', basePrice: 5250, marketCap: 212_000_000_000_000, volume24h: 480_000_000_000, degree: 5, sector: 'Automotive & Conglomerate', notes: 'Raja otomotif & konglomerat terdiversifikasi' },
      { id: 'UNTR', label: 'UNTR', name: 'United Tractors Tbk.', cluster: 'astra', basePrice: 27200, marketCap: 101_000_000_000_000, volume24h: 210_000_000_000, degree: 4, sector: 'Heavy Machinery & Mining', notes: 'Distributor Komatsu & kontraktor tambang Pama' },
      { id: 'AUTO', label: 'AUTO', name: 'Astra Otoparts Tbk.', cluster: 'astra', basePrice: 2180, marketCap: 10_500_000_000_000, volume24h: 65_000_000_000, degree: 2, sector: 'Automotive Components', notes: 'Komponen suku cadang mobil & motor Astra' },
      { id: 'AALI', label: 'AALI', name: 'Astra Agro Lestari Tbk.', cluster: 'astra', basePrice: 6675, marketCap: 12_800_000_000_000, volume24h: 42_000_000_000, degree: 2, sector: 'Agribusiness Palm Oil', notes: 'Produsen kelapa sawit & CPO grup Astra' },

      // Salim Group
      { id: 'INDF', label: 'INDF', name: 'Indofood Sukses Makmur Tbk.', cluster: 'salim', basePrice: 7050, marketCap: 61_000_000_000_000, volume24h: 140_000_000_000, degree: 4, sector: 'Consumer Staples & Food', notes: 'Induk makanan instan Indomie & agribisnis Bogasari' },
      { id: 'ICBP', label: 'ICBP', name: 'Indofood CBP Sukses Makmur Tbk.', cluster: 'salim', basePrice: 11850, marketCap: 138_000_000_000_000, volume24h: 190_000_000_000, degree: 3, sector: 'Packaged Food & Pinehill', notes: 'Produsen mi instan global terkemuka' },
      { id: 'AMRT', label: 'AMRT', name: 'Sumber Alfaria Trijaya Tbk.', cluster: 'salim', basePrice: 3140, marketCap: 130_000_000_000_000, volume24h: 230_000_000_000, degree: 3, sector: 'Retail & Convenience Stores', notes: 'Jaringan minimarket Alfamart di seluruh Indonesia' },
      { id: 'DNET', label: 'DNET', name: 'Indoritel Makmur Internasional Tbk.', cluster: 'salim', basePrice: 9900, marketCap: 140_000_000_000_000, volume24h: 85_000_000_000, degree: 3, sector: 'Investment & Retail Holding', notes: 'Pemilik saham strategis Indomaret & Sari Roti' },

      // BUMN Himbara & Energy
      { id: 'BBRI', label: 'BBRI', name: 'Bank Rakyat Indonesia Tbk.', cluster: 'bumn', basePrice: 4980, marketCap: 754_000_000_000_000, volume24h: 1_250_000_000_000, degree: 5, sector: 'Banking & Financials', notes: 'Penyalur kredit mikro dan UMKM terbesar nasional' },
      { id: 'BMRI', label: 'BMRI', name: 'Bank Mandiri (Persero) Tbk.', cluster: 'bumn', basePrice: 7100, marketCap: 662_000_000_000_000, volume24h: 980_000_000_000, degree: 4, sector: 'Banking & Corporate Finance', notes: 'Bank korporasi dan transaksi digital Livin terbesar' },
      { id: 'BBNI', label: 'BBNI', name: 'Bank Negara Indonesia Tbk.', cluster: 'bumn', basePrice: 5350, marketCap: 199_000_000_000_000, volume24h: 310_000_000_000, degree: 3, sector: 'Banking & International Desk', notes: 'Fokus pada bisnis global dan korporasi' },
      { id: 'TLKM', label: 'TLKM', name: 'Telkom Indonesia Tbk.', cluster: 'bumn', basePrice: 3020, marketCap: 299_000_000_000_000, volume24h: 420_000_000_000, degree: 3, sector: 'Telecommunication & Data Center', notes: 'Telkomsel, IndiHome, dan infrastruktur data center' },
      { id: 'PGAS', label: 'PGAS', name: 'Perusahaan Gas Negara Tbk.', cluster: 'bumn', basePrice: 1540, marketCap: 37_000_000_000_000, volume24h: 110_000_000_000, degree: 3, sector: 'Natural Gas Distribution', notes: 'Distribusi dan transmisi gas bumi nasional' },

      // Sinarmas Group
      { id: 'INKP', label: 'INKP', name: 'Indah Kiat Pulp & Paper Tbk.', cluster: 'sinarmas', basePrice: 8350, marketCap: 45_600_000_000_000, volume24h: 140_000_000_000, degree: 3, sector: 'Pulp & Paper Export', notes: 'Produsen kertas & pulp ekspor global' },
      { id: 'TKIM', label: 'TKIM', name: 'Pabrik Kertas Tjiwi Kimia Tbk.', cluster: 'sinarmas', basePrice: 7125, marketCap: 22_100_000_000_000, volume24h: 70_000_000_000, degree: 2, sector: 'Paper & Stationery', notes: 'Pabrik kertas tulis cetak berkualitas ekspor' },
      { id: 'BSDE', label: 'BSDE', name: 'Bumi Serpong Damai Tbk.', cluster: 'sinarmas', basePrice: 1195, marketCap: 25_300_000_000_000, volume24h: 95_000_000_000, degree: 2, sector: 'Township & Property', notes: 'Pengembang kota mandiri BSD City' },
    ],
    edges: [
      // Barito Group Edges
      { source: 'BRPT', target: 'BREN', label: 'Subsidiary (Panas Bumi)', weight: 5, type: 'subsidiary' },
      { source: 'BRPT', target: 'TPIA', label: 'Petrokimia Terpadu', weight: 4, type: 'subsidiary' },
      { source: 'BRPT', target: 'CUAN', label: 'Afiliasi Prajogo Pangestu', weight: 4, type: 'sister' },
      { source: 'CUAN', target: 'PTRO', label: 'Akuisisi EPC & Tambang', weight: 5, type: 'subsidiary' },
      { source: 'BREN', target: 'PTRO', label: 'Kontraktor EBT', weight: 3, type: 'synergy' },

      // Djarum Group Edges
      { source: 'BBCA', target: 'TOWR', label: 'Sister Holding (Hartono)', weight: 4, type: 'sister' },
      { source: 'BBCA', target: 'BELI', label: 'Fintech & Payment Gateway', weight: 4, type: 'synergy' },
      { source: 'BELI', target: 'RANC', label: 'Supermarket Ranch Market', weight: 5, type: 'subsidiary' },
      { source: 'BBCA', target: 'ASII', label: 'Sindikasi Pembiayaan Otomotif', weight: 3, type: 'flow' },

      // Astra Group Edges
      { source: 'ASII', target: 'UNTR', label: 'Alat Berat & Kontraktor Pama', weight: 5, type: 'subsidiary' },
      { source: 'ASII', target: 'AUTO', label: 'Suku Cadang & Komponen', weight: 4, type: 'subsidiary' },
      { source: 'ASII', target: 'AALI', label: 'Perkebunan Kelapa Sawit', weight: 4, type: 'subsidiary' },
      { source: 'UNTR', target: 'PTRO', label: 'Peer Kontraktor Tambang', weight: 2, type: 'synergy' },

      // Salim Group Edges
      { source: 'INDF', target: 'ICBP', label: 'Holding Konsumer Makanan', weight: 5, type: 'subsidiary' },
      { source: 'INDF', target: 'DNET', label: 'Jaringan Distribusi', weight: 4, type: 'synergy' },
      { source: 'DNET', target: 'AMRT', label: 'Aliansi Ritel Minimarket', weight: 3, type: 'synergy' },

      // BUMN Edges
      { source: 'BBRI', target: 'BMRI', label: 'Koridor Likuiditas Himbara', weight: 4, type: 'synergy' },
      { source: 'BBRI', target: 'BBNI', label: 'Sindikasi BUMN', weight: 3, type: 'synergy' },
      { source: 'BBRI', target: 'TLKM', label: 'Ekosistem Digital Desa', weight: 3, type: 'synergy' },
      { source: 'BMRI', target: 'PGAS', label: 'Pembiayaan Infrastruktur Gas', weight: 3, type: 'flow' },
      { source: 'BMRI', target: 'ASII', label: 'Mitra Korporasi Pembiayaan', weight: 2, type: 'flow' },

      // Sinarmas Edges
      { source: 'INKP', target: 'TKIM', label: 'Sinergi Industri Pulp & Paper', weight: 5, type: 'sister' },
      { source: 'INKP', target: 'BSDE', label: 'Sister Sinar Mas Land', weight: 3, type: 'sister' },
    ],
  },

  smartMoney: {
    title: 'Radar Bandarmologi & Aliran Broker Institusi (Foreign vs Retail)',
    subtitle: 'Pemetaan aliran modal broker institusi tier-1 asing dan akumulasi saham berkapitalisasi besar',
    clusters: [
      {
        id: 'foreign_insti',
        name: 'Institusi Asing Tier-1 (AK, BK, RX, ZP)',
        description: 'Broker investasi global dengan volume transaksi institusional masif',
        color: '#ec4899',
        glow: 'rgba(236, 72, 153, 0.45)',
      },
      {
        id: 'domestic_insti',
        name: 'Institusi Domestik (CC, KZ, LG)',
        description: 'Sekuritas BUMN dan manajer investasi dana pensiun dalam negeri',
        color: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.45)',
      },
      {
        id: 'retail_hub',
        name: 'Retail Aggregators (YP, PD, XC, NI)',
        description: 'Pusat transaksi trader retail harian dan komunitas pasar modal',
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.45)',
      },
      {
        id: 'accumulated_stocks',
        name: 'Saham Target Akumulasi (Large-Caps)',
        description: 'Emiten yang sedang menjadi fokus arus kas masuk institusional',
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.45)',
      },
    ],
    nodes: [
      // Foreign Brokers
      { id: 'BK', label: 'BK', name: 'J.P. Morgan Sekuritas Indonesia', cluster: 'foreign_insti', basePrice: 0, marketCap: 0, volume24h: 380_000_000_000, degree: 4, sector: 'Foreign Broker', notes: 'Net Buy Asing +Rp 142M hari ini' },
      { id: 'AK', label: 'AK', name: 'UBS Sekuritas Indonesia', cluster: 'foreign_insti', basePrice: 0, marketCap: 0, volume24h: 310_000_000_000, degree: 4, sector: 'Foreign Broker', notes: 'Net Buy Asing +Rp 98M hari ini' },
      { id: 'RX', label: 'RX', name: 'Macquarie Sekuritas Indonesia', cluster: 'foreign_insti', basePrice: 0, marketCap: 0, volume24h: 215_000_000_000, degree: 3, sector: 'Foreign Broker', notes: 'Net Buy Asing +Rp 64M hari ini' },
      { id: 'ZP', label: 'ZP', name: 'Maybank Sekuritas Indonesia', cluster: 'foreign_insti', basePrice: 0, marketCap: 0, volume24h: 180_000_000_000, degree: 3, sector: 'Foreign Broker', notes: 'Akumulasi selective perbankan' },

      // Domestic Brokers
      { id: 'CC', label: 'CC', name: 'Mandiri Sekuritas', cluster: 'domestic_insti', basePrice: 0, marketCap: 0, volume24h: 420_000_000_000, degree: 5, sector: 'Domestic Broker', notes: 'Underwriting dan transaksi korporasi BUMN' },
      { id: 'KZ', label: 'KZ', name: 'CLSA Sekuritas Indonesia', cluster: 'domestic_insti', basePrice: 0, marketCap: 0, volume24h: 160_000_000_000, degree: 3, sector: 'Domestic Broker', notes: 'Blok trade & crossing saham konglomerat' },

      // Retail Brokers
      { id: 'YP', label: 'YP', name: 'Mirae Asset Sekuritas Indonesia', cluster: 'retail_hub', basePrice: 0, marketCap: 0, volume24h: 490_000_000_000, degree: 4, sector: 'Retail Broker', notes: 'Net Sell Retail -Rp 88M (Profit taking)' },
      { id: 'PD', label: 'PD', name: 'Indo Premier Sekuritas', cluster: 'retail_hub', basePrice: 0, marketCap: 0, volume24h: 290_000_000_000, degree: 3, sector: 'Retail Broker', notes: 'Aktivitas retail reksadana & scalping' },
      { id: 'XC', label: 'XC', name: 'Ajaib Sekuritas Asia', cluster: 'retail_hub', basePrice: 0, marketCap: 0, volume24h: 210_000_000_000, degree: 3, sector: 'Retail Broker', notes: 'Gen-Z retail trading orderflow' },

      // Target Stocks
      { id: 'BBCA', label: 'BBCA', name: 'Bank Central Asia Tbk.', cluster: 'accumulated_stocks', basePrice: 10250, marketCap: 1_263_000_000_000_000, volume24h: 1_450_000_000_000, degree: 5, sector: 'Banking & Financials', notes: 'Top Foreign Accumulation Target' },
      { id: 'BBRI', label: 'BBRI', name: 'Bank Rakyat Indonesia Tbk.', cluster: 'accumulated_stocks', basePrice: 4980, marketCap: 754_000_000_000_000, volume24h: 1_250_000_000_000, degree: 5, sector: 'Banking & Financials', notes: 'Rebound Accumulation Inflow' },
      { id: 'BMRI', label: 'BMRI', name: 'Bank Mandiri (Persero) Tbk.', cluster: 'accumulated_stocks', basePrice: 7100, marketCap: 662_000_000_000_000, volume24h: 980_000_000_000, degree: 4, sector: 'Banking & Financials', notes: 'Crossing Asing & Dividen Hunter' },
      { id: 'BREN', label: 'BREN', name: 'Barito Renewables Energy Tbk.', cluster: 'accumulated_stocks', basePrice: 7800, marketCap: 1_043_000_000_000_000, volume24h: 890_000_000_000, degree: 3, sector: 'Renewable Energy', notes: 'Volatilitas tinggi & crossing institusi' },
      { id: 'ASII', label: 'ASII', name: 'Astra International Tbk.', cluster: 'accumulated_stocks', basePrice: 5250, marketCap: 212_000_000_000_000, volume24h: 480_000_000_000, degree: 3, sector: 'Automotive', notes: 'Inflow Asing pasca rilis penjualan mobil' },
      { id: 'GOTO', label: 'GOTO', name: 'GoTo Gojek Tokopedia Tbk.', cluster: 'accumulated_stocks', basePrice: 72, marketCap: 86_000_000_000_000, volume24h: 340_000_000_000, degree: 3, sector: 'Tech Platform', notes: 'High Retail Turn-over & TikTok E-commerce' },
    ],
    edges: [
      { source: 'BK', target: 'BBCA', label: 'Net Buy +Rp 82M', weight: 5, type: 'flow' },
      { source: 'BK', target: 'BBRI', label: 'Net Buy +Rp 60M', weight: 4, type: 'flow' },
      { source: 'AK', target: 'BBRI', label: 'Heavy Accumulation', weight: 5, type: 'flow' },
      { source: 'AK', target: 'BREN', label: 'Block Trade Crossing', weight: 4, type: 'flow' },
      { source: 'RX', target: 'BMRI', label: 'Institutional Inflow', weight: 4, type: 'flow' },
      { source: 'RX', target: 'ASII', label: 'Net Buy Otomotif', weight: 3, type: 'flow' },
      { source: 'ZP', target: 'BBCA', label: 'Dividend Position', weight: 3, type: 'flow' },
      { source: 'CC', target: 'BMRI', label: 'Underwriting Mandiri', weight: 5, type: 'flow' },
      { source: 'CC', target: 'BBRI', label: 'Syndicate Block', weight: 4, type: 'flow' },
      { source: 'KZ', target: 'BREN', label: 'Crossing Pasar Nego', weight: 4, type: 'flow' },
      { source: 'YP', target: 'BBRI', label: 'Retail Profit Taking', weight: 4, type: 'flow' },
      { source: 'YP', target: 'GOTO', label: 'Retail Scalping Volume', weight: 5, type: 'flow' },
      { source: 'PD', target: 'BBCA', label: 'Retail Distribution', weight: 3, type: 'flow' },
      { source: 'XC', target: 'GOTO', label: 'Retail Inflow Komunitas', weight: 4, type: 'flow' },
    ],
  },

  crypto: {
    title: 'Peta Ekosistem & Likuiditas Kripto Global',
    subtitle: 'Relasi Layer 1, Layer 2 Rollups, protokol DeFi terdesentralisasi, dan Solana Ecosystem',
    clusters: [
      {
        id: 'l1',
        name: 'Layer 1 Base Settlement',
        description: 'Jaringan blockchain konsensus dasar dengan kapitalisasi pasar terbesar',
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.45)',
      },
      {
        id: 'l2',
        name: 'Layer 2 & Rollups (Ethereum Scaling)',
        description: 'Solusi skalabilitas L2 yang menurunkan biaya gas dan mewarisi keamanan Ethereum',
        color: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.45)',
      },
      {
        id: 'defi',
        name: 'DeFi, Liquidity & Oracles',
        description: 'Protokol peminjaman, bursa terdesentralisasi, dan feed data harga terpercaya',
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.45)',
      },
      {
        id: 'solana_eco',
        name: 'Solana High-Speed Ecosystem',
        description: 'Ekosistem throughput tinggi dengan latensi sub-detik untuk trading aktif',
        color: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.45)',
      },
    ],
    nodes: [
      { id: 'BTC', label: 'BTC', name: 'Bitcoin', cluster: 'l1', basePrice: 68420, marketCap: 1_350_000_000_000, volume24h: 32_000_000_000, degree: 4, isCrypto: true, sector: 'Digital Gold / Store of Value' },
      { id: 'ETH', label: 'ETH', name: 'Ethereum', cluster: 'l1', basePrice: 3520, marketCap: 420_000_000_000, volume24h: 18_000_000_000, degree: 6, isCrypto: true, sector: 'Smart Contract Platform' },
      { id: 'SOL', label: 'SOL', name: 'Solana', cluster: 'solana_eco', basePrice: 158.5, marketCap: 74_000_000_000, volume24h: 8_500_000_000, degree: 4, isCrypto: true, sector: 'Monolithic High-TPS L1' },
      { id: 'BNB', label: 'BNB', name: 'BNB Chain', cluster: 'l1', basePrice: 590, marketCap: 86_000_000_000, volume24h: 2_100_000_000, degree: 2, isCrypto: true, sector: 'Exchange Ecosystem' },

      // L2
      { id: 'ARB', label: 'ARB', name: 'Arbitrum', cluster: 'l2', basePrice: 0.84, marketCap: 2_800_000_000, volume24h: 420_000_000, degree: 3, isCrypto: true, sector: 'Optimistic Rollup L2' },
      { id: 'OP', label: 'OP', name: 'Optimism (Superchain)', cluster: 'l2', basePrice: 1.65, marketCap: 2_100_000_000, volume24h: 310_000_000, degree: 3, isCrypto: true, sector: 'Optimistic Rollup L2' },

      // DeFi
      { id: 'LINK', label: 'LINK', name: 'Chainlink', cluster: 'defi', basePrice: 12.2, marketCap: 7_400_000_000, volume24h: 850_000_000, degree: 4, isCrypto: true, sector: 'Decentralized Oracle Network' },
      { id: 'UNI', label: 'UNI', name: 'Uniswap', cluster: 'defi', basePrice: 7.8, marketCap: 4_700_000_000, volume24h: 520_000_000, degree: 3, isCrypto: true, sector: 'Automated Market Maker (DEX)' },
      { id: 'AAVE', label: 'AAVE', name: 'Aave Protocol', cluster: 'defi', basePrice: 165, marketCap: 2_450_000_000, volume24h: 390_000_000, degree: 2, isCrypto: true, sector: 'Lending & Borrowing Market' },

      // Solana Eco
      { id: 'JUP', label: 'JUP', name: 'Jupiter DEX', cluster: 'solana_eco', basePrice: 0.98, marketCap: 1_320_000_000, volume24h: 680_000_000, degree: 3, isCrypto: true, sector: 'DEX Aggregator & Perps' },
      { id: 'RAY', label: 'RAY', name: 'Raydium', cluster: 'solana_eco', basePrice: 2.15, marketCap: 560_000_000, volume24h: 320_000_000, degree: 2, isCrypto: true, sector: 'Solana AMM & Liquidity' },
    ],
    edges: [
      { source: 'BTC', target: 'ETH', label: 'Macro Beta Correlation', weight: 5, type: 'synergy' },
      { source: 'ETH', target: 'ARB', label: 'L1 Settlement & Fraud Proofs', weight: 5, type: 'layer' },
      { source: 'ETH', target: 'OP', label: 'Superchain L1 Settlement', weight: 5, type: 'layer' },
      { source: 'ETH', target: 'UNI', label: 'Ethereum Liquidity Hub', weight: 4, type: 'synergy' },
      { source: 'ETH', target: 'LINK', label: 'Price Feeds & CCIP', weight: 4, type: 'oracle' },
      { source: 'SOL', target: 'JUP', label: 'Main DEX Orderflow Routing', weight: 5, type: 'synergy' },
      { source: 'SOL', target: 'RAY', label: 'Core AMM Liquidity', weight: 4, type: 'synergy' },
      { source: 'SOL', target: 'LINK', label: 'Cross-chain Oracles', weight: 3, type: 'oracle' },
      { source: 'UNI', target: 'AAVE', label: 'Liquidity Collateral', weight: 3, type: 'synergy' },
    ],
  },
};
