'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  CalendarRange,
  BedDouble,
  Bike,
  Sparkles,
  Inbox,
  Gift,
  Newspaper,
  SlidersHorizontal,
  CreditCard,
  Users,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  Sun,
  Moon,
  Check,
  X,
  Search,
  Columns3,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Plus,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  Printer,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  LogOut,
  Eye,
  Copy,
  Image as ImageIcon,
} from 'lucide-react';
import {
  approveDeposit,
  rejectDeposit,
  createDepositRequest,
  resetMemberPassword,
  resetMemberAccountToZero,
  deleteMemberAccount,
  DepositRecord,
  MemberPortfolioItem,
} from '@/app/admin/actions';
import { useAdminAuth } from '@/components/admin/AdminAuthGate';

// ============================================================================
// DATE & FORMAT HELPERS (100% Steyer Studio Parity)
// ============================================================================
function addDays(iso: string, n: number): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  if (!a || !b) return 0;
  return Math.round((new Date(b + 'T12:00:00Z').getTime() - new Date(a + 'T12:00:00Z').getTime()) / 86400000);
}

function dayRange(from: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(from, i));
}

function fmtShort(iso: string): string {
  if (!iso || iso.length < 10) return iso || '—';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const WEEKDAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function fmtWd(iso: string, lang: 'en' | 'id' | 'de' = 'en'): string {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00Z');
  const idx = d.getUTCDay();
  if (lang === 'id') return WEEKDAYS_ID[idx];
  if (lang === 'de') return WEEKDAYS_DE[idx];
  return WEEKDAYS_EN[idx];
}

function isWeekend(iso: string): boolean {
  if (!iso) return false;
  const w = new Date(iso + 'T12:00:00Z').getUTCDay();
  return w === 0 || w === 6;
}

function minToTime(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function fmtEur(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return `€${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function fmtIdr(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return 'Rp 0';
  return `Rp ${Math.round(Number(n)).toLocaleString('id-ID')}`;
}

function bookingCode(prefix: string, id: number | string): string {
  return `${prefix}-${String(id).padStart(4, '0')}`;
}

// ============================================================================
// CONTEXT MENU & DATA TABLE TYPES
// ============================================================================
export interface ContextMenuItem {
  label?: string;
  icon?: React.ReactNode;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  sep?: boolean;
  onClick?: () => void;
}

export interface DataTableColumn<T> {
  id: string;
  label: string;
  accessor?: (row: T) => any;
  sortValue?: (row: T) => any;
  cell?: (row: T) => React.ReactNode;
  num?: boolean;
  className?: string;
  thClass?: string;
  sortable?: boolean;
  filter?: 'text' | 'select' | false;
  options?: Array<string | { value: string; label: string }>;
  filterPlaceholder?: string;
  hideable?: boolean;
  defaultHidden?: boolean;
}

function RenderContextMenu({
  menu,
  onClose,
}: {
  menu: { x: number; y: number; items: ContextMenuItem[] } | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  useEffect(() => {
    if (!menu) return;
    const el = ref.current;
    const w = el ? el.offsetWidth : 210;
    const h = el ? el.offsetHeight : 180;
    const left = Math.min(menu.x, window.innerWidth - w - 8);
    const top = Math.min(menu.y, window.innerHeight - h - 8);
    setPos({ left: Math.max(8, left), top: Math.max(8, top) });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const handleDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', onClose, true);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [menu, onClose]);

  if (!menu) return null;
  const visible = menu.items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <div
      ref={ref}
      className="menu-pop ctx-menu"
      role="menu"
      style={{ left: pos.left, top: pos.top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {visible.map((it, idx) =>
        it.sep ? (
          <hr key={idx} />
        ) : (
          <button
            key={idx}
            type="button"
            role="menuitem"
            className={`menu-item ${it.danger ? 'danger' : ''}`}
            disabled={it.disabled}
            onClick={() => {
              onClose();
              it.onClick?.();
            }}
          >
            {it.icon && <span className="ctx-ic">{it.icon}</span>}
            <span>{it.label}</span>
            {it.hint && <small className="muted end">{it.hint}</small>}
          </button>
        )
      )}
    </div>
  );
}

// ============================================================================
// REUSABLE ENTERPRISE DATATABLE (100% Steyer Studio `function R`)
// ============================================================================
function DataTable<T>({
  id,
  rows,
  columns,
  defaultSort,
  rowKey = (r: any) => r.id,
  rowClass,
  onRowClick,
  rowMenu,
  left,
  right,
  empty = 'No entries.',
  fill = false,
  defaultPageSize = 25,
}: {
  id: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  defaultSort?: { col: string; dir: 'asc' | 'desc' };
  rowKey?: (row: T) => string | number;
  rowClass?: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowMenu?: (row: T) => ContextMenuItem[];
  left?: React.ReactNode;
  right?: React.ReactNode;
  empty?: string;
  fill?: boolean;
  defaultPageSize?: number;
}) {
  const [search, setSearch] = useState('');
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' } | null>(defaultSort || null);
  const [hiddenCols, setHiddenCols] = useState<string[]>(() =>
    columns.filter((c) => c.defaultHidden).map((c) => c.id)
  );
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);
  const [colsOpen, setColsOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const colsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colsOpen) return;
    const handler = (e: MouseEvent) => {
      if (colsMenuRef.current && !colsMenuRef.current.contains(e.target as Node)) {
        setColsOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [colsOpen]);

  const visibleCols = useMemo(
    () => columns.filter((c) => !hiddenCols.includes(c.id)),
    [columns, hiddenCols]
  );

  const hasFilters = useMemo(
    () => columns.some((c) => c.filter !== undefined && c.filter !== false),
    [columns]
  );

  const selectOptionsMap = useMemo(() => {
    const map: Record<string, Array<{ value: string; label: string }>> = {};
    for (const c of columns) {
      if (c.filter === 'select') {
        if (c.options) {
          map[c.id] = c.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
        } else if (c.accessor) {
          const vals = Array.from(
            new Set(rows.map((r) => c.accessor!(r)).filter((v) => v !== null && v !== undefined && v !== ''))
          );
          map[c.id] = vals.map((v) => ({ value: String(v), label: String(v) }));
        } else {
          map[c.id] = [];
        }
      }
    }
    return map;
  }, [columns, rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activeFilters = Object.entries(colFilters).filter(([, v]) => v !== '' && v !== undefined);
    return rows.filter((r) => {
      if (q) {
        const hit = columns.some((c) => {
          if (!c.accessor) return false;
          const v = c.accessor(r);
          return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
        });
        if (!hit) return false;
      }
      for (const [cid, fval] of activeFilters) {
        const col = columns.find((c) => c.id === cid);
        if (!col || !col.accessor) continue;
        const val = String(col.accessor(r) ?? '');
        if (col.filter === 'select') {
          if (val !== fval) return false;
        } else if (!val.toLowerCase().includes(fval.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [rows, columns, search, colFilters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.id === sort.col);
    if (!col) return filtered;
    const getter = col.sortValue || col.accessor;
    if (!getter) return filtered;
    const mul = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = getter(a);
      const vb = getter(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mul;
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * mul;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => sorted.slice((curPage - 1) * pageSize, curPage * pageSize),
    [sorted, curPage, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [search, colFilters, pageSize]);

  const toggleSort = (cid: string) => {
    setSort((prev) => {
      if (!prev || prev.col !== cid) return { col: cid, dir: 'asc' };
      if (prev.dir === 'asc') return { col: cid, dir: 'desc' };
      return null;
    });
  };

  const toggleCol = (cid: string) => {
    setHiddenCols((prev) => (prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]));
  };

  const isDirty = search !== '' || Object.values(colFilters).some((v) => v);
  const hideableCols = columns.filter((c) => c.hideable !== false && c.label);

  return (
    <div className={`dt ${fill ? 'fill-dt' : ''}`} data-dt={id}>
      <div className="dt-bar">
        <div className="dt-bar-l">
          {left}
          {isDirty && (
            <button
              type="button"
              className="btn-s ghost"
              onClick={() => {
                setSearch('');
                setColFilters({});
              }}
            >
              Reset filters ×
            </button>
          )}
        </div>
        <div className="dt-bar-r">
          {right}
          <label className="search">
            <Search className="w-3.5 h-3.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search …"
            />
            {search && (
              <button
                type="button"
                className="ibtn ghost-i"
                onClick={() => setSearch('')}
                aria-label="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
          {hideableCols.length > 0 && (
            <div className="menu" ref={colsMenuRef}>
              <button
                type="button"
                className="btn-s"
                aria-expanded={colsOpen}
                onClick={() => setColsOpen((o) => !o)}
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hide-s">Columns</span>
              </button>
              {colsOpen && (
                <div className="menu-pop at-bottom al-end">
                  <div className="menu-label">Columns</div>
                  {hideableCols.map((c) => (
                    <label key={c.id} className="menu-check">
                      <input
                        type="checkbox"
                        checked={!hiddenCols.includes(c.id)}
                        onChange={() => toggleCol(c.id)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                  {hiddenCols.length > 0 && (
                    <>
                      <hr />
                      <button
                        type="button"
                        className="menu-item"
                        onClick={() => setHiddenCols([])}
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="tbl-wrap dt-wrap">
        <table className="tbl dt-tbl">
          <thead>
            <tr>
              {visibleCols.map((c) => {
                const canSort = c.sortable !== false && (c.accessor || c.sortValue) && c.label;
                const dir = sort?.col === c.id ? sort.dir : null;
                const cls = [c.num ? 'num' : '', c.thClass || c.className || '']
                  .filter(Boolean)
                  .join(' ');
                return (
                  <th
                    key={c.id}
                    className={cls || undefined}
                    aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className="th-sort"
                        onClick={() => toggleSort(c.id)}
                      >
                        <span>{c.label}</span>
                        {dir === 'asc' ? (
                          <ArrowUp />
                        ) : dir === 'desc' ? (
                          <ArrowDown />
                        ) : (
                          <ArrowUpDown className="dim" />
                        )}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                );
              })}
            </tr>
            {hasFilters && (
              <tr className="dt-filters">
                {visibleCols.map((c) => {
                  const cls = [c.num ? 'num' : '', c.thClass || c.className || '']
                    .filter(Boolean)
                    .join(' ');
                  if (!c.filter) return <th key={c.id} className={cls || undefined} />;
                  if (c.filter === 'select') {
                    const opts = selectOptionsMap[c.id] || [];
                    return (
                      <th key={c.id} className={cls || undefined}>
                        <select
                          className="dt-f"
                          value={colFilters[c.id] || ''}
                          onChange={(e) =>
                            setColFilters((f) => ({ ...f, [c.id]: e.target.value }))
                          }
                        >
                          <option value="">All</option>
                          {opts.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  return (
                    <th key={c.id} className={cls || undefined}>
                      <input
                        className="dt-f"
                        value={colFilters[c.id] || ''}
                        onChange={(e) =>
                          setColFilters((f) => ({ ...f, [c.id]: e.target.value }))
                        }
                        placeholder={c.filterPlaceholder || 'Filter…'}
                      />
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {pageRows.map((r) => {
              const rc = [
                onRowClick || rowMenu ? 'click' : '',
                rowClass ? rowClass(r) : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <tr
                  key={rowKey(r)}
                  className={rc || undefined}
                  onClick={
                    onRowClick
                      ? (e) => {
                          if ((e.target as HTMLElement).closest('button,select,input,a,label'))
                            return;
                          onRowClick(r);
                        }
                      : undefined
                  }
                  onContextMenu={
                    rowMenu
                      ? (e) => {
                          const items = rowMenu(r);
                          if (items && items.length > 0) {
                            e.preventDefault();
                            setCtxMenu({ x: e.clientX, y: e.clientY, items });
                          }
                        }
                      : undefined
                  }
                >
                  {visibleCols.map((c) => {
                    const cls = [c.num ? 'num' : '', c.className || '']
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <td key={c.id} className={cls || undefined}>
                        {c.cell ? c.cell(r) : c.accessor ? c.accessor(r) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length || 1} className="muted dt-empty">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RenderContextMenu menu={ctxMenu} onClose={() => setCtxMenu(null)} />

      <div className="dt-foot">
        <span className="muted mono">
          {sorted.length === rows.length
            ? `${sorted.length} ${sorted.length === 1 ? 'row' : 'rows'}`
            : `${sorted.length} of ${rows.length} rows`}
          {rowMenu && (
            <span className="hide-m"> · Right-click a row for quick actions</span>
          )}
        </span>
        <div className="dt-pager">
          <label className="muted hide-m">
            <span>Rows per page</span>
            <select
              className="dt-f"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="muted mono">
            Page {curPage} of {totalPages}
          </span>
          <button
            type="button"
            className="ibtn"
            disabled={curPage <= 1}
            onClick={() => setPage(1)}
            aria-label="First"
          >
            <ChevronsLeft />
          </button>
          <button
            type="button"
            className="ibtn"
            disabled={curPage <= 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Prev"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="ibtn"
            disabled={curPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next"
          >
            <ChevronRight />
          </button>
          <button
            type="button"
            className="ibtn"
            disabled={curPage >= totalPages}
            onClick={() => setPage(totalPages)}
            aria-label="Last"
          >
            <ChevronsRight />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SMOOTH BEZIER AREA CHART (`function ev`)
// ============================================================================
function bezierPath(pts: Array<[number, number]>): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function AreaChart({
  points,
  max: customMax,
  format,
  color = 'var(--chart)',
  onSelect,
}: {
  points: Array<{ x: string; sub?: string; y: number; now?: boolean; tip: string }>;
  max?: number;
  format: (v: number) => string;
  color?: string;
  onSelect?: (idx: number) => void;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const maxVal = customMax ?? Math.max(1, ...points.map((p) => p.y));
  const pl = 42;
  const pr = 14;
  const pt = 14;
  const pb = 34;
  const w = 640 - pl - pr;
  const h = 210 - pt - pb;

  const coords: Array<[number, number]> = points.map((p, i) => [
    pl + (i / Math.max(1, points.length - 1)) * w,
    pt + h - (Math.min(maxVal, Math.max(0, p.y)) / maxVal) * h,
  ]);

  const line = bezierPath(coords);
  const area = `${line} L ${coords[coords.length - 1][0]} ${pt + h} L ${coords[0][0]} ${pt + h} Z`;
  const activePt = hoverIdx !== null ? points[hoverIdx] : null;
  const activeCoord = hoverIdx !== null ? coords[hoverIdx] : null;

  return (
    <div className="area" onMouseLeave={() => setHoverIdx(null)}>
      <svg viewBox="0 0 640 210" preserveAspectRatio="none">
        <defs>
          <linearGradient id="steyerAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((r, idx) => {
          const y = pt + h - r * h;
          return (
            <g key={idx}>
              <line x1={pl} x2={640 - pr} y1={y} y2={y} className="grid" />
              <text x={pl - 8} y={y + 4} textAnchor="end" className="ax">
                {format(Math.round(maxVal * r))}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#steyerAreaGrad)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" />
        {activeCoord && (
          <line
            x1={activeCoord[0]}
            x2={activeCoord[0]}
            y1={pt}
            y2={pt + h}
            className="cursor"
          />
        )}
        {coords.map(([cx, cy], idx) => {
          const p = points[idx];
          const showLabel = idx % 2 === 0 || p.now;
          return (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r={hoverIdx === idx || p.now ? 4 : 2.5}
                className={`dot ${p.now ? 'now' : ''}`}
              />
              {showLabel && (
                <>
                  <text
                    x={cx}
                    y={210 - pb + 15}
                    textAnchor="middle"
                    className={`ax ${p.now ? 'now' : ''}`}
                  >
                    {p.x}
                  </text>
                  {p.sub && (
                    <text
                      x={cx}
                      y={210 - pb + 27}
                      textAnchor="middle"
                      className="ax sub"
                    >
                      {p.sub}
                    </text>
                  )}
                </>
              )}
              <rect
                x={cx - w / points.length / 2}
                y={0}
                width={w / points.length}
                height={210}
                fill="transparent"
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
                onMouseEnter={() => setHoverIdx(idx)}
                onClick={() => onSelect?.(idx)}
              />
            </g>
          );
        })}
      </svg>
      {activePt && activeCoord && (
        <div
          className="tip"
          style={{
            left: `${(activeCoord[0] / 640) * 100}%`,
            top: `${Math.max(6, (activeCoord[1] / 210) * 100 - 18)}%`,
          }}
        >
          {activePt.tip}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN STEYER STUDIO ADMIN APPLICATION
// ============================================================================
export type AdminViewId =
  | 'dashboard'
  | 'occupancy'
  | 'stays'
  | 'equipment'
  | 'spa'
  | 'inbox'
  | 'vouchers'
  | 'posts'
  | 'products'
  | 'deposits'
  | 'portfolios';

export default function SteyerAdminApp({
  initialView = 'equipment',
}: {
  initialView?: AdminViewId;
}) {
  const { logout } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState<AdminViewId>(initialView);
  const [role, setRole] = useState<'admin' | 'hotel' | 'spa'>('admin');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'en' | 'id' | 'de'>('en');
  const [collapsed, setCollapsed] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [propMenuOpen, setPropMenuOpen] = useState(false);
  const [accMenuOpen, setAccMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Slide-over Sheets state
  const [staySheetId, setStaySheetId] = useState<number | null>(null);
  const [spaSheetId, setSpaSheetId] = useState<number | null>(null);
  const [voucherSheetId, setVoucherSheetId] = useState<number | null>(null);
  const [depositSheetId, setDepositSheetId] = useState<string | null>(null);
  const [memberSheetId, setMemberSheetId] = useState<string | null>(null);
  const [productTab, setProductTab] = useState<'rooms' | 'extras' | 'treatments'>('rooms');
  const [spaTargetDate, setSpaTargetDate] = useState<string | null>(null);

  const propMenuRef = useRef<HTMLDivElement>(null);
  const accMenuRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadState = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/state?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('[SteyerAdminApp loadState]', err);
    }
  }, []);

  useEffect(() => {
    // Check URL ?view= query param on mount
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const qv = sp.get('view') as AdminViewId | null;
      if (
        qv &&
        [
          'dashboard',
          'occupancy',
          'stays',
          'equipment',
          'spa',
          'inbox',
          'vouchers',
          'posts',
          'products',
          'deposits',
          'portfolios',
        ].includes(qv)
      ) {
        setView(qv);
      }
      const savedTheme = localStorage.getItem('steyer-admin-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
      if (localStorage.getItem('steyer-admin-collapsed') === '1') setCollapsed(true);
    }
    loadState();
    const timer = setInterval(loadState, 6000);
    return () => clearInterval(timer);
  }, [loadState]);

  const navigateView = useCallback((v: AdminViewId) => {
    setView(v);
    setSideOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = '/admin';
      url.searchParams.set('view', v);
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('steyer-admin-theme', next);
    } catch {}
  };

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem('steyer-admin-collapsed', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (propMenuRef.current && !propMenuRef.current.contains(e.target as Node)) {
        setPropMenuOpen(false);
      }
      if (accMenuRef.current && !accMenuRef.current.contains(e.target as Node)) {
        setAccMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  const mutateApi = async (payload: Record<string, any>, toastMsg?: string) => {
    const res = await fetch('/api/admin/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || 'Action failed');
    }
    if (toastMsg) showToast(toastMsg);
    await loadState();
    return json;
  };

  if (!data) {
    return (
      <div className="steyer-scope">
        <div className="app app-loading" data-theme={theme}>
          Loading …
        </div>
      </div>
    );
  }

  const money = role === 'admin';
  const newEnqCount = (data.enquiries || []).filter((e: any) => e.status === 'new').length;
  const arrivalsTodayCount = (data.roomBookings || []).filter(
    (b: any) => b.check_in === data.today && b.status === 'confirmed'
  ).length;
  const pendingSpaCount = (data.spaBookings || []).filter(
    (b: any) => b.status === 'pending' && b.date >= data.today
  ).length;
  const pendingDepositsCount = (data.deposits || []).filter(
    (d: any) => d.status === 'PENDING'
  ).length;
  const membersCount = (data.members || []).length;

  const navGroups: Array<{
    key: string;
    label: string;
    roles?: Array<'admin' | 'hotel' | 'spa'>;
    items: Array<{
      id: AdminViewId;
      label: string;
      icon: React.ReactNode;
      badge?: number;
      roles?: Array<'admin' | 'hotel' | 'spa'>;
    }>;
  }> = [
    {
      key: 'overview',
      label: lang === 'id' ? 'Ringkasan' : lang === 'de' ? 'Übersicht' : 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutGrid />,
        },
      ],
    },
    {
      key: 'hotel',
      label: 'Hotel',
      roles: ['admin', 'hotel'],
      items: [
        {
          id: 'occupancy',
          label: lang === 'id' ? 'Okupansi' : lang === 'de' ? 'Belegung' : 'Occupancy',
          icon: <CalendarRange />,
        },
        {
          id: 'stays',
          label: lang === 'id' ? 'Menginap' : lang === 'de' ? 'Aufenthalte' : 'Stays',
          icon: <BedDouble />,
          badge: arrivalsTodayCount,
        },
        {
          id: 'equipment',
          label:
            lang === 'id'
              ? 'Peralatan & ekstra'
              : lang === 'de'
              ? 'Verleih & Extras'
              : 'Equipment & extras',
          icon: <Bike />,
        },
      ],
    },
    {
      key: 'spa',
      label: 'Spa',
      roles: ['admin', 'spa'],
      items: [
        {
          id: 'spa',
          label: lang === 'id' ? 'Janji temu' : lang === 'de' ? 'Termine' : 'Appointments',
          icon: <Sparkles />,
          badge: pendingSpaCount,
        },
      ],
    },
    {
      key: 'sales',
      label: lang === 'id' ? 'Penjualan' : lang === 'de' ? 'Verkauf' : 'Sales',
      items: [
        {
          id: 'inbox',
          label: lang === 'id' ? 'Pertanyaan' : lang === 'de' ? 'Anfragen' : 'Enquiries',
          icon: <Inbox />,
          badge: newEnqCount,
          roles: ['admin', 'hotel'],
        },
        {
          id: 'vouchers',
          label: lang === 'id' ? 'Voucher' : lang === 'de' ? 'Gutscheine' : 'Vouchers',
          icon: <Gift />,
        },
      ],
    },
    {
      key: 'tradesim',
      label: 'TradeSim Desk',
      roles: ['admin'],
      items: [
        {
          id: 'deposits',
          label: lang === 'id' ? 'Antrean Deposit' : 'Deposit approvals',
          icon: <CreditCard />,
          badge: pendingDepositsCount,
        },
        {
          id: 'portfolios',
          label: lang === 'id' ? 'Portofolio Member' : 'Member portfolios',
          icon: <Users />,
          badge: membersCount,
        },
      ],
    },
    {
      key: 'content',
      label: 'Website',
      roles: ['admin'],
      items: [
        {
          id: 'posts',
          label: lang === 'id' ? 'Blog & acara' : lang === 'de' ? 'Blog & Events' : 'Blog & events',
          icon: <Newspaper />,
        },
      ],
    },
    {
      key: 'setup',
      label: lang === 'id' ? 'Katalog' : lang === 'de' ? 'Katalog' : 'Catalogue',
      roles: ['admin'],
      items: [
        {
          id: 'products',
          label:
            lang === 'id'
              ? 'Kamar, ekstra & spa'
              : lang === 'de'
              ? 'Zimmer, Extras & Spa'
              : 'Rooms, extras & spa',
          icon: <SlidersHorizontal />,
        },
      ],
    },
  ];

  const visibleGroups = navGroups
    .filter((g) => !g.roles || g.roles.includes(role))
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.roles || i.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);

  let activeGroupLabel = '';
  let activeItemLabel = '';
  for (const g of visibleGroups) {
    const found = g.items.find((i) => i.id === view);
    if (found) {
      activeGroupLabel = g.label;
      activeItemLabel = found.label;
    }
  }

  const roleDefs = [
    {
      id: 'admin' as const,
      name: 'Admin',
      sub: 'Full access & revenue',
      ini: 'A',
    },
    {
      id: 'hotel' as const,
      name: 'Front desk',
      sub: 'Hotel & enquiries, no revenue',
      ini: 'F',
    },
    {
      id: 'spa' as const,
      name: 'Spa',
      sub: 'Appointments & vouchers',
      ini: 'S',
    },
  ];
  const currentRoleDef = roleDefs.find((r) => r.id === role) || roleDefs[0];

  const todayFormatted = new Date(data.today + 'T12:00:00Z').toLocaleDateString(
    lang === 'de' ? 'de-DE' : lang === 'id' ? 'id-ID' : 'en-GB',
    { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }
  );

  return (
    <div className="steyer-scope">
      {/* Top Compact Demo / Status Bar */}
      <div className="demo-bar compact">
        <div className="wrap">
          <p>
            Live Admin Workstation · Real-time Supabase &amp; Inventory Database · Synchronized with TradeSim Pro.
          </p>
          <nav>
            <button
              type="button"
              className="bar-link"
              onClick={() => mutateApi({ action: 'reset' }, 'Demo state reset to initial seed.')}
            >
              Reset demo data
            </button>
            <Link href="/">
              To Trading Terminal <ExternalLink className="ic" />
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Steyer Studio .app Container */}
      <div
        className={`app ${collapsed ? 'collapsed' : ''}`}
        data-theme={theme}
        data-role={role}
      >
        {/* Collapsible Sidebar */}
        <aside className={`side ${sideOpen ? 'open' : ''}`}>
          {/* Top Property Switcher */}
          <div className="menu" ref={propMenuRef}>
            <button
              type="button"
              className="side-btn"
              aria-expanded={propMenuOpen}
              onClick={() => setPropMenuOpen((o) => !o)}
              title="Demo Office"
            >
              <span className="logo">D</span>
              <span className="side-txt">
                <b>Demo Office</b>
                <small>Hotel · Spa · TradeSim</small>
              </span>
              <ChevronDown className="side-txt dim" />
            </button>
            {propMenuOpen && (
              <div className="menu-pop at-bottom al-start">
                <div className="menu-label">Property</div>
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => {
                    setPropMenuOpen(false);
                    navigateView('equipment');
                  }}
                >
                  <span className="logo sm">D</span>
                  <span>Demo Hotel &amp; Spa</span>
                  <Check className="end" />
                </button>
                <button
                  type="button"
                  className="menu-item"
                  onClick={() => {
                    setPropMenuOpen(false);
                    navigateView('deposits');
                  }}
                >
                  <span className="logo sm alt">T</span>
                  <span>TradeSim Pro Desk</span>
                  <small className="muted end">Supabase Live</small>
                </button>
                <hr />
                <Link href="/" className="menu-item">
                  <span>To Trading App</span>
                  <ExternalLink className="end dim" />
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Groups */}
          <nav>
            {visibleGroups.map((g) => (
              <div key={g.key} className="side-group">
                <span className="side-txt">{g.label}</span>
                {g.items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    data-nav={it.id}
                    aria-current={view === it.id ? 'page' : undefined}
                    onClick={() => navigateView(it.id)}
                    data-tip={it.label}
                  >
                    {it.icon}
                    <span className="side-txt">{it.label}</span>
                    {it.badge ? <i>{it.badge}</i> : null}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Bottom Role & Account Switcher */}
          <div className="side-foot" ref={accMenuRef}>
            <div className="menu" data-tour="account">
              <button
                type="button"
                className="side-btn big"
                aria-expanded={accMenuOpen}
                onClick={() => setAccMenuOpen((o) => !o)}
                title={`${currentRoleDef.name} · ${currentRoleDef.sub}`}
              >
                <span className={`avatar r-${role}`}>{currentRoleDef.ini}</span>
                <span className="side-txt">
                  <b>{currentRoleDef.name}</b>
                  <small>{currentRoleDef.sub}</small>
                </span>
                <ChevronDown className="side-txt dim" />
              </button>
              {accMenuOpen && (
                <div className={`menu-pop ${collapsed ? 'at-right' : 'at-top al-start'}`}>
                  <div className="menu-label">Role in demo (try switching)</div>
                  {roleDefs.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="menu-item"
                      role="menuitemradio"
                      aria-checked={role === r.id}
                      onClick={() => {
                        setRole(r.id);
                        setAccMenuOpen(false);
                      }}
                    >
                      <span className={`avatar sm r-${r.id}`}>{r.ini}</span>
                      <span className="menu-acc">
                        <b>{r.name}</b>
                        <small>{r.sub}</small>
                      </span>
                      {role === r.id && <Check className="end" />}
                    </button>
                  ))}
                  <hr />
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => {
                      setAccMenuOpen(false);
                      setTourStep(0);
                      setTourOpen(true);
                    }}
                  >
                    <Compass />
                    <span>Start quick tour</span>
                  </button>
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => {
                      toggleTheme();
                      setAccMenuOpen(false);
                    }}
                  >
                    {theme === 'dark' ? <Sun /> : <Moon />}
                    <span>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
                  </button>
                  <div className="menu-item static">
                    <span>Language</span>
                    <div className="menu-langs">
                      {(['en', 'id', 'de'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          aria-current={lang === l ? 'true' : undefined}
                          onClick={() => setLang(l)}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <hr />
                  <button
                    type="button"
                    className="menu-item danger"
                    onClick={() => {
                      setAccMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut />
                    <span>Sign out Admin</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {sideOpen && <div className="scrim side-scrim" onClick={() => setSideOpen(false)} />}

        {/* Main Content Area */}
        <div className="main">
          {/* Sticky Top Bar */}
          <header className="top">
            <button
              type="button"
              className="ibtn ghost-i hide-phone"
              onClick={toggleCollapsed}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <PanelLeft />
            </button>
            <button
              type="button"
              className="ibtn ghost-i show-phone"
              onClick={() => setSideOpen(true)}
              aria-label="Menu"
            >
              <PanelLeft />
            </button>
            <span className="top-sep" />
            <nav className="crumbs" aria-label="Breadcrumb">
              {activeGroupLabel && (
                <>
                  <span className="muted hide-s">{activeGroupLabel}</span>
                  <ChevronRight className="muted hide-s" />
                </>
              )}
              <h1>{activeItemLabel}</h1>
            </nav>
            <div className="top-r">
              <span className="muted mono hide-s">{todayFormatted}</span>
              <span className="live-dot" title="Polling every 6 seconds">
                Live
              </span>
              <div className="seg" role="group" aria-label="Language">
                {(['de', 'en', 'id'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={lang === l}
                    onClick={() => setLang(l)}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="ibtn"
                onClick={() => {
                  setTourStep(0);
                  setTourOpen(true);
                }}
                aria-label="Start quick tour"
                title="Start quick tour"
              >
                <Compass />
              </button>
              <button
                type="button"
                className="ibtn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
              >
                {theme === 'dark' ? <Sun /> : <Moon />}
              </button>
            </div>
          </header>

          {/* Active View Container */}
          <div className="content">
            {view === 'equipment' && (
              <EquipmentView
                data={data}
                money={money}
                lang={lang}
                mutateApi={mutateApi}
                onOpenBooking={(id) => setStaySheetId(id)}
                onOpenSpa={(date) => {
                  setSpaTargetDate(date);
                  navigateView('spa');
                }}
                onOpenProducts={() => {
                  setProductTab('extras');
                  navigateView('products');
                }}
              />
            )}

            {view === 'dashboard' && (
              <DashboardView
                data={data}
                money={money}
                lang={lang}
                freshKey={freshKey}
                mutateApi={mutateApi}
                onNavigate={navigateView}
                onOpenBooking={(id) => setStaySheetId(id)}
                onOpenSpa={(id) => setSpaSheetId(id)}
                onOpenVoucher={(id) => setVoucherSheetId(id)}
              />
            )}

            {view === 'occupancy' && (
              <OccupancyView
                data={data}
                lang={lang}
                freshKey={freshKey}
                mutateApi={mutateApi}
                onOpenBooking={(id) => setStaySheetId(id)}
              />
            )}

            {view === 'stays' && (
              <StaysView
                data={data}
                money={money}
                freshKey={freshKey}
                mutateApi={mutateApi}
                onOpenBooking={(id) => setStaySheetId(id)}
              />
            )}

            {view === 'spa' && (
              <SpaView
                data={data}
                money={money}
                lang={lang}
                initialDate={spaTargetDate}
                mutateApi={mutateApi}
                onOpenSpa={(id) => setSpaSheetId(id)}
              />
            )}

            {view === 'inbox' && (
              <InboxView data={data} mutateApi={mutateApi} showToast={showToast} />
            )}

            {view === 'vouchers' && (
              <VouchersView
                data={data}
                money={money}
                mutateApi={mutateApi}
                onOpenVoucher={(id) => setVoucherSheetId(id)}
              />
            )}

            {view === 'posts' && (
              <PostsView data={data} mutateApi={mutateApi} showToast={showToast} />
            )}

            {view === 'products' && (
              <ProductsView
                data={data}
                tab={productTab}
                setTab={setProductTab}
                mutateApi={mutateApi}
              />
            )}

            {view === 'deposits' && (
              <DepositsView
                data={data}
                onRefresh={loadState}
                showToast={showToast}
                onOpenDeposit={(id) => setDepositSheetId(id)}
              />
            )}

            {view === 'portfolios' && (
              <PortfoliosView
                data={data}
                onRefresh={loadState}
                showToast={showToast}
                onOpenMember={(id) => setMemberSheetId(id)}
              />
            )}
          </div>
        </div>

        {/* Slide-Over Detail Sheets */}
        {staySheetId !== null && (
          <StaySheet
            data={data}
            bookingId={staySheetId}
            money={money}
            mutateApi={mutateApi}
            onClose={() => setStaySheetId(null)}
          />
        )}

        {spaSheetId !== null && (
          <SpaSheet
            data={data}
            spaId={spaSheetId}
            money={money}
            mutateApi={mutateApi}
            onClose={() => setSpaSheetId(null)}
          />
        )}

        {voucherSheetId !== null && (
          <VoucherSheet
            data={data}
            voucherId={voucherSheetId}
            mutateApi={mutateApi}
            onClose={() => setVoucherSheetId(null)}
          />
        )}

        {depositSheetId !== null && (
          <DepositSheet
            data={data}
            depositId={depositSheetId}
            onRefresh={loadState}
            showToast={showToast}
            onClose={() => setDepositSheetId(null)}
          />
        )}

        {memberSheetId !== null && (
          <MemberPortfolioSheet
            data={data}
            userId={memberSheetId}
            onRefresh={loadState}
            showToast={showToast}
            onClose={() => setMemberSheetId(null)}
          />
        )}

        {/* Toast Notification */}
        {toast && <div className="toast">{toast}</div>}

        {/* Interactive Quick Tour */}
        {tourOpen && (
          <QuickTour
            step={tourStep}
            setStep={setTourStep}
            onNavigate={navigateView}
            onClose={() => setTourOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VIEW 1: EQUIPMENT & EXTRAS (`?view=equipment` - 100% Steyer Studio `eP` & `eF`)
// ============================================================================
function EquipmentView({
  data,
  money,
  lang,
  mutateApi,
  onOpenBooking,
  onOpenSpa,
  onOpenProducts,
}: {
  data: any;
  money: boolean;
  lang: 'en' | 'id' | 'de';
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onOpenBooking: (id: number) => void;
  onOpenSpa: (date: string) => void;
  onOpenProducts: () => void;
}) {
  const [filter, setFilter] = useState<'active' | 'all' | 'cancelled'>('active');
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  const days10 = useMemo(() => dayRange(data.today, 10), [data.today]);
  const stockedExtras = useMemo(
    () => (data.extras || []).filter((e: any) => e.stock !== null && e.stock !== undefined),
    [data.extras]
  );

  // New rental form state (`function eF`)
  const [extraId, setExtraId] = useState<number>(stockedExtras[0]?.id || 3);
  const [dateFrom, setDateFrom] = useState<string>(data.today);
  const [days, setDays] = useState<number>(1);
  const [qty, setQty] = useState<number>(1);
  const [roomBookingId, setRoomBookingId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState<string>('');

  const selectedExtra = stockedExtras.find((e: any) => e.id === Number(extraId)) || stockedExtras[0];
  const isOnceUnit = selectedExtra && ['stay', 'person_stay', 'appointment'].includes(selectedExtra.unit);

  const activeBookingsOnDate = useMemo(
    () =>
      (data.roomBookings || []).filter(
        (b: any) =>
          b.status !== 'cancelled' &&
          b.status !== 'checked_out' &&
          b.check_in <= dateFrom &&
          b.check_out > dateFrom
      ),
    [data.roomBookings, dateFrom]
  );

  const selectedBooking = activeBookingsOnDate.find((b: any) => b.id === Number(roomBookingId));
  const calculatedTotal = selectedExtra
    ? selectedExtra.price * qty * (isOnceUnit ? 1 : days)
    : 0;

  const handleAddRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExtra) return;
    if (!selectedBooking && !guestName.trim()) return;
    setBusy(true);
    setErrMsg('');
    try {
      await mutateApi(
        {
          action: 'rental_create',
          extra_id: selectedExtra.id,
          date_from: dateFrom,
          days: isOnceUnit ? 1 : days,
          qty,
          room_booking_id: selectedBooking ? selectedBooking.id : null,
          name: selectedBooking ? selectedBooking.name : guestName.trim(),
        },
        'Rental saved.'
      );
      setGuestName('');
      setQty(1);
    } catch (err: any) {
      setErrMsg(err?.message || 'Not enough stock on the selected dates.');
    } finally {
      setBusy(false);
    }
  };

  const unitLabel = (u: string) => {
    const map: Record<string, string> = {
      person_night: 'per person / night',
      night: 'per night',
      day: 'per day',
      person_stay: 'per person, once',
      stay: 'once per stay',
      appointment: 'per appointment',
    };
    return map[u] || u;
  };

  const filteredRentals = useMemo(() => {
    const list = (data.equipment || []).filter((r: any) => {
      if (filter === 'cancelled') return r.status === 'cancelled';
      if (filter === 'active') return r.status !== 'cancelled' && r.date_to > data.today;
      return true;
    });
    return [...list].sort((a, b) => a.date_from.localeCompare(b.date_from));
  }, [data.equipment, data.today, filter]);

  const sourceLabel = (r: any) => {
    if (r.spa_booking_id) return 'Spa booking';
    if (r.source === 'online') return 'Online booking';
    return 'Front desk';
  };

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: 'item',
        label: 'Item',
        accessor: (r) => {
          const ex = data.extras.find((e: any) => e.id === r.extra_id);
          return ex ? ex.name_en : '';
        },
        filter: 'text',
        cell: (r) => {
          const ex = data.extras.find((e: any) => e.id === r.extra_id);
          return <b>{ex ? (lang === 'de' ? ex.name_de : ex.name_en) : '—'}</b>;
        },
      },
      {
        id: 'dates',
        label: 'Dates',
        accessor: (r) => r.date_from,
        filter: 'text',
        cell: (r) => {
          const d = Math.max(1, diffDays(r.date_from, r.date_to));
          return (
            <span className="mono">
              {d === 1 ? fmtShort(r.date_from) : `${fmtShort(r.date_from)} – ${fmtShort(r.date_to)}`}{' '}
              <small className="muted">({d}d)</small>
            </span>
          );
        },
      },
      {
        id: 'qty',
        label: 'Qty',
        num: true,
        accessor: (r) => r.qty,
        cell: (r) => <span className="mono">{r.qty}×</span>,
      },
      {
        id: 'guest',
        label: 'Guest',
        accessor: (r) => r.name,
        filter: 'text',
      },
      {
        id: 'room',
        label: 'Room',
        accessor: (r) => {
          if (r.room_booking_id) {
            const rb = data.roomBookings.find((b: any) => b.id === r.room_booking_id);
            const u = rb ? data.units.find((x: any) => x.id === rb.unit_id) : null;
            return rb ? `${u?.label || ''} ${rb.name}` : '';
          }
          if (r.spa_booking_id) {
            const sb = data.spaBookings.find((b: any) => b.id === r.spa_booking_id);
            return sb ? `Spa ${minToTime(sb.start_min)}` : 'Spa';
          }
          return '—';
        },
        filter: 'text',
        cell: (r) => {
          const rb = r.room_booking_id
            ? data.roomBookings.find((b: any) => b.id === r.room_booking_id)
            : null;
          const u = rb ? data.units.find((x: any) => x.id === rb.unit_id) : null;
          const sb = r.spa_booking_id
            ? data.spaBookings.find((b: any) => b.id === r.spa_booking_id)
            : null;
          if (rb) {
            return (
              <button
                type="button"
                className="lnk"
                onClick={() => onOpenBooking(rb.id)}
              >
                {u?.label} · {rb.name}
              </button>
            );
          }
          if (sb) {
            return (
              <button
                type="button"
                className="lnk"
                onClick={() => onOpenSpa(sb.date)}
              >
                Spa {minToTime(sb.start_min)}
              </button>
            );
          }
          return <span className="muted">—</span>;
        },
      },
      {
        id: 'source',
        label: 'Source',
        accessor: sourceLabel,
        filter: 'select',
        cell: (r) => (
          <span
            className={`bdg ${
              r.spa_booking_id ? 'violet' : r.source === 'online' ? 'blue' : 'green'
            }`}
          >
            {sourceLabel(r)}
          </span>
        ),
      },
      ...(money
        ? [
            {
              id: 'total',
              label: 'Total',
              num: true,
              accessor: (r: any) => r.total,
              cell: (r: any) => <span className="mono">{fmtEur(r.total)}</span>,
            },
          ]
        : []),
      {
        id: 'act',
        label: '',
        hideable: false,
        sortable: false,
        cell: (r) =>
          r.status !== 'cancelled' ? (
            <button
              type="button"
              className="btn-s ghost"
              onClick={() => mutateApi({ action: 'rental_status', id: r.id, status: 'cancelled' })}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="btn-s ghost"
              onClick={() => mutateApi({ action: 'rental_status', id: r.id, status: 'confirmed' })}
            >
              Restore
            </button>
          ),
      },
    ],
    [data, money, lang, mutateApi, onOpenBooking, onOpenSpa]
  );

  return (
    <div className="stack">
      {/* Card 1: Stock and availability 10-day Matrix */}
      <section className="card">
        <header className="card-h">
          <h2>Stock and availability</h2>
        </header>
        <div className="tbl-wrap">
          <table className="tbl matrix">
            <thead>
              <tr>
                <th>Item</th>
                {money && <th className="num">Price</th>}
                <th>Unit</th>
                <th className="num">Stock</th>
                {days10.map((d) => (
                  <th
                    key={d}
                    className={`num mono ${d === data.today ? 'today' : ''}`}
                  >
                    {fmtWd(d, lang)}
                    <br />
                    <small>{fmtShort(d)}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockedExtras.map((ex: any) => (
                <tr
                  key={ex.id}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setCtxMenu({
                      x: e.clientX,
                      y: e.clientY,
                      items: [
                        {
                          label: 'Edit item',
                          onClick: onOpenProducts,
                        },
                      ],
                    });
                  }}
                >
                  <td>
                    <b>{lang === 'de' ? ex.name_de : ex.name_en}</b>
                  </td>
                  {money && <td className="num mono">{fmtEur(ex.price)}</td>}
                  <td className="muted">{unitLabel(ex.unit)}</td>
                  <td className="num mono">{ex.stock}</td>
                  {days10.map((d) => {
                    const used = (data.equipment || [])
                      .filter(
                        (r: any) =>
                          r.extra_id === ex.id &&
                          r.status !== 'cancelled' &&
                          r.date_from <= d &&
                          r.date_to > d
                      )
                      .reduce((sum: number, r: any) => sum + (Number(r.qty) || 0), 0);
                    const free = Math.max(0, ex.stock - used);
                    return (
                      <td
                        key={d}
                        className={`num mono cell ${
                          free === 0 ? 'zero' : free <= 1 ? 'low' : ''
                        } ${d === data.today ? 'today' : ''}`}
                      >
                        {free}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">
          Free units per day. Online bookings and front-desk rentals draw on the same stock.
        </p>
      </section>

      <RenderContextMenu menu={ctxMenu} onClose={() => setCtxMenu(null)} />

      {/* Card 2: New rental inline form */}
      <section className="card">
        <header className="card-h">
          <h2>New rental</h2>
        </header>
        <form className="form-row" onSubmit={handleAddRental}>
          <label className="fld">
            <span>Item</span>
            <select
              value={extraId}
              onChange={(e) => setExtraId(Number(e.target.value))}
            >
              {stockedExtras.map((ex: any) => (
                <option key={ex.id} value={ex.id}>
                  {lang === 'de' ? ex.name_de : ex.name_en}
                  {money ? ` · ${fmtEur(ex.price)}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="fld">
            <span>From</span>
            <select
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            >
              {dayRange(data.today, 14).map((d) => (
                <option key={d} value={d}>
                  {fmtWd(d, lang)} {fmtShort(d)}
                </option>
              ))}
            </select>
          </label>
          {!isOnceUnit && (
            <label className="fld">
              <span>Days</span>
              <input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                style={{ width: 64 }}
              />
            </label>
          )}
          <label className="fld">
            <span>Qty</span>
            <input
              type="number"
              min={1}
              max={selectedExtra?.stock || 10}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ width: 64 }}
            />
          </label>
          <label className="fld">
            <span>Charge to room</span>
            <select
              value={roomBookingId}
              onChange={(e) => setRoomBookingId(e.target.value)}
            >
              <option value="">Day guest, no room</option>
              {activeBookingsOnDate.map((b: any) => {
                const u = data.units.find((x: any) => x.id === b.unit_id);
                return (
                  <option key={b.id} value={b.id}>
                    {u?.label} · {b.name}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="fld grow">
            <span>Guest</span>
            <input
              value={selectedBooking ? selectedBooking.name : guestName}
              onChange={(e) => setGuestName(e.target.value)}
              disabled={Boolean(selectedBooking)}
              placeholder="Guest name"
              required={!selectedBooking}
            />
          </label>
          {money && (
            <div className="fld">
              <span>&nbsp;</span>
              <b className="mono">{fmtEur(calculatedTotal)}</b>
            </div>
          )}
          <button type="submit" className="btn-s primary" disabled={busy}>
            Add
          </button>
        </form>
        {errMsg && <p className="hint err-t">{errMsg}</p>}
      </section>

      {/* Card 3: Rentals and extras DataTable */}
      <section className="card">
        <header className="card-h">
          <h2>Rentals and extras</h2>
        </header>
        <DataTable
          id="equipment"
          rows={filteredRentals}
          columns={columns}
          rowClass={(r) => (r.status === 'cancelled' ? 'off' : '')}
          rowMenu={(r) => {
            const rb = r.room_booking_id
              ? data.roomBookings.find((b: any) => b.id === r.room_booking_id)
              : null;
            const sb = r.spa_booking_id
              ? data.spaBookings.find((b: any) => b.id === r.spa_booking_id)
              : null;
            return [
              ...(rb
                ? [
                    {
                      label: 'Open room booking',
                      onClick: () => onOpenBooking(rb.id),
                    },
                  ]
                : []),
              ...(sb
                ? [
                    {
                      label: 'Open in spa plan',
                      onClick: () => onOpenSpa(sb.date),
                    },
                  ]
                : []),
              {
                label: 'Edit item',
                onClick: onOpenProducts,
              },
              { sep: true },
              r.status !== 'cancelled'
                ? {
                    label: 'Cancel',
                    danger: true,
                    onClick: () =>
                      mutateApi({ action: 'rental_status', id: r.id, status: 'cancelled' }),
                  }
                : {
                    label: 'Restore',
                    onClick: () =>
                      mutateApi({ action: 'rental_status', id: r.id, status: 'confirmed' }),
                  },
            ];
          }}
          left={
            <div className="seg">
              {(
                [
                  ['active', 'Active'],
                  ['all', 'All'],
                  ['cancelled', 'Cancelled'],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          }
        />
      </section>
    </div>
  );
}

// ============================================================================
// VIEW 2: DASHBOARD (`?view=dashboard` - 100% Steyer Studio `eT`)
// ============================================================================
function DashboardView({
  data,
  money,
  lang,
  freshKey,
  mutateApi,
  onNavigate,
  onOpenBooking,
  onOpenSpa,
  onOpenVoucher,
}: {
  data: any;
  money: boolean;
  lang: 'en' | 'id' | 'de';
  freshKey: string | null;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onNavigate: (v: AdminViewId) => void;
  onOpenBooking: (id: number) => void;
  onOpenSpa: (id: number) => void;
  onOpenVoucher: (id: number) => void;
}) {
  const [chartMode, setChartMode] = useState<'occ' | 'rev'>('occ');
  const today = data.today;
  const tomorrow = addDays(today, 1);
  const totalUnits = (data.units || []).length;

  const activeBookings = (data.roomBookings || []).filter((b: any) => b.status !== 'cancelled');
  const occupiedToday = activeBookings.filter(
    (b: any) => b.check_in <= today && b.check_out > today && b.status !== 'checked_out'
  ).length;
  const arrivalsToday = activeBookings.filter((b: any) => b.check_in === today);
  const arrivalsTomorrow = activeBookings.filter((b: any) => b.check_in === tomorrow);
  const departuresToday = activeBookings.filter((b: any) => b.check_out === today);
  const spaToday = (data.spaBookings || [])
    .filter((b: any) => b.date === today && b.status !== 'cancelled')
    .sort((a: any, b: any) => a.start_min - b.start_min);
  const spaPendingToday = spaToday.filter((b: any) => b.status === 'pending').length;

  const days14 = useMemo(() => dayRange(addDays(today, -3), 14), [today]);

  const series14 = useMemo(
    () =>
      days14.map((d) => {
        const occ = activeBookings.filter((b: any) => b.check_in <= d && b.check_out > d);
        const roomRev = occ.reduce(
          (sum: number, b: any) =>
            sum + b.total / Math.max(1, diffDays(b.check_in, b.check_out)),
          0
        );
        const spaRev = (data.spaBookings || [])
          .filter((b: any) => b.date === d && b.status !== 'cancelled')
          .reduce((sum: number, b: any) => {
            const tr = data.treatments.find((t: any) => t.id === b.treatment_id);
            return sum + (tr ? tr.price : 0);
          }, 0);
        return {
          d,
          occ: occ.length,
          pct: Math.round((occ.length / Math.max(1, totalUnits)) * 100),
          rev: Math.round(roomRev + spaRev),
        };
      }),
    [days14, activeBookings, data.spaBookings, data.treatments, totalUnits]
  );

  const todayPoint = series14.find((x) => x.d === today) || { occ: 0, pct: 0, rev: 0 };
  const rev14Total = series14.reduce((sum, x) => sum + x.rev, 0);
  const newEnqCount = (data.enquiries || []).filter((e: any) => e.status === 'new').length;

  const feedItems = useMemo(() => {
    const list: Array<{
      key: string;
      at: string;
      kind: string;
      tone: string;
      text: string;
      go: () => void;
    }> = [];
    for (const b of (data.roomBookings || []).slice(0, 8)) {
      const r = data.rooms.find((x: any) => x.id === b.room_id);
      list.push({
        key: `room-${b.id}`,
        at: b.created_at,
        kind: 'Room',
        tone: 'blue',
        text: `${b.name} · ${r ? r.name_en : ''} (${fmtShort(b.check_in)}–${fmtShort(b.check_out)})`,
        go: () => onOpenBooking(b.id),
      });
    }
    for (const b of (data.spaBookings || []).slice(0, 8)) {
      const tr = data.treatments.find((x: any) => x.id === b.treatment_id);
      list.push({
        key: `spa-${b.id}`,
        at: b.created_at,
        kind: 'Spa',
        tone: 'violet',
        text: `${b.name} · ${tr ? tr.name_en : ''} (${fmtShort(b.date)} ${minToTime(b.start_min)})`,
        go: () => onOpenSpa(b.id),
      });
    }
    for (const e of (data.enquiries || []).slice(0, 6)) {
      list.push({
        key: `enq-${e.id}`,
        at: e.created_at,
        kind: 'Enquiry',
        tone: 'amber',
        text: `${e.name} · ${e.topic}`,
        go: () => onNavigate('inbox'),
      });
    }
    for (const v of (data.vouchers || []).slice(0, 6)) {
      list.push({
        key: `v-${v.id}`,
        at: v.created_at,
        kind: 'Voucher',
        tone: 'green',
        text: `${v.buyer} · ${fmtEur(v.value)} (${v.code})`,
        go: () => onOpenVoucher(v.id),
      });
    }
    return list.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  }, [data, onOpenBooking, onOpenSpa, onOpenVoucher, onNavigate]);

  return (
    <div className="grid-dash">
      {/* 6 KPI Strip */}
      <div className="kpis" data-tour="kpis">
        <div className="kpi">
          <span>Occupancy today</span>
          <b>
            {occupiedToday}/{totalUnits} <small>{todayPoint.pct}%</small>
          </b>
        </div>
        <div className="kpi">
          <span>Arrivals</span>
          <b>
            {arrivalsToday.length}{' '}
            <small>today · {arrivalsTomorrow.length} tomorrow</small>
          </b>
        </div>
        <div className="kpi">
          <span>Departures</span>
          <b>
            {departuresToday.length} <small>today</small>
          </b>
        </div>
        <div className="kpi">
          <span>Spa appointments today</span>
          <b>
            {spaToday.length}
            {spaPendingToday > 0 && (
              <small className="amber-t"> · {spaPendingToday} pending</small>
            )}
          </b>
        </div>
        {money && (
          <div className="kpi">
            <span>Revenue today</span>
            <b>
              {fmtEur(todayPoint.rev)} <small>14d: {fmtEur(rev14Total)}</small>
            </b>
          </div>
        )}
        <div className="kpi">
          <span>Open enquiries</span>
          <b>
            {newEnqCount} <small>in inbox</small>
          </b>
        </div>
      </div>

      {/* 14-day Smooth Bezier Area Chart */}
      <section className="card span2 grow">
        <header className="card-h">
          <h2>
            {chartMode === 'rev' && money
              ? 'Revenue · 14 days'
              : 'Occupancy · 14 days'}
          </h2>
          <div className="tools">
            {money && (
              <div className="seg">
                <button
                  type="button"
                  aria-pressed={chartMode === 'occ'}
                  onClick={() => setChartMode('occ')}
                >
                  Occupancy
                </button>
                <button
                  type="button"
                  aria-pressed={chartMode === 'rev'}
                  onClick={() => setChartMode('rev')}
                >
                  Revenue
                </button>
              </div>
            )}
            <button
              type="button"
              className="lnk"
              onClick={() => onNavigate('occupancy')}
            >
              Open occupancy plan →
            </button>
          </div>
        </header>
        <AreaChart
          points={series14.map((s) => ({
            x: fmtShort(s.d),
            sub: fmtWd(s.d, lang),
            y: chartMode === 'rev' && money ? s.rev : s.pct,
            now: s.d === today,
            tip:
              chartMode === 'rev' && money
                ? `${fmtWd(s.d, lang)} ${fmtShort(s.d)} · ${fmtEur(s.rev)}`
                : `${fmtWd(s.d, lang)} ${fmtShort(s.d)} · ${s.occ}/${totalUnits} (${s.pct}%)`,
          }))}
          max={chartMode === 'rev' && money ? undefined : 100}
          format={(v) => (chartMode === 'rev' && money ? fmtEur(v) : `${v}%`)}
          color={chartMode === 'rev' && money ? 'var(--green)' : 'var(--blue)'}
          onSelect={() => onNavigate('occupancy')}
        />
      </section>

      {/* Just in Live Feed */}
      <section className="card grow" data-tour="justin">
        <header className="card-h">
          <h2>Just in</h2>
          <span className="muted">Live</span>
        </header>
        <ul className="feed">
          {feedItems.map((f) => (
            <li key={f.key} className={freshKey === f.key ? 'fresh' : ''}>
              <button type="button" onClick={f.go}>
                <span className={`bdg ${f.tone}`}>{f.kind}</span>
                <span className="feed-t">{f.text}</span>
                <small>
                  {new Date(f.at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Arrivals Today Table */}
      <section className="card span2 grow">
        <header className="card-h">
          <h2>Arrivals today</h2>
          <button
            type="button"
            className="lnk"
            onClick={() => onNavigate('stays')}
          >
            All stays →
          </button>
        </header>
        {arrivalsToday.length === 0 ? (
          <p className="muted pad">No arrivals today.</p>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Unit</th>
                  <th>Nights</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {arrivalsToday.map((b: any) => {
                  const rm = data.rooms.find((r: any) => r.id === b.room_id);
                  const un = data.units.find((u: any) => u.id === b.unit_id);
                  const nights = diffDays(b.check_in, b.check_out);
                  const hasCheckin = (data.checkins || []).some(
                    (c: any) => c.room_booking_id === b.id
                  );
                  return (
                    <tr
                      key={b.id}
                      className="click"
                      onClick={() => onOpenBooking(b.id)}
                    >
                      <td>
                        <b>{b.name}</b>
                      </td>
                      <td>{rm ? rm.name_en : ''}</td>
                      <td>
                        <span className="bdg">{un?.label || '—'}</span>
                      </td>
                      <td>{nights}</td>
                      <td>
                        <span
                          className={`bdg ${
                            b.status === 'checked_in' ? 'green' : 'blue'
                          }`}
                        >
                          {b.status === 'checked_in' ? 'Checked in' : 'Arriving'}
                        </span>
                        {hasCheckin && (
                          <span className="bdg green" style={{ marginLeft: 4 }}>
                            Reg. form
                          </span>
                        )}
                      </td>
                      <td className="num" onClick={(e) => e.stopPropagation()}>
                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            className="btn-s"
                            onClick={() =>
                              mutateApi(
                                {
                                  action: 'room_status',
                                  id: b.id,
                                  status: 'checked_in',
                                },
                                'Status updated.'
                              )
                            }
                          >
                            Check in
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Next Spa Appointments */}
      <section className="card grow">
        <header className="card-h">
          <h2>Next spa appointments</h2>
          <button
            type="button"
            className="lnk"
            onClick={() => onNavigate('spa')}
          >
            Spa calendar →
          </button>
        </header>
        {spaToday.length === 0 ? (
          <p className="muted pad">No appointments today.</p>
        ) : (
          <ul className="list">
            {spaToday.slice(0, 6).map((b: any) => {
              const tr = data.treatments.find((x: any) => x.id === b.treatment_id);
              const th = data.therapists.find((x: any) => x.id === b.therapist_id);
              return (
                <li
                  key={b.id}
                  className="click"
                  onClick={() => onOpenSpa(b.id)}
                >
                  <span className="mono">{minToTime(b.start_min)}</span>
                  <span>
                    <b>{tr ? tr.name_en : ''}</b> · {b.name}
                    {b.status === 'pending' && (
                      <>
                        {' '}
                        <span className="bdg amber">Pending</span>
                      </>
                    )}
                  </span>
                  <span className="muted">{th ? th.name : 'Unassigned'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

// ============================================================================
// VIEW 3: OCCUPANCY TAPE CHART (`?view=occupancy` - 100% Steyer Studio `ez`)
// ============================================================================
function OccupancyView({
  data,
  lang,
  freshKey,
  mutateApi,
  onOpenBooking,
}: {
  data: any;
  lang: 'en' | 'id' | 'de';
  freshKey: string | null;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onOpenBooking: (id: number) => void;
}) {
  const [startOffset, setStartOffset] = useState(-2);
  const [span, setSpan] = useState<14 | 21>(14);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  const days = useMemo(
    () => dayRange(addDays(data.today, startOffset), span),
    [data.today, startOffset, span]
  );
  const d0 = days[0];
  const dEnd = addDays(d0, span);

  const bookingsInWindow = useMemo(
    () =>
      (data.roomBookings || []).filter(
        (b: any) =>
          b.status !== 'cancelled' && b.check_out > d0 && b.check_in < dEnd
      ),
    [data.roomBookings, d0, dEnd]
  );

  const rh = Math.max(
    28,
    Math.min(44, Math.floor(540 / (data.units.length + data.rooms.length)))
  );

  return (
    <section className="card fill" data-tour="tape">
      <header className="card-h">
        <h2>Occupancy</h2>
        <div className="tools">
          <button
            type="button"
            className="btn-s"
            onClick={() => setStartOffset((o) => o - 7)}
          >
            ← 7d
          </button>
          <button
            type="button"
            className="btn-s"
            onClick={() => setStartOffset(-2)}
          >
            Today
          </button>
          <button
            type="button"
            className="btn-s"
            onClick={() => setStartOffset((o) => o + 7)}
          >
            7d →
          </button>
          <div className="seg">
            {[14, 21].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={span === n}
                onClick={() => setSpan(n as 14 | 21)}
              >
                {n}d
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="tape-wrap">
        <div
          className="tape"
          style={
            {
              '--days': span,
              '--w': 'calc((100% - 170px) / var(--days))',
              '--rh': `${rh}px`,
              gridTemplateColumns: `170px repeat(${span}, minmax(44px, 1fr))`,
            } as React.CSSProperties
          }
        >
          <div className="tape-h corner">Room</div>
          {days.map((d) => (
            <div
              key={d}
              className={`tape-h ${d === data.today ? 'today' : ''} ${
                isWeekend(d) ? 'we' : ''
              }`}
            >
              <small>{fmtWd(d, lang)}</small>
              <b>{d.slice(8, 10)}</b>
              <small>{d.slice(5, 7)}</small>
            </div>
          ))}

          {data.rooms.map((rm: any) => {
            const rmUnits = data.units.filter((u: any) => u.room_id === rm.id);
            return (
              <React.Fragment key={rm.id}>
                <div className="tape-g">
                  {lang === 'de' ? rm.name_de : rm.name_en}
                </div>
                {days.map((d) => {
                  const used = bookingsInWindow.filter(
                    (b: any) =>
                      b.room_id === rm.id && b.check_in <= d && b.check_out > d
                  ).length;
                  return (
                    <div
                      key={d}
                      className={`tape-gc ${
                        used === rmUnits.length ? 'full' : ''
                      } ${d === data.today ? 'today' : ''}`}
                    >
                      {used}/{rmUnits.length}
                    </div>
                  );
                })}

                {rmUnits.map((un: any) => {
                  const unBookings = bookingsInWindow.filter(
                    (b: any) => b.unit_id === un.id
                  );
                  return (
                    <React.Fragment key={un.id}>
                      <div className="tape-u">
                        <b>{un.label}</b>
                      </div>
                      <div
                        className="tape-track"
                        style={{ gridColumn: `2 / span ${span}` }}
                      >
                        {days.map((d, idx) => (
                          <i
                            key={d}
                            className={`${d === data.today ? 'today' : ''} ${
                              isWeekend(d) ? 'we' : ''
                            }`}
                            style={{ left: `calc(${idx} * var(--w))` }}
                          />
                        ))}
                        {unBookings.map((b: any) => {
                          const startIdx = Math.max(0, diffDays(d0, b.check_in));
                          const endIdx = Math.min(span, diffDays(d0, b.check_out));
                          const len = Math.max(0.5, endIdx - startIdx);
                          const cutL = b.check_in < d0;
                          const cutR = b.check_out > dEnd;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              className={`bar ${b.status} ${
                                cutL ? 'cut-l' : ''
                              } ${cutR ? 'cut-r' : ''} ${
                                freshKey === `room-${b.id}` ? 'fresh' : ''
                              }`}
                              style={{
                                left: `calc((${startIdx} + ${
                                  cutL ? 0 : 0.12
                                }) * var(--w))`,
                                width: `calc((${len} - ${
                                  (cutL ? 0 : 0.12) + (cutR ? 0 : 0.12)
                                }) * var(--w))`,
                              }}
                              onClick={() => onOpenBooking(b.id)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setCtxMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  items: [
                                    {
                                      label: 'Open details',
                                      hint: bookingCode('R', b.id),
                                      onClick: () => onOpenBooking(b.id),
                                    },
                                    { sep: true },
                                    {
                                      label: 'Check in',
                                      disabled: b.status === 'checked_in',
                                      onClick: () =>
                                        mutateApi(
                                          {
                                            action: 'room_status',
                                            id: b.id,
                                            status: 'checked_in',
                                          },
                                          'Status updated.'
                                        ),
                                    },
                                    {
                                      label: 'Check out',
                                      disabled: b.status === 'checked_out',
                                      onClick: () =>
                                        mutateApi(
                                          {
                                            action: 'room_status',
                                            id: b.id,
                                            status: 'checked_out',
                                          },
                                          'Status updated.'
                                        ),
                                    },
                                    { sep: true },
                                    {
                                      label: 'Cancel',
                                      danger: true,
                                      onClick: () =>
                                        mutateApi(
                                          {
                                            action: 'room_status',
                                            id: b.id,
                                            status: 'cancelled',
                                          },
                                          'Status updated.'
                                        ),
                                    },
                                  ],
                                });
                              }}
                              title={`${b.name} (${fmtShort(b.check_in)}–${fmtShort(
                                b.check_out
                              )})`}
                            >
                              <span>
                                {b.name} · {diffDays(b.check_in, b.check_out)}n
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <RenderContextMenu menu={ctxMenu} onClose={() => setCtxMenu(null)} />

      <footer className="legend">
        <span>
          <i className="bar-k confirmed" /> Confirmed
        </span>
        <span>
          <i className="bar-k checked_in" /> Checked in
        </span>
        <span>
          <i className="bar-k checked_out" /> Checked out
        </span>
        <span className="muted">Click a bar for details and status</span>
      </footer>
    </section>
  );
}

// ============================================================================
// VIEW 4: STAYS DATATABLE (`?view=stays` - 100% Steyer Studio `eq`)
// ============================================================================
function StaysView({
  data,
  money,
  freshKey,
  mutateApi,
  onOpenBooking,
}: {
  data: any;
  money: boolean;
  freshKey: string | null;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onOpenBooking: (id: number) => void;
}) {
  const [filter, setFilter] = useState<'upcoming' | 'inhouse' | 'all' | 'cancelled'>('upcoming');

  const rows = useMemo(
    () =>
      (data.roomBookings || []).filter((b: any) => {
        if (filter === 'cancelled') return b.status === 'cancelled';
        if (b.status === 'cancelled') return false;
        if (filter === 'inhouse')
          return (
            b.status === 'checked_in' ||
            (b.check_in <= data.today && b.check_out > data.today)
          );
        if (filter === 'upcoming') return b.check_out >= data.today;
        return true;
      }),
    [data.roomBookings, data.today, filter]
  );

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: 'code',
        label: 'Code',
        className: 'mono muted w-code',
        accessor: (b) => bookingCode('R', b.id),
        sortValue: (b) => b.id,
        filter: 'text',
      },
      {
        id: 'guest',
        label: 'Guest',
        accessor: (b) => b.name,
        filter: 'text',
        cell: (b) => {
          const hasReg = (data.checkins || []).some(
            (c: any) => c.room_booking_id === b.id
          );
          return (
            <>
              <b>{b.name}</b>
              {hasReg && (
                <span className="bdg green" style={{ marginLeft: 6 }}>
                  Reg. form
                </span>
              )}
              {b.email && <small className="muted block">{b.email}</small>}
            </>
          );
        },
      },
      {
        id: 'room',
        label: 'Room',
        accessor: (b) => {
          const rm = data.rooms.find((r: any) => r.id === b.room_id);
          return rm ? rm.name_en : '';
        },
        filter: 'select',
      },
      {
        id: 'unit',
        label: 'Unit',
        className: 'w-unit',
        accessor: (b) => {
          const un = data.units.find((u: any) => u.id === b.unit_id);
          return un ? un.label : '';
        },
        filter: 'select',
        cell: (b) => {
          const un = data.units.find((u: any) => u.id === b.unit_id);
          return <span className="bdg">{un ? un.label : '—'}</span>;
        },
      },
      {
        id: 'check_in',
        label: 'Check-in',
        className: 'mono',
        accessor: (b) => b.check_in,
        filter: 'text',
        filterPlaceholder: 'YYYY-MM-DD',
        cell: (b) => fmtShort(b.check_in),
      },
      {
        id: 'check_out',
        label: 'Check-out',
        className: 'mono',
        accessor: (b) => b.check_out,
        filter: 'text',
        filterPlaceholder: 'YYYY-MM-DD',
        cell: (b) => fmtShort(b.check_out),
      },
      {
        id: 'nights',
        label: 'Nights',
        num: true,
        accessor: (b) => diffDays(b.check_in, b.check_out),
      },
      {
        id: 'guests',
        label: 'Guests',
        num: true,
        accessor: (b) => b.guests,
      },
      {
        id: 'extras',
        label: 'Extras',
        className: 'muted',
        accessor: (b) =>
          (data.equipment || [])
            .filter((e: any) => e.room_booking_id === b.id && e.status !== 'cancelled')
            .map((e: any) => {
              const ex = data.extras.find((x: any) => x.id === e.extra_id);
              return ex ? `${ex.name_en}${e.qty > 1 ? ` ×${e.qty}` : ''}` : '';
            })
            .join(', '),
        filter: 'text',
        cell: (b) => {
          const exs = (data.equipment || []).filter(
            (e: any) => e.room_booking_id === b.id && e.status !== 'cancelled'
          );
          if (exs.length === 0) return '—';
          return exs
            .map((e: any) => {
              const ex = data.extras.find((x: any) => x.id === e.extra_id);
              return ex ? `${ex.name_en}${e.qty > 1 ? ` ×${e.qty}` : ''}` : '';
            })
            .join(', ');
        },
      },
      ...(money
        ? [
            {
              id: 'total',
              label: 'Total',
              num: true,
              className: 'mono',
              accessor: (b: any) => b.total,
              cell: (b: any) => fmtEur(b.total),
            },
          ]
        : []),
      {
        id: 'status',
        label: 'Status',
        accessor: (b) => b.status,
        filter: 'select',
        options: [
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'checked_in', label: 'Checked in' },
          { value: 'checked_out', label: 'Checked out' },
          { value: 'cancelled', label: 'Cancelled' },
        ],
        cell: (b) => {
          const color =
            b.status === 'checked_in'
              ? 'green'
              : b.status === 'confirmed'
              ? 'blue'
              : b.status === 'cancelled'
              ? 'red'
              : 'muted';
          return (
            <div className="fld" onClick={(e) => e.stopPropagation()}>
              <select
                className={`status-sel ${color}`}
                value={b.status}
                onChange={(e) =>
                  mutateApi(
                    { action: 'room_status', id: b.id, status: e.target.value },
                    'Status updated.'
                  )
                }
              >
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked in</option>
                <option value="checked_out">Checked out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          );
        },
      },
    ],
    [data, money, mutateApi]
  );

  return (
    <section className="card fill" data-tour="stays">
      <DataTable
        id="stays"
        fill
        rows={rows}
        columns={columns}
        defaultSort={{ col: 'check_in', dir: 'asc' }}
        onRowClick={(b) => onOpenBooking(b.id)}
        rowClass={(b) => (freshKey === `room-${b.id}` ? 'fresh' : '')}
        rowMenu={(b) => [
          {
            label: 'Open details',
            hint: bookingCode('R', b.id),
            onClick: () => onOpenBooking(b.id),
          },
          { sep: true },
          {
            label: 'Check in',
            disabled: b.status === 'checked_in',
            onClick: () =>
              mutateApi(
                { action: 'room_status', id: b.id, status: 'checked_in' },
                'Status updated.'
              ),
          },
          {
            label: 'Check out',
            disabled: b.status === 'checked_out',
            onClick: () =>
              mutateApi(
                { action: 'room_status', id: b.id, status: 'checked_out' },
                'Status updated.'
              ),
          },
          { sep: true },
          {
            label: 'Cancel',
            danger: true,
            disabled: b.status === 'cancelled',
            onClick: () =>
              mutateApi(
                { action: 'room_status', id: b.id, status: 'cancelled' },
                'Status updated.'
              ),
          },
        ]}
        left={
          <div className="seg">
            {(
              [
                ['upcoming', 'Upcoming'],
                ['inhouse', 'In house'],
                ['all', 'All'],
                ['cancelled', 'Cancelled'],
              ] as const
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                aria-pressed={filter === k}
                onClick={() => setFilter(k)}
              >
                {lbl}
              </button>
            ))}
          </div>
        }
      />
    </section>
  );
}

// ============================================================================
// VIEW 5: SPA APPOINTMENTS (`?view=spa` - 100% Steyer Studio `e$`)
// ============================================================================
function SpaView({
  data,
  money,
  lang,
  initialDate,
  mutateApi,
  onOpenSpa,
}: {
  data: any;
  money: boolean;
  lang: 'en' | 'id' | 'de';
  initialDate: string | null;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onOpenSpa: (id: number) => void;
}) {
  const [date, setDate] = useState(initialDate || data.today);
  const [mode, setMode] = useState<'cal' | 'list'>('cal');
  const [therapistFilter, setTherapistFilter] = useState<string>('all');
  const [showBlockForm, setShowBlockForm] = useState(false);

  // Block form state
  const [blkTherapist, setBlkTherapist] = useState('');
  const [blkFrom, setBlkFrom] = useState(720);
  const [blkTo, setBlkTo] = useState(780);
  const [blkReason, setBlkReason] = useState('');

  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);

  const days10 = useMemo(() => dayRange(data.today, 10), [data.today]);
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  const visibleTherapists = useMemo(() => {
    if (therapistFilter === 'all' || therapistFilter === 'none') return data.therapists || [];
    return (data.therapists || []).filter((t: any) => t.id === Number(therapistFilter));
  }, [data.therapists, therapistFilter]);

  const dayAppts = useMemo(
    () =>
      (data.spaBookings || []).filter((b: any) => {
        if (b.date !== date) return false;
        if (therapistFilter === 'all') return true;
        if (therapistFilter === 'none') return !b.therapist_id;
        return b.therapist_id === Number(therapistFilter);
      }),
    [data.spaBookings, date, therapistFilter]
  );

  const dayBlocks = useMemo(
    () => (data.blocks || []).filter((b: any) => b.date === date),
    [data.blocks, date]
  );

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateApi(
      {
        action: 'block_create',
        date,
        therapist_id: blkTherapist ? Number(blkTherapist) : null,
        start_min: blkFrom,
        end_min: blkTo,
        reason: blkReason,
      },
      'Blocked time saved.'
    );
    setShowBlockForm(false);
    setBlkReason('');
  };

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="daystrip">
          {days10.map((d) => {
            const cnt = (data.spaBookings || []).filter(
              (b: any) => b.date === d && b.status !== 'cancelled'
            ).length;
            return (
              <button
                key={d}
                type="button"
                aria-pressed={d === date}
                onClick={() => setDate(d)}
              >
                <small>{fmtWd(d, lang)}</small>
                <b>{fmtShort(d)}</b>
                <small className="muted">{cnt}</small>
              </button>
            );
          })}
        </div>
        <div className="tools">
          <div className="seg" role="group">
            <button
              type="button"
              aria-pressed={therapistFilter === 'all'}
              onClick={() => setTherapistFilter('all')}
            >
              All
            </button>
            {(data.therapists || []).map((t: any, idx: number) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={therapistFilter === String(t.id)}
                onClick={() => setTherapistFilter(String(t.id))}
              >
                <span className="inline-ava">
                  <span className={`ava-a c${idx % 4}`} style={{ width: 16, height: 16, fontSize: 9 }}>
                    {t.name[0]}
                  </span>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-s"
            onClick={() => setShowBlockForm((s) => !s)}
          >
            <Plus /> Block time
          </button>
          <div className="seg">
            <button
              type="button"
              aria-pressed={mode === 'cal'}
              onClick={() => setMode('cal')}
            >
              Calendar
            </button>
            <button
              type="button"
              aria-pressed={mode === 'list'}
              onClick={() => setMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {showBlockForm && (
        <section className="card">
          <header className="card-h">
            <h2>Block time ({fmtShort(date)})</h2>
          </header>
          <form className="form-row" onSubmit={handleCreateBlock}>
            <label className="fld">
              <span>Therapist</span>
              <select
                value={blkTherapist}
                onChange={(e) => setBlkTherapist(e.target.value)}
              >
                <option value="">All</option>
                {(data.therapists || []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="fld">
              <span>From</span>
              <select
                value={blkFrom}
                onChange={(e) => setBlkFrom(Number(e.target.value))}
              >
                {Array.from({ length: 22 }, (_, i) => 540 + i * 30).map((m) => (
                  <option key={m} value={m}>
                    {minToTime(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="fld">
              <span>To</span>
              <select
                value={blkTo}
                onChange={(e) => setBlkTo(Number(e.target.value))}
              >
                {Array.from({ length: 22 }, (_, i) => 570 + i * 30).map((m) => (
                  <option key={m} value={m}>
                    {minToTime(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="fld grow">
              <span>Reason</span>
              <input
                value={blkReason}
                onChange={(e) => setBlkReason(e.target.value)}
                placeholder="Break, day off, …"
              />
            </label>
            <button type="submit" className="btn-s primary">
              Save
            </button>
          </form>
        </section>
      )}

      {mode === 'cal' && (
        <section className="card fill cal-card">
          <div className="tbl-wrap">
            <div
              className="cal"
              style={{
                gridTemplateColumns: `64px repeat(${visibleTherapists.length}, 1fr)`,
              }}
            >
              <div className="col-h" />
              {visibleTherapists.map((t: any, idx: number) => (
                <div key={t.id} className="col-h">
                  <span className={`ava-a c${idx % 4}`} style={{ width: 22, height: 22, fontSize: 11 }}>
                    {t.name[0]}
                  </span>
                  <span>{t.name}</span>
                </div>
              ))}

              <div className="hours" style={{ height: 'calc(11 * 48px)' }}>
                {hours.map((h, i) => (
                  <span key={h} style={{ top: `calc(${i} * 48px)` }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                ))}
              </div>

              {visibleTherapists.map((t: any) => {
                const tAppts = dayAppts.filter((b: any) => b.therapist_id === t.id);
                const tBlocks = dayBlocks.filter(
                  (b: any) => b.therapist_id === null || b.therapist_id === t.id
                );
                return (
                  <div
                    key={t.id}
                    className="lane"
                    style={{ height: 'calc(11 * 48px)' }}
                  >
                    {hours.map((h, i) => (
                      <i
                        key={h}
                        className="hour-line"
                        style={{ top: `calc(${i} * 48px)` }}
                      />
                    ))}
                    {tBlocks.map((blk: any) => (
                      <div
                        key={`b-${blk.id}`}
                        className="blk"
                        style={{
                          top: `${((blk.start_min - 540) / 60) * 48}px`,
                          height: `${((blk.end_min - blk.start_min) / 60) * 48}px`,
                        }}
                      >
                        <span>{blk.reason || 'Blocked'}</span>
                        <button
                          type="button"
                          className="ibtn"
                          onClick={() => mutateApi({ action: 'block_delete', id: blk.id })}
                          aria-label="Remove"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    ))}
                    {tAppts.map((b: any) => {
                      const tr = data.treatments.find((x: any) => x.id === b.treatment_id);
                      const dur = b.end_min - b.start_min;
                      return (
                        <div
                          key={b.id}
                          role="button"
                          tabIndex={0}
                          className={`appt ${b.status}`}
                          style={{
                            top: `${((b.start_min - 540) / 60) * 48}px`,
                            height: `${Math.max(26, (dur / 60) * 48)}px`,
                          }}
                          onClick={() => onOpenSpa(b.id)}
                        >
                          <b>
                            {minToTime(b.start_min)} {b.name}
                          </b>
                          {b.status === 'pending' && (
                            <span className="bdg amber">Pending</span>
                          )}
                          {dur >= 45 && <small>{tr ? tr.name_en : ''}</small>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {mode === 'list' && (
        <section className="card fill">
          <DataTable
            id="spa"
            fill
            rows={data.spaBookings || []}
            defaultSort={{ col: 'date', dir: 'asc' }}
            onRowClick={(b) => onOpenSpa(b.id)}
            columns={[
              {
                id: 'code',
                label: 'Code',
                className: 'mono muted w-code',
                accessor: (b: any) => bookingCode('S', b.id),
                filter: 'text',
              },
              {
                id: 'date',
                label: 'Date',
                className: 'mono',
                accessor: (b: any) => b.date,
                filter: 'text',
                cell: (b: any) => `${fmtWd(b.date, lang)} ${fmtShort(b.date)}`,
              },
              {
                id: 'time',
                label: 'Time',
                className: 'mono',
                accessor: (b: any) => minToTime(b.start_min),
                cell: (b: any) => `${minToTime(b.start_min)}–${minToTime(b.end_min)}`,
              },
              {
                id: 'treatment',
                label: 'Treatment',
                accessor: (b: any) => {
                  const tr = data.treatments.find((x: any) => x.id === b.treatment_id);
                  return tr ? tr.name_en : '';
                },
                filter: 'select',
              },
              {
                id: 'guest',
                label: 'Guest',
                accessor: (b: any) => b.name,
                filter: 'text',
                cell: (b: any) => <b>{b.name}</b>,
              },
              {
                id: 'therapist',
                label: 'Therapist',
                accessor: (b: any) => {
                  const th = data.therapists.find((x: any) => x.id === b.therapist_id);
                  return th ? th.name : 'Unassigned';
                },
                filter: 'select',
              },
              {
                id: 'status',
                label: 'Status',
                accessor: (b: any) => b.status,
                filter: 'select',
                cell: (b: any) => (
                  <span
                    className={`bdg ${
                      b.status === 'confirmed'
                        ? 'blue'
                        : b.status === 'pending'
                        ? 'amber'
                        : b.status === 'done'
                        ? 'green'
                        : 'red'
                    }`}
                  >
                    {b.status}
                  </span>
                ),
              },
            ]}
          />
        </section>
      )}
    </div>
  );
}

// ============================================================================
// VIEW 6: INBOX & AI CONCIERGE (`?view=inbox` - 100% Steyer Studio `eH`)
// ============================================================================
function InboxView({
  data,
  mutateApi,
  showToast,
}: {
  data: any;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  showToast: (msg: string) => void;
}) {
  const [sub, setSub] = useState<'enq' | 'ai'>('enq');
  const [filter, setFilter] = useState<'all' | 'new' | 'open' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(data.enquiries?.[0]?.id ?? null);

  const filteredEnq = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data.enquiries || []).filter((e: any) => {
      if (filter !== 'all' && e.status !== filter) return false;
      if (q) {
        return (
          e.name.toLowerCase().includes(q) ||
          e.contact.toLowerCase().includes(q) ||
          (e.message || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.enquiries, filter, search]);

  const currentEnq = filteredEnq.find((e: any) => e.id === openId) || filteredEnq[0] || null;
  const parsedDetails = useMemo(() => {
    if (!currentEnq) return [];
    try {
      return JSON.parse(currentEnq.details || '[]');
    } catch {
      return [];
    }
  }, [currentEnq]);

  const newCount = (data.enquiries || []).filter((e: any) => e.status === 'new').length;
  const unansweredCount = (data.conciergeLog || []).filter(
    (l: any) => l.status !== 'answered'
  ).length;

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="seg">
          <button
            type="button"
            aria-pressed={sub === 'enq'}
            onClick={() => setSub('enq')}
          >
            Enquiries
            {newCount > 0 && (
              <span className="bdg green" style={{ marginLeft: 6 }}>
                {newCount}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-pressed={sub === 'ai'}
            onClick={() => setSub('ai')}
          >
            AI concierge
            {unansweredCount > 0 && (
              <span className="bdg amber" style={{ marginLeft: 6 }}>
                {unansweredCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {sub === 'enq' ? (
        <>
          <section className="card fill inbox-acc" data-tour="inbox">
            <div className="dt-bar">
              <div className="dt-bar-l">
                <div className="seg">
                  {(
                    [
                      ['all', 'All'],
                      ['new', 'New'],
                      ['open', 'In progress'],
                      ['done', 'Done'],
                    ] as const
                  ).map(([k, lbl]) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={filter === k}
                      onClick={() => setFilter(k)}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="dt-bar-r">
                <label className="search">
                  <Search />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search …"
                  />
                </label>
              </div>
            </div>

            <ul className="acc">
              {filteredEnq.map((e: any) => {
                const isSelected = currentEnq && currentEnq.id === e.id;
                const badgeTone =
                  e.status === 'new'
                    ? 'green'
                    : e.status === 'open'
                    ? 'amber'
                    : '';
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="acc-row"
                      aria-pressed={isSelected}
                      onClick={() => setOpenId(e.id)}
                    >
                      <b className={e.status === 'new' ? 'unread' : ''}>
                        {e.name}
                      </b>
                      <span className="muted clip">{e.contact}</span>
                      <span className="acc-msg muted">{e.message || '—'}</span>
                      <span className="bdg">{e.topic}</span>
                      <span className={`bdg ${badgeTone}`}>{e.status}</span>
                      <small className="muted mono">
                        {new Date(e.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </small>
                      <ChevronRight className="acc-chev" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {currentEnq && (
            <section className="card inbox-detail">
              <div className="acc-body">
                <div className="acc-grid">
                  <div>
                    <dl className="dl">
                      <div>
                        <dt>Channel</dt>
                        <dd>
                          {currentEnq.channel}: <b>{currentEnq.contact}</b>
                        </dd>
                      </div>
                      {parsedDetails.map(([k, v]: [string, string], i: number) => (
                        <div key={i}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="acc-side">
                    {currentEnq.message && (
                      <blockquote className="msg">{currentEnq.message}</blockquote>
                    )}
                    <div className="acc-actions">
                      <div className="seg">
                        {(
                          [
                            ['new', 'New'],
                            ['open', 'In progress'],
                            ['done', 'Done'],
                          ] as const
                        ).map(([k, lbl]) => (
                          <button
                            key={k}
                            type="button"
                            aria-pressed={currentEnq.status === k}
                            onClick={() =>
                              mutateApi(
                                {
                                  action: 'enquiry_status',
                                  id: currentEnq.id,
                                  status: k,
                                },
                                'Status updated.'
                              )
                            }
                          >
                            {lbl}
                          </button>
                        ))}
                      </div>
                      {currentEnq.channel === 'email' && (
                        <a
                          className="btn-s primary"
                          href={`mailto:${currentEnq.contact}?subject=Your enquiry`}
                        >
                          <Mail /> Reply by email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="card">
          <header className="card-h">
            <h2>Knowledge base (FAQ)</h2>
          </header>
          <div className="pad-x">
            {(data.faq || []).map((f: any) => (
              <div key={f.id} className="faq-row">
                <input
                  className="faq-q"
                  defaultValue={f.question}
                  onBlur={(e) =>
                    mutateApi({
                      action: 'faq_save',
                      id: f.id,
                      question: e.target.value,
                      answer: f.answer,
                    })
                  }
                />
                <textarea
                  className="faq-a"
                  rows={2}
                  defaultValue={f.answer}
                  onBlur={(e) =>
                    mutateApi({
                      action: 'faq_save',
                      id: f.id,
                      question: f.question,
                      answer: e.target.value,
                    })
                  }
                />
                <div className="faq-act">
                  <button
                    type="button"
                    className="ibtn danger"
                    onClick={() =>
                      mutateApi({ action: 'faq_delete', id: f.id }, 'FAQ deleted.')
                    }
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// VIEW 7: VOUCHERS (`?view=vouchers` - 100% Steyer Studio `tk`)
// ============================================================================
function VouchersView({
  data,
  money,
  mutateApi,
  onOpenVoucher,
}: {
  data: any;
  money: boolean;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onOpenVoucher: (id: number) => void;
}) {
  const [filter, setFilter] = useState<'open' | 'redeemed' | 'all'>('open');
  const vouchers = data.vouchers || [];
  const activeVouchers = vouchers.filter((v: any) => v.status !== 'cancelled');
  const totalValue = activeVouchers.reduce((s: number, v: any) => s + v.value, 0);
  const openBalance = activeVouchers.reduce((s: number, v: any) => s + v.balance, 0);

  const filtered = useMemo(
    () =>
      vouchers.filter((v: any) => {
        if (filter === 'open') return v.status === 'active' && v.balance > 0;
        if (filter === 'redeemed') return v.status === 'redeemed' || v.balance === 0;
        return true;
      }),
    [vouchers, filter]
  );

  return (
    <div className="stack" data-tour="vouchers">
      <div className="kpis">
        <div className="kpi">
          <span>Issued</span>
          <b>{activeVouchers.length}</b>
        </div>
        {money && (
          <div className="kpi">
            <span>Total value</span>
            <b>{fmtEur(totalValue)}</b>
          </div>
        )}
        {money && (
          <div className="kpi">
            <span>Redeemed</span>
            <b>{fmtEur(totalValue - openBalance)}</b>
          </div>
        )}
        {money && (
          <div className="kpi">
            <span>Open balance</span>
            <b>{fmtEur(openBalance)}</b>
          </div>
        )}
      </div>

      <section className="card fill">
        <DataTable
          id="vouchers"
          fill
          rows={filtered}
          onRowClick={(v) => onOpenVoucher(v.id)}
          columns={[
            {
              id: 'code',
              label: 'Code',
              className: 'mono',
              accessor: (v: any) => v.code,
              filter: 'text',
              cell: (v: any) => <b>{v.code}</b>,
            },
            {
              id: 'offer',
              label: 'Type',
              accessor: (v: any) => v.offer,
              filter: 'select',
            },
            {
              id: 'recipient',
              label: 'Recipient',
              accessor: (v: any) => v.recipient || '—',
              filter: 'text',
            },
            {
              id: 'buyer',
              label: 'Buyer',
              accessor: (v: any) => v.buyer,
              filter: 'text',
            },
            {
              id: 'value',
              label: 'Value',
              num: true,
              className: 'mono',
              accessor: (v: any) => v.value,
              cell: (v: any) => fmtEur(v.value),
            },
            {
              id: 'balance',
              label: 'Remaining',
              num: true,
              className: 'mono',
              accessor: (v: any) => v.balance,
              cell: (v: any) => <b>{fmtEur(v.balance)}</b>,
            },
            {
              id: 'status',
              label: 'Status',
              accessor: (v: any) => v.status,
              filter: 'select',
              cell: (v: any) => (
                <span
                  className={`bdg ${
                    v.status === 'active'
                      ? 'green'
                      : v.status === 'redeemed'
                      ? 'blue'
                      : 'red'
                  }`}
                >
                  {v.status}
                </span>
              ),
            },
          ]}
          left={
            <div className="seg">
              {(
                [
                  ['open', 'Open'],
                  ['redeemed', 'Redeemed'],
                  ['all', 'All'],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          }
        />
      </section>
    </div>
  );
}

// ============================================================================
// VIEW 8: BLOG & EVENTS (`?view=posts` - 100% Steyer Studio `tr`)
// ============================================================================
function PostsView({
  data,
  mutateApi,
  showToast,
}: {
  data: any;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  showToast: (msg: string) => void;
}) {
  const [editing, setEditing] = useState<any | null>(null);

  if (editing) {
    return (
      <div className="stack">
        <div className="toolbar">
          <button
            type="button"
            className="btn-s"
            onClick={() => setEditing(null)}
          >
            ← Back
          </button>
          <div className="tools">
            <button
              type="button"
              className="btn-s primary"
              onClick={async () => {
                await mutateApi({ action: 'post_save', post: editing }, 'Post saved.');
                setEditing(null);
              }}
            >
              Save
            </button>
          </div>
        </div>
        <div className="editor">
          <div className="editor-main">
            <input
              className="title-inp"
              value={editing.title_en || ''}
              onChange={(e) =>
                setEditing({ ...editing, title_en: e.target.value, title_de: e.target.value })
              }
              placeholder="Title"
            />
            <textarea
              className="excerpt-inp"
              rows={2}
              value={editing.excerpt_en || ''}
              onChange={(e) =>
                setEditing({ ...editing, excerpt_en: e.target.value, excerpt_de: e.target.value })
              }
              placeholder="Short summary for the overview"
            />
            <div className="fld">
              <span>Content (HTML / Markdown)</span>
              <textarea
                rows={12}
                value={editing.body_en || ''}
                onChange={(e) =>
                  setEditing({ ...editing, body_en: e.target.value, body_de: e.target.value })
                }
              />
            </div>
          </div>
          <aside className="editor-side">
            <section className="card side-form">
              <div className="fld">
                <span>Type</span>
                <div className="seg">
                  {(['blog', 'event'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={editing.kind === k}
                      onClick={() => setEditing({ ...editing, kind: k })}
                    >
                      {k === 'event' ? 'Event' : 'Article'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="fld">
                <span>Status</span>
                <div className="seg">
                  {(['draft', 'published'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={editing.status === s}
                      onClick={() => setEditing({ ...editing, status: s })}
                    >
                      {s === 'published' ? 'Published' : 'Draft'}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <section className="card fill" data-tour="posts">
      <DataTable
        id="posts"
        fill
        rows={data.posts || []}
        onRowClick={(p) => setEditing(p)}
        right={
          <button
            type="button"
            className="btn-s primary"
            onClick={() =>
              setEditing({
                kind: 'blog',
                status: 'published',
                title_en: '',
                excerpt_en: '',
                body_en: '<p></p>',
              })
            }
          >
            <Plus /> New post
          </button>
        }
        columns={[
          {
            id: 'thumb',
            label: '',
            className: 'thumb-col',
            hideable: false,
            sortable: false,
            cell: (p: any) =>
              p.image ? (
                <img className="thumb" src={p.image} alt="" />
              ) : (
                <span className="thumb none">
                  <ImageIcon />
                </span>
              ),
          },
          {
            id: 'title',
            label: 'Title',
            accessor: (p: any) => p.title_en,
            filter: 'text',
            cell: (p: any) => (
              <>
                <b>{p.title_en}</b>
                <small className="muted block clip">{p.excerpt_en}</small>
              </>
            ),
          },
          {
            id: 'kind',
            label: 'Type',
            accessor: (p: any) => (p.kind === 'event' ? 'Event' : 'Article'),
            filter: 'select',
            cell: (p: any) => (
              <span className={`bdg ${p.kind === 'event' ? 'violet' : 'blue'}`}>
                {p.kind === 'event' ? 'Event' : 'Article'}
              </span>
            ),
          },
          {
            id: 'date',
            label: 'Date / Event',
            className: 'mono',
            accessor: (p: any) => p.event_date || p.created_at.slice(0, 10),
            cell: (p: any) =>
              p.kind === 'event' && p.event_date
                ? `${fmtShort(p.event_date)} ${p.event_time || ''}`
                : fmtShort(p.created_at.slice(0, 10)),
          },
          {
            id: 'status',
            label: 'Status',
            accessor: (p: any) => p.status,
            filter: 'select',
            cell: (p: any) => (
              <span
                className={`bdg ${p.status === 'published' ? 'green' : 'amber'}`}
              >
                {p.status}
              </span>
            ),
          },
          {
            id: 'act',
            label: '',
            className: 'act',
            hideable: false,
            sortable: false,
            cell: (p: any) => (
              <button
                type="button"
                className="ibtn"
                onClick={() => mutateApi({ action: 'post_delete', id: p.id }, 'Post deleted.')}
              >
                <Trash2 />
              </button>
            ),
          },
        ]}
      />
    </section>
  );
}

// ============================================================================
// VIEW 9: CATALOGUE / PRODUCTS (`?view=products` - 100% Steyer Studio `tb`)
// ============================================================================
function ProductsView({
  data,
  tab,
  setTab,
  mutateApi,
}: {
  data: any;
  tab: 'rooms' | 'extras' | 'treatments';
  setTab: (t: 'rooms' | 'extras' | 'treatments') => void;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
}) {
  return (
    <div className="stack" data-tour="products">
      <div className="toolbar">
        <div className="seg">
          {(
            [
              ['rooms', 'Rooms'],
              ['extras', 'Extras'],
              ['treatments', 'Treatments'],
            ] as const
          ).map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              aria-pressed={tab === k}
              onClick={() => setTab(k)}
            >
              {lbl}
            </button>
          ))}
        </div>
        <span className="muted">
          Changes take effect immediately in the booking widget.
        </span>
      </div>

      {tab === 'rooms' && (
        <section className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="thumb-col" />
                  <th>Room</th>
                  <th>Size</th>
                  <th>1 guest</th>
                  <th>2 guests</th>
                  <th>3 guests</th>
                  <th>4 guests</th>
                  <th>Online</th>
                </tr>
              </thead>
              <tbody>
                {(data.rooms || []).map((r: any) => (
                  <tr key={r.id}>
                    <td className="thumb-col">
                      {r.image ? (
                        <img className="thumb" src={r.image} alt="" />
                      ) : (
                        <span className="thumb none">
                          <ImageIcon />
                        </span>
                      )}
                    </td>
                    <td>
                      <b>{r.name_en}</b>
                      <small className="muted block">{r.desc_en}</small>
                    </td>
                    <td className="mono">{r.size} m²</td>
                    {[0, 1, 2, 3].map((idx) => (
                      <td key={idx}>
                        {idx < r.max_guests ? (
                          <input
                            type="number"
                            className="inp num"
                            defaultValue={r.prices[idx] ?? ''}
                            onBlur={(e) => {
                              const nextPrices = [...r.prices];
                              nextPrices[idx] = Number(e.target.value);
                              mutateApi(
                                {
                                  action: 'product_patch',
                                  kind: 'room',
                                  id: r.id,
                                  patch: { prices: nextPrices },
                                },
                                'Saved.'
                              );
                            }}
                          />
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    ))}
                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(r.active)}
                        onChange={(e) =>
                          mutateApi(
                            {
                              action: 'product_patch',
                              kind: 'room',
                              id: r.id,
                              patch: { active: e.target.checked },
                            },
                            'Saved.'
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'extras' && (
        <section className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="thumb-col" />
                  <th>Extra</th>
                  <th>Where</th>
                  <th>Unit</th>
                  <th>Price (€)</th>
                  <th>Stock</th>
                  <th>Online</th>
                </tr>
              </thead>
              <tbody>
                {(data.extras || []).map((ex: any) => (
                  <tr key={ex.id}>
                    <td className="thumb-col">
                      {ex.image ? (
                        <img className="thumb" src={ex.image} alt="" />
                      ) : (
                        <span className="thumb none">
                          <ImageIcon />
                        </span>
                      )}
                    </td>
                    <td>
                      <b>{ex.name_en}</b>
                      <small className="muted block">{ex.desc_en}</small>
                    </td>
                    <td>
                      <span
                        className={`bdg ${ex.scope === 'spa' ? 'violet' : 'blue'}`}
                      >
                        {ex.scope === 'spa' ? 'Spa' : 'Room'}
                      </span>
                    </td>
                    <td className="muted">{ex.unit}</td>
                    <td>
                      <input
                        type="number"
                        className="inp num"
                        defaultValue={ex.price}
                        onBlur={(e) =>
                          mutateApi(
                            {
                              action: 'product_patch',
                              kind: 'extra',
                              id: ex.id,
                              patch: { price: Number(e.target.value) },
                            },
                            'Saved.'
                          )
                        }
                      />
                    </td>
                    <td>
                      {ex.stock === null ? (
                        <span className="muted">unlimited</span>
                      ) : (
                        <input
                          type="number"
                          className="inp num"
                          defaultValue={ex.stock}
                          onBlur={(e) =>
                            mutateApi(
                              {
                                action: 'product_patch',
                                kind: 'extra',
                                id: ex.id,
                                patch: { stock: Number(e.target.value) },
                              },
                              'Saved.'
                            )
                          }
                        />
                      )}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(ex.active)}
                        onChange={(e) =>
                          mutateApi(
                            {
                              action: 'product_patch',
                              kind: 'extra',
                              id: ex.id,
                              patch: { active: e.target.checked },
                            },
                            'Saved.'
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'treatments' && (
        <section className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="thumb-col" />
                  <th>Treatment</th>
                  <th>Duration (min)</th>
                  <th>Price (€)</th>
                  <th>Online</th>
                </tr>
              </thead>
              <tbody>
                {(data.treatments || []).map((tr: any) => (
                  <tr key={tr.id}>
                    <td className="thumb-col">
                      {tr.image ? (
                        <img className="thumb" src={tr.image} alt="" />
                      ) : (
                        <span className="thumb none">
                          <ImageIcon />
                        </span>
                      )}
                    </td>
                    <td>
                      <b>{tr.name_en}</b>
                      <small className="muted block">{tr.desc_en}</small>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="inp num"
                        defaultValue={tr.minutes}
                        onBlur={(e) =>
                          mutateApi(
                            {
                              action: 'product_patch',
                              kind: 'treatment',
                              id: tr.id,
                              patch: { minutes: Number(e.target.value) },
                            },
                            'Saved.'
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="inp num"
                        defaultValue={tr.price}
                        onBlur={(e) =>
                          mutateApi(
                            {
                              action: 'product_patch',
                              kind: 'treatment',
                              id: tr.id,
                              patch: { price: Number(e.target.value) },
                            },
                            'Saved.'
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(tr.active)}
                        onChange={(e) =>
                          mutateApi(
                            {
                              action: 'product_patch',
                              kind: 'treatment',
                              id: tr.id,
                              patch: { active: e.target.checked },
                            },
                            'Saved.'
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// VIEW 10: TRADESIM DEPOSIT APPROVALS (`?view=deposits` - Live Supabase)
// ============================================================================
function DepositsView({
  data,
  onRefresh,
  showToast,
  onOpenDeposit,
}: {
  data: any;
  onRefresh: () => Promise<void>;
  showToast: (msg: string) => void;
  onOpenDeposit: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [simUser, setSimUser] = useState('');
  const [simMethod, setSimMethod] = useState('QRIS');
  const [simAmount, setSimAmount] = useState('10000000');
  const [isPending, startTransition] = useTransition();

  const deposits: DepositRecord[] = data.deposits || [];
  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const approvedCount = deposits.filter((d) => d.status === 'APPROVED').length;
  const rejectedCount = deposits.filter((d) => d.status === 'REJECTED').length;
  const totalApprovedVol = deposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((s, d) => s + (Number(d.amount) || 0), 0);

  const filtered = useMemo(
    () =>
      deposits.filter((d) => {
        if (filter === 'ALL') return true;
        return d.status === filter;
      }),
    [deposits, filter]
  );

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveDeposit(id);
      if (res.success) {
        showToast(res.message || 'Deposit approved.');
        await onRefresh();
      } else {
        showToast(res.error || 'Approval failed.');
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const res = await rejectDeposit(id, 'Rejected via Admin Console');
      if (res.success) {
        showToast('Deposit rejected.');
        await onRefresh();
      } else {
        showToast(res.error || 'Reject failed.');
      }
    });
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUser.trim()) return;
    startTransition(async () => {
      const res = await createDepositRequest(simUser.trim(), Number(simAmount) || 10000000, simMethod);
      if (res.success) {
        showToast('Simulation deposit ticket created.');
        setSimUser('');
        await onRefresh();
      } else {
        showToast(res.error || 'Failed to create deposit ticket.');
      }
    });
  };

  const columns = useMemo<DataTableColumn<DepositRecord>[]>(
    () => [
      {
        id: 'id',
        label: 'Ticket',
        className: 'mono muted w-code',
        accessor: (d) => d.id.slice(0, 8).toUpperCase(),
        filter: 'text',
      },
      {
        id: 'member',
        label: 'Member',
        accessor: (d) => d.user?.full_name || 'Member',
        filter: 'text',
        cell: (d) => (
          <>
            <b>{d.user?.full_name || 'Member Trader'}</b>
            <small className="muted block">{d.user?.email || d.user_id}</small>
          </>
        ),
      },
      {
        id: 'method',
        label: 'Method',
        accessor: (d) => d.payment_method || 'QRIS',
        filter: 'select',
        cell: (d) => <span className="bdg blue">{d.payment_method || 'QRIS'}</span>,
      },
      {
        id: 'amount',
        label: 'Virtual Cash',
        num: true,
        className: 'mono',
        accessor: (d) => d.amount,
        cell: (d) => <b>{fmtIdr(d.amount)}</b>,
      },
      {
        id: 'created_at',
        label: 'Created',
        className: 'mono muted',
        accessor: (d) => d.created_at,
        cell: (d) =>
          new Date(d.created_at).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
      {
        id: 'status',
        label: 'Status',
        accessor: (d) => d.status,
        filter: 'select',
        cell: (d) => (
          <span
            className={`bdg ${
              d.status === 'APPROVED'
                ? 'green'
                : d.status === 'PENDING'
                ? 'amber'
                : 'red'
            }`}
          >
            {d.status}
          </span>
        ),
      },
      {
        id: 'act',
        label: '',
        className: 'act',
        hideable: false,
        sortable: false,
        cell: (d) =>
          d.status === 'PENDING' ? (
            <div className="acts" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="btn-s primary sm"
                disabled={isPending}
                onClick={() => handleApprove(d.id)}
              >
                <Check /> Approve
              </button>
              <button
                type="button"
                className="btn-s ghost sm danger"
                disabled={isPending}
                onClick={() => handleReject(d.id)}
              >
                Reject
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-s ghost sm"
              onClick={() => onOpenDeposit(d.id)}
            >
              Details
            </button>
          ),
      },
    ],
    [isPending]
  );

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi">
          <span>Pending queue</span>
          <b>
            {pendingCount} <small>awaiting verification</small>
          </b>
        </div>
        <div className="kpi">
          <span>Approved</span>
          <b>{approvedCount}</b>
        </div>
        <div className="kpi">
          <span>Rejected</span>
          <b>{rejectedCount}</b>
        </div>
        <div className="kpi">
          <span>Total approved volume</span>
          <b>{fmtIdr(totalApprovedVol)}</b>
        </div>
      </div>

      {/* New Deposit Simulation Bar (same style as Equipment New Rental) */}
      <section className="card">
        <header className="card-h">
          <h2>Create deposit ticket (Simulation / Manual Top-up)</h2>
        </header>
        <form className="form-row" onSubmit={handleSimulate}>
          <label className="fld grow">
            <span>Member Email / User ID</span>
            <input
              value={simUser}
              onChange={(e) => setSimUser(e.target.value)}
              placeholder="member@email.com or user_id"
              required
            />
          </label>
          <label className="fld">
            <span>Method</span>
            <select value={simMethod} onChange={(e) => setSimMethod(e.target.value)}>
              <option value="QRIS">QRIS Instant</option>
              <option value="BCA">BCA Virtual Account</option>
              <option value="MANDIRI">Mandiri Transfer</option>
            </select>
          </label>
          <label className="fld">
            <span>Virtual Cash (IDR)</span>
            <input
              type="number"
              min={100000}
              step={100000}
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              style={{ width: 150 }}
            />
          </label>
          <button type="submit" className="btn-s primary" disabled={isPending}>
            Add ticket
          </button>
        </form>
      </section>

      <section className="card fill">
        <DataTable
          id="deposits"
          fill
          rows={filtered}
          columns={columns}
          onRowClick={(d) => onOpenDeposit(d.id)}
          rowClass={(d) => (d.status === 'PENDING' ? 'pending' : '')}
          rowMenu={(d) => [
            {
              label: 'Open ticket details',
              hint: d.id.slice(0, 8),
              onClick: () => onOpenDeposit(d.id),
            },
            {
              label: 'Copy Ticket ID',
              icon: <Copy />,
              onClick: () => {
                navigator.clipboard?.writeText(d.id);
                showToast('Ticket ID copied.');
              },
            },
            { sep: true },
            {
              label: 'Approve deposit',
              disabled: d.status !== 'PENDING',
              onClick: () => handleApprove(d.id),
            },
            {
              label: 'Reject deposit',
              danger: true,
              disabled: d.status !== 'PENDING',
              onClick: () => handleReject(d.id),
            },
          ]}
          left={
            <div className="seg">
              {(
                [
                  ['PENDING', 'Pending'],
                  ['ALL', 'All'],
                  ['APPROVED', 'Approved'],
                  ['REJECTED', 'Rejected'],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          }
        />
      </section>
    </div>
  );
}

// ============================================================================
// VIEW 11: TRADESIM MEMBER PORTFOLIOS (`?view=portfolios` - Live Supabase)
// ============================================================================
function PortfoliosView({
  data,
  onRefresh,
  showToast,
  onOpenMember,
}: {
  data: any;
  onRefresh: () => Promise<void>;
  showToast: (msg: string) => void;
  onOpenMember: (id: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'admin'>('all');
  const [isPending, startTransition] = useTransition();

  const members: MemberPortfolioItem[] = data.members || [];
  const totalCash = members.reduce((s, m) => s + (Number(m.cash) || 0), 0);
  const totalMarketVal = members.reduce((s, m) => s + (Number(m.totalMarketValue) || 0), 0);
  const totalAum = totalCash + totalMarketVal;

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        if (filter === 'active') return (m.holdings?.length || 0) > 0 || m.cash > 0;
        if (filter === 'admin') return m.role === 'admin';
        return true;
      }),
    [members, filter]
  );

  const handleResetZero = (m: MemberPortfolioItem) => {
    startTransition(async () => {
      const res = await resetMemberAccountToZero(m.user_id);
      if (res.success) {
        showToast(res.message || 'Member account reset to Rp 0.');
        await onRefresh();
      } else {
        showToast(res.error || 'Reset failed.');
      }
    });
  };

  const columns = useMemo<DataTableColumn<MemberPortfolioItem>[]>(
    () => [
      {
        id: 'name',
        label: 'Member',
        accessor: (m) => m.full_name,
        filter: 'text',
        cell: (m) => (
          <>
            <b>{m.full_name || 'Member Trader'}</b>
            <small className="muted block">{m.email}</small>
          </>
        ),
      },
      {
        id: 'role',
        label: 'Role',
        accessor: (m) => m.role,
        filter: 'select',
        cell: (m) => (
          <span className={`bdg ${m.role === 'admin' ? 'violet' : 'blue'}`}>
            {m.role}
          </span>
        ),
      },
      {
        id: 'positions',
        label: 'Positions',
        num: true,
        className: 'mono',
        accessor: (m) => m.holdings?.length || 0,
        cell: (m) => <span className="bdg">{m.holdings?.length || 0} stocks</span>,
      },
      {
        id: 'cash',
        label: 'Cash RDN',
        num: true,
        className: 'mono',
        accessor: (m) => m.cash,
        cell: (m) => fmtIdr(m.cash),
      },
      {
        id: 'market',
        label: 'Stock Value',
        num: true,
        className: 'mono',
        accessor: (m) => m.totalMarketValue,
        cell: (m) => fmtIdr(m.totalMarketValue),
      },
      {
        id: 'equity',
        label: 'Total Equity',
        num: true,
        className: 'mono',
        accessor: (m) => m.totalAssetValue,
        cell: (m) => <b>{fmtIdr(m.totalAssetValue)}</b>,
      },
      {
        id: 'act',
        label: '',
        className: 'act',
        hideable: false,
        sortable: false,
        cell: (m) => (
          <button
            type="button"
            className="btn-s ghost sm"
            onClick={() => onOpenMember(m.user_id)}
          >
            Inspect
          </button>
        ),
      },
    ],
    [onOpenMember]
  );

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi">
          <span>Registered members</span>
          <b>{members.length}</b>
        </div>
        <div className="kpi">
          <span>Total Cash RDN</span>
          <b>{fmtIdr(totalCash)}</b>
        </div>
        <div className="kpi">
          <span>Total holdings value</span>
          <b>{fmtIdr(totalMarketVal)}</b>
        </div>
        <div className="kpi">
          <span>Combined AUM</span>
          <b>{fmtIdr(totalAum)}</b>
        </div>
      </div>

      <section className="card fill">
        <DataTable
          id="portfolios"
          fill
          rows={filtered}
          columns={columns}
          defaultSort={{ col: 'equity', dir: 'desc' }}
          onRowClick={(m) => onOpenMember(m.user_id)}
          rowMenu={(m) => [
            {
              label: 'Inspect portfolio & holdings',
              icon: <Eye />,
              onClick: () => onOpenMember(m.user_id),
            },
            { sep: true },
            {
              label: 'Reset balance to Rp 0',
              icon: <RotateCcw />,
              disabled: isPending,
              onClick: () => handleResetZero(m),
            },
            {
              label: 'Manage password / delete',
              danger: true,
              icon: <KeyRound />,
              onClick: () => onOpenMember(m.user_id),
            },
          ]}
          left={
            <div className="seg">
              {(
                [
                  ['all', 'All members'],
                  ['active', 'Funded / Active'],
                  ['admin', 'Admins'],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {lbl}
                </button>
              ))}
            </div>
          }
        />
      </section>
    </div>
  );
}

// ============================================================================
// SLIDE-OVER SHEETS (`StaySheet`, `SpaSheet`, `VoucherSheet`, `DepositSheet`, `MemberPortfolioSheet`)
// ============================================================================
function StaySheet({
  data,
  bookingId,
  money,
  mutateApi,
  onClose,
}: {
  data: any;
  bookingId: number;
  money: boolean;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onClose: () => void;
}) {
  const b = (data.roomBookings || []).find((x: any) => x.id === bookingId);
  if (!b) return null;
  const rm = data.rooms.find((r: any) => r.id === b.room_id);
  const un = data.units.find((u: any) => u.id === b.unit_id);
  const nights = diffDays(b.check_in, b.check_out);
  const extras = (data.equipment || []).filter(
    (e: any) => e.room_booking_id === b.id && e.status !== 'cancelled'
  );
  const checkin = (data.checkins || []).find((c: any) => c.room_booking_id === b.id);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet">
        <header className="sheet-h">
          <div>
            <small className="muted mono">{bookingCode('R', b.id)}</small>
            <h2>{b.name}</h2>
          </div>
          <button type="button" className="ibtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="sheet-b">
          <div className="sheet-status">
            <span className="muted">Status</span>
            <div className="seg">
              {(
                [
                  ['confirmed', 'Confirmed'],
                  ['checked_in', 'Checked in'],
                  ['checked_out', 'Checked out'],
                  ['cancelled', 'Cancelled'],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={b.status === k}
                  onClick={() =>
                    mutateApi(
                      { action: 'room_status', id: b.id, status: k },
                      'Status updated.'
                    )
                  }
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="contact-btns">
            {b.email && (
              <a className="btn-s" href={`mailto:${b.email}`}>
                <Mail /> {b.email}
              </a>
            )}
            {b.phone && (
              <a className="btn-s" href={`tel:${b.phone}`}>
                <Phone /> {b.phone}
              </a>
            )}
            <button
              type="button"
              className="btn-s"
              onClick={() => window.print()}
            >
              <Printer /> Print
            </button>
          </div>

          <dl className="dl">
            <div>
              <dt>Room</dt>
              <dd>
                {rm ? rm.name_en : ''} · <span className="bdg">{un?.label}</span>
              </dd>
            </div>
            <div>
              <dt>Check-in</dt>
              <dd className="mono">{b.check_in}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd className="mono">
                {b.check_out} ({nights} nights)
              </dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{b.guests}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{b.source}</dd>
            </div>
          </dl>

          {checkin && (
            <>
              <h3 className="sub">Registration form</h3>
              <dl className="dl">
                <div>
                  <dt>Name</dt>
                  <dd>
                    {checkin.first_name} {checkin.last_name}
                  </dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>
                    {checkin.street}, {checkin.zip} {checkin.city} ({checkin.country})
                  </dd>
                </div>
                {checkin.doc_number && (
                  <div>
                    <dt>Document</dt>
                    <dd className="mono">
                      {checkin.doc_type} · {checkin.doc_number}
                    </dd>
                  </div>
                )}
              </dl>
            </>
          )}

          {money && (
            <>
              <h3 className="sub">Receipt</h3>
              <table className="tbl">
                <tbody>
                  <tr>
                    <td>
                      {rm ? rm.name_en : ''} × {nights} nights
                    </td>
                    <td className="num mono">{fmtEur(b.room_total)}</td>
                  </tr>
                  {extras.map((e: any) => {
                    const ex = data.extras.find((x: any) => x.id === e.extra_id);
                    return (
                      <tr key={e.id}>
                        <td>
                          {ex ? ex.name_en : ''} × {e.qty}
                        </td>
                        <td className="num mono">{fmtEur(e.total)}</td>
                      </tr>
                    );
                  })}
                  <tr className="sum">
                    <td>Total</td>
                    <td className="num mono">{fmtEur(b.total)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function SpaSheet({
  data,
  spaId,
  money,
  mutateApi,
  onClose,
}: {
  data: any;
  spaId: number;
  money: boolean;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onClose: () => void;
}) {
  const b = (data.spaBookings || []).find((x: any) => x.id === spaId);
  if (!b) return null;
  const tr = data.treatments.find((x: any) => x.id === b.treatment_id);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet">
        <header className="sheet-h">
          <div>
            <small className="muted mono">{bookingCode('S', b.id)}</small>
            <h2>{b.name}</h2>
          </div>
          <button type="button" className="ibtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="sheet-b">
          <div className="sheet-status">
            <span className="muted">Status</span>
            <div className="seg">
              {(
                [
                  ['pending', 'Pending'],
                  ['confirmed', 'Confirmed'],
                  ['done', 'Completed'],
                  ['cancelled', 'Cancelled'],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={b.status === k}
                  onClick={() =>
                    mutateApi(
                      { action: 'spa_patch', id: b.id, status: k },
                      'Status updated.'
                    )
                  }
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <dl className="dl">
            <div>
              <dt>Treatment</dt>
              <dd>
                {tr ? tr.name_en : ''} ({tr ? tr.minutes : 0} min)
              </dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd className="mono">
                {b.date} · {minToTime(b.start_min)}–{minToTime(b.end_min)}
              </dd>
            </div>
            <div>
              <dt>Therapist</dt>
              <dd>
                <div className="seg">
                  {(data.therapists || []).map((t: any) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={b.therapist_id === t.id}
                      onClick={() =>
                        mutateApi(
                          { action: 'spa_patch', id: b.id, therapist_id: t.id },
                          'Saved.'
                        )
                      }
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </dd>
            </div>
            {money && tr && (
              <div>
                <dt>Price</dt>
                <dd className="mono">
                  <b>{fmtEur(tr.price)}</b>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </aside>
    </>
  );
}

function VoucherSheet({
  data,
  voucherId,
  mutateApi,
  onClose,
}: {
  data: any;
  voucherId: number;
  mutateApi: (payload: Record<string, any>, toast?: string) => Promise<any>;
  onClose: () => void;
}) {
  const v = (data.vouchers || []).find((x: any) => x.id === voucherId);
  const [amt, setAmt] = useState<number>(v?.balance || 0);
  const [note, setNote] = useState('');
  useEffect(() => {
    if (v) setAmt(v.balance);
  }, [v]);
  if (!v) return null;

  const redemptions = (data.redemptions || []).filter(
    (r: any) => r.voucher_id === v.id
  );

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateApi(
      { action: 'voucher_patch', id: v.id, redeem: amt, note },
      'Redeemed.'
    );
    setNote('');
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet">
        <header className="sheet-h">
          <div>
            <small className="muted mono">{v.code}</small>
            <h2>
              {fmtEur(v.balance)} <small className="muted">of {fmtEur(v.value)}</small>
            </h2>
          </div>
          <button type="button" className="ibtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="sheet-b">
          {v.status === 'active' && v.balance > 0 && (
            <form className="redeem" onSubmit={handleRedeem}>
              <h3 className="sub">Redeem</h3>
              <div className="form-row">
                <label className="fld">
                  <span>Amount (€)</span>
                  <input
                    type="number"
                    min={1}
                    max={v.balance}
                    value={amt}
                    onChange={(e) => setAmt(Number(e.target.value))}
                    style={{ width: 90 }}
                  />
                </label>
                <label className="fld grow">
                  <span>Note</span>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Room, spa, restaurant …"
                  />
                </label>
                <button type="submit" className="btn-s primary">
                  Redeem
                </button>
              </div>
            </form>
          )}

          <dl className="dl">
            <div>
              <dt>Recipient</dt>
              <dd>{v.recipient || '—'}</dd>
            </div>
            <div>
              <dt>Buyer</dt>
              <dd>
                {v.buyer} · <span className="muted">{v.email}</span>
              </dd>
            </div>
            <div>
              <dt>Valid until</dt>
              <dd className="mono">{v.expires}</dd>
            </div>
          </dl>

          {redemptions.length > 0 && (
            <>
              <h3 className="sub">Redemptions</h3>
              <table className="tbl">
                <tbody>
                  {redemptions.map((r: any) => (
                    <tr key={r.id}>
                      <td className="mono muted">{r.created_at.slice(0, 10)}</td>
                      <td>{r.note || '—'}</td>
                      <td className="num mono">−{fmtEur(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function DepositSheet({
  data,
  depositId,
  onRefresh,
  showToast,
  onClose,
}: {
  data: any;
  depositId: string;
  onRefresh: () => Promise<void>;
  showToast: (msg: string) => void;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const d: DepositRecord | undefined = (data.deposits || []).find(
    (x: DepositRecord) => x.id === depositId
  );
  if (!d) return null;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet">
        <header className="sheet-h">
          <div>
            <small className="muted mono">{d.id.slice(0, 12).toUpperCase()}</small>
            <h2>{d.user?.full_name || 'Member Deposit'}</h2>
          </div>
          <button type="button" className="ibtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="sheet-b">
          <div className="sheet-status">
            <span className="muted">Status</span>
            <span
              className={`bdg ${
                d.status === 'APPROVED'
                  ? 'green'
                  : d.status === 'PENDING'
                  ? 'amber'
                  : 'red'
              }`}
            >
              {d.status}
            </span>
          </div>

          <dl className="dl">
            <div>
              <dt>Member</dt>
              <dd>
                <b>{d.user?.full_name || 'Member'}</b>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{d.user?.email || d.user_id}</dd>
            </div>
            <div>
              <dt>Method</dt>
              <dd>{d.payment_method || 'QRIS'}</dd>
            </div>
            <div>
              <dt>Virtual Cash</dt>
              <dd className="mono">
                <b>{fmtIdr(d.amount)}</b>
              </dd>
            </div>
            <div>
              <dt>Notes</dt>
              <dd>{d.notes || '—'}</dd>
            </div>
          </dl>

          {d.proof_url && (
            <>
              <h3 className="sub">Transfer proof</h3>
              <div className="imgfield-pic">
                <img src={d.proof_url} alt="Proof" />
              </div>
            </>
          )}

          {d.status === 'PENDING' && (
            <div className="sheet-actions">
              <button
                type="button"
                className="btn-s primary"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await approveDeposit(d.id);
                    if (res.success) {
                      showToast('Deposit approved.');
                      await onRefresh();
                      onClose();
                    } else {
                      showToast(res.error || 'Failed.');
                    }
                  })
                }
              >
                <Check /> Approve Deposit
              </button>
              <button
                type="button"
                className="btn-s danger"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await rejectDeposit(d.id);
                    if (res.success) {
                      showToast('Deposit rejected.');
                      await onRefresh();
                      onClose();
                    }
                  })
                }
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function MemberPortfolioSheet({
  data,
  userId,
  onRefresh,
  showToast,
  onClose,
}: {
  data: any;
  userId: string;
  onRefresh: () => Promise<void>;
  showToast: (msg: string) => void;
  onClose: () => void;
}) {
  const [newPass, setNewPass] = useState('');
  const [isPending, startTransition] = useTransition();
  const m: MemberPortfolioItem | undefined = (data.members || []).find(
    (x: MemberPortfolioItem) => x.user_id === userId
  );
  if (!m) return null;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet">
        <header className="sheet-h">
          <div>
            <small className="muted mono">{m.email}</small>
            <h2>{m.full_name || 'Member Portfolio'}</h2>
          </div>
          <button type="button" className="ibtn" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="sheet-b">
          <dl className="dl">
            <div>
              <dt>Cash RDN</dt>
              <dd className="mono">{fmtIdr(m.cash)}</dd>
            </div>
            <div>
              <dt>Holdings Value</dt>
              <dd className="mono">{fmtIdr(m.totalMarketValue)}</dd>
            </div>
            <div>
              <dt>Total Equity</dt>
              <dd className="mono">
                <b>{fmtIdr(m.totalAssetValue)}</b>
              </dd>
            </div>
          </dl>

          <h3 className="sub">Stock Holdings ({m.holdings?.length || 0})</h3>
          {!m.holdings || m.holdings.length === 0 ? (
            <p className="muted">No active stock positions.</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th className="num">Lots</th>
                  <th className="num">Avg</th>
                  <th className="num">Last</th>
                </tr>
              </thead>
              <tbody>
                {m.holdings.map((h, i) => (
                  <tr key={i}>
                    <td>
                      <b>{h.displaySymbol || h.symbol}</b>
                    </td>
                    <td className="num mono">{h.lots}</td>
                    <td className="num mono">{Math.round(h.avgPrice).toLocaleString('id-ID')}</td>
                    <td className="num mono">{Math.round(h.currentPrice || h.avgPrice).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 className="sub">Reset Password</h3>
          <form
            className="form-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (newPass.length < 6) {
                showToast('Password must be at least 6 characters.');
                return;
              }
              startTransition(async () => {
                const res = await resetMemberPassword(m.user_id, newPass);
                if (res.success) {
                  showToast('Password updated.');
                  setNewPass('');
                } else {
                  showToast(res.error || 'Error');
                }
              });
            }}
          >
            <label className="fld grow">
              <span>New Password</span>
              <input
                type="text"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </label>
            <button type="submit" className="btn-s primary" disabled={isPending}>
              Update
            </button>
          </form>

          <h3 className="sub">Account Actions</h3>
          <div className="sheet-actions">
            <button
              type="button"
              className="btn-s"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const res = await resetMemberAccountToZero(m.user_id);
                  if (res.success) {
                    showToast('Account reset to Rp 0.');
                    await onRefresh();
                  }
                })
              }
            >
              <RotateCcw /> Reset Balance to Rp 0
            </button>
            {m.role !== 'admin' && (
              <button
                type="button"
                className="btn-s danger"
                disabled={isPending}
                onClick={() => {
                  if (!window.confirm(`Delete member ${m.email} permanently?`)) return;
                  startTransition(async () => {
                    const res = await deleteMemberAccount(m.user_id);
                    if (res.success) {
                      showToast('Member deleted.');
                      await onRefresh();
                      onClose();
                    }
                  });
                }}
              >
                <Trash2 /> Delete Member
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// INTERACTIVE QUICK TOUR (`<QuickTour />`)
// ============================================================================
const TOUR_STEPS: Array<{
  view: AdminViewId;
  title: string;
  body: string;
}> = [
  {
    view: 'equipment',
    title: 'Equipment & 10-Day Stock Matrix',
    body: 'Real-time daily availability matrix for bikes, SUP boards, and parking. Online bookings and front-desk rentals draw from the exact same stock.',
  },
  {
    view: 'dashboard',
    title: 'Today at a Glance',
    body: 'Occupancy, arrivals, spa appointments, revenue, and open enquiries—with an interactive 14-day Bezier area chart and live activity feed.',
  },
  {
    view: 'occupancy',
    title: 'Interactive Occupancy Tape Chart',
    body: 'Every room unit on a horizontal timeline. Click any booking bar for details and itemized receipt, or right-click to check in or check out.',
  },
  {
    view: 'deposits',
    title: 'TradeSim Deposit Approvals (Supabase)',
    body: 'Verify and approve member QRIS & Bank top-ups atomically. Approving immediately credits the member wallet in Supabase PostgreSQL.',
  },
  {
    view: 'portfolios',
    title: 'Member Portfolio & Account Audit',
    body: 'Inspect every member’s Cash RDN, live stock holdings, total equity, and perform password resets or balance resets from a slide-over sheet.',
  },
];

function QuickTour({
  step,
  setStep,
  onNavigate,
  onClose,
}: {
  step: number;
  setStep: (n: number) => void;
  onNavigate: (v: AdminViewId) => void;
  onClose: () => void;
}) {
  const cur = TOUR_STEPS[step] || TOUR_STEPS[0];
  useEffect(() => {
    onNavigate(cur.view);
  }, [step, cur.view, onNavigate]);

  return (
    <div className="tour" role="dialog" aria-modal="true">
      <div className="tour-scrim" onClick={onClose} />
      <div
        className="tour-card"
        style={{ right: 24, bottom: 24 }}
      >
        <div className="tour-n">
          {step + 1} / {TOUR_STEPS.length}
        </div>
        <h2>{cur.title}</h2>
        <p>{cur.body}</p>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={onClose}>
            Close
          </button>
          <span>
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {step < TOUR_STEPS.length - 1 ? (
              <button
                type="button"
                className="tour-next"
                onClick={() => setStep(step + 1)}
              >
                Next
              </button>
            ) : (
              <button type="button" className="tour-next" onClick={onClose}>
                Done
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
