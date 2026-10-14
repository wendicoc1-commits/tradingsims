import TradeSimLandingPage from '@/components/landing/TradeSimLandingPage';

export default function HomePage() {
  return (
    <>
      {/* ── Semantic SEO & Structured Crawlable Content for Search Engines ── */}
      <section className="sr-only" aria-label="TradeSim Pro Platform Overview">
        <h1>TradeSim Pro - Platform Simulator Trading Saham IDX &amp; Crypto Indonesia</h1>
        <p>
          Platform paper trading dan simulator investasi saham Indonesia (BEI / IDX) dan crypto spot 24/7 dengan data pasar real-time,
          analisis teknikal candlestick, radar bandarmologi, serta ekosistem AI autonomous portfolio agent terdepan di Indonesia.
        </p>
        <nav aria-label="Akses Cepat Fitur Simulator">
          <ul>
            <li><a href="/terminal">Buka Workstation Terminal Fincept</a></li>
            <li><a href="/markets">Peta Pasar &amp; Sektoral IHSG</a></li>
            <li><a href="/crypto">Simulator Trading Crypto 24/7 (BTC, ETH, SOL)</a></li>
            <li><a href="/portfolio">Portofolio Investasi &amp; Saldo Kas Virtual RDN</a></li>
            <li><a href="/screener">Screener Saham &amp; Filter Fundamental</a></li>
            <li><a href="/dividend">Radar Kalender Dividen Emiten BEI</a></li>
            <li><a href="/championship">Turnamen Liga Trading Simulator Berhadiah</a></li>
          </ul>
        </nav>
      </section>

      <TradeSimLandingPage />
    </>
  );
}
