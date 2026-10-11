'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Search,
  RotateCcw,
  Play,
  Pause,
  X,
  Sparkles,
  Layers,
  Building2,
  Users,
  Cpu,
  Eye,
  Maximize2,
  Sliders,
  Compass,
  Radio,
} from 'lucide-react';
import {
  TRADESIMS_KNOWLEDGE_NODES,
  TRADESIMS_KNOWLEDGE_EDGES,
} from '@/data/tradesims_knowledge_graph';
import {
  FIRM_AGENTS,
  DEPARTMENTS,
} from '@/lib/hedgefund/firmRoster';
import {
  MASTER_ASSETS,
} from '@/lib/universe/masterAssetUniverse';
import {
  MARKET_NETWORK_DATASETS,
} from '@/data/market_network_universe';

// ── Types ──
export type Scope3D = 'all' | 'architecture' | 'ai_office' | 'stocks_market';

interface Node3DData {
  id: string;
  label: string;
  sublabel?: string;
  category: 'CORE_BRAIN' | 'ARCHITECTURE' | 'AI_DEPT' | 'AI_AGENT' | 'SECTOR_HUB' | 'STOCK_IDX' | 'CRYPTO' | 'GLOBAL';
  cluster: string;
  color: string;
  description: string;
  metric?: string;
  filePath?: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  isMajor: boolean;
  parentHubId?: string;
  mesh?: THREE.Mesh | THREE.Object3D;
  labelSprite?: THREE.Sprite;
}

interface Edge3DData {
  source: string;
  target: string;
  label?: string;
  color: string;
  sourcePos: THREE.Vector3;
  targetPos: THREE.Vector3;
  lineMesh?: THREE.Line;
}

// 11 Sektor Utama BEI
const IDX_SECTOR_HUBS = [
  { id: 'sec_fin', name: 'Keuangan & Bank', color: '#3b82f6', keywords: ['bank', 'finance', 'financial', 'insurance', 'keuangan'] },
  { id: 'sec_energy', name: 'Energi & Tambang', color: '#eab308', keywords: ['energy', 'coal', 'oil', 'gas', 'tambang', 'energi', 'geothermal'] },
  { id: 'sec_basic', name: 'Bahan Baku & Mineral', color: '#06b6d4', keywords: ['basic', 'materials', 'metal', 'nickel', 'copper', 'kimia'] },
  { id: 'sec_consumer_nc', name: 'Konsumer Primer', color: '#10b981', keywords: ['consumer non-cyclical', 'food', 'beverage', 'retail', 'agri'] },
  { id: 'sec_consumer_cy', name: 'Konsumer Siklikal', color: '#f59e0b', keywords: ['consumer cyclical', 'automotive', 'garment', 'retail', 'media'] },
  { id: 'sec_tech', name: 'Teknologi & Digital', color: '#a855f7', keywords: ['tech', 'technology', 'digital', 'software', 'e-commerce'] },
  { id: 'sec_infra', name: 'Infrastruktur & Telko', color: '#ec4899', keywords: ['infra', 'infrastructure', 'telecom', 'tower', 'toll', 'telko'] },
  { id: 'sec_prop', name: 'Properti & Real Estat', color: '#8b5cf6', keywords: ['property', 'properties', 'real estate', 'estate'] },
  { id: 'sec_health', name: 'Kesehatan & Farmasi', color: '#14b8a6', keywords: ['health', 'healthcare', 'pharma', 'hospital', 'farmasi'] },
  { id: 'sec_indus', name: 'Perindustrian', color: '#64748b', keywords: ['industrials', 'industrial', 'heavy equipment', 'machinery'] },
  { id: 'sec_trans', name: 'Transportasi & Logistik', color: '#f43f5e', keywords: ['transportation', 'logistic', 'shipping', 'delivery'] },
];

function resolveSector(sectorName: string): string {
  const s = (sectorName || '').toLowerCase();
  for (const hub of IDX_SECTOR_HUBS) {
    if (hub.keywords.some((k) => s.includes(k))) return hub.id;
  }
  return 'sec_fin';
}

interface TradeSimKnowledgeGraph3DProps {
  onSwitchTo2D?: () => void;
}

export default function TradeSimKnowledgeGraph3D({ onSwitchTo2D }: TradeSimKnowledgeGraph3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [activeScope, setActiveScope] = useState<Scope3D>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRotate, setAutoRotate] = useState(true);
  const [showBrainBeams, setShowBrainBeams] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node3DData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node3DData | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh refs for animation
  const brainMeshRef = useRef<THREE.Mesh | null>(null);
  const brainInnerRef = useRef<THREE.Mesh | null>(null);
  const brainRing1Ref = useRef<THREE.Mesh | null>(null);
  const brainRing2Ref = useRef<THREE.Mesh | null>(null);
  const brainRing3Ref = useRef<THREE.Mesh | null>(null);
  const brainShockwaveRef = useRef<THREE.Mesh | null>(null);
  const laserBeamRef = useRef<THREE.Line | null>(null);
  const pulseParticlesRef = useRef<THREE.Points | null>(null);

  // Storage
  const nodesMapRef = useRef<Map<string, Node3DData>>(new Map());
  const interactiveMeshesRef = useRef<THREE.Object3D[]>([]);
  const edgeLinesRef = useRef<THREE.Line[]>([]);
  const stockPointsRef = useRef<THREE.Points | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Text billboard sprite generator
  const createTextSprite = useCallback((title: string, subtitle?: string, color: string = '#38bdf8') => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = 'rgba(8, 10, 18, 0.88)';
    if (ctx.roundRect) {
      ctx.roundRect(14, 18, 228, 92, 16);
    } else {
      ctx.rect(14, 18, 228, 92);
    }
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(title, 128, 62);

    if (subtitle) {
      ctx.font = '18px sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(subtitle, 128, 94);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(28, 14, 1);
    return sprite;
  }, []);

  // ── Build 3D Dataset ──
  const dataset3D = useMemo(() => {
    const nodes: Node3DData[] = [];
    const edges: Edge3DData[] = [];

    // 0. PUSAT OTAK AI (CENTRAL AI QUANT BRAIN) DI (0, 0, 0)
    const brainNode: Node3DData = {
      id: 'core_brain',
      label: '🧠 CENTRAL QUANT AI BRAIN',
      sublabel: 'Nexus Pengambilan Keputusan & Multi-Source Engine',
      category: 'CORE_BRAIN',
      cluster: 'core_ai',
      color: '#8b5cf6',
      description: 'Pusat komputasi neural otonom TradeSim Pro. Menghubungkan seluruh 21 modul arsitektur, 50 pejabat AI hedge fund, 11 sektor bursa, dan 950+ saham aktif.',
      metric: 'Latency: 1.2ms • Throughput: 100k msg/s • Consensus: 98.4%',
      x: 0,
      y: 0,
      z: 0,
      radius: 28,
      isMajor: true,
    };
    nodes.push(brainNode);

    // 1. ARSITEKTUR TRADESIM (21 Modul dalam shell orbit inner, Radius 160-220)
    const archCount = TRADESIMS_KNOWLEDGE_NODES.length;
    TRADESIMS_KNOWLEDGE_NODES.forEach((an, idx) => {
      const angle = (idx / archCount) * Math.PI * 2;
      const elevation = Math.sin(idx * 1.5) * 45;
      const r = 180;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = elevation + 30;

      const n: Node3DData = {
        id: an.id,
        label: an.label,
        sublabel: `Arsitektur • ${an.category}`,
        category: 'ARCHITECTURE',
        cluster: an.cluster,
        color: an.color || '#38bdf8',
        description: an.description,
        metric: an.category === 'STORE' ? 'Zustand State Engine' : an.category === 'DATABASE' ? 'ACID Postgres RPC' : 'Next.js App Router',
        filePath: an.filePath,
        x,
        y,
        z,
        radius: 8.5,
        isMajor: true,
      };
      nodes.push(n);

      // Hubungkan Berkas Sinaptik dari Otak AI di (0,0,0) ke Arsitektur
      edges.push({
        source: 'core_brain',
        target: an.id,
        label: 'Sistem Engine Telemetri',
        color: '#38bdf8',
        sourcePos: new THREE.Vector3(0, 0, 0),
        targetPos: new THREE.Vector3(x, y, z),
      });
    });

    // 2. AI TRADING OFFICE (10 Departemen, Radius 250, & 50 Pejabat di sekitarnya)
    const deptCount = DEPARTMENTS.length;
    const deptPosMap = new Map<string, THREE.Vector3>();

    DEPARTMENTS.forEach((dept, idx) => {
      const angle = (idx / deptCount) * Math.PI * 2 + 0.3;
      const r = 260;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = Math.cos(idx * 2) * 50 - 20;

      const pos = new THREE.Vector3(x, y, z);
      deptPosMap.set(dept.id, pos);

      const n: Node3DData = {
        id: `dept_${dept.id}`,
        label: `${dept.emoji} ${dept.name}`,
        sublabel: 'Departemen Hedge Fund',
        category: 'AI_DEPT',
        cluster: `dept_${dept.id}`,
        color: dept.color,
        description: dept.mission,
        metric: 'Divisi Spesialis Quant',
        x,
        y,
        z,
        radius: 12,
        isMajor: true,
      };
      nodes.push(n);

      // Sinar Sinaptik Utama dari Otak AI ke Departemen
      edges.push({
        source: 'core_brain',
        target: `dept_${dept.id}`,
        label: 'Instruksi Dewan Investasi',
        color: dept.color,
        sourcePos: new THREE.Vector3(0, 0, 0),
        targetPos: pos,
      });
    });

    // 50 Pejabat AI
    FIRM_AGENTS.forEach((agent, aIdx) => {
      const deptPos = deptPosMap.get(agent.dept) || new THREE.Vector3(200, 0, 200);
      const subAngle = (aIdx * 1.8) % (Math.PI * 2);
      const subDist = 45 + (aIdx % 4) * 8;
      const x = deptPos.x + subDist * Math.cos(subAngle);
      const z = deptPos.z + subDist * Math.sin(subAngle);
      const y = deptPos.y + (Math.sin(aIdx) * 25);

      const deptObj = DEPARTMENTS.find((d) => d.id === agent.dept);
      const color = deptObj?.color || '#a855f7';

      const n: Node3DData = {
        id: `agent_${agent.id}`,
        label: `${agent.emoji} ${agent.name}`,
        sublabel: agent.title,
        category: 'AI_AGENT',
        cluster: `dept_${agent.dept}`,
        color,
        description: `${agent.title} • Tugas: ${agent.duties.join('; ')}`,
        metric: agent.committee ? 'Dewan Investment Committee' : 'Spesialis',
        parentHubId: `dept_${agent.dept}`,
        x,
        y,
        z,
        radius: agent.committee ? 7 : 5,
        isMajor: !!agent.committee,
      };
      nodes.push(n);

      // Hubungkan Pejabat ke Departemen Induk
      edges.push({
        source: `dept_${agent.dept}`,
        target: `agent_${agent.id}`,
        label: 'Personel Departemen',
        color,
        sourcePos: deptPos,
        targetPos: new THREE.Vector3(x, y, z),
      });
    });

    // 3. SEKTOR HUBS BEI (11 Sektor di Cincin Luar, Radius 420-480)
    const secCount = IDX_SECTOR_HUBS.length;
    const secPosMap = new Map<string, THREE.Vector3>();

    IDX_SECTOR_HUBS.forEach((sec, idx) => {
      const angle = (idx / secCount) * Math.PI * 2;
      const r = 440;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = (idx % 2 === 0 ? 35 : -35);

      const pos = new THREE.Vector3(x, y, z);
      secPosMap.set(sec.id, pos);

      const n: Node3DData = {
        id: sec.id,
        label: `🏢 ${sec.name}`,
        sublabel: 'Sektor Pasar Modal BEI',
        category: 'SECTOR_HUB',
        cluster: sec.id,
        color: sec.color,
        description: `Klaster industri emiten bursa BEI kategori ${sec.name}.`,
        metric: 'Hub Sektoral BEI',
        x,
        y,
        z,
        radius: 14,
        isMajor: true,
      };
      nodes.push(n);

      // Sinar Sinaptik dari Otak AI ke Sektor Hub
      edges.push({
        source: 'core_brain',
        target: sec.id,
        label: 'Analisis Sektoral Realtime',
        color: sec.color,
        sourcePos: new THREE.Vector3(0, 0, 0),
        targetPos: pos,
      });
    });

    // 4. SELURUH 950+ BUTIRAN SAHAM BEI (Menyebar dalam Awan Bintang 3D di sekeliling Sektor Hub)
    const idxStocks = MASTER_ASSETS.filter((a) => a.category === 'IDX');
    idxStocks.forEach((stk, sIdx) => {
      const secId = resolveSector(stk.sector);
      const secPos = secPosMap.get(secId) || new THREE.Vector3(400, 0, 0);

      // Koordinat 3D Tersebar (Spherical Halo Orbit mengelilingi Sektor Hub)
      const phi = (sIdx * 2.3999632); // Golden spiral
      const theta = (sIdx * 1.6180339) % Math.PI; // Elevation angle
      const orbitDist = 55 + (sIdx % 9) * 14 + (sIdx % 4) * 5; // Rentang 55 s.d. 180 dari hub

      const x = secPos.x + orbitDist * Math.sin(theta) * Math.cos(phi);
      const z = secPos.z + orbitDist * Math.sin(theta) * Math.sin(phi);
      const y = secPos.y + orbitDist * Math.cos(theta);

      const hub = IDX_SECTOR_HUBS.find((h) => h.id === secId) || IDX_SECTOR_HUBS[0];

      const n: Node3DData = {
        id: `stk_${stk.symbol}`,
        label: stk.symbol,
        sublabel: stk.name,
        category: 'STOCK_IDX',
        cluster: hub.id,
        color: hub.color,
        description: `${stk.name} • Sektor: ${stk.sector}. Papan: ${stk.board || 'Utama'}. Harga: Rp ${stk.defaultPrice.toLocaleString()}`,
        metric: `Rp ${stk.defaultPrice.toLocaleString()}`,
        parentHubId: secId,
        x,
        y,
        z,
        radius: stk.isPopular ? 5.5 : 2.5,
        isMajor: !!stk.isPopular,
      };
      nodes.push(n);

      // Hanya saham populer yang dibuatkan mesh terpisah agar performa 60FPS maksimal
    });

    // Konglomerasi Cross-Holdings
    MARKET_NETWORK_DATASETS.conglomerates.edges.forEach((ce) => {
      const sNode = nodes.find((n) => n.id === `stk_${ce.source}`);
      const tNode = nodes.find((n) => n.id === `stk_${ce.target}`);
      if (sNode && tNode) {
        edges.push({
          source: sNode.id,
          target: tNode.id,
          label: ce.label,
          color: '#f59e0b',
          sourcePos: new THREE.Vector3(sNode.x, sNode.y, sNode.z),
          targetPos: new THREE.Vector3(tNode.x, tNode.y, tNode.z),
        });
      }
    });

    return { nodes, edges };
  }, []);

  // ── Three.js Lifecycle ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 1000;
    const height = mount.clientHeight || 750;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080f);
    scene.fog = new THREE.FogExp2(0x07080f, 0.00065);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 4000);
    camera.position.set(0, 160, 680);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.9;
    controls.maxDistance = 2200;
    controls.minDistance = 60;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // 5. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    // Glowing Neon Brain Pointlights
    const brainLightPurple = new THREE.PointLight(0xa855f7, 4.5, 800);
    brainLightPurple.position.set(0, 0, 0);
    scene.add(brainLightPurple);

    const brainLightCyan = new THREE.PointLight(0x06b6d4, 4.0, 700);
    brainLightCyan.position.set(0, 0, 0);
    scene.add(brainLightCyan);

    // 6. 🧠 BUILD CENTRAL QUANT AI BRAIN AT (0,0,0)
    // A. Outer Geodesic Holographic Brain Core
    const brainGeo = new THREE.IcosahedronGeometry(26, 2);
    const brainMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6366f1,
      emissiveIntensity: 1.1,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: true,
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    brainMesh.position.set(0, 0, 0);
    brainMesh.userData = { id: 'core_brain' };
    scene.add(brainMesh);
    brainMeshRef.current = brainMesh;

    // B. Inner Pulsating Nucleus Sphere
    const innerGeo = new THREE.SphereGeometry(16, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.4,
      metalness: 0.8,
      roughness: 0.2,
    });
    const brainInner = new THREE.Mesh(innerGeo, innerMat);
    brainInner.position.set(0, 0, 0);
    scene.add(brainInner);
    brainInnerRef.current = brainInner;

    // C. 3 Gyroscopic Orbiting Neural Rings
    const ring1Geo = new THREE.TorusGeometry(38, 1.2, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x06b6d4, emissiveIntensity: 0.9, metalness: 0.9 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);
    brainRing1Ref.current = ring1;

    const ring2Geo = new THREE.TorusGeometry(48, 1.0, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xc084fc, emissiveIntensity: 0.9, metalness: 0.9 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);
    brainRing2Ref.current = ring2;

    const ring3Geo = new THREE.TorusGeometry(58, 0.8, 16, 64);
    const ring3Mat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x34d399, emissiveIntensity: 0.8, metalness: 0.9 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 3;
    scene.add(ring3);
    brainRing3Ref.current = ring3;

    // D. Expanding Shockwave Ring
    const shockwaveGeo = new THREE.RingGeometry(25, 30, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const shockwaveRing = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveRing.rotation.x = Math.PI / 2;
    scene.add(shockwaveRing);
    brainShockwaveRef.current = shockwaveRing;

    // E. Text Billboard above Brain
    const brainSprite = createTextSprite('🧠 CENTRAL AI BRAIN', 'NEXUS 1.030+ SUMBER DATA', '#8b5cf6');
    brainSprite.position.set(0, 56, 0);
    brainSprite.scale.set(40, 20, 1);
    scene.add(brainSprite);

    // 7. Interactive Laser Beam (Shoots from Brain to selected node)
    const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3, transparent: true, opacity: 0.95 });
    const laserLine = new THREE.Line(laserGeo, laserMat);
    scene.add(laserLine);
    laserBeamRef.current = laserLine;

    // 8. Background Starfield
    const bgStarCount = 2000;
    const bgStarGeo = new THREE.BufferGeometry();
    const bgStarPos = new Float32Array(bgStarCount * 3);
    for (let i = 0; i < bgStarCount * 3; i += 3) {
      bgStarPos[i] = (Math.random() - 0.5) * 3200;
      bgStarPos[i + 1] = (Math.random() - 0.5) * 2400;
      bgStarPos[i + 2] = (Math.random() - 0.5) * 3200;
    }
    bgStarGeo.setAttribute('position', new THREE.BufferAttribute(bgStarPos, 3));
    const bgStarMat = new THREE.PointsMaterial({ color: 0x64748b, size: 1.4, transparent: true, opacity: 0.6 });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    scene.add(bgStars);

    // 9. INSTANTIATE NODES & MESHES
    const interactiveMeshes: THREE.Object3D[] = [];
    interactiveMeshes.push(brainMesh);

    const nodesMap = new Map<string, Node3DData>();
    dataset3D.nodes.forEach((n) => nodesMap.set(n.id, n));
    nodesMapRef.current = nodesMap;

    // Major Meshes (Architecture, Departments, Key Agents, Sector Hubs, Popular Stocks)
    const majorNodes = dataset3D.nodes.filter((n) => n.category !== 'CORE_BRAIN' && (n.isMajor || n.category !== 'STOCK_IDX'));
    majorNodes.forEach((node) => {
      const geo = new THREE.SphereGeometry(node.radius, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = { id: node.id };
      scene.add(mesh);
      interactiveMeshes.push(mesh);
      node.mesh = mesh;

      // Outer Halo Ring for Sector Hubs & Depts
      if (node.category === 'SECTOR_HUB' || node.category === 'AI_DEPT') {
        const ringG = new THREE.TorusGeometry(node.radius * 1.5, 0.8, 8, 32);
        const ringM = new THREE.MeshBasicMaterial({ color: new THREE.Color(node.color), transparent: true, opacity: 0.6 });
        const ringMesh = new THREE.Mesh(ringG, ringM);
        ringMesh.position.set(node.x, node.y, node.z);
        ringMesh.rotation.x = Math.PI / 2;
        scene.add(ringMesh);
      }

      // Billboard Text Sprite
      if (node.category === 'SECTOR_HUB' || node.category === 'AI_DEPT' || (node.category === 'STOCK_IDX' && node.isMajor)) {
        const sprite = createTextSprite(node.label, node.metric, node.color);
        sprite.position.set(node.x, node.y + node.radius + 12, node.z);
        scene.add(sprite);
        node.labelSprite = sprite;
      }
    });

    // 10. STOCK PARTICLES CLOUD (950+ Saham BEI sebagai Butiran Bintang 3D)
    const regularStocks = dataset3D.nodes.filter((n) => n.category === 'STOCK_IDX' && !n.isMajor);
    const stockGeo = new THREE.BufferGeometry();
    const stockPositions = new Float32Array(regularStocks.length * 3);
    const stockColors = new Float32Array(regularStocks.length * 3);

    regularStocks.forEach((stk, idx) => {
      stockPositions[idx * 3] = stk.x;
      stockPositions[idx * 3 + 1] = stk.y;
      stockPositions[idx * 3 + 2] = stk.z;

      const c = new THREE.Color(stk.color);
      stockColors[idx * 3] = c.r;
      stockColors[idx * 3 + 1] = c.g;
      stockColors[idx * 3 + 2] = c.b;
    });

    stockGeo.setAttribute('position', new THREE.BufferAttribute(stockPositions, 3));
    stockGeo.setAttribute('color', new THREE.BufferAttribute(stockColors, 3));

    const stockMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const stockPoints = new THREE.Points(stockGeo, stockMat);
    scene.add(stockPoints);
    stockPointsRef.current = stockPoints;

    // 11. SYNAPTIC BEAM LINES (Connecting Central AI Brain to All Hubs)
    const edgeLines: THREE.Line[] = [];
    dataset3D.edges.forEach((edge) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([edge.sourcePos, edge.targetPos]);
      const isBrainTrunk = edge.source === 'core_brain';
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(edge.color),
        transparent: true,
        opacity: isBrainTrunk ? 0.35 : 0.12,
        linewidth: isBrainTrunk ? 1.5 : 0.8,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      edgeLines.push(line);
    });
    edgeLinesRef.current = edgeLines;
    interactiveMeshesRef.current = interactiveMeshes;

    // 12. ANIMATION LOOP (60FPS WebGL)
    let shockwaveScale = 1;
    let shockwaveOpacity = 0.8;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Rotate Brain Core
      if (brainMeshRef.current) {
        brainMeshRef.current.rotation.y += 0.008;
        brainMeshRef.current.rotation.x += 0.004;
      }
      if (brainInnerRef.current) {
        const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.08;
        brainInnerRef.current.scale.set(pulse, pulse, pulse);
      }

      // Rotate Gyroscopic Rings
      if (brainRing1Ref.current) brainRing1Ref.current.rotation.z += 0.015;
      if (brainRing2Ref.current) brainRing2Ref.current.rotation.x += 0.012;
      if (brainRing3Ref.current) brainRing3Ref.current.rotation.y += 0.010;

      // Expand Shockwave Pulse Ring
      if (brainShockwaveRef.current) {
        shockwaveScale += 0.035;
        shockwaveOpacity -= 0.012;
        if (shockwaveScale > 4.5) {
          shockwaveScale = 1;
          shockwaveOpacity = 0.8;
        }
        brainShockwaveRef.current.scale.set(shockwaveScale, shockwaveScale, 1);
        (brainShockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(shockwaveOpacity, 0);
      }

      // Gentle Galaxy Rotation
      if (stockPointsRef.current && autoRotate) {
        stockPointsRef.current.rotation.y += 0.0006;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [dataset3D, autoRotate, createTextSprite]);

  // ── Raycasting Mouse Interaction ──
  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    if (!mount || !camera) return;

    const rect = mount.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const intersects = raycaster.intersectObjects(interactiveMeshesRef.current);
    if (intersects.length > 0) {
      const top = intersects[0].object;
      const id = top.userData?.id;
      if (id) {
        const node = nodesMapRef.current.get(id);
        if (node) {
          setHoveredNode(node);
          return;
        }
      }
    }
    setHoveredNode(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    if (!mount || !camera) return;

    const rect = mount.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const intersects = raycaster.intersectObjects(interactiveMeshesRef.current);
    if (intersects.length > 0) {
      const top = intersects[0].object;
      const id = top.userData?.id;
      if (id) {
        const node = nodesMapRef.current.get(id);
        if (node) {
          setSelectedNode(node);

          // Tembakkan Laser Beam dari Otak AI ke simpul ini
          if (laserBeamRef.current && node.id !== 'core_brain') {
            const positions = new Float32Array([0, 0, 0, node.x, node.y, node.z]);
            laserBeamRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            (laserBeamRef.current.material as THREE.LineBasicMaterial).color = new THREE.Color(node.color);
            laserBeamRef.current.visible = true;
          }
          return;
        }
      }
    }
    setSelectedNode(null);
    if (laserBeamRef.current) laserBeamRef.current.visible = false;
  };

  // Search Jump to Node
  const handleSearchSelect = (query: string) => {
    setSearchQuery(query);
    if (!query) return;
    const q = query.toUpperCase();
    const found = dataset3D.nodes.find((n) => n.label.toUpperCase().includes(q) || n.id.toUpperCase().includes(q));
    if (found && controlsRef.current && cameraRef.current) {
      setSelectedNode(found);
      // Smoothly look at target
      controlsRef.current.target.set(found.x, found.y, found.z);

      // Tembakkan Laser Beam
      if (laserBeamRef.current && found.id !== 'core_brain') {
        const positions = new Float32Array([0, 0, 0, found.x, found.y, found.z]);
        laserBeamRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        (laserBeamRef.current.material as THREE.LineBasicMaterial).color = new THREE.Color(found.color);
        laserBeamRef.current.visible = true;
      }
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 160, 680);
      controlsRef.current.target.set(0, 0, 0);
      setSelectedNode(null);
      if (laserBeamRef.current) laserBeamRef.current.visible = false;
    }
  };

  return (
    <div className="relative w-full h-[760px] rounded-2xl bg-[#07080f] border border-zinc-800/90 overflow-hidden flex flex-col shadow-2xl font-sans select-none">
      {/* ── Top Bar Controls & 2D/3D Dimension Toggle ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: 3D Badge & Dimension Switcher */}
        <div className="flex items-center gap-2 p-1 glass-panel rounded-xl shadow-2xl backdrop-blur-xl pointer-events-auto">
          <div className="px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>3D Otak AI Universe</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono text-cyan-300">WEBGL 60FPS</span>
          </div>

          {onSwitchTo2D && (
            <button
              onClick={onSwitchTo2D}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5 cursor-pointer"
              title="Beralih ke format kanvas Obsidian 2D"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Beralih ke 2D Obsidian</span>
            </button>
          )}
        </div>

        {/* Right: Search, AutoRotate & Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Search with 3D Laser Lock */}
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchSelect(e.target.value)}
              placeholder="Cari emiten (BBCA, BMRI) atau pejabat..."
              className="pl-8 pr-7 py-1.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none w-56 focus:border-cyan-500 shadow-md backdrop-blur-md font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedNode(null);
                  if (laserBeamRef.current) laserBeamRef.current.visible = false;
                }}
                className="absolute right-2 top-2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl border text-xs transition cursor-pointer backdrop-blur-md shadow-md ${
              autoRotate
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-zinc-950/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title={autoRotate ? 'Jeda Rotasi Otomatis' : 'Aktifkan Rotasi Otomatis'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="p-2 rounded-xl bg-zinc-950/90 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition backdrop-blur-md shadow-md"
            title="Reset Posisi Kamera ke Pusat Otak AI"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 3D Viewport Mount Container ── */}
      <div
        ref={mountRef}
        onMouseMove={handlePointerMove}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing flex-1"
      />

      {/* ── Live HUD Node Inspector Overlay (Bottom Right) ── */}
      {(selectedNode || hoveredNode) && (
        <div className="absolute bottom-4 right-4 z-30 max-w-sm w-full bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-2 animate-in fade-in duration-150">
          {(() => {
            const active = selectedNode || hoveredNode!;
            const isBrain = active.id === 'core_brain';
            return (
              <>
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: active.color }} />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      {isBrain ? 'PUSAT OTAK AI' : active.category}
                    </span>
                  </div>
                  {selectedNode && (
                    <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white text-xs">
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <div className="text-sm font-black text-white">{active.label}</div>
                  {active.sublabel && <div className="text-xs text-zinc-400">{active.sublabel}</div>}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{active.description}</p>

                {active.metric && (
                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
                    <span>STATUS / METRIK:</span>
                    <strong className="text-white">{active.metric}</strong>
                  </div>
                )}

                {isBrain ? (
                  <div className="text-[11px] font-mono text-purple-300 pt-1">
                    ⚡ Memancarkan impuls sinaptik aktif ke 1.030+ simpul data bursa
                  </div>
                ) : (
                  <div className="text-[11px] font-mono text-emerald-400 pt-1 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    <span>Terhubung langsung ke Pusat Otak AI (0, 0, 0)</span>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ── Live Legend Pill (Bottom Left) ── */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-zinc-950/85 border border-zinc-800/80 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
          <span>Otak AI Pusat (0,0,0)</span>
        </div>
        <span className="text-zinc-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>21 Arsitektur</span>
        </div>
        <span className="text-zinc-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>50 AI Pejabat</span>
        </div>
        <span className="text-zinc-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>11 Sektor BEI</span>
        </div>
        <span className="text-zinc-600">•</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>950+ Butiran Saham</span>
        </div>
      </div>
    </div>
  );
}
