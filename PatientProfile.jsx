import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientDetails, updatePatientDetails } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { User, Save, CheckCircle } from 'lucide-react';

export default function PatientProfile() {
  const { user, patientId, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', emergency_contact: '', emergency_phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPatientDetails(patientId);
        const p = res.data.patient;
        setForm({
          name: p.name || user?.name || '',
          email: p.email || user?.email || '',
          phone: p.phone || '',
          emergency_contact: p.emergency_contact || '',
          emergency_phone: p.emergency_phone || ''
        });
      } catch (e) {
        console.error(e);
        // Fallback to user auth state
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
      <Sidebar role="patient" />
      <div className="main-content">
        <div className="page-header">
          <div><h1>My Profile</h1><p className="subtitle">Manage your account and contact details</p></div>
        </div>

        <div className="profile-layout">
          <div className="profile-avatar-card card">
            <div className="avatar-circle">
              <User size={48} color="#6366f1" />
            </div>
            <h3>{displayName}</h3>
            <span className="role-pill role-patient">Patient</span>
            <p className="profile-email">{displayEmail}</p>
          </div>

          <div className="card profile-form-card">
            <h2 className="card-title">Personal Information</h2>
            {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
              <form onSubmit={handleSave}>
                {error && <div className="alert-banner alert-banner-error">{error}</div>}
                {saved && <div className="alert-banner alert-banner-success"><CheckCircle size={16}/> Profile saved!</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact Name</label>
                    <input className="form-input" value={form.emergency_contact} onChange={e => setForm(p => ({ ...p, emergency_contact: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input className="form-input" value={form.emergency_phone} onChange={e => setForm(p => ({ ...p, emergency_phone: e.target.value }))} />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><div className="btn-spinner"></div> Saving...</> : <><Save size={16}/> Save Changes</>}
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
