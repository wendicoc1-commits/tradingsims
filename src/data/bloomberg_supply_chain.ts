export interface SupplyChainNode {
  name: string;
  ticker?: string;
  country: string;
  relationshipType: 'SUPPLIER' | 'CUSTOMER' | 'PARTNER';
  productCategory: string;
  revenueExposurePercent: number; // % of cost or % of revenue
  dependencyRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'STRATEGIC';
  notes: string;
}

export interface StockSupplyChainData {
  symbol: string;
  name: string;
  sector: string;
  focalSummary: string;
  overallSupplyRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  overallCustomerRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  suppliers: SupplyChainNode[];
  customers: SupplyChainNode[];
  partners: SupplyChainNode[];
}

export const BLOOMBERG_SUPPLY_CHAIN: Record<string, StockSupplyChainData> = {
  ASII: {
    symbol: 'ASII',
    name: 'PT Astra International Tbk',
    sector: 'Consumer Cyclicals / Automotive & Heavy Eq',
    focalSummary: 'Konglomerasi otomotif terbesar di Asia Tenggara dengan integrasi hulu ke hilir: perakitan mobil/motor, distribusi retail, pembiayaan, hingga pertambangan komoditas.',
    overallSupplyRisk: 'MEDIUM',
    overallCustomerRisk: 'LOW',
    suppliers: [
      {
        name: 'PT Astra Otoparts Tbk',
        ticker: 'AUTO',
        country: 'Indonesia',
        relationshipType: 'SUPPLIER',
        productCategory: 'Komponen Otomotif (Suspensi, Aki, Electrical)',
        revenueExposurePercent: 18.5,
        dependencyRisk: 'MEDIUM',
        status: 'STRATEGIC',
        notes: 'Pemasok internal utama rantai pasok komponen kendaraan roda 4 dan roda 2.',
      },
      {
        name: 'PT Gajah Tunggal Tbk',
        ticker: 'GJTL',
        country: 'Indonesia',
        relationshipType: 'SUPPLIER',
        productCategory: 'Ban OEM (GT Radial / IRC)',
        revenueExposurePercent: 6.2,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Pemasok ban OEM pabrikan mobil Daihatsu dan Toyota Astra.',
      },
      {
        name: 'Denso Corporation',
        ticker: '6902.T',
        country: 'Japan',
        relationshipType: 'SUPPLIER',
        productCategory: 'ECU & Komponen Injeksi Presisi',
        revenueExposurePercent: 12.0,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Pemasok komponen elektronik canggih dan sensor hybrid dari Jepang.',
      },
      {
        name: 'Komatsu Ltd',
        ticker: '6301.T',
        country: 'Japan',
        relationshipType: 'SUPPLIER',
        productCategory: 'Alat Berat Pertambangan (Excavator / Dump Truck)',
        revenueExposurePercent: 14.8,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Pemasok unit alat berat untuk anak usaha UNTR (United Tractors).',
      },
    ],
    customers: [
      {
        name: 'Auto2000 & Retail Dealer Network',
        country: 'Indonesia',
        relationshipType: 'CUSTOMER',
        productCategory: 'Konsumen Ritel Otomotif Nasional',
        revenueExposurePercent: 34.0,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Jaringan dealer resmi melayani lebih dari 350.000 unit kendaraan per tahun.',
      },
      {
        name: 'Astra Sedaya Finance (ACC) & TAF',
        country: 'Indonesia',
        relationshipType: 'CUSTOMER',
        productCategory: 'Pembiayaan Kendaraan Bermotor (Leasing)',
        revenueExposurePercent: 22.5,
        dependencyRisk: 'LOW',
        status: 'STRATEGIC',
        notes: 'Anak usaha pembiayaan yang menyerap kredit pembelian kendaraan Astra.',
      },
      {
        name: 'Perusahaan Tambang Batubara & Nikel',
        country: 'Indonesia',
        relationshipType: 'CUSTOMER',
        productCategory: 'Jasa Kontraktor Tambang (Pama Persada)',
        revenueExposurePercent: 19.8,
        dependencyRisk: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Kontrak jasa penambangan volume tinggi (overburden removal & coal hauling).',
      },
    ],
    partners: [
      {
        name: 'Toyota Motor Corporation',
        ticker: '7203.T',
        country: 'Japan',
        relationshipType: 'PARTNER',
        productCategory: 'Joint Venture & Prinsipal Perakitan Mobil',
        revenueExposurePercent: 42.0,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Prinsipal utama pabrikan Toyota & Daihatsu di Indonesia.',
      },
      {
        name: 'Honda Motor Co., Ltd.',
        ticker: '7267.T',
        country: 'Japan',
        relationshipType: 'PARTNER',
        productCategory: 'Prinsipal Sepeda Motor (Astra Honda Motor)',
        revenueExposurePercent: 28.0,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Prinsipal sepeda motor terbesar di Indonesia dengan market share >75%.',
      },
    ],
  },
  BBCA: {
    symbol: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    sector: 'Financials / Banking',
    focalSummary: 'Bank swasta terbesar di Indonesia dengan rasio dana murah CASA di atas 82%, memproses lebih dari 90 juta transaksi per hari dengan benteng digitalisasi perbankan mutakhir.',
    overallSupplyRisk: 'LOW',
    overallCustomerRisk: 'LOW',
    suppliers: [
      {
        name: 'IBM Corporation',
        ticker: 'IBM',
        country: 'United States',
        relationshipType: 'SUPPLIER',
        productCategory: 'Core Banking Mainframe & Server Keamanan',
        revenueExposurePercent: 4.8,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Penyedia infrastruktur komputasi mainframe mission-critical BCA.',
      },
      {
        name: 'Visa Inc. & Mastercard Inc.',
        ticker: 'V',
        country: 'United States',
        relationshipType: 'SUPPLIER',
        productCategory: 'Jaringan Pembayaran Kartu Kredit Global',
        revenueExposurePercent: 3.2,
        dependencyRisk: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Routing transaksi kartu kredit internasional nasabah BCA.',
      },
      {
        name: 'PT Telkom Indonesia Tbk',
        ticker: 'TLKM',
        country: 'Indonesia',
        relationshipType: 'SUPPLIER',
        productCategory: 'Jaringan Serat Optik & Koneksi Satelit ATM',
        revenueExposurePercent: 2.5,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Jalur komunikasi data private untuk 19.000+ ATM BCA di seluruh Indonesia.',
      },
    ],
    customers: [
      {
        name: 'Konglomerasi Korporasi Tier-1 (Djarum, Indofood, Gudang Garam)',
        country: 'Indonesia',
        relationshipType: 'CUSTOMER',
        productCategory: 'Kredit Korporasi & Payroll Mandat',
        revenueExposurePercent: 36.5,
        dependencyRisk: 'LOW',
        status: 'STRATEGIC',
        notes: 'Nasabah korporasi prima dengan NPL mendekati 0% dan volume perputaran kas raksasa.',
      },
      {
        name: '32+ Juta Nasabah Tabungan Ritel',
        country: 'Indonesia',
        relationshipType: 'CUSTOMER',
        productCategory: 'Dana Pihak Ketiga (CASA) & Kredit Konsumer (KPR/KKB)',
        revenueExposurePercent: 48.0,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Basis nasabah tabungan ritel yang menghasilkan biaya dana (CoF) terendah di industri perbankan.',
      },
    ],
    partners: [
      {
        name: 'Bank Indonesia (BI-FAST / RTGS / GPN)',
        country: 'Indonesia',
        relationshipType: 'PARTNER',
        productCategory: 'Sistem Kliring & Settlement Nasional',
        revenueExposurePercent: 100,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Regulator moneter dan pengelola jaringan settlement antar bank nasional.',
      },
    ],
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology / Semiconductors & AI Hardware',
    focalSummary: 'Pemimpin semikonduktor komputasi AI global dengan platform GPU Hopper/Blackwell dan arsitektur software CUDA yang menjadi standar de facto industri kecerdasan buatan.',
    overallSupplyRisk: 'HIGH',
    overallCustomerRisk: 'MEDIUM',
    suppliers: [
      {
        name: 'TSMC (Taiwan Semiconductor Manufacturing Co)',
        ticker: 'TSM',
        country: 'Taiwan',
        relationshipType: 'SUPPLIER',
        productCategory: 'Fabrikasi Silikon Wafer 4N / 3nm & Packaging CoWoS',
        revenueExposurePercent: 55.0,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Pabrikan pengecoran tunggal silikon chip Blackwell dan CoWoS advanced packaging.',
      },
      {
        name: 'SK Hynix Inc.',
        ticker: '000660.KS',
        country: 'South Korea',
        relationshipType: 'SUPPLIER',
        productCategory: 'HBM3e / HBM4 High-Bandwidth Memory',
        revenueExposurePercent: 24.0,
        dependencyRisk: 'HIGH',
        status: 'STRATEGIC',
        notes: 'Pemasok utama memori berkecepatan tinggi yang ditumpuk pada chip akselerator AI.',
      },
      {
        name: 'Foxconn (Hon Hai Precision Industry)',
        ticker: '2317.TW',
        country: 'Taiwan',
        relationshipType: 'SUPPLIER',
        productCategory: 'Perakitan Server Rack NVL72 & Power Modules',
        revenueExposurePercent: 15.0,
        dependencyRisk: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Mitra manufaktur modul papan server AI raksasa pendingin cairan.',
      },
    ],
    customers: [
      {
        name: 'Microsoft Corporation (Azure)',
        ticker: 'MSFT',
        country: 'United States',
        relationshipType: 'CUSTOMER',
        productCategory: 'AI Cloud Datacenter Clusters (OpenAI Infrastructure)',
        revenueExposurePercent: 19.5,
        dependencyRisk: 'MEDIUM',
        status: 'STRATEGIC',
        notes: 'Pembeli GPU terbesar untuk melatih model GPT dan Copilot.',
      },
      {
        name: 'Meta Platforms Inc.',
        ticker: 'META',
        country: 'United States',
        relationshipType: 'CUSTOMER',
        productCategory: 'Infrastruktur Pelatihan Model Llama & Rekomendasi Feed',
        revenueExposurePercent: 14.2,
        dependencyRisk: 'LOW',
        status: 'STRATEGIC',
        notes: 'Menyebarkan ratusan ribu GPU H100/H200 untuk riset open source AI.',
      },
      {
        name: 'Amazon Web Services (AWS)',
        ticker: 'AMZN',
        country: 'United States',
        relationshipType: 'CUSTOMER',
        productCategory: 'Cloud Elastic Compute (EC2 P5 Instances)',
        revenueExposurePercent: 12.8,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Penyedia cloud publik terbesar untuk jutaan developer AI global.',
      },
      {
        name: 'Alphabet Inc. (Google Cloud)',
        ticker: 'GOOGL',
        country: 'United States',
        relationshipType: 'CUSTOMER',
        productCategory: 'GCP GPU Instances & Gemini Research Accelerators',
        revenueExposurePercent: 11.0,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Menggabungkan GPU NVIDIA bersama TPU internal Google.',
      },
    ],
    partners: [
      {
        name: 'Super Micro Computer / Dell Technologies',
        country: 'United States',
        relationshipType: 'PARTNER',
        productCategory: 'OEM Server Integrators & Liquid Cooling',
        revenueExposurePercent: 20.0,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Mitra integrasi server enterprise ke data center korporasi.',
      },
    ],
  },
};

export function getSupplyChainData(symbol: string): StockSupplyChainData {
  const clean = symbol.toUpperCase().trim();
  if (BLOOMBERG_SUPPLY_CHAIN[clean]) {
    return BLOOMBERG_SUPPLY_CHAIN[clean];
  }
  // Generic fallback supply chain map
  return {
    symbol: clean,
    name: `${clean} Corporation`,
    sector: 'Industrial & Commercial Operations',
    focalSummary: `Pemain industri terintegrasi yang memproduksi barang dan jasa dengan jaringan rantai pasok domestik dan regional.`,
    overallSupplyRisk: 'MEDIUM',
    overallCustomerRisk: 'LOW',
    suppliers: [
      {
        name: 'Penyedia Bahan Baku & Komponen Utama',
        country: 'Indonesia',
        relationshipType: 'SUPPLIER',
        productCategory: 'Bahan Baku Manufaktur / Logistik',
        revenueExposurePercent: 25.0,
        dependencyRisk: 'MEDIUM',
        status: 'ACTIVE',
        notes: 'Memasok kebutuhan operasional harian pabrik dan fasilitas.',
      },
      {
        name: 'Penyedia Utilitas, Energi & Listrik (PLN / Pertamina)',
        country: 'Indonesia',
        relationshipType: 'SUPPLIER',
        productCategory: 'Energi Listrik & Bahan Bakar Industri',
        revenueExposurePercent: 8.5,
        dependencyRisk: 'LOW',
        status: 'STRATEGIC',
        notes: 'Pasokan listrik berkesinambungan untuk fasilitas produksi.',
      },
    ],
    customers: [
      {
        name: 'Jaringan Distributor & Ritel Nasional',
        country: 'Indonesia',
        relationshipType: 'CUSTOMER',
        productCategory: 'Saluran Distribusi Konsumen Akhir',
        revenueExposurePercent: 55.0,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Mendistribusikan produk ke gerai modern dan tradisional di seluruh Indonesia.',
      },
      {
        name: 'Klien Korporasi & Pengadaan B2B',
        country: 'Indonesia',
        relationshipType: 'CUSTOMER',
        productCategory: 'Kontrak Pasokan Jangka Panjang B2B',
        revenueExposurePercent: 35.0,
        dependencyRisk: 'LOW',
        status: 'ACTIVE',
        notes: 'Perjanjian kerjasama pengadaan tahunan dengan volume terjamin.',
      },
    ],
    partners: [
      {
        name: 'Mitra Pembiayaan & Bank Kustodian',
        country: 'Indonesia',
        relationshipType: 'PARTNER',
        productCategory: 'Fasilitas Kredit Modal Kerja & Sindikasi',
        revenueExposurePercent: 15.0,
        dependencyRisk: 'LOW',
        status: 'STRATEGIC',
        notes: 'Mendukung modal kerja dan ekspansi belanja modal (Capex).',
      },
    ],
  };
}
