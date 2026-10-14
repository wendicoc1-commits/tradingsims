'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Zap,
  Shield,
  Bot,
  PieChart,
  ArrowRight,
  ChevronRight,
  Sparkles,
  BarChart3,
  LineChart,
  Globe,
  Wallet,
  Activity,
  CheckCircle2,
  Lock,
  RotateCcw,
  Users,
  Award,
  Layers,
  ArrowUpRight,
  HelpCircle,
  ChevronDown,
  Terminal,
  Play,
  Cpu,
  Radio,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import AuthModal from '@/components/auth/AuthModal';

const TICKER_TAPE = [
  { sym: 'BBCA', price: '10.450', chg: '+1.45%', up: true },
  { sym: 'BTC/USDT', price: '$67.820', chg: '+3.12%', up: true },
  { sym: 'BBRI', price: '4.980', chg: '-0.40%', up: false },
  { sym: 'ETH/USDT', price: '$3.540', chg: '+2.85%', up: true },
  { sym: 'BMRI', price: '6.850', chg: '+2.24%', up: true },
  { sym: 'SOL/USDT', price: '$152,4', chg: '+5.60%', up: true },
  { sym: 'ASII', price: '5.125', chg: '+0.98%', up: true },
  { sym: 'TLKM', price: '2.920', chg: '-1.02%', up: false },
  { sym: 'NVDA', price: '$124.5', chg: '+4.15%', up: true },
  { sym: 'GOTO', price: '58', chg: '+1.75%', up: true },
];

const MORPH_WORDS = [
  'Pasar Saham BEI',
  'Crypto Spot 24/7',
  'Radar Bandarmologi',
  'Autonomous AI Desk',
];


const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
    badge: 'MULTI-ASET REALTIME',
    title: 'Data Pasar Live BEI & Crypto 24/7',
    desc: 'Nikmati streaming data harga riil saham Indonesia (IHSG) dan crypto spot global (Binance WebSocket) dengan latensi ultra-rendah tanpa delay.',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/30',
  },
  {
    icon: <Bot className="w-6 h-6 text-amber-400" />,
    badge: 'AUTONOMOUS AI DESK',
    title: 'AI Autonomous Portfolio Agents',
    desc: 'Didampingi 3 agen AI otonom: Raditya (PM Saham), Kevin Zhang (Crypto PM), & Bambang (CRO) yang memantau risiko dan TP/SL portofolio Anda.',
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    border: 'border-amber-500/30',
  },
  {
    icon: <Activity className="w-6 h-6 text-cyan-400" />,
    badge: 'SMART MONEY FLOW',
    title: 'Radar Bandarmologi & Foreign Flow',
    desc: 'Lacak pergerakan broker summary dan arus dana investor asing secara objektif untuk mendeteksi fase akumulasi sebelum lonjakan harga.',
    gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    border: 'border-cyan-500/30',
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    badge: 'REALISTIC BLOTTER',
    title: 'Order Execution & Limit ARA/ARB',
    desc: 'Simulasi orderbook DOM, antrean bid/offer realistis, batas auto-rejection (ARA/ARB) BEI, dan potongan fee transaksi nyata.',
    gradient: 'from-yellow-500/10 via-yellow-500/5 to-transparent',
    border: 'border-yellow-500/30',
  },
  {
    icon: <Wallet className="w-6 h-6 text-purple-400" />,
    badge: 'INSTANT REFILL',
    title: 'Top Up Saldo Virtual via QRIS',
    desc: 'Latih psikologi trading dengan modal besar. Refill saldo kas virtual RDN kapan saja melalui simulator pembayaran QRIS dinamis instan.',
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    border: 'border-purple-500/30',
  },
  {
    icon: <Award className="w-6 h-6 text-rose-400" />,
    badge: 'LIGA TRADING NASIONAL',
    title: 'Championship & Leaderboard',
    desc: 'Buktikan kemampuan analisa Anda di turnamen trading simulator bulanan. Bersaing ROI dengan trader se-Indonesia dan raih hadiah apresiasi.',
    gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    border: 'border-rose-500/30',
  },
];

const FAQS = [
  {
    q: 'Apakah TradeSim Pro benar-benar gratis?',
    a: 'Ya, 100% Gratis! Setiap pengunjung langsung mendapatkan saldo kas virtual sebesar Rp 50.000.000 untuk mulai simulasi trading saham IDX dan crypto tanpa perlu deposit uang sepeserpun.',
  },
  {
    q: 'Apakah data harga saham dan crypto adalah harga pasar nyata?',
    a: 'Benar. Kami menghubungkan feed data real-time langsung dari bursa saham Indonesia (BEI) dan bursa kripto terkemuka (Binance WebSocket & Bybit) sehingga pergerakan harga, grafik candle, dan volume sama persis dengan pasar asli.',
  },
  {
    q: 'Apakah saya wajib membuat akun untuk mencoba?',
    a: 'Tidak wajib. Anda bisa langsung mencoba di Mode Tamu (Guest) secara instan. Namun, kami menyarankan mendaftar akun gratis (hanya 10 detik) agar portofolio dan riwayat trade Anda tersimpan aman di Cloud dan bisa diakses dari HP maupun laptop.',
  },
  {
    q: 'Bagaimana cara kerja AI Autonomous Agent?',
    a: 'AI Agent kami (Raditya, Kevin Zhang, & Bambang) bekerja sebagai asisten portofolio digital. Mereka mengevaluasi tren pasar, menghitung rasio risk-to-reward, dan dapat menjalankan skenario proteksi trailing stop atau take-profit otomatis sesuai preferensi Anda.',
  },
  {
    q: 'Apakah saya bisa kehilangan uang asli di platform ini?',
    a: 'Sama sekali tidak. TradeSim Pro adalah platform simulasi edukatif (paper trading). Seluruh transaksi menggunakan saldo virtual, sehingga tidak ada risiko finansial nyata. Ini adalah sarana terbaik mengasah psikologi sebelum terjun ke pasar riil.',
  },
];

export default function TradeSimLandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // 1. Interactive Mouse Spotlight
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // 2. Typewriter / Dynamic Text Morphing
  const [wordIdx, setWordIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = MORPH_WORDS[wordIdx];
    const typingSpeed = isDeleting ? 38 : 75;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentWord.length) {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        } else {
          // Pause at full word before deleting
          setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(currentWord.slice(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % MORPH_WORDS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, wordIdx]);

  // 3. Interstellar Gargantua Black Hole & Rotating Accretion Vortex Simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Singularity center & dynamic radius based on viewport
    const getCenter = () => ({
      cx: width / 2,
      cy: Math.min(420, height * 0.44),
      rh: Math.min(108, Math.max(65, width * 0.08)),
    });

    // 1. Accretion Disk Plasma Particles (Gas orbiting the singularity)
    const particleCount = Math.min(360, Math.max(160, Math.floor(width / 4.2)));
    const { rh: initRh } = getCenter();

    const particles = Array.from({ length: particleCount }).map(() => {
      const distRatio = Math.pow(Math.random(), 0.72); // density increases toward photon sphere
      const r = initRh * 1.18 + distRatio * (initRh * 3.6);
      return {
        r,
        angle: Math.random() * Math.PI * 2,
        // Keplerian velocity: particles closer to singularity orbit substantially faster
        speed: (0.006 + (1 - distRatio) * 0.018) * (Math.random() * 0.25 + 0.88),
        size: Math.random() * 1.8 + 0.6,
        // Palette: Incandescent white-gold, amber, solar flare orange, and interstellar cyan
        color:
          Math.random() > 0.72
            ? '255, 255, 255'
            : Math.random() > 0.32
            ? '245, 158, 11'
            : Math.random() > 0.12
            ? '249, 115, 22'
            : '6, 182, 212',
        alpha: Math.random() * 0.65 + 0.25,
        streakLen: Math.random() * 2.4 + 1.2,
      };
    });

    // 2. Rotating Distant Cosmic Stars & Galactic Dust
    const starCount = Math.min(130, Math.floor(width / 11));
    const stars = Array.from({ length: starCount }).map(() => {
      const dist = Math.random() * (Math.max(width, height) * 0.85) + 60;
      return {
        dist,
        angle: Math.random() * Math.PI * 2,
        speed: 0.00025 + Math.random() * 0.00035,
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleFreq: Math.random() * 0.03 + 0.012,
        phase: Math.random() * Math.PI * 2,
      };
    });

    let time = 0;

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }
      time += 1;
      ctx.clearRect(0, 0, width, height);

      const { cx, cy, rh } = getCenter();
      const tilt = 0.33; // 3D perspective angle of accretion disk

      // ── Step A: Draw Rotating Distant Cosmic Starfield ──
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.angle += s.speed;
        const sx = cx + s.dist * Math.cos(s.angle);
        const sy = cy + s.dist * Math.sin(s.angle) * 0.7;
        const twinkle = Math.sin(time * s.twinkleFreq + s.phase) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.baseAlpha * twinkle})`;
        ctx.fill();
      }

      // ── Step B: Gravitational Lensing Halo (Behind Horizon) ──
      // Signature Nolan / Thorne arched light distortion around the black hole
      ctx.save();
      const lensGrad = ctx.createRadialGradient(cx, cy, rh * 0.95, cx, cy, rh * 2.9);
      lensGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
      lensGrad.addColorStop(0.32, 'rgba(217, 119, 6, 0.22)');
      lensGrad.addColorStop(0.68, 'rgba(16, 185, 129, 0.08)');
      lensGrad.addColorStop(1, 'transparent');

      // Upper Gravitational Arch
      ctx.beginPath();
      ctx.ellipse(cx, cy - rh * 0.26, rh * 2.25, rh * 1.6, 0, Math.PI, 0, false);
      ctx.lineWidth = rh * 0.34;
      ctx.strokeStyle = lensGrad;
      ctx.stroke();

      // Lower Counter-Arch
      ctx.beginPath();
      ctx.ellipse(cx, cy + rh * 0.24, rh * 1.85, rh * 0.98, 0, 0, Math.PI, false);
      ctx.lineWidth = rh * 0.25;
      ctx.strokeStyle = lensGrad;
      ctx.stroke();
      ctx.restore();

      // ── Step C: Back-half of Accretion Disk (y < cy, behind black hole) ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;

        const sinA = Math.sin(p.angle);
        const cosA = Math.cos(p.angle);
        const px = cx + p.r * cosA;
        const py = cy + p.r * sinA * tilt;

        if (sinA < 0) {
          const prevAngle = p.angle - p.speed * p.streakLen;
          const trailX = cx + p.r * Math.cos(prevAngle);
          const trailY = cy + p.r * Math.sin(prevAngle) * tilt;

          ctx.beginPath();
          ctx.moveTo(trailX, trailY);
          ctx.lineTo(px, py);

          // Doppler beaming: light approaching on left (cosA < 0) is brighter
          const doppler = cosA < 0 ? 1.35 : 0.78;
          ctx.strokeStyle = `rgba(${p.color}, ${Math.min(1, p.alpha * doppler * 0.72)})`;
          ctx.lineWidth = p.size * 0.88;
          ctx.stroke();
        }
      }

      // ── Step D: The Event Horizon (Central Black Hole Void & Photon Ring) ──
      // 1. Incandescent Inner Photon Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rh * 1.07, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.95)';
      ctx.lineWidth = 2.4;
      ctx.shadowBlur = 32;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.95)';
      ctx.stroke();
      ctx.restore();

      // 2. Pure Black Sphere (Singularity Event Horizon Void)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rh, 0, Math.PI * 2);
      ctx.fillStyle = '#05070a';
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#000000';
      ctx.fill();
      ctx.restore();

      // ── Step E: Front-half of Accretion Disk (y >= cy, in front of black hole) ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const sinA = Math.sin(p.angle);
        const cosA = Math.cos(p.angle);
        const px = cx + p.r * cosA;
        const py = cy + p.r * sinA * tilt;

        if (sinA >= 0) {
          const prevAngle = p.angle - p.speed * p.streakLen;
          const trailX = cx + p.r * Math.cos(prevAngle);
          const trailY = cy + p.r * Math.sin(prevAngle) * tilt;

          ctx.beginPath();
          ctx.moveTo(trailX, trailY);
          ctx.lineTo(px, py);

          const doppler = cosA < 0 ? 1.35 : 0.78;
          ctx.strokeStyle = `rgba(${p.color}, ${Math.min(1, p.alpha * doppler)})`;
          ctx.lineWidth = p.size;
          ctx.stroke();

          // Particle core
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, p.alpha * 1.25)})`;
          ctx.fill();
        }
      }

      // ── Step F: Luminous Accretion Ambient Glow ──
      ctx.save();
      const flareGrad = ctx.createRadialGradient(cx, cy, rh * 1.2, cx, cy, rh * 4.3);
      flareGrad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      flareGrad.addColorStop(0.45, 'rgba(217, 119, 6, 0.07)');
      flareGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.ellipse(cx, cy, rh * 4.3, rh * 1.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = flareGrad;
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // 5. Animated Counter Numbers (CountUp)
  const [counters, setCounters] = useState({
    cash: 0,
    assets: 0,
    latency: 50,
    agents: 0,
  });

  useEffect(() => {
    const duration = 1600;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCounters({
        cash: Math.floor(ease * 50),
        assets: Math.floor(ease * 250),
        latency: Math.max(18, Math.floor(50 - ease * 32)),
        agents: Math.floor(ease * 3),
      });

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleEnterTerminal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      sessionStorage.setItem('tradesim_session_entered_v1', 'true');
    } catch {}
    router.push('/terminal');
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#07090e] text-white selection:bg-amber-500 selection:text-black font-sans relative overflow-x-hidden"
    >
      {/* ── Background Ambient Glow Effects + Interstellar Vortex + Mouse Spotlight ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Interstellar Gargantua Rotating Accretion Vortex Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-90" />

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-amber-500/10 via-emerald-500/6 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-[40%] -left-48 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute top-[65%] -right-48 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
        {/* Interactive Mouse Spotlight Radial Glow */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.08), transparent 75%)`,
          }}
        />
        {/* Subtle Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── 1. Top Live Ticker Tape Ribbon ── */}
      <div className="relative z-20 bg-[#0a0d14]/90 border-b border-white/[0.08] text-[11px] font-mono py-1.5 overflow-hidden backdrop-blur-md">
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
          {TICKER_TAPE.concat(TICKER_TAPE).map((t, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-zinc-300">{t.sym}</span>
              <span className="text-white font-mono-num">{t.price}</span>
              <span className={`text-[10px] font-bold flex items-center ${t.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.up ? '↗' : '↘'} {t.chg}
              </span>
              <span className="text-zinc-700 mx-1">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Sticky Modern Navbar ── */}
      <header className="sticky top-0 z-40 bg-[#07090e]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black flex items-center justify-center text-base shadow-[0_0_16px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform font-mono">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight font-mono flex items-center gap-1.5">
                TRADESIM<span className="text-amber-400">.PRO</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-bold">
                  v5.0
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 -mt-0.5 tracking-wider font-mono">
                Institutional Workstation
              </span>
            </div>
          </Link>

          {/* Nav Links Desktop */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-300">
            <a href="#fitur" className="hover:text-amber-400 transition-colors">Fitur Unggulan</a>
            <a href="#cara-kerja" className="hover:text-amber-400 transition-colors">Cara Memulai</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
            <Link href="/championship" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-300">
              <span>🏆 Liga Trading</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-zinc-400 font-mono">
                  Halo, <strong className="text-white">{user.email?.split('@')[0]}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleEnterTerminal}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Buka Terminal Workstation &rarr;</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('register')}
                  className="hidden sm:flex px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer items-center gap-1.5"
                >
                  <span>Daftar Gratis</span>
                </button>
                <button
                  type="button"
                  onClick={handleEnterTerminal}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Buka Terminal ⚡</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 3. Hero Section ── */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Badge Pill */}
        <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold mb-6 shadow-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>⚡ PLATFORM SIMULASI SAHAM BEI &amp; CRYPTO 24/7 #1 DI INDONESIA</span>
        </div>

        {/* Main Title with Dynamic Text Morphing / Typewriter */}
        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] max-w-5xl mx-auto min-h-[135px] sm:min-h-[160px] md:min-h-[190px] flex flex-col items-center justify-center">
          <span>Kuasai</span>
          <span className="bg-gradient-to-r from-amber-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent inline-flex items-center">
            {displayedText}
            <span className="inline-block w-1.5 sm:w-2.5 h-8 sm:h-12 bg-amber-400 ml-1.5 animate-cursor rounded-xs shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
          </span>
          <span className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold mt-1">
            Tanpa Risiko Uang Riil.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Simulator trading institusional dengan data real-time Bursa Efek Indonesia (BEI) dan crypto spot 24/7. Didukung radar bandarmologi, chart teknikal live, serta <strong className="text-white">Autonomous AI Portfolio Agents</strong> pertama di Indonesia.
        </p>

        {/* Saldo Virtual Callout Pill */}
        <div className="relative z-10 mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0f141f]/90 backdrop-blur-md border border-emerald-500/40 text-xs font-mono shadow-[0_0_25px_rgba(34,197,94,0.15)] animate-pulse-subtle">
          <span className="text-zinc-400">💼 Saldo Awal Otomatis:</span>
          <span className="text-emerald-400 font-extrabold text-sm tracking-wide">Rp 50.000.000 (Kas Virtual RDN)</span>
          <span className="hidden sm:inline text-zinc-500">•</span>
          <span className="hidden sm:inline text-amber-300 font-semibold">100% Bebas Risiko Finansial</span>
        </div>

        {/* Action CTA Buttons */}
        <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleEnterTerminal}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm font-mono tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all group cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
            <span>MULAI SIMULASI GRATIS SEKARANG</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenAuth('register')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Daftar Akun Member (Simpan ke Cloud)</span>
          </button>
        </div>

        {/* Quick Highlights / Trust Metric Badges with CountUp */}
        <div className="relative z-10 mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/[0.08]">
          <div className="p-3 bg-white/[0.02] backdrop-blur-sm rounded-lg border border-white/[0.05] hover:border-emerald-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              Rp {counters.cash} Juta
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Kas Virtual Siap Pakai</div>
          </div>
          <div className="p-3 bg-white/[0.02] backdrop-blur-sm rounded-lg border border-white/[0.05] hover:border-amber-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              {counters.assets}+ Aset
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Saham BEI &amp; Crypto 24/7</div>
          </div>
          <div className="p-3 bg-white/[0.02] backdrop-blur-sm rounded-lg border border-white/[0.05] hover:border-cyan-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
              &lt; {counters.latency}ms
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">WebSocket Live Latency</div>
          </div>
          <div className="p-3 bg-white/[0.02] backdrop-blur-sm rounded-lg border border-white/[0.05] hover:border-purple-500/30 transition-colors">
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-400">
              {counters.agents} AI Agent
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Autonomous Risk &amp; TP/SL</div>
          </div>
        </div>
      </section>


      {/* ── 5. 6 Fitur Unggulan Grid ── */}
      <section id="fitur" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
            FITUR LENGKAP WORKSTATION
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Semua yang Dibutuhkan Trader Profesional
          </h2>
          <p className="text-base text-zinc-400 mt-4 leading-relaxed">
            Tidak ada lagi tebak-tebakan. TradeSim Pro menyediakan data, analisis kuantitatif, dan eksekusi secepat kedipan mata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-b ${feat.gradient} border ${feat.border} hover:border-white/40 transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(245,158,11,0.12)] relative overflow-hidden hover-shine-sweep cursor-default`}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform group-hover:border-amber-400/50">
                {feat.icon}
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase block mb-1">
                {feat.badge}
              </span>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. 3 Langkah Mudah Memulai ── */}
      <section id="cara-kerja" className="relative z-10 py-20 bg-[#090b12] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">
              ALUR SIMULASI INSTAN
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Mulai Trading dalam 3 Langkah
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-black font-mono flex items-center justify-center text-base mb-4 shadow-lg shadow-amber-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-white mb-2">Buka Terminal atau Buat Akun</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Langsung masuk ke Mode Tamu tanpa instalasi apapun, atau buat akun gratis 10 detik agar portofolio tersimpan di cloud.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-black font-mono flex items-center justify-center text-base mb-4 shadow-lg shadow-emerald-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-white mb-2">Kas Rp 50 Juta Langsung Masuk</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Saldo kas virtual otomatis aktif di RDN simulator Anda. Anda bebas membeli saham bluechip, gorengan, maupun koin kripto.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="w-10 h-10 rounded-full bg-cyan-500 text-black font-black font-mono flex items-center justify-center text-base mb-4 shadow-lg shadow-cyan-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-white mb-2">Eksekusi &amp; Aktifkan AI Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pasang order beli/jual dengan presisi, aktifkan AI Pilot untuk mengawasi Take Profit dan Stop Loss secara otomatis.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={handleEnterTerminal}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm font-mono tracking-wide shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Luncurkan Workstation Sekarang &rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ Accordion ── */}
      <section id="faq" className="relative z-10 py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
            PERTANYAAN UMUM
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Kerap Ditanyakan (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
              >
                <span className="text-sm sm:text-base font-bold text-white font-sans">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-amber-400' : ''}`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. High-Impact Closing CTA Card ── */}
      <section className="relative z-10 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 border border-white/20 p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block text-3xl mb-4">🚀</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Siap Mengasah Skill Trading Anda Tanpa Rasa Takut?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan ribuan retail trader Indonesia yang telah menguji strategi, membaca bandar, dan memantau aset 24/7 di TradeSim Pro.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleEnterTerminal}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm font-mono tracking-wide shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>BUKA TERMINAL WORKSTATION ⚡</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAuth('register')}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-white font-bold text-sm backdrop-blur-md active:scale-95 transition-all cursor-pointer"
              >
                Daftar Akun Gratis Sekarang
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#05070a] py-12 text-xs text-zinc-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-500 text-black font-black flex items-center justify-center text-xs font-mono">
                ⚡
              </div>
              <span className="font-bold text-white font-mono text-sm">
                TRADESIM<span className="text-amber-400">.PRO</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono ml-2">
                © {new Date().getFullYear()} TradeSim FinTech Systems. All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-6 text-zinc-400 font-medium">
              <button type="button" onClick={handleEnterTerminal} className="hover:text-amber-400 transition-colors cursor-pointer">Terminal</button>
              <Link href="/markets" className="hover:text-amber-400 transition-colors">Markets</Link>
              <Link href="/crypto" className="hover:text-amber-400 transition-colors">Crypto</Link>
              <Link href="/portfolio" className="hover:text-amber-400 transition-colors">Portofolio</Link>
              <Link href="/championship" className="hover:text-amber-400 transition-colors">Liga</Link>
            </div>
          </div>

          <div className="pt-6 text-[11px] text-zinc-500 leading-relaxed text-center sm:text-left">
            <p>
              <strong>Disclaimer Edukasi &amp; Legal:</strong> TradeSim Pro adalah platform simulasi finansial independen yang ditujukan khusus untuk tujuan edukasi dan pelatihan analisis pasar. Seluruh transaksi saham dan mata uang kripto di platform ini menggunakan dana virtual simulasi dan tidak melibatkan uang riil. Data pasar diperoleh dari penyedia pihak ketiga publik secara real-time.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal Popup ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
