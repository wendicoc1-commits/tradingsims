import crypto from 'crypto';

export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export function getMidtransConfig(): MidtransConfig {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const clientKey = process.env.MIDTRANS_CLIENT_KEY || '';
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

  return { serverKey, clientKey, isProduction };
}

export function getMidtransBaseUrl(isProduction: boolean): string {
  return isProduction
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2';
}

export interface CreateQrisParams {
  orderId: string;
  grossAmount: number;
  customerName?: string;
}

export interface CreateQrisResponse {
  success: boolean;
  orderId: string;
  grossAmount: number;
  qrString?: string;
  qrImageUrl?: string;
  expiresAt: string;
  isSimulator?: boolean;
  message?: string;
}

/**
 * Membuat transaksi QRIS Dinamis via Midtrans Core API
 */
export async function createQrisTransaction({
  orderId,
  grossAmount,
  customerName = 'Member TradingSims',
}: CreateQrisParams): Promise<CreateQrisResponse> {
  const config = getMidtransConfig();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 menit

  // Jika belum memasang MIDTRANS_SERVER_KEY, gunakan Fallback Simulator QRIS
  if (!config.serverKey) {
    // Generate QR String Mock atau gambar QRIS
    return {
      success: true,
      orderId,
      grossAmount,
      qrString: `00020101021226670016ID.CO.GOPAY.WWW01189360091431026539740215ID102653974532752045812530336054${grossAmount.toString().padStart(6, '0')}5802ID5917TRADINGSIMS DYNAMIC6007JAKARTA6304${orderId.slice(-4)}`,
      qrImageUrl: `/images/qris-topup.png`,
      expiresAt,
      isSimulator: true,
      message: 'MIDTRANS_SERVER_KEY belum diatur. Menggunakan QRIS Merchant Pokelover Gaming.',
    };
  }

  const baseUrl = getMidtransBaseUrl(config.isProduction);
  const authHeader = `Basic ${Buffer.from(`${config.serverKey}:`).toString('base64')}`;

  try {
    const payload = {
      payment_type: 'qris',
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      qris: {
        acquirer: 'gopay',
      },
      customer_details: {
        first_name: customerName,
      },
    };

    const res = await fetch(`${baseUrl}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || (data.status_code !== '201' && data.status_code !== '200')) {
      return {
        success: false,
        orderId,
        grossAmount,
        expiresAt,
        message: data.status_message || 'Gagal membuat QRIS di Midtrans.',
      };
    }

    // Ambil URL gambar QR dari daftar actions
    const qrAction = Array.isArray(data.actions)
      ? data.actions.find((a: any) => a.name === 'generate-qr-code')
      : null;

    return {
      success: true,
      orderId,
      grossAmount,
      qrString: data.qr_string,
      qrImageUrl: qrAction?.url || `/api/payment/qr-image?text=${encodeURIComponent(data.qr_string || '')}`,
      expiresAt,
      isSimulator: false,
    };
  } catch (err: any) {
    return {
      success: false,
      orderId,
      grossAmount,
      expiresAt,
      message: err.message || 'Network error saat menghubungi Midtrans API.',
    };
  }
}

/**
 * Verifikasi signature webhook yang dikirimkan oleh Midtrans
 * Formula Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(payload: {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
}): boolean {
  const config = getMidtransConfig();
  if (!config.serverKey) return true; // Simulator mode

  const rawStr = `${payload.order_id}${payload.status_code}${payload.gross_amount}${config.serverKey}`;
  const calculatedSig = crypto.createHash('sha512').update(rawStr).digest('hex');

  return calculatedSig === payload.signature_key;
}

/**
 * Cek status transaksi langsung ke server Midtrans
 */
export async function queryMidtransStatus(orderId: string): Promise<{
  transactionStatus?: string;
  fraudStatus?: string;
  grossAmount?: number;
  settlementTime?: string;
  raw?: any;
}> {
  const config = getMidtransConfig();
  if (!config.serverKey) {
    return { transactionStatus: 'pending' };
  }

  const baseUrl = getMidtransBaseUrl(config.isProduction);
  const authHeader = `Basic ${Buffer.from(`${config.serverKey}:`).toString('base64')}`;

  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(orderId)}/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: authHeader,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return {
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      grossAmount: data.gross_amount ? parseFloat(data.gross_amount) : undefined,
      settlementTime: data.settlement_time,
      raw: data,
    };
  } catch {
    return { transactionStatus: 'unknown' };
  }
}
