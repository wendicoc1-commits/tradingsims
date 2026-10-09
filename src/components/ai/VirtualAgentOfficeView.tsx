'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Newspaper,
  Users,
  MessageSquare,
  Radio,
  Sparkles,
  Trophy,
  Zap,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ShieldCheck,
  Check,
  ChevronRight,
  Volume2,
  VolumeX,
  CloudSun,
  CloudRain,
  Moon,
  Activity,
  Award,
  Camera,
  Flame,
} from 'lucide-react';
import { executiveVoice } from '@/lib/audio/executiveVoiceSynthesizer';
import type { BandarmologiInsight, CryptoWhaleInsight } from '@/lib/hedgefund/bandarmologiEngine';
import { checkIDXMarketStatus, isIndonesianStock } from '@/lib/market/marketHours';
import { getGroundedStockIntelligence } from '@/lib/agents/groundedStockIntelligence';
import { BLOOMBERG_ECONOMIC_EVENTS } from '@/data/bloomberg_economic_calendar';
import {
  scanUniverseForTopAlpha,
  selectDiversifiedCandidate,
  UNIVERSE_TICKERS,
  type StockAlphaEvaluation,
  type UniverseScanResult,
} from '@/lib/hedgefund/autonomousStockPicker';
import TopUpModal from '@/components/portfolio/TopUpModal';
import {
  AGENT_BY_ID,
  DEPARTMENTS,
  DEPT_BY_ID,
  DESK_H,
  DESK_W,
  FIRM_AGENTS,
  PANTRY_SPOTS,
  WALL_H,
  WAR_ROOM,
  WORLD_H,
  WORLD_W,
  layoutDesks,
  warRoomSeats,
  type DeptId,
  type DeskSlot,
  type FirmAgent,
} from '@/lib/hedgefund/firmRoster';
import {
  buildAgentReport,
  buildDebateScript,
  computeCommitteeDecision,
  computePositionSizing,
  fmtMoney,
  portfolioNav,
  roundTick,
  type AgentReport,
  type CommitteeDecision,
  type DebateLine,
  type DeskContext,
  type FeedHealth,
  type LiveQuote,
  type MacroSnapshot,
  type NewsItem,
  type PortfolioSnapshot,
  type PositionSizing,
  type Provenance,
} from '@/lib/hedgefund/deskReports';
import { NavGrid, type Pt } from '@/lib/office/navGrid';
import { usePortfolioStore } from '@/store';
import { useAIAgentStore } from '@/store/aiAgentStore';
import { broadcastEvent } from '@/lib/crossTabSync';
import {
  runAutonomousAgentCycle,
  dispatchToQuantBridge,
  recordQuantMemoryToVPS,
} from '@/lib/hedgefund/autonomousTradingEngine';
import { useBinanceLivePrices } from '@/hooks/useBinanceLivePrices';
import {
  MASTER_ASSETS,
  UNIVERSE_STATS,
  searchAssets,
  getAssetBySymbol,
  getAssetsByCategory,
  getAllSectors,
  isCryptoSymbol,
  isUSSymbol,
  type UnifiedAsset,
} from '@/lib/universe/masterAssetUniverse';
import type {
  CrisisEventPayload,
  PostMortemEntry,
  MeritocraticAllocation,
} from '@/lib/hedgefund/autonomousEcosystemSchema';
import { calculateDynamicAumRouting } from '@/lib/hedgefund/meritocraticSpatialEngine';
import { globalReplayEngine, type ReplayTickSnapshot } from '@/lib/office/TimeTravelReplayEngine';
import CrisisCommandConsole from './CrisisCommandConsole';
import PostMortemVaultModal from './PostMortemVaultModal';
import TimeTravelScrubberBar from './TimeTravelScrubberBar';
import MeritocracyLeaderboardDrawer from './MeritocracyLeaderboardDrawer';
import { globalTickBuffer } from '@/lib/office/HighFrequencyTickBuffer';
import { globalAgentAtlas, type AgentVisualState } from '@/lib/office/SpriteSheetAtlasPool';
import { globalLaserNetwork } from '@/lib/office/AgentLaserNetworkEngine';
import { globalHoloHub } from '@/lib/office/HolographicMarketHub';
import { globalAtmosphere } from '@/lib/office/MarketAtmosphereEngine';
import { globalDeskProps } from '@/lib/office/DynamicDeskPropsEngine';
import CctvSecurityPipWidget, { type CctvTargetAgent } from './CctvSecurityPipWidget';
import QuantDeskJessePanel from './QuantDeskJessePanel';

// ───────────────────────── konstanta ─────────────────────────

export interface TickerItemDef {
  symbol: string;
  category: 'IDX' | 'CRYPTO' | 'GLOBAL';
  name?: string;
}

const TICKER_REGISTRY: TickerItemDef[] = [
  // Crypto (Jesse Desk)
  { symbol: 'BTC', category: 'CRYPTO', name: 'Bitcoin' },
  { symbol: 'ETH', category: 'CRYPTO', name: 'Ethereum' },
  { symbol: 'SOL', category: 'CRYPTO', name: 'Solana' },
  { symbol: 'BNB', category: 'CRYPTO', name: 'BNB' },
  { symbol: 'DOGE', category: 'CRYPTO', name: 'Dogecoin' },
  { symbol: 'XRP', category: 'CRYPTO', name: 'XRP' },
  // Saham IDX
  { symbol: 'BBCA', category: 'IDX', name: 'Bank Central Asia' },
  { symbol: 'BBRI', category: 'IDX', name: 'Bank Rakyat Indonesia' },
  { symbol: 'BMRI', category: 'IDX', name: 'Bank Mandiri' },
  { symbol: 'BBNI', category: 'IDX', name: 'Bank Negara Indonesia' },
  { symbol: 'ASII', category: 'IDX', name: 'Astra International' },
  { symbol: 'TLKM', category: 'IDX', name: 'Telkom Indonesia' },
  { symbol: 'ADRO', category: 'IDX', name: 'Adaro Energy' },
  { symbol: 'PTBA', category: 'IDX', name: 'Bukit Asam' },
  { symbol: 'PGAS', category: 'IDX', name: 'PGAS' },
  { symbol: 'AMMN', category: 'IDX', name: 'Amman Mineral' },
  { symbol: 'ICBP', category: 'IDX', name: 'Indofood CBP' },
  { symbol: 'UNVR', category: 'IDX', name: 'Unilever' },
  { symbol: 'MYOR', category: 'IDX', name: 'Mayora Indah' },
  { symbol: 'GOTO', category: 'IDX', name: 'GoTo' },
  { symbol: 'BUKA', category: 'IDX', name: 'Bukalapak' },
  { symbol: 'EMTK', category: 'IDX', name: 'Elang Mahkota' },
  // Global US
  { symbol: 'NVDA', category: 'GLOBAL', name: 'Nvidia' },
  { symbol: 'AAPL', category: 'GLOBAL', name: 'Apple' },
];

const ALL_TICKERS = TICKER_REGISTRY.map((t) => t.symbol);

const PLANTS: Pt[] = [
  { x: 484, y: 436 }, { x: 1144, y: 436 }, { x: 1684, y: 436 }, { x: 2324, y: 436 },
  { x: 664, y: 896 }, { x: 2324, y: 896 }, { x: 1008, y: 896 }, { x: 1660, y: 896 },
  { x: 584, y: 1396 }, { x: 1144, y: 1396 }, { x: 1764, y: 1396 }, { x: 2324, y: 1396 },
  { x: 750, y: 610 }, { x: 922, y: 610 },
];

const WALK_SPEED = 150; // px dunia / detik
const SPRITE_SCALE = 2; // 16x32 -> 32x64
const CHAR_W = 16 * SPRITE_SCALE;
const CHAR_H = 32 * SPRITE_SCALE;

const PROV_STYLE: Record<Provenance, { label: string; cls: string; hint: string }> = {
  LIVE: { label: 'LIVE', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', hint: 'Diambil saat ini (RSS / Yahoo Finance / state paper trading)' },
  AUDITED: { label: 'AUDITED', cls: 'bg-sky-500/15 text-sky-300 border-sky-500/40', hint: 'Profil keuangan auditan (dataset BEI/SEC di repo)' },
  STATIC: { label: 'STATIC', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40', hint: 'Dataset statis di repo — bukan feed live' },
  MODEL: { label: 'MODEL', cls: 'bg-violet-500/15 text-violet-300 border-violet-500/40', hint: 'Hasil perhitungan rule-based aplikasi ini' },
};

// ───────────────────────── tipe simulasi ─────────────────────────

type Mode = 'SIT' | 'WALK' | 'TALK' | 'BREAK' | 'MEETING';
type Dest = 'HOME' | 'VISIT' | 'COFFEE' | 'SEAT';

interface Bubble {
  text: string;
  from: number;
  until: number;
}

interface AgentRT {
  def: FirmAgent;
  slot: DeskSlot;
  x: number;
  y: number;
  path: Pt[];
  mode: Mode;
  dest: Dest;
  timer: number;
  dir: 0 | 1 | 2;
  flip: boolean;
  frame: number;
  sprite: number;
  hueShift: number;
  visitId: string | null;
  bubble: Bubble | null;
  seat: Pt | null;
}

interface Assets {
  chars: HTMLImageElement[];
  floors: HTMLImageElement[];
  desk: HTMLImageElement;
  pcOn: HTMLImageElement[];
  pcOff: HTMLImageElement;
  plant: HTMLImageElement;
  coffee: HTMLImageElement;
}

export type MarketWeather = 'BULLISH_SUNNY' | 'BEARISH_RAIN' | 'NIGHT_MODE';

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rot: number;
  rotSpeed: number;
  alpha: number;
}

interface Sim {
  agents: AgentRT[];
  byId: Record<string, AgentRT>;
  nav: NavGrid;
  cam: { x: number; y: number; zoom: number; tx: number; ty: number; tz: number };
  view: { w: number; h: number; dpr: number };
  fitZoom: number;
  assets: Assets | null;
  staticLayer: HTMLCanvasElement | null;
  sheets: Map<string, HTMLCanvasElement>;
  meeting: boolean;
  speakerId: string | null;
  speakerText: string;
  alarm: boolean;
  selectedId: string | null;
  hoverId: string | null;
  reports: Record<string, AgentReport>;
  board: { symbol: string; price: string; change: string; live: boolean; headline: string };
  time: number;
  weather: MarketWeather;
  confetti: ConfettiParticle[];
}

// ───────────────────────── util umum ─────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

async function loadAssets(): Promise<Assets> {
  const base = '/pixel-office';
  const [chars, floors, pcOn, desk, pcOff, plant, coffee] = await Promise.all([
    Promise.all([0, 1, 2, 3, 4, 5].map((i) => loadImage(`${base}/characters/char_${i}.png`))),
    Promise.all([0, 1, 2].map((i) => loadImage(`${base}/floors/floor_${i}.png`))),
    Promise.all([1, 2, 3].map((i) => loadImage(`${base}/furniture/PC/PC_FRONT_ON_${i}.png`))),
    loadImage(`${base}/furniture/DESK/DESK_FRONT.png`),
    loadImage(`${base}/furniture/PC/PC_FRONT_OFF.png`),
    loadImage(`${base}/furniture/PLANT/PLANT.png`),
    loadImage(`${base}/furniture/COFFEE/COFFEE.png`),
  ]);
  return { chars, floors, desk, pcOn, pcOff, plant, coffee };
}

const ok = (img: HTMLImageElement | undefined | null): img is HTMLImageElement =>
  !!img && img.complete && img.naturalWidth > 0;

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Warnai seragam sesuai departemen: geser hue piksel non-kulit (meniru adjustSprite di Pixel Agents). */
function tintSheet(img: HTMLImageElement, hueShift: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return c;
  g.drawImage(img, 0, 0);
  if (hueShift === 0) return c;
  const data = g.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const [h, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2]);
    if (s < 0.12) continue; // abu-abu/putih/hitam
    if (h >= 8 && h <= 48 && s < 0.85) continue; // kulit & rambut cokelat
    const [r, gg, b] = hslToRgb((h + hueShift) % 360, s, l);
    d[i] = r; d[i + 1] = gg; d[i + 2] = b;
  }
  g.putImageData(data, 0, 0);
  return c;
}

function getSheet(sim: Sim, a: AgentRT): CanvasImageSource | null {
  if (!sim.assets) return null;
  const img = sim.assets.chars[a.sprite];
  if (!ok(img)) return null;
  const key = `${a.sprite}:${a.hueShift}`;
  let sheet = sim.sheets.get(key);
  if (!sheet) {
    sheet = tintSheet(img, a.hueShift);
    sim.sheets.set(key, sheet);
  }
  return sheet;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ───────────────────────── pembuatan simulasi ─────────────────────────

function createSim(): Sim {
  const slots = layoutDesks();
  const nav = new NavGrid(WORLD_W, WORLD_H, 16);

  // dinding utara
  nav.blockRect(0, 0, WORLD_W, WALL_H + 6);
  // meja kerja
  Object.values(slots).forEach((s) => nav.blockRect(s.dx - DESK_W / 2 - 4, s.dy - 18, DESK_W + 8, DESK_H - 2));
  // meja War Room
  nav.blockRect(
    WAR_ROOM.cx - WAR_ROOM.tableRx - 12,
    WAR_ROOM.cy - WAR_ROOM.tableRy - 12,
    (WAR_ROOM.tableRx + 12) * 2,
    (WAR_ROOM.tableRy + 12) * 2
  );
  // pantry: counter & sofa
  nav.blockRect(770, 596, 160, 44);
  nav.blockRect(780, 890, 140, 44);
  // tanaman
  PLANTS.forEach((p) => nav.blockRect(p.x, p.y + 30, 32, 32));

  const deptHue: Record<string, number> = {};
  const perDeptIndex: Record<string, number> = {};
  const agents: AgentRT[] = FIRM_AGENTS.map((def, i) => {
    const slot = slots[def.id];
    const di = perDeptIndex[def.dept] ?? 0;
    perDeptIndex[def.dept] = di + 1;
    if (deptHue[def.dept] === undefined) {
      deptHue[def.dept] = (hexToHue(DEPT_BY_ID[def.dept].color) - 215 + 360) % 360;
    }
    return {
      def,
      slot,
      x: slot.seatX,
      y: slot.seatY,
      path: [],
      mode: 'SIT',
      dest: 'HOME',
      timer: 2 + ((i * 7) % 13),
      dir: 0,
      flip: false,
      frame: 3,
      sprite: (di + i) % 6,
      hueShift: deptHue[def.dept],
      visitId: null,
      bubble: null,
      seat: null,
    };
  });

  const byId: Record<string, AgentRT> = {};
  agents.forEach((a) => (byId[a.def.id] = a));

  return {
    agents,
    byId,
    nav,
    cam: { x: 0, y: 0, zoom: 0.5, tx: 0, ty: 0, tz: 0.5 },
    view: { w: 1000, h: 600, dpr: 1 },
    fitZoom: 0.4,
    assets: null,
    staticLayer: null,
    sheets: new Map(),
    meeting: false,
    speakerId: null,
    speakerText: '',
    alarm: false,
    selectedId: null,
    hoverId: null,
    reports: {},
    board: { symbol: '', price: '', change: '', live: false, headline: '' },
    time: 0,
    weather: 'BULLISH_SUNNY',
    confetti: [],
  };
}

function triggerConfetti(sim: Sim, count = 100) {
  const colors = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#60a5fa', '#ec4899', '#a855f7'];
  const cx = WAR_ROOM.cx;
  const cy = WAR_ROOM.cy;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 8.5;
    sim.confetti.push({
      x: cx + (Math.random() - 0.5) * 80,
      y: cy + (Math.random() - 0.5) * 50,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      alpha: 1,
    });
  }
}

function goTo(sim: Sim, a: AgentRT, tx: number, ty: number, dest: Dest) {
  a.path = sim.nav.findPath(a.x, a.y, tx, ty);
  a.mode = 'WALK';
  a.dest = dest;
}

function goHome(sim: Sim, a: AgentRT) {
  a.bubble = null;
  goTo(sim, a, a.slot.seatX, a.slot.seatY, 'HOME');
}

function decideNext(sim: Sim, a: AgentRT) {
  const r = Math.random();
  if (r < 0.12) {
    const spot = PANTRY_SPOTS[Math.floor(Math.random() * PANTRY_SPOTS.length)];
    goTo(sim, a, spot.x, spot.y, 'COFFEE');
    return;
  }
  if (r < 0.55) {
    const options = a.def.collaborators.filter((id) => sim.byId[id] && sim.byId[id].mode === 'SIT');
    if (options.length) {
      const id = options[Math.floor(Math.random() * options.length)];
      const t = sim.byId[id];
      a.visitId = id;
      const sigType =
        a.def.dept === 'RISK' ? 'RISK_VETO'
        : a.def.dept === 'ALPHA' || a.def.dept === 'QUANT' ? 'SIGNAL_TRADE'
        : 'TELEMETRY';
      globalLaserNetwork.fireStream(a.slot.dx, a.slot.dy, t.slot.dx, t.slot.dy, sigType);
      goTo(sim, a, t.slot.dx + 68, t.slot.dy + 16, 'VISIT');
      return;
    }
  }
  a.timer = 6 + Math.random() * 12;
}

function faceVector(a: AgentRT, dx: number, dy: number) {
  if (Math.abs(dx) > Math.abs(dy) * 1.2) {
    a.dir = 2;
    a.flip = dx < 0;
  } else {
    a.dir = dy > 0 ? 0 : 1;
    a.flip = false;
  }
}

function arrive(sim: Sim, a: AgentRT, now: number) {
  a.path = [];
  switch (a.dest) {
    case 'HOME':
      a.x = a.slot.seatX;
      a.y = a.slot.seatY;
      a.mode = 'SIT';
      a.dir = 0;
      a.flip = false;
      a.timer = 8 + Math.random() * 14;
      break;
    case 'COFFEE':
      a.mode = 'BREAK';
      a.timer = 4 + Math.random() * 4;
      a.dir = 1;
      a.flip = false;
      a.bubble = { text: '☕ Ngopi dulu…', from: now, until: now + 3 };
      break;
    case 'VISIT': {
      a.mode = 'TALK';
      a.timer = 5;
      a.dir = 2;
      a.flip = true; // lawan bicara ada di kiri
      const rep = sim.reports[a.def.id];
      if (rep) a.bubble = { text: rep.bubble, from: now, until: now + 5 };
      const t = a.visitId ? sim.byId[a.visitId] : null;
      const trep = t ? sim.reports[t.def.id] : null;
      if (t && trep) t.bubble = { text: trep.bubble, from: now + 2.4, until: now + 5 };
      break;
    }
    case 'SEAT':
      a.mode = 'MEETING';
      if (a.seat) {
        a.x = a.seat.x;
        a.y = a.seat.y;
        faceVector(a, WAR_ROOM.cx - a.x, WAR_ROOM.cy - a.y);
      }
      break;
  }
}

function stepAgent(sim: Sim, a: AgentRT, dt: number, now: number) {
  if (a.mode === 'WALK') {
    const wp = a.path[0];
    if (!wp) {
      arrive(sim, a, now);
      return;
    }
    const dx = wp.x - a.x;
    const dy = wp.y - a.y;
    const d = Math.hypot(dx, dy);
    const step = WALK_SPEED * dt;
    if (d <= step) {
      a.x = wp.x;
      a.y = wp.y;
      a.path.shift();
      if (!a.path.length) arrive(sim, a, now);
    } else {
      a.x += (dx / d) * step;
      a.y += (dy / d) * step;
      faceVector(a, dx, dy);
      a.frame = Math.floor(now * 8) % 3;
    }
    return;
  }

  a.timer -= dt;
  switch (a.mode) {
    case 'SIT':
      a.frame = 3 + (Math.floor(now * 4 + a.slot.dx) % 2);
      if (a.timer <= 0 && !sim.meeting) decideNext(sim, a);
      else if (a.timer <= 0) a.timer = 5;
      break;
    case 'TALK':
    case 'BREAK':
      a.frame = 5 + (Math.floor(now * 2 + a.slot.dy) % 2);
      if (a.timer <= 0) goHome(sim, a);
      break;
    case 'MEETING':
      a.frame = sim.speakerId === a.def.id ? 5 + (Math.floor(now * 5) % 2) : 6;
      break;
  }
}

// ───────────────────────── render statis ─────────────────────────

function buildStaticLayer(assets: Assets): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = WORLD_W;
  c.height = WORLD_H;
  const g = c.getContext('2d');
  if (!g) return c;
  g.imageSmoothingEnabled = false;

  // dasar & dinding
  g.fillStyle = '#0b0e15';
  g.fillRect(0, 0, WORLD_W, WORLD_H);
  const wg = g.createLinearGradient(0, 0, 0, WALL_H);
  wg.addColorStop(0, '#1d2333');
  wg.addColorStop(1, '#121620');
  g.fillStyle = wg;
  g.fillRect(0, 0, WORLD_W, WALL_H);
  g.fillStyle = 'rgba(255,255,255,0.035)';
  for (let x = 0; x < WORLD_W; x += 120) g.fillRect(x, 0, 2, WALL_H);
  g.fillStyle = '#0a0c12';
  g.fillRect(0, WALL_H - 10, WORLD_W, 10);
  g.fillStyle = '#f59e0b';
  g.fillRect(0, WALL_H - 12, WORLD_W, 2);

  // judul firma di dinding
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#fbbf24';
  g.font = 'bold 40px monospace';
  g.fillText('FINCEPT CAPITAL', 48, 66);
  g.fillStyle = '#94a3b8';
  g.font = '16px monospace';
  g.fillText('MULTI-STRATEGY HEDGE FUND · SATU LANTAI · 50 AGEN', 50, 96);

  // lantai lorong
  const floorTile = (img: HTMLImageElement | undefined, x: number, y: number, w: number, h: number) => {
    if (!ok(img)) {
      g.fillStyle = '#141824';
      g.fillRect(x, y, w, h);
      return;
    }
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    for (let fy = y; fy < y + h; fy += 32) {
      for (let fx = x; fx < x + w; fx += 32) g.drawImage(img, 0, 0, 16, 16, fx, fy, 32, 32);
    }
    g.restore();
  };
  floorTile(assets.floors[0], 0, WALL_H, WORLD_W, WORLD_H - WALL_H);
  g.fillStyle = 'rgba(5,8,14,0.62)';
  g.fillRect(0, WALL_H, WORLD_W, WORLD_H - WALL_H);

  // zona departemen
  DEPARTMENTS.forEach((z) => {
    floorTile(assets.floors[z.floorTile], z.x, z.y, z.w, z.h);
    g.fillStyle = z.color + '1c';
    g.fillRect(z.x, z.y, z.w, z.h);
    g.fillStyle = 'rgba(6,9,15,0.38)';
    g.fillRect(z.x, z.y, z.w, z.h);
    g.strokeStyle = z.color + '99';
    g.lineWidth = 3;
    g.strokeRect(z.x + 1.5, z.y + 1.5, z.w - 3, z.h - 3);
    // bilah label
    g.fillStyle = 'rgba(5,7,12,0.78)';
    g.fillRect(z.x + 3, z.y + 3, z.w - 6, 38);
    g.fillStyle = z.color;
    g.fillRect(z.x + 3, z.y + 3, 6, 38);
    g.fillStyle = '#f1f5f9';
    g.font = 'bold 22px monospace';
    g.fillText(`${z.emoji} ${z.name}`, z.x + 20, z.y + 30);
  });

  // meja War Room + kursi
  const { cx, cy, tableRx, tableRy } = WAR_ROOM;
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.beginPath();
  g.ellipse(cx, cy + 14, tableRx + 12, tableRy + 10, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#3a221d';
  g.beginPath();
  g.ellipse(cx, cy, tableRx, tableRy, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#5a382c';
  g.lineWidth = 5;
  g.stroke();
  g.strokeStyle = '#d97706';
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(cx, cy, tableRx - 18, tableRy - 14, 0, 0, Math.PI * 2);
  g.stroke();
  const executiveCount = FIRM_AGENTS.filter((a) => a.committee).length;
  warRoomSeats(executiveCount).forEach((s) => {
    g.fillStyle = '#1f2937';
    g.beginPath();
    g.roundRect(s.x - 18, s.y + 4, 36, 18, 6);
    g.fill();
    g.strokeStyle = '#d97706';
    g.lineWidth = 1.5;
    g.stroke();
  });

  // pantry: counter, mesin kopi, sofa
  g.fillStyle = '#2d3345';
  g.fillRect(770, 596, 160, 44);
  g.fillStyle = '#1c202c';
  g.fillRect(774, 632, 152, 8);
  if (ok(assets.coffee)) {
    [786, 836, 886].forEach((x) => g.drawImage(assets.coffee, x, 586, 48, 48));
  }
  g.fillStyle = '#374151';
  g.beginPath();
  g.roundRect(780, 890, 140, 44, 10);
  g.fill();
  g.fillStyle = '#4b5563';
  g.beginPath();
  g.roundRect(788, 898, 60, 28, 6);
  g.roundRect(852, 898, 60, 28, 6);
  g.fill();
  g.fillStyle = '#fbbf24';
  g.font = '14px monospace';
  g.textAlign = 'center';
  g.fillText('espresso · air · camilan', 850, 664);
  g.textAlign = 'left';

  return c;
}

// ───────────────────────── render dinamis ─────────────────────────

function renderFrame(ctx: CanvasRenderingContext2D, sim: Sim, now: number, dt: number = 0.016) {
  const { w, h, dpr } = sim.view;
  const cam = sim.cam;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#06080d';
  ctx.fillRect(0, 0, w * dpr, h * dpr);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(dpr * cam.zoom, 0, 0, dpr * cam.zoom, -cam.x * cam.zoom * dpr, -cam.y * cam.zoom * dpr);

  if (sim.staticLayer) ctx.drawImage(sim.staticLayer, 0, 0);

  // Cuaca Pasar Kantor Virtual (Dimensi 4: Market Weather)
  if (sim.weather === 'BULLISH_SUNNY') {
    ctx.save();
    const sunGrad = ctx.createLinearGradient(400, 0, 1600, 1100);
    const sunPulse = 0.05 + 0.02 * Math.sin(now * 1.5);
    sunGrad.addColorStop(0, `rgba(251, 191, 36, ${sunPulse + 0.04})`);
    sunGrad.addColorStop(0.5, `rgba(245, 158, 11, ${sunPulse * 0.6})`);
    sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.moveTo(350, 60);
    ctx.lineTo(850, 60);
    ctx.lineTo(1650, 1100);
    ctx.lineTo(1100, 1100);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(1100, 60);
    ctx.lineTo(1500, 60);
    ctx.lineTo(2100, 950);
    ctx.lineTo(1700, 950);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (sim.weather === 'BEARISH_RAIN') {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const rainSeed = Math.floor(now * 32);
    for (let r = 0; r < 40; r++) {
      const rx = (r * 47 + rainSeed * 19) % WORLD_W;
      const ry = (r * 31 + rainSeed * 29) % (WALL_H + 240);
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 5, ry + 18);
    }
    ctx.stroke();
    ctx.restore();
  } else if (sim.weather === 'NIGHT_MODE') {
    ctx.save();
    ctx.fillStyle = 'rgba(4, 6, 14, 0.36)';
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    ctx.restore();
  }

  // papan info live di dinding
  {
    const bx = 1000;
    const by = 18;
    const bw = 700;
    const bh = 90;
    ctx.fillStyle = '#05070b';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(sim.board.symbol, bx + 16, by + 38);
    ctx.fillStyle = sim.board.change.startsWith('-') ? '#f87171' : '#34d399';
    ctx.fillText(`${sim.board.price}  ${sim.board.change}`, bx + 150, by + 38);
    ctx.fillStyle = sim.board.live ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(sim.board.live ? '● LIVE · Yahoo Finance' : '● FALLBACK · benchmark statis', bx + 16, by + 58);
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx + 8, by + 62, bw - 16, 24);
    ctx.clip();
    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px monospace';
    const msg = sim.board.headline || 'Menunggu headline dari crawler…';
    const tw = ctx.measureText(msg).width + 120;
    const off = (now * 60) % tw;
    ctx.fillText(msg, bx + 16 - off, by + 80);
    ctx.fillText(msg, bx + 16 - off + tw, by + 80);
    ctx.restore();
  }

  type Item = { z: number; draw: () => void };
  const items: Item[] = [];
  const A = sim.assets;
  const pcFrame = Math.floor(now * 4) % 3;

  // meja & PC
  sim.agents.forEach((a) => {
    const s = a.slot;
    items.push({
      z: s.dy,
      draw: () => {
        if (A && ok(A.desk)) ctx.drawImage(A.desk, s.dx - DESK_W / 2, s.dy - 24, DESK_W, DESK_H);
        else {
          ctx.fillStyle = '#6b4a2b';
          ctx.fillRect(s.dx - DESK_W / 2, s.dy - 24, DESK_W, DESK_H);
        }
      },
    });
    items.push({
      z: s.dy + 0.5,
      draw: () => {
        if (!A) return;
        const img = a.mode === 'SIT' ? A.pcOn[pcFrame] : A.pcOff;
        if (ok(img)) ctx.drawImage(img, s.dx + 6, s.dy - 60, 32, 64);
      },
    });
  });

  // agen
  sim.agents.forEach((a) => {
    const sitting = a.mode === 'SIT';
    items.push({
      z: sitting ? a.slot.dy - 1 : a.y,
      draw: () => {
        const feetY = a.y;
        if (!sitting) {
          ctx.fillStyle = 'rgba(0,0,0,0.42)';
          ctx.beginPath();
          ctx.ellipse(a.x, feetY, 13, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        const sheet = getSheet(sim, a);
        const bob = a.mode === 'WALK' ? Math.sin(now * 16) * 1.2 : 0;
        if (sheet) {
          const sx = a.frame * 16;
          const sy = a.dir * 32;
          if (a.flip) {
            ctx.save();
            ctx.translate(a.x, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(sheet, sx, sy, 16, 32, -CHAR_W / 2, feetY - CHAR_H + bob, CHAR_W, CHAR_H);
            ctx.restore();
          } else {
            ctx.drawImage(sheet, sx, sy, 16, 32, a.x - CHAR_W / 2, feetY - CHAR_H + bob, CHAR_W, CHAR_H);
          }
        } else {
          const state: AgentVisualState =
            sim.crisisEvent ? 'alert_crisis'
            : a.mode === 'SIT' ? 'typing'
            : a.mode === 'WALK' ? 'walking'
            : a.mode === 'MEETING' ? 'meeting'
            : 'idle';
          const drawn = globalAgentAtlas.drawBakedAgent(ctx, a.def.dept, state, a.x, feetY - 25, 0.85);
          if (!drawn) {
            ctx.fillStyle = DEPT_BY_ID[a.def.dept].color;
            ctx.fillRect(a.x - 10, feetY - 50, 20, 50);
          }
        }
      },
    });
  });

  // tanaman
  PLANTS.forEach((p) => {
    items.push({
      z: p.y + 64,
      draw: () => {
        if (A && ok(A.plant)) ctx.drawImage(A.plant, p.x, p.y, 32, 64);
      },
    });
  });

  // hologram & hub pasar di war room
  items.push({
    z: WAR_ROOM.cy,
    draw: () => {
      // 3D Holographic Cylinder & Wireframe Globe
      globalHoloHub.renderHoloHub(ctx, WAR_ROOM.cx, WAR_ROOM.cy, now);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(sim.board.symbol, WAR_ROOM.cx, WAR_ROOM.cy - 8);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText(sim.board.price, WAR_ROOM.cx, WAR_ROOM.cy + 14);
      const bars = [10, 18, 12, 24, 16, 28, 20];
      bars.forEach((hgt, i) => {
        const bx = WAR_ROOM.cx - 63 + i * 21;
        const wob = Math.sin(now * 2 + i) * 3;
        ctx.fillStyle = i % 3 === 0 ? '#f87171' : '#34d399';
        ctx.fillRect(bx, WAR_ROOM.cy + 38 - hgt - wob, 10, hgt + wob);
      });
      ctx.textAlign = 'left';
    },
  });

  items.sort((p, q) => p.z - q.z).forEach((it) => it.draw());

  // ── 1. Inter-Agent Laser Network Splines ──
  globalLaserNetwork.updateAndRender(ctx, dt);

  // ── 2. Dynamic Desk Props (Mugs, Trophy, Smoke) ──
  sim.agents.forEach((a) => {
    globalDeskProps.renderProps(
      ctx,
      {
        agentId: a.def.id,
        deskX: a.slot.dx,
        deskY: a.slot.dy,
        pendingTasks: a.mode === 'SIT' && a.timer > 8 ? 4 : 1,
        isTopSharpe: a.def.id === 'pm_quant' || a.def.id === 'strat_momentum',
        hasError: false,
      },
      now
    );
  });
  globalDeskProps.updateAndDrawSmoke(ctx);

  // Render & Update Confetti (Dimensi 4: Confetti Celebration)
  if (sim.confetti && sim.confetti.length > 0) {
    ctx.save();
    sim.confetti = sim.confetti.filter((p) => p.alpha > 0.02);
    sim.confetti.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.985;
      p.rot += p.rotSpeed;
      p.alpha -= 0.006;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
      ctx.restore();
    });
    ctx.restore();
  }

  // Pendar lampu meja malam hari (Night Mode)
  if (sim.weather === 'NIGHT_MODE') {
    ctx.save();
    sim.agents.forEach((a) => {
      if (a.mode === 'SIT') {
        const lx = a.slot.dx;
        const ly = a.slot.dy - 10;
        const lampGrad = ctx.createRadialGradient(lx, ly, 8, lx, ly, 75);
        lampGrad.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
        lampGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.07)');
        lampGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = lampGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, 75, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // sirine CRO
  const cro = sim.byId['cro'];
  if (cro) {
    const sx = cro.slot.dx - 40;
    const sy = cro.slot.dy - 32;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(sx - 8, sy + 8, 16, 7);
    ctx.fillStyle = sim.alarm ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(sx, sy + 8, 9, Math.PI, 0);
    ctx.fill();
    if (sim.alarm) {
      ctx.save();
      ctx.translate(sx, sy + 6);
      ctx.rotate(now * 5);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
      grad.addColorStop(0, 'rgba(239,68,68,0.85)');
      grad.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 150, -0.38, 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.rotate(Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 150, -0.38, 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // ───── overlay layar (teks tajam, ukuran tetap) ─────
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const zoom = cam.zoom;
  const toScreen = (wx: number, wy: number) => ({ x: (wx - cam.x) * zoom, y: (wy - cam.y) * zoom });

  // ── 3. Dynamic Market Atmosphere & Glitch Overlay ──
  const atmoMode =
    sim.alarm ? 'VOLATILITY_GLITCH'
    : sim.weather === 'BEARISH_RAIN' ? 'BEAR_RAIN'
    : 'BULL_GOLDEN';
  globalAtmosphere.render(ctx, atmoMode, now, w, h);

  sim.agents.forEach((a) => {
    const headY = (a.mode === 'SIT' ? a.slot.seatY : a.y) - CHAR_H;
    const sp = toScreen(a.x, headY);
    if (sp.x < -80 || sp.x > w + 80 || sp.y < -120 || sp.y > h + 80) return;
    const dept = DEPT_BY_ID[a.def.dept];
    const selected = sim.selectedId === a.def.id;
    const hovered = sim.hoverId === a.def.id;

    // penanda departemen
    ctx.fillStyle = dept.color;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y - 3);
    ctx.lineTo(sp.x + 4, sp.y - 8);
    ctx.lineTo(sp.x, sp.y - 13);
    ctx.lineTo(sp.x - 4, sp.y - 8);
    ctx.closePath();
    ctx.fill();

    if (selected) {
      const fp = toScreen(a.x, a.mode === 'SIT' ? a.slot.seatY : a.y);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(fp.x, fp.y, 20 * zoom + 6, 8 * zoom + 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (zoom >= 0.85 || selected || hovered) {
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      const label = a.def.name;
      const tw = ctx.measureText(label).width + 10;
      ctx.fillStyle = 'rgba(5,7,12,0.82)';
      ctx.beginPath();
      ctx.roundRect(sp.x - tw / 2, sp.y - 32, tw, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(label, sp.x, sp.y - 20);
    }
  });

  // gelembung ucapan kecil (konsultasi)
  sim.agents.forEach((a) => {
    const b = a.bubble;
    if (!b || now < b.from || now > b.until) return;
    if (sim.speakerId === a.def.id) return;
    const headY = (a.mode === 'SIT' ? a.slot.seatY : a.y) - CHAR_H;
    const sp = toScreen(a.x, headY);
    if (sp.x < -100 || sp.x > w + 100 || sp.y < -60 || sp.y > h + 40) return;
    ctx.font = '11px sans-serif';
    const lines = wrapLines(ctx, b.text, 190).slice(0, 3);
    const bw = Math.min(210, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 16);
    const bh = lines.length * 14 + 10;
    const bx = clamp(sp.x - bw / 2, 4, w - bw - 4);
    const by = sp.y - 36 - bh;
    ctx.fillStyle = 'rgba(8,11,18,0.94)';
    ctx.strokeStyle = DEPT_BY_ID[a.def.dept].color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e5e7eb';
    ctx.textAlign = 'left';
    lines.forEach((l, i) => ctx.fillText(l, bx + 8, by + 15 + i * 14));
  });

  // gelembung pembicara sidang
  if (sim.speakerId && sim.speakerText) {
    const a = sim.byId[sim.speakerId];
    if (a) {
      const sp = toScreen(a.x, a.y - CHAR_H);
      ctx.font = '12px sans-serif';
      const lines = wrapLines(ctx, sim.speakerText, 300);
      const bw = Math.min(330, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20);
      const bh = lines.length * 16 + 30;
      const bx = clamp(sp.x - bw / 2, 6, w - bw - 6);
      const by = clamp(sp.y - 40 - bh, 6, h - bh - 6);
      ctx.fillStyle = 'rgba(5,7,12,0.96)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${a.def.name} · ${a.def.title}`, bx + 10, by + 17);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px sans-serif';
      lines.forEach((l, i) => ctx.fillText(l, bx + 10, by + 35 + i * 16));
    }
  }

  // vinyet alarm
  if (sim.alarm) {
    const pulse = 0.12 + 0.1 * Math.sin(now * 6);
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(239,68,68,0)');
    g.addColorStop(1, `rgba(239,68,68,${pulse})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

function renderMini(ctx: CanvasRenderingContext2D, sim: Sim, mw: number, mh: number, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = 'rgba(5,7,12,0.92)';
  ctx.fillRect(0, 0, mw, mh);
  const sx = mw / WORLD_W;
  const sy = mh / WORLD_H;
  DEPARTMENTS.forEach((z) => {
    ctx.fillStyle = z.color + '55';
    ctx.fillRect(z.x * sx, z.y * sy, z.w * sx, z.h * sy);
    ctx.strokeStyle = z.color + 'aa';
    ctx.lineWidth = 1;
    ctx.strokeRect(z.x * sx, z.y * sy, z.w * sx, z.h * sy);
  });
  sim.agents.forEach((a) => {
    ctx.fillStyle = a.mode === 'SIT' ? DEPT_BY_ID[a.def.dept].color : '#ffffff';
    ctx.fillRect(a.x * sx - 1, a.y * sy - 1, 3, 3);
  });
  const cam = sim.cam;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cam.x * sx, cam.y * sy, (sim.view.w / cam.zoom) * sx, (sim.view.h / cam.zoom) * sy);
}

// ───────────────────────── komponen UI kecil ─────────────────────────

function ProvBadge({ src }: { src: Provenance }) {
  const s = PROV_STYLE[src];
  return (
    <span title={s.hint} className={`px-1.5 py-[1px] rounded border text-[9px] font-bold font-mono shrink-0 ${s.cls}`}>
      {s.label}
    </span>
  );
}

const MODE_LABEL: Record<Mode, string> = {
  SIT: 'Bekerja',
  WALK: 'Berjalan',
  TALK: 'Berdiskusi',
  BREAK: 'Istirahat',
  MEETING: 'Rapat IC',
};
const MODE_DOT: Record<Mode, string> = {
  SIT: 'bg-emerald-400',
  WALK: 'bg-amber-400',
  TALK: 'bg-cyan-400',
  BREAK: 'bg-orange-400',
  MEETING: 'bg-rose-400',
};

type PanelTab = 'QUANT_JESSE' | 'ROSTER' | 'AI_ACTIVITY' | 'RADAR' | 'NEWS' | 'TRANSCRIPT';
type Phase = 'IDLE' | 'RUNNING' | 'DONE';

interface DebateSnapshot {
  script: DebateLine[];
  decision: CommitteeDecision;
  sizing: PositionSizing;
  symbol: string;
}

// ───────────────────────── komponen utama ─────────────────────────

export default function VirtualAgentOfficeView() {
  const [mounted, setMounted] = useState(false);
  const [selectedStock, setSelectedStock] = useState(() => {
    if (typeof window !== 'undefined') {
      const open = checkIDXMarketStatus().isOpen;
      return open ? 'BBCA' : 'BTC';
    }
    return 'BTC';
  });
  const [assetFilter, setAssetFilter] = useState<'ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL'>('ALL');
  const [customTicker, setCustomTicker] = useState('');
  const [panelTab, setPanelTab] = useState<PanelTab>('QUANT_JESSE');
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // ── Auto-Pilot & Autonomous Stock Selection ──
  const { tickerMap } = useBinanceLivePrices();
  const [universeModalOpen, setUniverseModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<'ALL' | 'IDX' | 'CRYPTO' | 'GLOBAL'>('ALL');
  const [catalogSector, setCatalogSector] = useState('SEMUA');
  const [catalogPage, setCatalogPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('SEMUA');
  const { autoTradingEnabled: autoPilot, setAutoTradingEnabled: setAutoPilot } = useAIAgentStore();
  const [scanResult, setScanResult] = useState<UniverseScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<string>('');
  const [showRiskSettingsModal, setShowRiskSettingsModal] = useState(false);
  const [aiRiskTpEdit, setAiRiskTpEdit] = useState<string>('10');
  const [aiRiskSlEdit, setAiRiskSlEdit] = useState<string>('5');
  const [aiRiskTrailingEdit, setAiRiskTrailingEdit] = useState<string>('5');

  // data live
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [macro, setMacro] = useState<MacroSnapshot | null>(null);
  const [health, setHealth] = useState<FeedHealth>({
    newsOk: false, newsLatencyMs: null, newsTotalInCache: 0, newsSources: 0, newsLastCrawledAt: null,
    quoteOk: false, quoteLatencyMs: null,
  });

  // sidang
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [step, setStep] = useState(-1);
  const [snapshot, setSnapshot] = useState<DebateSnapshot | null>(null);
  const [alarm, setAlarm] = useState(false);
  const [orderResult, setOrderResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pendingWarRoomTarget, setPendingWarRoomTarget] = useState<string | null>(null);

  // portfolio paper trading
  const cash = usePortfolioStore((s) => s.cash);
  const realizedPL = usePortfolioStore((s) => s.realizedPL);
  const holdings = usePortfolioStore((s) => s.holdings);
  const orders = usePortfolioStore((s) => s.orders);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<Sim | null>(null);
  if (simRef.current === null) simRef.current = createSim();

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // ── universe auto-scan ──
  const executeUniverseScan = useCallback(async () => {
    setIsScanning(true);
    try {
      let liveQuotesMap: Record<string, LiveQuote> = {};
      try {
        const tickersParam = UNIVERSE_TICKERS.join(',');
        const qRes = await fetch(`/api/stocks/realtime?tickers=${encodeURIComponent(tickersParam)}`, { cache: 'no-store' });
        const qData = await qRes.json();
        if (qData?.quotes) {
          liveQuotesMap = qData.quotes;
        }
      } catch {
        // quotes fallback
      }

      // ── Sinkronisasi Kuotasi Real-Time Binance untuk Aset Kripto (Jesse Desk) ──
      if (tickerMap) {
        for (const [pair, t] of Object.entries(tickerMap)) {
          if (t && t.price > 0) {
            const clean = pair.replace(/USDT$/i, '').toUpperCase();
            liveQuotesMap[clean] = {
              price: t.price,
              changePct: t.change24h,
              high: t.high24h,
              low: t.low24h,
              volume: parseFloat(t.volume24h.replace('$', '').replace('B', '000000000').replace('M', '000000')) || 0,
              live: true,
              marketState: '24/7 OPEN (BINANCE LIVE)',
            };
          }
        }
      }

      const heldTickers = usePortfolioStore.getState().holdings.map((h) => h.displaySymbol);
      const result = scanUniverseForTopAlpha(news, liveQuotesMap, heldTickers);
      setScanResult(result);
      setLastScanAt(result.timestamp);

      // ── Alokasi Otonom: Seluruh Departemen Wajib Kumpul di War Room Sebelum Membeli ──
      const currentHoldings = usePortfolioStore.getState().holdings;
      const currentCash = usePortfolioStore.getState().cash;
      const totalNav = currentCash + currentHoldings.reduce((s, h) => {
        const isCrypto = h.assetClass === 'CRYPTO' || h.symbol.endsWith('USDT') || isCryptoSymbol(h.displaySymbol);
        const liveP = liveQuotesMap[h.displaySymbol]?.price || h.currentPrice;
        return s + (isCrypto ? (h.cryptoUnits || h.lots) * liveP * 16000 : (h.shares || h.lots * 100) * liveP);
      }, 0);
      const maxAlloc = totalNav * 0.25;

      const isAllocated = (sym: string) => {
        const clean = sym.toUpperCase();
        const isCrypto = isCryptoSymbol(clean);
        const h = currentHoldings.find((x) => x.displaySymbol.toUpperCase() === clean || x.symbol.replace('.JK', '').replace(/USDT$/i, '').toUpperCase() === clean);
        if (!h) return false;
        const liveP = liveQuotesMap[clean]?.price || h.currentPrice;
        const exp = isCrypto
          ? (h.cryptoUnits || h.lots) * liveP * 16000
          : (h.shares || h.lots * 100) * liveP;
        return exp >= maxAlloc;
      };

      // Pilih kandidat Alpha terbaik dengan Diversifikasi Portofolio Multi-Sektoral & Multi-Faktor:
      // Mengutamakan rotasi ke sektor baru (Energi, Tambang, Consumer, Otomotif, Telco) dan emiten yang belum dimiliki
      const idxMarketCheck = checkIDXMarketStatus();
      const isBEIOpen = idxMarketCheck.isOpen;

      const candidate = selectDiversifiedCandidate(
        result.rankedLeaderboard,
        currentHoldings,
        isBEIOpen,
        selectedStock
      );

      if (autoPilot && candidate && phase === 'IDLE') {
        setSelectedStock(candidate.symbol);
        setPendingWarRoomTarget(candidate.symbol);
      }

      // Picu siklus otonom (monitoring TP/SL portofolio dan background checks).
      // Catatan: skipEquityBuy diset TRUE di sini karena tampilan VirtualAgentOfficeView mengeksekusi
      // pembelian ekuitas secara visual melalui musyawarah Sidang War Room (approveOrder),
      // agar tidak terjadi anomali rapat BMRI tapi bot background membeli saham lain!
      try {
        await runAutonomousAgentCycle(news, liveQuotesMap, { skipEquityBuy: true });
      } catch {
        // cycle error handled gracefully
      }
    } finally {
      setIsScanning(false);
    }
  }, [news, autoPilot, phase]);

  useEffect(() => {
    executeUniverseScan();
    // Siklus evaluasi otonom & rebalancing portofolio setiap 20 detik
    const interval = setInterval(executeUniverseScan, 20000);
    return () => clearInterval(interval);
  }, [executeUniverseScan]);

  const toggleAutoPilot = () => {
    if (!autoPilot) {
      setAutoPilot(true);
      broadcastEvent({ type: 'AI_AGENT_CHANGED' });
      if (scanResult?.topPick) {
        const isBEIOpen = checkIDXMarketStatus().isOpen;
        const validPick = (isBEIOpen || !isIndonesianStock(scanResult.topPick.symbol))
          ? scanResult.topPick.symbol
          : (scanResult.rankedLeaderboard.find((c) => !isIndonesianStock(c.symbol))?.symbol || 'BTC');
        setSelectedStock(validPick);
      }
      executeUniverseScan();
    } else {
      setAutoPilot(false);
      broadcastEvent({ type: 'AI_AGENT_CHANGED' });
    }
  };

  // ── sinkronisasi harga live Binance untuk crypto ──
  const isCryptoSelected = useMemo(() => {
    const a = getAssetBySymbol(selectedStock);
    return a?.category === 'CRYPTO' || ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'AVAX', 'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX', 'RENDER', 'TAO', 'FET', 'ARB', 'OP', 'APT', 'KAS', 'TON'].includes(selectedStock.toUpperCase());
  }, [selectedStock]);

  const liveCryptoTicker = isCryptoSelected
    ? (tickerMap[selectedStock] || tickerMap[`${selectedStock}USDT`] || tickerMap[selectedStock.replace(/USDT$/, '')])
    : undefined;

  useEffect(() => {
    if (liveCryptoTicker) {
      setQuote({
        price: liveCryptoTicker.price,
        changePct: liveCryptoTicker.change24h,
        high: liveCryptoTicker.high24h,
        low: liveCryptoTicker.low24h,
        volume: parseFloat(liveCryptoTicker.volume24h.replace('$', '').replace('B', '000000000').replace('M', '000000')) || 0,
        live: true,
        marketState: '24/7 OPEN (BINANCE LIVE)',
      });
      setHealth((h) => ({ ...h, quoteOk: true, quoteLatencyMs: 12 }));
    }
  }, [liveCryptoTicker]);

  // ── SINKRONISASI AKTIF DENGAN AI OODA ENGINE (Groq Cloud & Gemini Flash) ──
  const [liveAiAnalysis, setLiveAiAnalysis] = useState<{
    loading: boolean;
    decision?: {
      analisis_teknikal: string;
      bandarmologi_verdict: string;
      keputusan: string;
      entry_price: number;
      target_price: number;
      stop_loss: number;
      risk_reward_ratio: number;
      conviction_score: number;
    };
    provider?: string;
    model?: string;
  } | null>(null);

  // ── SINKRONISASI STATUS QUANT BRIDGE VPS 24/7 (38.9.46.160) ──
  const [vpsBridgeStatus, setVpsBridgeStatus] = useState<{
    online: boolean;
    cycles: number;
    openPositionsCount: number;
    equityUsd: number;
    hasCcxt: boolean;
    lastHeartbeat?: number;
    memories: any[];
  }>({
    online: false,
    cycles: 0,
    openPositionsCount: 0,
    equityUsd: 100000,
    hasCcxt: false,
    memories: [],
  });

  useEffect(() => {
    let active = true;
    const fetchVpsState = async () => {
      try {
        const [resStatus, resMem] = await Promise.all([
          fetch('/api/quant', { signal: AbortSignal.timeout(4000) }),
          fetch('/api/quant?action=memory', { signal: AbortSignal.timeout(4000) }),
        ]);
        if (!active) return;
        if (resStatus.ok) {
          const sData = await resStatus.json();
          const mData = resMem.ok ? await resMem.json() : { memories: [] };
          setVpsBridgeStatus({
            online: sData.source === 'VPS_CLOUD_QUANT_BRIDGE_ONLINE' || sData.success === true,
            cycles: sData.daemon?.cycles || 0,
            openPositionsCount: sData.daemon?.open_positions_count || 0,
            equityUsd: sData.daemon?.equity_usd || 100000,
            hasCcxt: sData.daemon?.has_ccxt || false,
            lastHeartbeat: sData.daemon?.last_heartbeat,
            memories: mData.memories || [],
          });
        }
      } catch {
        // bridge offline or network timeout
      }
    };

    fetchVpsState();
    const interval = setInterval(fetchVpsState, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Ambil analisis AI aktual saat emiten atau agen diinspeksi
  useEffect(() => {
    if (!inspectId) {
      setLiveAiAnalysis(null);
      return;
    }
    let isSubscribed = true;
    setLiveAiAnalysis({ loading: true });

    fetch('/api/ai/agent?action=analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker: selectedStock,
        additional_intel: `Inspeksi langsung oleh Agen ${AGENT_BY_ID[inspectId]?.name || inspectId} (${AGENT_BY_ID[inspectId]?.title || ''}). Mengevaluasi setup teknikal dan bandarmologi ${selectedStock}.`,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!isSubscribed) return;
        if (d?.decision) {
          setLiveAiAnalysis({
            loading: false,
            decision: d.decision,
            provider: d.provider || 'GroqCloud-Serverless-24/7',
            model: d.model || 'Llama-3.3-70b-versatile',
          });
        } else {
          setLiveAiAnalysis({ loading: false });
        }
      })
      .catch(() => {
        if (isSubscribed) setLiveAiAnalysis({ loading: false });
      });

    return () => {
      isSubscribed = false;
    };
  }, [inspectId, selectedStock]);

  // ── MODUL 1: BLACK SWAN CRISIS INJECTOR ──
  const [crisisConsoleOpen, setCrisisConsoleOpen] = useState(false);
  const [activeCrisis, setActiveCrisis] = useState<CrisisEventPayload | null>(null);

  const handleInjectCrisis = (crisis: CrisisEventPayload) => {
    setActiveCrisis(crisis);
    setCrisisConsoleOpen(false);
    setAlarm(true);
    // Visual flash and audio alert
    executiveVoice.speak(`Peringatan darurat: Anomali Black Swan terdeteksi! Skenario ${crisis.type}. Pembekuan order non-hedged diaktifkan.`);
    // 3D Holographic Shockwave & Glitch
    globalHoloHub.triggerShockwave(WAR_ROOM.cx, WAR_ROOM.cy, '#ef4444', 360);
    globalAtmosphere.triggerGlitch(1.0);
    ['pm_quant', 'risk_head', 'execution_algo'].forEach((agentId) => {
      const a = simRef.current?.byId[agentId];
      if (a) {
        globalLaserNetwork.fireStream(WAR_ROOM.cx, WAR_ROOM.cy, a.x, a.y, 'RISK_VETO');
      }
    });
  };

  const handleResolveCrisis = () => {
    setActiveCrisis(null);
    setAlarm(false);
    executiveVoice.speak('Skenario darurat selesai. Seluruh sistem kembali ke parameter operasional normal.');
  };

  // ── MODUL 2: POST-MORTEM & MEMORY VAULT ──
  const [postMortemModalOpen, setPostMortemModalOpen] = useState(false);
  const [activePostMortem, setActivePostMortem] = useState<PostMortemEntry | null>(null);
  const [postMortemEntries, setPostMortemEntries] = useState<PostMortemEntry[]>([
    {
      id: 'PM-1',
      tradeId: 'TRD-BTC-SL',
      agentId: 'trader_crypto',
      agentName: 'Kevin Zhang (Crypto Lead)',
      symbol: 'BTC/USDT',
      lossUsd: 1420,
      lossPct: 4.8,
      entryPrice: 98500,
      exitPrice: 93772,
      timestamp: Date.now() - 3600000 * 2,
      rootCause: 'Terjebak false breakout akibat kaskade liquidasi derivatif di jam rollover pasar Asia.',
      cognitiveBlindSpot: 'Mengabaikan rasio Funding Rate yang terlalu panas (> 0.05%) sebelum entry.',
      lessonsLearned: [
        'Wajib memeriksa Open Interest delta sebelum entry momentum.',
        'Kecilkan alokasi per posisi sebesar 15% jika Funding Rate ekstrem.'
      ],
      vectorEmbeddingId: 'VEC-9f82b1-EMBED-1536',
      ruleModulation: [
        {
          parameter: 'Max Exposure Per Breakout',
          beforeValue: 20,
          afterValue: 15,
          adjustmentReason: 'Penurunan batas sizing posisi saat funding panas.'
        },
        {
          parameter: 'Trailing Stop Buffer Pct',
          beforeValue: 3.5,
          afterValue: 4.2,
          adjustmentReason: 'Memperlebar buffer demi menghindari sumbu likuidasi.'
        }
      ]
    },
    {
      id: 'PM-2',
      tradeId: 'TRD-BBRI-SL',
      agentId: 'pm_idx',
      agentName: 'Raditya Pratama (L/S Equity PM)',
      symbol: 'BBRI',
      lossUsd: 890,
      lossPct: 3.2,
      entryPrice: 4720,
      exitPrice: 4568,
      timestamp: Date.now() - 3600000 * 5,
      rootCause: 'Distribusi asing masif bersamaan dengan rilis yield US 10-Year Treasury melonjak.',
      cognitiveBlindSpot: 'Korelasi negatif Rupiah/USD belum terintegrasi ke dalam scoring SMC intraday.',
      lessonsLearned: [
        'Aktifkan veto otomatis jika Foreign Net Sell harian melebihi Rp 500 Miliar.',
        'Gunakan fraksi harga BEI tick kelipatan 25 pada rentang > Rp 5.000.'
      ],
      vectorEmbeddingId: 'VEC-77a41c-EMBED-1536',
      ruleModulation: [
        {
          parameter: 'Foreign Net Sell Tolerance',
          beforeValue: 1000,
          afterValue: 500,
          adjustmentReason: 'Memperketat ambang batas outflow asing.'
        }
      ]
    }
  ]);

  // ── MODUL 3: MERITOCRATIC CAPITAL ALLOCATION & DESK HIERARCHY ──
  const [meritocracyOpen, setMeritocracyOpen] = useState(false);

  // ── MODUL 4: TIME-TRAVEL TIMELINE REPLAY ──
  const [timeTravelOpen, setTimeTravelOpen] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayTick, setReplayTick] = useState(0);
  const [totalRecordedTicks, setTotalRecordedTicks] = useState(0);
  const [activeReplaySnapshot, setActiveReplaySnapshot] = useState<ReplayTickSnapshot | null>(null);

  // ── MODUL 5: ISOMETRIC CCTV ACTION TRACKER ──
  const [showCctv, setShowCctv] = useState<boolean>(true);
  const [cctvAgent, setCctvAgent] = useState<CctvTargetAgent | null>({
    id: 'pm_quant',
    name: 'Dr. Kenji Sato',
    dept: 'Portfolio Strategy',
    role: 'Lead Quantitative Portfolio Manager',
    action: 'Monitoring Alpha Arbitrage Matrix & Liquidity',
    status: 'ACTIVE_EXECUTION',
    confidence: 0.94,
  });

  const handleFocusCctvAgent = useCallback((agentId: string) => {
    const sim = simRef.current;
    if (!sim) return;
    const agent = sim.byId[agentId];
    if (agent) {
      sim.cam.tx = agent.x;
      sim.cam.ty = agent.y;
      sim.cam.tz = 1.15;
      sim.selectedId = agentId;
    }
  }, []);

  // Scrub timeline function
  const handleScrubTick = (tick: number) => {
    setReplayTick(tick);
    setIsReplaying(true);
    const snap = globalReplayEngine.scrubToTick(tick);
    if (snap) {
      setActiveReplaySnapshot(snap);
      // Sinkronkan agen di canvas visual ke koordinat masa lalu
      if (simRef.current && snap.agents) {
        snap.agents.forEach((sa) => {
          const a = simRef.current!.byId[sa.agentId];
          if (a) {
            a.x = sa.x;
            a.y = sa.y;
          }
        });
      }
    }
  };

  const handleToggleReplayPlay = () => {
    setIsReplaying(!isReplaying);
  };

  // ── intelligence & konteks ──
  const intel = useMemo(() => {
    const livePrice = liveCryptoTicker?.price ?? (quote && quote.live ? quote.price : undefined);
    return getGroundedStockIntelligence(selectedStock, livePrice);
  }, [selectedStock, liveCryptoTicker, quote]);

  const portfolio: PortfolioSnapshot = useMemo(
    () => ({
      cash,
      realizedPL,
      holdings: holdings.map((h) => ({
        displaySymbol: h.displaySymbol,
        lots: h.lots,
        shares: h.shares,
        currentPrice: h.currentPrice,
        avgPrice: h.avgPrice,
        unrealizedPL: h.unrealizedPL,
      })),
      orders: orders.map((o) => ({ status: String(o.status) })),
    }),
    [cash, realizedPL, holdings, orders]
  );

  const meritocraticAllocations = useMemo(() => {
    return calculateDynamicAumRouting(
      [
        { id: 'quant_lead', name: 'Dewi Sartika (Quant Alpha)', sharpe: 2.15, winRate: 74, sortino: 2.8 },
        { id: 'pm_idx', name: 'Raditya Pratama (Equity PM)', sharpe: 1.85, winRate: 68, sortino: 2.1 },
        { id: 'trader_crypto', name: 'Kevin Zhang (Crypto Desk)', sharpe: 1.45, winRate: 62, sortino: 1.7 },
        { id: 'cro', name: 'Bambang Soediro (Chief Risk Officer)', sharpe: 1.10, winRate: 58, sortino: 1.3 },
        { id: 'macro_lead', name: 'Dr. Faisal Basri (Macro Strategist)', sharpe: 0.85, winRate: 52, sortino: 0.9 },
        { id: 'sentiment_analyst', name: 'Marsha Timothy (Newsroom)', sharpe: 0.65, winRate: 48, sortino: 0.7 },
      ],
      Math.round(portfolioNav(portfolio) / 16000) || 100000
    );
  }, [portfolio]);

  // Rekam tick ke globalReplayEngine setiap 2 detik
  useEffect(() => {
    if (isReplaying) return;
    const interval = setInterval(() => {
      const agents = simRef.current?.agents || [];
      const currentTickIdx = globalReplayEngine.recordTick(
        Math.round(portfolioNav(portfolio) / 16000) || 100000,
        quote?.price || 1,
        selectedStock,
        activeCrisis ? 'CRITICAL_BLACK_SWAN' : 'NORMAL',
        agents.map((a) => ({ id: a.def.id, x: a.x, y: a.y, state: a.mode }))
      );
      setTotalRecordedTicks(currentTickIdx + 1);
      setReplayTick(currentTickIdx);
    }, 2000);
    return () => clearInterval(interval);
  }, [portfolio, quote, selectedStock, activeCrisis, isReplaying]);

  const ctxData: DeskContext = useMemo(
    () => ({
      symbol: selectedStock,
      intel,
      quote,
      news,
      macro,
      events: BLOOMBERG_ECONOMIC_EVENTS,
      health,
      portfolio,
      todayIso,
    }),
    [selectedStock, intel, quote, news, macro, health, portfolio, todayIso]
  );

  const reports = useMemo(() => {
    const out: Record<string, AgentReport> = {};
    FIRM_AGENTS.forEach((a) => (out[a.id] = buildAgentReport(a.id, ctxData)));
    return out;
  }, [ctxData]);

  // ── Siklus Cuaca Pasar Bursa & Jam Kantor (Dimensi 4: Market Weather) ──
  const currentHourWIB = useMemo(() => {
    try {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wibTime = new Date(utc + 3600000 * 7);
      return wibTime.getHours();
    } catch {
      return new Date().getHours();
    }
  }, [tick]);

  const marketWeather = useMemo<MarketWeather>(() => {
    // Jam 17:00 WIB s/d 08:00 WIB bursa saham reguler tutup (Night Mode / Global & Crypto Session)
    if (currentHourWIB >= 17 || currentHourWIB < 8) {
      return 'NIGHT_MODE';
    }
    const chg = quote?.changePct ?? liveCryptoTicker?.change24h ?? 0;
    if (chg >= 0) {
      return 'BULLISH_SUNNY';
    }
    return 'BEARISH_RAIN';
  }, [currentHourWIB, quote?.changePct, liveCryptoTicker?.change24h]);

  useEffect(() => {
    if (simRef.current) {
      simRef.current.weather = marketWeather;
    }
  }, [marketWeather]);

  // Status Jadwal Perdagangan Bursa Efek Indonesia (IDX / BEI)
  const idxMarketStatus = useMemo(() => checkIDXMarketStatus(), [tick]);

  const liveDecision = useMemo(() => computeCommitteeDecision(ctxData), [ctxData]);
  const liveSizing = useMemo(() => computePositionSizing(intel, portfolio), [intel, portfolio]);

  // sinkron ke simulasi
  useEffect(() => {
    const sim = simRef.current!;
    sim.reports = reports;
    const topEval = scanResult?.rankedLeaderboard.find((x) => x.symbol === selectedStock);
    const rankLabel = topEval ? `#${topEval.rank}` : '';
    sim.board = {
      symbol: rankLabel ? `${selectedStock} (${rankLabel})` : selectedStock,
      price: fmtMoney(intel, quote?.price ?? intel.currentPrice),
      change: quote ? `${quote.changePct >= 0 ? '+' : ''}${quote.changePct.toFixed(2)}%` : '',
      live: !!quote?.live,
      headline: autoPilot && scanResult?.topPick
        ? `🤖 AI AUTOPILOT TOP PICK: #${scanResult.topPick.rank} ${scanResult.topPick.symbol} (${scanResult.topPick.score}/100) — ${scanResult.topPick.keyDrivers[0] || ''}`
        : news[0] ? `${news[0].source}: ${news[0].title}` : '',
    };
  }, [reports, selectedStock, intel, quote, news, scanResult, autoPilot]);

  // ── fetch data live ──
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadNews = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch('/api/crawler/news?limit=40', { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        const latency = Math.round(performance.now() - t0);
        if (json?.success) {
          setNews(json.articles as NewsItem[]);
          setHealth((h) => ({
            ...h,
            newsOk: true,
            newsLatencyMs: latency,
            newsTotalInCache: json.meta?.totalCrawledInCache ?? json.articles.length,
            newsSources: json.meta?.sourcesMonitored ?? 0,
            newsLastCrawledAt: json.meta?.lastCrawledAt ?? null,
          }));
        } else setHealth((h) => ({ ...h, newsOk: false, newsLatencyMs: latency }));
      } catch {
        if (!cancelled) setHealth((h) => ({ ...h, newsOk: false }));
      }
    };
    loadNews();
    const id = setInterval(loadNews, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/openbb/macro')
      .then((r) => r.json())
      .then((m) => !cancelled && setMacro(m as MacroSnapshot))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setQuote(null);
    const loadQuote = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`/api/stocks/realtime?tickers=${encodeURIComponent(selectedStock)}`, { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        const q = json?.quotes?.[selectedStock];
        const latency = Math.round(performance.now() - t0);
        if (q) {
          setQuote({
            price: q.price,
            changePct: q.changePct,
            high: q.high,
            low: q.low,
            volume: q.volume,
            live: !!q.live,
            marketState: q.marketState,
          });
          setHealth((h) => ({ ...h, quoteOk: true, quoteLatencyMs: latency }));
        } else setHealth((h) => ({ ...h, quoteOk: false, quoteLatencyMs: latency }));
      } catch {
        if (!cancelled) setHealth((h) => ({ ...h, quoteOk: false }));
      }
    };
    loadQuote();
    const id = setInterval(loadQuote, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [selectedStock]);

  // refresh roster tiap detik
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // ── aset & static layer ──
  useEffect(() => {
    let cancelled = false;
    loadAssets().then((assets) => {
      if (cancelled) return;
      const sim = simRef.current!;
      sim.assets = assets;
      sim.staticLayer = buildStaticLayer(assets);
      setAssetsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── kamera ──
  const clampCam = useCallback((sim: Sim) => {
    const { w, h } = sim.view;
    const vw = w / sim.cam.tz;
    const vh = h / sim.cam.tz;
    sim.cam.tx = clamp(sim.cam.tx, -vw * 0.3, WORLD_W - vw * 0.7);
    sim.cam.ty = clamp(sim.cam.ty, -vh * 0.3, WORLD_H - vh * 0.7);
  }, []);

  const flyTo = useCallback(
    (cx: number, cy: number, zoom: number) => {
      const sim = simRef.current!;
      const z = clamp(zoom, sim.fitZoom * 0.9, 3);
      sim.cam.tz = z;
      sim.cam.tx = cx - sim.view.w / z / 2;
      sim.cam.ty = cy - sim.view.h / z / 2;
      clampCam(sim);
    },
    [clampCam]
  );

  const fitAll = useCallback(() => {
    flyTo(WORLD_W / 2, WORLD_H / 2, simRef.current!.fitZoom);
  }, [flyTo]);

  const zoomBy = useCallback(
    (factor: number) => {
      const sim = simRef.current!;
      const cx = sim.cam.tx + sim.view.w / sim.cam.tz / 2;
      const cy = sim.cam.ty + sim.view.h / sim.cam.tz / 2;
      flyTo(cx, cy, sim.cam.tz * factor);
    },
    [flyTo]
  );

  const flyToDept = useCallback(
    (id: DeptId) => {
      const sim = simRef.current!;
      const d = DEPT_BY_ID[id];
      const z = Math.min(sim.view.w / (d.w + 80), sim.view.h / (d.h + 80));
      flyTo(d.x + d.w / 2, d.y + d.h / 2, z);
    },
    [flyTo]
  );

  // ── ukuran canvas ──
  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    let first = true;
    const apply = () => {
      const sim = simRef.current!;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      sim.view = { w, h, dpr };
      sim.fitZoom = Math.min(w / WORLD_W, h / WORLD_H);
      if (first) {
        first = false;
        sim.cam.zoom = sim.cam.tz = sim.fitZoom;
        sim.cam.x = sim.cam.tx = WORLD_W / 2 - w / sim.fitZoom / 2;
        sim.cam.y = sim.cam.ty = WORLD_H / 2 - h / sim.fitZoom / 2;
      } else if (sim.cam.tz < sim.fitZoom * 0.9) {
        sim.cam.tz = sim.fitZoom;
      }
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  // ── game loop with visibility state throttling ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const mini = miniRef.current;
    if (!canvas || !mounted) return;
    const ctx = canvas.getContext('2d');
    const mctx = mini?.getContext('2d') ?? null;
    if (!ctx) return;
    let raf = 0;
    const MW = 220;
    const MH = Math.round((220 * WORLD_H) / WORLD_W);

    let isVisible = typeof document !== 'undefined' ? !document.hidden : true;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && simRef.current) {
        simRef.current.time = performance.now() / 1000;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const loop = (t: number) => {
      // Throttle jika tab sedang di latar belakang / minimize untuk menghemat CPU & GPU
      if (!isVisible) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const sim = simRef.current!;
      const now = t / 1000;
      const dt = sim.time ? Math.min(0.05, now - sim.time) : 0.016;
      sim.time = now;

      sim.agents.forEach((a) => stepAgent(sim, a, dt, now));

      const c = sim.cam;
      c.x += (c.tx - c.x) * 0.16;
      c.y += (c.ty - c.y) * 0.16;
      c.zoom += (c.tz - c.zoom) * 0.16;

      // Zero-allocation real-time quote refresh langsung dari LockFreeMarketRingBuffer
      if (sim.board && sim.board.symbol) {
        const rawSym = sim.board.symbol.split(' ')[0].replace(/[^A-Za-z0-9]/g, '');
        const latestTick = globalTickBuffer.getLatest(rawSym + 'USDT') || globalTickBuffer.getLatest(rawSym);
        if (latestTick) {
          sim.board.price = `$${latestTick.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          sim.board.change = `${latestTick.change24h >= 0 ? '+' : ''}${latestTick.change24h.toFixed(2)}%`;
          sim.board.live = true;
        }
      }

      renderFrame(ctx, sim, now, dt);
      if (mctx && mini) {
        const dpr = sim.view.dpr;
        if (mini.width !== MW * dpr) {
          mini.width = MW * dpr;
          mini.height = MH * dpr;
        }
        renderMini(mctx, sim, MW, MH, dpr);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [mounted]);

  // ── interaksi pointer ──
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragInfo = useRef({ moved: 0, startX: 0, startY: 0, pinchDist: 0 });

  const screenToWorld = (sx: number, sy: number) => {
    const sim = simRef.current!;
    return { x: sim.cam.x + sx / sim.cam.zoom, y: sim.cam.y + sy / sim.cam.zoom };
  };

  const pickAgent = (wx: number, wy: number): AgentRT | null => {
    const sim = simRef.current!;
    let best: AgentRT | null = null;
    let bestD = 34;
    sim.agents.forEach((a) => {
      const bodyY = (a.mode === 'SIT' ? a.slot.seatY : a.y) - CHAR_H / 2;
      const d = Math.hypot(a.x - wx, bodyY - wy);
      if (d < bestD) {
        bestD = d;
        best = a;
      }
      // klik pada mejanya juga memilih agen
      if (Math.abs(wx - a.slot.dx) < DESK_W / 2 && wy > a.slot.dy - 24 && wy < a.slot.dy + 40 && bestD > 30) {
        bestD = 30;
        best = a;
      }
    });
    return best;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointers.current.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfo.current = { moved: 0, startX: e.clientX, startY: e.clientY, pinchDist: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current!;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const prev = pointers.current.get(e.pointerId);

    if (!prev) {
      const w = screenToWorld(px, py);
      const hit = pickAgent(w.x, w.y);
      sim.hoverId = hit ? hit.def.id : null;
      e.currentTarget.style.cursor = hit ? 'pointer' : 'grab';
      return;
    }

    pointers.current.set(e.pointerId, { x: px, y: py });
    if (pointers.current.size === 2) {
      const [p1, p2] = Array.from(pointers.current.values());
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (dragInfo.current.pinchDist > 0) {
        const factor = dist / dragInfo.current.pinchDist;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const before = { x: sim.cam.x + mx / sim.cam.zoom, y: sim.cam.y + my / sim.cam.zoom };
        const z = clamp(sim.cam.zoom * factor, sim.fitZoom * 0.9, 3);
        sim.cam.zoom = sim.cam.tz = z;
        sim.cam.x = sim.cam.tx = before.x - mx / z;
        sim.cam.y = sim.cam.ty = before.y - my / z;
      }
      dragInfo.current.pinchDist = dist;
      dragInfo.current.moved = 99;
      return;
    }

    const dx = px - prev.x;
    const dy = py - prev.y;
    dragInfo.current.moved += Math.abs(dx) + Math.abs(dy);
    if (dragInfo.current.moved > 5) {
      sim.cam.x -= dx / sim.cam.zoom;
      sim.cam.y -= dy / sim.cam.zoom;
      sim.cam.tx = sim.cam.x;
      sim.cam.ty = sim.cam.y;
      sim.cam.tz = sim.cam.zoom;
      clampCam(sim);
      sim.cam.x = sim.cam.tx;
      sim.cam.y = sim.cam.ty;
      e.currentTarget.style.cursor = 'grabbing';
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const wasClick = dragInfo.current.moved <= 5 && pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    dragInfo.current.pinchDist = 0;
    if (!wasClick) return;
    const w = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const hit = pickAgent(w.x, w.y);
    const sim = simRef.current!;
    if (hit) {
      sim.selectedId = hit.def.id;
      setInspectId(hit.def.id);
      return;
    }
    // klik meja War Room
    const dx = (w.x - WAR_ROOM.cx) / (WAR_ROOM.tableRx + 10);
    const dy = (w.y - WAR_ROOM.cy) / (WAR_ROOM.tableRy + 10);
    if (dx * dx + dy * dy <= 1) {
      if (phase === 'IDLE') startDebate();
      else resetDebate();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sim = simRef.current!;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const z = clamp(sim.cam.tz * factor, sim.fitZoom * 0.9, 3);
      const wx = sim.cam.tx + mx / sim.cam.tz;
      const wy = sim.cam.ty + my / sim.cam.tz;
      sim.cam.tz = z;
      sim.cam.tx = wx - mx / z;
      sim.cam.ty = wy - my / z;
      clampCam(sim);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [clampCam, mounted]);

  const onMiniPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.type === 'pointermove' && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const wx = ((e.clientX - rect.left) / rect.width) * WORLD_W;
    const wy = ((e.clientY - rect.top) / rect.height) * WORLD_H;
    const sim = simRef.current!;
    flyTo(wx, wy, sim.cam.tz);
  };

  // ── sidang IC ──
  const startDebate = useCallback(() => {
    const isIndo = isIndonesianStock(selectedStock);
    const idxCheck = isIndo ? checkIDXMarketStatus() : null;
    if (isIndo && idxCheck && !idxCheck.isOpen) {
      // Bursa BEI sedang tutup: dilarang rapat untuk saham Indonesia! Alihkan ke Kripto / Saham Global aktif
      const nonIndoCandidate = scanResult?.rankedLeaderboard.find((c) => !isIndonesianStock(c.symbol))?.symbol || 'BTC';
      setSelectedStock(nonIndoCandidate);
      return;
    }

    const rawDecision = computeCommitteeDecision(ctxData);
    const sizing = computePositionSizing(intel, portfolio);
    const activeEval = scanResult?.rankedLeaderboard.find((x) => x.symbol === selectedStock) ?? scanResult?.topPick;

    // War Room dibentuk khusus untuk musyawarah pembelian saham rekomendasi:
    const decision: CommitteeDecision = {
      decision: 'BUY',
      score: Math.max(2, rawDecision.score),
      factors: rawDecision.factors.length ? rawDecision.factors : ['Rekomendasi Alpha Engine terkonfirmasi untuk akumulasi beli'],
    };

    const isCrypto = isCryptoSymbol(selectedStock);
    const liveCryptoPrice = isCrypto
      ? (liveCryptoTicker?.price ?? tickerMap[selectedStock]?.price ?? tickerMap[`${selectedStock}USDT`]?.price)
      : undefined;
    const validEntry = isCrypto
      ? (liveCryptoPrice && liveCryptoPrice > 0 ? liveCryptoPrice : (sizing.entry || intel.currentPrice || 1))
      : roundTick(sizing.entry || intel.currentPrice || 500);
    const validStop = isCrypto
      ? (sizing.stop || Math.round(validEntry * 0.95))
      : roundTick(sizing.stop || Math.round(validEntry * 0.96));
    const validTp = isCrypto
      ? (sizing.takeProfit || Math.round(validEntry * 1.08))
      : roundTick(sizing.takeProfit || Math.round(validEntry * 1.06));

    const targetCryptoBudgetIDR = Math.min(Math.max(2_500_000, Math.floor(portfolio.cash * 0.08)), 25_000_000);
    const targetCryptoBudgetUSD = targetCryptoBudgetIDR / 16000;
    const cryptoUnits = Number((targetCryptoBudgetUSD / Math.max(0.000001, validEntry)).toFixed(6)) || 0.05;

    const validSizing: PositionSizing = {
      ...sizing,
      ok: true,
      reason: 'OK',
      lots: isCrypto ? cryptoUnits : Math.max(1, sizing.lots || 1),
      entry: validEntry,
      stop: validStop,
      takeProfit: validTp,
      riskIdr: isCrypto ? Math.round(targetCryptoBudgetIDR * 0.05) : Math.max(1, sizing.lots || 1) * 100 * Math.max(1, validEntry - validStop),
      notional: isCrypto ? targetCryptoBudgetIDR : Math.max(1, sizing.lots || 1) * 100 * validEntry,
    };

    setSnapshot({ script: buildDebateScript(ctxData, activeEval), decision, sizing: validSizing, symbol: selectedStock });
    setStep(0);
    setPhase('RUNNING');
    // Sinkronisasi status sidang ke seluruh background AI engine
    useAIAgentStore.getState().setActiveDeliberatingTicker(selectedStock);
    useAIAgentStore.getState().setActiveAgentTask(`Sidang War Room Paripurna: Deliberasi ${selectedStock} oleh Dewan Komite Investasi`);
    setAlarm(false);
    setOrderResult(null);
    setPanelTab('TRANSCRIPT');
    flyTo(WAR_ROOM.cx, WAR_ROOM.cy, Math.min(simRef.current!.view.w / 900, simRef.current!.view.h / 560));
  }, [ctxData, intel, portfolio, selectedStock, flyTo, scanResult]);

  const resetDebate = useCallback(() => {
    executiveVoice.stop();
    useAIAgentStore.getState().setActiveDeliberatingTicker(null);
    setPhase('IDLE');
    setStep(-1);
    setAlarm(false);
    setSnapshot(null);
    setOrderResult(null);
  }, []);

  // Hentikan suara vokal & reset ticker sidang jika sidang keluar dari fase RUNNING
  useEffect(() => {
    if (phase !== 'RUNNING') {
      executiveVoice.stop();
      if (phase === 'IDLE') {
        useAIAgentStore.getState().setActiveDeliberatingTicker(null);
      }
    }
  }, [phase]);

  // Bersihkan ticker deliberasi saat unmount komponen
  useEffect(() => {
    return () => {
      useAIAgentStore.getState().setActiveDeliberatingTicker(null);
    };
  }, []);

  // ganti saham saat sidang → bubarkan
  const prevStock = useRef(selectedStock);
  useEffect(() => {
    if (prevStock.current !== selectedStock) {
      prevStock.current = selectedStock;
      resetDebate();
    }
  }, [selectedStock, resetDebate]);

  // Proteksi di luar jam bursa: Jika BEI TUTUP dan selectedStock adalah saham Indonesia,
  // otomatis bubarkan sidang BEI dan alihkan ke aset aktif Kripto (24/7) atau Saham Global.
  useEffect(() => {
    const isIndo = isIndonesianStock(selectedStock);
    if (!idxMarketStatus.isOpen && isIndo) {
      const activeAsset = scanResult?.rankedLeaderboard.find((c) => !isIndonesianStock(c.symbol))?.symbol || 'BTC';
      setSelectedStock(activeAsset);
      if (phase === 'RUNNING') {
        resetDebate();
      }
    }
  }, [idxMarketStatus.isOpen, selectedStock, scanResult, phase, resetDebate]);

  // Otomatis kumpulkan seluruh departemen di War Room ketika ada target pembelian saham baru
  useEffect(() => {
    if (pendingWarRoomTarget && pendingWarRoomTarget === selectedStock && phase === 'IDLE') {
      setPendingWarRoomTarget(null);
      startDebate();
    }
  }, [pendingWarRoomTarget, selectedStock, phase, startDebate]);

  // kemajuan sidang
  useEffect(() => {
    if (phase !== 'RUNNING' || !snapshot) return;
    const script = snapshot.script;
    if (step < script.length - 1) {
      const delay = 3500 + script[step].text.length * 26;
      const t = setTimeout(() => setStep((s) => s + 1), delay);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase('DONE');
      if (snapshot.decision.decision === 'BUY' && snapshot.sizing.ok) setAlarm(true);
    }, 4000 + script[script.length - 1].text.length * 20);
    return () => clearTimeout(t);
  }, [phase, step, snapshot]);

  // sinkron sidang → simulasi (kursi, pembicara, sirine) & Web Speech API Voice
  useEffect(() => {
    const sim = simRef.current!;
    const meeting = phase !== 'IDLE';
    // HANYA PARA PETINGGI SAJA YANG RAPAT (C-Level & Kepala Divisi)
    const executives = sim.agents.filter((a) => a.def.committee);
    if (meeting && !sim.meeting) {
      const seats = warRoomSeats(executives.length);
      executives.forEach((a, i) => {
        a.seat = seats[i];
        a.bubble = null;
        goTo(sim, a, seats[i].x, seats[i].y, 'SEAT');
      });
    } else if (!meeting && sim.meeting) {
      executives.forEach((a) => {
        if (a.dest === 'SEAT' || a.mode === 'MEETING') {
          a.seat = null;
          goHome(sim, a);
        }
      });
    }
    sim.meeting = meeting;
    const line = phase === 'RUNNING' && snapshot ? snapshot.script[step] : null;
    sim.speakerId = line ? line.agentId : null;
    sim.speakerText = line ? line.text : '';
    if (line) {
      const speaker = sim.byId[line.agentId];
      if (speaker) {
        speaker.bubble = { text: line.text, from: performance.now() / 1000, until: performance.now() / 1000 + 4.5 };
        // Laser spline dari speaker ke meja War Room
        globalLaserNetwork.fireStream(speaker.x, speaker.y, WAR_ROOM.cx, WAR_ROOM.cy, 'SIGNAL_TRADE');
        // Pulse shockwave pada holographic market hub
        globalHoloHub.triggerShockwave(WAR_ROOM.cx, WAR_ROOM.cy, '#38bdf8', 180);
        // Sinkronisasi CCTV target
        setCctvAgent({
          id: speaker.def.id,
          name: speaker.def.name,
          dept: DEPT_BY_ID[speaker.def.dept].name,
          role: speaker.def.role,
          action: line.text,
          status: 'WAR_ROOM_DEBATE',
          confidence: 0.92,
        });
      }
      if (voiceEnabled) {
        executiveVoice.speak(line.agentId, line.text);
      }
    }
    sim.alarm = alarm;
  }, [phase, step, snapshot, alarm, voiceEnabled]);

  const approveOrder = useCallback(() => {
    if (!snapshot) return;
    const sz = snapshot.sizing;
    const cleanSym = snapshot.symbol.toUpperCase();
    const isCrypto = isCryptoSymbol(cleanSym);
    const isIDR = !isCrypto && !isUSSymbol(cleanSym);

    // ── ATURAN STRICT JAM BURSA BEI ──
    // Saham BEI (Indonesia): Bot DILARANG membeli di luar jam bursa resmi (Senin–Jumat 09:00–16:00 WIB)
    // Kripto dan Saham Luar Negeri: Bebas trading kapan saja (24/7/365 nonstop)
    const isBEI = isIDR && isIndonesianStock(cleanSym);
    if (isBEI) {
      const marketCheck = checkIDXMarketStatus();
      if (!marketCheck.isOpen) {
        setOrderResult({
          ok: false,
          msg: `⛔ Order Beli Saham BEI Ditolak di Luar Jam Bursa: ${marketCheck.message} ${marketCheck.nextOpenNotice} Bot dilarang membeli saham BEI di luar jam bursa (09:00–16:00 WIB). Kripto dan saham global bebas aktif 24 jam.`,
        });
        return;
      }
    }

    const liveCryptoPrice = isCrypto
      ? (liveCryptoTicker?.price ?? tickerMap[cleanSym]?.price ?? tickerMap[`${cleanSym}USDT`]?.price)
      : undefined;
    const entryPrice = isCrypto
      ? (liveCryptoPrice && liveCryptoPrice > 0 ? liveCryptoPrice : (sz.entry || intel.currentPrice || 1))
      : (isIDR ? roundTick(quote?.price || sz.entry || intel.currentPrice || 500) : (quote?.price || sz.entry || intel.currentPrice || 1));

    const store = usePortfolioStore.getState();
    const rate = 16000;
    const availableCash = store.cash;

    const MIN_BOT_CASH_RESERVE = 1_000_000;
    // Proteksi modal: trading bot TIDAK membeli jika sisa kas di bawah Rp 1.000.000
    if (availableCash < MIN_BOT_CASH_RESERVE) {
      setOrderResult({
        ok: false,
        msg: `⛔ Batas Minimum Kas Tercapai (< Rp 1.000.000): Saldo kas saat ini Rp ${Math.round(availableCash).toLocaleString('id-ID')}. Sesuai aturan manajemen risiko modal, bot dilarang membeli saham atau crypto saat sisa kas di bawah Rp 1 Juta demi menjaga cadangan modal.`,
      });
      return;
    }

    const usableCash = Math.max(0, availableCash - MIN_BOT_CASH_RESERVE);
    let orderLots: number;

    if (isCrypto) {
      const maxCryptoBudgetIDR = Math.min(Math.max(500_000, Math.floor(usableCash * 0.20)), usableCash);
      const targetCryptoBudgetUSD = maxCryptoBudgetIDR / rate;
      const cryptoUnits = Number((targetCryptoBudgetUSD / Math.max(0.000001, entryPrice)).toFixed(6));
      if (cryptoUnits <= 0 || usableCash < 500_000) {
        setOrderResult({
          ok: false,
          msg: `⛔ Sisa Kas Cadangan Tidak Mencukupi: Membeli kripto ${cleanSym} membutuhkan minimal Rp 500.000 dari sisa kas aktif, sementara kas aktif setelah cadangan Rp 1 Juta hanya Rp ${Math.round(usableCash).toLocaleString('id-ID')}.`,
        });
        return;
      }
      orderLots = cryptoUnits;
    } else {
      const costPerLot = entryPrice * 100 * 1.0015;
      const maxAffordableLots = Math.floor(usableCash / costPerLot);
      if (maxAffordableLots < 1) {
        setOrderResult({
          ok: false,
          msg: `⛔ Sisa Kas Tidak Mencukupi: Membeli 1 lot ${cleanSym} memerlukan Rp ${Math.round(costPerLot).toLocaleString('id-ID')}, namun sisa kas setelah cadangan minimum Rp 1 Juta hanya Rp ${Math.round(usableCash).toLocaleString('id-ID')}. Bot tidak diizinkan melanggar batas cadangan Rp 1 Juta.`,
        });
        return;
      }
      // Sesuaikan lots yang disetujui agar tidak melebihi sisa kas yang tersedia
      orderLots = Math.min(Math.max(1, sz.lots || 1), maxAffordableLots);
    }

    const stopPrice = isCrypto
      ? Number((entryPrice * 0.935).toFixed(entryPrice < 1 ? 6 : (entryPrice < 50 ? 4 : 2)))
      : isIDR
      ? roundTick(sz.stop && sz.stop < entryPrice ? sz.stop : Math.round(entryPrice * 0.94))
      : Number((sz.stop && sz.stop < entryPrice ? sz.stop : entryPrice * 0.94).toFixed(2));
    const tpPrice = isCrypto
      ? Number((entryPrice * 1.15).toFixed(entryPrice < 1 ? 6 : (entryPrice < 50 ? 4 : 2)))
      : isIDR
      ? roundTick(sz.takeProfit && sz.takeProfit > entryPrice ? sz.takeProfit : Math.round(entryPrice * 1.10))
      : Number((sz.takeProfit && sz.takeProfit > entryPrice ? sz.takeProfit : entryPrice * 1.10).toFixed(2));

    const tradeValue = isCrypto
      ? Math.round(entryPrice * orderLots * rate)
      : entryPrice * orderLots * 100;
    const fee = Math.round(tradeValue * (isCrypto ? 0.001 : 0.0015));
    const totalCost = tradeValue + fee;

    // Validasi final: pastikan kas benar-benar mencukupi dan menyisakan cadangan Rp 1 Juta
    if (store.cash < totalCost || (store.cash - totalCost < MIN_BOT_CASH_RESERVE)) {
      setOrderResult({
        ok: false,
        msg: `⛔ Pelanggaran Batas Cadangan Kas: Total pembelian Rp ${Math.round(totalCost).toLocaleString('id-ID')} akan menyisakan kas Rp ${Math.round(store.cash - totalCost).toLocaleString('id-ID')} (di bawah batas minimum Rp 1.000.000). Order dibatalkan demi proteksi modal.`,
      });
      return;
    }

    const res = store.placeBuyOrder({
      symbol: isCrypto ? `${cleanSym}USDT` : `${cleanSym}.JK`,
      displaySymbol: cleanSym,
      price: entryPrice,
      lots: orderLots,
      name: isCrypto ? `${intel.name} (Crypto Spot)` : intel.name,
      orderType: 'LIMIT',
      assetClass: isCrypto ? 'CRYPTO' : 'EQUITY',
      currency: isCrypto ? 'USDT' : 'IDR',
      exchangeRate: isCrypto ? rate : undefined,
      takeProfitPrice: tpPrice,
      stopLossPrice: stopPrice,
      validityType: 'DAY',
      source: 'AI_AGENT',
    });

    if (res.error) {
      setOrderResult({ ok: false, msg: res.error });
    } else {
      if (simRef.current) {
        triggerConfetti(simRef.current, 130);
        globalHoloHub.triggerShockwave(WAR_ROOM.cx, WAR_ROOM.cy, '#10b981', 340);
        const pm = simRef.current.byId['pm_quant'];
        if (pm) {
          globalLaserNetwork.fireStream(WAR_ROOM.cx, WAR_ROOM.cy, pm.slot.dx, pm.slot.dy, 'SIGNAL_TRADE');
        }
      }
      const qtyLabel = isCrypto ? `${orderLots} unit` : `${orderLots} lot`;
      const priceLabel = isCrypto ? `$${entryPrice.toLocaleString('en-US')}` : `Rp ${entryPrice.toLocaleString('id-ID')}`;
      setOrderResult({
        ok: true,
        msg: `Order eksekusi disetujui Sidang War Room: BUY ${qtyLabel} ${snapshot.symbol} @ ${priceLabel} setelah musyawarah seluruh departemen (SL ${stopPrice} / TP ${tpPrice})`,
      });

      // Catat ke useAIAgentStore
      useAIAgentStore.getState().logAction({
        type: 'TRADE_BUY',
        symbol: snapshot.symbol,
        agentId: isCrypto ? 'trader_crypto' : 'pm_idx',
        agentName: isCrypto ? 'Kevin Zhang (Jesse Crypto Desk Lead)' : 'Raditya Pratama (L/S Equity PM)',
        agentEmoji: isCrypto ? '⚡' : '💼',
        title: isCrypto
          ? `Sidang War Room Paripurna: Order Spot Crypto BUY ${snapshot.symbol}`
          : `Sidang War Room Paripurna: Order BUY ${snapshot.symbol}`,
        details: isCrypto
          ? `Seluruh pimpinan eksekutif dan Kevin Zhang (Jesse Crypto Desk Lead) berkumpul di War Room dan sepakat bulat mengeksekusi pembelian spot ${qtyLabel} @ ${priceLabel} (SL: ${stopPrice} / TP: ${tpPrice}).`
          : `Seluruh pimpinan eksekutif telah bermusyawarah di War Room dan sepakat bulat mengeksekusi pembelian ${qtyLabel} @ ${priceLabel} (SL: ${stopPrice} / TP: ${tpPrice}).`,
        metadata: {
          price: entryPrice,
          lots: orderLots,
          amount: tradeValue,
          stopLoss: stopPrice,
          takeProfit: tpPrice,
        },
      });

      // ── SINKRONISASI AI QUANT 24/7 (VPS LINUX CLOUD) ──
      // 1. Kirim sinyal order live ke Freqtrade / Lumibot di VPS
      dispatchToQuantBridge({
        engine: isCrypto ? 'freqtrade' : 'lumibot',
        action: 'BUY',
        ticker: snapshot.symbol,
        price: entryPrice,
        stopLoss: stopPrice,
        targetPrice: tpPrice,
        reason: `War Room Consensus Approval: ${qtyLabel} @ ${priceLabel}`,
      });

      // 2. Tulis penalaran ke Episodic Memory SQLite di VPS 24/7
      recordQuantMemoryToVPS({
        symbol: snapshot.symbol,
        decision: 'BUY',
        entry_price: entryPrice,
        target_price: tpPrice,
        stop_loss: stopPrice,
        justification: `Sidang War Room Paripurna menyetujui BUY ${qtyLabel} @ ${priceLabel}`,
        post_trade_reflection: `Eksekusi disahkan oleh konsensus PM, Quant, dan Risk Officer dengan Risk-Reward Ratio terverifikasi.`,
        market_regime: isCrypto ? 'CRYPTO_MOMENTUM_24_7' : 'IDX_VALUE_SMC',
      });

      useAIAgentStore.getState().recordTradeStat(true);
      broadcastEvent({ type: 'PORTFOLIO_CHANGED' });
      broadcastEvent({ type: 'AI_AGENT_CHANGED' });
      broadcastEvent({
        type: 'TRADE_EXECUTED_ALERT',
        message: `War Room AI: BUY ${qtyLabel} ${snapshot.symbol} @ ${priceLabel}`,
      });
    }
    setAlarm(false);
  }, [snapshot, intel.name, intel.currentPrice]);

  // Kuasa Penuh AI: Auto-Approve ketika sidang selesai dan autoPilot aktif
  useEffect(() => {
    if (phase === 'DONE' && autoPilot && snapshot && !orderResult) {
      const timer = setTimeout(() => {
        approveOrder();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, autoPilot, snapshot, orderResult, approveOrder]);

  // Otomatis bubarkan sidang setelah selesai agar petinggi kembali ke meja kerja dan AI siap rotasi ke saham berikutnya
  useEffect(() => {
    if (phase === 'DONE') {
      const timeoutMs = orderResult ? 6000 : (autoPilot ? 3000 : 15000);
      const resetTimer = setTimeout(() => {
        if (!orderResult && autoPilot) {
          approveOrder();
        }
        resetDebate();
      }, timeoutMs);
      return () => clearTimeout(resetTimer);
    }
  }, [phase, autoPilot, orderResult, resetDebate, approveOrder]);

  const rejectOrder = () => {
    setOrderResult({ ok: false, msg: 'Order DITOLAK oleh manusia. Tidak ada posisi dibuka.' });
    setAlarm(false);
  };

  // ── turunan UI ──
  const agentsRT = simRef.current!.agents;
  void tick;

  const activityText = (a: AgentRT): string => {
    const rep = reports[a.def.id];
    switch (a.mode) {
      case 'SIT':
        return rep ? rep.task : 'Bekerja';
      case 'WALK':
        if (a.dest === 'VISIT' && a.visitId) return `Menuju meja ${AGENT_BY_ID[a.visitId].name.split(' ')[0]}`;
        if (a.dest === 'COFFEE') return 'Menuju pantry';
        if (a.dest === 'SEAT') return 'Menuju War Room';
        return 'Kembali ke meja';
      case 'TALK':
        return a.visitId ? `Berdiskusi dengan ${AGENT_BY_ID[a.visitId].name.split(' ')[0]}` : 'Berdiskusi';
      case 'BREAK':
        return 'Istirahat kopi';
      case 'MEETING':
        return 'Rapat Investment Committee';
    }
  };

  const inspected = inspectId ? simRef.current!.byId[inspectId] : null;
  const inspectedReport = inspectId ? reports[inspectId] : null;

  const modeCounts = useMemo(() => {
    const m: Record<Mode, number> = { SIT: 0, WALK: 0, TALK: 0, BREAK: 0, MEETING: 0 };
    agentsRT.forEach((a) => (m[a.mode] += 1));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const zoneDepts = DEPARTMENTS.filter((d) => d.id !== 'LOUNGE');

  if (!mounted) {
    return <div className="min-h-screen bg-[#07090e]" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-zinc-100 select-none pb-10">
      {/* ── Header ── */}
      <div className="bg-[#0d1017] border-b border-zinc-800 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">🏢</div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold tracking-wide">FINCEPT CAPITAL — TRADING FLOOR</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 font-mono">
                  {FIRM_AGENTS.length} AGEN · {zoneDepts.filter((d) => d.id !== 'WARROOM').length} DEPARTEMEN
                </span>
                {phase !== 'IDLE' && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/25 text-amber-300 border border-amber-500/60 font-mono animate-pulse flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    🚨 RAPAT PETINGGI WAR ROOM: PERCAKAPAN KONSENSUS PEMBELIAN {selectedStock}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Petinggi firma (CEO, CIO, CRO, CCO, PM, Kepala Riset, Quant, Trading, Makro, News) bermusyawarah intensif sebelum setiap pembelian saham.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${health.newsOk ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-rose-500/40 text-rose-300 bg-rose-500/10'}`}>
              <Radio className="w-3 h-3" />
              Berita {health.newsOk ? `LIVE · ${news.length}` : 'OFFLINE'}
            </div>
            <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${quote?.live ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-amber-500/40 text-amber-300 bg-amber-500/10'}`}>
              <Radio className="w-3 h-3" />
              Harga {quote?.live ? 'LIVE' : quote ? 'FALLBACK' : '…'}
            </div>

            {/* Toggle Suara Vokal Eksekutif (Web Speech Synthesis TTS) */}
            <button
              onClick={() => {
                setVoiceEnabled((prev) => {
                  const next = !prev;
                  executiveVoice.setMuted(!next);
                  return next;
                });
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'border-cyan-500/50 text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25'
                  : 'border-zinc-700 text-zinc-500 bg-zinc-800/60 hover:text-zinc-300'
              }`}
              title={voiceEnabled ? 'Suara Vokal Eksekutif Aktif (Web Speech API)' : 'Suara Vokal Eksekutif Dimatikan'}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{voiceEnabled ? 'VOICE ON' : 'VOICE MUTE'}</span>
            </button>

            {/* Badge Cuaca Pasar Kantor Virtual (Dimensi 4: Market Weather) */}
            <div
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
                marketWeather === 'BULLISH_SUNNY'
                  ? 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                  : marketWeather === 'BEARISH_RAIN'
                  ? 'border-blue-500/40 text-blue-300 bg-blue-500/10'
                  : 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10'
              }`}
              title={`Simulasi Cuaca Pasar Kantor: ${marketWeather}`}
            >
              {marketWeather === 'BULLISH_SUNNY' && <CloudSun className="w-3.5 h-3.5 text-amber-400" />}
              {marketWeather === 'BEARISH_RAIN' && <CloudRain className="w-3.5 h-3.5 text-blue-400" />}
              {marketWeather === 'NIGHT_MODE' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>
                {marketWeather === 'BULLISH_SUNNY'
                  ? '☀️ CERAH BULLISH'
                  : marketWeather === 'BEARISH_RAIN'
                  ? '🌧️ HUJAN BEARISH'
                  : '🌙 MALAM AFTER-HOURS'}
              </span>
            </div>

            {/* Status Jam Bursa Efek Indonesia (IDX / BEI) */}
            {isIndonesianStock(selectedStock) && (
              <div
                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
                  idxMarketStatus.isOpen
                    ? 'border-emerald-500/50 text-emerald-300 bg-emerald-500/15'
                    : 'border-rose-500/50 text-rose-300 bg-rose-500/15'
                }`}
                title={idxMarketStatus.message}
              >
                <span className={`w-2 h-2 rounded-full ${idxMarketStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span>
                  {idxMarketStatus.isOpen
                    ? `BEI BUKA (${idxMarketStatus.currentWibTime})`
                    : `BEI TUTUP (${idxMarketStatus.statusLabel})`}
                </span>
              </div>
            )}
            {phase === 'IDLE' ? (
              <button onClick={startDebate} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/20 font-mono">
                <Play className="w-3.5 h-3.5 fill-black" />
                Rapat Petinggi di War Room ({selectedStock})
              </button>
            ) : (
              <button onClick={resetDebate} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 font-bold text-xs rounded-lg flex items-center gap-1.5 font-mono">
                <RotateCcw className="w-3.5 h-3.5" />
                Bubarkan Rapat Petinggi
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] w-full mx-auto px-3 md:px-4 pt-3 space-y-3">
        {/* ── Fincept Autonomous Alpha Hub (Pemilihan Saham Otonom AI) ── */}
        <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-3 space-y-2.5">
          {/* Baris Kontrol Auto-Pilot & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tombol Toggle Auto-Pilot vs Manual */}
              <button
                onClick={toggleAutoPilot}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md ${
                  autoPilot
                    ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-black shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                }`}
                title="Klik untuk beralih antara Kuasa Portofolio Penuh AI dan Manual Override"
              >
                <Sparkles className={`w-3.5 h-3.5 ${autoPilot ? 'animate-spin text-black' : 'text-amber-400'}`} />
                {autoPilot ? '🤖 KUASA PORTOFOLIO PENUH AI (ON)' : '👤 MANUAL OVERRIDE'}
              </button>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>100% OTONOM: AI Beli, Jual &amp; Rotasi Sendiri</span>
              </div>

              {/* Status Saham Terpilih */}
              <div className="flex items-center gap-2 bg-[#121620] border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="text-zinc-400 text-[11px]">
                  {autoPilot ? 'FOKUS OTONOM AI:' : 'EMITEN AKTIF:'}
                </span>
                <span className="text-amber-400 font-bold text-sm">{selectedStock}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-300 font-medium">{intel.name}</span>
                {scanResult && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      (scanResult.rankedLeaderboard.find((x) => x.symbol === selectedStock)?.score ?? 80) >= 80
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    SKOR {scanResult.rankedLeaderboard.find((x) => x.symbol === selectedStock)?.score ?? '--'}/100
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge Sinkronisasi VPS Quant 24/7 */}
              <div
                className="px-2.5 py-1.5 bg-[#0a101d] border border-cyan-500/30 rounded-lg flex items-center gap-1.5 text-xs font-mono shadow-sm shadow-cyan-500/10"
                title="Status koneksi real-time ke VPS Background Quant Daemon di 38.9.46.160:8002"
              >
                <span className={`w-2 h-2 rounded-full ${vpsBridgeStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-cyan-400 font-bold text-[11px]">
                  {vpsBridgeStatus.online ? 'VPS 24/7 QUANT: ONLINE' : 'VPS: STANDALONE'}
                </span>
                <span className="text-zinc-600 text-[10px]">|</span>
                <span className="text-zinc-300 text-[10px]">
                  Siklus: <strong className="text-emerald-400">{vpsBridgeStatus.cycles}</strong>
                </span>
              </div>

              {/* Tombol Buka Leaderboard Alpha */}
              <button
                onClick={() => setLeaderboardOpen(true)}
                className="px-3 py-1.5 bg-[#171b26] hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-200 text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                🏆 Leaderboard Alpha ({scanResult?.scannedCount ?? 60}+ Aset)
              </button>

              {/* Tombol Black Swan Crisis Injector */}
              <button
                onClick={() => setCrisisConsoleOpen(true)}
                className={`px-2.5 py-1.5 border text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                  activeCrisis
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/40'
                    : 'bg-[#181016] hover:bg-rose-950/60 border-rose-500/40 text-rose-300 hover:border-rose-400'
                }`}
                title="Buka Crisis Control Panel untuk injeksi skenario Black Swan"
              >
                <span>🚨</span>
                <span>{activeCrisis ? 'KRISIS AKTIF' : 'Black Swan'}</span>
              </button>

              {/* Tombol Hall of Post-Mortems & Memory Vault */}
              <button
                onClick={() => setPostMortemModalOpen(true)}
                className="px-2.5 py-1.5 bg-[#0e1420] hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all"
                title="Buka Hall of Post-Mortems & Episodic Memory Vault"
              >
                <span>📚</span>
                <span>Memory Vault</span>
              </button>

              {/* Tombol Meritocracy & Desk Promotions */}
              <button
                onClick={() => setMeritocracyOpen(true)}
                className="px-2.5 py-1.5 bg-[#1a1710] hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:border-amber-400 text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all"
                title="Buka Alokasi Modal Meritokratis & Peringkat Meja"
              >
                <span>👑</span>
                <span>Hierarki Meja</span>
              </button>

              {/* Tombol Time-Travel Replay */}
              <button
                onClick={() => setTimeTravelOpen(!timeTravelOpen)}
                className={`px-2.5 py-1.5 border text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                  timeTravelOpen
                    ? 'bg-cyan-500 text-black border-cyan-300 font-extrabold shadow-md shadow-cyan-500/30'
                    : 'bg-[#121622] hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
                title="Buka Time-Travel Scrubber Bar untuk rewind simulasi"
              >
                <span>⏪</span>
                <span>Time-Travel</span>
              </button>

              {/* Tombol CCTV Action Tracker */}
              <button
                onClick={() => setShowCctv(!showCctv)}
                className={`px-2.5 py-1.5 border text-xs font-bold font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                  showCctv
                    ? 'bg-rose-600 text-white border-rose-400 font-extrabold shadow-md shadow-rose-600/30'
                    : 'bg-[#121622] hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
                title="CCTV Auto-Tracking Security Monitor"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>CCTV Cam</span>
              </button>

              {/* Tombol Re-Scan & Auto-Execute */}
              <button
                onClick={executeUniverseScan}
                disabled={isScanning}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-bold text-xs font-mono rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                title="Pindai seluruh universe & eksekusi transaksi portofolio otonom sekarang"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Memproses AI…' : '⚡ Eksekusi Siklus AI'}
              </button>
            </div>
          </div>

          {/* Banner Alasan & Top 5 Runner */}
          {scanResult && (
            <div className="bg-[#10141d] border border-zinc-800/80 rounded-lg p-2 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-zinc-400 text-[11px] font-mono shrink-0">ALASAN AI:</span>
                <span className="text-zinc-200 text-xs truncate">
                  {scanResult.topPick.keyDrivers.slice(0, 2).join(' · ')}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 overflow-x-auto text-[11px] font-mono">
                <span className="text-zinc-500 mr-1">TOP 5:</span>
                {scanResult.rankedLeaderboard.slice(0, 5).map((item, idx) => (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      setSelectedStock(item.symbol);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                      selectedStock === item.symbol
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                    <span>{item.symbol}</span>
                    <span className="text-[10px] opacity-80">({item.score})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notifikasi jika dalam Manual Override */}
          {!autoPilot && scanResult?.topPick && selectedStock !== scanResult.topPick.symbol && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sedang memeriksa emiten manual <b>{selectedStock}</b>. Rekomendasi otonom AI tetap <b>{scanResult.topPick.symbol}</b> (Skor {scanResult.topPick.score}/100).
              </span>
              <button
                onClick={() => {
                  setSelectedStock(scanResult.topPick.symbol);
                  setAutoPilot(true);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline text-xs"
              >
                ↺ Kembali ke Auto-Pilot ({scanResult.topPick.symbol})
              </button>
            </div>
          )}

          {/* Pemilih Ticker Manual dengan Akses 1000+ Universe */}
          <div className="space-y-1.5 pt-1 border-t border-zinc-900 text-[11px]">
            {/* Filter Kategori Tab & Tombol Buka Katalog Penuh */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-bold shrink-0">UNIVERSE:</span>
                {(
                  [
                    { id: 'ALL', label: 'SEMUA', count: UNIVERSE_STATS.totalAssets },
                    { id: 'IDX', label: '🇮🇩 SAHAM IDX', count: UNIVERSE_STATS.idxCount },
                    { id: 'CRYPTO', label: '⚡ CRYPTO', count: UNIVERSE_STATS.cryptoCount },
                    { id: 'GLOBAL', label: '🌐 US GLOBAL', count: UNIVERSE_STATS.globalCount },
                  ] as const
                ).map((cat) => {
                  const isActive = assetFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setAssetFilter(cat.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? cat.id === 'CRYPTO'
                            ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-500/30 font-black'
                            : 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/30 font-black'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {cat.label} ({cat.count.toLocaleString()})
                    </button>
                  );
                })}
              </div>

              {/* Tombol Buka Katalog 1000+ Saham Modal */}
              <button
                onClick={() => setUniverseModalOpen(true)}
                className="px-2.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 border border-zinc-700 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 transition-colors"
              >
                <span>🔍</span>
                <span>Katalog 1,000+ Saham &amp; Crypto</span>
              </button>
            </div>

            {/* List Ticker Chips Terfilter + Live Search Input */}
            <div className="flex flex-wrap items-center gap-1.5 relative">
              {searchAssets(searchQuery, assetFilter, 24).map((t) => {
                const sym = t.symbol;
                const isCrypto = t.category === 'CRYPTO';
                const isSelected = selectedStock === sym;
                const itemEval = scanResult?.rankedLeaderboard.find((x) => x.symbol === sym);
                return (
                  <button
                    key={sym}
                    onClick={() => {
                      setSelectedStock(sym);
                      setSearchQuery('');
                    }}
                    className={`px-2 py-0.5 rounded font-mono transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? isCrypto
                          ? 'bg-cyan-400 text-black font-extrabold shadow-md shadow-cyan-400/30 border border-cyan-300'
                          : 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                        : isCrypto
                        ? 'bg-cyan-950/25 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/40 hover:border-cyan-500'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-900'
                    }`}
                  >
                    {isCrypto && <span className="text-[10px] text-cyan-400">⚡</span>}
                    <span>{sym}</span>
                    {t.name && isCrypto && <span className="text-[9px] opacity-75">({t.name.split(' ')[0]})</span>}
                    {itemEval && itemEval.rank <= 3 && (
                      <span className="text-[9px] opacity-75">{itemEval.rank === 1 ? '★' : ''}</span>
                    )}
                  </button>
                );
              })}

              {/* Form Input Live Filter 1,000+ Saham */}
              <div className="relative flex items-center ml-1">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      e.preventDefault();
                      setSelectedStock(searchQuery.trim().toUpperCase());
                      setSearchQuery('');
                    }
                  }}
                  placeholder="Cari 1,000+ aset…"
                  className="px-2 py-0.5 text-[11px] bg-zinc-900 border border-zinc-700 rounded-l focus:outline-none focus:border-amber-500 w-32 text-white uppercase font-bold font-mono placeholder:normal-case placeholder:font-normal placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      setSelectedStock(searchQuery.trim().toUpperCase());
                      setSearchQuery('');
                    }
                  }}
                  className="px-1.5 py-1 bg-zinc-700 hover:bg-zinc-600 rounded-r text-white cursor-pointer"
                >
                  <Search className="w-2.5 h-2.5" />
                </button>

                {/* Dropdown Live Search Autocomplete Popover bila ada input */}
                {searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 max-h-56 overflow-y-auto bg-[#0d1017] border border-zinc-700 rounded-lg shadow-2xl z-50 divide-y divide-zinc-800">
                    {searchAssets(searchQuery, 'ALL', 10).map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          setSelectedStock(item.symbol);
                          setSearchQuery('');
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span>{item.flag}</span>
                          <span className="font-bold font-mono text-amber-400">{item.symbol}</span>
                          <span className="text-[11px] text-zinc-300 truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono shrink-0">{item.sector}</span>
                      </button>
                    ))}
                    {searchAssets(searchQuery, 'ALL', 10).length === 0 && (
                      <div className="px-3 py-2 text-[11px] text-zinc-500 font-mono">
                        Tidak ada emiten yang cocok dengan &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigasi departemen ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button onClick={fitAll} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 whitespace-nowrap flex items-center gap-1">
            <Maximize2 className="w-3 h-3" /> SEMUA LANTAI
          </button>
          {zoneDepts.map((d) => (
            <button
              key={d.name}
              onClick={() => flyToDept(d.id)}
              style={{ borderColor: d.color + '88', color: d.color }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono bg-zinc-900/70 hover:bg-zinc-800 border whitespace-nowrap"
              title={d.mission}
            >
              {d.emoji} {d.name.replace('INVESTMENT COMMITTEE ', 'IC ').replace(' & INVESTOR RELATIONS', ' & IR')}
              {FIRM_AGENTS.filter((a) => a.dept === d.id).length > 0 && (
                <span className="ml-1 opacity-70">{FIRM_AGENTS.filter((a) => a.dept === d.id).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Kanvas + panel (Hybrid Asinkron: 60% Visual Kantor + 40% Panel Eksekusi QuantDesk/Jesse) ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] 2xl:grid-cols-[60%_40%] gap-3">
          <div ref={containerRef} className="relative rounded-xl border-2 border-zinc-700 bg-black overflow-hidden shadow-2xl h-[68vh] min-h-[480px]">
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={() => {
                simRef.current!.hoverId = null;
              }}
              className="absolute inset-0 w-full h-full touch-none"
              style={{ imageRendering: 'pixelated', cursor: 'grab' }}
            />
            {!assetsReady && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-zinc-400">Memuat sprite Pixel Agents…</div>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <button onClick={() => zoomBy(1.3)} className="w-8 h-8 rounded-lg bg-black/70 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center" aria-label="Perbesar"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={() => zoomBy(1 / 1.3)} className="w-8 h-8 rounded-lg bg-black/70 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center" aria-label="Perkecil"><ZoomOut className="w-4 h-4" /></button>
              <button onClick={fitAll} className="w-8 h-8 rounded-lg bg-black/70 border border-zinc-700 hover:bg-zinc-800 flex items-center justify-center" aria-label="Lihat semua"><Maximize2 className="w-4 h-4" /></button>
            </div>

            <canvas
              ref={miniRef}
              onPointerDown={onMiniPointer}
              onPointerMove={onMiniPointer}
              className="absolute bottom-3 right-3 rounded-lg border border-zinc-600 cursor-crosshair"
              style={{ width: 220, height: Math.round((220 * WORLD_H) / WORLD_W) }}
            />

            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-2.5 py-1.5 rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400 flex flex-wrap gap-x-3 gap-y-1 max-w-[60%]">
              <span>🖱️ seret = geser · roda = zoom · klik agen = inspeksi · klik meja besar = sidang IC</span>
              <span className="text-zinc-500">
                Bekerja {modeCounts.SIT} · Jalan {modeCounts.WALK} · Diskusi {modeCounts.TALK} · Istirahat {modeCounts.BREAK} · Rapat {modeCounts.MEETING}
              </span>
            </div>
          </div>

          {/* Panel samping (40% Execution Deck) */}
          <aside className="bg-[#0d1017] border border-zinc-800 rounded-xl flex flex-col h-[68vh] min-h-[480px] overflow-hidden">
            <div className="flex border-b border-zinc-800 text-[11px] font-bold font-mono overflow-x-auto scrollbar-none">
              {([
                ['QUANT_JESSE', 'QUANT & JESSE', Flame],
                ['ROSTER', 'ROSTER', Users],
                ['AI_ACTIVITY', 'TRADES', Zap],
                ['RADAR', 'RADAR', Activity],
                ['NEWS', 'BERITA', Newspaper],
                ['TRANSCRIPT', 'SIDANG', MessageSquare],
              ] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setPanelTab(id)}
                  className={`flex-1 min-w-[76px] py-2.5 flex items-center justify-center gap-1 shrink-0 ${
                    panelTab === id
                      ? 'bg-amber-500/15 text-amber-300 border-b-2 border-amber-400 font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {panelTab === 'QUANT_JESSE' ? (
              <QuantDeskJessePanel
                selectedSymbol={selectedStock}
                onSelectSymbol={(sym) => setSelectedStock(sym)}
                onRequestWarRoomConsensus={(sym) => {
                  setSelectedStock(sym);
                  const kevin = simRef.current?.byId['trader_crypto'];
                  if (kevin) {
                    globalLaserNetwork.fireStream(kevin.x, kevin.y, WAR_ROOM.cx, WAR_ROOM.cy, 'SIGNAL_TRADE');
                    globalHoloHub.triggerShockwave(WAR_ROOM.cx, WAR_ROOM.cy, '#38bdf8', 220);
                  }
                  startDebate();
                }}
                onLocateJesseDesk={() => {
                  const kevin = simRef.current?.byId['trader_crypto'];
                  if (kevin && simRef.current) {
                    simRef.current.cam.tx = kevin.x;
                    simRef.current.cam.ty = kevin.y;
                    simRef.current.cam.tz = 1.2;
                    simRef.current.selectedId = 'trader_crypto';
                  }
                }}
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-2.5 space-y-3 text-xs">
              {/* Widget Penghargaan Agent of the Month (Dimensi 4) */}
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#131722] to-zinc-900 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="font-mono text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Agent of the Month
                    </span>
                  </div>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <Award className="w-2.5 h-2.5" /> Top Alpha +28.4%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Kevin Zhang</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">Win Rate 84%</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">Jesse Crypto Desk Lead · High-Convexity Momentum</p>
                  </div>
                </div>
              </div>
              {panelTab === 'ROSTER' &&
                zoneDepts
                  .filter((d) => FIRM_AGENTS.some((a) => a.dept === d.id))
                  .map((d) => (
                    <div key={d.id}>
                      <div className="flex items-center gap-1.5 mb-1 font-mono font-bold text-[11px]" style={{ color: d.color }}>
                        {d.emoji} {d.name}
                        <span className="text-zinc-500 font-normal">({FIRM_AGENTS.filter((a) => a.dept === d.id).length})</span>
                      </div>
                      <div className="space-y-1">
                        {agentsRT
                          .filter((a) => a.def.dept === d.id)
                          .map((a) => (
                            <button
                              key={a.def.id}
                              onClick={() => {
                                simRef.current!.selectedId = a.def.id;
                                setInspectId(a.def.id);
                                flyTo(a.x, a.y, 1.4);
                              }}
                              className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800"
                            >
                              <span className="text-base leading-none mt-0.5">{a.def.emoji}</span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5">
                                  <span className="font-semibold text-zinc-100 truncate">{a.def.name}</span>
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${MODE_DOT[a.mode]}`} title={MODE_LABEL[a.mode]} />
                                </span>
                                <span className="block text-[10px] text-zinc-500 truncate">{a.def.title}</span>
                                <span className="block text-[10px] text-zinc-400 truncate">{activityText(a)}</span>
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}

              {panelTab === 'AI_ACTIVITY' && (
                <div className="space-y-3 font-mono">
                  {/* Status Auto-Trade Card */}
                  <div className="p-2.5 rounded-lg border border-zinc-800 bg-[#121622] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        AUTO-TRADE PORTOFOLIO
                      </span>
                      <button
                        onClick={() => useAIAgentStore.getState().setAutoTradingEnabled(!useAIAgentStore.getState().autoTradingEnabled)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          useAIAgentStore.getState().autoTradingEnabled
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {useAIAgentStore.getState().autoTradingEnabled ? 'AKTIF' : 'PAUSED'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-zinc-800">
                      <div>
                        <span className="text-zinc-500 block">Total Order AI</span>
                        <span className="text-white font-bold text-xs">{useAIAgentStore.getState().totalAiTradesCount} Trade</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Realized P&L</span>
                        <span className="text-emerald-400 font-bold text-xs">+Rp {useAIAgentStore.getState().totalAiRealizedProfit.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const { takeProfitPct, stopLossPct, trailingStopPct } = useAIAgentStore.getState();
                        setAiRiskTpEdit(String(takeProfitPct ?? 10));
                        setAiRiskSlEdit(String(stopLossPct ?? 5));
                        setAiRiskTrailingEdit(String(trailingStopPct ?? 5));
                        setShowRiskSettingsModal(true);
                      }}
                      className="w-full mt-1 px-2 py-1 rounded text-[10px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>⚙️</span>
                      <span>Risk Setting AI (TP / SL / Trailing)</span>
                    </button>
                  </div>

                  {/* Riwayat Eksekusi Portofolio */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase flex items-center justify-between">
                      <span>Eksekusi Portofolio Terbaru</span>
                      <span className="text-zinc-500">Raditya PM & Bambang CRO</span>
                    </div>
                    {useAIAgentStore.getState().logs.filter(l => l.type === 'TRADE_BUY' || l.type === 'TRADE_SELL' || l.type === 'RISK_GATE').length === 0 ? (
                      <div className="text-zinc-500 p-2 text-center text-[11px] border border-zinc-900 rounded-lg">
                        Belum ada order eksekusi langsung. AI sedang memantau sinyal.
                      </div>
                    ) : (
                      useAIAgentStore.getState().logs.filter(l => l.type === 'TRADE_BUY' || l.type === 'TRADE_SELL' || l.type === 'RISK_GATE').slice(0, 10).map((l) => {
                        const clean = l.symbol?.replace('.JK', '').replace(/USDT$/i, '').toUpperCase() || '';
                        const isCryptoLog = isCryptoSymbol(clean) || Boolean(l.symbol?.endsWith('USDT'));
                        return (
                        <div key={l.id} className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              l.type === 'TRADE_BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {l.type === 'TRADE_BUY' ? 'BUY' : 'SELL'}
                            </span>
                            <span className="font-bold text-white text-[11px] flex items-center gap-1">
                              {isCryptoLog && <span className="text-cyan-400">⚡</span>}
                              {l.symbol}
                            </span>
                            <span className="text-[10px] text-zinc-500">{l.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-zinc-300">{l.details}</p>
                          {l.metadata && (
                            <div className="text-[10px] text-zinc-400 flex flex-wrap gap-2 pt-0.5">
                              {l.metadata.price && (
                                <span>
                                  {isCryptoLog ? `$${l.metadata.price.toLocaleString('en-US', { minimumFractionDigits: l.metadata.price < 1 ? 4 : 2 })}` : `Rp ${l.metadata.price.toLocaleString('id-ID')}`}
                                </span>
                              )}
                              {l.metadata.lots && <span>· {l.metadata.lots} {isCryptoLog ? 'unit' : 'lot'}</span>}
                              {l.metadata.takeProfit && (
                                <span className="text-emerald-400">
                                  · TP {isCryptoLog ? `$${l.metadata.takeProfit.toLocaleString('en-US', { minimumFractionDigits: l.metadata.takeProfit < 1 ? 4 : 2 })}` : `Rp ${l.metadata.takeProfit.toLocaleString('id-ID')}`}
                                </span>
                              )}
                              {l.metadata.stopLoss && (
                                <span className="text-rose-400">
                                  · SL {isCryptoLog ? `$${l.metadata.stopLoss.toLocaleString('en-US', { minimumFractionDigits: l.metadata.stopLoss < 1 ? 4 : 2 })}` : `Rp ${l.metadata.stopLoss.toLocaleString('id-ID')}`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        );
                      })
                    )}
                  </div>

                  {/* Buletin Berita Live AI Newsroom */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase flex items-center justify-between">
                      <span>Buletin Live Newsroom</span>
                      <span className="text-cyan-400">Marsha & Bima</span>
                    </div>
                    {useAIAgentStore.getState().dispatches.slice(0, 4).map((d) => (
                      <div key={d.id} className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-200 line-clamp-1">{d.headline}</span>
                          <span className="text-[9px] text-zinc-500 shrink-0">{d.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2">{d.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {panelTab === 'RADAR' && (
                <div className="space-y-3 font-mono">
                  {/* Status Radar Card */}
                  <div className="p-2.5 rounded-lg border border-zinc-800 bg-[#121622] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-300 font-bold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        INSTITUTIONAL RADAR: {selectedStock}
                      </span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">
                        {intel.bandarmologi ? 'BANDARMOLOGI IDX' : 'ON-CHAIN WHALE'}
                      </span>
                    </div>

                    {/* Jika Saham IDX */}
                    {intel.bandarmologi && (
                      <div className="space-y-2 pt-1 border-t border-zinc-800 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Status Akumulasi Bandar:</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            intel.bandarmologi.status.includes('ACCUMULATION')
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : intel.bandarmologi.status.includes('DISTRIBUTION')
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {intel.bandarmologi.statusLabel}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Foreign Net Flow:</span>
                          <span className={`font-bold ${intel.bandarmologi.foreignNetFlowIDR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {intel.bandarmologi.foreignNetFlowFormatted}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Konsentrasi Broker (CR3):</span>
                          <span className="font-bold text-amber-300">
                            {intel.bandarmologi.concentrationRatio3}% ({intel.bandarmologi.concentrationLabel})
                          </span>
                        </div>

                        {intel.bandarmologi.isRetailTrapped && (
                          <div className="p-1.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[9px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />
                            <span>Ritel terjebak (Retail Trapped) dominan di broker YP/XC!</span>
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-zinc-800/80">
                          <div className="text-[10px] text-zinc-400 font-bold mb-1">Top Broker Akumulator (Buyer):</div>
                          <div className="grid grid-cols-3 gap-1 text-[9px]">
                            {intel.bandarmologi.topBuyers.slice(0, 3).map((b) => (
                              <div key={b.code} className="p-1 rounded bg-zinc-900 border border-zinc-800">
                                <div className="font-bold text-emerald-400">{b.code} ({b.name.split(' ')[0]})</div>
                                <div className="text-zinc-400">{b.volumeLot.toLocaleString()} lot</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1 border-t border-zinc-800/80">
                          <div className="text-[10px] text-zinc-400 font-bold mb-1">Top Broker Distribusi (Seller):</div>
                          <div className="grid grid-cols-3 gap-1 text-[9px]">
                            {intel.bandarmologi.topSellers.slice(0, 3).map((s) => (
                              <div key={s.code} className="p-1 rounded bg-zinc-900 border border-zinc-800">
                                <div className="font-bold text-rose-400">{s.code} ({s.name.split(' ')[0]})</div>
                                <div className="text-zinc-400">{s.volumeLot.toLocaleString()} lot</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800 text-[9px] text-zinc-300 leading-relaxed">
                          {intel.bandarmologi.bandarActionSummary}
                        </div>
                      </div>
                    )}

                    {/* Jika Kripto On-Chain */}
                    {intel.cryptoWhale && (
                      <div className="space-y-2 pt-1 border-t border-zinc-800 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Sentimen Whale On-Chain:</span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                            {intel.cryptoWhale.whaleSentimentLabel}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Whale Net Flow (24j):</span>
                          <span className={`font-bold ${intel.cryptoWhale.netWhaleFlowUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {intel.cryptoWhale.netWhaleFlowFormatted}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Tx Paus (&gt; $500k):</span>
                          <span className="font-bold text-amber-300">
                            {intel.cryptoWhale.largeTxCount24h} Transaksi
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Perubahan Cadangan Exchange:</span>
                          <span className={`font-bold ${intel.cryptoWhale.exchangeReserveChangePct24h <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {intel.cryptoWhale.exchangeReserveChangePct24h > 0 ? '+' : ''}{intel.cryptoWhale.exchangeReserveChangePct24h}% (Supply Shock)
                          </span>
                        </div>

                        <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800 text-[9px] text-zinc-300 leading-relaxed">
                          {intel.cryptoWhale.whaleSummary}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {panelTab === 'NEWS' && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 font-mono text-[10px] text-zinc-400 space-y-0.5">
                    <div className="flex items-center gap-1.5"><ProvBadge src="LIVE" /> Google News RSS · {health.newsSources || '—'} sumber · cache {health.newsTotalInCache}</div>
                    <div>Terakhir crawl: {health.newsLastCrawledAt ?? 'n/a'} · latensi {health.newsLatencyMs ?? '—'} ms</div>
                    <div>Sentimen = klasifikasi kata kunci, bukan model bahasa.</div>
                  </div>
                  {news.length === 0 && <div className="text-zinc-500 p-2">Belum ada artikel. Crawler mungkin offline / diblokir jaringan.</div>}
                  {news.map((n, idx) => (
                    <a
                      key={`${n.id}-${idx}`}
                      href={(n as NewsItem & { link?: string }).link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 p-2"
                    >
                      <div className="text-zinc-100 leading-snug">{n.title}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                        <span>{n.source}</span>·<span>{n.timeAgo}</span>·<span>{n.region}</span>
                        <span className={n.sentiment === 'BULLISH' ? 'text-emerald-400' : n.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-zinc-500'}>{n.sentiment}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {panelTab === 'TRANSCRIPT' && (
                <div className="space-y-2">
                  {!snapshot && (
                    <div className="text-zinc-500 p-2 leading-relaxed">
                      Belum ada rapat. Tekan <b className="text-amber-300">Rapat Petinggi di War Room</b> atau klik meja War Room di tengah lantai. Para petinggi (CEO, CIO, CRO, CCO, PM, Kepala Riset, Quant, Trading, Makro, News) akan berkumpul di meja War Room dan berdialog langsung membahas keputusan pembelian saham.
                    </div>
                  )}
                  {snapshot &&
                    snapshot.script.slice(0, Math.max(0, step + 1)).map((l, i) => {
                      const ag = AGENT_BY_ID[l.agentId];
                      return (
                        <div key={i} className={`rounded-lg border p-2 ${i === step && phase === 'RUNNING' ? 'border-amber-500/60 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span>{ag.emoji}</span>
                            <span className="font-bold text-zinc-100">{ag.name}</span>
                            <span className="text-[10px] text-zinc-500 truncate">{ag.title}</span>
                            <span className="ml-auto"><ProvBadge src={l.src} /></span>
                          </div>
                          <div className="text-zinc-300 leading-relaxed">{l.text}</div>
                        </div>
                      );
                    })}
                  {snapshot && phase === 'DONE' && (
                    <div className={`rounded-lg border-2 p-2.5 ${snapshot.decision.decision === 'BUY' ? 'border-emerald-500/60 bg-emerald-500/10' : snapshot.decision.decision === 'AVOID' ? 'border-rose-500/60 bg-rose-500/10' : 'border-amber-500/60 bg-amber-500/10'}`}>
                      <div className="font-bold font-mono text-sm">KEPUTUSAN: {snapshot.decision.decision} · skor {snapshot.decision.score >= 0 ? '+' : ''}{snapshot.decision.score}</div>
                      <ul className="mt-1 text-[11px] text-zinc-300 list-disc pl-4 space-y-0.5">
                        {snapshot.decision.factors.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                      <div className="mt-1.5 text-[10px] text-zinc-500">Keputusan rule-based dari data di atas, bukan nasihat investasi.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </aside>
        </div>

        {/* ── Human-in-the-loop ── */}
        {alarm && snapshot && (
          <div className="p-4 rounded-xl bg-rose-950/80 border-2 border-rose-500 shadow-2xl space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-rose-300 font-bold text-xs uppercase font-mono">
              <AlertTriangle className="w-4 h-4" /> 🚨 Sirine CRO: persetujuan manusia diperlukan
            </div>
            <p className="text-xs text-zinc-200">
              Usulan: BUY <b>{snapshot.sizing.lots} lot {snapshot.symbol}</b> limit Rp {snapshot.sizing.entry.toLocaleString('id-ID')} · SL Rp {snapshot.sizing.stop.toLocaleString('id-ID')} · TP Rp {snapshot.sizing.takeProfit.toLocaleString('id-ID')} · notional Rp {snapshot.sizing.notional.toLocaleString('id-ID')} · risiko maks Rp {snapshot.sizing.riskIdr.toLocaleString('id-ID')} (1% NAV Rp {Math.round(snapshot.sizing.navUsed).toLocaleString('id-ID')}).
            </p>
            <p className="text-[11px] text-rose-200/70">Menyetujui akan membuat order di simulator paper-trading Anda (bukan broker sungguhan).</p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button onClick={approveOrder} className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono">✓ SETUJUI (PAPER ORDER)</button>
              <button onClick={rejectOrder} className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-600 font-mono">✕ TOLAK</button>
            </div>
          </div>
        )}
        {orderResult && (
          <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${orderResult.ok ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/50 border-rose-500/50 text-rose-300'}`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {orderResult.msg}
          </div>
        )}

        {/* ── Ringkasan intelijen ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="bg-[#0f1219] border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-zinc-400 font-mono uppercase">ROE · FCF</span><ProvBadge src={intel.financials.isAudited ? 'AUDITED' : 'MODEL'} /></div>
            <div className="text-lg font-bold text-emerald-400 font-mono">{intel.financials.roe.toFixed(1)}%</div>
            <p className="text-[11px] text-zinc-400 mt-0.5">FCF {intel.financials.freeCashFlowFormatted}</p>
          </div>
          <div className="bg-[#0f1219] border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-zinc-400 font-mono uppercase">Konsensus analis</span><ProvBadge src="STATIC" /></div>
            <div className="text-lg font-bold text-amber-400 font-mono">{intel.institutionalConsensus.hasConsensus ? fmtMoney(intel, intel.institutionalConsensus.targetPriceConsensus) : '—'}</div>
            <p className="text-[11px] text-zinc-400 mt-0.5">{intel.institutionalConsensus.hasConsensus ? `${intel.institutionalConsensus.consensusRating} · ${intel.institutionalConsensus.impliedUpsidePct >= 0 ? '+' : ''}${intel.institutionalConsensus.impliedUpsidePct}%` : 'Tidak ada data'}</p>
          </div>
          <div className="bg-[#0f1219] border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-zinc-400 font-mono uppercase">Demand zone</span><ProvBadge src="MODEL" /></div>
            <div className="text-lg font-bold text-cyan-400 font-mono">{fmtMoney(intel, intel.technicals.orderBlockDemand.min)}–{fmtMoney(intel, intel.technicals.orderBlockDemand.max).replace('Rp ', '')}</div>
            <p className="text-[11px] text-zinc-400 mt-0.5">MTF {intel.technicals.mtfConsensus}</p>
          </div>
          <div className="bg-[#0f1219] border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-zinc-400 font-mono uppercase">R:R · Stop</span><ProvBadge src="MODEL" /></div>
            <div className="text-lg font-bold text-rose-400 font-mono">{intel.technicals.suggestedRiskReward.ratio}:1</div>
            <p className="text-[11px] text-zinc-400 mt-0.5">SL {fmtMoney(intel, intel.technicals.suggestedRiskReward.stopLoss)}</p>
          </div>
          <div className="bg-[#0f1219] border border-zinc-800 rounded-xl p-3 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-zinc-400 font-mono uppercase">Skor IC (live)</span><ProvBadge src="MODEL" /></div>
            <div className={`text-lg font-bold font-mono ${liveDecision.decision === 'BUY' ? 'text-emerald-400' : liveDecision.decision === 'AVOID' ? 'text-rose-400' : 'text-amber-400'}`}>{liveDecision.decision} ({liveDecision.score >= 0 ? '+' : ''}{liveDecision.score})</div>
            <p className="text-[11px] text-zinc-400 mt-0.5">{liveSizing.ok ? `Sizing ${liveSizing.lots} lot` : 'Tanpa order'} · NAV Rp {Math.round(portfolioNav(portfolio)).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* ── Inspector agen ── */}
      {inspected && inspectedReport && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            simRef.current!.selectedId = null;
            setInspectId(null);
          }}
        >
          <div className="bg-[#0e1119] border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-zinc-800 flex items-start justify-between gap-3" style={{ background: DEPT_BY_ID[inspected.def.dept].color + '18' }}>
              <div className="flex items-start gap-3">
                <div className="text-3xl">{inspected.def.emoji}</div>
                <div>
                  <div className="font-bold text-base">{inspected.def.name}</div>
                  <div className="text-xs text-zinc-300">{inspected.def.title}</div>
                  <div className="text-[11px] font-mono mt-0.5" style={{ color: DEPT_BY_ID[inspected.def.dept].color }}>
                    {DEPT_BY_ID[inspected.def.dept].emoji} {DEPT_BY_ID[inspected.def.dept].name} · {MODE_LABEL[inspected.mode]}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  simRef.current!.selectedId = null;
                  setInspectId(null);
                }}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <section>
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Sedang mengerjakan</div>
                <div className="text-zinc-100 text-sm">{inspectedReport.task}</div>
              </section>

              <section>
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1.5">Laporan data · {selectedStock}</div>
                <div className="space-y-1.5 bg-black/50 rounded-lg p-2.5 border border-zinc-800 font-mono">
                  {inspectedReport.lines.map((l, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-zinc-500 w-[74px] shrink-0 truncate">{l.tag}</span>
                      <span className="text-emerald-200/90 flex-1 leading-relaxed">{l.text}</span>
                      <ProvBadge src={l.src} />
                    </div>
                  ))}
                </div>
              </section>

              {/* ── SINKRONISASI AKTIF: LIVE AI NEURAL OODA REASONING STREAM (Groq / Gemini) ── */}
              <section className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-3.5 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[11px] font-bold text-cyan-300 tracking-wider uppercase">
                      Live AI Neural OODA Reasoning
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {liveAiAnalysis?.provider || 'GroqCloud / Gemini Flash'}
                  </span>
                </div>

                {liveAiAnalysis?.loading ? (
                  <div className="py-4 flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs">
                    <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Menghubungi Deep OODA Neural Engine ({selectedStock})...
                  </div>
                ) : liveAiAnalysis?.decision ? (
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">KEPUTUSAN</span>
                        <span className={`font-bold ${liveAiAnalysis.decision.keputusan === 'BUY' ? 'text-emerald-400' : liveAiAnalysis.decision.keputusan === 'SELL' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {liveAiAnalysis.decision.keputusan}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">BANDARMOLOGI</span>
                        <span className="text-purple-300 font-semibold">{liveAiAnalysis.decision.bandarmologi_verdict}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">CONVICTION</span>
                        <span className="text-cyan-300 font-bold">{liveAiAnalysis.decision.conviction_score}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-black/60 border border-slate-800/80 font-mono text-[11px] leading-relaxed text-slate-300">
                      <span className="text-cyan-400 font-bold block mb-1">❯ REASONING CHAIN & PRICE ACTION:</span>
                      {liveAiAnalysis.decision.analisis_teknikal}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Target: <strong className="text-emerald-400">{liveAiAnalysis.decision.target_price}</strong></span>
                      <span>Stop Loss: <strong className="text-rose-400">{liveAiAnalysis.decision.stop_loss}</strong></span>
                      <span>RRR: <strong className="text-cyan-400">1:{liveAiAnalysis.decision.risk_reward_ratio}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 font-mono text-[11px] py-1">
                    Evaluasi AI fallback aktif untuk {selectedStock}. Mengikuti parameter Risk Parity dan fraksi harga bursa.
                  </div>
                )}
              </section>

              {/* ── SINKRONISASI MEMORI EPISODIK VPS 24/7 (SQLite WAL) ── */}
              {vpsBridgeStatus.memories.length > 0 && (
                <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      🧠 Episodic Memory VPS 24/7 (SQLite WAL)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {vpsBridgeStatus.memories.length} Refleksi
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                    {vpsBridgeStatus.memories.slice(0, 3).map((m: any, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-slate-300">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <span className="text-cyan-400 font-bold">{m.symbol} · {m.decision}</span>
                          <span>{m.regime || 'RANGE_BOUND'}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 truncate">{m.reflection || m.justification}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Tanggung jawab peran</div>
                <ul className="list-disc pl-4 text-zinc-300 space-y-0.5">
                  {inspected.def.duties.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </section>

              <section>
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Sering berkonsultasi dengan</div>
                <div className="flex flex-wrap gap-1.5">
                  {inspected.def.collaborators.map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        simRef.current!.selectedId = id;
                        setInspectId(id);
                        const t = simRef.current!.byId[id];
                        flyTo(t.x, t.y, 1.4);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                    >
                      {AGENT_BY_ID[id].emoji} {AGENT_BY_ID[id].name}
                    </button>
                  ))}
                </div>
              </section>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    flyTo(inspected.x, inspected.y, 1.6);
                    simRef.current!.selectedId = null;
                    setInspectId(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Fokus kamera
                </button>
              </div>
              <p className="text-[10px] text-zinc-500">
                Seluruh agen saat ini bersifat rule-based: mereka membaca data yang tersedia dan tidak mengarang angka. Baris berlabel STATIC/MODEL bukan data pasar live.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Leaderboard Alpha Modal ── */}
      {leaderboardOpen && scanResult && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6"
          onClick={() => setLeaderboardOpen(false)}
        >
          <div
            className="bg-[#0c0f17] border border-zinc-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-800 bg-[#121622] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl text-amber-400">
                  🏆
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-wide">
                      FINCEPT CAPITAL — AUTONOMOUS ALPHA LEADERBOARD
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-mono">
                      {scanResult.scannedCount} EMITEN DIPINDAI
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Pemeringkatan saham otonom berbasis 4 pilar: Fundamental, Quant SMC, Konsensus & Flow, serta Berita Crawler live.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLeaderboardOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-banner (Top Pick Highlight) */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-[#101726] to-[#0c0f17] border-b border-zinc-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥇</span>
                <div>
                  <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    PILIHAN UTAMA SAAT INI (TOP ALPHA PICK)
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{scanResult.topPick.symbol}</span>
                    <span className="text-zinc-400 font-normal">· {scanResult.topPick.name}</span>
                    <span className="text-emerald-400 font-mono font-bold">({scanResult.topPick.score}/100)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedStock(scanResult.topPick.symbol);
                    setAutoPilot(true);
                    setLeaderboardOpen(false);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono rounded-lg transition-all"
                >
                  ✓ Investasikan Pilihan AI Ini
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="p-4 overflow-y-auto flex-1 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] uppercase bg-black/40">
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Emiten & Sektor</th>
                      <th className="py-2.5 px-3 text-center">Skor Total</th>
                      <th className="py-2.5 px-3 text-center">Rincian (F / Q / I / N)</th>
                      <th className="py-2.5 px-3 text-right">P/E · ROE</th>
                      <th className="py-2.5 px-3 text-right">Target 12M</th>
                      <th className="py-2.5 px-3 text-center">Sinyal / Aksi</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {scanResult.rankedLeaderboard.map((item) => {
                      const isSelected = selectedStock === item.symbol;
                      const scoreColor =
                        item.score >= 85
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                          : item.score >= 75
                          ? 'text-teal-400 bg-teal-500/10 border-teal-500/30'
                          : item.score >= 60
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

                      return (
                        <tr
                          key={item.symbol}
                          className={`hover:bg-zinc-800/40 transition-colors ${
                            isSelected ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-2.5 px-3 font-bold text-sm">
                            {item.rank === 1 ? (
                              <span className="text-amber-400">🥇 #1</span>
                            ) : item.rank === 2 ? (
                              <span className="text-zinc-300">🥈 #2</span>
                            ) : item.rank === 3 ? (
                              <span className="text-amber-600">🥉 #3</span>
                            ) : (
                              <span className="text-zinc-500">#{item.rank}</span>
                            )}
                          </td>

                          {/* Symbol & Sector */}
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              {item.symbol}
                              {isSelected && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/40 font-normal">
                                  AKTIF
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate max-w-[180px] font-sans">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-sans">{item.sector}</div>
                          </td>

                          {/* Total Score */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-block">
                              <span className={`px-2 py-1 rounded-md font-bold text-xs border ${scoreColor}`}>
                                {item.score} / 100
                              </span>
                            </div>
                            <div className="w-16 h-1 bg-zinc-800 rounded-full mx-auto mt-1 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                          </td>

                          {/* Breakdown */}
                          <td className="py-2.5 px-3 text-center text-[10px]">
                            <div className="flex items-center justify-center gap-1">
                              <span className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20" title="Fundamental">
                                F:{item.breakdown.fundamental}
                              </span>
                              <span className="px-1 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20" title="Quant / SMC">
                                Q:{item.breakdown.technicalQuant}
                              </span>
                              <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" title="Institusi">
                                I:{item.breakdown.institutional}
                              </span>
                              <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20" title="Berita Crawler">
                                N:{item.breakdown.newsSentiment}
                              </span>
                            </div>
                          </td>

                          {/* PE / ROE */}
                          <td className="py-2.5 px-3 text-right">
                            <div className="text-zinc-200">{item.metrics.peRatio.toFixed(1)}x</div>
                            <div className="text-[10px] text-emerald-400">ROE {item.metrics.roe.toFixed(1)}%</div>
                          </td>

                          {/* Target Upside */}
                          <td className="py-2.5 px-3 text-right">
                            <div className={item.metrics.impliedUpsidePct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {item.metrics.impliedUpsidePct >= 0 ? '+' : ''}{item.metrics.impliedUpsidePct.toFixed(1)}%
                            </div>
                            <div className="text-[10px] text-zinc-500">R:R 1:{item.metrics.riskRewardRatio.toFixed(1)}</div>
                          </td>

                          {/* Conviction / Action */}
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.conviction === 'TOP_PICK'
                                  ? 'bg-amber-500 text-black font-extrabold'
                                  : item.conviction === 'STRONG_BUY'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : item.conviction === 'BUY'
                                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {item.conviction}
                            </span>
                          </td>

                          {/* Button Select */}
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedStock(item.symbol);
                                if (item.rank === 1) setAutoPilot(true);
                                else setAutoPilot(false);
                                setLeaderboardOpen(false);
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-zinc-800 text-zinc-400 cursor-default'
                                  : 'bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-200 border border-zinc-700'
                              }`}
                            >
                              {isSelected ? 'Terpilih' : 'Pilih'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-zinc-800 bg-[#0d1017] flex items-center justify-between text-xs text-zinc-400 font-mono">
              <div>Pembaruan terakhir: {lastScanAt || 'Baru saja'}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={executeUniverseScan}
                  disabled={isScanning}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  Pindai Ulang
                </button>
                <button
                  onClick={() => setLeaderboardOpen(false)}
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* Modal Katalog 1,000+ Saham BEI, Crypto & Global                          */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {universeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0e14] border border-cyan-500/30 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#0e131f] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
                  🌐
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-100 font-mono tracking-tight">
                      KATALOG MASTER ASSET UNIVERSE
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      {UNIVERSE_STATS.totalAssets.toLocaleString()} ASET
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    951 Saham BEI (IDX) • 15 Crypto Top Liquid • 100 Global Equities — Siap Dianalisis AI &amp; Dieksekusi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUniverseModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-zinc-800 bg-[#0d111a] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      setCatalogPage(1);
                    }}
                    placeholder="Cari kode ticker atau nama (e.g. BBCA, Solana, Apple, Telkom)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
                </div>

                {catalogSearch && (
                  <button
                    onClick={() => {
                      setCatalogSearch('');
                      setCatalogPage(1);
                    }}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { id: 'ALL', label: 'SEMUA', count: UNIVERSE_STATS.totalAssets },
                    { id: 'IDX', label: '🇮🇩 IDX (BEI)', count: UNIVERSE_STATS.idxCount },
                    { id: 'CRYPTO', label: '⚡ Crypto', count: UNIVERSE_STATS.cryptoCount },
                    { id: 'GLOBAL', label: '🌐 Global', count: UNIVERSE_STATS.globalCount },
                  ] as const
                ).map((c) => {
                  const active = catalogCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCatalogCategory(c.id);
                        setCatalogSector('SEMUA');
                        setCatalogPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                        active
                          ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
                      }`}
                    >
                      {c.label} ({c.count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Filter: Sektor (jika IDX atau ALL) */}
            {(catalogCategory === 'ALL' || catalogCategory === 'IDX') && (
              <div className="px-4 py-2 border-b border-zinc-800/80 bg-[#090c12] flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
                <span className="text-zinc-500 shrink-0">Sektor IDX:</span>
                <button
                  onClick={() => {
                    setCatalogSector('SEMUA');
                    setCatalogPage(1);
                  }}
                  className={`px-2 py-0.5 rounded transition-colors shrink-0 ${
                    catalogSector === 'SEMUA'
                      ? 'bg-zinc-700 text-cyan-300 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Semua Sektor
                </button>
                {getAllSectors()
                  .filter((s) => s && !s.includes('Crypto') && !s.includes('Mega Cap') && !s.includes('Global'))
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setCatalogSector(s);
                        setCatalogPage(1);
                      }}
                      className={`px-2 py-0.5 rounded transition-colors shrink-0 ${
                        catalogSector === s
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
              </div>
            )}

            {/* List / Table Body */}
            {(() => {
              // Compute filtered list
              const searchMatches = searchAssets(catalogSearch, catalogCategory, 1200);
              const filtered = catalogSector === 'SEMUA'
                ? searchMatches
                : searchMatches.filter((item) => item.sector === catalogSector);

              const pageSize = 30;
              const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
              const currentPage = Math.min(catalogPage, totalPages);
              const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

              return (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Results Count Banner */}
                  <div className="px-6 py-2 bg-zinc-900/60 border-b border-zinc-800/50 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <div>
                      Menampilkan{' '}
                      <span className="text-cyan-400 font-bold">
                        {paginated.length}
                      </span>{' '}
                      dari <span className="text-zinc-200 font-bold">{filtered.length}</span> aset cocok
                    </div>
                    <div>
                      Halaman <span className="text-zinc-200 font-bold">{currentPage}</span> dari{' '}
                      <span className="text-zinc-200 font-bold">{totalPages}</span>
                    </div>
                  </div>

                  {/* Scrollable Table */}
                  <div className="flex-1 overflow-y-auto min-h-[360px]">
                    {paginated.length === 0 ? (
                      <div className="p-12 text-center text-zinc-500 font-mono text-sm">
                        Tidak ada aset yang cocok dengan kriteria pencarian &quot;{catalogSearch}&quot;
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0b0f17] text-zinc-400 font-mono text-[11px] sticky top-0 border-b border-zinc-800 z-10">
                          <tr>
                            <th className="py-2.5 px-4 font-semibold">TICKER / KODE</th>
                            <th className="py-2.5 px-4 font-semibold">NAMA EMITEN / ASET</th>
                            <th className="py-2.5 px-4 font-semibold">KATEGORI &amp; SEKTOR</th>
                            <th className="py-2.5 px-4 font-semibold text-right">HARGA (REF / LIVE)</th>
                            <th className="py-2.5 px-4 font-semibold text-center">PAPAN / EXCHANGE</th>
                            <th className="py-2.5 px-4 font-semibold text-right">AKSI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 font-mono">
                          {paginated.map((asset) => {
                            const isSelected = selectedStock === asset.symbol;
                            const isCrypto = asset.category === 'CRYPTO';
                            const cryptoTicker = isCrypto ? (tickerMap[asset.symbol] || tickerMap[`${asset.symbol}USDT`]) : undefined;
                            const livePrice = cryptoTicker ? cryptoTicker.price : asset.defaultPrice;

                            return (
                              <tr
                                key={asset.symbol}
                                className={`hover:bg-zinc-800/40 transition-colors ${
                                  isSelected ? 'bg-cyan-500/10' : ''
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{asset.flag}</span>
                                    <div>
                                      <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                                        <span>{asset.symbol}</span>
                                        {asset.isPopular && (
                                          <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            POPULAR
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-zinc-500">{asset.currency}</div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-zinc-300 font-sans text-xs max-w-xs truncate">
                                  {asset.name}
                                </td>

                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      asset.category === 'CRYPTO'
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        : asset.category === 'IDX'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    }`}
                                  >
                                    {asset.category}
                                  </span>
                                  <span className="ml-2 text-zinc-400 text-[11px]">{asset.sector}</span>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="text-zinc-100 font-bold">
                                    {asset.currency === 'IDR'
                                      ? `Rp ${livePrice.toLocaleString('id-ID')}`
                                      : `$${livePrice.toLocaleString('en-US', {
                                          minimumFractionDigits: isCrypto && livePrice < 1 ? 4 : 2,
                                          maximumFractionDigits: isCrypto && livePrice < 1 ? 8 : 2,
                                        })}`}
                                  </div>
                                  {cryptoTicker && (
                                    <div
                                      className={`text-[10px] font-bold ${
                                        cryptoTicker.change24h >= 0
                                          ? 'text-emerald-400'
                                          : 'text-rose-400'
                                      }`}
                                    >
                                      {cryptoTicker.change24h >= 0 ? '+' : ''}
                                      {cryptoTicker.change24h.toFixed(2)}% (24h)
                                    </div>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] border border-zinc-700/60">
                                    {asset.board || asset.market}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedStock(asset.symbol);
                                      setUniverseModalOpen(false);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      isSelected
                                        ? 'bg-cyan-500 text-black font-extrabold cursor-default'
                                        : 'bg-zinc-800 hover:bg-cyan-500 hover:text-black text-zinc-200 border border-zinc-700 hover:border-cyan-400'
                                    }`}
                                  >
                                    {isSelected ? '✓ Terpilih' : 'Analisis AI'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  <div className="px-6 py-3 border-t border-zinc-800 bg-[#0d1017] flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 border border-zinc-700 font-bold"
                      >
                        ← Sebelumnya
                      </button>
                      <button
                        onClick={() => setCatalogPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 border border-zinc-700 font-bold"
                      >
                        Berikutnya →
                      </button>
                    </div>

                    <div className="text-zinc-500 text-[11px]">
                      Halaman {currentPage} / {totalPages}
                    </div>

                    <button
                      onClick={() => setUniverseModalOpen(false)}
                      className="px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-bold"
                    >
                      Tutup Katalog
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Top Up Saldo Kas RDN Modal (QRIS) */}
      <TopUpModal isOpen={topUpModalOpen} onClose={() => setTopUpModalOpen(false)} />

      {/* Modal: Setting Risiko Global AI Bot (TP/SL/Trailing) */}
      {showRiskSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1220] border border-amber-500/40 rounded-xl max-w-sm w-full p-5 shadow-2xl shadow-amber-950/40 text-white animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-sm text-white tracking-wide flex items-center gap-2">
                  ⚙️ Risk Setting AI — Equitas & Saham IDX
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">Parameter global digunakan oleh Raditya PM & Bambang CRO saat auto-buy saham IDX.</p>
              </div>
              <button
                onClick={() => setShowRiskSettingsModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer ml-2"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {/* TP % */}
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <label className="font-bold text-emerald-400 block">🎯 Take Profit IDX (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={aiRiskTpEdit}
                  onChange={(e) => setAiRiskTpEdit(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 font-mono text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['5', '8', '10', '12', '15', '20'].map((v) => (
                    <button key={v} type="button" onClick={() => setAiRiskTpEdit(v)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${aiRiskTpEdit === v ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    >+{v}%</button>
                  ))}
                </div>
              </div>

              {/* SL % */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
                <label className="font-bold text-rose-400 block">🛡️ Stop Loss IDX (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={aiRiskSlEdit}
                  onChange={(e) => setAiRiskSlEdit(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 font-mono text-white text-sm focus:border-rose-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['2', '3', '5', '6', '8', '10'].map((v) => (
                    <button key={v} type="button" onClick={() => setAiRiskSlEdit(v)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${aiRiskSlEdit === v ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    >-{v}%</button>
                  ))}
                </div>
              </div>

              {/* Trailing Stop % */}
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <label className="font-bold text-cyan-400 block">📈 Trailing Stop (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={aiRiskTrailingEdit}
                  onChange={(e) => setAiRiskTrailingEdit(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 font-mono text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['2', '3', '5', '7', '10'].map((v) => (
                    <button key={v} type="button" onClick={() => setAiRiskTrailingEdit(v)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${aiRiskTrailingEdit === v ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    >{v}%</button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 italic">💡 Parameter ini dipakai bot saat auto-buy saham IDX. Tidak mempengaruhi order manual maupun Crypto Desk.</p>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRiskSettingsModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const tp = parseFloat(aiRiskTpEdit);
                  const sl = parseFloat(aiRiskSlEdit);
                  const trailing = parseFloat(aiRiskTrailingEdit);
                  if (tp > 0 && sl > 0 && trailing > 0) {
                    useAIAgentStore.getState().setRiskTargets({ takeProfitPct: tp, stopLossPct: sl, trailingStopPct: trailing });
                  }
                  setShowRiskSettingsModal(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                ✅ Simpan Setting
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODUL 1: CRISIS COMMAND CONSOLE ── */}
      <CrisisCommandConsole
        isOpen={crisisConsoleOpen}
        onClose={() => setCrisisConsoleOpen(false)}
        onInjectCrisis={handleInjectCrisis}
        isCrisisActive={Boolean(activeCrisis)}
        activeCrisis={activeCrisis}
        onResolveCrisis={handleResolveCrisis}
      />

      {/* ── MODUL 2: POST-MORTEM VAULT MODAL ── */}
      <PostMortemVaultModal
        isOpen={postMortemModalOpen}
        onClose={() => setPostMortemModalOpen(false)}
        entries={postMortemEntries}
        activeEntry={activePostMortem}
        onSelectEntry={(entry) => setActivePostMortem(entry)}
      />

      {/* ── MODUL 3: MERITOCRACY LEADERBOARD DRAWER ── */}
      <MeritocracyLeaderboardDrawer
        isOpen={meritocracyOpen}
        onClose={() => setMeritocracyOpen(false)}
        allocations={meritocraticAllocations}
        totalFundNavUsd={Math.round(portfolioNav(portfolio) / 16000) || 100000}
      />

      {/* ── MODUL 4: TIME-TRAVEL SCRUBBER BAR ── */}
      <TimeTravelScrubberBar
        isOpen={timeTravelOpen}
        onToggle={() => setTimeTravelOpen(false)}
        currentTick={replayTick}
        totalTicks={totalRecordedTicks}
        isReplaying={isReplaying}
        onScrub={handleScrubTick}
        onTogglePlay={handleToggleReplayPlay}
        activeSnapshot={activeReplaySnapshot}
      />

      {/* ── MODUL 5: CCTV ACTION TRACKER PIP WIDGET ── */}
      {showCctv && (
        <CctvSecurityPipWidget
          activeAgent={cctvAgent}
          onFocusAgent={handleFocusCctvAgent}
          onClose={() => setShowCctv(false)}
        />
      )}
    </div>
  );
}
