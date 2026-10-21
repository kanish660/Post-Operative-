import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadWoundImage, getLatestWoundAssessment } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import { Upload, Camera, CheckCircle, AlertCircle, Activity, Info } from 'lucide-react';

export default function WoundUploadPage() {
  const { patientId } = useAuth();
  const fileRef = useRef(null);
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
              details: data.details,
              isSaved: true
            });
          }
        })
        .catch(() => {
          // No prior assessment yet for this patient
        });
    }
  }, [patientId]);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return; }
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
    if (!file) { setError('Please select a wound image first.'); return; }
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

      const assessmentResult = data.result || data.assessment || data.ai_result || aiData.result || aiData.classification;
      const rawConfidence = data.confidence !== undefined ? data.confidence : (data.ai_confidence !== undefined ? data.ai_confidence : (aiData.confidence !== undefined ? aiData.confidence : aiData.ai_confidence));
      const confidenceScore = typeof rawConfidence === 'number' ? Math.round(rawConfidence) : (Number(rawConfidence) || 85);
      const assessmentMessage = data.ai_message || aiData.message || data.message || 'Prototype AI assessment completed.';
      const assessmentDetails = data.details || aiData.details || aiData.heuristics || null;
      const disclaimerText = data.disclaimer || aiData.disclaimer || 'This AI assessment is for academic demonstration only and is not a medical diagnosis.';

      if (!assessmentResult) {
        setError('AI assessment could not be completed. Please try again.');
        setResult(null);
        return;
      }

      setResult({
        result: assessmentResult,
        assessment: assessmentResult,
        ai_result: assessmentResult,
        confidence: Math.min(100, Math.max(0, confidenceScore)),
        ai_confidence: Math.min(100, Math.max(0, confidenceScore)),
        message: assessmentMessage,
        ai_message: assessmentMessage,
        details: assessmentDetails,
        disclaimer: disclaimerText,
        ...data
      });
    } catch (err) {
      setError(err.response?.data?.error || 'AI assessment could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isHealing = (result?.result || result?.assessment || result?.ai_result || '')?.toLowerCase().includes('healing normally');

  return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Wound Image Upload</h1>
            <p className="subtitle">Upload a wound photo for AI-assisted healing assessment</p>
          </div>
        </div>

        <MedicalDisclaimer />

        <div className="wound-upload-layout">
          {/* Upload Section */}
          <div className="card">
            <h2 className="card-title">Upload Wound Photo</h2>

            {error && (
              <div className="alert-banner alert-banner-error mb-4">
                <AlertCircle size={18} /><span>{error}</span>
              </div>
            )}

            {/* Drop Zone */}
            {!preview ? (
              <div
                className={`drop-zone ${dragOver ? 'drop-zone-active' : ''}`}
                onClick={() => fileRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <Upload size={48} color="#6366f1" />
                <p className="drop-title">Drag & drop or click to upload</p>
                <p className="drop-sub">Supports JPG, PNG, WEBP • Max 10MB</p>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="preview-wrapper">
                <img src={preview} alt="Wound preview" className="preview-img" />
                <button className="btn btn-outline btn-sm mt-2" onClick={() => { setPreview(null); setFile(null); setResult(null); }}>
                  Change Image
                </button>
              </div>
            )}

            <div className="form-group mt-3">
              <label className="form-label">Notes / Observations (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="form-textarea"
                placeholder="Any specific areas of concern, recent changes..."
              />
            </div>

            <button
              className="btn btn-primary btn-full mt-3"
              onClick={handleSubmit}
              disabled={loading || !file}
            >
              {loading ? <><div className="btn-spinner"></div> Analyzing...</> : <><Camera size={18} /> Upload & Analyze</>}
            </button>
          </div>

          {/* Result Section */}
          <div className="card">
            <h2 className="card-title">AI Assessment Result</h2>

            {!result ? (
              <div className="empty-result">
                <Activity size={48} color="#6366f1" opacity={0.4} />
                <p>Upload a wound image to receive<br />the AI assessment result</p>
              </div>
            ) : (
              <div className="assessment-result">
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: '#e0e7ff', color: '#4338ca', display: 'inline-block' }}>
                    Prototype AI Assessment
                  </span>
                  {result.isSaved && (
                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                      (Latest Saved Record)
                    </span>
                  )}
                </div>

                <div className={`assessment-badge ${isHealing ? 'badge-healing' : 'badge-attention'}`}>
                  {isHealing ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
                  <span>{result.result || result.assessment || result.ai_result}</span>
                </div>

                <div className="confidence-bar-wrapper">
                  <div className="confidence-labels">
                    <span>Confidence Score</span>
                    <span><strong>{result.confidence}%</strong></span>
                  </div>
                  <div className="confidence-bar-bg">
                    <div
                      className={`confidence-bar-fill ${isHealing ? 'bar-green' : 'bar-red'}`}
                      style={{ width: `${Math.min(100, Math.max(0, result.confidence || 0))}%` }}
                    ></div>
                  </div>
                </div>

                {(result.message || result.ai_message) && (
                  <div className="assessment-message-box" style={{ margin: '14px 0', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', borderLeft: isHealing ? '4px solid #10b981' : '4px solid #f59e0b', fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                    <p style={{ margin: 0 }}>{result.message || result.ai_message}</p>
                  </div>
                )}

                {result.details && Object.keys(result.details).length > 0 && (
                  <div className="assessment-details">
                    <h4>Analysis Details</h4>
                    <ul>
                      {Object.entries(result.details).map(([k, v]) => (
                        <li key={k}><span className="detail-key">{k.replace(/_/g, ' ')}:</span> <span className="detail-val">{String(v)}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="disclaimer-note">
                  <Info size={14} />
                  <span>{result.disclaimer || 'This AI assessment is a prototype tool for academic use only. Always consult a qualified healthcare professional for medical decisions.'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
