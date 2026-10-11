'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Search,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  Sparkles,
  Download,
  X,
  Layers,
  Building2,
  TrendingUp,
  Coins,
  ShieldCheck,
  Eye,
  EyeOff,
  Filter,
  Users,
  Compass,
  Cpu,
  Database,
  Radio,
  FileCode2,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import {
  TRADESIMS_KNOWLEDGE_NODES,
  TRADESIMS_KNOWLEDGE_EDGES,
  KNOWLEDGE_GRAPH_CLUSTERS,
} from '@/data/tradesims_knowledge_graph';
import {
  FIRM_AGENTS,
  DEPARTMENTS,
  type FirmAgent,
  type Department,
} from '@/lib/hedgefund/firmRoster';
import {
  MASTER_ASSETS,
  type UnifiedAsset,
} from '@/lib/universe/masterAssetUniverse';
import {
  MARKET_NETWORK_DATASETS,
} from '@/data/market_network_universe';
import TradeSimKnowledgeGraph3D from './TradeSimKnowledgeGraph3D';

// ── Types & Scopes ──
export type MegaUniverseScope = 'mega' | 'ai_office' | 'architecture' | 'stocks_market';

export interface ObsidianNode {
  id: string;
  label: string;
  sublabel?: string;
  category: 'ARCHITECTURE' | 'AI_AGENT' | 'AI_DEPT' | 'SECTOR_HUB' | 'STOCK_IDX' | 'CRYPTO' | 'GLOBAL';
  cluster: string;
  color: string;
  description: string;
  filePath?: string;
  metric?: string;
  parentHubId?: string;
  targetOrbitRadius?: number;
  orbitAngle?: number;
  isMajor: boolean;
  // Simulation physics
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  degree: number;
}

export interface ObsidianEdge {
  source: string;
  target: string;
  label?: string;
  relation?: string;
  sourceNode: ObsidianNode;
  targetNode: ObsidianNode;
}

export interface ClusterMeta {
  id: string;
  name: string;
  color: string;
  count: number;
}

// ── 11 Sektor Utama Bursa Efek Indonesia (BEI) ──
const IDX_SECTOR_HUBS: { id: string; name: string; color: string; keywords: string[] }[] = [
  { id: 'sec_fin', name: 'Sektor Keuangan & Perbankan', color: '#3b82f6', keywords: ['bank', 'finance', 'financial', 'insurance', 'keuangan'] },
  { id: 'sec_energy', name: 'Sektor Energi & Panas Bumi', color: '#eab308', keywords: ['energy', 'coal', 'oil', 'gas', 'tambang', 'energi', 'geothermal'] },
  { id: 'sec_basic', name: 'Sektor Bahan Baku & Mineral', color: '#06b6d4', keywords: ['basic', 'materials', 'metal', 'nickel', 'copper', 'petrochemical', 'kimia'] },
  { id: 'sec_consumer_nc', name: 'Sektor Konsumer Primer (F&B)', color: '#10b981', keywords: ['consumer non-cyclical', 'food', 'beverage', 'retail', 'agri'] },
  { id: 'sec_consumer_cy', name: 'Sektor Konsumer Non-Primer', color: '#f59e0b', keywords: ['consumer cyclical', 'automotive', 'garment', 'retail', 'media'] },
  { id: 'sec_tech', name: 'Sektor Teknologi & Digital', color: '#a855f7', keywords: ['tech', 'technology', 'digital', 'software', 'e-commerce'] },
  { id: 'sec_infra', name: 'Sektor Infrastruktur & Telko', color: '#ec4899', keywords: ['infra', 'infrastructure', 'telecom', 'tower', 'toll', 'telko'] },
  { id: 'sec_prop', name: 'Sektor Properti & Real Estat', color: '#8b5cf6', keywords: ['property', 'properties', 'real estate', 'estate'] },
  { id: 'sec_health', name: 'Sektor Kesehatan & Farmasi', color: '#14b8a6', keywords: ['health', 'healthcare', 'pharma', 'hospital', 'farmasi'] },
  { id: 'sec_indus', name: 'Sektor Perindustrian & Alat Berat', color: '#64748b', keywords: ['industrials', 'industrial', 'heavy equipment', 'machinery'] },
  { id: 'sec_trans', name: 'Sektor Transportasi & Logistik', color: '#f43f5e', keywords: ['transportation', 'logistic', 'shipping', 'delivery'] },
];

// Helper penentu sektor saham
function resolveStockSectorHub(sectorName: string): string {
  const s = (sectorName || '').toLowerCase();
  for (const hub of IDX_SECTOR_HUBS) {
    if (hub.keywords.some((k) => s.includes(k))) return hub.id;
  }
  return 'sec_fin';
}

// ── Mega Universe Dataset Builder (Memadukan Seluruh Sistem, Pejabat AI, dan Saham) ──
function buildMegaUniverseDataset(
  scope: MegaUniverseScope,
  centerX: number,
  centerY: number,
  includeAllStocks: boolean = false
): {
  nodes: ObsidianNode[];
  edges: ObsidianEdge[];
  clusters: ClusterMeta[];
} {
  const rawNodes: Omit<ObsidianNode, 'x' | 'y' | 'vx' | 'vy' | 'radius' | 'degree'>[] = [];
  const rawEdges: { source: string; target: string; label?: string; relation?: string }[] = [];
  const clusterCountMap = new Map<string, { name: string; color: string; count: number }>();

  const registerCluster = (id: string, name: string, color: string) => {
    if (!clusterCountMap.has(id)) {
      clusterCountMap.set(id, { name, color, count: 0 });
    }
    clusterCountMap.get(id)!.count++;
  };

  // ── 1. PILAR ARSITEKTUR SISTEM TRADESIM (CORE ENGINE) ──
  if (scope === 'mega' || scope === 'architecture') {
    TRADESIMS_KNOWLEDGE_NODES.forEach((an) => {
      registerCluster(an.cluster, an.cluster, an.color || '#38bdf8');
      rawNodes.push({
        id: an.id,
        label: an.label,
        sublabel: `Arsitektur • ${an.category}`,
        category: 'ARCHITECTURE',
        cluster: an.cluster,
        color: an.color || '#38bdf8',
        description: an.description,
        filePath: an.filePath,
        metric: an.category === 'STORE' ? 'Zustand State Engine' : an.category === 'DATABASE' ? 'ACID Postgres RPC' : 'Next.js App Router',
        baseRadius: an.category === 'STORE' || an.category === 'DATABASE' ? 22 : 18,
        isMajor: true,
      });
    });

    TRADESIMS_KNOWLEDGE_EDGES.forEach((ae) => {
      rawEdges.push({
        source: ae.source,
        target: ae.target,
        label: ae.label || ae.relation,
        relation: ae.relation,
      });
    });
  }

  // ── 2. PILAR AI TRADING OFFICE (10 DEPARTEMEN & 50 PEJABAT LENGKAP) ──
  if (scope === 'mega' || scope === 'ai_office') {
    // A. 10 Departemen Hub
    DEPARTMENTS.forEach((dept) => {
      registerCluster(`dept_${dept.id}`, `${dept.emoji} ${dept.name}`, dept.color);
      rawNodes.push({
        id: `dept_${dept.id}`,
        label: `${dept.emoji} ${dept.name}`,
        sublabel: `Departemen Hedge Fund`,
        category: 'AI_DEPT',
        cluster: `dept_${dept.id}`,
        color: dept.color,
        description: dept.mission,
        metric: `Ruang Kerja Utama`,
        baseRadius: 24,
        isMajor: true,
      });

      // Hubungkan Departemen ke Arsitektur
      if (scope === 'mega') {
        if (dept.id === 'EXEC') rawEdges.push({ source: 'header', target: `dept_${dept.id}`, label: 'Governance' });
        if (dept.id === 'PM') rawEdges.push({ source: 'portfolio_desk', target: `dept_${dept.id}`, label: 'Buku Portofolio' });
        if (dept.id === 'QUANT') rawEdges.push({ source: 'quant_agent', target: `dept_${dept.id}`, label: 'Model Machine Learning' });
        if (dept.id === 'TECH') rawEdges.push({ source: 'api_hub_view', target: `dept_${dept.id}`, label: 'Data Feed Ingestion' });
        if (dept.id === 'RISK') rawEdges.push({ source: 'topup_modal', target: `dept_${dept.id}`, label: 'Audit Struk & Idempotency' });
      }
    });

    // B. 50 Pejabat & Agen Lengkap
    FIRM_AGENTS.forEach((agent) => {
      const deptObj = DEPARTMENTS.find((d) => d.id === agent.dept);
      const color = deptObj?.color || '#a855f7';
      registerCluster(`dept_${agent.dept}`, deptObj ? `${deptObj.emoji} ${deptObj.name}` : agent.dept, color);

      rawNodes.push({
        id: `agent_${agent.id}`,
        label: `${agent.emoji} ${agent.name}`,
        sublabel: `${agent.title}`,
        category: 'AI_AGENT',
        cluster: `dept_${agent.dept}`,
        color,
        description: `${agent.title} • Tugas: ${agent.duties.join('; ')}`,
        metric: agent.committee ? 'Dewan Investment Committee' : 'Divisi Spesialis',
        baseRadius: agent.committee ? 20 : 16,
        isMajor: true,
        parentHubId: `dept_${agent.dept}`,
      });

      // Relasi Pejabat ke Departemen Induk
      rawEdges.push({
        source: `dept_${agent.dept}`,
        target: `agent_${agent.id}`,
        label: 'Anggota Departemen',
        relation: 'struktur_organisasi',
      });

      // Relasi Kolaborator Antar Pejabat
      agent.collaborators.forEach((collabId) => {
        rawEdges.push({
          source: `agent_${agent.id}`,
          target: `agent_${collabId}`,
          label: 'Konsultasi Rutin',
          relation: 'kolaborasi_hedge_fund',
        });
      });
    });
  }

  // ── 3. PILAR PASAR SAHAM BEI, SEKTOR HUBS & EMITEN ──
  if (scope === 'mega' || scope === 'stocks_market') {
    // A. 11 Sektor Hubs
    IDX_SECTOR_HUBS.forEach((sec) => {
      registerCluster(sec.id, sec.name, sec.color);
      rawNodes.push({
        id: sec.id,
        label: `🏢 ${sec.name}`,
        sublabel: 'Klaster Industri Bursa',
        category: 'SECTOR_HUB',
        cluster: sec.id,
        color: sec.color,
        description: `Klaster emiten saham BEI kategori ${sec.name}. Mengelompokkan kapitalisasi pasar dan perputaran likuiditas.`,
        metric: 'Hub Sektoral BEI',
        baseRadius: 22,
        isMajor: true,
      });

      // Hubungkan Sektor ke Analis Riset AI yang Berwenang
      if (scope === 'mega') {
        if (sec.id === 'sec_fin') rawEdges.push({ source: 'agent_r_bank', target: sec.id, label: 'Cakupan Analis Bank' });
        if (sec.id === 'sec_energy') rawEdges.push({ source: 'agent_r_energy', target: sec.id, label: 'Cakupan Analis Energi' });
        if (sec.id === 'sec_tech') rawEdges.push({ source: 'agent_r_tech', target: sec.id, label: 'Cakupan Analis Teknologi' });
        if (sec.id === 'sec_consumer_nc') rawEdges.push({ source: 'agent_r_consumer', target: sec.id, label: 'Cakupan Analis Konsumer' });
        if (sec.id === 'sec_infra') rawEdges.push({ source: 'agent_r_infra', target: sec.id, label: 'Cakupan Analis Infrastruktur' });
      }
    });

    // B. Saham-saham BEI (Tampilkan seluruh 951 emiten aktif BEI sebagai butiran-butiran individual)
    const stocksToInclude = includeAllStocks
      ? MASTER_ASSETS.filter((a) => a.category === 'IDX')
      : MASTER_ASSETS.filter((a) => a.category === 'IDX' && (a.isPopular || a.defaultPrice > 1000)).slice(0, 360);

    const goldenRatio = 2.3999632;
    stocksToInclude.forEach((stk, sIdx) => {
      const sectorHubId = resolveStockSectorHub(stk.sector);
      const hub = IDX_SECTOR_HUBS.find((h) => h.id === sectorHubId) || IDX_SECTOR_HUBS[0];
      registerCluster(hub.id, hub.name, hub.color);

      // Setiap butiran saham memiliki cincin orbit terpisah agar tidak menggumpal
      const orbitBand = sIdx % 8;
      const targetOrbitRadius = 75 + orbitBand * 24 + (sIdx % 5) * 7; // rentang orbit 75px - 275px
      const orbitAngle = sIdx * goldenRatio;

      rawNodes.push({
        id: `stk_${stk.symbol}`,
        label: stk.symbol,
        sublabel: stk.name,
        category: 'STOCK_IDX',
        cluster: hub.id,
        color: hub.color,
        description: `${stk.name} • Sektor: ${stk.sector}. Papan: ${stk.board || 'Utama'}. Harga Wajar: Rp ${stk.defaultPrice.toLocaleString()}`,
        metric: `Rp ${stk.defaultPrice.toLocaleString()}`,
        baseRadius: stk.isPopular ? 7.5 : 3.8, // Butiran halus bintang Obsidian
        isMajor: !!stk.isPopular,
        parentHubId: sectorHubId,
        targetOrbitRadius,
        orbitAngle,
      });

      // Relasi Saham ke Sektor Hub
      rawEdges.push({
        source: sectorHubId,
        target: `stk_${stk.symbol}`,
        label: 'Anggota Sektor',
        relation: 'anggota_sektor',
      });
    });

    // C. Top Kripto & Global (BTC, ETH, SOL, NVDA, AAPL)
    const cryptoAndGlobal = MASTER_ASSETS.filter((a) => a.isPopular && a.category !== 'IDX').slice(0, 20);
    cryptoAndGlobal.forEach((cg) => {
      const clusterId = cg.category === 'CRYPTO' ? 'sec_crypto' : 'sec_global';
      const color = cg.category === 'CRYPTO' ? '#f59e0b' : '#ec4899';
      registerCluster(clusterId, cg.category === 'CRYPTO' ? '⚡ Kripto Spot Binance' : '🌐 Saham Global Wall St', color);

      rawNodes.push({
        id: `cg_${cg.symbol}`,
        label: cg.symbol,
        sublabel: cg.name,
        category: cg.category === 'CRYPTO' ? 'CRYPTO' : 'GLOBAL',
        cluster: clusterId,
        color,
        description: `${cg.name} • Kategori: ${cg.category}. Harga: $${cg.defaultPrice.toLocaleString()}`,
        metric: `$${cg.defaultPrice.toLocaleString()}`,
        baseRadius: 11,
        isMajor: true,
      });

      if (scope === 'mega') {
        if (cg.category === 'CRYPTO') {
          rawEdges.push({ source: 'jesse_desk', target: `cg_${cg.symbol}`, label: 'Feed Binance' });
        } else {
          rawEdges.push({ source: 'agent_pm_global', target: `cg_${cg.symbol}`, label: 'Buku Saham Global' });
        }
      }
    });

    // D. Konglomerasi Cross-Holdings Links (Salim, Astra, Barito, Djarum)
    const congEdges = MARKET_NETWORK_DATASETS.conglomerates.edges;
    congEdges.forEach((ce) => {
      rawEdges.push({
        source: `stk_${ce.source}`,
        target: `stk_${ce.target}`,
        label: ce.label,
        relation: ce.type,
      });
    });
  }

  // ── 4. GEOMETRI ORBIT KOSMIK (Galactic Orbit Initial Placement) ──
  const sectorHubPosMap = new Map<string, { x: number; y: number }>();
  IDX_SECTOR_HUBS.forEach((sec, idx) => {
    const theta = (idx % 11) * ((Math.PI * 2) / 11);
    const r = 500;
    sectorHubPosMap.set(sec.id, {
      x: centerX + r * Math.cos(theta),
      y: centerY + r * Math.sin(theta),
    });
  });

  const goldenRatio = 2.3999632;
  const simNodes: ObsidianNode[] = rawNodes.map((n, idx) => {
    let initX = centerX;
    let initY = centerY;

    if (n.category === 'ARCHITECTURE') {
      // Pusat Galaksi: Arsitektur Sistem (Radius 40 - 130px)
      const r = 40 + Math.sqrt(idx) * 25;
      const theta = idx * goldenRatio;
      initX = centerX + r * Math.cos(theta);
      initY = centerY + r * Math.sin(theta);
    } else if (n.category === 'AI_DEPT') {
      // Lingkaran Pertama: 10 Departemen Head (Radius 200px)
      const r = 200;
      const theta = (idx % 10) * ((Math.PI * 2) / 10);
      initX = centerX + r * Math.cos(theta);
      initY = centerY + r * Math.sin(theta);
    } else if (n.category === 'AI_AGENT') {
      // Lingkaran Kedua: 50 Agen Pejabat AI (Radius 270 - 370px)
      const r = 270 + Math.sqrt(idx) * 18;
      const theta = idx * goldenRatio;
      initX = centerX + r * Math.cos(theta);
      initY = centerY + r * Math.sin(theta);
    } else if (n.category === 'SECTOR_HUB') {
      // Lingkaran Ketiga: 11 Sektor Hub BEI (Radius 500px)
      const hubPos = sectorHubPosMap.get(n.id);
      if (hubPos) {
        initX = hubPos.x;
        initY = hubPos.y;
      }
    } else if (n.category === 'STOCK_IDX' && n.parentHubId && sectorHubPosMap.has(n.parentHubId)) {
      // Butiran Saham: Tersebar melingkari Sektor Hub dalam orbit luas (tidak bertumpuk!)
      const hubPos = sectorHubPosMap.get(n.parentHubId)!;
      const r = n.targetOrbitRadius || 120;
      const theta = n.orbitAngle || (idx * goldenRatio);
      initX = hubPos.x + r * Math.cos(theta);
      initY = hubPos.y + r * Math.sin(theta);
    } else {
      // Lingkaran Luar Aset Lainnya
      const r = 580 + Math.sqrt(idx) * 22;
      const theta = idx * goldenRatio;
      initX = centerX + r * Math.cos(theta);
      initY = centerY + r * Math.sin(theta);
    }

    return {
      ...n,
      x: initX,
      y: initY,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: n.baseRadius,
      degree: 1,
    };
  });

  const nodeMap = new Map<string, ObsidianNode>();
  simNodes.forEach((n) => nodeMap.set(n.id, n));

  const validEdges: ObsidianEdge[] = [];
  rawEdges.forEach((e) => {
    const src = nodeMap.get(e.source);
    const tgt = nodeMap.get(e.target);
    if (src && tgt) {
      src.degree++;
      tgt.degree++;
      validEdges.push({
        source: e.source,
        target: e.target,
        label: e.label,
        relation: e.relation,
        sourceNode: src,
        targetNode: tgt,
      });
    }
  });

  const clusterList: ClusterMeta[] = Array.from(clusterCountMap.entries()).map(([id, meta]) => ({
    id,
    name: meta.name,
    color: meta.color,
    count: meta.count,
  }));

  return {
    nodes: simNodes,
    edges: validEdges,
    clusters: clusterList,
  };
}

export default function TradeSimKnowledgeGraphViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── 3D / 2D Dimension Switcher (Default: 3D Otak AI) ──
  const [viewDimension, setViewDimension] = useState<'3D' | '2D'>('3D');

  // ── Scopes & Toggle Seluruh Saham ──
  const [currentScope, setCurrentScope] = useState<MegaUniverseScope>('mega');
  const [includeAllStocks, setIncludeAllStocks] = useState<boolean>(true);

  // ── Obsidian Controls ──
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCluster, setActiveCluster] = useState<string>('ALL');
  const [physicsActive, setPhysicsActive] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeScale, setNodeScale] = useState<number>(1.0);
  const [repelForce, setRepelForce] = useState<number>(1800);
  const [centerGravity, setCenterGravity] = useState<number>(0.003);

  // ── Hover & Selection ──
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ObsidianNode | null>(null);

  // ── Camera Transform ──
  const cameraRef = useRef({ x: 0, y: 0, scale: 0.58 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<ObsidianNode | null>(null);

  // ── Simulation Storage ──
  const nodesRef = useRef<ObsidianNode[]>([]);
  const edgesRef = useRef<ObsidianEdge[]>([]);
  const clustersRef = useRef<ClusterMeta[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const pulseOffsetRef = useRef<number>(0);

  // Load dataset into simulation
  const loadDataset = useCallback((scope: MegaUniverseScope, allStocks: boolean) => {
    const w = containerRef.current?.clientWidth || 1000;
    const h = containerRef.current?.clientHeight || 640;
    const built = buildMegaUniverseDataset(scope, w / 2, h / 2, allStocks);
    nodesRef.current = built.nodes;
    edgesRef.current = built.edges;
    clustersRef.current = built.clusters;
    setSelectedNode(null);
    setHoveredNodeId(null);
    cameraRef.current = { x: 0, y: 0, scale: scope === 'mega' ? 0.58 : 0.85 };
  }, []);

  useEffect(() => {
    loadDataset(currentScope, includeAllStocks);
  }, [currentScope, includeAllStocks, loadDataset]);

  // Handle Resize Canvas dengan ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(rect.width, 800);
      const h = Math.max(rect.height, 640);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
    };

    handleResize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handleResize);
      ro.observe(container);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Filtered nodes (search & cluster)
  const visibleNodeIds = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const set = new Set<string>();
    nodesRef.current.forEach((n) => {
      const matchCluster = activeCluster === 'ALL' || n.cluster === activeCluster;
      const matchSearch =
        !q ||
        n.label.toLowerCase().includes(q) ||
        n.sublabel?.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q);
      if (matchCluster && matchSearch) {
        set.add(n.id);
      }
    });
    return set;
  }, [searchQuery, activeCluster]);

  // 1-hop Neighborhood Map untuk Obsidian Hover Focus
  const neighborhoodMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    edgesRef.current.forEach((e) => {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    });
    return map;
  }, [currentScope, includeAllStocks]);

  // ── 60FPS Obsidian High-Density Physics & Render Loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const centerX = w / 2;
      const centerY = h / 2;

      pulseOffsetRef.current = (pulseOffsetRef.current + 0.015) % 1;

      // ── 1. HIGH-PERFORMANCE CLUSTERED SIMULATION STEP ──
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      if (physicsActive) {
        const nodeMap = new Map<string, ObsidianNode>();
        nodes.forEach((n) => nodeMap.set(n.id, n));

        // A. Repulsion antar Major Nodes (Hubs Sektoral & Pejabat AI)
        const majorNodes = nodes.filter((n) => n.isMajor);
        for (let i = 0; i < majorNodes.length; i++) {
          for (let j = i + 1; j < majorNodes.length; j++) {
            const n1 = majorNodes[i];
            const n2 = majorNodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 16);

            if (dist < 360) {
              const force = Math.min(repelForce / (dist * dist), 3.0);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1 !== draggedNodeRef.current) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2 !== draggedNodeRef.current) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // B. Spatial Grid Repulsion: Menjamin 100% seluruh butiran saham tersebar dan tidak saling menumpuk
        const cellSize = 54;
        const grid = new Map<number, ObsidianNode[]>();
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const cx = Math.floor(n.x / cellSize);
          const cy = Math.floor(n.y / cellSize);
          const key = cx * 10000 + cy;
          let cell = grid.get(key);
          if (!cell) {
            cell = [];
            grid.set(key, cell);
          }
          cell.push(n);
        }

        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          if (n1 === draggedNodeRef.current) continue;
          const cx = Math.floor(n1.x / cellSize);
          const cy = Math.floor(n1.y / cellSize);

          for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
              const key = (cx + ox) * 10000 + (cy + oy);
              const cell = grid.get(key);
              if (!cell) continue;

              for (let j = 0; j < cell.length; j++) {
                const n2 = cell[j];
                if (n1 === n2) continue;

                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const distSq = dx * dx + dy * dy;
                const minDist = (n1.radius + n2.radius) * 1.6 + 8;
                const minDistSq = minDist * minDist;

                if (distSq < minDistSq && distSq > 0.001) {
                  const dist = Math.sqrt(distSq);
                  const push = ((minDist - dist) / dist) * 0.35;
                  n1.vx -= dx * push;
                  n1.vy -= dy * push;
                }
              }
            }
          }
        }

        // C. Orbital Ring Guidance & Soft Center Gravity
        nodes.forEach((n) => {
          if (n === draggedNodeRef.current) return;

          // Jarak orbit terhadap Sektor Hub: Memandu ke cincin targetOrbitRadius (TIDAK pernah jatuh ke titik 0)
          if (n.parentHubId) {
            const parent = nodeMap.get(n.parentHubId);
            if (parent) {
              const dx = n.x - parent.x;
              const dy = n.y - parent.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const targetOrbit = n.targetOrbitRadius || 120;
              const delta = targetOrbit - dist;
              const radialForce = delta * 0.0008; // jika terlalu dekat didorong keluar, jika terlalu jauh ditarik masuk
              n.vx += (dx / dist) * radialForce;
              n.vy += (dy / dist) * radialForce;
            }
          }

          // Gravitasi Pusat ke Tengah Layar (sangat halus agar konstelasi tetap mekar luas)
          n.vx += (centerX - n.x) * (centerGravity * 0.2);
          n.vy += (centerY - n.y) * (centerGravity * 0.2);

          n.vx *= 0.88;
          n.vy *= 0.88;

          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (speed > 6) {
            n.vx = (n.vx / speed) * 6;
            n.vy = (n.vy / speed) * 6;
          }

          n.x += n.vx;
          n.y += n.vy;
        });
      }

      // ── 2. CANVAS DRAWING (Obsidian Dark Cosmic Canvas) ──
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Dark Void Background
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, w, h);

      // Faint subtle cosmic dot grid
      const dotSpacing = 48;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let x = dotSpacing; x < w; x += dotSpacing) {
        for (let y = dotSpacing; y < h; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Camera Transform
      ctx.save();
      ctx.translate(centerX + cameraRef.current.x, centerY + cameraRef.current.y);
      ctx.scale(cameraRef.current.scale, cameraRef.current.scale);
      ctx.translate(-centerX, -centerY);

      const isAnyHovered = hoveredNodeId !== null;
      const hoveredNeighbors = hoveredNodeId ? neighborhoodMap.get(hoveredNodeId) || new Set() : new Set();

      // ── 3. RENDER EDGES (Faint Constellation Web) ──
      edges.forEach((e) => {
        const isConnectedToHover = hoveredNodeId === e.source || hoveredNodeId === e.target;
        const isConnectedToSelected = selectedNode && (selectedNode.id === e.source || selectedNode.id === e.target);

        let alpha = 0.045; // Garis konstelasi halus agar butiran saham terlihat jelas & dominan
        let strokeColor = 'rgba(255, 255, 255, 0.06)';
        let lineWidth = 0.6;

        if (isConnectedToHover) {
          alpha = 1.0;
          strokeColor = e.sourceNode.color || '#38bdf8';
          lineWidth = 2.4;
        } else if (isConnectedToSelected) {
          alpha = 0.9;
          strokeColor = '#38bdf8';
          lineWidth = 1.8;
        } else if (e.relation === 'subsidiary' || e.relation === 'sister' || e.relation === 'jv') {
          alpha = 0.25;
          strokeColor = e.sourceNode.color || '#f59e0b';
          lineWidth = 0.9;
        } else if (isAnyHovered) {
          alpha = 0.015;
          strokeColor = 'rgba(255, 255, 255, 0.015)';
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(e.sourceNode.x, e.sourceNode.y);
        ctx.lineTo(e.targetNode.x, e.targetNode.y);
        ctx.stroke();

        // Traveling pulse on hover
        if (isConnectedToHover) {
          const px = e.sourceNode.x + (e.targetNode.x - e.sourceNode.x) * pulseOffsetRef.current;
          const py = e.sourceNode.y + (e.targetNode.y - e.sourceNode.y) * pulseOffsetRef.current;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = strokeColor;
          ctx.fill();
        }

        ctx.restore();
      });

      // ── 4. RENDER NODES ──
      nodes.forEach((n) => {
        const isHovered = hoveredNodeId === n.id;
        const isSelected = selectedNode?.id === n.id;
        const isNeighbor = hoveredNeighbors.has(n.id);
        const isMatchFilter = visibleNodeIds.has(n.id);

        let alpha = 1.0;
        if (!isMatchFilter) {
          alpha = 0.12;
        } else if (isAnyHovered) {
          alpha = isHovered || isNeighbor ? 1.0 : 0.12;
        }

        const effectiveRadius = n.radius * nodeScale;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Outer Glow Halo
        if (isHovered || isSelected || (n.isMajor && isNeighbor)) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, effectiveRadius + 8, 0, Math.PI * 2);
          ctx.fillStyle = `${n.color}40`;
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Node Border Ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, effectiveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#ffffff' : isHovered ? '#f4f4f5' : 'rgba(8, 10, 15, 0.9)';
        ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.4;
        ctx.stroke();

        // ── 5. LABELS (High-Legibility Backing Pill) ──
        const shouldShowLabel =
          showLabels &&
          (n.isMajor || isHovered || isSelected || isNeighbor || cameraRef.current.scale > 1.3);

        if (shouldShowLabel) {
          const fontSize = isHovered || isSelected ? 12 : n.isMajor ? 11 : 9.5;
          ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';

          const textMetrics = ctx.measureText(n.label);
          const pillWidth = textMetrics.width + 8;
          const pillHeight = fontSize + 5;
          const pillY = n.y + effectiveRadius + 9;

          ctx.fillStyle = 'rgba(8, 10, 15, 0.85)';
          ctx.beginPath();
          ctx.roundRect(n.x - pillWidth / 2, pillY - fontSize + 2, pillWidth, pillHeight, 3);
          ctx.fill();

          ctx.fillStyle = isSelected ? '#ffffff' : isHovered ? '#f4f4f5' : '#e4e4e7';
          ctx.fillText(n.label, n.x, pillY + 1.5);

          if (isHovered || isSelected) {
            ctx.font = '9px monospace';
            ctx.fillStyle = '#a1a1aa';
            ctx.fillText(n.sublabel || n.metric || n.cluster, n.x, pillY + 13);
          }
        }

        ctx.restore();
      });

      ctx.restore(); // restore camera
      ctx.restore(); // restore scale dpr

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    physicsActive,
    repelForce,
    centerGravity,
    nodeScale,
    showLabels,
    hoveredNodeId,
    selectedNode,
    visibleNodeIds,
    neighborhoodMap,
  ]);

  // ── Mouse & Touch Event Handlers ──
  const getCanvasMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { worldX: 0, worldY: 0, clientX: 0, clientY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const centerX = w / 2;
    const centerY = h / 2;

    const mouseX = clientX - centerX - cameraRef.current.x;
    const mouseY = clientY - centerY - cameraRef.current.y;

    const worldX = centerX + mouseX / cameraRef.current.scale;
    const worldY = centerY + mouseY / cameraRef.current.scale;

    return { worldX, worldY, clientX, clientY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { worldX, worldY } = getCanvasMouse(e);
    const nodes = nodesRef.current;

    const clicked = nodes.find((n) => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius * nodeScale + 5;
    });

    if (clicked) {
      draggedNodeRef.current = clicked;
      setSelectedNode(clicked);
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { worldX, worldY } = getCanvasMouse(e);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = worldX;
      draggedNodeRef.current.y = worldY;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      cameraRef.current.x += dx;
      cameraRef.current.y += dy;
    } else {
      const nodes = nodesRef.current;
      const hovered = nodes.find((n) => {
        const dx = n.x - worldX;
        const dy = n.y - worldY;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius * nodeScale + 4;
      });
      setHoveredNodeId(hovered ? hovered.id : null);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    cameraRef.current.scale = Math.min(Math.max(cameraRef.current.scale * zoomFactor, 0.25), 4.0);
  };

  const resetCamera = () => {
    cameraRef.current = { x: 0, y: 0, scale: currentScope === 'mega' ? 0.58 : 0.85 };
    setSelectedNode(null);
    setHoveredNodeId(null);
  };

  // Export Obsidian Vault Markdown
  const handleExportMarkdown = () => {
    const lines = [
      `# TradeSim Pro — Grand Unified Knowledge Graph Vault`,
      `Tanggal: ${new Date().toLocaleString()}`,
      `Cakupan: ${currentScope.toUpperCase()}`,
      `Total Simpul: ${nodesRef.current.length} • Total Relasi: ${edgesRef.current.length}`,
      '',
      '## Entitas & Tautan WikiLinks Terhubung',
      '',
    ];

    nodesRef.current.forEach((n) => {
      const neighbors = Array.from(neighborhoodMap.get(n.id) || []);
      lines.push(`### [[${n.label}]]`);
      lines.push(`- **Kategori**: \`#${n.category}\` (${n.cluster})`);
      lines.push(`- **Deskripsi**: ${n.description}`);
      if (n.metric) lines.push(`- **Metrik**: ${n.metric}`);
      if (n.filePath) lines.push(`- **Berkas**: \`${n.filePath}\``);
      lines.push('- **Koneksi Terhubung**:');
      neighbors.forEach((nbr) => {
        const targetNode = nodesRef.current.find((tn) => tn.id === nbr);
        lines.push(`  - [[${targetNode ? targetNode.label : nbr}]]`);
      });
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradesim-mega-universe-vault.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Node Inspector Connections
  const nodeConnections = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    const outgoing = edgesRef.current.filter((e) => e.source === selectedNode.id);
    const incoming = edgesRef.current.filter((e) => e.target === selectedNode.id);
    return { incoming, outgoing };
  }, [selectedNode]);

  if (viewDimension === '3D') {
    return <TradeSimKnowledgeGraph3D onSwitchTo2D={() => setViewDimension('2D')} />;
  }

  return (
    <div className="relative w-full h-[760px] rounded-2xl bg-[#080a0f] border border-zinc-800/90 overflow-hidden flex flex-col shadow-2xl font-sans select-none">
      {/* ── Top Bar: Scope Selector & Live HUD Metrics ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Universe Scope Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950/90 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto overflow-x-auto no-scrollbar max-w-[70vw]">
          <button
            onClick={() => setViewDimension('3D')}
            className="px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
            title="Beralih ke format 3D WebGL dengan Otak AI di pusat"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>🧠 Beralih ke 3D Otak AI</span>
          </button>

          <button
            onClick={() => setCurrentScope('mega')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentScope === 'mega'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>🌌 MEGA UNIVERSE (1.000+ BUTIRAN)</span>
          </button>

          <button
            onClick={() => setCurrentScope('ai_office')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentScope === 'ai_office'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👔 AI Trading Office (50 Pejabat)</span>
          </button>

          <button
            onClick={() => setCurrentScope('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentScope === 'architecture'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>🏗️ Arsitektur TradeSim</span>
          </button>

          <button
            onClick={() => setCurrentScope('stocks_market')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentScope === 'stocks_market'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏢 Sektor Saham BEI</span>
          </button>
        </div>

        {/* Right: Search, All Stocks Toggle, Settings & Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Toggle All 950+ Stocks */}
          {(currentScope === 'mega' || currentScope === 'stocks_market') && (
            <button
              onClick={() => setIncludeAllStocks(!includeAllStocks)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-md ${
                includeAllStocks
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-zinc-950/90 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
              title="Muat seluruh 950+ emiten bursa BEI ke dalam kanvas"
            >
              <span>{includeAllStocks ? '✓ Seluruh 950+ Butiran Saham' : '+ Muat 950+ Butiran'}</span>
            </button>
          )}

          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari simpul (BBCA, Evelyn, Zustand)..."
              className="pl-8 pr-7 py-1.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none w-52 focus:border-purple-500 shadow-md backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Obsidian Settings Drawer Toggle */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-lg cursor-pointer backdrop-blur-md ${
              isSettingsOpen
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-zinc-950/90 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Obsidian Controls</span>
          </button>

          {/* Physics Play/Pause */}
          <button
            onClick={() => setPhysicsActive(!physicsActive)}
            className={`p-2 rounded-xl border text-xs transition cursor-pointer backdrop-blur-md ${
              physicsActive
                ? 'bg-zinc-950/90 text-emerald-400 border-zinc-800 hover:bg-zinc-900'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
            title={physicsActive ? 'Jeda Simulasi' : 'Lanjutkan Simulasi'}
          >
            {physicsActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="p-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition backdrop-blur-md shadow-md"
            title="Reset Posisi Kamera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Cluster / Sektor Filter Pills (Bottom Left) ── */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 overflow-x-auto max-w-[85%] no-scrollbar pointer-events-auto">
        <button
          onClick={() => setActiveCluster('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition border backdrop-blur-md ${
            activeCluster === 'ALL'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          Semua Simpul ({nodesRef.current.length})
        </button>
        {clustersRef.current.slice(0, 14).map((cl) => (
          <button
            key={cl.id}
            onClick={() => setActiveCluster(cl.id)}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap cursor-pointer transition border backdrop-blur-md flex items-center gap-1.5 ${
              activeCluster === cl.id
                ? 'bg-zinc-800 text-white border-zinc-600 shadow-md'
                : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cl.color }} />
            <span>{cl.name}</span>
            <span className="text-[9px] text-zinc-500">({cl.count})</span>
          </button>
        ))}
      </div>

      {/* ── Main Canvas Viewport ── */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[760px] cursor-grab active:cursor-grabbing"
        style={{ width: '100%', minHeight: '760px', height: '100%' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* ── Floating Obsidian Controls Drawer ── */}
      {isSettingsOpen && (
        <div className="absolute top-16 right-3 z-30 w-72 sm:w-80 max-h-[80%] overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl space-y-4 animate-in slide-in-from-right-3 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white tracking-wide">Graph View Controls</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Display Settings */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Display &amp; Typography
            </span>

            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Tampilkan Label Teks</span>
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`p-1 rounded-lg border transition ${
                  showLabels ? 'bg-purple-600/30 text-purple-300 border-purple-500/50' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
              >
                {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Ukuran Simpul</span>
                <span>{(nodeScale * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={nodeScale}
                onChange={(e) => setNodeScale(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Physics & Forces */}
          <div className="space-y-3 border-t border-zinc-800/80 pt-3">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Physics &amp; Forces
            </span>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Gaya Tolak Simpul</span>
                <span>{repelForce}</span>
              </div>
              <input
                type="range"
                min="600"
                max="4000"
                step="200"
                value={repelForce}
                onChange={(e) => setRepelForce(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Gravitasi Pusat</span>
                <span>{(centerGravity * 1000).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.007"
                step="0.0005"
                value={centerGravity}
                onChange={(e) => setCenterGravity(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Export Vault */}
          <div className="border-t border-zinc-800/80 pt-3 space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Obsidian Vault Export
            </span>
            <button
              onClick={handleExportMarkdown}
              className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Obsidian Vault (.md)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Node Inspector Panel (Obsidian Backlinks & Detail) ── */}
      {selectedNode && (
        <div className="absolute top-16 left-3 z-30 w-72 sm:w-84 max-h-[80%] overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl space-y-3.5 animate-in slide-in-from-left-3 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {selectedNode.category}
                </span>
              </div>
              <h3 className="text-sm font-black text-white leading-tight">
                {selectedNode.label}
              </h3>
              {selectedNode.sublabel && (
                <p className="text-[11px] text-zinc-400 mt-0.5">{selectedNode.sublabel}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
            {selectedNode.description}
          </div>

          {selectedNode.metric && (
            <div className="flex items-center justify-between text-xs font-mono bg-zinc-900/40 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500">Metrik / Valuasi:</span>
              <span className="text-cyan-300 font-bold">{selectedNode.metric}</span>
            </div>
          )}

          {selectedNode.filePath && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Path Berkas:</span>
              <div className="p-1.5 rounded bg-zinc-900 text-[10px] font-mono text-emerald-400 border border-zinc-800 truncate">
                {selectedNode.filePath}
              </div>
            </div>
          )}

          {/* Connected WikiLinks List */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-2.5">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Tautan Terhubung ({nodeConnections.outgoing.length + nodeConnections.incoming.length})
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {nodeConnections.outgoing.map((e, idx) => (
                <button
                  key={`out-${idx}`}
                  onClick={() => {
                    const tgt = nodesRef.current.find((n) => n.id === e.target);
                    if (tgt) setSelectedNode(tgt);
                  }}
                  className="w-full text-left p-1.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-800/90 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center justify-between transition cursor-pointer border border-zinc-800/60"
                >
                  <span className="truncate">[[{e.targetNode.label}]]</span>
                  <span className="text-[9px] text-zinc-500 shrink-0">→ {e.label || 'relasi'}</span>
                </button>
              ))}
              {nodeConnections.incoming.map((e, idx) => (
                <button
                  key={`in-${idx}`}
                  onClick={() => {
                    const src = nodesRef.current.find((n) => n.id === e.source);
                    if (src) setSelectedNode(src);
                  }}
                  className="w-full text-left p-1.5 rounded-lg bg-zinc-900/70 hover:bg-zinc-800/90 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center justify-between transition cursor-pointer border border-zinc-800/60"
                >
                  <span className="truncate">[[{e.sourceNode.label}]]</span>
                  <span className="text-[9px] text-zinc-500 shrink-0">← dipanggil</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
