'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  NetworkNode,
  NetworkEdge,
  NetworkCluster,
  NetworkPresetData,
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

interface MarketGraph3DProps {
  preset: NetworkPresetData;
  sizeMetric: 'marketCap' | 'volume' | 'connections';
  searchQuery: string;
  focusedNodeId: string | null;
  selectedNodeId: string | null;
  onSelectNode: (node: NetworkNode | null) => void;
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
  onFocusNode,
  userHoldingsMap,
  physicsActive,
}: MarketGraph3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<Node3D | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const nodes3DRef = useRef<Node3D[]>([]);
  const edges3DRef = useRef<Edge3D[]>([]);
  const pulserParticlesRef = useRef<THREE.Points | null>(null);
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
    ctx.fillStyle = 'rgba(10, 15, 26, 0.75)';
    ctx.roundRect ? ctx.roundRect(28, 20, 200, 88, 20) : ctx.rect(28, 20, 200, 88);
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

  // Initialize Scene, Camera, Renderer, Starfield, and Lights
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060911, 0.0018);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 3000);
    camera.position.set(0, 80, 420);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.9;
    controls.maxDistance = 900;
    controls.minDistance = 60;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.7;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 2.5, 800);
    pointLight1.position.set(200, 200, 150);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 2.5, 800);
    pointLight2.position.set(-200, -150, -100);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xa855f7, 2.0, 800);
    pointLight3.position.set(0, 250, -200);
    scene.add(pointLight3);

    // 6. Starfield Nebula Particles (Background Atmosphere)
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x34d399),
      new THREE.Color(0xa78bfa),
      new THREE.Color(0xfcd34d),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 600 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

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

  // Build and Populate 3D Graph Nodes & Edges from Preset
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean existing 3D nodes & edges
    nodes3DRef.current.forEach((n) => {
      if (n.mesh) scene.remove(n.mesh);
      if (n.glowMesh) scene.remove(n.glowMesh);
      if (n.holdingRing) scene.remove(n.holdingRing);
      if (n.labelSprite) scene.remove(n.labelSprite);
    });
    edges3DRef.current.forEach((e) => {
      if (e.lineMesh) scene.remove(e.lineMesh);
    });

    const rawNodes = preset.nodes;
    const rawEdges = preset.edges;

    // Create 3D Nodes
    const simNodes: Node3D[] = rawNodes.map((n, idx) => {
      const angle = (idx / rawNodes.length) * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const dist = 140 + Math.random() * 90;

      const x = Math.sqrt(1 - u * u) * Math.cos(angle) * dist;
      const y = u * (dist * 0.7);
      const z = Math.sqrt(1 - u * u) * Math.sin(angle) * dist;

      // Calculate radius
      let radius = 10;
      if (sizeMetric === 'marketCap' && n.marketCap > 0) {
        radius = Math.min(Math.max(Math.log10(n.marketCap) * 0.9, 8), 19);
      } else if (sizeMetric === 'volume' && n.volume24h > 0) {
        radius = Math.min(Math.max(Math.log10(n.volume24h) * 0.85, 7), 18);
      } else {
        radius = 7 + n.degree * 1.6;
      }

      const clusterInfo = preset.clusters.find((c) => c.id === n.cluster) || {
        color: '#06b6d4',
      };
      const nodeColor = new THREE.Color(clusterInfo.color);

      // 1. Sphere Mesh
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: nodeColor,
        roughness: 0.25,
        metalness: 0.75,
        emissive: nodeColor,
        emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { id: n.id, nodeData: n };
      scene.add(mesh);

      // 2. Glow Sprite Halo
      const glowSprite = createGlowSprite(clusterInfo.color);
      glowSprite.position.set(x, y, z);
      glowSprite.scale.set(radius * 3.2, radius * 3.2, 1);
      scene.add(glowSprite);

      // 3. User Holding Gold Orbit Ring (if owned)
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

      // 4. Billboard Text Label
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

    // Create 3D Edges
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
          linewidth: 1.5,
        });
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        scene.add(lineMesh);

        return {
          ...e,
          sourceNode,
          targetNode,
          lineMesh,
        };
      })
      .filter(Boolean);

    nodes3DRef.current = simNodes;
    edges3DRef.current = simEdges;
  }, [preset, sizeMetric, userHoldingsMap]);

  // Main 3D Animation & Physics Loop
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !renderer || !controls) return;

    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;

      const nodes = nodes3DRef.current;
      const edges = edges3DRef.current;

      // 3D Force-directed Physics
      if (physicsActive) {
        const kRepulsion = 1200;
        const kSpring = 0.038;
        const restDist = 120;
        const damping = 0.9;

        // 1. Repulsion between 3D nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dz = n2.z - n1.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

            if (dist < 320) {
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

        // 2. Spring tension along 3D edges
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

        // 3. Central gravity and apply velocities
        nodes.forEach((n) => {
          n.vx += (0 - n.x) * 0.0028;
          n.vy += (0 - n.y) * 0.0028;
          n.vz += (0 - n.z) * 0.0028;

          n.vx *= damping;
          n.vy *= damping;
          n.vz *= damping;

          n.x += n.vx;
          n.y += n.vy;
          n.z += n.vz;

          // Update Three.js Object Positions
          if (n.mesh) n.mesh.position.set(n.x, n.y, n.z);
          if (n.glowMesh) n.glowMesh.position.set(n.x, n.y, n.z);
          if (n.holdingRing) {
            n.holdingRing.position.set(n.x, n.y, n.z);
            n.holdingRing.rotation.z += 0.015; // Slow rotation of gold ring!
          }
          if (n.labelSprite) n.labelSprite.position.set(n.x, n.y + n.radius + 11, n.z);
        });

        // Update Edge Geometry Lines in 3D
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

      // OrbitControls update
      controls.update();

      // Render 3D Scene
      renderer.render(scene, camera);
      reqAnimationRef.current = requestAnimationFrame(animate);
    };

    reqAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (reqAnimationRef.current) cancelAnimationFrame(reqAnimationRef.current);
    };
  }, [physicsActive]);

  // Raycasting for 3D Click & Hover Interactions
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
      const meshes = nodes3DRef.current.map((n) => n.mesh!).filter(Boolean);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const nodeId = hit.userData?.id;
        const node = nodes3DRef.current.find((n) => n.id === nodeId);
        if (node) {
          onSelectNode(node);

          // Smoothly fly camera closer to the node
          if (controlsRef.current) {
            controlsRef.current.target.set(node.x, node.y, node.z);
          }
        }
      } else {
        onSelectNode(null);
      }
    };

    const handleDblClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = nodes3DRef.current.map((n) => n.mesh!).filter(Boolean);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const nodeId = hit.userData?.id;
        onFocusNode(nodeId);
      } else {
        onFocusNode(null);
      }
    };

    mount.addEventListener('click', handleClick);
    mount.addEventListener('dblclick', handleDblClick);

    return () => {
      mount.removeEventListener('click', handleClick);
      mount.removeEventListener('dblclick', handleDblClick);
    };
  }, [onSelectNode, onFocusNode]);

  // Handle Focus & Highlight effects on 3D meshes
  useEffect(() => {
    const nodes = nodes3DRef.current;
    const edges = edges3DRef.current;

    const neighborIds = new Set<string>();
    if (focusedNodeId) {
      neighborIds.add(focusedNodeId);
      edges.forEach((e) => {
        if (e.source === focusedNodeId) neighborIds.add(e.target);
        if (e.target === focusedNodeId) neighborIds.add(e.source);
      });
    }

    nodes.forEach((n) => {
      const isDimmed = focusedNodeId && !neighborIds.has(n.id);
      const isSelected = selectedNodeId === n.id;
      const isMatch =
        searchQuery.trim() === '' ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (n.mesh) {
        const mat = n.mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.opacity = isDimmed || !isMatch ? 0.15 : 1.0;
          mat.transparent = isDimmed || !isMatch;
          mat.emissiveIntensity = isSelected ? 1.2 : 0.35;
        }
      }
      if (n.glowMesh) {
        n.glowMesh.visible = !isDimmed && isMatch;
      }
      if (n.labelSprite) {
        n.labelSprite.visible = !isDimmed && isMatch;
      }
    });

    edges.forEach((e) => {
      if (e.lineMesh) {
        const isDimmed = focusedNodeId && (!neighborIds.has(e.source) || !neighborIds.has(e.target));
        const isHighlighted = selectedNodeId === e.source || selectedNodeId === e.target;
        const mat = e.lineMesh.material as THREE.LineBasicMaterial;
        if (mat) {
          mat.opacity = isDimmed ? 0.03 : isHighlighted ? 0.9 : 0.22;
          mat.color.set(isHighlighted ? 0x10b981 : 0xffffff);
        }
      }
    });
  }, [focusedNodeId, selectedNodeId, searchQuery]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D HUD Floating Controls (Top Right) */}
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
          {autoRotate ? 'Orbit Otomatis: On' : 'Orbit Otomatis: Paused'}
        </button>

        <button
          onClick={() => {
            if (controlsRef.current && cameraRef.current) {
              controlsRef.current.reset();
              cameraRef.current.position.set(0, 80, 420);
            }
          }}
          className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 text-xs backdrop-blur-md transition shadow-xl"
          title="Reset Sudut Pandang Kamera 3D"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      {/* 3D Navigation Guide Tip (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 px-3 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 shadow-2xl hidden sm:flex items-center gap-3">
        <span><b class="text-slate-200">Klik Kiri + Drag:</b> Rotasi 3D Orbit</span>
        <span>•</span>
        <span><b class="text-slate-200">Klik Kanan + Drag:</b> Pan Geser</span>
        <span>•</span>
        <span><b class="text-slate-200">Scroll:</b> Zoom In/Out</span>
      </div>
    </div>
  );
}
