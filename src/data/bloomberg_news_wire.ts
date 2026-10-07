// Bloomberg Terminal Real-Time News Wire Master Dataset
// Standards: Bloomberg Professional Service (TOP <GO>, WIRE <GO>, BFW <GO>)

export interface BloombergStory {
  id: string;
  wireCode: string; // e.g. "BN 14:52", "BFW 14:38", "RTRS 14:15", "DJNW 13:50"
  time: string; // HH:mm
  relativeTime: string; // e.g. "2m lalu", "14m lalu"
  publishedAt: string; // Exact timestamp
  urgency: 'FLASH' | 'BFW' | 'DISCLOSURE' | 'MOVER' | 'MACRO';
  headline: string;
  tickers: string[];
  primaryTicker: string;
  country: 'ID' | 'US' | 'GLOBAL' | 'EU' | 'ASIA';
  flag: string;
  category: 'Macro & Moneter' | 'Earnings & Dividen' | 'Korporasi & M&A' | 'Tech & AI' | 'Komoditas & Energi';
  source: 'BLOOMBERG NEWS' | 'BLOOMBERG FIRST WORD' | 'REUTERS WIRE' | 'DOW JONES NEWS' | 'BEI DISCLOSURE' | 'SEC EDGAR';
  byline: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore: number; // -100 to +100
  takeaways: string[];
  body: string[];
  marketImpact: string;
}

export const BLOOMBERG_NEWS_WIRE: BloombergStory[] = [
  // ── 1. FLASH / BREAKING STORIES ───────────────────────────────────────────
  {
    id: 'bn-2026-001',
    wireCode: 'BN 14:58',
    time: '14:58',
    relativeTime: '2m lalu',
    publishedAt: '2026-10-03 14:58:24 WIB',
    urgency: 'FLASH',
    headline: 'Bank Mandiri (BMRI) Cum-Date Dividen Tunai Jumbo Rp 353,95/Saham Hari Ini; Volume Transaksi Melejit +84% di Pasar Reguler',
    tickers: ['BMRI', 'IHSG'],
    primaryTicker: 'BMRI',
    country: 'ID',
    flag: '🇮🇩',
    category: 'Earnings & Dividen',
    source: 'BLOOMBERG NEWS',
    byline: 'Ferry Sandi & Harry Suhartono, Bloomberg Jakarta Equities Desk',
    sentiment: 'BULLISH',
    sentimentScore: 92,
    takeaways: [
      'Total dividen yang dibagikan mencapai Rp 33,03 Triliun (Dividend Payout Ratio 60% dari Laba Bersih FY2025).',
      'Cum-Date pasar reguler dan negosiasi jatuh pada perdagangan hari ini (Jumat), investor berhak menerima yield ~5.02%.',
      'Arus dana asing (foreign net buy) tercatat masuk sebesar Rp 482,5 Miliar khusus di saham BMRI hingga sesi II.',
      'Rasio permodalan CAR pasca-dividen tetap kokoh di level 19,8%, didukung pertumbuhan kredit korporasi +14,8% YoY.'
    ],
    body: [
      'JAKARTA (Bloomberg) — Perdagangan saham PT Bank Mandiri (Persero) Tbk (BMRI.JK) memimpin likuiditas pasar modal domestik seiring batas akhir perdagangan dengan hak dividen (cum-date) di pasar reguler dan negosiasi hari ini.',
      'Dengan dividend per share (DPS) sebesar Rp 353,95 per lembar, emiten perbankan BUMN terbesar dari sisi aset ini membukukan yield sekitar 5,02% pada harga penutupan Rp 7.050. Total pembayaran dividen yang disetujui RUPS mencapai Rp 33,03 Triliun, di mana porsi kas negara mencapai lebih dari Rp 17 Triliun.',
      'Kepala Riset Mandiri Sekuritas menyatakan likuiditas dividend trap berpotensi tertahan mengingat pertumbuhan laba bersih tahun berjalan yang solid dan margin bunga bersih (NIM) yang stabil di kisaran 5,1%.'
    ],
    marketImpact: 'Bullish katalis bagi IHSG; Menopang indeks LQ45 menguat +1.02% dengan net foreign inflow perbankan.'
  },
  {
    id: 'bn-2026-002',
    wireCode: 'BN 14:45',
    time: '14:45',
    relativeTime: '15m lalu',
    publishedAt: '2026-10-03 14:45:10 WIB',
    urgency: 'FLASH',
    headline: 'NVIDIA (NVDA) Blackwell Ultra B200 Yield Tembus 94%; Kontrak Pengadaan CSP Tembus $45 Miliar di Q4',
    tickers: ['NVDA', 'TSM', 'MSFT', 'GOOGL'],
    primaryTicker: 'NVDA',
    country: 'US',
    flag: '🇺🇸',
    category: 'Tech & AI',
    source: 'BLOOMBERG NEWS',
    byline: 'Ian King & Debby Wu, Bloomberg San Francisco & Taipei Tech Wire',
    sentiment: 'BULLISH',
    sentimentScore: 95,
    takeaways: [
      'Proses packaging CoWoS-L TSMC berhasil mengatasi bottleneck termal awal dengan efisiensi yield 94%.',
      'Microsoft Azure, Amazon AWS, dan Meta Platforms meningkatkan komitmen belanja modal (CapEx) datacenter AI.',
      'Margin kotor (Gross Margin) NVIDIA diproyeksikan bertahan di level premium 75,5% - 76,0%.',
      'Target konsensus analis Wall Street naik dari $150 ke median $175 per lembar.'
    ],
    body: [
      'SANTA CLARA (Bloomberg) — NVIDIA Corp (NVDA) mengonfirmasi akselerasi produksi massal akselerator komputasi generasi terbaru Blackwell B200 dan GB200 NVL72, dengan tingkat yield fungsional wafer TSMC mencapai efisiensi tertinggi.',
      'Menurut memo rantai pasok semikonduktor Asia, alokasi kapasitas CoWoS hingga kuartal pertama 2027 telah sepenuhnya terpesan oleh hyperscalers. Kemitraan strategis dengan TSMC dan Foxconn memastikan pengiriman rack server komputasi AI berjalan tanpa kendala logistik.',
      'Saham NVDA naik +2,4% pada sesi pre-market New York, mendorong reli indeks NASDAQ Futures dan saham semikonduktor global.'
    ],
    marketImpact: 'Mendorong kenaikan saham semikonduktor global (TSMC, ASML, AMD) dan menaikkan optimisme sektor teknologi.'
  },
  {
    id: 'bn-2026-003',
    wireCode: 'BN 14:32',
    time: '14:32',
    relativeTime: '28m lalu',
    publishedAt: '2026-10-03 14:32:05 WIB',
    urgency: 'BFW',
    headline: 'Bank Indonesia Tegaskan BI-Rate 6,00% Bertahan; Operasi Moneter DNDF Siap Redam Volatilitas Nilai Tukar Rupiah',
    tickers: ['IHSG', 'BBCA', 'BMRI', 'USDIDR'],
    primaryTicker: 'IHSG',
    country: 'ID',
    flag: '🇮🇩',
    category: 'Macro & Moneter',
    source: 'BLOOMBERG FIRST WORD',
    byline: 'Grace Sihombing, Bloomberg Jakarta Economics Bureau',
    sentiment: 'NEUTRAL',
    sentimentScore: 40,
    takeaways: [
      'RDG Bank Indonesia mempertahankan BI-Rate pada 6,00%, Deposit Facility 5,25%, dan Lending Facility 6,75%.',
      'Fokus kebijakan jangka pendek terpusat pada pro-stability untuk menjaga kurs Rupiah di bawah Rp 15.500 per Dolar AS.',
      'Instrumen Sekuritas Rupiah Bank Indonesia (SRBI) terus menarik arus modal asing dengan outstanding melampaui Rp 900 Triliun.',
      'Pertumbuhan kredit perbankan nasional diproyeksikan tetap kuat di kisaran 10% - 12% pada 2026.'
    ],
    body: [
      'JAKARTA (Bloomberg First Word) — Gubernur Bank Indonesia Perry Warjiyo menyatakan bahwa kebijakan suku bunga acuan saat ini konsisten dengan sasaran inflasi 2,5±1% dan penguatan stabilitas nilai tukar Rupiah dari tekanan penguatan indeks Dolar (DXY).',
      '"Bank Indonesia terus mengoptimalkan bauran moneter termasuk intervensi pasar spot, forward valas domestik (DNDF), dan pembelian SBN di pasar sekunder untuk mengarahkan yield obligasi pemerintah tetap atraktif bagi investor global," ujar Perry.',
      'Pasar obligasi domestik merespons positif dengan yield SBN 10-tahun bertahan stabil di kisaran 6,72%.'
    ],
    marketImpact: 'Memberikan kepastian bagi sektor perbankan dan obligasi; Rupiah terapresiasi 35 poin ke level Rp 15.485/USD.'
  },

  // ── 2. GLOBAL & FOREIGN DIVIDEND BLUE CHIPS ───────────────────────────────
  {
    id: 'bn-2026-004',
    wireCode: 'BFW 14:15',
    time: '14:15',
    relativeTime: '45m lalu',
    publishedAt: '2026-10-03 14:15:40 WIB',
    urgency: 'DISCLOSURE',
    headline: 'Coca-Cola (KO) Umumkan Kenaikan Dividen Tahunan ke-63 Berturut-turut; Arus Kas Operasional Naik +9% Menjadi $12,4 Miliar',
    tickers: ['KO', 'PEP'],
    primaryTicker: 'KO',
    country: 'US',
    flag: '🇺🇸',
    category: 'Earnings & Dividen',
    source: 'BLOOMBERG NEWS',
    byline: 'Daniela Sirtori-Cortina, Bloomberg Atlanta Consumer Wire',
    sentiment: 'BULLISH',
    sentimentScore: 88,
    takeaways: [
      'Dividen kuartalan dinaikkan menjadi $0,485 per saham (setara $1,94/tahun), melanjutkan status Dividend King 63 tahun berturut-turut.',
      'Pertumbuhan penjualan organik global tumbuh +10%, ditopang resep Zero Sugar dan penetrasi pasar berkembang Asia-Pasifik.',
      'Free Cash Flow (FCF) yang kuat memungkinkan pembagian dividen berkelanjutan dan program buyback saham senilai $1 Miliar.',
      'Saham KO diperdagangkan pada yield dividen 2,83% dengan beta defensif 0,55.'
    ],
    body: [
      'ATLANTA (Bloomberg) — The Coca-Cola Company (NYSE: KO) menegaskan statusnya sebagai salah satu pilar dividen paling konsisten di dunia dengan mengumumkan peningkatan dividen tahunan untuk ke-63 tahun tanpa henti.',
      'Perusahaan raksasa minuman non-alkohol yang menjadi portofolio inti Berkshire Hathaway milik Warren Buffett ini membukukan ketahanan daya beli konsumen global di tengah inflasi. CEO James Quincey menyebut investasi inovasi kemasan dan efisiensi rantai distribusi membuahkan ekspansi margin operasi menjadi 29,3%.'
    ],
    marketImpact: 'Saham defensif global menguat; Pilihan utama dana pensiun dan investor jangka panjang berorientasi dividen.'
  },
  {
    id: 'bn-2026-005',
    wireCode: 'BN 13:58',
    time: '13:58',
    relativeTime: '1j lalu',
    publishedAt: '2026-10-03 13:58:12 WIB',
    urgency: 'DISCLOSURE',
    headline: 'Realty Income (O) Salurkan Dividen Bulanan ke-652 Berturut-turut; Okupansi Portofolio Properti Komersial Bertahan di 98,7%',
    tickers: ['O', 'MAIN'],
    primaryTicker: 'O',
    country: 'US',
    flag: '🇺🇸',
    category: 'Earnings & Dividen',
    source: 'SEC EDGAR',
    byline: 'Patrick Clark, Bloomberg Real Estate & REIT Desk',
    sentiment: 'BULLISH',
    sentimentScore: 85,
    takeaways: [
      'Realty Income membayarkan dividen bulanan $0,2635 per saham, menghasilkan Dividend Yield tahunan 5,41%.',
      'Portofolio mencakup lebih dari 15.400 properti komersial dengan penyewa korporasi papan atas (Walgreens, 7-Eleven, FedEx).',
      'Tingkat pengumpulan sewa (Rent Collection Rate) mencapai 99,8% dengan rata-rata sisa masa kontrak sewa 9,4 tahun.',
      'Kenaikan dividen bulanan telah berlangsung selama 108 kuartal berturut-turut.'
    ],
    body: [
      'SAN DIEGO (Bloomberg) — "The Monthly Dividend Company" Realty Income Corp (NYSE: O) secara resmi merilis pengumuman dividen bulanan ke-652. Emiten real estate investment trust (REIT) anggota S&P 500 ini terus menjadi benchmark instrumen pendapatan pasif global.',
      'Manajemen mencatat model sewa triple-net lease (NNN) melindungi perseroan dari eskalasi biaya operasional properti, pajak bumi, dan asuransi karena seluruhnya ditanggung oleh penyewa.'
    ],
    marketImpact: 'Menarik minat investor ritel dan institusi pencari cash-flow bulanan yang stabil tanpa risiko operasional langsung.'
  },
  {
    id: 'bn-2026-006',
    wireCode: 'RTRS 13:40',
    time: '13:40',
    relativeTime: '1.2j lalu',
    publishedAt: '2026-10-03 13:40:55 WIB',
    urgency: 'MOVER',
    headline: 'Mercedes-Benz Group (MBG.DE) Pertahankan Komitmen Dividend Payout 40% Menghasilkan Yield 7,45% Ditopang Segmen Top-End Luxury',
    tickers: ['MBG.DE', '7203.T'],
    primaryTicker: 'MBG.DE',
    country: 'EU',
    flag: '🇩🇪',
    category: 'Earnings & Dividen',
    source: 'REUTERS WIRE',
    byline: 'William Wilkes & Christoph Rauwald, Reuters Frankfurt Automotive Bureau',
    sentiment: 'BULLISH',
    sentimentScore: 82,
    takeaways: [
      'Mercedes-Benz membagikan dividen tunai tahunan €5,30 per saham, menawarkan yield tinggi sebesar 7,45%.',
      'Penjualan segmen Maybach, AMG, dan G-Class menghasilkan margin EBITDA 13,2% mengompensasi persaingan EV di pasar Tiongkok.',
      'Perseroan merampungkan program buyback saham senilai €3 Miliar untuk memaksimalkan laba per saham (EPS).',
      'Neraca kas industri bebas utang (Net Industrial Liquidity) mencapai €31,7 Miliar.'
    ],
    body: [
      'STUTTGART (Reuters) — Pabrikan otomotif premium Jerman Mercedes-Benz Group AG menegaskan kembali komitmen pengembalian modal kepada para pemegang saham melalui dividen tinggi dan pembelian kembali saham di bursa XETRA Frankfurt.',
      'Meskipun industri otomotif Eropa menghadapi transisi elektrifikasi dan tarif impor Uni Eropa, arus kas bebas (Free Cash Flow) bisnis otomotif Mercedes-Benz melampaui estimasi analis sebesar €11,3 Miliar.'
    ],
    marketImpact: 'Saham otomotif Eropa menguat; Investor dividen global mengapresiasi neraca kas bersih produsen mewah Jerman.'
  },

  // ── 3. DOMESTIC IDX BLUE CHIPS & CORPORATE ACTIONS ────────────────────────
  {
    id: 'bn-2026-007',
    wireCode: 'BN 13:25',
    time: '13:25',
    relativeTime: '1.5j lalu',
    publishedAt: '2026-10-03 13:25:18 WIB',
    urgency: 'DISCLOSURE',
    headline: 'Adaro Energy (ADRO) Jadwalkan RUPSLB Tuntaskan Spin-Off Bisnis Batubara Termal AAI & Persiapkan Dividen Spesial Tunai',
    tickers: ['ADRO', 'AADI'],
    primaryTicker: 'ADRO',
    country: 'ID',
    flag: '🇮🇩',
    category: 'Korporasi & M&A',
    source: 'BEI DISCLOSURE',
    byline: 'Fathiya Dahrul, Bloomberg Jakarta Energy Desk',
    sentiment: 'BULLISH',
    sentimentScore: 90,
    takeaways: [
      'Pemisahan (spin-off) Adaro Andalan Indonesia (AAI) bertujuan mempercepat dekarbonisasi dan valuasi hijau Adaro Minerals (ADMR).',
      'Pemegang saham tercatat ADRO berpeluang mendapatkan hak dividen spesial tunai sebelum pencatatan saham AAI.',
      'Cadangan kas konsolidasi ADRO tercatat sangat likuid di level $3,1 Miliar tanpa beban utang jangka pendek yang mendesak.',
      'Analis memproyeksikan potensi yield dividen kumulatif ADRO tetap berada di atas 14% - 16%.'
    ],
    body: [
      'JAKARTA (Bloomberg) — PT Adaro Energy Indonesia Tbk (ADRO.JK) merilis prospektus keterbukaan informasi rencana RUPS Luar Biasa guna memuluskan divestasi dan pemisahan lini bisnis batubara termal melalui PT Adaro Andalan Indonesia (AAI).',
      'Langkah korporasi ini dinilai strategis oleh para analis karena akan membuka diskon valuasi holding konglomerasi energi, memungkinkan investor institusi berbasis ESG untuk masuk kembali ke entitas hijau Adaro yang membawahi smelter aluminium di Kalimantan Utara.'
    ],
    marketImpact: 'Saham ADRO melonjak +2,8% ke Rp 3.840; Volume transaksi meningkat tajam didominasi broker asing ZP dan BK.'
  },
  {
    id: 'bn-2026-008',
    wireCode: 'BFW 13:05',
    time: '13:05',
    relativeTime: '1.8j lalu',
    publishedAt: '2026-10-03 13:05:40 WIB',
    urgency: 'MOVER',
    headline: 'Bank Central Asia (BBCA) Catat Laba Bersih 9M Tumbuh +13,8% Menjadi Rp 41,2 Triliun; Rasio Dana Murah (CASA) Capai Rekor 82,6%',
    tickers: ['BBCA', 'IHSG'],
    primaryTicker: 'BBCA',
    country: 'ID',
    flag: '🇮🇩',
    category: 'Earnings & Dividen',
    source: 'BLOOMBERG FIRST WORD',
    byline: 'Harry Suhartono, Bloomberg Jakarta Banking Specialist',
    sentiment: 'BULLISH',
    sentimentScore: 94,
    takeaways: [
      'Kredit konsumer dan korporasi tumbuh +14,5% YoY ditopang kredit pemilikan rumah (KPR) dan pembiayaan modal kerja korporat.',
      'Cost of Funds (CoF) berhasil ditekan pada level terendah industri 1,9% berkat basis dana tabungan dan giro yang mendominasi.',
      'Rasio Non-Performing Loan (NPL) gross terjaga sangat sehat di 1,9% dengan coverage rasio pencadangan mencapai 232%.',
      'Target dividen interim tahun buku berjalan diestimasi diumumkan pada kuartal IV dengan rasio pembayaran ~60%.'
    ],
    body: [
      'JAKARTA (Bloomberg First Word) — PT Bank Central Asia Tbk (BBCA.JK), bank swasta dengan kapitalisasi pasar terbesar di Asia Tenggara, membukukan kinerja keuangan 9 bulan pertama yang melampaui konsensus pasar.',
      'Direktur Keuangan BCA menyatakan efisiensi operasional terdorong oleh penetrasi transaksi digital myBCA dan KlikBCA yang mencatat frekuensi lebih dari 33 miliar transaksi, memberikan kontribusi pendapatan berbasis komisi (Fee-Based Income) sebesar Rp 16,8 Triliun.'
    ],
    marketImpact: 'Saham BBCA dibeli asing Rp 215,3 Miliar, menembus resistance psikologis Rp 10.500 dengan volume solid.'
  },
  {
    id: 'bn-2026-009',
    wireCode: 'DJNW 12:45',
    time: '12:45',
    relativeTime: '2.1j lalu',
    publishedAt: '2026-10-03 12:45:22 WIB',
    urgency: 'MOVER',
    headline: 'Astra International (ASII) Bukukan Kenaikan Pangsa Pasar Otomotif Menjadi 56%; Segmen Mobil Hybrid Naik Tiga Digit',
    tickers: ['ASII', 'UNTR'],
    primaryTicker: 'ASII',
    country: 'ID',
    flag: '🇮🇩',
    category: 'Korporasi & M&A',
    source: 'DOW JONES NEWS',
    byline: 'Dow Jones Automotive News Desk',
    sentiment: 'BULLISH',
    sentimentScore: 84,
    takeaways: [
      'Pangsa pasar mobil nasional Astra naik menjadi 56% didorong tingginya animo keluarga muda terhadap model Innova Zenix dan Yaris Cross Hybrid.',
      'Anak usaha PT United Tractors Tbk (UNTR) menyumbang diversifikasi pendapatan kuat melalui komoditas emas dan jasa penambangan nikel.',
      'Dividen interim ASII dijadwalkan dibayarkan Oktober sebesar Rp 98 per lembar saham.',
      'Valuasi PER tercatat atraktif di level 6,9x dibandingkan rata-rata historis 5 tahun di 9,2x.'
    ],
    body: [
      'JAKARTA (Dow Jones) — PT Astra International Tbk (ASII.JK) melaporkan ketahanan dominasi pangsa pasar kendaraan roda empat di Indonesia di tengah penetrasi agresif merek kendaraan listrik baru asal Tiongkok.',
      'Kekuatan jaringan purna jual 3S (Sales, Service, Spare parts), nilai jual kembali kendaraan bekas yang tinggi, dan pembiayaan terintegrasi melalui Astra Financial menjadi parit ekonomi (economic moat) yang kokoh bagi grup konglomerasi ini.'
    ],
    marketImpact: 'Akumulasi investor domestik dan asing; Broker CS dan ZP mencatat net buy Rp 142,1 Miliar.'
  },

  // ── 4. COMMODITIES & GLOBAL MACRO ─────────────────────────────────────────
  {
    id: 'bn-2026-010',
    wireCode: 'BN 12:15',
    time: '12:15',
    relativeTime: '2.6j lalu',
    publishedAt: '2026-10-03 12:15:00 WIB',
    urgency: 'MACRO',
    headline: 'Harga Emas Dunia Tembus All-Time High $2.665/oz; Cadangan Emas Bank Sentral Global Bertambah 480 Ton',
    tickers: ['ANTM', 'BRMS', 'MDKA'],
    primaryTicker: 'ANTM',
    country: 'GLOBAL',
    flag: '🌍',
    category: 'Komoditas & Energi',
    source: 'BLOOMBERG NEWS',
    byline: 'Yvonne Yue Li & Jack Farchy, Bloomberg Metals Desk London & New York',
    sentiment: 'BULLISH',
    sentimentScore: 91,
    takeaways: [
      'Spot Gold menembus rekor baru $2.665 per troy ounce seiring ekspektasi pemotongan suku bunga Fed dan eskalasi ketegangan Timur Tengah.',
      'Bank sentral People\'s Bank of China (PBOC) dan Reserve Bank of India (RBI) melanjutkan diversifikasi cadangan devisa non-dolar.',
      'Produsen emas domestik PT Aneka Tambang Tbk (ANTM) dan PT Merdeka Copper Gold Tbk (MDKA) menikmati ekspansi margin windfall.',
      'Penjualan emas batangan ritel Logam Mulia Antam mencatatkan antrean rekor di berbagai butik kota besar.'
    ],
    body: [
      'LONDON (Bloomberg) — Reli harga emas tanpa henti terus mencetak rekor baru sepanjang masa didorong kombinasi pemangkasan suku bunga perbankan global, pembelian masif bank sentral negara berkembang, dan permintaan safe-haven geopolitik.',
      'Kenaikan harga jual rata-rata (ASP) emas di atas Rp 1,45 juta per gram memberikan katalis laba bersih yang luar biasa bagi emiten tambang BUMN Aneka Tambang (ANTM) yang memproyeksikan EBITDA segmen mulia tumbuh lebih dari 35% YoY.'
    ],
    marketImpact: 'Saham tambang emas (ANTM, BRMS, MDKA) melesat dengan volume transaksi tinggi di bursa BEI.'
  },
  {
    id: 'bn-2026-011',
    wireCode: 'BN 11:40',
    time: '11:40',
    relativeTime: '3.2j lalu',
    publishedAt: '2026-10-03 11:40:15 WIB',
    urgency: 'MACRO',
    headline: 'Minyak Mentah Brent Naik +4,1% ke $77,6/Bbl Usai OPEC+ Sepakat Tunda Kenaikan Kuota Produksi Selama Dua Bulan',
    tickers: ['MEDC', 'PGAS', 'XOM', 'SHEL.L'],
    primaryTicker: 'MEDC',
    country: 'GLOBAL',
    flag: '🌍',
    category: 'Komoditas & Energi',
    source: 'BLOOMBERG NEWS',
    byline: 'Grant Smith & Salma El Wardany, Bloomberg Energy Wire Vienna',
    sentiment: 'BULLISH',
    sentimentScore: 86,
    takeaways: [
      'Delapan negara anggota aliansi OPEC+ sepakat mempertahankan pemangkasan produksi sukarela 2,2 juta barel per hari hingga akhir November.',
      'Premi risiko geopolitik di Selat Hormuz memicu penutupan posisi short penjual kontrak berjangka ICE Brent dan NYMEX WTI.',
      'Emiten migas swasta terintegrasi PT Medco Energi Internasional Tbk (MEDC) mendapatkan momentum kenaikan harga realisasi minyak dan gas bumi.',
      'Exxon Mobil (XOM) dan Shell plc (SHEL.L) memperkuat arus kas operasi hulu untuk mendukung dividen kuartalan.'
    ],
    body: [
      'WINA (Bloomberg) — Aliansi produsen minyak bumi OPEC+ memutuskan untuk menunda pemulihan produksi yang semula direncanakan bulan ini setelah harga minyak sempat tertekan oleh proyeksi permintaan Tiongkok yang melambat.',
      'Keputusan ini memicu lonjakan harga minyak global ke atas $77 per barel, memberi angin segar bagi emiten eksplorasi energi di Asia Pasifik.'
    ],
    marketImpact: 'Katalis positif bagi saham migas dan jasa perminyakan; Saham MEDC naik +3,6% dan PGAS naik +1,9%.'
  },
  {
    id: 'bn-2026-012',
    wireCode: 'BFW 11:10',
    time: '11:10',
    relativeTime: '3.7j lalu',
    publishedAt: '2026-10-03 11:10:05 WIB',
    urgency: 'MOVER',
    headline: 'TSMC (TSM) Laporkan Utilisasi Fabrikasi 3nm & 2nm Capai 100%; Apple dan NVIDIA Amankan Seluruh Alokasi Kuota Hingga 2027',
    tickers: ['TSM', 'AAPL', 'NVDA'],
    primaryTicker: 'TSM',
    country: 'ASIA',
    flag: '🇹🇼',
    category: 'Tech & AI',
    source: 'BLOOMBERG FIRST WORD',
    byline: 'Debby Wu, Bloomberg Taipei Semiconductor Wire',
    sentiment: 'BULLISH',
    sentimentScore: 93,
    takeaways: [
      'Taiwan Semiconductor Manufacturing Co. (TSMC) mencatatkan lonjakan pesanan chip komputasi AI lanjutan N3P dan N2.',
      'Pendapatan kuartalan diproyeksikan melesat +32% YoY melampaui batas atas estimasi analis Wall Street.',
      'Dividen kuartalan dinaikkan menjadi NT$4,00 per saham seiring Free Cash Flow yang terus membesar.',
      'Pembangunan pabrik fabrikasi di Arizona (AS) dan Kumamoto (Jepang) berjalan sesuai jadwal komersial.'
    ],
    body: [
      'TAIPEI (Bloomberg First Word) — TSMC, produsen chip kontrak tercanggih di dunia, mengukuhkan posisinya sebagai tulang punggung revolusi kecerdasan buatan global dengan kapasitas lini produksi node terdepan yang terpesan penuh.',
      'Peluncuran prosesor M4 dan A18 Pro milik Apple serta chip Blackwell Ultra NVIDIA memastikan margin kotor TSMC tetap kokoh di level 54% kendati biaya depresiasi mesin lithography EUV generasi baru meningkat.'
    ],
    marketImpact: 'Saham TSM melonjak di bursa Taipei dan ADR New York; Memperkuat siklus super semikonduktor.'
  }
];

// Helper to filter news wire by category, ticker, or urgency
export function filterBloombergNews({
  category,
  ticker,
  urgency,
  searchQuery,
}: {
  category?: string;
  ticker?: string;
  urgency?: string;
  searchQuery?: string;
}) {
  return BLOOMBERG_NEWS_WIRE.filter((story) => {
    if (category && category !== 'ALL') {
      if (category === 'BREAKING' && story.urgency !== 'FLASH') return false;
      if (category === 'DIVIDEND' && story.category !== 'Earnings & Dividen') return false;
      if (category === 'TECH' && story.category !== 'Tech & AI') return false;
      if (category === 'MACRO' && story.category !== 'Macro & Moneter') return false;
      if (category === 'COMMODITY' && story.category !== 'Komoditas & Energi') return false;
      if (category === 'ID' && story.country !== 'ID') return false;
      if (category === 'GLOBAL' && story.country === 'ID') return false;
    }

    if (ticker && ticker !== 'ALL') {
      const matchTicker = story.tickers.some((t) => t.toUpperCase() === ticker.toUpperCase()) ||
        story.primaryTicker.toUpperCase() === ticker.toUpperCase();
      if (!matchTicker) return false;
    }

    if (urgency && urgency !== 'ALL' && story.urgency !== urgency) {
      return false;
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        story.headline.toLowerCase().includes(q) ||
        story.byline.toLowerCase().includes(q) ||
        story.takeaways.some((t) => t.toLowerCase().includes(q)) ||
        story.tickers.some((t) => t.toLowerCase().includes(q)) ||
        story.source.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}
