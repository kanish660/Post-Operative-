import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRecoveryReport } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import { FileText, Printer, CheckCircle, AlertCircle } from 'lucide-react';

export default function RecoveryReportPage() {
  const { patientId } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRecoveryReport(patientId);
        setReport(res.data);
      } catch (e) {
        setError('Could not load report.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  const handlePrint = () => window.print();

  return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header no-print">
          <div>
            <h1>Recovery Report</h1>
            <p className="subtitle">Complete summary of your post-operative recovery</p>
          </div>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={18} /> Print / Save PDF
          </button>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Generating report...</p></div>
        ) : error ? (
          <div className="card empty-state"><AlertCircle size={48} opacity={0.3} /><h3>Report Unavailable</h3><p>{error}</p></div>
        ) : (
          <div className="report-paper" id="recovery-report">
            {/* Header */}
            <div className="report-header">
              <div className="report-logo">
                <FileText size={32} color="#6366f1" />
                <div>
                  <h1 className="report-title">Post-Operative Recovery Report</h1>
                  <p className="report-subtitle">Patient Remote Recovery Tracker — Academic Prototype</p>
                </div>
              </div>
              <div className="report-date">
                <p>Report Generated</p>
                <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            </div>

            <MedicalDisclaimer />

            {/* Patient Info */}
            {report?.patient && (
              <div className="report-section">
                <h2 className="report-section-title">Patient Information</h2>
                <div className="report-info-grid">
                  <div><span>Name</span><strong>{report.patient.name}</strong></div>
                  <div><span>Surgery Type</span><strong>{report.patient.surgery_type}</strong></div>
                  <div><span>Surgery Date</span><strong>{report.patient.surgery_date}</strong></div>
                  <div><span>Hospital</span><strong>{report.patient.hospital_name}</strong></div>
                  <div><span>Attending Doctor</span><strong>Dr. {report.patient.doctor_name || 'Assigned Physician'}</strong></div>
                  <div><span>Recovery Status</span><strong style={{ color: report.patient.recovery_status === 'Good' ? '#10b981' : '#f59e0b' }}>{report.patient.recovery_status || 'Under Review'}</strong></div>
                </div>
              </div>
            )}

            {/* Recovery Summary */}
            {report?.summary && (
              <div className="report-section">
                <h2 className="report-section-title">Recovery Summary</h2>
                <div className="report-summary-grid">
                  <div className="summary-card">
                    <span className="summary-num">{report.summary.total_updates}</span>
                    <span>Daily Updates</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-num">{report.summary.avg_pain?.toFixed(1) || '—'}</span>
                    <span>Avg Pain Score</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-num">{report.summary.total_wound_assessments}</span>
                    <span>AI Assessments</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-num">{report.summary.healing_assessments}</span>
                    <span>Healing Normally</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery Updates Table */}
            {report?.updates?.length > 0 && (
              <div className="report-section">
                <h2 className="report-section-title">Daily Recovery Updates</h2>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Pain</th>
                      <th>Temp (°F)</th>
                      <th>Swelling</th>
                      <th>Redness</th>
                      <th>Discharge</th>
                      <th>Mobility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.updates.map((u, i) => (
                      <tr key={i}>
                        <td>{new Date(u.update_date || u.created_at).toLocaleDateString()}</td>
                        <td>{u.pain_score}/10</td>
                        <td>{u.body_temp}</td>
                        <td>{u.swelling}</td>
                        <td>{u.redness}</td>
                        <td>{u.discharge}</td>
                        <td>{u.mobility?.replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AI Wound Assessments */}
            {report?.wound_assessments?.length > 0 && (
              <div className="report-section">
                <h2 className="report-section-title">AI Wound Assessments</h2>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Assessment</th>
                      <th>Confidence</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.wound_assessments.map((w, i) => (
                      <tr key={i}>
                        <td>{new Date(w.upload_date || w.created_at).toLocaleDateString()}</td>
                        <td>
                          <span style={{ color: w.assessment?.toLowerCase().includes('healing') ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                            {w.assessment?.toLowerCase().includes('healing') ? '✅' : '⚠️'} {w.assessment}
                          </span>
                        </td>
                        <td>{w.confidence}%</td>
                        <td>{w.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doctor Notes */}
            {report?.doctor_notes?.length > 0 && (
              <div className="report-section">
                <h2 className="report-section-title">Doctor's Clinical Notes</h2>
                <div className="doctor-notes-list">
                  {report.doctor_notes.map((n, i) => (
                    <div key={i} className="doctor-note-item">
                      <div className="note-date">{new Date(n.created_at).toLocaleDateString()}</div>
                      <p className="note-text">{n.note_text}</p>
                      <p className="note-author">— Dr. {n.doctor_name || 'Attending Physician'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer Footer */}
            <div className="report-footer">
              <p>⚕️ <strong>IMPORTANT:</strong> This report is generated by an academic prototype system and is intended for educational and informational purposes only. All AI-generated wound assessments are <strong>NOT medical diagnoses</strong>. A qualified healthcare professional must make all clinical decisions.</p>
              <p className="report-footer-small">Post-Operative Patient Remote Recovery Tracker | Academic Mini-Project | Not for Clinical Use</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
