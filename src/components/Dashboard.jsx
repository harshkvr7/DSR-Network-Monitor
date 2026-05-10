import { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import KpiCards from './KpiCards';
import Charts from './Charts';
import DataTable from './DataTable';
import { Upload } from 'lucide-react';

export default function Dashboard({ rawData, onReset }) {
  const [filters, setFilters] = useState({ severity: 'ALL', server: 'ALL' });

  const servers = useMemo(() => {
    const s = new Set(rawData.map(r => r.SERVER).filter(Boolean));
    return [...s].sort();
  }, [rawData]);

  const filteredData = useMemo(() => {
    return rawData.filter(row => {
      const sevOk = filters.severity === 'ALL' || row.SEVERITY === filters.severity;
      const srvOk = filters.server  === 'ALL' || row.SERVER   === filters.server;
      return sevOk && srvOk;
    });
  }, [rawData, filters]);

  return (
    <div className="flex h-full">
      <Sidebar
        servers={servers}
        filters={filters}
        setFilters={setFilters}
        totalRows={rawData.length}
        filteredRows={filteredData.length}
      />

      <div className="flex flex-col flex-1 min-w-0 h-full" style={{ background: 'var(--bg-base)' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3" style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              DSR Alarm Analysis Tool
            </div>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-colors duration-100"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              background: 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-base)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Upload size={11} />
            Load new file
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto p-4">
          <KpiCards data={filteredData} />
          <Charts data={filteredData} />
          <div style={{ flex: 1, minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            <DataTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
}
