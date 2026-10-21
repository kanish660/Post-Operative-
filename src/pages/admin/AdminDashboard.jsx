import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getAllAlerts, getAdminRecoveryRecords } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import RecoveryChart from '../../components/RecoveryChart';
import { 
  Users, Activity, Camera, AlertTriangle, TrendingUp, 
  Shield, ArrowRight, Bell, FileText, CheckCircle2, Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recoveryRecords, setRecoveryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes, recordsRes] = await Promise.all([
          getAdminStats().catch(() => ({ data: null })),
          getAllAlerts().catch(() => ({ data: { alerts: [] } })),
          getAdminRecoveryRecords().catch(() => ({ data: { recovery_records: [] } }))
        ]);

        if (statsRes?.data) {
          setStats(statsRes.data.stats || statsRes.data);
        }
        if (alertsRes?.data) {
          setAlerts(alertsRes.data.alerts || []);
        }
        if (recordsRes?.data) {
          setRecoveryRecords(recordsRes.data.recovery_records || []);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'Active' || a.status === 'unread');
  const activeAlertsCount = activeAlerts.length || (stats?.active_alerts ?? 0);

  const cards = [
    {
      label: 'Total Patients',
      value: stats?.total_patients ?? 0,
      sub: 'Registered patients',
      icon: Users,
      color: '#2563eb',
      bgLight: 'rgba(37, 99, 235, 0.15)',
      border: 'rgba(37, 99, 235, 0.3)',
      link: '/admin/users'
    },
    {
      label: 'Total Doctors',
      value: stats?.total_doctors ?? 0,
      sub: 'Active physicians',
      icon: Shield,
      color: '#06b6d4',
      bgLight: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.3)',
      link: '/admin/users'
    },
    {
      label: 'Pending Doctors',
      value: stats?.pending_doctors ?? 0,
      sub: 'Awaiting approval',
      icon: Clock,
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      link: '/admin/users'
    },
    {
      label: 'Recovery Updates',
      value: stats?.total_recovery_updates ?? 0,
      sub: 'Daily submissions',
      icon: Activity,
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      link: '/admin/recovery-records'
    },
    {
      label: 'Wound Assessments',
      value: stats?.total_wound_images ?? stats?.total_wound_assessments ?? 0,
      sub: 'AI evaluated images',
      icon: Camera,
      color: '#8b5cf6',
      bgLight: 'rgba(139, 92, 246, 0.15)',
      border: 'rgba(139, 92, 246, 0.3)',
      link: '/admin/wound-assessments'
    },
    {
      label: 'Active Alerts',
      value: stats?.active_alerts ?? activeAlerts.length,
      sub: 'Needs review',
      icon: AlertTriangle,
      color: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      link: '/admin/users'
    },
    {
      label: 'Needs Attention',
      value: stats?.patients_needing_attention ?? 0,
      sub: 'Requires intervention',
      icon: TrendingUp,
      color: '#ec4899',
      bgLight: 'rgba(236, 72, 153, 0.15)',
      border: 'rgba(236, 72, 153, 0.3)',
      link: '/admin/recovery-records'
    }
  ];

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar role="admin" />
        <div className="main-content">
          <div className="loading-screen">
            <div className="spinner"></div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>Loading Admin Management Portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar 
        role="admin" 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />

      <div className="main-content">
        <TopHeader 
          title="Admin Portal" 
          subtitle="System Overview & Management" 
          unreadCount={activeAlertsCount}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        {/* Dashboard Title Banner */}
        <div className="admin-header-banner mb-6">
          <div>
            <h1 className="admin-page-heading">Admin Dashboard</h1>
            <p className="admin-page-subheading">System overview and management portal</p>
          </div>
          <div className="admin-role-badge-tag">
            <Shield size={16} /> System Administrator
          </div>
        </div>

        {/* Responsive Statistics Grid — 4 Columns on desktop */}
        <div className="admin-stats-grid mb-6">
          {cards.map((c) => {
            const IconComp = c.icon;
            return (
              <Link 
                key={c.label} 
                to={c.link} 
                className="admin-stat-card"
                style={{ borderColor: c.border }}
              >
                <div className="admin-stat-top">
                  <div 
                    className="admin-stat-icon-wrapper" 
                    style={{ background: c.bgLight, color: c.color }}
                  >
                    <IconComp size={24} />
                  </div>
                  <span className="admin-stat-sub-tag">{c.sub}</span>
                </div>
                <div className="admin-stat-body">
                  <div className="admin-stat-val">{c.value}</div>
                  <div className="admin-stat-lbl">{c.label}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Middle 2-Column Split: Recovery Overview & Needs Attention */}
        <div className="admin-mid-grid mb-6">
          {/* Recovery Overview Chart Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Recovery Overview</h3>
                <p className="admin-card-subtitle">Recent patient recovery updates &amp; pain score trends</p>
              </div>
              <span className="badge badge-info">Live Data</span>
            </div>
            <div className="admin-card-body">
              <RecoveryChart data={recoveryRecords} metric="pain_level" color="#2563eb" />
            </div>
          </div>

          {/* Needs Attention / Active Alerts Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={20} color="#ef4444" />
                <h3 className="admin-card-title">Needs Attention</h3>
              </div>
              <Link to="/admin/users" className="admin-card-action-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="admin-card-body">
              {activeAlerts.length > 0 ? (
                <div className="admin-alerts-stack">
                  {activeAlerts.slice(0, 4).map((alert, idx) => (
                    <div key={alert.id || idx} className="admin-alert-item">
                      <div className="admin-alert-dot" />
                      <div style={{ flex: 1 }}>
                        <div className="admin-alert-item-title">
                          {alert.title || alert.alert_type || 'Patient Recovery Alert'}
                        </div>
                        <p className="admin-alert-item-msg">{alert.message || 'Requires clinical evaluation.'}</p>
                        <div className="admin-alert-item-time">
                          <Clock size={12} /> {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Today'}
                        </div>
                      </div>
                      <span className="severity-badge severity-high">Attention</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-alerts">
                  <CheckCircle2 size={36} color="#10b981" />
                  <p style={{ fontWeight: 700, color: '#ffffff', margin: '0.5rem 0 0.25rem 0' }}>All Clear</p>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No urgent alerts or patients needing immediate review.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Management Grid */}
        <div className="admin-card mb-6">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Quick Management</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Administrative Portal Shortcuts</span>
          </div>

          <div className="admin-quick-grid">
            <Link to="/admin/users" className="admin-quick-card">
              <div className="admin-quick-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="admin-quick-title">User Management</div>
                <div className="admin-quick-desc">Manage patients, doctors &amp; admin roles</div>
              </div>
            </Link>

            <Link to="/admin/recovery-records" className="admin-quick-card">
              <div className="admin-quick-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Activity size={22} />
              </div>
              <div>
                <div className="admin-quick-title">Recovery Updates</div>
                <div className="admin-quick-desc">View patient daily recovery updates</div>
              </div>
            </Link>

            <Link to="/admin/wound-assessments" className="admin-quick-card">
              <div className="admin-quick-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <Camera size={22} />
              </div>
              <div>
                <div className="admin-quick-title">Wound Assessments</div>
                <div className="admin-quick-desc">Review AI wound analysis &amp; uploads</div>
              </div>
            </Link>

            <Link to="/admin/activity" className="admin-quick-card">
              <div className="admin-quick-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="admin-quick-title">System Activity</div>
                <div className="admin-quick-desc">Audit logs &amp; system telemetry</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Prototype System Disclaimer Banner */}
        <div className="admin-disclaimer-card">
          <Shield size={20} color="#6366f1" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem', marginBottom: '2px' }}>
              Academic Prototype System Information
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.4 }}>
              This portal displays real database records for registered patients and clinical users. AI wound evaluations are experimental prototype tools for decision support.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
