import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart
} from 'recharts';

/**
 * RecoveryChart - Flexible chart component
 * Props:
 *  - data: array of recovery update objects
 *  - metric: field key to plot (e.g. 'pain_score', 'body_temp')
 *  - color: hex color string for the line/area
 */
const RecoveryChart = ({ data, metric = 'pain_score', color = '#6366f1' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
        No data available yet.
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    name: item.update_date
      ? new Date(item.update_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `Day ${idx + 1}`,
    value: parseFloat(item[metric]) || 0,
  }));

  const label = metric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            style={{ fontSize: '0.78rem' }}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '0.78rem' }}
            tick={{ fill: '#64748b' }}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '0.85rem',
            }}
            formatter={(value) => [`${value}`, label]}
            labelStyle={{ fontWeight: 700, color: '#1e293b' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={label}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#grad-${metric})`}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecoveryChart;
