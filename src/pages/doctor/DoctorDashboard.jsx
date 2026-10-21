import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllPatients, getAllAlerts } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/Badge';
import { Users, AlertTriangle, CheckCircle2, Activity, Eye, ArrowRight, ShieldAlert, Stethoscope } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, aRes] = await Promise.all([getAllPatients(), getAllAlerts()]);
        setPatients(pRes.data.patients || []);
        setAlerts(aRes.data.alerts || []);
      } catch (e) {
        console.error('Error loading doctor dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const needsAttention = patients.filter(p => p.recovery_status === 'Needs Attention' || p.recovery_status === 'Critical');
  const recoveringWell = patients.filter(p => p.recovery_status === 'Healing Normally' || p.recovery_status === 'Good' || p.recovery_status === 'Normal');
  const highAlerts = alerts.filter(a => a.severity === 'high' || a.alert_type === 'AI Flag' || a.status === 'unread' || a.status === 'Active');

  if (loading) return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading clinical dashboard...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Clinical Monitoring Dashboard</h1>
            <p className="subtitle">Welcome, Dr. {user?.name || 'Physician'} — Live post-operative recovery monitoring</p>
          </div>
        </div>

        {/* 4 Clickable Summary Cards */}
        <div className="stats-grid">
          <Link to="/doctor/patients" className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <p className="stat-label">Total Assigned Patients</p>
              <p className="stat-value">{patients.length}</p>
            </div>
          </Link>

          <Link to="/doctor/patients" className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="stat-label">Needs Attention</p>
              <p className="stat-value" style={{ color: needsAttention.length > 0 ? 'var(--danger)' : 'var(--navy-dark)' }}>
                {needsAttention.length}
              </p>
            </div>
          </Link>

          <Link to="/doctor/patients" className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="stat-label">Recovering Well</p>
              <p className="stat-value" style={{ color: 'var(--success-dark)' }}>
                {recoveringWell.length}
              </p>
            </div>
          </Link>

          <Link to="/doctor/patients" className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning-dark)' }}>
              <Activity size={24} />
            </div>
            <div>
              <p className="stat-label">High-Priority Alerts</p>
              <p className="stat-value" style={{ color: highAlerts.length > 0 ? 'var(--danger)' : 'var(--navy-dark)' }}>
                {highAlerts.length}
              </p>
            </div>
          </Link>
        </div>

        {/* High Attention Required Patient Banner */}
        {needsAttention.length > 0 && (
          <div className="card mb-4" style={{ borderColor: 'var(--danger-border)', background: '#fffcfc' }}>
            <div className="card-header-row">
              <h2 className="card-title" style={{ color: 'var(--danger-dark)' }}>
                <ShieldAlert size={20} color="var(--danger)" /> High Priority: Patients Requiring Immediate Review ({needsAttention.length})
              </h2>
            </div>
            <div className="patients-grid">
              {needsAttention.map(p => (
                <div key={p.id} className="patient-card card" style={{ borderLeft: '4px solid var(--danger)' }}>
                  <div className="patient-card-top">
                    <div className="patient-avatar-lg">{p.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="patient-card-name">{p.name}</div>
                      <div className="patient-card-surgery">{p.surgery_type || 'Post-Op Patient'}</div>
                    </div>
                  </div>
                  <div className="patient-card-meta">
                    <div>
                      <span>Recovery Status</span>
                      <StatusBadge status={p.recovery_status || 'Needs Attention'} />
                    </div>
                    <div>
                      <span>Contact</span>
                      <strong style={{ fontSize: '0.85rem' }}>{p.phone || 'Phone on file'}</strong>
                    </div>
                  </div>
                  <div className="patient-card-footer">
                    <Link to={`/doctor/patient/${p.id}`} className="btn btn-danger btn-sm btn-full">
                      <Eye size={16} /> Inspect Patient Record
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Assigned Patient List Table */}
        <div className="card mb-4">
          <div className="card-header-row">
            <h2 className="card-title">
              <Stethoscope size={18} color="var(--primary)" /> Active Patient Monitoring Roster
            </h2>
            <Link to="/doctor/patients" className="link-btn">
              View Full Patient Directory <ArrowRight size={16} />
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Surgery Type</th>
                  <th>Post-Op Day</th>
                  <th>Recovery Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 6).map(p => {
                  const days = p.surgery_date ? Math.floor((new Date() - new Date(p.surgery_date)) / 86400000) : '—';
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="cell-user">
                          <div className="cell-avatar">{p.name?.charAt(0)}</div>
                          <span style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.surgery_type || 'Surgical Recovery'}</td>
                      <td>
                        <span className="badge badge-info">Day {days}</span>
                      </td>
                      <td>
                        <StatusBadge status={p.recovery_status || 'Healing Normally'} />
                      </td>
                      <td>
                        <Link to={`/doctor/patient/${p.id}`} className="btn btn-sm btn-outline">
                          <Eye size={14} /> Open Chart
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
