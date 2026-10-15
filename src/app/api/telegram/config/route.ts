// src/app/api/telegram/config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminSession } from '@/lib/server/adminAuth';

const CONFIG_PATH = path.join(process.cwd(), '../quant_engine/telegram_config.json');

export async function GET(req: NextRequest) {
  // Hanya administrator yang berhak melihat konfigurasi token bot Telegram
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: Akses ditolak. Kredensial administrator diperlukan.' },
      { status: 401 }
    );
  }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      return NextResponse.json({ ok: true, config: data });
    }
  } catch (err: any) {
    console.warn('[Telegram Config] Gagal membaca konfigurasi:', err?.message);
  }

  // Fallback ke env server
  return NextResponse.json({
    ok: true,
    config: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
      enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    },
  });
}

export async function POST(req: NextRequest) {
  // Hanya administrator yang berhak mengubah konfigurasi bot Telegram
  const isAdmin = await verifyAdminSession(req);
  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: Akses ditolak. Kredensial administrator diperlukan.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { botToken = '', chatId = '', enabled = true } = body;

    const payload = {
      botToken: String(botToken).trim(),
      chatId: String(chatId).trim(),
      enabled: Boolean(enabled),
      updatedAt: new Date().toISOString(),
    };

    // Pastikan direktori ada
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(payload, null, 2), 'utf-8');

    return NextResponse.json({ ok: true, message: 'Konfigurasi Telegram tersimpan di Background Daemon 24/7', config: payload });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Gagal menyimpan konfigurasi Telegram' }, { status: 500 });
  }
}
