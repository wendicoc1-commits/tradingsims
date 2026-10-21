import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'e4b8f2a17c9d0356';
const HOST = 'www.tradingsims.my.id';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const DEFAULT_URLS = [
  `https://${HOST}`,
  `https://${HOST}/trading`,
  `https://${HOST}/learn/apa-itu-trading`,
  `https://${HOST}/learn/strategi-trading-saham`,
  `https://${HOST}/tools/kalkulator-profit-trading`,
  `https://${HOST}/kamus/trading`,
  `https://${HOST}/terminal`,
  `https://${HOST}/markets`,
  `https://${HOST}/crypto`,
  `https://${HOST}/screener`,
  `https://${HOST}/dividend`,
  `https://${HOST}/bandar`,
  `https://${HOST}/championship`,
  `https://${HOST}/tools/kalkulator-cagr-saham`,
  `https://${HOST}/tools/kalkulator-dividen`,
  `https://${HOST}/tools/kalkulator-fee-saham`,
  `https://${HOST}/tools/kalkulator-lot`,
  `https://${HOST}/tools/kalkulator-averaging-saham`,
  `https://${HOST}/learn/cara-main-saham-pemula`,
  `https://${HOST}/learn/jam-bursa-saham-idx`,
  `https://${HOST}/learn/istilah-bandarmologi-saham`,
  `https://${HOST}/learn/istilah-saham`,
  `https://${HOST}/learn/apa-itu-paper-trading`,
  `https://${HOST}/learn/cara-baca-orderbook-level-2`,
  `https://${HOST}/stock/BBCA`,
  `https://${HOST}/stock/BBRI`,
  `https://${HOST}/stock/BMRI`,
  `https://${HOST}/stock/TLKM`,
  `https://${HOST}/stock/BTC`,
  `https://${HOST}/stock/ETH`,
  `https://${HOST}/compare`,
  `https://${HOST}/compare/bbca-vs-bbri`,
  `https://${HOST}/compare/bmri-vs-bbni`,
  `https://${HOST}/compare/adro-vs-ptba`,
  `https://${HOST}/compare/asii-vs-tlkm`,
  `https://${HOST}/compare/btc-vs-eth`,
  `https://${HOST}/sektor/perbankan`,
  `https://${HOST}/sektor/energi-dan-batubara`,
  `https://${HOST}/sektor/teknologi-dan-digital`,
  `https://${HOST}/sektor/konsumer-dan-ritel`,
  `https://${HOST}/sektor/infrastruktur-dan-telekomunikasi`,
  `https://${HOST}/sektor/kripto-layer-1`,
  `https://${HOST}/kamus`,
  `https://${HOST}/kamus/ar-b-auto-rejection-bawah`,
  `https://${HOST}/kamus/ara-auto-rejection-atas`,
  `https://${HOST}/kamus/bandarmologi`,
  `https://${HOST}/kamus/haka-hajar-kanan`,
  `https://${HOST}/kamus/haki-hajar-kiri`,
  `https://${HOST}/kamus/cum-date`,
  `https://${HOST}/kamus/ex-date`,
  `https://${HOST}/kamus/market-cap`,
  `https://${HOST}/kamus/per-price-to-earnings-ratio`,
  `https://${HOST}/kamus/pbv-price-to-book-value`,
  `https://${HOST}/kamus/ipo-initial-public-offering`,
  `https://${HOST}/kamus/lot-saham`,
  `https://${HOST}/kalender-dividen`,
  `https://${HOST}/stock/BBCA/dividen`,
  `https://${HOST}/stock/PTBA/dividen`,
  `https://${HOST}/stock/ITMG/dividen`,
  `https://${HOST}/ipo`,
  `https://${HOST}/pasar/top-gainers`,
  `https://${HOST}/pasar/top-losers`,
  `https://${HOST}/pasar/foreign-flow`,
  `https://${HOST}/pasar/lq45-terbaik`,
  `https://${HOST}/pasar/saham-dividen-tertinggi`,
  `https://${HOST}/analisis/BBCA`,
  `https://${HOST}/analisis/BBRI`,
  `https://${HOST}/analisis/TLKM`,
  `https://${HOST}/crypto/fear-and-greed`,
  `https://${HOST}/vs/bbca-vs-bbri`,
  `https://${HOST}/vs/adro-vs-ptba`,
  `https://${HOST}/vs/tlkm-vs-isat`,
  `https://${HOST}/vs/bmri-vs-bbni`,
  `https://${HOST}/indeks/ihsg`,
  `https://${HOST}/indeks/lq45`,
  `https://${HOST}/indeks/idx30`,
  `https://${HOST}/indeks/idx-hidiv20`,
  `https://${HOST}/indeks/jii`,
  `https://${HOST}/broker/yp`,
  `https://${HOST}/broker/cc`,
  `https://${HOST}/broker/pd`,
  `https://${HOST}/broker/bk`,
];

export async function POST(req: NextRequest) {
  try {
    let customUrls: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body?.urlList) && body.urlList.length > 0) {
        customUrls = body.urlList;
      }
    } catch {}

    const urlList = customUrls.length > 0 ? customUrls : DEFAULT_URLS;

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      submittedCount: urlList.length,
      message: res.ok
        ? 'Daftar URL berhasil disubmit ke jaringan IndexNow (Bing, Yandex, Seznam).'
        : 'IndexNow merespon dengan status ' + res.status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal memanggil API IndexNow' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Shortcut untuk pemicu instant crawling via browser / webhook
  try {
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: DEFAULT_URLS,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      submittedCount: DEFAULT_URLS.length,
      message: 'Default sitemap URLs telah dikirim ke jaringan search engine IndexNow.',
      urls: DEFAULT_URLS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
