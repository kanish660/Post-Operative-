import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientRecoveryHistory } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import RecoveryChart from '../../components/RecoveryChart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function RecoveryTrackingPage() {
  const { patientId } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('pain_score');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPatientRecoveryHistory(patientId);
        setHistory((res.data.updates || []).reverse()); // oldest first for chart
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  const metrics = [
    { key: 'pain_score', label: 'Pain Level', color: '#ef4444', unit: '/10' },
    { key: 'body_temp', label: 'Body Temp', color: '#f59e0b', unit: '°F' },
  ];

  const getTrend = (key) => {
    if (history.length < 2) return 'stable';
    const last = history[history.length - 1]?.[key];
    const prev = history[history.length - 2]?.[key];
    if (last > prev) return 'up';
    if (last < prev) return 'down';
    return 'stable';
  };

  const latest = history[history.length - 1];

  return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Recovery Tracking</h1>
            <p className="subtitle">Visual trends of your recovery metrics over time</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading data...</p></div>
        ) : history.length < 2 ? (
          <div className="card empty-state">
            <TrendingUp size={48} opacity={0.3} />
            <h3>Not Enough Data Yet</h3>
            <p>Submit at least 2 daily updates to see your recovery trends.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="stats-grid mb-4">
              {metrics.map(m => {
                const trend = getTrend(m.key);
                return (
                  <div key={m.key} className="stat-card">
                    <div className="stat-icon" style={{ background: `${m.color}22` }}>
                      {trend === 'up' ? <TrendingUp size={22} color={m.color} /> : trend === 'down' ? <TrendingDown size={22} color={m.color} /> : <Minus size={22} color={m.color} />}
                    </div>
                    <div>
                      <p className="stat-label">{m.label}</p>
                      <p className="stat-value">{latest?.[m.key]}<span className="stat-unit">{m.unit}</span></p>
                    </div>
                  </div>
                );
              })}
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><TrendingUp size={22} color="#6366f1" /></div>
                <div>
                  <p className="stat-label">Days Tracked</p>
                  <p className="stat-value">{history.length}</p>
                </div>
              </div>
            </div>

            {/* Metric Selector */}
            <div className="metric-tabs mb-4">
              {metrics.map(m => (
                <button
                  key={m.key}
                  className={`metric-tab ${activeMetric === m.key ? 'metric-tab-active' : ''}`}
                  onClick={() => setActiveMetric(m.key)}
                  style={{ '--tab-color': m.color }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="card">
              <h2 className="card-title">
                {metrics.find(m => m.key === activeMetric)?.label} Over Time
              </h2>
              <RecoveryChart data={history} metric={activeMetric} color={metrics.find(m => m.key === activeMetric)?.color} />
            </div>

            {/* History Table */}
            <div className="card mt-4">
              <h2 className="card-title">Update History</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Pain</th>
                      <th>Temp</th>
                      <th>Swelling</th>
                      <th>Redness</th>
                      <th>Mobility</th>
                      <th>Sleep</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().map((u, i) => (
                      <tr key={i}>
                        <td>{new Date(u.update_date || u.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${u.pain_score <= 3 ? 'badge-success' : u.pain_score <= 6 ? 'badge-warning' : 'badge-danger'}`}>
                            {u.pain_score}/10
                          </span>
                        </td>
                        <td>{u.body_temp}°F</td>
                        <td className="capitalize">{u.swelling}</td>
                        <td className="capitalize">{u.redness}</td>
                        <td className="capitalize">{u.mobility?.replace(/_/g, ' ')}</td>
                        <td className="capitalize">{u.sleep_quality?.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
