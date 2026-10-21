import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { Users, Activity, Camera, AlertTriangle, TrendingUp, Shield, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(r => setStats(r.data.stats || r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Patients', value: stats?.total_patients, icon: Users, color: '#6366f1', link: '/admin/users' },
    { label: 'Total Doctors', value: stats?.total_doctors, icon: Shield, color: '#3b82f6', link: '/admin/users' },
    { label: 'Pending Doctors', value: stats?.pending_doctors ?? 0, icon: Clock, color: '#f59e0b', link: '/admin/users' },
    { label: 'Recovery Updates', value: stats?.total_recovery_updates, icon: Activity, color: '#10b981', link: '/admin/recovery-records' },
    { label: 'Wound Assessments', value: stats?.total_wound_assessments, icon: Camera, color: '#8b5cf6', link: '/admin/wound-assessments' },
    { label: 'Active Alerts', value: stats?.active_alerts, icon: AlertTriangle, color: '#ef4444', link: '/admin/users' },
  ];

  if (loading) return (
    <div className="app-layout"><Sidebar role="admin" />
      <div className="main-content"><div className="loading-screen"><div className="spinner"></div><p>Loading admin panel...</p></div></div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">System overview and management portal</p>
          </div>
          <div className="admin-badge"><Shield size={16} />Administrator</div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-admin">
          {cards.map(c => (
            <Link key={c.label} to={c.link} className="stat-card-admin" style={{ '--card-accent': c.color }}>
              <div className="stat-card-admin-icon" style={{ background: `${c.color}22` }}>
                <c.icon size={28} color={c.color} />
              </div>
              <div>
                <p className="stat-card-admin-value">{c.value ?? '—'}</p>
                <p className="stat-card-admin-label">{c.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="card mt-4">
          <h2 className="card-title">Quick Management Links</h2>
          <div className="admin-quick-links">
            <Link to="/admin/users" className="admin-link-card">
              <Users size={24} color="#6366f1" />
              <span>User Management</span>
              <p>Manage patients, doctors &amp; admins</p>
            </Link>
            <Link to="/admin/recovery-records" className="admin-link-card">
              <Activity size={24} color="#10b981" />
              <span>Recovery Records</span>
              <p>View all daily updates</p>
            </Link>
            <Link to="/admin/wound-assessments" className="admin-link-card">
              <Camera size={24} color="#f59e0b" />
              <span>Wound Assessments</span>
              <p>AI assessment log</p>
            </Link>
            <Link to="/admin/activity" className="admin-link-card">
              <TrendingUp size={24} color="#ef4444" />
              <span>System Activity</span>
              <p>Activity &amp; audit logs</p>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card mt-4" style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Shield size={20} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: '600', marginBottom: '4px' }}>Academic Prototype System</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                This is a college mini-project demonstration system. All data shown is sample/demo data. No real patient records, medical devices, or hospital systems are connected. AI wound assessments are experimental and not for clinical use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
