'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Filter,
  Landmark,
  Coins,
  ChevronLeft,
  ChevronRight,
  Activity,
  LayoutGrid,
  Scale,
  Users,
  Globe,
  Bot,
  Layers,
  Rocket,
  Flame,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const coreDesks = [
  { href: '/', label: 'Workstation Utama', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portofolio & Trading', icon: Briefcase },
  { href: '/stream', label: 'Berita Pasar Wire', icon: Activity },
];

const researchDesks = [
  { href: '/crypto', label: 'Jesse Crypto Desk', icon: Coins },
  { href: '/heatmap', label: 'Market Heatmap', icon: LayoutGrid },
  { href: '/screener', label: 'Screener Saham', icon: Filter },
  { href: '/dividend', label: 'Dividen Intelligence', icon: Layers },
  { href: '/ipo', label: 'e-IPO Pipeline', icon: Rocket },
  { href: '/macro', label: 'Makro & Suku Bunga', icon: Globe },
  { href: '/ai', label: 'TradeSim AI Hub', icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full border-r transition-all duration-200 shrink-0 z-20 font-sans select-none',
        collapsed ? 'w-14' : 'w-52'
      )}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Terminal Brand Header */}
      <div className="flex items-center gap-2.5 px-3 h-10 border-b" style={{ borderColor: 'var(--border)' }}>
        <Activity className="w-4 h-4 shrink-0 text-emerald-400" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wider text-white">
              TRADESIM<span className="text-emerald-400"> PRO</span>
            </span>
            <span className="text-[9px] text-zinc-500 tracking-tight">WORKSTATION DESK</span>
          </div>
        )}
      </div>

      {/* Navigation Desks */}
      <nav className="flex-1 py-2 px-1.5 space-y-3 overflow-y-auto">
        {/* Core Desks Group */}
        <div>
          {!collapsed && (
            <div className="px-2 pb-1 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
              Navigasi Utama
            </div>
          )}
          <div className="space-y-0.5">
            {coreDesks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-all',
                    collapsed && 'justify-center px-0'
                  )}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    fontWeight: isActive ? '700' : '500',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Research & Quant Desks Group */}
        <div>
          {!collapsed && (
            <div className="px-2 pb-1 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
              Riset &amp; Pasar
            </div>
          )}
          <div className="space-y-0.5">
            {researchDesks.map((item) => {
              const isActive = pathname === item.href || (item.href.startsWith('/stock') && pathname.startsWith('/stock'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-all',
                    collapsed && 'justify-center px-0'
                  )}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    fontWeight: isActive ? '700' : '500',
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className="p-1.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        {!collapsed && (
          <span className="text-[10px] text-neutral-500 font-mono px-2">KONTROL DESK</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
}
