'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MARKET_NETWORK_DATASETS,
  NetworkCluster,
  NetworkNode,
  NetworkEdge,
  NetworkPresetData,
} from '@/data/market_network_universe';
import { usePortfolioStore } from '@/store';
import {
  Search,
  X,
  RotateCcw,
  Play,
  Pause,
  Layers,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  DollarSign,
  Maximize2,
  Box,
} from 'lucide-react';
import MarketGraph3D from './MarketGraph3D';

interface SimulatedNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  currentPrice: number;
  changePct: number;
  isUp: boolean;
}

interface SimulatedEdge extends NetworkEdge {
  sourceNode: SimulatedNode;
  targetNode: SimulatedNode;
}

export default function AdvancedMarketGraph() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // User portfolio store for Gold Aura overlay
  const holdings = usePortfolioStore((s) => s.holdings);

  // States
  const [activePresetKey, setActivePresetKey] = useState<'conglomerates' | 'smartMoney' | 'crypto'>('conglomerates');
  const [viewDimension, setViewDimension] = useState<'3D' | '2D'>('3D');
  const [physicsActive, setPhysicsActive] = useState<boolean>(true);
  const [sizeMetric, setSizeMetric] = useState<'marketCap' | 'volume' | 'connections'>('marketCap');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<SimulatedNode | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(60);

  // Camera Pan & Zoom Transform
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimulatedNode | null>(null);

  // Nodes & Edges in simulation
  const nodesRef = useRef<SimulatedNode[]>([]);
  const edgesRef = useRef<SimulatedEdge[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastFpsUpdateRef = useRef<number>(Date.now());
  const frameCountRef = useRef<number>(0);

  const activePreset: NetworkPresetData = useMemo(() => {
    return MARKET_NETWORK_DATASETS[activePresetKey];
  }, [activePresetKey]);

  // Map user holdings for fast lookup
  const userHoldingsMap = useMemo(() => {
    const map = new Map<string, { lots: number; unrealizedPL: number; unrealizedPLPercent: number }>();
    if (Array.isArray(holdings)) {
      holdings.forEach((h) => {
        const sym = (h.displaySymbol || h.symbol).toUpperCase();
        map.set(sym, {
          lots: h.lots,
          unrealizedPL: h.unrealizedPL || 0,
          unrealizedPLPercent: h.unrealizedPLPercent || 0,
        });
      });
    }
    return map;
  }, [holdings]);

  // Initialize simulation graph nodes
  const initGraph = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const rawNodes = activePreset.nodes;
    const rawEdges = activePreset.edges;

    // Generate random jitter / price change for live feel
    const simNodes: SimulatedNode[] = rawNodes.map((n, i) => {
      const angle = (i / rawNodes.length) * Math.PI * 2;
      const dist = 180 + Math.random() * 120;
      const initialChange = (Math.sin(i * 1.5) * 3.5).toFixed(2);
      const changeNum = parseFloat(initialChange);

      return {
        ...n,
        x: width / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
        y: height / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: 28,
        currentPrice: n.basePrice > 0 ? n.basePrice : 1000,
        changePct: changeNum,
        isUp: changeNum >= 0,
      };
    });

    const nodeLookup = new Map<string, SimulatedNode>();
    simNodes.forEach((n) => nodeLookup.set(n.id, n));

    const simEdges: SimulatedEdge[] = rawEdges
      .map((e) => ({
        ...e,
        sourceNode: nodeLookup.get(e.source)!,
        targetNode: nodeLookup.get(e.target)!,
      }))
      .filter((e) => e.sourceNode && e.targetNode);

    nodesRef.current = simNodes;
    edgesRef.current = simEdges;
    setSelectedNode(null);
    setFocusedNodeId(null);

    // Reset camera to center
    cameraRef.current = { x: 0, y: 0, scale: 1 };
  }, [activePreset]);

  // Sync simulation when preset changes
  useEffect(() => {
    initGraph();
  }, [initGraph]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute node sizes based on chosen metric
  const calculateNodeRadius = useCallback(
    (node: SimulatedNode) => {
      if (sizeMetric === 'marketCap') {
        if (node.marketCap <= 0) return 24;
        const normalized = Math.min(Math.max(Math.log10(node.marketCap) * 3, 22), 48);
        return normalized;
      }
      if (sizeMetric === 'volume') {
        if (node.volume24h <= 0) return 22;
        const normalized = Math.min(Math.max(Math.log10(node.volume24h) * 2.8, 20), 46);
        return normalized;
      }
      // connections / degree
      return 18 + node.degree * 4.5;
    },
    [sizeMetric]
  );

  // 60FPS Physics Simulation & Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const camera = cameraRef.current;

      // Update FPS counter
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      // Physics Step
      if (physicsActive) {
        const kRepulsion = 1800;
        const kSpring = 0.045;
        const restLength = 150;
        const damping = 0.88;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        const centerX = width / 2;
        const centerY = height / 2;

        // 1. Repulsion between all nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            let dx = n2.x - n1.x;
            let dy = n2.y - n1.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;

            if (dist < 400) {
              let force = kRepulsion / (dist * dist);
              let fx = (dx / dist) * force;
              let fy = (dy / dist) * force;

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

        // 2. Spring attraction along edges
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          let dx = e.targetNode.x - e.sourceNode.x;
          let dy = e.targetNode.y - e.sourceNode.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;

          let force = (dist - restLength) * kSpring;
          let fx = (dx / dist) * force;
          let fy = (dy / dist) * force;

          if (e.sourceNode !== draggedNodeRef.current) {
            e.sourceNode.vx += fx;
            e.sourceNode.vy += fy;
          }
          if (e.targetNode !== draggedNodeRef.current) {
            e.targetNode.vx -= fx;
            e.targetNode.vy -= fy;
          }
        }

        // 3. Central gravity and damping
        nodes.forEach((n) => {
          if (n === draggedNodeRef.current) return;
          n.vx += (centerX - n.x) * 0.0035;
          n.vy += (centerY - n.y) * 0.0035;

          n.vx *= damping;
          n.vy *= damping;
          n.x += n.vx;
          n.y += n.vy;
        });
      }

      // CLEAR CANVAS
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Apply Camera View
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.scale, camera.scale);

      // Determine Focus Neighbors
      let neighborIds = new Set<string>();
      if (focusedNodeId) {
        neighborIds.add(focusedNodeId);
        edges.forEach((e) => {
          if (e.source === focusedNodeId) neighborIds.add(e.target);
          if (e.target === focusedNodeId) neighborIds.add(e.source);
        });
      }

      // DRAW EDGES
      edges.forEach((e) => {
        const isDimmed = focusedNodeId && (!neighborIds.has(e.source) || !neighborIds.has(e.target));
        const isHighlighted = selectedNode && (selectedNode.id === e.source || selectedNode.id === e.target);

        ctx.beginPath();
        ctx.moveTo(e.sourceNode.x, e.sourceNode.y);
        ctx.lineTo(e.targetNode.x, e.targetNode.y);

        if (isDimmed) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
        } else if (isHighlighted) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();

        // Edge label (visible if highlighted or zoomed in)
        if (isHighlighted || (camera.scale > 1.05 && !isDimmed)) {
          const midX = (e.sourceNode.x + e.targetNode.x) / 2;
          const midY = (e.sourceNode.y + e.targetNode.y) / 2;
          ctx.font = '9px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = isHighlighted ? '#34d399' : 'rgba(148, 163, 184, 0.65)';
          ctx.textAlign = 'center';
          ctx.fillText(e.label, midX, midY - 4);
        }
      });

      // DRAW NODES
      nodes.forEach((n) => {
        const cluster = activePreset.clusters.find((c) => c.id === n.cluster) || {
          color: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.4)',
        };
        const isSelected = selectedNode?.id === n.id;
        const isFocused = focusedNodeId === n.id;
        const isNeighbor = neighborIds.has(n.id);
        const isDimmed = focusedNodeId && !isNeighbor;
        const matchesSearch =
          searchQuery.trim() !== '' &&
          (n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.name.toLowerCase().includes(searchQuery.toLowerCase()));

        const userHolding = userHoldingsMap.get(n.label.toUpperCase());
        const hasHolding = !!userHolding;

        const r = calculateNodeRadius(n);

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.1 : searchQuery && !matchesSearch ? 0.2 : 1.0;

        // User Portfolio Gold Aura Ring
        if (hasHolding) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 9, 0, Math.PI * 2);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Halo / Cluster Glow
        if (isSelected || isFocused || matchesSearch || hasHolding) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 12, 0, Math.PI * 2);
          ctx.fillStyle = hasHolding ? 'rgba(245, 158, 11, 0.28)' : cluster.glow;
          ctx.fill();
        }

        // Outer Ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 2, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#ffffff' : hasHolding ? '#fbbf24' : cluster.color;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Node Body (Dark Radial Gradient)
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, r * 0.1, n.x, n.y, r);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fill();

        // Indicator dot (Gain/Loss Status)
        ctx.beginPath();
        ctx.arc(n.x + r * 0.65, n.y - r * 0.65, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = n.isUp ? '#10b981' : '#f43f5e';
        ctx.fill();
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ticker Text
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y - (camera.scale > 0.85 ? 3 : 0));

        // Sublabel (Price / Change)
        if (camera.scale > 0.85 || isSelected || isFocused) {
          ctx.font = '8px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = n.isUp ? '#34d399' : '#fb7185';
          const changeStr = (n.changePct >= 0 ? '+' : '') + n.changePct + '%';
          ctx.fillText(changeStr, n.x, n.y + 10);
        }

        // User Holding Badge text
        if (hasHolding && camera.scale > 0.9) {
          ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`★ ${userHolding.lots} Lot`, n.x, n.y - r - 7);
        }

        ctx.restore();
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [physicsActive, sizeMetric, activePreset, calculateNodeRadius, focusedNodeId, selectedNode, searchQuery, userHoldingsMap]);

  // Coordinate Conversion Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, rawX: 0, rawY: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    const x = (rawX - cameraRef.current.x) / cameraRef.current.scale;
    const y = (rawY - cameraRef.current.y) / cameraRef.current.scale;
    return { x, y, rawX, rawY };
  };

  const findNodeAt = (x: number, y: number): SimulatedNode | null => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const r = calculateNodeRadius(n);
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
      if (dist <= r + 8) return n;
    }
    return null;
  };

  // Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, rawX, rawY } = getCanvasCoords(e);
    const clicked = findNodeAt(x, y);

    if (clicked) {
      draggedNodeRef.current = clicked;
      setSelectedNode(clicked);
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: rawX - cameraRef.current.x,
        y: rawY - cameraRef.current.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { rawX, rawY } = getCanvasCoords(e);

    if (draggedNodeRef.current) {
      const x = (rawX - cameraRef.current.x) / cameraRef.current.scale;
      const y = (rawY - cameraRef.current.y) / cameraRef.current.scale;
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isDraggingRef.current) {
      cameraRef.current.x = rawX - dragStartRef.current.x;
      cameraRef.current.y = rawY - dragStartRef.current.y;
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingRef.current = false;
  };

  // Double Click -> Focus Mode
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const clicked = findNodeAt(x, y);
    if (clicked) {
      setFocusedNodeId(clicked.id);
      setSelectedNode(clicked);

      // Smooth pan to center node
      const container = containerRef.current;
      if (container) {
        cameraRef.current.x = container.clientWidth / 2 - clicked.x * cameraRef.current.scale;
        cameraRef.current.y = container.clientHeight / 2 - clicked.y * cameraRef.current.scale;
      }
    } else {
      setFocusedNodeId(null);
    }
  };

  // Zoom on Mouse Wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const currentScale = cameraRef.current.scale;
    const newScale = Math.min(Math.max(currentScale * zoomFactor, 0.4), 3.0);

    cameraRef.current.x = mouseX - (mouseX - cameraRef.current.x) * (newScale / currentScale);
    cameraRef.current.y = mouseY - (mouseY - cameraRef.current.y) * (newScale / currentScale);
    cameraRef.current.scale = newScale;
  };

  // Reset Camera View
  const handleResetCamera = () => {
    cameraRef.current = { x: 0, y: 0, scale: 1 };
  };

  // Focus Node via UI
  const handleFocusNode = (nodeId: string) => {
    setFocusedNodeId(nodeId);
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      const container = containerRef.current;
      if (container) {
        cameraRef.current.x = container.clientWidth / 2 - node.x * cameraRef.current.scale;
        cameraRef.current.y = container.clientHeight / 2 - node.y * cameraRef.current.scale;
      }
    }
  };

  // Direct Connections of Selected Node
  const selectedNodeEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edgesRef.current.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [selectedNode]);

  return (
    <div className="flex flex-col h-full w-full bg-[#07090e] text-slate-100 rounded-xl overflow-hidden border border-white/10 shadow-2xl relative select-none">
      {/* TOP WORKSTATION SUBHEADER */}
      <div className="h-14 px-4 border-b border-white/10 bg-[#0c101a]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wider text-white uppercase">Advanced Graph View</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                WEBGL 60FPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">{activePreset.subtitle}</p>
          </div>
        </div>

        {/* Preset Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10">
          <button
            onClick={() => setActivePresetKey('conglomerates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePresetKey === 'conglomerates'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Konglomerat & Holding
          </button>
          <button
            onClick={() => setActivePresetKey('smartMoney')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePresetKey === 'smartMoney'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bandarmology Flow
          </button>
          <button
            onClick={() => setActivePresetKey('crypto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePresetKey === 'crypto'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Crypto Corridors
          </button>
        </div>

        {/* 2D / 3D Dimension Switcher */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-white/10">
          <button
            onClick={() => setViewDimension('3D')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewDimension === '3D'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" /> 3D Galaxy
          </button>
          <button
            onClick={() => setViewDimension('2D')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewDimension === '2D'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 2D Planar
          </button>
        </div>

        {/* Actions & Metrics */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{fps} FPS</span> • <span>{nodesRef.current.length} Nodes</span>
          </div>

          <button
            onClick={() => setPhysicsActive((p) => !p)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              physicsActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-white/10'
            }`}
            title="Toggle Physics Engine"
          >
            {physicsActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{physicsActive ? 'Fisika Aktif' : 'Fisika Dijeda'}</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs transition"
            title="Reset Posisi Kamera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* WORKSPACE & CANVAS */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {viewDimension === '3D' ? (
          <MarketGraph3D
            preset={activePreset}
            sizeMetric={sizeMetric}
            searchQuery={searchQuery}
            focusedNodeId={focusedNodeId}
            selectedNodeId={selectedNode ? selectedNode.id : null}
            onSelectNode={(node) => setSelectedNode(node as SimulatedNode | null)}
            onFocusNode={(nodeId) => setFocusedNodeId(nodeId)}
            userHoldingsMap={userHoldingsMap}
            physicsActive={physicsActive}
          />
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing bg-[radial-gradient(circle_at_50%_50%,#0e1424_0%,#07090e_75%,#040508_100%)]"
          />
        )}

        {/* FLOATING SEARCH & FILTER BAR (TOP LEFT) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-xs w-full">
          <div className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-2xl">
            <Search className="w-3.5 h-3.5 text-slate-400 pl-1 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari emiten, konglomerat, broker..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white pr-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Node Size Mode Toggles */}
          <div className="flex items-center gap-1 text-[10px] overflow-x-auto pb-0.5">
            <span className="text-slate-400 font-bold uppercase tracking-wider mr-1 text-[9px]">Ukuran:</span>
            <button
              onClick={() => setSizeMetric('marketCap')}
              className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition ${
                sizeMetric === 'marketCap'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSizeMetric('volume')}
              className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition ${
                sizeMetric === 'volume'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Volume 24H
            </button>
            <button
              onClick={() => setSizeMetric('connections')}
              className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition ${
                sizeMetric === 'connections'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Koneksi
            </button>
          </div>
        </div>

        {/* CLUSTER LEGEND (BOTTOM LEFT) */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/10 shadow-2xl max-w-xs hidden md:block">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Kluster Terdeteksi (Louvain)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">TF-IDF</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {activePreset.clusters.map((c) => {
              const count = nodesRef.current.filter((n) => n.cluster === c.id).length;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    const first = nodesRef.current.find((n) => n.cluster === c.id);
                    if (first) {
                      setSelectedNode(first);
                      handleFocusNode(first.id);
                    }
                  }}
                  className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/5 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color, boxShadow: `0 0 8px ${c.glow}` }}
                    />
                    <span className="text-slate-300 text-[11px] truncate max-w-[170px]">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>★ Lingkaran Emas: Portofolio Anda</span>
            <span>Dbl-Klik: Focus Mode</span>
          </div>
        </div>

        {/* FOCUS BANNER (WHEN ACTIVE) */}
        {focusedNodeId && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center gap-2.5 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-medium text-slate-200">
              Focus Mode Aktif: <b className="text-emerald-400 font-bold">{focusedNodeId}</b> (Tetangga 1st & 2nd Degree)
            </span>
            <button
              onClick={() => setFocusedNodeId(null)}
              className="text-xs text-slate-400 hover:text-white ml-2 bg-white/10 px-2 py-0.5 rounded-full"
            >
              Batal
            </button>
          </div>
        )}

        {/* SIDE INSPECTOR DRAWER (RIGHT) */}
        {selectedNode && (
          <aside className="w-80 border-l border-white/10 bg-[#0c101a]/95 backdrop-blur-lg h-full flex flex-col z-20 absolute right-0 top-0 shadow-2xl transition-all duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
                  {selectedNode.label[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {selectedNode.label}
                    {userHoldingsMap.has(selectedNode.label.toUpperCase()) && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        DI PORTOFOLIO
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{selectedNode.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* Price & Change Card */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[11px] text-slate-400">Harga Terkini</span>
                  <span className="font-bold text-lg font-mono text-white">
                    {selectedNode.isCrypto ? `$${selectedNode.currentPrice.toLocaleString()}` : `Rp ${selectedNode.currentPrice.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Perubahan Estimasi</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      selectedNode.isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedNode.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {(selectedNode.changePct >= 0 ? '+' : '') + selectedNode.changePct}%
                  </span>
                </div>
              </div>

              {/* User Holding Alert (if in portfolio) */}
              {userHoldingsMap.has(selectedNode.label.toUpperCase()) && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Posisi Aktif Anda
                  </div>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>Jumlah Dimiliki:</span>
                    <span className="font-mono font-bold text-amber-200">
                      {userHoldingsMap.get(selectedNode.label.toUpperCase())?.lots} Lot
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-[11px] mt-0.5">
                    <span>Unrealized P/L:</span>
                    <span
                      className={`font-mono font-bold ${
                        (userHoldingsMap.get(selectedNode.label.toUpperCase())?.unrealizedPL || 0) >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      Rp {(userHoldingsMap.get(selectedNode.label.toUpperCase())?.unrealizedPL || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {/* Fundamental Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400">Market Cap</div>
                  <div className="font-bold text-slate-200 mt-0.5 font-mono">
                    {selectedNode.marketCap > 1_000_000_000_000
                      ? `Rp ${(selectedNode.marketCap / 1_000_000_000_000).toFixed(1)} T`
                      : selectedNode.marketCap > 0
                      ? `Rp ${(selectedNode.marketCap / 1_000_000_000).toFixed(0)} M`
                      : 'Institusi'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400">Sektor</div>
                  <div className="font-bold text-slate-200 mt-0.5 truncate">{selectedNode.sector}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400">Derajat Relasi</div>
                  <div className="font-bold text-slate-200 mt-0.5 font-mono">{selectedNode.degree} Hubungan</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-slate-400">PageRank</div>
                  <div className="font-bold text-indigo-400 mt-0.5 font-mono">
                    {(0.65 + selectedNode.degree * 0.05).toFixed(3)} (Tinggi)
                  </div>
                </div>
              </div>

              {/* Emiten Notes */}
              {selectedNode.notes && (
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-slate-300">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Catatan Analis:</div>
                  {selectedNode.notes}
                </div>
              )}

              {/* Direct Connected Peers */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Relasi Terhubung Langsung</span>
                  <span className="text-[10px] text-slate-400">{selectedNodeEdges.length} relasi</span>
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedNodeEdges.map((e, idx) => {
                    const other = e.source === selectedNode.id ? e.targetNode : e.sourceNode;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedNode(other);
                          handleFocusNode(other.id);
                        }}
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${other.isUp ? 'bg-emerald-400' : 'bg-rose-400'}`}
                          />
                          <span className="font-bold text-xs font-mono text-white">{other.label}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{e.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleFocusNode(selectedNode.id)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Focus Mode (Isolasi Jaringan)
                </button>
                <button
                  onClick={() => router.push(`/stock/${selectedNode.label}`)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-white/10 transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Terminal Chart & Order
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
