'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Sliders,
  Sparkles,
  Download,
  Share2,
  Bot,
  Database,
  Cpu,
  Globe,
  Radio,
  X,
  FileCode2,
  Layers,
  Building2,
  TrendingUp,
  Coins,
  Compass,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  TRADESIMS_KNOWLEDGE_NODES,
  TRADESIMS_KNOWLEDGE_EDGES,
  KNOWLEDGE_GRAPH_CLUSTERS,
} from '@/data/tradesims_knowledge_graph';
import {
  MARKET_NETWORK_DATASETS,
  FIRM_AI_EMPLOYEES,
} from '@/data/market_network_universe';

// ── Types & Interfaces ──
export type GraphDatasetKey = 'architecture' | 'conglomerates' | 'smartMoney' | 'crypto' | 'master';

export interface ObsidianNode {
  id: string;
  label: string;
  sublabel?: string;
  category: string;
  cluster: string;
  color: string;
  description: string;
  filePath?: string;
  metric?: string;
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
  description: string;
}

// ── Dataset Builder Helper ──
function buildGraphDataset(key: GraphDatasetKey, centerX: number, centerY: number): {
  nodes: ObsidianNode[];
  edges: ObsidianEdge[];
  clusters: ClusterMeta[];
} {
  const rawNodes: Omit<ObsidianNode, 'x' | 'y' | 'vx' | 'vy' | 'radius' | 'degree'>[] = [];
  const rawEdges: { source: string; target: string; label?: string; relation?: string }[] = [];
  const clusterMap = new Map<string, ClusterMeta>();

  if (key === 'architecture' || key === 'master') {
    KNOWLEDGE_GRAPH_CLUSTERS.forEach((c) => {
      clusterMap.set(c.id, { id: c.id, name: c.name, color: c.color, description: c.description });
    });

    TRADESIMS_KNOWLEDGE_NODES.forEach((n) => {
      rawNodes.push({
        id: n.id,
        label: n.label,
        sublabel: n.category,
        category: n.category,
        cluster: n.cluster,
        color: n.color || '#38bdf8',
        description: n.description,
        filePath: n.filePath,
        metric: n.category === 'STORE' ? 'Zustand State' : n.category === 'DATABASE' ? 'ACID Postgres' : 'React 19',
        baseRadius: n.category === 'STORE' || n.category === 'DATABASE' ? 22 : 16,
      });
    });

    TRADESIMS_KNOWLEDGE_EDGES.forEach((e) => {
      rawEdges.push({
        source: e.source,
        target: e.target,
        label: e.label || e.relation,
        relation: e.relation,
      });
    });
  }

  if (key === 'conglomerates' || key === 'master') {
    const cong = MARKET_NETWORK_DATASETS.conglomerates;
    cong.clusters.forEach((c) => {
      clusterMap.set(c.id, { id: c.id, name: c.name, color: c.color, description: c.description });
    });

    cong.nodes.forEach((n) => {
      const clusterObj = cong.clusters.find((c) => c.id === n.cluster);
      rawNodes.push({
        id: n.id,
        label: n.label,
        sublabel: n.name,
        category: 'SAHAM_IDX',
        cluster: n.cluster,
        color: clusterObj?.color || '#10b981',
        description: `${n.name} • Sektor ${n.sector}. ${n.notes || ''}`,
        metric: `Rp ${(n.marketCap / 1e12).toFixed(1)} T`,
        baseRadius: Math.min(Math.max(14 + Math.log10(n.marketCap || 1e12) * 2, 14), 26),
      });
    });

    cong.edges.forEach((e) => {
      rawEdges.push({
        source: e.source,
        target: e.target,
        label: e.label,
        relation: e.type || 'relasi_grup',
      });
    });
  }

  if (key === 'smartMoney') {
    const sm = MARKET_NETWORK_DATASETS.smartMoney;
    sm.clusters.forEach((c) => {
      clusterMap.set(c.id, { id: c.id, name: c.name, color: c.color, description: c.description });
    });

    sm.nodes.forEach((n) => {
      const clusterObj = sm.clusters.find((c) => c.id === n.cluster);
      rawNodes.push({
        id: n.id,
        label: n.label,
        sublabel: n.name,
        category: 'SMART_MONEY',
        cluster: n.cluster,
        color: clusterObj?.color || '#f59e0b',
        description: `${n.name} • ${n.notes || 'Smart money fund & bandarmology node'}`,
        metric: `Volume Rp ${(n.volume24h / 1e9).toFixed(0)} M`,
        baseRadius: 18,
      });
    });

    sm.edges.forEach((e) => {
      rawEdges.push({
        source: e.source,
        target: e.target,
        label: e.label,
        relation: 'aliran_dana',
      });
    });

    // Masukkan Firm AI Employees
    FIRM_AI_EMPLOYEES.forEach((emp) => {
      clusterMap.set('ai_agent', { id: 'ai_agent', name: 'AI Hedge Fund Council', color: '#a855f7', description: 'Dewan konsensus AI Otonom' });
      rawNodes.push({
        id: emp.id,
        label: `${emp.emoji} ${emp.name}`,
        sublabel: emp.role,
        category: 'AI_AGENT',
        cluster: 'ai_agent',
        color: emp.avatarColor || '#a855f7',
        description: `${emp.role} (${emp.dept}). Tesis: ${emp.thesis}`,
        metric: `Target: ${emp.targetSymbol} (${emp.vote})`,
        baseRadius: 20,
      });

      rawEdges.push({
        source: emp.id,
        target: emp.targetSymbol,
        label: `${emp.vote} (${(emp.weight * 100).toFixed(0)}% weight)`,
        relation: 'keputusan_ai',
      });
    });
  }

  if (key === 'crypto') {
    const cryp = MARKET_NETWORK_DATASETS.crypto;
    cryp.clusters.forEach((c) => {
      clusterMap.set(c.id, { id: c.id, name: c.name, color: c.color, description: c.description });
    });

    cryp.nodes.forEach((n) => {
      const clusterObj = cryp.clusters.find((c) => c.id === n.cluster);
      rawNodes.push({
        id: n.id,
        label: n.label,
        sublabel: n.name,
        category: 'CRYPTO_SPOT',
        cluster: n.cluster,
        color: clusterObj?.color || '#06b6d4',
        description: `${n.name} • ${n.sector}. ${n.notes || ''}`,
        metric: `$${n.basePrice.toLocaleString()}`,
        baseRadius: 18,
      });
    });

    cryp.edges.forEach((e) => {
      rawEdges.push({
        source: e.source,
        target: e.target,
        label: e.label,
        relation: 'likuiditas_kripto',
      });
    });
  }

  // Jika master mode, hubungkan simpul arsitektur ke emiten bursa nyata
  if (key === 'master') {
    rawEdges.push(
      { source: 'jesse_desk', target: 'BTC', label: 'Feed Kripto Binance' },
      { source: 'network_view', target: 'BBCA', label: 'Analisis Konglomerasi' },
      { source: 'portfolio_desk', target: 'BBRI', label: 'Eksekusi Portofolio' },
      { source: 'quant_agent', target: 'BREN', label: 'Sinyal Algoritmik' },
      { source: 'api_hub_view', target: 'TLKM', label: 'Integrasi Data API' }
    );
  }

  // Hitung degree & atur koordinat awal (Fibonacci Spiral / Sunflower agar tidak pernah tumpang tindih)
  const degreeMap = new Map<string, number>();
  rawEdges.forEach((e) => {
    degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
    degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
  });

  const goldenAngle = 2.3999632;
  const simNodes: ObsidianNode[] = rawNodes.map((rn, idx) => {
    const r = 50 + Math.sqrt(idx) * 62;
    const theta = idx * goldenAngle;
    const deg = degreeMap.get(rn.id) || 1;
    return {
      ...rn,
      x: centerX + r * Math.cos(theta),
      y: centerY + r * Math.sin(theta),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      degree: deg,
      radius: rn.baseRadius,
    };
  });

  const nodeMap = new Map<string, ObsidianNode>();
  simNodes.forEach((n) => nodeMap.set(n.id, n));

  const simEdges: ObsidianEdge[] = [];
  rawEdges.forEach((e) => {
    const src = nodeMap.get(e.source);
    const tgt = nodeMap.get(e.target);
    if (src && tgt) {
      simEdges.push({
        source: e.source,
        target: e.target,
        label: e.label,
        relation: e.relation,
        sourceNode: src,
        targetNode: tgt,
      });
    }
  });

  return {
    nodes: simNodes,
    edges: simEdges,
    clusters: Array.from(clusterMap.values()),
  };
}

export default function TradeSimKnowledgeGraphViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── Dataset Switcher State (Penggabungan Network & Arsitektur) ──
  const [activeDataset, setActiveDataset] = useState<GraphDatasetKey>('architecture');

  // ── Obsidian Controls & Graph Settings ──
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCluster, setActiveCluster] = useState<string>('ALL');
  const [physicsActive, setPhysicsActive] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeScale, setNodeScale] = useState<number>(1.0); // 0.6 to 1.8
  const [linkDistance, setLinkDistance] = useState<number>(120); // 70 to 240
  const [repelForce, setRepelForce] = useState<number>(2000); // 800 to 4500
  const [centerGravity, setCenterGravity] = useState<number>(0.0035); // 0.001 to 0.008

  // ── Hover & Selection Interactivity (Obsidian-Style Dimming) ──
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ObsidianNode | null>(null);
  const [pathSourceId, setPathSourceId] = useState<string | null>(null);
  const [pathTargetId, setPathTargetId] = useState<string | null>(null);
  const [pathNodes, setPathNodes] = useState<Set<string>>(new Set());

  // ── Camera Transform ──
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<ObsidianNode | null>(null);

  // ── Nodes & Edges Simulation Storage ──
  const nodesRef = useRef<ObsidianNode[]>([]);
  const edgesRef = useRef<ObsidianEdge[]>([]);
  const clustersRef = useRef<ClusterMeta[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const pulseOffsetRef = useRef<number>(0);

  // Load dataset into simulation
  const loadDataset = useCallback((key: GraphDatasetKey) => {
    const w = containerRef.current?.clientWidth || 1000;
    const h = containerRef.current?.clientHeight || 620;
    const built = buildGraphDataset(key, w / 2, h / 2);
    nodesRef.current = built.nodes;
    edgesRef.current = built.edges;
    clustersRef.current = built.clusters;
    setSelectedNode(null);
    setHoveredNodeId(null);
    setPathSourceId(null);
    setPathTargetId(null);
    setPathNodes(new Set());
    cameraRef.current = { x: 0, y: 0, scale: 1 };
  }, []);

  // Inisialisasi awal saat mount & saat dataset berubah
  useEffect(() => {
    loadDataset(activeDataset);
  }, [activeDataset, loadDataset]);

  // Handle Resize Canvas dengan ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(rect.width, 800);
      const h = Math.max(rect.height, 620);
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

  // Neighborhood map untuk Obsidian hover focus (1-hop neighbors)
  const neighborhoodMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    edgesRef.current.forEach((e) => {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    });
    return map;
  }, [activeDataset]);

  // BFS Shortest Path (Graphify Path Finder)
  useEffect(() => {
    if (!pathSourceId || !pathTargetId) {
      setPathNodes(new Set());
      return;
    }
    const queue: string[][] = [[pathSourceId]];
    const visited = new Set<string>([pathSourceId]);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      const last = cur[cur.length - 1];
      if (last === pathTargetId) {
        setPathNodes(new Set(cur));
        return;
      }
      const neighbors = neighborhoodMap.get(last) || new Set();
      neighbors.forEach((nbr) => {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push([...cur, nbr]);
        }
      });
    }
    setPathNodes(new Set());
  }, [pathSourceId, pathTargetId, neighborhoodMap]);

  // ── 60FPS Obsidian Physics & Canvas Render Loop ──
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

      // ── 1. OBSIDIAN FORCE SIMULATION STEP (Stabil, Tanpa Ledakan) ──
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      if (physicsActive) {
        // A. Repulsion (Coulomb Law dengan clamp pelindung)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 14);

            if (dist < 380) {
              const force = Math.min(repelForce / (dist * dist), 3.2);
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

        // B. Spring Attraction along Edges (Hooke's Law)
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          const dx = e.targetNode.x - e.sourceNode.x;
          const dy = e.targetNode.y - e.sourceNode.y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);

          const force = (dist - linkDistance) * 0.038;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (e.sourceNode !== draggedNodeRef.current) {
            e.sourceNode.vx += fx;
            e.sourceNode.vy += fy;
          }
          if (e.targetNode !== draggedNodeRef.current) {
            e.targetNode.vx -= fx;
            e.targetNode.vy -= fy;
          }
        }

        // C. Center Gravity & Velocity Damping
        nodes.forEach((n) => {
          if (n === draggedNodeRef.current) return;
          n.vx += (centerX - n.x) * centerGravity;
          n.vy += (centerY - n.y) * centerGravity;

          n.vx *= 0.86;
          n.vy *= 0.86;

          // Velocity cap agar simpul tidak melonjak keluar layar
          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (speed > 8) {
            n.vx = (n.vx / speed) * 8;
            n.vy = (n.vy / speed) * 8;
          }

          n.x += n.vx;
          n.y += n.vy;
        });
      }

      // ── 2. CANVAS DRAWING (Authentic Obsidian Graph View Look) ──
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Background Obsidian Dark Void Canvas
      ctx.fillStyle = '#090b10';
      ctx.fillRect(0, 0, w, h);

      // Faint subtle cosmic dot grid (Obsidian style dots)
      const dotSpacing = 42;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = dotSpacing; x < w; x += dotSpacing) {
        for (let y = dotSpacing; y < h; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Camera pan and zoom
      ctx.save();
      ctx.translate(centerX + cameraRef.current.x, centerY + cameraRef.current.y);
      ctx.scale(cameraRef.current.scale, cameraRef.current.scale);
      ctx.translate(-centerX, -centerY);

      // Hitung neighborhood untuk hover
      const isAnyHovered = hoveredNodeId !== null;
      const hoveredNeighbors = hoveredNodeId ? neighborhoodMap.get(hoveredNodeId) || new Set() : new Set();

      // ── 3. RENDER EDGES ──
      edges.forEach((e) => {
        const isConnectedToHover = hoveredNodeId === e.source || hoveredNodeId === e.target;
        const isPath = pathNodes.has(e.source) && pathNodes.has(e.target);
        const isConnectedToSelected = selectedNode && (selectedNode.id === e.source || selectedNode.id === e.target);

        let alpha = 0.16;
        let strokeColor = 'rgba(255, 255, 255, 0.16)';
        let lineWidth = 1;

        if (isPath) {
          alpha = 1.0;
          strokeColor = '#f59e0b';
          lineWidth = 3.2;
        } else if (isConnectedToHover) {
          alpha = 1.0;
          strokeColor = e.sourceNode.color || '#38bdf8';
          lineWidth = 2.4;
        } else if (isConnectedToSelected) {
          alpha = 0.9;
          strokeColor = '#38bdf8';
          lineWidth = 2.0;
        } else if (isAnyHovered) {
          alpha = 0.04;
          strokeColor = 'rgba(255, 255, 255, 0.04)';
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(e.sourceNode.x, e.sourceNode.y);
        ctx.lineTo(e.targetNode.x, e.targetNode.y);
        ctx.stroke();

        // Animated Obsidian Particle pulse along connected edges
        if (isConnectedToHover || isPath) {
          const px = e.sourceNode.x + (e.targetNode.x - e.sourceNode.x) * pulseOffsetRef.current;
          const py = e.sourceNode.y + (e.targetNode.y - e.sourceNode.y) * pulseOffsetRef.current;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = strokeColor;
          ctx.shadowColor = strokeColor;
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      });

      // ── 4. RENDER NODES ──
      nodes.forEach((n) => {
        const isHovered = hoveredNodeId === n.id;
        const isSelected = selectedNode?.id === n.id;
        const isNeighbor = hoveredNeighbors.has(n.id);
        const isPath = pathNodes.has(n.id);
        const isMatchFilter = visibleNodeIds.has(n.id);

        let alpha = 1.0;
        if (!isMatchFilter) {
          alpha = 0.15;
        } else if (isAnyHovered) {
          alpha = isHovered || isNeighbor ? 1.0 : 0.14;
        }

        const effectiveRadius = n.radius * nodeScale;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Outer Glow Halo saat Hover / Select (Obsidian Signature Effect)
        if (isHovered || isSelected || isPath) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, effectiveRadius + 8, 0, Math.PI * 2);
          ctx.fillStyle = isPath ? 'rgba(245, 158, 11, 0.35)' : `${n.color}40`;
          ctx.shadowColor = isPath ? '#f59e0b' : n.color;
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Main Node Body (Vibrant Circle)
        ctx.beginPath();
        ctx.arc(n.x, n.y, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Node Inner Core & Border
        ctx.beginPath();
        ctx.arc(n.x, n.y, effectiveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#ffffff' : isHovered ? '#f4f4f5' : 'rgba(10, 13, 20, 0.85)';
        ctx.lineWidth = isSelected ? 2.8 : isHovered ? 2.2 : 1.8;
        ctx.stroke();

        // ── 5. NODE LABELS (Obsidian Typography) ──
        if (showLabels || isHovered || isSelected || isNeighbor) {
          const fontSize = isHovered || isSelected ? 12 : 11;
          ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';

          // Text Backing Pill untuk keterbacaan tinggi di atas garis
          const labelText = n.label;
          const textMetrics = ctx.measureText(labelText);
          const pillWidth = textMetrics.width + 10;
          const pillHeight = fontSize + 6;
          const pillY = n.y + effectiveRadius + 10;

          ctx.fillStyle = 'rgba(9, 11, 16, 0.82)';
          ctx.beginPath();
          ctx.roundRect(n.x - pillWidth / 2, pillY - fontSize + 2, pillWidth, pillHeight, 4);
          ctx.fill();

          ctx.fillStyle = isSelected ? '#ffffff' : isHovered ? '#e4e4e7' : '#d4d4d8';
          ctx.fillText(labelText, n.x, pillY + 2);

          // Sublabel / Metric Tag
          if (isHovered || isSelected) {
            ctx.font = '9px monospace';
            ctx.fillStyle = '#a1a1aa';
            ctx.fillText(n.sublabel || n.metric || n.cluster, n.x, pillY + 14);
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
    linkDistance,
    centerGravity,
    nodeScale,
    showLabels,
    hoveredNodeId,
    selectedNode,
    visibleNodeIds,
    neighborhoodMap,
    pathNodes,
  ]);

  // ── Mouse Interactivity: Pan, Zoom, Hover, Drag Node ──
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

    // Cek apakah mengklik simpul
    const clicked = nodes.find((n) => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius * nodeScale + 6;
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
      // Hover detection
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
    cameraRef.current.scale = Math.min(Math.max(cameraRef.current.scale * zoomFactor, 0.3), 3.5);
  };

  const resetCamera = () => {
    cameraRef.current = { x: 0, y: 0, scale: 1 };
    setSelectedNode(null);
    setHoveredNodeId(null);
  };

  // Download Obsidian Markdown Note or Vault
  const handleExportMarkdown = () => {
    const lines = [
      `# TradeSim Pro — Obsidian Knowledge Graph Export`,
      `Tanggal Ekspor: ${new Date().toLocaleString()}`,
      `Semesta: ${activeDataset.toUpperCase()}`,
      `Total Simpul: ${nodesRef.current.length} • Total Relasi: ${edgesRef.current.length}`,
      '',
      '## Daftar Simpul & Koneksi WikiLinks',
      '',
    ];

    nodesRef.current.forEach((n) => {
      const neighbors = Array.from(neighborhoodMap.get(n.id) || []);
      lines.push(`### [[${n.label}]]`);
      lines.push(`- **Kategori**: \`#${n.cluster}\` (${n.category})`);
      lines.push(`- **Keterangan**: ${n.description}`);
      if (n.metric) lines.push(`- **Metrik**: ${n.metric}`);
      if (n.filePath) lines.push(`- **File**: \`${n.filePath}\``);
      lines.push('- **Koneksi Terhubung**:');
      neighbors.forEach((nbr) => lines.push(`  - [[${nbr}]]`));
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradesim-${activeDataset}-graph-vault.md`;
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

  return (
    <div className="relative w-full h-[640px] rounded-2xl bg-[#090b10] border border-zinc-800/90 overflow-hidden flex flex-col shadow-2xl font-sans select-none">
      {/* ── Top Obsidian Toolbar ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Dataset Switcher Pills (Penggabungan Arsitektur & Network Graph) */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950/90 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-md pointer-events-auto overflow-x-auto no-scrollbar max-w-[70vw]">
          <button
            onClick={() => setActiveDataset('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeDataset === 'architecture'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>🏗️ Arsitektur Graphify</span>
          </button>
          <button
            onClick={() => setActiveDataset('conglomerates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeDataset === 'conglomerates'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>🏢 Konglomerasi BEI</span>
          </button>
          <button
            onClick={() => setActiveDataset('smartMoney')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeDataset === 'smartMoney'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>🧠 AI & Smart Money</span>
          </button>
          <button
            onClick={() => setActiveDataset('crypto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeDataset === 'crypto'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <span>⚡ Kripto Spot</span>
          </button>
          <button
            onClick={() => setActiveDataset('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeDataset === 'master'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>🌌 Master Universe</span>
          </button>
        </div>

        {/* Right: Search, Obsidian Controls & Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Search Input */}
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari simpul Obsidian..."
              className="pl-8 pr-7 py-1.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none w-48 lg:w-56 focus:border-purple-500 shadow-md backdrop-blur-md"
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

          {/* Toggle Obsidian Settings Drawer Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-lg cursor-pointer backdrop-blur-md ${
              isSettingsOpen
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-zinc-950/90 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-900'
            }`}
            title="Buka Pengaturan Graf Obsidian"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Obsidian Settings</span>
          </button>

          {/* Play/Pause Physics */}
          <button
            onClick={() => setPhysicsActive(!physicsActive)}
            className={`p-2 rounded-xl border text-xs transition cursor-pointer backdrop-blur-md ${
              physicsActive
                ? 'bg-zinc-950/90 text-emerald-400 border-zinc-800 hover:bg-zinc-900'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
            title={physicsActive ? 'Jeda Simulasi Fisika' : 'Lanjutkan Simulasi Fisika'}
          >
            {physicsActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="p-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition backdrop-blur-md shadow-md"
            title="Reset Posisi Kamera ke Tengah"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Cluster Filter Pills (Bottom Left) ── */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 overflow-x-auto max-w-[80%] no-scrollbar pointer-events-auto">
        <button
          onClick={() => setActiveCluster('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition border backdrop-blur-md ${
            activeCluster === 'ALL'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          Semua ({nodesRef.current.length})
        </button>
        {clustersRef.current.map((cl) => (
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
          </button>
        ))}
      </div>

      {/* ── Main Canvas Viewport ── */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[640px] cursor-grab active:cursor-grabbing"
        style={{ width: '100%', minHeight: '640px', height: '100%' }}
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

      {/* ── Floating Obsidian Settings Panel (Classic Graph View Drawer) ── */}
      {isSettingsOpen && (
        <div className="absolute top-16 right-3 z-30 w-72 sm:w-80 max-h-[80%] overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl space-y-4 animate-in slide-in-from-right-3 duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white tracking-wide">Graph View Settings</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Display Parameters */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Display &amp; Appearance
            </span>

            {/* Toggle Labels */}
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

            {/* Node Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Ukuran Simpul</span>
                <span>{(nodeScale * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={nodeScale}
                onChange={(e) => setNodeScale(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Link Distance Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Panjang Relasi</span>
                <span>{linkDistance}px</span>
              </div>
              <input
                type="range"
                min="70"
                max="240"
                step="10"
                value={linkDistance}
                onChange={(e) => setLinkDistance(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Forces Simulation */}
          <div className="space-y-3 border-t border-zinc-800/80 pt-3">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Physics &amp; Forces
            </span>

            {/* Repulsion Force */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Gaya Tolak Simpul</span>
                <span>{repelForce}</span>
              </div>
              <input
                type="range"
                min="800"
                max="4500"
                step="200"
                value={repelForce}
                onChange={(e) => setRepelForce(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Center Gravity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>Gravitasi Pusat</span>
                <span>{(centerGravity * 1000).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.008"
                step="0.0005"
                value={centerGravity}
                onChange={(e) => setCenterGravity(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Vault Export */}
          <div className="border-t border-zinc-800/80 pt-3 space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Obsidian Export
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

      {/* ── Node Inspector Panel (Obsidian Side Pane saat Simpul Diklik) ── */}
      {selectedNode && (
        <div className="absolute top-16 left-3 z-30 w-72 sm:w-80 max-h-[80%] overflow-y-auto bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl space-y-3.5 animate-in slide-in-from-left-3 duration-150">
          {/* Header */}
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
              <h3 className="text-sm font-extrabold text-white leading-tight">
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

          {/* Description */}
          <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
            {selectedNode.description}
          </div>

          {/* Metric / File Info */}
          {selectedNode.metric && (
            <div className="flex items-center justify-between text-xs font-mono bg-zinc-900/40 px-2.5 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500">Nilai / Metrik:</span>
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

          {/* Connected Links (Obsidian WikiLinks Style) */}
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

          {/* Path Finding Controls */}
          <div className="border-t border-zinc-800/80 pt-2.5 flex items-center gap-1.5">
            <button
              onClick={() => setPathSourceId(selectedNode.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                pathSourceId === selectedNode.id
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
            >
              Set Titik Awal
            </button>
            <button
              onClick={() => setPathTargetId(selectedNode.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                pathTargetId === selectedNode.id
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
            >
              Set Titik Akhir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
