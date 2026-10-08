'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  RotateCcw,
  Sliders,
  Settings,
  Search,
  Sparkles,
  Layers,
  TrendingUp,
  ChevronDown,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Maximize,
  Minimize,
  Keyboard,
  Download,
  Upload,
} from 'lucide-react';
import {
  INITIAL_WIDGETS,
  AVAILABLE_WIDGET_CATALOG,
  POPULAR_IDX_TICKERS,
  POPULAR_GLOBAL_TICKERS,
  DashboardWidgetConfig,
  WidgetType,
  ChartWidget,
  GlobalIndicesWidget,
  MarketPulseWidget,
  CommoditiesWidget,
  NewsWidget,
  BandarFlowWidget,
  DividendRadarWidget,
  GlobalDividendsWidget,
  QuickOrderWidget,
  PortfolioHoldingsWidget,
  OrderBookDOMWidget,
  TapeWhaleReaderWidget,
  ForeignFlowRadarWidget,
  RiskCalculatorWidget,
  PriceAlertsWidget,
  GlobalCrawlerFeedWidget,
  MarketHeatmapWidget,
  AIQuantPredictorWidget,
  OpenBBTerminalWidget,
  AIChartPilotWidget,
  playAudioChime,
} from '@/components/dashboard/FinceptDashboardWidgets';

const STORAGE_KEY = 'fincept_dashboard_widgets_v10';
const CUSTOM_PRESETS_KEY = 'fincept_custom_presets_v1';

const PRESET_LAYOUTS: { id: string; label: string; icon: string; widgets: DashboardWidgetConfig[] }[] = [
  {
    id: 'cleanBeginnerDesk',
    label: 'Mode Pemula (Clean & Simple)',
    icon: '🌱',
    widgets: [
      { id: 'w-chart', type: 'CHART', title: 'CANDLESTICK CHART • BBCA', cols: 'col-span-3', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-4' },
    ],
  },
  {
    id: 'aiPilotDesk',
    label: 'AI Chart Pilot & Pine Studio (TradesDontLie)',
    icon: '⚡',
    widgets: [
      { id: 'w-aipilot', type: 'AI_CHART_PILOT', title: 'AI CHART PILOT • BBCA', cols: 'col-span-2', symbol: 'BBCA', isSynced: true },
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-news', type: 'NEWS', title: 'MARKET NEWS WIRE', cols: 'col-span-2' },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO SAYA', cols: 'col-span-1' },
    ],
  },
  {
    id: 'openbbDesk',
    label: 'OpenBB Institutional Desk',
    icon: '📖',
    widgets: [
      { id: 'w-openbb', type: 'OPENBB_TERMINAL', title: 'OPENBB DATA PLATFORM • BBCA', cols: 'col-span-2', symbol: 'BBCA', isSynced: true },
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
      { id: 'w-indices', type: 'GLOBAL_INDICES', title: 'GLOBAL INDICES & PASAR', cols: 'col-span-2' },
    ],
  },
  {
    id: 'bandarDesk',
    label: 'Bandarmologi & Smart Money',
    icon: '🌊',
    widgets: [
      { id: 'w-bandar-main', type: 'BANDAR_FLOW', title: 'BANDARMOLOGI • BMRI <BROKER SUMMARY>', cols: 'col-span-2', symbol: 'BMRI', isSynced: true },
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BMRI <EQUITY>', cols: 'col-span-2', symbol: 'BMRI', timeframe: '1D', isSynced: true },
      { id: 'w-foreign', type: 'FOREIGN_FLOW_RADAR', title: 'FOREIGN FLOW WAVE • ESTIMASI', cols: 'col-span-2', symbol: 'BMRI', isSynced: true },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BMRI', cols: 'col-span-1', symbol: 'BMRI', isSynced: true },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
    ],
  },
  {
    id: 'aiQuantDesk',
    label: 'AI Quantitative & Prediksi ML',
    icon: '🤖',
    widgets: [
      { id: 'w-ai-quant', type: 'AI_QUANT_PREDICTOR', title: 'AI QUANTITATIVE & ML FORECAST', cols: 'col-span-2', symbol: 'BBCA', isSynced: true },
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-heatmap', type: 'MARKET_HEATMAP', title: 'MARKET HEATMAP • SECTOR BREADTH', cols: 'col-span-2' },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
    ],
  },
  {
    id: 'heatmapDesk',
    label: 'Market Heatmap & Sektoral',
    icon: '🗺️',
    widgets: [
      { id: 'w-heatmap', type: 'MARKET_HEATMAP', title: 'MARKET HEATMAP • SECTOR BREADTH', cols: 'col-span-2' },
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-news', type: 'NEWS', title: 'BLOOMBERG FIRST WORD • NEWS DESK & CRAWLER', cols: 'col-span-2' },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
    ],
  },
  {
    id: 'traderDesk',
    label: 'Trading & Eksekusi',
    icon: '⚡',
    widgets: [
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-news', type: 'NEWS', title: 'BLOOMBERG FIRST WORD • NEWS DESK & CRAWLER', cols: 'col-span-2' },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
      { id: 'w-indices', type: 'GLOBAL_INDICES', title: 'GLOBAL INDICES & PASAR', cols: 'col-span-2' },
    ],
  },
  {
    id: 'newsDeskFocus',
    label: 'Bloomberg News Desk & Crawler',
    icon: '📰',
    widgets: [
      { id: 'w-news', type: 'NEWS', title: 'BLOOMBERG FIRST WORD • NEWS DESK & CRAWLER', cols: 'col-span-2' },
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-indices', type: 'GLOBAL_INDICES', title: 'GLOBAL INDICES & PASAR', cols: 'col-span-2' },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
    ],
  },
  {
    id: 'workstation',
    label: 'Workstation 4-Pane',
    icon: '🖥️',
    widgets: [
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA <EQUITY>', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-portfolio', type: 'PORTFOLIO_HOLDINGS', title: 'PORTOFOLIO & SALDO SAYA', cols: 'col-span-1' },
      { id: 'w-indices', type: 'GLOBAL_INDICES', title: 'GLOBAL INDICES', cols: 'col-span-2' },
      { id: 'w-news', type: 'NEWS', title: 'MARKET NEWS WIRE', cols: 'col-span-2' },
    ],
  },
  {
    id: 'standard',
    label: 'Standar',
    icon: '📊',
    widgets: INITIAL_WIDGETS,
  },
  {
    id: 'chartFocus',
    label: 'Fokus Chart',
    icon: '📈',
    widgets: [
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA', cols: 'col-span-3', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-order', type: 'QUICK_ORDER', title: 'EXECUTION SLIP • BBCA', cols: 'col-span-1', symbol: 'BBCA', isSynced: true },
      { id: 'w-indices', type: 'GLOBAL_INDICES', title: 'GLOBAL INDICES', cols: 'col-span-2' },
      { id: 'w-news', type: 'NEWS', title: 'MARKET NEWS WIRE', cols: 'col-span-2' },
    ],
  },
  {
    id: 'dividend',
    label: 'Dividen',
    icon: '💰',
    widgets: [
      { id: 'w-global-div', type: 'GLOBAL_DIVIDENDS', title: 'GLOBAL DIVIDENDS • INVESTING.COM', cols: 'col-span-2', symbol: 'KO' },
      { id: 'w-div-radar', type: 'DIVIDEND_RADAR', title: 'UPCOMING DIVIDEND RADAR', cols: 'col-span-2' },
      { id: 'w-chart', type: 'CHART', title: 'CANDLE • BBCA', cols: 'col-span-2', symbol: 'BBCA', timeframe: '1D', isSynced: true },
      { id: 'w-news', type: 'NEWS', title: 'MARKET NEWS WIRE', cols: 'col-span-2' },
    ],
  },
  {
    id: 'macro',
    label: 'Makro & Sentimen',
    icon: '🌐',
    widgets: [
      { id: 'w-indices', type: 'GLOBAL_INDICES', title: 'GLOBAL INDICES', cols: 'col-span-2' },
      { id: 'w-commodities', type: 'COMMODITIES', title: 'GLOBAL COMMODITIES & MACRO', cols: 'col-span-2' },
      { id: 'w-pulse', type: 'MARKET_PULSE', title: 'MARKET PULSE & SENTIMENT', cols: 'col-span-2' },
      { id: 'w-news', type: 'NEWS', title: 'MARKET NEWS WIRE', cols: 'col-span-2' },
    ],
  },
];

export default function FinceptCustomizableDashboard() {
  const router = useRouter();
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(INITIAL_WIDGETS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardWidgetConfig | null>(null);
  const [activePreset, setActivePreset] = useState<string>('traderDesk');
  const [widgetSearchQuery, setWidgetSearchQuery] = useState('');

  // ── Global Symbol Sync Channel 🟡 ──
  const [globalSymbol, setGlobalSymbol] = useState<string>('BBCA');
  const [isChannelSyncEnabled, setIsChannelSyncEnabled] = useState<boolean>(true);

  // ── Custom Presets Snapshot Manager ──
  const [customPresets, setCustomPresets] = useState<{ id: string; label: string; icon: string; widgets: DashboardWidgetConfig[] }[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // ── Preset Dropdown & Quick Ticker Jump ──
  const [isMorePresetsOpen, setIsMorePresetsOpen] = useState(false);
  const [quickTickerInput, setQuickTickerInput] = useState('');
  const morePresetsRef = useRef<HTMLDivElement>(null);

  // ── Drag & Drop Reordering State ──
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  // ── Mobile First Tab State ──
  const [mobileTab, setMobileTab] = useState<'chart' | 'order' | 'portfolio' | 'secondary'>('chart');

  // ── Workspace Pro Features State ──
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHotkeysModalOpen, setIsHotkeysModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [importJsonInput, setImportJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const quickTickerInputRef = useRef<HTMLInputElement>(null);

  // Close more presets dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (morePresetsRef.current && !morePresetsRef.current.contains(e.target as Node)) {
        setIsMorePresetsOpen(false);
      }
    };
    if (isMorePresetsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMorePresetsOpen]);

  // ── Live Hot Tickers Strip Data (Yahoo Finance Realtime) ──
  const [hotTickers, setHotTickers] = useState([
    { sym: 'BBCA', val: '10.450', chg: '+0.48%' },
    { sym: 'BMRI', val: '6.850', chg: '+1.11%' },
    { sym: 'BBRI', val: '4.960', chg: '+0.81%' },
    { sym: 'ASII', val: '5.125', chg: '+0.99%' },
    { sym: 'ADRO', val: '3.740', chg: '+1.63%' },
    { sym: 'TLKM', val: '2.920', chg: '+0.69%' },
    { sym: 'GOTO', val: '58', chg: '-1.69%' },
    { sym: '^JKSE', val: '7.380,25', chg: '+0.48%' },
  ]);

  useEffect(() => {
    const fetchHotQuotes = () => {
      fetch('/api/stocks/realtime?tickers=BBCA,BMRI,BBRI,ASII,ADRO,TLKM,GOTO,%5EJKSE')
        .then((res) => res.json())
        .then((data) => {
          if (data?.quotes) {
            setHotTickers((prev) =>
              prev.map((t) => {
                const q = data.quotes[t.sym];
                if (q && q.price > 0) {
                  return {
                    sym: t.sym,
                    val: q.price.toLocaleString('id-ID'),
                    chg: `${q.changePct >= 0 ? '+' : ''}${q.changePct.toFixed(2)}%`,
                  };
                }
                return t;
              })
            );
          }
        })
        .catch(() => {});
    };

    fetchHotQuotes();
    const interval = setInterval(fetchHotQuotes, 15000); // 15 detik auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Load saved layout and custom presets from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWidgets(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved widgets from localStorage', e);
    }

    try {
      const savedCustom = localStorage.getItem(CUSTOM_PRESETS_KEY);
      if (savedCustom) {
        const parsedCustom = JSON.parse(savedCustom);
        if (Array.isArray(parsedCustom)) {
          setCustomPresets(parsedCustom);
        }
      }
    } catch (e) {
      console.warn('Failed to load custom presets from localStorage', e);
    }

    // Check URL parameters for preset jumps (e.g. /?preset=bandarDesk)
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const presetQuery = urlParams.get('preset');
        if (presetQuery === 'bandar' || presetQuery === 'bandarDesk') {
          const bPreset = PRESET_LAYOUTS.find((p) => p.id === 'bandarDesk');
          if (bPreset) {
            setActivePreset('bandarDesk');
            setWidgets(bPreset.widgets);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(bPreset.widgets));
            } catch {}
          }
        }
      }
    } catch {}
  }, []);

  // Save to localStorage whenever widgets change
  const persistWidgets = (newWidgets: DashboardWidgetConfig[]) => {
    setWidgets(newWidgets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets));
    } catch (e) {
      console.warn('Failed to save widgets to localStorage', e);
    }
  };

  // ── Global Symbol Sync Handler (Syncs all linked widgets) ──
  const handleSyncGlobalSymbol = (newSymbol: string) => {
    const clean = newSymbol.replace('^', '').trim().toUpperCase();
    if (!clean) return;
    setGlobalSymbol(clean);
    if (isChannelSyncEnabled) {
      const updated = widgets.map((w) => {
        if (
          w.isSynced !== false &&
          (w.type === 'CHART' ||
            w.type === 'BANDAR_FLOW' ||
            w.type === 'QUICK_ORDER' ||
            w.type === 'ORDER_BOOK_DOM' ||
            w.type === 'TAPE_WHALE_READER' ||
            w.type === 'FOREIGN_FLOW_RADAR' ||
            w.type === 'AI_QUANT_PREDICTOR')
        ) {
          let newTitle = w.title;
          if (w.type === 'CHART') newTitle = `CANDLE • ${clean} <EQUITY>`;
          else if (w.type === 'BANDAR_FLOW') newTitle = `SMART MONEY • ${clean}`;
          else if (w.type === 'QUICK_ORDER') newTitle = `EXECUTION SLIP • ${clean}`;
          else if (w.type === 'ORDER_BOOK_DOM') newTitle = `DEPTH OF MARKET • ${clean} <DOM>`;
          else if (w.type === 'TAPE_WHALE_READER') newTitle = `WHALE TAPE READING • ${clean}`;
          else if (w.type === 'FOREIGN_FLOW_RADAR') newTitle = `FOREIGN FLOW RADAR • ${clean}`;
          else if (w.type === 'AI_QUANT_PREDICTOR') newTitle = `AI QUANT & ML FORECAST • ${clean}`;
          return {
            ...w,
            symbol: clean,
            title: newTitle,
          };
        }
        return w;
      });
      persistWidgets(updated);
    }
  };

  const handleToggleWidgetSync = (id: string) => {
    const updated = widgets.map((w) => {
      if (w.id === id) {
        return { ...w, isSynced: w.isSynced === false ? true : false };
      }
      return w;
    });
    persistWidgets(updated);
  };

  // ── Custom Preset Handlers ──
  const handleSaveCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newPresetName.trim();
    if (!cleanName) return;
    const newPreset = {
      id: `custom-${Date.now()}`,
      label: cleanName,
      icon: '👤',
      widgets: [...widgets],
    };
    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    try {
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updatedPresets));
    } catch (e) {
      console.warn('Failed to save custom presets', e);
    }
    setActivePreset(newPreset.id);
    setIsSaveModalOpen(false);
    setNewPresetName('');
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = customPresets.filter((p) => p.id !== id);
    setCustomPresets(filtered);
    try {
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to save custom presets', e);
    }
    if (activePreset === id) setActivePreset('traderDesk');
  };

  // Widget management
  const handleRemoveWidget = (id: string) => {
    persistWidgets(widgets.filter((w) => w.id !== id));
  };

  const handleUpdateWidget = (id: string, updates: Partial<DashboardWidgetConfig>) => {
    const updated = widgets.map((w) => {
      if (w.id === id) {
        return { ...w, ...updates };
      }
      return w;
    });
    persistWidgets(updated);
  };

  // ── Drag & Drop Handlers ──
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    const sourceIdx = widgets.findIndex((w) => w.id === draggedWidgetId);
    const targetIdx = widgets.findIndex((w) => w.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const reordered = [...widgets];
      const [removed] = reordered.splice(sourceIdx, 1);
      reordered.splice(targetIdx, 0, removed);
      persistWidgets(reordered);
    }

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  // ── Keyboard / 1-Click Move Widget Left or Right ──
  const handleMoveWidget = (id: string, direction: 'LEFT' | 'RIGHT') => {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'LEFT' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    const reordered = [...widgets];
    const [removed] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, removed);
    persistWidgets(reordered);
  };

  // ── Dynamic Width Resizing (1, 2, 3, 4 Columns) ──
  const colOrder: DashboardWidgetConfig['cols'][] = [
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'col-span-4',
  ];

  const handleResizeCols = (id: string, delta: 1 | -1) => {
    const target = widgets.find((w) => w.id === id);
    if (!target) return;
    const currentCols = target.cols;
    let idx = colOrder.indexOf(currentCols);
    if (idx === -1) {
      if (currentCols.includes('col-span-4')) idx = 3;
      else if (currentCols.includes('col-span-3')) idx = 2;
      else if (currentCols.includes('col-span-2')) idx = 1;
      else idx = 0;
    }
    const nextIdx = Math.max(0, Math.min(colOrder.length - 1, idx + delta));
    if (nextIdx !== idx) {
      handleUpdateWidget(id, { cols: colOrder[nextIdx] });
    }
  };

  // ── Dynamic Height Resizing (S: 280px, M: 395px, L: 540px) ──
  const heightOrder: NonNullable<DashboardWidgetConfig['height']>[] = [
    'h-[280px]',
    'h-[395px]',
    'h-[540px]',
  ];

  const handleCycleHeight = (id: string) => {
    const target = widgets.find((w) => w.id === id);
    if (!target) return;
    const currentH = target.height || 'h-[395px]';
    const idx = heightOrder.indexOf(currentH);
    const nextIdx = (idx + 1) % heightOrder.length;
    handleUpdateWidget(id, { height: heightOrder[nextIdx] });
  };

  // ── Export Workspace Config to JSON ──
  const handleExportWorkspace = () => {
    playAudioChime('CLICK');
    const data = {
      appName: 'Bloomberg Terminal Workstation',
      version: 'v8',
      exportedAt: new Date().toISOString(),
      activePreset,
      widgets,
      customPresets,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloomberg-workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import Workspace Config from JSON ──
  const handleImportWorkspace = (jsonStr: string) => {
    try {
      setImportError(null);
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !Array.isArray(parsed.widgets)) {
        setImportError('Format JSON tidak valid: Properti "widgets" harus berupa array.');
        return;
      }
      persistWidgets(parsed.widgets);
      if (Array.isArray(parsed.customPresets)) {
        setCustomPresets(parsed.customPresets);
        try {
          localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(parsed.customPresets));
        } catch (e) {}
      }
      if (parsed.activePreset) setActivePreset(parsed.activePreset);
      playAudioChime('ORDER_FILL');
      setIsExportImportModalOpen(false);
      setImportJsonInput('');
    } catch (err: any) {
      setImportError(`Gagal membaca JSON: ${err.message || 'Format salah'}`);
    }
  };

  // ── Global Keyboard Hotkeys Listener (Zero-Mouse Navigation) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      // ESC: Close open modals or exit fullscreen
      if (e.key === 'Escape') {
        if (isHotkeysModalOpen) setIsHotkeysModalOpen(false);
        else if (isExportImportModalOpen) setIsExportImportModalOpen(false);
        else if (isAddModalOpen) setIsAddModalOpen(false);
        else if (isSaveModalOpen) setIsSaveModalOpen(false);
        else if (editingWidget) setEditingWidget(null);
        else if (isFullscreen) setIsFullscreen(false);
        return;
      }

      // If typing inside an input, do not trigger trading hotkeys
      if (isInputActive) return;

      // / or Space: Focus Quick Ticker Jump Box
      if (e.key === '/' || e.code === 'Space') {
        e.preventDefault();
        quickTickerInputRef.current?.focus();
        playAudioChime('CLICK');
      }

      // F / f: Toggle Fullscreen Zen Mode
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
        playAudioChime('CLICK');
      }

      // ? : Toggle Hotkeys Cheat Sheet Modal
      if (e.key === '?') {
        e.preventDefault();
        setIsHotkeysModalOpen((prev) => !prev);
        playAudioChime('CLICK');
      }

      // B / b: Quick Focus/Add Quick Order Slip (BUY)
      if (e.key === 'b' || e.key === 'B') {
        const orderWidget = widgets.find((w) => w.type === 'QUICK_ORDER');
        if (!orderWidget) {
          handleAddWidget('QUICK_ORDER');
        }
        playAudioChime('CLICK');
      }

      // 1 - 3: Quick Preset Jump
      if (e.key === '1') {
        e.preventDefault();
        handleApplyPreset('traderDesk');
        playAudioChime('CLICK');
      } else if (e.key === '2') {
        e.preventDefault();
        handleApplyPreset('workstation');
        playAudioChime('CLICK');
      } else if (e.key === '3') {
        e.preventDefault();
        handleApplyPreset('standard');
        playAudioChime('CLICK');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isHotkeysModalOpen,
    isExportImportModalOpen,
    isAddModalOpen,
    isSaveModalOpen,
    editingWidget,
    isFullscreen,
    widgets,
  ]);

  const handleAddWidget = (type: WidgetType) => {
    const catalogItem = AVAILABLE_WIDGET_CATALOG.find((c) => c.type === type);
    if (!catalogItem) return;

    const newWidget: DashboardWidgetConfig = {
      id: `w-${type.toLowerCase()}-${Date.now()}`,
      type,
      title: catalogItem.title,
      cols: catalogItem.defaultCols,
      symbol: catalogItem.defaultSymbol || globalSymbol,
      timeframe: '1D',
      isSynced: true,
    };
    persistWidgets([...widgets, newWidget]);
    setIsAddModalOpen(false);
  };

  const handleApplyPreset = (presetId: string) => {
    const allPresets = [...PRESET_LAYOUTS, ...customPresets];
    const preset = allPresets.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePreset(presetId);
    persistWidgets(preset.widgets);
  };

  const handleResetLayout = () => {
    setActivePreset('traderDesk');
    persistWidgets(INITIAL_WIDGETS);
  };

  const handleTickerClick = (sym: string) => {
    handleSyncGlobalSymbol(sym);
  };

  // Render widget content by type
  const renderWidgetContent = (w: DashboardWidgetConfig) => {
    switch (w.type) {
      case 'CHART':
        return (
          <ChartWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
            onUpdateSymbol={(newSymbol) => handleSyncGlobalSymbol(newSymbol)}
            onUpdateTimeframe={(newTf) =>
              handleUpdateWidget(w.id, { timeframe: newTf })
            }
          />
        );
      case 'QUICK_ORDER':
        return (
          <QuickOrderWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
            onUpdateSymbol={(newSymbol) => handleSyncGlobalSymbol(newSymbol)}
          />
        );
      case 'PORTFOLIO_HOLDINGS':
        return (
          <PortfolioHoldingsWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'ORDER_BOOK_DOM':
        return (
          <OrderBookDOMWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
          />
        );
      case 'TAPE_WHALE_READER':
        return (
          <TapeWhaleReaderWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
          />
        );
      case 'FOREIGN_FLOW_RADAR':
        return (
          <ForeignFlowRadarWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
          />
        );
      case 'GLOBAL_INDICES':
        return (
          <GlobalIndicesWidget
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
          />
        );
      case 'MARKET_PULSE':
        return (
          <MarketPulseWidget
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
          />
        );
      case 'COMMODITIES':
        return (
          <CommoditiesWidget
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
          />
        );
      case 'NEWS':
        return (
          <NewsWidget
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'BANDAR_FLOW':
        return (
          <BandarFlowWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            onUpdateSymbol={(newSymbol) => handleSyncGlobalSymbol(newSymbol)}
          />
        );
      case 'DIVIDEND_RADAR':
        return (
          <DividendRadarWidget
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'GLOBAL_DIVIDENDS':
        return (
          <GlobalDividendsWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'CRYPTO':
      case 'STOCK_INDICES':
      case 'FOREX':
        return (
          <GlobalIndicesWidget
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
          />
        );
      case 'RISK_CALCULATOR':
        return (
          <RiskCalculatorWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
          />
        );
      case 'PRICE_ALERTS':
        return (
          <PriceAlertsWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
          />
        );
      case 'GLOBAL_CRAWLER_FEED':
        return (
          <GlobalCrawlerFeedWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'MARKET_HEATMAP':
        return (
          <MarketHeatmapWidget
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'AI_QUANT_PREDICTOR':
        return (
          <AIQuantPredictorWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
            onUpdateSymbol={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'OPENBB_TERMINAL':
        return (
          <OpenBBTerminalWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
            onUpdateSymbol={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
      case 'AI_CHART_PILOT':
        return (
          <AIChartPilotWidget
            widget={w}
            onRemove={() => handleRemoveWidget(w.id)}
            onEdit={() => setEditingWidget(w)}
            isSynced={w.isSynced !== false}
            onToggleSync={() => handleToggleWidgetSync(w.id)}
            onSelectStock={(ticker) => handleSyncGlobalSymbol(ticker)}
            onUpdateSymbol={(ticker) => handleSyncGlobalSymbol(ticker)}
          />
        );
    }
  };

  const filteredCatalog = AVAILABLE_WIDGET_CATALOG.filter(
    (c) =>
      c.title.toLowerCase().includes(widgetSearchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(widgetSearchQuery.toLowerCase())
  );

  return (
    <div
      className={`space-y-2 font-mono touch-manipulation ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#09090b] p-3 overflow-y-auto' : ''
      }`}
    >
      {/* Zen Fullscreen Exit Banner */}
      {isFullscreen && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#f59e0b] text-black font-extrabold text-xs rounded-sm mb-1">
          <div className="flex items-center gap-2">
            <span>⚡ ZEN FULLSCREEN TRADING WORKSTATION</span>
            <span className="text-[10px] font-normal opacity-80">(Bebas Distraksi)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="bg-black hover:bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
          >
            Keluar Fullscreen (Esc / F) ✕
          </button>
        </div>
      )}

      {/* ── User-Friendly Workspace Controls Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-sm text-xs">
        {/* Left: Essential Layout Modes (3 Primary) + Dropdown Lainnya */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#71717a] uppercase font-bold mr-1 hidden sm:inline">
            MODE:
          </span>

          {/* 3 Primary Presets */}
          {PRESET_LAYOUTS.filter((p) => ['traderDesk', 'workstation', 'chartFocus'].includes(p.id)).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activePreset === p.id
                  ? 'bg-[#18181b] text-[#f59e0b] border border-[#f59e0b]/50 shadow-sm'
                  : 'bg-transparent text-[#a1a1aa] hover:text-white hover:bg-[#121215] border border-transparent'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}

          {/* Secondary Presets & Custom Presets Dropdown */}
          {(() => {
            const secondaryPresets = PRESET_LAYOUTS.filter(
              (p) => !['traderDesk', 'workstation', 'chartFocus'].includes(p.id)
            );
            const activeSecondary = [...secondaryPresets, ...customPresets].find((p) => p.id === activePreset);

            return (
              <div className="relative" ref={morePresetsRef}>
                <button
                  type="button"
                  onClick={() => setIsMorePresetsOpen(!isMorePresetsOpen)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer border ${
                    activeSecondary
                      ? 'bg-[#18181b] text-[#f59e0b] border-[#f59e0b]/50 shadow-sm'
                      : 'bg-transparent text-[#a1a1aa] border-[#27272a] hover:text-white hover:bg-[#121215]'
                  }`}
                  title="Pilih layout lainnya atau preset tersimpan Anda"
                >
                  <span>{activeSecondary ? activeSecondary.icon : '🗂️'}</span>
                  <span>{activeSecondary ? activeSecondary.label : 'Layout Lainnya'}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 text-[#71717a]" />
                </button>

                {isMorePresetsOpen && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-[#0d0d11] border border-[#27272a] rounded shadow-2xl z-50 p-1.5 space-y-1 font-mono text-xs">
                    <div className="px-2 py-1 text-[9px] text-[#71717a] font-bold uppercase tracking-wider">
                      Preset Siap Pakai
                    </div>
                    {secondaryPresets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          handleApplyPreset(p.id);
                          setIsMorePresetsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-[11px] font-bold transition-colors cursor-pointer ${
                          activePreset === p.id
                            ? 'bg-[#f59e0b] text-black font-extrabold'
                            : 'text-[#d4d4d8] hover:bg-[#18181b] hover:text-white'
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}

                    {/* Custom Presets Section */}
                    {customPresets.length > 0 && (
                      <>
                        <div className="border-t border-[#27272a] my-1" />
                        <div className="px-2 py-1 text-[9px] text-[#38bdf8] font-bold uppercase tracking-wider">
                          Preset Kustom Anda ({customPresets.length})
                        </div>
                        {customPresets.map((cp) => (
                          <div
                            key={cp.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                              activePreset === cp.id
                                ? 'bg-[#38bdf8] text-black font-extrabold'
                                : 'text-[#d4d4d8] hover:bg-[#18181b]'
                            }`}
                            onClick={() => {
                              handleApplyPreset(cp.id);
                              setIsMorePresetsOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span>{cp.icon}</span>
                              <span className="truncate">{cp.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomPreset(cp.id, e);
                              }}
                              className="text-[#71717a] hover:text-[#ef4444] p-0.5 ml-1"
                              title="Hapus Preset Ini"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          <span className="text-[#3f3f46] hidden md:inline">|</span>
          <span className="text-[#71717a] text-[10px] hidden md:inline">
            {widgets.length} Widget
          </span>
        </div>

        {/* Right: Actions (Simpan, Export/Import, Hotkeys, Fullscreen, Tambah, Reset) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Hotkeys Cheat Sheet Button */}
          <button
            type="button"
            onClick={() => {
              playAudioChime('CLICK');
              setIsHotkeysModalOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors cursor-pointer"
            title="Daftar Tombol Pintas / Keyboard Hotkeys (Tekan ?)"
          >
            <Keyboard className="w-3 h-3 text-[#f59e0b]" />
            <span className="hidden sm:inline">Hotkeys [?]</span>
          </button>

          {/* Backup / Restore JSON Button */}
          <button
            type="button"
            onClick={() => {
              playAudioChime('CLICK');
              setIsExportImportModalOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors cursor-pointer"
            title="Cadangkan atau Pulihkan Layout Workspace (.JSON)"
          >
            <Download className="w-3 h-3 text-[#38bdf8]" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Zen Fullscreen Button */}
          <button
            type="button"
            onClick={() => {
              playAudioChime('CLICK');
              setIsFullscreen(!isFullscreen);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
              isFullscreen
                ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border-[#27272a]'
            }`}
            title="Layar Penuh / Zen Mode (Tekan F)"
          >
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Keluar' : 'Zen'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-[#18181b] hover:bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]/40 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Simpan susunan widget saat ini sebagai preset pribadi"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Simpan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold bg-[#f59e0b] text-black hover:bg-[#fbbf24] transition-colors shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Widget</span>
          </button>

          <button
            type="button"
            onClick={handleResetLayout}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
            title="Reset ke susunan widget standar"
          >
            <RotateCcw className="w-3 h-3 text-[#f59e0b]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Master Channel Sync & Quick Ticker Jump Strip ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121215] border border-[#27272a] rounded-sm text-[11px] overflow-x-auto text-[#a1a1aa] whitespace-nowrap scrollbar-thin">
        {/* Master Symbol Channel Sync Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] shrink-0 font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
          <span className="font-bold">CHANNEL 🟡:</span>
          <span className="bg-[#f59e0b] text-black font-extrabold px-1.5 py-0.2 rounded text-[10px]">
            {globalSymbol}
          </span>
          <button
            type="button"
            onClick={() => setIsChannelSyncEnabled(!isChannelSyncEnabled)}
            className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold transition-colors cursor-pointer ${
              isChannelSyncEnabled ? 'bg-[#22c55e] text-black' : 'bg-[#27272a] text-[#71717a]'
            }`}
            title="Nyalakan/matikan sinkronisasi antar widget"
          >
            {isChannelSyncEnabled ? 'SYNC ON' : 'SYNC OFF'}
          </button>
        </div>

        {/* Quick Ticker Search Jump Box */}
        <div className="flex items-center bg-[#09090b] border border-[#27272a] focus-within:border-[#f59e0b] rounded px-2 py-0.5 shrink-0 transition-colors">
          <Search className="w-3 h-3 text-[#71717a] mr-1.5 shrink-0" />
          <input
            ref={quickTickerInputRef}
            type="text"
            value={quickTickerInput}
            onChange={(e) => setQuickTickerInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quickTickerInput.trim()) {
                handleSyncGlobalSymbol(quickTickerInput.trim());
                setQuickTickerInput('');
              }
            }}
            placeholder="Cari Ticker [/ or Space]..."
            className="w-28 sm:w-36 bg-transparent text-white font-mono font-bold text-[10px] outline-none placeholder-[#52525b]"
          />
          <button
            type="button"
            onClick={() => {
              if (quickTickerInput.trim()) {
                handleSyncGlobalSymbol(quickTickerInput.trim());
                setQuickTickerInput('');
              }
            }}
            className="text-[9px] bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-extrabold px-1.5 py-0.2 rounded transition-colors cursor-pointer ml-1"
          >
            SYNC
          </button>
        </div>

        {/* Market Status Live Badge */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[9px] text-[#22c55e] font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span>IDX LIVE</span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-white shrink-0 ml-1">
          <span className="text-[#3f3f46]">|</span>
          <span className="text-[10px] text-[#71717a]">HOT:</span>
        </div>

        {hotTickers.map((t) => (
          <button
            key={t.sym}
            type="button"
            onClick={() => handleTickerClick(t.sym)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors cursor-pointer shrink-0 font-mono text-[10px] ${
              globalSymbol === t.sym
                ? 'bg-[#f59e0b] text-black font-extrabold border-[#f59e0b]'
                : 'bg-[#18181b]/60 hover:bg-[#27272a] text-[#d4d4d8] border-[#27272a]'
            }`}
            title={`Klik untuk sinkronisasi ${t.sym} ke semua widget yang terhubung`}
          >
            <span className={globalSymbol === t.sym ? 'text-black font-black' : 'text-[#f59e0b] font-bold'}>{t.sym}</span>
            <span className={globalSymbol === t.sym ? 'text-black' : 'text-[#d4d4d8]'}>{t.val}</span>
            <span
              className={`font-bold ${
                globalSymbol === t.sym
                  ? 'text-black'
                  : t.chg.startsWith('+')
                  ? 'text-[#22c55e]'
                  : 'text-[#ef4444]'
              }`}
            >
              {t.chg}
            </span>
          </button>
        ))}
      </div>

      {/* ── Mobile First Clean Workspace (< md) ── */}
      <div className="block md:hidden mb-3">
        <div className="flex border border-zinc-800 rounded-lg p-1 bg-zinc-900/90 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMobileTab('chart')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mobileTab === 'chart'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📈 Grafik
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('order')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mobileTab === 'order'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ⚡ Order Slip
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('portfolio')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mobileTab === 'portfolio'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            💼 Portofolio
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('secondary')}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mobileTab === 'secondary'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            📰 Pasar
          </button>
        </div>

        {/* Focused Mobile Widget View */}
        <div className="mt-2 bg-[#09090b] border border-[#27272a] rounded-lg overflow-hidden">
          {mobileTab === 'chart' && (
            <div className="h-[460px]">
              {renderWidgetContent(widgets.find((w) => w.type === 'CHART') || widgets[0])}
            </div>
          )}
          {mobileTab === 'order' && (
            <div className="min-h-[460px] p-2">
              {renderWidgetContent(widgets.find((w) => w.type === 'QUICK_ORDER') || widgets[0])}
            </div>
          )}
          {mobileTab === 'portfolio' && (
            <div className="min-h-[380px] p-2">
              {renderWidgetContent(widgets.find((w) => w.type === 'PORTFOLIO_HOLDINGS') || widgets[0])}
            </div>
          )}
          {mobileTab === 'secondary' && (
            <div className="space-y-3 p-2">
              {widgets
                .filter((w) => !['CHART', 'QUICK_ORDER', 'PORTFOLIO_HOLDINGS'].includes(w.type))
                .slice(0, 4)
                .map((w) => (
                  <div key={w.id} className="h-[340px] border border-zinc-800 rounded-lg overflow-hidden">
                    {renderWidgetContent(w)}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Dynamic Grid Canvas (Multi-widget workspace for Desktop / Tablet) ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {widgets.map((w) => {
          const isDragging = draggedWidgetId === w.id;
          const isDragOver = dragOverWidgetId === w.id && draggedWidgetId !== w.id;
          const widgetHeight = w.height || 'h-[395px]';

          return (
            <div
              key={w.id}
              onDragOver={(e) => handleDragOver(e, w.id)}
              onDrop={(e) => handleDrop(e, w.id)}
              onDragEnd={handleDragEnd}
              className={`${w.cols} ${widgetHeight} flex flex-col group/widget transition-all duration-150 rounded-sm border ${
                isDragging
                  ? 'opacity-40 border-dashed border-[#f59e0b] scale-[0.98]'
                  : isDragOver
                  ? 'border-2 border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-[1.01]'
                  : 'border-[#27272a] hover:border-[#3f3f46]'
              } bg-[#09090b] overflow-hidden`}
            >
              {/* Mini Toolbar: Drag handle, Reorder buttons, Width adjust (-W / +W), and Height toggle */}
              <div className="flex items-center justify-between px-2 py-0.5 bg-[#121216] border-b border-[#27272a] text-[10px] font-mono text-[#a1a1aa] select-none">
                <div className="flex items-center gap-1">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, w.id)}
                    className="flex items-center gap-1 hover:text-[#f59e0b] transition-colors cursor-grab active:cursor-grabbing px-1 py-0.5 rounded hover:bg-[#18181b]"
                    title="Tarik / drag untuk memindahkan posisi widget"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-[#71717a] group-hover/widget:text-[#f59e0b]" />
                    <span className="font-semibold text-[9px] uppercase tracking-wider text-[#71717a] hidden sm:inline">
                      DRAG
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveWidget(w.id, 'LEFT');
                      }}
                      title="Geser posisi ke kiri / urutan sebelumnya"
                      className="p-0.5 hover:text-white hover:bg-[#27272a] rounded transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveWidget(w.id, 'RIGHT');
                      }}
                      title="Geser posisi ke kanan / urutan sesudahnya"
                      className="p-0.5 hover:text-white hover:bg-[#27272a] rounded transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Size Controls: Lebar (-W / +W) & Tinggi (S / M / L) */}
                <div
                  className="flex items-center gap-1.5 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Width Adjuster */}
                  <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded px-1 py-0.5 gap-1">
                    <button
                      type="button"
                      onClick={() => handleResizeCols(w.id, -1)}
                      disabled={w.cols === 'col-span-1'}
                      title="Perkecil lebar kolom widget"
                      className="px-0.5 text-[#a1a1aa] hover:text-[#f59e0b] font-bold text-[9px] disabled:opacity-30 disabled:hover:text-[#a1a1aa]"
                    >
                      -W
                    </button>
                    <span className="text-[#f59e0b] font-bold text-[9px] px-0.5">
                      {w.cols === 'col-span-1'
                        ? '1C'
                        : w.cols === 'col-span-2'
                        ? '2C'
                        : w.cols === 'col-span-3'
                        ? '3C'
                        : '4C'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResizeCols(w.id, 1)}
                      disabled={w.cols === 'col-span-4'}
                      title="Perbesar lebar kolom widget"
                      className="px-0.5 text-[#a1a1aa] hover:text-[#f59e0b] font-bold text-[9px] disabled:opacity-30 disabled:hover:text-[#a1a1aa]"
                    >
                      +W
                    </button>
                  </div>

                  {/* Height Cycle Toggle */}
                  <button
                    type="button"
                    onClick={() => handleCycleHeight(w.id)}
                    title="Ubah tinggi: S (280px) -> M (395px) -> L (540px)"
                    className="flex items-center gap-0.5 bg-[#18181b] border border-[#27272a] hover:border-[#f59e0b] px-1.5 py-0.5 rounded text-[#d4d4d8] hover:text-[#f59e0b] transition-colors"
                  >
                    <ArrowUpDown className="w-2.5 h-2.5 text-[#f59e0b]" />
                    <span className="font-bold text-[9px]">
                      {widgetHeight === 'h-[280px]'
                        ? 'S (280)'
                        : widgetHeight === 'h-[540px]'
                        ? 'L (540)'
                        : 'M (395)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Widget Body Content */}
              <div className="flex-1 min-h-0 overflow-hidden [&>div]:border-0 [&>div]:rounded-none">
                {renderWidgetContent(w)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── EDIT WIDGET MODAL ── */}
      {editingWidget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-sm max-w-md w-full p-4 font-mono text-xs space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Settings className="w-4 h-4 text-[#f59e0b]" />
                <span>PENGATURAN WIDGET</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingWidget(null)}
                className="text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[#71717a] block mb-1">JUDUL WIDGET</label>
                <input
                  type="text"
                  value={editingWidget.title}
                  onChange={(e) =>
                    setEditingWidget({ ...editingWidget, title: e.target.value })
                  }
                  className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] px-2 py-1.5 rounded text-white text-xs outline-none"
                />
              </div>

              {(editingWidget.type === 'CHART' ||
                editingWidget.type === 'BANDAR_FLOW' ||
                editingWidget.type === 'GLOBAL_DIVIDENDS' ||
                editingWidget.type === 'AI_QUANT_PREDICTOR') && (
                <div>
                  <label className="text-[10px] text-[#71717a] block mb-1">
                    KODE SAHAM (IDX / GLOBAL)
                  </label>
                  <input
                    type="text"
                    value={editingWidget.symbol || 'BBCA'}
                    onChange={(e) =>
                      setEditingWidget({
                        ...editingWidget,
                        symbol: e.target.value.toUpperCase(),
                        title:
                          editingWidget.type === 'CHART'
                            ? `CANDLE • ${e.target.value.toUpperCase()}`
                            : editingWidget.type === 'BANDAR_FLOW'
                            ? `SMART MONEY • ${e.target.value.toUpperCase()}`
                            : editingWidget.type === 'AI_QUANT_PREDICTOR'
                            ? `AI QUANT & ML FORECAST • ${e.target.value.toUpperCase()}`
                            : `GLOBAL DIVIDENDS • ${e.target.value.toUpperCase()}`,
                      })
                    }
                    placeholder="Contoh: BBCA, BMRI, KO, AAPL..."
                    className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] px-2 py-1.5 rounded text-[#f59e0b] font-bold text-xs outline-none mb-2"
                  />

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-[#71717a] block">PILIH CEPAT IDX:</span>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_IDX_TICKERS.slice(0, 8).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setEditingWidget({
                              ...editingWidget,
                              symbol: t,
                              title:
                                editingWidget.type === 'CHART'
                                  ? `CANDLE • ${t}`
                                  : editingWidget.type === 'BANDAR_FLOW'
                                  ? `SMART MONEY • ${t}`
                                  : editingWidget.type === 'AI_QUANT_PREDICTOR'
                                  ? `AI QUANT & ML FORECAST • ${t}`
                                  : `GLOBAL DIVIDENDS • ${t}`,
                            })
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            editingWidget.symbol === t
                              ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                              : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-[#71717a] block mb-1">LEBAR WIDGET</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { col: 'col-span-1', label: '1 Kolom (25%)' },
                    { col: 'col-span-2', label: '2 Kolom (50%)' },
                    { col: 'col-span-3', label: '3 Kolom (75%)' },
                    { col: 'col-span-4', label: 'Penuh (100%)' },
                  ].map((c) => (
                    <button
                      key={c.col}
                      type="button"
                      onClick={() =>
                        setEditingWidget({
                          ...editingWidget,
                          cols: c.col as DashboardWidgetConfig['cols'],
                        })
                      }
                      className={`p-1.5 text-center rounded border transition-colors text-[10px] cursor-pointer ${
                        editingWidget.cols === c.col
                          ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b] font-bold'
                          : 'bg-[#121216] border-[#27272a] text-[#71717a] hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#71717a] block mb-1">TINGGI WIDGET</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { h: 'h-[280px]', label: 'Kecil / S (280px)' },
                    { h: 'h-[395px]', label: 'Normal / M (395px)' },
                    { h: 'h-[540px]', label: 'Tinggi / L (540px)' },
                  ].map((item) => (
                    <button
                      key={item.h}
                      type="button"
                      onClick={() =>
                        setEditingWidget({
                          ...editingWidget,
                          height: item.h as DashboardWidgetConfig['height'],
                        })
                      }
                      className={`p-1.5 text-center rounded border transition-colors text-[10px] cursor-pointer ${
                        (editingWidget.height || 'h-[395px]') === item.h
                          ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b] font-bold'
                          : 'bg-[#121216] border-[#27272a] text-[#71717a] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#27272a] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingWidget(null)}
                className="px-3 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white rounded text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateWidget(editingWidget.id, editingWidget);
                  setEditingWidget(null);
                }}
                className="px-4 py-1 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD WIDGET MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-sm max-w-lg w-full p-4 font-mono text-xs space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Plus className="w-4 h-4 text-[#f59e0b]" />
                <span>TAMBAH WIDGET KE DASHBOARD</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search filter for widgets */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
              <input
                type="text"
                value={widgetSearchQuery}
                onChange={(e) => setWidgetSearchQuery(e.target.value)}
                placeholder="Cari jenis widget (Chart, Dividen, Bandar, Berita)..."
                className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] pl-8 pr-3 py-1.5 rounded text-white text-xs outline-none"
              />
            </div>

            <div className="divide-y divide-[#18181b] max-h-80 overflow-y-auto">
              {filteredCatalog.map((cat) => (
                <div
                  key={cat.type}
                  onClick={() => handleAddWidget(cat.type)}
                  className="py-2.5 px-2 hover:bg-[#18181b] cursor-pointer flex items-center justify-between rounded transition-colors group"
                >
                  <div>
                    <div className="font-bold text-white text-xs group-hover:text-[#f59e0b]">
                      {cat.title}
                    </div>
                    <div className="text-[10px] text-[#71717a]">{cat.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-[#27272a] px-1.5 py-0.5 rounded text-[#a1a1aa]">
                      {cat.defaultCols}
                    </span>
                    <button
                      type="button"
                      className="text-[#f59e0b] group-hover:bg-[#f59e0b] group-hover:text-black font-bold px-2 py-0.5 rounded border border-[#f59e0b]/40 text-[10px]"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="py-6 text-center text-[#71717a] text-xs">
                  Tidak ada widget yang cocok dengan pencarian.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-3 py-1 rounded text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SAVE CUSTOM PRESET MODAL ── */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomPreset}
            className="bg-[#09090b] border border-[#f59e0b]/40 rounded-sm max-w-sm w-full p-4 font-mono text-xs space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-[#f59e0b]">💾</span>
                <span>SIMPAN LAYOUT PRIBADI</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-[#71717a] block">
                NAMA LAYOUT KUSTOM:
              </label>
              <input
                type="text"
                required
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Misal: Scalping Pagi, Pantau BBCA..."
                className="w-full bg-[#121216] border border-[#27272a] focus:border-[#f59e0b] px-2.5 py-1.5 rounded text-white text-xs outline-none"
                autoFocus
              />
              <p className="text-[9px] text-[#71717a]">
                Layout dengan {widgets.length} widget saat ini akan disimpan ke browser Anda.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3 py-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-[#f59e0b] hover:bg-[#fbbf24] text-black font-bold text-xs cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── HOTKEYS CHEAT SHEET MODAL ── */}
      {isHotkeysModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-sm max-w-lg w-full p-4 font-mono text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Keyboard className="w-4 h-4 text-[#f59e0b]" />
                <span>TERMINAL KEYBOARD HOTKEYS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsHotkeysModalOpen(false)}
                className="text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <p className="text-[#71717a] text-[10px]">
                Navigasi cepat ala terminal Bloomberg tanpa perlu mouse (*Zero-Mouse Trading*):
              </p>

              <div className="grid grid-cols-1 gap-1.5 divide-y divide-[#1e1e24]">
                <div className="pt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <kbd className="bg-[#18181b] border border-[#3f3f46] px-2 py-0.5 rounded text-white font-bold text-[10px]">
                      /
                    </kbd>
                    <span className="text-[#71717a]">atau</span>
                    <kbd className="bg-[#18181b] border border-[#3f3f46] px-2 py-0.5 rounded text-white font-bold text-[10px]">
                      Space
                    </kbd>
                  </div>
                  <span className="text-[#d4d4d8]">Fokus Cari Saham & Channel Sync</span>
                </div>

                <div className="pt-1.5 flex items-center justify-between">
                  <kbd className="bg-[#18181b] border border-[#3f3f46] px-2 py-0.5 rounded text-[#22c55e] font-bold text-[10px]">
                    B
                  </kbd>
                  <span className="text-[#d4d4d8]">Fokus / Tambah Quick Order Slip (BELI)</span>
                </div>

                <div className="pt-1.5 flex items-center justify-between">
                  <kbd className="bg-[#18181b] border border-[#3f3f46] px-2 py-0.5 rounded text-[#f59e0b] font-bold text-[10px]">
                    F
                  </kbd>
                  <span className="text-[#d4d4d8]">Toggle Layar Penuh (Zen Fullscreen)</span>
                </div>

                <div className="pt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <kbd className="bg-[#18181b] border border-[#3f3f46] px-1.5 py-0.5 rounded text-white font-bold text-[10px]">
                      1
                    </kbd>
                    <kbd className="bg-[#18181b] border border-[#3f3f46] px-1.5 py-0.5 rounded text-white font-bold text-[10px]">
                      2
                    </kbd>
                    <kbd className="bg-[#18181b] border border-[#3f3f46] px-1.5 py-0.5 rounded text-white font-bold text-[10px]">
                      3
                    </kbd>
                  </div>
                  <span className="text-[#d4d4d8]">Ganti Cepat Mode Preset Layout</span>
                </div>

                <div className="pt-1.5 flex items-center justify-between">
                  <kbd className="bg-[#18181b] border border-[#3f3f46] px-2 py-0.5 rounded text-[#38bdf8] font-bold text-[10px]">
                    ?
                  </kbd>
                  <span className="text-[#d4d4d8]">Buka Menu Bantuan Hotkeys Ini</span>
                </div>

                <div className="pt-1.5 flex items-center justify-between">
                  <kbd className="bg-[#18181b] border border-[#3f3f46] px-2 py-0.5 rounded text-[#ef4444] font-bold text-[10px]">
                    Esc
                  </kbd>
                  <span className="text-[#d4d4d8]">Tutup Modal / Keluar Fullscreen</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => setIsHotkeysModalOpen(false)}
                className="px-4 py-1 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Tutup (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BACKUP & RESTORE WORKSPACE MODAL ── */}
      {isExportImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-sm max-w-lg w-full p-4 font-mono text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <Download className="w-4 h-4 text-[#38bdf8]" />
                <span>BACKUP & RESTORE WORKSPACE (.JSON)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsExportImportModalOpen(false)}
                className="text-[#71717a] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Export Box */}
              <div className="bg-[#121216] border border-[#27272a] rounded p-3 space-y-2">
                <span className="text-[#f59e0b] font-bold text-[11px] block">1. EKSPOR / CADANGKAN KONFIGURASI</span>
                <p className="text-[10px] text-[#71717a]">
                  Unduh seluruh konfigurasi {widgets.length} widget dan preset kustom Anda dalam bentuk file <code>.json</code>.
                </p>
                <button
                  type="button"
                  onClick={handleExportWorkspace}
                  className="bg-[#18181b] hover:bg-[#27272a] border border-[#38bdf8] text-[#38bdf8] font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File bloomberg-workspace.json</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="bg-[#121216] border border-[#27272a] rounded p-3 space-y-2">
                <span className="text-[#22c55e] font-bold text-[11px] block">2. IMPOR / PULIHKAN DARI JSON</span>
                <p className="text-[10px] text-[#71717a]">
                  Tempelkan isi JSON konfigurasi workspace Anda ke bawah ini:
                </p>
                <textarea
                  rows={4}
                  value={importJsonInput}
                  onChange={(e) => setImportJsonInput(e.target.value)}
                  placeholder='{"widgets": [...], "customPresets": [...]}'
                  className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#22c55e] p-2 rounded text-white text-[10px] font-mono outline-none"
                />

                {importError && (
                  <div className="text-[#ef4444] text-[10px] bg-[#ef4444]/10 p-1.5 rounded border border-[#ef4444]/30">
                    {importError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleImportWorkspace(importJsonInput)}
                  disabled={!importJsonInput.trim()}
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pulihkan Layout Sekarang</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => setIsExportImportModalOpen(false)}
                className="px-3 py-1 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] rounded text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
