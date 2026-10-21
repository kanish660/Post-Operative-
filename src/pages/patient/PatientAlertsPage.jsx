import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientAlerts, updateAlertStatus } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { AlertTriangle, CheckCircle, Bell, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientAlertsPage() {
  const { patientId, user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, [patientId]);

  const fetchAlerts = async () => {
    try {
      if (patientId) {
        const res = await getPatientAlerts(patientId);
        setAlerts(res.data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (e, id) => {
    e.stopPropagation();
    try {
      await updateAlertStatus(id, 'read');
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'read' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAlertClick = (alert) => {
    const isDoctor = user?.role === 'doctor' || user?.role === 'admin';
    const isAIAlert = alert.alert_type === 'AI Flag' || (alert.message && alert.message.includes('Wound'));

    if (isAIAlert) {
      if (isDoctor) {
        navigate(`/doctor/patient/${alert.patient_id}?tab=wounds`);
      } else {
        navigate(`/patient/wound-history`);
      }
    } else {
      if (isDoctor) {
        navigate(`/doctor/patient/${alert.patient_id}?tab=overview`);
      } else {
        navigate(`/patient/recovery-tracking`);
      }
    }
  };

  const isUnread = (a) => a.status === 'unread' || a.status === 'Active';
  const filtered = alerts.filter(a => {
    if (filter === 'unread') return isUnread(a);
    if (filter === 'read') return !isUnread(a);
    return true;
  });

  const unreadCount = alerts.filter(isUnread).length;

  return (
    <div className="app-layout">
      <Sidebar role={user?.role === 'doctor' ? 'doctor' : (user?.role === 'admin' ? 'admin' : 'patient')} />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Alerts & Clinical Notifications</h1>
            <p className="subtitle">Real-time alerts, AI visual assessment flags, and medical follow-up reminders</p>
          </div>
          {unreadCount > 0 && (
            <div className="badge badge-danger badge-lg">
              <Bell size={16} /> {unreadCount} Active Alert{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="card mb-4" style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All Notifications ({alerts.length})
            </button>
            <button
              className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('unread')}
            >
              Active / Unread ({unreadCount})
            </button>
            <button
              className={`btn btn-sm ${filter === 'read' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('read')}
            >
              Resolved / Read ({alerts.length - unreadCount})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Loading alerts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
            <div className="empty-state-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle size={32} />
            </div>
            <h3>No Alerts Found</h3>
            <p>All clinical recovery indicators and wound assessments are currently clear.</p>
          </div>
        ) : (
          <div className="alerts-stack">
            {filtered.map(alert => {
              const active = isUnread(alert);
              const isAIAlert = alert.alert_type === 'AI Flag' || (alert.message && alert.message.includes('Wound'));

              return (
                <div
                  key={alert.id}
                  className={`alert-card ${active ? (isAIAlert ? 'alert-card-high' : 'alert-card-unread') : ''}`}
                  onClick={() => handleAlertClick(alert)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="alert-icon-col">
                    {isAIAlert ? (
                      <ShieldAlert size={24} color="var(--danger)" />
                    ) : (
                      <AlertTriangle size={24} color="var(--warning-dark)" />
                    )}
                  </div>

                  <div className="alert-body">
                    <div className="alert-top-row">
                      <span className="alert-title-text">
                        {alert.alert_type || alert.title || 'Clinical Alert'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isAIAlert && (
                          <span className="badge badge-danger">AI Wound Flag</span>
                        )}
                        {active && (
                          <span className="badge badge-warning">Active</span>
                        )}
                      </div>
                    </div>

                    <p className="alert-msg">{alert.message}</p>

                    <div className="alert-footer">
                      <span className="alert-time">
                        <Clock size={14} />
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Recent'}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {active && (
                          <button className="btn btn-sm btn-outline" onClick={(e) => markRead(e, alert.id)}>
                            <CheckCircle size={14} /> Mark as Read
                          </button>
                        )}
                        <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          Inspect <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
