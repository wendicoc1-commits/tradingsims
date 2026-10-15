// src/app/api/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/server/adminAuth';

// In-memory rate limiting: max 20 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (entry.count >= 20) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Regex format untuk validasi Telegram Bot Token & Chat ID
const BOT_TOKEN_REGEX = /^\d{8,12}:[a-zA-Z0-9_-]{30,50}$/;
const CHAT_ID_REGEX = /^-?\d{5,18}$/;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Terlalu banyak permintaan (Rate limit exceeded). Coba lagi dalam 1 menit.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Format body request tidak valid' }, { status: 400 });
    }

    const { text, parseMode = 'HTML' } = body;
    let { botToken, chatId } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'Pesan text tidak boleh kosong' }, { status: 400 });
    }

    // Batasi panjang teks pesan maksimal 4000 karakter
    if (text.length > 4000) {
      return NextResponse.json({ ok: false, error: 'Pesan text melebihi batas 4000 karakter' }, { status: 400 });
    }

    // Jika botToken atau chatId tidak dikirim dari body, cek apakah pemanggil berhak memakai bot server
    const isUsingServerBot = !botToken || !chatId;
    if (isUsingServerBot) {
      const isAdmin = await verifyAdminSession(req);
      if (!isAdmin) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Akses ditolak: Hanya administrator yang dapat menggunakan bot Telegram internal server. Harap sertakan botToken dan chatId bot Anda sendiri.',
          },
          { status: 403 }
        );
      }
      botToken = process.env.TELEGRAM_BOT_TOKEN || '';
      chatId = process.env.TELEGRAM_CHAT_ID || '';
    }

    const cleanToken = String(botToken).trim();
    const cleanChatId = String(chatId).trim();

    if (!cleanToken || !cleanChatId) {
      return NextResponse.json(
        { ok: false, error: 'Bot Token dan Chat ID Telegram wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi format token dan chatId untuk mencegah SSRF / injection
    if (!BOT_TOKEN_REGEX.test(cleanToken)) {
      return NextResponse.json({ ok: false, error: 'Format Bot Token Telegram tidak valid' }, { status: 400 });
    }

    if (!CHAT_ID_REGEX.test(cleanChatId)) {
      return NextResponse.json({ ok: false, error: 'Format Chat ID Telegram tidak valid' }, { status: 400 });
    }

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

    // 2. Fail-safe: Jika Telegram menolak HTML (misal tag tidak tertutup rapi), kirim Plain Text murni
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
