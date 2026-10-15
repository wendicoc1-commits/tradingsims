'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, Zap, Menu, X, ArrowUpRight, ShieldCheck, Share2 } from 'lucide-react';
import ShareWebsiteButton from '@/components/common/ShareWebsiteButton';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onEnterTerminal: (e?: React.MouseEvent) => void;
  user: any;
}

export default function Navbar({ onOpenAuth, onEnterTerminal, user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Market Live Indicator */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-300 text-black font-black flex items-center justify-center text-sm shadow-[0_0_16px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform font-mono">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight font-mono flex items-center gap-1.5 text-white">
                TRADESIM<span className="text-emerald-400">.PRO</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  HUD v5
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 -mt-0.5 tracking-wider font-mono">
                Institutional Workstation
              </span>
            </div>
          </Link>

          {/* Live Market Status Pill */}
          <div className="hidden xl:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono font-semibold text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>MARKET OPEN / IDX &amp; NASDAQ LIVE</span>
          </div>
        </div>

        {/* Navigation Links Desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold font-mono text-zinc-300">
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Terminal &amp; Features
          </a>
          <a href="#showcase" className="hover:text-emerald-400 transition-colors">
            Simulations &amp; Paper Trading
          </a>
          <a href="#matrix" className="hover:text-emerald-400 transition-colors">
            Comparison
          </a>
          <a href="#testimonials" className="hover:text-emerald-400 transition-colors">
            Traders
          </a>
          <Link href="/championship" className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-emerald-300">
            <span>🏆 Liga Trading</span>
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <ShareWebsiteButton variant="navbar" />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 font-mono">
                Trader: <strong className="text-white">{user.email?.split('@')[0]}</strong>
              </span>
              <button
                type="button"
                onClick={onEnterTerminal}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Buka Workstation &rarr;</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Daftar Akun</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#07090e] border-b border-white/10 px-4 py-5 space-y-3 font-mono text-sm">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-semibold text-emerald-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>MARKET OPEN / IDX &amp; NASDAQ LIVE</span>
          </div>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400 py-1"
          >
            Terminal &amp; Features
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400 py-1"
          >
            Simulations &amp; Paper Trading
          </a>
          <a
            href="#matrix"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400 py-1"
          >
            Comparison Matrix
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-zinc-300 hover:text-emerald-400 py-1"
          >
            Community Traders
          </a>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <div className="pt-2">
              <ShareWebsiteButton variant="navbar" className="w-full justify-center py-2" />
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterTerminal();
                }}
                className="w-full py-2.5 rounded-lg bg-emerald-500 text-black font-extrabold text-center shadow-lg shadow-emerald-500/25"
              >
                Buka Workstation Terminal ⚡
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 rounded-lg border border-white/10 text-white font-bold text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 text-black font-extrabold text-center shadow-lg shadow-emerald-500/25"
                >
                  Daftar Akun Baru ⚡
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
