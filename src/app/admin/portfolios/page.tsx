'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  KeyRound, 
  Eye, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  PieChart,
  ShieldAlert,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { 
  getMembersWithPortfolios, 
  resetMemberPassword, 
  resetMemberAccountToZero,
  deleteMemberAccount,
  MemberPortfolioItem 
} from '../actions';

export default function AdminPortfoliosPage() {
  const [members, setMembers] = useState<MemberPortfolioItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected member for detail view modal
  const [selectedMember, setSelectedMember] = useState<MemberPortfolioItem | null>(null);

  // Reset password modal
  const [resetTargetUser, setResetTargetUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Reset to Zero modal
  const [resetZeroTargetUser, setResetZeroTargetUser] = useState<{ id: string; email: string; name: string; cash: number } | null>(null);

  // Delete account modal
  const [deleteTargetUser, setDeleteTargetUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);

  const [modalError, setModalError] = useState<string | null>(null);
  const [isPendingAction, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await getMembersWithPortfolios(query ?? searchQuery);
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleResetPasswordSubmit = () => {
    if (!resetTargetUser) return;
    if (!newPassword || newPassword.length < 6) {
      alert('Password baru minimal 6 karakter.');
      return;
    }

    startTransition(async () => {
      setNotification(null);
      setModalError(null);
      const res = await resetMemberPassword(resetTargetUser.id, newPassword);
      if (res.success) {
        setNotification({ type: 'success', text: res.message || 'Password berhasil direset!' });
        setResetTargetUser(null);
        setNewPassword('');
      } else {
        setModalError(res.error || 'Gagal mereset password');
      }
    });
  };

  const handleResetToZeroConfirm = () => {
    if (!resetZeroTargetUser) return;

    startTransition(async () => {
      setNotification(null);
      setModalError(null);
      const res = await resetMemberAccountToZero(resetZeroTargetUser.id);
      if (res.success) {
        setNotification({ type: 'success', text: res.message || 'Akun berhasil direset ke Rp 0!' });
        setResetZeroTargetUser(null);
        loadData();
      } else {
        setModalError(res.error || 'Gagal mereset akun ke 0');
      }
    });
  };

  const handleDeleteAccountConfirm = () => {
    if (!deleteTargetUser) return;

    startTransition(async () => {
      setNotification(null);
      setModalError(null);
      const res = await deleteMemberAccount(deleteTargetUser.id);
      if (res.success) {
        setNotification({ type: 'success', text: res.message || 'Akun member telah dihapus permanen!' });
        setDeleteTargetUser(null);
        loadData();
      } else {
        setModalError(res.error || 'Gagal menghapus akun');
      }
    });
  };

  const totalMembers = members.length;
  const totalCirculatingCash = members.reduce((sum, m) => sum + m.cash, 0);
  const totalAssetsValue = members.reduce((sum, m) => sum + m.totalAssetValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Monitoring Portofolio, Reset & Manajemen Member
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Pantau saldo kas wallet, kepemilikan aset, reset akun ke Rp 0, dan penghapusan akun member secara terpusat.
          </p>
        </div>

        <button
          onClick={() => loadData()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium border border-blue-500/20 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Action Notification */}
      {notification && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Total Member Terdaftar</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">{totalMembers}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Pengguna aktif di platform</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Total Cash Balance (Wallet)</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            Rp {new Intl.NumberFormat('id-ID').format(totalCirculatingCash)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Total saldo kas mengendap</p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Total Estimasi Net Worth Aset</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            Rp {new Intl.NumberFormat('id-ID').format(totalAssetsValue)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Cash + Market Value Saham/Crypto</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari member berdasarkan ID akun, email, atau nama lengkap..."
            className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium border border-neutral-700 transition"
        >
          Cari
        </button>
      </form>

      {/* Members & Portfolios Table */}
      <div className="bg-neutral-900/40 rounded-xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Member & ID</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Cash Balance (Wallet)</th>
                <th className="px-4 py-3">Realized P/L</th>
                <th className="px-4 py-3">Estimasi Aset Saham</th>
                <th className="px-4 py-3">Total Net Worth</th>
                <th className="px-4 py-3 text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500 text-xs">
                    {isLoading ? 'Memuat data portofolio member...' : 'Tidak ada member ditemukan.'}
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.user_id} className="hover:bg-neutral-800/20 transition-colors">
                    {/* Member */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{m.full_name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{m.email}</div>
                      <div className="text-[10px] text-neutral-600 font-mono">ID: {m.user_id}</div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        m.role === 'admin' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700/60'
                      }`}>
                        {m.role}
                      </span>
                    </td>

                    {/* Cash Balance */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-emerald-400 font-mono text-sm">
                        Rp {new Intl.NumberFormat('id-ID').format(m.cash)}
                      </div>
                    </td>

                    {/* Realized PL */}
                    <td className="px-4 py-3 font-mono">
                      <span className={m.realized_pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.realized_pl >= 0 ? '+' : ''}Rp {new Intl.NumberFormat('id-ID').format(m.realized_pl)}
                      </span>
                    </td>

                    {/* Market Value Saham */}
                    <td className="px-4 py-3 font-mono text-neutral-300">
                      <div>Rp {new Intl.NumberFormat('id-ID').format(m.totalMarketValue)}</div>
                      <div className="text-[10px] text-neutral-500">{m.holdings.length} emiten dimiliki</div>
                    </td>

                    {/* Total Net Worth */}
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      Rp {new Intl.NumberFormat('id-ID').format(m.totalAssetValue)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Detail Portofolio */}
                        <button
                          onClick={() => setSelectedMember(m)}
                          title="Lihat Rincian Aset Portofolio"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition"
                        >
                          <Eye className="w-3 h-3 text-blue-400" /> Detail
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => setResetTargetUser({ id: m.user_id, email: m.email, name: m.full_name })}
                          title="Ganti / Reset Password Member"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
                        >
                          <KeyRound className="w-3 h-3 text-amber-400" /> Password
                        </button>

                        {/* Reset Akun ke Rp 0 */}
                        <button
                          onClick={() => setResetZeroTargetUser({ id: m.user_id, email: m.email, name: m.full_name, cash: m.cash })}
                          title="Reset Saldo ke Rp 0 & Kosongkan Portofolio"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-medium border border-amber-800/40 transition"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" /> Reset ke 0
                        </button>

                        {/* Hapus Akun */}
                        {m.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteTargetUser({ id: m.user_id, email: m.email, name: m.full_name, role: m.role })}
                            title="Hapus Akun Member Secara Permanen"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium border border-rose-800/40 transition"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" /> Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Portofolio Member */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-400" /> Portofolio: {selectedMember.full_name}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {selectedMember.email} (ID: {selectedMember.user_id})
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick summary banner */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-500 block">Saldo Kas Wallet</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  Rp {new Intl.NumberFormat('id-ID').format(selectedMember.cash)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Nilai Pasar Portofolio</span>
                <span className="text-white font-bold font-mono text-sm">
                  Rp {new Intl.NumberFormat('id-ID').format(selectedMember.totalMarketValue)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Total Ekuitas Bersih</span>
                <span className="text-purple-400 font-bold font-mono text-sm">
                  Rp {new Intl.NumberFormat('id-ID').format(selectedMember.totalAssetValue)}
                </span>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="flex-1 overflow-y-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Ticker / Simbol</th>
                    <th className="px-3 py-2.5">Quantity / Lot</th>
                    <th className="px-3 py-2.5">Harga Rata-rata (Avg)</th>
                    <th className="px-3 py-2.5">Harga Pasar Saat Ini</th>
                    <th className="px-3 py-2.5">Estimasi Market Value</th>
                    <th className="px-3 py-2.5 text-right">Unrealized P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {selectedMember.holdings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-neutral-500 text-xs">
                        Member belum memiliki kepemilikan aset saham/kripto (100% Cash).
                      </td>
                    </tr>
                  ) : (
                    selectedMember.holdings.map((h, idx) => {
                      const shares = (h.shares || 0) > 0 ? h.shares : ((h.lots || 0) * 100);
                      const curPrice = h.currentPrice || h.avgPrice;
                      const rate = h.currency === 'USD' || h.assetClass === 'US' ? 16000 : 1;
                      const marketValue = shares * curPrice * rate;
                      const unPl = h.unrealizedPL || 0;
                      const unPlPct = h.unrealizedPLPercent || 0;

                      return (
                        <tr key={idx} className="hover:bg-neutral-800/20">
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-white">{h.displaySymbol || h.symbol}</span>
                            <span className="block text-[10px] text-neutral-500 font-sans">{h.name || h.symbol}</span>
                          </td>
                          <td className="px-3 py-2.5 text-neutral-300">
                            {h.lots} lot ({shares.toLocaleString('id-ID')} lembar)
                          </td>
                          <td className="px-3 py-2.5 text-neutral-400">
                            Rp {new Intl.NumberFormat('id-ID').format(h.avgPrice)}
                          </td>
                          <td className="px-3 py-2.5 text-neutral-200">
                            Rp {new Intl.NumberFormat('id-ID').format(curPrice)}
                          </td>
                          <td className="px-3 py-2.5 text-white font-semibold">
                            Rp {new Intl.NumberFormat('id-ID').format(marketValue)}
                          </td>
                          <td className={`px-3 py-2.5 text-right ${unPl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {unPl >= 0 ? '+' : ''}Rp {new Intl.NumberFormat('id-ID').format(unPl)}
                            <span className="block text-[10px]">
                              ({unPl >= 0 ? '+' : ''}{unPlPct}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-neutral-800">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Force Reset Password */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Force Reset Password Member
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Anda akan mengganti password akun <span className="text-white font-semibold">{resetTargetUser.name}</span> ({resetTargetUser.email}) langsung dari Supabase Admin.
            </p>

            <div className="mb-4">
              <label className="text-[11px] text-neutral-400 block mb-1">Password Baru Member</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Password akan di-update di Supabase Auth Admin dan database <code className="text-neutral-400 font-mono">app_users</code> secara serentak.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setResetTargetUser(null)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleResetPasswordSubmit}
                disabled={isPendingAction}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium disabled:opacity-50"
              >
                {isPendingAction ? 'Memproses...' : 'Terapkan Password Baru'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset Akun ke Rp 0 */}
      {resetZeroTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2 mb-2">
              <RotateCcw className="w-5 h-5 text-amber-400" /> Konfirmasi Reset Akun ke Rp 0
            </h3>
            <p className="text-xs text-neutral-300 mb-3">
              Apakah Anda yakin ingin mereset seluruh keuangan akun <span className="text-white font-semibold">{resetZeroTargetUser.name}</span> ({resetZeroTargetUser.email})?
            </p>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span>Saldo Saat Ini:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  Rp {new Intl.NumberFormat('id-ID').format(resetZeroTargetUser.cash)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Saldo Setelah Reset:</span>
                <span className="font-mono text-amber-400 font-bold">Rp 0</span>
              </div>
              <div className="text-[10px] text-rose-400/90 pt-1 border-t border-neutral-800">
                ⚠️ Seluruh kepemilikan aset (saham/kripto) dan order antrean aktif member ini akan dikosongkan.
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-2.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setResetZeroTargetUser(null); setModalError(null); }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleResetToZeroConfirm}
                disabled={isPendingAction}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium disabled:opacity-50"
              >
                {isPendingAction ? 'Mereset...' : 'Ya, Reset ke Rp 0'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Akun Permanen */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-rose-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-rose-400" /> Hapus Akun Member Permanen
            </h3>
            <p className="text-xs text-neutral-300 mb-3">
              Tindakan ini bersifat <strong className="text-rose-400">PERMANEN dan TIDAK BISA DIBATALKAN</strong>. Seluruh data pengguna berikut akan dihapus total dari sistem:
            </p>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 space-y-1 mb-4">
              <p><span className="text-neutral-500">Nama:</span> <strong className="text-white">{deleteTargetUser.name}</strong></p>
              <p><span className="text-neutral-500">Email:</span> <span className="font-mono text-neutral-300">{deleteTargetUser.email}</span></p>
              <p><span className="text-neutral-500">User ID:</span> <span className="font-mono text-neutral-500">{deleteTargetUser.id}</span></p>
              <ul className="list-disc list-inside text-[10px] text-rose-400/90 pt-1 border-t border-neutral-800 mt-2 space-y-0.5">
                <li>Dihapus dari tabel database <code className="font-mono">app_users</code></li>
                <li>Dihapus dari tabel portofolio & riwayat deposit</li>
                <li>Dihapus dari akun autentikasi Supabase Auth</li>
              </ul>
            </div>

            {modalError && (
              <div className="mb-4 p-2.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setDeleteTargetUser(null); setModalError(null); }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                disabled={isPendingAction}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium disabled:opacity-50"
              >
                {isPendingAction ? 'Menghapus...' : 'Hapus Akun Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
