import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRecoveryUpdate } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function DailyUpdateForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pain_score: 3,
    body_temp: 98.6,
    swelling: 'none',
    redness: 'none',
    discharge: 'none',
    bleeding: false,
    mobility: 'normal',
    sleep_quality: 'good',
    appetite: 'normal',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await submitRecoveryUpdate(form);
      setSubmitted(true);
      setTimeout(() => navigate('/patient/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="success-screen">
          <CheckCircle size={64} color="#10b981" />
          <h2>Update Submitted!</h2>
          <p>Your daily recovery update has been recorded successfully.</p>
          <p className="subtitle">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Daily Recovery Update</h1>
            <p className="subtitle">Log your symptoms for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <MedicalDisclaimer compact />

        <div className="card form-card">
          {error && (
            <div className="alert-banner alert-banner-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Pain Score */}
            <div className="form-section">
              <h3 className="form-section-title">Pain & Discomfort</h3>
              <div className="form-group">
                <label className="form-label">Pain Level: <strong>{form.pain_score}/10</strong></label>
                <div className="slider-wrapper">
                  <span className="slider-label">None</span>
                  <input type="range" name="pain_score" min="0" max="10" value={form.pain_score} onChange={handleChange} className="form-range" />
                  <span className="slider-label">Severe</span>
                </div>
                <div className="pain-indicators">
                  {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                    <span key={n} className={`pain-dot ${n <= form.pain_score ? 'pain-dot-active' : ''}`} style={{ background: n <= 3 ? '#10b981' : n <= 6 ? '#f59e0b' : '#ef4444' }}></span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Body Temperature (°F)</label>
                <input type="number" name="body_temp" value={form.body_temp} onChange={handleChange} step="0.1" min="95" max="106" className="form-input" />
                {parseFloat(form.body_temp) > 100.4 && <p className="form-warning">⚠️ Elevated temperature. Consider contacting your doctor.</p>}
              </div>
            </div>

            {/* Wound Symptoms */}
            <div className="form-section">
              <h3 className="form-section-title">Wound Symptoms</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Swelling</label>
                  <select name="swelling" value={form.swelling} onChange={handleChange} className="form-select">
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Redness</label>
                  <select name="redness" value={form.redness} onChange={handleChange} className="form-select">
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discharge</label>
                  <select name="discharge" value={form.discharge} onChange={handleChange} className="form-select">
                    <option value="none">None</option>
                    <option value="clear">Clear</option>
                    <option value="yellow">Yellow/Cloudy</option>
                    <option value="green">Green/Foul</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="bleeding" checked={form.bleeding} onChange={handleChange} className="form-checkbox" />
                  <span>Active Bleeding Observed</span>
                </label>
              </div>
            </div>

            {/* General Health */}
            <div className="form-section">
              <h3 className="form-section-title">General Well-being</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mobility</label>
                  <select name="mobility" value={form.mobility} onChange={handleChange} className="form-select">
                    <option value="normal">Normal</option>
                    <option value="slightly_limited">Slightly Limited</option>
                    <option value="very_limited">Very Limited</option>
                    <option value="bed_ridden">Bed Ridden</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sleep Quality</label>
                  <select name="sleep_quality" value={form.sleep_quality} onChange={handleChange} className="form-select">
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="very_poor">Very Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Appetite</label>
                  <select name="appetite" value={form.appetite} onChange={handleChange} className="form-select">
                    <option value="normal">Normal</option>
                    <option value="reduced">Reduced</option>
                    <option value="poor">Poor</option>
                    <option value="no_appetite">No Appetite</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Additional Comments / Notes</label>
                <textarea name="comments" value={form.comments} onChange={handleChange} rows={4} className="form-textarea" placeholder="Describe any other symptoms, concerns, or observations..." />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><div className="btn-spinner"></div> Submitting...</> : '✅ Submit Daily Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
