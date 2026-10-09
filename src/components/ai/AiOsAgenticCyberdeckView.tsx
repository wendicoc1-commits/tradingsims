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
  planetType: 'SUN' | 'MERCURY' | 'VENUS' | 'EARTH' | 'MARS' | 'JUPITER' | 'SATURN' | 'URANUS' | 'NEPTUNE' | 'MOON' | 'COMET';
  price?: string;
  change?: string;
  color: string;
  secondaryColor?: string;
  glow: string;
  r: number;
  ringLevel: number; // 0: core, 1: inner planet, 2: outer planet, 3: kuiper asset
  // Spherical & Solar Coords
  solarDistance: number;
  orbitSpeed: number;
  orbitTilt: number;
  sphereTheta: number;
  spherePhi: number;
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

// ── Starfield Particle Interface ──
interface CosmicStar {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
}

// ── Procedural Asteroid Interface ──
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

  // Active View Mode (Default: Solar System 3D inspired by Karol Fryc)
  const [viewMode, setViewMode] = useState<CyberdeckViewMode>('SOLAR SYSTEM');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('core');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Clocks
  const [timeWIB, setTimeWIB] = useState('09:00:00');
  const [timeUTC, setTimeUTC] = useState('02:00:00');

  // Canvas View Controls
  const [zoom, setZoom] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotAngleX, setRotAngleX] = useState(0.35); // Initial pitch angle for solar perspective
  const [rotAngleY, setRotAngleY] = useState(0.0);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Skills Deck Feedback
  const [skillFeedback, setSkillFeedback] = useState<string | null>(null);
  const [scanCountdown, setScanCountdown] = useState(18);
  const [fps, setFps] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // High-frequency data burst trigger for pulse animation
  const dataBurstRef = useRef<number>(0);

  // Live market status
  const idxStatus = useMemo(() => checkIDXMarketStatus(), []);

  // ── Procedural Stars Background (Deep Space Starfield) ──
  const starfield = useMemo<CosmicStar[]>(() => {
    const list: CosmicStar[] = [];
    for (let i = 0; i < 180; i++) {
      list.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 800 + 200,
        size: Math.random() * 1.6 + 0.5,
        baseAlpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
      });
    }
    return list;
  }, []);

  // ── Procedural Asteroid Belt (Micro Market Ticks) ──
  const asteroidBelt = useMemo<AsteroidParticle[]>(() => {
    const list: AsteroidParticle[] = [];
    for (let i = 0; i < 90; i++) {
      list.push({
        angle: Math.random() * Math.PI * 2,
        radius: 200 + (Math.random() - 0.5) * 45,
        speed: (Math.random() * 0.0004 + 0.0002) * (Math.random() > 0.5 ? 1 : 1),
        size: Math.random() * 1.8 + 0.8,
        yOffset: (Math.random() - 0.5) * 18,
        color: Math.random() > 0.4 ? 'rgba(148, 163, 184, 0.6)' : 'rgba(6, 182, 212, 0.4)',
      });
    }
    return list;
  }, []);

  // ── Nodes Setup (Solar System Material Hierarchy) ──
  const nodes = useMemo<GraphNode[]>(() => {
    const list: GraphNode[] = [];

    // 1. Central Core: THE SUN (Fincept AI Alpha Core)
    list.push({
      id: 'core',
      name: 'FINCEPT ALPHA CORE',
      category: 'CORE',
      planetType: 'SUN',
      sub: 'Root Executive Solar Brain',
      desc: 'Matahari pusat konsensus multi-agent yang memancarkan sinyal likuiditas, menyelaraskan 12 agen eksekutif, dan mendistribusikan berkas data eksekusi ke VPS 24/7.',
      color: '#f59e0b',
      secondaryColor: '#fbbf24',
      glow: '#06b6d4',
      r: 24,
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

    // 2. Agents as Inner & Middle Planets
    const planetaryAgents: Array<{
      id: string;
      name: string;
      type: GraphNode['planetType'];
      sub: string;
      desc: string;
      color: string;
      secColor?: string;
      dist: number;
      speed: number;
      r: number;
    }> = [
      { id: 'dewi', name: 'Dewi Sartika', type: 'MERCURY', sub: 'Quant Alpha Lead · Sharpe 2.45', desc: 'Planet Merkurius: Orbit tercepat terdekat ke Sun, regresi momentum kuantitatif berkecepatan tinggi.', color: '#94a3b8', secColor: '#cbd5e1', dist: 75, speed: 0.0018, r: 8 },
      { id: 'citra', name: 'Citra Kirana', type: 'VENUS', sub: 'Compliance & Audit Lead', desc: 'Planet Venus: Atmosfer padat pelindung neraca, validasi batas risiko OJK dan ledger transaksi.', color: '#eab308', secColor: '#fef08a', dist: 110, speed: 0.0014, r: 10 },
      { id: 'kevin', name: 'Kevin Zhang', type: 'EARTH', sub: 'Jesse Crypto Desk · Spot 24/7', desc: 'Planet Bumi: Pusat kehidupan trading kripto spot Binance, biosfer aktif penggerak likuiditas.', color: '#0284c7', secColor: '#38bdf8', dist: 155, speed: 0.0011, r: 12 },
      { id: 'raditya', name: 'Raditya Pratama', type: 'MARS', sub: 'L/S Equity PM · Konsensus BEI', desc: 'Planet Mars: Medan tempur saham BEI, bandarmologi institusional, dan rotasi sektor.', color: '#ef4444', secColor: '#f87171', dist: 200, speed: 0.0009, r: 9 },
      { id: 'sri', name: 'Sri Mulyani', type: 'JUPITER', sub: 'Chief Risk Officer · VaR 99%', desc: 'Planet Jupiter: Raksasa gas gravitasi terbesar yang menelan badai pasar, penjaga batas drawdown 1.5x ATR.', color: '#d97706', secColor: '#f59e0b', dist: 270, speed: 0.0006, r: 17 },
      { id: 'freqtrade', name: 'Freqtrade Linux VPS', type: 'SATURN', sub: 'Daemon 24/7 Cloud Engine', desc: 'Planet Saturnus: Dilengkapi cincin orbit kosmik ganda, server cloud yang menjaga bot aktif saat browser mati.', color: '#f59e0b', secColor: '#06b6d4', dist: 340, speed: 0.00045, r: 15 },
      { id: 'lumibot', name: 'Lumibot Bridge', type: 'URANUS', sub: 'Broker Execution Gateway', desc: 'Planet Uranus: Raksasa es biru kehijauan, perute order saham otomatis dengan simulasi Almgren-Chriss.', color: '#06b6d4', secColor: '#67e8f9', dist: 400, speed: 0.00035, r: 11 },
      { id: 'budi', name: 'Budi Santoso', type: 'NEPTUNE', sub: 'Chief Macro Strategist', desc: 'Planet Neptunus: Di batas terluar tata surya, mengamati arus makro BI Rate, M2, dan Fed Funds Rate.', color: '#3b82f6', secColor: '#60a5fa', dist: 455, speed: 0.00028, r: 11 },
    ];

    planetaryAgents.forEach((p, idx) => {
      const angle = (idx / planetaryAgents.length) * Math.PI * 2;
      list.push({
        id: p.id,
        name: p.name,
        category: p.id === 'freqtrade' || p.id === 'lumibot' ? 'ROUTINE' : 'AGENT',
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
        orbitTilt: ((idx % 3) - 1) * 0.08,
        sphereTheta: angle,
        spherePhi: (Math.PI / 6) * ((idx % 3) - 1),
        ringsAngle: angle,
        circleAngle: (idx / 24) * Math.PI * 2,
        clusterCenterX: -120 + (idx % 3) * 60,
        clusterCenterY: -90 + Math.floor(idx / 3) * 60,
        timelineLane: 1,
        timelineTimePct: 0.15 + (idx / planetaryAgents.length) * 0.65,
        currX: 0,
        currY: 0,
        currZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
      });
    });

    // 3. Tradable Assets Universe (Moons, Comets & Kuiper Asteroids)
    const assetsData: Array<{
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
      // Crypto Layer 2 (Focus from user inquiry)
      { id: 'ARB', name: 'Arbitrum (ARB)', cat: 'CRYPTO_L2', type: 'MOON', price: '$0.1672', change: '+3.92%', color: '#38bdf8', secColor: '#0284c7', dist: 180, speed: 0.0016, desc: 'Satelit Rollup L2 TVL tertinggi di ekosistem Ethereum.' },
      { id: 'OP', name: 'Optimism (OP)', cat: 'CRYPTO_L2', type: 'MOON', price: '$1.625', change: '+4.60%', color: '#f43f5e', secColor: '#fb7185', dist: 215, speed: 0.0013, desc: 'Satelit Superchain OP Stack Layer 2 open-source.' },
      // Crypto L1 & DeFi
      { id: 'BTC', name: 'Bitcoin (BTC)', cat: 'CRYPTO_L1', type: 'COMET', price: '$81,379', change: '+1.80%', color: '#f59e0b', secColor: '#fbbf24', dist: 310, speed: 0.0008, desc: 'Komet emas utama: cadangan nilai moneter global.' },
      { id: 'ETH', name: 'Ethereum (ETH)', cat: 'CRYPTO_L1', type: 'COMET', price: '$2,840', change: '+2.40%', color: '#818cf8', secColor: '#a5b4fc', dist: 350, speed: 0.0007, desc: 'Komet pintar platform smart contract desentralisasi.' },
      { id: 'SOL', name: 'Solana (SOL)', cat: 'CRYPTO_L1', type: 'COMET', price: '$148.5', change: '+5.20%', color: '#10b981', secColor: '#34d399', dist: 380, speed: 0.00065, desc: 'Komet kecepatan tinggi L1 throughput ultra.' },
      { id: 'LINK', name: 'Chainlink (LINK)', cat: 'CRYPTO_L1', type: 'COMET', price: '$12.78', change: '+0.80%', color: '#2563eb', secColor: '#60a5fa', dist: 420, speed: 0.0005, desc: 'Standar oracle industri penghubung data on-chain.' },
      // IDX Bluechips
      { id: 'BBCA', name: 'Bank Central Asia (BBCA)', cat: 'IDX', type: 'COMET', price: 'Rp 9.850', change: '+0.51%', color: '#60a5fa', secColor: '#93c5fd', dist: 460, speed: 0.0004, desc: 'Pilar utama perbankan swasta nasional berbobot terbesar di BEI.' },
      { id: 'BBRI', name: 'Bank Rakyat Indonesia (BBRI)', cat: 'IDX', type: 'COMET', price: 'Rp 4.620', change: '+1.10%', color: '#3b82f6', secColor: '#60a5fa', dist: 480, speed: 0.00038, desc: 'Raksasa kredit mikro UMKM dividen yield tinggi.' },
      { id: 'ADRO', name: 'Adaro Energy (ADRO)', cat: 'IDX', type: 'COMET', price: 'Rp 3.650', change: '+2.82%', color: '#eab308', secColor: '#facc15', dist: 510, speed: 0.00032, desc: 'Energi dan dividen jumbo pasca spin-off AADI.' },
      // Global Tech
      { id: 'NVDA', name: 'Nvidia Corp (NVDA)', cat: 'GLOBAL', type: 'COMET', price: '$118.2', change: '+3.40%', color: '#84cc16', secColor: '#a3e635', dist: 535, speed: 0.00028, desc: 'Monopoli akselerator komputasi AI global.' },
    ];

    assetsData.forEach((ast, idx) => {
      const angle = (idx / assetsData.length) * Math.PI * 2 + 0.4;
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
        r: 6.5,
        ringLevel: 3,
        solarDistance: ast.dist,
        orbitSpeed: ast.speed,
        orbitTilt: ((idx % 4) - 1.5) * 0.12,
        sphereTheta: angle,
        spherePhi: (Math.PI / 3) * ((idx % 5) / 2.5 - 1),
        ringsAngle: angle,
        circleAngle: ((8 + idx) / 24) * Math.PI * 2,
        clusterCenterX: ast.cat === 'CRYPTO_L2' ? -130 : ast.cat === 'CRYPTO_L1' ? 90 : 130,
        clusterCenterY: ast.cat === 'CRYPTO_L2' ? 110 : ast.cat === 'CRYPTO_L1' ? 120 : -100,
        timelineLane: 3,
        timelineTimePct: 0.2 + (idx / assetsData.length) * 0.7,
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

  // Skills Deck Trigger (triggers data packet surge)
  const handleTriggerSkill = useCallback(
    async (skillName: string) => {
      // Trigger burst surge of data transfer packets
      dataBurstRef.current = 1.0;

      if (soundEnabled) {
        executiveVoice.speak(`Executing skill: ${skillName}`);
      }

      if (skillName === 'SCAN_UNIVERSE') {
        setSkillFeedback('📡 Memindai 72 instrumen tata surya pasar (BEI + Crypto Binance)... Selesai!');
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

  // ── MAIN CANVAS RENDERING ENGINE (Solar System & Animated Data Packets) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let lastTimestamp = performance.now();
    let globalTime = 0;

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

        setRotAngleY((prev) => prev + dx * 0.008);
        setRotAngleX((prev) => Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, prev + dy * 0.008)));
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
          dataBurstRef.current = 0.8; // Trigger packet burst on node select!
          break;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.max(0.4, Math.min(3.2, prev * factor)));
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
      globalTime = time;
      if (dt > 0) setFps(Math.round(1000 / dt));

      // Fade data burst wave
      if (dataBurstRef.current > 0) {
        dataBurstRef.current = Math.max(0, dataBurstRef.current - 0.015);
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

      // Auto-rotation in 3D views
      if (autoRotate && (viewMode === 'SOLAR SYSTEM' || viewMode === '3D ORBIT') && !isDraggingRef.current) {
        setRotAngleY((prev) => prev + 0.002);
      }

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);

      // ── 1. Draw Starfield Background (Deep Space Atmosphere) ──
      starfield.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.x) * 0.3;
        const alpha = Math.max(0.1, Math.min(1.0, star.baseAlpha + twinkle));
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
        const sx = cx + ((star.x + rotAngleY * 200) % width);
        const sy = cy + ((star.y + rotAngleX * 150) % height);
        ctx.fillRect(sx >= 0 ? sx % width : width + (sx % width), sy >= 0 ? sy % height : height + (sy % height), star.size, star.size);
      });

      // ── 2. Calculate Node Target Positions (Solar System / Morphing) ──
      nodes.forEach((n) => {
        if (n.id === 'core') {
          n.targetX = 0;
          n.targetY = 0;
          n.targetZ = 0;
          return;
        }

        if (viewMode === 'SOLAR SYSTEM') {
          // Keplerian Planetary Elliptic Orbit around the Sun
          const orbitAngle = (n.sphereTheta + time * n.orbitSpeed) + rotAngleY;
          const dist = n.solarDistance * (minDim / 550);

          const x3d = Math.cos(orbitAngle) * dist;
          const z3d = Math.sin(orbitAngle) * dist;
          const y3d = Math.sin(orbitAngle * 2) * (dist * n.orbitTilt);

          // 3D Pitch rotation
          const yRot = y3d * Math.cos(rotAngleX) - z3d * Math.sin(rotAngleX);
          const zRot = y3d * Math.sin(rotAngleX) + z3d * Math.cos(rotAngleX);

          // Perspective depth scaling
          const fov = 750;
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

          const angle = n.ringsAngle + (n.ringLevel === 1 ? 0.00015 * time : -0.0001 * time);
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

        // Smooth Lerp
        n.currX += (n.targetX - n.currX) * 0.12;
        n.currY += (n.targetY - n.currY) * 0.12;
        n.currZ += (n.targetZ - n.currZ) * 0.12;
      });

      // ── 3. Draw Transformed World ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);

      // Draw Solar System Orbits & Asteroid Belt
      if (viewMode === 'SOLAR SYSTEM') {
        // Draw Planetary Orbit Tracks (Elliptic Paths)
        const uniqueDistances = Array.from(new Set(nodes.map((n) => n.solarDistance))).filter((d) => d > 0);
        uniqueDistances.forEach((d) => {
          const dist = d * (minDim / 550);
          ctx.beginPath();
          ctx.ellipse(0, 0, dist, dist * Math.cos(rotAngleX), 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Draw Asteroid Belt Particles (Market Micro-Ticks)
        asteroidBelt.forEach((ast) => {
          const currentAngle = ast.angle + time * ast.speed + rotAngleY;
          const rScaled = ast.radius * (minDim / 550);
          const ax = Math.cos(currentAngle) * rScaled;
          const az = Math.sin(currentAngle) * rScaled;
          const ay = ast.yOffset * Math.cos(rotAngleX) - az * Math.sin(rotAngleX);
          const azRot = ast.yOffset * Math.sin(rotAngleX) + az * Math.cos(rotAngleX);

          const scale = 750 / (750 + azRot);
          const screenX = ax * scale;
          const screenY = ay * scale;

          ctx.beginPath();
          ctx.arc(screenX, screenY, ast.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = ast.color;
          ctx.fill();
        });
      }

      // ── 4. DRAW CONNECTED LINES & ANIMATED DATA PACKETS TRANSFER ──
      const selNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
      const speedMultiplier = 1.0 + dataBurstRef.current * 2.5;

      nodes.forEach((n) => {
        if (n.id === selNode.id) return;

        const isRelated =
          selNode.id === 'core'
            ? n.ringLevel === 1 || n.id === 'ARB' || n.id === 'OP' || n.id === 'kevin' || n.id === 'freqtrade'
            : selNode.id === 'kevin' || selNode.id === 'jesse'
            ? n.id === 'ARB' || n.id === 'OP' || n.id === 'BTC' || n.id === 'core'
            : selNode.id === 'ARB' || selNode.id === 'OP'
            ? n.id === 'kevin' || n.id === 'freqtrade' || n.id === 'core'
            : n.ringLevel === selNode.ringLevel;

        if (isRelated || viewMode === 'LINKS' || viewMode === 'CIRCLE') {
          // A. Draw Fiber Optic Connection Line
          ctx.beginPath();
          ctx.moveTo(selNode.currX, selNode.currY);
          ctx.lineTo(n.currX, n.currY);
          ctx.strokeStyle = isRelated ? 'rgba(6, 182, 212, 0.28)' : 'rgba(30, 41, 59, 0.2)';
          ctx.lineWidth = isRelated ? 1.5 : 0.75;
          ctx.stroke();

          // B. ANIMATED DATA TRANSFER PACKETS (Photon Stream)
          // As requested by user: "saya mau line yang terlink ada animasi kayak transfer data"
          const packetCount = isRelated ? 3 : 1;
          for (let p = 0; p < packetCount; p++) {
            // Compute animated packet progress [0, 1]
            const packetOffset = p / packetCount;
            const progress = ((time * 0.0006 * speedMultiplier + packetOffset) % 1.0);

            // Interpolate position along the line from source to target
            const px = selNode.currX + (n.currX - selNode.currX) * progress;
            const py = selNode.currY + (n.currY - selNode.currY) * progress;

            // Packet Comet Trail (trailing sub-photons)
            const trailSteps = 4;
            for (let t = trailSteps; t >= 1; t--) {
              const trailProgress = Math.max(0, progress - t * 0.025);
              const tx = selNode.currX + (n.currX - selNode.currX) * trailProgress;
              const ty = selNode.currY + (n.currY - selNode.currY) * trailProgress;
              const trailAlpha = (1.0 - t / trailSteps) * 0.6;

              ctx.beginPath();
              ctx.arc(tx, ty, (2.2 - t * 0.35), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(56, 189, 248, ${trailAlpha})`;
              ctx.fill();
            }

            // Glowing Data Packet Head
            ctx.beginPath();
            ctx.arc(px, py, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = isRelated ? '#38bdf8' : '#34d399';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }

          // Bidirectional upstream packet (Telemetry feed returning to core)
          if (isRelated && n.id !== 'core') {
            const revProgress = (1.0 - ((time * 0.00045 * speedMultiplier) % 1.0));
            const rpx = selNode.currX + (n.currX - selNode.currX) * revProgress;
            const rpy = selNode.currY + (n.currY - selNode.currY) * revProgress;

            ctx.beginPath();
            ctx.arc(rpx, rpy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // ── 5. Sort Nodes by Z for 3D Depth Sorting ──
      const sortedNodes = [...nodes].sort((a, b) => a.currZ - b.currZ);

      // ── 6. Render Celestial Bodies (Planetary Materials from Solar-System-3D) ──
      sortedNodes.forEach((n) => {
        const isSel = n.id === selectedNodeId;
        const isHov = n.id === hoveredNodeId;

        // Depth perspective scale & alpha
        let scaleDepth = 1.0;
        let alphaDepth = 1.0;
        if (viewMode === 'SOLAR SYSTEM' || viewMode === '3D ORBIT') {
          scaleDepth = Math.max(0.65, Math.min(1.4, (n.currZ + 600) / 600));
          alphaDepth = Math.max(0.3, Math.min(1.0, (n.currZ + 550) / 600));
        }

        const radius = n.r * scaleDepth * (isSel ? 1.35 : isHov ? 1.2 : 1.0);

        // ── A. THE SUN MATERIAL (Core Hub with Multi-Layer Corona & BloomPass) ──
        if (n.planetType === 'SUN') {
          // 1. Pulsating corona bloom
          const pulse = Math.sin(time * 0.004) * 4;
          const sunGrad = ctx.createRadialGradient(n.currX, n.currY, radius * 0.3, n.currX, n.currY, (radius + 20 + pulse));
          sunGrad.addColorStop(0, '#ffffff');
          sunGrad.addColorStop(0.3, '#fef08a');
          sunGrad.addColorStop(0.6, '#f59e0b');
          sunGrad.addColorStop(0.85, 'rgba(6, 182, 212, 0.35)');
          sunGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius + 22 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = sunGrad;
          ctx.fill();

          // 2. Solar Prominence Flares (Rotating rays)
          ctx.save();
          ctx.translate(n.currX, n.currY);
          ctx.rotate(time * 0.0008);
          for (let f = 0; f < 8; f++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(0, -radius * 0.8);
            ctx.lineTo(radius * 0.25, -radius * 1.5 - pulse);
            ctx.lineTo(0, -radius * 1.7 - pulse * 1.5);
            ctx.lineTo(-radius * 0.25, -radius * 1.5 - pulse);
            ctx.closePath();
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
            ctx.fill();
          }
          ctx.restore();

          // 3. Incandescent Sun Core
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();
        }

        // ── B. SATURN MATERIAL (Concentric Planetary Rings with Tilt & Transparency) ──
        else if (n.planetType === 'SATURN') {
          // Draw Saturn Planet Body
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();

          // Draw Tilted Planetary Rings (Saturn Rings)
          ctx.save();
          ctx.translate(n.currX, n.currY);
          ctx.rotate(-0.4); // 24 deg planetary axial tilt

          // Inner Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 2.2, radius * 0.65, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          // Cassini Gap & Outer Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 2.65, radius * 0.8, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 2.0;
          ctx.stroke();
          ctx.restore();
        }

        // ── C. JUPITER MATERIAL (Gas Giant with Atmospheric Bands) ──
        else if (n.planetType === 'JUPITER') {
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = '#d97706';
          ctx.fill();

          // Equatorial Cloud Bands
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.fillRect(n.currX - radius, n.currY - radius * 0.3, radius * 2, radius * 0.25);
          ctx.fillStyle = 'rgba(180, 83, 9, 0.6)';
          ctx.fillRect(n.currX - radius, n.currY + radius * 0.1, radius * 2, radius * 0.25);
          ctx.restore();
        }

        // ── D. EARTH / CRIME / OTHER PLANET MATERIALS ──
        else {
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.globalAlpha = alphaDepth;
          ctx.fill();

          // Atmospheric rim Fresnel halo for Earth/L2
          if (n.planetType === 'EARTH' || n.category === 'CRYPTO_L2') {
            ctx.beginPath();
            ctx.arc(n.currX, n.currY, radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        // ── OutlinePass Selection Glow (Hover & Select) ──
        if (isSel || isHov) {
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = isSel ? '#ffffff' : 'rgba(56, 189, 248, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // ── Labels & Real-Time Price Telemetry ──
        if (isSel || isHov || n.ringLevel <= 1 || radius > 8) {
          ctx.font = `${isSel ? 'bold 11px' : '9px'} 'JetBrains Mono', monospace`;
          ctx.fillStyle = isSel ? '#ffffff' : `rgba(226, 232, 240, ${alphaDepth})`;
          ctx.textAlign = 'center';
          ctx.fillText(n.id === 'core' ? 'AI·OS SUN' : n.name.split(' ')[0], n.currX, n.currY + radius + 11);

          if (n.price) {
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.fillStyle = n.change?.startsWith('+') ? '#22c55e' : '#ef4444';
            ctx.fillText(n.price, n.currX, n.currY + radius + 21);
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
  }, [viewMode, nodes, selectedNodeId, hoveredNodeId, zoom, autoRotate, rotAngleX, rotAngleY, starfield, asteroidBelt]);

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
            <span className="text-cyan-400 font-extrabold">● SOLAR CORE</span>
            <span className="text-slate-400">· ACTIVE AUTONOMOUS</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px] border-l border-slate-800 pl-3">
            <span>
              <strong className="text-emerald-400">RUNNER:</strong> VPS 24/7 OK
            </span>
            <span>
              <strong className="text-cyan-400">PHOTON PULSE:</strong> ACTIVE STREAM
            </span>
            <span>
              <strong className="text-amber-400">TELEGRAM:</strong> BOT ONLINE
            </span>
          </div>
        </div>

        {/* Center Title / Branding */}
        <div className="flex items-center gap-2 text-center font-bold tracking-widest text-slate-100">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '24s' }} />
          <span>SOLAR-SYSTEM-3D AGENTIC CYBERDECK</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            N3RSON MATERIAL ENGINE
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
              setZoom(1.0);
              setRotAngleX(0.35);
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

      {/* ── Subnav Modes & Asset Filters Bar ── */}
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

        {/* Counters & Pulse Indicator */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <strong className="text-cyan-300">DATA PACKETS:</strong> STREAMING
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">72</strong> CELESTIAL ASSETS
          </span>
          <span>·</span>
          <span>
            <strong className="text-emerald-400">{orders.length || 248}</strong> TRADES
          </span>
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
              onClick={() => setZoom((z) => Math.min(3.2, z * 1.15))}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white cursor-pointer"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z * 0.85))}
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
                <span className="text-slate-400 text-[11px]">TOTAL HOLDING AKTIF:</span>
                <span className="font-bold text-cyan-300">{holdings.length} ASET</span>
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
                {selectedNode.planetType === 'SUN' ? '☀️' : selectedNode.planetType === 'SATURN' ? '🪐' : selectedNode.id.substring(0, 3)}
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

        {/* ── CENTER RADAR CONSTELLATION CANVAS (Solar System 3D & Data Packets) ── */}
        <section className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-[#020408] border border-slate-800/80 relative overflow-hidden min-h-[560px] shadow-2xl">
          {/* Top Canvas Controls & Breadcrumbs */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-[#070b14]/90 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 shadow-lg backdrop-blur">
              <span className="text-cyan-400 font-bold">MODE AKTIF:</span>
              <span className="text-white font-bold">{viewMode}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{nodes.length} CELESTIAL BODIES</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-bold">STREAM OK</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070b14]/90 border border-slate-800 text-[10px] text-slate-400 shadow-lg backdrop-blur">
              <span className="hover:text-cyan-300 cursor-pointer" onClick={() => setZoom((z) => Math.min(3.2, z * 1.15))}>
                [+] ZOOM
              </span>
              <span>·</span>
              <span className="hover:text-cyan-300 cursor-pointer" onClick={() => setZoom((z) => Math.max(0.4, z * 0.85))}>
                [-] ZOOM
              </span>
              <span>·</span>
              <span
                className="hover:text-cyan-300 cursor-pointer"
                onClick={() => {
                  setZoom(1.0);
                  setRotAngleX(0.35);
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
                ● <strong className="text-slate-300">KLIK PLANET</strong> = INSPEKSI
              </span>
              <span>
                ● <strong className="text-slate-300">DRAG MOUSE</strong> = ROTASI 3D
              </span>
              <span>
                ● <strong className="text-cyan-300">PHOTON PULSES</strong> = ANIMASI TRANSFER DATA
              </span>
            </div>
            <div className="text-cyan-400/80 font-mono">
              ENGINE: <span className="text-white font-bold">SOLAR-SYSTEM-3D + THREE PROTOCOL</span>
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
              Pemindai otonom menyaring 72 aset tiap 20 detik untuk mendeteksi peluang alpha dengan risk-reward {'>'} 2.0x.
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
                <div className="text-[10px] text-slate-400 leading-snug">Pindai 72 emiten &amp; kripto instan</div>
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
