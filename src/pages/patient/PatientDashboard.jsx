import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientDetails, getPatientAlerts, getPatientRecoveryHistory, getLatestWoundAssessment } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import StatusBadge from '../../components/Badge';
import RecoveryChart from '../../components/RecoveryChart';
import { 
  Activity, AlertTriangle, Camera, ClipboardList, TrendingUp, 
  FileText, Bell, Thermometer, Heart, Calendar, ShieldCheck, 
  ChevronRight, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, patientId } = useAuth();
  const [patient, setPatient] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recoveryHistory, setRecoveryHistory] = useState([]);
  const [latestWound, setLatestWound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (patientId) {
          const [pRes, aRes, rRes, wRes] = await Promise.all([
            getPatientDetails(patientId),
            getPatientAlerts(patientId),
            getPatientRecoveryHistory(patientId),
            getLatestWoundAssessment(patientId).catch(() => ({ data: null }))
          ]);
          setPatient(pRes.data.patient);
          setAlerts(aRes.data.alerts || []);
          setRecoveryHistory(rRes.data.updates || []);
          setLatestWound(wRes?.data || null);
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
    ? Math.max(1, Math.floor((new Date() - new Date(patient.surgery_date)) / (1000 * 60 * 60 * 24)))
    : 0;

  const latestUpdate = recoveryHistory[0];
  const unreadAlerts = alerts.filter(a => a.status === 'unread' || a.status === 'Active').length;

  const calculateProgress = () => {
    if (recoveryHistory.length === 0) return 60;
    const latestPain = latestUpdate?.pain_score ?? latestUpdate?.pain_level ?? 5;
    return Math.max(10, Math.min(100, Math.round((10 - latestPain) * 10)));
  };

  const progressPct = calculateProgress();
  const patientName = user?.name || patient?.name || 'Gurunathan M';
  const woundStatusText = latestWound?.result || latestWound?.assessment || patient?.recovery_status || 'Healing Normally';

  // Glassmorphic Dark Card Style
  const darkGlassStyle = {
    background: 'rgba(20, 35, 55, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    borderRadius: '18px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
    padding: '1.5rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  if (loading) return (
    <div className="app-layout" style={{ background: 'linear-gradient(135deg, #071426 0%, #0D1B2A 50%, #102A43 100%)', minHeight: '100vh' }}>
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="loading-screen" style={{ color: '#94a3b8' }}>
          <div className="spinner"></div>
          <p>Loading your recovery portal...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout" style={{ background: 'linear-gradient(135deg, #071426 0%, #0D1B2A 50%, #102A43 100%)', minHeight: '100vh' }}>
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      
      <div className="main-content" style={{ background: 'transparent' }}>
        {/* Top Navigation Header — 72px height sticky bar */}
        <TopHeader 
          unreadCount={unreadAlerts} 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        {/* Dashboard Unified Container — Shared Left Alignment */}
        <div className="patient-dashboard-container" style={{ width: '100%', boxSizing: 'border-box' }}>
          
          {/* Welcome Section — Positioned close to top with 24px bottom gap */}
          <div className="welcome-section" style={{ margin: '0 0 24px 0', padding: 0, textAlign: 'left' }}>
            <h1 className="welcome-heading" style={{ fontSize: '40px', lineHeight: 1.15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0', letterSpacing: 'normal', wordSpacing: 'normal' }}>
              Welcome back, {patientName} 👋
            </h1>
            <p className="welcome-subtitle" style={{ fontSize: '18px', lineHeight: 1.5, color: '#94A9C6', margin: 0, fontWeight: 500, letterSpacing: 'normal', wordSpacing: 'normal' }}>
              Track your recovery progress and stay informed about your healing journey.
            </p>
          </div>

          {/* Academic Prototype Alert Notice — 24px top & bottom margin */}
          <div style={{ marginTop: '24px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
            <MedicalDisclaimer compact />
          </div>

          {/* 4 Statistics Cards — 4 Columns on desktop, 20px gap */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Card 1: Recovery Progress */}
            <div style={{ ...darkGlassStyle, borderTop: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="stat-icon" style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '12px', background: 'rgba(37, 99, 235, 0.18)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="stat-label" style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'normal', wordSpacing: 'normal', margin: 0 }}>Recovery Progress</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>{progressPct}%</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>On Track</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '99px', marginTop: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${progressPct}%`, 
                        height: '100%', 
                        borderRadius: '99px',
                        background: 'linear-gradient(90deg, #2563eb, #06b6d4)' 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Recovery Days */}
            <div style={{ ...darkGlassStyle, borderTop: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="stat-icon" style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.18)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="stat-label" style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'normal', wordSpacing: 'normal', margin: 0 }}>Recovery Days</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '2px 0 0 0', lineHeight: 1.2 }}>
                    {daysSinceSurgery} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>Days</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Wound Status */}
            {(() => {
              const isHealing = String(woundStatusText || '').toLowerCase().includes('healing');
              return (
                <div style={{ ...darkGlassStyle, borderTop: isHealing ? '4px solid #10b981' : '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="stat-icon" style={{ 
                      width: '48px', 
                      height: '48px', 
                      flexShrink: 0, 
                      borderRadius: '12px', 
                      background: isHealing ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)', 
                      color: isHealing ? '#34d399' : '#fbbf24',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Heart size={24} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="stat-label" style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'normal', wordSpacing: 'normal', margin: 0 }}>Wound Status</p>
                      <div style={{ marginTop: '4px' }}>
                        <StatusBadge status={woundStatusText} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Card 4: Daily Updates */}
            <div style={{ ...darkGlassStyle, borderTop: '4px solid #7c3aed' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="stat-icon" style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '12px', background: 'rgba(124, 58, 237, 0.18)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="stat-label" style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'normal', wordSpacing: 'normal', margin: 0 }}>Daily Updates</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '2px 0 0 0', lineHeight: 1.2 }}>
                    {recoveryHistory.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>Logs</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attention Required Section - ONLY DISPLAYED WHEN AN ALERT EXISTS */}
          {alerts.length > 0 && unreadAlerts > 0 && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '18px', 
              padding: '1.25rem 1.5rem', 
              marginBottom: '28px' 
            }}>
              <div className="card-header-row" style={{ marginBottom: '16px' }}>
                <h2 className="card-title" style={{ color: '#F87171', margin: 0, fontSize: '1.15rem' }}>
                  <AlertTriangle size={20} color="#F87171" /> Attention Required ({unreadAlerts})
                </h2>
                <Link to="/patient/alerts" className="btn btn-sm btn-danger" style={{ background: '#EF4444', border: 'none', color: '#ffffff' }}>
                  Review Alerts <ChevronRight size={16} />
                </Link>
              </div>

              <div className="alerts-stack" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.filter(a => a.status === 'unread' || a.status === 'Active').slice(0, 2).map((alert) => (
                  <div key={alert.id} style={{ 
                    background: 'rgba(15, 23, 42, 0.75)', 
                    padding: '0.9rem 1.1rem', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(239, 68, 68, 0.25)' 
                  }}>
                    <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>{alert.alert_type || alert.title || 'Attention Notice'}</p>
                    <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginTop: '4px', lineHeight: 1.5 }}>{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recovery Overview Section (Line Chart with Dark Theme) — 28px bottom margin */}
          <div style={{ ...darkGlassStyle, marginBottom: '28px' }}>
            <div className="card-header-row" style={{ marginBottom: '16px' }}>
              <div>
                <h2 className="card-title" style={{ color: '#FFFFFF', fontSize: '1.15rem', margin: 0 }}>
                  <TrendingUp size={20} color="#3b82f6" /> Recovery Overview
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.5 }}>
                  Track pain score regression and body temperature over logged recovery days
                </p>
              </div>
              <Link to="/patient/recovery-tracking" className="link-btn" style={{ color: '#60a5fa' }}>
                Full Analytics <ArrowUpRight size={16} />
              </Link>
            </div>

            <RecoveryChart data={recoveryHistory} metric="pain_level" color="#2563eb" />
          </div>

          {/* Grid layout for Recent Updates & Latest Wound Analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Latest Wound Analysis Card */}
            <div style={darkGlassStyle}>
              <div className="card-header-row" style={{ marginBottom: '16px' }}>
                <h2 className="card-title" style={{ color: '#FFFFFF', fontSize: '1.1rem', margin: 0 }}>
                  <Camera size={18} color="#22d3ee" /> Latest Wound Analysis
                </h2>
                <Link to="/patient/wound-upload" className="link-btn" style={{ color: '#60a5fa' }}>
                  New Upload <ChevronRight size={16} />
                </Link>
              </div>

              {latestWound && (latestWound.result || latestWound.assessment || latestWound.ai_result) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {latestWound.image_url ? (
                      <img 
                        src={`/uploads/${latestWound.image_url}`} 
                        alt="Wound preview" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)' }} 
                      />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                        <Camera size={32} />
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <StatusBadge status={latestWound.result || latestWound.assessment || latestWound.ai_result} />
                      <div style={{ marginTop: '6px', fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>
                        Confidence Score: <span style={{ color: '#60a5fa' }}>{latestWound.confidence || latestWound.ai_confidence || 98}%</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                        Date: {latestWound.upload_date ? new Date(latestWound.upload_date).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', lineHeight: 1.5 }}>
                    {latestWound.message || latestWound.ai_message || 'Automated prototype analysis of color distribution completed.'}
                  </p>

                  <Link to="/patient/wound-history" className="btn btn-secondary btn-sm btn-full" style={{ background: 'rgba(255, 255, 255, 0.06)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    View Assessment Details
                  </Link>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '2rem 1rem', background: 'transparent', border: 'none' }}>
                  <div className="empty-state-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}>
                    <Camera size={28} />
                  </div>
                  <h3 style={{ color: '#ffffff' }}>No wound images uploaded yet</h3>
                  <p style={{ color: '#94a3b8' }}>Upload your first wound image for analysis.</p>
                  <Link to="/patient/wound-upload" className="btn btn-primary btn-sm mt-2">
                    <Camera size={16} /> Upload Wound Image
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Recovery Updates Card */}
            <div style={darkGlassStyle}>
              <div className="card-header-row" style={{ marginBottom: '16px' }}>
                <h2 className="card-title" style={{ color: '#FFFFFF', fontSize: '1.1rem', margin: 0 }}>
                  <ClipboardList size={18} color="#a78bfa" /> Recent Recovery Updates
                </h2>
                <Link to="/patient/daily-update" className="link-btn" style={{ color: '#60a5fa' }}>
                  Log Update <ChevronRight size={16} />
                </Link>
              </div>

              {latestUpdate ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="info-item" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span className="info-label" style={{ color: '#94a3b8' }}>Date</span>
                      <span className="info-value" style={{ color: '#ffffff' }}>{latestUpdate.update_date || latestUpdate.created_at?.split(' ')[0]}</span>
                    </div>
                    <div className="info-item" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span className="info-label" style={{ color: '#94a3b8' }}>Pain Level</span>
                      <span className="info-value" style={{ color: latestUpdate.pain_score > 5 ? '#f87171' : '#34d399' }}>
                        {latestUpdate.pain_score ?? latestUpdate.pain_level ?? '—'}/10
                      </span>
                    </div>
                    <div className="info-item" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span className="info-label" style={{ color: '#94a3b8' }}>Swelling</span>
                      <span className="info-value capitalize" style={{ color: '#ffffff' }}>{latestUpdate.swelling || 'None'}</span>
                    </div>
                    <div className="info-item" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <span className="info-label" style={{ color: '#94a3b8' }}>Temperature</span>
                      <span className="info-value" style={{ color: '#ffffff' }}>{latestUpdate.body_temp || latestUpdate.temperature || '98.6'}°F</span>
                    </div>
                  </div>

                  {latestUpdate.notes && (
                    <div style={{ fontSize: '0.85rem', color: '#f8fafc', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', lineHeight: 1.5 }}>
                      <strong style={{ color: '#94a3b8' }}>Notes:</strong> {latestUpdate.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.82rem', color: '#94a3b8' }}>
                    <span>Status: <strong style={{ color: '#34d399' }}>Submitted</strong></span>
                    <Link to="/patient/recovery-tracking" className="link-btn" style={{ color: '#60a5fa' }}>View Log History</Link>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '2rem 1rem', background: 'transparent', border: 'none' }}>
                  <div className="empty-state-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#a78bfa' }}>
                    <ClipboardList size={28} />
                  </div>
                  <h3 style={{ color: '#ffffff' }}>No recovery updates yet</h3>
                  <p style={{ color: '#94a3b8' }}>Submit your first daily update to start tracking your recovery.</p>
                  <Link to="/patient/daily-update" className="btn btn-primary btn-sm mt-2">
                    <ClipboardList size={16} /> Submit Daily Update
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
