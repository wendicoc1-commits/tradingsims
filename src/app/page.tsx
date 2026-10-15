import TradeSimLandingPage from '@/components/landing/TradeSimLandingPage';
import GeoStructuredData from '@/components/seo/GeoStructuredData';

export default function HomePage() {
  return (
    <>
      {/* ── Generative Engine Optimization (GEO) & LLM Knowledge Graph ── */}
      <GeoStructuredData />

      {/* ── Semantic SEO & Structured Crawlable Content for Search Engines & LLMs ── */}
      <section className="sr-only" aria-label="TradeSim Pro Platform Overview & Directory">
        <h2>TradeSim Pro: Platform Trading Simulator Saham IDX &amp; Crypto Indonesia #1</h2>
        <p>
          TradeSim Pro adalah platform institusional paper trading dan simulator investasi saham Indonesia (BEI / IDX), US Tech Stocks (NASDAQ), dan crypto spot 24/7 dengan data pasar real-time,
          analisis teknikal candlestick, radar bandarmologi broker summary, orderbook Level 2, serta ekosistem AI autonomous portfolio agent terdepan di Indonesia. Dapatkan modal virtual gratis Rp 50.000.000 atau $100.000 USD untuk latihan tanpa risiko finansial nyata.
        </p>

        <h3>Navigasi Cepat Fitur Trading Simulator</h3>
        <nav aria-label="Akses Cepat Fitur Simulator">
          <ul>
            <li><a href="/terminal">Buka Workstation Terminal Fincept</a></li>
            <li><a href="/markets">Peta Pasar &amp; Sektoral IHSG</a></li>
            <li><a href="/crypto">Simulator Trading Crypto 24/7 (BTC, ETH, SOL)</a></li>
            <li><a href="/portfolio">Portofolio Investasi &amp; Saldo Kas Virtual RDN</a></li>
            <li><a href="/screener">Screener Saham &amp; Filter Fundamental</a></li>
            <li><a href="/dividend">Radar Kalender Dividen Emiten BEI</a></li>
            <li><a href="/championship">Turnamen Liga Trading Simulator Berhadiah</a></li>
            <li><a href="/bandar">Radar Aliran Dana Bandarmologi Asing &amp; Broker Summary</a></li>
            <li><a href="/compare">Komparasi Valuasi Saham</a></li>
            <li><a href="/heatmap">Heatmap Pasar Saham Indonesia</a></li>
          </ul>
        </nav>

        <h3>Kalkulator Finansial &amp; Tools Investasi Saham</h3>
        <nav aria-label="Kalkulator Saham">
          <ul>
            <li><a href="/tools/kalkulator-fee-saham">Kalkulator Fee Beli &amp; Jual Saham BEI</a></li>
            <li><a href="/tools/kalkulator-lot">Kalkulator Lot Saham ke Lembar &amp; Rupiah</a></li>
            <li><a href="/tools/kalkulator-averaging-saham">Kalkulator Averaging Down Saham</a></li>
          </ul>
        </nav>

        <h3>Panduan &amp; Edukasi Trading Pemula</h3>
        <nav aria-label="Edukasi Trading">
          <ul>
            <li><a href="/learn/apa-itu-paper-trading">Apa itu Paper Trading? Panduan Belajar Trading Saham Tanpa Risiko</a></li>
            <li><a href="/learn/cara-baca-orderbook-level-2">Cara Membaca Orderbook Level 2: Bid, Offer, dan Antrean Saham</a></li>
          </ul>
        </nav>

        <h3>Simulasi Trading Saham Terpopuler (LQ45 / IDX)</h3>
        <nav aria-label="Direktori Saham Populer">
          <ul>
            <li><a href="/stock/BBCA">Simulasi Trading Saham BBCA (Bank Central Asia)</a></li>
            <li><a href="/stock/BBRI">Simulasi Trading Saham BBRI (Bank Rakyat Indonesia)</a></li>
            <li><a href="/stock/BMRI">Simulasi Trading Saham BMRI (Bank Mandiri)</a></li>
            <li><a href="/stock/BBNI">Simulasi Trading Saham BBNI (Bank Negara Indonesia)</a></li>
            <li><a href="/stock/TLKM">Simulasi Trading Saham TLKM (Telkom Indonesia)</a></li>
            <li><a href="/stock/ASII">Simulasi Trading Saham ASII (Astra International)</a></li>
            <li><a href="/stock/GOTO">Simulasi Trading Saham GOTO (GoTo Gojek Tokopedia)</a></li>
            <li><a href="/stock/AMMN">Simulasi Trading Saham AMMN (Amman Mineral)</a></li>
            <li><a href="/stock/ANTM">Simulasi Trading Saham ANTM (Aneka Tambang)</a></li>
            <li><a href="/stock/PTBA">Simulasi Trading Saham PTBA (Bukit Asam)</a></li>
            <li><a href="/stock/ICBP">Simulasi Trading Saham ICBP (Indofood CBP)</a></li>
            <li><a href="/stock/KLBF">Simulasi Trading Saham KLBF (Kalbe Farma)</a></li>
          </ul>
        </nav>

        <h3>Simulasi Trading Kripto Spot 24/7</h3>
        <nav aria-label="Direktori Crypto Populer">
          <ul>
            <li><a href="/stock/BTC">Simulasi Trading Bitcoin (BTC/USDT) Realtime</a></li>
            <li><a href="/stock/ETH">Simulasi Trading Ethereum (ETH/USDT) Realtime</a></li>
            <li><a href="/stock/SOL">Simulasi Trading Solana (SOL/USDT) Realtime</a></li>
            <li><a href="/stock/BNB">Simulasi Trading Binance Coin (BNB/USDT) Realtime</a></li>
            <li><a href="/stock/XRP">Simulasi Trading Ripple (XRP/USDT) Realtime</a></li>
            <li><a href="/stock/DOGE">Simulasi Trading Dogecoin (DOGE/USDT) Realtime</a></li>
          </ul>
        </nav>
      </section>

      <TradeSimLandingPage />
    </>
  );
}
