'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  QrCode,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Upload,
  Clock,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { useTopUpApprovalStore, TopUpRequest } from '@/store/useTopUpApprovalStore';
import AdminTopUpApprovalModal from './AdminTopUpApprovalModal';

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
  { payIDR: 500_000, virtualIDR: 5_000_000, badge: 'Institusi' },
];

const BANK_OPTIONS = [
  'BCA',
  'Bank Mandiri',
  'BRI',
  'BNI',
  'GoPay',
  'DANA',
  'OVO',
  'ShopeePay',
  'Seabank',
  'Bank Jago',
  'Lainnya',
];

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const { cash } = usePortfolioStore();
  const { submitRequest, requests } = useTopUpApprovalStore();

  const [step, setStep] = useState<'FORM' | 'SUBMITTED'>('FORM');
  const [selectedPay, setSelectedPay] = useState<number>(20_000);
  const [customPay, setCustomPay] = useState<string>('');
  const [copiedNMID, setCopiedNMID] = useState(false);

  // Form Fields Member
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('BCA');
  const [refNote, setRefNote] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Tiket yang baru disubmit
  const [lastSubmittedTicket, setLastSubmittedTicket] = useState<TopUpRequest | null>(null);

  // Admin Modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran foto bukti transfer maksimal 5 MB.');
      return;
    }

    setProofFileName(file.name);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setProofImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      setFormError('Silakan masukkan nama pemilik rekening/pengirim transfer.');
      return;
    }

    setFormError(null);

    // Submit ke antrian pending (Saldo TIDAK bertambah sampai Admin approve)
    const ticket = submitRequest({
      senderName: senderName.trim(),
      senderBank,
      nominalIDR: activePay,
      refNote: refNote.trim(),
      proofImageBase64: proofImageBase64 || undefined,
    });

    setLastSubmittedTicket(ticket);
    setStep('SUBMITTED');
  };

  const handleResetAndClose = () => {
    setStep('FORM');
    setSenderName('');
    setRefNote('');
    setProofImageBase64(null);
    setProofFileName(null);
    setFormError(null);
    onClose();
  };

  // Cek apakah tiket terakhir sudah disetujui saat modal masih terbuka
  const liveTicketStatus = lastSubmittedTicket
    ? requests.find((r) => r.id === lastSubmittedTicket.id)?.status
    : null;

  return (
    <>
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
                  Top Up Saldo Kas RDN (Metode A)
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                    10k = 1 Juta Saldo
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Verifikasi Mutasi: Saldo dicairkan setelah uang dipastikan masuk rekening
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 space-y-5">
            {step === 'SUBMITTED' ? (
              /* ── Layar Tiket Terkirim (Menunggu Persetujuan Admin) ── */
              <div className="py-6 px-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
                {liveTicketStatus === 'APPROVED' ? (
                  /* Jika Admin sudah menyetujui */
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-10 h-10 animate-bounce" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        DISETUJUI OLEH ADMIN
                      </span>
                      <h4 className="text-xl font-bold text-white mt-2">
                        Saldo Telah Masuk ke Portofolio!
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Dana transfer Anda telah diverifikasi oleh pemilik website dan dicairkan ke saldo kas.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-2 max-w-sm mx-auto text-left text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Tiket ID:</span>
                        <span className="font-mono text-white font-bold">{lastSubmittedTicket?.id}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Saldo Ditambahkan:</span>
                        <span>+Rp {lastSubmittedTicket?.virtualCash.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-zinc-300 pt-1 border-t border-zinc-800">
                        <span>Saldo Kas Portofolio:</span>
                        <span className="font-bold text-amber-400">Rp {cash.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleResetAndClose}
                      className="w-full max-w-sm mx-auto py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-white text-sm shadow-lg transition cursor-pointer"
                    >
                      Buka Portofolio &amp; Mulai Trading
                    </button>
                  </div>
                ) : (
                  /* Status PENDING (Menunggu Admin) */
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-pulse">
                      <Clock className="w-8 h-8" />
                    </div>

                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        STATUS: MENUNGGU VERIFIKASI ADMIN
                      </span>
                      <h4 className="text-xl font-bold text-white mt-2">
                        Bukti Pembayaran Berhasil Dikirim!
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                        Admin sedang memeriksa mutasi rekening GoPay. Begitu dana Anda diverifikasi masuk, saldo kas portofolio akan <b>otomatis bertambah</b>.
                      </p>
                    </div>

                    {/* Rincian Tiket */}
                    <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 max-w-sm mx-auto text-left text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>ID Tiket:</span>
                        <span className="font-mono font-bold text-amber-400">{lastSubmittedTicket?.id}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Pengirim:</span>
                        <span className="text-white font-semibold">{lastSubmittedTicket?.senderName} ({lastSubmittedTicket?.senderBank})</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Nominal Transfer:</span>
                        <span className="font-bold text-white">Rp {lastSubmittedTicket?.nominalIDR.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-zinc-800">
                        <span>Saldo Akan Didapat:</span>
                        <span>+Rp {lastSubmittedTicket?.virtualCash.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Tombol Konfirmasi WhatsApp Admin */}
                    <div className="space-y-2 max-w-sm mx-auto pt-1">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Halo Admin TradingSims, saya sudah transfer Top Up QRIS Rp ${lastSubmittedTicket?.nominalIDR.toLocaleString('id-ID')} (POKELOVER, GAMING).\n\nID Tiket: ${lastSubmittedTicket?.id}\nPengirim: ${lastSubmittedTicket?.senderName} (${lastSubmittedTicket?.senderBank})\nMohon diverifikasi agar saldo kas masuk. Terima kasih!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                      >
                        <span>Konfirmasi ke WhatsApp Admin Sekarang</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={handleResetAndClose}
                        className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-semibold transition"
                      >
                        Tutup &amp; Tunggu Verifikasi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Form Pemesanan & Scan QRIS Member ── */
              <form onSubmit={handleSubmitProof} className="space-y-5">
                {/* Promo Banner */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-300">Skema Terverifikasi:</span> Transfer{' '}
                    <b className="text-white">Rp 10.000</b> via QRIS $\rightarrow$ Dapatkan{' '}
                    <b className="text-emerald-400">Rp 1.000.000 Saldo Kas Portofolio</b> (berlaku kelipatan setelah diverifikasi Admin).
                  </div>
                </div>

                {/* 1. Pilih Paket */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2.5">
                    1. Pilih Nominal Top Up:
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
                      <span>Atau ketik nominal sendiri (kelipatan Rp 10.000):</span>
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
                <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-zinc-400">Total Transfer QRIS:</div>
                    <div className="text-base font-bold text-white">
                      Rp {activePay.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-zinc-400">Saldo Masuk Setelah Disetujui:</div>
                    <div className="text-base font-extrabold text-emerald-400">
                      +Rp {virtualCashReceived.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* 2. QRIS Code Resmi Pemilik */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      2. Scan QRIS Pembayaran:
                    </label>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      POKELOVER, GAMING
                    </span>
                  </div>

                  {/* Gambar QRIS Resmi */}
                  <div className="relative w-full max-w-[270px] mx-auto rounded-xl overflow-hidden border-2 border-zinc-700 bg-white p-2.5 shadow-2xl">
                    <Image
                      src="/images/qris-topup.png"
                      alt="QRIS Gopay Merchant Pokelover Gaming"
                      width={400}
                      height={550}
                      className="w-full h-auto object-contain rounded"
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
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        title="Salin NMID"
                      >
                        {copiedNMID ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Bisa di-scan dari <b>GoPay, BCA, Mandiri, BRI, BNI, DANA, OVO, ShopeePay, Seabank</b>, dll.
                    </div>
                  </div>
                </div>

                {/* 3. Form Bukti Transfer Member */}
                <div className="space-y-3 pt-1">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    3. Isi Data Konfirmasi Transfer:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-zinc-400 text-[11px] block mb-1">
                        Nama Pengirim (Sesuai Rekening) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 text-[11px] block mb-1">
                        Bank / E-Wallet Asal *
                      </label>
                      <select
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                      >
                        {BANK_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-zinc-400 text-[11px] block mb-1">
                      Catatan / No. Referensi Transfer (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ref 9821 / Jam 14:30"
                      value={refNote}
                      onChange={(e) => setRefNote(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Input Foto Bukti Transfer Struk */}
                  <div className="text-xs space-y-1.5">
                    <label className="text-zinc-400 text-[11px] block">
                      Upload Screenshot Struk Bukti Transfer (Opsional tapi Direkomendasikan)
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pilih Foto Struk Transfer</span>
                      </button>

                      {proofFileName ? (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono truncate max-w-[200px]">
                          <FileCheck className="w-3.5 h-3.5" />
                          {proofFileName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Belum ada file dipilih</span>
                      )}
                    </div>
                  </div>

                  {formError && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Tombol Kirim Bukti Transfer */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>📩 KIRIM BUKTI PEMBAYARAN KE ADMIN</span>
                  </button>

                  <p className="text-[11px] text-center text-zinc-400">
                    Saldo akan masuk ke portofolio setelah Admin memverifikasi dana masuk ke GoPay.
                  </p>
                </div>
              </form>
            )}

            {/* Footer Admin Link */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Sistem Proteksi Mutasi v2.0</span>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition"
                title="Buka panel persetujuan mutasi (Khusus Pemilik)"
              >
                <Lock className="w-3 h-3 text-amber-500" />
                <span>Panel Verifikasi Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Admin Approval */}
      <AdminTopUpApprovalModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
}
