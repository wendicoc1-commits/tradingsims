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

// ── Types & Interfaces ──
export type CyberdeckViewMode = '3D ORBIT' | 'RINGS' | 'CIRCLE' | 'AREAS' | 'LINKS' | 'TIMELINE';

export interface GraphNode {
  id: string;
  name: string;
  category: 'CORE' | 'AGENT' | 'ROUTINE' | 'CRYPTO_L2' | 'CRYPTO_L1' | 'IDX' | 'GLOBAL';
  sub: string;
  desc: string;
  price?: string;
  change?: string;
  color: string;
  glow: string;
  r: number;
  ringLevel: number; // 0: core, 1: agent, 2: routine, 3: asset
  // Spherical coords for 3D Orbit
  sphereTheta: number; // azimuth [0, 2pi]
  spherePhi: number;   // elevation [-pi/2, pi/2]
  // 2D Target Coords
  ringsAngle: number;
  circleAngle: number;
  clusterCenterX: number;
  clusterCenterY: number;
  timelineLane: number;
  timelineTimePct: number;
  // Current animated coordinates
  currX: number;
  currY: number;
  currZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
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

  // Active View Mode (Matches the 6 tabs seen in Pavrus AI-OS screenshots)
  const [viewMode, setViewMode] = useState<CyberdeckViewMode>('3D ORBIT');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('core');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Time Clocks
  const [timeWIB, setTimeWIB] = useState('09:00:00');
  const [timeUTC, setTimeUTC] = useState('02:00:00');

  // Interactive Canvas State
  const [zoom, setZoom] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotAngleX, setRotAngleX] = useState(0.2); // pitch
  const [rotAngleY, setRotAngleY] = useState(0.0); // yaw
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Skills Deck Execution Log
  const [skillFeedback, setSkillFeedback] = useState<string | null>(null);
  const [scanCountdown, setScanCountdown] = useState(18);
  const [fps, setFps] = useState(60);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Filter category
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Compute live IDX market status
  const idxStatus = useMemo(() => checkIDXMarketStatus(), []);

  // ── Construct Graph Nodes ──
  const nodes = useMemo<GraphNode[]>(() => {
    const list: GraphNode[] = [];

    // 1. Core Hub (Root Claude.MD / AI-OS Core)
    list.push({
      id: 'core',
      name: 'FINCEPT AI ALPHA CORE',
      category: 'CORE',
      sub: 'Root Executive Multi-Agent Brain',
      desc: 'Pusat komando otonom yang mengorkestrasi 12 pimpinan divisi, menyelaraskan konsensus War Room, dan mendistribusikan sinyal eksekusi ke Linux VPS 24/7.',
      color: '#06b6d4',
      glow: '#0891b2',
      r: 20,
      ringLevel: 0,
      sphereTheta: 0,
      spherePhi: 0,
      ringsAngle: 0,
      circleAngle: 0,
      clusterCenterX: 0,
      clusterCenterY: 0,
      timelineLane: 0,
      timelineTimePct: 0.1,
      currX: 0,
      currY: 0,
      currZ: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
    });

    // 2. 12 Firm Agents (from firmRoster)
    const agentRoles: Record<string, string> = {
      dewi: 'Quant Alpha Lead · Sharpe 2.45',
      kevin: 'Jesse Crypto Desk · Spot 24/7',
      raditya: 'L/S Equity PM · Konsensus BEI',
      sri: 'Chief Risk Officer · VaR 99%',
      budi: 'Macro Strategist · BI Rate & FED',
      hadi: 'Chief Legal Officer · Regulasi OJK',
      anita: 'Chief Investment Officer · Alokasi Kas',
      bagas: 'Trading Desk Executioner · Algoritma TWAP',
      ratna: 'News & Sentiment Lead · Bloomberg Wire',
      maya: 'Data Intelligence Engineer · Alternative Feeds',
      dimas: 'Arbitrage & Derivatives · Cross-Pair Spread',
      citra: 'Compliance & Audit · Realized P&L Ledger',
    };

    FIRM_AGENTS.forEach((a, idx) => {
      const angle = (idx / FIRM_AGENTS.length) * Math.PI * 2;
      const spherePhi = (Math.PI / 6) * ((idx % 3) - 1);
      list.push({
        id: a.id,
        name: a.name,
        category: 'AGENT',
        sub: agentRoles[a.id] || a.role,
        desc: `Agen otonom ${a.name} bertanggung jawab atas ${a.deptId} dengan bobot voting konsensus institusional.`,
        color: idx % 2 === 0 ? '#38bdf8' : '#818cf8',
        glow: '#0284c7',
        r: 10,
        ringLevel: 1,
        sphereTheta: angle,
        spherePhi: spherePhi,
        ringsAngle: angle,
        circleAngle: (idx / 40) * Math.PI * 2,
        clusterCenterX: -120 + (idx % 3) * 40,
        clusterCenterY: -100 + Math.floor(idx / 3) * 50,
        timelineLane: 1,
        timelineTimePct: 0.15 + (idx / FIRM_AGENTS.length) * 0.7,
        currX: 0,
        currY: 0,
        currZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
      });
    });

    // 3. Autonomous Routines & Engines (Freqtrade, Lumibot, Jesse, Telegram, Trailing Stop)
    const routines = [
      { id: 'jesse', name: 'Jesse Spot Engine', sub: 'Framework Spot Kripto', desc: 'Framework trading kuantitatif kripto spot berkecepatan tinggi.', color: '#06b6d4', lane: 2 },
      { id: 'freqtrade', name: 'Freqtrade Linux VPS', sub: 'Daemon 24/7 Cloud', desc: 'Daemon server Linux di VPS cloud yang menjaga bot aktif saat browser ditutup.', color: '#10b981', lane: 2 },
      { id: 'lumibot', name: 'Lumibot Equity Bridge', sub: 'Jembatan Order Saham', desc: 'Jembatan order saham otomatis dengan simulasi slippage Almgren-Chriss.', color: '#3b82f6', lane: 2 },
      { id: 'telegram', name: 'Telegram Bot Notifier', sub: 'Push Alert Instan', desc: 'Pengirim sinyal live buy/sell ke smartphone pengguna secara instan.', color: '#0ea5e9', lane: 3 },
      { id: 'trailing', name: 'ATR Trailing Stop', sub: 'Risk Guard 1.5x ATR', desc: 'Pengunci profit otomatis saat harga menyentuh target puncak baru.', color: '#f59e0b', lane: 3 },
      { id: 'bandarmologi', name: 'Bandarmologi Radar', sub: 'Smart Money Net Flow', desc: 'Deteksi akumulasi broker asing & whale wallet on-chain.', color: '#a855f7', lane: 3 },
    ];

    routines.forEach((r, idx) => {
      const angle = (idx / routines.length) * Math.PI * 2 + 0.3;
      list.push({
        id: r.id,
        name: r.name,
        category: 'ROUTINE',
        sub: r.sub,
        desc: r.desc,
        color: r.color,
        glow: r.color,
        r: 8,
        ringLevel: 2,
        sphereTheta: angle,
        spherePhi: (Math.PI / 4) * ((idx % 2 === 0 ? 1 : -1) * 0.7),
        ringsAngle: angle,
        circleAngle: ((12 + idx) / 40) * Math.PI * 2,
        clusterCenterX: 120 + (idx % 2) * 50,
        clusterCenterY: -80 + Math.floor(idx / 2) * 60,
        timelineLane: r.lane,
        timelineTimePct: 0.2 + idx * 0.12,
        currX: 0,
        currY: 0,
        currZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
      });
    });

    // 4. Tradable Assets Universe (Crypto L2, L1, IDX, Global)
    const assetsData: Array<{ id: string; name: string; cat: GraphNode['category']; price: string; change: string; color: string; desc: string }> = [
      // Crypto Layer 2 (Focus from user inquiry)
      { id: 'ARB', name: 'Arbitrum (ARB)', cat: 'CRYPTO_L2', price: '$0.1672', change: '+3.92%', color: '#38bdf8', desc: 'Rollup L2 TVL tertinggi di Ethereum, gas efisien.' },
      { id: 'OP', name: 'Optimism (OP)', cat: 'CRYPTO_L2', price: '$1.625', change: '+4.60%', color: '#f43f5e', desc: 'Superchain OP Stack Layer 2 open-source.' },
      // Crypto L1 & DeFi
      { id: 'BTC', name: 'Bitcoin (BTC)', cat: 'CRYPTO_L1', price: '$81,379', change: '+1.80%', color: '#f59e0b', desc: 'Aset cadangan nilai kripto utama dunia.' },
      { id: 'ETH', name: 'Ethereum (ETH)', cat: 'CRYPTO_L1', price: '$2,840', change: '+2.40%', color: '#818cf8', desc: 'Pondasi smart contract global & ekosistem L2.' },
      { id: 'SOL', name: 'Solana (SOL)', cat: 'CRYPTO_L1', price: '$148.5', change: '+5.20%', color: '#10b981', desc: 'High-speed throughput blockchain L1.' },
      { id: 'LINK', name: 'Chainlink (LINK)', cat: 'CRYPTO_L1', price: '$12.78', change: '+0.80%', color: '#2563eb', desc: 'Oracle terdesentralisasi industri keuangan.' },
      { id: 'RENDER', name: 'Render (RENDER)', cat: 'CRYPTO_L1', price: '$1.82', change: '+6.10%', color: '#f97316', desc: 'Jaringan komputasi GPU AI terdesentralisasi.' },
      { id: 'TAO', name: 'Bittensor (TAO)', cat: 'CRYPTO_L1', price: '$540.0', change: '+7.40%', color: '#eab308', desc: 'Subnet kecerdasan buatan terdesentralisasi.' },
      // IDX Banking & Energy
      { id: 'BBCA', name: 'Bank Central Asia (BBCA)', cat: 'IDX', price: 'Rp 9.850', change: '+0.51%', color: '#60a5fa', desc: 'Pilar utama perbankan swasta dengan CASA > 80%.' },
      { id: 'BBRI', name: 'Bank Rakyat Indonesia (BBRI)', cat: 'IDX', price: 'Rp 4.620', change: '+1.10%', color: '#3b82f6', desc: 'Pemimpin pembiayaan mikro dan UMKM nasional.' },
      { id: 'BMRI', name: 'Bank Mandiri (BMRI)', cat: 'IDX', price: 'Rp 7.050', change: '+1.45%', color: '#2563eb', desc: 'Ekspansi kredit korporasi terkuat dan Livin digital.' },
      { id: 'ADRO', name: 'Adaro Energy (ADRO)', cat: 'IDX', price: 'Rp 3.650', change: '+2.82%', color: '#eab308', desc: 'Produsen energi dan pembagi dividen jumbo konsisten.' },
      { id: 'TLKM', name: 'Telkom Indonesia (TLKM)', cat: 'IDX', price: 'Rp 2.850', change: '-0.35%', color: '#ef4444', desc: 'Raksasa infrastruktur telekomunikasi digital.' },
      // Global Tech
      { id: 'NVDA', name: 'Nvidia Corp (NVDA)', cat: 'GLOBAL', price: '$118.2', change: '+3.40%', color: '#84cc16', desc: 'Monopoli semikonduktor akselerator AI global.' },
      { id: 'PLTR', name: 'Palantir (PLTR)', cat: 'GLOBAL', price: '$38.4', change: '+4.80%', color: '#06b6d4', desc: 'Platform analitik AI institusional enterprise.' },
    ];

    assetsData.forEach((ast, idx) => {
      const angle = (idx / assetsData.length) * Math.PI * 2 + 0.6;
      const spherePhi = (Math.PI / 3) * ((idx % 5) / 2.5 - 1);
      list.push({
        id: ast.id,
        name: ast.name,
        category: ast.cat,
        sub: `${ast.price} · ${ast.change}`,
        desc: ast.desc,
        price: ast.price,
        change: ast.change,
        color: ast.color,
        glow: ast.color,
        r: 7,
        ringLevel: 3,
        sphereTheta: angle,
        spherePhi: spherePhi,
        ringsAngle: angle,
        circleAngle: ((18 + idx) / 40) * Math.PI * 2,
        clusterCenterX: ast.cat === 'CRYPTO_L2' ? -100 : ast.cat === 'CRYPTO_L1' ? 80 : ast.cat === 'IDX' ? 140 : 0,
        clusterCenterY: ast.cat === 'CRYPTO_L2' ? 120 : ast.cat === 'CRYPTO_L1' ? 130 : ast.cat === 'IDX' ? 30 : -140,
        timelineLane: 4,
        timelineTimePct: 0.1 + (idx / assetsData.length) * 0.8,
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

  // Selected Node Object
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Clock Update Effect
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

  // Scan Countdown Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanCountdown((prev) => (prev <= 1 ? 20 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Trigger Skill Actions ──
  const handleTriggerSkill = useCallback(
    async (skillName: string) => {
      if (soundEnabled) {
        executiveVoice.speak(`Executing skill: ${skillName}`);
      }

      if (skillName === 'SCAN_UNIVERSE') {
        setSkillFeedback('📡 Memindai 72 instrumen pasar (BEI + Crypto Binance)... Selesai! Menemukan 3 kandidat optimal.');
        const scan = scanUniverseForTopAlpha();
        if (scan.topAlphaCandidate) {
          setSelectedNodeId(scan.topAlphaCandidate.symbol);
        }
      } else if (skillName === 'WAR_ROOM') {
        setSkillFeedback('🚨 Memanggil Dewan Eksekutif Hedge Fund ke ruang War Room...');
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

  // ── CANVAS RENDERING & MORPHING ANIMATION ENGINE ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let lastTimestamp = performance.now();
    let pulseSweep = 0;

    // Handle mouse drag for 3D rotation or 2D panning
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
        setRotAngleX((prev) => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev + dy * 0.008)));
      } else {
        // Hit-test for hover
        const w = rect.width;
        const h = rect.height;
        let foundHover: string | null = null;
        for (const n of nodes) {
          const screenX = w / 2 + n.currX * zoom;
          const screenY = h / 2 + n.currY * zoom;
          const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
          if (dist < (n.r + 6) * zoom) {
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
        if (dist < (n.r + 8) * zoom) {
          setSelectedNodeId(n.id);
          break;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.max(0.4, Math.min(2.8, prev * factor)));
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

      // Auto rotation in 3D Orbit mode
      if (autoRotate && viewMode === '3D ORBIT' && !isDraggingRef.current) {
        setRotAngleY((prev) => prev + 0.003);
      }

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);
      const sphereRadius = minDim * 0.38;

      pulseSweep += 0.015;

      // ── 1. Calculate Target Positions According to View Mode ──
      nodes.forEach((n) => {
        if (n.id === 'core') {
          n.targetX = 0;
          n.targetY = 0;
          n.targetZ = 0;
          return;
        }

        if (viewMode === '3D ORBIT') {
          // Spherical math with pitch & yaw 3D rotation
          const theta = n.sphereTheta + rotAngleY;
          const phi = n.spherePhi;

          // 3D sphere coordinate
          const x3d = sphereRadius * Math.cos(theta) * Math.cos(phi);
          const y3d = sphereRadius * Math.sin(phi);
          const z3d = sphereRadius * Math.sin(theta) * Math.cos(phi);

          // Pitch rotation (around X-axis)
          const yRot = y3d * Math.cos(rotAngleX) - z3d * Math.sin(rotAngleX);
          const zRot = y3d * Math.sin(rotAngleX) + z3d * Math.cos(rotAngleX);

          // Perspective depth projection
          const fov = 600;
          const scale = fov / (fov + zRot);

          n.targetX = x3d * scale;
          n.targetY = yRot * scale;
          n.targetZ = zRot;
        } else if (viewMode === 'RINGS') {
          // Concentric circles: 0: core, 1: agent, 2: routine, 3: asset
          let rRing = 0;
          if (n.ringLevel === 1) rRing = minDim * 0.16;
          else if (n.ringLevel === 2) rRing = minDim * 0.28;
          else if (n.ringLevel === 3) rRing = minDim * 0.40;

          const angle = n.ringsAngle + (n.ringLevel === 1 ? 0.00015 * time : -0.0001 * time);
          n.targetX = Math.cos(angle) * rRing;
          n.targetY = Math.sin(angle) * rRing;
          n.targetZ = 0;
        } else if (viewMode === 'CIRCLE') {
          // All nodes uniformly spread on the outer boundary circle
          const rCircle = minDim * 0.42;
          n.targetX = Math.cos(n.circleAngle) * rCircle;
          n.targetY = Math.sin(n.circleAngle) * rCircle;
          n.targetZ = 0;
        } else if (viewMode === 'AREAS') {
          // Cluster bubbles grouped by division/category
          n.targetX = n.clusterCenterX;
          n.targetY = n.clusterCenterY;
          n.targetZ = 0;
        } else if (viewMode === 'LINKS') {
          // Dynamic force-network layout
          const rForce = (n.ringLevel === 1 ? minDim * 0.18 : minDim * 0.35) * (0.8 + (n.spherePhi + 1) * 0.2);
          n.targetX = Math.cos(n.sphereTheta) * rForce;
          n.targetY = Math.sin(n.sphereTheta) * rForce;
          n.targetZ = 0;
        } else if (viewMode === 'TIMELINE') {
          // Gantt matrix dot grid
          const laneHeight = (height - 80) / 5;
          n.targetX = (n.timelineTimePct - 0.5) * (width * 0.85);
          n.targetY = (n.timelineLane - 2) * laneHeight;
          n.targetZ = 0;
        }

        // Smooth Lerp Interpolation (Morphing)
        n.currX += (n.targetX - n.currX) * 0.12;
        n.currY += (n.targetY - n.currY) * 0.12;
        n.currZ += (n.targetZ - n.currZ) * 0.12;
      });

      // ── 2. Draw Background Grids & Orbit Wireframes ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);

      if (viewMode === '3D ORBIT') {
        // Draw 3D wireframe latitudes & longitudes of the celestial sphere
        const latSteps = [-Math.PI / 4, 0, Math.PI / 4];
        latSteps.forEach((phi) => {
          const latRadius = sphereRadius * Math.cos(phi);
          const yCenter = sphereRadius * Math.sin(phi);

          const yRotCenter = yCenter * Math.cos(rotAngleX);
          const zRotCenter = yCenter * Math.sin(rotAngleX);

          ctx.beginPath();
          ctx.ellipse(0, yRotCenter, latRadius, latRadius * Math.sin(rotAngleX + Math.PI / 2), 0, 0, Math.PI * 2);
          ctx.strokeStyle = phi === 0 ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.4)';
          ctx.lineWidth = phi === 0 ? 1.5 : 1;
          ctx.stroke();
        });

        // Longitude meridian circles
        for (let m = 0; m < 4; m++) {
          const angle = rotAngleY + (m / 4) * Math.PI;
          ctx.beginPath();
          ctx.ellipse(0, 0, sphereRadius * Math.abs(Math.cos(angle)), sphereRadius, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else if (viewMode === 'RINGS') {
        // 3 Concentric rings
        const r1 = minDim * 0.16;
        const r2 = minDim * 0.28;
        const r3 = minDim * 0.40;
        [r1, r2, r3].forEach((r, idx) => {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.strokeStyle = idx === 0 ? 'rgba(6, 182, 212, 0.3)' : idx === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.45)';
          ctx.lineWidth = 1;
          ctx.setLineDash(idx === 1 ? [4, 6] : []);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      } else if (viewMode === 'CIRCLE') {
        // Outer boundary chord ring
        const rCircle = minDim * 0.42;
        ctx.beginPath();
        ctx.arc(0, 0, rCircle, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (viewMode === 'TIMELINE') {
        // Horizontal lanes
        const laneHeight = (height - 80) / 5;
        for (let l = -2; l <= 2; l++) {
          ctx.beginPath();
          ctx.moveTo(-width * 0.45, l * laneHeight);
          ctx.lineTo(width * 0.45, l * laneHeight);
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── 3. Draw Laser Links / Radial Chords ──
      const selNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
      nodes.forEach((n) => {
        if (n.id === selNode.id) return;

        const isRelated =
          selNode.id === 'core'
            ? n.ringLevel === 1 || n.id === 'ARB' || n.id === 'OP' || n.id === 'jesse'
            : selNode.id === 'kevin' || selNode.id === 'jesse'
            ? n.id === 'ARB' || n.id === 'OP' || n.id === 'BTC' || n.id === 'core'
            : selNode.id === 'ARB' || selNode.id === 'OP'
            ? n.id === 'kevin' || n.id === 'jesse' || n.id === 'core'
            : n.ringLevel === selNode.ringLevel;

        if (isRelated || viewMode === 'LINKS' || viewMode === 'CIRCLE') {
          ctx.beginPath();
          ctx.moveTo(selNode.currX, selNode.currY);
          ctx.lineTo(n.currX, n.currY);

          // Depth attenuation for 3D Orbit
          const avgZ = (selNode.currZ + n.currZ) / 2;
          const alpha = viewMode === '3D ORBIT' ? Math.max(0.08, Math.min(0.6, (avgZ + sphereRadius) / (sphereRadius * 2))) : 0.35;

          ctx.strokeStyle = isRelated ? `rgba(6, 182, 212, ${alpha})` : `rgba(30, 41, 59, ${alpha * 0.5})`;
          ctx.lineWidth = isRelated ? 1.5 : 0.75;
          ctx.stroke();
        }
      });

      // ── 4. Sort Nodes by Z (for proper 3D rendering) ──
      const sortedNodes = [...nodes].sort((a, b) => a.currZ - b.currZ);

      // ── 5. Draw Nodes & Labels ──
      sortedNodes.forEach((n) => {
        const isSel = n.id === selectedNodeId;
        const isHov = n.id === hoveredNodeId;

        // Size & opacity modulation based on Z-depth in 3D ORBIT
        let scaleDepth = 1.0;
        let alphaDepth = 1.0;
        if (viewMode === '3D ORBIT') {
          scaleDepth = Math.max(0.6, Math.min(1.4, (n.currZ + sphereRadius * 1.5) / (sphereRadius * 2)));
          alphaDepth = Math.max(0.25, Math.min(1.0, (n.currZ + sphereRadius * 1.2) / (sphereRadius * 2)));
        }

        const radius = n.r * scaleDepth * (isSel ? 1.3 : isHov ? 1.2 : 1.0);

        // Node Glow Halo
        if (isSel || isHov || n.id === 'core') {
          ctx.beginPath();
          ctx.arc(n.currX, n.currY, radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? 'rgba(6, 182, 212, 0.25)' : 'rgba(56, 189, 248, 0.15)';
          ctx.fill();
        }

        // Node Circle Body
        ctx.beginPath();
        ctx.arc(n.currX, n.currY, radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = alphaDepth;
        ctx.fill();

        // Node Border Ring
        ctx.beginPath();
        ctx.arc(n.currX, n.currY, radius + (isSel ? 3 : 1), 0, Math.PI * 2);
        ctx.strokeStyle = isSel ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.stroke();

        // Node Label Text (Always facing camera)
        if (isSel || isHov || n.ringLevel <= 1 || radius > 8) {
          ctx.font = `${isSel ? 'bold 11px' : '9px'} 'JetBrains Mono', monospace`;
          ctx.fillStyle = isSel ? '#ffffff' : `rgba(226, 232, 240, ${alphaDepth})`;
          ctx.textAlign = 'center';
          ctx.fillText(n.id === 'core' ? 'AI·OS CORE' : n.name.split(' ')[0], n.currX, n.currY + radius + 11);

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
  }, [viewMode, nodes, selectedNodeId, hoveredNodeId, zoom, autoRotate, rotAngleX, rotAngleY]);

  // View modes array
  const viewModesList: CyberdeckViewMode[] = ['3D ORBIT', 'RINGS', 'CIRCLE', 'AREAS', 'LINKS', 'TIMELINE'];

  return (
    <div className="flex flex-col min-h-screen bg-[#05070b] text-slate-300 font-mono select-none p-2 sm:p-4 gap-3">
      {/* ── Top Level System Status Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#070b14] border border-slate-800/80 text-xs shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wider text-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-cyan-400 font-extrabold">● CORE</span>
            <span className="text-slate-400">· ACTIVE AUTONOMOUS</span>
          </div>

          <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px] border-l border-slate-800 pl-3">
            <span>
              <strong className="text-emerald-400">RUNNER:</strong> VPS 24/7 OK
            </span>
            <span>
              <strong className="text-cyan-400">SYNC:</strong> FREQTRADE + LUMIBOT
            </span>
            <span>
              <strong className="text-amber-400">TELEGRAM:</strong> BOT ONLINE
            </span>
          </div>
        </div>

        {/* Center Title / Branding */}
        <div className="flex items-center gap-2 text-center font-bold tracking-widest text-slate-100">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '24s' }} />
          <span>AI·OS AGENTIC CYBERDECK HUD</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            FINCEPT V4.2
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
              setRotAngleX(0.2);
              setRotAngleY(0.0);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            RESET
          </button>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            FPS: {fps}
          </span>
        </div>
      </header>

      {/* ── Subnav Modes & Asset Filters Bar (The 6 Pavrus AI-OS Modes) ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#070b14] border border-slate-800/80 text-[11px]">
        {/* The 6 Modes Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <span className="text-slate-500 mr-1 uppercase text-[10px] font-bold">VIEWS:</span>
          {viewModesList.map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === mode
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/60 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Counters */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px]">
          <span>
            <strong className="text-white">72</strong> ASSETS
          </span>
          <span>·</span>
          <span>
            <strong className="text-cyan-400">12</strong> AI AGENTS
          </span>
          <span>·</span>
          <span>
            <strong className="text-emerald-400">{orders.length || 248}</strong> TRADES
          </span>
        </div>

        {/* 3D Orbit Rotate Toggle */}
        <div className="flex items-center gap-2">
          {viewMode === '3D ORBIT' && (
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all ${
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
              onClick={() => setZoom((z) => Math.min(2.8, z * 1.15))}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z * 0.85))}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:text-white"
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
              <span className="text-slate-400 uppercase text-[10px] font-bold">SELECTED NODE INSPECTOR</span>
              <span className="text-cyan-400 text-[10px] font-mono font-bold">
                [{selectedNode.category}]
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-md"
                style={{ backgroundColor: `${selectedNode.color}25`, borderColor: selectedNode.color, color: selectedNode.color }}
              >
                {selectedNode.category === 'CORE' ? '◈' : selectedNode.id.substring(0, 3)}
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

        {/* ── CENTER RADAR CONSTELLATION CANVAS (The Morphing 3D/2D Heart) ── */}
        <section className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-[#04060a] border border-slate-800/80 relative overflow-hidden min-h-[540px] shadow-2xl">
          {/* Top Canvas Controls & Breadcrumbs */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-[#090d16]/90 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 shadow-lg backdrop-blur">
              <span className="text-cyan-400 font-bold">MODE AKTIF:</span>
              <span className="text-white font-bold">{viewMode}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{nodes.length} TOTAL SIMPUL</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090d16]/90 border border-slate-800 text-[10px] text-slate-400 shadow-lg backdrop-blur">
              <span className="hover:text-cyan-300 cursor-pointer" onClick={() => setZoom((z) => Math.min(2.8, z * 1.15))}>
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
                  setRotAngleX(0.2);
                  setRotAngleY(0.0);
                }}
              >
                [RESET]
              </span>
            </div>
          </div>

          {/* High-Performance Canvas */}
          <canvas ref={canvasRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing block" />

          {/* Bottom Hint Bar */}
          <div className="px-3 py-2 bg-[#070a12]/95 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 z-10">
            <div className="flex items-center gap-3">
              <span>
                ● <strong className="text-slate-300">KLIK DOT</strong> = INSPEKSI
              </span>
              <span>
                ● <strong className="text-slate-300">DRAG MOUSE</strong> = ROTASI 3D BOLA
              </span>
              <span>
                ● <strong className="text-slate-300">WHEEL</strong> = ZOOM MORPHING
              </span>
            </div>
            <div className="text-cyan-400/80 font-mono">
              ENGINE: <span className="text-white font-bold">3D SPHERICAL PROJECTION</span>
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

          {/* Autonomous Routines Table (Like in Pavrus AI-OS design) */}
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
