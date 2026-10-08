import { NextRequest, NextResponse } from 'next/server';
import { saveUserPortfolio, getUserPortfolio, resetUserPortfolio } from '@/lib/server/portfolioStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;
    const userId = searchParams.get('userId') || undefined;

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diberikan' }, { status: 400 });
    }

    const portfolio = getUserPortfolio({ email, userId });

    return NextResponse.json({
      success: true,
      portfolio: portfolio || null,
      isNew: !portfolio,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userId, cash, realizedPL, holdings, orders, conditionalOrders, dividends, lastUpdated } = body;

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diisi' }, { status: 400 });
    }

    if (email) {
      const { getUserByEmail, registerOrUpdateUser } = await import('@/lib/server/portfolioStorage');
      const existing = getUserByEmail(email);
      if (!existing) {
        registerOrUpdateUser(email, undefined, email.split('@')[0]);
      }
    }

    const saved = saveUserPortfolio(
      { email, userId },
      {
        cash: typeof cash === 'number' ? cash : 100_000_000,
        realizedPL: typeof realizedPL === 'number' ? realizedPL : 0,
        holdings: Array.isArray(holdings) ? holdings : [],
        orders: Array.isArray(orders) ? orders : [],
        conditionalOrders: Array.isArray(conditionalOrders) ? conditionalOrders : [],
        dividends: Array.isArray(dividends) ? dividends : [],
        lastUpdated: lastUpdated || Date.now(),
      }
    );

    return NextResponse.json({
      success: saved,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const nominal = parseInt(searchParams.get('nominal') || '100000000', 10);

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diberikan' }, { status: 400 });
    }

    resetUserPortfolio({ email, userId }, isNaN(nominal) ? 100_000_000 : nominal);

    return NextResponse.json({
      success: true,
      message: 'Portofolio pengguna berhasil di-reset.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
