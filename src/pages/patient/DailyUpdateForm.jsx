import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRecoveryUpdate } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import MedicalDisclaimer from '../../components/MedicalDisclaimer';
import { CheckCircle, AlertCircle, Thermometer, Activity, MessageSquare, Send, Pill, Flame, Eye, Droplets } from 'lucide-react';

export default function DailyUpdateForm() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    pain_level: 3,
    temperature: 98.6,
    swelling: 'none',
    redness: 'none',
    discharge: 'none',
    bleeding: false,
    mobility: 'normal',
    sleep_quality: 'good',
    medication_status: 'taken',
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
      setTimeout(() => navigate('/patient/dashboard'), 2400);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit recovery update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function for visual status color indicators
  const getStatusColor = (val) => {
    const lower = String(val).toLowerCase();
    if (lower === 'none' || lower === 'normal' || lower === 'taken' || lower === 'good' || lower === 'clear') {
      return { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' }; // Green
    }
    if (lower === 'mild' || lower === 'slightly_limited' || lower === 'fair' || lower === 'partial') {
      return { color: '#f59e0b', bg: '#fffbe6', border: '#fde68a' }; // Yellow/Amber
    }
    return { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' }; // Red
  };

  const swellingStyle = getStatusColor(form.swelling);
  const rednessStyle = getStatusColor(form.redness);
  const dischargeStyle = getStatusColor(form.discharge);

  const formattedTodayDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Glassmorphic Card Style
  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.08)',
    padding: '1.75rem',
    marginBottom: '1.5rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  // Modern Input Style
  const inputStyle = {
    background: '#F8FAFC',
    border: '1.5px solid #CBD5E1',
    borderRadius: '12px',
    color: '#0F172A',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  };

  if (submitted) return (
    <div className="app-layout" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #EEF2FF 45%, #F0FDFA 100%)', minHeight: '100vh' }}>
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopHeader onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <div style={{ maxWidth: '650px', margin: '3rem auto' }}>
          {/* Green Success Notification Banner */}
          <div style={{ ...glassCardStyle, textAlign: 'center', padding: '3.5rem 2rem', borderTop: '6px solid #10b981' }}>
            <div 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: '#ecfdf5', 
                color: '#10b981', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem auto',
                border: '2px solid #a7f3d0'
              }}
            >
              <CheckCircle size={48} />
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
              Recovery update submitted successfully.
            </h2>
            <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Your daily symptom log has been securely recorded and synced to your attending clinical team.
            </p>

            <div className="alert-banner alert-banner-success" style={{ justifyContent: 'center', padding: '1rem', fontWeight: 700, borderRadius: '12px' }}>
              Redirecting to your patient dashboard...
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-layout" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #EEF2FF 45%, #F0FDFA 100%)', minHeight: '100vh' }}>
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content" style={{ background: 'transparent' }}>
        <TopHeader 
          title="Daily Recovery Update" 
          subtitle="Log your recovery metrics"
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Page Header */}
          <div className="page-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Today's Recovery Check-in</h1>
              <p className="subtitle" style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.25rem', fontWeight: 600 }}>
                {formattedTodayDate}
              </p>
            </div>
          </div>

          {/* Academic Prototype Notice styled as soft amber banner */}
          <div style={{ background: '#FFFBE6', border: '1px solid #FDE68A', borderRadius: '14px', padding: '0.85rem 1.25rem', color: '#B45309', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', fontWeight: 600 }}>
            <MedicalDisclaimer compact />
          </div>

          {error && (
            <div className="alert-banner alert-banner-error mb-4" style={{ borderRadius: '14px' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* SECTION 1 — PAIN & TEMPERATURE */}
            <div style={{ ...glassCardStyle, borderTop: '4px solid #2563EB' }}>
              <div style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#2563EB', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Thermometer size={22} color="#2563EB" /> SECTION 1 — PAIN &amp; TEMPERATURE
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
                {/* Pain Level Box */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                      Pain Level
                    </label>
                    <div 
                      style={{ 
                        background: form.pain_level <= 3 ? '#ecfdf5' : form.pain_level <= 6 ? '#fffbe6' : '#fef2f2',
                        color: form.pain_level <= 3 ? '#047857' : form.pain_level <= 6 ? '#b45309' : '#b91c1c',
                        border: `1px solid ${form.pain_level <= 3 ? '#a7f3d0' : form.pain_level <= 6 ? '#fde68a' : '#fca5a5'}`,
                        padding: '0.35rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        lineHeight: 1
                      }}
                    >
                      {form.pain_level} / 10
                    </div>
                  </div>

                  {/* Blue Gradient Slider */}
                  <div className="slider-wrapper mt-2 mb-3">
                    <span className="slider-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>No Pain (0)</span>
                    <input
                      type="range"
                      name="pain_level"
                      min="0"
                      max="10"
                      value={form.pain_level}
                      onChange={handleChange}
                      className="form-range"
                      style={{
                        accentColor: '#2563EB',
                        height: '10px',
                        borderRadius: '99px',
                        background: 'linear-gradient(90deg, #2563EB, #06B6D4)'
                      }}
                    />
                    <span className="slider-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>Severe Pain (10)</span>
                  </div>

                  {/* Progress Indicators (Green = #10B981, Yellow = #F59E0B, Red = #EF4444) */}
                  <div className="pain-indicators" style={{ display: 'flex', gap: '6px' }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <div
                        key={n}
                        style={{
                          flex: 1,
                          height: '10px',
                          borderRadius: '99px',
                          background: n <= form.pain_level
                            ? (n <= 3 ? '#10B981' : n <= 6 ? '#F59E0B' : '#EF4444')
                            : '#E2E8F0',
                          transition: 'all 0.2s ease',
                          boxShadow: n <= form.pain_level ? '0 2px 4px rgba(16,185,129,0.3)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Body Temperature Input with Blue Thermometer Icon */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', display: 'block' }}>
                    Body Temperature (°F)
                  </label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <span className="input-icon" style={{ left: '14px', color: '#2563EB' }}>
                      <Thermometer size={20} />
                    </span>
                    <input
                      type="number"
                      name="temperature"
                      value={form.temperature}
                      onChange={handleChange}
                      step="0.1"
                      min="95"
                      max="106"
                      className="form-input"
                      style={{ ...inputStyle, paddingLeft: '2.75rem', fontSize: '1.05rem', height: '48px' }}
                      placeholder="98.6"
                    />
                  </div>

                  {parseFloat(form.temperature) > 100.4 ? (
                    <div className="alert-banner alert-banner-error mt-2 mb-0" style={{ padding: '0.65rem 0.9rem', fontSize: '0.84rem', borderRadius: '10px' }}>
                      <AlertCircle size={16} />
                      <span>Elevated temperature (&gt; 100.4°F) detected. Please notify your surgeon if fever persists.</span>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem' }}>
                      Normal resting range: 97.8°F – 99.1°F
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2 — SYMPTOMS & INCISION STATUS */}
            <div style={{ ...glassCardStyle, borderTop: '4px solid #06B6D4' }}>
              <div style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#06B6D4', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Activity size={22} color="#06B6D4" /> SECTION 2 — SYMPTOMS &amp; INCISION STATUS
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {/* Swelling Dropdown */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Flame size={16} color={swellingStyle.color} /> Swelling
                  </label>
                  <select 
                    name="swelling" 
                    value={form.swelling} 
                    onChange={handleChange} 
                    className="form-select"
                    style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      borderColor: swellingStyle.border,
                      backgroundColor: swellingStyle.bg,
                      color: swellingStyle.color
                    }}
                  >
                    <option value="none">None / Normal (Green)</option>
                    <option value="mild">Mild (Yellow/Amber)</option>
                    <option value="moderate">Moderate (Red)</option>
                    <option value="severe">Severe (Red)</option>
                  </select>
                </div>

                {/* Redness Dropdown */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Eye size={16} color={rednessStyle.color} /> Redness
                  </label>
                  <select 
                    name="redness" 
                    value={form.redness} 
                    onChange={handleChange} 
                    className="form-select"
                    style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      borderColor: rednessStyle.border,
                      backgroundColor: rednessStyle.bg,
                      color: rednessStyle.color
                    }}
                  >
                    <option value="none">None / Normal (Green)</option>
                    <option value="mild">Mild (Yellow/Amber)</option>
                    <option value="moderate">Moderate (Red)</option>
                    <option value="severe">Severe (Red)</option>
                  </select>
                </div>

                {/* Wound Discharge Dropdown */}
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Droplets size={16} color={dischargeStyle.color} /> Wound Discharge
                  </label>
                  <select 
                    name="discharge" 
                    value={form.discharge} 
                    onChange={handleChange} 
                    className="form-select"
                    style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      borderColor: dischargeStyle.border,
                      backgroundColor: dischargeStyle.bg,
                      color: dischargeStyle.color
                    }}
                  >
                    <option value="none">None (Green)</option>
                    <option value="clear">Clear Fluid (Green)</option>
                    <option value="yellow">Yellow / Cloudy (Amber)</option>
                    <option value="green">Green / Discolored (Red)</option>
                  </select>
                </div>
              </div>

              {/* Active Bleeding Toggle */}
              <div className="form-group mt-3" style={{ margin: 0 }}>
                <label 
                  style={{ 
                    padding: '0.85rem 1.1rem', 
                    background: form.bleeding ? '#FEF2F2' : '#F8FAFC', 
                    border: `1.5px solid ${form.bleeding ? '#FCA5A5' : '#CBD5E1'}`, 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.85rem', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    name="bleeding"
                    checked={form.bleeding}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', accentColor: '#EF4444' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: form.bleeding ? '#B91C1C' : '#0F172A' }}>
                    Active Bleeding Observed at Incision Site
                  </span>
                </label>
              </div>
            </div>

            {/* SECTION 4 — MEDICATION / DAILY STATUS */}
            <div style={{ ...glassCardStyle, borderTop: '4px solid #7C3AED' }}>
              <div style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#7C3AED', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Pill size={22} color="#7C3AED" /> SECTION 4 — MEDICATION / DAILY STATUS
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Medication Status</label>
                  <select name="medication_status" value={form.medication_status} onChange={handleChange} className="form-select" style={{ ...inputStyle, borderRadius: '12px' }}>
                    <option value="taken">Prescribed Medication Taken</option>
                    <option value="skipped">Medication Skipped</option>
                    <option value="partial">Partial Dosage</option>
                    <option value="side_effects">Experiencing Side Effects</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Physical Mobility</label>
                  <select name="mobility" value={form.mobility} onChange={handleChange} className="form-select" style={{ ...inputStyle, borderRadius: '12px' }}>
                    <option value="normal">Normal / Walking Well</option>
                    <option value="slightly_limited">Slightly Limited</option>
                    <option value="very_limited">Very Limited / Assisted</option>
                    <option value="bed_ridden">Bed Ridden</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>Sleep Quality</label>
                  <select name="sleep_quality" value={form.sleep_quality} onChange={handleChange} className="form-select" style={{ ...inputStyle, borderRadius: '12px' }}>
                    <option value="good">Restful / Good</option>
                    <option value="fair">Fair / Interrupted</option>
                    <option value="poor">Poor / Disrupted</option>
                    <option value="very_poor">Severe Insomnia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3 — RECOVERY NOTES */}
            <div style={{ ...glassCardStyle, borderTop: '4px solid #10B981' }}>
              <div style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#10B981', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <MessageSquare size={22} color="#10B981" /> SECTION 3 — RECOVERY NOTES
                </h2>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                  Patient Observations &amp; Daily Comments
                </label>
                <textarea
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  rows={4}
                  className="form-textarea"
                  style={{ ...inputStyle, borderRadius: '12px', padding: '1rem', fontSize: '0.95rem' }}
                  placeholder="Share any new symptoms, medication side effects, pain triggers, or notes for your surgical care team..."
                />
              </div>
            </div>

            {/* BOTTOM ACTION */}
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-lg btn-full" 
                disabled={loading}
                style={{ 
                  background: 'linear-gradient(135deg, #2563EB, #06B6D4)', 
                  border: 'none', 
                  borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
                  padding: '1.1rem',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '0.01em',
                  color: '#ffffff'
                }}
              >
                {loading ? (
                  <><div className="btn-spinner" style={{ width: '22px', height: '22px' }}></div> Submitting Recovery Update...</>
                ) : (
                  <><Send size={22} /> Submit Recovery Update</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
