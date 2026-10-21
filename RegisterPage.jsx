import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { registerUser } from './api';
import { UserPlus, ShieldAlert, Activity, ArrowLeft, CheckCircle2, Stethoscope, User, Clock, ShieldCheck } from 'lucide-react';
import MedicalDisclaimer from './MedicalDisclaimer';

export const RegisterPage = ({ defaultRole = 'patient' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialRole = () => {
    if (location.pathname.includes('/doctor/')) return 'doctor';
    if (location.pathname.includes('/patient/')) return 'patient';
    return defaultRole;
  };

  const [role, setRole] = useState(getInitialRole());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: getInitialRole(),
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    surgery_type: '',
    surgery_date: '',
    hospital: '',
    doctor_name: '',
    emergency_contact: '',
    specialization: '',
    registration_number: '',
    years_of_experience: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingSuccess, setPendingSuccess] = useState(null);

  const { login } = useAuth();

  useEffect(() => {
    const r = getInitialRole();
    setRole(r);
    setFormData(prev => ({ ...prev, role: r }));
    setError('');
  }, [location.pathname, defaultRole]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData(prev => ({ ...prev, role: newRole }));
    setError('');
    setPendingSuccess(null);
    if (newRole === 'doctor' && location.pathname !== '/doctor/signup') navigate('/doctor/signup', { replace: true });
    else if (newRole === 'patient' && location.pathname !== '/patient/signup' && location.pathname !== '/register') navigate('/patient/signup', { replace: true });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (role === 'doctor') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please verify your password.');
        return;
      }
      if (!formData.phone || !formData.specialization || !formData.hospital || !formData.registration_number || !formData.years_of_experience) {
        setError('Please fill in all required doctor professional fields (Phone, Specialization, Hospital/Clinic, Registration Number, Years of Experience).');
        return;
      }
    }

    try {
      setLoading(true);
      const res = await registerUser({ ...formData, role });

      if (role === 'doctor' || res.data?.approval_status === 'pending') {
        setPendingSuccess(
          res.data?.message ||
          "Registration submitted. Your account is waiting for administrator approval."
        );
      } else {
        const { token, user } = res.data;
        login(token, user);
        if (user.role === 'patient') navigate('/patient/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left visual section */}
      <div className="auth-left-visual">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <Activity size={26} />
          </div>
          <span className="auth-brand-name">PostOp<strong>Care</strong></span>
        </div>

        <div className="auth-hero-text">
          <h2>
            {role === 'doctor' ? 'Doctor Credential Signup' : 'Create Your Post-Operative Recovery Profile'}
          </h2>
          <p>
            {role === 'doctor'
              ? 'Join our medical network to monitor post-surgical patient recovery, review visual AI wound evaluations, and provide clinical guidance.'
              : 'Register to log daily symptom check-ins, receive visual AI wound healing evaluation, and keep your surgical team informed.'}
          </p>

          <div className="auth-feature-list">
            {role === 'doctor' ? (
              <>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
                  <span>Verified Medical Provider Credentials</span>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
                  <span>Real-time Patient Recovery Alerts</span>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
                  <span>AI-Assisted Wound Evaluation Support</span>
                </div>
              </>
            ) : (
              <>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
                  <span>Surgical Procedure Tracking</span>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
                  <span>Automated Image &amp; Symptom Logging</span>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon"><CheckCircle2 size={16} /></div>
                  <span>Direct Linkage with Attending Surgeon</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Academic Prototype Portal • Secure Healthcare Information Systems
        </div>
      </div>

      {/* Right form section */}
      <div className="auth-right-form" style={{ maxWidth: '680px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Role Toggle Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => handleRoleChange('patient')}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              background: role === 'patient' ? 'linear-gradient(135deg, #2563eb, #06b6d4)' : 'transparent',
              color: role === 'patient' ? '#ffffff' : '#94a3b8'
            }}
          >
            <User size={16} /> Patient Signup
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('doctor')}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              background: role === 'doctor' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
              color: role === 'doctor' ? '#ffffff' : '#94a3b8'
            }}
          >
            <Stethoscope size={16} /> Doctor Signup
          </button>
        </div>

        {/* Success / Pending Status Notification */}
        {pendingSuccess ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Clock size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              Registration Submitted
            </h3>
            <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Registration submitted. Your account is waiting for administrator approval.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <ShieldCheck size={16} /> Status: Pending Administrator Approval
            </div>
            <div>
              <Link to="/doctor/login" className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}>
                Go to Doctor Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                {role === 'doctor' ? 'Doctor Signup' : 'Patient Registration'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {role === 'doctor'
                  ? 'Submit your professional details for administrator approval'
                  : 'Fill in your surgery details to create your post-operative recovery profile'}
              </p>
            </div>

            <MedicalDisclaimer compact />

            {role === 'doctor' && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', color: '#60a5fa', fontWeight: 600 }}>
                  Your account requires administrator approval before you can access the Doctor Dashboard.
                </span>
              </div>
            )}

            {error && (
              <div className="alert-banner alert-banner-error mb-3">
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                
                {/* 1. PERSONAL INFORMATION */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Personal Information
                  </h4>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name *</label>
                  <input id="reg-name" type="text" name="name" className="form-control" placeholder={role === 'doctor' ? "Dr. Alex Taylor" : "John Doe"} value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Email Address *</label>
                  <input id="reg-email" type="email" name="email" className="form-control" placeholder="doctor@clinic.com" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Phone Number {role === 'doctor' ? '*' : ''}</label>
                  <input id="reg-phone" type="text" name="phone" className="form-control" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} required={role === 'doctor'} />
                </div>

                <div className="form-group" style={{ gridColumn: role === 'doctor' ? '1 / -1' : 'auto' }}>
                  <label className="form-label" htmlFor="reg-address">Address {role === 'doctor' ? '(Optional)' : ''}</label>
                  <input id="reg-address" type="text" name="address" className="form-control" placeholder="Medical Center Address, City, State" value={formData.address} onChange={handleChange} />
                </div>

                {/* 2. PROFESSIONAL INFORMATION (FOR DOCTOR) */}
                {role === 'doctor' ? (
                  <>
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                        Professional Information
                      </h4>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-spec">Medical Specialization *</label>
                      <input id="reg-spec" type="text" name="specialization" className="form-control" placeholder="e.g. Orthopedic Surgery, General Surgery" value={formData.specialization} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-hospital">Hospital / Clinic *</label>
                      <input id="reg-hospital" type="text" name="hospital" className="form-control" placeholder="e.g. City Central Memorial Hospital" value={formData.hospital} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-regnum">Doctor Registration Number *</label>
                      <input id="reg-regnum" type="text" name="registration_number" className="form-control" placeholder="e.g. MD-94820-STATE" value={formData.registration_number} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-exp">Years of Experience *</label>
                      <input id="reg-exp" type="number" min="0" max="60" name="years_of_experience" className="form-control" placeholder="e.g. 10" value={formData.years_of_experience} onChange={handleChange} required />
                    </div>
                  </>
                ) : (
                  /* SURGICAL DETAILS FOR PATIENT */
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-age">Age</label>
                      <input id="reg-age" type="number" name="age" className="form-control" placeholder="e.g. 45" value={formData.age} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-gender">Gender</label>
                      <select id="reg-gender" name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                        Surgery &amp; Hospital Information
                      </h4>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-surgery">Surgery Type</label>
                      <input id="reg-surgery" type="text" name="surgery_type" className="form-control" placeholder="e.g. Appendectomy" value={formData.surgery_type} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-date">Surgery Date</label>
                      <input id="reg-date" type="date" name="surgery_date" className="form-control" value={formData.surgery_date} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-hospital-pat">Hospital Name</label>
                      <input id="reg-hospital-pat" type="text" name="hospital" className="form-control" placeholder="Memorial Hospital" value={formData.hospital} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-doctor">Attending Doctor Name</label>
                      <input id="reg-doctor" type="text" name="doctor_name" className="form-control" placeholder="Dr. Sarah Jenkins" value={formData.doctor_name} onChange={handleChange} />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label" htmlFor="reg-emergency">Emergency Contact (Name &amp; Phone)</label>
                      <input id="reg-emergency" type="text" name="emergency_contact" className="form-control" placeholder="Mary Doe (+1 555-987-6543)" value={formData.emergency_contact} onChange={handleChange} />
                    </div>
                  </>
                )}

                {/* 3. ACCOUNT INFORMATION */}
                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Account Information
                  </h4>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password *</label>
                  <input id="reg-password" type="password" name="password" className="form-control" placeholder="Minimum 6 characters" value={formData.password} onChange={handleChange} required />
                </div>

                {role === 'doctor' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                    <input id="reg-confirm" type="password" name="confirmPassword" className="form-control" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg mt-4"
                style={{
                  background: role === 'doctor' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  border: 'none',
                  padding: '0.85rem'
                }}
                disabled={loading}
              >
                {loading ? (
                  <><div className="btn-spinner"></div> Submitting Application...</>
                ) : role === 'doctor' ? (
                  <><Stethoscope size={18} /> Submit Registration</>
                ) : (
                  <><UserPlus size={18} /> Complete Patient Registration</>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {role === 'doctor' ? (
                <>
                  Already have a doctor account?{' '}
                  <Link to="/doctor/login" style={{ fontWeight: 700, color: '#10b981' }}>Doctor Login</Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link to="/patient/login" style={{ fontWeight: 700, color: '#2563eb' }}>Sign In</Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
