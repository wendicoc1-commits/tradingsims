'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  QrCode,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Loader2,
  TrendingUp,
  RefreshCw,
  Clock,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { bloombergAudio } from '@/lib/bloombergAudio';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PACKAGES = [
  { payIDR: 10_000, virtualIDR: 1_000_000, badge: 'Pemula' },
  { payIDR: 20_000, virtualIDR: 2_000_000, badge: 'Favorit' },
  { payIDR: 50_000, virtualIDR: 5_000_000, badge: '🔥 POPULER' },
  { payIDR: 100_000, virtualIDR: 10_000_000, badge: '⭐ BEST VALUE' },
  { payIDR: 200_000, virtualIDR: 20_000_000, badge: 'Whale' },
  { payIDR: 500_000, virtualIDR: 50_000_000, badge: 'Institusi' },
];

interface QrisInvoiceData {
  orderId: string;
  grossAmount: number;
  virtualCashAmount: number;
  qrString?: string;
  qrImageUrl?: string;
  expiresAt: string;
  isConfigured: boolean;
  isSimulator?: boolean;
}

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const router = useRouter();
  const { cash, topUpCashWithBonus } = usePortfolioStore();

  const [step, setStep] = useState<'SELECT' | 'PAYING' | 'SUCCESS'>('SELECT');
  const [selectedPay, setSelectedPay] = useState<number>(20_000);
  const [customPay, setCustomPay] = useState<string>('');
  const [invoice, setInvoice] = useState<QrisInvoiceData | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newCashBalance, setNewCashBalance] = useState<number>(cash);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Nilai transfer yang dipilih
  const activePay = customPay ? Math.max(10_000, parseInt(customPay.replace(/\D/g, '') || '0', 10)) : selectedPay;
  const multiplier = Math.floor(activePay / 10_000);
  const virtualCashReceived = multiplier * 1_000_000;

  // Cleanup polling saat unmount atau modal tertutup
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // 1. Buat tagihan QRIS ke backend / Midtrans
  const handleCreateInvoice = async () => {
    setIsLoadingInvoice(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominalIDR: activePay }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal membuat QRIS.');
      }

      setInvoice(data);
      setStep('PAYING');
      startPolling(data.orderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghubungi server pembayaran.');
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  // 2. Polling realtime cek apakah uang sudah masuk ke Midtrans
  const startPolling = (orderId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      await verifyStatus(orderId, false);
    }, 3000);
  };

  const verifyStatus = async (orderId: string, manual = false) => {
    if (manual) setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();

      if (data.status === 'PAID') {
        // UANG RESMI TERBUKTI MASUK DARI GATEWAY!
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        const topUpResult = topUpCashWithBonus(data.grossAmount);
        setNewCashBalance(topUpResult.newTotalCash);
        setStep('SUCCESS');
        bloombergAudio.playOrderFilledChime();
      } else if (data.status === 'EXPIRED') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setErrorMessage('Waktu pembayaran QRIS telah habis. Silakan buat QRIS baru.');
      }
    } catch {
      // Ignored during passive polling
    } finally {
      if (manual) setIsCheckingStatus(false);
    }
  };

  // 3. Simulasi bayar untuk Sandbox Testing
  const handleSandboxSimulatorPay = async () => {
    if (!invoice?.orderId) return;
    setIsCheckingStatus(true);

    try {
      const res = await fetch('/api/payment/simulator-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: invoice.orderId }),
      });
      const data = await res.json();

      if (data.success) {
        // Cek status ulang seketika
        await verifyStatus(invoice.orderId, true);
      } else {
        alert(data.error || 'Gagal simulasi bayar.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyOrderId = () => {
    if (!invoice?.orderId) return;
    navigator.clipboard.writeText(invoice.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleResetAndClose = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setStep('SELECT');
    setInvoice(null);
    setErrorMessage(null);
    onClose();
  };

  const handleGoToPortfolio = () => {
    handleResetAndClose();
    router.push('/portfolio');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-1.5">
                Top Up Otomatis (Midtrans QRIS)
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  Rate 10k = 1 Juta
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Sistem Payment Gateway: Saldo masuk otomatis saat dana terverifikasi
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'SUCCESS' ? (
            /* ── Tampilan Sukses (Uang Terbukti Masuk) ── */
            <div className="py-6 px-4 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="relative w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="w-12 h-12" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs font-black">
                  ✓
                </span>
              </div>

              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  DANA BERHASIL DITERIMA & DIVERIFIKASI
                </span>
                <h4 className="text-2xl font-black text-white mt-2">
                  Saldo Telah Masuk ke Portofolio!
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Payment gateway telah mengonfirmasi pembayaran Anda secara sah. Saldo kas siap digunakan.
                </p>
              </div>

              {/* Rincian Kas */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/40 space-y-2.5 max-w-md mx-auto text-left shadow-lg">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Order ID:</span>
                  <span className="font-mono text-zinc-300">{invoice?.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Nominal Masuk Gateway:</span>
                  <span className="font-bold text-white">Rp {invoice?.grossAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-emerald-400 pt-1 border-t border-zinc-800/80">
                  <span>Saldo Kas Ditambahkan:</span>
                  <span className="text-base font-extrabold">+Rp {invoice?.virtualCashAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-300 pt-1 border-t border-zinc-800/80">
                  <span>Total Kas Portofolio Baru:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    Rp {newCashBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
                <button
                  onClick={handleGoToPortfolio}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 font-extrabold text-white text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Lihat di Portofolio</span>
                </button>
                <button
                  onClick={handleResetAndClose}
                  className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-sm font-bold transition cursor-pointer"
                >
                  Tutup & Trading
                </button>
              </div>
            </div>
          ) : step === 'PAYING' && invoice ? (
            /* ── Tampilan Menunggu Pembayaran (Dynamic QRIS) ── */
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Status Header */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-bold text-amber-300">Menunggu Pembayaran Member...</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 15 Menit
                </span>
              </div>

              {/* Box Rincian Tagihan */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Order ID:</span>
                  <div className="flex items-center gap-1.5 font-mono text-zinc-200">
                    <span>{invoice.orderId}</span>
                    <button onClick={handleCopyOrderId} className="text-zinc-400 hover:text-white" title="Salin Order ID">
                      {copiedOrderId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Nominal yang Harus Dibayar:</span>
                  <span className="text-sm font-extrabold text-white">
                    Rp {invoice.grossAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-zinc-800">
                  <span>Saldo Kas yang Akan Diterima:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    +Rp {invoice.virtualCashAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Barcode QRIS */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
                <div className="relative w-full max-w-[260px] mx-auto rounded-xl overflow-hidden border-2 border-zinc-700 bg-white p-2.5 shadow-xl">
                  {invoice.qrImageUrl ? (
                    <Image
                      src={invoice.qrImageUrl}
                      alt={`QRIS ${invoice.orderId}`}
                      width={300}
                      height={300}
                      className="w-full h-auto object-contain rounded"
                      priority
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-zinc-400 text-xs">
                      Memuat Barcode QRIS...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-zinc-200">
                    Scan via BCA, Mandiri, BRI, BNI, GoPay, DANA, OVO, ShopeePay
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Sistem mendeteksi transfer secara real-time. Saldo baru akan masuk setelah uang berhasil diterima.
                  </p>
                </div>
              </div>

              {/* Action Refresh Status & Indikator Gateway */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isCheckingStatus}
                  onClick={() => verifyStatus(invoice.orderId, true)}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isCheckingStatus ? 'Mengecek Server Gateway...' : 'Periksa Status Pembayaran Sekarang'}</span>
                </button>

                {/* Tombol Tester Sandbox jika dalam mode demo / simulator */}
                {invoice.isSimulator && (
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Mode Uji Coba Sandbox (Tester)</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Server Key Midtrans belum diisi di <code>.env</code>. Anda dapat menguji respon otomatis penerimaan saldo dengan tombol simulasi di bawah:
                    </p>
                    <button
                      type="button"
                      onClick={handleSandboxSimulatorPay}
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                    >
                      ⚡ Simulasikan Pembayaran Berhasil (Uji Coba Sandbox)
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-1">
                  <button
                    onClick={() => {
                      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                      setStep('SELECT');
                    }}
                    className="text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    ← Ganti Nominal
                  </button>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secure Auto-Settlement
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ── Tampilan Step 1 (Pilih Nominal Paket) ── */
            <>
              {/* Promo Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">Sistem Otomatis Gate 100%:</span> Setiap{' '}
                  <b className="text-white">Rp 10.000</b> yang Anda transfer langsung terverifikasi gateway dan menghasilkan{' '}
                  <b className="text-emerald-400">Rp 1.000.000 Saldo Kas</b> di akun Anda.
                </div>
              </div>

              {/* 1. Pilih Paket */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2.5">
                  1. Pilih Paket Pembayaran:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_PACKAGES.map((pkg) => {
                    const isSelected = !customPay && selectedPay === pkg.payIDR;
                    return (
                      <button
                        key={pkg.payIDR}
                        type="button"
                        onClick={() => {
                          setCustomPay('');
                          setSelectedPay(pkg.payIDR);
                        }}
                        className={`relative p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                        }`}
                      >
                        {pkg.badge && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-800 border border-zinc-700 text-amber-300">
                            {pkg.badge}
                          </span>
                        )}
                        <div className="text-xs text-zinc-400 mb-1">Transfer:</div>
                        <div className="font-bold text-sm text-zinc-100">
                          Rp {pkg.payIDR.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          +Rp {pkg.virtualIDR.toLocaleString('id-ID')} Kas
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Input Custom Nominal */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <span>Atau isi nominal kelipatan Rp 10.000:</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">Rp</span>
                    <input
                      type="number"
                      step={10000}
                      min={10000}
                      placeholder="Contoh: 30000, 70000, 150000, dsb"
                      value={customPay}
                      onChange={(e) => setCustomPay(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Ringkasan Konversi */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-400">Total Nominal Transfer:</div>
                  <div className="text-base font-bold text-white">
                    Rp {activePay.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">Saldo Kas Portofolio:</div>
                  <div className="text-base font-extrabold text-emerald-400">
                    +Rp {virtualCashReceived.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Tombol Lanjut ke QRIS */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isLoadingInvoice}
                  onClick={handleCreateInvoice}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isLoadingInvoice ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menghubungi Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>BUAT TAGIHAN QRIS DINAMIS</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-zinc-400">
                  QRIS otomatis dibuat oleh server. Uang dipastikan masuk ke rekening sebelum saldo terisi.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
