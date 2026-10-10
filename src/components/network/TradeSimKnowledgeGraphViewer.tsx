'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Layers,
  Search,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  ExternalLink,
  ShieldCheck,
  Zap,
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
} from 'lucide-react';
import {
  TRADESIMS_KNOWLEDGE_NODES,
  TRADESIMS_KNOWLEDGE_EDGES,
  KNOWLEDGE_GRAPH_CLUSTERS,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
} from '@/data/tradesims_knowledge_graph';

interface SimulatedGraphNode extends KnowledgeGraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface SimulatedGraphEdge extends KnowledgeGraphEdge {
  sourceNode: SimulatedGraphNode;
  targetNode: SimulatedGraphNode;
}

export default function TradeSimKnowledgeGraphViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visual Styling Controls (Obsidian GraphView Image Skinning Inspired)
  const [bgGridEnabled, setBgGridEnabled] = useState(true);
  const [bgOpacity, setBgOpacity] = useState(0.35); // 0.0 to 1.0
  const [radarSweepEnabled, setRadarSweepEnabled] = useState(true);
  const [activeClusterFilter, setActiveClusterFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [physicsActive, setPhysicsActive] = useState(true);

  // Selection & Path Discovery (Graphify inspired)
  const [selectedNode, setSelectedNode] = useState<SimulatedGraphNode | null>(null);
  const [pathSourceId, setPathSourceId] = useState<string | null>(null);
  const [pathTargetId, setPathTargetId] = useState<string | null>(null);
  const [pathNodes, setPathNodes] = useState<Set<string>>(new Set());

  // Camera Pan & Zoom Transform
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SimulatedGraphNode | null>(null);

  // Nodes & Edges Refs for Simulation
  const nodesRef = useRef<SimulatedGraphNode[]>([]);
  const edgesRef = useRef<SimulatedGraphEdge[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const radarAngleRef = useRef<number>(0);

  // Inisialisasi posisi awal simpul
  useEffect(() => {
    const simNodes: SimulatedGraphNode[] = TRADESIMS_KNOWLEDGE_NODES.map((n) => ({
      ...n,
      x: n.x || (Math.random() - 0.5) * 400,
      y: n.y || (Math.random() - 0.5) * 400,
      vx: 0,
      vy: 0,
      radius: n.category === 'STORE' || n.category === 'DATABASE' ? 24 : 18,
    }));

    const nodeMap = new Map<string, SimulatedGraphNode>();
    simNodes.forEach((n) => nodeMap.set(n.id, n));

    const simEdges: SimulatedGraphEdge[] = [];
    TRADESIMS_KNOWLEDGE_EDGES.forEach((e) => {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (src && tgt) {
        simEdges.push({
          ...e,
          sourceNode: src,
          targetNode: tgt,
        });
      }
    });

    nodesRef.current = simNodes;
    edgesRef.current = simEdges;
  }, []);

  // Filter nodes & edges berdasarkan active cluster & search
  const visibleNodes = useMemo(() => {
    return nodesRef.current.filter((n) => {
      const matchCluster = activeClusterFilter === 'ALL' || n.cluster === activeClusterFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.filePath.toLowerCase().includes(q);
      return matchCluster && matchSearch;
    });
  }, [activeClusterFilter, searchQuery]);

  // Algoritma BFS Shortest Path antara dua simpul (Fitur Graphify /graphify path)
  const calculateShortestPath = useCallback((startId: string, endId: string) => {
    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);

    const adjacency = new Map<string, string[]>();
    TRADESIMS_KNOWLEDGE_EDGES.forEach((e) => {
      if (!adjacency.has(e.source)) adjacency.set(e.source, []);
      if (!adjacency.has(e.target)) adjacency.set(e.target, []);
      adjacency.get(e.source)!.push(e.target);
      adjacency.get(e.target)!.push(e.source);
    });

    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      const lastNode = currentPath[currentPath.length - 1];

      if (lastNode === endId) {
        setPathNodes(new Set(currentPath));
        return;
      }

      const neighbors = adjacency.get(lastNode) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push([...currentPath, n]);
        }
      }
    }
    setPathNodes(new Set());
  }, []);

  useEffect(() => {
    if (pathSourceId && pathTargetId) {
      calculateShortestPath(pathSourceId, pathTargetId);
    } else {
      setPathNodes(new Set());
    }
  }, [pathSourceId, pathTargetId, calculateShortestPath]);

  // Main Canvas Render Loop (Physics + Holographic Background + Nodes + Edges)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Radar rotation
      if (radarSweepEnabled) {
        radarAngleRef.current = (radarAngleRef.current + 0.008) % (Math.PI * 2);
      }

      ctx.save();
      // Pusat koordinat ke tengah canvas
      ctx.translate(width / 2 + cameraRef.current.x, height / 2 + cameraRef.current.y);
      ctx.scale(cameraRef.current.scale, cameraRef.current.scale);

      // ── 1. HOLOGRAPHIC BACKGROUND SKINNING (Obsidian GraphView Image Overlay) ──
      if (bgGridEnabled) {
        ctx.save();
        ctx.globalAlpha = bgOpacity;

        // Blueprint Grid Pattern
        const gridSize = 40;
        const extent = 1000;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = -extent; x <= extent; x += gridSize) {
          ctx.moveTo(x, -extent);
          ctx.lineTo(x, extent);
        }
        for (let y = -extent; y <= extent; y += gridSize) {
          ctx.moveTo(-extent, y);
          ctx.lineTo(extent, y);
        }
        ctx.stroke();

        // Concentric FinTech Radar Circles
        [150, 300, 480, 680].forEach((r, idx) => {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.strokeStyle = idx % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 191, 36, 0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Holographic Radar Sweep Beam
        if (radarSweepEnabled) {
          const sweepGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 550);
          sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
          sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(
            0,
            0,
            550,
            radarAngleRef.current - 0.35,
            radarAngleRef.current
          );
          ctx.closePath();
          ctx.fillStyle = sweepGrad;
          ctx.fill();
        }

        // Global Financial Coordinates Labels (HUD Watermark)
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.fillText('IDX JAKARTA [6°12\'S, 106°49\'E] • NODE NETWORK READY', -420, -320);
        ctx.fillText('NYSE NEW YORK [40°42\'N, 74°00\'W] • HIGH FREQUENCY BRIDGE', 180, -320);
        ctx.fillText('LSE LONDON [51°30\'N, 0°07\'W] • CENTRAL BANK TELEMETRY', -420, 360);
        ctx.fillText('TRADESIM PRO KNOWLEDGE GRAPH • GRAPHIFY HUD CORE v2.4', 180, 360);

        ctx.restore();
      }

      // ── 2. PHYSICS FORCE SIMULATION STEP ──
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      if (physicsActive) {
        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 350) {
              const force = (350 - dist) / dist * 0.015;
              nodes[i].vx -= dx * force;
              nodes[i].vy -= dy * force;
              nodes[j].vx += dx * force;
              nodes[j].vy += dy * force;
            }
          }
        }

        // Edge spring pull
        edges.forEach((e) => {
          const dx = e.targetNode.x - e.sourceNode.x;
          const dy = e.targetNode.y - e.sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 140;
          const force = (dist - targetDist) * 0.003;
          e.sourceNode.vx += dx * force;
          e.sourceNode.vy += dy * force;
          e.targetNode.vx -= dx * force;
          e.targetNode.vy -= dy * force;
        });

        // Center gravity and velocity damping
        nodes.forEach((n) => {
          if (n !== draggedNodeRef.current) {
            n.vx += -n.x * 0.0008;
            n.vy += -n.y * 0.0008;
            n.vx *= 0.88;
            n.vy *= 0.88;
            n.x += n.vx;
            n.y += n.vy;
          }
        });
      }

      // ── 3. RENDER EDGES ──
      edges.forEach((e) => {
        const isPath = pathNodes.has(e.source) && pathNodes.has(e.target);
        const isSelected = selectedNode && (selectedNode.id === e.source || selectedNode.id === e.target);

        ctx.beginPath();
        ctx.moveTo(e.sourceNode.x, e.sourceNode.y);
        ctx.lineTo(e.targetNode.x, e.targetNode.y);

        if (isPath) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
        } else if (isSelected) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = 'rgba(113, 113, 122, 0.35)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // ── 4. RENDER NODES ──
      nodes.forEach((n) => {
        const isSelected = selectedNode?.id === n.id;
        const isPath = pathNodes.has(n.id);
        const isMatch = visibleNodes.some((vn) => vn.id === n.id);

        ctx.save();
        if (!isMatch) ctx.globalAlpha = 0.2;

        // Node Glow Halo
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + (isSelected ? 6 : 2), 0, Math.PI * 2);
        ctx.fillStyle = isPath ? 'rgba(245, 158, 11, 0.4)' : isSelected ? 'rgba(56, 189, 248, 0.4)' : 'rgba(24, 24, 27, 0.8)';
        ctx.fill();

        // Node Main Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color || '#38bdf8';
        ctx.shadowColor = n.color || '#38bdf8';
        ctx.shadowBlur = isSelected || isPath ? 15 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Border Ring
        ctx.lineWidth = 2;
        ctx.strokeStyle = isSelected ? '#ffffff' : '#09090b';
        ctx.stroke();

        // Node Text Label
        ctx.font = '11px sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : '#d4d4d8';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.radius + 14);

        // Category Tag under label
        ctx.font = '9px monospace';
        ctx.fillStyle = '#71717a';
        ctx.fillText(n.category, n.x, n.y + n.radius + 25);

        ctx.restore();
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [bgGridEnabled, bgOpacity, radarSweepEnabled, physicsActive, selectedNode, visibleNodes, pathNodes]);

  // Handle Resize Canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Interaction: Click, Drag, Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - canvas.width / 2 - cameraRef.current.x;
    const mouseY = e.clientY - rect.top - canvas.height / 2 - cameraRef.current.y;
    const worldX = mouseX / cameraRef.current.scale;
    const worldY = mouseY / cameraRef.current.scale;

    // Check if clicked on a node
    const clicked = nodesRef.current.find((n) => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
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
    if (draggedNodeRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - canvas.width / 2 - cameraRef.current.x;
      const mouseY = e.clientY - rect.top - canvas.height / 2 - cameraRef.current.y;
      draggedNodeRef.current.x = mouseX / cameraRef.current.scale;
      draggedNodeRef.current.y = mouseY / cameraRef.current.scale;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      cameraRef.current.x += dx;
      cameraRef.current.y += dy;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    cameraRef.current.scale = Math.min(2.5, Math.max(0.4, cameraRef.current.scale * zoomFactor));
  };

  const resetCamera = () => {
    cameraRef.current = { x: 0, y: 0, scale: 1 };
    setSelectedNode(null);
    setPathSourceId(null);
    setPathTargetId(null);
  };

  // Node Inspector Connections
  const nodeConnections = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    const outgoing = TRADESIMS_KNOWLEDGE_EDGES.filter((e) => e.source === selectedNode.id);
    const incoming = TRADESIMS_KNOWLEDGE_EDGES.filter((e) => e.target === selectedNode.id);
    return { incoming, outgoing };
  }, [selectedNode]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl bg-[#09090b] border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
      {/* ── Top Header Toolbar ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Badge & Search */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Graphify HUD Knowledge Graph</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari simpul arsitektur (Header, Store, Supabase)..."
              className="pl-8 pr-3 py-1.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none w-52 sm:w-64 focus:border-cyan-500 shadow-md backdrop-blur-md"
            />
          </div>
        </div>

        {/* Right: Controls & Presets */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          <button
            onClick={() => setBgGridEnabled(!bgGridEnabled)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition border backdrop-blur-md ${
              bgGridEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
            }`}
            title="Toggle Holographic Blueprint Grid (Obsidian Skinning)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HUD Grid</span>
          </button>

          <button
            onClick={() => setPhysicsActive(!physicsActive)}
            className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition border backdrop-blur-md ${
              physicsActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-900/80 text-zinc-400 border-zinc-800'
            }`}
            title={physicsActive ? 'Jeda Simulasi Fisika' : 'Aktifkan Simulasi Fisika'}
          >
            {physicsActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={resetCamera}
            className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition backdrop-blur-md"
            title="Reset Posisi Kamera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Cluster Filters Bar (Bottom Left) ── */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 overflow-x-auto max-w-[85%] no-scrollbar pointer-events-auto">
        <button
          onClick={() => setActiveClusterFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition border backdrop-blur-md ${
            activeClusterFilter === 'ALL'
              ? 'bg-white text-black border-white shadow-md'
              : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          Semua Simpul ({TRADESIMS_KNOWLEDGE_NODES.length})
        </button>
        {KNOWLEDGE_GRAPH_CLUSTERS.map((cl) => (
          <button
            key={cl.id}
            onClick={() => setActiveClusterFilter(cl.id)}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap cursor-pointer transition border backdrop-blur-md flex items-center gap-1 ${
              activeClusterFilter === cl.id
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
      <div ref={containerRef} className="relative w-full h-full cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />
      </div>

      {/* ── Node Inspector Panel (If a Node is Selected) ── */}
      {selectedNode && (
        <div className="absolute top-14 right-3 z-30 w-72 sm:w-80 max-h-[85%] overflow-y-auto bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3.5 animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedNode.color || '#38bdf8' }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {selectedNode.category}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-white">{selectedNode.label}</h4>
            <div className="text-[10px] font-mono text-cyan-400 truncate mt-0.5 flex items-center gap-1">
              <FileCode2 className="w-3 h-3 shrink-0" />
              <span>{selectedNode.filePath}</span>
            </div>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              {selectedNode.description}
            </p>
          </div>

          {/* Graphify Path Discovery Controller */}
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              🧭 Graphify Path Tracer:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPathSourceId(selectedNode.id)}
                className={`flex-1 py-1 rounded text-[10px] font-bold border cursor-pointer transition ${
                  pathSourceId === selectedNode.id
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                Set Titik Awal
              </button>
              <button
                type="button"
                onClick={() => setPathTargetId(selectedNode.id)}
                className={`flex-1 py-1 rounded text-[10px] font-bold border cursor-pointer transition ${
                  pathTargetId === selectedNode.id
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                Set Titik Akhir
              </button>
            </div>
            {pathNodes.size > 0 && (
              <div className="text-[10px] text-amber-400 font-mono mt-1">
                Jalur terpendek ditemukan: {pathNodes.size} simpul terhubung!
              </div>
            )}
          </div>

          {/* Outgoing & Incoming Edges */}
          <div className="space-y-2 text-[11px]">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Koneksi Keluar ({nodeConnections.outgoing.length}):
              </span>
              <div className="space-y-1 mt-1">
                {nodeConnections.outgoing.map((e, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-between text-zinc-300"
                  >
                    <span className="font-semibold text-white">{e.target}</span>
                    <span className="text-[9px] text-cyan-400 font-mono">[{e.label || e.relation}]</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Dipanggil Oleh ({nodeConnections.incoming.length}):
              </span>
              <div className="space-y-1 mt-1">
                {nodeConnections.incoming.map((e, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-850 flex items-center justify-between text-zinc-300"
                  >
                    <span className="font-semibold text-white">{e.source}</span>
                    <span className="text-[9px] text-emerald-400 font-mono">[{e.label || e.relation}]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
