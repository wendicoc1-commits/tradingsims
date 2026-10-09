'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import {
  Brain,
  Zap,
  Activity,
  Maximize2,
  Sliders,
  ShieldAlert,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import { FIRM_AGENTS } from '@/lib/hedgefund/firmRoster';
import { UNIVERSE_TICKERS } from '@/lib/hedgefund/autonomousStockPicker';

export type TopologyMode = 'MLP_SLAB' | 'BRAIN_CONSTELLATION' | 'TRANSFORMER_RING';
export type InferenceState = 'IDLE' | 'FORWARD_PASS' | 'ATTENTION_PEAK' | 'BACKPROP' | 'ERROR';

export interface SynapseNeuron {
  id: string;
  name: string;
  layer: number; // 0 to 4
  type: 'INPUT' | 'ENCODER' | 'MOE_CORE' | 'EXPERT' | 'GATE' | 'OUTPUT';
  subsystem: 'SENTIMENT' | 'VOLATILITY' | 'ORDERBOOK' | 'EXECUTION' | 'RISK';
  activation: number; // 0.0 to 1.0
  bias: number;
  mlpPos: [number, number, number];
  brainPos: [number, number, number];
  ringPos: [number, number, number];
  color: THREE.Color;
  dimensions?: string;
  sub?: string;
}

export interface SynapseConnection {
  sourceIdx: number;
  targetIdx: number;
  weight: number; // -1.0 to 1.0
  activity: number;
}

interface ThreeJsSynapticBrainCanvasProps {
  onSelectNeuron?: (neuron: SynapseNeuron | null) => void;
  onOpenWarRoom?: (agentId: string) => void;
  speedFactor?: number;
}

export default function ThreeJsSynapticBrainCanvas({
  onSelectNeuron,
  onOpenWarRoom,
  speedFactor = 1.0,
}: ThreeJsSynapticBrainCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active View Settings
  const [topology, setTopology] = useState<TopologyMode>('MLP_SLAB');
  const [inferenceState, setInferenceState] = useState<InferenceState>('FORWARD_PASS');
  const [selectedNeuronId, setSelectedNeuronId] = useState<string>('core');
  const [hoveredNeuronId, setHoveredNeuronId] = useState<string | null>(null);
  const [isTrackingPath, setIsTrackingPath] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fps, setFps] = useState(60);

  // Telemetry metrics
  const [latencyMs, setLatencyMs] = useState(18.4);
  const [entropy, setEntropy] = useState(0.412);
  const [sparsityPct, setSparsityPct] = useState(74.2);
  const [activeDecision, setActiveDecision] = useState<'BUY' | 'HOLD' | 'SELL' | 'VETO'>('BUY');

  // ── 1. GENERATE NEURONS (80+ Specialized Nodes Across 5 Layers) ──
  const { neurons, synapses } = useMemo(() => {
    const nList: SynapseNeuron[] = [];
    const sList: SynapseConnection[] = [];

    // Helper for fibonacci sphere distribution
    const getFibSphere = (i: number, total: number, radius: number): [number, number, number] => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      return [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ];
    };

    // Helper for circular ring position
    const getRingPos = (i: number, total: number, radius: number, yOffset: number): [number, number, number] => {
      const angle = (i / total) * Math.PI * 2;
      return [Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius];
    };

    // ── LAYER 0: INPUT NODES (Market Universe Assets) ──
    const tickers = UNIVERSE_TICKERS.slice(0, 32);
    tickers.forEach((sym, idx) => {
      const count = tickers.length;
      const yOffset = (idx - count / 2) * 1.8;
      const arcZ = Math.cos((idx / count - 0.5) * Math.PI) * 6.0;

      const isCrypto = ['BTC', 'ETH', 'SOL', 'ARB', 'OP', 'BNB', 'SUI'].includes(sym);
      const col = isCrypto ? new THREE.Color('#38bdf8') : new THREE.Color('#22c55e');

      nList.push({
        id: sym,
        name: `${sym} Market Feed`,
        layer: 0,
        type: 'INPUT',
        subsystem: isCrypto ? 'VOLATILITY' : 'ORDERBOOK',
        activation: 0.75 + Math.random() * 0.25,
        bias: (Math.random() - 0.5) * 0.2,
        mlpPos: [-36, yOffset, arcZ],
        brainPos: getFibSphere(idx, count, 18),
        ringPos: getRingPos(idx, count, 28, -6),
        color: col,
        dimensions: '[Batch, 128, 4]',
        sub: isCrypto ? 'Binance L1/L2 WebSocket' : 'BEI IDX Tick Stream',
      });
    });

    // ── LAYER 1: 3D FEATURE ENCODER TENSORS ──
    const encoders = [
      { id: 'enc_conv1d', name: 'Conv1D Micro-Momentum', dim: '[32x128]', col: '#06b6d4' },
      { id: 'enc_bilstm', name: 'Bi-LSTM Volatility Memory', dim: '[64x64]', col: '#a855f7' },
      { id: 'enc_mha', name: 'MultiHeadAttention Matrix', dim: '[8H, D128]', col: '#10b981' },
      { id: 'enc_vae', name: 'Autoencoder Latent Space', dim: '[Latent 16]', col: '#f59e0b' },
    ];
    encoders.forEach((enc, idx) => {
      const yOffset = (idx - 1.5) * 6.5;
      nList.push({
        id: enc.id,
        name: enc.name,
        layer: 1,
        type: 'ENCODER',
        subsystem: 'VOLATILITY',
        activation: 0.88,
        bias: 0.05,
        mlpPos: [-18, yOffset, (Math.random() - 0.5) * 3],
        brainPos: getFibSphere(idx + 32, 48, 12),
        ringPos: getRingPos(idx, encoders.length, 16, 4),
        color: new THREE.Color(enc.col),
        dimensions: enc.dim,
        sub: '3D Feature Tensor Extractor',
      });
    });

    // ── LAYER 2: MoE CONSENSUS CORE & 12 C-LEVEL EXPERTS ──
    // Center MoE Core
    const coreIdx = nList.length;
    nList.push({
      id: 'core',
      name: 'FINCEPT ALPHA BRAIN (MoE Nexus)',
      layer: 2,
      type: 'MOE_CORE',
      subsystem: 'EXECUTION',
      activation: 0.98,
      bias: 0.0,
      mlpPos: [2, 0, 0],
      brainPos: [0, 0, 0],
      ringPos: [0, 0, 0],
      color: new THREE.Color('#f59e0b'),
      dimensions: '[MoE D512]',
      sub: 'Central Consensus & Decision Nexus',
    });

    // 12 Executive Agents
    FIRM_AGENTS.forEach((ag, idx) => {
      const angle = (idx / FIRM_AGENTS.length) * Math.PI * 2;
      const rMlp = 8.5;
      nList.push({
        id: ag.id,
        name: ag.name,
        layer: 2,
        type: 'EXPERT',
        subsystem: ag.role.includes('Risk') ? 'RISK' : ag.role.includes('Sentiment') ? 'SENTIMENT' : 'EXECUTION',
        activation: 0.82 + (idx % 3) * 0.06,
        bias: 0.02,
        mlpPos: [2 + Math.cos(angle) * rMlp, Math.sin(angle) * rMlp, Math.sin(angle * 2) * 4],
        brainPos: getFibSphere(idx + 36, 12, 7),
        ringPos: getRingPos(idx, FIRM_AGENTS.length, 8, 0),
        color: new THREE.Color(ag.color),
        dimensions: '[Weight 0.94]',
        sub: `${ag.title} · ${ag.role}`,
      });
    });

    // ── LAYER 3: RISK GATING BARRIERS ──
    const gates = [
      { id: 'gate_kelly', name: 'Kelly Criterion Position Sizer', col: '#10b981', dim: '[f* = 0.34]' },
      { id: 'gate_var', name: 'VaR 99% Max Drawdown Barrier', col: '#ef4444', dim: '[Max DD -2.5%]' },
    ];
    gates.forEach((gt, idx) => {
      nList.push({
        id: gt.id,
        name: gt.name,
        layer: 3,
        type: 'GATE',
        subsystem: 'RISK',
        activation: 0.94,
        bias: -0.1,
        mlpPos: [20, (idx - 0.5) * 7.5, (idx - 0.5) * 4],
        brainPos: [idx === 0 ? 9 : -9, 8, 4],
        ringPos: getRingPos(idx, 2, 18, -4),
        color: new THREE.Color(gt.col),
        dimensions: gt.dim,
        sub: 'Asymmetric Risk Management Filter',
      });
    });

    // ── LAYER 4: DECISION OUTPUT HEADS ──
    const outputs = [
      { id: 'out_buy', name: 'BUY ORDER (P: 0.942)', col: '#22c55e', dim: '[Prob 94.2%]' },
      { id: 'out_hold', name: 'HOLD POSITION (P: 0.041)', col: '#f59e0b', dim: '[Prob 4.1%]' },
      { id: 'out_sell', name: 'SELL / SHORT (P: 0.017)', col: '#ef4444', dim: '[Prob 1.7%]' },
      { id: 'out_vps', name: 'LINUX VPS DAEMON UPLINK', col: '#06b6d4', dim: '[24/7 Socket OK]' },
    ];
    outputs.forEach((out, idx) => {
      nList.push({
        id: out.id,
        name: out.name,
        layer: 4,
        type: 'OUTPUT',
        subsystem: 'EXECUTION',
        activation: idx === 0 ? 0.95 : 0.05,
        bias: 0.0,
        mlpPos: [36, (idx - 1.5) * 6.5, 0],
        brainPos: [20, (idx - 1.5) * 5, 0],
        ringPos: getRingPos(idx, outputs.length, 30, 6),
        color: new THREE.Color(out.col),
        dimensions: out.dim,
        sub: 'Terminal Action Potential Gateway',
      });
    });

    // ── 2. SYNAPSE CONNECTIONS ──
    // Connect Layer 0 (Input) -> Layer 1 (Encoders)
    const inputIndices = nList.map((n, i) => (n.layer === 0 ? i : -1)).filter((i) => i !== -1);
    const encoderIndices = nList.map((n, i) => (n.layer === 1 ? i : -1)).filter((i) => i !== -1);
    const expertIndices = nList.map((n, i) => (n.layer === 2 && n.id !== 'core' ? i : -1)).filter((i) => i !== -1);
    const gateIndices = nList.map((n, i) => (n.layer === 3 ? i : -1)).filter((i) => i !== -1);
    const outputIndices = nList.map((n, i) => (n.layer === 4 ? i : -1)).filter((i) => i !== -1);

    // L0 -> L1
    inputIndices.forEach((sIdx) => {
      encoderIndices.forEach((tIdx) => {
        if (Math.random() > 0.45) {
          sList.push({
            sourceIdx: sIdx,
            targetIdx: tIdx,
            weight: (Math.random() - 0.3) * 1.5,
            activity: Math.random(),
          });
        }
      });
    });

    // L1 -> Core & Experts
    encoderIndices.forEach((sIdx) => {
      sList.push({ sourceIdx: sIdx, targetIdx: coreIdx, weight: 1.2, activity: 0.95 });
      expertIndices.forEach((tIdx) => {
        if (Math.random() > 0.4) {
          sList.push({
            sourceIdx: sIdx,
            targetIdx: tIdx,
            weight: (Math.random() - 0.4) * 1.4,
            activity: Math.random(),
          });
        }
      });
    });

    // Experts -> Core
    expertIndices.forEach((sIdx) => {
      sList.push({ sourceIdx: sIdx, targetIdx: coreIdx, weight: 1.5, activity: 0.98 });
    });

    // Core -> Gates
    gateIndices.forEach((tIdx) => {
      sList.push({ sourceIdx: coreIdx, targetIdx: tIdx, weight: 1.4, activity: 0.95 });
    });

    // Gates -> Outputs
    gateIndices.forEach((sIdx) => {
      outputIndices.forEach((tIdx) => {
        sList.push({
          sourceIdx: sIdx,
          targetIdx: tIdx,
          weight: tIdx === outputIndices[0] ? 1.8 : -0.8,
          activity: 0.92,
        });
      });
    });

    return { neurons: nList, synapses: sList };
  }, []);

  const selectedNeuron = useMemo(
    () => neurons.find((n) => n.id === selectedNeuronId) || neurons[0],
    [neurons, selectedNeuronId]
  );

  // ── 3. THREE.JS ENGINE SETUP & SHADER PIPELINE ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 580;

    // A. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // B. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030509');
    scene.fog = new THREE.FogExp2('#030509', 0.008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 800);
    camera.position.set(0, 10, 68);

    // C. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5a0, 1.2);
    dirLight1.position.set(30, 40, 30);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-30, -30, -20);
    scene.add(dirLight2);

    // D. Starfield Dust (Volumetric Particles)
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 180;
      starPos[i + 1] = (Math.random() - 0.5) * 180;
      starPos[i + 2] = (Math.random() - 0.5) * 180;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.6,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // E. NEURON INSTANCED MESH
    const sphereGeo = new THREE.SphereGeometry(0.8, 20, 20);
    const sphereMat = new THREE.MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0.85,
      toneMapped: false,
    });

    const instancedNeurons = new THREE.InstancedMesh(sphereGeo, sphereMat, neurons.length);
    instancedNeurons.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedNeurons);

    // Initialize position buffers for smooth lerping
    const currentPositions = neurons.map((n) => new THREE.Vector3(...n.mlpPos));
    const dummy = new THREE.Object3D();

    neurons.forEach((n, idx) => {
      dummy.position.set(...n.mlpPos);
      const scale = n.type === 'MOE_CORE' ? 2.6 : n.type === 'OUTPUT' ? 1.6 : n.type === 'GATE' ? 1.4 : 1.0;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instancedNeurons.setMatrixAt(idx, dummy.matrix);
      instancedNeurons.setColorAt(idx, n.color);
    });
    if (instancedNeurons.instanceColor) instancedNeurons.instanceColor.needsUpdate = true;
    instancedNeurons.instanceMatrix.needsUpdate = true;

    // F. SYNAPSES (Custom Bézier Curve Lines via LineSegments & Parametric Shader)
    const segmentsPerLine = 18;
    const lineCount = synapses.length;
    const totalVertices = lineCount * segmentsPerLine * 2;

    const synGeo = new THREE.BufferGeometry();
    const synPos = new Float32Array(totalVertices * 3);
    const aArcProgress = new Float32Array(totalVertices);
    const aSourcePos = new Float32Array(totalVertices * 3);
    const aTargetPos = new Float32Array(totalVertices * 3);
    const aControlPoint = new Float32Array(totalVertices * 3);
    const aWeight = new Float32Array(totalVertices);

    let vIdx = 0;
    synapses.forEach((syn) => {
      const src = neurons[syn.sourceIdx];
      const tgt = neurons[syn.targetIdx];

      for (let s = 0; s < segmentsPerLine; s++) {
        const t0 = s / segmentsPerLine;
        const t1 = (s + 1) / segmentsPerLine;

        [t0, t1].forEach((t) => {
          aArcProgress[vIdx] = t;
          aWeight[vIdx] = syn.weight;

          // Placeholder initial points
          aSourcePos[vIdx * 3 + 0] = src.mlpPos[0];
          aSourcePos[vIdx * 3 + 1] = src.mlpPos[1];
          aSourcePos[vIdx * 3 + 2] = src.mlpPos[2];

          aTargetPos[vIdx * 3 + 0] = tgt.mlpPos[0];
          aTargetPos[vIdx * 3 + 1] = tgt.mlpPos[1];
          aTargetPos[vIdx * 3 + 2] = tgt.mlpPos[2];

          const mx = (src.mlpPos[0] + tgt.mlpPos[0]) * 0.5;
          const my = (src.mlpPos[1] + tgt.mlpPos[1]) * 0.5 + 2.5;
          const mz = (src.mlpPos[2] + tgt.mlpPos[2]) * 0.5 + 2.0;

          aControlPoint[vIdx * 3 + 0] = mx;
          aControlPoint[vIdx * 3 + 1] = my;
          aControlPoint[vIdx * 3 + 2] = mz;

          vIdx++;
        });
      }
    });

    synGeo.setAttribute('position', new THREE.BufferAttribute(synPos, 3));
    synGeo.setAttribute('aArcProgress', new THREE.BufferAttribute(aArcProgress, 1));
    synGeo.setAttribute('aSourcePos', new THREE.BufferAttribute(aSourcePos, 3));
    synGeo.setAttribute('aTargetPos', new THREE.BufferAttribute(aTargetPos, 3));
    synGeo.setAttribute('aControlPoint', new THREE.BufferAttribute(aControlPoint, 3));
    synGeo.setAttribute('aWeight', new THREE.BufferAttribute(aWeight, 1));

    const synUniforms = {
      uTime: { value: 0 },
      uSpeed: { value: 1.0 },
      uState: { value: 1 },
      uColorExcitatory: { value: new THREE.Color('#00f5a0') },
      uColorInhibitory: { value: new THREE.Color('#ff0055') },
      uColorBackprop: { value: new THREE.Color('#b537f2') },
      uColorQuiescent: { value: new THREE.Color('#10192d') },
    };

    const synMat = new THREE.ShaderMaterial({
      uniforms: synUniforms,
      vertexShader: `
        attribute float aArcProgress;
        attribute vec3 aSourcePos;
        attribute vec3 aTargetPos;
        attribute vec3 aControlPoint;
        attribute float aWeight;
        varying float vProgress;
        varying float vWeight;

        vec3 getBezier(vec3 p0, vec3 p1, vec3 p2, float t) {
          float it = 1.0 - t;
          return it * it * p0 + 2.0 * it * t * p1 + t * t * p2;
        }

        void main() {
          vProgress = aArcProgress;
          vWeight = aWeight;
          vec3 pos = getBezier(aSourcePos, aControlPoint, aTargetPos, aArcProgress);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform int uState;
        uniform vec3 uColorExcitatory;
        uniform vec3 uColorInhibitory;
        uniform vec3 uColorBackprop;
        uniform vec3 uColorQuiescent;

        varying float vProgress;
        varying float vWeight;

        void main() {
          vec3 baseColor = (vWeight >= 0.0) ? uColorExcitatory : uColorInhibitory;
          float absW = abs(vWeight);
          baseColor = mix(uColorQuiescent, baseColor, smoothstep(0.05, 0.45, absW));

          float pulse = 0.0;
          vec3 pulseColor = baseColor;

          if (uState == 1) { // Forward Pass (Cyan wave)
            float head = fract(uTime * uSpeed * 0.9);
            float dist = abs(vProgress - head);
            pulse = exp(-pow(dist / 0.06, 2.0)) * 2.8;
          } else if (uState == 3) { // Backprop (Magenta wave)
            float head = fract(1.0 - uTime * uSpeed * 1.3);
            float dist = abs(vProgress - head);
            pulse = exp(-pow(dist / 0.05, 2.0)) * 3.2;
            pulseColor = uColorBackprop;
          } else { // Idle
            pulse = (0.5 + 0.5 * sin(uTime * 2.0 + vProgress * 6.0)) * 0.3 * absW;
          }

          vec3 finalRGB = baseColor + pulseColor * pulse;
          gl_FragColor = vec4(finalRGB, clamp(0.12 + pulse, 0.0, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const synapseMesh = new THREE.LineSegments(synGeo, synMat);
    scene.add(synapseMesh);

    // G. Interactive Mouse Drag & Raycasting
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.08;
    let rotY = 0.0;
    let zoomDist = 68;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        rotY += dx * 0.005;
        rotX = Math.max(-0.6, Math.min(0.6, rotX + dy * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(instancedNeurons);
      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const idx = intersects[0].instanceId;
        const target = neurons[idx];
        if (target) {
          setSelectedNeuronId(target.id);
          if (onSelectNeuron) onSelectNeuron(target);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomDist = Math.max(18, Math.min(130, zoomDist + e.deltaY * 0.05));
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // H. RENDER LOOP
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const render = () => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // FPS tracking
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
      }

      // Auto rotation
      if (autoRotate && !isMouseDown) {
        rotY += delta * 0.08 * speedFactor;
      }

      // Camera position with spherical coordinates
      const camY = Math.sin(rotX) * zoomDist;
      const camRadius = Math.cos(rotX) * zoomDist;
      camera.position.x = Math.sin(rotY) * camRadius;
      camera.position.y = camY;
      camera.position.z = Math.cos(rotY) * camRadius;
      camera.lookAt(0, 0, 0);

      // Starfield subtle drift
      starPoints.rotation.y = elapsedTime * 0.015;

      // Update shader uniforms
      synUniforms.uTime.value = elapsedTime;
      synUniforms.uSpeed.value = 1.0 * speedFactor;
      synUniforms.uState.value = inferenceState === 'FORWARD_PASS' ? 1 : inferenceState === 'BACKPROP' ? 3 : 0;

      // Smooth Morphing of Neurons to target topology
      const targetMode = topology;
      let posChanged = false;

      neurons.forEach((n, idx) => {
        const targetArr =
          targetMode === 'MLP_SLAB'
            ? n.mlpPos
            : targetMode === 'BRAIN_CONSTELLATION'
            ? n.brainPos
            : n.ringPos;

        const current = currentPositions[idx];
        const tx = targetArr[0];
        const ty = targetArr[1];
        const tz = targetArr[2];

        if (Math.abs(current.x - tx) > 0.01 || Math.abs(current.y - ty) > 0.01 || Math.abs(current.z - tz) > 0.01) {
          current.x += (tx - current.x) * 0.1;
          current.y += (ty - current.y) * 0.1;
          current.z += (tz - current.z) * 0.1;
          posChanged = true;
        }

        // Pulse scale on selected
        const isSel = n.id === selectedNeuronId;
        const baseScale = n.type === 'MOE_CORE' ? 2.6 : n.type === 'OUTPUT' ? 1.6 : n.type === 'GATE' ? 1.4 : 1.0;
        const pulse = isSel ? 1.0 + Math.sin(elapsedTime * 6.0) * 0.2 : 1.0;

        dummy.position.copy(current);
        dummy.scale.setScalar(baseScale * pulse);
        dummy.updateMatrix();
        instancedNeurons.setMatrixAt(idx, dummy.matrix);
      });

      instancedNeurons.instanceMatrix.needsUpdate = true;

      // Stream updated neuron positions to synaptic lines
      if (posChanged) {
        let aIdx = 0;
        synapses.forEach((syn) => {
          const pSrc = currentPositions[syn.sourceIdx];
          const pTgt = currentPositions[syn.targetIdx];
          const mx = (pSrc.x + pTgt.x) * 0.5;
          const my = (pSrc.y + pTgt.y) * 0.5 + 2.5;
          const mz = (pSrc.z + pTgt.z) * 0.5 + 2.0;

          for (let s = 0; s < segmentsPerLine * 2; s++) {
            aSourcePos[aIdx * 3 + 0] = pSrc.x;
            aSourcePos[aIdx * 3 + 1] = pSrc.y;
            aSourcePos[aIdx * 3 + 2] = pSrc.z;

            aTargetPos[aIdx * 3 + 0] = pTgt.x;
            aTargetPos[aIdx * 3 + 1] = pTgt.y;
            aTargetPos[aIdx * 3 + 2] = pTgt.z;

            aControlPoint[aIdx * 3 + 0] = mx;
            aControlPoint[aIdx * 3 + 1] = my;
            aControlPoint[aIdx * 3 + 2] = mz;
            aIdx++;
          }
        });

        synGeo.attributes.aSourcePos.needsUpdate = true;
        synGeo.attributes.aTargetPos.needsUpdate = true;
        synGeo.attributes.aControlPoint.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      synGeo.dispose();
      synMat.dispose();
      starGeo.dispose();
      starMat.dispose();
    };
  }, [neurons, synapses, topology, inferenceState, speedFactor, autoRotate, selectedNeuronId, onSelectNeuron]);

  // Periodic Telemetry Simulator (Matches Real Bot Pulses)
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyMs(14 + Math.random() * 8);
      setEntropy(0.38 + Math.random() * 0.08);
      setSparsityPct(72 + Math.random() * 5);

      // Random state cycle
      const states: InferenceState[] = ['FORWARD_PASS', 'FORWARD_PASS', 'ATTENTION_PEAK', 'BACKPROP'];
      setInferenceState(states[Math.floor(Math.random() * states.length)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[580px] bg-[#020408] rounded-xl overflow-hidden select-none font-mono">
      {/* ── Top Canvas Controls & Breadcrumbs ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-[#070b14]/90 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 shadow-lg backdrop-blur">
          <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-bold">THREE.JS SHADER:</span>
          <span className="text-white font-bold">{topology}</span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-300 font-bold">{neurons.length} NODES</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-bold">{synapses.length} SYNAPSES</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Topologies Toggle */}
          <div className="flex items-center gap-1 bg-[#070b14]/90 p-1 rounded-lg border border-slate-800 text-[10px]">
            {(['MLP_SLAB', 'BRAIN_CONSTELLATION', 'TRANSFORMER_RING'] as TopologyMode[]).map((t) => (
              <button
                key={t}
                onClick={() => setTopology(t)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  topology === t
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                {t === 'MLP_SLAB' ? '5-SLAB' : t === 'BRAIN_CONSTELLATION' ? 'BRAIN 3D' : 'RING'}
              </button>
            ))}
          </div>

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
        </div>
      </div>

      {/* ── Active Three.js WebGL Canvas ── */}
      <canvas ref={canvasRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing block" />

      {/* ── Bottom Telemetry & Status Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-[#050810]/95 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 z-10 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <strong className="text-slate-200">STATE:</strong> {inferenceState}
          </span>
          <span>
            <strong className="text-slate-300">LATENCY:</strong>{' '}
            <span className="text-emerald-400 font-bold">{latencyMs.toFixed(1)} ms</span>
          </span>
          <span>
            <strong className="text-slate-300">SPARSITY:</strong>{' '}
            <span className="text-cyan-400 font-bold">{sparsityPct.toFixed(1)}%</span>
          </span>
          <span>
            <strong className="text-slate-300">ENTROPY:</strong>{' '}
            <span className="text-amber-400 font-bold">{entropy.toFixed(3)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            ACTION: {activeDecision}
          </span>
          <span className="text-cyan-400/80 font-mono font-bold">FPS: {fps}</span>
        </div>
      </div>
    </div>
  );
}
