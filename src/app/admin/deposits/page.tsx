'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  PlusCircle, 
  ShieldCheck,
  User,
  Check,
  X
} from 'lucide-react';
import { 
  approveDeposit, 
  rejectDeposit, 
  getPendingDeposits, 
  createDepositRequest, 
  DepositRecord 
} from '../actions';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Bukti transfer tidak valid atau dana belum masuk');

  // Simulation modal state
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simUserId, setSimUserId] = useState('');
  const [simAmount, setSimAmount] = useState('50000000');

  const [isPendingAction, startTransition] = useTransition();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingDeposits();
      setDeposits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (depositId: string) => {
    startTransition(async () => {
      setActionMessage(null);
      const res = await approveDeposit(depositId);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Deposit berhasil disetujui!' });
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Gagal memproses approval' });
      }
    });
  };

  const handleRejectConfirm = () => {
    if (!rejectingId) return;
    startTransition(async () => {
      setActionMessage(null);
      const res = await rejectDeposit(rejectingId, rejectReason);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message || 'Deposit berhasil ditolak.' });
        setRejectingId(null);
        loadData();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Gagal menolak deposit' });
      }
    });
  };

  const handleCreateSimulation = async () => {
    if (!simUserId.trim()) {
      alert('Masukkan User ID member');
      return;
    }
    const num = parseFloat(simAmount);
    if (isNaN(num) || num <= 0) {
      alert('Masukkan nominal yang valid');
      return;
    }

    startTransition(async () => {
      const res = await createDepositRequest(simUserId.trim(), num);
      if (res.success) {
        setIsSimulateModalOpen(false);
        setActionMessage({ type: 'success', text: 'Tiket deposit simulasi berhasil dibuat!' });
        loadData();
      } else {
        alert(res.error || 'Gagal membuat simulasi');
      }
    });
  };

  // Filtered deposits
  const filtered = deposits.filter((d) => {
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = d.id.toLowerCase().includes(q);
      const matchEmail = d.user?.email.toLowerCase().includes(q);
      const matchName = d.user?.full_name.toLowerCase().includes(q);
      const matchUser = d.user_id.toLowerCase().includes(q);
      return matchId || matchEmail || matchName || matchUser;
    }
    return true;
  });

  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const approvedCount = deposits.filter((d) => d.status === 'APPROVED').length;
  const totalVolumeApproved = deposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Verifikasi & Approval Antrean Deposit
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Eksekusi persetujuan saldo wallet member menggunakan PostgreSQL ACID Transaction (<code className="text-emerald-400 font-mono">FOR UPDATE</code> lock).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            + Buat Tiket Deposit
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Antrean Menunggu</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">{pendingCount}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Perlu tindakan verifikasi admin</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Total Berhasil Disetujui</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">{approvedCount}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Saldo langsung ditambahkan ke wallet</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Volume Deposit Disetujui</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            Rp {new Intl.NumberFormat('id-ID').format(totalVolumeApproved)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Total likuiditas tersalurkan</p>
        </div>
      </div>

      {/* Controls & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/40 p-3 rounded-xl border border-neutral-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === st
                  ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID / Email / Nama..."
            className="w-full bg-neutral-950/80 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">ID Tiket</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Nominal (IDR)</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Waktu Masuk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500 text-xs">
                    {isLoading ? 'Memuat antrean deposit...' : 'Tidak ada permohonan deposit dalam kategori ini.'}
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-800/20 transition-colors">
                    {/* ID Tiket */}
                    <td className="px-4 py-3 font-mono text-neutral-400 text-[11px]">
                      {d.id.slice(0, 8)}...
                    </td>

                    {/* Member */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{d.user?.full_name || 'Member'}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{d.user?.email || d.user_id}</div>
                    </td>

                    {/* Nominal */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-white font-mono text-sm">
                        Rp {new Intl.NumberFormat('id-ID').format(d.amount)}
                      </div>
                    </td>

                    {/* Metode */}
                    <td className="px-4 py-3 text-neutral-300">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] font-mono border border-neutral-700/60">
                        {d.payment_method}
                      </span>
                    </td>

                    {/* Waktu Masuk */}
                    <td className="px-4 py-3 text-neutral-400 text-[11px]">
                      {new Date(d.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      {d.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                      {d.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check className="w-3 h-3" /> APPROVED
                        </span>
                      )}
                      {d.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <X className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 text-right">
                      {d.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(d.id)}
                            disabled={isPendingAction}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(d.id)}
                            disabled={isPendingAction}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-rose-950/60 hover:text-rose-400 text-neutral-400 text-xs border border-neutral-700 transition disabled:opacity-50"
                          >
                            <X className="w-3 h-3" /> Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-500">
                          {d.status === 'APPROVED' ? `Disetujui` : `Ditolak: ${d.rejection_reason || '-'}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tolak Deposit */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-rose-400" /> Tolak Permohonan Deposit
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Masukkan alasan penolakan agar tercatat di database dan dapat dilihat oleh member.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-24 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 mb-4"
              placeholder="Contoh: Bukti transfer mutasi rekening tidak ditemukan..."
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={isPendingAction}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Tiket Deposit Simulasi */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Buat Permohonan Deposit
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Buat tiket deposit baru untuk member untuk memverifikasi alur atomic approval RPC.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">User ID Member</label>
                <input
                  type="text"
                  value={simUserId}
                  onChange={(e) => setSimUserId(e.target.value)}
                  placeholder="Contoh: usr-xxx atau email member"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nominal Deposit (IDR)</label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleCreateSimulation}
                disabled={isPendingAction}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
              >
                Kirim Permohonan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
