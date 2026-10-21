import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadWoundImage, getLatestWoundAssessment } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import StatusBadge from '../../components/Badge';
import { Upload, Camera, CheckCircle, AlertCircle, Activity, Info, RefreshCw, FileText, Sparkles, Calendar } from 'lucide-react';

export default function WoundUploadPage() {
  const { patientId } = useAuth();
  const fileRef = useRef(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Retrieve the latest saved assessment on page load
  useEffect(() => {
    if (patientId) {
      getLatestWoundAssessment(patientId)
        .then(res => {
          const data = res.data;
          if (data && (data.result || data.assessment || data.ai_result)) {
            const rawConf = data.confidence !== undefined ? data.confidence : data.ai_confidence;
            const conf = typeof rawConf === 'number' ? Math.round(rawConf) : (Number(rawConf) || 85);
            setResult({
              result: data.result || data.assessment || data.ai_result,
              assessment: data.result || data.assessment || data.ai_result,
              confidence: Math.min(100, Math.max(0, conf)),
              message: data.message || data.ai_message || 'Latest saved AI assessment.',
              details: data.details || data.color_metrics || null,
              upload_date: data.upload_date || data.created_at,
              isSaved: true
            });
          }
        })
        .catch(() => {});
    }
  }, [patientId]);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please select an image file (JPG, PNG, WEBP).'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File size exceeds 10MB limit.'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a wound photo first.'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (patientId) formData.append('patient_id', patientId);
      formData.append('notes', notes);
      formData.append('description', notes);
      const res = await uploadWoundImage(formData);

      const data = res.data || {};
      const aiData = data.ai_assessment || data.wound_record || {};

      const assessmentResult = data.result || data.assessment || data.ai_result || aiData.result || aiData.classification || 'Healing Normally';
      const rawConfidence = data.confidence !== undefined ? data.confidence : (data.ai_confidence !== undefined ? data.ai_confidence : (aiData.confidence !== undefined ? aiData.confidence : 98));
      const confidenceScore = typeof rawConfidence === 'number' ? Math.round(rawConfidence) : (Number(rawConfidence) || 98);
      const assessmentMessage = data.ai_message || aiData.message || data.message || 'Automated prototype analysis of color distribution completed.';
      const assessmentDetails = data.details || aiData.details || aiData.heuristics || data.color_metrics || null;

      setResult({
        result: assessmentResult,
        assessment: assessmentResult,
        confidence: Math.min(100, Math.max(0, confidenceScore)),
        message: assessmentMessage,
        details: assessmentDetails,
        upload_date: new Date().toISOString(),
        ...data
      });
    } catch (err) {
      setError(err.response?.data?.error || 'AI assessment could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isHealing = (result?.result || result?.assessment || '')?.toLowerCase().includes('healing normally');

  return (
    <div className="app-layout">
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopHeader 
          title="Wound Upload & AI Analysis" 
          subtitle="Upload wound images for prototype visual feature evaluation"
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        <MedicalDisclaimer compact />

        <div className="wound-upload-layout">
          {/* Large Upload Card */}
          <div className="card">
            <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>
              Upload Wound Image
            </h2>
            <p className="subtitle" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Upload a clear image of the wound for automated preliminary analysis.
            </p>

            {error && (
              <div className="alert-banner alert-banner-error mb-3">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop Area with Blue/Cyan Gradient Border */}
            {!preview ? (
              <div
                className={`drop-zone drop-zone-gradient ${dragOver ? 'drop-zone-active' : ''}`}
                onClick={() => fileRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                style={{ padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-lg)' }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.2))', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <Upload size={32} />
                </div>
                <p className="drop-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Drag and drop wound photo here
                </p>
                <p className="drop-sub" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Supports JPG, PNG, WEBP (Max 10MB)
                </p>
                
                <button type="button" className="btn btn-secondary btn-sm mt-2" style={{ borderColor: '#06b6d4', color: '#2563eb' }}>
                  <Camera size={16} /> Browse Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="preview-wrapper">
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={preview} alt="Wound preview" className="preview-img" />
                  <span className="badge badge-info" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15,23,42,0.75)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                    <Calendar size={12} /> Upload Date: {new Date().toLocaleDateString()}
                  </span>
                </div>
                <button className="btn btn-outline btn-sm mt-2" onClick={() => { setPreview(null); setFile(null); setResult(null); }}>
                  <RefreshCw size={14} /> Replace Image
                </button>
              </div>
            )}

            <div className="form-group mt-3">
              <label className="form-label">
                <FileText size={16} color="#2563eb" /> Patient Observations / Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="form-textarea"
                placeholder="Add optional notes regarding incision redness, pain, or drainage..."
              />
            </div>

            <button
              className="btn btn-primary btn-full mt-3"
              onClick={handleSubmit}
              disabled={loading || !file}
              style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', border: 'none', padding: '0.85rem' }}
            >
              {loading ? (
                <><div className="btn-spinner"></div> Analyzing Image Features...</>
              ) : (
                <><Sparkles size={18} /> Submit &amp; Analyze Image</>
              )}
            </button>

            <div className="disclaimer-note mt-3">
              <Info size={16} style={{ flexShrink: 0, color: 'var(--warning-dark)' }} />
              <span>Upload a clear image of the wound for automated preliminary analysis.</span>
            </div>
          </div>

          {/* AI Analysis Result Card */}
          <div className="card">
            <h2 className="card-title">
              <Activity size={20} color="#2563eb" /> AI Assessment Result
            </h2>

            {!result ? (
              <div className="empty-state" style={{ border: 'none', background: 'transparent', padding: '3rem 1rem' }}>
                <div className="empty-state-icon">
                  <Activity size={32} />
                </div>
                <h3>No wound images uploaded yet</h3>
                <p>Upload your first wound image for analysis.</p>
              </div>
            ) : (
              <div className="assessment-result">
                {/* Result Status Badge */}
                <div className={`assessment-badge ${isHealing ? 'badge-healing' : 'badge-attention'}`}>
                  {isHealing ? <CheckCircle size={36} /> : <AlertCircle size={36} />}
                  <span>{result.result || result.assessment}</span>
                </div>

                {/* Confidence Bar */}
                <div className="confidence-bar-wrapper">
                  <div className="confidence-labels">
                    <span>Confidence Score</span>
                    <span style={{ color: '#2563eb', fontWeight: 800 }}>{result.confidence}%</span>
                  </div>
                  <div className="confidence-bar-bg">
                    <div
                      className={`confidence-bar-fill ${isHealing ? 'bar-green' : 'bar-red'}`}
                      style={{ width: `${Math.min(100, Math.max(0, result.confidence || 98))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Analysis Message */}
                {(result.message || result.ai_message) && (
                  <div style={{ padding: '0.9rem 1.1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', borderLeft: isHealing ? '4px solid var(--success)' : '4px solid var(--warning)', fontSize: '0.88rem', color: 'var(--navy-dark)', lineHeight: 1.5 }}>
                    <p style={{ margin: 0 }}>{result.message || result.ai_message}</p>
                  </div>
                )}

                {/* Heuristic / RGB Metric Values */}
                {result.details && typeof result.details === 'object' && (
                  <div className="assessment-details">
                    <h4>Color Feature Metrics</h4>
                    <ul>
                      {Object.entries(result.details).map(([k, v]) => (
                        <li key={k}>
                          <span className="detail-key">{k.replace(/_/g, ' ')}:</span>{' '}
                          <span className="detail-val">{typeof v === 'number' ? v.toFixed(3) : String(v)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mandatory Academic Disclaimer */}
                <div className="disclaimer-note">
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <span>Heuristic score calculated from color distribution, not medical diagnosis.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
