import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientWoundHistory } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import StatusBadge from '../../components/Badge';
import { CheckCircle, AlertCircle, Camera, Info, Calendar } from 'lucide-react';

export default function WoundHistoryPage() {
  const { patientId } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPatientWoundHistory(patientId);
        setAssessments(res.data.assessments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  const healingCount = assessments.filter(a => a.assessment?.toLowerCase().includes('healing normally') || a.result?.toLowerCase().includes('healing normally')).length;
  const attentionCount = assessments.length - healingCount;

  return (
    <div className="app-layout">
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopHeader 
          title="Wound Analysis & History" 
          subtitle="All recorded AI wound image evaluations and color feature analysis"
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        <MedicalDisclaimer compact />

        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success-dark)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="stat-label">Healing Normally</p>
              <p className="stat-value" style={{ color: 'var(--success-dark)' }}>{healingCount}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="stat-label">Needs Attention</p>
              <p className="stat-value" style={{ color: 'var(--danger)' }}>{attentionCount}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--primary-light)', color: '#2563eb' }}>
              <Camera size={24} />
            </div>
            <div>
              <p className="stat-label">Total Assessments</p>
              <p className="stat-value">{assessments.length}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading wound evaluations...</p></div>
        ) : assessments.length === 0 ? (
          <div className="card empty-state" style={{ padding: '3.5rem 2rem' }}>
            <div className="empty-state-icon">
              <Camera size={32} />
            </div>
            <h3>No wound images uploaded yet</h3>
            <p>Upload your first wound image for analysis.</p>
            <Link to="/patient/wound-upload" className="btn btn-primary btn-sm mt-2">
              <Camera size={16} /> Upload Wound Image
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {assessments.map((item) => {
              const resText = item.assessment || item.result || 'Healing Normally';
              const isHealing = resText.toLowerCase().includes('healing normally');
              const conf = item.confidence || item.ai_confidence || 95;

              return (
                <div 
                  key={item.id} 
                  className="card" 
                  style={{ 
                    cursor: 'pointer',
                    borderColor: selected?.id === item.id ? '#2563eb' : 'var(--border-color)',
                    borderWidth: selected?.id === item.id ? '2px' : '1px'
                  }}
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}
                >
                  <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', height: '180px', background: 'var(--bg-app)' }}>
                    {item.image_url ? (
                      <img src={`/uploads/${item.image_url}`} alt="Wound evaluation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <Camera size={40} opacity={0.4} />
                      </div>
                    )}

                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <StatusBadge status={resText} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> {new Date(item.upload_date || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>
                      {conf}% Confidence
                    </span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="confidence-bar-bg" style={{ height: '6px', marginBottom: '0.75rem' }}>
                    <div className={`confidence-bar-fill ${isHealing ? 'bar-green' : 'bar-red'}`} style={{ width: `${conf}%` }}></div>
                  </div>

                  {item.notes && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.75rem', background: 'var(--bg-app)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <strong>Notes:</strong> {item.notes}
                    </p>
                  )}

                  {/* Color Feature Metrics & Details */}
                  {item.details && typeof item.details === 'object' && (
                    <div className="assessment-details" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.78rem' }}>Color Feature Values</h4>
                      <ul>
                        {Object.entries(item.details).map(([k, v]) => (
                          <li key={k}>
                            <span className="detail-key">{k.replace(/_/g, ' ')}:</span>{' '}
                            <span className="detail-val">{typeof v === 'number' ? v.toFixed(3) : String(v)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="disclaimer-note mt-2" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>Heuristic score calculated from color distribution, not medical diagnosis.</span>
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
