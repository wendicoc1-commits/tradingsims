// Master data for Stock Duels, IDX Indices, and Broker Directory

export interface StockPairDuel {
  slug: string;
  stockA: {
    ticker: string;
    name: string;
    sector: string;
    per: number;
    pbv: number;
    divYield: number;
    marketCap: string;
    roe: number;
    debtToEquity: number;
  };
  stockB: {
    ticker: string;
    name: string;
    sector: string;
    per: number;
    pbv: number;
    divYield: number;
    marketCap: string;
    roe: number;
    debtToEquity: number;
  };
  title: string;
  summary: string;
  winnerReason: string;
}

export const STOCK_DUELS: StockPairDuel[] = [
  {
    slug: 'bbca-vs-bbri',
    title: 'BBCA vs BBRI: Bank Central Asia vs Bank Rakyat Indonesia',
    stockA: {
      ticker: 'BBCA',
      name: 'Bank Central Asia Tbk',
      sector: 'Perbankan (Financials)',
      per: 21.4,
      pbv: 4.8,
      divYield: 3.2,
      marketCap: 'Rp 1.250 T',
      roe: 22.5,
      debtToEquity: 0.15,
    },
    stockB: {
      ticker: 'BBRI',
      name: 'Bank Rakyat Indonesia Tbk',
      sector: 'Perbankan (Financials)',
      per: 11.2,
      pbv: 2.1,
      divYield: 6.8,
      marketCap: 'Rp 820 T',
      roe: 19.8,
      debtToEquity: 0.85,
    },
    summary: 'Duel dua raksasa perbankan terbesar di Bursa Efek Indonesia. BBCA unggul dalam CASA, efisiensi operasional, dan kualitas kredit (NPL rendah), sedangkan BBRI menjadi juara dividen yield tinggi dan valuasi PBV yang jauh lebih terjangkau.',
    winnerReason: 'Pilih BBCA untuk pertumbuhan modal jangka panjang stabil (capital gain defensif), atau pilih BBRI untuk penghasilan pasif dividen tunai (dividend investing) dengan yield di atas 6%.',
  },
  {
    slug: 'adro-vs-ptba',
    title: 'ADRO vs PTBA: Saham Batubara Adaro vs Bukit Asam',
    stockA: {
      ticker: 'ADRO',
      name: 'Adaro Energy Indonesia Tbk',
      sector: 'Energi & Batubara',
      per: 4.5,
      pbv: 0.85,
      divYield: 12.5,
      marketCap: 'Rp 118 T',
      roe: 24.1,
      debtToEquity: 0.32,
    },
    stockB: {
      ticker: 'PTBA',
      name: 'Bukit Asam Tbk',
      sector: 'Energi & Batubara (BUMN)',
      per: 6.2,
      pbv: 1.45,
      divYield: 15.2,
      marketCap: 'Rp 39 T',
      roe: 21.0,
      debtToEquity: 0.28,
    },
    summary: 'Pertarungan raja dividen batubara Indonesia. ADRO sedang melakukan diversifikasi masif ke energi hijau dan aluminium smelter, sedangkan PTBA adalah emiten BUMN dengan payout ratio dividen historis hingga 100%.',
    winnerReason: 'Pilih ADRO jika Anda mencari diversifikasi energi masa depan dan neraca kas super tebal, atau pilih PTBA jika prioritas mutlak Anda adalah dividend payout ratio maksimal setiap tahun.',
  },
  {
    slug: 'tlkm-vs-isat',
    title: 'TLKM vs ISAT: Telkom Indonesia vs Indosat Ooredoo',
    stockA: {
      ticker: 'TLKM',
      name: 'Telkom Indonesia Tbk',
      sector: 'Telekomunikasi',
      per: 13.8,
      pbv: 2.3,
      divYield: 4.9,
      marketCap: 'Rp 370 T',
      roe: 17.5,
      debtToEquity: 0.95,
    },
    stockB: {
      ticker: 'ISAT',
      name: 'Indosat Ooredoo Hutchison Tbk',
      sector: 'Telekomunikasi',
      per: 16.5,
      pbv: 3.2,
      divYield: 3.1,
      marketCap: 'Rp 180 T',
      roe: 18.2,
      debtToEquity: 1.45,
    },
    summary: 'Komparasi sektor telekomunikasi Indonesia. TLKM mendominasi penetrasi fixed broadband (IndiHome) dan data center, sementara ISAT menunjukkan pertumbuhan laba bersih dan ARPU agresif pasca merger dengan Tri.',
    winnerReason: 'TLKM cocok untuk investor defensif pemburu dividen stabil dengan pangsa pasar terbesar, sedangkan ISAT menarik bagi trader pencari pertumbuhan laba pasca-konsolidasi industri telko.',
  },
  {
    slug: 'bmri-vs-bbni',
    title: 'BMRI vs BBNI: Bank Mandiri vs Bank Negara Indonesia',
    stockA: {
      ticker: 'BMRI',
      name: 'Bank Mandiri Tbk',
      sector: 'Perbankan (Financials)',
      per: 9.8,
      pbv: 2.1,
      divYield: 5.4,
      marketCap: 'Rp 610 T',
      roe: 22.1,
      debtToEquity: 0.72,
    },
    stockB: {
      ticker: 'BBNI',
      name: 'Bank Negara Indonesia Tbk',
      sector: 'Perbankan (Financials)',
      per: 8.2,
      pbv: 1.15,
      divYield: 5.8,
      marketCap: 'Rp 205 T',
      roe: 15.3,
      debtToEquity: 0.81,
    },
    summary: 'Dua bank BUMN tier-1 dengan ekspansi digital kuat (Livin vs wondr). BMRI memimpin segmen korporasi dan transaksi digital, sementara BBNI menawarkan diskon valuasi PBV yang paling murah di antara 4 bank besar.',
    winnerReason: 'BMRI unggul dalam efisiensi CIR dan pertumbuhan kredit konsisten, sedangkan BBNI menawarkan potensi rerating valuasi tertinggi berkat PBV yang masih mendekati 1x.',
  },
  {
    slug: 'icbp-vs-indf',
    title: 'ICBP vs INDF: Indofood CBP vs Indofood Sukses Makmur',
    stockA: {
      ticker: 'ICBP',
      name: 'Indofood CBP Sukses Makmur Tbk',
      sector: 'Barang Konsumsi (Consumer)',
      per: 14.2,
      pbv: 2.8,
      divYield: 3.6,
      marketCap: 'Rp 138 T',
      roe: 19.5,
      debtToEquity: 0.88,
    },
    stockB: {
      ticker: 'INDF',
      name: 'Indofood Sukses Makmur Tbk',
      sector: 'Holding Konsumsi & Agribisnis',
      per: 7.1,
      pbv: 1.05,
      divYield: 5.2,
      marketCap: 'Rp 62 T',
      roe: 14.8,
      debtToEquity: 0.75,
    },
    summary: 'Duel antara anak usaha produsen mie instan Indomie (ICBP) melawan induk holding agribisnis Bogasari & kelapa sawit (INDF). INDF dihargai dengan diskon konglomerasi yang signifikan.',
    winnerReason: 'Pilih ICBP untuk bisnis barang konsumsi murni dengan margin laba kuat, atau pilih INDF jika Anda ingin valuasi PER 7x dan dividend yield yang lebih tinggi.',
  },
  {
    slug: 'antm-vs-inco',
    title: 'ANTM vs INCO: Aneka Tambang vs Vale Indonesia',
    stockA: {
      ticker: 'ANTM',
      name: 'Aneka Tambang Tbk',
      sector: 'Nikel, Emas & Bauksit',
      per: 15.6,
      pbv: 1.8,
      divYield: 4.1,
      marketCap: 'Rp 78 T',
      roe: 12.3,
      debtToEquity: 0.35,
    },
    stockB: {
      ticker: 'INCO',
      name: 'Vale Indonesia Tbk',
      sector: 'Nikel Murni (Nickel Matte)',
      per: 18.2,
      pbv: 1.25,
      divYield: 1.8,
      marketCap: 'Rp 43 T',
      roe: 7.1,
      debtToEquity: 0.12,
    },
    summary: 'Komparasi emiten tambang nikel dan komoditas strategis. ANTM didukung oleh lonjakan penjualan emas fisik batangan dan ekosistem baterai EV MIND ID, sementara INCO memproduksi nikel matte dengan biaya tunai terendah di dunia.',
    winnerReason: 'ANTM memiliki diversifikasi produk (Emas, Feronikel, Bauksit) yang melindungi dari volatilitas harga nikel, sedangkan INCO menawarkan neraca utang hampir nol dengan proyek smelter HPAL baru.',
  },
  {
    slug: 'asii-vs-untr',
    title: 'ASII vs UNTR: Astra International vs United Tractors',
    stockA: {
      ticker: 'ASII',
      name: 'Astra International Tbk',
      sector: 'Konglomerat Otomotif & Jasa Keuangan',
      per: 6.8,
      pbv: 0.98,
      divYield: 8.5,
      marketCap: 'Rp 212 T',
      roe: 14.9,
      debtToEquity: 0.45,
    },
    stockB: {
      ticker: 'UNTR',
      name: 'United Tractors Tbk',
      sector: 'Alat Berat, Kontraktor Tambang & Emas',
      per: 5.1,
      pbv: 1.15,
      divYield: 9.8,
      marketCap: 'Rp 101 T',
      roe: 22.8,
      debtToEquity: 0.22,
    },
    summary: 'Induk konglomerasi otomotif terbesar di ASEAN (ASII) berhadapan dengan mesin pencetak laba tambang dan alat berat Komatsu (UNTR). Keduanya dikenal sebagai pembayar dividen jumbo tahunan.',
    winnerReason: 'ASII memberikan eksposur lengkap ke ekonomi konsumsi Indonesia (mobil, motor, perbankan, jalan tol), sementara UNTR adalah *cash cow* dengan margin tebal dari tambang emas Martabe dan nikel.',
  },
  {
    slug: 'goto-vs-buka',
    title: 'GOTO vs BUKA: GoTo Gojek Tokopedia vs Bukalapak',
    stockA: {
      ticker: 'GOTO',
      name: 'GoTo Gojek Tokopedia Tbk',
      sector: 'Teknologi Digital & On-Demand',
      per: -12.5,
      pbv: 1.1,
      divYield: 0.0,
      marketCap: 'Rp 115 T',
      roe: -5.2,
      debtToEquity: 0.18,
    },
    stockB: {
      ticker: 'BUKA',
      name: 'Bukalapak.com Tbk',
      sector: 'E-Commerce & Mitra O2O',
      per: -8.4,
      pbv: 0.42,
      divYield: 0.0,
      marketCap: 'Rp 10.6 T',
      roe: -4.1,
      debtToEquity: 0.05,
    },
    summary: 'Dua pionir saham startup teknologi BEI. GOTO telah mencapai EBITDA yang disesuaikan positif dengan kemitraan strategis TikTok Shop, sedangkan BUKA memiliki saldo kas bersih (net cash) yang bahkan lebih tinggi dari total kapitalisasi pasarnya.',
    winnerReason: 'GOTO memiliki skala ekosistem pengguna dan volume transaksi (GTV) terbesar di Indonesia, sementara BUKA adalah saham *deep value* dengan kas melimpah tanpa beban utang.',},
{
  "slug": "bbri-vs-bmri",
  "title": "BBRI vs BMRI: Bank Rakyat Indonesia vs Bank Mandiri",
  "stockA": {
    "ticker": "BBRI",
    "name": "Bank Rakyat Indonesia Tbk",
    "sector": "Perbankan (Financials)",
    "per": 11.2,
    "pbv": 2.1,
    "divYield": 6.8,
    "marketCap": "Rp 820 T",
    "roe": 19.8,
    "debtToEquity": 0.85
  },
  "stockB": {
    "ticker": "BMRI",
    "name": "Bank Mandiri Tbk",
    "sector": "Perbankan (Financials)",
    "per": 9.8,
    "pbv": 2.1,
    "divYield": 5.4,
    "marketCap": "Rp 610 T",
    "roe": 22.1,
    "debtToEquity": 0.72
  },
  "summary": "Duel dua bank BUMN terbesar dengan profitabilitas rekor di BEI. BBRI merajai segmen kredit mikro dan ultra mikro melalui Kupedes, sedangkan BMRI memimpin segmen pembiayaan korporasi dan transaksi digital super app Livin.",
  "winnerReason": "Pilih BBRI jika tujuan utama Anda adalah dividen yield tinggi di atas 6%, atau pilih BMRI jika Anda memprioritaskan pertumbuhan laba korporasi dengan rasio dana murah CASA terkuat."
},
{
  "slug": "antm-vs-mdka",
  "title": "ANTM vs MDKA: Aneka Tambang vs Merdeka Copper Gold",
  "stockA": {
    "ticker": "ANTM",
    "name": "Aneka Tambang Tbk",
    "sector": "Nikel, Emas & Bauksit",
    "per": 15.6,
    "pbv": 1.8,
    "divYield": 4.1,
    "marketCap": "Rp 78 T",
    "roe": 12.3,
    "debtToEquity": 0.35
  },
  "stockB": {
    "ticker": "MDKA",
    "name": "Merdeka Copper Gold Tbk",
    "sector": "Tembaga, Emas & Nikel",
    "per": 35,
    "pbv": 3.2,
    "divYield": 0,
    "marketCap": "Rp 56 T",
    "roe": 4.5,
    "debtToEquity": 0.95
  },
  "summary": "Dua pemain tambang logam mulia dan logam transisi energi terpopuler. ANTM BUMN mencetak rekor dari lonjakan penjualan emas fisik batangan Logam Mulia, sedangkan MDKA memiliki cadangan tembaga Tujuh Bukit kelas dunia dan smelter HPAL nikel.",
  "winnerReason": "ANTM memberikan dividen rutin dan perlindungan inflasi emas fisik, sementara MDKA menawarkan potensi pertumbuhan jangka panjang proyek tembaga bawah tanah."
},
{
  "slug": "bumi-vs-dewa",
  "title": "BUMI vs DEWA: Bumi Resources vs Darma Henwa",
  "stockA": {
    "ticker": "BUMI",
    "name": "Bumi Resources Tbk",
    "sector": "Pertambangan Batubara",
    "per": 5.5,
    "pbv": 0.95,
    "divYield": 0,
    "marketCap": "Rp 52 T",
    "roe": 16.2,
    "debtToEquity": 0.65
  },
  "stockB": {
    "ticker": "DEWA",
    "name": "Darma Henwa Tbk",
    "sector": "Jasa Kontraktor Penambangan",
    "per": 8.5,
    "pbv": 0.75,
    "divYield": 0,
    "marketCap": "Rp 8.5 T",
    "roe": 9.1,
    "debtToEquity": 1.1
  },
  "summary": "Dua saham Grup Bakrie dan Salim yang memiliki volume transaksi harian paling aktif di bursa. BUMI produsen batubara terbesar Indonesia, DEWA kontraktor penambangan pendukung operasional tambang batubara.",
  "winnerReason": "BUMI menawarkan likuiditas raksasa dan neraca yang telah bebas dari utang PKPU, sedangkan DEWA memiliki kapitalisasi pasar lebih kecil yang lincah digerakkan momentum sektor."
},
{
  "slug": "pgas-vs-medc",
  "title": "PGAS vs MEDC: Perusahaan Gas Negara vs Medco Energi",
  "stockA": {
    "ticker": "PGAS",
    "name": "Perusahaan Gas Negara Tbk",
    "sector": "Transmisi & Niaga Gas Bumi",
    "per": 7.2,
    "pbv": 0.82,
    "divYield": 8.2,
    "marketCap": "Rp 38 T",
    "roe": 11.5,
    "debtToEquity": 0.85
  },
  "stockB": {
    "ticker": "MEDC",
    "name": "Medco Energi Internasional Tbk",
    "sector": "Eksplorasi Minyak, Gas & Tambang Tembaga",
    "per": 6.1,
    "pbv": 1.15,
    "divYield": 5.5,
    "marketCap": "Rp 33 T",
    "roe": 18.2,
    "debtToEquity": 1.65
  },
  "summary": "Pilihan utama sektor energi migas Indonesia. PGAS memonopoli 90%+ jaringan pipa transmisi gas bumi dengan dividen yield 8%+, sementara MEDC menawarkan keuntungan langsung dari harga minyak mentah Brent dan kepemilikan saham tambang emas tembaga Amman Mineral (AMMN).",
  "winnerReason": "Pilih PGAS untuk arus kas defensif dengan yield dividen tinggi, atau MEDC untuk pengungkit pertumbuhan laba saat komoditas minyak dan tembaga melonjak."
},
{
  "slug": "bris-vs-btps",
  "title": "BRIS vs BTPS: Bank Syariah Indonesia vs BTPN Syariah",
  "stockA": {
    "ticker": "BRIS",
    "name": "Bank Syariah Indonesia Tbk",
    "sector": "Perbankan Syariah",
    "per": 18.5,
    "pbv": 2.8,
    "divYield": 1.5,
    "marketCap": "Rp 140 T",
    "roe": 16.8,
    "debtToEquity": 0.25
  },
  "stockB": {
    "ticker": "BTPS",
    "name": "BTPN Syariah Tbk",
    "sector": "Pembiayaan Syariah Ultra Mikro",
    "per": 8.8,
    "pbv": 1.25,
    "divYield": 6.2,
    "marketCap": "Rp 9.8 T",
    "roe": 14.5,
    "debtToEquity": 0.35
  },
  "summary": "Duel perbankan syariah terdepan di Indonesia. BRIS mendominasi aset perbankan syariah nasional hasil merger 3 bank BUMN, sedangkan BTPS fokus melayani jutaan nasabah wanita prasejahtera dengan margin bunga bersih (NIM) tebal.",
  "winnerReason": "BRIS unggul dalam skala aset, dana tabungan haji, dan inklusi syariah menyeluruh, sementara BTPS menawarkan diskon valuasi PBV murah dengan dividen yield tinggi di atas 6%."
},
{
  "slug": "klbf-vs-sido",
  "title": "KLBF vs SIDO: Kalbe Farma vs Industri Jamu Sido Muncul",
  "stockA": {
    "ticker": "KLBF",
    "name": "Kalbe Farma Tbk",
    "sector": "Farmasi & Layanan Kesehatan",
    "per": 22,
    "pbv": 3.4,
    "divYield": 2.8,
    "marketCap": "Rp 72 T",
    "roe": 15.5,
    "debtToEquity": 0.18
  },
  "stockB": {
    "ticker": "SIDO",
    "name": "Industri Jamu dan Farmasi Sido Muncul Tbk",
    "sector": "Jamu Tradisional & Herbal",
    "per": 17.5,
    "pbv": 5.2,
    "divYield": 5.8,
    "marketCap": "Rp 18 T",
    "roe": 31,
    "debtToEquity": 0.1
  },
  "summary": "Dua raksasa produk kesehatan dan herbal Indonesia. KLBF memiliki lini produk obat resep dan nutrisi terlengkap, SIDO memiliki margin laba bersih tertinggi di IHSG (>30%) berkat merek legendaris Tolak Angin.",
  "winnerReason": "KLBF untuk diversifikasi bisnis farmasi yang luas, SIDO untuk efisiensi bisnis tanpa utang dengan ROE 31% dan dividen yield konsisten."
},
{
  "slug": "excl-vs-isat",
  "title": "EXCL vs ISAT: XL Axiata vs Indosat Ooredoo Hutchison",
  "stockA": {
    "ticker": "EXCL",
    "name": "XL Axiata Tbk",
    "sector": "Telekomunikasi",
    "per": 18.2,
    "pbv": 1.2,
    "divYield": 3.5,
    "marketCap": "Rp 29 T",
    "roe": 7.5,
    "debtToEquity": 1.85
  },
  "stockB": {
    "ticker": "ISAT",
    "name": "Indosat Ooredoo Hutchison Tbk",
    "sector": "Telekomunikasi",
    "per": 16.5,
    "pbv": 3.2,
    "divYield": 3.1,
    "marketCap": "Rp 180 T",
    "roe": 18.2,
    "debtToEquity": 1.45
  },
  "summary": "Persaingan operator nomor dua dan tiga di Indonesia. EXCL gencar memperluas konvergensi fixed-mobile pasca akuisisi First Media, sementara ISAT menikmati sinergi penghematan biaya operasional pasca-merger Tri.",
  "winnerReason": "EXCL menarik bagi pemburu saham valuasi murah (PBV 1.2x), sedangkan ISAT menawarkan rekam jejak pertumbuhan laba bersih yang lebih agresif."
},
{
  "slug": "btc-vs-eth",
  "title": "BTC vs ETH: Bitcoin vs Ethereum",
  "stockA": {
    "ticker": "BTC",
    "name": "Bitcoin (Digital Gold)",
    "sector": "Cryptocurrency Store of Value",
    "per": 0,
    "pbv": 0,
    "divYield": 0,
    "marketCap": "Rp 30.500 T",
    "roe": 0,
    "debtToEquity": 0
  },
  "stockB": {
    "ticker": "ETH",
    "name": "Ethereum (Smart Contract Platform)",
    "sector": "Layer 1 Blockchain Platform",
    "per": 0,
    "pbv": 0,
    "divYield": 3.2,
    "marketCap": "Rp 6.400 T",
    "roe": 0,
    "debtToEquity": 0
  },
  "summary": "Duel dua pilar utama aset kripto dunia. Bitcoin adalah emas digital dengan batas maksimal 21 juta koin yang diadopsi dana institusi dan ETF global, sedangkan Ethereum adalah pondasi aplikasi terdesentralisasi, DeFi, dan tokenisasi aset dunia nyata (RWA).",
  "winnerReason": "Bitcoin untuk alokasi aset paling konservatif dan tahan inflasi di kripto, Ethereum untuk partisipasi dalam pertumbuhan ekosistem aplikasi Web3 dan imbal hasil staking."
},
{
  "slug": "sol-vs-eth",
  "title": "SOL vs ETH: Solana vs Ethereum",
  "stockA": {
    "ticker": "SOL",
    "name": "Solana (High Performance Monolithic L1)",
    "sector": "Layer 1 Blockchain Platform",
    "per": 0,
    "pbv": 0,
    "divYield": 6.5,
    "marketCap": "Rp 1.480 T",
    "roe": 0,
    "debtToEquity": 0
  },
  "stockB": {
    "ticker": "ETH",
    "name": "Ethereum (Modular Security Layer 1)",
    "sector": "Layer 1 Blockchain Platform",
    "per": 0,
    "pbv": 0,
    "divYield": 3.2,
    "marketCap": "Rp 6.400 T",
    "roe": 0,
    "debtToEquity": 0
  },
  "summary": "Perang arsitektur blockchain generasi baru. Solana mengusung eksekusi monolitik super cepat (3000+ TPS) dengan biaya gas sub-sen, sedangkan Ethereum memilih jalur modular dengan Layer 2 (Base, Arbitrum) untuk keamanan desentralisasi mutlak.",
  "winnerReason": "Solana memimpin volume transaksi retail dan aktivitas trading on-chain berbiaya murah, sementara Ethereum tetap menjadi raja likuiditas dan kepercayaan institusi global."
},
{
  "slug": "nvda-vs-amd",
  "title": "NVDA vs AMD: Nvidia vs Advanced Micro Devices",
  "stockA": {
    "ticker": "NVDA",
    "name": "Nvidia Corporation",
    "sector": "Semikonduktor Komputasi AI & GPU",
    "per": 48,
    "pbv": 38,
    "divYield": 0.05,
    "marketCap": "Rp 53.000 T",
    "roe": 115,
    "debtToEquity": 0.25
  },
  "stockB": {
    "ticker": "AMD",
    "name": "Advanced Micro Devices Inc",
    "sector": "Semikonduktor CPU Ryzen & GPU Instinct",
    "per": 35,
    "pbv": 3.5,
    "divYield": 0,
    "marketCap": "Rp 3.450 T",
    "roe": 6.5,
    "debtToEquity": 0.05
  },
  "summary": "Pertarungan chip komputasi terpanas di Wall Street. Nvidia memonopoli 85%+ akselerator komputasi kecerdasan buatan melalui arsitektur CUDA, sedangkan AMD menjadi penantang utama dengan prosesor server EPYC dan akselerator MI300.",
  "winnerReason": "Nvidia untuk eksposur dominan terhadap belanja infrastruktur AI perusahaan raksasa (Hyperscalers), AMD untuk opsi alternatif chip AI dengan valuasi PBV yang jauh lebih rasional."
},
];

export interface IDXIndexItem {
  slug: string;
  code: string;
  name: string;
  description: string;
  totalConstituents: number;
  marketCapCoverage: string;
  topConstituents: string[];
  rebalanceSchedule: string;
  methodology: string;
}

export const IDX_INDICES: IDXIndexItem[] = [
  {
    slug: 'ihsg',
    code: 'IHSG',
    name: 'Indeks Harga Saham Gabungan (Composite Index)',
    description: 'Indeks komposit utama yang mengukur pergerakan seluruh saham tercatat di Papan Utama dan Papan Pengembangan Bursa Efek Indonesia.',
    totalConstituents: 940,
    marketCapCoverage: '100% Pasar Saham BEI',
    topConstituents: ['BBCA', 'BBRI', 'BMRI', 'BREN', 'AMMN', 'TLKM', 'ASII', 'TPIA'],
    rebalanceSchedule: 'Harian (Berdasarkan jumlah saham beredar tercatat)',
    methodology: 'Market Capitalization Weighted (Menggunakan bobot free-float)',
  },
  {
    slug: 'lq45',
    code: 'LQ45',
    name: 'Indeks LQ45',
    description: '45 saham dengan likuiditas perdagangan tertinggi, kapitalisasi pasar besar, dan didukung oleh fundamental perusahaan yang kuat.',
    totalConstituents: 45,
    marketCapCoverage: 'Sekitar 65% Total Transaksi Harian BEI',
    topConstituents: ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'ADRO', 'AMMN', 'ICBP'],
    rebalanceSchedule: 'Evaluasi Mayor setiap Januari & Juli; Evaluasi Minor setiap April & Oktober',
    methodology: 'Free Float Adjusted Market Capitalization',
  },
  {
    slug: 'idx30',
    code: 'IDX30',
    name: 'Indeks IDX30',
    description: '30 saham bluechip paling likuid dari konstituen indeks LQ45 dengan kapitalisasi pasar terbesar di Indonesia.',
    totalConstituents: 30,
    marketCapCoverage: 'Sekitar 55% Total Kapitalisasi Pasar Saham',
    topConstituents: ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'TLKM', 'UNTR', 'KLBF', 'ADRO'],
    rebalanceSchedule: 'Evaluasi Mayor setiap Januari & Juli',
    methodology: 'Capped Free Float Weighted',
  },
  {
    slug: 'idx-hidiv20',
    code: 'IDX HIDIV20',
    name: 'Indeks High Dividend 20',
    description: '20 saham tercatat yang membagikan dividen tunai secara konsisten selama 3 tahun terakhir dengan dividend yield tertinggi.',
    totalConstituents: 20,
    marketCapCoverage: 'Portofolio Dividen Tunai Terbesar BEI',
    topConstituents: ['PTBA', 'ADRO', 'ITMG', 'UNTR', 'BBRI', 'BMRI', 'BBNI', 'ASII', 'INDF'],
    rebalanceSchedule: 'Februari & Agustus setiap tahun',
    methodology: 'Dividend Yield & Trading Liquidity Weighted',
  },
  {
    slug: 'jii',
    code: 'JII',
    name: 'Jakarta Islamic Index (Saham Syariah)',
    description: '30 saham syariah paling likuid yang memenuhi kriteria Daftar Efek Syariah (DES) Otoritas Jasa Keuangan (OJK).',
    totalConstituents: 30,
    marketCapCoverage: 'Pasar Modal Syariah Indonesia',
    topConstituents: ['TLKM', 'ASII', 'ICBP', 'INDF', 'BRIS', 'ADRO', 'KLBF', 'UNTR', 'PGAS'],
    rebalanceSchedule: 'Mei dan November setiap tahun',
    methodology: 'OJK Syariah Compliance + Free Float Liquidity',
  },
  {
    slug: 'kompas100',
    code: 'KOMPAS100',
    name: 'Indeks Kompas 100',
    description: '100 saham pilihan hasil kerja sama Bursa Efek Indonesia dengan harian Kompas yang memiliki likuiditas dan fundamental teruji.',
    totalConstituents: 100,
    marketCapCoverage: 'Sekitar 75-80% Total Transaksi BEI',
    topConstituents: ['BBCA', 'BBRI', 'BMRI', 'AMMN', 'BREN', 'TLKM', 'ASII', 'BRPT', 'MDKA'],
    rebalanceSchedule: 'Januari dan Juli setiap tahun',
    methodology: 'Liquidity, Market Cap & Financial Stability Weighted',
  },
];

export interface BrokerItem {
  code: string;
  name: string;
  type: 'ASING' | 'DOMESTIK' | 'BUMN' | 'RETAIL POPULER';
  feeBeli: string;
  feeJual: string;
  description: string;
  fiturUnggulan: string[];
}

export const BROKER_DIRECTORY: BrokerItem[] = [
  {
    code: 'YP',
    name: 'Mirae Asset Sekuritas Indonesia',
    type: 'RETAIL POPULER',
    feeBeli: '0.15%',
    feeJual: '0.25%',
    description: 'Salah satu broker ritel terbesar dan teraktif di Bursa Efek Indonesia dengan volume transaksi harian raksasa melalui platform HOTS (Home Online Trading System) dan M-Stock.',
    fiturUnggulan: ['HOTS Desktop Charting', 'Komunitas Investor Terbesar', 'Riset Harian Lengkap', 'Automatic Order'],
  },
  {
    code: 'CC',
    name: 'Mandiri Sekuritas (Growin\')',
    type: 'BUMN',
    feeBeli: '0.18%',
    feeJual: '0.28%',
    description: 'Anak perusahaan Bank Mandiri (Persero) Tbk, memimpin transaksi obligasi negara, underwriting IPO emiten jumbo, dan penjamin emisi terpercaya di Indonesia.',
    fiturUnggulan: ['Akses Surat Utang & SBN', 'Growin\' Mobile App', 'Underwriter IPO BUMN', 'Riset Makro Terlengkap'],
  },
  {
    code: 'PD',
    name: 'Indo Premier Sekuritas (IPOT)',
    type: 'RETAIL POPULER',
    feeBeli: '0.19%',
    feeJual: '0.29%',
    description: 'Pelopor platform trading online ritel di Indonesia dengan aplikasi IPOT yang mengintegrasikan saham, ETF, dan reksa dana dalam satu rekening dana nasabah (RDN).',
    fiturUnggulan: ['Super App IPOT', 'Marketplace Reksa Dana', 'Fitur Robo Trading', 'Komunitas Forum Finansial'],
  },
  {
    code: 'BK',
    name: 'J.P. Morgan Sekuritas Indonesia',
    type: 'ASING',
    feeBeli: '0.20% (Institusi)',
    feeJual: '0.30% (Institusi)',
    description: 'Broker investasi global terkemuka yang menjadi jalur utama arus modal institusi asing (foreign inflow/outflow) keluar masuk saham-saham bluechip BEI.',
    fiturUnggulan: ['Akses Dana Institusi Global', 'Global Equity Research', 'Block Trading Jumbo', 'Layanan Private Banking'],
  },
  {
    code: 'AK',
    name: 'UBS Sekuritas Indonesia',
    type: 'ASING',
    feeBeli: '0.20% (Institusi)',
    feeJual: '0.30% (Institusi)',
    description: 'Raksasa perbankan investasi asal Swiss yang menguasai eksekusi trading investor institusi global di pasar saham Indonesia dan Asia Tenggara.',
    fiturUnggulan: ['Algorithmic Execution', 'Foreign Flow Institutional Desk', 'Cross-Asset Derivatives', 'Riset Ekuitas Global'],
  },
  {
    code: 'NI',
    name: 'BNI Sekuritas (BIONS)',
    type: 'BUMN',
    feeBeli: '0.17%',
    feeJual: '0.27%',
    description: 'Sekuritas milik Bank BNI dengan aplikasi BIONS (BNI Sekuritas Innovative Online Trading Systems) yang populer di kalangan milenial dan investor pemula.',
    fiturUnggulan: ['BIONS Mobile', 'Integrasi Rekening BNI', 'Automatic Order Triggers', 'Webinar Edukasi Rutin'],
  },
  {
    code: 'XL',
    name: 'Stockbit Sekuritas Digital (Mahakarya Artha)',
    type: 'RETAIL POPULER',
    feeBeli: '0.15%',
    feeJual: '0.25%',
    description: 'Platform investasi modern yang menggabungkan analisis profesional, fitur sosial Stream, dan eksekusi transaksi cepat dengan UI/UX modern.',
    fiturUnggulan: ['Social Trading Stream', 'Chartbit Pro Realtime', 'Financial Ratio Screener', 'Edukasi Academy Gratis'],
  },
  {
    code: 'XC',
    name: 'Ajaib Sekuritas Asia',
    type: 'RETAIL POPULER',
    feeBeli: '0.15%',
    feeJual: '0.25%',
    description: 'Fintech unicorn investasi yang sangat populer di kalangan Gen Z dan pemula dengan proses pendaftaran 100% online tanpa minimal deposit awal.',
    fiturUnggulan: ['Pendaftaran 100% Online', 'Tanpa Minimum Deposit', 'Antarmuka Ramah Pemula', 'Ajaib Prime Service'],
  },
];
