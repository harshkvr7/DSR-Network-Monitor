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
  if (!text || text.length < 80) return <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{text || '—'}</span>;
  return (
    <div>
      <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
        {expanded ? text : `${text.slice(0, 80)}…`}
      </div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="font-mono text-xs mt-0.5 flex items-center gap-0.5"
        style={{ color: 'var(--accent-cyan-dim)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        {expanded ? <><ChevronUp size={10} /> collapse</> : <><ChevronDown size={10} /> expand</>}
      </button>
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
    setSortCol(prev => {
      if (prev === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      else { setSortDir('asc'); }
      return col;
    });
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(row =>
      (row.TIMESTAMP || '').toLowerCase().includes(q) ||
      (row.SEVERITY  || '').toLowerCase().includes(q) ||
      (row.SERVER    || '').toLowerCase().includes(q) ||
      (row.NAME      || '').toLowerCase().includes(q) ||
      (row.ERR_INFO  || '').toLowerCase().includes(q)
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
    { key: 'TIMESTAMP', label: 'TIMESTAMP',  flex: '0 0 180px' },
    { key: 'SEVERITY',  label: 'SEV',         flex: '0 0 90px' },
    { key: 'SERVER',    label: 'SERVER',       flex: '0 0 200px' },
    { key: 'NAME',      label: 'NAME',         flex: '0 0 160px' },
    { key: 'ERR_INFO',  label: 'ERR_INFO',     flex: 1 },
  ];

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>⇅</span>;
    return sortDir === 'asc'
      ? <ChevronUp size={11} style={{ color: 'var(--accent-cyan)' }} />
      : <ChevronDown size={11} style={{ color: 'var(--accent-cyan)' }} />;
  };

  return (
    <div className="card flex flex-col animate-slide-in stagger-3" style={{ flex: 1, minHeight: 0 }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-dim)' }}>
          RAW EVENT LOG
          <span className="ml-3" style={{ color: 'var(--accent-cyan)' }}>{sorted.length.toLocaleString()} rows</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex items-center">
            <Search size={12} className="absolute left-2" style={{ color: 'var(--text-dim)' }} />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search all columns…"
              className="font-mono text-xs pl-7 pr-7 py-1.5"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-bright)',
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

          {/* Page size */}
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="font-mono text-xs px-2 py-1.5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-bright)',
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
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '900px' }}>
          <colgroup>
            {COLS.map(col => <col key={col.key} style={{ width: col.flex === 1 ? 'auto' : col.flex.split(' ')[2] }} />)}
          </colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-elevated)' }}>
            <tr>
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-3 py-2 cursor-pointer select-none"
                  style={{
                    borderBottom: '1px solid var(--border-bright)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px',
                    color: sortCol === col.key ? 'var(--accent-cyan)' : 'var(--text-dim)',
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
              <tr
                key={row.ID ?? i}
                className="data-row"
                style={{ borderBottom: '1px solid rgba(26,51,72,0.5)' }}
              >
                <td className="px-3 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.TIMESTAMP || '—'}
                </td>
                <td className="px-3 py-2">
                  <SeverityBadge value={row.SEVERITY} />
                </td>
                <td className="px-3 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.SERVER}>
                  {row.SERVER || '—'}
                </td>
                <td className="px-3 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.NAME}>
                  {row.NAME || '—'}
                </td>
                <td className="px-3 py-2">
                  <ErrInfoCell text={row.ERR_INFO} />
                </td>
              </tr>
            ))}
            {!pageRows.length && (
              <tr>
                <td colSpan={5} className="text-center py-16 font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
                  NO EVENTS MATCH THE CURRENT FILTERS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
          Page {safeCurrentPage} of {totalPages}
          {' · '}
          rows {((safeCurrentPage - 1) * pageSize + 1).toLocaleString()}–{Math.min(safeCurrentPage * pageSize, sorted.length).toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={safeCurrentPage <= 1}
            className="px-2 py-1 font-mono text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage > 1 ? 'pointer' : 'not-allowed', opacity: safeCurrentPage > 1 ? 1 : 0.3 }}
          >«</button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safeCurrentPage <= 1}
            className="px-2 py-1 font-mono text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage > 1 ? 'pointer' : 'not-allowed', opacity: safeCurrentPage > 1 ? 1 : 0.3 }}
          ><ChevronLeft size={12} /></button>

          {/* Page number buttons */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) { pageNum = i + 1; }
            else if (safeCurrentPage <= 3) { pageNum = i + 1; }
            else if (safeCurrentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
            else { pageNum = safeCurrentPage - 2 + i; }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className="px-2 py-1 font-mono text-xs"
                style={{
                  border: `1px solid ${safeCurrentPage === pageNum ? 'var(--accent-cyan)' : 'var(--border)'}`,
                  color: safeCurrentPage === pageNum ? 'var(--accent-cyan)' : 'var(--text-dim)',
                  background: safeCurrentPage === pageNum ? 'rgba(0,212,255,0.08)' : 'none',
                  borderRadius: '1px',
                  cursor: 'pointer',
                  minWidth: '28px',
                }}
              >{pageNum}</button>
            );
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="px-2 py-1 font-mono text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage < totalPages ? 'pointer' : 'not-allowed', opacity: safeCurrentPage < totalPages ? 1 : 0.3 }}
          ><ChevronRight size={12} /></button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            className="px-2 py-1 font-mono text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text-dim)', background: 'none', borderRadius: '1px', cursor: safeCurrentPage < totalPages ? 'pointer' : 'not-allowed', opacity: safeCurrentPage < totalPages ? 1 : 0.3 }}
          >»</button>
        </div>
      </div>
    </div>
  );
}
