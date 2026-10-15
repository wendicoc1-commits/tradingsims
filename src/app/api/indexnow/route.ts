import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'e4b8f2a17c9d0356';
const HOST = 'www.tradingsims.my.id';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

const DEFAULT_URLS = [
  `https://${HOST}`,
  `https://${HOST}/terminal`,
  `https://${HOST}/markets`,
  `https://${HOST}/crypto`,
  `https://${HOST}/screener`,
  `https://${HOST}/dividend`,
  `https://${HOST}/bandar`,
  `https://${HOST}/championship`,
  `https://${HOST}/tools/kalkulator-dividen`,
  `https://${HOST}/tools/kalkulator-fee-saham`,
  `https://${HOST}/tools/kalkulator-lot`,
  `https://${HOST}/tools/kalkulator-averaging-saham`,
  `https://${HOST}/learn/istilah-saham`,
  `https://${HOST}/learn/apa-itu-paper-trading`,
  `https://${HOST}/learn/cara-baca-orderbook-level-2`,
  `https://${HOST}/stock/BBCA`,
  `https://${HOST}/stock/BBRI`,
  `https://${HOST}/stock/BMRI`,
  `https://${HOST}/stock/TLKM`,
  `https://${HOST}/stock/BTC`,
  `https://${HOST}/stock/ETH`,
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
