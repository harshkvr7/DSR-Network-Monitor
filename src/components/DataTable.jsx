import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';

const PAGE_SIZES = [25, 50, 100];

const SEV_CLASS = {
  CRITICAL: 'badge-critical',
  MAJOR:    'badge-major',
  MINOR:    'badge-minor',
  WARNING:  'badge-warning',
  CLEAR:    'badge-clear',
};

function SeverityBadge({ value }) {
  const cls = SEV_CLASS[value] || '';
  return (
    <span className={`${cls} px-1.5 py-0.5 font-mono text-xs`} style={{ borderRadius: '1px', whiteSpace: 'nowrap' }}>
      {value || '—'}
    </span>
  );
}

function ErrInfoCell({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>—</span>;
  const isLong = text.length >= 80;
  return (
    <div>
      <div className="text-xs" style={{
        color: 'var(--text-secondary)',
        whiteSpace: expanded ? 'normal' : 'nowrap',
        overflow: expanded ? 'visible' : 'hidden',
        textOverflow: expanded ? 'unset' : 'ellipsis',
      }}>
        {expanded ? text : text.slice(0, 80) + (isLong ? '…' : '')}
      </div>
      {isLong && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          className="text-xs mt-0.5 flex items-center gap-0.5"
          style={{ color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          {expanded ? <><ChevronUp size={10} /> collapse</> : <><ChevronDown size={10} /> expand</>}
        </button>
      )}
    </div>
  );
}

export default function DataTable({ data }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortCol, setSortCol] = useState('TIMESTAMP');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = useCallback((col) => {
  if (col === sortCol) {
    setSortDir(d => d === 'asc' ? 'desc' : 'asc');
  } else {
    setSortCol(col);
    setSortDir('asc');
  }
  setPage(1);
}, [sortCol]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(row =>
      (row.TIMESTAMP    || '').toLowerCase().includes(q) ||
      (row.SEVERITY     || '').toLowerCase().includes(q) ||
      (row.SERVER       || '').toLowerCase().includes(q) ||
      (row.EVENT_NUMBER || '').toLowerCase().includes(q) ||
      (row.NAME         || '').toLowerCase().includes(q) ||
      (row.INSTANCE     || '').toLowerCase().includes(q) ||
      (row.ERR_INFO     || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = (a[sortCol] || '').toLowerCase();
      const vb = (b[sortCol] || '').toLowerCase();
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safeCurrentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const clearSearch = () => { setSearch(''); setPage(1); };

  const COLS = [
    { key: 'TIMESTAMP',    label: 'TIMESTAMP',    width: '180px' },
    { key: 'SEVERITY',     label: 'SEV',           width: '90px'  },
    { key: 'SERVER',       label: 'SERVER',        width: '180px' },
    { key: 'EVENT_NUMBER', label: 'EVENT_NUMBER',  width: '120px' },
    { key: 'NAME',         label: 'NAME',          width: '160px' },
    { key: 'INSTANCE',     label: 'INSTANCE',      width: '200px' },
    { key: 'ERR_INFO',     label: 'ERR_INFO',      width: '360px' },
  ];

  const TABLE_MIN_WIDTH = '1290px';

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>⇅</span>;
    return sortDir === 'asc'
      ? <ChevronUp size={11} style={{ color: 'var(--accent)' }} />
      : <ChevronDown size={11} style={{ color: 'var(--accent)' }} />;
  };

  const cellBase = { fontSize: '10px', color: 'var(--text-secondary)' };

  return (
    <div className="card flex flex-col animate-slide-in stagger-3" style={{ flex: 1, minHeight: 0 }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-dim)' }}>
          RAW EVENT LOG
          <span className="ml-3" style={{ color: 'var(--accent)' }}>{sorted.length.toLocaleString()} rows</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search size={12} className="absolute left-2" style={{ color: 'var(--text-dim)' }} />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search all columns…"
              className="font-mono text-xs pl-7 pr-7 py-1.5"
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: '1px',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '220px',
              }}
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-2" style={{ color: 'var(--text-dim)', cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
                <X size={12} />
              </button>
            )}
          </div>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="font-mono text-xs px-2 py-1.5"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: '1px',
              outline: 'none',
            }}
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: TABLE_MIN_WIDTH }}>
          <colgroup>
            {COLS.map(col => <col key={col.key} style={{ width: col.width }} />)}
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-base)' }}>
            <tr>
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-3 py-2 cursor-pointer select-none"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-base)',
                    fontSize: '10px',
                    color: sortCol === col.key ? 'var(--accent)' : 'var(--text-dim)',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={row.ID ?? i} className="data-row" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-3 py-2" style={{ ...cellBase, color: 'var(--text-dim)' }}>
                  {row.TIMESTAMP || '—'}
                </td>
                <td className="px-3 py-2">
                  <SeverityBadge value={row.SEVERITY} />
                </td>
                <td className="px-3 py-2" style={cellBase} title={row.SERVER}>
                  {row.SERVER || '—'}
                </td>
                <td className="px-3 py-2" style={cellBase}>
                  {row.EVENT_NUMBER || '—'}
                </td>
                <td className="px-3 py-2" style={cellBase} title={row.NAME}>
                  {row.NAME || '—'}
                </td>
                <td className="px-3 py-2" style={cellBase} title={row.INSTANCE}>
                  {row.INSTANCE || '—'}
                </td>
                <td className="px-3 py-2" style={{ ...cellBase, whiteSpace: 'normal', overflow: 'visible' }}>
                  <ErrInfoCell text={row.ERR_INFO} />
                </td>
              </tr>
            ))}
            {!pageRows.length && (
              <tr>
                <td colSpan={7} className="text-center py-16 text-xs" style={{ color: 'var(--text-dim)' }}>
                  No events match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Page {safeCurrentPage} of {totalPages}
          {' · '}
          rows {((safeCurrentPage - 1) * pageSize + 1).toLocaleString()}–{Math.min(safeCurrentPage * pageSize, sorted.length).toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={safeCurrentPage <= 1} className="px-2 py-1 text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage > 1 ? 'pointer' : 'not-allowed', opacity: safeCurrentPage > 1 ? 1 : 0.3 }}>«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage <= 1} className="px-2 py-1 text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage > 1 ? 'pointer' : 'not-allowed', opacity: safeCurrentPage > 1 ? 1 : 0.3 }}>
            <ChevronLeft size={12} /></button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) { pageNum = i + 1; }
            else if (safeCurrentPage <= 3) { pageNum = i + 1; }
            else if (safeCurrentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
            else { pageNum = safeCurrentPage - 2 + i; }
            return (
              <button key={pageNum} onClick={() => setPage(pageNum)} className="px-2 py-1 text-xs"
                style={{
                  border: `1px solid ${safeCurrentPage === pageNum ? 'var(--accent)' : 'var(--border)'}`,
                  color: safeCurrentPage === pageNum ? 'var(--accent)' : 'var(--text-dim)',
                  background: safeCurrentPage === pageNum ? '#eff6ff' : 'none',
                  borderRadius: '1px', cursor: 'pointer', minWidth: '28px',
                }}>{pageNum}</button>
            );
          })}

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage >= totalPages} className="px-2 py-1 text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage < totalPages ? 'pointer' : 'not-allowed', opacity: safeCurrentPage < totalPages ? 1 : 0.3 }}>
            <ChevronRight size={12} /></button>
          <button onClick={() => setPage(totalPages)} disabled={safeCurrentPage >= totalPages} className="px-2 py-1 text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage < totalPages ? 'pointer' : 'not-allowed', opacity: safeCurrentPage < totalPages ? 1 : 0.3 }}>»</button>
        </div>
      </div>
    </div>
  );
}