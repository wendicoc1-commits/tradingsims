import React from 'react';
import Link from 'next/link';
import { CreditCard, Users, ShieldCheck, ArrowRight, Wallet, Database } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          TradeSim Pro - Admin Control Center
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Pusat kendali administrator: Kelola approval transaksi deposit, audit portofolio member, reset saldo, dan manajemen akun.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Antrean Deposit */}
        <Link
          href="/admin/deposits"
          className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all group flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Antrean Approval Deposit
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Verifikasi permohonan top-up & deposit member secara atomik (PostgreSQL ACID FOR UPDATE lock). Update saldo kas wallet secara langsung tanpa delay.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span>Buka Antrean Deposit</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Monitoring Portofolio & Member */}
        <Link
          href="/admin/portfolios"
          className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-900 transition-all group flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
              Monitoring Portofolio &amp; Member
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Pantau kepemilikan aset seluruh member, saldo kas wallet mengendap, lakukan force reset password, reset akun ke Rp 0, atau hapus akun member permanen.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-blue-400">
            <span>Buka Monitoring Member</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/80 text-xs text-neutral-500 flex items-center gap-3">
        <Database className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          Semua aksi dieksekusi langsung pada basis data Supabase PostgreSQL terintegrasi dengan proteksi Row Level Security (RLS).
        </span>
      </div>
    </div>
  );
}
