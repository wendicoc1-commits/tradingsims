// src/lib/telegram/telegramNotificationEngine.ts
/**
 * Fincept Capital — Telegram 24/7 Real-Time Alert Engine
 * Mengirimkan notifikasi instan langsung ke Telegram pengguna
 * setiap kali order BUY, TAKE PROFIT, STOP LOSS, atau VETO RISIKO dieksekusi.
 */

import { isCryptoSymbol, isUSSymbol } from '@/lib/universe/masterAssetUniverse';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export function getTelegramConfig(): TelegramConfig {
  if (typeof window === 'undefined') {
    return {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
      enabled: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    };
  }

  try {
    const botToken = (localStorage.getItem('TRADEMIND_TELEGRAM_BOT_TOKEN') || '').trim();
    const chatId = (localStorage.getItem('TRADEMIND_TELEGRAM_CHAT_ID') || '').trim();
    const rawEnabled = localStorage.getItem('TRADEMIND_TELEGRAM_ENABLED');
    // Default enabled jika token & chatId terisi dan tidak eksplisit disetel 'false'
    const enabled = rawEnabled !== 'false' && Boolean(botToken && chatId);

    if (botToken && chatId && typeof window !== 'undefined') {
      const win = window as any;
      if (!win.__telegramConfigSynced) {
        win.__telegramConfigSynced = true;
        fetch('/api/telegram/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botToken, chatId, enabled }),
        }).catch(() => {});
      }
    }

    return {
      botToken,
      chatId,
      enabled,
    };
  } catch {
    return { botToken: '', chatId: '', enabled: false };
  }
}

/**
 * Mengirim pesan ke Telegram Bot via Server Proxy (/api/telegram)
 * dengan fallback langsung ke API Telegram.
 */
export async function sendTelegramRawMessage(htmlText: string): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.botToken || !config.chatId) {
    console.warn('[Telegram Alert] Pengiriman dibatalkan. Konfigurasi tidak aktif atau belum diisi di Portofolio:', {
      hasToken: Boolean(config.botToken),
      hasChatId: Boolean(config.chatId),
      enabled: config.enabled,
    });
    return false;
  }

  console.info('[Telegram Alert] Menyiapkan pengiriman notifikasi ke Chat ID:', config.chatId);

  // 1. RUTE PRIORITAS: Kirim via Server Proxy Internal Next.js (/api/telegram)
  // Ini 100% kebal terhadap AdBlocker, Brave Shields, atau CORS browser
  try {
    const proxyRes = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: htmlText,
        botToken: config.botToken,
        chatId: config.chatId,
        parseMode: 'HTML',
      }),
    });

    const proxyData = await proxyRes.json();
    if (proxyData.ok) {
      console.info('🎉 [Telegram Alert] Berhasil terkirim via Gateway Server!');
      return true;
    }
    console.warn('[Telegram Alert] Gateway Server mengembalikan error:', proxyData.error);
  } catch (proxyErr) {
    console.warn('[Telegram Alert] Gateway Server tidak dapat dijangkau, mencoba rute langsung:', proxyErr);
  }

  // 2. RUTE CADANGAN: Kirim langsung dari browser ke Telegram API
  try {
    const directUrl = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const res = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: htmlText,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (data.ok) {
      console.info('🎉 [Telegram Alert] Berhasil terkirim via Rute Langsung!');
      return true;
    }

    // Fail-Safe Plain Text jika HTML ditolak
    const plainText = htmlText
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const fallbackRes = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: plainText,
      }),
    });
    const fallbackData = await fallbackRes.json();
    return !!fallbackData.ok;
  } catch (err) {
    console.warn('[Telegram Alert] Gagal di semua rute:', err);
    return false;
  }
}

/**
 * Helper untuk sanitasi teks agar aman disisipkan ke tag HTML Telegram
 */
function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Notifikasi saat Order BUY Berhasil (Saham / Kripto)
 */
export async function notifyTelegramTradeBuy(payload: {
  symbol: string;
  name?: string;
  price: number;
  lots: number;
  notional: number;
  stopLoss?: number;
  takeProfit?: number;
  tier?: string;
  strategy?: string;
  engine?: string;
}): Promise<boolean> {
  const { clean: symClean, isCrypto, isUS } = resolveAssetFormat(payload.symbol);
  const priceFmt = (isCrypto || isUS)
    ? `$${payload.price.toLocaleString('en-US', { minimumFractionDigits: payload.price < 1 ? 4 : 2, maximumFractionDigits: 6 })} USD`
    : `Rp ${payload.price.toLocaleString('id-ID')}`;
  const notionalFmt = (isCrypto || isUS)
    ? `$${(payload.notional / 16000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (~Rp ${Math.round(payload.notional).toLocaleString('id-ID')})`
    : `Rp ${Math.round(payload.notional).toLocaleString('id-ID')}`;
  const qtyLabel = isCrypto ? `${payload.lots} Unit Koin` : isUS ? `${payload.lots} Lembar Saham` : `${payload.lots} Lot`;

  const slFmt = payload.stopLoss
    ? ((isCrypto || isUS) ? `$${payload.stopLoss}` : `Rp ${payload.stopLoss}`)
    : 'ATR Trailing';
  const tpFmt = payload.takeProfit
    ? ((isCrypto || isUS) ? `$${payload.takeProfit}` : `Rp ${payload.takeProfit}`)
    : 'Dynamic Target';

  const tierBadge = escapeHtml(payload.tier || 'WAR_ROOM_CONSENSUS');
  const engineBadge = escapeHtml((payload.engine || (isCrypto ? 'FREQTRADE' : 'LUMIBOT')).toUpperCase());
  const nameClean = payload.name ? escapeHtml(payload.name) : '';

  const timeStr = new Date().toLocaleTimeString('id-ID');

  const html = [
    `<b>🟢 [ORDER BUY BERHASIL] 🚀</b>`,
    ``,
    `📌 <b>Aset:</b> <code>${symClean}</code> ${nameClean ? `(${nameClean})` : ''}`,
    `💰 <b>Harga Beli:</b> ${priceFmt}`,
    `📦 <b>Jumlah:</b> ${qtyLabel}`,
    `💵 <b>Total Nilai:</b> ${notionalFmt}`,
    ``,
    `🛡️ <b>Stop Loss:</b> ${slFmt}`,
    `🎯 <b>Take Profit:</b> ${tpFmt}`,
    ``,
    `⚙️ <b>Execution:</b> <code>${tierBadge}</code>`,
    `⚡ <b>Quant Engine:</b> <code>${engineBadge}</code>`,
    payload.strategy ? `🧠 <b>Strategi:</b> <i>${escapeHtml(payload.strategy)}</i>` : '',
    ``,
    `🕒 <i>${timeStr} WIB · Fincept Autonomous Hedge Fund</i>`,
  ].filter(Boolean).join('\n');

  return sendTelegramRawMessage(html);
}

/**
 * Helper deteksi format aset
 */
function resolveAssetFormat(symbol: string) {
  const clean = symbol.trim().toUpperCase().replace('.JK', '').replace(/USDT$/i, '').replace(/-USD$/i, '');
  const isCrypto = symbol.toUpperCase().endsWith('USDT') || symbol.toUpperCase().endsWith('-USD') || isCryptoSymbol(clean);
  const isUS = !isCrypto && isUSSymbol(clean);
  const isIDX = !isCrypto && !isUS;
  return { clean, isCrypto, isUS, isIDX };
}

/**
 * Notifikasi saat Take Profit Tercapai
 */
export async function notifyTelegramTradeTakeProfit(payload: {
  symbol: string;
  price: number;
  lots: number;
  realizedProfit: number;
  pnlPct?: number;
}): Promise<boolean> {
  const { clean: symClean, isCrypto, isUS } = resolveAssetFormat(payload.symbol);
  const priceFmt = (isCrypto || isUS)
    ? `$${payload.price.toLocaleString('en-US', { minimumFractionDigits: payload.price < 1 ? 4 : 2, maximumFractionDigits: 6 })} USD`
    : `Rp ${payload.price.toLocaleString('id-ID')}`;
  const profitFmt = (isCrypto || isUS)
    ? `+Rp ${Math.round(payload.realizedProfit).toLocaleString('id-ID')} (~+$${(Math.abs(payload.realizedProfit) / 16000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
    : `+Rp ${Math.round(payload.realizedProfit).toLocaleString('id-ID')}`;
  const pctFmt = payload.pnlPct !== undefined ? ` (+${payload.pnlPct.toFixed(2)}%)` : '';
  const timeStr = new Date().toLocaleTimeString('id-ID');

  const html = [
    `<b>🎯 [TAKE PROFIT TERCAPAI] 💎</b>`,
    ``,
    `📌 <b>Aset:</b> <code>${symClean}</code>`,
    `💵 <b>Harga Jual:</b> ${priceFmt}`,
    `📦 <b>Volume:</b> ${payload.lots} ${isCrypto ? 'Unit Koin' : isUS ? 'Lembar' : 'Lot'}`,
    `💰 <b>Keuntungan Realisasi:</b> <b>${profitFmt}</b>${pctFmt}`,
    ``,
    `✅ <i>Posisi dilikuidasi untuk mengamankan profit portofolio.</i>`,
    `🕒 <i>${timeStr} WIB · Fincept Capital</i>`,
  ].join('\n');

  return sendTelegramRawMessage(html);
}

/**
 * Notifikasi saat Stop Loss Terpicu (CRO Veto Cut Loss)
 */
export async function notifyTelegramTradeStopLoss(payload: {
  symbol: string;
  price: number;
  lots: number;
  realizedLoss: number;
  pnlPct?: number;
  reason?: string;
}): Promise<boolean> {
  const { clean: symClean, isCrypto, isUS } = resolveAssetFormat(payload.symbol);
  const priceFmt = (isCrypto || isUS)
    ? `$${payload.price.toLocaleString('en-US', { minimumFractionDigits: payload.price < 1 ? 4 : 2, maximumFractionDigits: 6 })} USD`
    : `Rp ${payload.price.toLocaleString('id-ID')}`;
  const lossFmt = (isCrypto || isUS)
    ? `-Rp ${Math.round(Math.abs(payload.realizedLoss)).toLocaleString('id-ID')} (~-$${(Math.abs(payload.realizedLoss) / 16000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
    : `-Rp ${Math.round(Math.abs(payload.realizedLoss)).toLocaleString('id-ID')}`;
  const pctFmt = payload.pnlPct !== undefined ? ` (${payload.pnlPct.toFixed(2)}%)` : '';
  const reasonClean = escapeHtml(payload.reason || 'Batas toleransi risiko modal tercapai. Otomatis dilikuidasi.');
  const timeStr = new Date().toLocaleTimeString('id-ID');

  const html = [
    `<b>🛡️ [STOP LOSS CUT / PROTEKSI MODAL] ⚠️</b>`,
    ``,
    `📌 <b>Aset:</b> <code>${symClean}</code>`,
    `💵 <b>Harga Cut Loss:</b> ${priceFmt}`,
    `📦 <b>Volume:</b> ${payload.lots} ${isCrypto ? 'Unit Koin' : isUS ? 'Lembar' : 'Lot'}`,
    `🔻 <b>Realisasi Risiko:</b> <b>${lossFmt}</b>${pctFmt}`,
    ``,
    `🧠 <b>Keterangan:</b> <i>${reasonClean}</i>`,
    `🔄 <i>Pelajaran dikomit ke memori untuk mencegah kesalahan serupa.</i>`,
    `🕒 <i>${timeStr} WIB · Fincept Capital</i>`,
  ].join('\n');

  return sendTelegramRawMessage(html);
}

/**
 * Notifikasi saat Order Ditolak / Veto oleh Risk Officer
 */
export async function notifyTelegramRiskVeto(payload: {
  symbol: string;
  reason: string;
  tier?: string;
}): Promise<boolean> {
  const symClean = escapeHtml(payload.symbol);
  const tierClean = escapeHtml(payload.tier || 'TIER_2_COGNITIVE');
  const reasonClean = escapeHtml(payload.reason);
  const timeStr = new Date().toLocaleTimeString('id-ID');

  const html = [
    `<b>⛔ [ORDER DITOLAK / VETO RISIKO] 🛡️</b>`,
    ``,
    `📌 <b>Aset:</b> <code>${symClean}</code>`,
    `⚙️ <b>Gate:</b> <code>${tierClean}</code>`,
    `⚠️ <b>Alasan:</b> <i>${reasonClean}</i>`,
    ``,
    `🔒 <i>Modal aman. Order dibatalkan oleh protokol risiko.</i>`,
    `🕒 <i>${timeStr} WIB · Fincept Capital</i>`,
  ].join('\n');

  return sendTelegramRawMessage(html);
}
