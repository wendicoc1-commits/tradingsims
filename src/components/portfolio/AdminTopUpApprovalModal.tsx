'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { useTopUpApprovalStore, TopUpRequest } from '@/store/useTopUpApprovalStore';

interface AdminTopUpApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminTopUpApprovalModal({ isOpen, onClose }: AdminTopUpApprovalModalProps) {
  const {
    requests,
    adminPin,
    approveRequest,
    rejectRequest,
    verifyAdminPin,
    changeAdminPin,
    clearHistory,
  } = useTopUpApprovalStore();

  const [inputPin, setInputPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Ganti PIN Form
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(inputPin)) {
      setIsAuthenticated(true);
      setPinError(false);
      setInputPin('');
    } else {
      setPinError(true);
      setInputPin('');
    }
  };

  const handleApprove = (req: TopUpRequest) => {
    const res = approveRequest(req.id);
    if (res.success) {
      setActionSuccessMsg(`✅ Tiket ${req.id} disetujui! Saldo +Rp ${res.addedVirtualCash?.toLocaleString('id-ID')} telah dicairkan ke portofolio.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleReject = (req: TopUpRequest) => {
    const reason = prompt('Alasan penolakan (opsional):', 'Uang belum masuk ke rekening GoPay atau bukti transfer tidak valid.');
    if (reason !== null) {
      rejectRequest(req.id, reason);
      setActionSuccessMsg(`❌ Tiket ${req.id} berhasil ditolak.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length < 4) {
      setPinChangeMsg('PIN baru minimal 4 digit.');
      return;
    }
    const ok = changeAdminPin(currentPinInput, newPinInput);
    if (ok) {
      setPinChangeMsg('PIN Admin berhasil diperbarui!');
      setCurrentPinInput('');
      setNewPinInput('');
      setTimeout(() => {
        setPinChangeMsg(null);
        setShowChangePin(false);
      }, 2000);
    } else {
      setPinChangeMsg('PIN lama salah.');
    }
  };

  const filteredRequests = requests.filter((r) => r.status === activeTab);
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                Panel Verifikasi Top-Up Admin
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Metode A: Cek Mutasi Manual
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Persetujuan manual: Uang dipastikan masuk ke rekening sebelum saldo dicairkan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {!isAuthenticated ? (
            /* ── Form Login PIN Admin ── */
            <div className="py-8 px-4 text-center max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-lg">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Masukkan PIN Rahasia Admin</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Area khusus pemilik website untuk memverifikasi dan menyetujui mutasi transfer member.
                </p>
                <p className="text-[11px] text-amber-400/90 font-mono mt-1">
                  (Default PIN: <b>8888</b>)
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  maxLength={8}
                  placeholder="Masukkan 4-8 digit PIN"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  className="w-full py-2.5 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />

                {pinError && (
                  <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    PIN Admin salah. Silakan coba lagi.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 font-bold text-zinc-950 text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Buka Panel Admin</span>
                </button>
              </form>
            </div>
          ) : (
            /* ── Dashboard Admin Terbuka ── */
            <div className="space-y-4">
              {actionSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Top Navigation & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'PENDING'
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menunggu ({pendingCount})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('APPROVED')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'APPROVED'
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Disetujui</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('REJECTED')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      activeTab === 'REJECTED'
                        ? 'bg-rose-500 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Ditolak</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setShowChangePin(!showChangePin)}
                    className="text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Ganti PIN</span>
                  </button>
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="text-zinc-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer ml-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Kunci</span>
                  </button>
                </div>
              </div>

              {/* Form Ganti PIN Dropdown */}
              {showChangePin && (
                <form
                  onSubmit={handleChangePinSubmit}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5 text-xs animate-in slide-in-from-top-2"
                >
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Ubah PIN Akses Admin</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      placeholder="PIN Lama (cth: 8888)"
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono"
                    />
                    <input
                      type="password"
                      placeholder="PIN Baru (min. 4 digit)"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  {pinChangeMsg && (
                    <div className="text-[11px] font-semibold text-amber-400">{pinChangeMsg}</div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowChangePin(false)}
                      className="px-2.5 py-1 text-zinc-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400"
                    >
                      Simpan PIN Baru
                    </button>
                  </div>
                </form>
              )}

              {/* Daftar Antrian Tiket */}
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <Receipt className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">
                    Tidak ada permintaan top-up berstatus <b>{activeTab}</b>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3 hover:border-zinc-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-zinc-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">{req.id}</span>
                          <span className="text-zinc-500">&bull;</span>
                          <span className="text-zinc-400">{req.createdAt}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : req.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {req.status === 'PENDING'
                            ? '⏳ MENUNGGU VERIFIKASI'
                            : req.status === 'APPROVED'
                            ? '✅ TELAH DISETUJUI'
                            : '❌ DITOLAK'}
                        </span>
                      </div>

                      {/* Detail Transfer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="text-zinc-400">Pengirim:</div>
                          <div className="font-bold text-white text-sm">{req.senderName}</div>
                          <div className="text-zinc-400 text-[11px]">
                            Bank / E-Wallet: <b className="text-zinc-200">{req.senderBank}</b>
                          </div>
                          {req.refNote && (
                            <div className="text-zinc-400 text-[11px]">
                              Catatan / Ref: <span className="font-mono text-zinc-300">{req.refNote}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 text-left sm:text-right">
                          <div className="text-zinc-400">Nominal Transfer QRIS:</div>
                          <div className="font-mono font-extrabold text-white text-base">
                            Rp {req.nominalIDR.toLocaleString('id-ID')}
                          </div>
                          <div className="text-emerald-400 font-bold flex sm:justify-end items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Saldo Kas: +Rp {req.virtualCash.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lampiran Bukti Transfer (Screenshot) */}
                      {req.proofImageBase64 && (
                        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-zinc-400 flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5 text-amber-400" />
                            Struk Bukti Terlampir
                          </span>
                          <button
                            type="button"
                            onClick={() => setPreviewImage(req.proofImageBase64!)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti Foto</span>
                          </button>
                        </div>
                      )}

                      {/* Action Buttons (Hanya untuk PENDING) */}
                      {req.status === 'PENDING' && (
                        <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleReject(req)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-700 hover:border-rose-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Tolak (Uang Tidak Masuk)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApprove(req)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Setujui &amp; Masukkan Saldo (+Rp {req.virtualCash.toLocaleString('id-ID')})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Preview Struk Bukti Transfer */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg max-h-[85vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[70vh]">
              <Image
                src={previewImage}
                alt="Bukti Transfer Struk"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
