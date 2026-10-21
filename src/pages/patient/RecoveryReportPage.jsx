import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRecoveryReport } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import StatusBadge from '../../components/Badge';
import { FileText, Printer, CheckCircle, AlertCircle, Download, Calendar, Activity, Camera } from 'lucide-react';

export default function RecoveryReportPage() {
  const { patientId } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRecoveryReport(patientId);
        setReport(res.data);
      } catch (e) {
        setError('Could not load report data.');
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetch();
  }, [patientId]);

  const handleDownload = () => window.print();

  return (
    <div className="app-layout">
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopHeader 
          title="Recovery Reports" 
          subtitle="Comprehensive post-operative summary report"
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        <div className="page-header no-print" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>Medical Recovery Report</h1>
            <p className="subtitle">Official patient recovery dashboard summary report</p>
          </div>
          <button className="btn btn-primary" onClick={handleDownload} style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', border: 'none' }}>
            <Download size={18} /> Download Report
          </button>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Generating recovery report...</p></div>
        ) : error ? (
          <div className="card empty-state"><AlertCircle size={48} opacity={0.3} /><h3>Report Unavailable</h3><p>{error}</p></div>
        ) : (
          <div className="report-paper" id="recovery-report" style={{ background: '#ffffff', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
            {/* Report Header */}
            <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={26} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-dark)' }}>Post-Operative Recovery Report</h1>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>PostOpCare Clinical Tracking Portal</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Date Generated</p>
                <strong style={{ color: 'var(--navy-dark)' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            </div>

            <MedicalDisclaimer compact />

            {/* Patient Info */}
            {report?.patient && (
              <div className="card mb-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.85rem' }}>Patient Information</h3>
                <div className="info-grid">
                  <div className="info-item"><span>Name</span><strong>{report.patient.name}</strong></div>
                  <div className="info-item"><span>Surgery Type</span><strong>{report.patient.surgery_type || 'General Surgery'}</strong></div>
                  <div className="info-item"><span>Surgery Date</span><strong>{report.patient.surgery_date || 'N/A'}</strong></div>
                  <div className="info-item"><span>Attending Surgeon</span><strong>Dr. {report.patient.doctor_name || 'Assigned Physician'}</strong></div>
                  <div className="info-item">
                    <span>Current Wound Status</span>
                    <div style={{ marginTop: '0.2rem' }}>
                      <StatusBadge status={report.patient.recovery_status || 'Healing Normally'} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery Summary Metrics */}
            <div className="stats-grid mb-4">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--primary-light)', color: '#2563eb' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <p className="stat-label">Daily Updates</p>
                  <p className="stat-value">{report?.summary?.total_updates ?? report?.updates?.length ?? 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--secondary-light)', color: '#06b6d4' }}>
                  <Camera size={24} />
                </div>
                <div>
                  <p className="stat-label">Wound Images</p>
                  <p className="stat-value">{report?.summary?.total_wound_assessments ?? report?.wound_assessments?.length ?? 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success-dark)' }}>
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="stat-label">Healing Assessments</p>
                  <p className="stat-value" style={{ color: 'var(--success-dark)' }}>
                    {report?.summary?.healing_assessments ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Recovery History Table */}
            {report?.updates?.length > 0 && (
              <div className="card mb-4">
                <h3 className="card-title">Daily Recovery Logs</h3>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Pain</th>
                        <th>Temp (°F)</th>
                        <th>Swelling</th>
                        <th>Redness</th>
                        <th>Mobility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.updates.map((u, i) => (
                        <tr key={i}>
                          <td>{new Date(u.update_date || u.created_at).toLocaleDateString()}</td>
                          <td>{u.pain_score}/10</td>
                          <td>{u.body_temp}°F</td>
                          <td className="capitalize">{u.swelling}</td>
                          <td className="capitalize">{u.redness}</td>
                          <td className="capitalize">{(u.mobility || 'Normal').replace(/_/g, ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Disclaimer */}
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <p>⚕️ <strong>IMPORTANT:</strong> This report is generated by an academic prototype system for educational demonstration purposes. AI wound assessments do not constitute a clinical diagnosis.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
