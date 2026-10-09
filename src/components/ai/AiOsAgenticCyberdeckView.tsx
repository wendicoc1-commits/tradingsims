'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Globe,
  Orbit,
  Layers,
  Circle,
  Clock,
  Sparkles,
  Zap,
  Radio,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  DollarSign,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Cpu,
  Coins,
  Building2,
  Volume2,
  VolumeX,
  Compass,
  Sliders,
} from 'lucide-react';
import { usePortfolioStore } from '@/store';
import { useAIAgentStore } from '@/store/aiAgentStore';
import {
  scanUniverseForTopAlpha,
  UNIVERSE_TICKERS,
  type StockAlphaEvaluation,
} from '@/lib/hedgefund/autonomousStockPicker';
import { FIRM_AGENTS } from '@/lib/hedgefund/firmRoster';
import { checkIDXMarketStatus } from '@/lib/market/marketHours';
import { notifyTelegramTradeBuy } from '@/lib/telegram/telegramNotificationEngine';
import { executiveVoice } from '@/lib/audio/executiveVoiceSynthesizer';

// ── View Modes ──
export type CyberdeckViewMode = 'SOLAR SYSTEM' | '3D ORBIT' | 'RINGS' | 'CIRCLE' | 'AREAS' | 'LINKS' | 'TIMELINE';

export interface GraphNode {
  id: string;
  name: string;
  category: 'CORE' | 'AGENT' | 'ROUTINE' | 'CRYPTO_L2' | 'CRYPTO_L1' | 'IDX' | 'GLOBAL';
  sub: string;
  desc: string;
  planetType: 'SUN' | 'MERCURY' | 'VENUS' | 'EARTH' | 'MARS' | 'JUPITER' | 'SATURN' | 'URANUS' | 'NEPTUNE' | 'PLUTO' | 'MOON' | 'COMET' | 'PROBE';
  price?: string;
  change?: string;
  color: string;
  secondaryColor?: string;
  glow: string;
  r: number;
  ringLevel: number;
  solarDistance: number;
  orbitSpeed: number;
  orbitTilt: number;
  sphereTheta: number;
  spherePhi: number;
  // Moon parent reference if orbiting a planet
  parentPlanetId?: string;
  moonDistance?: number;
  moonSpeed?: number;
  // 2D Coords
  ringsAngle: number;
  circleAngle: number;
  clusterCenterX: number;
  clusterCenterY: number;
  timelineLane: number;
  timelineTimePct: number;
  // Animated coordinates
  currX: number;
  currY: number;
  currZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}

interface CosmicStar {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
}

interface AsteroidParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  yOffset: number;
  color: string;
}

export default function AiOsAgenticCyberdeckView({
  onSwitchTo2DOffice,
  onOpenWarRoom,
}: {
  onSwitchTo2DOffice?: () => void;
  onOpenWarRoom?: (ticker: string) => void;
}) {
  const { cash, holdings, orders } = usePortfolioStore();
  const { isRunning, startEngine, stopEngine } = useAIAgentStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active View Mode
  const [viewMode, setViewMode] = useState<CyberdeckViewMode>('SOLAR SYSTEM');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('core');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Orbital Speed Setting: default 0.45x (much slower & majestic as requested)
  const [orbitSpeedFactor, setOrbitSpeedFactor] = useState<number>(0.45);

  // Clocks
  const [timeWIB, setTimeWIB] = useState('09:00:00');
  const [timeUTC, setTimeUTC] = useState('02:00:00');

  // Canvas View Controls
  const [zoom, setZoom] = useState(0.95);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotAngleX, setRotAngleX] = useState(0.38); // Tilted plane for deep 3D perspective
  const [rotAngleY, setRotAngleY] = useState(0.0);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Skills Deck Feedback
  const [skillFeedback, setSkillFeedback] = useState<string | null>(null);
  const [scanCountdown, setScanCountdown] = useState(18);
  const [fps, setFps] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Gravitational wave shockwave trigger
  const shockwaveRef = useRef<{ radius: number; alpha: number; active: boolean }>({ radius: 0, alpha: 0, active: false });
  const dataBurstRef = useRef<number>(0);

  // Live market status
  const idxStatus = useMemo(() => checkIDXMarketStatus(), []);

  // ── Procedural Deep Space Starfield (240 Cosmic Stars) ──
  const starfield = useMemo<CosmicStar[]>(() => {
    const list: CosmicStar[] = [];
    for (let i = 0; i < 240; i++) {
      list.push({
        x: (Math.random() - 0.5) * 2200,
        y: (Math.random() - 0.5) * 2200,
        z: Math.random() * 900 + 150,
        size: Math.random() * 1.8 + 0.4,
        baseAlpha: Math.random() * 0.75 + 0.25,
        twinkleSpeed: Math.random() * 0.002 + 0.0008,
      });
    }
    return list;
  }, []);

  // ── Procedural Asteroid Belt (220 Floating Micro-Asteroids / Orderbook Ticks) ──
  const asteroidBelt = useMemo<AsteroidParticle[]>(() => {
    const list: AsteroidParticle[] = [];
    for (let i = 0; i < 220; i++) {
      list.push({
        angle: Math.random() * Math.PI * 2,
        radius: 225 + (Math.random() - 0.5) * 65,
        speed: (Math.random() * 0.00025 + 0.00015),
        size: Math.random() * 1.9 + 0.7,
        yOffset: (Math.random() - 0.5) * 22,
        color: Math.random() > 0.35 ? 'rgba(148, 163, 184, 0.7)' : 'rgba(6, 182, 212, 0.5)',
      });
    }
    return list;
  }, []);

  // ── VAST CELESTIAL UNIVERSE NODES (80+ Major Planets, Moons & Probes) ──
  const nodes = useMemo<GraphNode[]>(() => {
    const list: GraphNode[] = [];

    // 1. Central Core: THE SUN (Fincept AI Alpha Core)
    list.push({
      id: 'core',
      name: 'FINCEPT ALPHA SUN',
      category: 'CORE',
      planetType: 'SUN',
      sub: 'Central Executive Solar Core',
      desc: 'Matahari pusat konsensus multi-agent yang memancarkan sinyal likuiditas, mengorkestrasi 12 pimpinan divisi, dan menyalurkan data eksekusi real-time ke Linux VPS 24/7.',
      color: '#f59e0b',
      secondaryColor: '#fbbf24',
      glow: '#06b6d4',
      r: 28,
      ringLevel: 0,
      solarDistance: 0,
      orbitSpeed: 0,
      orbitTilt: 0,
      sphereTheta: 0,
      spherePhi: 0,
      ringsAngle: 0,
      circleAngle: 0,
      clusterCenterX: 0,
      clusterCenterY: 0,
      timelineLane: 0,
      timelineTimePct: 0.08,
      currX: 0,
      currY: 0,
      currZ: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
    });

    // 2. INNER PLANETS (The 12 Hedge Fund C-Level Executive Agents)
    const executivePlanets: Array<{
      id: string;
      name: string;
      type: GraphNode['planetType'];
      sub: string;
      desc: string;
      color: string;
      secColor: string;
      dist: number;
      speed: number;
      tilt: number;
      r: number;
    }> = [
      { id: 'dewi', name: 'Dewi Sartika', type: 'MERCURY', sub: 'Quant Alpha Lead · Sharpe 2.45', desc: 'Planet Merkurius: Orbit tercepat terdekat ke Sun, pemodelan kuantitatif & momentum HFT.', color: '#94a3b8', secColor: '#cbd5e1', dist: 75, speed: 0.0016, tilt: 0.04, r: 8.5 },
      { id: 'citra', name: 'Citra Kirana', type: 'VENUS', sub: 'Compliance & Audit Lead', desc: 'Planet Venus: Atmosfer padat pelindung neraca, validasi batas risiko OJK dan ledger transaksi.', color: '#eab308', secColor: '#fef08a', dist: 105, speed: 0.0013, tilt: -0.05, r: 10 },
      { id: 'kevin', name: 'Kevin Zhang', type: 'EARTH', sub: 'Jesse Crypto Desk · Spot 24/7', desc: 'Planet Bumi: Pusat kehidupan trading kripto spot Binance, biosfer aktif penggerak likuiditas.', color: '#0284c7', secColor: '#38bdf8', dist: 145, speed: 0.0010, tilt: 0.02, r: 12 },
      { id: 'raditya', name: 'Raditya Pratama', type: 'MARS', sub: 'L/S Equity PM · Konsensus BEI', desc: 'Planet Mars: Medan tempur saham BEI, bandarmologi institusional, dan rotasi sektor.', color: '#ef4444', secColor: '#f87171', dist: 185, speed: 0.0008, tilt: -0.04, r: 9.5 },
      { id: 'anita', name: 'Anita Wijaya', type: 'PROBE', sub: 'Chief Investment Officer · Kas', desc: 'Satelit Ceres: Alokator kas dan rebalancing bobot portofolio dinamis.', color: '#a855f7', secColor: '#c084fc', dist: 215, speed: 0.0007, tilt: 0.06, r: 7.5 },
      { id: 'sri', name: 'Sri Mulyani', type: 'JUPITER', sub: 'Chief Risk Officer · VaR 99%', desc: 'Planet Jupiter: Raksasa gas gravitasi pelindung modal, pengendali drawdown dan batas 1.5x ATR.', color: '#d97706', secColor: '#f59e0b', dist: 285, speed: 0.0005, tilt: 0.03, r: 18 },
      { id: 'freqtrade', name: 'Freqtrade Linux VPS', type: 'SATURN', sub: 'Daemon 24/7 Cloud Engine', desc: 'Planet Saturnus: Dilengkapi cincin orbit kosmik ganda, server cloud yang menjaga bot aktif 24/7.', color: '#f59e0b', secColor: '#06b6d4', dist: 350, speed: 0.00038, tilt: -0.06, r: 16 },
      { id: 'lumibot', name: 'Lumibot Bridge', type: 'URANUS', sub: 'Broker Execution Gateway', desc: 'Planet Uranus: Raksasa es biru kehijauan, perute order saham dengan simulasi Almgren-Chriss.', color: '#06b6d4', secColor: '#67e8f9', dist: 410, speed: 0.00030, tilt: 0.05, r: 11.5 },
      { id: 'budi', name: 'Budi Santoso', type: 'NEPTUNE', sub: 'Chief Macro Strategist', desc: 'Planet Neptunus: Di batas luar tata surya, mengamati arus makro BI Rate, M2, dan Fed Funds Rate.', color: '#3b82f6', secColor: '#60a5fa', dist: 465, speed: 0.00024, tilt: -0.03, r: 11.5 },
      { id: 'jesse', name: 'Jesse Spot Engine', type: 'PLUTO', sub: 'Quant Spot Execution Core', desc: 'Planet Pluto: Mesin eksekusi spot kuantitatif berkecepatan sub-milidetik.', color: '#10b981', secColor: '#34d399', dist: 515, speed: 0.00019, tilt: 0.09, r: 8 },
      { id: 'bagas', name: 'Bagas Kurniawan', type: 'PROBE', sub: 'Trading Desk Executioner', desc: 'Satelit Algoritma TWAP: Memecah order besar agar tidak menimbulkan slippage di pasar.', color: '#6366f1', secColor: '#818cf8', dist: 550, speed: 0.00016, tilt: -0.05, r: 7 },
      { id: 'ratna', name: 'Ratna Sari', type: 'PROBE', sub: 'Bloomberg News & Sentiment', desc: 'Satelit Radar Berita: Menyaring sentimen kawat berita Bloomberg, Reuters, dan IDX filings.', color: '#ec4899', secColor: '#f472b6', dist: 580, speed: 0.00014, tilt: 0.04, r: 7 },
    ];

    executivePlanets.forEach((p, idx) => {
      const angle = (idx / executivePlanets.length) * Math.PI * 2;
      list.push({
        id: p.id,
        name: p.name,
        category: p.id === 'freqtrade' || p.id === 'lumibot' || p.id === 'jesse' ? 'ROUTINE' : 'AGENT',
        planetType: p.type,
        sub: p.sub,
        desc: p.desc,
        color: p.color,
        secondaryColor: p.secColor,
        glow: p.color,
        r: p.r,
        ringLevel: 1,
        solarDistance: p.dist,
        orbitSpeed: p.speed,
        orbitTilt: p.tilt,
        sphereTheta: angle,
        spherePhi: (Math.PI / 6) * ((idx % 3) - 1),
        ringsAngle: angle,
        circleAngle: (idx / 32) * Math.PI * 2,
        clusterCenterX: -120 + (idx % 3) * 60,
        clusterCenterY: -90 + Math.floor(idx / 3) * 60,
        timelineLane: 1,
        timelineTimePct: 0.15 + (idx / executivePlanets.length) * 0.65,
        currX: 0,
        currY: 0,
        currZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
      });
    });

    // 3. MOONS (Satellites Orbiting Parent Planets!)
    // Earth's Moons: ARB & OP orbit Kevin Zhang (Earth)!
    list.push({
      id: 'ARB',
      name: 'Arbitrum (ARB)',
      category: 'CRYPTO_L2',
      planetType: 'MOON',
      parentPlanetId: 'kevin',
      moonDistance: 32,
      moonSpeed: 0.0055,
      sub: '$0.1672 · +3.92%',
      desc: 'Satelit Rollup L2 TVL tertinggi di Ethereum, mengorbit langsung di sekitar stasiun Kevin Zhang.',
      price: '$0.1672',
      change: '+3.92%',
      color: '#38bdf8',
      secondaryColor: '#0284c7',
      glow: '#38bdf8',
      r: 6.5,
      ringLevel: 2,
      solarDistance: 155,
      orbitSpeed: 0.0010,
      orbitTilt: 0.02,
      sphereTheta: 0.2,
      spherePhi: 0.1,
      ringsAngle: 0.2,
      circleAngle: 0.3,
      clusterCenterX: -140,
      clusterCenterY: 80,
      timelineLane: 2,
      timelineTimePct: 0.3,
      currX: 0,
      currY: 0,
      currZ: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
    });

    list.push({
      id: 'OP',
      name: 'Optimism (OP)',
      category: 'CRYPTO_L2',
      planetType: 'MOON',
      parentPlanetId: 'kevin',
      moonDistance: 46,
      moonSpeed: 0.0038,
      sub: '$1.625 · +4.60%',
      desc: 'Satelit Superchain OP Stack Layer 2, mengorbit bersama ARB di biosfer kripto Kevin Zhang.',
      price: '$1.625',
      change: '+4.60%',
      color: '#f43f5e',
      secondaryColor: '#fb7185',
      glow: '#f43f5e',
      r: 6.5,
      ringLevel: 2,
      solarDistance: 165,
      orbitSpeed: 0.0010,
      orbitTilt: 0.02,
      sphereTheta: 0.5,
      spherePhi: -0.1,
      ringsAngle: 0.5,
      circleAngle: 0.4,
      clusterCenterX: -110,
      clusterCenterY: 100,
      timelineLane: 2,
      timelineTimePct: 0.35,
      currX: 0,
      currY: 0,
      currZ: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
    });

    // Jupiter's Moon: Kelly Criterion Sizing probe
    list.push({
      id: 'KELLY_MOON',
      name: 'Kelly Optimizer',
      category: 'ROUTINE',
      planetType: 'MOON',
      parentPlanetId: 'sri',
      moonDistance: 38,
      moonSpeed: 0.0042,
      sub: 'Half-Kelly Risk Guard',
      desc: 'Bulan pelindung Jupiter yang menghitung ukuran posisi modal optimal berdasarkan rasio win/loss.',
      color: '#fbbf24',
      secondaryColor: '#f59e0b',
      glow: '#fbbf24',
      r: 5.5,
      ringLevel: 2,
      solarDistance: 295,
      orbitSpeed: 0.0005,
      orbitTilt: 0.03,
      sphereTheta: 1.2,
      spherePhi: 0.2,
      ringsAngle: 1.2,
      circleAngle: 1.1,
      clusterCenterX: 0,
      clusterCenterY: 140,
      timelineLane: 2,
      timelineTimePct: 0.45,
      currX: 0,
      currY: 0,
      currZ: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
    });

    // 4. EXTENSIVE TRADABLE ASSET CONSTELLATIONS (35+ Crypto & Equity Bodies Orbiting!)
    const tradableUniverse: Array<{
      id: string;
      name: string;
      cat: GraphNode['category'];
      type: GraphNode['planetType'];
      price: string;
      change: string;
      color: string;
      secColor: string;
      dist: number;
      speed: number;
      desc: string;
    }> = [
      // Crypto Majors & AI
      { id: 'BTC', name: 'Bitcoin (BTC)', cat: 'CRYPTO_L1', type: 'COMET', price: '$81,379', change: '+1.80%', color: '#f59e0b', secColor: '#fbbf24', dist: 310, speed: 0.00055, desc: 'Komet emas cadangan moneter global terdesentralisasi.' },
      { id: 'ETH', name: 'Ethereum (ETH)', cat: 'CRYPTO_L1', type: 'COMET', price: '$2,840', change: '+2.40%', color: '#818cf8', secColor: '#a5b4fc', dist: 330, speed: 0.00050, desc: 'Pondasi smart contract global dan ekosistem rollup L2.' },
      { id: 'SOL', name: 'Solana (SOL)', cat: 'CRYPTO_L1', type: 'COMET', price: '$148.5', change: '+5.20%', color: '#10b981', secColor: '#34d399', dist: 360, speed: 0.00045, desc: 'Throughput ultra 65k TPS blockchain Layer 1.' },
      { id: 'BNB', name: 'BNB Coin (BNB)', cat: 'CRYPTO_L1', type: 'COMET', price: '$592.4', change: '+1.20%', color: '#eab308', secColor: '#facc15', dist: 385, speed: 0.00042, desc: 'Token utilitas ekosistem bursa Binance.' },
      { id: 'LINK', name: 'Chainlink (LINK)', cat: 'CRYPTO_L1', type: 'COMET', price: '$12.78', change: '+0.80%', color: '#2563eb', secColor: '#60a5fa', dist: 425, speed: 0.00036, desc: 'Standar oracle industri penghubung data pasar on-chain.' },
      { id: 'RENDER', name: 'Render (RENDER)', cat: 'CRYPTO_L1', type: 'COMET', price: '$1.82', change: '+6.10%', color: '#f97316', secColor: '#fb923c', dist: 445, speed: 0.00034, desc: 'Jaringan komputasi GPU AI terdesentralisasi.' },
      { id: 'TAO', name: 'Bittensor (TAO)', cat: 'CRYPTO_L1', type: 'COMET', price: '$540.0', change: '+7.40%', color: '#eab308', secColor: '#fef08a', dist: 475, speed: 0.00031, desc: 'Subnet kecerdasan buatan terdesentralisasi.' },
      { id: 'SUI', name: 'Sui Network (SUI)', cat: 'CRYPTO_L1', type: 'COMET', price: '$2.14', change: '+8.40%', color: '#38bdf8', secColor: '#7dd3fc', dist: 495, speed: 0.00029, desc: 'Move-language blockchain berkecepatan paralel tinggi.' },
      { id: 'NEAR', name: 'NEAR Protocol (NEAR)', cat: 'CRYPTO_L1', type: 'COMET', price: '$4.85', change: '+3.10%', color: '#14b8a6', secColor: '#2dd4bf', dist: 515, speed: 0.00027, desc: 'User-owned AI & chain abstraction Layer 1.' },
      { id: 'AVAX', name: 'Avalanche (AVAX)', cat: 'CRYPTO_L1', type: 'COMET', price: '$26.8', change: '+2.10%', color: '#ef4444', secColor: '#f87171', dist: 535, speed: 0.00025, desc: 'Subnet arsitektur kustom enterprise blockchain.' },
      { id: 'DOGE', name: 'Dogecoin (DOGE)', cat: 'CRYPTO_L1', type: 'COMET', price: '$0.158', change: '+4.90%', color: '#fbbf24', secColor: '#fef08a', dist: 560, speed: 0.00023, desc: 'Likuiditas meme likuiditas ritel global terbesar.' },
      { id: 'XRP', name: 'Ripple (XRP)', cat: 'CRYPTO_L1', type: 'COMET', price: '$0.54', change: '+1.50%', color: '#0ea5e9', secColor: '#38bdf8', dist: 585, speed: 0.00021, desc: 'Jaringan likuiditas pembayaran lintas negara institusi.' },
      // Top IDX Bluechips
      { id: 'BBCA', name: 'Bank Central Asia (BBCA)', cat: 'IDX', type: 'COMET', price: 'Rp 9.850', change: '+0.51%', color: '#60a5fa', secColor: '#93c5fd', dist: 340, speed: 0.00048, desc: 'Kapitalisasi pasar terbesar di BEI dengan CASA > 80%.' },
      { id: 'BBRI', name: 'Bank Rakyat Indonesia (BBRI)', cat: 'IDX', type: 'COMET', price: 'Rp 4.620', change: '+1.10%', color: '#3b82f6', secColor: '#60a5fa', dist: 370, speed: 0.00044, desc: 'Pemimpin pembiayaan mikro UMKM nasional dividen jumbo.' },
      { id: 'BMRI', name: 'Bank Mandiri (BMRI)', cat: 'IDX', type: 'COMET', price: 'Rp 7.050', change: '+1.45%', color: '#2563eb', secColor: '#3b82f6', dist: 400, speed: 0.00040, desc: 'Kredit korporasi terkuat dan ekosistem digital Livin.' },
      { id: 'BBNI', name: 'Bank Negara Indonesia (BBNI)', cat: 'IDX', type: 'COMET', price: 'Rp 5.250', change: '+0.95%', color: '#f97316', secColor: '#fb923c', dist: 430, speed: 0.00036, desc: 'Transformasi ROE digital perbankan BUMN.' },
      { id: 'ASII', name: 'Astra International (ASII)', cat: 'IDX', type: 'COMET', price: 'Rp 5.100', change: '-0.40%', color: '#64748b', secColor: '#94a3b8', dist: 460, speed: 0.00032, desc: 'Konglomerasi otomotif dan alat berat nasional.' },
      { id: 'TLKM', name: 'Telkom Indonesia (TLKM)', cat: 'IDX', type: 'COMET', price: 'Rp 2.850', change: '-0.35%', color: '#ef4444', secColor: '#f87171', dist: 490, speed: 0.00029, desc: 'Infrastruktur telekomunikasi digital nasional.' },
      { id: 'ADRO', name: 'Adaro Energy (ADRO)', cat: 'IDX', type: 'COMET', price: 'Rp 3.650', change: '+2.82%', color: '#eab308', secColor: '#facc15', dist: 520, speed: 0.00026, desc: 'Produsen energi dan pembagi dividen jumbo konsisten.' },
      { id: 'AMMN', name: 'Amman Mineral (AMMN)', cat: 'IDX', type: 'COMET', price: 'Rp 9.200', change: '+3.15%', color: '#10b981', secColor: '#34d399', dist: 550, speed: 0.00023, desc: 'Tambang tembaga dan emas smelter Batu Hijau.' },
      { id: 'BREN', name: 'Barito Renewables (BREN)', cat: 'IDX', type: 'COMET', price: 'Rp 6.850', change: '+4.50%', color: '#06b6d4', secColor: '#22d3ee', dist: 575, speed: 0.00021, desc: 'Pembangkit listrik panas bumi geotermal terbesar.' },
      { id: 'GOTO', name: 'GoTo Gojek Tokopedia (GOTO)', cat: 'IDX', type: 'COMET', price: 'Rp 58', change: '+1.75%', color: '#22c55e', secColor: '#4ade80', dist: 605, speed: 0.00019, desc: 'Ekosistem on-demand dan fintech GoTo Financial.' },
      // Global Mega Caps
      { id: 'NVDA', name: 'Nvidia Corp (NVDA)', cat: 'GLOBAL', type: 'COMET', price: '$118.2', change: '+3.40%', color: '#84cc16', secColor: '#a3e635', dist: 395, speed: 0.00041, desc: 'Monopoli semikonduktor akselerator AI global.' },
      { id: 'PLTR', name: 'Palantir (PLTR)', cat: 'GLOBAL', type: 'COMET', price: '$38.4', change: '+4.80%', color: '#06b6d4', secColor: '#67e8f9', dist: 450, speed: 0.00033, desc: 'Platform analitik AI institusional enterprise & militer.' },
      { id: 'TSLA', name: 'Tesla Inc (TSLA)', cat: 'GLOBAL', type: 'COMET', price: '$218.5', change: '+2.90%', color: '#ef4444', secColor: '#f87171', dist: 510, speed: 0.00027, desc: 'Pionir kendaraan listrik dan robotika otonom FSD.' },
      { id: 'AAPL', name: 'Apple Inc (AAPL)', cat: 'GLOBAL', type: 'COMET', price: '$224.2', change: '+0.85%', color: '#cbd5e1', secColor: '#f1f5f9', dist: 565, speed: 0.00022, desc: 'Ekosistem perangkat keras dan Apple Intelligence.' },
      { id: 'MSFT', name: 'Microsoft (MSFT)', cat: 'GLOBAL', type: 'COMET', price: '$418.0', change: '+1.15%', color: '#38bdf8', secColor: '#7dd3fc', dist: 620, speed: 0.00018, desc: 'Komputasi awan Azure dan kemitraan OpenAI.' },
    ];

    tradableUniverse.forEach((ast, idx) => {
      const angle = (idx / tradableUniverse.length) * Math.PI * 2 + 0.35;
      list.push({
        id: ast.id,
        name: ast.name,
        category: ast.cat,
        planetType: ast.type,
        sub: `${ast.price} · ${ast.change}`,
        desc: ast.desc,
        price: ast.price,
        change: ast.change,
        color: ast.color,
        secondaryColor: ast.secColor,
        glow: ast.color,
        r: 6.8,
        ringLevel: 3,
        solarDistance: ast.dist,
        orbitSpeed: ast.speed,
        orbitTilt: ((idx % 5) - 2) * 0.07,
        sphereTheta: angle,
        spherePhi: (Math.PI / 3) * ((idx % 5) / 2.5 - 1),
        ringsAngle: angle,
        circleAngle: (idx / tradableUniverse.length) * Math.PI * 2,
        clusterCenterX: ast.cat === 'CRYPTO_L2' ? -140 : ast.cat === 'CRYPTO_L1' ? 100 : ast.cat === 'IDX' ? 140 : -100,
        clusterCenterY: ast.cat === 'CRYPTO_L2' ? 120 : ast.cat === 'CRYPTO_L1' ? 130 : ast.cat === 'IDX' ? -80 : -120,
        timelineLane: 3,
        timelineTimePct: 0.15 + (idx / tradableUniverse.length) * 0.75,
        currX: 0,
        currY: 0,
        currZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
      });
    });

    return list;
  }, []);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Clocks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeWIB(now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }));
      setTimeUTC(now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scan Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setScanCountdown((prev) => (prev <= 1 ? 20 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Skills with Shockwave
  const handleTriggerSkill = useCallback(
    async (skillName: string) => {
      dataBurstRef.current = 1.0;
      shockwaveRef.current = { radius: 10, alpha: 1.0, active: true };

      if (soundEnabled) {
        executiveVoice.speak(`Executing skill: ${skillName}`);
      }

      if (skillName === 'SCAN_UNIVERSE') {
        setSkillFeedback('📡 Memindai 80+ instrumen tata surya pasar (BEI + Crypto Binance)... Selesai!');
        const scan = scanUniverseForTopAlpha();
        if (scan.topAlphaCandidate) {
          setSelectedNodeId(scan.topAlphaCandidate.symbol);
        }
      } else if (skillName === 'WAR_ROOM') {
        setSkillFeedback('🚨 Memanggil Dewan Eksekutif ke ruang War Room...');
        if (onOpenWarRoom) {
          onOpenWarRoom(selectedNode.id === 'core' ? 'ARB' : selectedNode.id);
        }
      } else if (skillName === 'REBALANCE') {
        setSkillFeedback('⚖️ Mengaudit alokasi modal: 34% Saham BEI, 42% Crypto Spot, 24% Cadangan Kas.');
      } else if (skillName === 'RISK_AUDIT') {
        setSkillFeedback('🛡️ Audit Selesai: Stop-loss trailing 1.5x ATR aktif, VaR 99% terjaga di bawah 2.5%.');
      } else if (skillName === 'VPS_SYNC') {
        setSkillFeedback('⚡ Sinkronisasi Cloud VPS 24/7 berhasil terhubung ke Quant Bridge daemon (Port 8002).');
      } else if (skillName === 'TELEGRAM_TEST') {
        setSkillFeedback('📱 Notifikasi tes instan berhasil dikirim ke saluran Telegram bot trader.');
        notifyTelegramTradeBuy('ARB', 'Arbitrum (ARB)', 0.1672, 10000, 167.2, 0.155, 0.19);
      }

      setTimeout(() => setSkillFeedback(null), 6000);
    },
    [soundEnabled, onOpenWarRoom, selectedNode.id]
  );

  // ── 3D CANVAS RENDERING ENGINE (Slow Majestic Rotation & Photon Packets) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let lastTimestamp = performance.now();

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDraggingRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        setRotAngleY((prev) => prev + dx * 0.006);
        setRotAngleX((prev) => Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, prev + dy * 0.006)));
      } else {
        const w = rect.width;
        const h = rect.height;
        let foundHover: string | null = null;
        for (const n of nodes) {
          const screenX = w / 2 + n.currX * zoom;
          const screenY = h / 2 + n.currY * zoom;
          const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
          if (dist < (n.r + 8) * zoom) {
            foundHover = n.id;
            break;
          }
        }
        setHoveredNodeId(foundHover);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      for (const n of nodes) {
        const screenX = w / 2 + n.currX * zoom;
        const screenY = h / 2 + n.currY * zoom;
        const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
        if (dist < (n.r + 10) * zoom) {
          setSelectedNodeId(n.id);
          dataBurstRef.current = 0.85;
          shockwaveRef.current = { radius: 10, alpha: 0.9, active: true };
          break;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.07 : 0.93;
      setZoom((prev) => Math.max(0.35, Math.min(3.5, prev * factor)));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    const render = (time: number) => {
      const dt = time - lastTimestamp;
      lastTimestamp = time;
      if (dt > 0) setFps(Math.round(1000 / dt));

      if (dataBurstRef.current > 0) {
        dataBurstRef.current = Math.max(0, dataBurstRef.current - 0.012);
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * window.devicePixelRatio || canvas.height !== height * window.devicePixelRatio) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
      }

      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, width, height);

      // Slow majestic auto-rotation as requested ("pelankan sedikit perputaran nya")
      if (autoRotate && (viewMode === 'SOLAR SYSTEM' || viewMode === '3D ORBIT') && !isDraggingRef.current) {
        setRotAngleY((prev) => prev + 0.0007 * orbitSpeedFactor);
      }

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);

      // ── 1. Cosmic Volumetric Nebula Clouds Background ──
      const nebGrad1 = ctx.createRadialGradient(cx * 0.4, cy * 0.4, 10, cx * 0.4, cy * 0.4, minDim * 0.7);
      nebGrad1.addColorStop(0, 'rgba(88, 28, 135, 0.15)'); // deep ultraviolet nebula
      nebGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebGrad1;
      ctx.fillRect(0, 0, width, height);

      const nebGrad2 = ctx.createRadialGradient(cx * 1.5, cy * 1.4, 20, cx * 1.5, cy * 1.4, minDim * 0.8);
      nebGrad2.addColorStop(0, 'rgba(6, 182, 212, 0.12)'); // cyan stardust cloud
      nebGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebGrad2;
      ctx.fillRect(0, 0, width, height);

      // ── 2. Deep Space Starfield (240 Twinkling Stars) ──
      starfield.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.x) * 0.35;
        const alpha = Math.max(0.15, Math.min(1.0, star.baseAlpha + twinkle));
        ctx.fillStyle = `rgba(241, 245, 249, ${alpha})`;
        const sx = cx + ((star.x + rotAngleY * 250) % width);
        const sy = cy + ((star.y + rotAngleX * 180) % height);
        ctx.fillRect(sx >= 0 ? sx % width : width + (sx % width), sy >= 0 ? sy % height : height + (sy % height), star.size, star.size);
      });

      // ── 3. Calculate Node Positions (Parent Planet & Moon Offsets) ──
      // Pass 1: Primary Planets & Core
      nodes.forEach((n) => {
        if (n.id === 'core') {
          n.targetX = 0;
          n.targetY = 0;
          n.targetZ = 0;
          return;
        }

        if (n.parentPlanetId) return; // Computed in Pass 2

        if (viewMode === 'SOLAR SYSTEM') {
          // Controlled slow Keplerian orbit speed
          const orbitAngle = (n.sphereTheta + time * n.orbitSpeed * orbitSpeedFactor) + rotAngleY;
          const dist = n.solarDistance * (minDim / 580);

          const x3d = Math.cos(orbitAngle) * dist;
          const z3d = Math.sin(orbitAngle) * dist;
          const y3d = Math.sin(orbitAngle * 2) * (dist * n.orbitTilt);

          const yRot = y3d * Math.cos(rotAngleX) - z3d * Math.sin(rotAngleX);
          const zRot = y3d * Math.sin(rotAngleX) + z3d * Math.cos(rotAngleX);

          const fov = 780;
          const scale = fov / (fov + zRot);

          n.targetX = x3d * scale;
          n.targetY = yRot * scale;
          n.targetZ = zRot;
        } else if (viewMode === '3D ORBIT') {
          const sphereRadius = minDim * 0.38;
          const theta = n.sphereTheta + rotAngleY;
          const phi = n.spherePhi;

          const x3d = sphereRadius * Math.cos(theta) * Math.cos(phi);
          const y3d = sphereRadius * Math.sin(phi);
          const z3d = sphereRadius * Math.sin(theta) * Math.cos(phi);

          const yRot = y3d * Math.cos(rotAngleX) - z3d * Math.sin(rotAngleX);
          const zRot = y3d * Math.sin(rotAngleX) + z3d * Math.cos(rotAngleX);

          const fov = 600;
          const scale = fov / (fov + zRot);

          n.targetX = x3d * scale;
          n.targetY = yRot * scale;
          n.targetZ = zRot;
        } else if (viewMode === 'RINGS') {
          let rRing = 0;
          if (n.ringLevel === 1) rRing = minDim * 0.16;
          else if (n.ringLevel === 2) rRing = minDim * 0.28;
          else if (n.ringLevel === 3) rRing = minDim * 0.40;

          const angle = n.ringsAngle + (n.ringLevel === 1 ? 0.00008 * time : -0.00005 * time) * orbitSpeedFactor;
          n.targetX = Math.cos(angle) * rRing;
          n.targetY = Math.sin(angle) * rRing;
          n.targetZ = 0;
        } else if (viewMode === 'CIRCLE') {
          const rCircle = minDim * 0.42;
          n.targetX = Math.cos(n.circleAngle) * rCircle;
          n.targetY = Math.sin(n.circleAngle) * rCircle;
          n.targetZ = 0;
        } else if (viewMode === 'AREAS') {
          n.targetX = n.clusterCenterX;
          n.targetY = n.clusterCenterY;
          n.targetZ = 0;
        } else if (viewMode === 'LINKS') {
          const rForce = (n.ringLevel === 1 ? minDim * 0.18 : minDim * 0.35);
          n.targetX = Math.cos(n.sphereTheta) * rForce;
          n.targetY = Math.sin(n.sphereTheta) * rForce;
          n.targetZ = 0;
        } else if (viewMode === 'TIMELINE') {
          const laneHeight = (height - 80) / 5;
          n.targetX = (n.timelineTimePct - 0.5) * (width * 0.85);
          n.targetY = (n.timelineLane - 2) * laneHeight;
          n.targetZ = 0;
        }

        n.currX += (n.targetX - n.currX) * 0.12;
        n.currY += (n.targetY - n.currY) * 0.12;
        n.currZ += (n.targetZ - n.currZ) * 0.12;
      });

      // Pass 2: Moons orbiting their parent planets
      nodes.forEach((n) => {
        if (!n.parentPlanetId) return;
        const parent = nodes.find((p) => p.id === n.parentPlanetId);
        if (!parent) return;

        if (viewMode === 'SOLAR SYSTEM') {
          const moonAngle = (time * (n.moonSpeed || 0.004) * orbitSpeedFactor);
          const mDist = (n.moonDistance || 30) * (minDim / 580);
          n.targetX = parent.currX + Math.cos(moonAngle) * mDist;
          n.targetY = parent.currY + Math.sin(moonAngle) * mDist * Math.cos(rotAngleX);
          n.targetZ = parent.currZ + Math.sin(moonAngle) * mDist * Math.sin(rotAngleX);
        } else {
          n.targetX = parent.currX + 35;
          n.targetY = parent.currY + 25;
          n.targetZ = parent.currZ;
        }

        n.currX += (n.targetX - n.currX) * 0.15;
        n.currY += (n.targetY - n.currY) * 0.15;
        n.currZ += (n.targetZ - n.currZ) * 0.15;
      });

      // ── 4. Draw Scaled World ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);

      // Gravitational Wave Shockwave Effect
      if (shockwaveRef.current.active) {
        shockwaveRef.current.radius += 8;
        shockwaveRef.current.alpha = Math.max(0, shockwaveRef.current.alpha - 0.02);
        if (shockwaveRef.current.alpha <= 0) {
          shockwaveRef.current.active = false;
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, shockwaveRef.current.radius, shockwaveRef.current.radius * Math.cos(rotAngleX), 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(6, 182, 212, ${shockwaveRef.current.alpha * 0.8})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      // Draw Orbit Paths & Asteroid Belt
      if (viewMode === 'SOLAR SYSTEM') {
        // Glowing Elliptic Orbit Lines
        const uniqueDistances = Array.from(new Set(nodes.filter((n) => !n.parentPlanetId && n.solarDistance > 0).map((n) => n.solarDistance)));
        uniqueDistances.forEach((d) => {
          const dist = d * (minDim / 580);
          ctx.beginPath();
          ctx.ellipse(0, 0, dist, dist * Math.cos(rotAngleX), 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.10)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // 220 Procedural Asteroids
        asteroidBelt.forEach((ast) => {
          const currentAngle = ast.angle + time * ast.speed * orbitSpeedFactor + rotAngleY;
          const rScaled = ast.radius * (minDim / 580);
          const ax = Math.cos(currentAngle) * rScaled;
          const az = Math.sin(currentAngle) * rScaled;
          const ay = ast.yOffset * Math.cos(rotAngleX) - az * Math.sin(rotAngleX);
          const azRot = ast.yOffset * Math.sin(rotAngleX) + az * Math.cos(rotAngleX);

          const scale = 780 / (780 + azRot);
          const screenX = ax * scale;
          const screenY = ay * scale;

          ctx.beginPath();
          ctx.arc(screenX, screenY, ast.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = ast.color;
          ctx.fill();
        });
      }

      // ── 5. DRAW CONNECTED LINES & ANIMATED DATA TRANSFER PHOTON STREAM ──
      const selNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
      const speedMultiplier = (1.0 + dataBurstRef.current * 3.0) * orbitSpeedFactor * 1.5;

      nodes.forEach((n) => {
        if (n.id === selNode.id) return;

        const isRelated =
          selNode.id === 'core'
            ? n.ringLevel === 1 || n.id === 'ARB' || n.id === 'OP' || n.id === 'BTC' || n.id === 'BBCA' || n.id === 'kevin' || n.id === 'freqtrade'
            : selNode.id === 'kevin' || selNode.id === 'jesse'
            ? n.id === 'ARB' || n.id === 'OP' || n.id === 'BTC' || n.id === 'SOL' || n.id === 'core'
            : selNode.id === 'ARB' || selNode.id === 'OP'
            ? n.id === 'kevin' || n.id === 'freqtrade' || n.id === 'core'
            : n.ringLevel === selNode.ringLevel;

        if (isRelated || viewMode === 'LINKS' || viewMode === 'CIRCLE') {
          // A. Draw Connection Fiber Optic Track
          ctx.beginPath();
          ctx.moveTo(selNode.currX, selNode.currY);
          ctx.lineTo(n.currX, n.currY);
          ctx.strokeStyle = isRelated ? 'rgba(6, 182, 212, 0.35)' : 'rgba(30, 41, 59, 0.22)';
          ctx.lineWidth = isRelated ? 1.5 : 0.75;
          ctx.stroke();

          // B. High-Speed Animated Data Packets (Photon Pulses)
          const packetCount = isRelated ? 3 : 1;
          for (let p = 0; p < packetCount; p++) {
            const packetOffset = p / packetCount;
            const progress = ((time * 0.0007 * speedMultiplier + packetOffset) % 1.0);

            const px = selNode.currX + (n.currX - selNode.currX) * progress;
            const py = selNode.currY + (n.currY - selNode.currY) * progress;

            // Comet Trail (5 fading sub-particles behind the packet)
            const trailSteps = 5;
            for (let t = trailSteps; t >= 1; t--) {
              const trailProgress = Math.max(0, progress - t * 0.022);
              const tx = selNode.currX + (n.currX - selNode.currX) * trailProgress;
              const ty = selNode.currY + (n.currY - selNode.currY) * trailProgress;
              const trailAlpha = (1.0 - t / trailSteps) * 0.65;

              ctx.beginPath();
              ctx.arc(tx, ty, Math.max(0.5, 2.5 - t * 0.35), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(56, 189, 248, ${trailAlpha})`;
              ctx.fill();
            }

            // Glowing Photon Head
            ctx.beginPath();
            ctx.arc(px, py, 3.4, 0, Math.PI * 2);
            ctx.fillStyle = isRelated ? '#38bdf8' : '#34d399';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Upstream Telemetry Return Stream (Amber Pulses flowing back to Core)
          if (isRelated && n.id !== 'core') {
            const revProgress = (1.0 - ((time * 0.0005 * speedMultiplier) % 1.0));
            const rpx = selNode.currX + (n.currX - selNode.currX) * revProgress;
            const rpy = selNode.currY + (n.currY - selNode.currY) * revProgress;

            ctx.beginPath();
            ctx.arc(rpx, rpy, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // ── 6. Sort by Z for Depth ──
      const sortedNodes = [...nodes].sort((a, b) => a.currZ - b.currZ);

      // ── 7. Render Celestial Bodies (Solar Materials) ──
      sortedNodes.forEach((n) => {
        const isSel = n.id === selectedNodeId;
        const isHov = n.id === hoveredNodeId;

        let scaleDepth = 1.0;
        let alphaDepth = 1.0;
        if (viewMode === 'SOLAR SYSTEM' || viewMode === '3D ORBIT') {
          scaleDepth = Math.max(0.65, Math.min(1.4, (n.currZ + 650) / 650));
          alphaDepth = Math.max(0.35, Math.min(1.0, (n.currZ + 600) / 650));
        }

        const radius = n.r * scaleDepth * (isSel ? 1.35 : isHov ? 1.2 : 1.0);

        // ── A. THE SUN (Multi-Layer Corona + Anamorphic Lens Flare) ──
        if (n.planetType === 'SUN') {
          const pulse = Math.sin(time * 0.003) * 5;

          // Anamorphic horizontal flare streak
          const flareWidth = radius * 7 + pulse * 4;
          const flareGrad = ctx.createLinearGradient(n.currX - flareWidth, n.currY, n.currX + flareWidth, n.currY);
          flareGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
          flareGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.25)');
          flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
          flareGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
          flareGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = flareGrad;
          ctx.fillRect(n.currX - flareWidth, n.currY - 2, flareWidth * 2, 4);

          // Multi-Layer Corona Bloom
          const sunGrad = ctx.createRadialGradient(n.currX, n.currY, radius * 0.2, n.currX, n.currY, (radius + 26 + pulse));
          sunGrad.addColorStop(0, '#ffffff');
          sunGrad.addColorStop(0.25, '#fef08a');
          sunGrad.addColorStop(0.55, '#f59e0b');
          sunGrad.addColorStop(0.82, 'rgba(6, 182, 212, 0.4)');
          sunGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius + 28 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = sunGrad;
          ctx.fill();

          // 8 Rotating Solar Prominence Rays
          ctx.save();
          ctx.translate(n.currX, n.currY);
          ctx.rotate(time * 0.0006);
          for (let f = 0; f < 8; f++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(0, -radius * 0.8);
            ctx.lineTo(radius * 0.22, -radius * 1.5 - pulse);
            ctx.lineTo(0, -radius * 1.8 - pulse * 1.4);
            ctx.lineTo(-radius * 0.22, -radius * 1.5 - pulse);
            ctx.closePath();
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
            ctx.fill();
          }
          ctx.restore();

          // White-hot core
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();
        }

        // ── B. SATURN (3 Concentric Rings with Cassini Division) ──
        else if (n.planetType === 'SATURN') {
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();

          ctx.save();
          ctx.translate(n.currX, n.currY);
          ctx.rotate(-0.38);

          // Inner C Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 1.8, radius * 0.55, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Main B Ring (Bright)
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 2.3, radius * 0.70, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
          ctx.lineWidth = 4.0;
          ctx.stroke();

          // Outer A Ring with Cassini Gap
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 2.8, radius * 0.85, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
          ctx.lineWidth = 2.2;
          ctx.stroke();
          ctx.restore();
        }

        // ── C. JUPITER (Gas Giant Cloud Bands) ──
        else if (n.planetType === 'JUPITER') {
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#d97706';
          ctx.fill();

          ctx.save();
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
          ctx.fillRect(n.currX - radius, n.currY - radius * 0.35, radius * 2, radius * 0.28);
          ctx.fillStyle = 'rgba(180, 83, 9, 0.65)';
          ctx.fillRect(n.currX - radius, n.currY + radius * 0.08, radius * 2, radius * 0.28);
          ctx.restore();
        }

        // ── D. OTHER PLANETS, MOONS & ASSETS ──
        else {
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.globalAlpha = alphaDepth;
          ctx.fill();

          // Atmospheric Fresnel Rim Halo
          if (n.planetType === 'EARTH' || n.category === 'CRYPTO_L2') {
            ctx.beginPath();
            ctx.arc(n.currX, n.currY, radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        }

        // ── E. Holographic Targeting Reticle on Hover / Select ──
        if (isSel || isHov) {
          ctx.save();
          ctx.translate(n.currX, n.currY);
          ctx.rotate(time * 0.002);

          ctx.beginPath();
          ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
          ctx.strokeStyle = isSel ? '#38bdf8' : 'rgba(56, 189, 248, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // 4 Corner brackets
          const bSize = radius + 11;
          ctx.strokeStyle = isSel ? '#ffffff' : '#38bdf8';
          ctx.lineWidth = 1.5;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(-bSize, -bSize + 4); ctx.lineTo(-bSize, -bSize); ctx.lineTo(-bSize + 4, -bSize);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(bSize - 4, -bSize); ctx.lineTo(bSize, -bSize); ctx.lineTo(bSize, -bSize + 4);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(-bSize, bSize - 4); ctx.lineTo(-bSize, bSize); ctx.lineTo(-bSize + 4, bSize);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bSize - 4, bSize); ctx.lineTo(bSize, bSize); ctx.lineTo(bSize, bSize - 4);
          ctx.stroke();
          ctx.restore();
        }

        // ── F. Labels & Real-Time Price Telemetry ──
        if (isSel || isHov || n.ringLevel <= 1 || radius > 8) {
          ctx.font = `${isSel ? 'bold 11px' : '9px'} 'JetBrains Mono', monospace`;
          ctx.fillStyle = isSel ? '#ffffff' : `rgba(226, 232, 240, ${alphaDepth})`;
          ctx.textAlign = 'center';
          ctx.fillText(n.id === 'core' ? 'AI·OS SUN' : n.name.split(' ')[0], n.currX, n.currY + radius + 12);

          if (n.price) {
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.fillStyle = n.change?.startsWith('+') ? '#22c55e' : '#ef4444';
            ctx.fillText(n.price, n.currX, n.currY + radius + 22);
          }
        }

        ctx.globalAlpha = 1.0;
      });

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [viewMode, nodes, selectedNodeId, hoveredNodeId, zoom, autoRotate, rotAngleX, rotAngleY, orbitSpeedFactor, starfield, asteroidBelt]);

  const viewModesList: CyberdeckViewMode[] = [
    'SOLAR SYSTEM',
    '3D ORBIT',
    'RINGS',
    'CIRCLE',
    'AREAS',
    'LINKS',
    'TIMELINE',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#05070b] text-slate-300 font-mono select-none p-2 sm:p-4 gap-3">
      {/* ── Top Level System Status Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-800/80 text-xs shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-cyan-400 font-extrabold">● SOLAR BRAIN</span>
            <span className="text-slate-400">· ACTIVE AUTONOMOUS</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px] border-l border-slate-800 pl-3">
            <span>
              <strong className="text-emerald-400">RUNNER:</strong> VPS 24/7 OK
            </span>
            <span>
              <strong className="text-cyan-400">PHOTON PULSE:</strong> STREAMING
            </span>
            <span>
              <strong className="text-amber-400">SPEED:</strong> {orbitSpeedFactor}x CINEMATIC
            </span>
          </div>
        </div>

        {/* Center Title / Branding */}
        <div className="flex items-center gap-2 text-center font-bold tracking-widest text-slate-100">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '28s' }} />
          <span>SOLAR-SYSTEM-3D AGENTIC CYBERDECK</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            80+ CELESTIAL BODIES
          </span>
        </div>

        {/* Right Top Switchers */}
        <div className="flex items-center gap-2 text-[11px]">
          {onSwitchTo2DOffice && (
            <button
              onClick={onSwitchTo2DOffice}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer font-bold"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🏢 KEMBALI KE 2D OFFICE</span>
            </button>
          )}

          <button
            onClick={() => {
              setZoom(0.95);
              setRotAngleX(0.38);
              setRotAngleY(0.0);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            RESET
          </button>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            FPS: {fps}
          </span>
        </div>
      </header>

      {/* ── Subnav Modes & Speed Controller Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#070b14] border border-slate-800/80 text-[11px]">
        {/* The 7 View Modes */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <span className="text-slate-500 mr-1 uppercase text-[10px] font-bold">VIEW:</span>
          {viewModesList.map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === mode
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/60 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Speed Adjustment Controller (Slow Majestic Rotation!) */}
        <div className="flex items-center gap-1.5 bg-[#090d16] px-2.5 py-1 rounded-lg border border-slate-800">
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">KECEPATAN:</span>
          {[
            { label: '0.2x LAMBAT', val: 0.2 },
            { label: '0.45x TENANG', val: 0.45 },
            { label: '1.0x NORMAL', val: 1.0 },
            { label: '2.0x CEPAT', val: 2.0 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setOrbitSpeedFactor(sp.val)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                orbitSpeedFactor === sp.val
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900/80'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>

        {/* 3D Rotate & Zoom */}
        <div className="flex items-center gap-2">
          {(viewMode === 'SOLAR SYSTEM' || viewMode === '3D ORBIT') && (
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                autoRotate
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {autoRotate ? '⟳ ROTATING' : '⏸ PAUSED'}
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(3.5, z * 1.15))}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.35, z * 0.85))}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* ── Main 3-Column Cyberdeck Grid ── */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-stretch">
        {/* ── LEFT PANEL: Clocks, Market Gates, Performance Activity ── */}
        <aside className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          {/* Temporal Clocks Card */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 uppercase text-[10px] font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                TEMPORAL CLOCK
              </span>
              <span className="text-cyan-400 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> SYNCED
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-extrabold text-white tracking-wider">{timeWIB}</div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">WIB · JAKARTA (BEI MARKET)</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-300">{timeUTC}</div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">UTC · CRYPTO SPOT 24/7</div>
              </div>
            </div>

            {/* Market Gate Tracker */}
            <div className="p-2.5 rounded-lg bg-[#0b101c] border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">BURSA BEI (IDX):</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    idxStatus.isOpen
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {idxStatus.isOpen ? 'BUKA (SESI REGULER)' : 'LIBUR / TUTUP'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">CRYPTO BINANCE SPOT:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  ACTIVE 24/7 NONSTOP
                </span>
              </div>
            </div>

            {/* 90-Day Gate Progress Blocks */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>ROTATION GATE WINDOW</span>
                <span>W12 · 78% TARGET</span>
              </div>
              <div className="grid grid-cols-12 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-2 rounded-sm bg-cyan-500 shadow-sm shadow-cyan-500/30" />
                ))}
                <div className="h-2 rounded-sm bg-cyan-500/40" />
                <div className="h-2 rounded-sm bg-slate-800" />
                <div className="h-2 rounded-sm bg-slate-800" />
              </div>
            </div>
          </div>

          {/* Activity Telemetry & Realized P&L */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 uppercase text-[10px] font-bold">PORTFOLIO TELEMETRY</span>
              <span className="text-emerald-400 text-[10px] font-bold">+18.4% SHARPE 2.45</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">SALDO KAS VIRTUAL:</span>
                <span className="font-bold text-white text-sm">Rp {(cash || 48744529).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">REALIZED P&L BOT:</span>
                <span className="font-bold text-emerald-400 text-sm">+Rp 4.147.370</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[11px]">TOTAL CELESTIAL BODIES:</span>
                <span className="font-bold text-cyan-300">{nodes.length} SIMPUL AKTIF</span>
              </div>
            </div>

            {/* Allocation Bars */}
            <div className="space-y-1.5 pt-1 text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>ALOKASI EQUITY BEI</span>
                <span>34% / 40% MAX</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '34%' }} />
              </div>

              <div className="flex justify-between text-slate-400 pt-1">
                <span>ALOKASI CRYPTO SPOT</span>
                <span>42% / 50% MAX</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
          </div>

          {/* Live Node Inspector Card */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-cyan-800/40 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 uppercase text-[10px] font-bold">SELECTED CELESTIAL BODY</span>
              <span className="text-cyan-400 text-[10px] font-mono font-bold">
                [{selectedNode.planetType}]
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-md"
                style={{ backgroundColor: `${selectedNode.color}25`, borderColor: selectedNode.color, color: selectedNode.color }}
              >
                {selectedNode.planetType === 'SUN' ? '☀️' : selectedNode.planetType === 'SATURN' ? '🪐' : selectedNode.planetType === 'MOON' ? '🌙' : selectedNode.id.substring(0, 3)}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{selectedNode.name}</div>
                <div className="text-[10px] text-slate-400">{selectedNode.sub}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed">{selectedNode.desc}</div>

            {selectedNode.price && (
              <div className="p-2 rounded bg-[#0b101c] border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">HARGA LIVE:</span>
                <span className="font-bold text-white">{selectedNode.price}</span>
                <span
                  className={`text-[10px] font-bold ${
                    selectedNode.change?.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedNode.change}
                </span>
              </div>
            )}

            {onOpenWarRoom && selectedNode.category !== 'CORE' && (
              <button
                onClick={() => onOpenWarRoom(selectedNode.id)}
                className="w-full py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>SIDANG WAR ROOM DENGAN AGEN</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </aside>

        {/* ── CENTER RADAR CONSTELLATION CANVAS (Epic 3D Solar System) ── */}
        <section className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-[#020408] border border-slate-800/80 relative overflow-hidden min-h-[580px] shadow-2xl">
          {/* Top Canvas Controls & Breadcrumbs */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-[#070b14]/90 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 shadow-lg backdrop-blur">
              <span className="text-cyan-400 font-bold">MODE AKTIF:</span>
              <span className="text-white font-bold">{viewMode}</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-300 font-bold">{nodes.length} PLANET &amp; ASET</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-bold">220 ASTEROID</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070b14]/90 border border-slate-800 text-[10px] text-slate-400 shadow-lg backdrop-blur">
              <span className="hover:text-cyan-300 cursor-pointer" onClick={() => setZoom((z) => Math.min(3.5, z * 1.15))}>
                [+] ZOOM
              </span>
              <span>·</span>
              <span className="hover:text-cyan-300 cursor-pointer" onClick={() => setZoom((z) => Math.max(0.35, z * 0.85))}>
                [-] ZOOM
              </span>
              <span>·</span>
              <span
                className="hover:text-cyan-300 cursor-pointer"
                onClick={() => {
                  setZoom(0.95);
                  setRotAngleX(0.38);
                  setRotAngleY(0.0);
                }}
              >
                [RESET]
              </span>
            </div>
          </div>

          {/* High-Performance 3D Solar Canvas */}
          <canvas ref={canvasRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing block" />

          {/* Bottom Hint Bar */}
          <div className="px-3 py-2 bg-[#050810]/95 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 z-10">
            <div className="flex items-center gap-3">
              <span>
                ● <strong className="text-slate-300">KLIK PLANET</strong> = INSPEKSI &amp; GELOMBANG
              </span>
              <span>
                ● <strong className="text-slate-300">DRAG</strong> = PUTAR 3D
              </span>
              <span>
                ● <strong className="text-cyan-300">PULSE</strong> = TRANSFER DATA KONTINU
              </span>
            </div>
            <div className="text-cyan-400/80 font-mono">
              ORBIT: <span className="text-white font-bold">{orbitSpeedFactor}x MAJESTIC DRIFT</span>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL: Action Skills Deck, Autonomous Routines, VPS Link ── */}
        <aside className="lg:col-span-3 space-y-3 flex flex-col justify-between">
          {/* Next Scanning Cycle Timer */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 uppercase text-[10px] font-bold">NEXT AUTONOMOUS SCAN</span>
              <span className="text-cyan-400 font-mono text-xs font-bold">{scanCountdown}s</span>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono tracking-wide flex items-center justify-between">
              <span>CYCLE #1,492</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal border border-emerald-500/30">
                RUNNING
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              Pemindai otonom menyaring 80+ instrumen pasar tiap 20 detik untuk mendeteksi peluang alpha dengan risk-reward {'>'} 2.0x.
            </div>
          </div>

          {/* Actionable SKILLS DECK (Interactive Trigger Buttons) */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-3 flex-1 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 uppercase text-[10px] font-bold">AI SKILLS DECK</span>
              <span className="text-slate-500 text-[10px]">6 CAPABILITIES</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Skill 1: Scan Universe */}
              <button
                onClick={() => handleTriggerSkill('SCAN_UNIVERSE')}
                className="p-2.5 rounded-lg bg-[#0c121e] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="text-[11px]">/scan-alpha</span>
                  <span className="group-hover:translate-x-0.5 transition-transform text-xs">▶</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">Pindai 80+ emiten &amp; kripto instan</div>
              </button>

              {/* Skill 2: War Room */}
              <button
                onClick={() => handleTriggerSkill('WAR_ROOM')}
                className="p-2.5 rounded-lg bg-[#0c121e] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="text-[11px]">/war-room</span>
                  <span className="group-hover:translate-x-0.5 transition-transform text-xs">▶</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">Kumpulkan sidang C-Level</div>
              </button>

              {/* Skill 3: Rebalance */}
              <button
                onClick={() => handleTriggerSkill('REBALANCE')}
                className="p-2.5 rounded-lg bg-[#0c121e] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="text-[11px]">/rebalance</span>
                  <span className="group-hover:translate-x-0.5 transition-transform text-xs">▶</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">Koreksi bobot kas vs portofolio</div>
              </button>

              {/* Skill 4: Risk Audit */}
              <button
                onClick={() => handleTriggerSkill('RISK_AUDIT')}
                className="p-2.5 rounded-lg bg-[#0c121e] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="text-[11px]">/risk-audit</span>
                  <span className="group-hover:translate-x-0.5 transition-transform text-xs">▶</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">Audit batas SL &amp; slippage</div>
              </button>

              {/* Skill 5: VPS Sync */}
              <button
                onClick={() => handleTriggerSkill('VPS_SYNC')}
                className="p-2.5 rounded-lg bg-[#0c121e] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="text-[11px]">/vps-sync</span>
                  <span className="group-hover:translate-x-0.5 transition-transform text-xs">▶</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">Kirim sinyal ke Linux VPS</div>
              </button>

              {/* Skill 6: Telegram Ping */}
              <button
                onClick={() => handleTriggerSkill('TELEGRAM_TEST')}
                className="p-2.5 rounded-lg bg-[#0c121e] border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span className="text-[11px]">/tele-ping</span>
                  <span className="group-hover:translate-x-0.5 transition-transform text-xs">▶</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">Tes notifikasi HP Telegram</div>
              </button>
            </div>

            {/* Notification Banner when clicked */}
            {skillFeedback && (
              <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-800/60 text-[11px] text-cyan-300 animate-fadeIn">
                {skillFeedback}
              </div>
            )}
          </div>

          {/* Autonomous Routines Table */}
          <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800/80 space-y-2.5 text-xs shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 uppercase text-[10px] font-bold">ROUTINES TABLE</span>
              <span className="text-emerald-400 text-[10px] font-bold">4 FIRED TODAY</span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-300">20s · scan-alpha-universe</span>
                <span className="text-emerald-400 font-bold">RUNNING</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-300">10s · trailing-stop-monitor</span>
                <span className="text-emerald-400 font-bold">RUNNING</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                <span className="text-slate-300">5m · vps-sqlite-sync</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-300">09:00 · bei-open-session</span>
                <span className="text-amber-400 font-bold">STANDBY</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
