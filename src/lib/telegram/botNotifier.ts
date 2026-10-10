// src/lib/telegram/botNotifier.ts
import fs from 'fs';
import path from 'path';

interface DepositNotificationParams {
  ticketId: string;
  senderName: string;
  senderBank: string;
  nominalPay: number;
  virtualCashAmount: number;
  userEmail?: string;
  notes?: string;
  proofUrl?: string | null;
}

function getTelegramCredentials() {
  let botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatId = process.env.TELEGRAM_CHAT_ID || '';

  // Coba baca dari quant_engine jika ada file config
  try {
    const configPath = path.join(process.cwd(), '../quant_engine/telegram_config.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (data.botToken && data.chatId && data.enabled !== false) {
        botToken = data.botToken;
        chatId = data.chatId;
      }
    }
  } catch (_) {}

  return { botToken, chatId };
}

/**
 * Kirim notifikasi instan ke Telegram Admin saat ada member melakukan Top Up
 */
export async function sendTelegramDepositNotification(params: DepositNotificationParams): Promise<boolean> {
  try {
    const { botToken, chatId } = getTelegramCredentials();
    if (!botToken || !chatId) {
      console.log('[TelegramNotifier] Bot Token atau Chat ID belum diset di server environment.');
      return false;
    }

    const nominalStr = params.nominalPay.toLocaleString('id-ID');
    const virtualCashStr = params.virtualCashAmount.toLocaleString('id-ID');
    const adminLink = 'https://www.tradingsims.my.id/admin/deposits';

    const message = [
      `🔔 <b>PERMOHONAN DEPOSIT MASUK (TRADESIM PRO)</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🆔 <b>ID Tiket:</b> <code>${params.ticketId}</code>`,
      `👤 <b>Nama Pengirim:</b> <b>${params.senderName}</b>`,
      `🏦 <b>Metode / Bank:</b> ${params.senderBank}`,
      `💵 <b>Nominal Transfer:</b> Rp ${nominalStr}`,
      `💰 <b>Saldo Wallet Didapat:</b> +Rp ${virtualCashStr}`,
      `📧 <b>Email Akun:</b> ${params.userEmail || 'member@tradesim.id'}`,
      params.notes ? `📝 <b>Catatan:</b> ${params.notes}` : '',
      `━━━━━━━━━━━━━━━━━━━━`,
      `👉 <a href="${adminLink}">Buka Panel Admin untuk Verifikasi</a>`,
    ]
      .filter(Boolean)
      .join('\n');

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const json = await res.json();
    return Boolean(json.ok);
  } catch (err) {
    console.warn('[sendTelegramDepositNotification Error]', err);
    return false;
  }
}

/**
 * Kirim notifikasi konfirmasi ketika deposit berhasil di-approve oleh admin
 */
export async function sendTelegramDepositApproved(params: {
  ticketId: string;
  senderName: string;
  userEmail: string;
  nominalPay: number;
  virtualCashAmount: number;
}): Promise<boolean> {
  try {
    const { botToken, chatId } = getTelegramCredentials();
    if (!botToken || !chatId) return false;

    const message = [
      `✅ <b>DEPOSIT BERHASIL DISETUJUI</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🆔 <b>Tiket:</b> <code>${params.ticketId}</code>`,
      `👤 <b>Member:</b> ${params.senderName} (${params.userEmail})`,
      `💰 <b>Saldo Ditambahkan:</b> +Rp ${params.virtualCashAmount.toLocaleString('id-ID')}`,
      `⏰ <b>Waktu Approval:</b> ${new Date().toLocaleTimeString('id-ID')} WIB`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Status: Saldo telah aktif di portofolio member.`,
    ].join('\n');

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const json = await res.json();
    return Boolean(json.ok);
  } catch (err) {
    console.warn('[sendTelegramDepositApproved Error]', err);
    return false;
  }
}
