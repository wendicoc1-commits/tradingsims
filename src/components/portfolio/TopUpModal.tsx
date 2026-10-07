'use client';

import React, { useState } from 'react';
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
  CheckCheck,
  TrendingUp,
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

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const router = useRouter();
  const { cash, topUpCashWithBonus } = usePortfolioStore();

  const [selectedPay, setSelectedPay] = useState<number>(20_000);
  const [customPay, setCustomPay] = useState<string>('');
  const [copiedNMID, setCopiedNMID] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimedBonus, setClaimedBonus] = useState<number>(0);
  const [newCashBalance, setNewCashBalance] = useState<number>(cash);

  if (!isOpen) return null;

  // Nilai transfer yang dipilih
  const activePay = customPay ? Math.max(10_000, parseInt(customPay.replace(/\D/g, '') || '0', 10)) : selectedPay;
  const multiplier = Math.floor(activePay / 10_000);
  const virtualCashReceived = multiplier * 1_000_000;

  const handleCopyNMID = () => {
    navigator.clipboard.writeText('ID1026539745327');
    setCopiedNMID(true);
    setTimeout(() => setCopiedNMID(false), 2000);
  };

  // Alur selesai pembayaran -> langsung masuk uang ke portofolio
  const handleConfirmPayment = () => {
    if (activePay < 10_000 || isVerifying) return;

    setIsVerifying(true);

    // Simulasi verifikasi cepat 1 detik lalu masukkan uang secara instan
    setTimeout(() => {
      const res = topUpCashWithBonus(activePay);
      if (res.addedVirtualCash > 0) {
        setClaimedBonus(res.addedVirtualCash);
        setNewCashBalance(res.newTotalCash);
        setIsVerifying(false);
        setIsSuccess(true);
        bloombergAudio.playOrderFilledChime();
      } else {
        setIsVerifying(false);
      }
    }, 1200);
  };

  const handleGoToPortfolio = () => {
    setIsSuccess(false);
    onClose();
    router.push('/portfolio');
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
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
                Top Up Kas Portofolio (QRIS)
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  10k = 1 Juta Saldo
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Selesai pembayaran uang langsung masuk ke saldo kas portofolio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {isSuccess ? (
            /* ── Tampilan Sukses (Uang Sudah Masuk Langsung) ── */
            <div className="py-6 px-4 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="relative w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="w-12 h-12" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs font-black">
                  ✓
                </span>
              </div>

              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  PEMBAYARAN DITERIMA & SUKSES
                </span>
                <h4 className="text-2xl font-black text-white mt-2">
                  Saldo Langsung Masuk ke Portofolio!
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Dana kas simulasi RDN telah disuntikkan secara otomatis dan siap ditransaksikan sekarang juga.
                </p>
              </div>

              {/* Rincian Kas */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/40 space-y-2.5 max-w-md mx-auto text-left shadow-lg">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Nominal Transfer QRIS:</span>
                  <span className="font-bold text-white">Rp {activePay.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-emerald-400 pt-1 border-t border-zinc-800/80">
                  <span>Saldo Kas Ditambahkan:</span>
                  <span className="text-base font-extrabold">+Rp {claimedBonus.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-300 pt-1 border-t border-zinc-800/80">
                  <span>Total Saldo Kas Baru:</span>
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
                  Lanjut Trading
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Promo Banner Konversi */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">Konversi Otomatis Langsung:</span> Setiap transfer{' '}
                  <b className="text-white">Rp 10.000</b> langsung masuk{' '}
                  <b className="text-emerald-400">Rp 1.000.000 Saldo Kas Portofolio</b> tanpa menunggu lama!
                </div>
              </div>

              {/* 1. Pilih Paket */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2.5">
                  1. Pilih Nominal Pembayaran:
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
                        <div className="text-xs text-zinc-400 mb-1">Bayar QRIS:</div>
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
                  <div className="text-[11px] text-zinc-400">Total Transfer QRIS:</div>
                  <div className="text-base font-bold text-white">
                    Rp {activePay.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">Uang Masuk ke Portofolio:</div>
                  <div className="text-base font-extrabold text-emerald-400">
                    +Rp {virtualCashReceived.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* 2. QRIS Code Resmi */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    2. Scan QRIS Pembayaran:
                  </label>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Merchant Resmi
                  </span>
                </div>

                {/* Gambar QRIS Resmi */}
                <div className="relative w-full max-w-[280px] mx-auto rounded-xl overflow-hidden border-2 border-zinc-700/80 shadow-2xl bg-white p-2">
                  <Image
                    src="/images/qris-topup.png"
                    alt="QRIS Gopay Merchant Pokelover Gaming"
                    width={400}
                    height={550}
                    className="w-full h-auto object-contain rounded-lg"
                    priority
                  />
                </div>

                <div className="text-center space-y-1">
                  <div className="font-bold text-sm text-zinc-100">POKELOVER, GAMING</div>
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono">
                    <span>NMID: ID1026539745327</span>
                    <button
                      type="button"
                      onClick={handleCopyNMID}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      title="Salin NMID"
                    >
                      {copiedNMID ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Mendukung semua m-Banking &amp; E-Wallet: <b>BCA, Mandiri, BRI, BNI, GoPay, DANA, OVO, ShopeePay</b>
                  </div>
                </div>
              </div>

              {/* 3. Tombol Selesai Bayar Langsung Masuk Portofolio */}
              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  3. Selesai Pembayaran:
                </label>

                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Memverifikasi Pembayaran &amp; Memasukkan Saldo...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-5 h-5" />
                      <span>SAYA SUDAH BAYAR — LANGSUNG MASUKKAN KE PORTOFOLIO</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Proses Instan &amp; Real-time
                  </span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Halo Admin, saya telah melakukan Top Up Simulasi Trading Rp ${activePay.toLocaleString('id-ID')} via QRIS (POKELOVER, GAMING) untuk mendapatkan Saldo Kas Rp ${virtualCashReceived.toLocaleString('id-ID')}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    <span>Hubungi Admin WA</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
