// src/lib/telegram/telegramNotificationEngine.ts
/**
 * Fincept Capital — Telegram 24/7 Real-Time Alert Engine
 * Mengirimkan notifikasi instan langsung ke Telegram pengguna
 * setiap kali AI mengeksekusi BUY, TAKE PROFIT, STOP LOSS, atau VETO RISIKO.
 */

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
    const botToken = localStorage.getItem('TRADEMIND_TELEGRAM_BOT_TOKEN') || '';
    const chatId = localStorage.getItem('TRADEMIND_TELEGRAM_CHAT_ID') || '';
    const enabled = localStorage.getItem('TRADEMIND_TELEGRAM_ENABLED') !== 'false';
    return {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      enabled: enabled && !!botToken && !!chatId,
    };
  } catch {
    return { botToken: '', chatId: '', enabled: false };
  }
}

/**
 * Mengirim pesan mentah ke Telegram Bot
 */
export async function sendTelegramRawMessage(text: string): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.botToken || !config.chatId) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch (err) {
    console.warn('[Telegram Alert] Gagal mengirim pesan ke Telegram:', err);
    return false;
  }
}

/**
 * Notifikasi saat AI Membeli Saham / Kripto
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
  const isCrypto = payload.symbol.endsWith('USDT') || ['BTC', 'ETH', 'SOL', 'BNB'].includes(payload.symbol);
  const priceFmt = isCrypto
    ? `$${payload.price.toLocaleString('en-US')}`
    : `Rp ${payload.price.toLocaleString('id-ID')}`;
  const notionalFmt = isCrypto
    ? `$${payload.notional.toLocaleString('en-US')}`
    : `Rp ${Math.round(payload.notional).toLocaleString('id-ID')}`;
  const qtyLabel = isCrypto ? `${payload.lots} Unit` : `${payload.lots} Lot`;

  const slFmt = payload.stopLoss
    ? (isCrypto ? `$${payload.stopLoss}` : `Rp ${payload.stopLoss}`)
    : 'ATR Trailing';
  const tpFmt = payload.takeProfit
    ? (isCrypto ? `$${payload.takeProfit}` : `Rp ${payload.takeProfit}`)
    : 'Dynamic';

  const tierBadge = payload.tier || 'TIER_1_FAST';
  const engineBadge = (payload.engine || (isCrypto ? 'FREQTRADE' : 'LUMIBOT')).toUpperCase();

  const msg = [
    `🟢 *[AI ORDER BUY FILLED]* 🚀`,
    ``,
    `📌 *Aset:* \`${payload.symbol}\` ${payload.name ? `(${payload.name})` : ''}`,
    `💰 *Harga Beli:* ${priceFmt}`,
    `📦 *Jumlah:* ${qtyLabel}`,
    `💵 *Total Nilai:* ${notionalFmt}`,
    ``,
    `🛡️ *Stop Loss:* ${slFmt}`,
    `🎯 *Take Profit:* ${tpFmt}`,
    ``,
    `⚙️ *Execution Tier:* \`${tierBadge}\``,
    `⚡ *Quant Engine:* \`${engineBadge}\``,
    payload.strategy ? `🧠 *Strategi:* _${payload.strategy}_` : '',
    ``,
    `🕒 _${new Date().toLocaleTimeString('id-ID')} WIB · Fincept Autonomous Hedge Fund_`,
  ].filter(Boolean).join('\n');

  return sendTelegramRawMessage(msg);
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
  const isCrypto = payload.symbol.endsWith('USDT');
  const priceFmt = isCrypto
    ? `$${payload.price.toLocaleString('en-US')}`
    : `Rp ${payload.price.toLocaleString('id-ID')}`;
  const profitFmt = isCrypto
    ? `+$${payload.realizedProfit.toLocaleString('en-US')}`
    : `+Rp ${Math.round(payload.realizedProfit).toLocaleString('id-ID')}`;
  const pctFmt = payload.pnlPct !== undefined ? ` (+${payload.pnlPct.toFixed(2)}%)` : '';

  const msg = [
    `🎯 *[TAKE PROFIT OTOMATIS TERCAPAI]* 💎`,
    ``,
    `📌 *Aset:* \`${payload.symbol}\``,
    `💵 *Harga Jual:* ${priceFmt}`,
    `📦 *Volume:* ${payload.lots} ${isCrypto ? 'Unit' : 'Lot'}`,
    `💰 *Keuntungan Modal:* *${profitFmt}*${pctFmt}`,
    ``,
    `✅ _Posisi dilikuidasi untuk mengamankan profit portofolio._`,
    `🕒 _${new Date().toLocaleTimeString('id-ID')} WIB_`,
  ].join('\n');

  return sendTelegramRawMessage(msg);
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
  const isCrypto = payload.symbol.endsWith('USDT');
  const priceFmt = isCrypto
    ? `$${payload.price.toLocaleString('en-US')}`
    : `Rp ${payload.price.toLocaleString('id-ID')}`;
  const lossFmt = isCrypto
    ? `-$${Math.abs(payload.realizedLoss).toLocaleString('en-US')}`
    : `-Rp ${Math.round(Math.abs(payload.realizedLoss)).toLocaleString('id-ID')}`;
  const pctFmt = payload.pnlPct !== undefined ? ` (${payload.pnlPct.toFixed(2)}%)` : '';

  const msg = [
    `🛡️ *[STOP LOSS OTOMATIS / CRO VETO]* ⚠️`,
    ``,
    `📌 *Aset:* \`${payload.symbol}\``,
    `💵 *Harga Cut Loss:* ${priceFmt}`,
    `📦 *Volume:* ${payload.lots} ${isCrypto ? 'Unit' : 'Lot'}`,
    `🔻 *Realisasi Risiko:* *${lossFmt}*${pctFmt}`,
    ``,
    `🧠 *Keterangan:* _${payload.reason || 'Batas toleransi risiko modal tercapai. Otomatis dilikuidasi untuk melindungi drawdown.'}_`,
    `🔄 _Tier 3 Post-Mortem aktif di memori untuk mencegah pengulangan._`,
    `🕒 _${new Date().toLocaleTimeString('id-ID')} WIB_`,
  ].join('\n');

  return sendTelegramRawMessage(msg);
}

/**
 * Notifikasi saat Order Ditolak / Veto oleh Risk Officer
 */
export async function notifyTelegramRiskVeto(payload: {
  symbol: string;
  reason: string;
  tier?: string;
}): Promise<boolean> {
  const msg = [
    `⛔ *[ORDER DITOLAK / VETO RISIKO]* 🛡️`,
    ``,
    `📌 *Aset:* \`${payload.symbol}\``,
    `⚙️ *Gate:* \`${payload.tier || 'TIER_2_COGNITIVE'}\``,
    `⚠️ *Alasan:* _${payload.reason}_`,
    ``,
    `🔒 _Modal aman. Order tidak dieksekusi._`,
    `🕒 _${new Date().toLocaleTimeString('id-ID')} WIB_`,
  ].join('\n');

  return sendTelegramRawMessage(msg);
}
