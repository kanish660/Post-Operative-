import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientDetails, updatePatientDetails } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';
import { User, Save, CheckCircle, Phone, Mail, Calendar, ShieldCheck, Hash } from 'lucide-react';

export default function PatientProfile() {
  const { user, patientId, refreshUser } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', emergency_contact: '', emergency_phone: '' });
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPatientDetails(patientId);
        const p = res.data.patient;
        setPatientData(p);
        setForm({
          name: p.name || user?.name || '',
          email: p.email || user?.email || '',
          phone: p.phone || '',
          emergency_contact: p.emergency_contact || '',
          emergency_phone: p.emergency_phone || ''
        });
      } catch (e) {
        console.error(e);
        if (user) {
          setForm(prev => ({
            ...prev,
            name: prev.name || user.name || '',
            email: prev.email || user.email || ''
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    if (patientId) {
      fetch();
    } else {
      setLoading(false);
    }
  }, [patientId, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updatePatientDetails(patientId, form);
      if (refreshUser) {
        await refreshUser();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = form.name.trim() || user?.name || 'Patient';
  const displayEmail = form.email.trim() || user?.email || 'patient@demo.com';

  return (
    <div className="app-layout">
      <Sidebar role="patient" isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="main-content">
        <TopHeader 
          title="Profile & Preferences" 
          subtitle="Manage your patient record and emergency contacts"
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Avatar Profile Card */}
          <div className="card text-center" style={{ padding: '2.5rem 1.5rem' }}>
            <div 
              style={{ 
                width: '90px', 
                height: '90px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)', 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.25rem auto',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 6px 16px rgba(37,99,235,0.25)'
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-dark)' }}>{displayName}</h3>
            <div style={{ margin: '0.4rem 0 1rem 0' }}>
              <span className="badge badge-info">Patient Account</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{displayEmail}</p>

            <div className="info-grid" style={{ textAlign: 'left', gridTemplateColumns: '1fr' }}>
              <div className="info-item">
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Hash size={12} /> Patient ID
                </span>
                <span className="info-value">{patientId || 'PT-1002'}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={12} /> Registered Date
                </span>
                <span className="info-value">
                  {patientData?.created_at ? new Date(patientData.created_at).toLocaleDateString() : 'Active Record'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={12} /> Surgery Type
                </span>
                <span className="info-value">{patientData?.surgery_type || 'Post-Op Recovery'}</span>
              </div>
            </div>
          </div>

          {/* Profile Form Card */}
          <div className="card">
            <h2 className="card-title">Personal Information & Emergency Contact</h2>
            {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
              <form onSubmit={handleSave}>
                {error && <div className="alert-banner alert-banner-error mb-3">{error}</div>}
                {saved && <div className="alert-banner alert-banner-success mb-3"><CheckCircle size={16}/> Profile saved successfully!</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input className="form-input" value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} placeholder="Contact Full Name" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input className="form-input" value={form.emergency_phone} onChange={e => setForm(p => ({ ...p, emergency_phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                </div>

                <div className="form-actions mt-4">
                  <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={saving} style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)', border: 'none' }}>
                    {saving ? <><div className="btn-spinner"></div> Saving...</> : <><Save size={18}/> Save Profile Changes</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
