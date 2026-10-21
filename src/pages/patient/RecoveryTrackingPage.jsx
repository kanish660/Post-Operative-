import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientRecoveryHistory } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import RecoveryChart from '../../components/RecoveryChart';
import StatusBadge from '../../components/Badge';
import { TrendingUp, TrendingDown, Minus, Activity, Thermometer, Calendar, ClipboardList, Clock } from 'lucide-react';

export default function RecoveryTrackingPage() {
  const { patientId } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('pain_level');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPatientRecoveryHistory(patientId);
        const updates = (res.data.recovery_updates || res.data.updates || []);
        // Oldest first for chronological chart plotting
        setHistory([...updates].reverse());
      } catch (e) {
        console.error('Error fetching recovery history:', e);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetch();
  }, [patientId]);

  const metrics = [
    { key: 'pain_level', label: 'Pain Score', color: '#2563eb', unit: '/10' },
    { key: 'temperature', label: 'Body Temperature', color: '#06b6d4', unit: '°F' },
  ];

  const getTrend = (key) => {
    if (history.length < 2) return 'stable';
    const last = history[history.length - 1]?.[key] ?? history[history.length - 1]?.pain_score ?? history[history.length - 1]?.body_temp;
    const prev = history[history.length - 2]?.[key] ?? history[history.length - 2]?.pain_score ?? history[history.length - 2]?.body_temp;
    if (last > prev) return 'up';
    if (last < prev) return 'down';
    return 'stable';
  };

  const latest = history[history.length - 1];

  return (
    <div className="app-layout">
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopHeader 
          title="Recovery Tracking" 
          subtitle="Visual trends and chronological recovery timeline"
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading recovery data...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
            <div className="empty-state-icon">
              <ClipboardList size={32} />
            </div>
            <h3>No recovery updates yet</h3>
            <p>Submit your first daily update to start tracking your recovery.</p>
            <Link to="/patient/daily-update" className="btn btn-primary btn-sm mt-2">
              <ClipboardList size={16} /> Submit Daily Update
            </Link>
          </div>
        ) : (
          <>
            {/* Metric Summary Cards */}
            <div className="stats-grid mb-4">
              {metrics.map(m => {
                const trend = getTrend(m.key);
                const currentVal = latest?.[m.key] ?? latest?.pain_score ?? latest?.body_temp ?? '—';
                return (
                  <div key={m.key} className="stat-card">
                    <div className="stat-icon" style={{ background: `${m.color}15`, color: m.color }}>
                      {trend === 'up' ? <TrendingUp size={24} /> : trend === 'down' ? <TrendingDown size={24} /> : <Minus size={24} />}
                    </div>
                    <div>
                      <p className="stat-label">{m.label}</p>
                      <p className="stat-value">
                        {currentVal}
                        <span className="stat-unit">{m.unit}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
              
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--primary-light)', color: '#2563eb' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="stat-label">Total Days Tracked</p>
                  <p className="stat-value">{history.length}</p>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="card mb-4">
              <div className="card-header-row">
                <h2 className="card-title">
                  <TrendingUp size={20} color="#2563eb" /> Recovery Progress Chart
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {metrics.map(m => (
                    <button
                      key={m.key}
                      className={`btn btn-sm ${activeMetric === m.key ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setActiveMetric(m.key)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <RecoveryChart data={history} metric={activeMetric} color={metrics.find(m => m.key === activeMetric)?.color} />
            </div>

            {/* Recovery Timeline: Day 1 → Day 2 → Day 3 → ... */}
            <div className="card mb-4">
              <h2 className="card-title mb-4">
                <Clock size={20} color="#06b6d4" /> Recovery Timeline (Day 1 → Day {history.length})
              </h2>

              <div className="timeline-container">
                {history.map((update, idx) => {
                  const dayNum = idx + 1;
                  const painVal = update.pain_level ?? update.pain_score ?? 0;
                  const tempVal = update.temperature ?? update.body_temp ?? 98.6;
                  const dateStr = update.update_date || update.created_at;
                  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : `Day ${dayNum}`;

                  return (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-node">{dayNum}</div>
                      <div className="timeline-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--navy-dark)', fontSize: '1.05rem' }}>
                            Day {dayNum} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.88rem' }}>— {formattedDate}</span>
                          </span>
                          <StatusBadge status={painVal <= 4 ? 'Healing Normally' : 'Needs Attention'} />
                        </div>

                        <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div className="info-item">
                            <span className="info-label">Pain Level</span>
                            <span className="info-value" style={{ color: painVal <= 3 ? 'var(--success-dark)' : painVal <= 6 ? 'var(--warning-dark)' : 'var(--danger-dark)' }}>
                              {painVal} / 10
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Temperature</span>
                            <span className="info-value">{tempVal}°F</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Swelling</span>
                            <span className="info-value capitalize">{update.swelling || 'None'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Redness</span>
                            <span className="info-value capitalize">{update.redness || 'None'}</span>
                          </div>
                        </div>

                        {update.notes && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'var(--bg-app)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', margin: 0 }}>
                            <strong>Notes:</strong> {update.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
