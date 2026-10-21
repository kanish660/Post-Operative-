import React from 'react';
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Area, AreaChart
} from 'recharts';

/**
 * RecoveryChart - Flexible chart component for Dark Modern Healthcare SaaS theme
 */
const RecoveryChart = ({ data, metric = 'pain_level', color = '#2563eb' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2.5rem', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '18px', background: 'rgba(15, 23, 42, 0.5)' }}>
        <p style={{ color: '#94a3b8' }}>No recovery log entries recorded yet.</p>
      </div>
    );
  }

  const chartData = data.map((item, idx) => {
    let rawVal = item[metric];
    if (rawVal === undefined || rawVal === null) {
      if (metric === 'pain_level' || metric === 'pain_score') {
        rawVal = item.pain_level ?? item.pain_score ?? 0;
      } else if (metric === 'temperature' || metric === 'body_temp') {
        rawVal = item.temperature ?? item.body_temp ?? 98.6;
      }
    }
    const val = parseFloat(rawVal) || 0;

    const dateStr = item.update_date || item.created_at;
    const formattedDate = dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `Day ${idx + 1}`;

    return {
      name: formattedDate,
      value: val,
    };
  });

  const label = metric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 15, right: 20, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255, 255, 255, 0.2)"
            style={{ fontSize: '0.8rem', fontWeight: 600 }}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.2)"
            style={{ fontSize: '0.8rem', fontWeight: 600 }}
            tick={{ fill: '#94a3b8' }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0d1b2a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              fontSize: '0.88rem',
              color: '#ffffff'
            }}
            formatter={(value) => [`${value}`, label]}
            labelStyle={{ fontWeight: 800, color: '#ffffff' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={label}
            stroke={color}
            strokeWidth={3}
            fill={`url(#grad-${metric})`}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#0d1b2a' }}
            activeDot={{ r: 7, fill: color, strokeWidth: 2, stroke: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecoveryChart;
