'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  NetworkNode,
  NetworkEdge,
  NetworkCluster,
  NetworkPresetData,
  FIRM_AI_EMPLOYEES,
  EmployeeAgentNode,
} from '@/data/market_network_universe';

interface Node3D extends NetworkNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  mesh?: THREE.Mesh;
  glowMesh?: THREE.Sprite;
  holdingRing?: THREE.Mesh;
  labelSprite?: THREE.Sprite;
}

interface Edge3D extends NetworkEdge {
  sourceNode: Node3D;
  targetNode: Node3D;
  lineMesh?: THREE.Line;
}

interface Employee3D extends EmployeeAgentNode {
  x: number;
  y: number;
  z: number;
  mesh?: THREE.Mesh;
  labelSprite?: THREE.Sprite;
  beamLine?: THREE.Line;
}

export type SelectedInspectTarget =
  | { type: 'CORE'; consensusPct: number; currentTarget: string }
  | { type: 'EMPLOYEE'; data: EmployeeAgentNode }
  | { type: 'STOCK'; data: NetworkNode }
  | null;

interface MarketGraph3DProps {
  preset: NetworkPresetData;
  sizeMetric: 'marketCap' | 'volume' | 'connections';
  searchQuery: string;
  focusedNodeId: string | null;
  selectedNodeId: string | null;
  onSelectNode: (node: NetworkNode | null) => void;
  onSelectEmployee?: (emp: EmployeeAgentNode | null) => void;
  onSelectCore?: (info: { consensusPct: number; currentTarget: string } | null) => void;
  onFocusNode: (nodeId: string | null) => void;
  userHoldingsMap: Map<string, { lots: number; unrealizedPL: number }>;
  physicsActive: boolean;
}

export default function MarketGraph3D({
  preset,
  sizeMetric,
  searchQuery,
  focusedNodeId,
  selectedNodeId,
  onSelectNode,
  onSelectEmployee,
  onSelectCore,
  onFocusNode,
  userHoldingsMap,
  physicsActive,
}: MarketGraph3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [decisionActive, setDecisionActive] = useState<boolean>(false);
  const [decisionTarget, setDecisionTarget] = useState<string>('BREN');
  const [consensusPct, setConsensusPct] = useState<number>(94);
  const [cycleStepMsg, setCycleStepMsg] = useState<string>('Core Aktif: Memindai Konsensus Agen...');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Core 3D Meshes
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const coreGimbalRing1Ref = useRef<THREE.Mesh | null>(null);
  const coreGimbalRing2Ref = useRef<THREE.Mesh | null>(null);
  const coreBeamRef = useRef<THREE.Line | null>(null);
  const coreShockwaveRingRef = useRef<THREE.Mesh | null>(null);
  const coreTextSpriteRef = useRef<THREE.Sprite | null>(null);

  const nodes3DRef = useRef<Node3D[]>([]);
  const edges3DRef = useRef<Edge3D[]>([]);
  const employees3DRef = useRef<Employee3D[]>([]);
  const reqAnimationRef = useRef<number | null>(null);

  // Generate 3D Text Sprite (Ticker Name + Sublabel)
  const createTextSprite = (text: string, subtext: string, color: string = '#ffffff') => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    ctx.clearRect(0, 0, 256, 128);

    // Pill background
    ctx.fillStyle = 'rgba(10, 15, 26, 0.82)';
    ctx.roundRect ? ctx.roundRect(24, 18, 208, 92, 18) : ctx.rect(24, 18, 208, 92);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Main text
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 62);

    // Subtext
    ctx.font = '22px sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(subtext, 128, 94);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(24, 12, 1);
    return sprite;
  };

  // Generate Employee Billboard Sprite (Emoji + Name + Role)
  const createEmployeeSprite = (emp: EmployeeAgentNode) => {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    ctx.clearRect(0, 0, 280, 140);

    ctx.fillStyle = 'rgba(8, 12, 22, 0.88)';
    ctx.roundRect ? ctx.roundRect(10, 10, 260, 120, 20) : ctx.rect(10, 10, 260, 120);
    ctx.fill();
    ctx.strokeStyle = emp.avatarColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Emoji
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(emp.emoji, 50, 65);

    // Name
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(emp.name.split(' ')[0], 90, 50);

    // Role
    ctx.font = '16px monospace';
    ctx.fillStyle = emp.avatarColor;
    ctx.fillText(emp.role.split(' (')[0], 90, 75);

    // Vote status badge
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = emp.vote === 'BUY' ? '#34d399' : emp.vote === 'VETO' ? '#f43f5e' : '#fbbf24';
    ctx.fillText(`VOTE: ${emp.vote} (${emp.targetSymbol})`, 90, 105);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(28, 14, 1);
    return sprite;
  };

  // Generate Glow Billboard Sprite
  const createGlowSprite = (colorStr: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Sprite();

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, colorStr);
    grad.addColorStop(0.5, colorStr.replace(')', ', 0.4)').replace('rgb', 'rgba'));
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(32, 32, 1);
    return sprite;
  };

  // Trigger Autonomous AI Core Decision Cycle
  const triggerDecisionCycle = useCallback(() => {
    setDecisionActive(true);
    setCycleStepMsg('⚡ 1/3: Mengumpulkan Vote & Tesis dari Seluruh Karyawan AI...');

    // Choose target with highest combined weight
    const targetScores: Record<string, number> = {};
    FIRM_AI_EMPLOYEES.forEach((emp) => {
      if (emp.vote === 'BUY') {
        targetScores[emp.targetSymbol] = (targetScores[emp.targetSymbol] || 0) + emp.weight * 100;
      }
    });

    let bestTarget = 'BREN';
    let bestScore = 0;
    Object.entries(targetScores).forEach(([sym, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestTarget = sym;
      }
    });

    setTimeout(() => {
      setCycleStepMsg(`🧠 2/3: Core Menghitung Konsensus: ${Math.round(bestScore + 15)}% Approval!`);
      setConsensusPct(Math.min(98, Math.round(bestScore + 15)));
    }, 1200);

    setTimeout(() => {
      setDecisionTarget(bestTarget);
      setCycleStepMsg(`🚀 3/3: KEPUTUSAN SAH: MENEMBAKKAN LASER EKSEKUSI BUY KE $${bestTarget}!`);

      // Fire shockwave ring animation
      if (coreShockwaveRingRef.current) {
        coreShockwaveRingRef.current.scale.set(1, 1, 1);
        coreShockwaveRingRef.current.visible = true;
      }

      // Smooth pan camera towards the chosen stock
      const targetNode = nodes3DRef.current.find((n) => n.id === bestTarget);
      if (targetNode && controlsRef.current) {
        controlsRef.current.target.set(targetNode.x, targetNode.y, targetNode.z);
      }
    }, 2400);

    setTimeout(() => {
      setDecisionActive(false);
    }, 8000);
  }, []);

  // Initialize Scene, Camera, Renderer, Starfield, Central Core, and Lights
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060911, 0.0016);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 3500);
    camera.position.set(0, 110, 480);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.9;
    controls.maxDistance = 1200;
    controls.minDistance = 70;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Central Core Pointlight (Glowing energy at 0,0,0)
    const corePointLight = new THREE.PointLight(0x06b6d4, 4.0, 600);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    const cornerLight1 = new THREE.PointLight(0x10b981, 2.0, 700);
    cornerLight1.position.set(250, 200, 150);
    scene.add(cornerLight1);

    const cornerLight2 = new THREE.PointLight(0xa855f7, 2.0, 700);
    cornerLight2.position.set(-250, -150, -150);
    scene.add(cornerLight2);

    // 6. 🧠 THE CENTRAL QUANT DECISION CORE AT (0,0,0)
    const coreGeo = new THREE.IcosahedronGeometry(22, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x10b981,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0, 0);
    coreMesh.userData = { isCore: true };
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Core Outer Gimbal Ring 1
    const gimbal1Geo = new THREE.TorusGeometry(34, 1.2, 16, 64);
    const gimbal1Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.7,
      metalness: 0.9,
    });
    const gimbalRing1 = new THREE.Mesh(gimbal1Geo, gimbal1Mat);
    scene.add(gimbalRing1);
    coreGimbalRing1Ref.current = gimbalRing1;

    // Core Outer Gimbal Ring 2
    const gimbal2Geo = new THREE.TorusGeometry(42, 0.9, 16, 64);
    const gimbal2Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x34d399,
      emissiveIntensity: 0.6,
      metalness: 0.9,
    });
    const gimbalRing2 = new THREE.Mesh(gimbal2Geo, gimbal2Mat);
    gimbalRing2.rotation.x = Math.PI / 2;
    scene.add(gimbalRing2);
    coreGimbalRing2Ref.current = gimbalRing2;

    // Core Shockwave Ring (Expands on decision strike)
    const shockwaveGeo = new THREE.RingGeometry(20, 24, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const shockwaveRing = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveRing.rotation.x = Math.PI / 2;
    shockwaveRing.visible = false;
    scene.add(shockwaveRing);
    coreShockwaveRingRef.current = shockwaveRing;

    // Core Billboard Label
    const coreSprite = createTextSprite('🧠 QUANT AI CORE', 'NEXUS KEPUTUSAN BELI', '#38bdf8');
    coreSprite.position.set(0, 48, 0);
    coreSprite.scale.set(34, 17, 1);
    scene.add(coreSprite);
    coreTextSpriteRef.current = coreSprite;

    // 7. Decision Buy Beam (Line from 0,0,0 to Target Node)
    const beamGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
    const beamMat = new THREE.LineBasicMaterial({
      color: 0x34d399,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const beamLine = new THREE.Line(beamGeo, beamMat);
    scene.add(beamLine);
    coreBeamRef.current = beamLine;

    // 8. Starfield Nebula
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 2200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Resize Handler
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqAnimationRef.current) cancelAnimationFrame(reqAnimationRef.current);
      controls.dispose();
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Build 3D Employees in Inner Orbit (Radius ~130) and Market Nodes in Outer Orbit (Radius ~280-380)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean existing
    nodes3DRef.current.forEach((n) => {
      if (n.mesh) scene.remove(n.mesh);
      if (n.glowMesh) scene.remove(n.glowMesh);
      if (n.holdingRing) scene.remove(n.holdingRing);
      if (n.labelSprite) scene.remove(n.labelSprite);
    });
    edges3DRef.current.forEach((e) => {
      if (e.lineMesh) scene.remove(e.lineMesh);
    });
    employees3DRef.current.forEach((emp) => {
      if (emp.mesh) scene.remove(emp.mesh);
      if (emp.labelSprite) scene.remove(emp.labelSprite);
      if (emp.beamLine) scene.remove(emp.beamLine);
    });

    // 1. BUILD AI EMPLOYEES (INNER SPHERICAL RING R = 125)
    const empCount = FIRM_AI_EMPLOYEES.length;
    const simEmployees: Employee3D[] = FIRM_AI_EMPLOYEES.map((emp, i) => {
      const angle = (i / empCount) * Math.PI * 2;
      const elevation = (i % 2 === 0 ? 1 : -1) * 35;
      const radius = 125;
      const x = Math.cos(angle) * radius;
      const y = elevation;
      const z = Math.sin(angle) * radius;

      // Employee 3D Sphere Pod
      const empGeo = new THREE.SphereGeometry(9, 24, 24);
      const empMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(emp.avatarColor),
        emissive: new THREE.Color(emp.avatarColor),
        emissiveIntensity: 0.6,
        metalness: 0.85,
        roughness: 0.2,
      });
      const empMesh = new THREE.Mesh(empGeo, empMat);
      empMesh.position.set(x, y, z);
      empMesh.userData = { isEmployee: true, employeeData: emp };
      scene.add(empMesh);

      // Employee Label Billboard Sprite
      const empSprite = createEmployeeSprite(emp);
      empSprite.position.set(x, y + 16, z);
      scene.add(empSprite);

      // Synaptic Beam to Central Core (0,0,0)
      const synapGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(0, 0, 0),
      ]);
      const synapMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(emp.avatarColor),
        transparent: true,
        opacity: 0.45,
      });
      const synapLine = new THREE.Line(synapGeo, synapMat);
      scene.add(synapLine);

      return {
        ...emp,
        x,
        y,
        z,
        mesh: empMesh,
        labelSprite: empSprite,
        beamLine: synapLine,
      };
    });
    employees3DRef.current = simEmployees;

    // 2. BUILD MARKET ASSET NODES (OUTER SPHERICAL SHELL R = 270 - 360)
    const rawNodes = preset.nodes;
    const rawEdges = preset.edges;

    const simNodes: Node3D[] = rawNodes.map((n, idx) => {
      const angle = (idx / rawNodes.length) * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const dist = 270 + Math.random() * 85;

      const x = Math.sqrt(1 - u * u) * Math.cos(angle) * dist;
      const y = u * (dist * 0.7);
      const z = Math.sqrt(1 - u * u) * Math.sin(angle) * dist;

      let radius = 11;
      if (sizeMetric === 'marketCap' && n.marketCap > 0) {
        radius = Math.min(Math.max(Math.log10(n.marketCap) * 0.95, 8), 21);
      } else if (sizeMetric === 'volume' && n.volume24h > 0) {
        radius = Math.min(Math.max(Math.log10(n.volume24h) * 0.9, 7), 19);
      } else {
        radius = 8 + n.degree * 1.6;
      }

      const clusterInfo = preset.clusters.find((c) => c.id === n.cluster) || { color: '#06b6d4' };
      const nodeColor = new THREE.Color(clusterInfo.color);

      // Sphere Mesh
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: nodeColor,
        roughness: 0.25,
        metalness: 0.8,
        emissive: nodeColor,
        emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { id: n.id, nodeData: n, isStock: true };
      scene.add(mesh);

      // Glow Sprite Halo
      const glowSprite = createGlowSprite(clusterInfo.color);
      glowSprite.position.set(x, y, z);
      glowSprite.scale.set(radius * 3.2, radius * 3.2, 1);
      scene.add(glowSprite);

      // User Holding Gold Torus Orbit Ring
      let holdingRing: THREE.Mesh | undefined;
      const isOwned = userHoldingsMap.has(n.label.toUpperCase());
      if (isOwned) {
        const ringGeo = new THREE.TorusGeometry(radius * 1.5, 0.9, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xfbbf24,
          emissiveIntensity: 0.9,
          metalness: 0.9,
          roughness: 0.1,
        });
        holdingRing = new THREE.Mesh(ringGeo, ringMat);
        holdingRing.position.set(x, y, z);
        holdingRing.rotation.x = Math.PI / 3;
        scene.add(holdingRing);
      }

      // Billboard Text Label
      const priceStr = n.isCrypto ? `$${n.basePrice}` : `Rp ${n.basePrice.toLocaleString('id-ID')}`;
      const labelSprite = createTextSprite(n.label, priceStr, clusterInfo.color);
      labelSprite.position.set(x, y + radius + 11, z);
      scene.add(labelSprite);

      return {
        ...n,
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        vz: (Math.random() - 0.5) * 0.1,
        radius,
        mesh,
        glowMesh: glowSprite,
        holdingRing,
        labelSprite,
      };
    });

    const nodeMap = new Map<string, Node3D>();
    simNodes.forEach((n) => nodeMap.set(n.id, n));

    // Build 3D Edges between market nodes
    const simEdges: Edge3D[] = rawEdges
      .map((e) => {
        const sourceNode = nodeMap.get(e.source)!;
        const targetNode = nodeMap.get(e.target)!;
        if (!sourceNode || !targetNode) return null as any;

        const points = [
          new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
          new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.22,
        });
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        scene.add(lineMesh);

        return { ...e, sourceNode, targetNode, lineMesh };
      })
      .filter(Boolean);

    nodes3DRef.current = simNodes;
    edges3DRef.current = simEdges;
  }, [preset, sizeMetric, userHoldingsMap]);

  // Main 3D Animation Loop
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !renderer || !controls) return;

    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;

      const now = Date.now();

      // 1. Animate Central Core and Gimbals
      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.y += 0.012;
        coreMeshRef.current.rotation.x += 0.007;
        const pulse = 1 + Math.sin(now / 250) * 0.06;
        coreMeshRef.current.scale.set(pulse, pulse, pulse);
      }
      if (coreGimbalRing1Ref.current) {
        coreGimbalRing1Ref.current.rotation.x += 0.018;
        coreGimbalRing1Ref.current.rotation.y += 0.012;
      }
      if (coreGimbalRing2Ref.current) {
        coreGimbalRing2Ref.current.rotation.z += 0.015;
        coreGimbalRing2Ref.current.rotation.x -= 0.01;
      }

      // 2. Animate Core Shockwave Expansion
      if (coreShockwaveRingRef.current && coreShockwaveRingRef.current.visible) {
        const sc = coreShockwaveRingRef.current.scale.x + 0.08;
        coreShockwaveRingRef.current.scale.set(sc, sc, sc);
        if (sc > 5.5) {
          coreShockwaveRingRef.current.visible = false;
        }
      }

      // 3. Update Decision Laser Beam from Core (0,0,0) to Decision Target Node
      if (coreBeamRef.current) {
        const target = nodes3DRef.current.find((n) => n.id === decisionTarget);
        if (target) {
          const positions = coreBeamRef.current.geometry.attributes.position as THREE.BufferAttribute;
          if (positions) {
            positions.setXYZ(0, 0, 0, 0);
            positions.setXYZ(1, target.x, target.y, target.z);
            positions.needsUpdate = true;
          }
          coreBeamRef.current.visible = true;
        } else {
          coreBeamRef.current.visible = false;
        }
      }

      // 4. Animate Synaptic Beams from Employees to Core
      employees3DRef.current.forEach((emp, i) => {
        if (emp.beamLine) {
          const mat = emp.beamLine.material as THREE.LineBasicMaterial;
          if (mat) {
            mat.opacity = 0.35 + Math.sin(now / 200 + i) * 0.25;
          }
        }
      });

      // 5. Physics on Market Nodes
      if (physicsActive) {
        const nodes = nodes3DRef.current;
        const edges = edges3DRef.current;
        const kRepulsion = 1100;
        const kSpring = 0.035;
        const restDist = 130;
        const damping = 0.9;

        // Repulsion
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dz = n2.z - n1.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

            if (dist < 300) {
              const force = kRepulsion / (dist * dist);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              const fz = (dz / dist) * force;

              n1.vx -= fx;
              n1.vy -= fy;
              n1.vz -= fz;
              n2.vx += fx;
              n2.vy += fy;
              n2.vz += fz;
            }
          }
        }

        // Springs
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          const dx = e.targetNode.x - e.sourceNode.x;
          const dy = e.targetNode.y - e.sourceNode.y;
          const dz = e.targetNode.z - e.sourceNode.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

          const force = (dist - restDist) * kSpring;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          const fz = (dz / dist) * force;

          e.sourceNode.vx += fx;
          e.sourceNode.vy += fy;
          e.sourceNode.vz += fz;
          e.targetNode.vx -= fx;
          e.targetNode.vy -= fy;
          e.targetNode.vz -= fz;
        }

        // Keep Market Nodes on Outer Orbit ~310 distance from 0,0,0
        nodes.forEach((n) => {
          const curDist = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1;
          const radialDelta = 310 - curDist;
          n.vx += (n.x / curDist) * radialDelta * 0.002;
          n.vy += (n.y / curDist) * radialDelta * 0.002;
          n.vz += (n.z / curDist) * radialDelta * 0.002;

          n.vx *= damping;
          n.vy *= damping;
          n.vz *= damping;

          n.x += n.vx;
          n.y += n.vy;
          n.z += n.vz;

          if (n.mesh) n.mesh.position.set(n.x, n.y, n.z);
          if (n.glowMesh) n.glowMesh.position.set(n.x, n.y, n.z);
          if (n.holdingRing) {
            n.holdingRing.position.set(n.x, n.y, n.z);
            n.holdingRing.rotation.z += 0.015;
          }
          if (n.labelSprite) n.labelSprite.position.set(n.x, n.y + n.radius + 11, n.z);
        });

        // Update Edge Lines
        edges.forEach((e) => {
          if (e.lineMesh) {
            const positions = e.lineMesh.geometry.attributes.position as THREE.BufferAttribute;
            if (positions) {
              positions.setXYZ(0, e.sourceNode.x, e.sourceNode.y, e.sourceNode.z);
              positions.setXYZ(1, e.targetNode.x, e.targetNode.y, e.targetNode.z);
              positions.needsUpdate = true;
            }
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
      reqAnimationRef.current = requestAnimationFrame(animate);
    };

    reqAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (reqAnimationRef.current) cancelAnimationFrame(reqAnimationRef.current);
    };
  }, [physicsActive, decisionTarget]);

  // Raycasting for Clicks on Core, Employees, and Market Nodes
  useEffect(() => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!mount || !camera || !scene) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check Core hit
      if (coreMeshRef.current) {
        const coreHits = raycaster.intersectObject(coreMeshRef.current);
        if (coreHits.length > 0) {
          if (onSelectCore) onSelectCore({ consensusPct, currentTarget: decisionTarget });
          if (onSelectEmployee) onSelectEmployee(null);
          onSelectNode(null);
          if (controlsRef.current) controlsRef.current.target.set(0, 0, 0);
          return;
        }
      }

      // Check Employee hit
      const empMeshes = employees3DRef.current.map((emp) => emp.mesh!).filter(Boolean);
      const empHits = raycaster.intersectObjects(empMeshes);
      if (empHits.length > 0) {
        const hit = empHits[0].object as THREE.Mesh;
        const emp = hit.userData?.employeeData;
        if (emp) {
          if (onSelectEmployee) onSelectEmployee(emp);
          if (onSelectCore) onSelectCore(null);
          onSelectNode(null);
          if (controlsRef.current) controlsRef.current.target.set(hit.position.x, hit.position.y, hit.position.z);
          return;
        }
      }

      // Check Market Stock hit
      const stockMeshes = nodes3DRef.current.map((n) => n.mesh!).filter(Boolean);
      const stockHits = raycaster.intersectObjects(stockMeshes);
      if (stockHits.length > 0) {
        const hit = stockHits[0].object as THREE.Mesh;
        const stock = hit.userData?.nodeData;
        if (stock) {
          onSelectNode(stock);
          if (onSelectEmployee) onSelectEmployee(null);
          if (onSelectCore) onSelectCore(null);
          if (controlsRef.current) controlsRef.current.target.set(hit.position.x, hit.position.y, hit.position.z);
          return;
        }
      }

      // Click on void
      onSelectNode(null);
      if (onSelectEmployee) onSelectEmployee(null);
      if (onSelectCore) onSelectCore(null);
    };

    mount.addEventListener('click', handleClick);
    return () => {
      mount.removeEventListener('click', handleClick);
    };
  }, [onSelectNode, onSelectEmployee, onSelectCore, consensusPct, decisionTarget]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP AI DECISION NEXUS HUD BANNER */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 glass-panel px-4 py-2 rounded-2xl border border-emerald-500/30 shadow-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/25">
          🧠
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs text-white uppercase tracking-wider">AI DECISION NEXUS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              KONSENSUS: {consensusPct}%
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
              TARGET: ${decisionTarget}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 mt-0.5">{cycleStepMsg}</p>
        </div>

        <button
          onClick={triggerDecisionCycle}
          disabled={decisionActive}
          className="ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>{decisionActive ? 'Memproses...' : 'Jalankan Siklus Beli'}</span>
        </button>
      </div>

      {/* 3D CONTROLS (TOP RIGHT) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate((r) => !r)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 shadow-xl ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {autoRotate ? 'Orbit: On' : 'Orbit: Paused'}
        </button>

        <button
          onClick={() => {
            if (controlsRef.current && cameraRef.current) {
              controlsRef.current.reset();
              cameraRef.current.position.set(0, 110, 480);
              controlsRef.current.target.set(0, 0, 0);
            }
          }}
          className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 text-xs backdrop-blur-md transition shadow-xl"
          title="Fokuskan Kembali ke Central Core (0,0,0)"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* BOTTOM LEGEND GUIDE */}
      <div className="absolute bottom-4 right-4 z-10 px-3 py-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 shadow-2xl hidden md:flex items-center gap-3">
        <span><b className="text-cyan-400">Pusat (0,0,0):</b> Quant AI Core</span>
        <span>•</span>
        <span><b className="text-emerald-400">Orbit Dalam:</b> 6 Karyawan AI</span>
        <span>•</span>
        <span><b className="text-slate-200">Orbit Luar:</b> Saham Bursa & Kripto</span>
        <span>•</span>
        <span><b className="text-emerald-300">Laser Hijau:</b> Sinyal Eksekusi Beli</span>
      </div>
    </div>
  );
}
