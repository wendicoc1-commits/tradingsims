// Repository Transaksi Pembayaran QRIS Midtrans
// Digunakan untuk melacak status transaksi antara Create, Webhook, dan Status Polling.

export interface QrisTransactionRecord {
  orderId: string;
  grossAmount: number;
  virtualCashAmount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  paymentType: 'qris';
  qrString?: string;
  qrImageUrl?: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  midtransTransactionId?: string;
  settlementInfo?: any;
}

// Global in-memory cache persist across Next.js API re-evaluations
const globalForPayment = globalThis as unknown as {
  paymentTransactions?: Map<string, QrisTransactionRecord>;
};

if (!globalForPayment.paymentTransactions) {
  globalForPayment.paymentTransactions = new Map<string, QrisTransactionRecord>();
}

export const paymentTransactions = globalForPayment.paymentTransactions;

export function saveTransaction(record: QrisTransactionRecord) {
  paymentTransactions.set(record.orderId, record);
}

export function getTransaction(orderId: string): QrisTransactionRecord | undefined {
  return paymentTransactions.get(orderId);
}

export function markTransactionPaid(
  orderId: string,
  settlementInfo?: any
): QrisTransactionRecord | undefined {
  const record = paymentTransactions.get(orderId);
  if (!record) return undefined;

  record.status = 'PAID';
  record.paidAt = new Date().toISOString();
  if (settlementInfo) {
    record.settlementInfo = settlementInfo;
    record.midtransTransactionId = settlementInfo.transaction_id || record.midtransTransactionId;
  }
  paymentTransactions.set(orderId, record);
  return record;
}

export function markTransactionExpired(orderId: string): QrisTransactionRecord | undefined {
  const record = paymentTransactions.get(orderId);
  if (!record) return undefined;

  record.status = 'EXPIRED';
  paymentTransactions.set(orderId, record);
  return record;
}
