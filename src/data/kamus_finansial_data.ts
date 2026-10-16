export interface KamusTerm {
  slug: string;
  term: string;
  shortDefinition: string; // Direct Answer for Google Featured Snippets
  fullExplanation: string;
  formula?: string;
  example: string;
  category: 'Valuasi & Fundamental' | 'Teknikal & Orderbook' | 'Aksi Korporasi' | 'Bandarmologi';
  actionPrompt: string;
}

export const KAMUS_TERMS: KamusTerm[] = [
  {
    slug: 'price-to-earnings-ratio-per',
    term: 'P/E Ratio (Price to Earnings Ratio)',
    shortDefinition: 'Price to Earnings Ratio (P/E Ratio atau PER) adalah rasio valuasi investasi yang membandingkan harga saham per lembar saat ini dengan laba bersih per saham (Earnings Per Share / EPS) tahunan.',
    fullExplanation: 'P/E Ratio digunakan investor untuk menilai apakah suatu saham tergolong mahal (overvalued) atau murah (undervalued) dibandingkan dengan kemampuan perusahaan dalam mencetak laba bersih, serta dibandingkan dengan rata-rata industri sejenis.',
    formula: 'PER = Harga Saham / Laba Bersih Per Lembar (EPS)',
    example: 'Jika harga saham BBCA adalah Rp 10.000 dan EPS tahunannya adalah Rp 500, maka P/E Ratio BBCA adalah 10.000 / 500 = 20x. Artinya, investor bersedia membayar 20 kali lipat dari laba tahunan perusahaan.',
    category: 'Valuasi & Fundamental',
    actionPrompt: 'Cek rasio PER seluruh emiten bursa di Screener Saham TradeSim Pro.',
  },
  {
    slug: 'price-to-book-value-pbv',
    term: 'PBV (Price to Book Value)',
    shortDefinition: 'Price to Book Value (PBV) adalah rasio valuasi saham yang membandingkan harga pasar saham dengan nilai buku ekuitas per lembar saham (Book Value per Share / BVPS).',
    fullExplanation: 'PBV menunjukkan berapa kali lipat harga saham diperdagangkan di atas nilai bersih aset perusahaan jika seluruh utang dilunasi. PBV di bawah 1.0x sering kali diindikasikan sebagai saham murah atau di bawah nilai likuidasinya.',
    formula: 'PBV = Harga Saham / Nilai Buku Per Lembar (Book Value)',
    example: 'Jika ekuitas per lembar saham BBRI bernilai Rp 2.000 dan harga pasarnya Rp 4.600, maka PBV BBRI adalah 4.600 / 2.000 = 2.3x.',
    category: 'Valuasi & Fundamental',
    actionPrompt: 'Gunakan filter PBV < 1.0x di menu Screener untuk mencari saham berharga diskon.',
  },
  {
    slug: 'dividen-payout-ratio-dpr',
    term: 'Dividend Payout Ratio (DPR)',
    shortDefinition: 'Dividend Payout Ratio (DPR) adalah persentase dari total laba bersih tahunan perusahaan yang dibagikan secara tunai kepada para pemegang saham sebagai dividen.',
    fullExplanation: 'Sisa laba yang tidak dibagikan sebagai dividen disebut laba ditahan (Retained Earnings) yang digunakan perusahaan untuk ekspansi bisnis, membayar utang, atau investasi baru.',
    formula: 'DPR (%) = (Total Dividen Tunai / Total Laba Bersih) x 100%',
    example: 'Jika BMRI membukukan laba Rp 55 Triliun dan membagikan dividen total Rp 33 Triliun, maka DPR BMRI adalah (33 / 55) x 100% = 60%.',
    category: 'Valuasi & Fundamental',
    actionPrompt: 'Hitung potensi pendapatan dividen Anda dengan Kalkulator Dividen TradeSim Pro.',
  },
  {
    slug: 'dividend-yield-saham',
    term: 'Dividend Yield (Imbal Hasil Dividen)',
    shortDefinition: 'Dividend Yield adalah persentase rasio imbal hasil dividen per lembar saham dibandingkan dengan harga beli pasar saham tersebut saat ini.',
    fullExplanation: 'Dividend yield mirip seperti suku bunga deposito perbankan. Semakin tinggi dividend yield, semakin besar arus kas tunai pasif yang diterima investor relatif terhadap modal yang diinvestasikan.',
    formula: 'Dividend Yield (%) = (Dividen Per Lembar / Harga Saham Saat Ini) x 100%',
    example: 'Jika saham PTBA membagikan dividen Rp 400 per lembar dan harga saham saat itu Rp 2.500, maka dividend yield-nya adalah (400 / 2.500) x 100% = 16% (sangat tinggi).',
    category: 'Valuasi & Fundamental',
    actionPrompt: 'Cari saham dengan yield dividen di atas 10% di Kalender Dividen TradeSim Pro.',
  },
  {
    slug: 'return-on-equity-roe',
    term: 'ROE (Return on Equity)',
    shortDefinition: 'Return on Equity (ROE) adalah rasio profitabilitas yang mengukur seberapa efisien manajemen perusahaan dalam menghasilkan laba bersih dari setiap rupiah modal ekuitas pemegang saham.',
    fullExplanation: 'Investor legendaris Warren Buffett mengutamakan emiten dengan ROE konsisten di atas 15%-20% selama minimal 5 tahun berturut-turut karena mencerminkan keunggulan bersaing (economic moat).',
    formula: 'ROE (%) = (Laba Bersih Setelah Pajak / Total Ekuitas) x 100%',
    example: 'Jika perusahaan memiliki ekuitas Rp 100 Miliar dan mencetak laba bersih Rp 25 Miliar, maka ROE-nya adalah 25%.',
    category: 'Valuasi & Fundamental',
    actionPrompt: 'Pantau ROE multi-tahun seluruh emiten di Tab Fundamental TradeSim Pro.',
  },
  {
    slug: 'auto-rejection-atas-bawah-ara-arb',
    term: 'ARA & ARB (Auto Rejection Atas & Bawah)',
    shortDefinition: 'Auto Rejection adalah batasan maksimal kenaikan (ARA) atau penurunan (ARB) harga saham dalam satu hari perdagangan di bursa efek untuk menjaga stabilitas pasar.',
    fullExplanation: 'Di Bursa Efek Indonesia (BEI), aturan batasan Auto Rejection Asimetris/Simetris bervariasi: Saham Rp 50 - Rp 200 batasnya 35%, saham Rp 200 - Rp 5.000 batasnya 25%, dan saham di atas Rp 5.000 batasnya 20%.',
    example: 'Jika saham BREN ditutup di Rp 6.000, maka batas ARA (naik maks 20%) adalah Rp 7.200, dan batas ARB (turun maks 20%) adalah Rp 4.800.',
    category: 'Teknikal & Orderbook',
    actionPrompt: 'Latih antisipasi pergerakan saham ARA/ARB di Terminal Simulator Realtime.',
  },
  {
    slug: 'right-issue-saham',
    term: 'Right Issue (Hak Memesan Efek Terlebih Dahulu / HMETD)',
    shortDefinition: 'Right Issue adalah aksi korporasi penerbitan saham baru oleh perusahaan terbuka dengan memberikan hak istimewa terlebih dahulu kepada pemegang saham lama untuk membelinya pada harga tebus tertentu.',
    fullExplanation: 'Tujuan Right Issue umumnya untuk menambah permodalan ekspansi bisnis atau pelunasan utang. Jika pemegang saham lama tidak menebus haknya (right), persentase kepemilikannya akan terdilusi (berkurang).',
    example: 'BBRI melakukan Right Issue pembentukan holding ultra mikro dengan rasio tertentu dan harga tebus diskon.',
    category: 'Aksi Korporasi',
    actionPrompt: 'Pantau pengumuman aksi korporasi terbaru di Kalender Makro & Corporate Action.',
  },
  {
    slug: 'stock-split',
    term: 'Stock Split (Pemecahan Nilai Saham)',
    shortDefinition: 'Stock Split adalah aksi korporasi pemecahan nilai nominal per lembar saham menjadi lebih kecil dengan rasio tertentu sehingga jumlah lembar saham bertambah banyak namun total nilai kapitalisasi pasar tetap sama.',
    fullExplanation: 'Stock split bertujuan agar harga per lembar saham menjadi lebih terjangkau bagi investor ritel, sehingga likuiditas perdagangan saham di bursa meningkat secara signifikan.',
    example: 'BBCA melakukan stock split dengan rasio 1:5, di mana harga saham dari Rp 35.000 per lembar dipecah menjadi Rp 7.000 per lembar, dan jumlah saham yang dimiliki investor bertambah 5 kali lipat.',
    category: 'Aksi Korporasi',
    actionPrompt: 'Lihat simulasi efek stock split pada grafik historis saham di TradeSim Pro.',
  },
  {
    slug: 'cut-loss-dan-take-profit',
    term: 'Cut Loss & Take Profit (CL & TP)',
    shortDefinition: 'Cut Loss adalah tindakan menjual saham saat posisi merugi untuk membatasi risiko kerugian lebih lanjut, sedangkan Take Profit adalah menjual saham saat posisi untung untuk mengunci profit yang telah diraih.',
    fullExplanation: 'Disiplin Cut Loss adalah pilar utama bertahan hidup dalam dunia trading pasar finansial. Trader profesional selalu memasang batas stop loss maksimal 2% - 5% dari modal portofolio.',
    example: 'Membeli saham ASII di harga Rp 5.000 dengan Take Profit di Rp 5.500 (+10%) dan Cut Loss di Rp 4.800 (-4%). Jika harga menyentuh Rp 4.800, posisi langsung dilikuidasi.',
    category: 'Teknikal & Orderbook',
    actionPrompt: 'Gunakan fitur Auto TP/SL di Order Execution Desk TradeSim Pro.',
  },
  {
    slug: 'market-capitalization-market-cap',
    term: 'Market Cap (Kapitalisasi Pasar)',
    shortDefinition: 'Market Cap adalah total nilai pasar agregat dari seluruh lembar saham yang diterbitkan dan beredar dari suatu perusahaan terbuka.',
    fullExplanation: 'Di bursa efek, saham dikelompokkan berdasarkan ukuran Market Cap: First Liner / Blue Chip (> Rp 100 Triliun), Mid Cap / Second Liner (Rp 5 Triliun - Rp 100 Triliun), dan Small Cap / Third Liner (< Rp 5 Triliun).',
    formula: 'Market Cap = Harga Saham Per Lembar x Jumlah Lembar Saham Beredar',
    example: 'BBCA memiliki lebih dari 123 miliar lembar saham. Pada harga Rp 10.000, market cap BBCA adalah sekitar Rp 1.230 Triliun (terbesar di Indonesia).',
    category: 'Valuasi & Fundamental',
    actionPrompt: 'Lihat peta visual ukuran market cap seluruh sektor di Heatmap Sektoral IHSG.',
  },
  {
    slug: 'rekening-dana-nasabah-rdn',
    term: 'RDN (Rekening Dana Nasabah)',
    shortDefinition: 'Rekening Dana Nasabah (RDN) adalah rekening bank khusus atas nama investor sendiri yang terdaftar resmi di KSEI dan sekuritas, digunakan secara eksklusif untuk menampung dana transaksi jual beli efek di bursa.',
    fullExplanation: 'Dana di RDN tidak disimpan oleh sekuritas atau broker, melainkan disimpan aman di bank kustodian resmi yang diawasi OJK (Otoritas Jasa Keuangan), sehingga terlindungi dari risiko penyalahgunaan.',
    example: 'Sebelum membeli saham di sekuritas, nasabah mentransfer modal uang ke nomor RDN pribadinya terlebih dahulu.',
    category: 'Valuasi & Fundamental',
    actionPrompt: 'Dapatkan saldo virtual gratis Rp 50 Juta di RDN TradeSim Pro untuk latihan.',
  },
  {
    slug: 'smart-money-bandarmologi',
    term: 'Smart Money (Bandar / Institusi Besar)',
    shortDefinition: 'Smart Money merujuk pada modal raksasa yang dikelola oleh manajer investasi profesional, konglomerat, institusi dana pensiun, atau market maker yang memiliki kekuatan menggerakkan arah tren harga pasar.',
    fullExplanation: 'Analis teknikal dan bandarmologi menggunakan pelacakan volume transaksi dan broker summary untuk mendeteksi kapan Smart Money mulai masuk mengumpulkan barang (akumulasi) dan kapan mereka mulai keluar (distribusi).',
    example: 'Pembelian masif asing (Net Foreign Buy) puluhan miliar per hari pada saham perbankan menunjukkan kehadiran smart money institusional.',
    category: 'Bandarmologi',
    actionPrompt: 'Deteksi radar akumulasi smart money real-time di Radar Bandarmologi TradeSim Pro.',
  },
];
