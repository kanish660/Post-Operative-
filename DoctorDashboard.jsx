import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllPatients, getAllAlerts } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Users, AlertTriangle, CheckCircle, Activity, Eye } from 'lucide-react';

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
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const needsAttention = patients.filter(p => p.recovery_status === 'Needs Attention' || p.recovery_status === 'Critical');
  const highAlerts = alerts.filter(a => a.severity === 'high' && a.status === 'unread');

  if (loading) return (
    <div className="app-layout"><Sidebar role="doctor" />
      <div className="main-content"><div className="loading-screen"><div className="spinner"></div><p>Loading...</p></div></div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar role="doctor" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Doctor Dashboard</h1>
            <p className="subtitle">Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]} — Review your patients' recovery status</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><Users size={22} color="#6366f1" /></div>
            <div><p className="stat-label">Total Patients</p><p className="stat-value">{patients.length}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><AlertTriangle size={22} color="#ef4444" /></div>
            <div><p className="stat-label">Needs Attention</p><p className="stat-value" style={{ color: '#ef4444' }}>{needsAttention.length}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><CheckCircle size={22} color="#10b981" /></div>
            <div><p className="stat-label">Recovering Well</p><p className="stat-value" style={{ color: '#10b981' }}>{patients.length - needsAttention.length}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><Activity size={22} color="#ef4444" /></div>
            <div><p className="stat-label">High-Priority Alerts</p><p className="stat-value" style={{ color: highAlerts.length > 0 ? '#ef4444' : '#10b981' }}>{highAlerts.length}</p></div>
          </div>
        </div>

        {/* Attention Required */}
        {needsAttention.length > 0 && (
          <div className="card mb-4">
            <div className="card-header-row">
              <h2 className="card-title" style={{ color: '#ef4444' }}>⚠️ Patients Requiring Attention</h2>
            </div>
            <div className="patient-attention-list">
              {needsAttention.map(p => (
                <Link key={p.id} to={`/doctor/patient/${p.id}`} className="attention-patient-card">
                  <div className="patient-avatar">{p.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="patient-name">{p.name}</p>
                    <p className="patient-surgery">{p.surgery_type}</p>
                  </div>
                  <span className={`badge ${p.recovery_status === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>{p.recovery_status}</span>
                  <Eye size={18} color="#6366f1" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Patients Table */}
        <div className="card">
          <div className="card-header-row">
            <h2 className="card-title">All Assigned Patients</h2>
            <Link to="/doctor/patients" className="link-btn">View All</Link>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>Surgery</th><th>Days Post-Op</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {patients.slice(0, 6).map(p => {
                  const days = p.surgery_date ? Math.floor((new Date() - new Date(p.surgery_date)) / 86400000) : '—';
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="cell-user">
                          <div className="cell-avatar">{p.name?.charAt(0)}</div>
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.surgery_type}</td>
                      <td>{days} days</td>
                      <td>
                        <span className={`badge ${p.recovery_status === 'Good' ? 'badge-success' : p.recovery_status === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                          {p.recovery_status || 'Under Review'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/doctor/patient/${p.id}`} className="btn btn-sm btn-outline">
                          <Eye size={14} /> View
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
