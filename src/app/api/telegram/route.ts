// src/app/api/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      botToken = process.env.TELEGRAM_BOT_TOKEN || '',
      chatId = process.env.TELEGRAM_CHAT_ID || '',
      parseMode = 'HTML',
    } = body;

    if (!text) {
      return NextResponse.json({ ok: false, error: 'Pesan text tidak boleh kosong' }, { status: 400 });
    }

    if (!botToken || !chatId) {
      return NextResponse.json(
        { ok: false, error: 'Bot Token dan Chat ID Telegram wajib diisi' },
        { status: 400 }
      );
    }

    const cleanToken = String(botToken).trim();
    const cleanChatId = String(chatId).trim();
    const telegramUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    // 1. Percobaan kirim via HTML
    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: parseMode,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return NextResponse.json({ ok: true, result: data.result });
    }

    // 2. Fail-safe: Jika Telegram menolak HTML, kirim Plain Text murni
    const plainText = text
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const fallbackRes = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: plainText,
      }),
    });

    const fallbackData = await fallbackRes.json();
    if (fallbackData.ok) {
      return NextResponse.json({ ok: true, result: fallbackData.result, fallbackUsed: true });
    }

    return NextResponse.json(
      { ok: false, error: fallbackData.description || data.description || 'Gagal mengirim pesan Telegram' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Internal server error di Telegram Gateway' },
      { status: 500 }
    );
  }
}
