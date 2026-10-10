import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  CreditCard, 
  Users, 
  ArrowLeft, 
  Database, 
  Activity, 
  Layers
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-neutral-800 bg-neutral-900/60 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 shadow-lg shadow-emerald-500/20 font-black text-lg">
              <ShieldCheck className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                TRADESIM <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">Admin</span>
              </h1>
              <p className="text-[11px] text-neutral-400">Backoffice & Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/admin/deposits"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors group"
            >
              <CreditCard className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Antrean Approval Deposit</span>
            </Link>

            <Link
              href="/admin/portfolios"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors group"
            >
              <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Monitoring Portofolio Member</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & link back */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-3">
          <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 text-[11px]">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="flex items-center gap-1.5 font-mono">
                <Database className="w-3 h-3 text-emerald-400" /> Supabase ACID
              </span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <p className="text-neutral-500 text-[10px] leading-tight">
              PostgreSQL RPC & Row Level Security terintegrasi
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-700/50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Trading App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-neutral-950/40 overflow-y-auto">
        {/* Topbar */}
        <header className="h-14 border-b border-neutral-800/80 bg-neutral-900/30 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Admin Console</span>
            <span>/</span>
            <span className="text-neutral-200 font-medium">Supabase Database Specialist</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Database Connected
            </span>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
