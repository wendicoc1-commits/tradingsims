'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import AuthModal from '@/components/auth/AuthModal';

// High-tech cyberpunk HUD & modular components inspired by max.areebali.com
import HudOverlay from '@/components/landing/HudOverlay';
import InterstellarBlackHole from '@/components/landing/InterstellarBlackHole';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import MarketStatsBar from '@/components/landing/MarketStatsBar';
import BentoGrid from '@/components/landing/BentoGrid';
import TerminalShowcase from '@/components/landing/TerminalShowcase';
import { ComparisonMatrix } from '@/components/landing/ComparisonMatrix';
import { Testimonials } from '@/components/landing/Testimonials';
import { Footer } from '@/components/landing/Footer';

export default function TradeSimLandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleEnterTerminal = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tradesim_session_entered_v1', 'true');
    }
    router.push('/terminal');
  };

  return (
    <div className="relative min-h-screen bg-[#06080E] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden">
      {/* ── 1. Cyberpunk Tech-Brutalist HUD Instrument Overlay ── */}
      <HudOverlay />

      {/* ── 2. Atmospheric Background: Dynamic Interstellar Black Hole Shader ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <InterstellarBlackHole />
      </div>

      {/* ── 3. High-Tech Navigation Bar ── */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onEnterTerminal={handleEnterTerminal}
        user={user}
      />

      {/* ── 4. Main Page Structure ── */}
      <main className="relative z-10">
        {/* Hero Section with Live Mini Ticker & Interactive Mockup */}
        <Hero
          onOpenAuth={handleOpenAuth}
          onEnterTerminal={handleEnterTerminal}
        />

        {/* Live Market Stats Bar (Volume, Uptime, Latency, Traders) */}
        <MarketStatsBar />

        {/* Interactive Feature Bento Grid (Orderbook, AI Backtester, Multi-Market, Risk Radar) */}
        <BentoGrid />

        {/* Terminal in Action: 3 Specialized Desks Showcase */}
        <TerminalShowcase onEnterTerminal={handleEnterTerminal} />

        {/* Comparison Matrix: Traditional Brokers vs. TradeSim Pro */}
        <ComparisonMatrix onLaunchTerminal={handleEnterTerminal} />

        {/* Verified Community & Trader Testimonials */}
        <Testimonials />
      </main>

      {/* ── 5. Bottom Call to Action & Institutional Footer ── */}
      <Footer
        onLaunchTerminal={handleEnterTerminal}
        onOpenAuth={handleOpenAuth}
      />

      {/* ── 6. Auth Modal Popup ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
