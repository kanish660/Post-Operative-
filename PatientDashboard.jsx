import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientDetails, getPatientAlerts, getPatientRecoveryHistory } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import { Activity, AlertTriangle, Camera, ClipboardList, TrendingUp, FileText, Bell, Thermometer, Heart } from 'lucide-react';

export default function PatientDashboard() {
  const { user, patientId } = useAuth();
  const [patient, setPatient] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recoveryHistory, setRecoveryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (patientId) {
          const [pRes, aRes, rRes] = await Promise.all([
            getPatientDetails(patientId),
            getPatientAlerts(patientId),
            getPatientRecoveryHistory(patientId)
          ]);
          setPatient(pRes.data.patient);
          setAlerts(aRes.data.alerts || []);
          setRecoveryHistory(rRes.data.updates || []);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const daysSinceSurgery = patient?.surgery_date
    ? Math.floor((new Date() - new Date(patient.surgery_date)) / (1000 * 60 * 60 * 24))
    : 0;

  const latestUpdate = recoveryHistory[0];
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;

  const quickActions = [
    { label: 'Daily Update', icon: ClipboardList, href: '/patient/daily-update', color: '#3b82f6', desc: 'Log today\'s symptoms' },
    { label: 'Wound Upload', icon: Camera, href: '/patient/wound-upload', color: '#8b5cf6', desc: 'AI assessment' },
    { label: 'Recovery Chart', icon: TrendingUp, href: '/patient/recovery-tracking', color: '#10b981', desc: 'View trends' },
    { label: 'Wound History', icon: Activity, href: '/patient/wound-history', color: '#f59e0b', desc: 'Past assessments' },
    { label: 'My Report', icon: FileText, href: '/patient/report', color: '#ef4444', desc: 'Full recovery report' },
    { label: 'Alerts', icon: Bell, href: '/patient/alerts', color: '#06b6d4', desc: `${unreadAlerts} unread` },
  ];

  if (loading) return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content"><div className="loading-screen"><div className="spinner"></div><p>Loading your dashboard...</p></div></div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Patient'} 👋</h1>
            <p className="subtitle">Here's your recovery overview for today</p>
          </div>
          <div className="days-badge">
            <span className="days-num">{daysSinceSurgery}</span>
            <span className="days-label">Days Post-Surgery</span>
          </div>
        </div>

        <MedicalDisclaimer compact />

        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <Activity size={22} color="#3b82f6" />
            </div>
            <div>
              <p className="stat-label">Pain Level</p>
              <p className="stat-value">{latestUpdate?.pain_score ?? '—'}<span className="stat-unit">/10</span></p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Thermometer size={22} color="#ef4444" />
            </div>
            <div>
              <p className="stat-label">Temperature</p>
              <p className="stat-value">{latestUpdate?.body_temp ? `${latestUpdate.body_temp}°` : '—'}<span className="stat-unit">F</span></p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Heart size={22} color="#10b981" />
            </div>
            <div>
              <p className="stat-label">Recovery Status</p>
              <p className="stat-value" style={{ fontSize: '1rem', color: patient?.recovery_status === 'Good' ? '#10b981' : '#f59e0b' }}>
                {patient?.recovery_status || 'Under Review'}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <AlertTriangle size={22} color="#ef4444" />
            </div>
            <div>
              <p className="stat-label">Active Alerts</p>
              <p className="stat-value" style={{ color: unreadAlerts > 0 ? '#ef4444' : '#10b981' }}>{unreadAlerts}</p>
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        {patient && (
          <div className="card mb-4">
            <h2 className="card-title">Surgery Information</h2>
            <div className="info-grid">
              <div className="info-item"><span className="info-label">Surgery Type</span><span className="info-value">{patient.surgery_type}</span></div>
              <div className="info-item"><span className="info-label">Surgery Date</span><span className="info-value">{patient.surgery_date}</span></div>
              <div className="info-item"><span className="info-label">Hospital</span><span className="info-value">{patient.hospital_name}</span></div>
              <div className="info-item"><span className="info-label">Doctor</span><span className="info-value">Dr. {patient.doctor_name || 'Assigned Physician'}</span></div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card mb-4">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href} className="quick-action-card" style={{ '--accent': action.color }}>
                <div className="qa-icon" style={{ background: `${action.color}22` }}>
                  <action.icon size={24} color={action.color} />
                </div>
                <p className="qa-label">{action.label}</p>
                <p className="qa-desc">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest Alerts */}
        {alerts.length > 0 && (
          <div className="card">
            <div className="card-header-row">
              <h2 className="card-title">Recent Alerts</h2>
              <Link to="/patient/alerts" className="link-btn">View All</Link>
            </div>
            <div className="alerts-list">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.status === 'unread' ? 'alert-unread' : ''}`}>
                  <AlertTriangle size={16} color={alert.severity === 'high' ? '#ef4444' : '#f59e0b'} />
                  <div>
                    <p className="alert-title">{alert.title}</p>
                    <p className="alert-time">{new Date(alert.created_at).toLocaleDateString()}</p>
                  </div>
                  {alert.status === 'unread' && <span className="badge badge-danger">New</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
