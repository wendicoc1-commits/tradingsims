'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  QrCode,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Download,
  AlertCircle,
  ExternalLink,
  Wallet,
  ArrowRight,
  ShieldCheck,
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
  const { cash, topUpCashWithBonus } = usePortfolioStore();

  const [selectedPay, setSelectedPay] = useState<number>(20_000);
  const [customPay, setCustomPay] = useState<string>('');
  const [copiedNMID, setCopiedNMID] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [refCode, setRefCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimedBonus, setClaimedBonus] = useState<number>(0);

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

  const handleClaimTopUp = () => {
    if (activePay < 10_000) return;
    const res = topUpCashWithBonus(activePay);
    if (res.addedVirtualCash > 0) {
      setClaimedBonus(res.addedVirtualCash);
      setIsSuccess(true);
      bloombergAudio.playOrderFilledChime();
    }
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
                Top Up Saldo Kas RDN
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                  Rate 10k = 1 Juta
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Suntik modal trading saham & crypto real-time
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
            /* Tampilan Sukses */
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Top Up Berhasil Diklaim!</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Saldo simulasi telah ditambahkan ke portofolio Anda.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/30 space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Nominal Transfer QRIS:</span>
                  <span className="font-semibold text-zinc-200">Rp {activePay.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-400">
                  <span>Saldo Kas Ditambahkan:</span>
                  <span>+Rp {claimedBonus.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs text-zinc-300">
                  <span>Total Saldo Kas Baru:</span>
                  <span className="font-bold text-amber-400">Rp {cash.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full max-w-sm mx-auto py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-white shadow-lg transition"
              >
                Mulai Trading Sekarang
              </button>
            </div>
          ) : (
            <>
              {/* Promo Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">Skema Kelipatan Spesial:</span> Setiap{' '}
                  <b className="text-white">Rp 10.000</b> Anda otomatis mendapatkan{' '}
                  <b className="text-emerald-400">Rp 1.000.000 Saldo Kas</b> untuk belanja saham IDX & koin kripto!
                </div>
              </div>

              {/* 1. Pilih Paket */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2.5">
                  1. Pilih Paket Top Up:
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
                        className={`relative p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                        }`}
                      >
                        {pkg.badge && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-800 border border-zinc-700 text-amber-300">
                            {pkg.badge}
                          </span>
                        )}
                        <div className="text-xs text-zinc-400 mb-1">Bayar:</div>
                        <div className="font-bold text-sm text-zinc-100">
                          Rp {pkg.payIDR.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          +Rp {pkg.virtualIDR.toLocaleString('id-ID')}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Input Custom Nominal */}
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <span>Atau ketik nominal sendiri (kelipatan Rp 10.000):</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">Rp</span>
                    <input
                      type="number"
                      step={10000}
                      min={10000}
                      placeholder="Contoh: 30000, 70000, dsb"
                      value={customPay}
                      onChange={(e) => setCustomPay(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-amber-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Ringkasan Konversi */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-400">Total Pembayaran QRIS:</div>
                  <div className="text-base font-bold text-white">
                    Rp {activePay.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">Saldo Kas Didapat:</div>
                  <div className="text-base font-bold text-emerald-400">
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
                    Terverifikasi GPN
                  </span>
                </div>

                {/* Gambar QRIS Resmi dari user */}
                <div className="relative w-full max-w-[280px] mx-auto rounded-xl overflow-hidden border-2 border-zinc-700/80 shadow-xl bg-white p-2">
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
                    Bisa di-scan dari <b>GoPay, BCA, Mandiri, BNI, BRI, DANA, OVO, ShopeePay, Seabank</b>, dll.
                  </div>
                </div>
              </div>

              {/* 3. Klaim Saldo */}
              <div className="space-y-3 pt-1">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  3. Konfirmasi & Klaim:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nama Pengirim (Opsional)"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Ref / Catatan Transfer"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleClaimTopUp}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Klaim Saldo (+Rp {virtualCashReceived.toLocaleString('id-ID')})
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Halo Admin, saya telah melakukan Top Up Simulasi Trading Rp ${activePay.toLocaleString('id-ID')} via QRIS (POKELOVER, GAMING) untuk mendapatkan Saldo Kas Rp ${virtualCashReceived.toLocaleString('id-ID')}. Nama: ${senderName || 'Member'}, Ref: ${refCode || '-'}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Konfirmasi WA</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
