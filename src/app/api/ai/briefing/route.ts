import { NextRequest, NextResponse } from 'next/server';
import { generateAutonomousBriefing } from '@/lib/hedgefund/autonomousBriefingEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const briefingType = typeParam === 'CLOSING_WRAP' ? 'CLOSING_WRAP' : 'MORNING_OPEN';

    const briefing = await generateAutonomousBriefing(briefingType);
    return NextResponse.json({ ok: true, briefing });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Gagal membuat briefing' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const dispatchTelegram = searchParams.get('dispatch') === 'telegram';
    const briefingType = typeParam === 'CLOSING_WRAP' ? 'CLOSING_WRAP' : 'MORNING_OPEN';

    const briefing = await generateAutonomousBriefing(briefingType);

    let telegramSent = false;
    let telegramError: string | null = null;

    if (dispatchTelegram) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (botToken && chatId) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: briefing.telegramMessageHtml,
              parse_mode: 'HTML',
              disable_web_page_preview: true,
            }),
          });
          const tgJson = await tgRes.json().catch(() => ({}));
          telegramSent = Boolean(tgJson.ok);
          if (!telegramSent) telegramError = tgJson.description || 'Gagal mengirim pesan Telegram';
        } catch (err: any) {
          telegramError = err?.message || 'Error koneksi Telegram';
        }
      } else {
        telegramError = 'TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum disetel di environment VPS';
      }
    }

    return NextResponse.json({
      ok: true,
      briefing,
      telegram: {
        dispatched: dispatchTelegram,
        sent: telegramSent,
        error: telegramError,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Gagal memproses briefing' }, { status: 500 });
  }
}
