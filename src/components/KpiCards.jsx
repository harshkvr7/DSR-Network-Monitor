import { AlertOctagon, Activity, Server, BarChart2 } from 'lucide-react';

const SEV_COLOR = {
  CRITICAL: 'var(--severity-critical)',
  MAJOR:    'var(--severity-major)',
  MINOR:    'var(--severity-minor)',
  WARNING:  'var(--severity-warning)',
  CLEAR:    'var(--severity-clear)',
};

function KpiCard({ label, value, sub, icon: Icon, color, delay }) {
  return (
    <div
      className={`card p-4 flex flex-col gap-2 animate-slide-in stagger-${delay}`}
      style={{ flex: 1, minWidth: 0 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <Icon size={14} style={{ color: color || 'var(--text-dim)' }} />
      </div>
      <div className="text-2xl font-semibold" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs truncate" style={{ color: 'var(--text-dim)' }} title={sub}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default function KpiCards({ data }) {
  const total = data.length;
  const critCount  = data.filter(r => r.SEVERITY === 'CRITICAL').length;
  const majorCount = data.filter(r => r.SEVERITY === 'MAJOR').length;
  const minorCount = data.filter(r => r.SEVERITY === 'MINOR').length;

  const serverCounts = {};
  data.forEach(r => {
    if (r.SERVER) serverCounts[r.SERVER] = (serverCounts[r.SERVER] || 0) + 1;
  });
  const topServer = Object.entries(serverCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex gap-3">
      <KpiCard
        label="Total events"
        value={total.toLocaleString()}
        sub="matching current filters"
        icon={Activity}
        color="var(--accent)"
        delay={1}
      />
      <KpiCard
        label="Critical"
        value={critCount.toLocaleString()}
        sub={critCount > 0 ? `${((critCount / total) * 100).toFixed(1)}% of filtered` : 'No critical alarms'}
        icon={AlertOctagon}
        color={critCount > 0 ? 'var(--severity-critical)' : 'var(--text-dim)'}
        delay={2}
      />
      <KpiCard
        label="Major"
        value={majorCount.toLocaleString()}
        sub={`${minorCount} minor events`}
        icon={BarChart2}
        color="var(--severity-major)"
        delay={3}
      />
      <KpiCard
        label="Hottest server"
        value={topServer ? topServer[1].toLocaleString() : '—'}
        sub={topServer ? topServer[0] : 'No data'}
        icon={Server}
        color="var(--severity-clear)"
        delay={4}
      />
    </div>
  );
}
