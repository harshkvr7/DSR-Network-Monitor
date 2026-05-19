import { useState, useCallback, useEffect } from 'react';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';

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

export default function Sidebar({ servers, names = [], filters, setFilters, totalRows, filteredRows }) {
  // Sidebar resizing state
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

  const handleSeverity = (sev) => setFilters(f => ({ ...f, severity: sev }));
  const handleServer   = (e)   => setFilters(f => ({ ...f, server: e.target.value }));
  const handleName     = (nameVal) => setFilters(f => ({ ...f, name: nameVal }));
  
  const reset = () => setFilters({ severity: 'ALL', server: 'ALL', name: 'ALL' });

  // --- Resizing Logic ---
  const startResizing = useCallback((e) => {
    e.preventDefault(); // Prevent text selection while dragging
    setIsResizing(true);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      // Calculate new width based on mouse position
      const newWidth = e.clientX;
      
      // Enforce min and max widths (e.g., min 200px, max 500px)
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Attach and clean up event listeners on the window object
  // so dragging continues even if the mouse leaves the handle area
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      // Disable body pointer events/text selection while dragging for smooth UX
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);
  // ----------------------

  return (
    <aside className="flex flex-col h-full" style={{
      position: 'relative', // Necessary for the absolute position of the drag handle
      width: `${sidebarWidth}px`,
      minWidth: `${sidebarWidth}px`,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
    }}>

      {/* Row count */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
        <div className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>Events shown</div>
        <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {filteredRows.toLocaleString()}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
          of {totalRows.toLocaleString()} total
        </div>
      </div>

      {/* Severity filter */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
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
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
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

      {/* Name filter */}
      <div className="px-4 py-3 flex-1 min-h-0 flex flex-col" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 mb-2 shrink-0">
          <Filter size={11} style={{ color: 'var(--text-dim)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Name</span>
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-y-auto pr-1">
          <button
            onClick={() => handleName('ALL')}
            className="flex items-center gap-2 px-2 py-1.5 text-left rounded transition-colors duration-100 shrink-0"
            style={{
              background: filters.name === 'ALL' || !filters.name ? '#eff6ff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span className="text-xs truncate w-full" style={{ color: filters.name === 'ALL' || !filters.name ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: filters.name === 'ALL' || !filters.name ? 600 : 400 }}>
              All names
            </span>
          </button>

          {names.map((n) => {
            const active = filters.name === n.name;
            return (
              <button
                key={n.name}
                onClick={() => handleName(n.name)}
                title={n.label}
                className="flex items-center gap-2 px-2 py-1.5 text-left rounded transition-colors duration-100 shrink-0"
                style={{
                  background: active ? '#eff6ff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span className="text-xs truncate w-full" style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400 }}>
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="px-4 py-3 shrink-0 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
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

      {/* Resize Handle */}
      <div
        onMouseDown={startResizing}
        style={{
          position: 'absolute',
          top: 0,
          right: -3,       // Hang over the edge slightly so it's easy to grab
          width: '6px',
          height: '100%',
          cursor: 'col-resize',
          zIndex: 50,
          backgroundColor: isResizing ? 'var(--accent)' : 'transparent',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isResizing) e.target.style.backgroundColor = 'var(--border)';
        }}
        onMouseLeave={(e) => {
          if (!isResizing) e.target.style.backgroundColor = 'transparent';
        }}
      />
    </aside>
  );
}