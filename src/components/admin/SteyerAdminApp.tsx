'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  approveDeposit,
  rejectDeposit,
  createDepositRequest,
  resetMemberPassword,
  resetMemberAccountToZero,
  deleteMemberAccount,
  MemberPortfolioItem,
} from '@/app/admin/actions';
import {
  TradingAdminState,
  EnrichedDepositRecord,
  MemberHoldingRow,
  TradingOrderRecord,
  AssetMatrixRow,
  RevenueChannelRow,
} from '@/lib/server/steyerAdminState';
import { useAdminAuth } from './AdminAuthGate';
import { useAuthStore } from '@/store/useAuthStore';

export type AdminViewId = 'dashboard' | 'equipment' | 'deposits' | 'portfolios' | 'orders';
type RoleId = 'manager' | 'treasury' | 'audit';

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
    label: 'Treasury · Revenue & Deposits',
    title: 'Treasury & Revenue Officer',
    user: 'Treasury Desk',
    views: ['dashboard', 'equipment', 'deposits'],
  },
  audit: {
    id: 'audit',
    label: 'Risk & Audit · Portfolios',
    title: 'Portfolio Risk Auditor',
    user: 'Risk Control',
    views: ['dashboard', 'equipment', 'portfolios', 'orders'],
  },
};

// Clean minimal SVG icons matching Steyer Studio 16x16 stroke=1.75
const Icons = {
  sidebar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  equipment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  deposits: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  portfolios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  dots: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  cols: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  ),
  chevUpDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
  ),
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
  return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getUTCDay()];
}

function fmtIdr(n: number | undefined | null): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(Number(n) || 0));
}

function fmtIdrCompact(n: number | undefined | null): string {
  const val = Number(n) || 0;
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} Miliar`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)} Jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)} Rb`;
  return `${sign}Rp ${Math.round(abs)}`;
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  if (s === 'APPROVED' || s === 'FILLED' || s === 'PROFIT' || s === 'ACTIVE') {
    return <span className="bdg green">{s}</span>;
  }
  if (s === 'PENDING') {
    return <span className="bdg amber">{s}</span>;
  }
  if (s === 'REJECTED' || s === 'CANCELLED' || s === 'LOSS') {
    return <span className="bdg red">{s}</span>;
  }
  return <span className="bdg blue">{s}</span>;
}

// ============================================================================
// Context Menu Component (Uses exact Steyer .ctx-menu.menu-pop classes)
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
  const w = 236;
  const h = (menu.items?.length || 1) * 32 + 28;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const left = Math.min(menu.x, vw - w - 8);
  const top = Math.min(menu.y, vh - h - 8);

  return (
    <div
      ref={ref}
      className="ctx-menu menu-pop"
      style={{ left, top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menu.header && <div className="menu-label">{menu.header}</div>}
      {menu.items.map((it, i) =>
        it.sep ? (
          <hr key={i} />
        ) : (
          <button
            key={i}
            type="button"
            disabled={it.disabled}
            className={`menu-item ${it.danger ? 'danger' : ''}`}
            onClick={() => {
              onClose();
              it.onClick?.();
            }}
          >
            <span>{it.label}</span>
            {it.hint && <small className="end muted">{it.hint}</small>}
          </button>
        )
      )}
    </div>
  );
}

// ============================================================================
// Steyer Studio DataTable (Uses exact .dt, .dt-bar, .dt-wrap, .th-sort, .dt-f)
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
  renderInlineActions,
  defaultSort,
  defaultPageSize = 15,
  searchPlaceholder = 'Cari data…',
  emptyText = 'Tidak ada data yang cocok',
  toolbarLeft,
  toolbarRight,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ContextMenuItem[];
  rowActionsHeader?: (row: T) => string;
  renderInlineActions?: (row: T) => React.ReactNode;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  defaultPageSize?: number;
  searchPlaceholder?: string;
  emptyText?: string;
  toolbarLeft?: React.ReactNode;
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
      x: rect.right - 210,
      y: rect.bottom + 4,
      header: rowActionsHeader ? rowActionsHeader(r) : undefined,
      items: rowActions(r) || [],
    });
  };

  const hasActionsCol = Boolean(rowActions || renderInlineActions);

  return (
    <div className="dt">
      <div className="dt-bar">
        <div className="dt-bar-l">
          {toolbarLeft}
          <label className="search">
            {Icons.search}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </label>
          {activeFilterCount > 0 && (
            <button
              type="button"
              className="btn-s sm ghost"
              onClick={() => {
                setSearch('');
                setFilters({});
              }}
            >
              Reset ({activeFilterCount})
            </button>
          )}
        </div>
        <div className="dt-bar-r">
          {rowActions && <span className="muted small hide-m">Klik kanan baris untuk aksi</span>}
          <div className="menu" ref={colBtnRef}>
            <button
              type="button"
              className="btn-s sm"
              onClick={() => setColMenuOpen((o) => !o)}
            >
              {Icons.cols}
              <span>
                Kolom ({visibleCols.length}/{columns.length})
              </span>
            </button>
            {colMenuOpen && (
              <div className="menu-pop at-bottom al-end">
                <div className="menu-label">Tampilkan Kolom</div>
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

      <div className="dt-wrap">
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
                    className={c.num ? 'num' : ''}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className="th-sort"
                        onClick={() => toggleSort(c.key, c.sortable)}
                      >
                        <span>{c.label}</span>
                        <span className="muted">
                          {isSorted ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </button>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </th>
                );
              })}
              {hasActionsCol && <th className="num act">Aksi</th>}
            </tr>
            {hasFilterRow && (
              <tr className="dt-filters">
                {visibleCols.map((c) => (
                  <th key={c.key} className={c.num ? 'num' : ''}>
                    {c.filter?.type === 'text' && (
                      <input
                        className="dt-f"
                        value={filters[c.key] || ''}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                        }
                        placeholder={c.filter.placeholder || 'Filter…'}
                      />
                    )}
                    {c.filter?.type === 'select' && (
                      <select
                        className="dt-f"
                        value={filters[c.key] || 'all'}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, [c.key]: e.target.value }))
                        }
                      >
                        <option value="all">{c.filter.placeholder || 'Semua'}</option>
                        {(c.filter.options || []).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </th>
                ))}
                {hasActionsCol && <th />}
              </tr>
            )}
          </thead>
          <tbody>
            {pageRows.map((r, idx) => (
              <tr
                key={rowKey ? rowKey(r) : (r as any).id ?? idx}
                className={onRowClick || rowActions ? 'click' : ''}
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
                {hasActionsCol && (
                  <td className="num act" onClick={(e) => e.stopPropagation()}>
                    <div className="acts" style={{ justifyContent: 'flex-end' }}>
                      {renderInlineActions && renderInlineActions(r)}
                      {rowActions && (
                        <button
                          type="button"
                          className="ibtn ghost-i"
                          onClick={(e) => openDots(e, r)}
                          title="Menu Aksi"
                        >
                          {Icons.dots}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={visibleCols.length + (hasActionsCol ? 1 : 0)}
                  className="dt-empty muted"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="dt-foot">
        <div className="muted">
          Menampilkan{' '}
          <b style={{ color: 'var(--head)' }}>
            {sorted.length === 0 ? 0 : (curPage - 1) * pageSize + 1}–
            {Math.min(curPage * pageSize, sorted.length)}
          </b>{' '}
          dari <b style={{ color: 'var(--head)' }}>{sorted.length}</b> data
          {sorted.length !== rows.length && ` (difilter dari ${rows.length})`}
        </div>
        <div className="dt-pager">
          <label className="muted">
            <span>Baris</span>
            <select
              className="dt-f"
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
            className="ibtn"
            disabled={curPage <= 1}
            onClick={() => setPage(1)}
          >
            «
          </button>
          <button
            type="button"
            className="ibtn"
            disabled={curPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          <span className="mono muted" style={{ padding: '0 6px' }}>
            {curPage} / {totalPages}
          </span>
          <button
            type="button"
            className="ibtn"
            disabled={curPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
          <button
            type="button"
            className="ibtn"
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
// Steyer Studio AreaChart (Uses exact .area, .grid, .ax, .dot, .cursor, .tip)
// ============================================================================
interface AreaPoint {
  date: string;
  approvedRevenueIdr: number;
  pendingRevenueIdr: number;
  virtualDisbursedIdr: number;
  txCount: number;
}

function AreaChart({ series, today }: { series: AreaPoint[]; today: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const padL = 56;
  const padR = 16;
  const padT = 18;
  const padB = 30;
  const iW = W - padL - padR;
  const iH = H - padT - padB;

  const maxVal =
    Math.max(
      50_000,
      ...series.map((p) => p.approvedRevenueIdr + p.pendingRevenueIdr)
    ) * 1.15;
  const xAt = (i: number) => padL + (i / Math.max(1, series.length - 1)) * iW;
  const yAt = (v: number) => padT + iH - (v / maxVal) * iH;

  const smoothPath = (pts: [number, number][]) => {
    if (!pts.length) return '';
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(
        1
      )}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  };

  const pts: [number, number][] = series.map((p, i) => [
    xAt(i),
    yAt(p.approvedRevenueIdr + p.pendingRevenueIdr),
  ]);
  const line = smoothPath(pts);
  const area = `${line} L ${xAt(series.length - 1).toFixed(1)} ${
    padT + iH
  } L ${xAt(0).toFixed(1)} ${padT + iH} Z`;

  const ticks = [0, 0.5, 1].map((t) => Math.round(maxVal * t));
  const hp = hover !== null ? series[hover] : null;

  return (
    <div
      className="area"
      style={{ height: 225 }}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="steyerRevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {ticks.map((v, idx) => {
          const y = yAt(v);
          return (
            <g key={idx}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} className="grid" />
              <text x={padL - 8} y={y + 4} textAnchor="end" className="ax sub">
                {fmtIdrCompact(v).replace('Rp ', '')}
              </text>
            </g>
          );
        })}

        <path d={area} fill="url(#steyerRevGrad)" />
        <path
          d={line}
          fill="none"
          stroke="var(--green)"
          strokeWidth="2"
        />

        {series.map((p, i) => {
          const x = xAt(i);
          const y = yAt(p.approvedRevenueIdr + p.pendingRevenueIdr);
          const isNow = p.date === today;
          const isH = hover === i;
          return (
            <g key={p.date}>
              {(i % 2 === 0 || i === series.length - 1) && (
                <text
                  x={x}
                  y={H - 8}
                  textAnchor="middle"
                  className={`ax ${isNow ? 'now' : ''}`}
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
                  className="cursor"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isH ? 4.5 : 3}
                className={`dot ${isNow ? 'now' : ''}`}
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

      {hp && hover !== null && (
        <div
          className="tip"
          style={{
            left: `${Math.min(85, Math.max(15, (hover / (series.length - 1)) * 100))}%`,
            top: 12,
          }}
        >
          {fmtDateShort(hp.date)} · Approved: {fmtIdr(hp.approvedRevenueIdr)}
          {hp.pendingRevenueIdr > 0 ? ` (+${fmtIdr(hp.pendingRevenueIdr)} pending)` : ''}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 1. EQUIPMENT / REVENUE & ASSETS MATRIX VIEW (?view=equipment)
//    100% Exact Steyer Studio Equipment View Layout & CSS Classes!
// ============================================================================
function EquipmentRevenueAssetsView({
  state,
  onSelectDeposit,
  onSelectMember,
  onRefresh,
  showToast,
}: {
  state: TradingAdminState;
  onSelectDeposit: (d: EnrichedDepositRecord) => void;
  onSelectMember: (m: MemberPortfolioItem) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const { today, deposits, members, holdingsFlat, assetMatrix, revenueMatrix, summary } =
    state;
  const [matrixMode, setMatrixMode] = useState<'revenue' | 'assets'>('revenue');
  const [tableMode, setTableMode] = useState<'deposits' | 'holdings'>('deposits');
  const [newOpen, setNewOpen] = useState(false);
  const [simUserId, setSimUserId] = useState(members[0]?.user_id || '');
  const [simPayIdr, setSimPayIdr] = useState('50000');
  const [simMethod, setSimMethod] = useState('QRIS');
  const [busy, setBusy] = useState(false);

  const days = useMemo(
    () => Array.from({ length: 10 }, (_, i) => addDays(today, -(9 - i))),
    [today]
  );

  const handleCreateTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUserId.trim()) {
      showToast('Pilih member terlebih dahulu', true);
      return;
    }
    const payAmt = Number(simPayIdr);
    if (!payAmt || payAmt <= 0) {
      showToast('Masukkan nominal pembayaran yang valid', true);
      return;
    }
    // 1:100 package conversion (e.g. Bayar Rp 50.000 -> Saldo RDN Rp 5.000.000)
    const virtualCashAmt = payAmt < 1_000_000 ? payAmt * 100 : payAmt;
    setBusy(true);
    try {
      const res = await createDepositRequest(simUserId.trim(), virtualCashAmt, simMethod);
      if (res.success) {
        showToast(
          `Tiket deposit dibuat: Bayar ${fmtIdr(payAmt)} → Saldo RDN ${fmtIdr(virtualCashAmt)}`
        );
        setNewOpen(false);
        onRefresh();
      } else {
        showToast(res.error || 'Gagal membuat tiket deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleApproveDeposit = async (d: EnrichedDepositRecord) => {
    setBusy(true);
    try {
      const res = await approveDeposit(d.id);
      if (res.success) {
        showToast(
          `Approved! Pendapatan +${fmtIdr(d.realRevenueIdr)} tercatat & RDN member bertambah.`
        );
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menyetujui deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRejectDeposit = async (d: EnrichedDepositRecord) => {
    const reason = window.prompt(
      'Masukkan alasan penolakan deposit:',
      'Bukti transfer tidak valid atau dana belum masuk'
    );
    if (reason === null) return;
    setBusy(true);
    try {
      const res = await rejectDeposit(d.id, reason);
      if (res.success) {
        showToast('Tiket deposit ditolak.');
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menolak deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const depositColumns: DataTableColumn<EnrichedDepositRecord>[] = [
    {
      key: 'id',
      label: 'ID Tiket',
      width: 95,
      value: (r) => r.id,
      render: (r) => <span className="mono muted">#{r.id.slice(0, 8)}</span>,
      filter: { type: 'text', placeholder: 'ID…' },
    },
    {
      key: 'member',
      label: 'Member & Email',
      value: (r) => `${r.user?.full_name || 'Member'} ${r.user?.email || r.user_id}`,
      render: (r) => (
        <div>
          <b style={{ color: 'var(--head)', fontWeight: 500 }}>
            {r.user?.full_name || 'Member'}
          </b>
          <span className="block muted small mono">{r.user?.email || r.user_id}</span>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Cari member…' },
    },
    {
      key: 'payment_method',
      label: 'Channel / Bank',
      width: 125,
      value: (r) => r.payment_method,
      render: (r) => <span className="bdg blue">{r.payment_method}</span>,
      filter: { type: 'text', placeholder: 'Metode…' },
    },
    {
      key: 'realRevenueIdr',
      label: 'Pendapatan Website (Bayar IDR)',
      num: true,
      width: 190,
      value: (r) => r.realRevenueIdr,
      render: (r) => (
        <div>
          <b className="mono" style={{ color: 'var(--green)', fontWeight: 600 }}>
            {fmtIdr(r.realRevenueIdr)}
          </b>
          <span className="block muted small">{r.packageName}</span>
        </div>
      ),
    },
    {
      key: 'virtualCashIdr',
      label: 'Saldo RDN Member (Virtual)',
      num: true,
      width: 175,
      value: (r) => r.virtualCashIdr,
      render: (r) => <span className="mono">{fmtIdr(r.virtualCashIdr)}</span>,
    },
    {
      key: 'created_at',
      label: 'Waktu Masuk',
      width: 135,
      value: (r) => r.created_at,
      render: (r) => <span className="mono muted">{fmtDateTime(r.created_at)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: 115,
      value: (r) => r.status,
      render: (r) => <StatusBadge status={r.status} />,
      filter: {
        type: 'select',
        placeholder: 'Semua Status',
        options: [
          { value: 'PENDING', label: 'PENDING' },
          { value: 'APPROVED', label: 'APPROVED' },
          { value: 'REJECTED', label: 'REJECTED' },
        ],
      },
    },
  ];

  const holdingColumns: DataTableColumn<MemberHoldingRow>[] = [
    {
      key: 'displaySymbol',
      label: 'Emiten / Aset',
      value: (r) => `${r.displaySymbol} ${r.name}`,
      render: (r) => (
        <div>
          <b className="mono" style={{ color: 'var(--head)', fontWeight: 600 }}>
            {r.displaySymbol}
          </b>
          <span className="block muted small">{r.name}</span>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Ticker…' },
    },
    {
      key: 'category',
      label: 'Pasar',
      width: 100,
      value: (r) => r.category,
      render: (r) => <span className="bdg">{r.category}</span>,
      filter: {
        type: 'select',
        placeholder: 'Semua Pasar',
        options: [
          { value: 'IDX', label: 'IDX Saham' },
          { value: 'CRYPTO', label: 'Crypto' },
          { value: 'US', label: 'US Stocks' },
        ],
      },
    },
    {
      key: 'user_name',
      label: 'Member Pemegang',
      value: (r) => `${r.user_name} ${r.user_email}`,
      render: (r) => (
        <div>
          <b style={{ color: 'var(--head)', fontWeight: 500 }}>{r.user_name}</b>
          <span className="block muted small mono">{r.user_email}</span>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Nama / email…' },
    },
    {
      key: 'shares',
      label: 'Jumlah Lot / Unit',
      num: true,
      width: 140,
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
      label: 'Harga Beli (Avg)',
      num: true,
      width: 135,
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
      label: 'Harga Pasar',
      num: true,
      width: 135,
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
      label: 'Nilai Aset (IDR)',
      num: true,
      width: 155,
      value: (r) => r.marketValueIdr,
      render: (r) => (
        <b className="mono" style={{ color: 'var(--head)' }}>
          {fmtIdr(r.marketValueIdr)}
        </b>
      ),
    },
    {
      key: 'unrealizedPLIdr',
      label: 'Floating P/L',
      num: true,
      width: 160,
      value: (r) => r.unrealizedPLIdr,
      render: (r) => (
        <div className={`mono ${r.unrealizedPLIdr >= 0 ? 'ok-t' : 'err-t'}`}>
          <b>
            {r.unrealizedPLIdr >= 0 ? '+' : ''}
            {fmtIdr(r.unrealizedPLIdr)}
          </b>
          <span className="block small">
            ({r.unrealizedPLIdr >= 0 ? '+' : ''}
            {r.unrealizedPLPercent}%)
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="stack">
      {/* Summary KPI Strip for Website Deposit Revenue & Trading Assets */}
      <div className="kpis">
        <div className="kpi">
          <span>Pendapatan Deposit Website (Approved)</span>
          <b style={{ color: 'var(--green)' }}>
            {fmtIdr(summary.totalApprovedRevenueIdr)}
            <small>{summary.approvedCount} transaksi lunas</small>
          </b>
        </div>
        <div className="kpi">
          <span>Pendapatan Menunggu Verifikasi (Pending)</span>
          <b style={{ color: summary.pendingCount > 0 ? 'var(--amber)' : undefined }}>
            {fmtIdr(summary.totalPendingRevenueIdr)}
            <small>{summary.pendingCount} antrean tiket</small>
          </b>
        </div>
        <div className="kpi">
          <span>Pendapatan Masuk Hari Ini</span>
          <b>
            {fmtIdr(summary.todayApprovedRevenueIdr)}
            <small>{fmtDateShort(today)}</small>
          </b>
        </div>
        <div className="kpi">
          <span>Saldo Virtual RDN Tersalurkan</span>
          <b>
            {fmtIdrCompact(summary.totalVirtualDisbursedIdr)}
            <small>{members.length} akun member</small>
          </b>
        </div>
      </div>

      {/* Top Matrix Card (Exact Steyer Studio .card + .card-h + .tbl.matrix) */}
      <div className="card">
        <div className="card-h">
          <div className="tools">
            <h2>
              {matrixMode === 'revenue'
                ? 'Matriks Pendapatan Deposit Website · 10 Hari Terakhir'
                : 'Matriks Kepemilikan Saham & Crypto Member · 10 Hari Terakhir'}
            </h2>
            <div className="seg">
              <button
                type="button"
                aria-pressed={matrixMode === 'revenue'}
                onClick={() => setMatrixMode('revenue')}
              >
                Pendapatan Deposit ({revenueMatrix.length})
              </button>
              <button
                type="button"
                aria-pressed={matrixMode === 'assets'}
                onClick={() => setMatrixMode('assets')}
              >
                Posisi Aset Member ({assetMatrix.length})
              </button>
            </div>
          </div>
          <div className="tools">
            <button
              type="button"
              className="btn-s sm"
              onClick={onRefresh}
              title="Sinkronkan ulang dari Supabase"
            >
              {Icons.refresh}
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="btn-s sm primary"
              onClick={() => setNewOpen((v) => !v)}
            >
              {Icons.plus}
              <span>{newOpen ? 'Tutup Form' : 'Buat Tiket Deposit'}</span>
            </button>
          </div>
        </div>

        {newOpen && (
          <form className="form-row" onSubmit={handleCreateTopup}>
            <label className="fld grow">
              <span>Pilih Member</span>
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
            </label>
            <label className="fld">
              <span>Paket Bayar (Pendapatan IDR)</span>
              <select
                value={simPayIdr}
                onChange={(e) => setSimPayIdr(e.target.value)}
              >
                <option value="10000">Bayar Rp 10.000 → RDN Rp 1.000.000</option>
                <option value="20000">Bayar Rp 20.000 → RDN Rp 2.000.000</option>
                <option value="50000">Bayar Rp 50.000 → RDN Rp 5.000.000</option>
                <option value="100000">Bayar Rp 100.000 → RDN Rp 10.000.000</option>
                <option value="200000">Bayar Rp 200.000 → RDN Rp 20.000.000</option>
                <option value="500000">Bayar Rp 500.000 → RDN Rp 50.000.000</option>
              </select>
            </label>
            <label className="fld">
              <span>Metode Pembayaran</span>
              <select value={simMethod} onChange={(e) => setSimMethod(e.target.value)}>
                <option value="QRIS">QRIS</option>
                <option value="BCA">BCA</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
                <option value="BRI">BRI</option>
                <option value="GoPay">GoPay</option>
                <option value="DANA">DANA</option>
              </select>
            </label>
            <button type="submit" className="btn-s primary" disabled={busy}>
              Simpan Tiket Deposit
            </button>
          </form>
        )}

        <div className="tbl-wrap">
          {matrixMode === 'revenue' ? (
            <table className="tbl matrix">
              <thead>
                <tr>
                  <th>Channel / Metode Pembayaran</th>
                  <th className="num">Tiket</th>
                  <th className="num">Pendapatan Approved</th>
                  <th className="num">Menunggu (Pending)</th>
                  <th className="num">RDN Tersalurkan</th>
                  {days.map((d) => (
                    <th key={d} className={`num ${d === today ? 'today' : ''}`}>
                      <div>{fmtWeekday(d)}</div>
                      <small className="muted">{d.slice(8, 10)}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenueMatrix.map((row: RevenueChannelRow) => (
                  <tr key={row.method}>
                    <td>
                      <b style={{ color: 'var(--head)', fontWeight: 500 }}>{row.method}</b>
                    </td>
                    <td className="num">
                      {row.approvedCount}/{row.ticketsCount}
                    </td>
                    <td className="num ok-t">
                      <b>{fmtIdr(row.approvedRevenueIdr)}</b>
                    </td>
                    <td className="num" style={{ color: row.pendingRevenueIdr > 0 ? 'var(--amber)' : undefined }}>
                      {row.pendingRevenueIdr > 0 ? fmtIdr(row.pendingRevenueIdr) : '—'}
                    </td>
                    <td className="num muted">{fmtIdrCompact(row.virtualDisbursedIdr)}</td>
                    {days.map((d) => {
                      const cell = row.dailyRevenue[d];
                      const rev = cell?.revenueIdr || 0;
                      const cnt = cell?.count || 0;
                      return (
                        <td
                          key={d}
                          className={`num cell ${d === today ? 'today' : ''} ${
                            rev > 0 ? 'ok-t' : cnt > 0 ? 'low' : 'muted'
                          }`}
                          title={`${row.method} (${d}): Pendapatan ${fmtIdr(rev)} (${cnt} tiket)`}
                        >
                          {rev > 0
                            ? `${Math.round(rev / 1000)}k`
                            : cnt > 0
                            ? `${cnt}p`
                            : '·'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {revenueMatrix.length > 0 && (
                  <tr className="sum">
                    <td>Total Pendapatan Website</td>
                    <td className="num">
                      {summary.approvedCount}/{deposits.length}
                    </td>
                    <td className="num ok-t">{fmtIdr(summary.totalApprovedRevenueIdr)}</td>
                    <td className="num" style={{ color: 'var(--amber)' }}>
                      {summary.totalPendingRevenueIdr > 0
                        ? fmtIdr(summary.totalPendingRevenueIdr)
                        : '—'}
                    </td>
                    <td className="num">{fmtIdrCompact(summary.totalVirtualDisbursedIdr)}</td>
                    {days.map((d) => {
                      const dayTotal = revenueMatrix.reduce(
                        (s, r) => s + (r.dailyRevenue[d]?.revenueIdr || 0),
                        0
                      );
                      return (
                        <td key={d} className={`num ${d === today ? 'today' : ''}`}>
                          {dayTotal > 0 ? `${Math.round(dayTotal / 1000)}k` : '·'}
                        </td>
                      );
                    })}
                  </tr>
                )}
                {revenueMatrix.length === 0 && (
                  <tr>
                    <td colSpan={15} className="dt-empty muted">
                      Belum ada riwayat pendapatan deposit yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="tbl matrix">
              <thead>
                <tr>
                  <th>Emiten / Instrumen</th>
                  <th>Pasar</th>
                  <th className="num">Harga Pasar</th>
                  <th className="num">Pemegang</th>
                  <th className="num">Total Eksposur</th>
                  {days.map((d) => (
                    <th key={d} className={`num ${d === today ? 'today' : ''}`}>
                      <div>{fmtWeekday(d)}</div>
                      <small className="muted">{d.slice(8, 10)}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assetMatrix.map((asset: AssetMatrixRow) => (
                  <tr key={asset.displaySymbol}>
                    <td>
                      <b style={{ color: 'var(--head)', fontWeight: 600 }}>
                        {asset.displaySymbol}
                      </b>{' '}
                      <small className="muted">· {asset.name}</small>
                    </td>
                    <td>
                      <span className="bdg">{asset.category}</span>
                    </td>
                    <td className="num">
                      {asset.currency === 'USD'
                        ? `$${asset.currentPrice.toLocaleString('en-US')}`
                        : fmtIdr(asset.currentPrice)}
                    </td>
                    <td className="num">{asset.holdersCount} member</td>
                    <td className="num">
                      <b>{fmtIdrCompact(asset.totalMarketValueIdr)}</b>
                    </td>
                    {days.map((d) => {
                      const act = asset.dailyActivity[d];
                      const tx = act?.orders || 0;
                      return (
                        <td
                          key={d}
                          className={`num cell ${d === today ? 'today' : ''} ${
                            tx > 0 ? 'ok-t' : 'muted'
                          }`}
                        >
                          {tx > 0 ? `${tx}tx` : `${asset.holdersCount}h`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {assetMatrix.length === 0 && (
                  <tr>
                    <td colSpan={15} className="dt-empty muted">
                      Belum ada kepemilikan saham atau crypto aktif di portofolio member.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bottom DataTable Card */}
      <div className="card">
        {tableMode === 'deposits' ? (
          <DataTable
            columns={depositColumns}
            rows={deposits}
            onRowClick={onSelectDeposit}
            toolbarLeft={
              <div className="seg">
                <button
                  type="button"
                  aria-pressed={tableMode === 'deposits'}
                  onClick={() => setTableMode('deposits')}
                >
                  Daftar Deposit & Pendapatan ({deposits.length})
                </button>
                <button
                  type="button"
                  aria-pressed={tableMode === 'holdings'}
                  onClick={() => setTableMode('holdings')}
                >
                  Posisi Aset Member ({holdingsFlat.length})
                </button>
              </div>
            }
            renderInlineActions={(r) =>
              r.status === 'PENDING' ? (
                <>
                  <button
                    type="button"
                    className="btn-s sm primary"
                    disabled={busy}
                    onClick={() => handleApproveDeposit(r)}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    className="btn-s sm danger"
                    disabled={busy}
                    onClick={() => handleRejectDeposit(r)}
                  >
                    Tolak
                  </button>
                </>
              ) : null
            }
            rowActions={(r) => [
              {
                label: 'Lihat rincian & bukti transfer',
                hint: 'Enter',
                onClick: () => onSelectDeposit(r),
              },
              { sep: true },
              {
                label: `Approve (+${fmtIdr(r.realRevenueIdr)})`,
                disabled: r.status !== 'PENDING' || busy,
                onClick: () => handleApproveDeposit(r),
              },
              {
                label: 'Tolak tiket deposit…',
                danger: true,
                disabled: r.status !== 'PENDING' || busy,
                onClick: () => handleRejectDeposit(r),
              },
            ]}
            rowActionsHeader={(r) =>
              `Tiket #${r.id.slice(0, 8)} · ${r.user?.full_name || 'Member'}`
            }
            defaultSort={{ key: 'created_at', dir: 'desc' }}
            searchPlaceholder="Cari tiket, nama member, email, metode…"
            emptyText="Belum ada data deposit member."
          />
        ) : (
          <DataTable
            columns={holdingColumns}
            rows={holdingsFlat}
            rowKey={(r) => r.id}
            onRowClick={(r) => {
              const m = members.find((mem) => mem.user_id === r.user_id);
              if (m) onSelectMember(m);
            }}
            toolbarLeft={
              <div className="seg">
                <button
                  type="button"
                  aria-pressed={tableMode === 'deposits'}
                  onClick={() => setTableMode('deposits')}
                >
                  Daftar Deposit & Pendapatan ({deposits.length})
                </button>
                <button
                  type="button"
                  aria-pressed={tableMode === 'holdings'}
                  onClick={() => setTableMode('holdings')}
                >
                  Posisi Aset Member ({holdingsFlat.length})
                </button>
              </div>
            }
            rowActions={(r) => {
              const m = members.find((mem) => mem.user_id === r.user_id);
              return [
                {
                  label: 'Buka portofolio member',
                  hint: r.user_name,
                  onClick: () => m && onSelectMember(m),
                },
              ];
            }}
            rowActionsHeader={(r) => `${r.displaySymbol} · ${r.user_name}`}
            defaultSort={{ key: 'marketValueIdr', dir: 'desc' }}
            searchPlaceholder="Cari emiten, nama saham, atau nama member…"
            emptyText="Belum ada posisi saham atau crypto aktif."
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. DASHBOARD VIEW (?view=dashboard) — Exact Steyer .grid-dash Layout
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
  onSelectDeposit: (d: EnrichedDepositRecord) => void;
  onSelectMember: (m: MemberPortfolioItem) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const { today, deposits, members, holdingsFlat, summary } = state;
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingDeposits = useMemo(
    () => deposits.filter((d) => d.status === 'PENDING'),
    [deposits]
  );

  const totalCashRdn = useMemo(
    () => members.reduce((sum, m) => sum + (Number(m.cash) || 0), 0),
    [members]
  );
  const totalNetWorthAum = useMemo(
    () => members.reduce((sum, m) => sum + (Number(m.totalAssetValue) || 0), 0),
    [members]
  );

  // Build 14-day revenue series
  const series: AreaPoint[] = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
    return days.map((d) => {
      const dayDeps = deposits.filter(
        (x) => String(x.created_at || '').slice(0, 10) === d
      );
      const approvedRevenueIdr = dayDeps
        .filter((x) => x.status === 'APPROVED')
        .reduce((s, x) => s + x.realRevenueIdr, 0);
      const pendingRevenueIdr = dayDeps
        .filter((x) => x.status === 'PENDING')
        .reduce((s, x) => s + x.realRevenueIdr, 0);
      const virtualDisbursedIdr = dayDeps
        .filter((x) => x.status === 'APPROVED')
        .reduce((s, x) => s + x.virtualCashIdr, 0);

      return {
        date: d,
        approvedRevenueIdr,
        pendingRevenueIdr,
        virtualDisbursedIdr,
        txCount: dayDeps.length,
      };
    });
  }, [today, deposits]);

  const handleQuickApprove = async (d: EnrichedDepositRecord) => {
    setBusyId(d.id);
    try {
      const res = await approveDeposit(d.id);
      if (res.success) {
        showToast(
          `Approved! Pendapatan +${fmtIdr(d.realRevenueIdr)} tercatat ke kas website.`
        );
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menyetujui deposit', true);
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid-dash">
      {/* Top 6 KPI Strip inside .grid-dash .kpis */}
      <div className="kpis">
        <div className="kpi" onClick={() => onNav('deposits')} style={{ cursor: 'pointer' }}>
          <span>Pendapatan Deposit (Approved)</span>
          <b style={{ color: 'var(--green)' }}>
            {fmtIdr(summary.totalApprovedRevenueIdr)}
            <small>{summary.approvedCount} lunas</small>
          </b>
        </div>
        <div className="kpi" onClick={() => onNav('deposits')} style={{ cursor: 'pointer' }}>
          <span>Menunggu Verifikasi (Pending)</span>
          <b style={{ color: summary.pendingCount > 0 ? 'var(--amber)' : undefined }}>
            {fmtIdr(summary.totalPendingRevenueIdr)}
            <small>{summary.pendingCount} tiket</small>
          </b>
        </div>
        <div className="kpi" onClick={() => onNav('deposits')} style={{ cursor: 'pointer' }}>
          <span>Pendapatan Hari Ini</span>
          <b>
            {fmtIdr(summary.todayApprovedRevenueIdr)}
            <small>{fmtDateShort(today)}</small>
          </b>
        </div>
        <div className="kpi" onClick={() => onNav('portfolios')} style={{ cursor: 'pointer' }}>
          <span>Total Saldo RDN Member</span>
          <b>
            {fmtIdrCompact(totalCashRdn)}
            <small>Kas virtual</small>
          </b>
        </div>
        <div className="kpi" onClick={() => onNav('portfolios')} style={{ cursor: 'pointer' }}>
          <span>Total Ekuitas Portofolio</span>
          <b>
            {fmtIdrCompact(totalNetWorthAum)}
            <small>AUM</small>
          </b>
        </div>
        <div className="kpi" onClick={() => onNav('equipment')} style={{ cursor: 'pointer' }}>
          <span>Total Member & Posisi</span>
          <b>
            {members.length} member
            <small>{holdingsFlat.length} posisi saham</small>
          </b>
        </div>
      </div>

      {/* Main 14-Day Revenue Chart (2 columns wide) */}
      <div className="card span2">
        <div className="card-h">
          <h2>Grafik Pendapatan Deposit Website · 14 Hari Terakhir</h2>
          <div className="tools">
            <span className="bdg green">
              Total Approved: {fmtIdr(summary.totalApprovedRevenueIdr)}
            </span>
          </div>
        </div>
        <AreaChart series={series} today={today} />
      </div>

      {/* Right Live Feed Card */}
      <div className="card">
        <div className="card-h">
          <h2>Transaksi Deposit Terbaru</h2>
          <button type="button" className="lnk small" onClick={() => onNav('deposits')}>
            Semua ({deposits.length}) →
          </button>
        </div>
        <ul className="feed">
          {deposits.slice(0, 6).map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => onSelectDeposit(d)}>
                <StatusBadge status={d.status} />
                <span className="feed-t">
                  <b style={{ color: 'var(--head)', fontWeight: 500 }}>
                    {d.user?.full_name || 'Member'}
                  </b>{' '}
                  · <span className="ok-t mono">{fmtIdr(d.realRevenueIdr)}</span>
                  <span className="block muted small">
                    {d.payment_method} → RDN {fmtIdrCompact(d.virtualCashIdr)}
                  </span>
                </span>
                <small>{fmtDateShort(d.created_at)}</small>
              </button>
            </li>
          ))}
          {deposits.length === 0 && (
            <li className="muted small" style={{ padding: '14px 0' }}>
              Belum ada tiket deposit masuk.
            </li>
          )}
        </ul>
      </div>

      {/* Bottom Left: Pending Deposit Approval Queue */}
      <div className="card span2">
        <div className="card-h">
          <h2>Antrean Verifikasi Deposit Member ({pendingDeposits.length})</h2>
          <button type="button" className="lnk small" onClick={() => onNav('deposits')}>
            Buka Menu Approval →
          </button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID Tiket</th>
                <th>Member</th>
                <th>Metode</th>
                <th className="num">Pendapatan Website (Bayar)</th>
                <th className="num">Saldo RDN Member</th>
                <th className="num act">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              {pendingDeposits.slice(0, 6).map((d) => (
                <tr
                  key={d.id}
                  className="click pending"
                  onClick={() => onSelectDeposit(d)}
                >
                  <td className="mono muted">#{d.id.slice(0, 8)}</td>
                  <td>
                    <b style={{ color: 'var(--head)', fontWeight: 500 }}>
                      {d.user?.full_name || 'Member'}
                    </b>
                    <span className="block muted small mono">
                      {d.user?.email || d.user_id}
                    </span>
                  </td>
                  <td>
                    <span className="bdg blue">{d.payment_method}</span>
                  </td>
                  <td className="num mono ok-t">
                    <b>{fmtIdr(d.realRevenueIdr)}</b>
                  </td>
                  <td className="num mono">{fmtIdr(d.virtualCashIdr)}</td>
                  <td className="num act" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn-s sm primary"
                      disabled={busyId === d.id}
                      onClick={() => handleQuickApprove(d)}
                    >
                      {busyId === d.id ? '...' : '✓ Approve'}
                    </button>
                  </td>
                </tr>
              ))}
              {pendingDeposits.length === 0 && (
                <tr>
                  <td colSpan={6} className="dt-empty muted">
                    Semua antrean deposit sudah diverifikasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Right: Top Member Portfolios */}
      <div className="card">
        <div className="card-h">
          <h2>Portofolio Member Terbesar</h2>
          <button type="button" className="lnk small" onClick={() => onNav('portfolios')}>
            Semua ({members.length}) →
          </button>
        </div>
        <ul className="list">
          {[...members]
            .sort((a, b) => b.totalAssetValue - a.totalAssetValue)
            .slice(0, 6)
            .map((m, idx) => (
              <li
                key={m.user_id}
                className="click"
                onClick={() => onSelectMember(m)}
              >
                <span className="mono muted">#{idx + 1}</span>
                <span>
                  <b style={{ color: 'var(--head)', fontWeight: 500 }}>{m.full_name}</b>
                  <small className="block muted mono">{m.email}</small>
                </span>
                <span className="mono">
                  <b style={{ color: 'var(--head)' }}>
                    {fmtIdrCompact(m.totalAssetValue)}
                  </b>
                  <small className="block muted">{m.holdings.length} emiten</small>
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// 3. DEPOSITS & REVENUE VIEW (?view=deposits)
// ============================================================================
function DepositsView({
  state,
  onSelectDeposit,
  onRefresh,
  showToast,
}: {
  state: TradingAdminState;
  onSelectDeposit: (d: EnrichedDepositRecord) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const { deposits, members, summary } = state;
  const [newOpen, setNewOpen] = useState(false);
  const [simUserId, setSimUserId] = useState(members[0]?.user_id || '');
  const [simPayIdr, setSimPayIdr] = useState('50000');
  const [simMethod, setSimMethod] = useState('QRIS');
  const [busy, setBusy] = useState(false);

  const handleApprove = async (d: EnrichedDepositRecord) => {
    setBusy(true);
    try {
      const res = await approveDeposit(d.id);
      if (res.success) {
        showToast(
          `Deposit disetujui! Pendapatan +${fmtIdr(d.realRevenueIdr)} tercatat.`
        );
        onRefresh();
      } else {
        showToast(res.error || 'Gagal menyetujui deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (d: EnrichedDepositRecord) => {
    const reason = window.prompt(
      'Masukkan alasan penolakan deposit:',
      'Bukti transfer tidak valid atau dana belum masuk'
    );
    if (reason === null) return;
    setBusy(true);
    try {
      const res = await rejectDeposit(d.id, reason);
      if (res.success) {
        showToast('Deposit berhasil ditolak.');
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
      showToast('Pilih member terlebih dahulu', true);
      return;
    }
    const payAmt = Number(simPayIdr);
    if (!payAmt || payAmt <= 0) {
      showToast('Masukkan nominal pembayaran yang valid', true);
      return;
    }
    const virtualCashAmt = payAmt < 1_000_000 ? payAmt * 100 : payAmt;
    setBusy(true);
    try {
      const res = await createDepositRequest(simUserId.trim(), virtualCashAmt, simMethod);
      if (res.success) {
        showToast(
          `Tiket deposit dibuat: Bayar ${fmtIdr(payAmt)} → RDN ${fmtIdr(virtualCashAmt)}`
        );
        setNewOpen(false);
        onRefresh();
      } else {
        showToast(res.error || 'Gagal membuat tiket deposit', true);
      }
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<EnrichedDepositRecord>[] = [
    {
      key: 'id',
      label: 'ID Tiket',
      width: 95,
      value: (r) => r.id,
      render: (r) => <span className="mono muted">#{r.id.slice(0, 8)}</span>,
      filter: { type: 'text', placeholder: 'ID…' },
    },
    {
      key: 'member',
      label: 'Member & Email',
      value: (r) => `${r.user?.full_name || 'Member'} ${r.user?.email || r.user_id}`,
      render: (r) => (
        <div>
          <b style={{ color: 'var(--head)', fontWeight: 500 }}>
            {r.user?.full_name || 'Member'}
          </b>
          <span className="block muted small mono">{r.user?.email || r.user_id}</span>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Cari member…' },
    },
    {
      key: 'payment_method',
      label: 'Bank / Metode',
      width: 125,
      value: (r) => r.payment_method,
      render: (r) => <span className="bdg blue">{r.payment_method}</span>,
      filter: { type: 'text', placeholder: 'Metode…' },
    },
    {
      key: 'realRevenueIdr',
      label: 'Pendapatan Website (Bayar IDR)',
      num: true,
      width: 195,
      value: (r) => r.realRevenueIdr,
      render: (r) => (
        <div>
          <b className="mono ok-t" style={{ fontWeight: 600 }}>
            {fmtIdr(r.realRevenueIdr)}
          </b>
          <span className="block muted small">{r.packageName}</span>
        </div>
      ),
    },
    {
      key: 'virtualCashIdr',
      label: 'Saldo RDN Member (Virtual)',
      num: true,
      width: 175,
      value: (r) => r.virtualCashIdr,
      render: (r) => <span className="mono">{fmtIdr(r.virtualCashIdr)}</span>,
    },
    {
      key: 'created_at',
      label: 'Waktu Masuk',
      width: 140,
      value: (r) => r.created_at,
      render: (r) => <span className="mono muted">{fmtDateTime(r.created_at)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: 115,
      value: (r) => r.status,
      render: (r) => <StatusBadge status={r.status} />,
      filter: {
        type: 'select',
        placeholder: 'Semua Status',
        options: [
          { value: 'PENDING', label: 'PENDING' },
          { value: 'APPROVED', label: 'APPROVED' },
          { value: 'REJECTED', label: 'REJECTED' },
        ],
      },
    },
  ];

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi">
          <span>Total Pendapatan Website (Approved)</span>
          <b style={{ color: 'var(--green)' }}>
            {fmtIdr(summary.totalApprovedRevenueIdr)}
            <small>{summary.approvedCount} tiket lunas</small>
          </b>
        </div>
        <div className="kpi">
          <span>Potensi Pendapatan (Pending)</span>
          <b style={{ color: summary.pendingCount > 0 ? 'var(--amber)' : undefined }}>
            {fmtIdr(summary.totalPendingRevenueIdr)}
            <small>{summary.pendingCount} menunggu approval</small>
          </b>
        </div>
        <div className="kpi">
          <span>Pendapatan Hari Ini</span>
          <b>
            {fmtIdr(summary.todayApprovedRevenueIdr)}
            <small>Hari ini</small>
          </b>
        </div>
        <div className="kpi">
          <span>Total Saldo RDN Tersalurkan</span>
          <b>
            {fmtIdrCompact(summary.totalVirtualDisbursedIdr)}
            <small>Ke wallet member</small>
          </b>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>Antrean Verifikasi Deposit & Laporan Pendapatan Website</h2>
          <div className="tools">
            <button
              type="button"
              className="btn-s sm"
              onClick={() => setNewOpen((v) => !v)}
            >
              {Icons.plus}
              <span>{newOpen ? 'Tutup Form' : 'Buat Tiket Deposit'}</span>
            </button>
            <button type="button" className="btn-s sm primary" onClick={onRefresh}>
              {Icons.refresh}
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {newOpen && (
          <form className="form-row" onSubmit={handleCreateSim}>
            <label className="fld grow">
              <span>Pilih Member</span>
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
            </label>
            <label className="fld">
              <span>Paket Pembayaran (Pendapatan IDR)</span>
              <select
                value={simPayIdr}
                onChange={(e) => setSimPayIdr(e.target.value)}
              >
                <option value="10000">Bayar Rp 10.000 → RDN Rp 1.000.000</option>
                <option value="20000">Bayar Rp 20.000 → RDN Rp 2.000.000</option>
                <option value="50000">Bayar Rp 50.000 → RDN Rp 5.000.000</option>
                <option value="100000">Bayar Rp 100.000 → RDN Rp 10.000.000</option>
                <option value="200000">Bayar Rp 200.000 → RDN Rp 20.000.000</option>
                <option value="500000">Bayar Rp 500.000 → RDN Rp 50.000.000</option>
              </select>
            </label>
            <label className="fld">
              <span>Metode Pembayaran</span>
              <select value={simMethod} onChange={(e) => setSimMethod(e.target.value)}>
                <option value="QRIS">QRIS</option>
                <option value="BCA">BCA</option>
                <option value="Bank Mandiri">Bank Mandiri</option>
                <option value="BRI">BRI</option>
                <option value="GoPay">GoPay</option>
                <option value="DANA">DANA</option>
              </select>
            </label>
            <button type="submit" className="btn-s primary" disabled={busy}>
              Simpan Tiket
            </button>
          </form>
        )}

        <DataTable
          columns={columns}
          rows={deposits}
          onRowClick={onSelectDeposit}
          renderInlineActions={(r) =>
            r.status === 'PENDING' ? (
              <>
                <button
                  type="button"
                  className="btn-s sm primary"
                  disabled={busy}
                  onClick={() => handleApprove(r)}
                >
                  ✓ Approve
                </button>
                <button
                  type="button"
                  className="btn-s sm danger"
                  disabled={busy}
                  onClick={() => handleReject(r)}
                >
                  Tolak
                </button>
              </>
            ) : null
          }
          rowActions={(r) => [
            {
              label: 'Periksa rincian & bukti transfer',
              hint: 'Enter',
              onClick: () => onSelectDeposit(r),
            },
            { sep: true },
            {
              label: `Approve (+${fmtIdr(r.realRevenueIdr)})`,
              disabled: r.status !== 'PENDING' || busy,
              onClick: () => handleApprove(r),
            },
            {
              label: 'Tolak permohonan deposit…',
              danger: true,
              disabled: r.status !== 'PENDING' || busy,
              onClick: () => handleReject(r),
            },
          ]}
          rowActionsHeader={(r) =>
            `Tiket #${r.id.slice(0, 8)} · ${r.user?.full_name || 'Member'}`
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
// 4. PORTFOLIOS VIEW (?view=portfolios) — Member Portfolios & Account Control
// ============================================================================
function PortfoliosView({
  members,
  deposits,
  onSelectMember,
  onRefresh,
  showToast,
}: {
  members: MemberPortfolioItem[];
  deposits: EnrichedDepositRecord[];
  onSelectMember: (m: MemberPortfolioItem) => void;
  onRefresh: () => void;
  showToast: (msg: string, isErr?: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const totalCash = members.reduce((s, m) => s + (Number(m.cash) || 0), 0);
  const totalNetWorth = members.reduce((s, m) => s + (Number(m.totalAssetValue) || 0), 0);

  // Calculate total real deposit revenue contributed per member
  const memberRevenueMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of deposits) {
      if (d.status !== 'APPROVED') continue;
      const uid = d.user_id;
      const email = d.user?.email?.toLowerCase();
      if (uid) map.set(uid, (map.get(uid) || 0) + d.realRevenueIdr);
      if (email) map.set(email, (map.get(email) || 0) + d.realRevenueIdr);
    }
    return map;
  }, [deposits]);

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
      key: 'full_name',
      label: 'Member & Email',
      value: (r) => `${r.full_name} ${r.email} ${r.user_id}`,
      render: (r) => (
        <div>
          <b style={{ color: 'var(--head)', fontWeight: 500 }}>{r.full_name}</b>
          <span className="block muted small mono">{r.email}</span>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Nama / email…' },
    },
    {
      key: 'role',
      label: 'Role',
      width: 90,
      value: (r) => r.role,
      render: (r) => (
        <span className={`bdg ${r.role === 'admin' ? 'violet' : ''}`}>
          {r.role.toUpperCase()}
        </span>
      ),
      filter: {
        type: 'select',
        placeholder: 'Semua',
        options: [
          { value: 'member', label: 'Member' },
          { value: 'admin', label: 'Admin' },
        ],
      },
    },
    {
      key: 'contributedRevenue',
      label: 'Total Deposit Dibayar (IDR)',
      num: true,
      width: 170,
      value: (r) =>
        memberRevenueMap.get(r.user_id) ||
        memberRevenueMap.get(r.email.toLowerCase()) ||
        0,
      render: (r) => {
        const rev =
          memberRevenueMap.get(r.user_id) ||
          memberRevenueMap.get(r.email.toLowerCase()) ||
          0;
        return rev > 0 ? (
          <b className="mono ok-t">{fmtIdr(rev)}</b>
        ) : (
          <span className="muted mono">Rp 0</span>
        );
      },
    },
    {
      key: 'cash',
      label: 'Saldo Kas RDN (Virtual)',
      num: true,
      width: 165,
      value: (r) => Number(r.cash) || 0,
      render: (r) => <b className="mono">{fmtIdr(r.cash)}</b>,
    },
    {
      key: 'totalMarketValue',
      label: 'Nilai Aset Saham/Crypto',
      num: true,
      width: 170,
      value: (r) => Number(r.totalMarketValue) || 0,
      render: (r) => (
        <div>
          <span className="mono">{fmtIdr(r.totalMarketValue)}</span>
          <span className="block muted small">{r.holdings.length} emiten dimiliki</span>
        </div>
      ),
    },
    {
      key: 'totalAssetValue',
      label: 'Total Net Worth',
      num: true,
      width: 170,
      value: (r) => Number(r.totalAssetValue) || 0,
      render: (r) => (
        <b className="mono" style={{ color: 'var(--head)' }}>
          {fmtIdr(r.totalAssetValue)}
        </b>
      ),
    },
  ];

  return (
    <div className="stack">
      <div className="kpis">
        <div className="kpi">
          <span>Total Member Terdaftar</span>
          <b>
            {members.length}
            <small>Akun aktif</small>
          </b>
        </div>
        <div className="kpi">
          <span>Total Saldo Kas RDN Member</span>
          <b style={{ color: 'var(--green)' }}>
            {fmtIdrCompact(totalCash)}
            <small>Di seluruh wallet</small>
          </b>
        </div>
        <div className="kpi">
          <span>Total Ekuitas Bersih (Net Worth)</span>
          <b>
            {fmtIdrCompact(totalNetWorth)}
            <small>Cash + Saham/Crypto</small>
          </b>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h2>Monitoring Portofolio, Kontribusi Deposit & Manajemen Member</h2>
          <div className="tools">
            <button
              type="button"
              className="btn-s sm"
              disabled={busy}
              onClick={handleSyncMyAccount}
            >
              ⇄ Sinkronkan Akun Saya
            </button>
            <button type="button" className="btn-s sm primary" onClick={onRefresh}>
              {Icons.refresh}
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={members}
          rowKey={(r) => r.user_id}
          onRowClick={onSelectMember}
          renderInlineActions={(r) => (
            <>
              <button
                type="button"
                className="btn-s sm"
                onClick={() => onSelectMember(r)}
              >
                Detail
              </button>
              <button
                type="button"
                className="btn-s sm"
                onClick={() => handleResetZero(r)}
              >
                Reset 0
              </button>
            </>
          )}
          rowActions={(r) => [
            {
              label: 'Lihat rincian portofolio member',
              hint: 'Enter',
              onClick: () => onSelectMember(r),
            },
            { sep: true },
            {
              label: 'Ganti / Force Reset Password…',
              disabled: busy,
              onClick: () => handleResetPassword(r),
            },
            {
              label: 'Reset Saldo & Portofolio ke Rp 0',
              disabled: busy,
              onClick: () => handleResetZero(r),
            },
            { sep: true },
            {
              label: 'Hapus akun member permanen',
              danger: true,
              disabled: busy || r.role === 'admin',
              onClick: () => handleDeleteMember(r),
            },
          ]}
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
// 5. ORDERS & ACTIVITY TAPE VIEW (?view=orders) — Exact Steyer .tape classes
// ============================================================================
function OrdersTapeView({
  state,
  onSelectMember,
  onSelectDeposit,
  onRefresh,
}: {
  state: TradingAdminState;
  onSelectMember: (m: MemberPortfolioItem) => void;
  onSelectDeposit: (d: EnrichedDepositRecord) => void;
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
      width: 100,
      value: (r) => r.id,
      render: (r) => <span className="mono muted">#{r.id.slice(0, 8)}</span>,
    },
    {
      key: 'createdAt',
      label: 'Waktu',
      width: 140,
      value: (r) => r.createdAt,
      render: (r) => <span className="mono muted">{fmtDateTime(r.createdAt)}</span>,
    },
    {
      key: 'user_name',
      label: 'Member',
      value: (r) => `${r.user_name} ${r.user_email}`,
      render: (r) => (
        <div>
          <b style={{ color: 'var(--head)', fontWeight: 500 }}>{r.user_name}</b>
          <span className="block muted small mono">{r.user_email}</span>
        </div>
      ),
      filter: { type: 'text', placeholder: 'Member…' },
    },
    {
      key: 'type',
      label: 'Tipe',
      width: 105,
      value: (r) => r.type,
      render: (r) => (
        <span
          className={`bdg ${
            r.type === 'BUY' || r.type === 'DEPOSIT' ? 'green' : 'red'
          }`}
        >
          {r.type}
        </span>
      ),
      filter: {
        type: 'select',
        placeholder: 'Semua',
        options: [
          { value: 'DEPOSIT', label: 'DEPOSIT' },
          { value: 'BUY', label: 'BUY' },
          { value: 'SELL', label: 'SELL' },
        ],
      },
    },
    {
      key: 'displaySymbol',
      label: 'Instrumen',
      width: 130,
      value: (r) => r.displaySymbol,
      render: (r) => (
        <b className="mono" style={{ color: 'var(--head)' }}>
          {r.displaySymbol}
        </b>
      ),
      filter: { type: 'text', placeholder: 'Ticker…' },
    },
    {
      key: 'realRevenueIdr',
      label: 'Pendapatan Deposit (IDR)',
      num: true,
      width: 165,
      value: (r) => r.realRevenueIdr || 0,
      render: (r) =>
        r.type === 'DEPOSIT' && r.realRevenueIdr ? (
          <b className="mono ok-t">{fmtIdr(r.realRevenueIdr)}</b>
        ) : (
          <span className="muted">—</span>
        ),
    },
    {
      key: 'total',
      label: 'Nilai RDN / Transaksi',
      num: true,
      width: 165,
      value: (r) => r.total,
      render: (r) => <b className="mono">{fmtIdr(r.total)}</b>,
    },
    {
      key: 'status',
      label: 'Status',
      width: 115,
      value: (r) => r.status,
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const colW = 54;

  return (
    <div className="stack">
      <div className="card">
        <div className="card-h">
          <h2>Peta Aktivitas Deposit & Order Member · 14 Hari Terakhir</h2>
          <div className="legend">
            <span>
              <i className="bar-k checked_in" /> Deposit Approved / Buy
            </span>
            <span>
              <i className="bar-k confirmed" /> Transaksi Aktif
            </span>
          </div>
        </div>

        <div className="tape-wrap">
          <div
            className="tape"
            style={{
              gridTemplateColumns: `210px repeat(${days.length}, ${colW}px)`,
            }}
          >
            <div className="tape-h corner">Member</div>
            {days.map((d) => {
              const isWe = [0, 6].includes(new Date(d + 'T12:00:00Z').getUTCDay());
              return (
                <div
                  key={d}
                  className={`tape-h ${d === today ? 'today' : ''} ${
                    isWe ? 'we' : ''
                  }`}
                >
                  {fmtWeekday(d)}
                  <small>{d.slice(8, 10)}</small>
                </div>
              );
            })}

            {members.slice(0, 12).map((m) => {
              const memberOrders = orders.filter(
                (o) =>
                  o.user_id === m.user_id ||
                  o.user_email.toLowerCase() === m.email.toLowerCase()
              );
              return (
                <React.Fragment key={m.user_id}>
                  <div
                    className="tape-u"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectMember(m)}
                  >
                    <div className="clip">
                      <b>{m.full_name}</b>{' '}
                      <small className="muted">({fmtIdrCompact(m.totalAssetValue)})</small>
                    </div>
                  </div>
                  <div
                    className="tape-track"
                    style={{
                      gridColumn: `2 / span ${days.length}`,
                    }}
                  >
                    {days.map((d, idx) => {
                      const isWe = [0, 6].includes(
                        new Date(d + 'T12:00:00Z').getUTCDay()
                      );
                      const dayTx = memberOrders.filter(
                        (o) => String(o.createdAt || '').slice(0, 10) === d
                      );
                      return (
                        <React.Fragment key={d}>
                          <i
                            className={`${isWe ? 'we' : ''} ${
                              d === today ? 'today' : ''
                            }`}
                            style={{ left: idx * colW, width: colW }}
                          />
                          {dayTx.length > 0 && (
                            <button
                              type="button"
                              className={`bar ${
                                dayTx.some((x) => x.type === 'DEPOSIT')
                                  ? 'checked_in'
                                  : 'confirmed'
                              }`}
                              style={{
                                left: idx * colW + 3,
                                width: colW - 6,
                              }}
                              onClick={() => onSelectMember(m)}
                              title={`${m.full_name} (${d}): ${dayTx.length} transaksi`}
                            >
                              {dayTx.length} tx
                            </button>
                          )}
                        </React.Fragment>
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
        <div className="card-h">
          <h2>Riwayat Seluruh Order & Transaksi Deposit ({orders.length})</h2>
          <button type="button" className="btn-s sm" onClick={onRefresh}>
            {Icons.refresh}
            <span>Refresh Ledger</span>
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
          searchPlaceholder="Cari ID order, nama member, ticker…"
          emptyText="Belum ada riwayat order atau transaksi."
        />
      </div>
    </div>
  );
}

// ============================================================================
// Slide-Over Detail Sheets (Uses exact Steyer .scrim, .sheet, .sheet-h, .sheet-b, .dl)
// ============================================================================
function DepositSheet({
  deposit,
  onClose,
  onRefresh,
  showToast,
}: {
  deposit: EnrichedDepositRecord;
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
        showToast(
          `Deposit disetujui! Pendapatan +${fmtIdr(deposit.realRevenueIdr)} tercatat.`
        );
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
        showToast('Deposit ditolak.');
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
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet">
        <div className="sheet-h">
          <h2>Tiket Deposit #{deposit.id.slice(0, 8)}</h2>
          <button type="button" className="ibtn ghost-i" onClick={onClose}>
            {Icons.close}
          </button>
        </div>

        <div className="sheet-b">
          <div className="sheet-status">
            <div>
              <b style={{ color: 'var(--head)', fontSize: 15 }}>
                {deposit.user?.full_name || 'Member'}
              </b>
              <div className="muted small mono">
                {deposit.user?.email || deposit.user_id}
              </div>
            </div>
            <StatusBadge status={deposit.status} />
          </div>

          <dl className="dl">
            <div>
              <dt>Paket Top-Up</dt>
              <dd>{deposit.packageName}</dd>
            </div>
            <div>
              <dt>Pendapatan Website</dt>
              <dd className="mono ok-t">
                <b>{fmtIdr(deposit.realRevenueIdr)}</b> (Uang Masuk Asli)
              </dd>
            </div>
            <div>
              <dt>Saldo RDN Member</dt>
              <dd className="mono">
                <b>{fmtIdr(deposit.virtualCashIdr)}</b> (Saldo Virtual)
              </dd>
            </div>
            <div>
              <dt>Metode / Channel</dt>
              <dd>
                <span className="bdg blue">{deposit.payment_method}</span>
              </dd>
            </div>
            <div>
              <dt>Waktu Pengajuan</dt>
              <dd className="mono">{fmtDateTime(deposit.created_at)}</dd>
            </div>
            {deposit.approved_at && (
              <div>
                <dt>Waktu Disetujui</dt>
                <dd className="mono">{fmtDateTime(deposit.approved_at)}</dd>
              </div>
            )}
          </dl>

          {deposit.notes && (
            <div>
              <div className="sub">Catatan Transaksi</div>
              <p className="msg" style={{ marginTop: 6 }}>
                {deposit.notes}
              </p>
            </div>
          )}

          {deposit.proof_url && (
            <div>
              <div className="sub">Bukti Transfer</div>
              <div style={{ marginTop: 8 }}>
                <a
                  href={deposit.proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-s"
                >
                  Buka Bukti Transfer ↗
                </a>
              </div>
            </div>
          )}

          {deposit.status === 'PENDING' && (
            <div>
              <div className="sub">Keputusan Verifikasi Admin</div>
              <div className="sheet-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-s primary"
                  disabled={busy}
                  onClick={handleApprove}
                >
                  ✓ Approve & Tambah Saldo RDN
                </button>
                <button
                  type="button"
                  className="btn-s danger"
                  disabled={busy}
                  onClick={handleReject}
                >
                  ✕ Tolak Tiket
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
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
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="sheet">
        <div className="sheet-h">
          <h2>Portofolio · {member.full_name}</h2>
          <button type="button" className="ibtn ghost-i" onClick={onClose}>
            {Icons.close}
          </button>
        </div>

        <div className="sheet-b">
          <div className="sheet-status">
            <div>
              <b style={{ color: 'var(--head)', fontSize: 15 }}>{member.full_name}</b>
              <div className="muted small mono">{member.email}</div>
            </div>
            <span className="bdg blue">{member.role.toUpperCase()}</span>
          </div>

          <dl className="dl">
            <div>
              <dt>User ID</dt>
              <dd className="mono">{member.user_id}</dd>
            </div>
            <div>
              <dt>Saldo Kas RDN</dt>
              <dd className="mono ok-t">
                <b>{fmtIdr(member.cash)}</b>
              </dd>
            </div>
            <div>
              <dt>Realized P/L</dt>
              <dd className={`mono ${member.realized_pl >= 0 ? 'ok-t' : 'err-t'}`}>
                {member.realized_pl >= 0 ? '+' : ''}
                {fmtIdr(member.realized_pl)}
              </dd>
            </div>
            <div>
              <dt>Nilai Aset Pasar</dt>
              <dd className="mono">{fmtIdr(member.totalMarketValue)}</dd>
            </div>
            <div>
              <dt>Total Net Worth</dt>
              <dd className="mono">
                <b>{fmtIdr(member.totalAssetValue)}</b>
              </dd>
            </div>
          </dl>

          <div>
            <div className="sub">Kepemilikan Aset ({member.holdings.length})</div>
            {member.holdings.length === 0 ? (
              <div className="muted small" style={{ marginTop: 8 }}>
                Member belum memiliki aset saham/crypto (100% Kas RDN).
              </div>
            ) : (
              <table className="tbl" style={{ marginTop: 6 }}>
                <thead>
                  <tr>
                    <th>Emiten</th>
                    <th className="num">Qty</th>
                    <th className="num">Market Value</th>
                  </tr>
                </thead>
                <tbody>
                  {member.holdings.map((h, i) => {
                    const isForeign =
                      h.currency === 'USD' ||
                      h.currency === 'USDT' ||
                      h.assetClass === 'US' ||
                      h.assetClass === 'CRYPTO';
                    const shares =
                      (h.shares || 0) > 0
                        ? h.shares
                        : (h.lots || 0) * (isForeign ? 1 : 100);
                    const curPrice = h.currentPrice || h.avgPrice;
                    const rate = isForeign ? (h as any).exchangeRate || 16000 : 1;
                    const mv = shares * curPrice * rate;
                    const unPl = Math.round((curPrice - h.avgPrice) * shares * rate);
                    return (
                      <tr key={i}>
                        <td>
                          <b className="mono" style={{ color: 'var(--head)' }}>
                            {h.displaySymbol || h.symbol}
                          </b>
                        </td>
                        <td className="num mono">
                          {isForeign ? `${shares} u` : `${h.lots} lot`}
                        </td>
                        <td className="num mono">
                          <div>{fmtIdrCompact(mv)}</div>
                          <small className={unPl >= 0 ? 'ok-t' : 'err-t'}>
                            {unPl >= 0 ? '+' : ''}
                            {fmtIdrCompact(unPl)}
                          </small>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <div className="sub">Tindakan Administrator</div>
            <div className="sheet-actions" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn-s danger"
                disabled={busy}
                onClick={handleResetZero}
              >
                Reset Saldo & Portofolio ke Rp 0
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// Quick Tour Overlay (Uses exact Steyer .tour, .tour-card, .tour-n, .tour-actions)
// ============================================================================
const TOUR_STEPS: Array<{ view: AdminViewId; title: string; body: string }> = [
  {
    view: 'equipment',
    title: 'Matriks Pendapatan Deposit & Aset (?view=equipment)',
    body: 'Pantau pendapatan asli website (uang masuk IDR dari deposit member) selama 10 hari terakhir per metode pembayaran serta matriks posisi saham & crypto member.',
  },
  {
    view: 'dashboard',
    title: 'Executive Dashboard & Kurva Pendapatan',
    body: 'Ringkasan 6 KPI utama (Total Pendapatan Website Approved, Antrean Pending, Pendapatan Hari Ini, Kas RDN, dan Ekuitas Portofolio) beserta kurva 14 hari.',
  },
  {
    view: 'deposits',
    title: 'Verifikasi Deposit & Laporan Pendapatan',
    body: 'Setujui atau tolak permohonan top-up member secara atomik. Tabel memisahkan dengan jelas Pendapatan Website (uang asli IDR) dan Saldo RDN Virtual member.',
  },
  {
    view: 'portfolios',
    title: 'Monitoring Portofolio & Kontrol Akun Member',
    body: 'Pantau kontribusi deposit per member, rincian kepemilikan saham/crypto, ganti password, atau reset saldo akun ke Rp 0.',
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
      <div className="tour-dim" onClick={onClose} />
      <div
        className="tour-card"
        style={{ right: 24, bottom: 24 }}
      >
        <div className="tour-n">
          LANGKAH {step + 1} DARI {TOUR_STEPS.length}
        </div>
        <h2>{cur.title}</h2>
        <p>{cur.body}</p>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={onClose}>
            Tutup tur
          </button>
          <span>
            {step > 0 && (
              <button type="button" onClick={() => onStep(step - 1)}>
                ← Kembali
              </button>
            )}
            {step < TOUR_STEPS.length - 1 ? (
              <button
                type="button"
                className="tour-next"
                onClick={() => onStep(step + 1)}
              >
                Lanjut →
              </button>
            ) : (
              <button type="button" className="tour-next" onClick={onClose}>
                Selesai
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main SteyerAdminApp Shell Component (100% Exact Steyer CSS Classes)
// ============================================================================
export default function SteyerAdminApp({
  initialView = 'equipment',
}: {
  initialView?: AdminViewId;
}) {
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSideOpen, setMobileSideOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [state, setState] = useState<TradingAdminState | null>(null);
  const [toast, setToast] = useState<{ msg: string; isErr?: boolean } | null>(null);
  const [selectedDeposit, setSelectedDeposit] =
    useState<EnrichedDepositRecord | null>(null);
  const [selectedMember, setSelectedMember] =
    useState<MemberPortfolioItem | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setView(resolvedInitialView);
  }, [resolvedInitialView]);

  useEffect(() => {
    if (!roleMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [roleMenuOpen]);

  const showToast = useCallback((msg: string, isErr?: boolean) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(null), 3200);
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
    setMobileSideOpen(false);
    try {
      const url = new URL(window.location.href);
      url.pathname = '/admin';
      url.searchParams.set('view', v);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const changeRole = (r: RoleId) => {
    setRole(r);
    setRoleMenuOpen(false);
    const allowed = ROLES[r].views;
    if (!allowed.includes(view)) {
      navigateView(allowed[0]);
    }
  };

  if (!state) {
    return (
      <div className="steyer-scope">
        <div className="app" data-theme={theme}>
          <div className="app-loading">
            Memuat data trading & pendapatan deposit dari Supabase Cloud…
          </div>
        </div>
      </div>
    );
  }

  const pendingDepCount = state.summary.pendingCount;

  const allNav = [
    {
      group: 'Overview',
      items: [
        {
          id: 'dashboard' as AdminViewId,
          label: 'Dashboard & Revenue',
          icon: Icons.dashboard,
        },
      ],
    },
    {
      group: 'Operations & Treasury',
      items: [
        {
          id: 'equipment' as AdminViewId,
          label: 'Revenue & Assets Matrix',
          icon: Icons.equipment,
          badge: state.deposits.length || undefined,
        },
        {
          id: 'deposits' as AdminViewId,
          label: 'Deposit Approvals',
          icon: Icons.deposits,
          badge: pendingDepCount || undefined,
        },
        {
          id: 'portfolios' as AdminViewId,
          label: 'Member Portfolios',
          icon: Icons.portfolios,
          badge: state.members.length || undefined,
        },
        {
          id: 'orders' as AdminViewId,
          label: 'Order & Activity Tape',
          icon: Icons.orders,
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

  const currentTitle =
    allNav.flatMap((g) => g.items).find((i) => i.id === view)?.label ||
    'Revenue & Assets Matrix';

  return (
    <div className="steyer-scope">
      {/* Top Demo Bar (Exact Steyer Studio .demo-bar.compact > .wrap > p + nav) */}
      <div className="demo-bar compact">
        <div className="wrap">
          <p>
            TradeSim Pro Backoffice — Pendapatan Deposit Approved:{' '}
            <strong style={{ color: 'var(--head)' }}>
              {fmtIdr(state.summary.totalApprovedRevenueIdr)}
            </strong>
          </p>
          <nav>
            <button
              type="button"
              className="bar-link"
              onClick={() => {
                setTourStep(0);
                navigateView(TOUR_STEPS[0].view);
              }}
            >
              Quick tour
            </button>
            <button
              type="button"
              className="bar-link"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
            </button>
            <button type="button" className="bar-link" onClick={load}>
              ↻ Sync Supabase
            </button>
            <Link href="/">← Kembali ke Trading App</Link>
          </nav>
        </div>
      </div>

      {/* Main App Grid (Exact Steyer Studio .app[data-theme]) */}
      <div
        className={`app ${collapsed ? 'collapsed' : ''}`}
        data-theme={theme}
      >
        {mobileSideOpen && (
          <div
            className="scrim side-scrim show-phone"
            onClick={() => setMobileSideOpen(false)}
          />
        )}

        {/* Sidebar (Exact Steyer Studio .side > .side-btn.big + nav > .side-group + .side-foot) */}
        <aside className={`side ${mobileSideOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="side-btn big"
            onClick={() => navigateView('dashboard')}
          >
            <span className="logo">T</span>
            <span className="side-txt">
              <b>TradeSim Pro</b>
              <small>Backoffice & Revenue</small>
            </span>
          </button>

          <nav>
            {nav.map((g) => (
              <div key={g.group} className="side-group">
                <span className="side-txt">{g.group}</span>
                {g.items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    aria-current={view === it.id ? 'page' : undefined}
                    data-tip={it.label}
                    onClick={() => navigateView(it.id)}
                  >
                    {it.icon}
                    <span className="side-txt">{it.label}</span>
                    {it.badge !== undefined && <i>{it.badge}</i>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="side-foot">
            <div className="menu" ref={roleMenuRef}>
              <button
                type="button"
                className="side-btn big"
                aria-expanded={roleMenuOpen}
                onClick={() => setRoleMenuOpen((o) => !o)}
              >
                <span className="avatar">{ROLES[role].user[0]}</span>
                <span className="side-txt">
                  <b>{ROLES[role].user}</b>
                  <small>{ROLES[role].title}</small>
                </span>
                <span className="side-txt dim">{Icons.chevUpDown}</span>
              </button>

              {roleMenuOpen && (
                <div className="menu-pop at-top">
                  <div className="menu-label">Role Akses Desk</div>
                  {Object.values(ROLES).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="menu-item"
                      aria-checked={role === r.id}
                      onClick={() => changeRole(r.id)}
                    >
                      <div className="menu-acc">
                        <b>{r.user}</b>
                        <small>{r.label}</small>
                      </div>
                      {role === r.id && <span className="end">✓</span>}
                    </button>
                  ))}
                  <hr />
                  <button
                    type="button"
                    className="menu-item"
                    onClick={() => {
                      setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
                      setRoleMenuOpen(false);
                    }}
                  >
                    <span>
                      {theme === 'dark' ? '☀ Ganti ke Light Mode' : '☾ Ganti ke Dark Mode'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="menu-item danger"
                    onClick={logout}
                  >
                    <span>⎋ Logout Administrator</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Column (Exact Steyer Studio .main > .top + .content) */}
        <div className="main">
          <header className="top">
            <button
              type="button"
              className="ibtn ghost-i hide-phone"
              onClick={() => setCollapsed((c) => !c)}
              title="Toggle Sidebar"
            >
              {Icons.sidebar}
            </button>
            <button
              type="button"
              className="ibtn ghost-i show-phone"
              onClick={() => setMobileSideOpen((o) => !o)}
              title="Buka Menu"
            >
              {Icons.sidebar}
            </button>
            <div className="top-sep" />
            <div className="crumbs">
              <span className="muted hide-s">Backoffice</span>
              <span className="muted hide-s">/</span>
              <h1>{currentTitle}</h1>
            </div>
            <div className="top-r">
              <span className="live-dot hide-m">
                Pendapatan Deposit:{' '}
                <strong style={{ color: 'var(--green)' }}>
                  {fmtIdr(state.summary.totalApprovedRevenueIdr)}
                </strong>
              </span>
              <button
                type="button"
                className="btn-s primary"
                onClick={() => navigateView('deposits')}
              >
                Verifikasi Deposit ({pendingDepCount})
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
              <EquipmentRevenueAssetsView
                state={state}
                onSelectDeposit={setSelectedDeposit}
                onSelectMember={setSelectedMember}
                onRefresh={load}
                showToast={showToast}
              />
            )}
            {view === 'deposits' && (
              <DepositsView
                state={state}
                onSelectDeposit={setSelectedDeposit}
                onRefresh={load}
                showToast={showToast}
              />
            )}
            {view === 'portfolios' && (
              <PortfoliosView
                members={state.members}
                deposits={state.deposits}
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

        {toast && <div className="toast">{toast.msg}</div>}
      </div>
    </div>
  );
}
