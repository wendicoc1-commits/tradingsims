'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Brain,
  Zap,
  Activity,
  Sliders,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { FIRM_AGENTS } from '@/lib/hedgefund/firmRoster';
import { UNIVERSE_TICKERS } from '@/lib/hedgefund/autonomousStockPicker';

export type TopologyMode = 'MLP_SLAB' | 'BRAIN_CONSTELLATION' | 'TRANSFORMER_RING';
export type InferenceState = 'IDLE' | 'FORWARD_PASS' | 'ATTENTION_PEAK' | 'BACKPROP' | 'ERROR';

export interface SynapseNeuron {
  id: string;
  name: string;
  layer: number;
  type: 'INPUT' | 'ENCODER' | 'MOE_CORE' | 'EXPERT' | 'GATE' | 'OUTPUT';
  subsystem: 'SENTIMENT' | 'VOLATILITY' | 'ORDERBOOK' | 'EXECUTION' | 'RISK';
  activation: number;
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
  weight: number;
  activity: number;
}

interface ThreeJsSynapticBrainCanvasProps {
  onSelectNeuron?: (neuron: SynapseNeuron | null) => void;
  onOpenWarRoom?: (agentId: string) => void;
  onFallbackToCanvas?: () => void;
  speedFactor?: number;
}

export default function ThreeJsSynapticBrainCanvas({
  onSelectNeuron,
  onOpenWarRoom,
  onFallbackToCanvas,
  speedFactor = 1.0,
}: ThreeJsSynapticBrainCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active View Settings
  const [topology, setTopology] = useState<TopologyMode>('MLP_SLAB');
  const [inferenceState, setInferenceState] = useState<InferenceState>('FORWARD_PASS');
  const [selectedNeuronId, setSelectedNeuronId] = useState<string>('core');
  const [autoRotate, setAutoRotate] = useState(true);
  const [fps, setFps] = useState(60);
  const [webGlError, setWebGlError] = useState<string | null>(null);

  // Telemetry metrics
  const [latencyMs, setLatencyMs] = useState(18.4);
  const [entropy, setEntropy] = useState(0.412);
  const [sparsityPct, setSparsityPct] = useState(74.2);
  const [activeDecision, setActiveDecision] = useState<'BUY' | 'HOLD' | 'SELL' | 'VETO'>('BUY');

  // Sync state to refs for high-frequency render loop (prevents re-mounting WebGL context)
  const topologyRef = useRef<TopologyMode>(topology);
  topologyRef.current = topology;

  const inferenceStateRef = useRef<InferenceState>(inferenceState);
  inferenceStateRef.current = inferenceState;

  const speedFactorRef = useRef<number>(speedFactor);
  speedFactorRef.current = speedFactor;

  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;

  const selectedNeuronIdRef = useRef<string>(selectedNeuronId);
  selectedNeuronIdRef.current = selectedNeuronId;

  // ── 1. GENERATE NEURONS (80+ Specialized Nodes Across 5 Layers) ──
  const { neurons, synapses } = useMemo(() => {
    const nList: SynapseNeuron[] = [];
    const sList: SynapseConnection[] = [];

    const getFibSphere = (i: number, total: number, radius: number): [number, number, number] => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      return [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ];
    };

    const getRingPos = (i: number, total: number, radius: number, yOffset: number): [number, number, number] => {
      const angle = (i / total) * Math.PI * 2;
      return [Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius];
    };

    // L0: INPUT NODES (Market Universe Assets)
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

    // L1: 3D FEATURE ENCODERS
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

    // L2: MoE CONSENSUS CORE & 12 EXPERTS
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

    // L3: RISK GATING BARRIERS
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

    // L4: DECISION OUTPUT HEADS
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

    // Connect Layers
    const inputIndices = nList.map((n, i) => (n.layer === 0 ? i : -1)).filter((i) => i !== -1);
    const encoderIndices = nList.map((n, i) => (n.layer === 1 ? i : -1)).filter((i) => i !== -1);
    const expertIndices = nList.map((n, i) => (n.layer === 2 && n.id !== 'core' ? i : -1)).filter((i) => i !== -1);
    const gateIndices = nList.map((n, i) => (n.layer === 3 ? i : -1)).filter((i) => i !== -1);
    const outputIndices = nList.map((n, i) => (n.layer === 4 ? i : -1)).filter((i) => i !== -1);

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

    expertIndices.forEach((sIdx) => {
      sList.push({ sourceIdx: sIdx, targetIdx: coreIdx, weight: 1.5, activity: 0.98 });
    });

    gateIndices.forEach((tIdx) => {
      sList.push({ sourceIdx: coreIdx, targetIdx: tIdx, weight: 1.4, activity: 0.95 });
    });

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

  // ── 2. THREE.JS INITIALIZATION (RUNS STRICTLY ONCE ON MOUNT) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;

    try {
      let width = container.clientWidth || 800;
      let height = container.clientHeight || 580;

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      scene = new THREE.Scene();
      scene.background = new THREE.Color('#030509');
      scene.fog = new THREE.FogExp2('#030509', 0.008);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 800);
      camera.position.set(0, 10, 68);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0x00f5a0, 1.2);
      dirLight1.position.set(30, 40, 30);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
      dirLight2.position.set(-30, -30, -20);
      scene.add(dirLight2);

      // Starfield Dust
      const starCount = 300;
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

      // Neurons Instanced Mesh
      const sphereGeo = new THREE.SphereGeometry(0.8, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        roughness: 0.2,
        metalness: 0.85,
      });

      const instancedNeurons = new THREE.InstancedMesh(sphereGeo, sphereMat, neurons.length);
      instancedNeurons.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(instancedNeurons);

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

      // Synapse Lines
      const segmentsPerLine = 16;
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

            if (uState == 1) {
              float head = fract(uTime * uSpeed * 0.9);
              float dist = abs(vProgress - head);
              pulse = exp(-pow(dist / 0.06, 2.0)) * 2.8;
            } else if (uState == 3) {
              float head = fract(1.0 - uTime * uSpeed * 1.3);
              float dist = abs(vProgress - head);
              pulse = exp(-pow(dist / 0.05, 2.0)) * 3.2;
              pulseColor = uColorBackprop;
            } else {
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

      // Mouse drag controls
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
        if (!camera) return;
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

      // Render Loop
      const clock = new THREE.Clock();
      let frameCount = 0;
      let lastFpsTime = performance.now();

      const render = () => {
        if (!renderer || !scene || !camera) return;

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        frameCount++;
        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
          setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
          frameCount = 0;
          lastFpsTime = now;
        }

        if (autoRotateRef.current && !isMouseDown) {
          rotY += delta * 0.08 * speedFactorRef.current;
        }

        const camY = Math.sin(rotX) * zoomDist;
        const camRadius = Math.cos(rotX) * zoomDist;
        camera.position.x = Math.sin(rotY) * camRadius;
        camera.position.y = camY;
        camera.position.z = Math.cos(rotY) * camRadius;
        camera.lookAt(0, 0, 0);

        starPoints.rotation.y = elapsedTime * 0.015;

        synUniforms.uTime.value = elapsedTime;
        synUniforms.uSpeed.value = 1.0 * speedFactorRef.current;
        synUniforms.uState.value = inferenceStateRef.current === 'FORWARD_PASS' ? 1 : inferenceStateRef.current === 'BACKPROP' ? 3 : 0;

        const targetMode = topologyRef.current;
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

          const isSel = n.id === selectedNeuronIdRef.current;
          const baseScale = n.type === 'MOE_CORE' ? 2.6 : n.type === 'OUTPUT' ? 1.6 : n.type === 'GATE' ? 1.4 : 1.0;
          const pulse = isSel ? 1.0 + Math.sin(elapsedTime * 6.0) * 0.2 : 1.0;

          dummy.position.copy(current);
          dummy.scale.setScalar(baseScale * pulse);
          dummy.updateMatrix();
          instancedNeurons.setMatrixAt(idx, dummy.matrix);
        });

        instancedNeurons.instanceMatrix.needsUpdate = true;

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

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
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
        if (renderer) renderer.dispose();
      };
    } catch (err: any) {
      console.warn('WebGL Initialization warning:', err);
      setWebGlError(err?.message || 'WebGL not supported on this browser');
    }
  }, [neurons, synapses, onSelectNeuron]);

  // Periodic Telemetry Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyMs(14 + Math.random() * 8);
      setEntropy(0.38 + Math.random() * 0.08);
      setSparsityPct(72 + Math.random() * 5);

      const states: InferenceState[] = ['FORWARD_PASS', 'FORWARD_PASS', 'ATTENTION_PEAK', 'BACKPROP'];
      setInferenceState(states[Math.floor(Math.random() * states.length)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  if (webGlError) {
    return (
      <div className="relative w-full h-full min-h-[580px] bg-[#020408] rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 animate-bounce" />
        <div className="text-white font-bold text-sm">WebGL Acceleration Unavailable</div>
        <div className="text-slate-400 text-xs max-w-md">
          Browser Anda memerlukan akselerasi WebGL aktif, atau konteks grafis sedang dimuat ulang.
        </div>
        {onFallbackToCanvas && (
          <button
            onClick={onFallbackToCanvas}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer shadow-lg transition-all"
          >
            Beralih ke High-Performance Canvas 3D
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[580px] bg-[#020408] rounded-xl overflow-hidden select-none font-mono">
      {/* Top Canvas Controls & Breadcrumbs */}
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

      {/* Active Three.js WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing block" />

      {/* Bottom Telemetry & Status Bar */}
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
