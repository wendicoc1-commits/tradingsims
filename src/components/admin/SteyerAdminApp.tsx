'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
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
import {
  TradingAdminState,
  MemberHoldingRow,
  TradingOrderRecord,
  AssetMatrixRow,
} from '@/lib/server/steyerAdminState';
import { useAdminAuth } from './AdminAuthGate';
import { useAuthStore } from '@/store/useAuthStore';

export type AdminViewId = 'dashboard' | 'equipment' | 'deposits' | 'portfolios' | 'orders';
type RoleId = 'manager' | 'treasury' | 'audit';
type LangId = 'id' | 'en';

interface RoleConfig {
  id: RoleId;
  label: string;
  title: string;
  user: string;
  views: AdminViewId[];
}

const ROLES: Record<RoleId, RoleConfig> = {
  manager: {
    id: 'manager',
    label: 'Head of Desk · Full access',
    title: 'Head of Trading Desk',
    user: 'Wendi Admin',
    views: ['dashboard', 'equipment', 'deposits', 'portfolios', 'orders'],
  },
  treasury: {
    id: 'treasury',
    label: 'Treasury · Deposits & RDN',
    title: 'Treasury & RDN Officer',
    user: 'Treasury Desk',
    views: ['dashboard', 'deposits', 'portfolios'],
  },
  audit: {
    id: 'audit',
    label: 'Risk & Audit · Portfolios',
    title: 'Portfolio Risk Auditor',
    user: 'Risk Control',
    views: ['dashboard', 'equipment', 'portfolios', 'orders'],
  },
};

function addDays(iso: string, n: number): string {
  const d = new Date((iso || new Date().toISOString().slice(0, 10)) + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDateShort(iso: string): string {
  if (!iso) return '—';
  const [, m, d] = iso.slice(0, 10).split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${Number(d)} ${months[Number(m) - 1] || m}`;
}

function fmtDateTime(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso.slice(0, 16);
  }
}

function fmtWeekday(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z');
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
}

function fmtIdr(n: number | undefined | null): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0));
}

function fmtIdrCompact(n: number | undefined | null): string {
  const val = Number(n) || 0;
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)}K`;
  return `${sign}Rp ${Math.round(abs)}`;
}

// ============================================================================
// Context Menu Component (Steyer Studio exact implementation)
// ============================================================================
interface ContextMenuItem {
  sep?: boolean;
  label?: string;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  header?: string;
  items: ContextMenuItem[];
}

function RenderContextMenu({
  menu,
  onClose,
}: {
  menu: ContextMenuState | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onScroll = () => onClose();
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [menu, onClose]);

  if (!menu) return null;
  const w = 230;
  const h = (menu.items?.length || 1) * 32 + 24;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const left = Math.min(menu.x, vw - w - 8);
  const top = Math.min(menu.y, vh - h - 8);

  return (
    <div ref={ref} className="ctx-menu" style={{ left, top }} onContextMenu={(e) => e.preventDefault()}>
      {menu.header && <div className="ctx-head">{menu.header}</div>}
      {menu.items.map((it, i) =>
        it.sep ? (
          <div key={i} className="ctx-sep" />
        ) : (
          <button
            key={i}
            type="button"
            disabled={it.disabled}
            className={`ctx-item ${it.danger ? 'danger' : ''}`}
            onClick={() => {
              onClose();
              it.onClick?.();
            }}
          >
            <span>{it.label}</span>
            {it.hint && <span className="ctx-hint">{it.hint}</span>}
          </button>
        )
      )}
    </div>
  );
}

// ============================================================================
// Reusable Steyer Studio DataTable Component
// ============================================================================
export interface DataTableColumn<T> {
  key: string;
  label: string;
  num?: boolean;
  sortable?: boolean;
  defaultHidden?: boolean;
  width?: string | number;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => any;
  sortValue?: (row: T) => any;
  filter?: {
    type: 'text' | 'select';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    match?: (row: T, filterVal: string) => boolean;
  };
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowActions,
  rowActionsHeader,
  defaultSort,
  defaultPageSize = 15,
  searchPlaceholder = 'Search…',
  emptyText = 'No matching entries',
  toolbarRight,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ContextMenuItem[];
  rowActionsHeader?: (row: T) => string;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  defaultPageSize?: number;
  searchPlaceholder?: string;
  emptyText?: string;
  toolbarRight?: React.ReactNode;
}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string | null; dir: 'asc' | 'desc' }>(
    defaultSort || { key: null, dir: 'asc' }
  );
  const [hidden, setHidden] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.filter((c) => c.defaultHidden).map((c) => [c.key, true]))
  );
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);
  const colBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (colBtnRef.current && !colBtnRef.current.contains(e.target as Node)) {
        setColMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [colMenuOpen]);

  const visibleCols = columns.filter((c) => !hidden[c.key]);
  const hasFilterRow = visibleCols.some((c) => c.filter);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q) {
        const hit = columns.some((c) => {
          const v = c.value ? c.value(r) : (r as any)[c.key];
          return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
        });
        if (!hit) return false;
      }
      for (const c of columns) {
        const fv = filters[c.key];
        if (fv === undefined || fv === '' || fv === 'all') continue;
        const v = c.value ? c.value(r) : (r as any)[c.key];
        if (c.filter?.type === 'select') {
          if (c.filter.match) {
            if (!c.filter.match(r, fv)) return false;
          } else if (String(v) !== String(fv)) {
            return false;
          }
        } else {
          if (!String(v ?? '').toLowerCase().includes(String(fv).toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [rows, search, filters, columns]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue ? col.sortValue(a) : col.value ? col.value(a) : (a as any)[col.key];
      const vb = col.sortValue ? col.sortValue(b) : col.value ? col.value(b) : (b as any)[col.key];
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * dir;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((curPage - 1) * pageSize, curPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, filters, pageSize]);

  const toggleSort = (k: string, sortable?: boolean) => {
    if (sortable === false) return;
    setSort((s) =>
      s.key === k
        ? s.dir === 'asc'
          ? { key: k, dir: 'desc' }
          : { key: null, dir: 'asc' }
        : { key: k, dir: 'asc' }
    );
  };

  const activeFilterCount =
    Object.values(filters).filter((v) => v && v !== 'all').length + (search ? 1 : 0);

  const openContext = (e: React.MouseEvent, r: T) => {
    if (!rowActions) return;
    e.preventDefault();
    e.stopPropagation();
    const items = rowActions(r) || [];
    if (!items.length) return;
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      header: rowActionsHeader ? rowActionsHeader(r) : undefined,
      items,
    });
  };

  const openDots = (e: React.MouseEvent, r: T) => {
    e.stopPropagation();
    if (!rowActions) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCtxMenu({
      x: rect.right - 200,
      y: rect.bottom + 4,
      header: rowActionsHeader ? rowActionsHeader(r) : undefined,
      items: rowActions(r) || [],
    });
  };

  return (
    <div className="dt">
      <div className="dt-bar">
        <div className="dt-search">
          <span className="dt-search-ico">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />
          {search && (
            <button type="button" className="dt-clear" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>
        <div className="dt-bar-right">
          {activeFilterCount > 0 && (
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => {
                setSearch('');
                setFilters({});
              }}
            >
              Reset filters ({activeFilterCount})
            </button>
          )}
          {rowActions && <span className="dt-hint">Right-click any row for actions</span>}
          <div className="dt-colwrap" ref={colBtnRef}>
            <button
              type="button"
              className="btn sm"
              onClick={() => setColMenuOpen((o) => !o)}
            >
              Columns ({visibleCols.length}/{columns.length}) ▾
            </button>
            {colMenuOpen && (
              <div className="menu-pop">
                <div className="ctx-head">Visible columns</div>
                {columns.map((c) => (
                  <label key={c.key} className="menu-check">
                    <input
                      type="checkbox"
                      checked={!hidden[c.key]}
                      disabled={!hidden[c.key] && visibleCols.length <= 2}
                      onChange={(e) =>
                        setHidden((h) => ({ ...h, [c.key]: !e.target.checked }))
                      }
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {toolbarRight}
        </div>
      </div>

      <div className="dt-scroll">
        <table className="tbl dt-tbl">
          <thead>
            <tr>
              {visibleCols.map((c) => {
                const isSorted = sort.key === c.key;
                const sortable = c.sortable !== false;
                return (
                  <th
                    key={c.key}
                    style={c.width ? { width: c.width } : undefined}
                    className={`${c.num ? 'num' : ''} ${sortable ? 'sortable' : ''} ${
                      isSorted ? 'sorted' : ''
                    }`}
                    onClick={() => toggleSort(c.key, c.sortable)}
                  >
                    <span className="th-in">
                      <span>{c.label}</span>
                      {sortable && (
                        <span className="sort-ind">
                          {isSorted ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
              {rowActions && <th style={{ width: 38 }} />}
            </tr>
            {hasFilterRow && (
              <tr className="dt-filter-row">
                {visibleCols.map((c) => (
                  <th key={c.key} className={c.num ? 'num' : ''}>
                    {c.filter?.type === 'text' && (
                      <input
                        className="dt-finput"
                        value={filters[c.key] || ''}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                        }
                        placeholder={c.filter.placeholder || 'Filter…'}
                      />
                    )}
                    {c.filter?.type === 'select' && (
                      <select
                        className="dt-finput"
                        value={filters[c.key] || 'all'}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                        }
                      >
                        <option value="all">{c.filter.placeholder || 'All'}</option>
                        {(c.filter.options || []).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </th>
                ))}
                {rowActions && <th />}
              </tr>
            )}
          </thead>
          <tbody>
            {pageRows.map((r, idx) => (
              <tr
                key={rowKey ? rowKey(r) : (r as any).id ?? idx}
                className={onRowClick || rowActions ? 'clickable' : ''}
                onClick={() => onRowClick && onRowClick(r)}
                onContextMenu={(e) => openContext(e, r)}
              >
                {visibleCols.map((c) => (
                  <td key={c.key} className={c.num ? 'num' : ''}>
                    {c.render
                      ? c.render(r)
                      : c.value
                      ? c.value(r)
                      : (r as any)[c.key]}
                  </td>
                ))}
                {rowActions && (
                  <td className="num" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="dots-btn"
                      onClick={(e) => openDots(e, r)}
                      title="Actions"
                    >
                      ⋯
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleCols.length + (rowActions ? 1 : 0)}
                  className="empty"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dt-foot">
        <div className="dt-count">
          Showing{' '}
          <strong>
            {sorted.length === 0 ? 0 : (curPage - 1) * pageSize + 1}–
            {Math.min(curPage * pageSize, sorted.length)}
          </strong>{' '}
          of <strong>{sorted.length}</strong>
          {sorted.length !== rows.length && (
            <span className="muted"> (filtered from {rows.length})</span>
          )}
        </div>
        <div className="dt-pager">
          <label className="dt-rpp">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[8, 15, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn sm"
            disabled={curPage <= 1}
            onClick={() => setPage(1)}
          >
            «
          </button>
          <button
            type="button"
            className="btn sm"
            disabled={curPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Prev
          </button>
          <span className="dt-page-ind">
            Page <strong>{curPage}</strong> / {totalPages}
          </span>
          <button
            type="button"
            className="btn sm"
            disabled={curPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next ›
          </button>
          <button
            type="button"
            className="btn sm"
            disabled={curPage >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            »
          </button>
        </div>
      </div>

      <RenderContextMenu menu={ctxMenu} onClose={() => setCtxMenu(null)} />
    </div>
  );
}

// ============================================================================
// Smooth Cubic-Bezier SVG AreaChart (Steyer Studio exact implementation)
// ============================================================================
interface AreaPoint {
  date: string;
  approvedIdr: number;
  pendingIdr: number;
  tradeVolumeIdr: number;
  total: number;
  txCount: number;
}

function AreaChart({ series, today }: { series: AreaPoint[]; today: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const padL = 54;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const iW = W - padL - padR;
  const iH = H - padT - padB;
  const maxVal = Math.max(10_000_000, ...series.map((p) => p.total)) * 1.12;
  const xAt = (i: number) => padL + (i / Math.max(1, series.length - 1)) * iW;
  const yAt = (v: number) => padT + iH - (v / maxVal) * iH;

  const smoothPath = (pts: [number, number][]) => {
    if (!pts.length) return '';
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(
        1
      )} ${y1.toFixed(1)}`;
    }
    return d;
  };

  const totalPts: [number, number][] = series.map((p, i) => [xAt(i), yAt(p.total)]);
  const depositPts: [number, number][] = series.map((p, i) => [xAt(i), yAt(p.approvedIdr)]);
  const totalLine = smoothPath(totalPts);
  const totalArea = `${totalLine} L ${xAt(series.length - 1).toFixed(1)} ${
    padT + iH
  } L ${xAt(0).toFixed(1)} ${padT + iH} Z`;
  const depositLine = smoothPath(depositPts);
  const depositArea = `${depositLine} L ${xAt(series.length - 1).toFixed(1)} ${
    padT + iH
  } L ${xAt(0).toFixed(1)} ${padT + iH} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxVal * t));
  const todayIdx = series.findIndex((p) => p.date === today);
  const hp = hover !== null ? series[hover] : null;

  return (
    <div className="area" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="area-svg">
        <defs>
          <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gDeposits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {ticks.map((v, idx) => {
          const y = yAt(v);
          return (
            <g key={idx}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke="var(--line)"
                strokeDasharray={idx === 0 ? undefined : '2 3'}
              />
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="var(--muted)"
                fontFamily="var(--mono)"
              >
                {fmtIdrCompact(v).replace('Rp ', '')}
              </text>
            </g>
          );
        })}

        <path d={totalArea} fill="url(#gTotal)" />
        <path d={depositArea} fill="url(#gDeposits)" />
        <path d={depositLine} fill="none" stroke="var(--green)" strokeWidth="1.6" strokeDasharray="3 2" />
        <path d={totalLine} fill="none" stroke="var(--accent)" strokeWidth="2.2" />

        {todayIdx >= 0 && (
          <g>
            <line
              x1={xAt(todayIdx)}
              x2={xAt(todayIdx)}
              y1={padT}
              y2={padT + iH}
              stroke="var(--accent)"
              strokeOpacity="0.45"
              strokeDasharray="3 3"
            />
            <text
              x={xAt(todayIdx)}
              y={padT - 4}
              textAnchor="middle"
              fontSize="9.5"
              fill="var(--accent)"
              fontFamily="var(--mono)"
            >
              TODAY
            </text>
          </g>
        )}

        {series.map((p, i) => {
          const x = xAt(i);
          const y = yAt(p.total);
          const isH = hover === i;
          return (
            <g key={p.date}>
              {(i % 2 === 0 || i === series.length - 1) && (
                <text
                  x={x}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill={p.date === today ? 'var(--accent)' : 'var(--muted)'}
                  fontFamily="var(--mono)"
                >
                  {fmtDateShort(p.date)}
                </text>
              )}
              {isH && (
                <line
                  x1={x}
                  x2={x}
                  y1={padT}
                  y2={padT + iH}
                  stroke="var(--ink2)"
                  strokeOpacity="0.5"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isH ? 4.5 : 2.5}
                fill={isH ? 'var(--accent)' : 'var(--panel)'}
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <rect
                x={x - iW / series.length / 2}
                y={padT}
                width={iW / series.length}
                height={iH}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHover(i)}
              />
            </g>
          );
        })}
      </svg>

      <div className="area-foot">
        <div className="area-legend">
          <span>
            <i className="sw" style={{ background: 'var(--accent)' }} /> Total Desk Volume (Deposits + Trades)
          </span>
          <span>
            <i className="sw" style={{ background: 'var(--green)' }} /> Approved RDN Deposits
          </span>
        </div>
        {hp ? (
          <div className="area-tip">
            <span className="mono">{fmtDateShort(hp.date)}</span>
            <span>
              Total <strong>{fmtIdr(hp.total)}</strong>
            </span>
            <span className="muted">Deposits {fmtIdrCompact(hp.approvedIdr)}</span>
            <span className="muted">Trades {fmtIdrCompact(hp.tradeVolumeIdr)}</span>
            <span className="muted">· {hp.txCount} tx</span>
          </div>
        ) : (
          <div className="area-tip muted">Hover any day for desk breakdown</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 1. DASHBOARD VIEW — Executive Trading Desk Overview (100% Real Trading Data)
// ============================================================================
function DashboardView({
  state,
  onNav,
  onSelectDeposit,
  onSelectMember,
  onRefresh,
  showToast,
}: {
  state: TradingAdminState;
  onNav: (v: AdminViewId) => void;
  onSelectDeposit: (d: DepositRecord) => void;
  onSelectMember: (m: MemberPortfolioItem) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const { today, deposits, members, holdingsFlat, orders } = state;
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingDeposits = useMemo(
    () => deposits.filter((d) => d.status === 'PENDING'),
    [deposits]
  );
  const approvedDeposits = useMemo(
    () => deposits.filter((d) => d.status === 'APPROVED'),
    [deposits]
  );

  const totalCashRdn = useMemo(
    () => members.reduce((sum, m) => sum + (Number(m.cash) || 0), 0),
    [members]
  );
  const totalMarketValue = useMemo(
    () => members.reduce((sum, m) => sum + (Number(m.totalMarketValue) || 0), 0),
    [members]
  );
  const totalNetWorthAum = useMemo(
    () => members.reduce((sum, m) => sum + (Number(m.totalAssetValue) || 0), 0),
    [members]
  );
  const totalApprovedVolume = useMemo(
    () => approvedDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
    [approvedDeposits]
  );
  const totalUnrealizedPL = useMemo(
    () => holdingsFlat.reduce((sum, h) => sum + (Number(h.unrealizedPLIdr) || 0), 0),
    [holdingsFlat]
  );
  const activeTradersCount = useMemo(
    () => members.filter((m) => (m.holdings?.length || 0) > 0 || m.cash > 0).length,
    [members]
  );

  // Build 14-day series from real deposits & orders
  const series: AreaPoint[] = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
    return days.map((d) => {
      const dayDeps = deposits.filter(
        (x) => String(x.created_at || '').slice(0, 10) === d
      );
      const approvedIdr = dayDeps
        .filter((x) => x.status === 'APPROVED')
        .reduce((s, x) => s + (Number(x.amount) || 0), 0);
      const pendingIdr = dayDeps
        .filter((x) => x.status === 'PENDING')
        .reduce((s, x) => s + (Number(x.amount) || 0), 0);

      const dayOrders = orders.filter(
        (o) =>
          o.type !== 'DEPOSIT' &&
          String(o.createdAt || '').slice(0, 10) === d
      );
      const tradeVolumeIdr = dayOrders.reduce(
        (s, o) => s + (Number(o.total) || Number(o.price) * Math.max(1, Number(o.shares) || 0)),
        0
      );

      return {
        date: d,
        approvedIdr,
        pendingIdr,
        tradeVolumeIdr,
        total: approvedIdr + pendingIdr + tradeVolumeIdr,
        txCount: dayDeps.length + dayOrders.length,
      };
    });
  }, [today, deposits, orders]);

  const recentFeed = useMemo(() => {
    const items: Array<{
      id: string;
      kind: 'DEPOSIT' | 'ORDER';
      title: string;
      sub: string;
      status: string;
      amount: number;
      created_at: string;
      onClick: () => void;
    }> = [];

    for (const d of deposits.slice(0, 8)) {
      items.push({
        id: `dep-${d.id}`,
        kind: 'DEPOSIT',
        title: d.user?.full_name || d.user?.email || 'Member',
        sub: `Top Up RDN · ${d.payment_method}`,
        status: d.status.toLowerCase(),
        amount: Number(d.amount) || 0,
        created_at: d.created_at,
        onClick: () => onSelectDeposit(d),
      });
    }

    for (const o of orders.filter((x) => x.type !== 'DEPOSIT').slice(0, 8)) {
      const m = members.find(
        (mem) => mem.user_id === o.user_id || mem.email.toLowerCase() === o.user_email.toLowerCase()
      );
      items.push({
        id: `ord-${o.id}`,
        kind: 'ORDER',
        title: o.user_name,
        sub: `${o.type} ${o.displaySymbol} · ${o.lots > 0 ? `${o.lots} lot` : `${o.shares} unit`}`,
        status: o.status.toLowerCase(),
        amount: Number(o.total) || 0,
        created_at: o.createdAt,
        onClick: () => m && onSelectMember(m),
      });
    }

    return items
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 6);
  }, [deposits, orders, members, onSelectDeposit, onSelectMember]);

  const handleQuickApprove = async (id: string) => {
    setBusyId(id);
    try {
      const res = await approveDeposit(id);
      if (res.success) {
        showToast(res.message || 'Deposit disetujui!');
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menyetujui deposit', true);
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack">
      <div className="kpis kpis-6">
        <div className="kpi clickable" onClick={() => onNav('portfolios')}>
          <div className="kpi-label">Registered Members</div>
          <div className="kpi-val">{members.length}</div>
          <div className="kpi-bar">
            <div
              style={{
                width: `${members.length ? Math.round((activeTradersCount / members.length) * 100) : 100}%`,
              }}
            />
          </div>
          <div className="kpi-sub">{activeTradersCount} active accounts with equity</div>
        </div>

        <div className="kpi clickable" onClick={() => onNav('portfolios')}>
          <div className="kpi-label">Total Cash RDN</div>
          <div className="kpi-val">{fmtIdrCompact(totalCashRdn)}</div>
          <div className="kpi-sub">{fmtIdr(totalCashRdn)} across wallets</div>
        </div>

        <div className="kpi clickable" onClick={() => onNav('portfolios')}>
          <div className="kpi-label">Total Portfolio AUM</div>
          <div className="kpi-val">{fmtIdrCompact(totalNetWorthAum)}</div>
          <div className="kpi-sub">
            Cash + {fmtIdrCompact(totalMarketValue)} market assets
          </div>
        </div>

        <div className="kpi clickable" onClick={() => onNav('deposits')}>
          <div className="kpi-label">Pending Deposits</div>
          <div
            className="kpi-val"
            style={{ color: pendingDeposits.length > 0 ? 'var(--amber)' : undefined }}
          >
            {pendingDeposits.length}
          </div>
          <div className="kpi-sub">
            {pendingDeposits.length > 0
              ? 'Waiting for admin verification'
              : 'All deposit queues cleared'}
          </div>
        </div>

        <div className="kpi clickable" onClick={() => onNav('deposits')}>
          <div className="kpi-label">Approved Top-Up Vol.</div>
          <div className="kpi-val" style={{ color: 'var(--green)' }}>
            {fmtIdrCompact(totalApprovedVolume)}
          </div>
          <div className="kpi-sub">{approvedDeposits.length} approved transactions</div>
        </div>

        <div className="kpi clickable" onClick={() => onNav('equipment')}>
          <div className="kpi-label">Open Asset Positions</div>
          <div className="kpi-val">{holdingsFlat.length}</div>
          <div className="kpi-sub">
            Net P/L:{' '}
            <span style={{ color: totalUnrealizedPL >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {totalUnrealizedPL >= 0 ? '+' : ''}
              {fmtIdrCompact(totalUnrealizedPL)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid-main">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Desk Liquidity & Activity · 14-day window</div>
              <h3>Deposits & Trading Flow</h3>
            </div>
            <div className="big-num">
              {fmtIdrCompact(series.reduce((s, p) => s + p.total, 0))}
              <span className="muted"> / 14d</span>
            </div>
          </div>
          <AreaChart series={series} today={today} />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Live Stream · Supabase Cloud</div>
              <h3>Just in</h3>
            </div>
            <span className="live-dot">LIVE</span>
          </div>
          <div className="feed">
            {recentFeed.map((b) => (
              <div
                key={b.id}
                className="feed-row clickable"
                onClick={b.onClick}
              >
                <span className={`tag tag-${b.kind.toLowerCase()}`}>{b.kind}</span>
                <div className="feed-main">
                  <div className="feed-title">
                    {b.title} <span className="muted">· {b.sub}</span>
                  </div>
                  <div className="feed-sub">
                    {fmtDateTime(b.created_at)} · <StatusPill status={b.status} />
                  </div>
                </div>
                <div className="feed-amt">{fmtIdrCompact(b.amount)}</div>
              </div>
            ))}
            {recentFeed.length === 0 && (
              <div className="empty">Belum ada aktivitas deposit atau order terbaru.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Treasury Action Queue</div>
              <h3>Pending Deposit Approvals ({pendingDeposits.length})</h3>
            </div>
            <button type="button" className="link" onClick={() => onNav('deposits')}>
              Open deposit queue →
            </button>
          </div>
          <table className="tbl compact">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Member</th>
                <th>Method</th>
                <th className="num">Amount (IDR)</th>
                <th className="num">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingDeposits.slice(0, 6).map((d) => (
                <tr key={d.id} className="clickable" onClick={() => onSelectDeposit(d)}>
                  <td className="mono muted">#{d.id.slice(0, 8)}</td>
                  <td>
                    <strong>{d.user?.full_name || 'Member'}</strong>
                    <div className="muted small mono">{d.user?.email || d.user_id}</div>
                  </td>
                  <td>
                    <span className="tag">{d.payment_method}</span>
                  </td>
                  <td className="num mono" style={{ color: 'var(--green)' }}>
                    <strong>{fmtIdr(d.amount)}</strong>
                  </td>
                  <td className="num" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn sm primary"
                      disabled={busyId === d.id}
                      onClick={() => handleQuickApprove(d.id)}
                    >
                      {busyId === d.id ? '...' : '✓ Approve'}
                    </button>
                  </td>
                </tr>
              ))}
              {pendingDeposits.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    Tidak ada antrean deposit PENDING saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow">Account Equity Leaderboard</div>
              <h3>Top Member Portfolios ({members.length})</h3>
            </div>
            <button type="button" className="link" onClick={() => onNav('portfolios')}>
              All member portfolios →
            </button>
          </div>
          <table className="tbl compact">
            <thead>
              <tr>
                <th>Member</th>
                <th className="num">Cash RDN</th>
                <th className="num">Assets</th>
                <th className="num">Total Net Worth</th>
              </tr>
            </thead>
            <tbody>
              {[...members]
                .sort((a, b) => b.totalAssetValue - a.totalAssetValue)
                .slice(0, 6)
                .map((m) => (
                  <tr
                    key={m.user_id}
                    className="clickable"
                    onClick={() => onSelectMember(m)}
                  >
                    <td>
                      <strong>{m.full_name}</strong>
                      <div className="muted small mono">{m.email}</div>
                    </td>
                    <td className="num mono" style={{ color: 'var(--green)' }}>
                      {fmtIdrCompact(m.cash)}
                    </td>
                    <td className="num mono">
                      {m.holdings.length} pos · {fmtIdrCompact(m.totalMarketValue)}
                    </td>
                    <td className="num mono">
                      <strong>{fmtIdrCompact(m.totalAssetValue)}</strong>
                    </td>
                  </tr>
                ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    Belum ada data portofolio member.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. EQUIPMENT / ASSETS MATRIX VIEW (?view=equipment) — 100% Real Trading Assets!
// ============================================================================
function EquipmentAssetsView({
  state,
  onSelectMember,
  onRefresh,
  showToast,
}: {
  state: TradingAdminState;
  onSelectMember: (m: MemberPortfolioItem) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const { today, assetMatrix, holdingsFlat, members } = state;
  const [newOpen, setNewOpen] = useState(false);
  const [simUserId, setSimUserId] = useState(members[0]?.user_id || '');
  const [simAmount, setSimAmount] = useState('50000000');
  const [simMethod, setSimMethod] = useState('QRIS');
  const [busy, setBusy] = useState(false);

  // 10-day window ending today (real trading activity history)
  const days = useMemo(
    () => Array.from({ length: 10 }, (_, i) => addDays(today, -(9 - i))),
    [today]
  );

  const handleCreateTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUserId.trim()) {
      showToast('Pilih atau masukkan User ID / Email member', true);
      return;
    }
    const amt = Number(simAmount);
    if (!amt || amt <= 0) {
      showToast('Masukkan nominal deposit yang valid', true);
      return;
    }
    setBusy(true);
    try {
      const res = await createDepositRequest(simUserId.trim(), amt, simMethod);
      if (res.success) {
        showToast('Tiket deposit baru berhasil dibuat!');
        setNewOpen(false);
        onRefresh();
      } else {
        showToast(res.error || 'Gagal membuat tiket deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const holdingColumns: DataTableColumn<MemberHoldingRow>[] = [
    {
      key: 'id',
      label: 'Pos ID',
      width: 90,
      defaultHidden: true,
      value: (r) => r.id,
      render: (r) => <span className="mono muted">{r.id.slice(0, 10)}</span>,
    },
    {
      key: 'displaySymbol',
      label: 'Ticker / Asset',
      value: (r) => `${r.displaySymbol} ${r.name}`,
      render: (r) => (
        <div>
          <strong className="mono">{r.displaySymbol}</strong>
          <div className="muted small">{r.name}</div>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Ticker / name…' },
    },
    {
      key: 'category',
      label: 'Market',
      width: 105,
      value: (r) => r.category,
      render: (r) => <span className="tag">{r.category}</span>,
      filter: {
        type: 'select',
        placeholder: 'All markets',
        options: [
          { value: 'IDX', label: 'IDX Saham' },
          { value: 'CRYPTO', label: 'Crypto' },
          { value: 'US', label: 'US Stocks' },
        ],
      },
    },
    {
      key: 'user_name',
      label: 'Member Holder',
      value: (r) => `${r.user_name} ${r.user_email}`,
      render: (r) => (
        <div>
          <strong>{r.user_name}</strong>
          <div className="muted small mono">{r.user_email}</div>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Member…' },
    },
    {
      key: 'shares',
      label: 'Quantity / Lots',
      num: true,
      width: 135,
      value: (r) => r.shares,
      render: (r) => (
        <span className="mono">
          {r.category === 'IDX'
            ? `${r.lots.toLocaleString('id-ID')} lot (${r.shares.toLocaleString('id-ID')} lbr)`
            : `${r.shares.toLocaleString('id-ID')} unit`}
        </span>
      ),
    },
    {
      key: 'avgPrice',
      label: 'Avg Buy Price',
      num: true,
      width: 130,
      value: (r) => r.avgPrice,
      render: (r) => (
        <span className="mono muted">
          {r.currency === 'USD'
            ? `$${r.avgPrice.toLocaleString('en-US')}`
            : fmtIdr(r.avgPrice)}
        </span>
      ),
    },
    {
      key: 'currentPrice',
      label: 'Market Price',
      num: true,
      width: 130,
      value: (r) => r.currentPrice,
      render: (r) => (
        <span className="mono">
          {r.currency === 'USD'
            ? `$${r.currentPrice.toLocaleString('en-US')}`
            : fmtIdr(r.currentPrice)}
        </span>
      ),
    },
    {
      key: 'marketValueIdr',
      label: 'Market Value (IDR)',
      num: true,
      width: 155,
      value: (r) => r.marketValueIdr,
      render: (r) => <strong className="mono">{fmtIdr(r.marketValueIdr)}</strong>,
    },
    {
      key: 'unrealizedPLIdr',
      label: 'Unrealized P/L',
      num: true,
      width: 165,
      value: (r) => r.unrealizedPLIdr,
      render: (r) => (
        <div
          className="mono"
          style={{ color: r.unrealizedPLIdr >= 0 ? 'var(--green)' : 'var(--red)' }}
        >
          <strong>
            {r.unrealizedPLIdr >= 0 ? '+' : ''}
            {fmtIdr(r.unrealizedPLIdr)}
          </strong>
          <div className="small">
            ({r.unrealizedPLIdr >= 0 ? '+' : ''}
            {r.unrealizedPLPercent}%)
          </div>
        </div>
      ),
      filter: {
        type: 'select',
        placeholder: 'All P/L',
        options: [
          { value: 'PROFIT', label: 'In Profit (+)' },
          { value: 'LOSS', label: 'In Loss (-)' },
        ],
        match: (r, fv) => (fv === 'PROFIT' ? r.unrealizedPLIdr >= 0 : r.unrealizedPLIdr < 0),
      },
    },
  ];

  const holdingRowActions = (r: MemberHoldingRow): ContextMenuItem[] => {
    const member = members.find((m) => m.user_id === r.user_id);
    return [
      {
        label: 'Inspect member portfolio',
        hint: r.user_name,
        onClick: () => member && onSelectMember(member),
      },
      { sep: true },
      {
        label: 'Reset member account to Rp 0',
        danger: true,
        onClick: async () => {
          if (!confirm(`Reset akun ${r.user_name} (${r.user_email}) ke Rp 0 dan kosongkan aset?`))
            return;
          const res = await resetMemberAccountToZero(r.user_id);
          if (res.success) {
            showToast(res.message || 'Akun berhasil direset ke Rp 0');
            onRefresh();
          } else {
            showToast(res.error || 'Gagal mereset akun', true);
          }
        },
      },
    ];
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Asset Allocation & Liquidity · 10-day window</div>
            <h3>Member Stock & Crypto Holdings Matrix</h3>
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={() => setNewOpen((v) => !v)}
          >
            {newOpen ? 'Close' : '+ New RDN Deposit'}
          </button>
        </div>

        {newOpen && (
          <form className="inline-form" onSubmit={handleCreateTopup}>
            <select
              value={simUserId}
              onChange={(e) => setSimUserId(e.target.value)}
            >
              <option value="">— Pilih Member —</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.full_name} ({m.email})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              placeholder="Nominal IDR (e.g. 50000000)"
              style={{ width: 170 }}
            />
            <select value={simMethod} onChange={(e) => setSimMethod(e.target.value)}>
              <option value="QRIS">QRIS</option>
              <option value="BCA_VA">BCA Virtual Account</option>
              <option value="MANDIRI_VA">Mandiri VA</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Deposit Ticket'}
            </button>
          </form>
        )}

        <div className="matrix-wrap">
          <table className="tbl matrix">
            <thead>
              <tr>
                <th>Instrument / Ticker</th>
                <th>Market</th>
                <th className="num">Last Price</th>
                <th className="num">Holders</th>
                <th className="num">Total Exposure</th>
                {days.map((d) => (
                  <th key={d} className={`num ${d === today ? 'today' : ''}`}>
                    <div className="mono">{fmtWeekday(d)}</div>
                    <div className="mono muted">{d.slice(8, 10)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assetMatrix.map((asset: AssetMatrixRow) => (
                <tr key={asset.displaySymbol}>
                  <td>
                    <strong className="mono">{asset.displaySymbol}</strong>
                    <span className="muted small"> · {asset.name}</span>
                  </td>
                  <td>
                    <span className="tag">{asset.category}</span>
                  </td>
                  <td className="num mono">
                    {asset.currency === 'USD'
                      ? `$${asset.currentPrice.toLocaleString('en-US')}`
                      : fmtIdr(asset.currentPrice)}
                  </td>
                  <td className="num mono">
                    <strong>{asset.holdersCount}</strong> member
                  </td>
                  <td className="num mono">
                    <strong>{fmtIdrCompact(asset.totalMarketValueIdr)}</strong>
                  </td>
                  {days.map((d) => {
                    const act = asset.dailyActivity[d];
                    const ordersCount = act?.orders || 0;
                    const cls =
                      ordersCount > 0
                        ? 'ok'
                        : asset.holdersCount > 0
                        ? 'low'
                        : 'empty';
                    return (
                      <td
                        key={d}
                        className={`num mono mcell ${cls}`}
                        title={`${asset.displaySymbol} on ${d}: ${asset.holdersCount} active holders, ${ordersCount} orders executed`}
                      >
                        {ordersCount > 0
                          ? `${ordersCount} tx`
                          : `${asset.holdersCount}h`}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {assetMatrix.length === 0 && (
                <tr>
                  <td colSpan={15} className="empty">
                    Belum ada posisi saham atau crypto aktif yang dipegang oleh member saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Live Supabase Holdings Registry</div>
            <h3>All Active Member Positions ({holdingsFlat.length})</h3>
          </div>
          <button type="button" className="btn sm" onClick={onRefresh}>
            ↻ Refresh Positions
          </button>
        </div>
        <DataTable
          columns={holdingColumns}
          rows={holdingsFlat}
          rowKey={(r) => r.id}
          onRowClick={(r) => {
            const m = members.find((mem) => mem.user_id === r.user_id);
            if (m) onSelectMember(m);
          }}
          rowActions={holdingRowActions}
          rowActionsHeader={(r) => `${r.displaySymbol} · ${r.user_name}`}
          defaultSort={{ key: 'marketValueIdr', dir: 'desc' }}
          searchPlaceholder="Search ticker, stock name, member name, email…"
          emptyText="No active stock or crypto positions found across member portfolios"
        />
      </div>
    </div>
  );
}

// ============================================================================
// 3. DEPOSITS VIEW (?view=deposits) — Live Supabase Deposit Approvals
// ============================================================================
function DepositsView({
  deposits,
  members,
  onSelectDeposit,
  onRefresh,
  showToast,
}: {
  deposits: DepositRecord[];
  members: MemberPortfolioItem[];
  onSelectDeposit: (d: DepositRecord) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const [newOpen, setNewOpen] = useState(false);
  const [simUserId, setSimUserId] = useState('');
  const [simAmount, setSimAmount] = useState('50000000');
  const [simMethod, setSimMethod] = useState('QRIS');
  const [busy, setBusy] = useState(false);

  const handleApprove = async (d: DepositRecord) => {
    setBusy(true);
    try {
      const res = await approveDeposit(d.id);
      if (res.success) {
        showToast(res.message || 'Deposit berhasil disetujui!');
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menyetujui deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (d: DepositRecord) => {
    const reason = window.prompt(
      'Masukkan alasan penolakan deposit:',
      'Bukti transfer tidak valid atau dana belum masuk'
    );
    if (reason === null) return;
    setBusy(true);
    try {
      const res = await rejectDeposit(d.id, reason);
      if (res.success) {
        showToast(res.message || 'Deposit berhasil ditolak.');
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menolak deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCreateSim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUserId.trim()) {
      showToast('Pilih atau masukkan User ID member', true);
      return;
    }
    const amt = Number(simAmount);
    if (!amt || amt <= 0) {
      showToast('Masukkan nominal yang valid', true);
      return;
    }
    setBusy(true);
    try {
      const res = await createDepositRequest(simUserId.trim(), amt, simMethod);
      if (res.success) {
        showToast('Tiket deposit berhasil dibuat!');
        setNewOpen(false);
        onRefresh();
      } else {
        showToast(res.error || 'Gagal membuat tiket deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const approvedCount = deposits.filter((d) => d.status === 'APPROVED').length;
  const totalApprovedVol = deposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const columns: DataTableColumn<DepositRecord>[] = [
    {
      key: 'id',
      label: 'Ticket ID',
      width: 110,
      value: (r) => r.id,
      render: (r) => <span className="mono muted">#{r.id.slice(0, 8)}</span>,
      filter: { type: 'text', placeholder: 'ID…' },
    },
    {
      key: 'member',
      label: 'Member',
      value: (r) => `${r.user?.full_name || 'Member'} ${r.user?.email || r.user_id}`,
      render: (r) => (
        <div>
          <strong>{r.user?.full_name || 'Member'}</strong>
          <div className="muted small mono">{r.user?.email || r.user_id}</div>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Name / email…' },
    },
    {
      key: 'amount',
      label: 'Nominal (IDR)',
      num: true,
      width: 165,
      value: (r) => Number(r.amount) || 0,
      render: (r) => (
        <strong className="mono" style={{ color: 'var(--green)' }}>
          {fmtIdr(r.amount)}
        </strong>
      ),
    },
    {
      key: 'payment_method',
      label: 'Method',
      width: 130,
      value: (r) => r.payment_method,
      render: (r) => <span className="tag">{r.payment_method}</span>,
      filter: { type: 'text', placeholder: 'Method…' },
    },
    {
      key: 'created_at',
      label: 'Created At',
      width: 150,
      value: (r) => r.created_at,
      render: (r) => <span className="mono muted">{fmtDateTime(r.created_at)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: 130,
      value: (r) => r.status,
      render: (r) => <StatusPill status={r.status.toLowerCase()} />,
      filter: {
        type: 'select',
        placeholder: 'All statuses',
        options: [
          { value: 'PENDING', label: 'PENDING' },
          { value: 'APPROVED', label: 'APPROVED' },
          { value: 'REJECTED', label: 'REJECTED' },
        ],
      },
    },
  ];

  const rowActions = (r: DepositRecord): ContextMenuItem[] => [
    {
      label: 'Inspect deposit ticket',
      hint: 'Enter',
      onClick: () => onSelectDeposit(r),
    },
    { sep: true },
    {
      label: 'Approve deposit (ACID RPC)',
      disabled: r.status !== 'PENDING' || busy,
      onClick: () => handleApprove(r),
    },
    {
      label: 'Reject deposit…',
      danger: true,
      disabled: r.status !== 'PENDING' || busy,
      onClick: () => handleReject(r),
    },
  ];

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Antrean Menunggu (PENDING)</div>
          <div className="kpi-val" style={{ color: pendingCount > 0 ? 'var(--amber)' : undefined }}>
            {pendingCount}
          </div>
          <div className="kpi-sub">Perlu tindakan verifikasi admin</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Berhasil Disetujui</div>
          <div className="kpi-val" style={{ color: 'var(--green)' }}>
            {approvedCount}
          </div>
          <div className="kpi-sub">Saldo langsung ditambahkan ke wallet RDN</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Volume Deposit Disetujui</div>
          <div className="kpi-val">{fmtIdrCompact(totalApprovedVol)}</div>
          <div className="kpi-sub">{fmtIdr(totalApprovedVol)} tersalurkan</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Supabase Cloud · Atomic PostgreSQL RPC</div>
            <h3>Antrean Verifikasi & Approval Deposit ({deposits.length})</h3>
          </div>
          <div className="row-gap">
            <button
              type="button"
              className="btn sm"
              onClick={() => setNewOpen((v) => !v)}
            >
              {newOpen ? 'Close' : '+ Buat Tiket Deposit'}
            </button>
            <button type="button" className="btn sm primary" onClick={onRefresh}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {newOpen && (
          <form className="inline-form" onSubmit={handleCreateSim}>
            <select
              value={simUserId}
              onChange={(e) => setSimUserId(e.target.value)}
            >
              <option value="">— Pilih Member —</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.full_name} ({m.email})
                </option>
              ))}
            </select>
            <input
              value={simUserId}
              onChange={(e) => setSimUserId(e.target.value)}
              placeholder="Atau ketik User ID / Email"
              style={{ width: 200 }}
            />
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              placeholder="Nominal IDR"
              style={{ width: 160 }}
            />
            <select value={simMethod} onChange={(e) => setSimMethod(e.target.value)}>
              <option value="QRIS">QRIS</option>
              <option value="BCA_VA">BCA VA</option>
              <option value="MANDIRI_VA">Mandiri VA</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
            <button type="submit" className="btn primary" disabled={busy}>
              Kirim Tiket Deposit
            </button>
          </form>
        )}

        <DataTable
          columns={columns}
          rows={deposits}
          onRowClick={onSelectDeposit}
          rowActions={rowActions}
          rowActionsHeader={(r) =>
            `Ticket #${r.id.slice(0, 8)} · ${r.user?.full_name || 'Member'}`
          }
          defaultSort={{ key: 'created_at', dir: 'desc' }}
          searchPlaceholder="Cari ID tiket, nama member, email, metode…"
          emptyText="Tidak ada data permohonan deposit."
        />
      </div>
    </div>
  );
}

// ============================================================================
// 4. PORTFOLIOS VIEW (?view=portfolios) — Live Supabase Member Portfolios
// ============================================================================
function PortfoliosView({
  members,
  onSelectMember,
  onRefresh,
  showToast,
}: {
  members: MemberPortfolioItem[];
  onSelectMember: (m: MemberPortfolioItem) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const totalCash = members.reduce((s, m) => s + (Number(m.cash) || 0), 0);
  const totalNetWorth = members.reduce((s, m) => s + (Number(m.totalAssetValue) || 0), 0);

  const handleSyncMyAccount = async () => {
    setBusy(true);
    try {
      await useAuthStore.getState().syncPortfolioToDatabase();
      showToast('Portofolio akun Anda berhasil disinkronkan ke Supabase!');
      onRefresh();
    } catch {
      showToast('Gagal menyinkronkan akun', true);
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (m: MemberPortfolioItem) => {
    const newPass = window.prompt(
      `Masukkan password baru untuk ${m.full_name} (${m.email}) [min. 6 karakter]:`
    );
    if (!newPass) return;
    if (newPass.length < 6) {
      showToast('Password minimal 6 karakter', true);
      return;
    }
    setBusy(true);
    try {
      const res = await resetMemberPassword(m.user_id, newPass);
      if (res.success) {
        showToast(res.message || 'Password berhasil direset!');
      } else {
        showToast(res.error || 'Gagal mereset password', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResetZero = async (m: MemberPortfolioItem) => {
    if (
      !window.confirm(
        `Reset akun ${m.full_name} (${m.email}) ke Rp 0 dan kosongkan seluruh kepemilikan saham/crypto?`
      )
    )
      return;
    setBusy(true);
    try {
      const res = await resetMemberAccountToZero(m.user_id);
      if (res.success) {
        showToast(res.message || 'Akun berhasil direset ke Rp 0!');
        onRefresh();
      } else {
        showToast(res.error || 'Gagal mereset akun ke 0', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteMember = async (m: MemberPortfolioItem) => {
    if (m.role === 'admin') {
      showToast('Akun Administrator tidak dapat dihapus.', true);
      return;
    }
    if (
      !window.confirm(
        `PERINGATAN PERMANEN: Hapus akun ${m.full_name} (${m.email}) beserta seluruh portofolio & riwayat depositnya?`
      )
    )
      return;
    setBusy(true);
    try {
      const res = await deleteMemberAccount(m.user_id);
      if (res.success) {
        showToast(res.message || 'Akun member dihapus permanen!');
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menghapus akun', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<MemberPortfolioItem>[] = [
    {
      key: 'user_id',
      label: 'User ID',
      width: 120,
      defaultHidden: true,
      value: (r) => r.user_id,
      render: (r) => <span className="mono muted">{r.user_id}</span>,
    },
    {
      key: 'full_name',
      label: 'Member & Email',
      value: (r) => `${r.full_name} ${r.email} ${r.user_id}`,
      render: (r) => (
        <div>
          <strong>{r.full_name}</strong>
          <div className="muted small mono">{r.email}</div>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Name / email…' },
    },
    {
      key: 'role',
      label: 'Role',
      width: 95,
      value: (r) => r.role,
      render: (r) => <span className="tag">{r.role.toUpperCase()}</span>,
      filter: {
        type: 'select',
        placeholder: 'All roles',
        options: [
          { value: 'member', label: 'Member' },
          { value: 'admin', label: 'Admin' },
        ],
      },
    },
    {
      key: 'cash',
      label: 'Cash Balance (Wallet)',
      num: true,
      width: 165,
      value: (r) => Number(r.cash) || 0,
      render: (r) => (
        <strong className="mono" style={{ color: 'var(--green)' }}>
          {fmtIdr(r.cash)}
        </strong>
      ),
    },
    {
      key: 'realized_pl',
      label: 'Realized P/L',
      num: true,
      width: 145,
      value: (r) => Number(r.realized_pl) || 0,
      render: (r) => (
        <span
          className="mono"
          style={{ color: r.realized_pl >= 0 ? 'var(--green)' : 'var(--red)' }}
        >
          {r.realized_pl >= 0 ? '+' : ''}
          {fmtIdr(r.realized_pl)}
        </span>
      ),
    },
    {
      key: 'totalMarketValue',
      label: 'Assets Market Value',
      num: true,
      width: 165,
      value: (r) => Number(r.totalMarketValue) || 0,
      render: (r) => (
        <div>
          <span className="mono">{fmtIdr(r.totalMarketValue)}</span>
          <div className="muted small">{r.holdings.length} emiten dimiliki</div>
        </div>
      ),
    },
    {
      key: 'totalAssetValue',
      label: 'Total Net Worth',
      num: true,
      width: 170,
      value: (r) => Number(r.totalAssetValue) || 0,
      render: (r) => <strong className="mono">{fmtIdr(r.totalAssetValue)}</strong>,
    },
  ];

  const rowActions = (r: MemberPortfolioItem): ContextMenuItem[] => [
    {
      label: 'Inspect portfolio holdings',
      hint: 'Enter',
      onClick: () => onSelectMember(r),
    },
    { sep: true },
    {
      label: 'Force reset password…',
      disabled: busy,
      onClick: () => handleResetPassword(r),
    },
    {
      label: 'Reset account to Rp 0',
      disabled: busy,
      onClick: () => handleResetZero(r),
    },
    { sep: true },
    {
      label: 'Delete member account permanently',
      danger: true,
      disabled: busy || r.role === 'admin',
      onClick: () => handleDeleteMember(r),
    },
  ];

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Total Member Terdaftar</div>
          <div className="kpi-val">{members.length}</div>
          <div className="kpi-sub">Pengguna aktif di platform</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Cash Balance (Wallet)</div>
          <div className="kpi-val" style={{ color: 'var(--green)' }}>
            {fmtIdrCompact(totalCash)}
          </div>
          <div className="kpi-sub">{fmtIdr(totalCash)} kas mengendap</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Estimasi Net Worth Aset</div>
          <div className="kpi-val">{fmtIdrCompact(totalNetWorth)}</div>
          <div className="kpi-sub">Cash + Market Value Saham/Crypto</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Supabase Cloud · Portfolio & Account Control</div>
            <h3>Monitoring Portofolio & Manajemen Member ({members.length})</h3>
          </div>
          <div className="row-gap">
            <button
              type="button"
              className="btn sm"
              disabled={busy}
              onClick={handleSyncMyAccount}
            >
              ⇄ Sinkronkan Akun Saya
            </button>
            <button type="button" className="btn sm primary" onClick={onRefresh}>
              ↻ Refresh Data
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={members}
          rowKey={(r) => r.user_id}
          onRowClick={onSelectMember}
          rowActions={rowActions}
          rowActionsHeader={(r) => `${r.full_name} (${r.email})`}
          defaultSort={{ key: 'totalAssetValue', dir: 'desc' }}
          searchPlaceholder="Cari member berdasarkan nama, email, atau User ID…"
          emptyText="Tidak ada member ditemukan."
        />
      </div>
    </div>
  );
}

// ============================================================================
// 5. ORDERS & ACTIVITY TAPE VIEW (?view=orders) — Gantt Tape + Order Ledger
// ============================================================================
function OrdersTapeView({
  state,
  onSelectMember,
  onSelectDeposit,
  onRefresh,
}: {
  state: TradingAdminState;
  onSelectMember: (m: MemberPortfolioItem) => void;
  onSelectDeposit: (d: DepositRecord) => void;
  onRefresh: () => void;
}) {
  const { today, members, orders, deposits } = state;
  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(today, -(13 - i))),
    [today]
  );

  const orderColumns: DataTableColumn<TradingOrderRecord>[] = [
    {
      key: 'id',
      label: 'Order / Tx ID',
      width: 110,
      value: (r) => r.id,
      render: (r) => <span className="mono muted">#{r.id.slice(0, 8)}</span>,
      filter: { type: 'text', placeholder: 'ID…' },
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      width: 145,
      value: (r) => r.createdAt,
      render: (r) => <span className="mono muted">{fmtDateTime(r.createdAt)}</span>,
    },
    {
      key: 'user_name',
      label: 'Member',
      value: (r) => `${r.user_name} ${r.user_email}`,
      render: (r) => (
        <div>
          <strong>{r.user_name}</strong>
          <div className="muted small mono">{r.user_email}</div>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Member…' },
    },
    {
      key: 'type',
      label: 'Side / Type',
      width: 110,
      value: (r) => r.type,
      render: (r) => (
        <span
          className="tag"
          style={{
            color:
              r.type === 'BUY' || r.type === 'DEPOSIT'
                ? 'var(--green)'
                : 'var(--red)',
          }}
        >
          {r.type}
        </span>
      ),
      filter: {
        type: 'select',
        placeholder: 'All types',
        options: [
          { value: 'BUY', label: 'BUY' },
          { value: 'SELL', label: 'SELL' },
          { value: 'DEPOSIT', label: 'DEPOSIT' },
        ],
      },
    },
    {
      key: 'displaySymbol',
      label: 'Instrument',
      width: 130,
      value: (r) => r.displaySymbol,
      render: (r) => <strong className="mono">{r.displaySymbol}</strong>,
      filter: { type: 'text', placeholder: 'Ticker…' },
    },
    {
      key: 'shares',
      label: 'Qty / Lots',
      num: true,
      width: 130,
      value: (r) => r.shares,
      render: (r) => (
        <span className="mono">
          {r.type === 'DEPOSIT'
            ? 'Top-Up'
            : r.lots > 0
            ? `${r.lots} lot`
            : `${r.shares} unit`}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Exec Price',
      num: true,
      width: 130,
      value: (r) => r.price,
      render: (r) => (
        <span className="mono muted">
          {r.type === 'DEPOSIT' ? '—' : fmtIdr(r.price)}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Total Value (IDR)',
      num: true,
      width: 165,
      value: (r) => r.total,
      render: (r) => <strong className="mono">{fmtIdr(r.total)}</strong>,
    },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      value: (r) => r.status,
      render: (r) => <StatusPill status={r.status.toLowerCase()} />,
    },
  ];

  return (
    <div className="stack">
      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">14-Day Activity Timeline · Click any block to inspect</div>
            <h3>Member Trading & Deposit Tape</h3>
          </div>
          <div className="legend">
            <span>
              <i className="dot" style={{ background: 'var(--green)' }} /> Approved Deposit / Buy
            </span>
            <span>
              <i className="dot" style={{ background: 'var(--amber)' }} /> Pending Deposit
            </span>
            <span>
              <i className="dot" style={{ background: 'var(--blue)' }} /> Active Portfolio
            </span>
          </div>
        </div>

        <div className="tape-wrap">
          <div
            className="tape"
            style={{
              gridTemplateColumns: `220px repeat(${days.length}, minmax(54px, 1fr))`,
            }}
          >
            <div className="tape-corner">Member / Net Worth</div>
            {days.map((d) => (
              <div
                key={d}
                className={`tape-day ${d === today ? 'today' : ''} ${
                  [0, 6].includes(new Date(d + 'T12:00:00Z').getUTCDay()) ? 'wknd' : ''
                }`}
              >
                <div className="tape-dow">{fmtWeekday(d)}</div>
                <div className="tape-dom">{d.slice(8, 10)}</div>
              </div>
            ))}

            {members.slice(0, 12).map((m) => {
              const memberOrders = orders.filter(
                (o) =>
                  o.user_id === m.user_id ||
                  o.user_email.toLowerCase() === m.email.toLowerCase()
              );
              return (
                <React.Fragment key={m.user_id}>
                  <div
                    className="tape-room clickable"
                    onClick={() => onSelectMember(m)}
                  >
                    <div>
                      <div className="tape-rnum">{m.full_name}</div>
                      <div className="tape-rname mono">
                        {fmtIdrCompact(m.totalAssetValue)} · {m.holdings.length} pos
                      </div>
                    </div>
                  </div>
                  <div
                    className="tape-row-cells"
                    style={{
                      gridColumn: `2 / span ${days.length}`,
                      gridTemplateColumns: `repeat(${days.length}, minmax(54px, 1fr))`,
                    }}
                  >
                    {days.map((d) => {
                      const dayTx = memberOrders.filter(
                        (o) => String(o.createdAt || '').slice(0, 10) === d
                      );
                      return (
                        <div
                          key={d}
                          className={`tape-cell ${d === today ? 'today' : ''}`}
                          onClick={() => onSelectMember(m)}
                        >
                          {dayTx.length > 0 && (
                            <div
                              className={`tape-bar st-${
                                dayTx.some((x) => x.status === 'PENDING')
                                  ? 'pending'
                                  : 'confirmed'
                              }`}
                              style={{
                                left: '6%',
                                width: '88%',
                                position: 'relative',
                                top: 6,
                              }}
                              title={`${m.full_name} on ${d}: ${dayTx.length} transactions`}
                            >
                              <span className="tape-bar-name">
                                {dayTx.length} tx
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="eyebrow">Order & Deposit Execution Ledger</div>
            <h3>All Member Orders & Transactions ({orders.length})</h3>
          </div>
          <button type="button" className="btn sm" onClick={onRefresh}>
            ↻ Refresh Ledger
          </button>
        </div>
        <DataTable
          columns={orderColumns}
          rows={orders}
          rowKey={(r) => r.id}
          onRowClick={(r) => {
            if (r.type === 'DEPOSIT') {
              const dep = deposits.find((d) => d.id === r.id);
              if (dep) {
                onSelectDeposit(dep);
                return;
              }
            }
            const m = members.find(
              (mem) =>
                mem.user_id === r.user_id ||
                mem.email.toLowerCase() === r.user_email.toLowerCase()
            );
            if (m) onSelectMember(m);
          }}
          defaultSort={{ key: 'createdAt', dir: 'desc' }}
          searchPlaceholder="Search order ID, member, ticker, side…"
          emptyText="No orders or transactions recorded yet."
        />
      </div>
    </div>
  );
}

// ============================================================================
// Slide-Over Detail Sheets (Deposit Ticket & Member Portfolio)
// ============================================================================
function DepositSheet({
  deposit,
  onClose,
  onRefresh,
  showToast,
}: {
  deposit: DepositRecord;
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await approveDeposit(deposit.id);
      if (res.success) {
        showToast(res.message || 'Deposit disetujui!');
        onRefresh();
        onClose();
      } else {
        showToast(res.error || 'Gagal menyetujui deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt(
      'Masukkan alasan penolakan:',
      'Bukti transfer tidak valid atau dana belum masuk'
    );
    if (reason === null) return;
    setBusy(true);
    try {
      const res = await rejectDeposit(deposit.id, reason);
      if (res.success) {
        showToast(res.message || 'Deposit ditolak.');
        onRefresh();
        onClose();
      } else {
        showToast(res.error || 'Gagal menolak deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="eyebrow">Deposit Ticket · #{deposit.id.slice(0, 8)}</div>
            <h3>{deposit.user?.full_name || 'Member Deposit'}</h3>
            <div className="muted mono">{deposit.user?.email || deposit.user_id}</div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sheet-sec">
          <div className="kv">
            <span>Status</span>
            <strong>
              <StatusPill status={deposit.status.toLowerCase()} />
            </strong>
          </div>
          <div className="kv">
            <span>Payment Method</span>
            <strong className="mono">{deposit.payment_method}</strong>
          </div>
          <div className="kv">
            <span>Created At</span>
            <strong className="mono">{fmtDateTime(deposit.created_at)}</strong>
          </div>
          {deposit.approved_at && (
            <div className="kv">
              <span>Approved At</span>
              <strong className="mono">{fmtDateTime(deposit.approved_at)}</strong>
            </div>
          )}
          <div className="kv total">
            <span>Nominal Deposit</span>
            <strong className="mono" style={{ color: 'var(--green)' }}>
              {fmtIdr(deposit.amount)}
            </strong>
          </div>
        </div>

        {deposit.notes && (
          <div className="sheet-sec">
            <div className="eyebrow">Transaction Notes</div>
            <p className="small" style={{ lineHeight: 1.5 }}>
              {deposit.notes}
            </p>
          </div>
        )}

        {deposit.proof_url && (
          <div className="sheet-sec">
            <div className="eyebrow">Transfer Proof</div>
            <a
              href={deposit.proof_url}
              target="_blank"
              rel="noreferrer"
              className="btn sm"
            >
              Lihat Bukti Transfer ↗
            </a>
          </div>
        )}

        {deposit.status === 'PENDING' && (
          <div className="sheet-sec">
            <div className="eyebrow">Verification Decision</div>
            <div className="btn-row">
              <button
                type="button"
                className="btn primary"
                disabled={busy}
                onClick={handleApprove}
              >
                ✓ Approve & Credit Wallet
              </button>
              <button
                type="button"
                className="btn danger"
                disabled={busy}
                onClick={handleReject}
              >
                ✕ Reject Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberPortfolioSheet({
  member,
  onClose,
  onRefresh,
  showToast,
}: {
  member: MemberPortfolioItem;
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const handleResetZero = async () => {
    if (!window.confirm(`Reset akun ${member.full_name} ke Rp 0?`)) return;
    setBusy(true);
    try {
      const res = await resetMemberAccountToZero(member.user_id);
      if (res.success) {
        showToast(res.message || 'Akun berhasil direset ke Rp 0!');
        onRefresh();
        onClose();
      } else {
        showToast(res.error || 'Gagal mereset akun', true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <div className="eyebrow">Member Portfolio · {member.role.toUpperCase()}</div>
            <h3>{member.full_name}</h3>
            <div className="muted mono">{member.email}</div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sheet-sec">
          <div className="kv">
            <span>User ID</span>
            <strong className="mono">{member.user_id}</strong>
          </div>
          <div className="kv">
            <span>Cash Balance (RDN Wallet)</span>
            <strong className="mono" style={{ color: 'var(--green)' }}>
              {fmtIdr(member.cash)}
            </strong>
          </div>
          <div className="kv">
            <span>Realized P/L</span>
            <strong
              className="mono"
              style={{ color: member.realized_pl >= 0 ? 'var(--green)' : 'var(--red)' }}
            >
              {member.realized_pl >= 0 ? '+' : ''}
              {fmtIdr(member.realized_pl)}
            </strong>
          </div>
          <div className="kv">
            <span>Portfolio Market Value</span>
            <strong className="mono">{fmtIdr(member.totalMarketValue)}</strong>
          </div>
          <div className="kv total">
            <span>Total Net Worth Equity</span>
            <strong className="mono">{fmtIdr(member.totalAssetValue)}</strong>
          </div>
        </div>

        <div className="sheet-sec">
          <div className="eyebrow">Holdings ({member.holdings.length})</div>
          {member.holdings.length === 0 ? (
            <div className="muted small">Member belum memiliki aset saham/kripto (100% Cash).</div>
          ) : (
            member.holdings.map((h, i) => {
              const isForeign =
                h.currency === 'USD' ||
                h.currency === 'USDT' ||
                h.assetClass === 'US' ||
                h.assetClass === 'CRYPTO';
              const shares =
                (h.shares || 0) > 0 ? h.shares : (h.lots || 0) * (isForeign ? 1 : 100);
              const curPrice = h.currentPrice || h.avgPrice;
              const rate = isForeign ? (h as any).exchangeRate || 16000 : 1;
              const mv = shares * curPrice * rate;
              const unPl = Math.round((curPrice - h.avgPrice) * shares * rate);
              return (
                <div key={i} className="line-item">
                  <div>
                    <strong className="mono">{h.displaySymbol || h.symbol}</strong>
                    <div className="muted small">
                      {isForeign ? `${shares} unit` : `${h.lots} lot`} · Avg{' '}
                      {isForeign
                        ? `$${h.avgPrice.toLocaleString('en-US')}`
                        : fmtIdr(h.avgPrice)}
                    </div>
                  </div>
                  <div className="num mono">
                    <div>{fmtIdr(mv)}</div>
                    <div
                      className="small"
                      style={{ color: unPl >= 0 ? 'var(--green)' : 'var(--red)' }}
                    >
                      {unPl >= 0 ? '+' : ''}
                      {fmtIdr(unPl)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="sheet-sec">
          <div className="eyebrow">Quick Admin Actions</div>
          <div className="btn-row">
            <button
              type="button"
              className="btn danger"
              disabled={busy}
              onClick={handleResetZero}
            >
              Reset Saldo & Portofolio ke Rp 0
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Quick Tour & Helper Components
// ============================================================================
const TOUR_STEPS: Array<{ view: AdminViewId; title: string; body: string }> = [
  {
    view: 'equipment',
    title: '1/4 · Asset Holdings Matrix (?view=equipment)',
    body: 'Pantau distribusi kepemilikan saham IDX, Crypto, dan US Stocks seluruh member dalam matriks 10 hari beserta tabel posisi lengkap.',
  },
  {
    view: 'dashboard',
    title: '2/4 · Executive Trading Desk Overview',
    body: '6 KPI utama secara real-time dari Supabase Cloud, kurva arus likuiditas 14 hari, dan antrean verifikasi cepat.',
  },
  {
    view: 'deposits',
    title: '3/4 · Atomic Deposit Approvals',
    body: 'Klik kanan baris tiket deposit untuk menyetujui (Approve via PostgreSQL RPC) atau menolak permohonan top-up RDN member.',
  },
  {
    view: 'portfolios',
    title: '4/4 · Member Portfolios & Risk Control',
    body: 'Inspeksi saldo kas RDN, rincian lot saham/crypto per member, force reset password, atau reset saldo akun ke Rp 0.',
  },
];

function QuickTour({
  step,
  onStep,
  onClose,
}: {
  step: number;
  onStep: (n: number) => void;
  onClose: () => void;
}) {
  const cur = TOUR_STEPS[step];
  if (!cur) return null;
  return (
    <div className="tour">
      <div className="tour-card">
        <div className="tour-head">
          <span className="eyebrow">Interactive Tour · TradeSim Backoffice</span>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <h4>{cur.title}</h4>
        <p className="muted">{cur.body}</p>
        <div className="tour-foot">
          <div className="tour-dots">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`tour-dot ${i === step ? 'active' : ''}`}
                onClick={() => onStep(i)}
              />
            ))}
          </div>
          <div className="row-gap">
            {step > 0 && (
              <button
                type="button"
                className="btn sm"
                onClick={() => onStep(step - 1)}
              >
                ← Back
              </button>
            )}
            {step < TOUR_STEPS.length - 1 ? (
              <button
                type="button"
                className="btn sm primary"
                onClick={() => onStep(step + 1)}
              >
                Next →
              </button>
            ) : (
              <button type="button" className="btn sm primary" onClick={onClose}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`pill st-${status}`}>{status}</span>;
}

// ============================================================================
// Main SteyerAdminApp Shell Component (100% Pure TradingSim Data)
// ============================================================================
export default function SteyerAdminApp({
  initialView = 'equipment',
}: {
  initialView?: AdminViewId;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAdminAuth();

  const viewParam = searchParams?.get('view') as AdminViewId | null;
  const resolvedInitialView: AdminViewId = useMemo(() => {
    if (
      viewParam &&
      ['dashboard', 'equipment', 'deposits', 'portfolios', 'orders'].includes(viewParam)
    ) {
      return viewParam;
    }
    if (pathname?.endsWith('/deposits')) return 'deposits';
    if (pathname?.endsWith('/portfolios')) return 'portfolios';
    return initialView;
  }, [viewParam, pathname, initialView]);

  const [view, setView] = useState<AdminViewId>(resolvedInitialView);
  const [role, setRole] = useState<RoleId>('manager');
  const [lang, setLang] = useState<LangId>('id');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [state, setState] = useState<TradingAdminState | null>(null);
  const [toast, setToast] = useState<{ msg: string; isErr?: boolean } | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberPortfolioItem | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);

  useEffect(() => {
    setView(resolvedInitialView);
  }, [resolvedInitialView]);

  const showToast = useCallback((msg: string, isErr?: boolean) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/state?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const data: TradingAdminState = await r.json();
      setState(data);
    } catch (e) {
      console.error('[SteyerAdminApp load error]', e);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [load]);

  const navigateView = (v: AdminViewId) => {
    setView(v);
    try {
      const url = new URL(window.location.href);
      url.pathname = '/admin';
      url.searchParams.set('view', v);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const changeRole = (r: RoleId) => {
    setRole(r);
    const allowed = ROLES[r].views;
    if (!allowed.includes(view)) {
      navigateView(allowed[0]);
    }
  };

  if (!state) {
    return (
      <div className="steyer-scope" data-theme={theme}>
        <div className="loading">Memuat data trading live dari Supabase Cloud…</div>
      </div>
    );
  }

  const pendingDepCount = state.deposits.filter((d) => d.status === 'PENDING').length;

  const allNav = [
    {
      group: 'Overview',
      items: [{ id: 'dashboard' as AdminViewId, label: 'Dashboard', icon: '◫' }],
    },
    {
      group: 'Trading Operations',
      items: [
        {
          id: 'equipment' as AdminViewId,
          label: 'Assets & Positions',
          icon: '◈',
          badge: state.holdingsFlat.length || undefined,
        },
        {
          id: 'deposits' as AdminViewId,
          label: 'Deposit Approvals',
          icon: '💳',
          badge: pendingDepCount || undefined,
        },
        {
          id: 'portfolios' as AdminViewId,
          label: 'Member Portfolios',
          icon: '👥',
          badge: state.members.length || undefined,
        },
        {
          id: 'orders' as AdminViewId,
          label: 'Order & Activity Tape',
          icon: '▦',
          badge: state.orders.length || undefined,
        },
      ],
    },
  ];

  const allowedViews = ROLES[role].views;
  const nav = allNav
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => allowedViews.includes(it.id)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="steyer-scope" data-theme={theme}>
      {/* Top Demo Bar */}
      <div className="demo-bar">
        <div className="demo-bar-left">
          <span className="demo-pill">TRADESIM BACKOFFICE</span>
          <span className="demo-bar-text">
            Steyer Studio Workstation · Live Supabase PostgreSQL Trading Data
          </span>
        </div>
        <div className="demo-bar-right">
          <div className="demo-switch" title="Switch view">
            <Link href="/" className="demo-switch-item">
              <span className="demo-switch-dot" />
              <span>Trading App</span>
              <span className="demo-switch-tag">Terminal</span>
            </Link>
            <span className="demo-switch-item active">
              <span className="demo-switch-dot" />
              <span>Admin</span>
              <span className="demo-switch-tag">Backoffice</span>
            </span>
          </div>

          <label className="demo-role" title="Preview role-based navigation">
            <span className="demo-role-lbl">Role</span>
            <select
              value={role}
              onChange={(e) => changeRole(e.target.value as RoleId)}
            >
              {Object.values(ROLES).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="demo-btn"
            onClick={() => {
              setTourStep(0);
              navigateView(TOUR_STEPS[0].view);
            }}
          >
            Quick tour
          </button>

          <button type="button" className="demo-btn" onClick={load}>
            ↻ Sync Supabase
          </button>

          <div className="demo-langs">
            {(['id', 'en'] as LangId[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={l === lang ? 'active' : ''}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main App Grid */}
      <div className="app">
        <aside className="side">
          <div className="brand">
            <div className="brand-mark">T</div>
            <div>
              <div className="brand-title">TradeSim Pro</div>
              <div className="brand-sub">Backoffice · Trading Desk</div>
            </div>
          </div>

          <nav className="nav">
            {nav.map((g) => (
              <div key={g.group} className="nav-group">
                <div className="nav-group-label">{g.group}</div>
                {g.items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className={`nav-item ${view === it.id ? 'active' : ''}`}
                    onClick={() => navigateView(it.id)}
                  >
                    <span className="nav-ic">{it.icon}</span>
                    <span>{it.label}</span>
                    {it.badge !== undefined && (
                      <span className="nav-badge">{it.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="side-foot">
            <div className="role-card">
              <div className="avatar">{ROLES[role].user[0]}</div>
              <div>
                <div className="role-name">{ROLES[role].user}</div>
                <div className="role-sub">{ROLES[role].title}</div>
              </div>
            </div>
            <div className="side-actions">
              <button
                type="button"
                className="side-link"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              >
                <span>{theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}</span>
                <span className="muted">Theme</span>
              </button>
              <Link href="/" className="side-link">
                <span>← Back to Trading App</span>
                <span>↗</span>
              </Link>
              <button
                type="button"
                className="side-link"
                style={{ color: 'var(--red)' }}
                onClick={logout}
              >
                <span>⎋ Logout Admin</span>
                <span className="muted">Exit</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="main">
          <header className="top">
            <div className="top-title">
              <span className="top-crumb">TradeSim Backoffice</span>
              <span className="top-sep">/</span>
              <h1>
                {allNav.flatMap((g) => g.items).find((i) => i.id === view)?.label ||
                  'Assets & Positions'}
              </h1>
            </div>
            <div className="top-right">
              <span className="today-pill">
                <span className="pulse" /> Supabase live · Today{' '}
                {fmtDateShort(state.today)}
              </span>
              <button
                type="button"
                className="btn primary"
                onClick={() => navigateView('deposits')}
              >
                + Verify Deposits ({pendingDepCount})
              </button>
            </div>
          </header>

          <div className="content">
            {view === 'dashboard' && (
              <DashboardView
                state={state}
                onNav={navigateView}
                onSelectDeposit={setSelectedDeposit}
                onSelectMember={setSelectedMember}
                onRefresh={load}
                showToast={showToast}
              />
            )}
            {view === 'equipment' && (
              <EquipmentAssetsView
                state={state}
                onSelectMember={setSelectedMember}
                onRefresh={load}
                showToast={showToast}
              />
            )}
            {view === 'deposits' && (
              <DepositsView
                deposits={state.deposits}
                members={state.members}
                onSelectDeposit={setSelectedDeposit}
                onRefresh={load}
                showToast={showToast}
              />
            )}
            {view === 'portfolios' && (
              <PortfoliosView
                members={state.members}
                onSelectMember={setSelectedMember}
                onRefresh={load}
                showToast={showToast}
              />
            )}
            {view === 'orders' && (
              <OrdersTapeView
                state={state}
                onSelectMember={setSelectedMember}
                onSelectDeposit={setSelectedDeposit}
                onRefresh={load}
              />
            )}
          </div>
        </div>

        {selectedDeposit && (
          <DepositSheet
            deposit={selectedDeposit}
            onClose={() => setSelectedDeposit(null)}
            onRefresh={load}
            showToast={showToast}
          />
        )}

        {selectedMember && (
          <MemberPortfolioSheet
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
            onRefresh={load}
            showToast={showToast}
          />
        )}

        {tourStep !== null && (
          <QuickTour
            step={tourStep}
            onStep={(i) => {
              setTourStep(i);
              navigateView(TOUR_STEPS[i].view);
            }}
            onClose={() => setTourStep(null)}
          />
        )}

        {toast && (
          <div className={`toast ${toast.isErr ? 'err' : ''}`}>{toast.msg}</div>
        )}
      </div>
    </div>
  );
}
