import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import { LogIn, Key, Mail, ShieldAlert, Activity, ArrowLeft, Stethoscope, User, Shield, Eye, EyeOff, Clock } from 'lucide-react';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export const LoginPage = ({ defaultRole = 'patient' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Detect role from prop or route path
  const getInitialRole = () => {
    if (location.pathname.includes('/doctor/')) return 'doctor';
    if (location.pathname.includes('/admin/')) return 'admin';
    if (location.pathname.includes('/patient/')) return 'patient';
    return defaultRole;
  };

  const [role, setRole] = useState(getInitialRole());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRole(getInitialRole());
    setError('');
  }, [location.pathname, defaultRole]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    // Optionally update route cleanly
    if (newRole === 'doctor' && location.pathname !== '/doctor/login') navigate('/doctor/login', { replace: true });
    else if (newRole === 'admin' && location.pathname !== '/admin/login') navigate('/admin/login', { replace: true });
    else if (newRole === 'patient' && location.pathname !== '/patient/login' && location.pathname !== '/login') navigate('/patient/login', { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      const { token, user } = res.data;
      login(token, user);

      // Role-based navigation
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoRole) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword('password123');
    try {
      setLoading(true);
      const res = await loginUser({ email: demoEmail, password: 'password123' });
      const { token, user } = res.data;
      login(token, user);

      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed. Make sure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleHeaderTitle = () => {
    if (role === 'doctor') return 'Doctor Login';
    if (role === 'admin') return 'Administrator Login';
    return 'Patient Login';
  };

  const getRoleHeaderSubtitle = () => {
    if (role === 'doctor') return 'Access clinical recovery portal & patient evaluations';
    if (role === 'admin') return 'Access system administration & user approval dashboard';
    return 'Enter your credentials to access your post-operative recovery dashboard';
  };

  return (
    <div className="login-fullscreen-wrapper">
      {/* Top Brand */}
      <div className="login-fullscreen-brand">
        <div className="login-brand-icon-box">
          <Activity size={22} color="#ffffff" />
        </div>
        <span className="login-brand-text">
          <span style={{ color: '#ffffff', fontWeight: 800 }}>PostOp</span>
          <span style={{ color: '#06b6d4', fontWeight: 800 }}>Care</span>
        </span>
      </div>

      {/* Centered Login Box */}
      <div className="login-fullscreen-center">
        <div className="login-centered-card" style={{ maxWidth: '440px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '99px', background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
              Portal Login
            </span>
          </div>

          {/* Role Selection Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => handleRoleChange('patient')}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                background: role === 'patient' ? '#ffffff' : 'transparent',
                color: role === 'patient' ? '#2563eb' : '#64748b',
                boxShadow: role === 'patient' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <User size={14} /> Patient
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('doctor')}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                background: role === 'doctor' ? '#ffffff' : 'transparent',
                color: role === 'doctor' ? '#059669' : '#64748b',
                boxShadow: role === 'doctor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Stethoscope size={14} /> Doctor
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                background: role === 'admin' ? '#ffffff' : 'transparent',
                color: role === 'admin' ? '#6366f1' : '#64748b',
                boxShadow: role === 'admin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Shield size={14} /> Admin
            </button>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {getRoleHeaderTitle()}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: '0.25rem', margin: 0 }}>
              {getRoleHeaderSubtitle()}
            </p>
          </div>

          <MedicalDisclaimer compact />

          {error && (
            <div 
              className={`alert-banner ${error.toLowerCase().includes('pending') ? 'alert-banner-warning' : 'alert-banner-error'} mb-3`} 
              style={{
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                background: error.toLowerCase().includes('pending') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                borderColor: error.toLowerCase().includes('pending') ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.3)',
                color: error.toLowerCase().includes('pending') ? '#b45309' : '#b91c1c',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              {error.toLowerCase().includes('pending') ? (
                <Clock size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
              ) : (
                <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '2px' }}>
                  {error.toLowerCase().includes('pending') ? 'Pending Administrator Approval' : 'Access Denied'}
                </div>
                <div style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <label className="form-label" htmlFor="login-email" style={{ color: '#1e293b', fontSize: '0.85rem', fontWeight: 700 }}>
                Email Address
              </label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon" style={{ color: role === 'doctor' ? '#059669' : role === 'admin' ? '#6366f1' : '#2563eb', left: '12px' }}>
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="form-control light-input"
                  placeholder={role === 'doctor' ? "doctor@clinic.com" : role === 'admin' ? "admin@demo.com" : "patient@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label" htmlFor="login-password" style={{ color: '#1e293b', fontSize: '0.85rem', fontWeight: 700 }}>
                Password
              </label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon" style={{ color: role === 'doctor' ? '#059669' : role === 'admin' ? '#6366f1' : '#2563eb', left: '12px' }}>
                  <Key size={18} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control light-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{
                background: role === 'doctor' 
                  ? 'linear-gradient(135deg, #059669, #10b981)' 
                  : role === 'admin' 
                  ? 'linear-gradient(135deg, #4f46e5, #6366f1)' 
                  : 'linear-gradient(135deg, #2563eb, #06b6d4)',
                border: 'none',
                borderRadius: '12px',
                height: '46px',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#ffffff',
                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.25)'
              }}
            >
              {loading ? (
                <><div className="btn-spinner" style={{ width: '18px', height: '18px' }}></div> Authenticating...</>
              ) : (
                <><LogIn size={18} /> Sign In as {role === 'doctor' ? 'Doctor' : role === 'admin' ? 'Admin' : 'Patient'}</>
              )}
            </button>
          </form>

          {/* Quick Demo Login Shortcuts */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginBottom: '0.65rem' }}>
              Quick Demo Logins
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => handleDemoLogin('patient@demo.com', 'patient')} 
                className="light-demo-btn"
              >
                <User size={13} style={{ marginRight: '4px' }} /> Patient
              </button>
              <button 
                type="button" 
                onClick={() => handleDemoLogin('doctor@demo.com', 'doctor')} 
                className="light-demo-btn"
              >
                <Stethoscope size={13} style={{ marginRight: '4px' }} /> Doctor
              </button>
              <button 
                type="button" 
                onClick={() => handleDemoLogin('admin@demo.com', 'admin')} 
                className="light-demo-btn"
              >
                <Shield size={13} style={{ marginRight: '4px' }} /> Admin
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.86rem', color: '#64748b' }}>
            {role === 'doctor' ? (
              <>
                Don't have a doctor account?{' '}
                <Link to="/doctor/signup" style={{ fontWeight: 700, color: '#059669', textDecoration: 'none' }}>
                  Create Doctor Account
                </Link>
              </>
            ) : role === 'admin' ? (
              <>
                Admin account access is restricted.{' '}
                <Link to="/login" style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                  Return to Portal Sign In
                </Link>
              </>
            ) : (
              <>
                Don't have a patient account?{' '}
                <Link to="/patient/signup" style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                  Register as Patient
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
