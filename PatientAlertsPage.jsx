import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientAlerts, updateAlertStatus } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { AlertTriangle, CheckCircle, Bell, Clock } from 'lucide-react';

export default function PatientAlertsPage() {
  const { patientId } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [patientId]);

  const fetchAlerts = async () => {
    try {
      const res = await getPatientAlerts(patientId);
      setAlerts(res.data.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await updateAlertStatus(id, 'read');
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'read' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = alerts.filter(a => filter === 'all' ? true : a.status === filter);
  const unread = alerts.filter(a => a.status === 'unread').length;

  const severityColor = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' };

  return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Alerts & Notifications</h1>
            <p className="subtitle">Your recovery alerts and doctor messages</p>
          </div>
          {unread > 0 && <div className="unread-badge"><Bell size={16} />{unread} unread</div>}
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs mb-4">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unread > 0 && <span className="tab-count">{unread}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading alerts...</p></div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <CheckCircle size={48} color="#10b981" opacity={0.5} />
            <h3>All Clear!</h3>
            <p>No {filter !== 'all' ? filter : ''} alerts at this time.</p>
          </div>
        ) : (
          <div className="alerts-stack">
            {filtered.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.status === 'unread' ? 'alert-card-unread' : ''}`}>
                <div className="alert-icon-col">
                  <AlertTriangle size={20} color={severityColor[alert.severity] || '#f59e0b'} />
                </div>
                <div className="alert-body">
                  <div className="alert-top-row">
                    <h3 className="alert-title-text">{alert.title}</h3>
                    <div className="alert-meta">
                      <span className={`severity-badge severity-${alert.severity}`}>{alert.severity}</span>
                      {alert.status === 'unread' && <span className="badge badge-danger">New</span>}
                    </div>
                  </div>
                  <p className="alert-msg">{alert.message}</p>
                  <div className="alert-footer">
                    <span className="alert-time"><Clock size={12} />{new Date(alert.created_at).toLocaleString()}</span>
                    {alert.status === 'unread' && (
                      <button className="btn btn-sm btn-outline" onClick={() => markRead(alert.id)}>
                        <CheckCircle size={14} /> Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
