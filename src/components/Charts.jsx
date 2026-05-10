import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const SEV_COLORS = {
  CRITICAL: '#dc2626',
  MAJOR:    '#ea580c',
  MINOR:    '#ca8a04',
  WARNING:  '#7c3aed',
  CLEAR:    '#16a34a',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e2e2',
      borderRadius: '6px',
      padding: '8px 12px',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#111827',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {label && <div style={{ color: '#6b7280', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill || '#2563eb' }}>
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontFamily: 'system-ui', fontSize: '11px', fontWeight: 600 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Charts({ data }) {
  const severityData = useMemo(() => {
    const counts = {};
    data.forEach(r => {
      if (r.SEVERITY) counts[r.SEVERITY] = (counts[r.SEVERITY] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const serverData = useMemo(() => {
    const counts = {};
    data.forEach(r => {
      if (r.SERVER) counts[r.SERVER] = (counts[r.SERVER] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.replace('vDSR-UPE-MANSO-', ''), full: name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  }, [data]);

  if (!data.length) return null;

  return (
    <div className="flex gap-3" style={{ minHeight: '280px' }}>
      {/* Severity Pie */}
      <div className="card p-4 animate-slide-in stagger-1" style={{ flex: '0 0 300px' }}>
        <div className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Severity breakdown
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {severityData.map((entry) => (
                <Cell key={entry.name} fill={SEV_COLORS[entry.name] || '#9ca3af'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={7}
              formatter={(value) => (
                <span style={{ fontFamily: 'system-ui', fontSize: '11px', color: '#6b7280' }}>
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Server Bar Chart */}
      <div className="card p-4 animate-slide-in stagger-2" style={{ flex: 1, minWidth: 0 }}>
        <div className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Alarms by server (top 20)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={serverData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontFamily: 'system-ui', fontSize: 9, fill: '#9ca3af' }}
              angle={-45}
              textAnchor="end"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: '#e2e2e2' }}
            />
            <YAxis
              tick={{ fontFamily: 'system-ui', fontSize: 9, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
            <Bar dataKey="value" name="Events" radius={[3, 3, 0, 0]}>
              {serverData.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={i === 0 ? '#dc2626' : i < 3 ? '#ea580c' : '#93c5fd'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
