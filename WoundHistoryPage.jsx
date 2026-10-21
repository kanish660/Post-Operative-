import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientWoundHistory } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import { CheckCircle, AlertCircle, Camera } from 'lucide-react';

export default function WoundHistoryPage() {
  const { patientId } = useAuth();
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

  const healingCount = assessments.filter(a => a.assessment?.toLowerCase().includes('healing normally')).length;
  const attentionCount = assessments.length - healingCount;

  return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Wound Assessment History</h1>
            <p className="subtitle">All your previous AI wound evaluations</p>
          </div>
        </div>

        <MedicalDisclaimer compact />

        <div className="stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><CheckCircle size={22} color="#10b981" /></div>
            <div><p className="stat-label">Healing Normally</p><p className="stat-value" style={{ color: '#10b981' }}>{healingCount}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}><AlertCircle size={22} color="#ef4444" /></div>
            <div><p className="stat-label">Needs Attention</p><p className="stat-value" style={{ color: '#ef4444' }}>{attentionCount}</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><Camera size={22} color="#6366f1" /></div>
            <div><p className="stat-label">Total Assessments</p><p className="stat-value">{assessments.length}</p></div>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner"></div><p>Loading assessments...</p></div>
        ) : assessments.length === 0 ? (
          <div className="card empty-state">
            <Camera size={48} opacity={0.3} />
            <h3>No Assessments Yet</h3>
            <p>Upload your first wound image to get started.</p>
          </div>
        ) : (
          <div className="wound-gallery">
            {assessments.map((item) => {
              const isHealing = item.assessment?.toLowerCase().includes('healing normally');
              return (
                <div key={item.id} className={`wound-card ${selected?.id === item.id ? 'wound-card-selected' : ''}`} onClick={() => setSelected(selected?.id === item.id ? null : item)}>
                  <div className="wound-img-wrapper">
                    {item.image_url
                      ? <img src={`/uploads/${item.image_url}`} alt="Wound" className="wound-thumbnail" />
                      : <div className="wound-no-img"><Camera size={32} opacity={0.3} /></div>
                    }
                    <span className={`wound-badge ${isHealing ? 'badge-healing' : 'badge-attention'}`}>
                      {isHealing ? '✅ Healing' : '⚠️ Attention'}
                    </span>
                  </div>
                  <div className="wound-meta">
                    <p className="wound-date">{new Date(item.upload_date || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <div className="wound-confidence">
                      <div className="conf-bar-mini">
                        <div className={`conf-fill-mini ${isHealing ? 'bar-green' : 'bar-red'}`} style={{ width: `${item.confidence || 70}%` }}></div>
                      </div>
                      <span>{item.confidence || 70}%</span>
                    </div>
                  </div>

                  {selected?.id === item.id && (
                    <div className="wound-detail-panel">
                      <p><strong>Notes:</strong> {item.notes || 'None'}</p>
                      {item.details && Object.entries(item.details).map(([k, v]) => (
                        <p key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {String(v)}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
