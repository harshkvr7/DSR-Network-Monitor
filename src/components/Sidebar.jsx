import { Filter, Radio, RotateCcw, ChevronDown } from 'lucide-react';

const SEVERITIES = ['ALL', 'CRITICAL', 'MAJOR', 'MINOR', 'WARNING', 'CLEAR'];

const SEV_COLORS = {
  CRITICAL: 'var(--severity-critical)',
  MAJOR:    'var(--severity-major)',
  MINOR:    'var(--severity-minor)',
  WARNING:  'var(--severity-warning)',
  CLEAR:    'var(--severity-clear)',
  ALL:      'var(--accent)',
};

const SEV_DOT_BG = {
  CRITICAL: '#dc2626',
  MAJOR:    '#ea580c',
  MINOR:    '#ca8a04',
  WARNING:  '#7c3aed',
  CLEAR:    '#16a34a',
  ALL:      '#2563eb',
};

export default function Sidebar({ servers, filters, setFilters, totalRows, filteredRows }) {
  const handleSeverity = (sev) => setFilters(f => ({ ...f, severity: sev }));
  const handleServer   = (e)   => setFilters(f => ({ ...f, server: e.target.value }));
  const reset = () => setFilters({ severity: 'ALL', server: 'ALL' });

  return (
    <aside className="flex flex-col h-full" style={{
      width: '200px',
      minWidth: '200px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Logo */}
      {/* <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Radio size={13} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>DSR Monitor</span>
        </div>
      </div> */}

      {/* Row count */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
        <div className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>Events shown</div>
        <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {filteredRows.toLocaleString()}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
          of {totalRows.toLocaleString()} total
        </div>
      </div>

      {/* Severity filter */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter size={11} style={{ color: 'var(--text-dim)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Severity</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {SEVERITIES.map((sev) => {
            const active = filters.severity === sev;
            return (
              <button
                key={sev}
                onClick={() => handleSeverity(sev)}
                className="flex items-center gap-2 px-2 py-1.5 text-left rounded transition-colors duration-100"
                style={{
                  background: active ? '#eff6ff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SEV_DOT_BG[sev] }} />
                <span className="text-xs" style={{ color: active ? SEV_COLORS[sev] : 'var(--text-secondary)', fontWeight: active ? 600 : 400 }}>
                  {sev.charAt(0) + sev.slice(1).toLowerCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Server filter */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter size={11} style={{ color: 'var(--text-dim)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Server</span>
        </div>
        <div className="relative">
          <select
            value={filters.server}
            onChange={handleServer}
            className="w-full px-2 py-1.5 text-xs appearance-none cursor-pointer rounded"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          >
            <option value="ALL">All servers</option>
            {servers.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
        </div>
      </div>

      {/* Reset */}
      <div className="px-4 py-3 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs rounded transition-colors duration-100"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            background: 'transparent',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-base)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <RotateCcw size={11} />
          Reset filters
        </button>
      </div>
    </aside>
  );
}
